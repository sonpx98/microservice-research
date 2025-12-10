import { JWTLevelExplanation, JWTLevel } from './types';

export const jwtLevelExplanations: Record<number, JWTLevelExplanation> = {
  1: {
    attackName: 'None Algorithm Attack',
    howItWorks: 'JWT tokens can specify their signing algorithm in the header. By changing "alg" to "none", the attacker removes signature verification entirely. The server accepts unsigned tokens.',
    whyItSucceeds: 'Poor implementation: server doesn\'t enforce algorithm validation. It trusts the "alg" field from the token itself instead of enforcing a specific algorithm.',
    realWorldImpact: 'Complete authentication bypass. Attackers can forge any identity, escalate to admin, or impersonate any user without knowing the secret key.',
    preventionTips: [
      'Never allow "alg: none" in production',
      'Enforce algorithm whitelist on the server',
      'Use libraries that reject "none" by default',
      'Always validate algorithm before verifying signature'
    ],
  },
  2: {
    attackName: 'Algorithm Confusion Attack',
    howItWorks: 'Server uses RS256 (asymmetric) but the attacker tricks it into treating the public key as an HMAC secret. By changing "alg" to "HS256", the server uses its own public key to verify the signature that the attacker created with the same public key.',
    whyItSucceeds: 'Developer didn\'t enforce algorithm validation. Server accepts whatever algorithm the token specifies, and HMAC uses shared secrets (public key becomes the secret).',
    realWorldImpact: 'Complete authentication bypass on RS256-protected APIs. Public keys are, well, public - attackers can sign their own tokens using the public key as HMAC secret.',
    preventionTips: [
      'Enforce specific algorithms (never let token decide)',
      'Use RS256 for tokens, not HS256',
      'Validate algorithm before decoding signature',
      'Never use public key for HMAC verification'
    ],
  },
  3: {
    attackName: 'Weak Secret/Brute Force Attack',
    howItWorks: 'The server uses a weak secret for HMAC signing (like "password123"). Attacker uses common wordlists and brute force to discover the secret, then signs their own forged tokens.',
    whyItSucceeds: 'Developers use memorable/weak secrets instead of cryptographic-grade random keys. Modern computers can check millions of possibilities per second.',
    realWorldImpact: 'Complete authentication bypass. Once secret is cracked, attacker can forge unlimited tokens for any user/role.',
    preventionTips: [
      'Use cryptographically random secrets (min 32 bytes)',
      'Never use memorable passwords as JWT secrets',
      'Consider RS256 (public key can be public, only server has private key)',
      'Rotate secrets regularly'
    ],
  },
  4: {
    attackName: 'Token Expiry Bypass',
    howItWorks: 'Attacker modifies the "exp" (expiration) claim to a far future date. If the server validates "exp" incorrectly or skips expiry checks, the token becomes valid indefinitely.',
    whyItSucceeds: 'Developers fail to validate expiry time, or compare timestamps incorrectly (using milliseconds vs seconds).',
    realWorldImpact: 'Compromised token becomes a permanent backdoor. Even if original session expires, stolen token works forever.',
    preventionTips: [
      'Always validate expiry: current_time < exp',
      'Use short expiration times (15-30 minutes)',
      'Implement token rotation/refresh tokens',
      'Be consistent with time units (seconds, not milliseconds)'
    ],
  },
  5: {
    attackName: 'Privilege Escalation',
    howItWorks: 'User modifies JWT payload claims directly (adding "admin": true, changing "role" to "superuser"). Server trusts the payload without re-validating permissions against database.',
    whyItSucceeds: 'Developers assume JWT signature = trust all payload data. They don\'t re-verify roles/permissions with the database on each request.',
    realWorldImpact: 'Regular user becomes admin instantly. Can delete data, access sensitive info, modify system settings.',
    preventionTips: [
      'Never trust payload claims alone',
      'Validate permissions against database on each request',
      'Use JWTs for authentication (identity), not authorization (permissions)',
      'Keep sensitive roles/permissions server-side, verified per request'
    ],
  },
  6: {
    attackName: 'JKU/KID Header Injection',
    howItWorks: 'JWT headers can include "jku" (JWK Set URL) or "kid" (Key ID) to specify where to fetch the verification key. Attackers point these to their own server hosting a malicious key.',
    whyItSucceeds: 'Server blindly trusts the key URL or ID from the token and fetches/uses the attacker\'s key to verify the signature.',
    realWorldImpact: 'Complete authentication bypass. Attackers host their own keys and the server uses them for verification.',
    preventionTips: [
      'Never fetch keys from URLs specified in tokens',
      'Whitelist allowed key URLs',
      'Hardcode or securely store verification keys',
      'Reject tokens with jku/kid if not needed'
    ],
  },
  7: {
    attackName: 'Cross-Service Token Replay',
    howItWorks: 'Token issued for Service A is replayed to Service B. If both services share the same secret but don\'t validate audience ("aud") claim, the token works across services.',
    whyItSucceeds: 'Services share secrets but don\'t validate aud (audience) or iss (issuer) claims. They trust any validly-signed token.',
    realWorldImpact: 'Lateral movement: compromise one service to access all related services. A token for "api.example.com" works on "admin.example.com".',
    preventionTips: [
      'Always validate aud and iss claims',
      'Use different secrets per service',
      'Implement token binding to specific contexts',
      'Check token is intended for your service'
    ],
  },
  8: {
    attackName: 'SQL Injection via JWT Claims',
    howItWorks: 'Server extracts claims from JWT (like user_id, username) and directly uses them in SQL queries without validation. Attackers inject SQL through JWT claims.',
    whyItSucceeds: 'Developers assume JWT data is trusted because it\'s signed. They skip input validation when extracting claims.',
    realWorldImpact: 'Secondary vulnerability: JWT signature is valid, but payload contains SQL injection, XSS, or command injection attacks.',
    preventionTips: [
      'Always sanitize and validate JWT claim values',
      'Use parameterized queries even for JWT data',
      'Never trust input, even from signed tokens',
      'Implement strict type validation for claims'
    ],
  },
  9: {
    attackName: 'Token Substitution Attack',
    howItWorks: 'Application stores JWT in localStorage. Attacker uses XSS to steal the token, then uses it from their own machine. Server doesn\'t validate token binding (like IP, fingerprint).',
    whyItSucceeds: 'No token binding mechanism. Server accepts valid tokens from any source without checking context (IP, user-agent, device fingerprint).',
    realWorldImpact: 'Stolen tokens work from anywhere. XSS or physical access to device gives permanent account access.',
    preventionTips: [
      'Store tokens in httpOnly cookies (not localStorage)',
      'Implement device fingerprinting',
      'Bind tokens to IP ranges or user-agents',
      'Use refresh token rotation'
    ],
  },
  10: {
    attackName: 'Kid Path Traversal',
    howItWorks: 'The "kid" (Key ID) header parameter is used to select which key to use for verification. If the server reads keys from filesystem using kid value, attackers use path traversal (../../etc/passwd) to trick the server into using predictable files as keys.',
    whyItSucceeds: 'Server constructs file path from unsanitized kid value: `/keys/${kid}.pem`. Attackers use "../" to escape the directory.',
    realWorldImpact: 'Critical vulnerability: attackers can force server to use any file on the system as the verification key, including known files.',
    preventionTips: [
      'Never construct file paths from JWT headers',
      'Use database lookups with whitelisted kid values',
      'Sanitize and validate all header parameters',
      'Use UUID-based kid values, validate format'
    ],
  },
};

export const jwtSolutions: Record<number, string> = {
  1: `{
  "header": {
    "alg": "none",
    "typ": "JWT"
  },
  "payload": {
    "user": "admin",
    "role": "administrator"
  },
  "signature": ""
}`,

  2: `{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user": "admin",
    "role": "administrator"
  },
  "signature": "signed_with_public_key_as_hmac_secret"
}`,

  3: `{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user": "admin",
    "role": "administrator"
  },
  "signature": "cracked_weak_secret_123"
}`,

  4: `{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user": "hacker",
    "exp": 9999999999,
    "iat": 1609459200
  }
}`,

  5: `{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user": "normal_user",
    "admin": true,
    "role": "superuser",
    "permissions": ["read", "write", "delete", "admin"]
  }
}`,

  6: `{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "jku": "https://attacker.com/malicious-keys.json",
    "kid": "attacker-key"
  },
  "payload": {
    "user": "admin",
    "role": "administrator"
  }
}`,

  7: `{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user": "admin",
    "aud": "https://admin.example.com",
    "iss": "https://api.example.com",
    "service": "all"
  }
}`,

  8: `{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user": "admin' OR '1'='1",
    "user_id": "1 UNION SELECT * FROM users--",
    "role": "user"
  }
}`,

  9: `{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user": "victim_user",
    "session": "stolen_via_xss",
    "device": "attacker_machine"
  }
}`,

  10: `{
  "header": {
    "alg": "HS256",
    "typ": "JWT",
    "kid": "../../../etc/passwd"
  },
  "payload": {
    "user": "admin",
    "role": "administrator"
  }
}`,
};

export const levels: JWTLevel[] = [
  {
    id: 1,
    title: 'Level 1: None Algorithm',
    description: 'Remove signature verification by setting algorithm to "none"',
    hint: 'Change the "alg" field in header to "none" and remove the signature',
    scenario: 'Bypass authentication with unsigned token',
    targetClaim: 'alg',
    expectedValue: 'none',
  },
  {
    id: 2,
    title: 'Level 2: Algorithm Confusion',
    description: 'Switch from RS256 to HS256 using the public key',
    hint: 'Change algorithm from RS256 to HS256 and sign with the public key',
    scenario: 'Exploit algorithm confusion vulnerability',
    targetClaim: 'alg',
    expectedValue: 'HS256',
  },
  {
    id: 3,
    title: 'Level 3: Weak Secret',
    description: 'Crack a weak JWT secret and forge a new token',
    hint: 'The secret is weak (like "secret" or "password"). Crack it and sign your token',
    scenario: 'Brute force weak secret and create admin token',
    targetClaim: 'role',
    expectedValue: 'administrator',
  },
  {
    id: 4,
    title: 'Level 4: Token Expiry',
    description: 'Modify token expiration to never expire',
    hint: 'Change the "exp" claim to a far future timestamp (like 9999999999)',
    scenario: 'Create token that never expires',
    targetClaim: 'exp',
    expectedValue: '9999999999',
  },
  {
    id: 5,
    title: 'Level 5: Claim Injection',
    description: 'Add admin privileges by injecting claims',
    hint: 'Add "admin": true or "role": "superuser" to the payload',
    scenario: 'Escalate privileges via claim injection',
    targetClaim: 'admin',
    expectedValue: 'true',
  },
  {
    id: 6,
    title: 'Level 6: JKU Header Injection',
    description: 'Point key URL to attacker-controlled server',
    hint: 'Add "jku" header pointing to your malicious key server',
    scenario: 'Exploit jku header to use attacker\'s verification key',
    targetClaim: 'jku',
    expectedValue: 'attacker.com',
  },
  {
    id: 7,
    title: 'Level 7: Cross-Service Replay',
    description: 'Use token from one service on another service',
    hint: 'Token for api.example.com should work on admin.example.com due to missing aud validation',
    scenario: 'Replay token across different services',
    targetClaim: 'aud',
    expectedValue: 'admin.example.com',
  },
  {
    id: 8,
    title: 'Level 8: SQL Injection in Claims',
    description: 'Inject SQL payload through JWT claims',
    hint: 'Put SQL injection in the "user" or "user_id" claim',
    scenario: 'Exploit SQL injection via JWT payload',
    targetClaim: 'user',
    expectedValue: "' OR '1'='1",
  },
  {
    id: 9,
    title: 'Level 9: Token Substitution',
    description: 'Steal and replay token from different device/IP',
    hint: 'Token stolen via XSS works from attacker\'s machine (no device binding)',
    scenario: 'Replay stolen token without device validation',
    targetClaim: 'session',
    expectedValue: 'stolen',
  },
  {
    id: 10,
    title: 'Level 10: Kid Path Traversal',
    description: 'Use path traversal in kid header to use arbitrary files as keys',
    hint: 'Set kid to "../../../etc/passwd" to force server to use predictable file',
    scenario: 'Exploit kid header with path traversal',
    targetClaim: 'kid',
    expectedValue: '../',
  },
];
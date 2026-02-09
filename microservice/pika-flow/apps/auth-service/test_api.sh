#!/bin/bash

# Base URL - Update port if needed
URL="http://localhost:3007"
EMAIL="sonpx130998@gmail.com"  # Use your Resend registered email for testing

echo "=========================================="
echo "Auth Service - Token Refresh System Test"
echo "=========================================="

echo -e "\n1. Requesting OTP for $EMAIL..."
curl -s -X POST "$URL/auth/otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\"}" | jq .

echo -e "\n2. Check your email for OTP, then run:"
echo "----------------------------------------------"
cat << 'EOF'
# Verify OTP (replace 123456 with actual OTP)
export TOKENS=$(curl -s -X POST "http://localhost:3007/auth/verify" \
  -H "Content-Type: application/json" \
  -d '{"email":"sonpx130998@gmail.com","otp":"123456"}')
echo $TOKENS | jq .

# Extract tokens
export ACCESS_TOKEN=$(echo $TOKENS | jq -r '.access_token')
export REFRESH_TOKEN=$(echo $TOKENS | jq -r '.refresh_token')

# 3. Refresh tokens
curl -s -X POST "http://localhost:3007/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH_TOKEN\"}" | jq .

# 4. Logout
curl -s -X POST "http://localhost:3007/auth/logout" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH_TOKEN\"}" | jq .

# 5. Try refresh again (should fail - token blacklisted)
curl -s -X POST "http://localhost:3007/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH_TOKEN\"}" | jq .
EOF

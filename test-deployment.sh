#!/bin/bash

# Systematic Test Script for weilesgeht.de
# This script will test the deployment and identify issues

set -e

echo "🧪 Starting systematic test of weilesgeht.de deployment..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health Endpoint
echo -e "\n${BLUE}Test 1: Health Endpoint${NC}"
echo "Checking /api/health..."
HEALTH_RESPONSE=$(curl -s https://weilesgeht.de/api/health)
echo "Response: $HEALTH_RESPONSE"

# Parse health response
NEXTAUTH_URL=$(echo $HEALTH_RESPONSE | jq -r '.env.NEXTAUTH_URL // "null"')
DB_OK=$(echo $HEALTH_RESPONSE | jq -r '.db.ok // false')

echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo "DB OK: $DB_OK"

if [ "$NEXTAUTH_URL" = "null" ]; then
    echo -e "${RED}❌ FAIL: NEXTAUTH_URL is null${NC}"
    ISSUE_FOUND=true
else
    echo -e "${GREEN}✅ PASS: NEXTAUTH_URL is set${NC}"
fi

if [ "$DB_OK" = "true" ]; then
    echo -e "${GREEN}✅ PASS: Database connection OK${NC}"
else
    echo -e "${RED}❌ FAIL: Database connection failed${NC}"
    ISSUE_FOUND=true
fi

# Test 2: Login Page Accessibility
echo -e "\n${BLUE}Test 2: Login Page Accessibility${NC}"
echo "Checking if login page loads..."
LOGIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://weilesgeht.de/login)

if [ "$LOGIN_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ PASS: Login page loads (HTTP 200)${NC}"
else
    echo -e "${RED}❌ FAIL: Login page returns HTTP $LOGIN_RESPONSE${NC}"
    ISSUE_FOUND=true
fi

# Test 3: NextAuth API Endpoints
echo -e "\n${BLUE}Test 3: NextAuth API Endpoints${NC}"
echo "Checking /api/auth/providers..."
PROVIDERS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://weilesgeht.de/api/auth/providers)

if [ "$PROVIDERS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ PASS: NextAuth providers endpoint accessible${NC}"
else
    echo -e "${RED}❌ FAIL: NextAuth providers endpoint returns HTTP $PROVIDERS_RESPONSE${NC}"
    ISSUE_FOUND=true
fi

# Test 4: Simulate Login Attempt
echo -e "\n${BLUE}Test 4: Simulate Login Attempt${NC}"
echo "Attempting to login with test user..."

# Create a temporary cookie jar
COOKIE_JAR=$(mktemp)

# First, get the CSRF token
echo "Getting CSRF token..."
CSRF_RESPONSE=$(curl -s -c $COOKIE_JAR https://weilesgeht.de/api/auth/csrf)
CSRF_TOKEN=$(echo $CSRF_RESPONSE | jq -r '.csrfToken // "null"')

if [ "$CSRF_TOKEN" = "null" ]; then
    echo -e "${RED}❌ FAIL: Could not get CSRF token${NC}"
    ISSUE_FOUND=true
else
    echo -e "${GREEN}✅ PASS: Got CSRF token${NC}"
    
    # Attempt login
    echo "Attempting login with user@bund.de..."
    LOGIN_ATTEMPT=$(curl -s -b $COOKIE_JAR -c $COOKIE_JAR \
        -X POST \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "email=user@bund.de&csrfToken=$CSRF_TOKEN" \
        https://weilesgeht.de/api/auth/callback/credentials)
    
    echo "Login attempt response: $LOGIN_ATTEMPT"
    
    # Check if we got redirected or got an error
    if echo "$LOGIN_ATTEMPT" | grep -q "error"; then
        echo -e "${RED}❌ FAIL: Login attempt returned error${NC}"
        ISSUE_FOUND=true
    else
        echo -e "${GREEN}✅ PASS: Login attempt successful${NC}"
    fi
fi

# Clean up
rm -f $COOKIE_JAR

# Test 5: Check for specific error patterns
echo -e "\n${BLUE}Test 5: Error Pattern Detection${NC}"
echo "Checking for common error patterns..."

# Check if we can access the main page after login attempt
MAIN_PAGE_RESPONSE=$(curl -s https://weilesgeht.de/ | grep -i "server error\|problem with server\|configuration" || echo "no error found")

if [ "$MAIN_PAGE_RESPONSE" != "no error found" ]; then
    echo -e "${RED}❌ FAIL: Found error pattern on main page${NC}"
    echo "Error: $MAIN_PAGE_RESPONSE"
    ISSUE_FOUND=true
else
    echo -e "${GREEN}✅ PASS: No error patterns found on main page${NC}"
fi

# Summary
echo -e "\n${BLUE}Test Summary${NC}"
echo "============="

if [ "$ISSUE_FOUND" = "true" ]; then
    echo -e "${RED}❌ ISSUES FOUND: Deployment has problems${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Check Amplify build logs for environment variable injection"
    echo "2. Verify NEXTAUTH_URL is properly set in production"
    echo "3. Check database connection string"
    echo "4. Review NextAuth configuration"
    exit 1
else
    echo -e "${GREEN}✅ ALL TESTS PASSED: Deployment appears to be working${NC}"
    exit 0
fi

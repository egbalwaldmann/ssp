#!/bin/bash

# 🏥 Quick Health Check Script for SSP
# Fast health check without redeploy

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
LIVE_SITE="https://weilesgeht.de"
SUPABASE_ACCESS_TOKEN="sbp_cbdde3b1f039c215daafcb76ed18f8330279fe68"

print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Quick API health check
check_apis() {
    print_status $BLUE "🔍 Quick API Health Check..."
    
    # Health API
    local health_response=$(curl -s "$LIVE_SITE/api/health" | python3 -c "import sys, json; data=json.load(sys.stdin); print('OK' if data.get('ok') else 'FAILED')" 2>/dev/null || echo "ERROR")
    print_status $([ "$health_response" = "OK" ] && echo $GREEN || echo $RED) "  Health API: $health_response"
    
    # Products API
    local products_count=$(curl -s "$LIVE_SITE/api/products" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data) if isinstance(data, list) else 'ERROR')" 2>/dev/null || echo "ERROR")
    print_status $([ "$products_count" != "ERROR" ] && echo $GREEN || echo $RED) "  Products API: $products_count products"
    
    # Orders API
    local orders_response=$(curl -s -X POST "$LIVE_SITE/api/orders" -H "Content-Type: application/json" -d '{"test": "connection"}' | python3 -c "import sys, json; data=json.load(sys.stdin); print('OK' if 'Nicht autorisiert' in str(data.get('error', '')) else 'FAILED')" 2>/dev/null || echo "ERROR")
    print_status $([ "$orders_response" = "OK" ] && echo $GREEN || echo $RED) "  Orders API: $orders_response"
}

# Quick database check via Supabase CLI
check_database() {
    print_status $BLUE "🗄️  Quick Database Check..."
    
    if [ -f "./supabase" ]; then
        local db_status=$(export SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" && ./supabase projects list --output json 2>/dev/null | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['status'] if data else 'UNKNOWN')" 2>/dev/null || echo "ERROR")
        print_status $([ "$db_status" = "ACTIVE_HEALTHY" ] && echo $GREEN || echo $RED) "  Database Status: $db_status"
    else
        print_status $YELLOW "  Supabase CLI not found, skipping database check"
    fi
}

# Check for demo mode
check_demo_mode() {
    print_status $BLUE "🎭 Checking for Demo Mode..."
    
    local demo_detected=$(curl -s "$LIVE_SITE" | grep -i "demo-modus" | wc -l)
    if [ "$demo_detected" -gt 0 ]; then
        print_status $RED "  ❌ Demo mode detected on live site"
    else
        print_status $GREEN "  ✅ No demo mode detected"
    fi
}

# Main function
main() {
    print_status $BLUE "🏥 Quick Health Check - $(date)"
    print_status $BLUE "🌐 Live site: $LIVE_SITE"
    echo
    
    check_apis
    echo
    check_database
    echo
    check_demo_mode
    echo
    
    print_status $BLUE "✅ Quick health check complete!"
}

main "$@"

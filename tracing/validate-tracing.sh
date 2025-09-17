#!/bin/bash

# DevOpsChat Tracing System Validation Script
# Validates the tracing system files and integration

echo "🔧 DevOpsChat Tracing System Validation"
echo "========================================"
echo

PASSED=0
FAILED=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_result() {
    local status=$1
    local message=$2
    local details=$3
    
    case $status in
        "PASS")
            echo -e "${GREEN}✅ PASSED${NC}: $message"
            ((PASSED++))
            ;;
        "FAIL")
            echo -e "${RED}❌ FAILED${NC}: $message"
            if [ ! -z "$details" ]; then
                echo -e "   ${RED}→${NC} $details"
            fi
            ((FAILED++))
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  WARNING${NC}: $message"
            if [ ! -z "$details" ]; then
                echo -e "   ${YELLOW}→${NC} $details"
            fi
            ((WARNINGS++))
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  INFO${NC}: $message"
            ;;
    esac
}

echo "📁 File Existence Checks"
echo "========================"

# Check core files
if [ -f "tracing/tracing.js" ]; then
    print_result "PASS" "Core tracing module exists"
else
    print_result "FAIL" "Core tracing module missing" "tracing/tracing.js not found"
fi

if [ -f "tracing/integration.js" ]; then
    print_result "PASS" "Integration helper exists"
else
    print_result "FAIL" "Integration helper missing" "tracing/integration.js not found"
fi

if [ -f "tracing/example-integration.js" ]; then
    print_result "PASS" "Example integration exists"
else
    print_result "FAIL" "Example integration missing" "tracing/example-integration.js not found"
fi

if [ -f "tracing/readme.md" ]; then
    print_result "PASS" "Documentation exists"
else
    print_result "FAIL" "Documentation missing" "tracing/readme.md not found"
fi

echo
echo "📝 Content Validation"
echo "====================="

# Check JavaScript syntax
if command -v node >/dev/null 2>&1; then
    for file in tracing/tracing.js tracing/integration.js tracing/example-integration.js; do
        if [ -f "$file" ]; then
            if node -c "$file" 2>/dev/null; then
                print_result "PASS" "JavaScript syntax valid: $(basename $file)"
            else
                print_result "FAIL" "JavaScript syntax error: $(basename $file)"
            fi
        fi
    done
else
    print_result "WARN" "Node.js not available - skipping syntax validation"
fi

# Check for key components in tracing.js
if [ -f "tracing/tracing.js" ]; then
    if grep -q "class DevOpsChatTracing" tracing/tracing.js; then
        print_result "PASS" "Main tracing class found"
    else
        print_result "FAIL" "Main tracing class missing"
    fi
    
    if grep -q "setupErrorHandlers" tracing/tracing.js; then
        print_result "PASS" "Error handling setup found"
    else
        print_result "FAIL" "Error handling setup missing"
    fi
    
    if grep -q "createDebugPanel" tracing/tracing.js; then
        print_result "PASS" "Debug panel functionality found"
    else
        print_result "FAIL" "Debug panel functionality missing"
    fi
    
    if grep -q "monitorVueLoading" tracing/tracing.js; then
        print_result "PASS" "Vue monitoring functionality found"
    else
        print_result "FAIL" "Vue monitoring functionality missing"
    fi
fi

# Check integration helper
if [ -f "tracing/integration.js" ]; then
    if grep -q "class DevOpsChatTracingIntegration" tracing/integration.js; then
        print_result "PASS" "Integration class found"
    else
        print_result "FAIL" "Integration class missing"
    fi
    
    if grep -q "setupUIScriptMonitoring" tracing/integration.js; then
        print_result "PASS" "UI script monitoring setup found"
    else
        print_result "FAIL" "UI script monitoring setup missing"
    fi
    
    if grep -q "setupAgentScriptMonitoring" tracing/integration.js; then
        print_result "PASS" "Agent script monitoring setup found"
    else
        print_result "FAIL" "Agent script monitoring setup missing"
    fi
fi

echo
echo "🔗 Integration Validation"
echo "========================="

# Check if example integration has proper require statements
if [ -f "tracing/example-integration.js" ]; then
    if grep -q "@require.*tracing/tracing.js" tracing/example-integration.js; then
        print_result "PASS" "Example includes tracing.js requirement"
    else
        print_result "FAIL" "Example missing tracing.js requirement"
    fi
    
    if grep -q "@require.*tracing/integration.js" tracing/example-integration.js; then
        print_result "PASS" "Example includes integration.js requirement"
    else
        print_result "FAIL" "Example missing integration.js requirement"
    fi
    
    if grep -q "window.DevOpsChatTrace.init" tracing/example-integration.js; then
        print_result "PASS" "Example shows proper initialization"
    else
        print_result "FAIL" "Example missing proper initialization"
    fi
fi

echo
echo "📊 Feature Coverage Check"
echo "========================="

# Check for specific features in main tracing module
main_features=(
    "error handling:setupErrorHandlers"
    "performance monitoring:setupPerformanceMonitoring"
    "Vue monitoring:monitorVueLoading"
    "RPC monitoring:monitorRPCCommunication"
    "CDN health checks:checkUrlAvailability"
    "debug panel:createDebugPanel"
    "timer functionality:startTimer"
    "log export:exportLogs"
    "storage management:saveToStorage"
)

for feature in "${main_features[@]}"; do
    name=$(echo $feature | cut -d: -f1)
    function=$(echo $feature | cut -d: -f2)
    
    if grep -q "$function" tracing/tracing.js 2>/dev/null; then
        print_result "PASS" "Feature implemented: $name"
    else
        print_result "FAIL" "Feature missing: $name"
    fi
done

# Check for specific features in integration module
integration_features=(
    "memory monitoring:getMemoryUsage"
    "CDN health testing:checkCDNHealth"
    "safe function wrapping:safe"
    "debug state:debugState"
)

for feature in "${integration_features[@]}"; do
    name=$(echo $feature | cut -d: -f1)
    function=$(echo $feature | cut -d: -f2)
    
    if grep -q "$function" tracing/integration.js 2>/dev/null; then
        print_result "PASS" "Integration feature: $name"
    else
        print_result "FAIL" "Integration feature missing: $name"
    fi
done

echo
echo "📚 Documentation Check"
echo "======================"

if [ -f "tracing/readme.md" ]; then
    # Check for key documentation sections
    sections=(
        "Hurtigstart"
        "Funksjoner"
        "Detaljert Integrasjon"
        "Praktiske Eksempler"
        "Error Prevention"
        "Debug Panel"
    )
    
    for section in "${sections[@]}"; do
        if grep -qi "$section" tracing/readme.md; then
            print_result "PASS" "Documentation section: $section"
        else
            print_result "WARN" "Documentation section missing: $section"
        fi
    done
    
    # Check for code examples
    if grep -q '```javascript' tracing/readme.md; then
        print_result "PASS" "Code examples included in documentation"
    else
        print_result "WARN" "No code examples found in documentation"
    fi
fi

echo
echo "🌐 URL and Integration Tests"
echo "============================"

# Check if raw.githack URLs would work (simulated)
githack_urls=(
    "https://raw.githack.com/dingemoe/script/main/tracing/tracing.js"
    "https://raw.githack.com/dingemoe/script/main/tracing/integration.js"
)

for url in "${githack_urls[@]}"; do
    filename=$(basename $url)
    if [ -f "tracing/$filename" ]; then
        print_result "PASS" "File exists for URL: $filename"
    else
        print_result "FAIL" "File missing for URL: $filename"
    fi
done

# Check file sizes (should be reasonable for userscripts)
if [ -f "tracing/tracing.js" ]; then
    size=$(wc -c < tracing/tracing.js)
    if [ $size -lt 50000 ]; then # Less than 50KB
        print_result "PASS" "Core module size reasonable: ${size} bytes"
    else
        print_result "WARN" "Core module quite large: ${size} bytes"
    fi
fi

if [ -f "tracing/integration.js" ]; then
    size=$(wc -c < tracing/integration.js)
    if [ $size -lt 30000 ]; then # Less than 30KB
        print_result "PASS" "Integration module size reasonable: ${size} bytes"
    else
        print_result "WARN" "Integration module quite large: ${size} bytes"
    fi
fi

echo
echo "🎯 Practical Usage Validation"
echo "============================="

# Check for common userscript patterns
if [ -f "tracing/example-integration.js" ]; then
    patterns=(
        "// ==UserScript=="
        "@name"
        "@version"
        "@require"
        "window.DevOpsChatTrace"
        "tracer.info"
        "tracer.error"
    )
    
    for pattern in "${patterns[@]}"; do
        if grep -q "$pattern" tracing/example-integration.js; then
            print_result "PASS" "Userscript pattern found: $pattern"
        else
            print_result "WARN" "Userscript pattern missing: $pattern"
        fi
    done
fi

# Final summary
echo
echo "📋 VALIDATION SUMMARY"
echo "===================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 VALIDATION SUCCESSFUL!${NC}"
    echo "The tracing system is ready for use."
    exit 0
else
    echo -e "${RED}💥 VALIDATION FAILED!${NC}"
    echo "Please fix the failed checks before using the tracing system."
    exit 1
fi
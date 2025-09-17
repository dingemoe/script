#!/bin/bash

# DevOpsChat Userscript Validation Tool
# Comprehensive validation script for debugging common issues

echo "🔍 DevOpsChat Userscript Validation Tool"
echo "=========================================="
echo "📅 $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

# Helper functions
pass() {
    echo -e "✅ ${GREEN}PASS${NC}: $1"
    ((PASS++))
}

fail() {
    echo -e "❌ ${RED}FAIL${NC}: $1"
    ((FAIL++))
}

warn() {
    echo -e "⚠️  ${YELLOW}WARN${NC}: $1"
    ((WARN++))
}

info() {
    echo -e "ℹ️  ${BLUE}INFO${NC}: $1"
}

# 1. File Existence Check
echo "🗂️  File Existence Check"
echo "------------------------"

for script in "DevOpsChat-UI-A.user.js" "DevOpsChat-Agent-B.user.js"; do
    if [ -f "$script" ]; then
        pass "$script exists"
    else
        fail "$script not found"
        continue
    fi
done
echo ""

# 2. Syntax Validation
echo "🔍 Syntax Validation"
echo "-------------------"

for script in DevOpsChat-*.user.js; do
    if [ -f "$script" ]; then
        if node -c "$script" 2>/dev/null; then
            pass "$script syntax valid"
        else
            fail "$script syntax errors detected"
            echo "   Run: node -c $script for details"
        fi
    fi
done
echo ""

# 3. Metadata Validation
echo "🏷️  Metadata Validation"
echo "----------------------"

check_metadata() {
    local file=$1
    local name=$(grep "^// @name" "$file" | head -1)
    local version=$(grep "^// @version" "$file" | head -1)
    local downloadURL=$(grep "^// @downloadURL" "$file" | head -1)
    local updateURL=$(grep "^// @updateURL" "$file" | head -1)
    
    if [[ -n "$name" ]]; then
        pass "$file has @name"
    else
        fail "$file missing @name"
    fi
    
    if [[ -n "$version" ]]; then
        pass "$file has @version"
        info "   Version: $(echo $version | cut -d' ' -f3-)"
    else
        fail "$file missing @version"
    fi
    
    if [[ -n "$downloadURL" ]]; then
        pass "$file has @downloadURL"
    else
        warn "$file missing @downloadURL (auto-update disabled)"
    fi
    
    if [[ -n "$updateURL" ]]; then
        pass "$file has @updateURL"
    else
        warn "$file missing @updateURL (auto-update disabled)"
    fi
}

for script in DevOpsChat-*.user.js; do
    if [ -f "$script" ]; then
        check_metadata "$script"
        echo ""
    fi
done

# 4. URL Availability Check
echo "🌐 URL Availability Check"
echo "------------------------"

check_url() {
    local url=$1
    local description=$2
    local timeout=10
    
    if curl -s --head --max-time $timeout "$url" | head -n 1 | grep -E "HTTP/[12](\.[01])? [23][0-9][0-9]" > /dev/null; then
        pass "$description: $url"
    else
        fail "$description: $url (unreachable or error)"
        info "   Try: curl -I \"$url\""
    fi
}

# Extract and check URLs from userscripts
echo "Checking @require and @resource URLs..."

# Vue.js
check_url "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js" "Vue 3 CDN"
check_url "https://unpkg.com/vue@3/dist/vue.global.prod.js" "Vue 3 Fallback CDN"

# jQuery
check_url "https://code.jquery.com/jquery-3.7.1.min.js" "jQuery CDN"

# Beer CSS
check_url "https://cdn.jsdelivr.net/npm/beercss@3.7.11/dist/cdn/beer.min.css" "Beer CSS CDN"

# Material Icons
check_url "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" "Material Icons"

# Custom resources
check_url "https://raw.githack.com/dingemoe/script/main/style/style.css" "Custom CSS"
check_url "https://raw.githack.com/dingemoe/script/main/render/index.js" "Render System"
check_url "https://raw.githack.com/dingemoe/script/main/render/panel1/index.js" "Panel 1"
check_url "https://raw.githack.com/dingemoe/script/main/render/panel2/index.js" "Panel 2"
check_url "https://raw.githack.com/dingemoe/script/main/render/components.js" "Shared Components"

# GitHub raw URLs
check_url "https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-A.user.js" "UI Script Download URL"
check_url "https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-Agent-B.user.js" "Agent Script Download URL"

echo ""

# 5. Git Repository Check
echo "📦 Git Repository Check"
echo "----------------------"

if git rev-parse --git-dir > /dev/null 2>&1; then
    pass "Git repository detected"
    
    # Check if we're on main branch
    current_branch=$(git branch --show-current 2>/dev/null)
    if [[ "$current_branch" == "main" ]]; then
        pass "On main branch"
    else
        warn "Not on main branch (currently: $current_branch)"
    fi
    
    # Check for uncommitted changes
    if git diff-index --quiet HEAD --; then
        pass "No uncommitted changes"
    else
        warn "Uncommitted changes detected"
        info "   Run: git status"
    fi
    
    # Check remote connection
    if git ls-remote origin > /dev/null 2>&1; then
        pass "Remote origin accessible"
    else
        fail "Cannot connect to remote origin"
    fi
    
else
    fail "Not a git repository"
fi
echo ""

# 6. Module Structure Check
echo "🏗️  Module Structure Check"
echo "-------------------------"

required_dirs=("src" "render" "schema" "style")
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        pass "Directory $dir/ exists"
    else
        warn "Directory $dir/ missing"
    fi
done

required_files=(
    "render/index.js"
    "render/panel1/index.js" 
    "render/panel2/index.js"
    "render/components.js"
    "style/style.css"
    "src/core/rpc.js"
    "src/core/sessions.js"
    "src/utils/helpers.js"
    "src/panel/index.js"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        pass "Module $file exists"
    else
        warn "Module $file missing"
    fi
done
echo ""

# 7. Version Consistency Check
echo "🔢 Version Consistency Check"
echo "---------------------------"

ui_metadata_version=$(grep "^// @version" DevOpsChat-UI-A.user.js | awk '{print $3}')
ui_code_version=$(grep "SCRIPT_VERSION.*=" DevOpsChat-UI-A.user.js | head -1 | sed "s/.*'\(.*\)'.*/\1/")

agent_metadata_version=$(grep "^// @version" DevOpsChat-Agent-B.user.js | awk '{print $3}')
agent_code_version=$(grep "SCRIPT_VERSION.*=" DevOpsChat-Agent-B.user.js | head -1 | sed "s/.*'\(.*\)'.*/\1/")

if [[ "$ui_metadata_version" == "$ui_code_version" ]]; then
    pass "UI script version consistent ($ui_metadata_version)"
else
    fail "UI script version mismatch: metadata=$ui_metadata_version, code=$ui_code_version"
fi

if [[ "$agent_metadata_version" == "$agent_code_version" ]]; then
    pass "Agent script version consistent ($agent_metadata_version)"
else
    fail "Agent script version mismatch: metadata=$agent_metadata_version, code=$agent_code_version"
fi
echo ""

# 8. Performance & Size Check
echo "📊 Performance & Size Check"
echo "--------------------------"

for script in DevOpsChat-*.user.js; do
    if [ -f "$script" ]; then
        size=$(stat -c%s "$script" 2>/dev/null || stat -f%z "$script" 2>/dev/null)
        lines=$(wc -l < "$script")
        
        if [[ $size -lt 100000 ]]; then  # < 100KB
            pass "$script size OK ($(echo "$size" | numfmt --to=iec))"
        else
            warn "$script large ($(echo "$size" | numfmt --to=iec)) - consider optimization"
        fi
        
        info "   Lines: $lines"
    fi
done
echo ""

# 9. Common Issue Patterns
echo "🐛 Common Issue Pattern Check"
echo "----------------------------"

check_pattern() {
    local file=$1
    local pattern=$2
    local description=$3
    local is_bad=$4
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        if [[ "$is_bad" == "true" ]]; then
            warn "$description found in $file"
        else
            pass "$description found in $file"
        fi
    else
        if [[ "$is_bad" == "true" ]]; then
            pass "$description not found in $file (good)"
        else
            warn "$description missing in $file"
        fi
    fi
}

for script in DevOpsChat-*.user.js; do
    if [ -f "$script" ]; then
        info "Checking patterns in $script:"
        
        # Good patterns
        check_pattern "$script" "console\.log.*Modified:" "Modification tracking" "false"
        check_pattern "$script" "window\.__DEVOPSCHAT.*__" "Singleton guard" "false"
        check_pattern "$script" "if.*window\.top.*window\.self" "Frame protection" "false"
        
        # Bad patterns
        check_pattern "$script" "alert.*debug" "Debug alerts" "true"
        check_pattern "$script" "console\.log.*test" "Test logging" "true"
        check_pattern "$script" "TODO\|FIXME\|HACK" "Development markers" "true"
        
        echo ""
    fi
done

# 10. Browser Compatibility Check
echo "🌍 Browser Compatibility Check"
echo "-----------------------------"

check_compat() {
    local file=$1
    local feature=$2
    local description=$3
    
    if grep -q "$feature" "$file" 2>/dev/null; then
        info "$description used in $file"
    fi
}

for script in DevOpsChat-*.user.js; do
    if [ -f "$script" ]; then
        info "Checking compatibility in $script:"
        
        check_compat "$script" "async.*await" "Modern async/await"
        check_compat "$script" "arrow.*function\|=>" "Arrow functions"
        check_compat "$script" "const\|let" "Modern variable declarations"
        check_compat "$script" "Promise\." "Promises"
        check_compat "$script" "shadowRoot\|attachShadow" "Shadow DOM"
        
        echo ""
    fi
done

# Summary
echo "📋 Validation Summary"
echo "===================="
echo -e "✅ ${GREEN}PASSED${NC}: $PASS"
echo -e "❌ ${RED}FAILED${NC}: $FAIL" 
echo -e "⚠️  ${YELLOW}WARNINGS${NC}: $WARN"

total=$((PASS + FAIL + WARN))
if [[ $total -gt 0 ]]; then
    pass_percent=$((PASS * 100 / total))
    echo -e "📊 Success Rate: ${GREEN}${pass_percent}%${NC}"
fi

echo ""

if [[ $FAIL -eq 0 ]]; then
    echo -e "🎉 ${GREEN}All critical checks passed!${NC}"
    if [[ $WARN -gt 0 ]]; then
        echo -e "💡 Consider addressing warnings for optimal performance"
    fi
else
    echo -e "🚨 ${RED}Critical issues detected!${NC}"
    echo -e "🔧 Fix failed checks before deployment"
fi

echo ""
echo "📖 For debugging help, see:"
echo "   - AUTO-UPDATE-GUIDE.md"
echo "   - SCRIPT-MODIFICATION-TRACKING.md"
echo "   - GitHub Issues: https://github.com/dingemoe/script/issues"
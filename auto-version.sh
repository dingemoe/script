#!/bin/bash

# Auto-versioning script for DevOpsChat userscripts
# Updates version numbers based on git commits and changes

set -e

echo "🔄 DevOpsChat Auto-Versioning Tool"
echo "=================================="

# Function to get current version from file
get_current_version() {
    local file="$1"
    if [[ -f "$file" ]]; then
        grep -o "@version\s*[0-9]\+\.[0-9]\+\.[0-9]\+" "$file" | grep -o "[0-9]\+\.[0-9]\+\.[0-9]\+"
    else
        echo "1.0.0"
    fi
}

# Function to increment version
increment_version() {
    local version="$1"
    local type="$2"  # major, minor, patch
    
    IFS='.' read -ra VERSION_PARTS <<< "$version"
    local major="${VERSION_PARTS[0]}"
    local minor="${VERSION_PARTS[1]}"
    local patch="${VERSION_PARTS[2]}"
    
    case "$type" in
        "major")
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        "minor")
            minor=$((minor + 1))
            patch=0
            ;;
        "patch"|*)
            patch=$((patch + 1))
            ;;
    esac
    
    echo "$major.$minor.$patch"
}

# Function to update version in file
update_version_in_file() {
    local file="$1"
    local new_version="$2"
    local timestamp="$3"
    
    if [[ ! -f "$file" ]]; then
        echo "⚠️  File not found: $file"
        return 1
    fi
    
    # Update @version in metadata
    sed -i "s/@version\s*[0-9]\+\.[0-9]\+\.[0-9]\+/@version      $new_version/g" "$file"
    
    # Update SCRIPT_VERSION constant
    sed -i "s/const SCRIPT_VERSION = '[0-9]\+\.[0-9]\+\.[0-9]\+'/const SCRIPT_VERSION = '$new_version'/g" "$file"
    
    # Update MODIFIED_DATE with timestamp and auto-version comment
    local comment="\/\/ ✅ Auto-versioned to v$new_version on $(date '+%Y-%m-%d %H:%M')"
    sed -i "s/const MODIFIED_DATE = new Date('[^']*'); \/\/ .*/const MODIFIED_DATE = new Date('$timestamp'); $comment/g" "$file"
    
    echo "✅ Updated $file to version $new_version"
}

# Function to determine version bump type from git changes
get_version_bump_type() {
    local file="$1"
    
    # Check git log for commit messages since last version tag
    local last_changes=$(git log --oneline -10 --grep="version\|fix\|feat\|break" -- "$file" 2>/dev/null || echo "")
    
    if echo "$last_changes" | grep -qi "break\|major"; then
        echo "major"
    elif echo "$last_changes" | grep -qi "feat\|feature\|minor"; then
        echo "minor"
    else
        echo "patch"
    fi
}

# Main auto-versioning logic
auto_version_file() {
    local file="$1"
    local force_type="$2"
    
    if [[ ! -f "$file" ]]; then
        echo "⚠️  Skipping non-existent file: $file"
        return 0
    fi
    
    echo
    echo "📄 Processing: $file"
    
    local current_version=$(get_current_version "$file")
    echo "📊 Current version: $current_version"
    
    # Determine version bump type
    local bump_type="$force_type"
    if [[ -z "$bump_type" ]]; then
        bump_type=$(get_version_bump_type "$file")
    fi
    
    echo "📈 Bump type: $bump_type"
    
    # Calculate new version
    local new_version=$(increment_version "$current_version" "$bump_type")
    echo "🎯 New version: $new_version"
    
    # Get current timestamp
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Update file
    update_version_in_file "$file" "$new_version" "$timestamp"
    
    return 0
}

# Parse command line arguments
FORCE_TYPE=""
FILES_TO_VERSION=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --major)
            FORCE_TYPE="major"
            shift
            ;;
        --minor)
            FORCE_TYPE="minor"
            shift
            ;;
        --patch)
            FORCE_TYPE="patch"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--major|--minor|--patch] [file1] [file2] ..."
            echo ""
            echo "Options:"
            echo "  --major    Force major version bump (x.0.0)"
            echo "  --minor    Force minor version bump (x.y.0)"
            echo "  --patch    Force patch version bump (x.y.z)"
            echo ""
            echo "If no files specified, will auto-version all userscripts"
            exit 0
            ;;
        *)
            FILES_TO_VERSION+=("$1")
            shift
            ;;
    esac
done

# If no files specified, find all userscripts
if [[ ${#FILES_TO_VERSION[@]} -eq 0 ]]; then
    echo "🔍 Auto-detecting userscripts..."
    
    # Find all .user.js files
    while IFS= read -r -d '' file; do
        FILES_TO_VERSION+=("$file")
    done < <(find . -name "*.user.js" -type f -print0)
    
    echo "📁 Found ${#FILES_TO_VERSION[@]} userscript(s)"
fi

# Process each file
for file in "${FILES_TO_VERSION[@]}"; do
    auto_version_file "$file" "$FORCE_TYPE"
done

echo
echo "🎉 Auto-versioning completed!"
echo

# Show summary
echo "📋 Version Summary:"
echo "=================="
for file in "${FILES_TO_VERSION[@]}"; do
    if [[ -f "$file" ]]; then
        version=$(get_current_version "$file")
        printf "%-40s %s\n" "$(basename "$file")" "v$version"
    fi
done

echo
echo "💡 Next steps:"
echo "   - Review changes with: git diff"
echo "   - Test userscripts: ./validate-userscripts.sh"
echo "   - Commit changes: git add . && git commit -m 'Auto-version userscripts'"
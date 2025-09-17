# 🔄 DevOpsChat Auto-Versioning System

Automatisk versjonshåndtering for DevOpsChat userscripts med intelligent bump detection og Git integration.

## 📋 Features

- **🤖 Automatisk versjonering** basert på Git commits
- **📊 Intelligent bump detection** (major/minor/patch)
- **🔗 Git hooks integration** for seamless workflow
- **🚀 GitHub Actions** for CI/CD versjonering
- **📝 Automatisk changelog generering**
- **✅ Validation integration** med userscript testing

## 🛠️ Manual Usage

### Basic Auto-Versioning

```bash
# Auto-version alle userscripts (auto-detect bump type)
./auto-version.sh

# Force specific bump type
./auto-version.sh --major
./auto-version.sh --minor  
./auto-version.sh --patch

# Version specific files
./auto-version.sh --patch DevOpsChat-UI-React-traced.user.js
```

### Version Bump Types

| Type | Description | Example | Use Case |
|------|-------------|---------|----------|
| **Major** | Breaking changes | 1.0.0 → 2.0.0 | API changes, incompatible updates |
| **Minor** | New features | 1.0.0 → 1.1.0 | New functionality, backward compatible |
| **Patch** | Bug fixes | 1.0.0 → 1.0.1 | Bug fixes, minor improvements |

## 🔄 Automatic Workflows

### 1. Git Pre-Commit Hook

Automatically versions userscripts when committed:

```bash
# Hook is already installed at .git/hooks/pre-commit
git add DevOpsChat-UI-React-traced.user.js
git commit -m "feat: Add new React component"
# → Automatically bumps to next minor version
```

### 2. GitHub Actions

Triggers on userscript changes:

- **Push to main**: Auto-version and commit back
- **Pull requests**: Validate versioning without committing
- **Smart detection**: Analyzes commit messages for bump type

#### Commit Message Keywords

| Keywords | Bump Type | Example |
|----------|-----------|---------|
| `breaking`, `major` | Major | `breaking: Remove legacy API` |
| `feat`, `feature`, `minor` | Minor | `feat: Add tracing system` |
| `fix`, `patch`, default | Patch | `fix: Resolve CSS issue` |

## 📁 Version File Updates

The auto-versioning system updates three parts of each userscript:

### 1. Metadata Block
```javascript
// @version      6.0.4
```

### 2. Script Constants  
```javascript
const SCRIPT_VERSION = '6.0.4';
```

### 3. Modification Tracking
```javascript
const MODIFIED_DATE = new Date('2025-09-17T23:35:00Z'); // ✅ Auto-versioned to v6.0.4 on 2025-09-17 23:35
```

## 🎯 Integration with Validation

Auto-versioning automatically integrates with the validation system:

```bash
# Full workflow
./auto-version.sh --minor    # Version userscripts
./validate-userscripts.sh    # Validate changes
git add . && git commit -m "feat: Add new features"
```

## 📊 Version History Tracking

Track version history across all userscripts:

```bash
# View current versions
./auto-version.sh | grep "Version Summary" -A 10

# Check git history for version tags
git log --oneline --grep="Auto-version"

# Compare versions between commits
git diff HEAD~1 HEAD -- "*.user.js" | grep "@version"
```

## 🔧 Configuration

### Smart Detection Rules

The system analyzes:

1. **Git commit messages** for keywords
2. **File change patterns** (new files vs modifications)
3. **Validation results** (breaking changes detection)

### Custom Bump Rules

Add custom rules by editing `auto-version.sh`:

```bash
# In get_version_bump_type() function
if echo "$last_changes" | grep -qi "react\|vue\|major-ui"; then
    echo "minor"  # UI framework changes = minor bump
fi
```

## 🚀 Production Deployment

### Tampermonkey URLs (Auto-Updated)

The auto-versioning system ensures these URLs always serve the latest versions:

```
https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-React-traced.user.js
https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-Agent-B-traced.user.js
```

### Release Automation

GitHub Actions automatically:

1. **Versions** userscripts on push
2. **Validates** all changes
3. **Generates** release notes
4. **Updates** documentation
5. **Notifies** of new versions

## 📋 Example Workflow

```bash
# 1. Make changes to userscript
vim DevOpsChat-UI-React-traced.user.js

# 2. Auto-version (optional - happens automatically on commit)
./auto-version.sh --minor

# 3. Validate changes
./validate-userscripts.sh

# 4. Commit with semantic message
git add .
git commit -m "feat: Add React Error Boundary component"

# 5. Push (triggers GitHub Actions)
git push

# → GitHub Actions will:
#   - Auto-version based on commit message  
#   - Validate all userscripts
#   - Generate release notes
#   - Update repository
```

## 💡 Best Practices

1. **Use semantic commit messages** for accurate bump detection
2. **Test locally** with `./validate-userscripts.sh` before pushing
3. **Review auto-versioning** with `git diff` before committing
4. **Use --patch** for safe incremental updates
5. **Use --major** only for breaking changes

## 🔍 Troubleshooting

### Version Not Updated
```bash
# Check current version detection
./auto-version.sh DevOpsChat-UI-React-traced.user.js --patch
```

### Git Hook Not Working
```bash
# Reinstall pre-commit hook
chmod +x .git/hooks/pre-commit
```

### Validation Failing
```bash
# Run validation before versioning
./validate-userscripts.sh
./auto-version.sh --patch
```

---

## 📈 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-09-17 | Initial auto-versioning system |
| 1.1.0 | 2025-09-17 | Added Git hooks integration |
| 1.2.0 | 2025-09-17 | Added GitHub Actions workflow |

**🎉 Auto-versioning makes DevOpsChat development seamless and professional!**
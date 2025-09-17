# 🚀 DevOpsChat Userscript Suite

Production-ready userscripts with React UI, smart tracing, and automatic versioning system.

## 🎯 Quick Start

### Install from GitHub (Auto-updating)

1. **DevOpsChat React UI** (Main Interface):
   ```
   https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-React-traced.user.js
   ```

2. **DevOpsChat Agent** (Background RPC):
   ```
   https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-Agent-B-traced.user.js
   ```

3. **Install in Tampermonkey** → URLs auto-update with new versions

## ✨ Features

- **🎨 Modern React UI** with DaisyUI styling and shadow DOM isolation
- **🔄 Automatic versioning** with Git hooks and GitHub Actions
- **📊 Smart tracing system** for real-time debugging and performance monitoring
- **🛡️ CSS isolation** preventing contamination of host websites
- **🤖 RPC communication** between UI and background agent
- **✅ Comprehensive validation** with 96% success rate testing
- **📝 Auto-update from GitHub** with proper versioning metadata

## 🏗️ Architecture Overview

### Core Components
- **React UI Panel**: Modern interface replacing Vue due to loading reliability
- **RPC Agent**: Background script handling communication
- **Tracing Engine**: Comprehensive error capture and performance monitoring
- **Validation System**: Automated quality assurance
- **Auto-Versioning**: Intelligent version management

## 📁 Repository Structure

```
📁 DevOpsChat Userscript Suite
├── 🎨 React UI Scripts
│   ├── DevOpsChat-UI-React-traced.user.js    # Main React UI (v6.0.4)
│   └── DevOpsChat-UI-A.user.js              # Legacy Vue UI
├── 🤖 Agent Scripts  
│   └── DevOpsChat-Agent-B-traced.user.js    # RPC Agent (v2.2.2)
├── 🔧 Development Tools
│   ├── auto-version.sh                      # Automatic versioning tool
│   ├── validate-userscripts.sh              # Comprehensive validation
│   └── git-auto-commit.sh                   # Auto-commit on save
├── 📊 Tracing System
│   ├── tracing/tracing.js                   # Core tracing engine
│   └── tracing/integration.js               # Easy integration
├── 🏗️ Core Modules
│   ├── src/
│   │   ├── core/
│   │   │   ├── rpc.js                       # RPC communication
│   │   │   └── sessions.js                  # Session management  
│   │   ├── panel/
│   │   │   └── index.js                     # Panel interface
│   │   └── utils/
│   │       └── helpers.js                   # Utility functions
├── 📋 Configuration
│   ├── schema/                              # YAML templates
│   ├── examples/                            # Example configurations
│   └── .github/workflows/                   # CI/CD automation
└── 📚 Documentation
    ├── README.md                            # This file
    ├── AUTO-VERSIONING-GUIDE.md             # Versioning documentation
    └── USERSCRIPT-VALIDATION-GUIDE.md       # Validation guide
```

## 🔄 Automatic Versioning System

Our userscripts use intelligent auto-versioning:

### Git Integration
```bash
# Versions automatically on commit
git commit -m "feat: Add new React component"
# → Auto-bumps to next minor version

# Manual versioning
./auto-version.sh --patch
./auto-version.sh --minor  
./auto-version.sh --major
```

### GitHub Actions CI/CD
- **Auto-versions** on push to main
- **Validates** all userscripts  
- **Generates** release notes
- **Updates** Tampermonkey URLs

### Version Tracking
- ✅ **Semantic versioning** (major.minor.patch)
- ✅ **Git hooks** for automatic bumping
- ✅ **Timestamp tracking** in userscript headers
- ✅ **Validation integration** before versioning

## 📊 Smart Tracing & Debugging

Real-time monitoring and debugging for userscripts:

### Features
- **🔍 Error capture** with stack traces
- **⚡ Performance monitoring** 
- **🔗 RPC communication tracking**
- **🧠 Memory usage monitoring**
- **⌨️ Debug panel** with keyboard shortcuts
- **📱 React-specific** debugging support

### Usage
```javascript
// Automatic tracing in all userscripts
// View debug panel: Ctrl+Shift+D
// Console output with detailed context
```

## ✅ Validation & Quality Assurance

Comprehensive testing with 96% success rate:

```bash
# Run full validation suite
./validate-userscripts.sh

# 48+ validation checks including:
# - Metadata validation
# - JavaScript syntax checking  
# - Version consistency
# - React/dependency validation
# - GitHub URL accessibility
```

## 🚀 Development Workflow

### 1. Local Development
```bash
# Make changes to userscripts
vim DevOpsChat-UI-React-traced.user.js

# Validate changes
./validate-userscripts.sh

# Auto-version (optional - happens on commit)
./auto-version.sh --minor
```

### 2. Git Workflow  
```bash
# Commit with semantic messages
git add .
git commit -m "feat: Add React Error Boundary"

# Push triggers auto-versioning via GitHub Actions
git push
```

### 3. Production Deployment
- **Tampermonkey** auto-updates from GitHub raw URLs
- **GitHub Actions** handles versioning and validation
- **Users** get updates automatically with proper versioning

## 📚 Documentation

- **[Auto-Versioning Guide](AUTO-VERSIONING-GUIDE.md)** - Complete versioning system documentation
- **[Validation Guide](USERSCRIPT-VALIDATION-GUIDE.md)** - Quality assurance and testing
- **[Migration Notes](arkiv/)** - Vue to React migration details

## 🔧 Technical Details

### React UI Architecture
- **React 18** + **DaisyUI** styling
- **Shadow DOM** CSS isolation  
- **Error boundaries** for stability
- **CDN loading** with fallbacks
- **Responsive design** with dark mode

### RPC Communication
- **Cross-script** messaging system
- **Error handling** and retry logic
- **Performance monitoring** 
- **Session management**

### Auto-Update System
- **GitHub raw URLs** for instant updates
- **Version metadata** for Tampermonkey
- **Semantic versioning** compliance
- **Backward compatibility** checking

## 🎯 Production Status

| Component | Version | Status | Auto-Update |
|-----------|---------|--------|-------------|
| React UI | v6.0.4 | ✅ Production | ✅ Enabled |
| RPC Agent | v2.2.2 | ✅ Production | ✅ Enabled |
| Validation | 96% | ✅ Passing | ✅ CI/CD |
| Versioning | Auto | ✅ Active | ✅ Git Hooks |

**🎉 Ready for production use with automatic maintenance!**

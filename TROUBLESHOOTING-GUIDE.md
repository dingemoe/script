# DevOpsChat Troubleshooting Guide 🔧

Quick reference for common issues and solutions encountered during development.

## 🚀 Quick Validation

```bash
# Run comprehensive validation
./validate-userscripts.sh

# Quick syntax check
node -c DevOpsChat-UI-A.user.js
node -c DevOpsChat-Agent-B.user.js

# Test URL availability  
curl -I "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"
```

## 🐛 Common Issues & Solutions

### 1. Vue Loading Problems

**❌ Error**: `Vue is not loaded yet. Make sure Vue 3 is available globally`

**🔍 Debug Steps**:
```javascript
// Check in browser console:
console.log('Vue available:', typeof window.Vue, window.Vue?.version);
console.log('Scripts in head:', document.head.querySelectorAll('script[src*="vue"]').length);
```

**✅ Solutions**:
- Change `@require` URL from unpkg to jsdelivr or vice versa
- Check CDN availability: `curl -I "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"`
- Increase timeout in Vue waiting logic
- Use manual fallback script injection

**🛠️ Implementation**:
```javascript
// Try multiple CDN sources
const fallbackStrategies = [
  'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js',
  'https://unpkg.com/vue@3/dist/vue.global.prod.js',
  'https://cdnjs.cloudflare.com/ajax/libs/vue/3.3.4/vue.global.prod.min.js'
];
```

### 2. CSS Isolation Problems

**❌ Error**: Beer CSS affecting all websites globally

**🔍 Debug Steps**:
```javascript
// Check if styles are isolated
const testEl = document.createElement('div');
testEl.className = 'button primary';
document.body.appendChild(testEl);
const hasGlobalCSS = window.getComputedStyle(testEl).backgroundColor !== 'rgba(0, 0, 0, 0)';
console.log('CSS leak detected:', hasGlobalCSS);
```

**✅ Solutions**:
- Use Shadow DOM for complete isolation
- Load CSS into shadow root instead of document head
- Ensure `pointer-events: auto` for UI interaction

**🛠️ Implementation**:
```javascript
const shadowHost = document.createElement('div');
const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
const styleEl = document.createElement('style');
styleEl.textContent = cssContent;
shadowRoot.appendChild(styleEl);
```

### 3. Auto-Update Issues

**❌ Error**: Tampermonkey not detecting updates

**🔍 Debug Steps**:
- Check version number in `@version` metadata
- Verify `@downloadURL` and `@updateURL` are accessible
- Test GitHub raw URLs manually

**✅ Solutions**:
- Always increment `@version` when making changes
- Ensure GitHub raw URLs are working
- Update `SCRIPT_VERSION` constant to match metadata
- Wait 24 hours or force manual update

**🛠️ Required Updates**:
```javascript
// In metadata:
// @version      5.1.5

// In code:
const SCRIPT_VERSION = '5.1.5';
const MODIFIED_DATE = new Date('2025-09-17T22:30:00Z');
```

### 4. Module Loading Failures

**❌ Error**: Failed to import render modules

**🔍 Debug Steps**:
```bash
# Check module URLs
curl -I "https://raw.githack.com/dingemoe/script/main/render/index.js"
curl -I "https://raw.githack.com/dingemoe/script/main/render/panel1/index.js"
```

**✅ Solutions**:
- Verify all module files exist in repository
- Check for syntax errors in modules: `node -c render/index.js`
- Test CDN accessibility with multiple branches (main/master)
- Use `pick()` function for fallback URLs

### 5. RPC Communication Problems

**❌ Error**: No response from Agent script

**🔍 Debug Steps**:
```javascript
// Check if Agent script is loaded
console.log('Agent loaded:', !!window.__DEVOPSCHAT_AGENT_B__);

// Test postMessage communication
window.postMessage({kind: 'rpc_call', method: 'ping'}, '*');
```

**✅ Solutions**:
- Ensure Agent script is installed and active
- Check session hash in URL: `#dc_session=test`
- Verify `window.opener` connection for cross-window communication
- Check origin/CORS restrictions

### 6. Version Mismatch Issues

**❌ Error**: Script version inconsistency

**🔍 Debug Steps**:
```bash
# Check version consistency
grep "@version" DevOpsChat-*.user.js
grep "SCRIPT_VERSION" DevOpsChat-*.user.js
```

**✅ Solutions**:
- Keep `@version` and `SCRIPT_VERSION` in sync
- Update `MODIFIED_DATE` when changing code
- Use validation script to catch mismatches

### 7. Performance Problems

**❌ Error**: Script too large or slow loading

**🔍 Debug Steps**:
```bash
# Check file sizes
ls -lh DevOpsChat-*.user.js
wc -l DevOpsChat-*.user.js
```

**✅ Solutions**:
- Optimize by removing debug code
- Use dynamic imports for large modules
- Minimize inline CSS and use external resources
- Consider code splitting for complex features

## 🛠️ Development Workflow

### Before Committing:
```bash
# 1. Run validation
./validate-userscripts.sh

# 2. Update versions
# - Increment @version in metadata
# - Update SCRIPT_VERSION constant  
# - Set MODIFIED_DATE to current time

# 3. Test URLs
curl -I "https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-A.user.js"

# 4. Commit and push
git add .
git commit -m "Description of changes"
git push
```

### Testing Checklist:
- [ ] Both userscripts load without errors
- [ ] Vue/jQuery available in console
- [ ] CSS isolation working (no global contamination)
- [ ] RPC communication functional
- [ ] Auto-update metadata correct
- [ ] All CDN URLs accessible
- [ ] No console errors or warnings

## 📋 Error Log Patterns

### Successful Loading:
```
🔧 DevOpsChat UI (A) — Vue 3 + Beer CSS Edition v5.1.4
📅 Modified: 17.09.2025 22:20:00 (5min siden)
✅ Vue already available at script start!
✅ DevOpsChat: CSS resources loaded in isolated shadow DOM
✅ Render controller initialized successfully
```

### Vue Loading Issues:
```
⏳ Waiting for Vue to be available...
⏳ Still waiting for Vue... (3s) - trying fallback soon
🔄 Fallback 1: Loading Vue from https://...
✅ Vue loaded successfully from fallback 1
```

### CSS Isolation Success:
```
✅ DevOpsChat: CSS resources loaded in isolated shadow DOM
🔍 Shadow DOM setup complete, container ready
```

## 🔗 Quick Links

- **Validation Script**: `./validate-userscripts.sh`
- **Auto-Update Guide**: `AUTO-UPDATE-GUIDE.md`
- **Modification Tracking**: `SCRIPT-MODIFICATION-TRACKING.md`
- **GitHub Issues**: https://github.com/dingemoe/script/issues
- **CDN Health Check**: Test all URLs in validation script

## 📞 Emergency Debugging

If everything fails:
1. Check browser console for errors
2. Run validation script
3. Test individual URLs manually
4. Verify Git repository status
5. Compare with last working version
6. Check for browser/Tampermonkey updates

```bash
# Last resort - check git history
git log --oneline -10
git diff HEAD~1 DevOpsChat-UI-A.user.js
```
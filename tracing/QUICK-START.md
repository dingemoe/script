# DevOpsChat Smart Tracing System - Quick Start Guide 🚀

**Effektiv feilsporing og debugging for DevOpsChat userscripts**

## 🎯 Hva Er Dette?

Et intelligent tracing-system spesielt utviklet for dine DevOpsChat userscripts som:
- **Automatisk fanger alle feil** og gir detaljerte stacktraces
- **Overvåker Vue-lasting** og CDN-tilgjengelighet
- **Sporer RPC-kommunikasjon** mellom UI og Agent scripts
- **Gir real-time debugging** via in-browser panel
- **Forebygger vanlige problemer** med automatisk error wrapping

## ⚡ Rask Implementering

### 1. Legg til i ditt userscript:

```javascript
// @require https://raw.githack.com/dingemoe/script/main/tracing/tracing.js
// @require https://raw.githack.com/dingemoe/script/main/tracing/integration.js

// Initialiser på toppen av scriptet ditt
const tracer = window.DevOpsChatTrace.init('Ditt Script Navn');
```

### 2. Aktiver debug-modus:
```
https://din-side.com/#debug
```

### 3. Se resultater:
- **Ctrl+Shift+D**: Toggle debug panel
- **Ctrl+Shift+T**: Vis systemstatus
- **Ctrl+Shift+R**: Test RPC-kommunikasjon

## 🔧 Praktiske Eksempler

### Vue Loading med Tracing
```javascript
// I stedet for vanlig Vue waiting
await tracer.monitorVueLoading(30000);
// Automatisk fallback, timing og error handling
```

### Sikker Kode-kjøring
```javascript
// Wrapper funksjoner for automatisk error capture
const safeFn = tracer.safe(() => {
    // Din kode her - feil fanges automatisk
}, 'function_name');

await tracer.safeAsync(async () => {
    // Async operasjoner med error handling
}, 'async_operation');
```

### Performance Monitoring
```javascript
tracer.startTimer('vue_loading');
// ... Vue loading code ...
tracer.endTimer('vue_loading');

// Automatisk memory og CDN monitoring
const health = await tracer.checkCDNHealth();
const memory = tracer.getMemoryUsage();
```

## 📊 Debug Panel Features

Når du aktiverer `#debug`, får du:

- **📈 Real-time Metrics**: Errors, warnings, uptime, memory usage
- **📝 Live Logs**: Siste 20 log-entries med farger og timestamps  
- **🌐 CDN Status**: Test alle CDN-URLer på én gang
- **📡 RPC Testing**: Test kommunikasjon mellom scripts
- **💾 Export**: Last ned alle logs som JSON for detaljert analyse
- **🔍 System State**: Komplett oversikt over Vue, jQuery, DOM status

## 🚨 Automatisk Error Prevention

```javascript
// Alle disse fangges automatisk:
- JavaScript errors (syntax, runtime, etc.)
- Vue component errors  
- Unhandled promise rejections
- Network failures (CDN, RPC)
- Resource loading timeouts

// Med detaljert kontekst:
- Stack traces
- Component info (Vue)
- Network details
- Performance metrics
- User environment
```

## 📁 Systemfiler

```
tracing/
├── tracing.js           # Core tracing engine
├── integration.js       # Easy userscript integration  
├── example-integration.js # Complete implementation example
├── validate-tracing.sh  # Validation script (48 checks)
└── readme.md           # Comprehensive documentation
```

## 🎯 Hvorfor Bruke Dette?

### Før (Vanlig Debugging):
```javascript
// Vue loading timeout - ingen info om årsak
console.log('Vue is not available');

// Ukjent error - ingen context
try { /* kode */ } catch(e) { console.error(e); }

// Manuell CDN testing
fetch('https://cdn.example.com/vue.js')
```

### Etter (Med Smart Tracing):
```javascript
// Detaljert Vue loading med fallbacks
✅ Vue loaded successfully from fallback 2
📊 Loading time: 2.3s, CDN: unpkg

// Rik error context
❌ Error captured: TypeError in renderComponent
📍 Component: UserProfile, Method: updateData
🌐 CDN Status: 3/4 available, jQuery: ✅, Memory: 45MB

// Automatisk monitoring
🔧 System healthy: All CDNs responsive, RPC active
```

## 🔥 Integration Quick-wins

### For DevOpsChat UI Script (A):
```javascript
// Automatisk Vue + CSS monitoring
const tracer = window.DevOpsChatTrace.init('DevOpsChat UI (A)', {
    monitorVue: true,
    monitorRPC: true, 
    monitorCDN: true
});

// Safe shadow DOM creation
const container = tracer.safe(() => createShadowDOM(), 'shadow_dom');
```

### For DevOpsChat Agent Script (B):
```javascript
// Automatisk jQuery + RPC monitoring  
const tracer = window.DevOpsChatTrace.init('DevOpsChat Agent (B)', {
    monitorRPC: true,
    monitorDOM: true
});

// Safe RPC handling
window.addEventListener('message', tracer.safe(handleRPC, 'rpc_handler'));
```

## 🏆 Resultat

Med dette systemet får du:

1. **🔍 Øyeblikkelig problemdiagnose** - Se nøyaktig hva som feiler og hvorfor
2. **📈 Proaktiv overvåking** - Fang problemer før de blir til feil
3. **⚡ Raskere debugging** - Real-time panel med all info du trenger
4. **🛡️ Robust error handling** - Automatisk recovery og fallbacks
5. **📊 Performance innsikt** - Memory, timing og resource usage
6. **🎯 Userscript-optimalisert** - Spesialdesignet for Tampermonkey-miljøer

## 🚀 Kom I Gang Nå

1. **Kopier** `example-integration.js` som utgangspunkt
2. **Legg til** `@require` statements i ditt userscript
3. **Initialiser** med `window.DevOpsChatTrace.init('Script Name')`
4. **Test** med `#debug` i URL-en
5. **Nyt** kraftig debugging og overvåking!

---

**💡 Tips**: Kjør `./tracing/validate-tracing.sh` for å teste at alt er satt opp riktig (48 automated checks).
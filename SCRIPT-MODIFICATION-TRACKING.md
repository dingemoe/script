# Script Modification Tracking

Begge userscripts logger nå informasjon om når de ble sist modifisert.

## 📋 Console Output Format

```
🔧 DevOpsChat UI (A) — Vue 3 + Beer CSS Edition v5.1.2
📅 Modified: 17.09.2025 23:45:00 (2min siden)
---
```

```
🤖 DevOpsChat Agent (B) + jQuery (global) v2.1.1  
📅 Modified: 17.09.2025 23:45:00 (2min siden)
---
```

## ⏰ Relative Time Formats

Funksjonen `getRelativeTime()` viser tiden siden siste modifikasjon:

- **Under 1 minutt**: `30s siden`, `45s siden`
- **Under 1 time**: `5min siden`, `30min siden`  
- **Under 1 dag**: `2t siden`, `12t siden`
- **1 dag eller mer**: `3d siden`, `15d siden`

## 🔧 Når du modifiserer scripts

**VIKTIG**: Husk å oppdatere både `@version` og `MODIFIED_DATE` når du endrer kode!

### DevOpsChat-UI-A.user.js:
```javascript
// I metadata:
// @version      5.1.2

// I koden:
const SCRIPT_VERSION = '5.1.2';
const MODIFIED_DATE = new Date('2025-09-17T21:45:00Z'); // ← Oppdater denne!
```

### DevOpsChat-Agent-B.user.js:
```javascript
// I metadata:
// @version      2.1.1

// I koden:
const SCRIPT_VERSION = '2.1.1';
const MODIFIED_DATE = new Date('2025-09-17T21:45:00Z'); // ← Oppdater denne!
```

## 📅 Dato Format

Bruk ISO 8601 format med UTC timezone:
```
'YYYY-MM-DDTHH:MM:SSZ'
'2025-09-17T21:45:00Z'
```

## 🎯 Fordeler

1. **Debugging**: Se umiddelbart hvilken versjon som kjører
2. **Caching issues**: Identifiser om gammel versjon er cachet
3. **Development**: Track når endringer ble gjort
4. **Support**: Enklere å hjelpe brukere med versjonsinformasjon

## 📝 Eksempel Workflow

1. Gjør endringer i script
2. Øk `@version` (f.eks. 5.1.2 → 5.1.3)
3. Oppdater `SCRIPT_VERSION` til samme verdi
4. Sett `MODIFIED_DATE` til nåværende UTC tid
5. Commit og push til GitHub
6. Tampermonkey auto-oppdaterer basert på ny versjon

## 🔍 Console Debugging

I browser console kan du se:
```javascript
// Finn alle DevOpsChat related globals
Object.keys(window).filter(k => k.includes('DEVOPSCHAT'))

// Output: ['__DEVOPSCHAT_UI_A__', '__DEVOPSCHAT_AGENT_B__']
```

Dette hjelper med å verifisere at riktige scripts er lastet og ikke duplikater kjører.
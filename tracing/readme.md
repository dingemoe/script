# DevOpsChat Smart Tracing System 🔧

**Komplett feilsporing, ytelsesovervåking og debugging-system for DevOpsChat userscripts**

Dette er et avansert tracing-system spesielt utviklet for DevOpsChat userscripts som gir deg kraftige verktøy for debugging, feilforebyggelse og systemovervåking. Systemet er optimalisert for Tampermonkey/userscript-miljøer og gir detaljert innsikt i Vue-lasting, CDN-tilgjengelighet, RPC-kommunikasjon og ytelse.

## 🚀 Hurtigstart

### 1. Grunnleggende integrasjon

Legg til disse linjene i ditt userscript:

```javascript
// @require https://raw.githack.com/dingemoe/script/main/tracing/tracing.js
// @require https://raw.githack.com/dingemoe/script/main/tracing/integration.js

// Initialiser tracing
const tracer = window.DevOpsChatTrace.init('Ditt Script Navn', {
    logLevel: 'info',
    debugMode: window.location.hash.includes('debug')
});

// Start logging
tracer.info('🚀 Script startet');
```

### 2. Automatisk debug-panel

Legg til `#debug` i URL-en for å aktivere debug-panelet:
```
https://example.com/#debug
```

### 3. Tastatursnarvei
- **Ctrl+Shift+D**: Toggle debug-panel
- **Ctrl+Shift+T**: Vis systemstatus  
- **Ctrl+Shift+R**: Test RPC-kommunikasjon

## 📊 Funksjoner

### ✅ Automatisk Feilsporing
- **Global error capture**: Fanger alle JavaScript-feil automatisk
- **Vue error handling**: Spesiell håndtering for Vue-komponenter
- **Promise rejection**: Fanger unhandled promise rejections
- **Detaljerte stacktraces**: Med kontekst og metadata

### ⚡ Ytelsesovervåking  
- **Vue loading times**: Måler hvor lang tid Vue bruker på å laste
- **CDN health checks**: Tester tilgjengelighet for alle CDN-ressurser
- **Memory monitoring**: Overvåker minnebruk og potensielle lekkasjer
- **Resource loading**: Sporer lasting av scripts, CSS og andre ressurser
- **DOM mutation tracking**: Overvåker DOM-endringer og aktivitet

### 🌐 Userscript-spesifikk Overvåking
- **Shadow DOM creation**: Sporer opprettelse av isolerte DOM-områder
- **CSS injection**: Overvåker lasting av Beer CSS og andre styles
- **RPC communication**: Logger meldinger mellom UI og Agent scripts
- **jQuery availability**: Sjekker jQuery-tilgjengelighet for Agent scripts

### 🔍 Debugging Interface
- **Real-time debug panel**: Live visning av logger, feil og metrics
- **System health dashboard**: Oversikt over alle komponenter
- **CDN status monitor**: Real-time sjekk av CDN-tilgjengelighet
- **Export functionality**: Last ned alle logs som JSON for detaljert analyse

## 📁 Systemfiler

### Core Files
- **`tracing.js`**: Hovedmodul med all tracing-logikk
- **`integration.js`**: Enkle integrasjonsmetoder for userscripts  
- **`example-integration.js`**: Komplett eksempel på implementering

## 🔧 Detaljert Integrasjon

### For UI Script (A) - Med Vue og Shadow DOM

```javascript
// Initialiser med UI-spesifikke innstillinger
const tracer = window.DevOpsChatTrace.init('DevOpsChat UI (A)', {
    logLevel: 'info',
    monitorVue: true,        // Overvåk Vue-lasting
    monitorRPC: true,        // Overvåk RPC-meldinger  
    monitorCDN: true,        // Sjekk CDN-tilgjengelighet
    autoDebugPanel: true     // Auto-opprett debug panel hvis #debug
});

// Overvåk Vue-lasting med timeout
await tracer.monitorVueLoading(30000);

// Automatisk error wrapping
const safeFunction = tracer.wrapFunction(() => {
    // Din kode her - automatisk error capture
}, 'function_name');

// Timing measurements
tracer.startTimer('vue_loading');
// ... Vue loading code ...
tracer.endTimer('vue_loading');
```

### For Agent Script (B) - Med jQuery og RPC

```javascript
// Initialiser for Agent script
const tracer = window.DevOpsChatTrace.init('DevOpsChat Agent (B)', {
    logLevel: 'debug',
    monitorRPC: true,
    monitorDOM: true
});

// Overvåk jQuery tilgjengelighet
tracer.monitorJQueryLoading();

// Automatisk RPC monitoring
tracer.monitorRPCCommunication();

// Safe async operations
await tracer.safeAsync(async () => {
    // Async operasjoner med automatisk error handling
}, 'async_operation');
```

## 🎯 Praktiske Eksempler

### Debugging Vue Loading Issues

```javascript
// Start tracing Vue loading
tracer.startTimer('vue_total');

try {
    await tracer.monitorVueLoading(30000);
    tracer.info('✅ Vue loaded successfully');
} catch (error) {
    tracer.error('❌ Vue loading failed', {
        timeout: 30000,
        availableCDNs: await tracer.checkCDNHealth()
    });
}

tracer.endTimer('vue_total');
```

### Monitor CDN Health

```javascript
// Sjekk alle CDN-ressurser
const healthReport = await tracer.checkCDNHealth();
tracer.info('🌐 CDN Health Report', healthReport);

// Resultat:
// [
//   { url: 'https://cdn.jsdelivr.net/...', available: true },
//   { url: 'https://unpkg.com/...', available: false },
//   ...
// ]
```

### RPC Communication Testing

```javascript
// Test RPC-forbindelse
tracer.testRPC(); // Sender ping og venter på pong

// Manual RPC logging
window.postMessage({
    kind: 'rpc_call',
    method: 'test',
    data: { message: 'Hello' }
}, '*');
// Automatisk loggført av tracer
```

### Performance Monitoring

```javascript
// Memory usage
const memory = tracer.getMemoryUsage();
// { used: 45, total: 120, limit: 2048 } (MB)

// Performance snapshot  
const perf = tracer.getPerformanceSnapshot();
// Komplett oversikt over timing, memory, resources

// Current state
const state = tracer.debugState();
// Detaljert oversikt over Vue, jQuery, DOM, etc.
```

## 🚨 Error Prevention og Debugging

### Automatisk Error Wrapping

```javascript
// Wrap enkeltfunksjoner
const safeFn = tracer.wrapFunction(riskyFunction, 'risky_operation');

// Wrap async funksjoner  
const safeAsyncFn = tracer.wrapAsyncFunction(asyncFunction, 'async_operation');

// Direkte safe execution
tracer.safe(() => {
    // Kode som kan feile
}, 'operation_name');

await tracer.safeAsync(async () => {
    // Async kode med error handling
}, 'async_operation_name');
```

### Shorthand Logging

```javascript
// Enkle logging-metoder
window.trace.log('Info message', { data: 'value' });
window.trace.error('Error occurred', { context: 'details' });
window.trace.warn('Warning message');
window.trace.debug('Debug info');

// Timing
window.trace.time('operation');
// ... operasjon ...
window.trace.timeEnd('operation');

// Debugging
window.trace.state();  // Vis systemstatus
window.trace.rpc();    // Test RPC forbindelse
```

## 📈 Log Levels og Konfiguration

### Log Levels (prioritetsrekkefølge)
1. **trace**: Detaljert debug-info (kun med debugMode)
2. **debug**: Utvikler-info  
3. **info**: Generell informasjon (standard)
4. **warn**: Advarsler
5. **error**: Feil og exceptions

### Konfigurasjon

```javascript
const tracer = window.DevOpsChatTrace.init('Script Name', {
    logLevel: 'info',           // Minimum log level
    debugMode: false,           // Ekstra debug-info
    autoDebugPanel: true,       // Auto-opprett debug panel
    monitorVue: true,          // Vue-spesifikk overvåking
    monitorRPC: true,          // RPC-kommunikasjon
    monitorCDN: true,          // CDN-tilgjengelighet
    maxLogs: 1000,             // Maksimalt antall logs i minnet
    autoFlush: true,           // Auto-lagre til localStorage
    performance: true,         // Ytelsesovervåking
    errorCapture: true         // Automatisk error capture
});
```

## 💾 Storage og Export

### Automatisk Lagring
- Logs lagres automatisk i `localStorage`
- Oppbevarer siste 100 logs mellom sessions
- Errors lagres separat (siste 50)

### Manual Export
```javascript
// Eksporter alle logs som JSON
tracer.exportLogs();

// Programmatisk tilgang
const logs = tracer.getLogs();        // Alle logs
const errors = tracer.getErrors();    // Kun errors  
const metrics = tracer.getMetrics();  // Ytelsesdata
```

## 🎨 Debug Panel Features

Debug-panelet viser:
- **Session Info**: Session ID, uptime, total logs
- **Error Counter**: Antall feil og advarsler
- **Real-time Logs**: Siste 20 log-entries med farger
- **Quick Actions**: Test RPC, sjekk CDN, eksporter logs
- **System Health**: Vue status, jQuery status, DOM info

### Aktivering
- Automatisk: Legg til `#debug` i URL
- Manual: `tracer.createDebugPanel()`
- Tastatur: `Ctrl+Shift+D`

## 🔗 Sammenligning med Original

**Original system** (Sentry/LogRocket):
- Generell web-utvikling
- Eksterne tjenester
- Krever server setup
- Kompleks konfiguration

**Nytt DevOpsChat system**:
- ✅ Userscript-optimalisert
- ✅ Lokalt/offline-vennlig  
- ✅ Vue/jQuery-spesifikk
- ✅ RPC-kommunikasjon monitoring
- ✅ CDN-tilgjengelighet testing
- ✅ Shadow DOM støtte
- ✅ Ingen eksterne avhengigheter
- ✅ Real-time debug interface
- ✅ Automatisk error prevention

## 📚 Legacy System (Oppbevart)

Anbefalt «CDN-first» oppsett
1) Last Vue + Sentry fra CDN (ingen bundling)
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Vue CDN + Sentry</title>

    <!-- Viktig for lesbare stacktraces: -->
    <meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">
    <meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp">
  </head>
  <body>
    <div id="app"></div>

    <!-- Vue (CDN) -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"
            integrity="sha384-<din-sri-hash>"
            crossorigin="anonymous"></script>

    <!-- Sentry (CDN) -->
    <script src="https://browser.sentry-cdn.com/7.114.0/bundle.tracing.min.js"
            integrity="sha384-<din-sri-hash>"
            crossorigin="anonymous"></script>

    <script>
      // Sett release + miljø tidlig (for å binde sourcemaps):
      window.SENTRY_RELEASE = { id: "myapp@1.0.0" };
      window.SENTRY_ENV = "production";

      // Init Sentry
      Sentry.init({
        dsn: "https://<din-dsn>.ingest.sentry.io/<project-id>",
        integrations: [new Sentry.BrowserTracing()],
        tracesSampleRate: 0.1 // senk i prod
      });

      // Global nettleser-hooks (fanger ting utenfor Vue):
      window.addEventListener("error", (e) => {
        // Unngå duplisering: Sentry fanger mye automatisk, men dette hjelper for kanttilfeller
        if (e.error) Sentry.captureException(e.error);
      });
      window.addEventListener("unhandledrejection", (e) => {
        Sentry.captureException(e.reason || new Error("Unhandled rejection"));
      });

      // Start Vue-app
      const { createApp } = Vue;
      const app = createApp({
        template: `<button @click="boom">Krasj</button>`,
        methods: {
          boom() { throw new Error("Kaboom fra Vue via CDN!"); }
        }
      });

      // Vue global error handler -> sender til Sentry
      app.config.errorHandler = (err, instance, info) => {
        Sentry.captureException(err, { extra: { info } });
      };

      app.mount("#app");
    </script>
  </body>
</html>

Viktige attributter

crossorigin="anonymous" på ALLE <script>-tagger (Vue, din app, tredjepartsbibliotek).

Sørg for at CDN-et serverer CORS-headere for skript og sourcemaps:
Access-Control-Allow-Origin: * (eller din origin).
Uten dette får du ofte bare Script error. uten stacktrace.

2) Source maps når du hoster filer på CDN

For at stacktraces skal peke på koden din (ikke minifiserte filer):

Bygg filene dine (selv om du bruker CDN) slik at .map lastes opp sammen med .js.

Ikke eksponer maps offentlig i prod hvis du ikke vil – last heller opp til Sentry som artifakter.

Eksempel: last opp sourcemaps til Sentry for release myapp@1.0.0:

# 1) Opprett release
curl https://sentry.io/api/0/organizations/<org>/releases/ \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"version":"myapp@1.0.0"}'

# 2) Last opp filer (din-app.min.js og sourcemap)
curl https://sentry.io/api/0/organizations/<org>/releases/myapp@1.0.0/files/ \
  -H "Authorization: Bearer <TOKEN>" \
  -F file=@dist/din-app.min.js \
  -F name="https://cdn.dittdomene.no/din-app.min.js"

curl https://sentry.io/api/0/organizations/<org>/releases/myapp@1.0.0/files/ \
  -H "Authorization: Bearer <TOKEN>" \
  -F file=@dist/din-app.min.js.map \
  -F name="https://cdn.dittdomene.no/din-app.min.js.map"


Pass på at //# sourceMappingURL=din-app.min.js.map ligger i enden av JS-fila eller bruk ~/.sentryclirc/sentry-cli for automatikk.

3) Valgfritt: legg til LogRocket (CDN) for session replay
<script src="https://cdn.lr-ingest.io/LogRocket.min.js" crossorigin="anonymous"></script>
<script>
  window.LogRocket && window.LogRocket.init("org/prosjekt");
  // Koble LogRocket til Sentry for «View session» i error:
  if (window.LogRocket && window.Sentry) {
    window.LogRocket.getSessionURL((url) => {
      Sentry.setContext("LogRocket", { sessionURL: url });
    });
  }
</script>

4) Alternativer (og/eller i tillegg)
Rollbar (CDN)
<script src="https://cdnjs.cloudflare.com/ajax/libs/rollbar.js/2.26.2/rollbar.min.js"
        crossorigin="anonymous"></script>
<script>
  var rollbar = new Rollbar({
    accessToken: "POST_CLIENT_ITEM_ACCESS_TOKEN",
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: { environment: "production" }
  });
</script>

Airbrake (CDN)
<script src="https://js.airbrake.io/v5/airbrake.min.js" crossorigin="anonymous"></script>
<script>
  var airbrake = new airbrakeJs.Client({
    projectId: 123456,
    projectKey: "DIN_KEY",
    environment: "production"
  });
</script>


Du kan sende til flere tjenester samtidig via window.onerror/unhandledrejection + Vue errorHandler, men i praksis holder det å ha Sentry som primær og ev. LogRocket for replay.

5) Sjekkliste for «bra verktøy til å behandle error i CDN»

 crossorigin="anonymous" på scripts + CORS-headere fra CDN → unngå Script error.

 Last opp sourcemaps til Sentry (helst ikke offentlig).

 Release-ID i klient (window.SENTRY_RELEASE) for korrekt map-binding.

 Global hooks: window.onerror, unhandledrejection, Vue errorHandler.

 Rate limiting & sampling (f.eks. tracesSampleRate) så du ikke spammer.

 PII-hygiene: bruk beforeSend i Sentry for å fjerne sensitive felter.

Sentry.init({
  // ...
  beforeSend(event) {
    // f.eks. fjern tokens fra request headers/url
    return event;
  }
});


 CSP: tillat dine error-endepunkter i connect-src.

 SRI (Subresource Integrity) på alle tredjeparts-scripts.

6) Minimal fallback hvis alt annet feiler

Legg inn en liten kø som buffer errors offline og sender dem senere:

<script>
  const q = [];
  function send(err) {
    q.push({
      m: err.message || String(err),
      s: err.stack || null,
      t: Date.now()
    });
    // prøv å flush’e (bytt URL til din endpoint)
    navigator.sendBeacon?.("/error", JSON.stringify(q)) || fetch("/error", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(q),
      keepalive: true
    }).catch(()=>{});
    q.length = 0;
  }

  window.addEventListener("error", e => e.error && send(e.error));
  window.addEventListener("unhandledrejection", e => send(e.reason || new Error("Promise rejection")));
</script>

Kort oppsummert (anbefaling)

Bruk Sentry (CDN-build) som hovedverktøy.

Last opp sourcemaps til en release og bruk crossorigin + CORS på CDN-et.

Valgfritt: LogRocket for replay.
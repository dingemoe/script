Lag en tracing system  som vi kan bruke som støtteverktøy for å løse / få oversikt over erorr: installeres i denne mappen

Hvis du kjører Vue via CDN (ingen bundler), er nøkkelen å få gode stacktraces og sende dem til en feil-tjeneste som funker i rene <script>-oppsett. Her er et slankt, produksjonsvennlig oppsett du kan lime rett inn – med Sentry som primær (best på errors + sourcemaps) og valgfritt LogRocket for session replay. Jeg viser også hvordan du unngår den berømte Script error.-fella.

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
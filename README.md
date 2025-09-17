# DevOpsChat Panel

A lightweight UI panel (dark mode) loaded from a userscript. It renders:
- Tabs: **Rediger** | **Oppsett**
- **Rediger**: virtual DOM console + two worker textareas + inputs
- **Oppsett**: YAML editor for the **active session**
- Left side YAML list shows built-in YAML templates and current session YAML

## Structure

```
src/
  index.js          # module entry: exports initDevPanel(options)
  yamlStore.js      # adapter types & helpers
  ui.css            # minimal CSS (scoped via JS)
schema/
  components-factory.yaml
  workers.yaml
  utils.yaml
  layout.yaml
  init.yaml
examples/
  session-id.example.yaml
```

### Loading from a userscript

Once you push this repo to GitHub, you can load it via jsDelivr CDN:

```js
// In your userscript
const REPO_CDN_BASE = "https://cdn.jsdelivr.net/gh/<user>/<repo>@main";
const mod = await import(REPO_CDN_BASE + "/src/index.js");
mod.initDevPanel({ ...options });
```

The module expects an adapter object you provide that bridges to GM storage.
See the userscript in this chat for a concrete example.

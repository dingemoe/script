// ==UserScript==
// @name         DevOpsChat UI (A) — Vue 3 + Beer CSS Edition
// @namespace    https://github.com/dingemoe/script
// @match        *://*/*
// @version      5.1.3
// @description  Modern reactive UI med Vue 3 og Beer CSS. Sessions + Panel + YAML-tab.
// @author       dingemoe
// @downloadURL  https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-A.user.js
// @updateURL    https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-A.user.js
// @supportURL   https://github.com/dingemoe/script/issues
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource     devopschat-style https://raw.githack.com/dingemoe/script/main/style/style.css
// @resource     beer-css https://cdn.jsdelivr.net/npm/beercss@3.7.11/dist/cdn/beer.min.css
// @resource     material-icons https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200
// @require      https://unpkg.com/vue@3/dist/vue.global.prod.js
// @noframes
// ==/UserScript==

(async () => {
  if (window.top !== window.self) return;
  if (window.__DEVOPSCHAT_UI_A__) return;
  window.__DEVOPSCHAT_UI_A__ = true;

  // Script info and modified time logging
  const SCRIPT_NAME = 'DevOpsChat UI (A) — Vue 3 + Beer CSS Edition';
  const SCRIPT_VERSION = '5.1.3';
  const MODIFIED_DATE = new Date('2025-09-17T22:15:00Z'); // Update this when modifying script
  
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return `${diffSec}s siden`;
    if (diffMin < 60) return `${diffMin}min siden`;
    if (diffHour < 24) return `${diffHour}t siden`;
    return `${diffDay}d siden`;
  };
  
  console.log(`🔧 ${SCRIPT_NAME} v${SCRIPT_VERSION}`);
  console.log(`📅 Modified: ${MODIFIED_DATE.toLocaleDateString('nb-NO')} ${MODIFIED_DATE.toLocaleTimeString('nb-NO')} (${getRelativeTime(MODIFIED_DATE)})`);
  console.log('---');

  // Create Shadow DOM container to isolate styles
  const shadowHost = document.createElement('div');
  shadowHost.id = 'devops-chat-shadow-host';
  shadowHost.style.cssText = 'position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none;';
  document.body.appendChild(shadowHost);
  
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
  
  // Add loading indicator while Vue loads
  const loadingDiv = document.createElement('div');
  loadingDiv.innerHTML = `
    <div style="
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: rgba(0,0,0,0.8); 
      color: white; 
      padding: 10px 15px; 
      border-radius: 5px; 
      font-family: monospace; 
      font-size: 12px;
      pointer-events: auto;
      z-index: 999999;
    ">
      🚀 DevOpsChat Loading...
    </div>
  `;
  shadowRoot.appendChild(loadingDiv);
  
  // Load CSS resources into shadow DOM
  try {
    const beerCSS = GM_getResourceText('beer-css');
    const materialIcons = GM_getResourceText('material-icons');
    const customCSS = GM_getResourceText('devopschat-style');
    
    // Create style elements for shadow DOM
    const beerStyle = document.createElement('style');
    beerStyle.textContent = beerCSS;
    shadowRoot.appendChild(beerStyle);
    
    const iconsStyle = document.createElement('style');
    iconsStyle.textContent = materialIcons;
    shadowRoot.appendChild(iconsStyle);
    
    const customStyle = document.createElement('style');
    customStyle.textContent = customCSS + `
      /* Ensure pointer events work for our UI */
      #devops-chat-app {
        pointer-events: auto;
      }
    `;
    shadowRoot.appendChild(customStyle);
    
    console.log('✅ DevOpsChat: CSS resources loaded in isolated shadow DOM');
  } catch (e) {
    console.warn('⚠️ DevOpsChat: Failed to load CSS resources:', e);
  }

  const GH_USER = 'dingemoe';
  const GH_REPO = 'script';
  const CDN = (...p) => `https://raw.githack.com/${GH_USER}/${GH_REPO}/${p.join('/')}`;

  const pick = async (cands) => {
    for (const u of cands) { try { const r = await fetch(u, { method:'HEAD' }); if (r.ok) return u; } catch {} }
    return cands[0];
  };

  const PANEL_URL = await pick([ CDN('main','src','panel','index.js'), CDN('main','src','index.js'), CDN('main','panel','index.js'),
                                 CDN('master','src','panel','index.js'), CDN('master','src','index.js') ]);
  const CORE_SESSIONS_URL = await pick([ CDN('main','src','core','sessions.js'), CDN('master','src','core','sessions.js') ]);
  const CORE_RPC_URL = await pick([ CDN('main','src','core','rpc.js'), CDN('master','src','core','rpc.js') ]);
  const UTILS_URL = await pick([ CDN('main','src','utils','helpers.js'), CDN('master','src','utils','helpers.js') ]);
  const RENDER_URL = await pick([ CDN('main','render','index.js'), CDN('master','render','index.js') ]);

  const TEMPLATES_BASE = (await (async () => {
    const probe = async (branch) => {
      const u = CDN(branch,'schema','components-factory.yaml');
      try { const r = await fetch(u, { method:'HEAD' }); if (r.ok) return `https://raw.githack.com/${GH_USER}/${GH_REPO}/${branch}`; } catch {}
      return null;
    };
    return (await probe('main')) || (await probe('master')) || `https://raw.githack.com/${GH_USER}/${GH_REPO}/main`;
  })());

  const { initPanel } = await import(PANEL_URL);
  const Sessions = await import(CORE_SESSIONS_URL);
  const RPC = await import(CORE_RPC_URL);
  const { randId, normalizeUrl, addSessionHash, originOf } = await import(UTILS_URL);
  const { VueRenderer } = await import(RENDER_URL);

  // Wait for Vue to be available with comprehensive debugging
  console.log('⏳ Waiting for Vue to be available...');
  console.log('🔍 Initial Vue check:', typeof window.Vue, window.Vue ? 'FOUND' : 'NOT FOUND');
  console.log('🔍 Document readyState:', document.readyState);
  console.log('🔍 Scripts in head:', document.head.querySelectorAll('script[src*="vue"]').length);
  
  let vueWaitCount = 0;
  const maxWaitTime = 30; // Reduce to 3 seconds for faster fallback
  
  while (typeof window.Vue === 'undefined' && vueWaitCount < maxWaitTime) {
    await new Promise(resolve => setTimeout(resolve, 100));
    vueWaitCount++;
    
    // Log progress every 1 second  
    if (vueWaitCount % 10 === 0) {
      console.log(`⏳ Still waiting for Vue... (${vueWaitCount / 10}s) - trying fallback soon`);
    }
  }
  
  // If Vue still not loaded, try immediate fallback
  if (typeof window.Vue === 'undefined') {
    console.warn('⚠️ Vue not loaded via @require after 3 seconds - trying immediate fallback');
    
    // Try multiple fallback strategies
    const fallbackStrategies = [
      'https://unpkg.com/vue@3/dist/vue.global.prod.js',
      'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js',
      'https://cdnjs.cloudflare.com/ajax/libs/vue/3.3.4/vue.global.prod.min.js'
    ];
    
    for (const [index, vueUrl] of fallbackStrategies.entries()) {
      console.log(`🔄 Fallback ${index + 1}: Loading Vue from ${vueUrl}`);
      
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = vueUrl;
          script.onload = () => {
            console.log(`✅ Vue loaded successfully from fallback ${index + 1}`);
            resolve();
          };
          script.onerror = () => {
            console.error(`❌ Fallback ${index + 1} failed`);
            reject(new Error(`Failed to load from ${vueUrl}`));
          };
          document.head.appendChild(script);
        });
        
        // Wait a bit for Vue to initialize
        let fallbackWaitCount = 0;
        while (typeof window.Vue === 'undefined' && fallbackWaitCount < 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          fallbackWaitCount++;
        }
        
        if (typeof window.Vue !== 'undefined') {
          console.log(`✅ Vue available after fallback ${index + 1}!`);
          break;
        }
        
      } catch (e) {
        console.error(`❌ Fallback ${index + 1} error:`, e);
        if (index === fallbackStrategies.length - 1) {
          console.error('❌ All Vue loading strategies failed');
          alert('❌ DevOpsChat: Could not load Vue from any source. Please check your internet connection and refresh the page.');
          return;
        }
      }
    }
  }
  
  if (typeof window.Vue === 'undefined') {
    console.error('❌ Vue loading failed completely after all attempts');
    alert('❌ DevOpsChat: Critical Vue loading failure. Please refresh the page or disable other userscripts that might interfere.');
    return;
  }
  
  console.log('✅ Vue is available:', window.Vue.version || 'version unknown');

  // Vue App Container (inside shadow DOM)
  const appContainer = document.createElement('div');
  appContainer.id = 'devops-chat-app';
  shadowRoot.appendChild(appContainer);

  // Initialize Modular Vue App (with shadow DOM context)
  console.log('🚀 Initializing modular render system in isolated shadow DOM...');
  console.log('🔍 Shadow DOM setup complete, container ready');
  console.log('🔍 Vue version:', window.Vue?.version || 'version unknown');
  
  try {
    const renderController = await VueRenderer.createApp(appContainer, { 
      shadowRoot, 
      vue: window.Vue // Pass Vue instance explicitly for shadow DOM
    });
    
    console.log('✅ Render controller initialized successfully');
    console.log('🔍 App container in DOM:', appContainer.isConnected);
    console.log('🔍 Shadow root children:', shadowRoot.children.length);
    
    // Remove loading indicator
    const loadingDiv = shadowRoot.querySelector('div');
    if (loadingDiv) loadingDiv.remove();
    
    // Helper functions for Vue integration
    const log = (text, type = 'normal') => VueRenderer.addLog(renderController, text, type);
    const setStatus = (text, isConnected = false) => VueRenderer.setStatus(renderController, text, isConnected);

    // Sessions / GM
  const STORAGE_SESSIONS = 'dc_sessions_v1';
  const YAML_KEY = (name) => `yaml:${name}`;
  const SFILE_KEY = (id) => `session-${id}.yaml`;
  let state = { current:null, sessions:{} };

  async function loadSessions(){ try { state.sessions = JSON.parse(await GM.getValue(STORAGE_SESSIONS, '{}')) || {}; } catch { state.sessions = {}; } }
  async function saveSessions(){ await GM.setValue(STORAGE_SESSIONS, JSON.stringify(state.sessions)); }
  async function setActive(name){
    state.current = name;
    await Promise.all(Object.keys(state.sessions).map(async n => {
      const rec = state.sessions[n];
      const txt =
`session:
  name: "${n}"
  url: "${rec.url}"
  id: "${rec.id}"
  active: ${n===name}`;
      await GM.setValue(YAML_KEY(n), txt);
    }));
  }
  async function ensureSessionYamlFile(rec, name){
    const k = SFILE_KEY(rec.id);
    const exists = await GM.getValue(k, null);
    if (exists == null) {
      const def =
`sessionId: "${rec.id}"
name: "${name}"
url: "${rec.url}"
workers:
  - name: "worker1"
    input: ""
    textarea: |
      // js code
  - name: "worker2"
    input: ""
    textarea: |
      // js code`;
      await GM.setValue(k, def);
    }
  }

  // RPC
  const rpc = RPC.createRpcBridge();
  window.addEventListener('message', (ev) => {
    const m = ev.data; if (!m) return;
    if (m.kind === 'hello_from_B') {
      const name = m.session || state.current;
      const ori  = m.origin || ev.origin;
      if (name) {
        const prev = RPC.getBridgeWindow(name) || {};
        RPC.setBridgeWindow(name, { win: prev.win || ev.source, origin: ori, jquery: !!m.jquery });
        if (!state.current) state.current = name;
        setActive(state.current).then(()=> panel?.reloadYaml?.());
        setStatus(`${state.current} — Connected${(!!m.jquery?' ($ ready)':'')}`, true);
        log(`Connected: ${name}  ← ${m.href}`);
      }
    }
    if (m.kind === 'rpc_result') rpc._dispatchResult(m);
  });

  // Init panel
  const panel = await initPanel({
    anchorEl: appContainer,
    adapter: {
      async listSessions(){ return Object.keys(state.sessions).map(n => ({ name:n, id: state.sessions[n].id, url: state.sessions[n].url, active: n===state.current })); },
      async getActiveSession(){ if (!state.current) return null; const r=state.sessions[state.current]; return { name:state.current, id:r.id, url:r.url, active:true }; },
      async setActiveSession(name){ if (!state.sessions[name]) return; await setActive(name); },

      async getSessionYamlByActive(){ if (!state.current) return ''; const r=state.sessions[state.current]; return String(await GM.getValue(SFILE_KEY(r.id), '')); },
      async setSessionYamlByActive(txt){ if (!state.current) return; const r=state.sessions[state.current]; await GM.setValue(SFILE_KEY(r.id), String(txt??'')); },

      async listYamlFiles(){
        // repo + GM
        const repoBase = TEMPLATES_BASE;
        const repoFiles = [
          { key:`repo:schema/components-factory.yaml`, title:'components-factory.yaml', source:'repo', url:`${repoBase}/schema/components-factory.yaml` },
          { key:`repo:schema/workers.yaml`,            title:'workers.yaml',            source:'repo', url:`${repoBase}/schema/workers.yaml` },
          { key:`repo:schema/utils.yaml`,              title:'utils.yaml',              source:'repo', url:`${repoBase}/schema/utils.yaml` },
          { key:`repo:schema/layout.yaml`,             title:'layout.yaml',             source:'repo', url:`${repoBase}/schema/layout.yaml` },
          { key:`repo:schema/init.yaml`,               title:'init.yaml',               source:'repo', url:`${repoBase}/schema/init.yaml` },
        ];
        const keys = await Sessions.listGMKeys();
        const gmYaml = [];
        for (const k of keys) if (/^(yaml:|session-.*\.yaml$)/.test(k)) gmYaml.push({ key:`gm:${k}`, title:k, source:'gm' });
        if (state.current) {
          const r = state.sessions[state.current];
          gmYaml.unshift({ key:`gm:${SFILE_KEY(r.id)}`, title:`session-${r.id}.yaml`, source:'gm' });
        }
        return [...repoFiles, ...gmYaml];
      },
      async getYamlByKey(ref){
        if (ref.startsWith('repo:')) {
          const url = ref.replace(/^repo:/,'');
          const u = `${TEMPLATES_BASE}/${url}`;
          const r = await fetch(u); return await r.text();
        }
        if (ref.startsWith('gm:')) return String(await GM.getValue(ref.slice(3), ''));
        return '';
      },
      async setYamlByKey(ref, txt){
        if (!ref.startsWith('gm:')) return;
        await GM.setValue(ref.slice(3), String(txt??''));
      },

      // RPC helpers
      async getBridge(name){ return RPC.getBridgeWindow(name); },
      async ping(name){ return rpc.call(name,'ping',{}); },
      async getDom(name, selector){ return rpc.call(name,'getDom',{ selector }); },
      async runJS(name, code){ return rpc.call(name,'runJS',{ code }); },
    }
  });

  // Chat commands
  function openSessionWindow(name){
    const rec = state.sessions[name]; if (!rec) { log(`[FEIL] Ukjent session: ${name}`); return null; }
    const norm = normalizeUrl(rec.url);
    const url  = addSessionHash(norm, name);
    const winName = 'dc_' + name;
    const w = window.open(url, winName);
    try { w && w.blur(); } catch {}
    try { window.focus(); } catch {}
    setTimeout(() => { try { window.focus(); } catch {} }, 0);
    RPC.setBridgeWindow(name, { win:w, origin:originOf(norm), jquery:false });
    return w;
  }
  const parseFlags = (s)=>{
    const out = { del:false, newName:null, newUrl:null };
    const pull = (L,S)=>{ let m = s.match(new RegExp(`${L}\\s+"([^"]+)"`)) || s.match(new RegExp(`${S}\\s+"([^"]+)"`)) ||
                               s.match(new RegExp(`${L}\\s+([^\\s]+)`))    || s.match(new RegExp(`${S}\\s+([^\\s]+)`)); return m?m[1]:null; };
    out.del = /\s(--delete|-d)(\s|$)/.test(s);
    out.newName = pull('--navn','-n');
    out.newUrl  = pull('--url','-u');
    return out;
  };

  async function handle(line){
    const cmd=(line||'').trim(); if(!cmd) return; const logLine=(m)=>log(m);
    logLine('> '+cmd);
    if (cmd === '/') {
      const names = Object.keys(state.sessions);
      if (!names.length){ logLine('Ingen sessions. Opprett: /session <navn> <url>'); return; }
      logLine('Sessions:'); names.forEach((n,i)=> logLine(`${i+1}. ${n}${state.current===n?' *':''} — ${state.sessions[n].url}`));
      logLine('Svar med tall (1..N) eller bruk "/<navn>".'); return;
    }
    if (/^\d+$/.test(cmd)) {
      const names = Object.keys(state.sessions); const idx=parseInt(cmd,10)-1; const name=names[idx];
      if (!name){ logLine('[FEIL] Ugyldig valg'); return; }
      await setActive(name); setStatus(`${state.current} — Connecting…`); openSessionWindow(name);
      await ensureSessionYamlFile(state.sessions[name], name); panel?.reloadYaml?.(); return;
    }
    if (cmd.startsWith('/session ')) {
      const rest = cmd.slice(9).trim(); const parts=rest.split(/\s+/);
      const name = parts.shift(); const urlRaw = rest.slice((name||'').length).trim();
      if (!name || !urlRaw){ logLine('[FEIL] Bruk: /session <navn> <url>'); return; }
      const norm = normalizeUrl(urlRaw); const id = state.sessions[name]?.id || randId();
      state.sessions[name] = { url:norm, id }; await GM.setValue('dc_sessions_v1', JSON.stringify(state.sessions));
      await setActive(name); setStatus(`${state.current} — Ready`); await ensureSessionYamlFile(state.sessions[name], name);
      panel?.reloadYaml?.(); logLine(`Session lagret: ${name} → ${norm}`); return;
    }
    if (cmd.startsWith('/') && !cmd.startsWith('/dom') && !cmd.startsWith('/js') && !cmd.startsWith('/open')) {
      const space = cmd.indexOf(' '); const name=(space===-1?cmd.slice(1):cmd.slice(1,space)).trim(); const args=space===-1?'':cmd.slice(space+1);
      if (!name){ logLine('[FEIL] Mangler navn'); return; }
      const flags = (s=>{ const out={del:false,newName:null,newUrl:null}; const pull=(L,S)=>{let m=s.match(new RegExp(`${L}\\s+"([^"]+)"`))||s.match(new RegExp(`${S}\\s+"([^"]+)"`))||s.match(new RegExp(`${L}\\s+([^\\s]+)`))||s.match(new RegExp(`${S}\\s+([^\\s]+)`));return m?m[1]:null;}; out.del=/\s(--delete|-d)(\s|$)/.test(s); out.newName=pull('--navn','-n'); out.newUrl=pull('--url','-u'); return out; })(' '+args+' ');
      if (flags.del){ if(!state.sessions[name]){ logLine('[FEIL] Ukjent session'); return; }
        const id = state.sessions[name].id; await GM.deleteValue(SFILE_KEY(id)); await GM.deleteValue(YAML_KEY(name)); delete state.sessions[name];
        await GM.setValue('dc_sessions_v1', JSON.stringify(state.sessions)); if (state.current===name){ state.current=null; setStatus('No session'); }
        RPC.clearBridge(name); logLine(`Session slettet: ${name}`); panel?.reloadYaml?.(); return; }
      if (flags.newName){ if(!state.sessions[name]){ logLine('[FEIL] Ukjent session'); return; }
        const newName=flags.newName.trim(); if(state.sessions[newName]){ logLine('[FEIL] Finnes allerede: '+newName); return; }
        const rec=state.sessions[name]; state.sessions[newName]={url:rec.url,id:rec.id}; delete state.sessions[name];
        await GM.setValue('dc_sessions_v1', JSON.stringify(state.sessions));
        const cfg=await GM.getValue(YAML_KEY(name), ''); if(cfg){ await GM.setValue(YAML_KEY(newName), cfg); await GM.deleteValue(YAML_KEY(name)); }
        if (state.current===name) state.current=newName; RPC.moveBridge(name,newName);
        await setActive(state.current||newName); await ensureSessionYamlFile(state.sessions[newName], newName);
        panel?.reloadYaml?.(); logLine(`Session navn endret: ${name} → ${newName}`); return; }
      if (flags.newUrl){ if(!state.sessions[name]){ logLine('[FEIL] Ukjent session'); return; }
        const norm=normalizeUrl(flags.newUrl); state.sessions[name].url=norm; await GM.setValue('dc_sessions_v1', JSON.stringify(state.sessions));
        await ensureSessionYamlFile(state.sessions[name], name); if (state.current===name) panel?.reloadYaml?.(); logLine(`Session URL oppdatert: ${name} → ${norm}`); return; }
      if (state.sessions[name]){ await setActive(name); setStatus(`${state.current} — Connecting…`); openSessionWindow(name);
        await ensureSessionYamlFile(state.sessions[name], name); panel?.reloadYaml?.(); return; }
      logLine('[FEIL] Ukjent session.'); return;
    }
    if (!state.current){ logLine('Ingen aktiv session. Bruk "/session <navn> <url>" eller "/" for meny.'); return; }
    if (cmd.startsWith('/dom')){ const sel=cmd.replace(/^\/dom\s*/,'').trim()||'body'; try { const { html }=await rpc.call(state.current,'getDom',{ selector: sel }); logLine(`[DOM ${state.current} ${sel}]`); logLine(html); } catch(e){ logLine(`[FEIL] ${e?.error||e?.message||String(e)}`); } return; }
    if (cmd.startsWith('/js')){ const code=cmd.replace(/^\/js\s*/,''); try { const { result }=await rpc.call(state.current,'runJS',{ code }); logLine(`[JS OK @ ${state.current}] ${result??'(no return)'}`); } catch(e){ logLine(`[FEIL] ${e?.error||e?.message||String(e)}`); } return; }
    if (cmd === '/open'){ setStatus(`${state.current} — Connecting…`); openSessionWindow(state.current); return; }
    logLine('Ukjent kommando.');
  }

  // Vue Event Listeners
  window.addEventListener('devops-command', (e) => {
    handle(e.detail.command);
  });

  window.addEventListener('devops-open-session', (e) => {
    const sessionName = e.detail.session;
    if (!state.sessions[sessionName]) {
      log('Ingen aktiv session.', 'error');
      return;
    }
    setStatus(`${sessionName} — Connecting…`);
    openSessionWindow(sessionName);
  });

  // Initialize
  await loadSessions();
  
  // Update Vue app with initial state
  VueRenderer.updateSessions(renderController, state.sessions);
  VueRenderer.setCurrentSession(renderController, state.current);
  
  if (Object.keys(state.sessions).length) {
    setStatus('No session — press "/"');
  } else { 
    setStatus('No session'); 
    log('Opprett en session: /session <navn> <url>'); 
  }

  } catch (error) {
    console.error('❌ DevOpsChat: Critical initialization error:', error);
    alert(`❌ DevOpsChat failed to initialize: ${error.message}`);
  }
})();
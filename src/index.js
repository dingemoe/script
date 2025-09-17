// src/index.js
// ESM module that renders the dark dev panel with tabs and YAML support.
// Export: initDevPanel(options)
//
// options:
//   anchorEl: HTMLElement (panel anchors to the right of this element with 10px gap)
//   adapter: {
//     listSessions(): Promise<Array<{name:string,id:string,url:string,active:boolean}>>,
//     getActiveSession(): Promise<{name,id,url,active}|null>,
//     setActiveSession(name: string): Promise<void>,
//     getSessionYaml(name: string): Promise<string>,
//     setSessionYaml(name: string, yaml: string): Promise<void>,
//   }
//   templatesBaseUrl: string (CDN base to fetch YAML templates from /schema/*.yaml)
//   onResize?: (rect)=>void
//
export async function initDevPanel({ anchorEl, adapter, templatesBaseUrl }) {
  const css = `
    .dc-dev { position:fixed; z-index:999998; bottom:12px;
      background:#0f0f10; border:1px solid #2a2a2e; border-radius:8px;
      box-shadow:0 6px 20px rgba(0,0,0,.35); color:#fff; font:12px system-ui;
      display:flex; overflow:hidden; }
    .dc-dev .sidebar { width:180px; border-right:1px solid #2a2a2e; padding:8px; overflow:auto; }
    .dc-dev .sidebar h4{ margin:0 0 6px 0; font-size:12px; color:#aaa; }
    .dc-dev .sidebar .file { padding:6px 8px; border-radius:6px; cursor:pointer; }
    .dc-dev .sidebar .file:hover { background:#17171a; }
    .dc-dev .content { display:flex; flex-direction:column; width:380px; }
    .dc-dev .tabs { display:flex; gap:6px; align-items:center; padding:8px; border-bottom:1px solid #2a2a2e; }
    .dc-dev .tab { padding:6px 10px; border-radius:6px; border:1px solid #2a2a2e; background:#0f0f10; color:#e7e7e7; cursor:pointer; }
    .dc-dev .tab.active { border-color:#3a3a40; background:#1a1a1f; }
    .dc-dev .pane { flex:1 1 auto; overflow:hidden; display:none; }
    .dc-dev .pane.active { display:flex; flex-direction:column; }
    .dc-dev textarea, .dc-dev input { background:#111214; color:#e7e7e7; border:1px solid #2a2a2e; border-radius:6px; }
    .dc-dev textarea { padding:8px; box-sizing:border-box; }
    .dc-dev .header { padding:8px; border-bottom:1px solid #2a2a2e; }
    .dc-dev .split { display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:8px; flex:1 1 auto; overflow:hidden; }
    .dc-dev .worker { display:flex; flex-direction:column; height:100%; }
    .dc-dev .worker textarea { flex:1 1 auto; min-height:120px; margin-bottom:6px; }
    .dc-dev .worker input { padding:6px 8px; }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // container
  const dev = document.createElement('div'); dev.className = 'dc-dev';
  const sidebar = document.createElement('div'); sidebar.className = 'sidebar';
  const content = document.createElement('div'); content.className = 'content';

  // Tabs
  const tabs = document.createElement('div'); tabs.className = 'tabs';
  const tabEdit = document.createElement('button'); tabEdit.className='tab active'; tabEdit.textContent='Rediger';
  const tabSetup = document.createElement('button'); tabSetup.className='tab'; tabSetup.textContent='Oppsett';
  tabs.appendChild(tabEdit); tabs.appendChild(tabSetup);

  // Panes
  const paneEdit = document.createElement('div'); paneEdit.className='pane active';
  const header = document.createElement('div'); header.className='header';
  const taHeader = document.createElement('textarea'); taHeader.placeholder='virtual dom console'; taHeader.style.minHeight='78px'; taHeader.style.resize='vertical'; taHeader.style.width='100%';
  header.appendChild(taHeader);
  const split = document.createElement('div'); split.className='split';
  function makeWorker(ph){ const w=document.createElement('div'); w.className='worker';
    const ta=document.createElement('textarea'); ta.placeholder=ph;
    const inp=document.createElement('input'); inp.placeholder='';
    w.appendChild(ta); w.appendChild(inp); return w; }
  split.appendChild(makeWorker('worker 1')); split.appendChild(makeWorker('worker 2'));
  paneEdit.appendChild(header); paneEdit.appendChild(split);

  const paneSetup = document.createElement('div'); paneSetup.className='pane';
  const yamlTA = document.createElement('textarea'); yamlTA.placeholder='YAML-innstillinger for aktiv session'; yamlTA.style.width='100%'; yamlTA.style.height='100%'; yamlTA.disabled=true;
  paneSetup.appendChild(yamlTA);

  content.appendChild(tabs); content.appendChild(paneEdit); content.appendChild(paneSetup);

  // Sidebar YAML list
  const builtinsTitle = document.createElement('h4'); builtinsTitle.textContent='YAML-filer';
  const list = document.createElement('div'); list.id='dc-yaml-list';
  sidebar.appendChild(builtinsTitle); sidebar.appendChild(list);

  dev.appendChild(sidebar); dev.appendChild(content);
  document.body.appendChild(dev);

  // Position next to anchor
  function place() {
    const r = anchorEl.getBoundingClientRect();
    dev.style.right = (window.innerWidth - r.right + 10) + 'px';
    dev.style.bottom = (window.innerHeight - r.bottom + 12) + 'px';
  }
  place(); new ResizeObserver(place).observe(anchorEl);

  // Tabs logic
  function activate(which){
    if (which==='edit'){ tabEdit.classList.add('active'); tabSetup.classList.remove('active'); paneEdit.classList.add('active'); paneSetup.classList.remove('active'); }
    else { tabSetup.classList.add('active'); tabEdit.classList.remove('active'); paneSetup.classList.add('active'); paneEdit.classList.remove('active'); }
  }
  tabEdit.onclick = ()=>activate('edit');
  tabSetup.onclick = ()=>activate('setup');

  // Built-in YAML files list
  const builtinFiles = [
    'components-factory.yaml',
    'workers.yaml',
    'utils.yaml',
    'layout.yaml',
    'init.yaml'
  ];
  function renderList(sessionName, sessionId){
    list.innerHTML='';
    for (const f of builtinFiles) {
      const item = document.createElement('div'); item.className='file'; item.textContent = f;
      item.onclick = async ()=>{
        const res = await fetch(`${templatesBaseUrl}/schema/${f}`); const txt = await res.text();
        yamlTA.value = txt; activate('setup');
      };
      list.appendChild(item);
    }
    if (sessionName && sessionId) {
      const sess = document.createElement('div'); sess.className='file';
      sess.textContent = `session-${sessionId}.yaml`;
      sess.onclick = async ()=>{
        const txt = await adapter.getSessionYaml(sessionName);
        yamlTA.value = txt || ''; activate('setup');
      };
      list.appendChild(sess);
    }
  }

  // Load active session YAML
  async function loadYaml() {
    const active = await adapter.getActiveSession();
    if (!active) { yamlTA.disabled = true; yamlTA.placeholder='Velg en session…'; renderList(null,null); return; }
    yamlTA.disabled = false;
    yamlTA.placeholder = `YAML-innstillinger for "${active.name}"`;
    const txt = await adapter.getSessionYaml(active.name);
    yamlTA.value = txt || '';
    renderList(active.name, active.id);
  }

  // Auto-save YAML edits
  let t=null;
  yamlTA.addEventListener('input', ()=>{
    clearTimeout(t);
    t = setTimeout(async ()=>{
      const active = await adapter.getActiveSession();
      if (!active) return;
      await adapter.setSessionYaml(active.name, yamlTA.value);
    }, 400);
  });

  // initial
  await loadYaml();

  // Expose small API back (optional)
  return { reloadYaml: loadYaml };
}

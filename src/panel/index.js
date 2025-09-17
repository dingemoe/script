export async function initPanel({ anchorEl, adapter }) {
  const css = `
    .dc-dev { position:fixed; z-index:999998; bottom:12px;
      background:#0f0f10; border:1px solid #2a2a2e; border-radius:8px;
      box-shadow:0 6px 20px rgba(0,0,0,.35); color:#fff; font:12px system-ui;
      display:flex; overflow:hidden; }
    .dc-dev .sidebar { width:200px; border-right:1px solid #2a2a2e; padding:8px; overflow:auto; }
    .dc-dev .sidebar h4{ margin:0 0 6px 0; font-size:12px; color:#aaa; }
    .dc-dev .sidebar .file { padding:6px 8px; border-radius:6px; cursor:pointer; }
    .dc-dev .sidebar .file:hover { background:#17171a; }
    .dc-dev .content { display:flex; flex-direction:column; width:420px; }
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
    .dc-dev .yaml-layout { display:flex; height:100%; }
    .dc-dev .yaml-sidebar { width:220px; border-right:1px solid #2a2a2e; padding:8px; overflow:auto; }
    .dc-dev .yaml-editor { flex:1 1 auto; padding:8px; display:flex; }
    .dc-dev .yaml-editor textarea { width:100%; height:100%; resize:none; }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // container
  const dev = document.createElement('div'); dev.className = 'dc-dev';
  const sidebar = document.createElement('div'); sidebar.className = 'sidebar';
  const content = document.createElement('div'); content.className = 'content';
  dev.appendChild(sidebar); dev.appendChild(content); document.body.appendChild(dev);

  // Tabs
  const tabs = document.createElement('div'); tabs.className = 'tabs';
  const tabEdit   = document.createElement('button'); tabEdit.className='tab active'; tabEdit.textContent='Rediger';
  const tabSetup  = document.createElement('button'); tabSetup.className='tab';          tabSetup.textContent='Oppsett';
  const tabYaml   = document.createElement('button'); tabYaml.className='tab';           tabYaml.textContent='YAML';
  tabs.appendChild(tabEdit); tabs.appendChild(tabSetup); tabs.appendChild(tabYaml);

  // Panes
  const paneEdit  = document.createElement('div'); paneEdit.className='pane active';
  const paneSetup = document.createElement('div'); paneSetup.className='pane';
  const paneYaml  = document.createElement('div'); paneYaml.className='pane';

  // Rediger
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

  // Oppsett
  const setupTA = document.createElement('textarea');
  setupTA.placeholder = 'session-<id>.yaml for aktiv session';
  setupTA.style.width = '100%'; setupTA.style.height='100%'; setupTA.disabled = true;
  paneSetup.appendChild(setupTA);

  // YAML tab
  const yamlLayout = document.createElement('div'); yamlLayout.className='yaml-layout';
  const yamlSide = document.createElement('div'); yamlSide.className='yaml-sidebar';
  const yamlListTitle = document.createElement('div'); yamlListTitle.textContent='YAML-filer'; yamlListTitle.style.color='#aaa'; yamlListTitle.style.marginBottom='6px';
  const yamlList = document.createElement('div');
  yamlSide.appendChild(yamlListTitle); yamlSide.appendChild(yamlList);
  const yamlEditorWrap = document.createElement('div'); yamlEditorWrap.className='yaml-editor';
  const yamlTA = document.createElement('textarea'); yamlTA.placeholder='Velg en YAML-fil fra listen…'; yamlTA.disabled = true;
  yamlEditorWrap.appendChild(yamlTA);
  yamlLayout.appendChild(yamlSide); yamlLayout.appendChild(yamlEditorWrap);
  paneYaml.appendChild(yamlLayout);

  content.appendChild(tabs); content.appendChild(paneEdit); content.appendChild(paneSetup); content.appendChild(paneYaml);

  // place panel left of anchor
  function place() {
    const r = anchorEl.getBoundingClientRect();
    dev.style.right = (window.innerWidth - r.right + 10 + 420) + 'px';
    dev.style.bottom = (window.innerHeight - r.bottom + 12) + 'px';
  }
  place(); new ResizeObserver(place).observe(anchorEl);

  // Tab switching
  const activate = (which) => {
    for (const el of [tabEdit,tabSetup,tabYaml]) el.classList.remove('active');
    for (const el of [paneEdit,paneSetup,paneYaml]) el.classList.remove('active');
    if (which==='edit'){ tabEdit.classList.add('active'); paneEdit.classList.add('active'); }
    else if (which==='setup'){ tabSetup.classList.add('active'); paneSetup.classList.add('active'); }
    else { tabYaml.classList.add('active'); paneYaml.classList.add('active'); }
  };
  tabEdit.onclick = ()=>activate('edit');
  tabSetup.onclick = ()=>activate('setup');
  tabYaml.onclick  = ()=>{ activate('yaml'); refreshYamlList(); };

  // Oppsett load/save
  let setupSaveTimer=null;
  async function loadSetupYaml(){
    const active = await adapter.getActiveSession();
    if (!active) { setupTA.disabled = true; setupTA.value=''; setupTA.placeholder='Ingen aktiv session…'; return; }
    setupTA.disabled = false;
    setupTA.placeholder = `session-${active.id}.yaml`;
    setupTA.value = await adapter.getSessionYamlByActive() || '';
  }
  setupTA.addEventListener('input', ()=>{
    clearTimeout(setupSaveTimer);
    setupSaveTimer = setTimeout(async ()=>{ await adapter.setSessionYamlByActive(setupTA.value); }, 400);
  });

  // YAML list/editor
  let currentYamlRef=null; let yamlSaveTimer=null;
  async function refreshYamlList(){
    const files = await adapter.listYamlFiles();
    yamlList.innerHTML='';
    files.forEach((f)=>{
      const item=document.createElement('div'); item.className='file';
      item.textContent=f.title;
      item.onclick = async ()=>{
        currentYamlRef = f.key;
        yamlTA.disabled = f.source !== 'gm';
        yamlTA.value = await adapter.getYamlByKey(currentYamlRef) || '';
      };
      yamlList.appendChild(item);
    });
  }
  yamlTA.addEventListener('input', ()=>{
    clearTimeout(yamlSaveTimer);
    yamlSaveTimer = setTimeout(async ()=>{
      if (!currentYamlRef) return;
      await adapter.setYamlByKey(currentYamlRef, yamlTA.value);
    }, 400);
  });

  await loadSetupYaml();
  return { reloadYaml: async ()=>{ await loadSetupYaml(); if (paneYaml.classList.contains('active')) await refreshYamlList(); } };
}
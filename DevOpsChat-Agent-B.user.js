// ==UserScript==
// @name         DevOpsChat Agent (B) — top window only
// @match        *://*/*
// @version      3
// @description  Agenten kjører kun i toppvindu (ikke iframes) for å unngå duplikater.
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @noframes
// ==/UserScript==

(() => {
  // Ikke kjør i iframes
  if (window.top !== window.self) return;
  // Hindre duplikater
  if (window.__DEVOPSCHAT_AGENT_B__) return; window.__DEVOPSCHAT_AGENT_B__ = true;

  // >>> Lim inn din eksisterende B-agent (RPC, runJS/getDom/ping) her som før. <<<
  // Nedenfor er et kompakt standardoppsett (kan beholdes/erstattes av din fulle versjon):

  const getSessionFromHash = () => {
    try {
      const h = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
      const q = new URLSearchParams(h);
      return q.get('dc_session') || null;
    } catch { return null; }
  };

  const reply = (win, origin, id, ok, payload) => { try { win?.postMessage({ kind:'rpc_result', id, ok, payload }, origin); } catch {} };
  const toHTML = (el) => { const s = el?.outerHTML || document.documentElement.outerHTML; return s.length>4000 ? s.slice(0,4000)+'…[truncated]' : s; };
  const serialize = (val) => { try { if (val==null) return String(val); if (val.jquery) return \`jQuery(\${val.length} elements)\`; if (val.nodeType===1) return toHTML(val); if (typeof val==='function') return \`function \${val.name||'(anonymous)'}\`; if (typeof val==='object') return JSON.stringify(val); return String(val);} catch { return String(val); } };

  function hello(){
    const info = { kind:'hello_from_B', session:getSessionFromHash(), href:location.href, origin:location.origin, jquery:!!window.jQuery };
    try { window.opener?.postMessage(info, '*'); } catch {}
  }
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', hello, {once:true}); else hello();

  window.addEventListener('message', (ev) => {
    const m = ev.data; if (!m || m.kind !== 'rpc_call') return;
    const { id, method, params } = m;
    const send = (ok,payload)=>reply(ev.source, ev.origin, id, ok, payload);

    try {
      if (method==='ping') return send(true, { ok:true, jquery:!!window.jQuery });
      if (method==='getDom') {
        const sel = params?.selector || 'body';
        const el = sel==='document' ? document.documentElement : sel==='body' ? document.body : document.querySelector(sel);
        if (!el) return send(false, { error:`Ingen match for selector: ${sel}` });
        return send(true, { selector: sel, html: toHTML(el) });
      }
      if (method==='runJS') {
        const code = String(params?.code || '');
        let result, error=null;
        try { result = Function('"use strict";return (async()=>{'+code+'})()')(); } catch(e){ error=String(e); }
        if (error) return send(false, { error });
        return Promise.resolve(result).then(
          v => send(true, { result: serialize(v) }),
          e => send(false, { error:String(e) })
        );
      }
      send(false, { error:'Unknown method' });
    } catch(e){ send(false, { error:String(e) }); }
  });
})();

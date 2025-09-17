// ==UserScript==
// @name         DevOpsChat Agent (B) + jQuery (global)
// @namespace    https://github.com/dingemoe/script
// @match        *://*/*
// @version      2.1.5
// @description  Agenten på målsiden som svarer på RPC fra UI (A).
// @author       dingemoe
// @downloadURL  https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-Agent-B.user.js
// @updateURL    https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-Agent-B.user.js
// @supportURL   https://github.com/dingemoe/script/issues
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @noframes
// ==/UserScript==

(() => {
  if (window.top !== window.self) return;
  if (window.__DEVOPSCHAT_AGENT_B__) return;
  window.__DEVOPSCHAT_AGENT_B__ = true;

  // Script info and modified time logging
  const SCRIPT_NAME = 'DevOpsChat Agent (B) + jQuery (global)';
  const SCRIPT_VERSION = '2.1.5';
  const MODIFIED_DATE = new Date('2025-09-17T23:40:58Z'); // ✅ Auto-versioned to v2.1.5 on 2025-09-17 23:40
  
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
  
  console.log(`🤖 ${SCRIPT_NAME} v${SCRIPT_VERSION}`);
  console.log(`📅 Modified: ${MODIFIED_DATE.toLocaleDateString('nb-NO')} ${MODIFIED_DATE.toLocaleTimeString('nb-NO')} (${getRelativeTime(MODIFIED_DATE)})`);
  console.log('---');

  const getSessionFromHash = () => {
    try {
      const h = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
      const q = new URLSearchParams(h);
      return q.get('dc_session') || null;
    } catch { return null; }
  };

  function reply(win, origin, id, ok, payload) {
    try { win?.postMessage({ kind:'rpc_result', id, ok, payload }, origin); } catch {}
  }

  function toHTML(el) {
    const s = el?.outerHTML || document.documentElement.outerHTML;
    return s.length > 4000 ? s.slice(0,4000) + '…[truncated]' : s;
  }

  function serialize(val) {
    try {
      if (val == null) return String(val);
      if (val.jquery) return `jQuery(${val.length} elements)`;
      if (val.nodeType === 1) return toHTML(val);
      if (typeof val.length === 'number' && val.item) return `NodeList(${val.length})`;
      if (typeof val === 'function') return `function ${val.name || '(anonymous)'}`;
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    } catch { return String(val); }
  }

  function postReady() {
    const info = {
      kind: 'hello_from_B',
      session: getSessionFromHash(),
      href: location.href,
      origin: location.origin,
      jquery: !!window.jQuery,
    };
    try { window.opener?.postMessage(info, '*'); } catch {}
  }
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', postReady, { once:true });
  } else postReady();

  window.addEventListener('message', (ev) => {
    const m = ev.data;
    if (!m || m.kind !== 'rpc_call') return;

    const { id, method, params } = m;
    const send = (ok, payload) => reply(ev.source, ev.origin, id, ok, payload);

    try {
      if (method === 'ping') {
        return send(true, { ok: true, jquery: !!window.jQuery });

      } else if (method === 'getDom') {
        const sel = params?.selector || 'body';
        const el = sel === 'document' ? document.documentElement :
                   sel === 'body' ? document.body :
                   document.querySelector(sel);
        if (!el) return send(false, { error:`Ingen match for selector: ${sel}` });
        return send(true, { selector: sel, html: toHTML(el) });

      } else if (method === 'runJS') {
        const code = String(params?.code || '');
        let result, error = null;
        try {
          result = Function('"use strict";return (async()=>{'+ code +'})()')();
        } catch (e) { error = String(e); }
        if (error) return send(false, { error });

        Promise.resolve(result)
          .then((val) => send(true, { result: serialize(val) }))
          .catch((e) => send(false, { error: String(e) }));

      } else {
        send(false, { error:'Unknown method' });
      }
    } catch (e) {
      send(false, { error:String(e) });
    }
  });
})();
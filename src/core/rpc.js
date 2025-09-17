const bridges = new Map(); // name -> { win, origin, jquery }
let callId = 0; const pending = new Map();

export function getBridgeWindow(name){ return bridges.get(name); }
export function setBridgeWindow(name, info){ bridges.set(name, info); }
export function clearBridge(name){ bridges.delete(name); }
export function moveBridge(oldName, newName){ const b=bridges.get(oldName); if (b){ bridges.set(newName,b); bridges.delete(oldName);} }

export function createRpcBridge(){
  function call(name, method, params){
    const b = bridges.get(name);
    return new Promise((resolve, reject)=>{
      if (!b || !b.win || b.win.closed){ reject(new Error(`Session "${name}" er ikke tilkoblet.`)); return; }
      const id = ++callId;
      pending.set(id, { resolve, reject });
      b.win.postMessage({ kind:'rpc_call', id, method, params }, b.origin || '*');
      setTimeout(()=>{ if (pending.has(id)){ pending.delete(id); reject('timeout'); } }, 12000);
    });
  }
  function _dispatchResult(msg){
    const { id, ok, payload } = msg || {};
    if (pending.has(id)){
      const { resolve, reject } = pending.get(id); pending.delete(id);
      ok ? resolve(payload) : reject(payload);
    }
  }
  return { call, _dispatchResult };
}
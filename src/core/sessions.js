export async function listGMKeys(){
  try {
    const db = await new Promise((res, rej) => {
      const r = indexedDB.open('Tampermonkey', 1);
      r.onerror = () => rej(r.error);
      r.onsuccess = () => res(r.result);
      r.onupgradeneeded = () => res(r.result);
    });
    const tx = db.transaction(['values'], 'readonly');
    const store = tx.objectStore('values');
    const keys = await new Promise((res, rej)=>{
      const req = store.getAllKeys();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });
    return keys.map(k=>String(k)).filter(Boolean);
  } catch {
    return [];
  }
}
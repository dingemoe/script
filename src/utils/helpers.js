export const randId = () => 'sesjon-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36);
export const normalizeUrl = (input) => {
  const s = String(input).trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('//')) return 'https:' + s;
  return 'https://' + s;
};
export const addSessionHash = (url, name) => {
  try {
    const u = new URL(url);
    const q = new URLSearchParams(u.hash ? u.hash.slice(1) : '');
    q.set('dc_session', name);
    u.hash = '#' + q.toString();
    return u.toString();
  } catch {
    const glue = url.includes('#') ? '&' : '#';
    return url + glue + 'dc_session=' + encodeURIComponent(name);
  }
};
export const originOf = (url) => {
  try { return new URL(url).origin; }
  catch {
    try { return new URL(normalizeUrl(url)).origin; }
    catch { return '*'; }
  }
};
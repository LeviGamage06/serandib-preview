(() => {
  'use strict';
  const menu = document.querySelector('.menu'), nav = document.getElementById('nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
    });
    nav.querySelectorAll('a').forEach(a => {
      if (a.getAttribute('href') === (location.pathname.split('/').pop() || 'index.html')) a.setAttribute('aria-current', 'page');
      a.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { menu.click(); menu.focus(); }
    });
  }
  const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const money = n => n === null || !Number.isFinite(n) ? 'Quote required' : 'LKR ' + Math.round(n).toLocaleString('en-US');
  // Namespace browser storage by deployment path so other Pages projects cannot collide.
  const prefix = 'serandib:v1:' + new URL('.', location.href).pathname + ':';
  const storage = {
    read(key, fallback = null) { try { const raw = localStorage.getItem(prefix + key); return raw === null ? fallback : JSON.parse(raw); } catch { return fallback; } },
    write(key, value) { try { localStorage.setItem(prefix + key, JSON.stringify(value)); return true; } catch { return false; } },
    remove(key) { try { localStorage.removeItem(prefix + key); return true; } catch { return false; } }
  };
  function normalize(payload) {
    if (!payload || payload.v !== 1 || !Array.isArray(payload.ids) || payload.ids.length < 1 || payload.ids.length > 3) throw new Error('This shortlist link is incomplete or unsupported. Please create a new list.');
    const ids = [...new Set(payload.ids)];
    if (ids.some(id => typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,160}$/.test(id))) throw new Error('Invalid shortlist selections.');
    const s = payload.settings;
    if (!s || typeof s.city !== 'string' || !s.city.trim() || s.city.length > 100 || !Number.isInteger(s.year) || s.year < 2026 || s.year > 2100 || !Number.isInteger(s.guests) || s.guests < 1 || s.guests > 10000 || !Number.isFinite(s.budget) || s.budget <= 0 || s.budget > 1e9 || !Number.isFinite(s.reserve) || s.reserve < 0 || s.reserve > s.budget || typeof s.date !== 'string' || (s.date && (!/^\d{4}-\d{2}-\d{2}$/.test(s.date) || !Number.isFinite(Date.parse(s.date)) || new Date(s.date).toISOString().slice(0,10) !== s.date || Number(s.date.slice(0,4)) !== s.year))) throw new Error('This shortlist contains invalid search details.');
    // Explicit allowlist: never put contact details in share links.
    return {v:1, ids, settings:{city:s.city.trim(), year:s.year, guests:s.guests, budget:s.budget, reserve:s.reserve, date:s.date, allowSpecialDays:s.allowSpecialDays === true, setting:['indoor','outdoor'].includes(s.setting)?s.setting:'', facility:['parking','accommodation','accessible','ceremony'].includes(s.facility)?s.facility:'', sort:s.sort==='name'?'name':'price'}};
  }
  function encode(payload) {
    const bytes = new TextEncoder().encode(JSON.stringify(normalize(payload)));
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(token) {
    try {
      if (typeof token !== 'string' || token.length > 6000 || !/^[A-Za-z0-9_-]+$/.test(token)) throw new Error();
      const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
      return normalize(JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')), c => c.charCodeAt(0)))));
    } catch { throw new Error('This shortlist link is invalid or incomplete. Ask for the full link or create a new shortlist.'); }
  }
  function shortlistURL(payload, page = 'shortlist.html') {
    const url = new URL(page, location.href);
    url.search = ''; url.hash = 'list=' + encode(payload);
    return url.href;
  }
  function readShared() {
    const token = new URLSearchParams(location.hash.slice(1)).get('list');
    return token ? decode(token) : null;
  }
  function savedLists() {
    const rows = storage.read('shortlists', []);
    if (!Array.isArray(rows)) return [];
    return rows.flatMap(row => { try { return [{payload:normalize(row.payload)}]; } catch { return []; } }).slice(0,30);
  }
  function saveShortlist(payload) {
    payload = normalize(payload);
    const token = encode(payload);
    const rows = savedLists().filter(row => encode(row.payload) !== token);
    const persisted = storage.write('shortlists', [{payload}, ...rows].slice(0,30));
    return {url:shortlistURL(payload), persisted};
  }
  window.Serandib = {escape, money, storage, normalize, encode, decode, shortlistURL, readShared, savedLists, saveShortlist,
    directory:async () => window.SerandibVenueData};
})();

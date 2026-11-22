'use strict';
/* MonFit – appli perso de musculation & nutrition (PWA, données stockées sur l'appareil) */

const APP_VERSION = '1.3.0';

/* ================= Utilitaires ================= */
const $ = (s, r = document) => r.querySelector(s);
const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDay = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = parseDay(k); d.setDate(d.getDate() + n); return dayKey(d); };
const num = v => { if (v === '' || v == null) return null; const n = parseFloat(String(v).replace(',', '.').replace(/\s/g, '')); return isFinite(n) ? n : null; };
const r1 = n => Math.round(n * 10) / 10;
const fmt = (n, d = 0) => (n == null || isNaN(n)) ? '–' : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: d });
const fmtNum = n => n == null ? '' : String(n).replace('.', ',');
const fmtDate = (ts, o = { weekday: 'short', day: 'numeric', month: 'short' }) => new Date(ts).toLocaleDateString('fr-FR', o);
const shortDate = ts => new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
const fmtDur = ms => { const m = Math.max(1, Math.round(ms / 60000)); return m >= 60 ? `${Math.floor(m / 60)} h ${pad(m % 60)}` : `${m} min`; };
const mmss = s => `${Math.floor(s / 60)}:${pad(s % 60)}`;
const elapsedStr = start => { const s = Math.max(0, Math.floor((Date.now() - start) / 1000)); const h = Math.floor(s / 3600); return h ? `${h}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}` : mmss(s); };
const weekStart = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const plural = (n, w) => `${n} ${w}${n > 1 ? 's' : ''}`;
const isStandalone = () => window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

const svg = (p, sw = 2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I = {
  home: svg('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  dumbbell: svg('<path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11"/>', 2.2),
  food: svg('<path d="M7 3v7a2 2 0 0 0 4 0V3M9 10v11M17 21V3c-2.2 1.2-3.5 3.8-3.5 7.5 0 2.4 1.2 3.5 3.5 3.5"/>'),
  chart: svg('<path d="M5 20v-8M11 20V5M17 20v-5M3 20h18"/>'),
  settings: svg('<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>'),
  back: svg('<path d="M15 18l-6-6 6-6"/>', 2.5),
  chev: `<span class="chev">${svg('<path d="M9 6l6 6-6 6"/>', 2.5).replace('<svg', '<svg width="16" height="16"')}</span>`,
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 3),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 2.5).replace('<svg', '<svg width="18" height="18"'),
  edit: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
  trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  up: svg('<path d="M12 19V5M6 11l6-6 6 6"/>'),
  down: svg('<path d="M12 5v14M6 13l6 6 6-6"/>'),
  dots: svg('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>', 2.4),
  left: svg('<path d="M15 18l-6-6 6-6"/>', 2.5),
  right: svg('<path d="M9 6l6 6-6 6"/>', 2.5),
};

/* ================= Constantes ================= */
const MEALS = [['breakfast', 'Petit-déjeuner'], ['lunch', 'Déjeuner'], ['dinner', 'Dîner'], ['snack', 'Collations']];
const mealLabel = m => (MEALS.find(x => x[0] === m) || [, 'Repas'])[1];
const GROUPS = ['Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Quadriceps', 'Ischios', 'Fessiers', 'Mollets', 'Abdos', 'Cardio', 'Autre'];
const TYPES = {
  w: { label: 'Charge × répétitions', f: [['a', 'kg'], ['b', 'reps']] },
  bw: { label: 'Poids du corps (+ lest)', f: [['a', '+kg'], ['b', 'reps']] },
  time: { label: 'Durée (secondes)', f: [['b', 'sec']] },
  cardio: { label: 'Cardio (distance + durée)', f: [['a', 'km'], ['b', 'min']] },
};
const GOALS = [['lean', 'S\'affiner (léger déficit, −15 %)', 0.85], ['maintain', 'Maintenir mon poids', 1], ['gain', 'Prendre du muscle (léger surplus, +10 %)', 1.1]];
const ACTIVITY = [[1.2, 'Sédentaire (peu ou pas de sport)'], [1.375, 'Légèrement actif (1-3 séances/sem.)'], [1.55, 'Actif (3-5 séances/sem.)'], [1.725, 'Très actif (6-7 séances/sem.)'], [1.9, 'Extrêmement actif (travail physique + sport)']];
const BODY_FIELDS = [['weight', 'Poids', 'kg'], ['bodyfat', 'Masse grasse', '%'], ['waist', 'Tour de taille', 'cm'], ['chest', 'Poitrine', 'cm'], ['arm', 'Bras', 'cm'], ['thigh', 'Cuisse', 'cm'], ['hips', 'Hanches', 'cm']];

/* ================= Stockage (IndexedDB, repli localStorage) ================= */
const store = {
  db: null, mode: 'ls',
  init() {
    return new Promise(res => {
      try {
        const r = indexedDB.open('monfit', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => { this.db = r.result; this.mode = 'idb'; res(); };
        r.onerror = () => res();
      } catch (e) { res(); }
    });
  },
  get(k) {
    if (this.mode !== 'idb') { const v = localStorage.getItem('monfit:' + k); return Promise.resolve(v ? JSON.parse(v) : undefined); }
    return new Promise((res, rej) => { const q = this.db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
  },
  set(k, v) {
    if (this.mode !== 'idb') { localStorage.setItem('monfit:' + k, JSON.stringify(v)); return Promise.resolve(); }
    return new Promise((res, rej) => { const tx = this.db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
  },
};

function defaults() {
  return {
    version: 1,
    settings: { rest: 90, hideInstall: false, lastExport: null,
      profile: { sex: 'f', age: 50, height: null, activity: 1.55, goal: 'lean' },
      goals: { auto: true, kcal: 2400, p: 140, c: 280, f: 75 } },
    customExercises: [], routines: [], workouts: [], active: null,
    foods: {}, recentFoods: [], meals: {}, body: [],
  };
}
function migrate(s) {
  const d = defaults();
  s = (s && typeof s === 'object') ? s : {};
  const out = { ...d, ...s };
  const ss = s.settings || {};
  out.settings = { ...d.settings, ...ss, profile: { ...d.settings.profile, ...(ss.profile || {}) }, goals: { ...d.settings.goals, ...(ss.goals || {}) } };
  for (const k of ['customExercises', 'routines', 'workouts', 'recentFoods', 'body']) if (!Array.isArray(out[k])) out[k] = [];
  for (const k of ['foods', 'meals']) if (!out[k] || typeof out[k] !== 'object' || Array.isArray(out[k])) out[k] = {};
  out.workouts.sort((a, b) => b.start - a.start);
  return out;
}

let state = defaults();
let saveTimer = null;
function save() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 250); }
async function saveNow() {
  clearTimeout(saveTimer);
  try { await store.set('state', state); } catch (e) { console.error(e); toast('⚠️ Erreur de sauvegarde'); }
}

/* ================= Données : exercices & séances ================= */
let _exCache = null;
function ex(id) {
  if (!_exCache) { _exCache = {}; for (const e of window.EXERCISES) _exCache[e.id] = e; for (const e of state.customExercises) _exCache[e.id] = e; }
  return _exCache[id] || { id, name: 'Exercice supprimé', group: 'Autre', type: 'w' };
}
const invalidateEx = () => { _exCache = null; };
const guide = id => (window.GUIDES || {})[id];
const thumb = id => guide(id) ? `<img class="thumb sprite" src="img/ex/${id}.jpg" alt="" loading="lazy">` : `<span class="thumb ph">${I.dumbbell}</span>`;
const demoHTML = id => guide(id) ? `<div class="demo" data-act="toggleDemo" role="img" aria-label="Démonstration de l'exercice"><img class="a" src="img/ex/${id}.jpg" alt=""><img class="b" src="img/ex/${id}.jpg" alt=""><span class="badge">❚❚</span></div>` : '';
function guideHTML(id) {
  const g = guide(id); if (!g) return '';
  return `<div class="card"><h2>Comment faire</h2>
    <div class="small" style="margin-bottom:10px"><b>Muscles :</b> ${g.main.join(', ')}${g.also.length ? ` <span class="muted">(+ ${g.also.join(', ')})</span>` : ''}</div>
    <ol class="steps">${g.steps.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
    <div class="avoid"><b>À éviter :</b> ${esc(g.avoid)}</div></div>`;
}
const allExercises = () => [...window.EXERCISES, ...state.customExercises].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

function setScore(type, s) {
  const a = s.a || 0, b = s.b || 0;
  if (type === 'w') return (a > 0 && b > 0) ? (b === 1 ? a : a * (1 + b / 30)) : 0; // 1RM estimé (Epley)
  if (type === 'cardio') return a;
  return b; // bw : reps, time : secondes
}
const sessionBest = (type, sets) => sets.reduce((m, s) => Math.max(m, setScore(type, s) || 0), 0);
const metricLabel = t => ({ w: '1RM estimé (kg)', bw: 'Répétitions max', time: 'Durée max (s)', cardio: 'Distance (km)' }[t]);
const fmtBest = (t, v) => t === 'w' ? `${fmt(v, 1)} kg` : t === 'bw' ? `${fmt(v)} reps` : t === 'time' ? `${fmt(v)} s` : `${fmt(v, 2)} km`;

function exHistory(exId) { // du plus récent au plus ancien
  const out = [];
  for (const w of state.workouts) for (const e of w.exercises) if (e.exId === exId) out.push({ w, sets: e.sets });
  return out;
}
const lastSets = exId => { const h = exHistory(exId); return h.length ? h[0].sets : []; };
const bestEver = exId => { const t = ex(exId).type; return exHistory(exId).reduce((m, h) => Math.max(m, sessionBest(t, h.sets)), 0); };
function volume(w) {
  let v = 0;
  for (const e of w.exercises) if (ex(e.exId).type === 'w') for (const s of e.sets) v += (s.a || 0) * (s.b || 0);
  return v;
}
const setCount = w => w.exercises.reduce((n, e) => n + e.sets.length, 0);
function fmtSet(type, s) {
  if (!s) return '–';
  if (type === 'w') return `${fmt(s.a, 2)} kg × ${fmt(s.b)}`;
  if (type === 'bw') return (s.a ? `+${fmt(s.a, 2)} kg × ` : '') + `${fmt(s.b)} reps`;
  if (type === 'time') return `${fmt(s.b)} s`;
  return `${fmt(s.a, 2)} km · ${fmt(s.b)} min`;
}
function fmtPrev(type, s) {
  if (!s) return '–';
  if (type === 'w') return `${fmt(s.a, 2)}×${fmt(s.b)}`;
  if (type === 'bw') return s.a ? `+${fmt(s.a, 2)}×${fmt(s.b)}` : `${fmt(s.b)}`;
  if (type === 'time') return `${fmt(s.b)} s`;
  return `${fmt(s.a, 2)} km`;
}
function newExEntry(exId, n, target, rest, note) {
  const count = n || lastSets(exId).length || 3;
  return { exId, target: target || '', rest: rest || null, note: note || '', sets: Array.from({ length: count }, () => ({ a: null, b: null, done: false })) };
}

/* ================= Données : nutrition & corps ================= */
const dayEntries = k => state.meals[k] || [];
const sumEntries = list => list.reduce((t, e) => ({ kcal: t.kcal + (e.kcal || 0), p: t.p + (e.p || 0), c: t.c + (e.c || 0), f: t.f + (e.f || 0) }), { kcal: 0, p: 0, c: 0, f: 0 });
const scale = (food, g) => { const k = (g || 0) / 100; return { kcal: food.kcal * k, p: food.p * k, c: food.c * k, f: food.f * k }; };
const bodySorted = () => [...state.body].sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
const series = field => bodySorted().filter(b => b[field] != null).map(b => ({ x: parseDay(b.date).getTime(), y: b[field] }));
const currentWeight = () => { const s = series('weight'); return s.length ? s[s.length - 1].y : null; };
function computeGoals() {
  const pr = state.settings.profile, w = currentWeight();
  if (!w || !pr.height || !pr.age) return null;
  const bmr = 10 * w + 6.25 * pr.height - 5 * pr.age + (pr.sex === 'f' ? -161 : 5); // Mifflin-St Jeor
  const tdee = bmr * pr.activity, gf = (GOALS.find(g => g[0] === pr.goal) || GOALS[1])[2];
  const kcal = Math.round(tdee * gf / 10) * 10;
  const p = Math.round(1.6 * w), f = Math.round(0.9 * w);
  const c = Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4));
  return { kcal, p, c, f, bmr: Math.round(bmr), tdee: Math.round(tdee / 10) * 10 };
}
function goals() { const g = state.settings.goals; if (g.auto) { const c = computeGoals(); if (c) return c; } return g; }

/* ================= Open Food Facts ================= */
const OFF_FIELDS = 'code,product_name,product_name_fr,generic_name_fr,brands,nutriments,serving_quantity';
function offToFood(p) {
  if (!p) return null;
  const n = p.nutriments || {};
  let kcal = n['energy-kcal_100g'];
  if (kcal == null && n['energy_100g'] != null) kcal = n['energy_100g'] / 4.184;
  if (kcal == null || isNaN(+kcal)) return null;
  const name = String(p.product_name_fr || p.product_name || p.generic_name_fr || '').trim();
  if (!name || !p.code) return null;
  const brand = Array.isArray(p.brands) ? (p.brands[0] || '') : String(p.brands || '').split(',')[0].trim();
  return { id: 'off:' + p.code, code: String(p.code), name, brand, kcal: +kcal, p: +(n.proteins_100g || 0), c: +(n.carbohydrates_100g || 0), f: +(n.fat_100g || 0), serving: num(p.serving_quantity) || null, source: 'off' };
}
async function fetchJSON(url, ms = 12000) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), ms);
  try { const r = await fetch(url, { signal: ctrl.signal }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); }
  finally { clearTimeout(t); }
}
async function offSearch(q) {
  const urls = [
    `https://search.openfoodfacts.org/search?q=${encodeURIComponent(q)}&langs=fr&page_size=30&fields=${OFF_FIELDS}`,
    `https://fr.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=30&fields=${OFF_FIELDS}`,
  ];
  let lastErr;
  for (const u of urls) {
    try {
      const d = await fetchJSON(u);
      const list = (d.hits || d.products || []).map(offToFood).filter(Boolean);
      const seen = new Set();
      return list.filter(f => !seen.has(f.id) && seen.add(f.id));
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Recherche impossible');
}
async function offBarcode(code) {
  const d = await fetchJSON(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${OFF_FIELDS}`);
  if (!d || d.status !== 1) return null;
  return offToFood({ ...d.product, code: d.product?.code || code });
}

/* ================= Interface : feuilles, toasts, son ================= */
let sheetEl = null, sheetBg = null, sheetOnClose = null;
function openSheet(html, opts = {}) {
  closeSheet(true);
  sheetBg = document.createElement('div'); sheetBg.className = 'sheet-bg'; sheetBg.addEventListener('click', () => closeSheet());
  sheetEl = document.createElement('div'); sheetEl.className = 'sheet'; sheetEl.setAttribute('role', 'dialog');
  sheetEl.innerHTML = '<div class="grabber"></div>' + html;
  document.body.append(sheetBg, sheetEl);
  requestAnimationFrame(() => requestAnimationFrame(() => { sheetBg && sheetBg.classList.add('show'); sheetEl && sheetEl.classList.add('show'); }));
  sheetOnClose = opts.onClose || null;
  return sheetEl;
}
function closeSheet(instant) {
  if (!sheetEl) return;
  const a = sheetEl, b = sheetBg, cb = sheetOnClose;
  sheetEl = sheetBg = sheetOnClose = null;
  if (instant) { a.remove(); b.remove(); }
  else { a.classList.remove('show'); b.classList.remove('show'); setTimeout(() => { a.remove(); b.remove(); }, 260); }
  if (cb) cb();
}
let confirmResolve = null;
function confirmBox(msg, ok = 'Confirmer', danger = true) {
  return new Promise(res => {
    let done = false;
    const finish = v => { if (!done) { done = true; res(v); } };
    openSheet(`<h3 style="display:block;line-height:1.35">${esc(msg)}</h3><div class="btns"><button class="btn" data-act="confirmNo">Annuler</button><button class="btn ${danger ? 'danger' : 'primary'}" data-act="confirmYes">${esc(ok)}</button></div>`, { onClose: () => finish(false) });
    confirmResolve = v => { finish(v); closeSheet(); };
  });
}
let toastTimer = null;
function toast(msg, ms = 2200) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.append(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}
let actx = null;
function unlockAudio() {
  try {
    if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (C) actx = new C(); }
    if (actx && actx.state === 'suspended') actx.resume();
  } catch (e) { /* rien */ }
}
function beep() {
  if (!actx) return;
  try {
    const t = actx.currentTime;
    [0, 0.2, 0.4].forEach((d, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = i === 2 ? 1320 : 880; o.connect(g); g.connect(actx.destination);
      g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.35, t + d + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.16);
      o.start(t + d); o.stop(t + d + 0.18);
    });
  } catch (e) { /* rien */ }
}

/* ================= Graphiques SVG ================= */
let chartId = 0;
function lineChart(pts, { dec = 1 } = {}) {
  if (pts.length < 2) return `<div class="empty small">${pts.length ? 'Encore une valeur et la courbe apparaîtra.' : 'Pas encore de données.'}</div>`;
  const W = 340, H = 170, pl = 38, pr = 12, pt = 12, pb = 24, id = 'lg' + (++chartId);
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  let x0 = Math.min(...xs), x1 = Math.max(...xs); if (x1 === x0) { x0 -= 864e5; x1 += 864e5; }
  let y0 = Math.min(...ys), y1 = Math.max(...ys); const padY = (y1 - y0) * 0.15 || Math.max(1, Math.abs(y1) * 0.03); y0 -= padY; y1 += padY;
  const X = x => pl + (x - x0) / (x1 - x0) * (W - pl - pr), Y = y => pt + (1 - (y - y0) / (y1 - y0)) * (H - pt - pb);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
  const area = `${d}L${X(pts[pts.length - 1].x).toFixed(1)},${H - pb}L${X(pts[0].x).toFixed(1)},${H - pb}Z`;
  const last = pts[pts.length - 1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.28"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></linearGradient></defs>
    ${[0, 0.5, 1].map(f => { const v = y0 + (y1 - y0) * f; return `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text x="${pl - 6}" y="${(Y(v) + 3).toFixed(1)}" text-anchor="end">${fmt(v, dec)}</text>`; }).join('')}
    <path d="${area}" style="fill:url(#${id})"/>
    <path d="${d}" style="fill:none;stroke:var(--accent);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round"/>
    ${pts.length <= 40 ? pts.map(p => `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="2.5" style="fill:var(--accent)"/>`).join('') : ''}
    <circle cx="${X(last.x).toFixed(1)}" cy="${Y(last.y).toFixed(1)}" r="5" style="fill:var(--accent);stroke:var(--card);stroke-width:2"/>
    <text x="${pl}" y="${H - 6}">${shortDate(x0)}</text><text x="${W - pr}" y="${H - 6}" text-anchor="end">${shortDate(x1)}</text>
  </svg>`;
}
function barChart(bars, { dec = 0 } = {}) {
  const W = 340, H = 150, pb = 20, pt = 16, max = Math.max(1, ...bars.map(b => b.v)), bw = W / bars.length;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${bars.map((b, i) => {
    const h = (H - pb - pt) * b.v / max, x = i * bw + bw * 0.18, w = bw * 0.64;
    return `<rect x="${x.toFixed(1)}" y="${(H - pb - h).toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(h, 0).toFixed(1)}" rx="4" style="fill:var(--accent);opacity:${b.hl ? 1 : .45}"/>`
      + (b.v ? `<text x="${(x + w / 2).toFixed(1)}" y="${(H - pb - h - 4).toFixed(1)}" text-anchor="middle">${fmt(b.v, dec)}</text>` : '')
      + (b.label ? `<text x="${(x + w / 2).toFixed(1)}" y="${H - 5}" text-anchor="middle">${b.label}</text>` : '');
  }).join('')}<line class="grid" x1="0" x2="${W}" y1="${H - pb}" y2="${H - pb}"/></svg>`;
}
function ring(val, goal) {
  const r = 50, C = 2 * Math.PI * r, pct = Math.min(1, goal ? val / goal : 0), over = goal && val > goal;
  return `<div class="ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${r}" style="fill:none;stroke:var(--input);stroke-width:12"/>${pct > 0 ? `<circle cx="60" cy="60" r="${r}" style="fill:none;stroke:${over ? 'var(--danger)' : 'var(--accent)'};stroke-width:12;stroke-linecap:round" stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}"/>` : ''}</svg>
    <div class="lbl"><b>${fmt(Math.abs(goal - val))}</b><small>${over ? 'kcal en trop' : 'kcal restantes'}</small></div></div>`;
}
const macroBar = (lbl, v, g, color) => `<div class="macro"><div class="row between"><span>${lbl}</span><span class="muted">${fmt(v)} / ${fmt(g)} g</span></div><div class="bar"><i style="width:${Math.min(100, g ? v / g * 100 : 0)}%;background:${color}"></i></div></div>`;
const nutriSummary = (t, g) => `<div class="ring-wrap">${ring(t.kcal, g.kcal)}<div class="macros"><div class="small muted">${fmt(t.kcal)} / ${fmt(g.kcal)} kcal</div>${macroBar('Protéines', t.p, g.p, 'var(--p)')}${macroBar('Glucides', t.c, g.c, 'var(--c)')}${macroBar('Lipides', t.f, g.f, 'var(--f)')}</div></div>`;
const macroLine = m => `<span class="p">P ${fmt(m.p, 1)}</span> · <span class="c">G ${fmt(m.c, 1)}</span> · <span class="f">L ${fmt(m.f, 1)}</span>`;

/* ================= Navigation ================= */
const nav = { tab: 'home', stack: [], rootScroll: 0 };
const TABS = [['home', 'Accueil', I.home], ['train', 'Séances', I.dumbbell], ['food', 'Nutrition', I.food], ['progress', 'Progrès', I.chart], ['more', 'Réglages', I.settings]];
const cur = () => nav.stack.length ? nav.stack[nav.stack.length - 1] : { name: nav.tab, params: {} };
function saveScroll() { if (nav.stack.length) nav.stack[nav.stack.length - 1].scroll = window.scrollY; else nav.rootScroll = window.scrollY; }
function go(name, params = {}) { saveScroll(); nav.stack.push({ name, params }); render(); window.scrollTo(0, 0); }
function back() { nav.stack.pop(); render(); window.scrollTo(0, (nav.stack.length ? nav.stack[nav.stack.length - 1].scroll : nav.rootScroll) || 0); }
function setTab(t) {
  if (nav.tab === t && !nav.stack.length) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  nav.tab = t; nav.stack = []; nav.rootScroll = 0; render(); window.scrollTo(0, 0);
}
function render(keepScroll) {
  const c = cur();
  const v = (V[c.name] || V.home)(c.params || {});
  const tb = $('#topbar');
  tb.className = 'topbar' + (v.large && !nav.stack.length ? ' large' : '');
  tb.innerHTML = (nav.stack.length ? `<button class="back" data-act="back">${I.back}<span>Retour</span></button>` : '') + `<h1>${esc(v.title)}</h1>` + (v.action || '');
  const y = window.scrollY;
  $('#main').innerHTML = v.body;
  if (keepScroll) window.scrollTo(0, y);
  $('#tabbar').innerHTML = TABS.map(([k, l, ic]) => `<button class="${nav.tab === k ? 'on' : ''}" data-act="tab" data-t="${k}">${ic}<span>${l}</span></button>`).join('');
  renderRest();
}

/* ================= Minuteur de repos ================= */
function startRest(sec) {
  if (!state.active) return;
  sec = sec || state.settings.rest;
  if (!sec) return;
  state.active.rest = { end: Date.now() + sec * 1000, total: sec };
}
function renderRest() {
  const slot = $('#restbar-slot');
  const r = state.active && state.active.rest;
  if (!r) { slot.innerHTML = ''; return; }
  const ms = r.end - Date.now();
  if (ms <= 0) { state.active.rest = null; save(); slot.innerHTML = ''; beep(); toast('⏱️ Repos terminé, à toi !'); return; }
  if (!$('#rest-t')) slot.innerHTML = `<div class="restbar"><span class="t" id="rest-t"></span><div class="prog"><i id="rest-p"></i></div><button data-act="restAdd" data-v="-15">−15</button><button data-act="restAdd" data-v="15">+15</button><button data-act="restSkip">Passer</button></div>`;
  $('#rest-t').textContent = mmss(Math.ceil(ms / 1000));
  $('#rest-p').style.width = Math.max(0, Math.min(100, 100 - ms / (r.total * 10))) + '%';
}
function tick() {
  if (!state.active) return;
  document.querySelectorAll('.js-elapsed').forEach(el => { el.textContent = elapsedStr(state.active.start); });
  renderRest();
}

/* ================= Programmes de coachs ================= */
const repUnit = t => t === 'time' ? ' s' : t === 'cardio' ? '' : ' reps';
const setsLabel = (a, b) => a === b ? `${a}` : `${a}-${b}`;
function findSession(key) {
  const [pid, sid] = String(key).split(':');
  const p = (window.PROGRAMS || []).find(x => x.id === pid), s = p && p.sessions.find(x => x.id === sid);
  return s ? { p, s } : null;
}
const sessionMinutes = s => Math.max(15, Math.round((8 + s.items.reduce((m, it) => m + it[1] * (it[4] + 45) / 60, 0)) / 5) * 5);
const itemNote = ([, a, b, , , note]) => [note, a !== b ? `Jusqu'à ${b} séries quand tu récupères bien.` : ''].filter(Boolean).join(' ');
const kindBadge = k => `<span class="kind ${k}">${k === 'upper' ? 'UPPER' : 'LOWER'}</span>`;

/* ================= Vues ================= */
const V = {};
const activeBanner = () => state.active ? `<button class="active-banner" data-act="openActive"><span class="dot"></span><span class="grow"><b>Séance en cours</b><br><span class="small">${esc(state.active.name)} · <span class="js-elapsed">${elapsedStr(state.active.start)}</span></span></span>${I.right}</button>` : '';

V.home = () => {
  const today = dayKey(), g = goals(), t = sumEntries(dayEntries(today));
  const ws = weekStart(new Date());
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(ws); d.setDate(d.getDate() + i); return dayKey(d); });
  const wDays = new Set(state.workouts.map(w => dayKey(new Date(w.start))));
  const nWeek = state.workouts.filter(w => w.start >= ws.getTime()).length;
  const last = state.workouts[0];
  const wts = series('weight'), lw = wts[wts.length - 1];
  const ref = lw ? [...wts].reverse().find(p => p.x <= lw.x - 25 * 864e5) : null;
  const delta = lw && ref ? lw.y - ref.y : null;
  const showInstall = !isStandalone() && !state.settings.hideInstall;
  return {
    title: 'Aujourd\'hui', large: true,
    body: `
      <div class="muted" style="margin:-4px 4px 14px;text-transform:capitalize">${fmtDate(Date.now(), { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      ${showInstall ? `<div class="card" style="background:var(--accent-weak)"><div class="row between"><b>📲 Installe MonFit sur ton iPhone</b><button class="icon-btn" data-act="hideInstall" aria-label="Masquer">✕</button></div><div class="note">Dans Safari : bouton <b>Partager</b> ⬆️ puis <b>« Sur l'écran d'accueil »</b>. Elle s'ouvrira en plein écran comme une vraie appli.</div></div>` : ''}
      ${activeBanner()}
      <div class="card"><h2>Nutrition <button class="link" data-act="tab" data-t="food">Journal</button></h2>${nutriSummary(t, g)}</div>
      <div class="card">
        <h2>Entraînement <span class="pill accent">${plural(nWeek, 'séance')} cette semaine</span></h2>
        <div class="week-dots">${days.map((k, i) => `<div><i class="${wDays.has(k) ? 'on' : ''} ${k === today ? 'today' : ''}">${wDays.has(k) ? I.check : ''}</i>${'LMMJVSD'[i]}</div>`).join('')}</div>
        ${state.active ? '' : `<button class="btn primary block" data-act="startPicker">Démarrer une séance</button>`}
        ${last ? `<button class="item" style="padding:14px 0 0" data-act="openWorkout" data-id="${last.id}"><div class="grow"><div class="sub">Dernière séance</div><div class="title">${esc(last.name)}</div><div class="sub">${fmtDate(last.start)} · ${fmtDur(last.end - last.start)} · ${plural(setCount(last), 'série')}</div></div>${I.chev}</button>` : ''}
      </div>
      <div class="card">
        <h2>Poids <button class="link" data-act="addBody">+ Noter</button></h2>
        ${lw ? `<div class="row" style="align-items:baseline"><span class="big">${fmt(lw.y, 1)} kg</span>${delta != null ? `<span class="small muted">${delta > 0 ? '+' : ''}${fmt(delta, 1)} kg en ~1 mois</span>` : ''}</div><div class="small muted">Pesée du ${shortDate(lw.x)}</div>` : '<div class="muted">Aucune pesée pour l\'instant.</div>'}
      </div>`,
  };
};

V.train = () => ({
  title: 'Séances', large: true,
  action: `<button class="top-action" data-act="go" data-v="history">Historique</button>`,
  body: `
    ${activeBanner()}
    ${state.active ? '' : `<button class="btn primary block" data-act="startEmpty" style="margin-bottom:6px">${I.plus} Séance libre</button>`}
    <button class="card prog-cta" data-act="go" data-v="programs"><span class="grow"><b>Programmes de coachs</b><br><span class="small muted">Upper / Lower adaptés : muscle et affinement</span></span>${I.chev}</button>
    <div class="section-title">Mes routines</div>
    ${state.routines.length ? state.routines.map(r => `
      <div class="card">
        <div class="row"><div class="grow"><b>${esc(r.name)}</b>${r.program ? `<div class="small" style="color:var(--accent);margin-top:2px">${esc(r.program)}</div>` : ''}<div class="small muted" style="margin-top:2px">${r.items.length ? r.items.map(i => esc(ex(i.exId).name)).join(' · ') : 'Aucun exercice'}</div></div>
        <button class="icon-btn" data-act="go" data-v="routine" data-id="${r.id}" aria-label="Modifier">${I.edit}</button></div>
        ${state.active ? '' : `<button class="btn ghost block" style="margin-top:12px" data-act="startRoutine" data-id="${r.id}">Démarrer</button>`}
      </div>`).join('') : `<div class="card empty">Aucune routine pour l'instant.<br><br><button class="btn ghost" data-act="addTemplates">Ajouter des routines d'exemple</button><div class="small" style="margin-top:8px">Push / Pull / Legs + Full body, modifiables</div><button class="btn ghost" style="margin-top:12px" data-act="go" data-v="programs">Voir les programmes Upper / Lower</button></div>`}
    <button class="btn block" data-act="newRoutine">${I.plus} Nouvelle routine</button>
    <div class="section-title">Bibliothèque</div>
    <div class="list">
      <button class="item" data-act="go" data-v="exercises"><span class="grow">Exercices</span><span class="muted">${window.EXERCISES.length + state.customExercises.length}</span>${I.chev}</button>
      <button class="item" data-act="go" data-v="history"><span class="grow">Historique des séances</span><span class="muted">${state.workouts.length}</span>${I.chev}</button>
    </div>`,
});

V.active = () => {
  const w = state.active;
  if (!w) return { title: 'Séance', body: '<div class="empty">Aucune séance en cours.</div>' };
  return {
    title: 'Séance en cours',
    action: `<button class="top-action" data-act="finishWorkout">Terminer</button>`,
    body: `
      <div class="wk-head"><input type="text" class="grow" value="${esc(w.name)}" data-in="wName" aria-label="Nom de la séance"><span class="timer-chip js-elapsed">${elapsedStr(w.start)}</span></div>
      ${w.exercises.length ? '' : '<div class="card empty">Ajoute ton premier exercice 👇</div>'}
      ${w.exercises.map(exBlock).join('')}
      <button class="btn ghost block" data-act="addExToActive">${I.plus} Ajouter un exercice</button>
      <div class="row between small muted" style="margin:14px 4px">
        <span>Repos par défaut : ${mmss(state.settings.rest)}</span><button class="link" data-act="restPicker">Changer</button>
      </div>
      <button class="btn danger block" data-act="cancelWorkout">Abandonner la séance</button>`,
  };
};
function exBlock(e, ei) {
  const x = ex(e.exId), cols = TYPES[x.type].f, prev = lastSets(e.exId);
  return `<div class="ex-block">
    <div class="row"><button class="thumb-btn" data-act="showGuide" data-id="${x.id}" aria-label="Voir l'exécution">${thumb(x.id)}</button><button class="ex-name" style="text-align:left" data-act="go" data-v="exdetail" data-id="${x.id}">${esc(x.name)}</button><button class="icon-btn" data-act="exMenu" data-ei="${ei}" aria-label="Options">${I.dots}</button></div>
    ${e.target || e.rest ? `<div class="ex-target">${e.target ? `Objectif : ${esc(e.target)}${repUnit(x.type)}` : ''}${e.target && e.rest ? ' · ' : ''}${e.rest ? `repos ${mmss(e.rest)}` : ''}</div>` : ''}
    ${e.note ? `<div class="ex-note">${esc(e.note)}</div>` : ''}
    <table class="sets"><thead><tr><th>Série</th><th>Précédent</th>${cols.map(c => `<th>${c[1]}</th>`).join('')}<th></th></tr></thead><tbody>
    ${e.sets.map((s, si) => {
      const p = prev[si] || null;
      return `<tr class="${s.done ? 'done' : ''}"><td class="idx">${si + 1}</td><td class="prev" data-act="usePrev" data-ei="${ei}" data-si="${si}">${fmtPrev(x.type, p)}</td>
        ${cols.map(([k]) => `<td><input type="text" inputmode="decimal" autocomplete="off" value="${fmtNum(s[k])}" placeholder="${p && p[k] != null ? fmtNum(p[k]) : ''}" data-in="setVal" data-ei="${ei}" data-si="${si}" data-k="${k}"></td>`).join('')}
        <td><button class="check" data-act="toggleSet" data-ei="${ei}" data-si="${si}" aria-label="Valider la série">${I.check}</button></td></tr>`;
    }).join('')}
    </tbody></table>
    <div class="set-actions"><button class="btn sm" data-act="addSet" data-ei="${ei}">${I.plus} Série</button>${e.sets.length ? `<button class="btn sm" data-act="removeSet" data-ei="${ei}">Retirer une série</button>` : ''}</div>
  </div>`;
}

V.routine = ({ id }) => {
  const r = state.routines.find(x => x.id === id);
  if (!r) return { title: 'Routine', body: '<div class="empty">Routine introuvable.</div>' };
  return {
    title: 'Modifier la routine',
    action: `<button class="top-action" data-act="back">OK</button>`,
    body: `
      <label class="field"><span>Nom de la routine</span><input type="text" value="${esc(r.name)}" data-in="routineName" data-id="${r.id}"></label>
      <div class="section-title">Exercices</div>
      ${r.items.length ? `<div class="list">${r.items.map((it, i) => {
        const x = ex(it.exId);
        return `<div class="item" style="align-items:flex-start">
          <div class="grow"><div class="title">${esc(x.name)}</div>
            <div class="row" style="margin-top:8px;gap:8px 12px;flex-wrap:wrap">
              <label class="row small muted" style="gap:6px">Séries <input type="text" inputmode="numeric" style="width:54px;text-align:center;min-height:36px;padding:6px" value="${it.sets}" data-in="routineItem" data-id="${r.id}" data-i="${i}" data-k="sets"></label>
              <label class="row small muted" style="gap:6px">Objectif <input type="text" style="width:78px;text-align:center;min-height:36px;padding:6px" value="${esc(it.reps || '')}" placeholder="${x.type === 'time' ? '45' : '8-12'}" data-in="routineItem" data-id="${r.id}" data-i="${i}" data-k="reps"></label>
              <label class="row small muted" style="gap:6px">Repos <select style="width:96px;min-height:36px;padding:6px" data-ch="routineRest" data-id="${r.id}" data-i="${i}">${[0, 45, 60, 75, 90, 120, 150, 180, 240].map(v => `<option value="${v}" ${(it.rest || 0) === v ? 'selected' : ''}>${v ? mmss(v) : 'Défaut'}</option>`).join('')}</select></label>
            </div>${it.note ? `<div class="small muted" style="margin-top:6px">${esc(it.note)}</div>` : ''}</div>
          <div style="display:flex;flex-direction:column">
            <button class="icon-btn" data-act="routineMove" data-id="${r.id}" data-i="${i}" data-d="-1" aria-label="Monter" ${i === 0 ? 'style="visibility:hidden"' : ''}>${I.up}</button>
            <button class="icon-btn" data-act="routineMove" data-id="${r.id}" data-i="${i}" data-d="1" aria-label="Descendre" ${i === r.items.length - 1 ? 'style="visibility:hidden"' : ''}>${I.down}</button>
            <button class="icon-btn" style="color:var(--danger)" data-act="routineDel" data-id="${r.id}" data-i="${i}" aria-label="Retirer">${I.trash}</button>
          </div></div>`;
      }).join('')}</div>` : '<div class="card empty">Ajoute des exercices à ta routine.</div>'}
      <button class="btn ghost block" data-act="routineAddEx" data-id="${r.id}">${I.plus} Ajouter un exercice</button>
      <div style="height:28px"></div>
      ${state.active ? '' : `<button class="btn primary block" data-act="startRoutine" data-id="${r.id}" style="margin-bottom:10px">Démarrer cette routine</button>`}
      <button class="btn danger block" data-act="deleteRoutine" data-id="${r.id}">Supprimer la routine</button>`,
  };
};

V.history = () => {
  if (!state.workouts.length) return { title: 'Historique', body: '<div class="card empty">Aucune séance enregistrée pour l\'instant.</div>' };
  const groups = {};
  for (const w of state.workouts) { const k = fmtDate(w.start, { month: 'long', year: 'numeric' }); (groups[k] = groups[k] || []).push(w); }
  return {
    title: 'Historique',
    body: Object.entries(groups).map(([m, ws]) => `<div class="section-title">${m}</div><div class="list">${ws.map(w => `
      <button class="item" data-act="openWorkout" data-id="${w.id}"><div class="grow"><div class="title">${esc(w.name)}</div>
      <div class="sub">${fmtDate(w.start)} · ${fmtDur(w.end - w.start)} · ${plural(w.exercises.length, 'exo')}${volume(w) ? ` · ${fmt(volume(w))} kg` : ''}</div></div>${I.chev}</button>`).join('')}</div>`).join(''),
  };
};

V.workout = ({ id }) => {
  const w = state.workouts.find(x => x.id === id);
  if (!w) return { title: 'Séance', body: '<div class="empty">Séance introuvable.</div>' };
  return {
    title: w.name,
    body: `
      <div class="muted" style="margin:0 4px 12px">${fmtDate(w.start, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à ${new Date(w.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
      <div class="stats"><div class="stat"><b>${fmtDur(w.end - w.start)}</b><small>Durée</small></div><div class="stat"><b>${setCount(w)}</b><small>Séries</small></div><div class="stat"><b>${fmt(volume(w))}</b><small>Volume (kg)</small></div></div>
      ${w.exercises.map(e => { const x = ex(e.exId); return `<div class="card"><h2><button class="link" style="text-align:left" data-act="go" data-v="exdetail" data-id="${x.id}">${esc(x.name)}</button></h2>
        ${e.sets.map((s, i) => `<div class="row between small" style="padding:3px 0"><span class="muted">Série ${i + 1}</span><span>${fmtSet(x.type, s)}</span></div>`).join('')}</div>`; }).join('')}
      ${state.active ? '' : `<button class="btn primary block" data-act="repeatWorkout" data-id="${w.id}" style="margin-bottom:10px">Refaire cette séance</button>`}
      <button class="btn block" data-act="saveAsRoutine" data-id="${w.id}" style="margin-bottom:10px">Enregistrer comme routine</button>
      <button class="btn danger block" data-act="deleteWorkout" data-id="${w.id}">Supprimer la séance</button>`,
  };
};

const exFilter = { q: '', g: '' };
const exListHTML = (q, g, act) => {
  const qq = norm(q);
  const list = allExercises().filter(e => (!g || e.group === g) && (!qq || norm(e.name).includes(qq)));
  if (!list.length) return '<div class="empty">Aucun exercice trouvé.</div>';
  const by = {};
  for (const e of list) (by[e.group] = by[e.group] || []).push(e);
  return GROUPS.filter(gr => by[gr]).map(gr => `<div class="section-title">${gr}</div><div class="list">${by[gr].map(e => `
    <button class="item" data-act="${act}" data-id="${e.id}">${thumb(e.id)}<div class="grow"><div class="title">${esc(e.name)}</div>${e.custom ? '<div class="sub">Exercice perso</div>' : ''}</div>${I.chev}</button>`).join('')}</div>`).join('');
};
const groupChips = (g, act) => `<div class="chips"><button class="chip ${!g ? 'on' : ''}" data-act="${act}" data-g="">Tous</button>${GROUPS.slice(0, -1).map(x => `<button class="chip ${g === x ? 'on' : ''}" data-act="${act}" data-g="${x}">${x}</button>`).join('')}</div>`;

V.exercises = () => ({
  title: 'Exercices',
  action: `<button class="top-action" data-act="newExercise">Créer</button>`,
  body: `<input type="search" placeholder="Rechercher un exercice" value="${esc(exFilter.q)}" data-in="exQ" style="margin-bottom:10px">
    ${groupChips(exFilter.g, 'exG')}<div id="ex-list">${exListHTML(exFilter.q, exFilter.g, 'openEx')}</div>`,
});

V.exdetail = ({ id }) => {
  const x = ex(id), h = exHistory(id), t = x.type;
  const pts = h.slice().reverse().map(({ w, sets }) => ({ x: w.start, y: r1(sessionBest(t, sets)) })).filter(p => p.y > 0);
  let stats = '';
  if (h.length) {
    const all = h.flatMap(z => z.sets);
    if (t === 'w') stats = `<div class="stat"><b>${fmt(bestEver(id), 1)}</b><small>1RM estimé (kg)</small></div><div class="stat"><b>${fmt(Math.max(...all.map(s => s.a || 0)), 2)}</b><small>Charge max (kg)</small></div>`;
    else if (t === 'bw') stats = `<div class="stat"><b>${fmt(Math.max(...all.map(s => s.b || 0)))}</b><small>Reps max</small></div><div class="stat"><b>${fmt(Math.max(...all.map(s => s.a || 0)), 2)}</b><small>Lest max (kg)</small></div>`;
    else if (t === 'time') stats = `<div class="stat"><b>${fmt(Math.max(...all.map(s => s.b || 0)))} s</b><small>Durée max</small></div><div class="stat"><b>${fmt(all.reduce((n, s) => n + (s.b || 0), 0) / 60, 0)}</b><small>Minutes au total</small></div>`;
    else stats = `<div class="stat"><b>${fmt(Math.max(...all.map(s => s.a || 0)), 2)}</b><small>Distance max (km)</small></div><div class="stat"><b>${fmt(all.reduce((n, s) => n + (s.a || 0), 0), 1)}</b><small>Km au total</small></div>`;
    stats = `<div class="stats">${stats}<div class="stat"><b>${h.length}</b><small>Séances</small></div></div>`;
  }
  return {
    title: x.name,
    body: `
      ${demoHTML(id)}
      <div class="row" style="gap:6px;margin:0 2px 14px"><span class="pill accent">${x.group}</span><span class="pill">${TYPES[x.type].label}</span>${x.custom ? '<span class="pill">Perso</span>' : ''}</div>
      ${guideHTML(id)}
      ${h.length ? `${stats}<div class="card"><h2>${metricLabel(t)}</h2>${lineChart(pts, { dec: t === 'cardio' ? 1 : 0 })}</div>
        <div class="section-title">Historique</div>
        <div class="list">${h.slice(0, 50).map(({ w, sets }) => `<button class="item" data-act="openWorkout" data-id="${w.id}"><div class="grow"><div class="sub">${fmtDate(w.start, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div><div class="small">${sets.map(s => fmtSet(t, s)).join(' · ')}</div></div>${I.chev}</button>`).join('')}</div>`
      : '<div class="card empty">Pas encore réalisé. Ajoute-le à une séance pour suivre ta progression.</div>'}
      ${x.custom ? `<button class="btn danger block" data-act="deleteExercise" data-id="${x.id}">Supprimer cet exercice</button>` : ''}`,
  };
};

/* ----- Programmes ----- */
let progKind = 'all';
function sessionRow(p, s) {
  return `<button class="item" data-act="go" data-v="session" data-id="${p.id}:${s.id}">${kindBadge(s.kind)}<div class="grow"><div class="title">${esc(s.name)} <span class="muted small">· ${esc(p.short)}</span></div>
    <div class="sub">${esc(s.focus)} · ${s.items.length} exos · ~${sessionMinutes(s)} min</div></div>${I.chev}</button>`;
}
V.programs = () => {
  const P = window.PROGRAMS || [];
  let body = `<div class="note" style="margin:0 4px 12px">Versions adaptées à ton objectif : <b>prendre du muscle et t'affiner</b>, sans powerlifting (8-15 répétitions, mouvements plus doux pour les articulations).</div><div class="seg">${[['all', 'Par programme'], ['upper', 'Upper'], ['lower', 'Lower']].map(([k, l]) => `<button class="${progKind === k ? 'on' : ''}" data-act="progKind" data-k="${k}">${l}</button>`).join('')}</div>`;
  if (progKind === 'all') {
    body += P.map(p => `<div class="section-title">${esc(p.name)}</div>
      <div class="card"><div class="row between" style="align-items:flex-start"><div class="grow"><b>${esc(p.author)}</b><div class="small muted">${esc(p.level)} · ${esc(p.freq)}</div></div><button class="link" data-act="go" data-v="program" data-id="${p.id}">Infos</button></div>
      <div class="small" style="margin-top:8px">${esc(p.summary)}</div></div>
      <div class="list">${p.sessions.map(s => sessionRow(p, s)).join('')}</div>`).join('');
  } else {
    body += `<div class="note" style="margin:0 4px 10px">Toutes les séances ${progKind} des ${P.length} programmes. Touche une séance pour voir les exercices et les animations.</div>
      <div class="list">${P.flatMap(p => p.sessions.filter(s => s.kind === progKind).map(s => sessionRow(p, s))).join('')}</div>`;
  }
  body += `<div class="section-title">Conseils généraux</div><div class="card"><ul class="steps">${(window.GENERAL_TIPS || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
  return { title: 'Programmes', body };
};
V.program = ({ id }) => {
  const p = (window.PROGRAMS || []).find(x => x.id === id);
  if (!p) return { title: 'Programme', body: '<div class="empty">Programme introuvable.</div>' };
  return {
    title: p.short,
    body: `<div class="card"><div class="small muted">${esc(p.full)}</div><b>${esc(p.author)}</b><div class="small muted">${esc(p.level)} · ${esc(p.freq)}</div>
        <p style="margin:10px 0 0">${esc(p.summary)}</p></div>
      ${p.adapted ? `<div class="card" style="border-left:4px solid var(--accent)"><h2>Adapté pour toi</h2><div class="small muted" style="margin-bottom:8px">Objectif : prendre du muscle et s'affiner, sans powerlifting. Ce qui change par rapport à l'original :</div><ul class="steps">${p.adapted.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
      <div class="card"><h2>Semaine type</h2><div class="small">${esc(p.schedule)}</div></div>
      <div class="card"><h2>Règles du programme</h2><ul class="steps">${p.rules.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
      <div class="section-title">Séances</div><div class="list">${p.sessions.map(s => sessionRow(p, s)).join('')}</div>
      <div class="small muted center" style="margin:16px 0">Source : <a href="${esc(p.source)}" target="_blank" rel="noopener">${esc(new URL(p.source).hostname)}</a></div>`,
  };
};
V.session = ({ id }) => {
  const f = findSession(id);
  if (!f) return { title: 'Séance', body: '<div class="empty">Séance introuvable.</div>' };
  const { p, s } = f, added = state.routines.some(r => r.sessionKey === id);
  return {
    title: s.name,
    body: `
      <div class="row" style="gap:6px;flex-wrap:wrap;margin:0 2px 12px">${kindBadge(s.kind)}<span class="pill">${esc(p.short)} · ${esc(p.author)}</span><span class="pill">~${sessionMinutes(s)} min</span></div>
      <div class="muted" style="margin:0 4px 12px">${esc(s.focus)}</div>
      <div class="list">${s.items.map(it => {
        const [exId, a, b, reps, rest] = it, x = ex(exId), note = itemNote(it);
        return `<div class="item" style="align-items:flex-start"><button class="thumb-btn" data-act="showGuide" data-id="${exId}" aria-label="Voir l'animation">${thumb(exId)}</button>
          <div class="grow"><button class="title" style="text-align:left" data-act="showGuide" data-id="${exId}">${esc(x.name)}</button>
            <div class="sub"><b style="color:var(--text)">${setsLabel(a, b)} × ${esc(reps)}${repUnit(x.type)}</b> · repos ${mmss(rest)}</div>
            ${note ? `<div class="small muted" style="margin-top:3px">${esc(note)}</div>` : ''}</div></div>`;
      }).join('')}</div>
      <div class="note" style="margin:-4px 4px 16px">Touche une vignette pour voir l'animation et les consignes.</div>
      ${state.active ? '' : `<button class="btn primary block" data-act="startSession" data-id="${id}" style="margin-bottom:10px">Démarrer cette séance</button>`}
      ${added ? '<button class="btn block" disabled style="opacity:.6">✓ Déjà dans tes routines</button>' : `<button class="btn ghost block" data-act="addSession" data-id="${id}">Ajouter à mes routines</button>`}
      <button class="btn block" style="margin-top:10px" data-act="go" data-v="program" data-id="${p.id}">Infos et adaptations ${esc(p.short)}</button>`,
  };
};

/* ----- Nutrition ----- */
let foodDate = dayKey();
const foodSearch = { q: '', loading: false, results: null, error: '', tab: 'recent' };
const tempFoods = {};
function dayTitle(k) {
  const today = dayKey();
  if (k === today) return 'Aujourd\'hui';
  if (k === addDays(today, -1)) return 'Hier';
  if (k === addDays(today, 1)) return 'Demain';
  return fmtDate(parseDay(k), { weekday: 'long', day: 'numeric', month: 'long' });
}
V.food = () => {
  const k = foodDate, entries = dayEntries(k), t = sumEntries(entries), g = goals();
  const yest = dayEntries(addDays(k, -1));
  return {
    title: 'Nutrition', large: true,
    body: `
      <div class="datenav"><button class="icon-btn" data-act="foodDay" data-d="-1" aria-label="Jour précédent">${I.left}</button>
        <button class="d" data-act="foodToday" style="text-transform:capitalize">${dayTitle(k)}</button>
        <button class="icon-btn" data-act="foodDay" data-d="1" aria-label="Jour suivant">${I.right}</button></div>
      <div class="card">${nutriSummary(t, g)}</div>
      ${MEALS.map(([m, label]) => {
        const es = entries.filter(e => e.meal === m), tt = sumEntries(es);
        return `<div class="list"><div class="meal-head"><b>${label}</b><span class="muted small">${fmt(tt.kcal)} kcal</span></div>
          ${es.map(e => `<button class="item" data-act="editEntry" data-id="${e.id}"><div class="grow"><div class="title ellipsis">${esc(e.name)}</div><div class="food-macros">${e.g ? fmt(e.g) + ' g · ' : ''}${macroLine(e)}</div></div><span class="muted">${fmt(e.kcal)}</span></button>`).join('')}
          <button class="add-row" data-act="addFood" data-m="${m}">${I.plus} Ajouter</button></div>`;
      }).join('')}
      ${!entries.length && yest.length ? `<button class="btn block" data-act="copyYesterday">Copier les repas de la veille</button>` : ''}`,
  };
};
function foodRow(f, act = 'pickFood', extra = '') {
  return `<button class="item" data-act="${act}" data-id="${esc(f.id)}"><div class="grow"><div class="title ellipsis">${esc(f.name)}</div>
    <div class="food-macros">${f.brand ? esc(f.brand) + ' · ' : ''}${fmt(f.kcal)} kcal/100 g · ${macroLine(f)}</div></div>${extra || I.plus}</button>`;
}
function foodResultsHTML() {
  const s = foodSearch;
  if (s.loading) return '<div class="spinner"></div>';
  if (s.error) return `<div class="card empty">${esc(s.error)}</div>`;
  if (s.results) {
    return `<div class="row between" style="margin:4px 4px 8px"><span class="small muted">${plural(s.results.length, 'résultat')} · Open Food Facts</span><button class="link small" data-act="clearSearch">Effacer</button></div>`
      + (s.results.length ? `<div class="list">${s.results.map(f => foodRow(f)).join('')}</div>` : '<div class="card empty">Aucun résultat. Essaie un autre mot ou crée l\'aliment.</div>');
  }
  const recent = state.recentFoods.map(id => state.foods[id]).filter(Boolean);
  const mine = Object.values(state.foods).filter(f => f.source === 'custom').sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  return `<div class="seg"><button class="${s.tab === 'recent' ? 'on' : ''}" data-act="foodTab" data-t="recent">Récents</button><button class="${s.tab === 'mine' ? 'on' : ''}" data-act="foodTab" data-t="mine">Mes aliments</button></div>`
    + (s.tab === 'recent'
      ? (recent.length ? `<div class="list">${recent.map(f => foodRow(f)).join('')}</div>` : '<div class="card empty">Les aliments que tu ajoutes apparaîtront ici.</div>')
      : (mine.length ? `<div class="list">${mine.map(f => foodRow(f)).join('')}</div>` : '<div class="card empty">Aucun aliment perso. Utilise « Créer » pour tes plats maison.</div>'));
}
V.addfood = ({ date, meal }) => ({
  title: mealLabel(meal),
  body: `
    <form class="row" style="gap:8px;margin-bottom:10px" data-submit="foodSearch">
      <input type="search" id="food-q" placeholder="Rechercher (ex : skyr, riz basmati…)" value="${esc(foodSearch.q)}" enterkeyhint="search" autocomplete="off">
      <button class="btn primary" type="submit">OK</button></form>
    <div class="btns" style="margin-bottom:14px;gap:8px">
      <button class="btn sm" data-act="barcode">Code-barres</button><button class="btn sm" data-act="newFood">Créer</button><button class="btn sm" data-act="quickAdd">Ajout rapide</button></div>
    <div class="small muted" style="margin:-6px 4px 10px">Pour ${dayTitle(date).toLowerCase()}</div>
    <div id="food-results">${foodResultsHTML()}</div>`,
});

/* ----- Progrès ----- */
let progRange = '3m';
const RANGES = [['1m', '1 mois', 31], ['3m', '3 mois', 92], ['1y', '1 an', 366], ['all', 'Tout', 1e5]];
V.progress = () => {
  const days = RANGES.find(r => r[0] === progRange)[2], from = Date.now() - days * 864e5;
  const wAll = series('weight'), w = wAll.filter(p => p.x >= from);
  const lw = wAll[wAll.length - 1], first = w[0];
  const latest = {}; for (const b of bodySorted()) for (const [k] of BODY_FIELDS) if (b[k] != null) latest[k] = b[k];
  const firstVals = {}; for (const b of bodySorted()) for (const [k] of BODY_FIELDS) if (b[k] != null && firstVals[k] == null) firstVals[k] = b[k];
  // entraînement : 12 dernières semaines
  const ws = weekStart(new Date());
  const weeks = Array.from({ length: 12 }, (_, i) => { const s = new Date(ws); s.setDate(s.getDate() - 7 * (11 - i)); return s; });
  const bars = weeks.map((s, i) => { const e = s.getTime() + 7 * 864e5; return { v: state.workouts.filter(x => x.start >= s.getTime() && x.start < e).length, label: i % 2 === 1 ? `${s.getDate()}/${s.getMonth() + 1}` : '', hl: i === 11 }; });
  const inRange = state.workouts.filter(x => x.start >= from);
  const avgDur = inRange.length ? inRange.reduce((n, x) => n + (x.end - x.start), 0) / inRange.length : 0;
  // nutrition : moyenne des 7 derniers jours renseignés
  const lastDays = Array.from({ length: 7 }, (_, i) => addDays(dayKey(), -i)).filter(k => dayEntries(k).length);
  const avg = lastDays.length ? sumEntries(lastDays.flatMap(dayEntries)) : null;
  const g = goals();
  // records
  const bests = new Map();
  for (const wk of state.workouts) for (const e of wk.exercises) {
    const t = ex(e.exId).type, b = sessionBest(t, e.sets), c = bests.get(e.exId);
    if (!c) bests.set(e.exId, { exId: e.exId, best: b }); else c.best = Math.max(c.best, b);
  }
  const recs = [...bests.values()].filter(r => r.best > 0).slice(0, 8);
  return {
    title: 'Progrès', large: true,
    body: `
      <div class="seg">${RANGES.map(([k, l]) => `<button class="${progRange === k ? 'on' : ''}" data-act="progRange" data-r="${k}">${l}</button>`).join('')}</div>
      <div class="card">
        <h2>Poids <button class="link" data-act="addBody">+ Mesure</button></h2>
        ${lw ? `<div class="row" style="align-items:baseline;margin-bottom:6px"><span class="big">${fmt(lw.y, 1)} kg</span>${first && w.length > 1 ? `<span class="small muted">${lw.y - first.y > 0 ? '+' : ''}${fmt(lw.y - first.y, 1)} kg sur la période</span>` : ''}</div>` : ''}
        ${lineChart(w)}
      </div>
      ${Object.keys(latest).filter(k => k !== 'weight').length ? `<div class="card"><h2>Mensurations</h2>${BODY_FIELDS.filter(([k]) => k !== 'weight' && latest[k] != null).map(([k, l, u]) => {
        const d = latest[k] - firstVals[k];
        return `<div class="row between" style="padding:5px 0"><span>${l}</span><span><b>${fmt(latest[k], 1)} ${u}</b>${d ? ` <span class="small muted">(${d > 0 ? '+' : ''}${fmt(d, 1)} depuis le début)</span>` : ''}</span></div>`;
      }).join('')}</div>` : ''}
      <button class="btn block" data-act="go" data-v="bodylog" style="margin-bottom:14px">Historique des mesures</button>
      <div class="section-title">Entraînement</div>
      <div class="stats"><div class="stat"><b>${inRange.length}</b><small>Séances (période)</small></div><div class="stat"><b>${avgDur ? fmtDur(avgDur) : '–'}</b><small>Durée moyenne</small></div><div class="stat"><b>${fmt(inRange.reduce((n, x) => n + volume(x), 0) / 1000, 1)} t</b><small>Volume soulevé</small></div></div>
      <div class="card"><h2>Séances par semaine</h2>${barChart(bars)}</div>
      ${recs.length ? `<div class="card"><h2>Meilleures perfs <button class="link" data-act="go" data-v="exercises">Tout voir</button></h2><div class="pr-list">${recs.map(r => { const x = ex(r.exId); return `<button class="item" data-act="go" data-v="exdetail" data-id="${x.id}"><span class="grow ellipsis">${esc(x.name)}</span><b>${fmtBest(x.type, r.best)}</b>${I.chev}</button>`; }).join('')}</div><div class="small muted" style="margin-top:6px">Charges : 1RM estimé (formule d'Epley).</div></div>` : ''}
      <div class="section-title">Nutrition</div>
      <div class="card">${avg ? `<div class="row between"><span>Moyenne sur ${plural(lastDays.length, 'jour')} renseigné${lastDays.length > 1 ? 's' : ''}</span><b>${fmt(avg.kcal / lastDays.length)} kcal</b></div>
        <div class="small muted" style="margin-top:4px">Objectif ${fmt(g.kcal)} kcal · Protéines ${fmt(avg.p / lastDays.length)} g / ${fmt(g.p)} g</div>` : '<div class="muted">Renseigne tes repas pour voir ta moyenne de la semaine.</div>'}</div>`,
  };
};
V.bodylog = () => {
  const list = bodySorted().reverse();
  return {
    title: 'Mesures',
    action: `<button class="top-action" data-act="addBody">Ajouter</button>`,
    body: list.length ? `<div class="list">${list.map(b => `<button class="item" data-act="editBody" data-id="${b.id}"><div class="grow"><div class="title">${fmtDate(parseDay(b.date).getTime(), { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div class="sub">${BODY_FIELDS.filter(([k]) => b[k] != null).map(([k, l, u]) => `${l} ${fmt(b[k], 1)} ${u}`).join(' · ')}</div></div>${I.chev}</button>`).join('')}</div>` : '<div class="card empty">Aucune mesure pour l\'instant.</div>',
  };
};

/* ----- Réglages ----- */
V.more = () => {
  const s = state.settings, pr = s.profile, g = s.goals, comp = computeGoals(), cw = currentWeight();
  const autoOn = g.auto && comp;
  return {
    title: 'Réglages', large: true,
    body: `
      <div class="section-title">Profil</div>
      <div class="card">
        <div class="seg"><button class="${pr.sex === 'm' ? 'on' : ''}" data-act="setSex" data-v="m">Homme</button><button class="${pr.sex === 'f' ? 'on' : ''}" data-act="setSex" data-v="f">Femme</button></div>
        <div class="grid2">
          <label class="field"><span>Âge</span><input type="text" inputmode="numeric" value="${fmtNum(pr.age)}" data-ch="profile" data-k="age" placeholder="ans"></label>
          <label class="field"><span>Taille (cm)</span><input type="text" inputmode="numeric" value="${fmtNum(pr.height)}" data-ch="profile" data-k="height" placeholder="cm"></label>
        </div>
        <label class="field"><span>Objectif</span><select data-ch="goalType">${GOALS.map(([v, l]) => `<option value="${v}" ${(pr.goal || 'maintain') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="field"><span>Niveau d'activité</span><select data-ch="activity">${ACTIVITY.map(([v, l]) => `<option value="${v}" ${pr.activity === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <div class="small muted">Poids actuel : ${cw ? `<b>${fmt(cw, 1)} kg</b> (dernière pesée)` : '<button class="link" data-act="addBody">ajoute une pesée</button>'}</div>
      </div>
      <div class="section-title">Objectifs nutritionnels</div>
      <div class="card">
        <div class="row between" style="margin-bottom:12px"><span>Calcul automatique</span><label class="switch"><input type="checkbox" ${g.auto ? 'checked' : ''} data-ch="goalsAuto"><span></span></label></div>
        ${g.auto && !comp ? '<div class="note" style="margin-bottom:12px">Renseigne ton âge, ta taille et une pesée pour activer le calcul.</div>' : ''}
        <div class="grid2">
          <label class="field"><span>Calories (kcal)</span><input type="text" inputmode="numeric" value="${autoOn ? comp.kcal : fmtNum(g.kcal)}" data-ch="goal" data-k="kcal" ${autoOn ? 'disabled' : ''}></label>
          <label class="field"><span>Protéines (g)</span><input type="text" inputmode="numeric" value="${autoOn ? comp.p : fmtNum(g.p)}" data-ch="goal" data-k="p" ${autoOn ? 'disabled' : ''}></label>
          <label class="field"><span>Glucides (g)</span><input type="text" inputmode="numeric" value="${autoOn ? comp.c : fmtNum(g.c)}" data-ch="goal" data-k="c" ${autoOn ? 'disabled' : ''}></label>
          <label class="field"><span>Lipides (g)</span><input type="text" inputmode="numeric" value="${autoOn ? comp.f : fmtNum(g.f)}" data-ch="goal" data-k="f" ${autoOn ? 'disabled' : ''}></label>
        </div>
        ${autoOn ? `<div class="note">Dépense estimée ${fmt(comp.tdee)} kcal/jour (métabolisme de base ${fmt(comp.bmr)} kcal, formule Mifflin-St Jeor, × activité)${pr.goal === 'lean' ? ', moins 15 % pour t\'affiner en douceur' : pr.goal === 'gain' ? ', plus 10 % pour construire du muscle' : ''}. Protéines 1,6 g/kg pour construire et garder le muscle, lipides 0,9 g/kg, glucides = le reste. C'est une estimation : ajuste selon l'évolution de ton poids et de ton tour de taille sur 3-4 semaines.</div>` : ''}
      </div>
      <div class="section-title">Séances</div>
      <div class="card"><label class="field" style="margin:0"><span>Minuteur de repos par défaut</span><select data-ch="rest">${[0, 30, 45, 60, 75, 90, 105, 120, 150, 180, 240, 300].map(v => `<option value="${v}" ${s.rest === v ? 'selected' : ''}>${v ? mmss(v) : 'Désactivé'}</option>`).join('')}</select></label></div>
      <div class="section-title">Données</div>
      <div class="card">
        <div class="note" style="margin-bottom:12px">Tes données sont enregistrées uniquement sur ce téléphone. Exporte une sauvegarde de temps en temps (dans Fichiers ou iCloud Drive).${s.lastExport ? ` Dernier export : ${shortDate(s.lastExport)}.` : ' <b>Aucun export pour l\'instant.</b>'}</div>
        <div class="btns" style="margin-bottom:10px"><button class="btn ghost" data-act="exportData">Exporter</button><button class="btn" data-act="importData">Importer</button></div>
        <input type="file" id="import-file" accept="application/json,.json" data-ch="importFile" hidden>
        <button class="btn danger block" data-act="resetAll">Tout effacer</button>
      </div>
      ${isStandalone() ? '' : `<div class="section-title">Installation</div><div class="card note"><ol><li>Ouvre cette page dans <b>Safari</b> sur ton iPhone.</li><li>Touche le bouton <b>Partager</b> ⬆️.</li><li>Choisis <b>« Sur l'écran d'accueil »</b> puis <b>Ajouter</b>.</li></ol></div>`}
      <div class="center small muted" style="margin:20px 0">MonFit ${APP_VERSION} · aliments : Open Food Facts (ODbL) · photos d'exercices : Free Exercise DB (domaine public)</div>`,
  };
};

/* ================= Feuilles (sheets) ================= */
let pickerCb = null;
const pickerFilter = { q: '', g: '' };
function openExercisePicker(cb) {
  pickerCb = cb; pickerFilter.q = ''; pickerFilter.g = '';
  openSheet(`<h3>Choisir un exercice <button data-act="closeSheet">Fermer</button></h3>
    <input type="search" placeholder="Rechercher" data-in="pickQ" style="margin-bottom:10px">
    <div id="pick-chips">${groupChips('', 'pickG')}</div>
    <div id="pick-list">${exListHTML('', '', 'pickEx')}</div>
    <button class="btn ghost block" style="margin-top:6px" data-act="newExercise" data-from="picker">${I.plus} Créer un exercice</button>`);
}
function refreshPicker() {
  const l = $('#pick-list'); if (l) l.innerHTML = exListHTML(pickerFilter.q, pickerFilter.g, 'pickEx');
  const c = $('#pick-chips'); if (c) c.innerHTML = groupChips(pickerFilter.g, 'pickG');
}
function startPickerSheet() {
  openSheet(`<h3>Démarrer une séance <button data-act="closeSheet">Fermer</button></h3>
    <button class="btn primary block" data-act="startEmpty" style="margin-bottom:12px">${I.plus} Séance libre</button>
    ${state.routines.length ? `<div class="list">${state.routines.map(r => `<button class="item" data-act="startRoutine" data-id="${r.id}"><div class="grow"><div class="title">${esc(r.name)}</div><div class="sub ellipsis">${r.items.map(i => esc(ex(i.exId).name)).join(' · ')}</div></div>${I.chev}</button>`).join('')}</div>` : '<div class="note center">Crée des routines dans l\'onglet Séances pour les lancer en un geste.</div>'}`);
}

let qtyCtx = null;
const previewHTML = m => `<div><b>${fmt(m.kcal)}</b><small>kcal</small></div><div><b style="color:var(--p)">${fmt(m.p, 1)}</b><small>Protéines</small></div><div><b style="color:var(--c)">${fmt(m.c, 1)}</b><small>Glucides</small></div><div><b style="color:var(--f)">${fmt(m.f, 1)}</b><small>Lipides</small></div>`;
function openQtySheet(food, ctx) {
  qtyCtx = { food, ...ctx, g: ctx.g || food.serving || 100 };
  const quick = [...new Set([food.serving, 30, 50, 100, 150, 200, 250].filter(Boolean))];
  openSheet(`<h3><span class="ellipsis" style="flex:1">${esc(food.name)}</span><button data-act="closeSheet">Fermer</button></h3>
    ${food.brand ? `<div class="muted small" style="margin:-10px 0 12px">${esc(food.brand)}</div>` : ''}
    <div class="preview" id="qty-prev">${previewHTML(scale(food, qtyCtx.g))}</div>
    <label class="field"><span>Quantité (g)</span><input type="text" inputmode="decimal" id="qty-g" value="${fmtNum(qtyCtx.g)}" data-in="qtyG"></label>
    <div class="qty-quick">${quick.map(v => `<button class="pill" data-act="qtySet" data-v="${v}">${v === food.serving ? `1 portion (${fmt(v)} g)` : `${v} g`}</button>`).join('')}</div>
    <label class="field"><span>Repas</span><select id="qty-meal">${MEALS.map(([m, l]) => `<option value="${m}" ${m === qtyCtx.meal ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <div class="small muted" style="margin-bottom:14px">Pour 100 g : ${fmt(food.kcal)} kcal · P ${fmt(food.p, 1)} · G ${fmt(food.c, 1)} · L ${fmt(food.f, 1)}</div>
    <button class="btn primary block" data-act="qtyConfirm">${qtyCtx.entryId ? 'Enregistrer' : 'Ajouter'}</button>
    ${qtyCtx.entryId ? '<button class="btn danger block" style="margin-top:10px" data-act="deleteEntry">Supprimer du repas</button>' : ''}`);
}
function openQuickAdd(ctx, entry) {
  qtyCtx = { ...ctx, entryId: entry ? entry.id : null };
  const v = k => entry && entry[k] != null ? fmtNum(r1(entry[k])) : '';
  openSheet(`<h3>Ajout rapide <button data-act="closeSheet">Fermer</button></h3>
    <label class="field"><span>Nom</span><input type="text" id="qa-name" value="${esc(entry ? entry.name : '')}" placeholder="Ex : repas au resto"></label>
    <div class="grid2">
      <label class="field"><span>Calories (kcal)</span><input type="text" inputmode="decimal" id="qa-kcal" value="${v('kcal')}"></label>
      <label class="field"><span>Protéines (g)</span><input type="text" inputmode="decimal" id="qa-p" value="${v('p')}"></label>
      <label class="field"><span>Glucides (g)</span><input type="text" inputmode="decimal" id="qa-c" value="${v('c')}"></label>
      <label class="field"><span>Lipides (g)</span><input type="text" inputmode="decimal" id="qa-f" value="${v('f')}"></label>
    </div>
    <label class="field"><span>Repas</span><select id="qty-meal">${MEALS.map(([m, l]) => `<option value="${m}" ${m === qtyCtx.meal ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <button class="btn primary block" data-act="quickConfirm">${entry ? 'Enregistrer' : 'Ajouter'}</button>
    ${entry ? '<button class="btn danger block" style="margin-top:10px" data-act="deleteEntry">Supprimer du repas</button>' : ''}`);
}
function openNewFood(ctx) {
  qtyCtx = { ...ctx };
  openSheet(`<h3>Créer un aliment <button data-act="closeSheet">Fermer</button></h3>
    <label class="field"><span>Nom</span><input type="text" id="nf-name" placeholder="Ex : Porridge maison"></label>
    <label class="field"><span>Marque (facultatif)</span><input type="text" id="nf-brand"></label>
    <div class="small muted" style="margin:0 2px 8px">Valeurs pour 100 g (voir l'étiquette)</div>
    <div class="grid2">
      <label class="field"><span>Calories (kcal)</span><input type="text" inputmode="decimal" id="nf-kcal"></label>
      <label class="field"><span>Protéines (g)</span><input type="text" inputmode="decimal" id="nf-p"></label>
      <label class="field"><span>Glucides (g)</span><input type="text" inputmode="decimal" id="nf-c"></label>
      <label class="field"><span>Lipides (g)</span><input type="text" inputmode="decimal" id="nf-f"></label>
    </div>
    <label class="field"><span>Taille d'une portion en g (facultatif)</span><input type="text" inputmode="decimal" id="nf-serving"></label>
    <button class="btn primary block" data-act="newFoodConfirm">Créer et ajouter</button>`);
}
function openBodySheet(entry) {
  const b = entry || { date: dayKey() };
  const cw = currentWeight();
  openSheet(`<h3>${entry ? 'Modifier la mesure' : 'Nouvelle mesure'} <button data-act="closeSheet">Fermer</button></h3>
    <label class="field"><span>Date</span><input type="date" id="body-date" value="${b.date}" max="${dayKey()}"></label>
    <div class="grid2">${BODY_FIELDS.map(([k, l, u]) => `<label class="field"><span>${l} (${u})</span><input type="text" inputmode="decimal" id="body-${k}" value="${fmtNum(b[k])}" placeholder="${k === 'weight' && cw && !entry ? fmtNum(cw) : ''}"></label>`).join('')}</div>
    <div class="note" style="margin-bottom:12px">Tout est facultatif sauf au moins une valeur. Conseil : pèse-toi le matin à jeun, dans les mêmes conditions.</div>
    <button class="btn primary block" data-act="bodyConfirm" data-id="${entry ? entry.id : ''}">Enregistrer</button>
    ${entry ? `<button class="btn danger block" style="margin-top:10px" data-act="bodyDelete" data-id="${entry.id}">Supprimer</button>` : ''}`);
}
function openExerciseForm(fromPicker) {
  openSheet(`<h3>Nouvel exercice <button data-act="closeSheet">Fermer</button></h3>
    <label class="field"><span>Nom</span><input type="text" id="nx-name" placeholder="Ex : Développé Smith"></label>
    <label class="field"><span>Groupe musculaire</span><select id="nx-group">${GROUPS.map(g => `<option>${g}</option>`).join('')}</select></label>
    <label class="field"><span>Type de suivi</span><select id="nx-type">${Object.entries(TYPES).map(([k, t]) => `<option value="${k}">${t.label}</option>`).join('')}</select></label>
    <button class="btn primary block" data-act="exerciseConfirm" data-from="${fromPicker ? 'picker' : ''}">Créer</button>`);
}
function showSummary(rec, prs) {
  openSheet(`<div class="summary-hero"><div class="trophy">${prs.length ? '🏆' : '💪'}</div><h3 style="justify-content:center;margin-bottom:4px">Séance terminée !</h3><div class="muted">${esc(rec.name)}</div></div>
    <div class="stats"><div class="stat"><b>${fmtDur(rec.end - rec.start)}</b><small>Durée</small></div><div class="stat"><b>${setCount(rec)}</b><small>Séries</small></div><div class="stat"><b>${fmt(volume(rec))}</b><small>Volume (kg)</small></div></div>
    ${prs.length ? `<div class="card"><h2>Nouveaux records</h2>${prs.map(p => { const x = ex(p.exId); return `<div class="row between" style="padding:4px 0"><span class="grow ellipsis">${esc(x.name)}</span><span class="pill ok">${fmtBest(x.type, p.now)}</span></div>`; }).join('')}</div>` : ''}
    <button class="btn primary block" data-act="closeSheet">Super</button>`);
}

/* ================= Actions ================= */
const ds = el => el.dataset;
const ints = el => ({ ei: +el.dataset.ei, si: +el.dataset.si });
function startWorkout(name, exercises, routineId) {
  state.active = { id: uid(), name, start: Date.now(), routineId: routineId || null, exercises, rest: null };
  save(); closeSheet(true);
  nav.tab = 'train'; nav.stack = [{ name: 'active', params: {} }]; render(); window.scrollTo(0, 0);
}
function discardActive() { state.active = null; save(); nav.tab = 'train'; nav.stack = []; render(); window.scrollTo(0, 0); }
function addEntry(date, entry) { (state.meals[date] = state.meals[date] || []).push(entry); }
function findEntry(id) { for (const [k, list] of Object.entries(state.meals)) { const i = list.findIndex(e => e.id === id); if (i >= 0) return { k, list, i, e: list[i] }; } return null; }
function touchRecent(id) { state.recentFoods = [id, ...state.recentFoods.filter(x => x !== id)].slice(0, 40); }
function rerenderFood() { const r = $('#food-results'); if (r) r.innerHTML = foodResultsHTML(); else render(true); }

const A = {
  back: () => back(),
  tab: el => setTab(ds(el).t),
  go: el => go(ds(el).v, { id: ds(el).id }),
  closeSheet: () => closeSheet(),
  confirmYes: () => confirmResolve && confirmResolve(true),
  confirmNo: () => confirmResolve && confirmResolve(false),
  hideInstall: () => { state.settings.hideInstall = true; save(); render(true); },

  // --- séances
  startPicker: () => startPickerSheet(),
  startEmpty: () => startWorkout('Séance du ' + fmtDate(Date.now(), { weekday: 'long' }), []),
  startRoutine: el => { const r = state.routines.find(x => x.id === ds(el).id); if (r) startWorkout(r.name, r.items.map(i => newExEntry(i.exId, i.sets, i.reps, i.rest, i.note)), r.id); },
  openActive: () => { nav.tab = 'train'; nav.stack = [{ name: 'active', params: {} }]; render(); window.scrollTo(0, 0); },
  addExToActive: () => openExercisePicker(id => { state.active.exercises.push(newExEntry(id)); save(); render(true); setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50); }),
  addSet: el => { const e = state.active.exercises[+ds(el).ei]; e.sets.push({ a: null, b: null, done: false }); save(); render(true); },
  removeSet: el => { const e = state.active.exercises[+ds(el).ei]; e.sets.pop(); save(); render(true); },
  usePrev: el => {
    const { ei, si } = ints(el), e = state.active.exercises[ei], p = lastSets(e.exId)[si];
    if (!p) return; Object.assign(e.sets[si], { a: p.a, b: p.b }); save(); render(true);
  },
  toggleSet: el => {
    unlockAudio();
    const { ei, si } = ints(el), e = state.active.exercises[ei], s = e.sets[si], x = ex(e.exId);
    if (s.done) { s.done = false; save(); render(true); return; }
    const src = lastSets(e.exId)[si] || e.sets[si - 1] || null;
    for (const [k] of TYPES[x.type].f) if (s[k] == null && src && src[k] != null) s[k] = src[k];
    if (TYPES[x.type].f.every(([k]) => s[k] == null)) { toast('Entre d\'abord tes valeurs'); return; }
    s.done = true; startRest(e.rest); save(); render(true);
  },
  restAdd: el => { const r = state.active && state.active.rest; if (!r) return; const d = +ds(el).v * 1000; r.end += d; r.total = Math.max(1, r.total + d / 1000); save(); renderRest(); },
  restSkip: () => { if (state.active) { state.active.rest = null; save(); renderRest(); } },
  restPicker: () => openSheet(`<h3>Repos par défaut <button data-act="closeSheet">Fermer</button></h3><div class="grid3">${[30, 45, 60, 75, 90, 120, 150, 180, 240].map(v => `<button class="btn ${state.settings.rest === v ? 'primary' : ''}" data-act="setRest" data-v="${v}">${mmss(v)}</button>`).join('')}</div>`),
  setRest: el => { state.settings.rest = +ds(el).v; save(); closeSheet(); render(true); },
  exMenu: el => {
    const ei = +ds(el).ei, n = state.active.exercises.length;
    openSheet(`<h3>${esc(ex(state.active.exercises[ei].exId).name)} <button data-act="closeSheet">Fermer</button></h3><div class="list">
      ${ei > 0 ? `<button class="item" data-act="exMove" data-ei="${ei}" data-d="-1">${I.up}<span class="grow">Monter</span></button>` : ''}
      ${ei < n - 1 ? `<button class="item" data-act="exMove" data-ei="${ei}" data-d="1">${I.down}<span class="grow">Descendre</span></button>` : ''}
      <button class="item" data-act="exReplace" data-ei="${ei}">${I.edit}<span class="grow">Remplacer l'exercice</span></button>
      <button class="item" style="color:var(--danger)" data-act="exRemove" data-ei="${ei}">${I.trash}<span class="grow">Retirer de la séance</span></button></div>`);
  },
  exMove: el => { const ei = +ds(el).ei, d = +ds(el).d, a = state.active.exercises; [a[ei], a[ei + d]] = [a[ei + d], a[ei]]; save(); closeSheet(); render(true); },
  exReplace: el => { const ei = +ds(el).ei; openExercisePicker(id => { const old = state.active.exercises[ei]; state.active.exercises[ei] = newExEntry(id, old.sets.length, old.target, old.rest, ''); save(); render(true); }); },
  exRemove: async el => { const ei = +ds(el).ei; if (await confirmBox('Retirer cet exercice de la séance ?', 'Retirer')) { state.active.exercises.splice(ei, 1); save(); render(true); } },
  cancelWorkout: async () => { if (await confirmBox('Abandonner la séance ? Rien ne sera enregistré.', 'Abandonner')) discardActive(); },
  finishWorkout: async () => {
    const w = state.active;
    const total = w.exercises.reduce((n, e) => n + e.sets.length, 0);
    const done = w.exercises.reduce((n, e) => n + e.sets.filter(s => s.done).length, 0);
    if (!done) { if (await confirmBox('Aucune série validée (✓). Abandonner la séance ?', 'Abandonner')) discardActive(); return; }
    if (done < total && !(await confirmBox(`${plural(total - done, 'série')} non validée${total - done > 1 ? 's' : ''} ne ser${total - done > 1 ? 'ont' : 'a'} pas enregistrée${total - done > 1 ? 's' : ''}. Terminer quand même ?`, 'Terminer', false))) return;
    const rec = {
      id: w.id, name: (w.name || '').trim() || 'Séance', routineId: w.routineId, start: w.start, end: Date.now(),
      exercises: w.exercises.map(e => ({ exId: e.exId, sets: e.sets.filter(s => s.done).map(s => ({ a: s.a ?? null, b: s.b ?? null })) })).filter(e => e.sets.length),
    };
    const prs = [];
    for (const e of rec.exercises) { const t = ex(e.exId).type, before = bestEver(e.exId), now = sessionBest(t, e.sets); if (before > 0 && now > before + 1e-9) prs.push({ exId: e.exId, now }); }
    state.workouts.unshift(rec); state.workouts.sort((a, b) => b.start - a.start);
    state.active = null; await saveNow();
    nav.tab = 'train'; nav.stack = []; render(); window.scrollTo(0, 0);
    showSummary(rec, prs);
  },
  openWorkout: el => go('workout', { id: ds(el).id }),
  repeatWorkout: el => { const w = state.workouts.find(x => x.id === ds(el).id); if (w) startWorkout(w.name, w.exercises.map(e => newExEntry(e.exId, e.sets.length)), w.routineId); },
  saveAsRoutine: el => {
    const w = state.workouts.find(x => x.id === ds(el).id); if (!w) return;
    const r = { id: uid(), name: w.name, items: w.exercises.map(e => ({ exId: e.exId, sets: e.sets.length, reps: '' })) };
    state.routines.push(r); save(); toast('Routine créée'); go('routine', { id: r.id });
  },
  deleteWorkout: async el => { if (await confirmBox('Supprimer définitivement cette séance ?', 'Supprimer')) { state.workouts = state.workouts.filter(w => w.id !== ds(el).id); save(); back(); } },

  showGuide: el => {
    const id = ds(el).id, x = ex(id);
    openSheet(`<h3><span class="ellipsis" style="flex:1">${esc(x.name)}</span><button data-act="closeSheet">Fermer</button></h3>
      ${guide(id) ? demoHTML(id) + guideHTML(id) : '<div class="note">Pas de démonstration pour cet exercice perso.</div>'}`);
  },
  toggleDemo: el => { el.classList.toggle('paused'); el.querySelector('.badge').textContent = el.classList.contains('paused') ? '▶' : '❚❚'; },

  // --- programmes
  progKind: el => { progKind = ds(el).k; render(true); },
  startSession: el => {
    const f = findSession(ds(el).id); if (!f) return;
    startWorkout(`${f.s.name} (${f.p.short})`, f.s.items.map(it => newExEntry(it[0], it[1], it[3], it[4], itemNote(it))), null);
  },
  addSession: el => {
    const key = ds(el).id, f = findSession(key); if (!f) return;
    state.routines.push({ id: uid(), name: `${f.s.name} (${f.p.short})`, program: `${f.p.name} · ${f.p.author}`, sessionKey: key,
      items: f.s.items.map(it => ({ exId: it[0], sets: it[1], reps: it[3], rest: it[4], note: itemNote(it) })) });
    save(); render(true); toast('Ajoutée à tes routines ✓');
  },

  // --- routines
  addTemplates: () => { for (const t of window.ROUTINE_TEMPLATES) state.routines.push({ id: uid(), name: t.name, items: t.items.map(([exId, sets, reps]) => ({ exId, sets, reps })) }); save(); render(true); toast('4 routines ajoutées'); },
  newRoutine: () => { const r = { id: uid(), name: 'Nouvelle routine', items: [] }; state.routines.push(r); save(); go('routine', { id: r.id }); },
  routineAddEx: el => { const r = state.routines.find(x => x.id === ds(el).id); openExercisePicker(id => { r.items.push({ exId: id, sets: 3, reps: ex(id).type === 'time' ? '45' : '8-12' }); save(); render(true); }); },
  routineMove: el => { const r = state.routines.find(x => x.id === ds(el).id), i = +ds(el).i, d = +ds(el).d; [r.items[i], r.items[i + d]] = [r.items[i + d], r.items[i]]; save(); render(true); },
  routineDel: el => { const r = state.routines.find(x => x.id === ds(el).id); r.items.splice(+ds(el).i, 1); save(); render(true); },
  deleteRoutine: async el => { if (await confirmBox('Supprimer cette routine ? Ton historique de séances est conservé.', 'Supprimer')) { state.routines = state.routines.filter(r => r.id !== ds(el).id); save(); back(); } },

  // --- exercices
  exG: el => { exFilter.g = ds(el).g; render(true); },
  openEx: el => go('exdetail', { id: ds(el).id }),
  pickG: el => { pickerFilter.g = ds(el).g; refreshPicker(); },
  pickEx: el => { const cb = pickerCb; pickerCb = null; closeSheet(); cb && cb(ds(el).id); },
  newExercise: el => openExerciseForm(ds(el).from === 'picker'),
  exerciseConfirm: el => {
    const name = $('#nx-name').value.trim(); if (!name) { toast('Donne un nom à l\'exercice'); return; }
    const e = { id: 'c-' + uid(), name, group: $('#nx-group').value, type: $('#nx-type').value, custom: true };
    state.customExercises.push(e); invalidateEx(); save();
    if (ds(el).from === 'picker' && pickerCb) { const cb = pickerCb; pickerCb = null; closeSheet(); cb(e.id); }
    else { closeSheet(); render(true); toast('Exercice créé'); }
  },
  deleteExercise: async el => {
    const id = ds(el).id, used = exHistory(id).length;
    if (!(await confirmBox(used ? `Cet exercice apparaît dans ${plural(used, 'séance')}. Le supprimer quand même ?` : 'Supprimer cet exercice ?', 'Supprimer'))) return;
    state.customExercises = state.customExercises.filter(e => e.id !== id);
    for (const r of state.routines) r.items = r.items.filter(i => i.exId !== id);
    invalidateEx(); save(); back();
  },

  // --- nutrition
  foodDay: el => { foodDate = addDays(foodDate, +ds(el).d); render(); },
  foodToday: () => { foodDate = dayKey(); render(); },
  addFood: el => { foodSearch.results = null; foodSearch.error = ''; foodSearch.q = ''; go('addfood', { date: foodDate, meal: ds(el).m }); },
  foodTab: el => { foodSearch.tab = ds(el).t; rerenderFood(); },
  clearSearch: () => { foodSearch.results = null; foodSearch.error = ''; foodSearch.q = ''; const q = $('#food-q'); if (q) q.value = ''; rerenderFood(); },
  foodSearch: async () => {
    const q = ($('#food-q') || {}).value?.trim() || '';
    if (q.length < 2) { toast('Tape au moins 2 lettres'); return; }
    document.activeElement && document.activeElement.blur();
    foodSearch.q = q; foodSearch.loading = true; foodSearch.error = ''; rerenderFood();
    try {
      const res = await offSearch(q);
      res.forEach(f => { tempFoods[f.id] = f; });
      foodSearch.results = res;
    } catch (e) {
      foodSearch.results = null;
      foodSearch.error = navigator.onLine === false ? 'Pas de connexion internet. Utilise « Créer » ou « Ajout rapide ».' : 'La recherche Open Food Facts n\'a pas répondu. Réessaie dans un instant.';
    }
    foodSearch.loading = false; rerenderFood();
  },
  pickFood: el => {
    const id = ds(el).id, f = state.foods[id] || tempFoods[id]; if (!f) return;
    const p = cur().params; openQtySheet(f, { date: p.date, meal: p.meal });
  },
  qtySet: el => { const v = +ds(el).v; const i = $('#qty-g'); if (i) i.value = fmtNum(v); qtyCtx.g = v; $('#qty-prev').innerHTML = previewHTML(scale(qtyCtx.food, v)); },
  qtyConfirm: () => {
    const g = num($('#qty-g').value); if (!g || g <= 0) { toast('Quantité invalide'); return; }
    const f = qtyCtx.food, m = scale(f, g), meal = $('#qty-meal').value;
    state.foods[f.id] = f; touchRecent(f.id);
    if (qtyCtx.entryId) { const fe = findEntry(qtyCtx.entryId); if (fe) Object.assign(fe.e, { meal, g, ...m }); }
    else addEntry(qtyCtx.date, { id: uid(), meal, foodId: f.id, name: f.brand ? `${f.name} (${f.brand})` : f.name, g, ...m });
    save(); const editing = !!qtyCtx.entryId; closeSheet();
    if (editing) render(true); else { toast(`✓ Ajouté : ${fmt(m.kcal)} kcal`); rerenderFood(); }
  },
  quickAdd: () => { const p = cur().params; openQuickAdd({ date: p.date, meal: p.meal }); },
  quickConfirm: () => {
    const kcal = num($('#qa-kcal').value); if (kcal == null) { toast('Indique au moins les calories'); return; }
    const e = { name: $('#qa-name').value.trim() || 'Ajout rapide', meal: $('#qty-meal').value, g: null, kcal, p: num($('#qa-p').value) || 0, c: num($('#qa-c').value) || 0, f: num($('#qa-f').value) || 0 };
    if (qtyCtx.entryId) { const fe = findEntry(qtyCtx.entryId); if (fe) Object.assign(fe.e, e); }
    else addEntry(qtyCtx.date, { id: uid(), foodId: null, ...e });
    save(); const editing = !!qtyCtx.entryId; closeSheet();
    if (editing) render(true); else { toast('✓ Ajouté'); rerenderFood(); }
  },
  editEntry: el => {
    const fe = findEntry(ds(el).id); if (!fe) return;
    const food = fe.e.foodId && state.foods[fe.e.foodId];
    if (food) openQtySheet(food, { date: fe.k, meal: fe.e.meal, entryId: fe.e.id, g: fe.e.g });
    else openQuickAdd({ date: fe.k, meal: fe.e.meal }, fe.e);
  },
  deleteEntry: () => { const fe = findEntry(qtyCtx.entryId); if (fe) { fe.list.splice(fe.i, 1); if (!fe.list.length) delete state.meals[fe.k]; } save(); closeSheet(); render(true); },
  newFood: () => { const p = cur().params; openNewFood({ date: p.date, meal: p.meal }); },
  newFoodConfirm: () => {
    const name = $('#nf-name').value.trim(), kcal = num($('#nf-kcal').value);
    if (!name || kcal == null) { toast('Nom et calories obligatoires'); return; }
    const f = { id: 'c:' + uid(), name, brand: $('#nf-brand').value.trim(), kcal, p: num($('#nf-p').value) || 0, c: num($('#nf-c').value) || 0, f: num($('#nf-f').value) || 0, serving: num($('#nf-serving').value), source: 'custom' };
    state.foods[f.id] = f; save();
    openQtySheet(f, { date: qtyCtx.date, meal: qtyCtx.meal });
  },
  barcode: () => {
    const p = cur().params; qtyCtx = { date: p.date, meal: p.meal };
    openSheet(`<h3>Code-barres <button data-act="closeSheet">Fermer</button></h3>
      <form data-submit="barcodeGo"><label class="field"><span>Les chiffres sous le code-barres (8 ou 13)</span><input type="text" inputmode="numeric" id="bc" autocomplete="off" placeholder="3017620422003"></label>
      <button class="btn primary block" type="submit">Rechercher</button></form><div id="bc-msg" class="note center" style="margin-top:12px"></div>`);
  },
  barcodeGo: async () => {
    const code = ($('#bc').value || '').replace(/\D/g, ''), msg = $('#bc-msg');
    if (code.length < 8) { msg.textContent = 'Code trop court.'; return; }
    msg.innerHTML = '<div class="spinner"></div>';
    try {
      const f = await offBarcode(code);
      if (!f) { msg.textContent = 'Produit introuvable ou sans valeurs nutritionnelles. Crée-le avec « Créer ».'; return; }
      openQtySheet(f, { date: qtyCtx.date, meal: qtyCtx.meal });
    } catch (e) { msg.textContent = 'Impossible de joindre Open Food Facts. Vérifie ta connexion.'; }
  },
  copyYesterday: () => {
    const src = dayEntries(addDays(foodDate, -1));
    for (const e of src) addEntry(foodDate, { ...e, id: uid() });
    save(); render(true); toast(`${plural(src.length, 'aliment')} copié${src.length > 1 ? 's' : ''}`);
  },

  // --- corps
  addBody: () => openBodySheet(null),
  editBody: el => openBodySheet(state.body.find(b => b.id === ds(el).id)),
  bodyConfirm: el => {
    const date = $('#body-date').value || dayKey(), vals = {};
    for (const [k] of BODY_FIELDS) { const v = num($('#body-' + k).value); if (v != null) vals[k] = v; }
    if (!Object.keys(vals).length) { toast('Entre au moins une valeur'); return; }
    const id = ds(el).id;
    if (id) { const b = state.body.find(x => x.id === id); for (const [k] of BODY_FIELDS) delete b[k]; Object.assign(b, { date }, vals); }
    else { const same = state.body.find(b => b.date === date); if (same) Object.assign(same, vals); else state.body.push({ id: uid(), date, ...vals }); }
    save(); closeSheet(); render(true); toast('Mesure enregistrée');
  },
  bodyDelete: async el => { const id = ds(el).id; if (await confirmBox('Supprimer cette mesure ?', 'Supprimer')) { state.body = state.body.filter(b => b.id !== id); save(); render(true); } },
  progRange: el => { progRange = ds(el).r; render(true); },

  // --- réglages
  setSex: el => { state.settings.profile.sex = ds(el).v; save(); render(true); },
  exportData: async () => {
    const data = JSON.stringify({ app: 'monfit', exportedAt: new Date().toISOString(), ...state });
    const name = `monfit-sauvegarde-${dayKey()}.json`;
    const file = new File([data], name, { type: 'application/json' });
    const mark = () => { state.settings.lastExport = Date.now(); save(); render(true); };
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Sauvegarde MonFit' }); mark(); return; }
      catch (e) { if (e.name === 'AbortError') return; }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = name;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 10000); mark();
  },
  importData: () => $('#import-file').click(),
  resetAll: async () => {
    if (!(await confirmBox('Effacer toutes tes données (séances, repas, mesures) ? Pense à exporter avant.', 'Tout effacer'))) return;
    state = defaults(); invalidateEx(); await saveNow(); nav.stack = []; render(); toast('Données effacées');
  },
};

/* Saisies (sans re-rendu pour garder le clavier ouvert) */
const IN = {
  wName: el => { state.active.name = el.value; save(); },
  setVal: el => { const { ei, si } = ints(el); state.active.exercises[ei].sets[si][ds(el).k] = num(el.value); save(); },
  routineName: el => { const r = state.routines.find(x => x.id === ds(el).id); if (r) { r.name = el.value; save(); } },
  routineItem: el => { const r = state.routines.find(x => x.id === ds(el).id), it = r && r.items[+ds(el).i]; if (!it) return; if (ds(el).k === 'sets') it.sets = Math.max(1, Math.min(20, parseInt(el.value) || 1)); else it.reps = el.value.trim(); save(); },
  exQ: el => { exFilter.q = el.value; $('#ex-list').innerHTML = exListHTML(exFilter.q, exFilter.g, 'openEx'); },
  pickQ: el => { pickerFilter.q = el.value; refreshPicker(); },
  qtyG: el => { const g = num(el.value) || 0; qtyCtx.g = g; $('#qty-prev').innerHTML = previewHTML(scale(qtyCtx.food, g)); },
};
const CH = {
  routineRest: el => { const r = state.routines.find(x => x.id === ds(el).id), it = r && r.items[+ds(el).i]; if (it) { it.rest = +el.value || null; save(); } },
  profile: el => { const v = num(el.value); state.settings.profile[ds(el).k] = v; save(); render(true); },
  activity: el => { state.settings.profile.activity = +el.value; save(); render(true); },
  goalType: el => { state.settings.profile.goal = el.value; save(); render(true); },
  goalsAuto: el => { state.settings.goals.auto = el.checked; save(); render(true); },
  goal: el => { const v = num(el.value); if (v != null) state.settings.goals[ds(el).k] = v; save(); },
  rest: el => { state.settings.rest = +el.value; save(); },
  importFile: async el => {
    const f = el.files && el.files[0]; el.value = ''; if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (!d || !Array.isArray(d.workouts) || !d.settings) throw new Error('format');
      if (!(await confirmBox('Remplacer toutes les données actuelles par cette sauvegarde ?', 'Remplacer'))) return;
      delete d.app; delete d.exportedAt;
      state = migrate(d); invalidateEx(); await saveNow(); nav.stack = []; render(); toast('Sauvegarde importée ✓');
    } catch (e) { toast('Fichier de sauvegarde invalide'); }
  },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = A[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el, e); }
});
document.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.in; if (k && IN[k]) IN[k](e.target, e); });
document.addEventListener('change', e => { const k = e.target.dataset && e.target.dataset.ch; if (k && CH[k]) CH[k](e.target, e); });
document.addEventListener('submit', e => { const k = e.target.dataset && e.target.dataset.submit; if (k) { e.preventDefault(); A[k] && A[k](e.target, e); } });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveNow();
  else { const a = document.activeElement; if (!a || !/INPUT|SELECT|TEXTAREA/.test(a.tagName)) render(true); }
});

/* ================= Démarrage ================= */
async function init() {
  await store.init();
  let saved;
  try { saved = await store.get('state'); } catch (e) { console.error(e); }
  state = migrate(saved);
  if (state.active && state.active.rest && state.active.rest.end < Date.now()) state.active.rest = null;
  render();
  setInterval(tick, 500);
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
}
init();

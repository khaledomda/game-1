// Local, private persistence. Everything stays on the device.
import { JUNK_ITEMS, HEALTHY_ITEMS } from './i18n.js';

const KEY = 'vitaland.v1';

const defaults = () => ({
  settings: { lang: null, sound: true, music: true, voice: true },
  players: [],
  current: null,
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch (e) { /* storage unavailable */ }
  return defaults();
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

export const db = () => state;
export const settings = () => state.settings;

export function resetAll() {
  state = defaults();
  save();
}

export function dayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addPlayer({ name, age, gender, char }) {
  const p = {
    id: Math.random().toString(36).slice(2, 10),
    name: name.trim().slice(0, 16),
    age, gender, char,
    created: Date.now(),
    checkins: {},
    best: 0,
    games: 0,
    maxWorld: 1,
    quizRight: 0,
    bestCombo: 0,
    badges: [],
    scores: [],
  };
  state.players.push(p);
  state.current = p.id;
  save();
  return p;
}

export function updatePlayer(p) {
  const i = state.players.findIndex((x) => x.id === p.id);
  if (i >= 0) state.players[i] = p;
  save();
}

export function deletePlayer(id) {
  state.players = state.players.filter((p) => p.id !== id);
  if (state.current === id) state.current = state.players[0]?.id ?? null;
  save();
}

export const currentPlayer = () => state.players.find((p) => p.id === state.current) || null;
export function setCurrent(id) { state.current = id; save(); }

// Vitality 0..100 from a check-in. Healthy food raises it, junk lowers it more strongly.
export function computeVitality(junk, healthy) {
  let j = 0, h = 0;
  for (const it of JUNK_ITEMS) j += (junk[it.id] || 0) * it.w;
  for (const it of HEALTHY_ITEMS) h += Math.min(healthy[it.id] || 0, it.id === 'water' ? 8 : 5) * it.w;
  const v = 45 + h * 7 - j * 11;
  return Math.max(5, Math.min(100, Math.round(v)));
}

export function todayCheckin(p) { return p?.checkins[dayKey()] || null; }

export function saveCheckin(p, junk, healthy) {
  const vitality = computeVitality(junk, healthy);
  const junkTotal = Object.values(junk).reduce((a, b) => a + b, 0);
  const healthyTotal = Object.values(healthy).reduce((a, b) => a + b, 0);
  p.checkins[dayKey()] = { junk, healthy, vitality, junkTotal, healthyTotal, at: Date.now() };
  updatePlayer(p);
  return p.checkins[dayKey()];
}

// Consecutive days (ending today or yesterday) with vitality >= 60.
export function healthyStreak(p) {
  let n = 0;
  const d = new Date();
  if (!p.checkins[dayKey(d)]) d.setDate(d.getDate() - 1);
  for (;;) {
    const c = p.checkins[dayKey(d)];
    if (!c || c.vitality < 60) break;
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function lastDays(p, count = 7) {
  const out = [];
  const d = new Date();
  d.setDate(d.getDate() - (count - 1));
  for (let i = 0; i < count; i++) {
    out.push({ date: new Date(d), c: p.checkins[dayKey(d)] || null });
    d.setDate(d.getDate() + 1);
  }
  return out;
}

// Returns list of newly earned badge ids.
export function awardBadges(p) {
  const earned = [];
  const give = (id, cond) => {
    if (cond && !p.badges.includes(id)) { p.badges.push(id); earned.push(id); }
  };
  const today = todayCheckin(p);
  const streak = healthyStreak(p);
  give('first', Object.keys(p.checkins).length > 0);
  give('clean', today && today.junkTotal === 0);
  give('streak3', streak >= 3);
  give('streak7', streak >= 7);
  give('score1k', p.best >= 1000);
  give('score5k', p.best >= 5000);
  give('world3', p.maxWorld >= 3);
  give('world5', p.maxWorld >= 5);
  give('quiz5', p.quizRight >= 5);
  give('combo20', p.bestCombo >= 20);
  if (earned.length) updatePlayer(p);
  return earned;
}

export function recordGame(p, { score, world, combo }) {
  const isBest = score > p.best;
  p.best = Math.max(p.best, score);
  p.games++;
  p.maxWorld = Math.max(p.maxWorld, world);
  p.bestCombo = Math.max(p.bestCombo, combo);
  p.scores.push({ score, at: Date.now() });
  p.scores = p.scores.slice(-30);
  updatePlayer(p);
  return isBest;
}

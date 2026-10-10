// Procedural sound effects, background music and spoken phrases (Web Audio + Web Speech).
import { settings } from './storage.js';
import { getLang } from './i18n.js';

let ac = null;
let master, sfxBus, musicBus;

export function unlockAudio() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = 0.9;
    master.connect(ac.destination);
    sfxBus = ac.createGain();
    sfxBus.gain.value = 0.55;
    sfxBus.connect(master);
    musicBus = ac.createGain();
    musicBus.gain.value = 0.16;
    musicBus.connect(master);
  }
  if (ac.state === 'suspended') ac.resume();
  // Prime speech voices (Chrome loads them lazily).
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
}

function tone({ f = 440, f2 = null, type = 'sine', dur = 0.15, vol = 0.5, at = 0, bus = sfxBus, vib = 0 }) {
  if (!ac) return;
  const t0 = ac.currentTime + at;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  if (vib) {
    const lfo = ac.createOscillator();
    const lg = ac.createGain();
    lfo.frequency.value = 7;
    lg.gain.value = vib;
    lfo.connect(lg).connect(o.frequency);
    lfo.start(t0);
    lfo.stop(t0 + dur + 0.05);
  }
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(bus);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

function noise({ dur = 0.25, vol = 0.3, at = 0, freq = 800 }) {
  if (!ac) return;
  const t0 = ac.currentTime + at;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filt = ac.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = freq;
  const g = ac.createGain();
  g.gain.value = vol;
  src.connect(filt).connect(g).connect(sfxBus);
  src.start(t0);
}

const SFX = {
  click: () => tone({ f: 660, f2: 990, type: 'triangle', dur: 0.08, vol: 0.35 }),
  collect: (combo = 0) => {
    const base = 523 * Math.pow(2, Math.min(combo, 12) / 12);
    tone({ f: base, type: 'triangle', dur: 0.09, vol: 0.4 });
    tone({ f: base * 1.5, type: 'sine', dur: 0.14, vol: 0.3, at: 0.05 });
  },
  hit: () => {
    tone({ f: 220, f2: 70, type: 'sawtooth', dur: 0.35, vol: 0.35 });
    noise({ dur: 0.3, vol: 0.35, freq: 600 });
  },
  power: () => {
    tone({ f: 300, f2: 1200, type: 'sawtooth', dur: 0.4, vol: 0.2 });
    [0, 0.08, 0.16, 0.24].forEach((at, i) => tone({ f: 660 * (1 + i * 0.25), type: 'triangle', dur: 0.12, vol: 0.3, at: at + 0.2 }));
  },
  pop: () => { tone({ f: 900, f2: 300, type: 'square', dur: 0.08, vol: 0.12 }); noise({ dur: 0.1, vol: 0.2, freq: 2500 }); },
  cheer: () => [523, 659, 784, 1047].forEach((f, i) => tone({ f, type: 'triangle', dur: 0.3, vol: 0.35, at: i * 0.09 })),
  fanfare: () => {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone({ f, type: 'square', dur: 0.18, vol: 0.12, at: i * 0.11 }));
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone({ f: f / 2, type: 'triangle', dur: 0.2, vol: 0.3, at: i * 0.11 }));
  },
  sad: () => [392, 370, 349, 294].forEach((f, i) => tone({ f, type: 'triangle', dur: i === 3 ? 0.8 : 0.32, vol: 0.35, at: i * 0.32, vib: i === 3 ? 10 : 0 })),
  over: () => [392, 330, 262, 196].forEach((f, i) => tone({ f, type: 'triangle', dur: 0.35, vol: 0.35, at: i * 0.22 })),
  tick: () => tone({ f: 1200, type: 'sine', dur: 0.04, vol: 0.15 }),
};

export function sfx(name, arg) {
  if (!settings().sound || !ac) return;
  SFX[name]?.(arg);
}

// ---------- Music: tiny look-ahead sequencer ----------
const SCALE = [0, 2, 4, 7, 9]; // major pentatonic
const ROOTS = [0, 9, 5, 7]; // I - vi - IV - V
let musicTimer = null;
let step = 0;
let nextTime = 0;
let tempo = 112;
let seed = 1;

const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

function schedule() {
  const spb = 60 / tempo / 2; // eighth notes
  while (nextTime < ac.currentTime + 0.2) {
    const bar = Math.floor(step / 8) % 4;
    const root = 60 + ROOTS[bar];
    const at = nextTime - ac.currentTime;
    // bass on beats
    if (step % 4 === 0) tone({ f: midi(root - 24), type: 'triangle', dur: spb * 3.5, vol: 0.5, at, bus: musicBus });
    if (step % 4 === 2) tone({ f: midi(root - 17), type: 'triangle', dur: spb * 1.5, vol: 0.3, at, bus: musicBus });
    // melody
    if (rnd() < 0.62) {
      const deg = SCALE[Math.floor(rnd() * SCALE.length)];
      const oct = rnd() < 0.3 ? 0 : 12;
      tone({ f: midi(60 + deg + oct), type: 'square', dur: spb * 0.9, vol: 0.13, at, bus: musicBus });
    }
    // soft hat
    if (step % 2 === 1) tone({ f: 8000, type: 'square', dur: 0.02, vol: 0.02, at, bus: musicBus });
    nextTime += spb;
    step++;
    if (step % 32 === 0) seed = 7; // repeat the same 4-bar phrase for a catchy loop
  }
}

export function startMusic(bpm = 112) {
  tempo = bpm;
  if (!ac || !settings().music) return;
  if (musicTimer) return;
  seed = 7;
  step = 0;
  nextTime = ac.currentTime + 0.05;
  musicTimer = setInterval(schedule, 50);
}

export function setTempo(bpm) { tempo = bpm; }

export function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
}

// ---------- Speech ----------
let lastSpeak = 0;
function pickVoice(lang) {
  const voices = speechSynthesis.getVoices();
  const pref = lang === 'ar' ? 'ar' : 'en';
  const list = voices.filter((v) => v.lang.toLowerCase().startsWith(pref));
  // Prefer natural / female-sounding / Google voices which tend to be friendlier for kids.
  return list.find((v) => /natural|google|female|zira|samantha|hoda|zariyah|laila|salma/i.test(v.name)) || list[0] || null;
}

export function speak(text, { force = false, minGap = 2500 } = {}) {
  if (!settings().voice || !('speechSynthesis' in window)) return;
  const now = performance.now();
  if (!force && now - lastSpeak < minGap) return;
  lastSpeak = now;
  const lang = getLang();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
  const v = pickVoice(lang);
  if (v) u.voice = v;
  u.rate = lang === 'ar' ? 0.95 : 1.0;
  u.pitch = 1.25;
  u.volume = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

export function stopSpeech() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

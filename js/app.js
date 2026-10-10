// Vitaland UI controller: screens, daily check-in, hub, game overlays, sharing, PWA.
import { t, L, num, phrase, setLang, getLang, JUNK_ITEMS, HEALTHY_ITEMS, FACTS, QUIZZES, WORLDS, BADGES } from './i18n.js';
import * as store from './storage.js';
import { CHARACTERS, charById, renderPortrait, drawHero, drawChipsBag, SKIES } from './art.js';
import { unlockAudio, sfx, speak, startMusic, stopMusic, stopSpeech } from './audio.js';
import { Game, vitalityStats } from './game.js';

const ui = document.getElementById('ui');
const modal = document.getElementById('modal');
const toastEl = document.getElementById('toast');
const canvas = document.getElementById('game');

let game = null;
let animFrame = 0;
let deferredInstall = null;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (sel, root = ui) => root.querySelector(sel);
const $$ = (sel, root = ui) => [...root.querySelectorAll(sel)];

function charName(ch) { return L(ch); }

// ---------- helpers ----------
function stopAnim() { cancelAnimationFrame(animFrame); animFrame = 0; }

// Animate one or more hero canvases. items: [{canvas, ch, opts}]
function animatePortraits(items) {
  stopAnim();
  const start = performance.now();
  const tick = (now) => {
    const tt = Math.max(0, (now - start) / 1000);
    for (const it of items) {
      if (!it.canvas.isConnected) continue;
      const o = typeof it.opts === 'function' ? it.opts(tt) : it.opts;
      renderPortrait(it.canvas, typeof it.ch === 'function' ? it.ch(tt) : it.ch, { ...o, t: tt });
    }
    animFrame = requestAnimationFrame(tick);
  };
  animFrame = requestAnimationFrame(tick);
}

function screen(html, cls = '') {
  stopAnim();
  closeModal();
  ui.innerHTML = `<div class="screen ${cls}">${html}</div>`;
  ui.scrollTop = 0;
  bindClicks();
}

function bindClicks() {
  for (const b of $$('button')) b.addEventListener('click', () => sfx('click'), { capture: true });
}

function toast(msg, ms = 2600) {
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => toastEl.classList.add('hidden'), ms);
}

function vitalityLabel(v) {
  const labels = t('vitalityLabels');
  return labels[v < 25 ? 0 : v < 45 ? 1 : v < 65 ? 2 : v < 85 ? 3 : 4];
}
function vitalityClass(v) { return v >= 65 ? '' : v >= 40 ? 'mid' : 'bad'; }
// Keeps the gradient anchored to the full meter so the colour shows the real level.
function meterSize(v) { return `${(10000 / Math.max(v, 1)).toFixed(1)}% 100%`; }
function moodFor(v) { return v >= 80 ? 'yay' : v < 40 ? 'tired' : 'happy'; }

function iconHTML(icon) {
  return icon === 'chips' ? '<canvas data-chips></canvas>' : icon;
}
function paintChips(root = ui) {
  for (const c of root.querySelectorAll('canvas[data-chips]')) {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = c.clientWidth || 58, h = c.clientHeight || 58;
    c.width = w * dpr; c.height = h * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.translate(w / 2, h / 2);
    drawChipsBag(ctx, Math.min(w, h) * 0.95);
  }
}

function langButton() {
  return `<button class="btn small lang-toggle" data-act="lang">${getLang() === 'ar' ? 'English' : 'العربية'}</button>`;
}

function onAct(name, fn) {
  for (const el of $$(`[data-act="${name}"]`)) el.addEventListener('click', fn);
}

function bindCommon(rerender) {
  onAct('lang', () => {
    const s = store.settings();
    s.lang = getLang() === 'ar' ? 'en' : 'ar';
    store.save();
    setLang(s.lang);
    stopSpeech();
    rerender();
  });
  onAct('settings', () => openSettings(rerender));
  onAct('howto', openHowTo);
}

// ---------- language picker (first launch) ----------
function showLangPick() {
  screen(`
    <div class="logo"><h1>Vitaland</h1><div class="sub">فيتالاند</div></div>
    <canvas class="hero-stage" id="stage"></canvas>
    <div class="card lang-pick">
      <button class="btn primary" data-l="ar">العربية</button>
      <button class="btn" data-l="en">English</button>
    </div>`, 'center');
  const stage = $('#stage');
  animatePortraits([{ canvas: stage, ch: (tt) => CHARACTERS[Math.floor(tt / 2.2) % CHARACTERS.length], opts: { mood: 'yay', glow: 1, scale: 0.62 } }]);
  for (const b of $$('[data-l]')) {
    b.addEventListener('click', () => {
      store.settings().lang = b.dataset.l;
      store.save();
      setLang(b.dataset.l);
      showTitle();
    });
  }
}

// ---------- title ----------
function showTitle() {
  screen(`
    <div class="topbar">
      ${langButton()}
      <span class="spacer"></span>
      <button class="btn icon" data-act="howto" aria-label="${t('howTo')}">❔</button>
      <button class="btn icon" data-act="settings" aria-label="${t('settings')}">⚙️</button>
    </div>
    <div class="logo"><h1>${t('appName')}</h1><div class="sub">${t('tagline')}</div></div>
    <canvas class="hero-stage" id="stage"></canvas>
    <div class="title-cast">${CHARACTERS.map((c) => `<canvas data-cast="${c.id}" title="${esc(charName(c))}"></canvas>`).join('')}</div>
    <button class="btn primary big block" id="play">▶ ${t('play')}</button>
    <p class="footer-note">${t('parentsNote')}</p>
  `, 'center');
  bindCommon(showTitle);
  const stage = $('#stage');
  const items = [{ canvas: stage, ch: (tt) => CHARACTERS[Math.floor(tt / 2.2) % CHARACTERS.length], opts: { mood: 'yay', glow: 1, scale: 0.62 } }];
  for (const c of $$('[data-cast]')) items.push({ canvas: c, ch: charById(c.dataset.cast), opts: { mood: 'happy', glider: false, scale: 0.85 } });
  animatePortraits(items);
  $('#play').addEventListener('click', () => {
    if (!store.db().players.length) showCreate();
    else showPlayers();
  });
}

// ---------- players ----------
function showPlayers() {
  const players = store.db().players;
  screen(`
    <div class="topbar">
      <button class="btn icon" id="back" aria-label="${t('back')}">${getLang() === 'ar' ? '→' : '←'}</button>
      <h2>${t('players')}</h2>
      ${langButton()}
    </div>
    <div class="players">
      ${players.map((p) => {
        const c = store.todayCheckin(p);
        const chip = c ? `<span class="chip ${vitalityClass(c.vitality)}">⚡ ${num(c.vitality)}</span>` : `<span class="chip mid">📝 ${t('checkinNeeded')}</span>`;
        return `<button class="player-card" data-id="${p.id}">
          <canvas data-ch="${p.char}"></canvas>
          <div class="name">${esc(p.name)}</div>
          <div class="meta">${chip}</div>
          <div class="meta">🏆 ${num(p.best)}</div>
        </button>`;
      }).join('')}
      <button class="player-card add" id="add"><span class="plus">＋</span>${t('addPlayer')}</button>
    </div>
  `);
  bindCommon(showPlayers);
  $('#back').addEventListener('click', showTitle);
  $('#add').addEventListener('click', showCreate);
  const items = [];
  for (const c of $$('canvas[data-ch]')) items.push({ canvas: c, ch: charById(c.dataset.ch), opts: { mood: 'happy', glider: false, scale: 0.85 } });
  animatePortraits(items);
  for (const b of $$('.player-card[data-id]')) {
    b.addEventListener('click', () => {
      store.setCurrent(b.dataset.id);
      goToPlayer(store.currentPlayer());
    });
  }
}

function goToPlayer(p) {
  if (!store.todayCheckin(p)) showCheckin(p);
  else showHub(p);
}

// ---------- create hero ----------
function showCreate() {
  const draft = { name: '', age: 8, gender: 'f', char: CHARACTERS[0].id };
  screen(`
    <div class="topbar">
      <button class="btn icon" id="back" aria-label="${t('back')}">${getLang() === 'ar' ? '→' : '←'}</button>
      <h2>${t('newHero')}</h2>
      ${langButton()}
    </div>
    <div class="card field">
      <label for="nm">${t('yourName')}</label>
      <input class="input" id="nm" maxlength="16" autocomplete="off" placeholder="${t('namePh')}" />
    </div>
    <div class="card field">
      <label>${t('age')}</label>
      <div class="age-row"><input type="range" id="age" min="5" max="15" value="8" /><span class="age-val" id="ageV">${num(8)}</span></div>
      <label style="margin-top:10px">${t('iAm')}</label>
      <div class="seg"><button class="btn" data-g="m">👦 ${t('boy')}</button><button class="btn on" data-g="f">👧 ${t('girl')}</button></div>
    </div>
    <div class="card field">
      <label>${t('chooseHero')}</label>
      <div class="char-grid">
        ${CHARACTERS.map((c) => `<button class="char-opt ${c.id === draft.char ? 'on' : ''}" data-c="${c.id}">
          <canvas data-ch="${c.id}"></canvas>
          <div class="n">${esc(charName(c))}</div>
          <div class="a">${c.icon} ${L(c.abilityName)}</div>
        </button>`).join('')}
      </div>
    </div>
    <button class="btn primary big block" id="save" disabled>✔ ${t('save')}</button>
  `);
  bindCommon(showCreate);
  $('#back').addEventListener('click', () => (store.db().players.length ? showPlayers() : showTitle()));
  const nm = $('#nm');
  const save = $('#save');
  nm.addEventListener('input', () => { draft.name = nm.value; save.disabled = !nm.value.trim(); });
  $('#age').addEventListener('input', (e) => { draft.age = +e.target.value; $('#ageV').textContent = num(draft.age); });
  for (const b of $$('[data-g]')) b.addEventListener('click', () => {
    draft.gender = b.dataset.g;
    $$('[data-g]').forEach((x) => x.classList.toggle('on', x === b));
  });
  for (const b of $$('[data-c]')) b.addEventListener('click', () => {
    draft.char = b.dataset.c;
    $$('[data-c]').forEach((x) => x.classList.toggle('on', x === b));
    const ch = charById(draft.char);
    speak(`${charName(ch)}! ${L(ch.abilityName)}`, { force: true });
  });
  const items = [];
  for (const c of $$('canvas[data-ch]')) {
    const ch = charById(c.dataset.ch);
    items.push({ canvas: c, ch, opts: () => ({ mood: draft.char === ch.id ? 'yay' : 'happy', glider: false, scale: 0.85, glow: draft.char === ch.id ? 1 : 0 }) });
  }
  animatePortraits(items);
  save.addEventListener('click', () => {
    if (!draft.name.trim()) return;
    const p = store.addPlayer(draft);
    showCheckin(p);
  });
}

// ---------- daily check-in ----------
function showCheckin(p, step = 0, data = null) {
  const prev = store.todayCheckin(p);
  data = data || { junk: { ...(prev?.junk || {}) }, healthy: { ...(prev?.healthy || {}) } };
  const isJunk = step === 0;
  const items = isJunk ? JUNK_ITEMS : HEALTHY_ITEMS;
  const bucket = isJunk ? data.junk : data.healthy;
  screen(`
    <div class="topbar">
      <button class="btn icon" id="back" aria-label="${t('back')}">${getLang() === 'ar' ? '→' : '←'}</button>
      <h2>${t('checkinTitle')}</h2>
      ${langButton()}
    </div>
    <div class="steps"><span class="on"></span><span class="${step ? 'on' : ''}"></span></div>
    <div class="banner ${isJunk ? 'junk' : 'healthy'}">
      <p>${t('checkinSub')}</p>
      <h2>${isJunk ? '🍟 ' + t('junkStep') : '🥗 ' + t('healthyStep')}</h2>
    </div>
    <div class="counters">
      ${items.map((it) => `<div class="counter ${isJunk ? '' : 'healthy'} ${bucket[it.id] ? 'has' : ''}" data-id="${it.id}">
        <div class="ico">${iconHTML(it.icon)}</div>
        <div class="lbl">${L(it)}</div>
        <div class="ctl"><button class="minus" aria-label="-">−</button><span class="val">${num(bucket[it.id] || 0)}</span><button class="plus" aria-label="+">+</button></div>
      </div>`).join('')}
    </div>
    <p class="honest">🦸 ${t('honest')}</p>
    <button class="btn ${isJunk ? 'primary' : 'good'} big block" id="next">${isJunk ? t('next') + (getLang() === 'ar' ? ' ←' : ' →') : '✔ ' + t('done')}</button>
  `);
  bindCommon(() => showCheckin(p, step, data));
  paintChips();
  $('#back').addEventListener('click', () => {
    if (step) showCheckin(p, 0, data);
    else if (store.todayCheckin(p)) showHub(p);
    else showPlayers();
  });
  for (const el of $$('.counter')) {
    const id = el.dataset.id;
    const val = el.querySelector('.val');
    const set = (n) => {
      bucket[id] = Math.max(0, Math.min(12, n));
      val.textContent = num(bucket[id]);
      el.classList.toggle('has', bucket[id] > 0);
    };
    el.querySelector('.plus').addEventListener('click', () => { set((bucket[id] || 0) + 1); sfx('collect', bucket[id]); });
    el.querySelector('.minus').addEventListener('click', () => set((bucket[id] || 0) - 1));
  }
  $('#next').addEventListener('click', () => {
    if (isJunk) showCheckin(p, 1, data);
    else {
      const c = store.saveCheckin(p, data.junk, data.healthy);
      showResult(p, c);
    }
  });
}

function showResult(p, c) {
  const v = c.vitality;
  const st = vitalityStats(v);
  const ch = charById(p.char);
  const mood = moodFor(v);
  const cat = v >= 65 ? 'praise' : v >= 40 ? 'okay' : 'sad';
  const words = phrase(cat, p);
  screen(`
    <div class="card" style="text-align:center;display:flex;flex-direction:column;gap:12px">
      <h2>${t('resultTitle')}</h2>
      <canvas class="result-hero" id="rh"></canvas>
      <div class="big-num" id="vnum">${num(0)}</div>
      <div class="meter"><i id="vbar" style="--bs:${meterSize(v)}"></i><b>${vitalityLabel(v)}</b></div>
      <p style="font-size:1.15rem;font-weight:700">${esc(words)}</p>
      <h3>${t('effects')}</h3>
      <div class="effects">
        <div class="effect"><div class="v">${'❤️'.repeat(st.maxHearts)}</div><div class="k">${t('hearts')}</div></div>
        <div class="effect"><div class="v">${num(Math.round(st.agility * 6.25))}%</div><div class="k">${t('speed')}</div></div>
        <div class="effect"><div class="v">${num(Math.round(st.chargeRate * 71))}%</div><div class="k">${t('charge')}</div></div>
      </div>
    </div>
    <button class="btn primary big block" id="fly">🚀 ${t('letsFly')}</button>
    <button class="btn block" id="hub">🏠 ${t('home')}</button>
  `);
  animatePortraits([{ canvas: $('#rh'), ch, opts: { mood, glow: st.glow, scale: 0.68 } }]);
  requestAnimationFrame(() => { $('#vbar').style.width = v + '%'; });
  // count-up
  const t0 = performance.now();
  const vn = $('#vnum');
  const count = (now) => {
    const k = Math.min(1, (now - t0) / 1200);
    if (!vn.isConnected) return;
    vn.textContent = num(v * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(count);
  };
  requestAnimationFrame(count);
  sfx(cat === 'sad' ? 'sad' : 'cheer');
  setTimeout(() => speak(words, { force: true }), 350);
  const newBadges = store.awardBadges(p);
  if (newBadges.length) setTimeout(() => announceBadges(newBadges), 1800);
  $('#fly').addEventListener('click', () => startGame(p));
  $('#hub').addEventListener('click', () => showHub(p));
}

function announceBadges(ids) {
  const b = BADGES.filter((x) => ids.includes(x.id)).map((x) => `${x.icon} ${L(x)}`).join(' | ');
  toast(`🏅 ${b}`, 3500);
}

// ---------- hub ----------
function showHub(p) {
  const c = store.todayCheckin(p);
  if (!c) return showCheckin(p);
  const ch = charById(p.char);
  const streak = store.healthyStreak(p);
  const days = store.lastDays(p, 7);
  const locale = getLang() === 'ar' ? 'ar' : 'en';
  screen(`
    <div class="topbar">
      <button class="btn small" id="switch">👥 ${t('switchPlayer')}</button>
      <span class="spacer"></span>
      ${langButton()}
      <button class="btn icon" data-act="settings" aria-label="${t('settings')}">⚙️</button>
    </div>
    <div class="card hub-hero">
      <canvas id="hh"></canvas>
      <div class="grow">
        <div class="name">${esc(p.name)}</div>
        <div class="muted">${esc(charName(ch))} | ${num(p.age)} ${t('years')}</div>
        <div style="margin:8px 0 4px" class="meter"><i style="width:${c.vitality}%;--bs:${meterSize(c.vitality)}"></i><b>⚡ ${num(c.vitality)} | ${vitalityLabel(c.vitality)}</b></div>
      </div>
    </div>
    <button class="btn primary big block" id="play">▶ ${t('play')}</button>
    <div class="stats">
      <div class="stat"><div class="v">🏆 ${num(p.best)}</div><div class="k">${t('best')}</div></div>
      <div class="stat"><div class="v">🔥 ${num(streak)}</div><div class="k">${t('streak')}</div></div>
      <div class="stat"><div class="v">🗺️ ${num(p.maxWorld)}</div><div class="k">${t('level')}</div></div>
    </div>
    <div class="card ability-card">
      <div class="ai">${ch.icon}</div>
      <div><h3>${t('power')}: ${L(ch.abilityName)}</h3><p class="muted">${L(ch.desc)}</p></div>
    </div>
    <div class="card">
      <h3>📊 ${t('week')}</h3>
      <div class="week">
        ${days.map((d) => {
          const v = d.c?.vitality ?? 0;
          const cls = !d.c ? 'none' : v >= 65 ? '' : v >= 40 ? 'mid' : 'low';
          return `<div class="d"><span class="lab">${d.c ? num(v) : '–'}</span><div class="bar ${cls}" style="height:${d.c ? Math.max(6, v) : 4}%"></div><span class="lab">${d.date.toLocaleDateString(locale, { weekday: 'short' })}</span></div>`;
        }).join('')}
      </div>
    </div>
    <div class="card">
      <h3>🏅 ${t('badges')}</h3>
      <div class="badges" style="margin-top:8px">
        ${BADGES.map((b) => `<span class="badge ${p.badges.includes(b.id) ? '' : 'locked'}">${b.icon} ${L(b)}</span>`).join('')}
      </div>
    </div>
    <div class="grid2">
      <button class="btn" id="lb">🏆 ${t('leaderboard')}</button>
      <button class="btn" id="share">📤 ${t('share')}</button>
      <button class="btn" id="edit">📝 ${t('editCheckin')}</button>
      <button class="btn" data-act="howto">❔ ${t('howTo')}</button>
    </div>
    ${deferredInstall ? `<button class="btn good block" id="install">📲 ${t('installApp')}</button>` : ''}
    <button class="btn small" id="del" style="align-self:center;opacity:.7">🗑️ ${t('del')}</button>
  `);
  bindCommon(() => showHub(p));
  animatePortraits([{ canvas: $('#hh'), ch, opts: { mood: moodFor(c.vitality), glow: vitalityStats(c.vitality).glow, scale: 0.8 } }]);
  $('#play').addEventListener('click', () => startGame(p));
  $('#switch').addEventListener('click', showPlayers);
  $('#edit').addEventListener('click', () => showCheckin(p));
  $('#lb').addEventListener('click', openLeaderboard);
  $('#share').addEventListener('click', () => shareScore(p, p.best));
  $('#install')?.addEventListener('click', promptInstall);
  $('#del').addEventListener('click', () => {
    if (confirm(t('confirmDelete'))) {
      store.deletePlayer(p.id);
      store.db().players.length ? showPlayers() : showTitle();
    }
  });
}

// ---------- game ----------
function startGame(p) {
  const c = store.todayCheckin(p);
  if (!c) return showCheckin(p);
  stopAnim();
  closeModal();
  stopSpeech();
  document.body.classList.add('playing');
  const ch = charById(p.char);
  ui.innerHTML = `
    <div class="hud">
      <div class="hud-top">
        <div class="pill hearts" id="hearts"></div>
        <div class="hud-mid">
          <div class="progress"><i id="prog"></i></div>
          <div class="world-name" id="world"></div>
        </div>
        <div class="pill hud-score">⭐ <span id="score">0</span></div>
        <button class="btn icon" id="pause" aria-label="${t('paused')}" style="width:44px;height:44px;min-height:44px">⏸</button>
      </div>
      <div class="combo" id="combo"></div>
      <button class="ability-btn" id="ability" aria-label="${t('power')}"><span>${ch.icon}</span></button>
    </div>`;
  const els = { hearts: $('#hearts'), prog: $('#prog'), world: $('#world'), score: $('#score'), combo: $('#combo'), ability: $('#ability') };
  const last = {};
  const hud = (h) => {
    if (h.paused) return openPause();
    if (h.hearts !== last.hearts || h.maxHearts !== last.maxHearts) {
      const full = Math.max(h.maxHearts, h.hearts);
      els.hearts.innerHTML = Array.from({ length: full }, (_, i) => `<span class="${i < h.hearts ? '' : 'e'}">❤️</span>`).join('');
      last.hearts = h.hearts; last.maxHearts = h.maxHearts;
    }
    if (h.score !== last.score) { els.score.textContent = num(h.score); last.score = h.score; }
    const pr = Math.round(Math.min(1, h.progress) * 100);
    if (pr !== last.pr) { els.prog.style.width = pr + '%'; last.pr = pr; }
    if (h.level !== last.level) {
      els.world.textContent = `${t('level')} ${num(h.level)} – ${L(WORLDS[(h.level - 1) % WORLDS.length])}`;
      last.level = h.level;
      document.querySelector('meta[name="theme-color"]').setAttribute('content', SKIES[(h.level - 1) % SKIES.length].top);
    }
    const comboTxt = h.combo >= 3 ? `🔥 ${num(h.combo)} | x${num(h.mult)}` : '';
    if (comboTxt !== last.combo) { els.combo.textContent = comboTxt; last.combo = comboTxt; }
    const active = h.ability > 0;
    const p100 = Math.round(active ? h.ability * 100 : h.charge);
    if (p100 !== last.p || active !== last.active) {
      els.ability.style.setProperty('--p', p100);
      els.ability.classList.toggle('ready', !active && h.charge >= 100);
      els.ability.classList.toggle('active', active);
      last.p = p100; last.active = active;
    }
  };

  game?.destroy();
  game = new Game(canvas, {
    player: p,
    character: ch,
    vitality: c.vitality,
    onHud: hud,
    onLevelClear: (r) => openLevelClear(p, r),
    onGameOver: (r) => openGameOver(p, r),
  });
  els.ability.addEventListener('pointerdown', (e) => { e.stopPropagation(); game.useAbility(); });
  $('#pause').addEventListener('click', () => game.pause());
  game.pushHud(true);
  document.activeElement?.blur?.();
  startMusic(110);
  game.start();
  // Small intro hint for first games.
  if (p.games < 2) setTimeout(() => toast(`👆 ${t('howTo1')}`, 3200), 400);
}

function exitGame(to) {
  game?.destroy();
  game = null;
  stopMusic();
  document.body.classList.remove('playing');
  document.querySelector('meta[name="theme-color"]').setAttribute('content', '#6cc6ff');
  to();
}

function overlay(html) {
  const el = document.createElement('div');
  el.className = 'overlay';
  el.innerHTML = `<div class="card">${html}</div>`;
  ui.appendChild(el);
  for (const b of el.querySelectorAll('button')) b.addEventListener('click', () => sfx('click'), { capture: true });
  return el;
}

function openPause() {
  stopMusic();
  const p = store.currentPlayer();
  const el = overlay(`
    <h2>⏸ ${t('paused')}</h2>
    <button class="btn primary big" data-a="resume">▶ ${t('resume')}</button>
    <button class="btn" data-a="restart">🔄 ${t('restart')}</button>
    <button class="btn" data-a="home">🏠 ${t('home')}</button>`);
  el.querySelector('[data-a=resume]').onclick = () => { el.remove(); startMusic(); game.resume(); };
  el.querySelector('[data-a=restart]').onclick = () => { el.remove(); startGame(p); };
  el.querySelector('[data-a=home]').onclick = () => exitGame(() => showHub(p));
}

function openLevelClear(p, { level, stars, score }) {
  stopMusic();
  p.maxWorld = Math.max(p.maxWorld, level + 1);
  store.updatePlayer(p);
  const fact = FACTS[(Math.random() * FACTS.length) | 0];
  const q = QUIZZES[(Math.random() * QUIZZES.length) | 0];
  const flip = Math.random() < 0.5;
  const order = flip ? [1, 0] : [0, 1];
  const el = overlay(`
    <h2>🎉 ${t('worldClear')}</h2>
    <div class="stars">${[0, 1, 2].map((i) => `<span class="${i < stars ? '' : 'off'}">⭐</span>`).join('')}</div>
    <div class="big-num" style="font-size:2.4rem">${num(score)}</div>
    <div class="fact"><b>💡 ${t('funFact')}</b><p>${L(fact)}</p></div>
    <h3>🧠 ${t('quiz')}: ${L(q)}</h3>
    <div class="quiz-opts">${order.map((i) => {
      const o = q.opts[i];
      return `<button class="quiz-opt" data-i="${i}"><span class="qi">${o[0]}</span>${getLang() === 'ar' ? o[2] : o[1]}</button>`;
    }).join('')}</div>
    <p id="qres" style="font-weight:800;min-height:1.5em"></p>
    <button class="btn primary big" data-a="next" disabled>${t('continue')} ▶</button>`);
  const next = el.querySelector('[data-a=next]');
  let answered = false;
  for (const b of el.querySelectorAll('.quiz-opt')) {
    b.onclick = () => {
      if (answered) return;
      answered = true;
      const right = +b.dataset.i === q.good;
      b.classList.add(right ? 'right' : 'wrong');
      if (!right) el.querySelector(`.quiz-opt[data-i="${q.good}"]`).classList.add('right');
      el.querySelector('#qres').textContent = right ? `✅ ${t('correct')}` : `💡 ${t('wrong')}`;
      if (right) {
        game.score += 100;
        p.quizRight++;
        store.updatePlayer(p);
        sfx('cheer');
        speak(phrase('yum', p), { force: true });
      } else {
        sfx('sad');
      }
      next.disabled = false;
    };
  }
  setTimeout(() => speak(L(fact), { force: true }), 2200);
  next.onclick = () => {
    el.remove();
    stopSpeech();
    startMusic();
    game.nextLevel();
  };
}

function openGameOver(p, { score, level, combo }) {
  stopMusic();
  const isBest = store.recordGame(p, { score, world: level, combo });
  const newBadges = store.awardBadges(p);
  const el = overlay(`
    <h2>☁️ ${t('gameOver')}</h2>
    <canvas id="goh" style="width:100%;height:170px"></canvas>
    ${isBest ? `<h3 style="color:#ff7a3d">🏆 ${t('newBest')}</h3>` : ''}
    <div class="big-num">${num(score)}</div>
    <p class="muted">${t('level')} ${num(level)} | ${t('best')} ${num(p.best)}</p>
    <p style="font-weight:700">💡 ${L(FACTS[(Math.random() * FACTS.length) | 0])}</p>
    <button class="btn primary big" data-a="again">🔄 ${t('restart')}</button>
    <div class="grid2">
      <button class="btn" data-a="share">📤 ${t('share')}</button>
      <button class="btn" data-a="home">🏠 ${t('home')}</button>
    </div>`);
  const ch = charById(p.char);
  const goh = el.querySelector('#goh');
  const t0 = performance.now();
  const loop = (now) => {
    if (!goh.isConnected) return;
    renderPortrait(goh, ch, { mood: isBest ? 'yay' : 'tired', glider: false, scale: 0.8, t: Math.max(0, (now - t0) / 1000) });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  if (isBest) setTimeout(() => sfx('fanfare'), 900);
  if (newBadges.length) setTimeout(() => announceBadges(newBadges), 1200);
  el.querySelector('[data-a=again]').onclick = () => { el.remove(); startGame(p); };
  el.querySelector('[data-a=home]').onclick = () => exitGame(() => showHub(p));
  el.querySelector('[data-a=share]').onclick = () => shareScore(p, score);
}

// ---------- modals ----------
function openModal(html) {
  modal.innerHTML = `<div class="card">${html}</div>`;
  modal.classList.remove('hidden');
  for (const b of modal.querySelectorAll('button')) b.addEventListener('click', () => sfx('click'), { capture: true });
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
}
function closeModal() { modal.classList.add('hidden'); modal.innerHTML = ''; }

function openSettings(rerender) {
  const s = store.settings();
  const row = (key, label) => `<div class="set-row"><span>${label}</span><button class="switch ${s[key] ? 'on' : ''}" data-k="${key}" aria-pressed="${!!s[key]}" aria-label="${label}"></button></div>`;
  openModal(`
    <h2>⚙️ ${t('settings')}</h2>
    <div class="set-row"><span>${t('language')}</span>
      <div class="seg"><button class="btn small ${getLang() === 'ar' ? 'on' : ''}" data-lang="ar">العربية</button><button class="btn small ${getLang() === 'en' ? 'on' : ''}" data-lang="en">English</button></div>
    </div>
    ${row('sound', '🔊 ' + t('sound'))}
    ${row('music', '🎵 ' + t('music'))}
    ${row('voice', '🗣️ ' + t('voice'))}
    ${deferredInstall ? `<button class="btn good" id="inst">📲 ${t('installApp')}</button>` : ''}
    <p class="muted" style="font-size:.9rem">${t('parentsNote')}</p>
    <button class="btn small" id="reset" style="color:#c0264b">🗑️ ${t('resetData')}</button>
    <button class="btn primary" id="close">✔ ${t('done')}</button>`);
  for (const b of modal.querySelectorAll('[data-k]')) {
    b.onclick = () => {
      s[b.dataset.k] = !s[b.dataset.k];
      b.classList.toggle('on', s[b.dataset.k]);
      b.setAttribute('aria-pressed', s[b.dataset.k]);
      store.save();
      if (b.dataset.k === 'voice' && s.voice) speak(phrase('yum', store.currentPlayer()), { force: true });
      if (b.dataset.k === 'voice' && !s.voice) stopSpeech();
    };
  }
  for (const b of modal.querySelectorAll('[data-lang]')) {
    b.onclick = () => {
      s.lang = b.dataset.lang;
      store.save();
      setLang(s.lang);
      closeModal();
      rerender();
      openSettings(rerender);
    };
  }
  modal.querySelector('#inst')?.addEventListener('click', promptInstall);
  modal.querySelector('#reset').onclick = () => {
    if (confirm(t('confirmReset'))) { store.resetAll(); store.settings().lang = getLang(); store.save(); closeModal(); showTitle(); }
  };
  modal.querySelector('#close').onclick = closeModal;
}

function openHowTo() {
  openModal(`
    <h2>❔ ${t('howTo')}</h2>
    <ol class="howto">
      <li>👆 ${t('howTo1')}</li>
      <li>🍎 ${t('howTo2')}</li>
      <li>🍟 ${t('howTo3')}</li>
      <li>⚡ ${t('howTo4')}</li>
      <li>💪 ${t('howTo5')}</li>
    </ol>
    <div class="grid2">${CHARACTERS.map((c) => `<div class="badge">${c.icon} <b>${esc(charName(c))}</b>: ${L(c.abilityName)}</div>`).join('')}</div>
    <button class="btn primary" id="close">✔ ${t('done')}</button>`);
  modal.querySelector('#close').onclick = closeModal;
}

function openLeaderboard() {
  const list = [...store.db().players].sort((a, b) => b.best - a.best);
  const medals = ['🥇', '🥈', '🥉'];
  openModal(`
    <h2>🏆 ${t('leaderboard')}</h2>
    <div class="lb">
      ${list.length ? list.map((p, i) => {
        const c = store.todayCheckin(p);
        return `<div class="r"><span class="pos">${medals[i] || num(i + 1)}</span><canvas data-ch="${p.char}"></canvas>
          <div class="grow"><b>${esc(p.name)}</b><div class="muted" style="font-size:.85rem">🔥 ${num(store.healthyStreak(p))} | ${c ? '⚡ ' + num(c.vitality) : '—'}</div></div>
          <span class="sc">${num(p.best)}</span></div>`;
      }).join('') : `<p class="muted">${t('noScores')}</p>`}
    </div>
    <button class="btn primary" id="close">✔ ${t('done')}</button>`);
  for (const c of modal.querySelectorAll('canvas[data-ch]')) renderPortrait(c, charById(c.dataset.ch), { glider: false, scale: 0.9 });
  modal.querySelector('#close').onclick = closeModal;
}

// ---------- share card ----------
function makeShareCard(p, score) {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#6cc6ff');
  g.addColorStop(1, '#fff1d6');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // sun + clouds
  ctx.fillStyle = 'rgba(255,247,176,0.9)';
  ctx.beginPath(); ctx.arc(900, 180, 110, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  for (const [x, y, s] of [[160, 300, 1], [820, 520, 0.8], [240, 1080, 1.2]]) {
    ctx.beginPath();
    ctx.arc(x, y, 60 * s, 0, Math.PI * 2); ctx.arc(x + 70 * s, y - 30 * s, 75 * s, 0, Math.PI * 2); ctx.arc(x + 150 * s, y, 60 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = '800 130px "Baloo Bhaijaan 2", system-ui, sans-serif';
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#ff7a3d';
  ctx.strokeText(t('appName'), W / 2, 200);
  ctx.fillText(t('appName'), W / 2, 200);
  ctx.save();
  ctx.translate(W / 2, 560);
  const v = store.todayCheckin(p)?.vitality ?? 60;
  drawHero(ctx, charById(p.char), 470, { t: 0.4, mood: 'yay', glow: vitalityStats(v).glow || 0.5 });
  ctx.restore();
  ctx.fillStyle = '#23194a';
  ctx.font = '800 84px "Baloo Bhaijaan 2", system-ui, sans-serif';
  ctx.fillText(p.name, W / 2, 920);
  ctx.font = '800 150px "Baloo Bhaijaan 2", system-ui, sans-serif';
  ctx.fillStyle = '#ff7a3d';
  ctx.fillText(`⭐ ${num(score)}`, W / 2, 1080);
  ctx.font = '700 46px "Baloo Bhaijaan 2", system-ui, sans-serif';
  ctx.fillStyle = '#23194a';
  ctx.fillText(`⚡ ${num(v)} | ${vitalityLabel(v)}`, W / 2, 1170);
  ctx.font = '700 38px "Baloo Bhaijaan 2", system-ui, sans-serif';
  ctx.fillStyle = '#5b5390';
  ctx.fillText(t('tagline'), W / 2, 1260);
  return c;
}

async function shareScore(p, score) {
  const text = t('shareText', { score: num(score) });
  const url = location.href.split('#')[0];
  const cardCanvas = makeShareCard(p, score);
  try {
    const blob = await new Promise((r) => cardCanvas.toBlob(r, 'image/png'));
    const file = new File([blob], 'vitaland.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text: `${text} ${url}`, title: t('appName') });
      return;
    }
    if (navigator.share) {
      await navigator.share({ text, url, title: t('appName') });
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vitaland.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    await navigator.clipboard?.writeText(`${text} ${url}`);
    toast('✅ 📋');
  } catch (e) {
    if (e?.name !== 'AbortError') toast('📋 ' + text);
  }
}

// ---------- PWA ----------
function promptInstall() {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  deferredInstall.userChoice.finally(() => { deferredInstall = null; });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstall = e;
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Test hook: ?debug exposes the running game for automated checks.
if (new URLSearchParams(location.search).has('debug')) window.vitaland = { get game() { return game; } };

// ---------- boot ----------
const unlock = () => unlockAudio();
window.addEventListener('pointerdown', unlock, { capture: true });
window.addEventListener('keydown', unlock, { capture: true });

function boot() {
  const s = store.settings();
  if (!s.lang) {
    setLang(navigator.language?.startsWith('en') ? 'en' : 'ar');
    showLangPick();
  } else {
    setLang(s.lang);
    showTitle();
  }
}

// Wait briefly for the web font so canvas text uses it.
Promise.race([document.fonts?.ready || Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(boot);

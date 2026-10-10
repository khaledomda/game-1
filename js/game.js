// Vitaland game engine: a vertical sky-glider where you catch healthy food and dodge junk monsters.
import { drawHero, foodSprite, cloudSprite, HEALTHY_FOODS, JUNK_FOODS, SKIES, clearArtCache } from './art.js';
import { sfx, speak, setTempo } from './audio.js';
import { phrase } from './i18n.js';

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function vitalityStats(v) {
  return {
    maxHearts: v < 30 ? 2 : v < 55 ? 3 : v < 80 ? 4 : 5,
    agility: 6 + v * 0.1, // steering responsiveness
    chargeRate: 0.6 + (v / 100) * 0.8, // power ring fill speed
    glow: v >= 80 ? 1 : v >= 60 ? 0.5 : 0,
    tired: v < 40,
  };
}

export class Game {
  constructor(canvas, { player, character, vitality, onHud, onLevelClear, onGameOver }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.player = player;
    this.ch = character;
    this.vitality = vitality;
    this.stats = vitalityStats(vitality);
    this.onHud = onHud;
    this.onLevelClear = onLevelClear;
    this.onGameOver = onGameOver;
    const age = player.age || 9;
    this.ageMul = age <= 7 ? 0.78 : age <= 11 ? 0.95 : 1.1;
    this.young = age <= 7;

    this.keys = { left: false, right: false };
    this.state = 'idle';
    this.raf = 0;
    this.last = 0;

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    this.onPointer = this.onPointer.bind(this);
    this.onKey = this.onKey.bind(this);
    this.preventScroll = (e) => { if (this.state === 'play') e.preventDefault(); };
    this.onVis = () => { if (document.hidden && this.state === 'play') this.pause(); };

    window.addEventListener('resize', this.resize);
    // Listen on the window so steering works wherever the finger is, even over HUD layers.
    window.addEventListener('pointerdown', this.onPointer);
    window.addEventListener('pointermove', this.onPointer);
    window.addEventListener('touchmove', this.preventScroll, { passive: false });
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keyup', this.onKey);
    document.addEventListener('visibilitychange', this.onVis);
    this.resize();
    this.reset();
  }

  reset() {
    this.level = 1;
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.hearts = this.stats.maxHearts;
    this.charge = 30;
    this.time = 0;
    this.objects = [];
    this.particles = [];
    this.texts = [];
    this.ability = null;
    this.shake = 0;
    this.flash = 0;
    this.quizRight = 0;
    this.hero = { x: this.W / 2, tx: this.W / 2, invuln: 0, sluggish: 0, hurt: 0, yay: 0, tilt: 0 };
    this.initLevel();
    this.initScenery();
  }

  initLevel() {
    const L = this.level - 1;
    this.collected = 0;
    this.hitsThisLevel = 0;
    this.target = Math.min(40, 14 + 4 * this.level);
    this.spawnT = 0.8;
    this.spawnInterval = Math.max(0.34, 0.92 - 0.06 * L) / this.ageMul;
    this.junkRatio = clamp(0.3 + 0.04 * L - (this.young ? 0.07 : 0), 0.2, 0.55);
    this.fall = Math.min(0.78, 0.3 + 0.035 * L) * this.ageMul; // fraction of screen height per second
    this.sky = SKIES[L % SKIES.length];
    this.lastSpawnX = this.W / 2;
    setTempo(108 + Math.min(L, 8) * 4);
  }

  initScenery() {
    this.clouds = [];
    for (let i = 0; i < 9; i++) this.clouds.push(this.newCloud(rand(-0.2, 1) * this.H, i % 3));
    this.islands = [];
    for (let i = 0; i < 3; i++) this.islands.push({ x: rand(0, this.W), y: rand(0, this.H), s: rand(0.6, 1.2) });
    this.starsBg = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: rand(0.6, 1.8), p: rand(0, 6) }));
  }

  newCloud(y, layer) {
    const w = (layer === 0 ? rand(90, 140) : layer === 1 ? rand(140, 220) : rand(220, 320)) * this.scale;
    return { x: rand(-w * 0.3, this.W - w * 0.7), y, w, layer, speed: [0.25, 0.45, 0.8][layer] };
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const oldW = this.W || rect.width;
    this.dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.W = rect.width;
    this.H = rect.height;
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    const m = Math.min(this.W, this.H);
    this.scale = clamp(m / 420, 0.8, 1.8);
    this.itemSize = clamp(m * 0.13, 52, 92);
    this.heroSize = clamp(m * 0.24, 96, 180);
    this.heroY = this.H - this.heroSize * 0.95;
    clearArtCache();
    if (this.hero) {
      const k = this.W / oldW;
      this.hero.x *= k;
      this.hero.tx *= k;
      for (const o of this.objects) o.x *= k;
    }
    if (this.sky && this.state !== 'play') this.render();
  }

  // ---------- Lifecycle ----------
  start() {
    this.state = 'play';
    this.last = performance.now();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.loop);
  }

  pause() {
    if (this.state !== 'play') return;
    this.state = 'paused';
    this.onHud?.({ paused: true });
  }

  resume() {
    if (this.state !== 'paused') return;
    this.start();
  }

  nextLevel() {
    this.level++;
    this.hearts = Math.min(this.stats.maxHearts + 1, this.hearts + 1);
    this.objects = [];
    this.initLevel();
    this.start();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.state = 'dead';
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('pointerdown', this.onPointer);
    window.removeEventListener('pointermove', this.onPointer);
    window.removeEventListener('touchmove', this.preventScroll);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keyup', this.onKey);
    document.removeEventListener('visibilitychange', this.onVis);
  }

  // ---------- Input ----------
  onPointer(e) {
    if (this.state !== 'play') return;
    // Taps on HUD buttons (pause, power) must not steer.
    if (e.target?.closest?.('button')) return;
    // Touch drags and plain mouse hover both steer.
    const r = this.canvas.getBoundingClientRect();
    this.hero.tx = clamp(e.clientX - r.left, this.heroSize * 0.4, this.W - this.heroSize * 0.4);
  }

  onKey(e) {
    const down = e.type === 'keydown';
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') this.keys.left = down;
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') this.keys.right = down;
    else if (down && (k === ' ' || k === 'Enter') && this.state === 'play') { e.preventDefault(); this.useAbility(); }
    else if (down && (k === 'Escape' || k === 'p' || k === 'P')) {
      if (this.state === 'play') this.pause();
    }
  }

  // ---------- Abilities ----------
  useAbility() {
    if (this.charge < 100 || this.state !== 'play') return false;
    this.charge = 0;
    const type = this.ch.ability;
    sfx('power');
    speak(phrase('power', this.player), { minGap: 1500 });
    const hx = this.hero.x, hy = this.heroY;
    this.burst(hx, hy, 40, ['#fff6a8', this.ch.outfit, '#ffffff'], 1.4);
    switch (type) {
      case 'magnet': this.ability = { type, t: 7, max: 7 }; break;
      case 'shield': this.ability = { type, t: 8, max: 8 }; break;
      case 'dash': this.ability = { type, t: 5, max: 5 }; break;
      case 'double': this.ability = { type, t: 8, max: 8 }; break;
      case 'slow': this.ability = { type, t: 6, max: 6 }; break;
      case 'blast': {
        this.flash = 0.6;
        for (const o of this.objects) {
          if (o.kind === 'junk' && o.alive) {
            o.alive = false;
            this.addScore(5, o.x, o.y, '#9cff9c');
            this.burst(o.x, o.y, 18, ['#2bd46b', '#a6ff8f', '#ffffff']);
          }
        }
        this.ability = { type, t: 1.2, max: 1.2 };
        break;
      }
      case 'heal':
        if (this.hearts < this.stats.maxHearts + 1) this.hearts++;
        else this.addScore(200, hx, hy - 60, '#ffd23f');
        this.ability = { type: 'shield', t: 3, max: 3 };
        this.text(hx, hy - 90, '+❤️', '#ff4d6d', 1.4);
        break;
      default: break;
    }
    return true;
  }

  // ---------- Spawning ----------
  spawn() {
    const r = this.itemSize / 2;
    const roll = Math.random();
    let kind = roll < this.junkRatio ? 'junk' : 'healthy';
    if (roll > 0.955) kind = 'power';
    // keep consecutive items apart so there is always a fair path
    let x;
    for (let tries = 0; tries < 6; tries++) {
      x = rand(r + 6, this.W - r - 6);
      if (Math.abs(x - this.lastSpawnX) > this.W * 0.18) break;
    }
    this.lastSpawnX = x;
    const o = {
      kind, x, baseX: x, y: -r * 1.6, r, alive: true,
      vy: this.H * this.fall * rand(0.9, 1.15),
      phase: rand(0, Math.PI * 2), rot: rand(-0.3, 0.3), spin: rand(-1, 1),
    };
    if (kind === 'healthy') o.icon = pick(HEALTHY_FOODS);
    else if (kind === 'junk') {
      o.icon = pick(JUNK_FOODS);
      if (this.level >= 2 && Math.random() < 0.35) o.zig = rand(0.06, 0.12) * this.W;
      if (this.level >= 4 && Math.random() < 0.22) o.homing = 0.35;
      o.vy *= rand(0.95, 1.1);
    } else {
      o.power = this.hearts < this.stats.maxHearts && Math.random() < 0.55 ? 'heart' : 'bolt';
      o.icon = o.power === 'heart' ? '❤️' : '⚡';
      o.vy *= 0.85;
    }
    this.objects.push(o);
  }

  // ---------- Effects ----------
  burst(x, y, n, colors, power = 1) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(80, 320) * power * this.scale;
      this.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(0.4, 0.9), max: 0.9,
        color: pick(colors), size: rand(3, 7) * this.scale, star: Math.random() < 0.4,
      });
    }
  }

  smoke(x, y) {
    for (let i = 0; i < 16; i++) {
      this.particles.push({
        x: x + rand(-20, 20), y: y + rand(-20, 20), vx: rand(-60, 60), vy: rand(-90, -20),
        life: rand(0.5, 1), max: 1, color: pick(['#7b2fa8', '#a35bd1', '#5a1f80']), size: rand(10, 22) * this.scale, smoke: true,
      });
    }
  }

  text(x, y, str, color = '#fff', size = 1) {
    this.texts.push({ x, y, str, color, size, life: 1.1 });
  }

  addScore(base, x, y, color) {
    const mult = this.mult() * (this.ability?.type === 'double' ? 2 : 1);
    const pts = base * mult;
    this.score += pts;
    this.text(x, y, `+${pts}`, color || '#fff');
  }

  mult() { return Math.min(5, 1 + Math.floor(this.combo / 5)); }

  // ---------- Update ----------
  loop(now) {
    if (this.state !== 'play') return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.render();
    if (this.state === 'play') this.raf = requestAnimationFrame(this.loop);
  }

  update(dt) {
    this.time += dt;
    const h = this.hero;
    const ab = this.ability;
    const slow = ab?.type === 'slow' ? 0.45 : 1;
    const boost = ab?.type === 'dash' ? 1.35 : 1;
    const wdt = dt * slow * boost; // world delta time

    // steering
    if (this.keys.left) h.tx -= this.W * 1.2 * dt;
    if (this.keys.right) h.tx += this.W * 1.2 * dt;
    h.tx = clamp(h.tx, this.heroSize * 0.4, this.W - this.heroSize * 0.4);
    let agility = this.stats.agility * (h.sluggish > 0 ? 0.45 : 1);
    const dx = h.tx - h.x;
    h.x += dx * Math.min(1, dt * agility);
    h.tilt += (clamp(dx * 0.004, -0.38, 0.38) - h.tilt) * Math.min(1, dt * 10);
    h.invuln = Math.max(0, h.invuln - dt);
    h.sluggish = Math.max(0, h.sluggish - dt);
    h.hurt = Math.max(0, h.hurt - dt);
    h.yay = Math.max(0, h.yay - dt);

    if (ab) {
      ab.t -= dt;
      if (ab.type === 'dash' && Math.random() < 0.6) {
        this.particles.push({ x: h.x + rand(-20, 20), y: this.heroY + this.heroSize * 0.4, vx: rand(-30, 30), vy: rand(200, 360),
          life: 0.5, max: 0.5, color: pick(['#ff8a1f', '#ffd23f', '#fff']), size: rand(4, 9) * this.scale });
      }
      if (ab.t <= 0) this.ability = null;
    }

    // scenery
    for (const c of this.clouds) {
      c.y += this.H * 0.08 * c.speed * wdt * 2;
      if (c.y > this.H + 40) Object.assign(c, this.newCloud(-c.w * 0.6, c.layer));
    }
    for (const is of this.islands) {
      is.y += this.H * 0.05 * wdt;
      if (is.y > this.H + 120) { is.y = -120; is.x = rand(0, this.W); is.s = rand(0.6, 1.2); }
    }

    // spawning
    this.spawnT -= wdt;
    if (this.spawnT <= 0 && this.collected < this.target) {
      this.spawn();
      this.spawnT = this.spawnInterval * rand(0.75, 1.25);
    }

    // objects
    const hr = this.heroSize * 0.36;
    const hy = this.heroY - this.heroSize * 0.05;
    for (const o of this.objects) {
      if (!o.alive) continue;
      o.y += o.vy * wdt;
      o.phase += wdt * 3;
      o.rot += o.spin * wdt;
      if (o.zig) o.x = clamp(o.baseX + Math.sin(o.phase) * o.zig, o.r, this.W - o.r);
      if (o.homing && o.y < hy - 60) {
        o.baseX += clamp(h.x - o.baseX, -1, 1) * this.W * 0.12 * o.homing * wdt;
        if (!o.zig) o.x = o.baseX;
      }
      if (ab?.type === 'magnet' && o.kind !== 'junk') {
        const mx = h.x - o.x, my = hy - o.y;
        const d = Math.hypot(mx, my);
        if (d < this.W * 0.55) {
          o.x += (mx / d) * 520 * this.scale * dt;
          o.y += (my / d) * 520 * this.scale * dt;
          o.baseX = o.x;
        }
      }

      const d = Math.hypot(o.x - h.x, o.y - hy);
      if (d < hr + o.r * 0.72) this.collide(o);
      else if (o.y > this.H + o.r * 2) {
        o.alive = false;
        if (o.kind === 'healthy' && !this.young && this.combo > 0) {
          this.combo = 0;
        }
      }
    }
    this.objects = this.objects.filter((o) => o.alive);

    // particles & texts
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.smoke) { p.vx *= 0.96; p.size *= 1 + dt * 0.8; } else { p.vy += 380 * dt; p.vx *= 0.98; }
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    if (this.particles.length > 400) this.particles.splice(0, this.particles.length - 400);
    for (const tx of this.texts) { tx.life -= dt; tx.y -= 60 * dt; }
    this.texts = this.texts.filter((tx) => tx.life > 0);

    this.shake = Math.max(0, this.shake - dt);
    this.flash = Math.max(0, this.flash - dt);

    this.pushHud();

    if (this.collected >= this.target && this.state === 'play') this.levelClear();
  }

  collide(o) {
    const h = this.hero;
    o.alive = false;
    if (o.kind === 'healthy') {
      this.combo++;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      this.collected++;
      this.charge = Math.min(100, this.charge + 7 * this.stats.chargeRate);
      this.addScore(10, o.x, o.y - 20, '#fff');
      this.burst(o.x, o.y, 12, ['#fff6a8', '#8dff9a', '#ffffff', '#ffd23f']);
      sfx('collect', this.combo);
      h.yay = 0.35;
      if (this.combo % 5 === 0) {
        this.text(h.x, this.heroY - this.heroSize * 0.9, `x${this.mult()} COMBO!`, '#ffd23f', 1.3);
      }
      if (this.combo % 10 === 0) speak(phrase('yum', this.player), { minGap: 3000 });
      if (this.charge >= 100 && !this.readyAnnounced) {
        this.readyAnnounced = true;
        sfx('cheer');
      }
      if (this.charge < 100) this.readyAnnounced = false;
    } else if (o.kind === 'power') {
      sfx('cheer');
      this.burst(o.x, o.y, 20, ['#ff6b8b', '#ffd23f', '#fff']);
      if (o.power === 'heart') {
        this.hearts = Math.min(this.stats.maxHearts + 1, this.hearts + 1);
        this.text(o.x, o.y - 20, '+❤️', '#ff4d6d', 1.2);
      } else {
        this.charge = Math.min(100, this.charge + 45);
        this.text(o.x, o.y - 20, '+⚡', '#ffd23f', 1.2);
      }
    } else {
      const ab = this.ability;
      if (ab?.type === 'dash') {
        this.addScore(5, o.x, o.y, '#ffd23f');
        this.burst(o.x, o.y, 16, ['#ff8a1f', '#ffd23f', '#fff']);
        sfx('pop');
        return;
      }
      if (ab?.type === 'shield' || h.invuln > 0) {
        this.burst(o.x, o.y, 14, ['#7fd3ff', '#ffffff']);
        sfx('pop');
        return;
      }
      this.hearts--;
      this.hitsThisLevel++;
      this.combo = 0;
      h.invuln = 1.4;
      h.sluggish = 1.8;
      h.hurt = 0.8;
      this.shake = 0.35;
      this.smoke(o.x, o.y);
      this.text(h.x, this.heroY - this.heroSize * 0.8, '-❤️', '#d34dff', 1.3);
      sfx('hit');
      if (navigator.vibrate) navigator.vibrate(80);
      if (this.hearts <= 0) {
        this.gameOver();
        return;
      }
      speak(phrase('oops', this.player), { minGap: 4500 });
    }
  }

  levelClear() {
    this.state = 'clear';
    for (const o of this.objects) {
      if (o.kind === 'junk') this.burst(o.x, o.y, 14, ['#2bd46b', '#fff']);
    }
    this.objects = [];
    const stars = this.hitsThisLevel === 0 ? 3 : this.hitsThisLevel <= 2 ? 2 : 1;
    this.score += stars * 50;
    sfx('fanfare');
    speak(phrase('level', this.player), { force: true });
    this.render();
    this.pushHud(true);
    this.onLevelClear?.({ level: this.level, stars, score: this.score });
  }

  gameOver() {
    this.state = 'over';
    this.hearts = 0;
    sfx('over');
    this.render();
    this.pushHud(true);
    setTimeout(() => speak(phrase('over', this.player), { force: true }), 600);
    this.onGameOver?.({ score: this.score, level: this.level, combo: this.bestCombo });
  }

  pushHud(force) {
    this.onHud?.({
      score: this.score,
      hearts: this.hearts,
      maxHearts: this.stats.maxHearts,
      charge: this.charge,
      combo: this.combo,
      mult: this.mult(),
      progress: this.collected / this.target,
      level: this.level,
      ability: this.ability ? this.ability.t / this.ability.max : 0,
      force,
    });
  }

  // ---------- Render ----------
  render() {
    const { ctx, W, H, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.shake > 0) {
      const s = this.shake * 18 * this.scale;
      ctx.translate(rand(-s, s), rand(-s, s));
    }
    const sky = this.sky;

    // sky
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, sky.top);
    g.addColorStop(1, sky.bottom);
    ctx.fillStyle = g;
    ctx.fillRect(-30, -30, W + 60, H + 60);

    if (sky.stars) {
      for (const s of this.starsBg) {
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(this.time * 2 + s.p);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // moon
      ctx.fillStyle = '#fff6d6';
      ctx.beginPath();
      ctx.arc(W * 0.82, H * 0.14, 34 * this.scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = sky.top;
      ctx.beginPath();
      ctx.arc(W * 0.82 - 14 * this.scale, H * 0.14 - 8 * this.scale, 30 * this.scale, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // sun
      const sx = W * 0.85, sy = H * 0.12, sr = 40 * this.scale;
      const sg = ctx.createRadialGradient(sx, sy, sr * 0.4, sx, sy, sr * 2.4);
      sg.addColorStop(0, 'rgba(255,250,200,0.95)');
      sg.addColorStop(1, 'rgba(255,250,200,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff3a0';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    if (sky.rainbow) {
      const cols = ['#ff6b6b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#9775fa'];
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 12 * this.scale;
      cols.forEach((c, i) => {
        ctx.strokeStyle = c;
        ctx.beginPath();
        ctx.arc(W * 0.5, H * 0.75, W * 0.7 - i * 12 * this.scale, Math.PI, Math.PI * 2);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }

    // floating islands (far)
    for (const is of this.islands) this.drawIsland(is);

    // clouds (all behind gameplay so nothing hides the hero or food)
    for (const c of this.clouds) this.drawCloud(c, c.layer === 2 ? 0.5 : 0.85);

    // junk fog band at the top
    this.drawFog();

    // sea at bottom for ocean world
    if (sky.sea) {
      ctx.fillStyle = 'rgba(30,120,200,0.45)';
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 20) ctx.lineTo(x, H - 26 * this.scale + Math.sin(x * 0.03 + this.time * 2) * 6 * this.scale);
      ctx.lineTo(W, H);
      ctx.fill();
    }

    // objects
    const t = this.time;
    for (const o of this.objects) {
      const spr = foodSprite(o.icon, this.itemSize, dpr, o.kind === 'power' ? 'healthy' : o.kind);
      const size = spr.full;
      ctx.save();
      ctx.translate(o.x, o.y);
      const wob = o.kind === 'junk' ? Math.sin(o.phase * 2) * 0.12 : Math.sin(o.phase) * 0.08;
      ctx.rotate(wob);
      if (o.kind === 'power') {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, o.r * 1.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      const pulse = o.kind === 'junk' ? 1 + Math.sin(o.phase * 3) * 0.04 : 1;
      ctx.scale(pulse, pulse);
      ctx.drawImage(spr, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    // hero
    this.drawHeroInGame(t);

    // particles
    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.max);
      ctx.globalAlpha = p.smoke ? a * 0.5 : a;
      ctx.fillStyle = p.color;
      if (p.star) this.star(p.x, p.y, p.size * 1.3);
      else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // floating texts (numbers always left-to-right)
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const tx of this.texts) {
      const a = Math.min(1, tx.life * 2);
      ctx.globalAlpha = a;
      const fs = 26 * this.scale * tx.size * (1 + (1.1 - tx.life) * 0.2);
      ctx.font = `800 ${fs}px "Baloo Bhaijaan 2", system-ui, sans-serif`;
      ctx.lineWidth = fs * 0.18;
      ctx.strokeStyle = 'rgba(30,20,60,0.75)';
      ctx.strokeText(tx.str, tx.x, tx.y);
      ctx.fillStyle = tx.color;
      ctx.fillText(tx.str, tx.x, tx.y);
    }
    ctx.globalAlpha = 1;

    // ability tints
    const ab = this.ability;
    if (ab?.type === 'slow') {
      ctx.fillStyle = 'rgba(255,80,80,0.08)';
      ctx.fillRect(0, 0, W, H);
    }
    if (ab?.type === 'dash') {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i++) {
        const x = (i * 97 + t * 900) % W;
        const y = ((i * 211 + t * 1400) % (H + 200)) - 100;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 80); ctx.stroke();
      }
    }
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(160,255,170,${this.flash * 0.6})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.hero.hurt > 0) {
      const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
      vg.addColorStop(0, 'rgba(120,0,160,0)');
      vg.addColorStop(1, `rgba(120,0,160,${this.hero.hurt * 0.45})`);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }
  }

  drawHeroInGame(t) {
    const { ctx } = this;
    const h = this.hero;
    if (h.invuln > 0 && Math.floor(t * 14) % 2 === 0) ctx.globalAlpha = 0.45;
    ctx.save();
    ctx.translate(h.x, this.heroY);
    let mood = this.stats.tired || h.sluggish > 0 ? 'tired' : 'happy';
    if (h.yay > 0 || this.ability) mood = 'yay';
    if (h.hurt > 0) mood = 'hurt';
    const glow = Math.max(this.stats.glow, this.ability ? 1 : 0);
    drawHero(ctx, this.ch, this.heroSize, { t, mood, glow, tilt: h.tilt });
    ctx.restore();
    ctx.globalAlpha = 1;

    const ab = this.ability;
    if (ab?.type === 'shield') {
      const r = this.heroSize * 0.75;
      const y = this.heroY;
      const g = ctx.createRadialGradient(h.x - r * 0.3, y - r * 0.3, r * 0.1, h.x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,0.35)');
      g.addColorStop(0.8, 'rgba(110,200,255,0.18)');
      g.addColorStop(1, 'rgba(110,200,255,0.55)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(h.x, y, r + Math.sin(t * 6) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    if (ab?.type === 'magnet') {
      ctx.strokeStyle = 'rgba(255,90,150,0.5)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const rr = ((t * 160 + i * 60) % 180) * this.scale;
        ctx.globalAlpha = 1 - rr / (180 * this.scale);
        ctx.beginPath();
        ctx.arc(h.x, this.heroY, rr + 30, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    if (ab?.type === 'double') {
      ctx.font = `800 ${22 * this.scale}px system-ui, sans-serif`;
      ctx.direction = 'ltr';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText('x2', h.x, this.heroY - this.heroSize * 0.85);
    }
  }

  drawFog() {
    const { ctx, W } = this;
    const t = this.time;
    const fh = 46 * this.scale;
    const g = ctx.createLinearGradient(0, 0, 0, fh * 1.8);
    g.addColorStop(0, 'rgba(110,30,150,0.75)');
    g.addColorStop(1, 'rgba(110,30,150,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= W + 30; x += 30) {
      ctx.lineTo(x, fh + Math.sin(x * 0.02 + t * 1.6) * 10 * this.scale + Math.sin(x * 0.05 - t) * 6);
    }
    ctx.lineTo(W, 0);
    ctx.closePath();
    ctx.fill();
  }

  drawCloud(c, alpha) {
    const spr = cloudSprite(c.w, this.dpr, this.sky.cloud);
    this.ctx.globalAlpha = alpha;
    this.ctx.drawImage(spr, c.x, c.y, spr.w, spr.h);
    this.ctx.globalAlpha = 1;
  }

  drawIsland(is) {
    const { ctx } = this;
    const s = is.s * 60 * this.scale;
    ctx.save();
    ctx.translate(is.x, is.y);
    ctx.globalAlpha = this.sky.stars ? 0.5 : 0.7;
    // rocky underside
    const rg = ctx.createLinearGradient(0, 0, 0, s * 1.1);
    rg.addColorStop(0, '#b98a5e');
    rg.addColorStop(1, 'rgba(150,105,70,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.lineTo(-s * 0.7, s * 0.35);
    ctx.lineTo(-s * 0.35, s * 0.55);
    ctx.lineTo(-s * 0.1, s * 1.1);
    ctx.lineTo(s * 0.25, s * 0.6);
    ctx.lineTo(s * 0.6, s * 0.45);
    ctx.lineTo(s, 0);
    ctx.closePath();
    ctx.fill();
    // grass top
    ctx.fillStyle = this.sky.hill;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.05, s * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.sky.hill2;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.06, s * 1.0, s * 0.12, 0, 0, Math.PI);
    ctx.fill();
    // tree
    ctx.fillStyle = '#8a5a34';
    ctx.fillRect(-s * 0.4, -s * 0.45, s * 0.08, s * 0.45);
    ctx.fillStyle = this.sky.hill2;
    ctx.beginPath();
    ctx.arc(-s * 0.36, -s * 0.55, s * 0.24, 0, Math.PI * 2);
    ctx.arc(-s * 0.2, -s * 0.45, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
    // little house-shaped fruit stand
    ctx.fillStyle = '#fff';
    ctx.fillRect(s * 0.2, -s * 0.3, s * 0.3, s * 0.3);
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(s * 0.14, -s * 0.28);
    ctx.lineTo(s * 0.35, -s * 0.5);
    ctx.lineTo(s * 0.56, -s * 0.28);
    ctx.fill();
    ctx.restore();
  }

  star(x, y, r) {
    const { ctx } = this;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// Procedural vector art: heroes, food sprites, junk monsters, clouds, skies.
// Everything is drawn at device-pixel resolution so it stays crisp on any screen.

export const CHARACTERS = [
  { id: 'elein', en: 'Elein', ar: 'إيلين', skin: '#f6d3b8', hair: '#5a321c', hairStyle: 'long', outfit: '#ff5fa2', accent: '#ffd1e6', gender: 'f',
    ability: 'magnet', icon: '🍓', abilityName: { en: 'Berry Magnet', ar: 'مغناطيس التوت' }, desc: { en: 'Pulls healthy food to you', ar: 'يجذب الأكل الصحي نحوك' } },
  { id: 'yomna', en: 'Yomna', ar: 'يمنى', skin: '#ebbd94', hair: '#20182a', hairStyle: 'bun', outfit: '#2fb2ff', accent: '#c9ecff', gender: 'f',
    ability: 'shield', icon: '💧', abilityName: { en: 'Water Bubble', ar: 'فقاعة الماء' }, desc: { en: 'A bubble that blocks junk', ar: 'فقاعة تصد الأكل الضار' } },
  { id: 'abdelkarim', en: 'Abdelkarim', ar: 'عبدالكريم', skin: '#d8a078', hair: '#24160e', hairStyle: 'spiky', outfit: '#ff8a1f', accent: '#ffe1bf', gender: 'm',
    ability: 'dash', icon: '🥕', abilityName: { en: 'Carrot Rocket', ar: 'صاروخ الجزر' }, desc: { en: 'Smash through junk!', ar: 'يحطم الأكل الضار!' } },
  { id: 'razan', en: 'Razan', ar: 'رزان', skin: '#f2c6a2', hair: '#8a3f1c', hairStyle: 'ponytail', outfit: '#25c46c', accent: '#c8f5da', gender: 'f',
    ability: 'blast', icon: '🥦', abilityName: { en: 'Broccoli Blast', ar: 'انفجار البروكلي' }, desc: { en: 'Clears all junk on screen', ar: 'يزيل كل الأكل الضار' } },
  { id: 'sara', en: 'Sara', ar: 'سارة', skin: '#c48a60', hair: '#140d09', hairStyle: 'puffs', outfit: '#ffc61a', accent: '#fff0bd', gender: 'f',
    ability: 'heal', icon: '🍌', abilityName: { en: 'Banana Boost', ar: 'دفعة الموز' }, desc: { en: 'Gives an extra heart', ar: 'يعطي قلباً إضافياً' } },
  { id: 'meme', en: 'Meme', ar: 'ميمي', skin: '#fbe0c8', hair: '#d9952e', hairStyle: 'pigtails', outfit: '#9b62ff', accent: '#e5d6ff', gender: 'f',
    ability: 'double', icon: '🌈', abilityName: { en: 'Rainbow Salad', ar: 'سلطة قوس قزح' }, desc: { en: 'Double points!', ar: 'نقاط مضاعفة!' } },
  { id: 'layan', en: 'Layan', ar: 'ليان', skin: '#e3b08b', hair: '#3a2214', hairStyle: 'bob', outfit: '#ff4757', accent: '#ffd0d5', gender: 'f',
    ability: 'slow', icon: '🍎', abilityName: { en: 'Apple Time', ar: 'وقت التفاح' }, desc: { en: 'Slows down time', ar: 'يبطئ الوقت' } },
];
export const charById = (id) => CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];

export const HEALTHY_FOODS = ['🍎', '🍌', '🥕', '🥦', '🍇', '🍓', '🥒', '🍉', '🥑', '🍊', '🥛', '💧', '🐟', '🥚', '🍐', '🌽', '🥜', '🍒', '🥝', '🍅'];
export const JUNK_FOODS = ['chips', '🍟', '🍔', '🍫', '🍩', '🍭', '🍬', '🥤', '🍕', '🌭', '🧁', '🍪'];

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return `rgb(${r},${g},${b})`;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------- Chips bag (no emoji exists for it) ----------
export function drawChipsBag(ctx, s) {
  const u = s / 100;
  ctx.save();
  // bag body with crimped top and bottom
  const g = ctx.createLinearGradient(-40 * u, 0, 40 * u, 0);
  g.addColorStop(0, '#d61f2c');
  g.addColorStop(0.5, '#ff4b4b');
  g.addColorStop(1, '#b3121f');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-36 * u, -38 * u);
  for (let i = 0; i <= 8; i++) ctx.lineTo(-36 * u + i * 9 * u, (i % 2 ? -44 : -38) * u);
  ctx.quadraticCurveTo(44 * u, 0, 36 * u, 38 * u);
  for (let i = 8; i >= 0; i--) ctx.lineTo(-36 * u + i * 9 * u, (i % 2 ? 44 : 38) * u);
  ctx.quadraticCurveTo(-44 * u, 0, -36 * u, -38 * u);
  ctx.fill();
  // yellow label
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.ellipse(0, -6 * u, 28 * u, 17 * u, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b3121f';
  ctx.font = `900 ${15 * u}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CHIPS', 0, -6 * u);
  // chips
  ctx.fillStyle = '#ffcf6b';
  ctx.strokeStyle = '#e39b26';
  ctx.lineWidth = 2 * u;
  for (const [x, y, r] of [[-14, 22, 9], [6, 25, 10], [20, 19, 7]]) {
    ctx.beginPath();
    ctx.ellipse(x * u, y * u, r * u, r * 0.7 * u, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // shine
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(-24 * u, -10 * u, 4 * u, 20 * u, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---------- Sprite cache ----------
const cache = new Map();

export function foodSprite(icon, size, dpr, kind = 'healthy') {
  const key = `${icon}|${Math.round(size)}|${dpr}|${kind}`;
  let c = cache.get(key);
  if (c) return c;
  const pad = size * 0.5;
  const full = size + pad * 2;
  c = document.createElement('canvas');
  c.width = c.height = Math.ceil(full * dpr);
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.translate(full / 2, full / 2);

  if (kind === 'junk') {
    // purple junk-fog aura
    const g = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 0.95);
    g.addColorStop(0, 'rgba(140,40,200,0.55)');
    g.addColorStop(1, 'rgba(90,20,140,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.95, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'healthy') {
    const g = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 0.85);
    g.addColorStop(0, 'rgba(255,255,210,0.75)');
    g.addColorStop(1, 'rgba(255,255,180,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  if (icon === 'chips') {
    drawChipsBag(ctx, size * 0.95);
  } else {
    ctx.font = `${size * 0.82}px ${EMOJI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 0, size * 0.06);
  }

  if (kind === 'junk') {
    // grumpy monster face on top
    const u = size / 100;
    const ey = -4 * u;
    for (const sx of [-1, 1]) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(sx * 13 * u, ey, 9 * u, 10 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2.2 * u;
      ctx.strokeStyle = '#2a0838';
      ctx.stroke();
      ctx.fillStyle = '#2a0838';
      ctx.beginPath();
      ctx.arc(sx * 11 * u, ey + 2 * u, 4.5 * u, 0, Math.PI * 2);
      ctx.fill();
      // angry brow
      ctx.lineWidth = 4.5 * u;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sx * 24 * u, ey - 14 * u);
      ctx.lineTo(sx * 5 * u, ey - 8 * u);
      ctx.stroke();
    }
    // jagged mouth
    ctx.fillStyle = '#2a0838';
    ctx.beginPath();
    ctx.moveTo(-12 * u, 16 * u);
    ctx.quadraticCurveTo(0, 8 * u, 12 * u, 16 * u);
    ctx.quadraticCurveTo(0, 13 * u, -12 * u, 16 * u);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-6 * u, 13.2 * u); ctx.lineTo(-3 * u, 16 * u); ctx.lineTo(-1 * u, 12.4 * u); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6 * u, 13.2 * u); ctx.lineTo(3 * u, 16 * u); ctx.lineTo(1 * u, 12.4 * u); ctx.fill();
  }
  c.full = full;
  cache.set(key, c);
  return c;
}

export function cloudSprite(w, dpr, tint = '#ffffff') {
  const key = `cloud|${Math.round(w)}|${dpr}|${tint}`;
  let c = cache.get(key);
  if (c) return c;
  const h = w * 0.55;
  c = document.createElement('canvas');
  c.width = Math.ceil(w * dpr);
  c.height = Math.ceil(h * dpr);
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = tint;
  const puffs = [[0.25, 0.65, 0.2], [0.42, 0.45, 0.25], [0.62, 0.5, 0.22], [0.78, 0.66, 0.17], [0.5, 0.7, 0.24]];
  for (const [x, y, r] of puffs) {
    ctx.beginPath();
    ctx.arc(x * w, y * h, r * w, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-atop';
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(120,150,200,0.22)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  c.w = w; c.h = h;
  cache.set(key, c);
  return c;
}

export function clearArtCache() { cache.clear(); }

// ---------- Hero ----------
// Draws a hero centred at (0,0). `s` is the overall size (≈ head diameter * 1.4).
// opts: { t, mood: 'happy'|'yay'|'tired'|'hurt', glider: bool, glow: 0..1, tilt }
export function drawHero(ctx, ch, s, opts = {}) {
  const { t = 0, mood = 'happy', glider = true, glow = 0, tilt = 0 } = opts;
  const u = s / 100;
  ctx.save();
  ctx.rotate(tilt);

  if (glow > 0) {
    const g = ctx.createRadialGradient(0, 0, 10 * u, 0, 0, 95 * u);
    g.addColorStop(0, `rgba(255,236,140,${0.55 * glow})`);
    g.addColorStop(1, 'rgba(255,236,140,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 95 * u, 0, Math.PI * 2);
    ctx.fill();
  }

  const bob = Math.sin(t * 4) * 2 * u;
  ctx.translate(0, bob);

  // cape (behind)
  const flap = Math.sin(t * 9) * 6 * u;
  ctx.fillStyle = shade(ch.outfit, -40);
  ctx.beginPath();
  ctx.moveTo(-16 * u, 14 * u);
  ctx.quadraticCurveTo(-34 * u, 40 * u + flap, -26 * u + flap, 62 * u);
  ctx.lineTo(26 * u - flap, 62 * u);
  ctx.quadraticCurveTo(34 * u, 40 * u - flap, 16 * u, 14 * u);
  ctx.closePath();
  ctx.fill();

  // hair back layer
  hairBack(ctx, ch, u, t);

  // body
  const bg = ctx.createLinearGradient(0, 10 * u, 0, 50 * u);
  bg.addColorStop(0, ch.outfit);
  bg.addColorStop(1, shade(ch.outfit, -30));
  ctx.fillStyle = bg;
  rr(ctx, -20 * u, 10 * u, 40 * u, 38 * u, 14 * u);
  ctx.fill();
  // emblem: leaf star
  ctx.fillStyle = ch.accent;
  ctx.beginPath();
  ctx.arc(0, 27 * u, 7 * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2bb673';
  ctx.beginPath();
  ctx.ellipse(0, 27 * u, 3 * u, 5.5 * u, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // arms holding the glider edges
  ctx.strokeStyle = ch.skin;
  ctx.lineCap = 'round';
  ctx.lineWidth = 9 * u;
  ctx.beginPath();
  ctx.moveTo(-17 * u, 18 * u); ctx.quadraticCurveTo(-32 * u, 28 * u, -36 * u, 44 * u);
  ctx.moveTo(17 * u, 18 * u); ctx.quadraticCurveTo(32 * u, 28 * u, 36 * u, 44 * u);
  ctx.stroke();

  if (glider) drawGlider(ctx, u, t);

  // head
  const hy = -20 * u;
  const R = 32 * u;
  const hg = ctx.createRadialGradient(-8 * u, hy - 10 * u, 4 * u, 0, hy, R);
  hg.addColorStop(0, shade(ch.skin, 18));
  hg.addColorStop(1, ch.skin);
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(0, hy, R, 0, Math.PI * 2);
  ctx.fill();
  // ears
  ctx.fillStyle = ch.skin;
  for (const sx of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(sx * 31 * u, hy + 4 * u, 6 * u, 8 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  face(ctx, ch, u, hy, mood, t);
  hairFront(ctx, ch, u, hy, R, t);
  goggles(ctx, ch, u, hy);

  if (mood === 'tired') {
    // sweat drop
    ctx.fillStyle = '#7fd3ff';
    ctx.beginPath();
    const sy = hy - 4 * u + ((t * 20) % 10) * u;
    ctx.moveTo(30 * u, sy - 7 * u);
    ctx.quadraticCurveTo(36 * u, sy + 2 * u, 30 * u, sy + 4 * u);
    ctx.quadraticCurveTo(24 * u, sy + 2 * u, 30 * u, sy - 7 * u);
    ctx.fill();
  }
  ctx.restore();
}

function drawGlider(ctx, u, t) {
  ctx.save();
  ctx.translate(0, 50 * u);
  ctx.rotate(Math.sin(t * 3) * 0.03);
  const g = ctx.createLinearGradient(0, -14 * u, 0, 14 * u);
  g.addColorStop(0, '#7be37a');
  g.addColorStop(1, '#1f9a4c');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-64 * u, 0);
  ctx.quadraticCurveTo(-20 * u, -22 * u, 64 * u, -4 * u);
  ctx.quadraticCurveTo(10 * u, 22 * u, -64 * u, 0);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2.5 * u;
  ctx.beginPath();
  ctx.moveTo(-60 * u, 0);
  ctx.quadraticCurveTo(0, -4 * u, 60 * u, -4 * u);
  ctx.stroke();
  ctx.lineWidth = 1.6 * u;
  for (let i = -3; i <= 3; i++) {
    if (!i) continue;
    const x = i * 15 * u;
    ctx.beginPath();
    ctx.moveTo(x, -2 * u);
    ctx.lineTo(x + 8 * u, (i % 2 ? -10 : 8) * u);
    ctx.stroke();
  }
  ctx.restore();
}

function face(ctx, ch, u, hy, mood, t) {
  const ey = hy + 2 * u;
  const blink = (t % 3.2) > 3.05;
  ctx.fillStyle = '#2a1a14';
  ctx.strokeStyle = '#2a1a14';
  ctx.lineCap = 'round';
  for (const sx of [-1, 1]) {
    const ex = sx * 12 * u;
    if (mood === 'hurt') {
      ctx.lineWidth = 3.5 * u;
      // squeezed >  < eyes
      const d = -sx;
      ctx.beginPath();
      ctx.moveTo(ex - 5 * u * d, ey - 5 * u); ctx.lineTo(ex + 4 * u * d, ey); ctx.lineTo(ex - 5 * u * d, ey + 5 * u);
      ctx.stroke();
    } else if (blink || mood === 'yay') {
      ctx.lineWidth = 3.5 * u;
      ctx.beginPath();
      ctx.arc(ex, ey + 2 * u, 6 * u, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(ex, ey, 6 * u, 7.5 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ex - 2 * u, ey - 3 * u, 2.4 * u, 0, Math.PI * 2);
      ctx.arc(ex + 2.5 * u, ey + 2.5 * u, 1.1 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2a1a14';
      if (mood === 'tired') {
        // heavy eyelids
        ctx.fillStyle = ch.skin;
        ctx.beginPath();
        ctx.ellipse(ex, ey - 3.5 * u, 7 * u, 5 * u, 0, Math.PI, Math.PI * 2);
        ctx.rect(ex - 7 * u, ey - 4 * u, 14 * u, 3 * u);
        ctx.fill();
        ctx.strokeStyle = '#2a1a14';
        ctx.lineWidth = 2 * u;
        ctx.beginPath();
        ctx.moveTo(ex - 7 * u, ey - 1 * u); ctx.lineTo(ex + 7 * u, ey - 1 * u);
        ctx.stroke();
        ctx.fillStyle = '#2a1a14';
      }
    }
  }
  // blush
  ctx.fillStyle = 'rgba(255,110,130,0.35)';
  for (const sx of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(sx * 20 * u, hy + 12 * u, 6 * u, 3.5 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // mouth
  const my = hy + 16 * u;
  ctx.lineWidth = 3 * u;
  ctx.strokeStyle = '#7a2a2a';
  if (mood === 'yay') {
    ctx.fillStyle = '#7a2a2a';
    ctx.beginPath();
    ctx.moveTo(-9 * u, my - 2 * u);
    ctx.quadraticCurveTo(0, my + 14 * u, 9 * u, my - 2 * u);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ff8fa0';
    ctx.beginPath();
    ctx.ellipse(0, my + 5 * u, 4.5 * u, 2.5 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (mood === 'tired') {
    ctx.beginPath();
    ctx.moveTo(-7 * u, my + 2 * u);
    ctx.quadraticCurveTo(-3 * u, my - 1 * u, 0, my + 2 * u);
    ctx.quadraticCurveTo(3 * u, my + 5 * u, 7 * u, my + 2 * u);
    ctx.stroke();
  } else if (mood === 'hurt') {
    ctx.fillStyle = '#7a2a2a';
    ctx.beginPath();
    ctx.ellipse(0, my + 3 * u, 4 * u, 5 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, my - 3 * u, 8 * u, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  }
}

function goggles(ctx, ch, u, hy) {
  const gy = hy - 20 * u;
  ctx.strokeStyle = shade(ch.outfit, -50);
  ctx.lineWidth = 4 * u;
  ctx.beginPath();
  ctx.moveTo(-31 * u, gy + 4 * u);
  ctx.quadraticCurveTo(0, gy - 4 * u, 31 * u, gy + 4 * u);
  ctx.stroke();
  for (const sx of [-1, 1]) {
    ctx.fillStyle = shade(ch.outfit, -50);
    ctx.beginPath();
    ctx.arc(sx * 11 * u, gy, 9 * u, 0, Math.PI * 2);
    ctx.fill();
    const lg = ctx.createLinearGradient(sx * 11 * u - 6 * u, gy - 6 * u, sx * 11 * u + 6 * u, gy + 6 * u);
    lg.addColorStop(0, '#e9fbff');
    lg.addColorStop(1, ch.accent);
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(sx * 11 * u, gy, 6.5 * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(sx * 11 * u - 2.5 * u, gy - 2.5 * u, 1.8 * u, 0, Math.PI * 2);
    ctx.fill();
  }
}

function hairBack(ctx, ch, u, t) {
  const hy = -20 * u;
  ctx.fillStyle = ch.hair;
  const sway = Math.sin(t * 5) * 3 * u;
  switch (ch.hairStyle) {
    case 'long':
      ctx.beginPath();
      ctx.moveTo(-34 * u, hy);
      ctx.quadraticCurveTo(-42 * u, hy + 40 * u, -30 * u + sway, hy + 52 * u);
      ctx.lineTo(30 * u + sway, hy + 52 * u);
      ctx.quadraticCurveTo(42 * u, hy + 40 * u, 34 * u, hy);
      ctx.closePath();
      ctx.fill();
      break;
    case 'bob':
      ctx.beginPath();
      ctx.moveTo(-36 * u, hy - 4 * u);
      ctx.quadraticCurveTo(-40 * u, hy + 26 * u, -26 * u, hy + 28 * u);
      ctx.lineTo(26 * u, hy + 28 * u);
      ctx.quadraticCurveTo(40 * u, hy + 26 * u, 36 * u, hy - 4 * u);
      ctx.closePath();
      ctx.fill();
      break;
    case 'ponytail':
      ctx.beginPath();
      ctx.moveTo(22 * u, hy - 22 * u);
      ctx.quadraticCurveTo(58 * u + sway * 2, hy - 18 * u, 46 * u + sway * 3, hy + 30 * u);
      ctx.quadraticCurveTo(40 * u, hy, 20 * u, hy - 10 * u);
      ctx.closePath();
      ctx.fill();
      break;
    case 'pigtails':
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(sx * 38 * u, hy + 14 * u + sway * sx, 9 * u, 20 * u, sx * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    default:
      break;
  }
}

function hairFront(ctx, ch, u, hy, R, t) {
  ctx.fillStyle = ch.hair;
  const style = ch.hairStyle;
  // shared cap with scalloped bangs
  ctx.beginPath();
  ctx.arc(0, hy, R * 1.06, Math.PI * 1.02, Math.PI * 1.98);
  const by = hy - 10 * u;
  const n = style === 'spiky' ? 5 : 4;
  for (let i = 0; i <= n; i++) {
    const x1 = R * 1.04 - (i * 2 * R * 1.04) / n;
    const x0 = R * 1.04 - ((i - 0.5) * 2 * R * 1.04) / n;
    if (i === 0) ctx.lineTo(x1, by + 6 * u);
    else ctx.quadraticCurveTo(x0, by + (style === 'spiky' ? -2 : 10) * u, x1, by + (i === n ? 6 : 0) * u);
  }
  ctx.closePath();
  ctx.fill();

  // gloss
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 3 * u;
  ctx.beginPath();
  ctx.arc(0, hy, R * 0.85, Math.PI * 1.25, Math.PI * 1.5);
  ctx.stroke();

  ctx.fillStyle = ch.hair;
  switch (style) {
    case 'spiky':
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = Math.PI * (1.15 + i * 0.175);
        const bx = Math.cos(a) * R, bY = hy + Math.sin(a) * R;
        ctx.moveTo(bx - 8 * u, bY + 4 * u);
        ctx.lineTo(Math.cos(a) * (R + 14 * u), hy + Math.sin(a) * (R + 14 * u));
        ctx.lineTo(bx + 8 * u, bY + 4 * u);
      }
      ctx.fill();
      break;
    case 'bun':
      ctx.beginPath();
      ctx.arc(0, hy - R - 6 * u, 14 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ch.accent;
      rr(ctx, -10 * u, hy - R + 2 * u, 20 * u, 5 * u, 2.5 * u);
      ctx.fill();
      break;
    case 'puffs':
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(sx * 30 * u, hy - 24 * u, 15 * u, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = ch.accent;
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(sx * 22 * u, hy - 14 * u, 4 * u, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'pigtails':
      ctx.fillStyle = ch.accent;
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(sx * 34 * u, hy - 2 * u, 5 * u, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'ponytail':
      ctx.fillStyle = ch.accent;
      ctx.beginPath();
      ctx.arc(24 * u, hy - 20 * u, 5 * u, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'bob':
      ctx.strokeStyle = ch.accent;
      ctx.lineWidth = 5 * u;
      ctx.beginPath();
      ctx.arc(0, hy, R * 1.0, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      break;
    case 'long':
      // a little flower clip
      ctx.fillStyle = ch.accent;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(-24 * u + Math.cos(a) * 4 * u, hy - 18 * u + Math.sin(a) * 4 * u, 3.2 * u, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.arc(-24 * u, hy - 18 * u, 2.6 * u, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      break;
  }
}

// Render a hero portrait into a <canvas> element at full device resolution.
export function renderPortrait(canvas, ch, opts = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const w = canvas.clientWidth || canvas.width;
  const h = canvas.clientHeight || canvas.height;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.translate(w / 2, h * (opts.glider === false ? 0.56 : 0.5));
  drawHero(ctx, ch, Math.min(w, h) * (opts.scale || 0.72), opts);
}

// ---------- Sky themes per world ----------
export const SKIES = [
  { top: '#6cc6ff', bottom: '#e6f7ff', cloud: '#ffffff', hill: '#7bd389', hill2: '#5cbf74' },
  { top: '#ff8f6b', bottom: '#ffe0a3', cloud: '#fff3e6', hill: '#f2a65a', hill2: '#e0823d' },
  { top: '#2fa8e0', bottom: '#bff0ff', cloud: '#ffffff', hill: '#2f8fd8', hill2: '#1c6fb5', sea: true },
  { top: '#141a46', bottom: '#4a3a8f', cloud: '#8d84c9', hill: '#2b2a6b', hill2: '#211f55', stars: true },
  { top: '#b693ff', bottom: '#ffd3ef', cloud: '#fff7fd', hill: '#ff9ccf', hill2: '#c78bff', rainbow: true },
];

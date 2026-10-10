# Vitaland · فيتالاند

**Fly high. Eat smart. Beat the Junk Fog!**
**حلّق عالياً. كُل بذكاء. اهزم ضباب الأكل الضار!**

Vitaland is a bilingual (Arabic / English) sky adventure for kids aged **5–15**. It encourages them to choose
healthy food over fast food, chips, chocolate and sugary drinks. What they really eat each day sets how strong
their hero is in the game.

## How it works

1. **Create a hero.** Each child enters a name, age and boy/girl (used for correct Arabic phrasing), then picks one of
   the 7 heroes: **Elein, Yomna, Abdelkarim, Razan, Sara, Meme, Layan**. Each hero has a different look and power.
2. **Daily Hero Check-in.** Once a day the child taps in how many times in the last 24 hours they ate:
   - *Junk:* chips, chocolate, fast food, soda, candy, donuts/cake
   - *Healthy:* fruit, vegetables, water, milk/yogurt, home-cooked meals, eggs/fish/nuts
3. **Vitality (0–100)** is calculated from those answers and changes the game that day:

   | Vitality | Hearts | Hero |
   |---|---|---|
   | 80–100 | ❤️×5 | Glowing golden aura, quickest steering, fastest power charge |
   | 55–79 | ❤️×4 | Strong |
   | 30–54 | ❤️×3 | Okay |
   | < 30 | ❤️×2 | Tired (sleepy eyes, sweat drop), slower steering |

   A spoken phrase (Arabic or English) **praises** healthy days and sounds **disappointed but encouraging** on junk days.
4. **Play.** Steer a leaf glider through 5 worlds (Sunny Meadow, Orchard Sunset, Ocean Breeze, Starry Night,
   Rainbow Peaks). Catch healthy food for points, combos and power. Dodge the junk-food monsters coming out of the
   purple Junk Fog. Hitting junk costs a heart and makes your hero slow for a moment.
5. **Between worlds** there's a nutrition fact (read aloud) and a quick 2-choice quiz.

### Hero powers

| Hero | Power |
|---|---|
| Elein 🍓 | Berry Magnet: pulls healthy food in |
| Yomna 💧 | Water Bubble: a shield against junk |
| Abdelkarim 🥕 | Carrot Rocket: smash through junk |
| Razan 🥦 | Broccoli Blast: clears all junk on screen |
| Sara 🍌 | Banana Boost: an extra heart |
| Meme 🌈 | Rainbow Salad: double points |
| Layan 🍎 | Apple Time: slows time down |

### Other features
- **Arabic first** with full right-to-left layout and Arabic-Indic numerals; switch to English any time.
- **Voice:** spoken praise and disappointment phrases, in-game cheers ("Yummy!", "لذيذ!"), facts read aloud,
  plus procedural sound effects and music. Each can be turned off in Settings.
- **Family platform:** many players on one device, a family leaderboard, a 7-day vitality chart, a healthy-day streak
  and 10 badges.
- **Shareable score card:** makes a 1080×1350 image of your hero and score and opens the phone's share sheet
  (WhatsApp, Instagram, etc.).
- **Age-aware difficulty:** ages 5–7 get a slower game with less junk, and missing a fruit doesn't break the combo.
  Ages 12–15 get a faster game.
- **Sharp on any screen:** all characters are vector art drawn at the device's pixel ratio, and the game runs at 60 fps.
- **Private:** no ads, no accounts, no tracking. Data stays in the device's local storage.
- **Works offline** after the first visit (service worker).

## Run it

No build step and no dependencies are needed.

```bash
npm start            # serves on http://localhost:5173
# or any static server, e.g.  python3 -m http.server 5173
```

Keyboard: ← → or A/D to steer, Space to use your power, Esc/P to pause. Touch: drag anywhere.

## Put it online

The game is static files, so you can host it for free on **GitHub Pages**, **Vercel** or **Netlify**: point any of
them at the repository root. For good link previews on WhatsApp and social apps, change `og:image` in
`index.html` to the full URL (e.g. `https://your-domain/icons/og.png`).

## Turn it into a mobile app

**Option 1, install as an app (PWA), no store needed.** Open the site on a phone, then choose
*Add to Home Screen* (iOS Safari) or *Install app* (Android Chrome; there's also a button in Settings). It opens
full-screen with its own icon and works offline.

**Option 2, Google Play / App Store (Capacitor).** The project is already set up:

```bash
npm run app:setup     # installs Capacitor, creates android/ and ios/ projects
npm run app:android   # copies the game into www/ and opens Android Studio
npm run app:ios       # same for Xcode (macOS)
```

The app ID and name are in `capacitor.config.json`.

## Project structure

```
index.html            app shell
css/style.css         UI styling (RTL-aware)
js/app.js             screens, check-in, hub, overlays, sharing, PWA install
js/game.js            game engine (spawning, collisions, powers, rendering)
js/art.js             vector heroes, junk monsters, chips bag, clouds, sky themes
js/audio.js           sound effects, music sequencer, speech (Web Speech API)
js/i18n.js            Arabic/English strings, voice phrases, facts, quizzes, badges
js/storage.js         players, daily check-ins, vitality formula, streaks, badges
sw.js                 offline cache
manifest.webmanifest  PWA manifest
scripts/build-www.mjs copies the game into www/ for Capacitor
```

## Notes

- **Voices** use the device's built-in text-to-speech. Most Android and iOS devices include an Arabic voice. On a
  desktop with no Arabic voice installed, Arabic phrases may be silent; add one in the OS language/speech settings.
  To use your own recorded voice actors, swap `speak()` in `js/audio.js` for audio files.
- **Vitality formula** (`js/storage.js → computeVitality`): starts at 45, each healthy item adds about 7 (capped per
  category), each junk item takes away about 11. Fast food and soda count a bit more.
- To add phrases, facts or quiz questions, edit `js/i18n.js`. Every entry has an Arabic and an English version.

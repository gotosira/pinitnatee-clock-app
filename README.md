# Pinit Clock

A live watchface that overlays the Thai astrological **ยามพินิจนาที** (yam-pinich-natee) time-tracking system on a real-time clock. Each 12-hour day is divided into eight 90-minute *yam* segments; each yam subdivides into eight 3.75-minute *mini* slots. The watch dial highlights the current yam and mini, the SevenTable view shows the full grid with named astrological houses (อัตตะ, หินะ, ธนัง, …), and a countdown ticks down to the next 30-minute boundary.

A second "Simple" interface drops the analog dial for a large digital readout.

**Live:** [gotosira.github.io/pinitnatee-clock-app](https://gotosira.github.io/pinitnatee-clock-app/)

## Stack

- React 19 + TypeScript 5.8
- Vite 7 (dev + build), Vitest (unit tests)
- ESLint flat config (`eslint.config.js`) — zero-finding policy
- Service Worker for offline app-shell + hashed-asset caching
- Deployed to GitHub Pages via `gh-pages` branch

## Running locally

```bash
npm install
npm run dev          # http://localhost:5173/pinitnatee-clock-app/
```

The dev server binds to `0.0.0.0` so you can reach it from a phone on the same Wi-Fi for PWA install testing.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | ESLint over the whole tree |
| `npm test` | Run Vitest once |
| `npm run deploy` | Build + push `dist/` to the `gh-pages` branch |

## Environment variables

Both are optional — the app works without them, falling back to Picsum images and a hand-curated quote pool.

| Var | What it enables |
|---|---|
| `VITE_UNSPLASH_ACCESS_KEY` | Time-of-day + weather-aware random Unsplash backgrounds. After a 401/403 response we back off for 6h and silently use Picsum. |
| `VITE_API_NINJAS_KEY` | Daily-rotating success quotes from api-ninjas. Cached in `localStorage` for 24h. |

> ⚠️ Both keys ship in the JS bundle. Use a key with low quota and rate limits, or proxy the requests through an edge function if you need real protection.

## Architecture

```
src/
├── App.tsx                  ← composition + background style
├── main.tsx                 ← StrictMode + TimeProvider + App
├── components/
│   ├── analog/AnalogClock   ← 60-tick / 24-segment dial, hands, dial-info
│   ├── SimpleInterface      ← digital fallback layout
│   ├── DigitalTime          ← HH:MM AM/PM
│   ├── YamInline            ← current yam + mini + countdown
│   ├── SevenTable           ← lazy-loaded 5×7 grid w/ Thai house labels
│   ├── QuoteBar             ← 24h-cached quote
│   ├── TopBar               ← interface switcher + 7-table toggle + meditation
│   └── InterfaceSwitcher    ← Watchface ↔ Simple
├── state/
│   ├── time.ts              ← TimeContext + useTime() hook
│   ├── TimeProvider.tsx     ← single 1Hz wall-clock-aligned tick
│   └── ui.ts                ← persisted "watchface" | "simple"
├── hooks/
│   ├── useBackground        ← Unsplash random + Picsum fallback, 5min refresh
│   ├── useLocation          ← getCurrentPosition + reverse-geocode + elevation
│   ├── useTemperature       ← Open-Meteo current temp + weather code, 10min refresh
│   ├── useBattery           ← Battery API w/ manual override
│   ├── useMeditationAudio   ← Archive.org ambient track w/ volume fade
│   └── useLocalStorage      ← cross-tab/window-synced localStorage
├── services/
│   ├── unsplash.ts          ← random photo by keywords; persistent 401 backoff
│   └── meditation.ts        ← Archive.org search → mp3 URL
└── utils/
    ├── yam.ts               ← all yam/pinich computation, 23 unit tests
    ├── weather.ts           ← weather-code → emoji + Unsplash keywords
    └── timeKeywords.ts      ← time-of-day → Unsplash keywords
```

### Time architecture

A single `TimeProvider` ticks once per second, **wall-clock aligned** (next tick is scheduled to fall on the next OS-second boundary). Every component that needs the current time pulls it via `useTime()` instead of running its own `setInterval`.

Background refresh and weather refresh run on much longer cadences (5/10 min) and are gated by `document.visibilityState === 'visible'` to avoid pinging APIs while the tab is in the background.

### Yam logic

All yam/pinich domain logic lives in `src/utils/yam.ts` and is covered by 23 vitest cases (boundary inclusivity at 06:00 / 18:00, pre-6am rollover, 3.75-min bucket edges, and so on). When you want to highlight or compute against the current yam, call `getCurrentYam`, `getCurrentPinichMini`, `secondsSinceYamStart`, or `yamThirdIndex`. Don't reinvent the math in components.

## Deployment

```bash
npm run deploy
```

…which is `tsc -b && vite build && gh-pages -d dist`. The `gh-pages` branch is what GitHub Pages serves; `main` does not need to ship build output.

## License

MIT.

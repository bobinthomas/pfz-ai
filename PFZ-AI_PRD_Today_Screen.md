# PFZ-AI — Product Requirements Document
## Screen: "Today" / Catch Dashboard (Fisherman MVP)

| Field | Value |
|---|---|
| Product | PFZ-AI — Potential Fish Zone advisory for Kerala fishermen |
| Document | Frontend PRD — *Today / Catch dashboard* screen + supporting scaffold |
| Version | 1.0 |
| Status | Ready for build (pending confirmation of §3 assumptions) |
| Date | 2026-06-07 |
| Primary reader | Claude Code (implementation agent) |
| Source inputs | PFZ-AI Solution Architecture Document (HLD); PFZ-AI Low Level Design UI/UX (LLD); design iterations v1→v4 |

> **How to use this document:** This is the single source of truth for building the *Today* screen and the project scaffold it lives in. Build strictly to the acceptance criteria in §14. Where this PRD and the source HLD/LLD disagree, this PRD wins (see §17 for known source-doc errors that are deliberately corrected here). Do not invent product behavior not specified here; if something is genuinely undefined, stop and ask.

---

## 1. Summary

PFZ-AI tells a coastal fisherman **how good the catch will be today, where, and how sure we are** — tailored to their specific boat. The *Today* screen is the heart of the product: a fisherman opens it before leaving harbour and must, at a glance, learn (a) whether it's worth going out, (b) the single best place to go that their boat can actually reach, (c) how confident the system is, and (d) whether it's safe.

Weather is a **supporting and safety factor only** — it never out-ranks the catch message except when conditions are dangerous, in which case it overrides everything.

## 2. Goals & non-goals

### 2.1 Goals
- G1. Communicate the **best reachable catch** for the user's boat in under 3 seconds of glancing, in plain language.
- G2. Always express **confidence** ("how sure") alongside catch quality, with a plain-language reason.
- G3. Personalize every recommendation to the **boat** (range, gear, depth) — including refusing to recommend zones the boat can't reach.
- G4. Remain usable **offline / on intermittent satellite**, clearly labelling stale/cached data.
- G5. Fully support **English, Tamil, Malayalam**, including decision-critical content (not just chrome) and local fish names.
- G6. **Gate on safety**: a severe-weather warning overrides the catch view.
- G7. Be legible and operable on a **console-mounted tablet** in sunlight, with large touch targets.

### 2.2 Non-goals (explicitly out of scope for this PRD)
- Onboarding / boat-registration screen (separate PRD; this screen assumes a boat exists).
- Authentication / login (assumed handled upstream — see §3).
- Zones list page, Trips/history, Settings — separate PRDs (nav stubs only here).
- Operator "Command Centre" (separate wide-screen app, future).
- Real species-by-species population modelling, boat-hardware/chartplotter integration, non-Indian coasts, network provisioning (all out of scope per HLD).
- Backend/model implementation. This PRD is **frontend only**; it consumes JSON.

## 3. Assumptions & open decisions — **CONFIRM BEFORE BUILD**

These were defaulted to keep momentum. Override any that are wrong.

| # | Assumption | Impact if wrong |
|---|---|---|
| A1 | **Plain Vite + React PWA** (not Next.js). The app is an offline-first tool, not a public marketing/SEO surface. | Changes routing, build, rendering model. |
| A2 | **Backend not yet live** → build against MSW mocks matching §7 contract; swap to live API later with no UI change. | Changes the data-layer entry point only. |
| A3 | **SVG harbour course-map for MVP**; real geographic tiles (MapLibre GL + offline vector tiles) is a later milestone. | Affects the map component only; interface is identical. |
| A4 | **User is authenticated and their boat is onboarded** before reaching this screen. Boat data arrives with the forecast payload. | If false, screen must add a "no boat" prompt state (spec'd in §10 as a stub). |
| A5 | **Launch languages: English (en), Tamil (ta), Malayalam (ml).** | Adding languages later is cheap; the architecture already supports it. |

## 4. Target user & context of use

- **User:** artisanal/small-boat fisherman in coastal Kerala. Often **low digital literacy**; may not read English.
- **Device:** Android tablet, frequently **mounted in the boat console / wheelhouse**, viewed at arm's length, sometimes by more than one crew member. Phones are a secondary form factor.
- **Environment:** bright tropical sunlight, salt spray, motion, wet hands, **intermittent or absent connectivity** (satellite/JIO at sea).
- **Moment of use:** primarily pre-departure at harbour (deciding whether/where to go); secondarily at sea (re-checking).

### Design principles (derived; treat as constraints)
1. **One answer first.** The catch verdict + best spot dominate; everything else is secondary/progressive disclosure.
2. **Plain language over jargon.** No "biomass / pelagic / telemetry / zone integrity." Use "fish here / good fishing / how sure / water."
3. **Confidence is honest.** Tiers and plain words, never false-precision percentages in the primary UI.
4. **Boat-relative.** "Your best catch," not "the best zone."
5. **Safety can interrupt.** Severe weather overrides.
6. **Sunlight-legible, light theme, large targets** (≥ 48px; primary actions ≥ 56px).
7. **Offline is normal, not an error.** Label staleness calmly.

## 5. Tech stack

| Concern | Choice | Rationale |
|---|---|---|
| Language | **TypeScript** (strict) | Type-safe consumption of the JSON contract; catch drift at compile time. |
| Framework | **React 18** | Established choice. |
| Build/dev | **Vite** | Fast, first-class PWA support. |
| PWA/offline | **vite-plugin-pwa (Workbox)** | Service worker, installability, runtime caching. |
| Server data | **TanStack Query v5** | Caching, background refetch, stale-while-revalidate, offline persistence → powers the "synced Xh ago" UX. |
| Query persistence | **@tanstack/query-persist-client + IndexedDB** (idb-keyval) | Cached forecast survives reload/offline. |
| Client state | **Zustand** | Active coast/date, language, selected boat, connectivity. |
| Routing | **React Router v6** | Today / Zones / Trips / Settings routes. |
| Data types | **openapi-typescript** + **openapi-fetch** (or **orval** for generated Query hooks + MSW) | OpenAPI spec is source of truth. |
| Validation | **Zod** | Runtime-validate API JSON (degrade to low-data), and form validation. |
| Forms | **React Hook Form + Zod** | (Used by onboarding; primitives shared.) |
| Styling | **Tailwind CSS** + **CSS-variable design tokens** | Velocity + a swappable, accessible token layer for theme/contrast. |
| Accessible primitives | **Radix UI** (or React Aria) | Drawers, dialogs, selects with correct focus/SR semantics. |
| i18n | **react-i18next / i18next** | Namespaced locales, ICU plurals, language detection + persistence. |
| Fonts | **Bricolage Grotesque** (display), **Hanken Grotesk** (body/UI), **Noto Sans Tamil**, **Noto Sans Malayalam** | Display warmth + legibility; Noto so Indic scripts render correctly. |
| Map (MVP) | Custom **SVG** course-map component | Offline-friendly, low bandwidth. |
| Map (later) | **MapLibre GL JS** + offline vector tiles | Real geography without per-tile licensing. |
| Voice (assistant) | **Web Speech API** (graceful fallback to text) | STT/TTS; note dialect limits. |
| Mocks | **MSW (Mock Service Worker)** | Develop/test against contract; simulate every edge state. |
| Testing | **Vitest** (unit), **React Testing Library** (component), **Playwright** (E2E) | |
| Lint/format | **ESLint + Prettier**, TypeScript strict | |
| Package manager | **pnpm** | (Enables future workspace for Command Centre.) |

## 6. Architecture

### 6.1 Layering (mandatory separation)
1. **Data layer** (`src/lib/api`): typed fetch client + TanStack Query hooks. Fetches raw backend JSON, caches, persists, maps `problem+json` errors. **Components never call the API directly.**
2. **Domain layer** (`src/domain`): pure TypeScript — types + functions. All business rules live here (reachability, ranking, confidence banding, safety gate). Fully unit-tested, framework-agnostic, reusable by future Command Centre.
3. **UI layer** (`src/components/ui` + `src/features`): renders **view models** produced by the domain layer. Dumb and presentational.

Data flow: `OpenAPI spec → generated types → fetch client → Query hook → Zod parse → domain transform → view model → feature component → UI primitive`.

### 6.2 Folder structure
```
src/
  app/                 # shell, providers (QueryClient, i18n, theme), router, ErrorBoundary, <SafetyGate>
  features/
    today/             # THIS PRD: hero, course map, zones rail, weather, trust, assembled screen
    zones/  trips/  settings/  onboarding/   # stubs/routes only for this PRD
    assistant/         # AssistantDrawer
  components/ui/        # Button, Drawer, Card, Pill, ConfidenceMeter, TierBadge, RangeRing, StatTile, LanguageGate
  domain/              # zone.ts, boat.ts, confidence.ts, ranking.ts, safety.ts, weather.ts, types.ts (+ *.test.ts)
  lib/
    api/               # client.ts, queries.ts, errors.ts, generated types
    i18n/              # config.ts, locales/{en,ta,ml}.json, fonts.css
    offline/           # persistence.ts, connectivity.ts, outbox.ts
    theme/             # tokens.css, tailwind.config, contrast.ts
  mocks/               # handlers.ts, fixtures/*.json
  assets/
```

### 6.3 Cross-cutting providers
- **`<SafetyGate>`** near app root: reads `weather.severeWarning`; when true, child screens render their severe variant. Single source, not re-implemented per screen.
- **Connectivity store**: combines `navigator.onLine` with a periodic reachability check (satellite links report "online" while unusable). Exposes `online: boolean` and `lastSyncedAt`.
- **Theme provider**: applies design tokens; supports a high-contrast mode toggle (future).

## 7. Data contract (frontend ⇄ backend)

### 7.1 Principles (push to backend team)
- **P1. Enum keys, never display strings**, for anything localized: `species`, `confidence.reasons`, `catch.tier`, `weather.state`, `dataStatus`. The frontend localizes. (Sending `"Mackerel"` breaks multi-language.)
- **P2. Backend sends raw signals + tiers; frontend computes boat-relative ranking & reachability** (so changing boats re-ranks instantly and works offline).
- **P3. Errors use `application/problem+json`**; propagate `traceparent` / correlation IDs (per HLD API standards).
- **P4.** Every payload carries `meta.generatedAt` and `meta.ttlSeconds` for staleness UX.

### 7.2 Primary endpoint
`GET /v1/forecast?coast={coastId}&date={ISO-DATE}&boatId={boatId}`
→ `200 application/json` with the body below.

### 7.3 Response schema (canonical)
```jsonc
{
  "meta": {
    "generatedAt": "2026-06-07T05:12:00Z",  // ISO-8601 UTC
    "source": "INCOIS",
    "ttlSeconds": 21600                       // 6h; drives "stale" styling
  },
  "coast":  { "id": "kochi", "name": "Kochi, Ernakulam",
              "harbour": { "lat": 9.97, "lng": 76.28 } },
  "date":   "2026-06-07",
  "boat":   { "id": "KER-992-04", "name": "Sea Queen II",
              "rangeKm": 50, "gear": ["purse_seine"], "maxDepthM": 80 },
  "weather":{ "state": "calm",                // enum: calm | rough | severe
              "windKts": 14, "windDir": "SW", "waveM": 1.2,
              "sstC": 28.4, "severeWarning": false },
  "zones": [
    {
      "id": "KL-712",
      "name": "Munambam Bank",                // human place-name (display, localized place names optional)
      "center": { "lat": 10.18, "lng": 76.16 },
      "distanceKm": 30, "bearing": "SW", "etaMins": 65,
      "depthM": [40, 80],
      "catch":      { "tier": "good", "score": 0.90 },   // tier enum: good | ok | low | nodata
      "confidence": { "level": "high", "score": 0.86,    // level enum: high | fair | low
                      "reasons": ["high_chlorophyll","thermal_front","recent_success"] },
      "signals":    { "sstC": 28.4, "chlorophyll": 0.42 },
      "species":    ["mackerel","tuna"],                 // enum keys
      "gear":       ["purse_seine","longline"],          // enum keys
      "dataStatus": "ok"                                 // enum: ok | low_data
    }
  ],
  "advisory": { "kind": "rag_summary", "text": "…" },    // optional LLM/RAG summary; nullable
  "accuracy": { "windowDays": 7, "correct": 6,
                "history": [true,true,true,false,true,true,true] }  // oldest→newest
}
```

### 7.4 Field rules
- `zones[]` MAY be empty → empty state (§10).
- A zone with `dataStatus: "low_data"` MAY omit `catch`, `confidence`, `signals`, `species`; it MUST include `reason` (enum key, e.g. `"cloud_cover"`). It is **not** clickable.
- `weather.severeWarning: true` → safety override regardless of zone content; `weather.state` SHOULD also be `"severe"`.
- `confidence.reasons` is an ordered list of enum keys; the UI shows a localized sentence for the top reason(s).
- All distances in **km**; depths in **metres**; shore distance for display may be shown in NM if provided, else derive — but MVP shows km for primary UI.

### 7.5 Errors
- Network failure / timeout → if a cached forecast exists, show it with offline labelling (§10.4); else show the error state (§10.3).
- `4xx/5xx` `problem+json` → map `title`/`detail` to a friendly localized message; never show raw codes to the fisherman; log `traceparent`.

### 7.6 Caching
- Query key: `["forecast", coastId, date, boatId]`.
- `staleTime`: derive from `meta.ttlSeconds`. Persist to IndexedDB. On reconnect, background-refetch.

## 8. Domain logic (pure functions — unit-test each)

All thresholds below are **product rules**, not magic numbers in components.

| Function | Rule |
|---|---|
| `isReachable(zone, boat)` | `zone.distanceKm <= boat.rangeKm`. |
| `gearFits(zone, boat)` | `zone.gear` intersects `boat.gear` (any match). |
| `rankScore(zone)` | Composite for ordering: primarily `catch.score`, tie-break `confidence.score`. (Backend `catch.score`/`confidence.score` are 0–1.) |
| `bestReachable(zones, boat)` | Highest `rankScore` among zones where `isReachable` **and** `dataStatus==="ok"`. This is the hero recommendation. |
| `strongestOverall(zones)` | Highest `rankScore` among all `dataStatus==="ok"` zones (ignoring range). |
| `strongerOutOfRange(zones, boat)` | `true` if `strongestOverall` is **not** reachable **and** its `rankScore` > `bestReachable`'s. Drives the "a stronger spot is past your range" note. |
| `catchHeadlineKey(tier)` | `good→"ch_good"`, `ok→"ch_ok"`, `low→"ch_low"`. |
| `confidenceLabelKey(level)` | `high→"s_high"`, `fair→"s_fair"`, `low→"s_low"`. |
| `confidenceDots(level)` | `high→3, fair→2, low→1` (of 3). |
| `isSafetyBlocked(weather)` | `weather.severeWarning === true \|\| weather.state === "severe"`. |
| `staleness(meta, now)` | `fresh` if `now - generatedAt < ttl`; `stale` if older; minutes/hours since for display. |
| `sortZones(zones, boat)` | reachable+ok first (by `rankScore` desc), then out-of-range, then `low_data` last. |

Edge resolution:
- **No reachable ok-zones** → hero shows "No good spots within your range today" (empty-but-safe state), still lists far/low-data zones below.
- **Severe weather** → `isSafetyBlocked` short-circuits the hero to the stop variant; zone interactions disabled.

## 9. Screen specification — *Today / Catch dashboard*

Reference implementation: `PFZDashboard_v4_catch.jsx`. This section is normative; the JSX is illustrative.

### 9.1 Layout
- **Tablet landscape (≥ 980px): two-pane.** Full-width stack of [nav bar] → [boat bar] → [coast/date selectors] → [hero] → two columns: **left** = course map + supporting weather; **right** = zones rail + trust strip. Max content width 1300px, centered.
- **Phone / < 980px:** single-column stack; nav labels collapse to icons; selectors stack; hero text scales down.
- A floating **"Ask" FAB** (bottom-right) opens the assistant drawer.

### 9.2 Top navigation bar
- Left: logo (ship icon + "PFZ Kerala").
- Center/left: nav — **Today** (active), **Zones**, **My trips**, **Settings** (icon + localized label; labels hidden < 980px). Only *Today* is functional in this PRD; others route to stubs.
- Right: **connectivity indicator** (Live / Offline with dot), **language globe** button → dropdown (en / தமிழ் / മലയാളം) with checkmark on active.

### 9.3 Boat bar (the personalization, made visible)
- Dark navy bar: ship icon, boat name (`boat.name`), meta "reaches ~{rangeKm} km · {gear}", and a **"Change boat"** action (routes to boat switch — stub).
- Always visible so the user understands recommendations are for *this* boat.

### 9.4 Coast & date selectors
- Two large tappable fields: **Your coast** (`coast.name`) and **Day** (`date`, default Today). Each opens a picker (coast list / date). ≥ 60px tall.

### 9.5 HERO — catch + confidence (the one answer)
Background color = catch tier (good=green, ok=teal, low=amber) or **severe=red** when safety-blocked.

**Default (not blocked):**
- Eyebrow: 🐟 "Your best catch today · {boat.name}".
- **H1 headline** = `catchHeadlineKey(bestReachable.catch.tier)`: "Strong catch likely" / "Some fish likely" / "Slim catch today".
- Subline: "{zone} best — {km} km {bearing}, about {eta}. {range-note}" where range-note = "In your boat's range." or, if `strongerOutOfRange`, "A stronger zone is past your boat's range today."
- **Supporting weather chip** (small, translucent): "Sea calm · safe to sail" (calm) / "Sea rough · stay close to shore" (rough). This is the ONLY weather presence in the hero.
- **Best-spot card** (right of headline): bearing arrow (rotated to `bearing`), "Catch here" label, zone name, localized species, distance·bearing, ETA.
- **Confidence block** (first-class, prominent, full-width under the row): label "HOW SURE", value = `confidenceLabelKey` + 3-dot meter (`confidenceDots`), and a **reason sentence** (localized, from `confidence.reasons` top reason) e.g. "Lots of fish food and a warm front where fish gather. Right here 5 of the last 7 days."
- **"Why these fish?"** button → expands a panel titled "Why the fish are here" with 3–4 plain points about **fish** (chlorophyll = fish food; warm front; depth suits your nets; recent catch history). Must NOT be about weather.
- If offline: a "Showing yesterday's saved advice. Connect to update." chip.

**Severe (blocked):**
- Red hero: eyebrow shows coast; H1 = "Stay in harbour"; subline = severe message; **no best-spot, no confidence, no why** (catch hidden); supporting weather chip hidden.

### 9.6 Course map (left pane)
- SVG, harbour-anchored: harbour pin at bottom-center (⚓ + coast name); concentric **distance rings** labelled in km; a **boat range ring** (dashed) at `boat.rangeKm` labelled "your boat reaches ~{n} km"; compass (N).
- Zone markers placed by bearing + distance (scaled). **Best zone** marker enlarged + bold bearing line from harbour with a "{km} km · {bearing}" label. Out-of-range zones rendered dimmed (~50% opacity). `low_data` zones omitted from the map.
- **Severe:** map covered by a "Stay in harbour — severe weather, do not sail" overlay.
- Color encodes tier but is **never the sole cue** (markers also carry the zone letter/label).

### 9.7 Supporting weather card (left pane, below map)
- Section header includes a "Supporting" tag and the freshness timestamp.
- Lead: plain summary ("Sea calm, light wind" / "Sea rough, strong wind") + a one-line "safe for most boats" / "small boats stay close."
- Row of supporting stats: Waves (m), Wind (kts + dir), Water temp (°C). These are secondary by design.

### 9.8 Zones rail (right pane) — "Fishing spots for your boat"
- Card list sorted by `sortZones`. Each ok-zone card:
  - Letter mark (tier color), zone **name** (lead), then small "{code} · {km} km {bearing}".
  - **Potential pill**: dot meter + localized tier word ("Good fishing / Some fish / Few fish").
  - Tag row: **"How sure: {level}"** (color by confidence), **"Suits your nets"** if `gearFits`, **"Too far for your boat"** if out of range.
  - Stat tiles: "Fish here" (localized species), "Water" (sst °C).
  - Chevron → opens **Zone detail drawer**. (Out-of-range zones still open; severe disables opening.)
- `low_data` card: dashed style, cloud icon, message "Clouds are blocking the sea reading. Advice will update soon." — **not clickable**.

### 9.9 Trust / accuracy strip (right pane)
- "How often we've been right" → "Right {correct} of {windowDays} days at {bestZone}", a 7-cell hit/miss bar (green/red from `accuracy.history`), and a line tying yesterday's result to today's confidence.

### 9.10 Zone detail drawer
Opens as a **right-edge drawer on tablet**, **bottom sheet on phone** (single component, media-query controlled).
- Header: zone letter mark + name + close.
- Top: potential pill, "How sure: {level}" tag, and "Too far for your boat" tag if applicable.
- Title: localized **species** ("what you'll catch"); subline: "{code} · {km} km {bearing} · {eta} · {coords (2-dp)}".
- **"Why the fish are here"** box: 3 plain points (chlorophyll value as "fish food", warm front at sst, depth match to nets/boat).
- Metrics grid: Water (°C, "+x° vs nearby"), Fish food (chlorophyll, "good level"), Wind (kts, marked "supporting"), From shore (NM + depth range).
- **"Best gear for your boat"**: cards — "Purse seine net" with a **"YOUR NET"** badge if it matches `boat.gear`; "Long line" as secondary. Descriptions reference the zone's species.
- Actions: **Go to this spot** (primary; hands off coords to device nav — stub) and **Save spot** (writes via outbox).
- Footer: **disclaimer** (localized): "This advice comes from satellite data. The real sea can be different. Always follow safety rules."

### 9.11 Assistant drawer (summonable)
- Opened by the FAB. Right drawer (tablet) / bottom sheet (phone).
- Greeting (localized). **Topic chips**: "Best catch today?", "Where are the tuna?", "Last week", "Out of my range?".
- **Restricted scope** — answers only: fishing conditions, weather/sea, trip history, fleet/boat. Out-of-scope queries get a **soft redirect** (not a hard refusal): "I can help with fishing, weather, your past trips and your boat. Try: …". Must **never fabricate a prediction**; it summarizes/points to the forecast.
- **Voice + text** input (Web Speech API; if unavailable, hide the mic and keep text).
- MVP: replies are mocked via a small intent classifier; real LLM/RAG wiring is a later milestone behind the same interface.

### 9.12 Language gate (first run)
- Full-screen chooser shown on first launch (no language chosen): three large options (English / தமிழ் / മലയാളം) with the "choose your language" prompt shown in all three. Selection persists. Reopenable via the globe.
- Footer caveat: Tamil/Malayalam strings (incl. fish names) are a draft pending native-speaker review.

## 10. States & edge cases (build ALL)

| State | Trigger | UI behavior |
|---|---|---|
| 10.1 Loading | Query pending, no cache | Skeletons for hero, map, zones; no spinners-only blank. |
| 10.2 Success | 200 with ok zones | Full screen per §9. |
| 10.3 Error (no cache) | Network/5xx, nothing cached | Friendly localized error card + "Try again"; never raw codes. |
| 10.4 Offline / cached | Offline or fetch failed but cache exists | Render cached data; offline chip in hero; "synced {Xh} ago"; freshness tags switch to amber. |
| 10.5 Stale | `now - generatedAt > ttl` | Timestamps amber; subtle "may be out of date" note; still usable. |
| 10.6 Low-data zone | `dataStatus==="low_data"` | Cloud card, not clickable, excluded from map & "best." |
| 10.7 Severe weather | `isSafetyBlocked` | Red hero "Stay in harbour"; catch hidden; map overlay; zone taps disabled; assistant still available. |
| 10.8 No reachable ok-zones | all ok-zones out of range | Hero: "No good spots within your range today"; lists far/low zones below with "too far" tags. |
| 10.9 No boat (A4 false) | payload lacks boat | Prompt: "Add your boat to get advice for it" → onboarding (stub). |
| 10.10 Empty zones | `zones: []` | Hero neutral "No fishing-zone data for this coast/day yet"; suggest another day. |
| 10.11 Language fallback | key missing in ta/ml | Fall back to `en` silently (correct i18n). |
| 10.12 Voice unavailable | Web Speech API absent | Hide mic; text input only. |
| 10.13 Out-of-scope chat | classifier no-match | Soft redirect message. |
| 10.14 Save while offline | tap Save offline | Queue in outbox; optimistic "saved"; sync on reconnect. |

## 11. Internationalization

- **Languages:** en (default), ta, ml. Locale JSON in `src/lib/i18n/locales`. Namespaced (e.g., `today`, `common`, `species`, `gear`, `confidence`).
- **Enum→string:** all backend enum keys (`species`, `confidence.reasons`, `catch.tier`, `dataStatus.reason`, `weather.state`) are localized client-side. **Fish names localized** (e.g., mackerel → അയല / அயிலை, sardine → മത്തി, tuna → ചൂര / சூரை, anchovy → നെത്തോലി / நெத்திலி).
- **Fonts:** apply Noto Sans Tamil / Malayalam when the active language is ta/ml (root class `lang-ta` / `lang-ml`); Bricolage/Hanken otherwise.
- **Numbers/units:** localize numerals where appropriate; keep km/°C/kts consistent.
- **Caveat:** ship a clearly-marked "needs native review" flag; do not treat current ta/ml drafts as final.
- RTL: not required for these languages.

## 12. Accessibility

- **Touch targets:** ≥ 48×48px; primary buttons ≥ 56px; rail rows generously tall (sea/wet-hand use).
- **Contrast:** WCAG 2.1 AA minimum on the light theme; verify the muted slate text passes on the paper background; future high-contrast mode.
- **Color never sole cue:** tiers/confidence always pair color with a word + icon/meter.
- **Keyboard/focus:** drawers trap focus and restore on close (Radix); visible focus rings.
- **Screen readers:** semantic landmarks; the SVG map has a text summary alternative ("Best spot Munambam Bank, 30 km southwest, good fishing, high confidence"); decorative SVG marked `aria-hidden`.
- **Motion:** respect `prefers-reduced-motion`; no essential info conveyed by animation only.

## 13. Visual design & tokens

Light, sunlight-legible theme (merge of PFZ KERALA polish + decision-first spine).

```css
/* Surfaces */
--bg:#eef3f6; --card:#ffffff; --soft:#f2f6f8; --soft2:#e9eff3;
/* Ink */
--ink:#0e2238; --ink2:#5b7180; --line:#e3e9ee; --line2:#d3dde3;
/* Brand */
--teal:#0e7c86; --navy:#0d2236;
/* Semantic — catch tiers */
--good:#2f9e5b; --good-bg:#d8f0e0;   /* good fishing */
--ok:#2a7da0;   --ok-bg:#d4ebf5;     /* some fish */
--low:#b9760a;  --low-bg:#f6e6cb;    /* few fish + "fair" confidence */
--nodata:#8a98a3; --nodata-bg:#e7ecef;
/* Semantic — safety */
--caution:#b9760a; --stop:#bb392c;   /* severe override */
```
- **Confidence colors:** high → `--good`, fair → `--low` (amber), low → `--nodata` (grey).
- **Hero gradients:** good (green), ok (teal), low (amber), severe (red).
- **Type:** display `Bricolage Grotesque` (700–800); body/UI `Hanken Grotesk` (400–800); Indic `Noto Sans Tamil/Malayalam`.
- **Radii:** cards 16–20px; pills 999px. **Shadows:** soft, low-elevation.
- Tokens live in `theme/tokens.css` as CSS variables and are referenced by Tailwind config so they're swappable.

## 14. Acceptance criteria (testable)

Build is "done" when all pass (Given/When/Then).

**Hero & catch**
- AC1. Given a forecast with ≥1 reachable ok-zone and calm weather, the hero H1 states the catch tier of the **best reachable** zone, and the best-spot card shows that zone's name, species, distance, bearing, ETA.
- AC2. Given the single strongest zone is out of the boat's range, the hero recommends the best **reachable** zone and shows the "a stronger zone is past your range" note. (Use fixture `forecast.calm.json`: KL-842 Deep Ridge, 78 km > 50 km range, is NOT recommended; KL-712 Munambam, 30 km, is.)
- AC3. The **confidence** block is always present (non-severe), showing the level word, a 3-dot meter matching the level, and a localized reason sentence.
- AC4. "Why these fish?" expands points about fish/food/front/depth/history — **no weather** content.

**Safety**
- AC5. Given `severeWarning: true`, the hero turns red, shows "Stay in harbour", hides the best-spot/confidence/why, the map shows the do-not-sail overlay, and zone cards cannot be opened. (Fixture `forecast.severe.json`.)

**Boat personalization**
- AC6. Out-of-range zones are dimmed and tagged "Too far for your boat"; gear-matching zones tagged "Suits your nets". Changing the boat (or fixture range) re-ranks without a network call.

**Weather demotion**
- AC7. In non-severe states, weather appears only as the hero supporting chip and the "Supporting"-tagged card — never as the H1.

**Zones & detail**
- AC8. Tapping an ok-zone opens the detail drawer (right on ≥980px, bottom sheet below) with species, "why the fish are here", metrics, gear (with "YOUR NET" badge when matched), Navigate/Save, and the disclaimer.
- AC9. A `low_data` zone shows the cloud card and is not clickable. (Fixture: KL-441 Chellanam Shelf.)

**Offline / stale**
- AC10. With a cached forecast and the app offline, the screen renders cached data, shows the offline chip and "synced Xh ago", and does not show an error.
- AC11. When `now - generatedAt > ttlSeconds`, freshness indicators turn amber.

**i18n**
- AC12. Switching to Tamil/Malayalam localizes the hero, tiers, confidence words, fish names, section titles, and disclaimer; missing keys fall back to English; the correct Noto font renders.
- AC13. First launch shows the language gate; selection persists across reloads.

**Accessibility**
- AC14. All interactive targets ≥ 48px (primary ≥ 56px); drawers trap and restore focus; tier/confidence are distinguishable without color; the map exposes a text alternative.

**Assistant**
- AC15. In-scope questions return a forecast-grounded answer; an out-of-scope question (e.g., "cricket score") returns the soft redirect; no fabricated prediction.

**Architecture**
- AC16. No React component imports the API client directly; all server data flows through TanStack Query hooks; all ranking/confidence/safety rules live in `src/domain` with passing unit tests.

## 15. Milestones / build order

1. **M0 Scaffold:** Vite+TS+React, Tailwind+tokens, router, providers, ESLint/Prettier, pnpm, PWA plugin, MSW.
2. **M1 Domain + contract:** types from §7, Zod schemas, domain functions (§8) + unit tests, MSW handlers + fixtures (§16).
3. **M2 Today screen happy path:** nav, boat bar, selectors, hero, course map, zones rail, weather, trust — wired to mocks.
4. **M3 States:** loading, error, offline/cached, stale, low-data, severe, no-reachable, no-boat (§10).
5. **M4 Detail drawer + Assistant + Language gate.**
6. **M5 i18n full pass (en/ta/ml) + a11y pass.**
7. **M6 Tests:** component (RTL) + E2E (Playwright) covering §14; perf/offline verification.
8. **M7 (later):** MapLibre real tiles; live API swap; real LLM/RAG assistant.

## 16. Appendix A — MSW fixtures (build these)

Provide one fixture per state; the handler selects by query param or a dev toggle.

- `forecast.calm.json` — weather calm; zones: **KL-712 Munambam Bank** (good/high, 30 km SW, gear purse_seine+longline, species mackerel+tuna), **KL-842 Deep Ridge** (good/high, **78 km W — out of range**, tuna), **KL-901 Vypin Nearshore** (ok/fair, 12 km SSW, sardine), **KL-455 Fort Kochi Outer** (low/low, 22 km S, sardine), **KL-441 Chellanam Shelf** (`low_data`, reason `cloud_cover`). boat range 50 km, gear purse_seine. accuracy 6/7.
- `forecast.rough.json` — same zones, `weather.state:"rough"`, `severeWarning:false`.
- `forecast.severe.json` — `weather.state:"severe"`, `severeWarning:true`.
- `forecast.empty.json` — `zones:[]`.
- `forecast.outofrange.json` — all ok-zones `distanceKm > 50`.
- `forecast.error` — handler returns `503 problem+json`.
- `forecast.stale.json` — `meta.generatedAt` 10h ago, `ttlSeconds:21600`.

## 17. Appendix B — Known source-document errors (corrected here)

Surfaced so the team can fix the originals; this PRD already uses the corrected forms:
1. HLD/LLD version date "16-02-**20216**" → intended 2026.
2. HLD NFR list skips **NFR.AVAL.004**; categories misspelled (SCALAILITY, AVAILAILITY, EXTENSIILITY).
3. **AWS vs Azure** conflict: HLD tech-stack says AWS; deployment section lists Azure (App Service, AKS, Key Vault, Azure DevOps). Frontend is host-agnostic, but resolve before CI/CD.
4. "**StartLink**" → Starlink (threat model TRD-03).
5. "Network Connectivity" listed simultaneously as a dependency, a constraint, **and** out of scope — reconcile.

## 18. Appendix C — Enum reference

| Field | Values |
|---|---|
| `weather.state` | `calm`, `rough`, `severe` |
| `catch.tier` | `good`, `ok`, `low`, `nodata` |
| `confidence.level` | `high`, `fair`, `low` |
| `confidence.reasons` | `high_chlorophyll`, `thermal_front`, `recent_success`, `mixed_signal`, `weak_signal` (extend as needed) |
| `dataStatus` | `ok`, `low_data` |
| `dataStatus.reason` | `cloud_cover`, `sensor_gap` |
| `species` | `mackerel`, `tuna`, `sardine`, `anchovy` (extend) |
| `gear` | `purse_seine`, `longline`, `gillnet`, `trawl` (extend) |
| `bearing` | `N,NE,E,SE,S,SW,W,NW` + intermediates (`SSW` etc.) |

---
*End of PRD v1.0. Open items: confirm §3 assumptions A1–A5.*

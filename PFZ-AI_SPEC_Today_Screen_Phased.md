# PFZ-AI — Phased Spec: Today / Catch Dashboard
**Version:** 1.0 | **Source:** PFZ-AI_PRD_Today_Screen.md v1.0 | **Date:** 2026-06-07

> This document re-organises the PRD into build phases. Each phase has a clear goal, explicit non-goals (things deferred), and testable acceptance criteria. The PRD remains the source of truth for data contracts, domain rules, and visual spec; this document is the *build plan*.

---

## Confirmed assumptions before any work begins

Resolve these before Phase 0 starts (§3 of PRD):

| # | Assumption | Decision needed |
|---|---|---|
| A1 | Plain Vite + React PWA (not Next.js) | Confirm |
| A2 | Backend not live → build against MSW mocks | Confirm |
| A3 | SVG course-map for MVP, not real tiles | Confirm |
| A4 | User is authenticated; boat is onboarded before this screen | Confirm |
| A5 | Launch languages: en, ta, ml | Confirm |

---

## Product goals (apply to all phases)

| ID | Goal |
|----|------|
| G1 | Communicate best reachable catch in under 3 seconds of glancing |
| G2 | Always express confidence alongside catch quality with a plain-language reason |
| G3 | Personalise every recommendation to the boat (range, gear, depth) |
| G4 | Remain usable offline / on intermittent satellite; label stale data clearly |
| G5 | Support English, Tamil, and Malayalam fully — decision-critical content, not just chrome |
| G6 | Gate on safety: severe weather overrides the catch view |
| G7 | Be legible on a console-mounted tablet in sunlight; touch targets ≥ 48 px |

## Product non-goals (all phases)

- Onboarding / boat-registration screen (separate PRD)
- Authentication / login (handled upstream)
- Zones list, Trips/history, Settings screens (stub routes only)
- Operator Command Centre (separate app, future)
- Species-by-species population modelling, chartplotter integration, non-Indian coasts, network provisioning
- Backend / model implementation (this spec is frontend only; consumes JSON)

---

## Phase 0 — Scaffold

**Delivers:** A runnable skeleton — nothing visible to a fisherman yet.

### Phase goal
Establish the project structure, toolchain, and all providers so every subsequent phase can build on a stable foundation with no big-bang rewrites.

### Phase non-goals
- No screen content; shell only
- No data fetching, no MSW handlers yet
- No i18n content (config only)
- No domain logic

### Deliverables
- `pnpm` workspace, Vite + TypeScript (strict) + React 18
- Tailwind CSS + `theme/tokens.css` with all design tokens from §13
- React Router v6: routes for `/today`, `/zones`, `/trips`, `/settings` (stub views)
- Providers wired at app root: `QueryClientProvider`, `i18next`, connectivity store (Zustand), `<SafetyGate>`
- `vite-plugin-pwa` configured (service worker, runtime caching stubs)
- ESLint + Prettier, pre-commit hook
- MSW installed and ready (no handlers yet)
- `src/` folder tree matching §6.2 exactly

### Acceptance criteria
- AC-P0-1. `pnpm dev` starts with no errors; `/today` renders "Today stub", other routes render their stub labels.
- AC-P0-2. TypeScript strict mode reports zero errors on `pnpm tsc --noEmit`.
- AC-P0-3. `theme/tokens.css` exports all CSS variables from §13; Tailwind config references them.
- AC-P0-4. `<SafetyGate>` exists at app root; it passes children through unconditionally (real logic in Phase 3).
- AC-P0-5. ESLint and Prettier pass with `pnpm lint`.
- AC-P0-6. Fonts load: Bricolage Grotesque, Hanken Grotesk, Noto Sans Tamil, Noto Sans Malayalam.

---

## Phase 1 — Domain + Contract

**Delivers:** Typed data layer and all business rules, fully tested, with no UI.

### Phase goal
Make the data contract and all ranking / safety / confidence logic the undisputed source of truth — in pure TypeScript that any future surface (Command Centre, tests, server-side) can reuse without touching React.

### Phase non-goals
- No visible UI components yet
- No network calls (MSW handlers exist but are for the next phase)
- No i18n string resolution (enum keys are returned as-is)

### Deliverables
- OpenAPI types generated into `src/lib/api/generated`
- Zod schemas for the full `§7.3` response (and for `problem+json` errors)
- TanStack Query hook `useForecast(coastId, date, boatId)` — fetches, parses, caches, persists to IndexedDB
- MSW handlers + all 7 fixtures from §16:
  - `forecast.calm.json`, `forecast.rough.json`, `forecast.severe.json`
  - `forecast.empty.json`, `forecast.outofrange.json`, `forecast.stale.json`
  - Handler for `forecast.error` returning `503 problem+json`
- All domain functions from §8 with unit tests:

| Function | Key rule |
|---|---|
| `isReachable(zone, boat)` | `distanceKm <= rangeKm` |
| `gearFits(zone, boat)` | `zone.gear ∩ boat.gear ≠ ∅` |
| `rankScore(zone)` | `catch.score` primary, `confidence.score` tie-break |
| `bestReachable(zones, boat)` | highest `rankScore` where `isReachable && dataStatus==="ok"` |
| `strongestOverall(zones)` | highest `rankScore` ignoring range |
| `strongerOutOfRange(zones, boat)` | `strongestOverall` unreachable AND `rankScore` > `bestReachable` |
| `catchHeadlineKey(tier)` | `good→"ch_good"`, `ok→"ch_ok"`, `low→"ch_low"` |
| `confidenceLabelKey(level)` | `high→"s_high"`, `fair→"s_fair"`, `low→"s_low"` |
| `confidenceDots(level)` | `high→3, fair→2, low→1` |
| `isSafetyBlocked(weather)` | `severeWarning===true \|\| state==="severe"` |
| `staleness(meta, now)` | `fresh` if `now-generatedAt < ttl`, else `stale` |
| `sortZones(zones, boat)` | reachable+ok desc, then out-of-range, then `low_data` last |

### Acceptance criteria
- AC-P1-1. `pnpm test` passes all domain unit tests; coverage includes every edge in §8 (no reachable zones, tie-break, severe override).
- AC-P1-2. `bestReachable` with `forecast.calm.json` returns KL-712 Munambam Bank (not KL-842 at 78 km).
- AC-P1-3. `isSafetyBlocked` returns `true` for `forecast.severe.json` and `false` for `forecast.calm.json`.
- AC-P1-4. Zod parse of a response missing `catch`/`confidence` on a `low_data` zone succeeds (optional fields); parse of a malformed response throws.
- AC-P1-5. `useForecast` hook (tested with RTL + MSW) returns cached data when offline and no new fetch succeeds.
- AC-P1-6. Errors from the `forecast.error` handler surface as a typed `ProblemDetail` object, not raw strings.
- AC-P1-7. No component file imports from `src/lib/api` directly (enforced by ESLint rule or test).

---

## Phase 2 — Today Screen Happy Path

**Delivers:** The full Today screen in the `calm` state — what a fisherman sees on a normal day.

### Phase goal
Build every visual section of the Today screen wired to the `forecast.calm.json` mock. A fisherman can look at this build and understand where to go and how confident the system is.

### Phase non-goals
- Edge/error states (Phase 3)
- Zone detail drawer (Phase 4)
- Assistant drawer and language gate (Phase 4)
- i18n — English strings only, keys in place but no ta/ml content yet
- Severe-weather override (Phase 3)

### Deliverables
- **Nav bar** — logo, Today/Zones/Trips/Settings nav (Today active, others stub), connectivity indicator, language globe (button present, no i18n switch yet)
- **Boat bar** — ship icon, `boat.name`, range + gear summary, "Change boat" stub
- **Coast & date selectors** — display-only fields (≥ 60 px tap targets), pickers are stubs
- **Hero** — full default (non-severe) state:
  - Eyebrow, H1 (`catchHeadlineKey`), subline with zone name/km/bearing/ETA
  - `strongerOutOfRange` note when applicable
  - Supporting weather chip
  - Best-spot card (bearing arrow rotated, species, distance, ETA)
  - Confidence block (level word + 3-dot meter + reason sentence)
  - "Why these fish?" expandable panel (fish-only content, no weather)
- **Course map** (SVG):
  - Harbour pin at bottom-centre, distance rings, dashed boat-range ring
  - Zone markers positioned by bearing + distance; best zone enlarged with bearing line
  - Out-of-range zones at 50% opacity
  - `low_data` zones omitted
- **Supporting weather card** — plain weather summary, wave/wind/SST stat tiles, "Supporting" tag + freshness timestamp
- **Zones rail** — sorted per `sortZones`; each ok-zone card with potential pill, confidence tag, gear tag, stat tiles, chevron
- **Trust strip** — 7-cell hit/miss bar, accuracy sentence

### Acceptance criteria
These mirror the PRD §14 ACs for the happy path:

- AC-P2-1. **(= AC1)** Hero H1 states the catch tier of the best reachable zone; best-spot card shows that zone's name, species, distance, bearing, and ETA.
- AC-P2-2. **(= AC2)** With `forecast.calm.json`: KL-842 Deep Ridge (78 km, out of range) is NOT the hero recommendation; KL-712 Munambam (30 km) is; "a stronger zone is past your range" note is visible.
- AC-P2-3. **(= AC3)** Confidence block is present showing level word, correct dot count (3/2/1), and a localized reason sentence.
- AC-P2-4. **(= AC4)** "Why these fish?" panel contains fish/food/front/depth/history content; no weather terms.
- AC-P2-5. **(= AC6)** Out-of-range zones tagged "Too far for your boat"; gear-matching zones tagged "Suits your nets".
- AC-P2-6. **(= AC7)** Weather content appears only in the hero supporting chip and the "Supporting" weather card; it is not the H1.
- AC-P2-7. All touch targets measure ≥ 48 px; primary hero action ≥ 56 px (verify with browser DevTools or RTL).
- AC-P2-8. Tablet layout (≥ 980 px): two-pane with map+weather left, zones+trust right. Phone (< 980 px): single column.
- AC-P2-9. `low_data` zone (KL-441 Chellanam Shelf) shows the cloud card and is not clickable.

---

## Phase 3 — States & Edge Cases

**Delivers:** All 14 states from §10; the screen is production-safe under real network conditions.

### Phase goal
Every failure mode, offline state, and edge case is handled gracefully — a fisherman never sees a blank screen, raw error codes, or misleading data.

### Phase non-goals
- Zone detail drawer (Phase 4)
- Full i18n of the new state strings (Phase 5)
- E2E automated tests for states (Phase 6)

### Deliverables
Implement each state using the corresponding MSW fixture or simulation:

| State | Trigger | Required behaviour |
|---|---|---|
| 10.1 Loading | Pending query, no cache | Skeletons for hero, map, zones — no spinner-only blank |
| 10.3 Error (no cache) | Network/5xx, nothing cached | Friendly localized error card + "Try again"; no raw codes |
| 10.4 Offline / cached | Offline + cache exists | Cached data rendered; offline chip in hero; "synced Xh ago"; freshness tags amber |
| 10.5 Stale | `now - generatedAt > ttl` | Timestamps turn amber; "may be out of date" note; still usable |
| 10.6 Low-data zone | `dataStatus==="low_data"` | Cloud card, not clickable, not on map, not "best" |
| 10.7 Severe weather | `isSafetyBlocked` | Red hero "Stay in harbour"; catch hidden; map do-not-sail overlay; zone taps disabled; assistant still available |
| 10.8 No reachable ok-zones | All ok-zones out of range | Hero: "No good spots within your range today"; far/low-data zones still listed with "too far" tags |
| 10.9 No boat | Payload lacks boat | Prompt to add boat → onboarding stub |
| 10.10 Empty zones | `zones: []` | Hero neutral "No fishing-zone data for this coast/day yet"; suggest another day |
| 10.14 Save while offline | Tap Save offline | Queue in outbox; optimistic "saved"; sync on reconnect |

Also wire `<SafetyGate>` fully: reads `weather.severeWarning`; switches child screens to severe variant.

### Acceptance criteria
- AC-P3-1. **(= AC5)** With `forecast.severe.json`: hero is red, shows "Stay in harbour", hides best-spot / confidence / why; map shows do-not-sail overlay; zone cards cannot be opened.
- AC-P3-2. **(= AC10)** With app offline and a cached forecast: screen renders cached data, shows offline chip and "synced Xh ago", and does not show an error.
- AC-P3-3. **(= AC11)** With `forecast.stale.json` (`generatedAt` 10h ago, `ttlSeconds` 21600): freshness indicators are amber.
- AC-P3-4. With `forecast.outofrange.json`: hero shows "No good spots within your range today"; all zone cards still render with "Too far for your boat" tags.
- AC-P3-5. Loading state shows skeleton shapes for hero, map, and zones — the screen is never blank.
- AC-P3-6. `forecast.error` (503) with no cache shows a friendly error card with a retry button; no status code or stack trace is visible.
- AC-P3-7. "Save spot" while offline writes to the outbox and shows optimistic confirmation; on reconnect the outbox syncs.
- AC-P3-8. `forecast.severe.json`: assistant FAB and drawer remain accessible.

---

## Phase 4 — Zone Detail Drawer + Assistant + Language Gate

**Delivers:** All interactive overlays — the zone drawer, the AI assistant, and the first-run language chooser.

### Phase goal
A fisherman can tap any zone to get full detail, ask the assistant a question, and set their language on first run.

### Phase non-goals
- Real LLM/RAG wiring for the assistant (intent classifier / mocked replies only)
- Full ta/ml translation pass (Phase 5)
- Real voice recognition beyond the Web Speech API hook

### Deliverables

**Zone detail drawer / bottom sheet:**
- Right drawer on ≥ 980 px; bottom sheet on < 980 px (single component)
- Header: zone letter mark, name, close button
- Potential pill, confidence tag, "Too far" tag if applicable
- Species title, zone code/km/bearing/ETA/coords
- "Why the fish are here" box (3 plain points)
- Metrics grid: water °C, fish food, wind, from shore + depth range
- Gear section: all zone gears listed; boat-matching gear gets "YOUR NET" badge
- Actions: "Go to this spot" (coords stub), "Save spot" (outbox)
- Disclaimer (localized placeholder in en)
- Disabled / non-openable in severe state

**Assistant drawer:**
- FAB (bottom-right) opens right drawer / bottom sheet
- Greeting + 4 topic chips ("Best catch today?", "Where are the tuna?", "Last week", "Out of my range?")
- Mocked intent classifier: in-scope → forecast-grounded reply; out-of-scope → soft redirect message; never a fabricated prediction
- Voice input via Web Speech API; if unavailable, hide mic and keep text only
- Scope restriction enforced (no cricket scores etc.)

**Language gate:**
- Full-screen chooser on first launch (language not yet set)
- Three large options in their own script: English / தமிழ் / മലயாளம்
- "Choose your language" prompt shown in all three scripts
- Selection persists (localStorage / i18n config)
- Reopenable via the globe button in the nav bar

### Acceptance criteria
- AC-P4-1. **(= AC8)** Tapping an ok-zone opens the detail drawer showing species, "why the fish are here", metrics, gear with "YOUR NET" badge when matched, Navigate/Save actions, and disclaimer.
- AC-P4-2. **(= AC9)** A `low_data` zone is not tappable; tapping it does nothing.
- AC-P4-3. Detail drawer is a right drawer on ≥ 980 px and a bottom sheet on < 980 px; both use the same component.
- AC-P4-4. **(= AC15)** An in-scope question (e.g., "Where are the tuna?") returns a forecast-grounded answer; "cricket score" returns the soft redirect; no response claims a prediction the system cannot make.
- AC-P4-5. With Web Speech API available: mic button is present and starts STT; with it absent: mic button is hidden.
- AC-P4-6. **(= AC13)** First launch shows the language gate; the chosen language persists across page reloads.
- AC-P4-7. In severe state, tapping a zone card does not open the drawer.
- AC-P4-8. **(= AC14, drawers portion)** Drawers trap focus on open and restore it on close; focus ring is visible.

---

## Phase 5 — i18n Full Pass + Accessibility Pass

**Delivers:** A screen that works in Tamil and Malayalam, and meets WCAG 2.1 AA.

### Phase goal
Every decision-critical string — catch verdict, confidence, species names, disclaimer — is correctly localised in all three languages. The screen is operable and legible for users who don't read English.

### Phase non-goals
- Native-speaker sign-off on ta/ml translations (flagged in the UI; this PRD ships with a draft caveat)
- RTL layout (not required for ta/ml)
- High-contrast mode (future toggle)

### Deliverables

**i18n:**
- Locale JSON complete for namespaces: `today`, `common`, `species`, `gear`, `confidence` in en, ta, ml
- All backend enum keys (`catch.tier`, `confidence.level`, `confidence.reasons`, `weather.state`, `dataStatus.reason`, `species`, `gear`) resolved to locale strings client-side
- Fish names localized: mackerel → അയല / அயிலை; sardine → മത്തി / மத்தி; tuna → ചൂര / சூரை; anchovy → നെത്തോലി / நெத்திலி
- `lang-ta` / `lang-ml` root class triggers Noto Sans font
- Missing keys fall back to `en` silently
- "Needs native review" notice rendered on ta/ml screens (easily removable)

**Accessibility:**
- All interactive touch targets verified ≥ 48 × 48 px; primary buttons ≥ 56 px
- WCAG 2.1 AA contrast verified for muted slate text on paper background and all tier colours
- Color is never the sole cue: tiers and confidence levels always pair colour with a word + icon/dot meter
- SVG map has a text alternative: "Best spot [name], [n] km [bearing], [tier] fishing, [level] confidence" (`aria-label`); decorative SVG elements are `aria-hidden`
- `prefers-reduced-motion` respected: no essential information conveyed only through animation
- Semantic landmarks (`<nav>`, `<main>`, `<section>` with labels) throughout

### Acceptance criteria
- AC-P5-1. **(= AC12)** Switching to Tamil/Malayalam localises the hero, tiers, confidence words, fish names, section titles, and disclaimer; missing keys fall back to English; the correct Noto font renders.
- AC-P5-2. Language switching is complete without a page reload; all dynamic content (zone cards, drawer) updates immediately.
- AC-P5-3. Axe or equivalent a11y audit reports zero critical/serious violations on the Today screen (happy path + severe state).
- AC-P5-4. All interactive elements pass a manual contrast check (or automated `contrast.ts` utility) against §13 tokens.
- AC-P5-5. SVG map `aria-label` accurately reflects the best zone for assistive technology.
- AC-P5-6. Keyboard-only navigation reaches every interactive element on the screen and in both drawers.

---

## Phase 6 — Test Suite

**Delivers:** Automated confidence that all ACs are regression-proof.

### Phase goal
Any future change to domain logic, a UI component, or a locale file that breaks an acceptance criterion is caught before merge.

### Phase non-goals
- 100% line coverage is not the goal; AC coverage is
- Performance profiling beyond basic Lighthouse (stretch)
- Visual regression testing (stretch)

### Deliverables
- **Vitest unit tests** — already required in Phase 1; this phase fills gaps and ensures ≥ 90% coverage of `src/domain`
- **React Testing Library component tests** covering:
  - Hero in all states (calm, rough, severe, no-zones, out-of-range, offline, stale, loading, error)
  - Zones rail (ok, out-of-range, low-data)
  - Zone detail drawer (matched gear, unmatched gear, severe-disabled)
  - Trust strip (various accuracy histories)
  - Language gate (persist, reopen)
  - Assistant (in-scope, out-of-scope, voice-unavailable)
- **Playwright E2E tests** covering each AC in §14 by navigating the MSW-backed app:
  - Happy path catch verdict + zones (AC1, AC2, AC3, AC4)
  - Severe override (AC5)
  - Personalization (AC6, AC7)
  - Drawer open/close (AC8, AC9)
  - Offline / stale (AC10, AC11)
  - i18n switching (AC12, AC13)
  - A11y touch targets (AC14)
  - Assistant scope (AC15)
  - Architecture enforcement (AC16 — ESLint rule that no component imports `src/lib/api` directly)

### Acceptance criteria
- AC-P6-1. `pnpm test` (Vitest + RTL) passes with zero failures; all §14 ACs have at least one backing test.
- AC-P6-2. `pnpm test:e2e` (Playwright) passes AC1–AC16 in headless mode against MSW fixtures.
- AC-P6-3. `src/domain` unit test coverage ≥ 90% (branches).
- AC-P6-4. AC16 ESLint rule: CI fails if any component file imports from `src/lib/api` directly.
- AC-P6-5. All tests are deterministic (no timing-sensitive sleeps; MSW resets between tests).

---

## Phase 7 — Real infrastructure (later milestone, out of scope for this PRD)

Tracked here for completeness; no acceptance criteria yet.

- Swap MSW mocks for the live backend API (no UI change required — the data layer is already typed)
- MapLibre GL JS + offline vector tiles replacing the SVG course map
- Real LLM/RAG wiring for the assistant (same drawer interface)
- Resolve the AWS vs Azure cloud platform conflict (§17 item 3) before CI/CD

---

## Cross-cutting constraints (all phases)

| Constraint | Rule |
|---|---|
| Architecture | Components never import the API client directly; all data flows through TanStack Query hooks; all ranking/confidence/safety logic lives in `src/domain` |
| Data contract | Backend sends enum keys; frontend localizes. Frontend computes boat-relative ranking and reachability offline |
| Error handling | `problem+json` errors map to friendly localized messages; `traceparent` logged; raw codes never shown to a fisherman |
| Offline | Cached forecast survives reload; background refetch on reconnect; offline is normal, not an error state |
| Safety | `<SafetyGate>` at app root is the single point of severe-weather override; not re-implemented per component |
| PRD precedence | Where this spec and the HLD/LLD disagree, this spec wins (see PRD §17 for known source-doc errors) |

---

*Phases 0–6 cover the complete fisherman MVP. Confirm A1–A5 (§3 of PRD) before Phase 0 begins.*

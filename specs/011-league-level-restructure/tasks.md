# Tasks: Ліги, гейміфіковані назви рівнів та адаптивний UX карток меню

**Input**: Design documents from `/specs/011-league-level-restructure/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/interfaces.md, quickstart.md

**Tests**: Не передбачено специфікацією. Тестування — ручне за сценаріями з quickstart.md.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)

---

## Phase 1: Setup

**Purpose**: Резервна фаза — проект вже ініціалізовано, структура файлів існує.

- [x] T001 [P] Read and confirm existing file structure: index.html, css/style.css, js/engine.js, js/main.js, js/keyboard.js, js/assets.js

**Checkpoint**: Project structure confirmed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Нова конфігурація LEVELS_CONFIG та оновлений SaveManager — основа, на якій будуються всі історії.

**⚠️ CRITICAL**: Жодна user story не може бути реалізована без цього фундаменту.

- [x] T002 Replace `LEVELS` array with `LEVELS_CONFIG` + `ALL_LEVELS` flat lookup in js/engine.js: define 5 leagues with all 31 levels per spec (league 1: 16 levels, league 2: 8, league 3: 4, league 4: 2, league 5: 1), each level with fields `id` (1–31), `leagueId`, `name`, `letters`, `speed`, `spikeCount`, `seed`, `bgTheme`, `accentColor`, `rhythmGroups`
- [x] T003 Update SaveManager in js/engine.js: sanitizeSaveData() to support up to 31 levels; recordResult() to unlock next level within same league, then next league on league completion, then Boss (31) after Master
- [x] T004 [P] Export `LEVELS_CONFIG`, `ALL_LEVELS`, and `save` (existing) from js/engine.js; ensure all public contracts match contracts/interfaces.md

**Checkpoint**: Foundation ready — LEVELS_CONFIG with 31 levels, SaveManager supports 1–31 IDs, ALL_LEVELS flat array available.

---

## Phase 3: User Story 1 — Перегляд ліг та вибір рівня (Priority: P1)

**Goal**: Гравець бачить 5 вкладок ліг, перемикається між ними, бачить сітку карток рівнів із заголовками «L-N: Назва».

**Independent Test**: Відкрити вибір рівня → 5 вкладок, «Базовий» активний за замовчуванням, 16 карток. Перемкнути на «Середній» → 8 карток. Кожна картка показує «L-N: Назва».

### Implementation for User Story 1

- [x] T005 [US1] Add `<div id="leagueTabs" class="league-tabs"></div>` inside `#levelSelect` in index.html (above `#levelGrid`)
- [x] T006 [P] [US1] Add CSS for `.league-tabs`, `.league-tab`, `.league-tab.active`, `.level-title` in css/style.css: horizontal flex row, active tab with neon cyan glow (`#00f6ff`), inactive dim gray (`#555`), title large/bold/centered
- [x] T007 [US1] Rewrite `buildLevelCards()` in js/main.js: generate league tabs from `LEVELS_CONFIG`, render level grid for active league, each card shows `.level-title` with format `"L-N: Назва"` (e.g. "1-1: Перші кроки"), cards use `level.id` for onclick `startLevel(id)`, locked cards get `.locked` CSS class
- [x] T008 [US1] Update all references from `LEVELS` array to `ALL_LEVELS` in js/main.js: `startLevel()`, demo engine initialization, `handleVictory()`, `handleGameOver()`, `buildLevelCards()` — use `ALL_LEVELS.find(l => l.id === id)` pattern
- [x] T009 [US1] Fix `getLastPlayable()` usage in js/main.js: ensure demo engine uses the correct level from `ALL_LEVELS`

**Checkpoint**: US1 complete — tabs work, cards show titles, level selection functional.

---

## Phase 4: User Story 2 — Прогресивне відкриття рівнів (Priority: P1)

**Goal**: Лише перший рівень кожної ліги доступний спочатку. Після 100% проходження — наступний розблоковується. Прогрес зберігається в localStorage між сесіями.

**Independent Test**: Очистити localStorage → лише 1-1 доступний. Пройти 1-1 → 1-2 доступний. Оновити сторінку → 1-2 все ще доступний.

### Implementation for User Story 2

- [x] T010 [US2] Update `recordResult()` in js/engine.js: on pct===100, find current level in `ALL_LEVELS`, check if last in league → unlock first level of next league (if league < 5), else unlock level+1; for league 4 (Master) → unlock 31 (Boss)
- [x] T011 [US2] Update `sanitizeSaveData()` in js/engine.js: ensure `progress.levels` object has entries for all 31 levels (`"1"` through `"31"`), add missing entries with `{bestPct: 0, highScore: 0}`, clamp `unlocked` to 1..31 range
- [x] T012 [US2] Add safety fallback in js/engine.js: if localStorage unavailable during `persist()`, silently continue without crash (existing try/catch pattern, verify coverage for level 31)
- [x] T013 [US2] Update `buildLevelCards()` in js/main.js: cards for `level.id > save.getProgress().unlocked` render as `.locked` (gray, pointer-events: none, lock icon), only the first level per league is unlocked by default (via `unlocked` = 1)
- [x] T014 [US2] Update `handleVictory()` in js/main.js: if `pct === 100` and there is a next level in same league, show "НАСТУПНИЙ РІВЕНЬ" button; "ДО МЕНЮ" always available; refresh level grid on return to LEVEL_SELECT state

**Checkpoint**: US2 complete — progressive unlock works, progress persists across sessions.

---

## Phase 5: User Story 3 — Інформативний HUD під час гри (Priority: P2)

**Goal**: Під час гри HUD показує «Ліга: [Назва ліги] | [Номер]: [Назва рівня]» замість старого «Рівень X».

**Independent Test**: Запустити 1-1 → HUD показує «Ліга: Базова | 1-1: Перші кроки». Запустити 5-1 → HUD показує «Ліга: Бос | 5-1: ФІНАЛЬНИЙ ДЕМОН».

### Implementation for User Story 3

- [x] T015 [US3] Add `leagueInfo` parameter to `Engine` constructor in js/engine.js: optional object `{leagueName, levelNumber, levelName}`; fall back to old format if absent (for demo engine compatibility)
- [x] T016 [US3] Update `renderProgressBar()` in js/engine.js: when `leagueInfo` present, render text `"Ліга: {leagueName} | {levelNumber}: {levelName}"` at top of Canvas (font `"bold 14px "Segoe UI", sans-serif"`, color `#00f6ff`), followed by progress bar and score line; when absent (demo), keep existing "Очки: N | N%" behavior
- [x] T017 [US3] Update `startLevel()` in js/main.js: when creating Engine instance, pass `leagueInfo` derived from `ALL_LEVELS.find(l => l.id === id)` — compute `leagueName` from `LEVELS_CONFIG`, `levelNumber` as `"L-N"`, `levelName` from level.name

**Checkpoint**: US3 complete — HUD shows full league + level info during gameplay.

---

## Phase 6: User Story 4 — Попередній перегляд активних літер на картці (Priority: P3)

**Goal**: Кожна картка рівня показує список активних літер зменшеним шрифтом у нижній частині.

**Independent Test**: Картка 1-1 → прев'ю «а о в л». Картка 2-2 → «й ц у к е н г ш щ з х ї». Картка 5-1 → «Усі 33 літери».

### Implementation for User Story 4

- [x] T018 [P] [US4] Add CSS for `.level-letters-preview` in css/style.css: `font-size: 0.8rem`, `color: rgba(255,255,255,0.35)`, `margin-top: auto`, `text-align: center`, `word-break: break-word`, `max-height: 2.4em`, `overflow: hidden`
- [x] T019 [US4] Update `buildLevelCards()` in js/main.js: add `<div class="level-letters-preview">` element inside each level card containing `level.letters.join(" ")`; for Boss level (31 letters): display `"Усі 33 літери"` as shortened indicator

**Checkpoint**: US4 complete — all level cards show letters preview.

---

## Phase 7: Polish & Procedural Backgrounds

**Purpose**: Реалізація всіх 31 процедурного фону та фінальна валідація.

- [x] T020 [P] Add new bgTheme renderers in js/engine.js for levels without existing backgrounds: `"horizon"` (1-3), `"indigo_diag"` (1-4), `"deep_blue_pulse"` (1-5), `"black_green_stripes"` (1-6), `"dim_orange"` (1-7), `"dark_purple_squares"` (1-8), `"burgundy_icicles"` (1-9, reuses 2-8), `"cool_gray_shimmer"` (1-10), `"concentric_circles"` (1-11), `"green_diagonal"` (1-12), `"toxic_ripples"` (1-13), `"dark_red_bezier"` (1-14), `"neon_cyberpunk_glow"` (1-15), `"emerald_pillars"` (1-16)
- [x] T021 [P] Add new bgTheme renderers in js/engine.js for middle/hard leagues: `"purple_skyscrapers"` (2-1), `"crimson_synthwave"` (2-2), `"gold_speed_lines"` (2-4), `"rotating_triangles"` (2-5), `"turquoise_pulse"` (2-7), `"pink_cyan_eq"` (3-1), `"indigo_circles"` (3-2), `"acid_green_rain"` (3-4), `"toxic_radiation"` (4-1)
- [x] T022 Update `renderBackground()` switch in js/engine.js: add all new bgTheme cases pointing to their renderer functions
- [x] T023 Ensure all existing bgTheme renderers are preserved: `"deep_grid"` (1-1), `"city_night"` (1-2), `"synthwave"`, `"equalizer"`, `"pulse_grid"`, `"matrix"` (2-3), `"speed_lines"`, `"geometry"`, `"stalactites"` (2-6), `"light_pulse"`, `"tunnel"` (3-3), `"rain"`, `"pulse_ripples"`, `"flame"` (4-2), `"demon"` (5-1)
- [x] T024 [P] Adjust level speed and spikeCount values in LEVELS_CONFIG per spec difficulty: Basic (160–220 px/s, 12–24 spikes), Medium (220–300 px/s, 24–40 spikes), Hard (300–380 px/s, 35–55 spikes), Master (380–430 px/s, 45–60 spikes), Boss (450 px/s, 60–70 spikes, rhythmGroups: true)
- [ ] T025 Run full validation per quickstart.md: all 9 scenarios (tabs, cards, unlock, HUD, preview, adaptability, localStorage errors, backgrounds, backward compatibility)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — immediate
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **User Stories (Phase 3–6)**: All depend on Phase 2 completion
  - US1 (Phase 3) and US2 (Phase 4) are independent of each other
  - US3 (Phase 5) depends on US1 (needs league-level structure from engine)
  - US4 (Phase 6) depends on US1 (needs buildLevelCards structure)
- **Polish (Phase 7)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Foundation only — no other story dependencies
- **US2 (P1)**: Foundation only — no other story dependencies (can run parallel with US1)
- **US3 (P2)**: Foundation + US1 (needs ALL_LEVELS + league names)
- **US4 (P3)**: Foundation + US1 (needs buildLevelCards DOM structure)

### Within Each User Story

- CSS before DOM generation
- Model/config changes before UI rendering
- Core logic before integration

### Parallel Opportunities

- T006 and T005 can run in parallel (CSS vs HTML, different files)
- T020 and T021 can run in parallel (different bgTheme sets)
- US1 (Phase 3) and US2 (Phase 4) can run in parallel after Foundation
- US3 (Phase 5) and US4 (Phase 6) can run in parallel (different parts of codebase)
- T004, T023, T024 can run in parallel with other tasks (different concerns)

---

## Parallel Example: User Story 1

```bash
# After Foundation (Phase 2), launch together:
Task: "T005 Add leagueTabs div in index.html"
Task: "T006 Add CSS for league tabs and level titles in css/style.css"

# After T005+T006 complete, launch:
Task: "T007 Rewrite buildLevelCards() in js/main.js"
Task: "T008 Update all LEVELS→ALL_LEVELS references in js/main.js"
Task: "T009 Fix getLastPlayable() usage in js/main.js"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (LEVELS_CONFIG + SaveManager)
3. Complete Phase 3: US1 (tabs + cards with titles)
4. Complete Phase 4: US2 (progressive unlock)
5. **STOP and VALIDATE**: Test tabs, cards, unlock, localStorage persistence
6. This is a functional MVP — game is playable with new league structure

### Incremental Delivery

1. Foundation → LEVELS_CONFIG with 31 levels exists
2. Add US1 → Tabs and cards visible → **Functional UI**
3. Add US2 → Unlock progression works → **Full game loop**
4. Add US3 → HUD shows league info → **In-game context**
5. Add US4 → Letters preview on cards → **Polished UX**
6. Polish → All backgrounds + validation → **Complete feature**

### Recommended Execution Order (single developer)

T001 → T002 → T003 → T004 → T005+T006 → T007+T008+T009 → T010+T011+T012+T013+T014 → T015+T016+T017 → T018+T019 → T020+T021 → T022+T023+T024 → T025

---

## Phase 8: Convergence — Виправлення регістру літер

**Purpose**: Усунути неузгодженість регістру між `keyboard.js` (KEYS у верхньому регістрі: `"Й"`, `"Ц"`) та `engine.js` (LEVELS_CONFIG у нижньому регістрі: `"й"`, `"ц"`), через яку порівняння в `handleLetter()` та `drawKeyboard()` завжди повертають `false`.

- [x] T026 [P] Normalize all `letters` arrays in `LEVELS_CONFIG` in js/engine.js from lowercase to uppercase to match `KEYS` in js/keyboard.js: change all 31 `letters` arrays from `["а","о"...]` to `["А","О"...]` (CRITICAL — F1: contradicts US1/AC1, FR-011)
- [x] T027 [US1] Add `.toUpperCase()` normalization in `handleLetter()` in js/engine.js: normalize incoming `letter` and `spike.letter` to uppercase before `===` comparison; normalize `letter` to uppercase before `this.level.letters.indexOf()` pool check (F1+F2: contradicts US1/AC1)
- [x] T028 [P] [US1] Normalize `groupLetters` and `targetLetter` to uppercase in `drawKeyboard()` in js/keyboard.js: uppercase `groupLetters` before creating `Set`; uppercase `targetLetter` before `key.letter === targetLetter` comparison; uppercase `errLetter` before `key.letter === errLetter` comparison (F3+F4: contradicts US1/AC1)
- [x] T029 [P] [US4] Update `buildLevelCards()` in js/main.js: render `level.letters` in the `.level-letters-preview` block as-is (now uppercase after T026) — no code change needed if T026 completed first; verify preview matches keyboard display (F5: partial US4)

---

## Notes

- [P] tasks = different files or independent concerns, safe to parallelize
- [US1]/[US2]/[US3]/[US4] labels map tasks to user stories from spec.md
- Each user story checkpoint is independently testable
- Commit after each logical group (at minimum after each phase)
- No tests requested in spec — validation via quickstart.md manual scenarios
- All changes in existing 4 files: index.html, css/style.css, js/main.js, js/engine.js
- Keep comments in Ukrainian per constitution

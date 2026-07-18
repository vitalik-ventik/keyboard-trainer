# Tasks: Реструктуризація прогресії на 15 рівнів із процедурними фонами та розумною клавіатурною індикацією

**Input**: Design documents from `/specs/006-15-level-progression/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Не передбачено специфікацією (ручне тестування через quickstart.md).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- All paths relative to project root

## Path Conventions

- `js/engine.js` — Level config, Engine class, SaveManager, backgrounds, obstacles
- `js/keyboard.js` — KEYS matrix, drawKeyboard, color constants
- `js/main.js` — Game loop, State Manager, DOM UI, level select
- `css/style.css` — DOM overlay styles
- `index.html` — Entry point (may need minor updates)

---

## Phase 1: Foundational (Data Layer — Розширення до 15 рівнів)

**Purpose**: Core data structures shared across all user stories. MUST be complete before US1/US2/US3.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete.

- [x] T001 Define full `LEVELS` array (15 levels) with all fields — `id`, `name`, `letters`, `newLetters`, `speed`, `spikeCount`, `seed`, `bgTheme`, `accentColor`, `rhythmGroups` — per data-model.md table in `js/engine.js`
- [x] T002 [P] Update `defaultSaveData()` to generate progress entries for 15 levels in `js/engine.js`
- [x] T003 [P] Update `sanitizeSaveData()`: change `Math.min(6, ...)` → `Math.min(15, ...)` for unlocked clamping in `js/engine.js`
- [x] T004 [P] Update `reactionTimeForLevel()` formula: change denominator from `/5` to `/14`, adjust range to 1.2–0.5s for 15 levels in `js/engine.js`
- [x] T005 Update `recordResult()`: change `levelId < 6` → `levelId < 15` for unlock logic in `js/engine.js`

**Checkpoint**: Foundation ready — all 15 levels defined, save system supports 1–15, scaling curves adjusted.

---

## Phase 2: User Story 1 — 15-рівнева прогресія з анатомічною кривою та процедурними фонами (Priority: P1) 🎯 MVP

**Goal**: Гравець проходить 15 рівнів з плавною кривою складності (≤2 нові літери за рівень). Кожен рівень має унікальний процедурний фон. Рівні блокуються послідовно. Прогрес зберігається в localStorage.

**Independent Test**: Пройти Рівень 1 на 100% → Рівень 2 розблоковано на екрані вибору рівнів. Фон Рівня 1 — темно-синій із блакитною сіткою. Після перезапуску браузера прогрес зберігається.

### Background Themes (15 procedural render methods)

- [x] T006 [P] [US1] Implement `renderDeepGrid()` — deep blue gradient, dual-layer parallax grid, drifting vertical neon lines in `js/engine.js`
- [x] T007 [P] [US1] Implement `renderCityNight()` — purple gradient, two layers of building silhouettes with pulsing yellow/cyan windows (reuse `renderCityLayer`) in `js/engine.js`
- [x] T008 [P] [US1] Implement `renderSynthwave()` — purple-pink gradient, segmented sun with horizontal lines, pulsating radius in `js/engine.js`
- [x] T009 [P] [US1] Implement `renderEqualizer()` — teal gradient, 32 animated equalizer bars above ground line in `js/engine.js`
- [x] T010 [P] [US1] Implement `renderPulseGrid()` — pink-blue gradient, grid with pulsing `globalAlpha` 0.5–1.0 in `js/engine.js`
- [x] T011 [P] [US1] Implement `renderMatrix()` — black-green gradient, 40–60 falling vertical green segments (Matrix rain effect) in `js/engine.js`
- [x] T012 [P] [US1] Implement `renderSpeedLines()` — dark orange gradient, 15–20 fast horizontal lines moving right-to-left in `js/engine.js`
- [x] T013 [P] [US1] Implement `renderGeometry()` — indigo gradient, 4–6 slowly rotating geometric shapes (squares, triangles) with low alpha stroke in `js/engine.js`
- [x] T014 [P] [US1] Implement `renderStalactites()` — burgundy gradient, polyline stalactites from top + stalagmites from bottom in `js/engine.js`
- [x] T015 [P] [US1] Implement `renderLightPulse()` — yellow-purple gradient, temporary brightness flash overlay on correct keypress (pulse-driven) in `js/engine.js`
- [x] T016 [P] [US1] Implement `renderTunnel()` — dark grey gradient, concentric circles radiating from screen center in `js/engine.js`
- [x] T017 [P] [US1] Implement `renderRain()` — black-lime gradient, 30–50 diagonal rain lines falling at 45° angle in `js/engine.js`
- [x] T018 [P] [US1] Implement `renderPulseRipples()` — yellow-brown gradient, expanding circles from obstacle spawn positions in `js/engine.js`
- [x] T019 [P] [US1] Implement `renderFlame()` — dark red gradient, 3–5 Bezier curve flame waves at bottom of screen in `js/engine.js`
- [x] T020 [P] [US1] Implement `renderDemon()` — pure black background, blood-red neon grid lines, full-screen pulsing overlay, extended spark particles in `js/engine.js`

### Background Dispatch & Integration

- [x] T021 [US1] Replace `renderBackground()` with switch-based dispatch to 15 theme methods; remove old `renderGridBackground`, `renderCityBackground`, `renderBossBackground` in `js/engine.js`
- [x] T022 [US1] Update `renderGround()` to use `this.level.accentColor` for neon ground line instead of hardcoded theme check in `js/engine.js`

### UI & Level Selection Updates

- [x] T023 [P] [US1] Update `buildLevelCards()` in `js/main.js`: iterate 15 levels, show lock icon for `level.id > progress.unlocked`, handle boss-card styling for levels 10 + 15
- [x] T024 [US1] Update `handleVictory()` in `js/main.js`: change `nextId <= 6` → `nextId <= 15`, update victory messages for 15 levels, handle final level (15) special message
- [x] T025 [US1] Update `btnNext.click` handler in `js/main.js`: change `Math.min(6, ...)` → `Math.min(15, ...)`
- [x] T026 [P] [US1] Update CSS level grid to accommodate 15 cards (adjust grid-template-columns, card sizing) in `css/style.css`
- [x] T027 [P] [US1] Update `index.html` if level grid container needs size adjustments for 15 cards

**Checkpoint**: All 15 levels functional with unique backgrounds. Level 1 playable → 100% → Level 2 unlocked. Progression persists across browser sessions.

---

## Phase 3: User Story 2 — Розумна кольорова індикація віртуальної клавіатури (Priority: P2)

**Goal**: Віртуальна клавіатура показує: (1) літери пулу — м'який блакитний (cyan), (2) найближча ціль — яскравий жовто-зелений (lime/yellow), (3) помилкове натискання — спалах червоним на 350 мс.

**Independent Test**: На Рівні 1 клавіші `А`/`О` підсвічені блакитним. При наближенні до шипа — цільова клавіша стає жовто-зеленою. Натискання `П` → спалах червоним на ~350 мс, потім згасає.

### Keyboard Color Scheme

- [x] T028 [P] [US2] Define color constants object (`COLORS`) with DEFAULT, GROUP (cyan), TARGET (lime/yellow), ERROR (red) in `js/keyboard.js`
- [x] T029 [P] [US2] Update `drawKeyboard()`: add `wrongKeyError` parameter (5th arg), apply 4-level color priority (error > target > group > default) in `js/keyboard.js`
- [x] T030 [US2] Implement auto-fade logic for wrongKeyError: check `performance.now() - timestamp > 350ms` in render loop in `js/keyboard.js`

### Engine Integration

- [x] T031 [US2] Update `handleLetter()` to return outcome object `{ result: "correct"|"wrong"|"ignored"|"exploded"|"no_target", letter: string }` in `js/engine.js`

### Main.js Integration

- [x] T032 [US2] Create `wrongKeyError` state variable `{ letter: null, timestamp: 0 }` in `js/main.js`
- [x] T033 [US2] Update `initKeyboardInput` callback: use `handleLetter()` return value to set `wrongKeyError` on "wrong" result, clear on any keypress in `js/main.js`
- [x] T034 [US2] Update `drawKeyboard()` call in game loop: pass `wrongKeyError` as 5th argument, wire auto-fade in `js/main.js`

**Checkpoint**: Keyboard shows 3-level color indication. Error flash fades automatically. All colors render correctly per priority.

---

## Phase 4: User Story 3 — Векторні перешкоди трьох типів (Priority: P3)

**Goal**: Перешкоди мають 3 типи: звичайний шип (spike), подвійний шип (double_spike), циркулярна пила (saw). Пили обертаються навколо осі. Колізії однакові для всіх типів.

**Independent Test**: Запустити будь-який рівень — бачимо всі 3 типи перешкод на трасі. Пили візуально обертаються. При зіткненні з будь-яким типом — вибух.

### Obstacle Generation

- [x] T035 [US3] Add `type` field generation to `generateTrack()`: random assignment spike (50%), double_spike (30%), saw (20%) with constraint ≤2 saws in a row in `js/engine.js`
- [x] T036 [US3] Add `rotationAngle: 0` to saw obstacles in `generateTrack()` in `js/engine.js`

### Obstacle Rendering

- [x] T037 [P] [US3] Implement `drawSpike(ctx, x, y, w, h, accentColor, cleared)` — single triangle with neon stroke in `js/engine.js`
- [x] T038 [P] [US3] Implement `drawDoubleSpike(ctx, x, y, w, h, accentColor, cleared)` — two triangles offset ±(w*0.45) in `js/engine.js`
- [x] T039 [P] [US3] Implement `drawSaw(ctx, x, y, radius, rotationAngle, accentColor, cleared)` — circle with 8 triangular teeth via `Math.sin`/`Math.cos` in `js/engine.js`
- [x] T040 [US3] Rename `renderSpikes()` → `renderObstacles()`; add type-based dispatch to drawSpike/drawDoubleSpike/drawSaw in `js/engine.js`
- [x] T041 [US3] Add `getObstacleType()` method to Engine class in `js/engine.js`

### Saw Rotation

- [x] T042 [US3] Update `update()` to increment `rotationAngle` for saw obstacles: `spike.rotationAngle += level.speed * 0.02 * dt` in `js/engine.js`

**Checkpoint**: All 3 obstacle types render correctly. Saws rotate. Collisions work identically for all types.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, validation, and performance verification.

- [x] T043 Remove any remaining references to old 6-level system (dead code, hardcoded `6` constants) in `js/engine.js` and `js/main.js`
- [x] T044 [P] Verify `createDemoEngine()` works with expanded `bgTheme` list (demo autorun rendering) in `js/main.js`
- [x] T045 Run quickstart.md validation: V1 (15 level cards), V2 (unlock progression), V3 (persistence), V4 (unique backgrounds), V5 (cyan keys), V6 (target highlight), V7 (error flash), V8 (3 obstacle types), V9 (save migration), V10 (60 FPS)
- [x] T046 Performance optimization: profile Level 15 (demon mode) with Chrome DevTools, ensure ≤16.7ms frame time

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start immediately. BLOCKS all user stories.
- **Phase 2 (US1 — P1)**: Depends on Phase 1 completion.
- **Phase 3 (US2 — P2)**: Depends on Phase 1 completion. Can run in parallel with US1 *if staffed*, but US1 tasks in same files (engine.js/main.js). **Recommended**: sequential after US1.
- **Phase 4 (US3 — P3)**: Depends on Phase 1 completion. Can run in parallel with US1/US2 *if staffed*, but shares engine.js. **Recommended**: sequential after US2.
- **Phase 5 (Polish)**: Depends on all desired user stories complete.

### User Story Dependencies

- **US1 (P1)**: Foundation → complete. No dependency on US2/US3. 🎯 **MVP**
- **US2 (P2)**: Foundation → complete. Modifies `handleLetter()` (engine.js) and `drawKeyboard()` (keyboard.js). May conflict with US1 if run in parallel (both touch engine.js render flow).
- **US3 (P3)**: Foundation → complete. Modifies `generateTrack()`, `renderSpikes→renderObstacles`, `update()` in engine.js. May conflict with US1 if run in parallel.

### Within Each Story

- US1: Background methods [P] (T006–T020) → dispatch integration (T021) → ground update (T022) → UI updates (T023–T027)
- US2: Keyboard changes [P] (T028–T030) → engine return value (T031) → main.js integration (T032–T034)
- US3: Generation (T035–T036) → rendering methods [P] (T037–T039) → dispatch rename (T040) → getter + rotation (T041–T042)

### Parallel Opportunities

- **Phase 1**: T002, T003, T004 can run in parallel (different functions in same file, but independent logic)
- **US1 backgrounds**: All 15 methods (T006–T020) are independent — can run in parallel
- **US2 keyboards**: T028, T029 can run in parallel
- **US3 rendering**: T037, T038, T039 can run in parallel (independent draw functions)

---

## Parallel Example: US1 Background Themes

```bash
# All 15 background methods are independent — launch together:
Task: "Implement renderDeepGrid() in js/engine.js"
Task: "Implement renderCityNight() in js/engine.js"
Task: "Implement renderSynthwave() in js/engine.js"
Task: "Implement renderEqualizer() in js/engine.js"
Task: "Implement renderPulseGrid() in js/engine.js"
# ... remaining 10 methods in parallel groups of 5
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (T001–T005) — 15-level data structures
2. Complete Phase 2: US1 (T006–T027) — 15 backgrounds + UI
3. **STOP and VALIDATE**: Test V1–V4 from quickstart.md
4. Deploy/demo — 15-level game with unique backgrounds already delivers value

### Incremental Delivery

1. Foundation → 15 levels defined
2. + US1 → Playable 15 levels with unique backgrounds, progression, persistence (MVP!)
3. + US2 → Smart keyboard color indication added
4. + US3 → 3 obstacle types with visual variety
5. + Polish → Cleaned up, validated, 60 FPS confirmed

### Risk Mitigation

- **T006–T020 (15 backgrounds)**: Highest effort block. Can be split into 3 sub-groups of 5 for incremental progress.
- **Engine.js size**: With 15 background methods, engine.js may exceed 1500 lines. Consider extracting backgrounds to a separate `js/backgrounds.js` file if size becomes unwieldy (adjust per Constitution Principle II — module separation by responsibility allowed).
- **Save migration**: Test T003 with existing `dfp_save_v1` data before deployment to avoid wiping player progress.

---

## Notes

- [P] tasks = different functions/methods, no logical dependencies between them
- [Story] label maps task to user story for traceability
- Each user story independently testable via quickstart.md scenarios
- Constitution compliance: all changes in `js/*.js`, Canvas-only rendering, localStorage with try/catch, no external dependencies
- Commit after each logical group (e.g., all background methods, then integration, then UI)
- Language: all code comments in Ukrainian per Constitution

# Tasks: Розширені налаштування hit-зони (Normal / Large)

**Input**: Design documents from `specs/007-hit-zone-size-setting/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested — manual validation via `quickstart.md`.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No initialization needed — project structure, SaveManager API (`setHitWindow`/`getHitWindow`), and `settings.hitWindow` in localStorage schema all already exist.

> **Skip to Phase 2**: Setup phase is empty — the codebase is already prepared.

---

## Phase 2: Foundational — Engine Multiplier (Blocking Prerequisites)

**Purpose**: Core multiplier logic in Engine constructor. This single change enables US2 (visual scaling) and US3 (collision scaling) automatically, since all hit-zone consumers reference `this.okPx`/`this.perfectPx`. Also integrates `hitWindow` into the main.js game-launch pipeline.

**CRITICAL**: No user story can be fully validated until this phase is complete.

- [x] T001 Add `hitWindow` parameter to `Engine` constructor signature in `js/engine.js:482` — change from `constructor(levelId, difficulty, demoMode)` to `constructor(levelId, difficulty, demoMode, hitWindow)`, default `hitWindow = "normal"` for backward compatibility.

- [x] T002 Apply `hitWindow` multiplier to `this.okPx` and `this.perfectPx` in Engine constructor in `js/engine.js:491-493` — after computing `okPx` and `perfectPx` from `hitWindowTimes()`, multiply both by `hitWindow === "large" ? 2 : 1`.

- [x] T003 Pass `save.getHitWindow()` to `new Engine(...)` in `startLevel()` in `js/main.js:131` — add fourth argument to Engine constructor call.

- [x] T004 [P] Pass `save.getHitWindow()` to `new Engine(...)` in `createDemoEngine()` in `js/main.js:122` — add fourth argument (after `true` for demoMode).

**Checkpoint**: Engine multiplier is active. Hit-zone logic (handleLetter, consumeJumpBuffer, renderHitWindow, demo auto-jump, HARD miss check) now uses scaled `okPx`/`perfectPx` when hitWindow is "large". US2 and US3 are functionally complete at this point.

---

## Phase 3: User Story 1 — Settings UI Toggle (Priority: P1)

**Goal**: Player sees two new buttons ("NORMAL" / "LARGE") in settings modal, can toggle between them, and the selection is persisted via the existing `save.setHitWindow()` API.

**Independent Test**: Open settings, verify buttons exist with correct active state. Click "LARGE" — button highlights, hint text updates. Close and reopen settings — "LARGE" remains active.

### Implementation for User Story 1

- [x] T005 [P] [US1] Add hit-zone size button row in settings modal in `index.html:39-51` — inside `#settingsModal > .modal`, after the difficulty row (`div.difficulty-row`), add: `<p class="modal-caption">Розмір зони стрибка</p>`, `<div class="option-row">` with two `<button>` elements: `#btnNormal` (text "NORMAL") and `#btnLarge` (text "LARGE"), plus `<p class="option-hint" id="hitWindowHint">`.

- [x] T006 [P] [US1] Add button and active-state styles in `css/style.css` — rename `.diff-btn` to `.option-btn` (or duplicate for both rows), add `.active-normal` (green neon, like active-easy) and `.active-large` (yellow/gold neon, e.g., `--neon-yellow: #ffd700`), add `.option-hint` style matching existing `.diff-hint`.

- [x] T007 [US1] Add `refreshHitWindowButtons()` function in `js/main.js:240-249` area — follow the same pattern as `refreshDifficultyButtons()`: read `save.getHitWindow()`, toggle `active-normal`/`active-large` classes on `#btnNormal`/`#btnLarge`, update `#hitWindowHint` text content with Ukrainian descriptions for each mode.

- [x] T008 [US1] Add NORMAL/LARGE click event handlers in `js/main.js:268-279` area — `#btnNormal` calls `save.setHitWindow("normal"); refreshHitWindowButtons();`, `#btnLarge` calls `save.setHitWindow("large"); refreshHitWindowButtons();`. Call `refreshHitWindowButtons()` at the end of `refreshDifficultyButtons()` (or add a separate call in `setState("SETTINGS")`) to ensure UI is synced on settings open.

**Checkpoint**: Settings UI fully functional. Player can toggle NORMAL/LARGE, see visual feedback, setting persists via localStorage.

---

## Phase 4: User Story 2 & 3 — Visual & Collision Scaling (Priority: P2)

**Goal**: Both visual rendering and collision detection use doubled hit-zones when "LARGE" is selected.

**Independent Test**: Launch level with "LARGE" — visual hit-zone is 2x wider. Press correct key at 2x distance — jump registers. Press correct key inside 2x perfect zone — "Ідеально" registered.

### Verification for User Story 2 & 3

> **Note**: These user stories require **zero new code** beyond Phase 2 (T001-T002). The multiplier is applied once to `okPx`/`perfectPx` in the Engine constructor, and all consumers — `renderHitWindow()` (visual), `handleLetter()` (collision), `consumeJumpBuffer()` (air buffer), demo auto-jump, HARD miss check — reference these values directly. The tasks below are purely verification.

- [x] T009 [US2] Verify `renderHitWindow()` in `js/engine.js:1425-1444` uses `this.okPx` and `this.perfectPx` directly — no code changes needed, confirm visually via V-2 scenario in quickstart.md.

- [x] T010 [US3] Verify `handleLetter()` in `js/engine.js:626-665` uses `this.okPx` and `this.perfectPx` for `inWindow` and `perfect` checks — no code changes needed, confirm via V-3 scenario in quickstart.md.

- [x] T011 [US3] Verify `consumeJumpBuffer()` in `js/engine.js:560-576` uses scaled `okPx`/`perfectPx` — no code changes needed.

- [x] T012 [US3] Verify demo auto-jump in `js/engine.js:728-737` uses scaled `okPx` — confirmed by T004 passing hitWindow to demo Engine.

- [x] T013 [US3] Verify HARD miss check in `js/engine.js:739-748` uses `SPIKE_W`/`CUBE_SIZE` (not `okPx`) — confirms HARD explosion timing is unaffected by hitWindow setting (only the success window widens, not the explosion trigger).

**Checkpoint**: Visual and collision scaling verified. Player sees wider zones and experiences wider success windows at "LARGE".

---

## Phase 5: User Story 4 — Persistence (Priority: P3)

**Goal**: hitWindow setting survives page reloads, with safe defaults for first-time users and corrupted data.

**Independent Test**: Select "LARGE", reload page, open settings — "LARGE" is active. Clear localStorage, reload — "NORMAL" is active (safe default).

### Verification for User Story 4

> **Note**: `save.setHitWindow()`, `save.getHitWindow()`, `sanitizeSaveData()` (hitWindow validation), and `save.persist()` all already exist in `js/engine.js`. The tasks below confirm correct behavior.

- [x] T014 [US4] Verify `sanitizeSaveData()` handles `hitWindow` in `js/engine.js:327-329` — already validates `"normal"` | `"large"`, defaults to `"normal"` for missing/invalid values. No code changes needed.

- [x] T015 [US4] Verify `save.setHitWindow()` in `js/engine.js:427-435` is called from UI handlers (T008) and calls `save.persist()` — confirm setting is written to localStorage.

- [x] T016 [US4] Verify `save.load()` in `js/engine.js:358-374` loads and sanitizes `hitWindow` — confirm setting is restored after page reload via V-4 scenario in quickstart.md.

**Checkpoint**: Persistence verified. Setting survives page reload and falls back to "NORMAL" safely.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup.

- [x] T017 Run full quickstart validation — execute all V-1 through V-7 scenarios from `specs/007-hit-zone-size-setting/quickstart.md`, verify zero console errors.

- [x] T018 Verify `.diff-btn` → `.option-btn` rename does not break existing difficulty button styling — check that EASY/HARD buttons still render correctly after CSS class rename.

- [x] T019 Verify all UI text is in Ukrainian: button labels ("NORMAL", "LARGE"), caption ("Розмір зони стрибка"), hint texts.

- [x] T020 [P] Verify `hintText` for "LARGE" mentions doubled OK + Perfect zones; "NORMAL" mentions standard behavior — aligns with FR-003 from spec.md.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — skip
- **Foundational (Phase 2)**: No dependencies — start immediately. BLOCKS all user story phases.
- **US1 (Phase 3)**: Depends on Phase 2 (needs `save.getHitWindow()` and `save.setHitWindow()` from existing API)
- **US2+US3 (Phase 4)**: Depends on Phase 2 (verification only — code changes are in T001-T002)
- **US4 (Phase 5)**: Depends on Phase 3 (UI handlers call `save.setHitWindow()`)
- **Polish (Phase 6)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2. No dependency on US2/US3/US4.
- **US2 (P2)**: Code change in Phase 2 (T002). Verification in Phase 4.
- **US3 (P2)**: Code change in Phase 2 (T002). Verification in Phase 4.
- **US4 (P3)**: Persistence code already exists. Depends on US1 for UI handlers integration.

### Within Each Phase

- **Phase 2**: T001 → T002 (same file, sequential). T003, T004 [P] can run in parallel after T001 (different file from T002).
- **Phase 3**: T005 [P], T006 [P] (different files: HTML, CSS). T007 → T008 (same file: main.js, sequential).
- **Phase 4**: All verification tasks [P] — can run in any order.
- **Phase 5**: All verification tasks [P] — can run in any order.

### Parallel Opportunities

```
Phase 2:
  T001 (engine.js: signature)
    ├─► T002 (engine.js: multiplier)
    ├─► T003 [P] (main.js: startLevel)   ← parallel with T002
    └─► T004 [P] (main.js: demo)         ← parallel with T002

Phase 3:
  T005 [P] (index.html)  ─┬─► T007 (main.js: refreshUI) ─► T008 (main.js: handlers)
  T006 [P] (style.css)   ─┘

Phase 4:
  T009 [P] ─┬─ All independent verification
  T010 [P] ─┤
  T011 [P] ─┤
  T012 [P] ─┤
  T013 [P] ─┘

Phase 5:
  T014 [P] ─┬─ All independent verification
  T015 [P] ─┤
  T016 [P] ─┘

Phase 6:
  T017 → T018, T019 [P], T020 [P]
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Engine multiplier + main.js integration (T001-T004) — **4 tasks**
2. Complete Phase 3: Settings UI (T005-T008) — **4 tasks**
3. **STOP and VALIDATE**: Open settings, toggle NORMAL/LARGE, confirm visual state + persistence
4. Launch a level — hit-zone is visually scaled and functionally wider at "LARGE"
5. **MVP delivered**: Player controls hit-zone size via settings UI with full functional impact

### Incremental Delivery

1. Phase 2 → Engine ready, multiplier active
2. Phase 3 → UI toggle added → **MVP delivered** (US1, US2, US3 all active from T001-T002)
3. Phase 4 → Verify visual/collision scaling → confidence check
4. Phase 5 → Verify persistence → confidence check
5. Phase 6 → Full validation → production-ready

### Parallel Team Strategy

With 2 developers:
- Dev A: Phase 2 (engine.js: T001-T002) → Phase 3 (main.js UI: T007-T008)
- Dev B: Phase 3 (HTML/CSS: T005-T006) → Phase 4-5 verification

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US2 and US3 require **zero new code** — Phase 2 (T001-T002) applies multiplier at constructor level, all consumers use `this.okPx`/`this.perfectPx` directly
- `settings.hitWindow`, `sanitizeSaveData`, `save.setHitWindow()`, `save.getHitWindow()`, `save.persist()` already exist — no data model changes needed
- Commit after each phase for clean history
- Validate with quickstart.md scenarios before marking complete

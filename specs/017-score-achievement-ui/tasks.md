# Tasks: Система балів, досягнень та UI нагород

**Input**: Design documents from `specs/017-score-achievement-ui/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure Engine instance stores config values needed for scoring

- [x] T001 Store raw hitWindow and speed string values alongside derived values in Engine constructor at `js/engine.js` (add `this.hitWindowSetting` and `this.speedSetting` fields, currently only derived values `this.okPx`/`this.perfectPx` and `this.effectiveSpeed` are stored)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core scoring functions and localStorage schema migration that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Implement `calculateHitScore(isOkZone, config)` pure function in `js/engine.js` — returns integer score >= 0 using formula: base (100 OK / 80 other) + difficulty bonus (HARD +50) + zone bonus (NORMAL +20) + speed bonus (FAST +40 / SLOW -20)
- [x] T003 [P] Implement `calculateMaxScores(spikeCount, hitWindow, speed)` function in `js/engine.js` — returns `{ maxEasy, maxHard }` where maxEasy uses EASY difficulty bonus and maxHard uses HARD difficulty bonus, both assuming all OK hits
- [x] T004 Extend `sanitizeSaveData()` in `js/engine.js` to add `perfect: null` field to every level entry in `saveData.progress.levels` if missing, and validate existing `perfect` values (only `null`, `"easy"`, `"hard"` allowed — invalid values reset to `null`)
- [x] T005 Add `getLevelAchievement(levelId)` method to save manager object in `js/engine.js` — returns `saveData.progress.levels[id].perfect` or `null`

**Checkpoint**: Foundation ready — scoring formula exists, localStorage schema supports achievements, user story implementation can begin

---

## Phase 3: User Story 1 - Адитивне нарахування балів під час гри (Priority: P1) 🎯 MVP

**Goal**: Replace current `+10/+15` scoring with new additive formula using `calculateHitScore()`. Player sees score update in real-time on progress bar.

**Independent Test**: Launch any level, hit letters — verify score increments match the formula table (120 for EASY/NORMAL/NORMAL/OK, 210 for HARD/NORMAL/FAST/OK, etc.)

### Implementation for User Story 1

- [x] T006 [US1] Build config object from `this.difficulty`, `this.hitWindowSetting`, `this.speedSetting` in Engine constructor and store as `this.scoreConfig` in `js/engine.js` (after line ~1079 where all config is applied)
- [x] T007 [US1] Replace score increment in `handleLetter()` at `js/engine.js` (~line 1229): change `this.score += 10 + (perfect ? 5 : 0)` to `this.score += calculateHitScore(isOkZone, this.scoreConfig)` where `isOkZone = gap <= this.okPx`
- [x] T008 [US1] Replace score increment in `consumeJumpBuffer()` at `js/engine.js` (~line 1161): same change as T007 using `calculateHitScore(isOkZone, this.scoreConfig)`
- [x] T009 [US1] Update progress bar score display at `js/engine.js` (~line 1674): change `"Очки: " + this.score` to `"Очки: " + this.score + " / " + maxForMode` where `maxForMode = this.difficulty === "HARD" ? this.maxHard : this.maxEasy`

**Checkpoint**: Player sees new additive scores during gameplay — MVP complete and independently testable

---

## Phase 4: User Story 2 - Розрахунок максимального балу та фіксація досягнень (Priority: P2)

**Goal**: Calculate maxEasy/maxHard per level, compare final score on victory, award perfectEasy/perfectHard achievements with gold-over-silver hierarchy, persist to localStorage.

**Independent Test**: Complete a level on EASY/NORMAL/NORMAL hitting all OK zones — verify `perfect: "easy"` appears in localStorage and persists after reload.

### Implementation for User Story 2

- [x] T010 [US2] Calculate `this.maxEasy` and `this.maxHard` in Engine constructor using `calculateMaxScores(this.level.spikeCount, this.hitWindowSetting, this.speedSetting)` stored on engine instance in `js/engine.js`
- [x] T011 [US2] Expose `maxEasy`, `maxHard`, `difficulty` fields on the run state object returned from Engine (so `main.js` can pass them to `save.recordResult()`) — add to the object returned at end of `Engine.start()` or as properties accessible via `runState` in `js/engine.js`
- [x] T012 [US2] Extend `save.recordResult(levelId, pct, score, options)` signature in `js/engine.js` to accept `{ maxEasy, maxHard, difficulty }` options parameter. Implement achievement check logic: if `pct >= 100` and `score >= maxHard` and `difficulty === "HARD"` → set `perfect = "hard"`; else if `pct >= 100` and `score >= maxEasy` and `difficulty === "EASY"` and current `perfect` is not `"hard"` → set `perfect = "easy"`. Return `achievementUnlocked` in result if changed
- [x] T013 [US2] Update `save.recordResult()` calls in `js/main.js` (~lines 187, 200): pass `{ maxEasy: runState.maxEasy, maxHard: runState.maxHard, difficulty: runState.difficulty }` as 4th argument. Capture returned `achievementUnlocked` for potential future notification

**Checkpoint**: Achievements awarded on victory, persisted to localStorage, gold supersedes silver — independently testable via console/localStorage inspection

---

## Phase 5: User Story 3 - Візуальне оформлення карток рівнів на мапі (Priority: P3)

**Goal**: Level cards in selection menu show silver/gold frames and star icons based on achievement status, using pure CSS.

**Independent Test**: Manually set `perfect: "easy"` or `"hard"` in localStorage for a level, reload page — verify visual changes on that level's card.

### Implementation for User Story 3

- [x] T014 [P] [US3] Add CSS classes for silver perfect level card in `css/style.css`: `.level-card.perfect-silver` with thin `#b0b8c8` border, subtle box-shadow (no animation)
- [x] T015 [P] [US3] Add CSS classes for gold perfect level card in `css/style.css`: `.level-card.perfect-gold` with gold gradient border-image, `@keyframes goldPulse` (2s ease-in-out, box-shadow pulse + scale 1.03)
- [x] T016 [P] [US3] Add CSS classes for star element in `css/style.css`: `.level-star` base style, `.perfect-silver .level-star` with silver gradient (`background-clip: text`), `.perfect-gold .level-star` with gold gradient + `@keyframes goldStarPulse` (1.5s, scale 1.15)
- [x] T017 [US3] Modify `buildLevelCards()` in `js/main.js` (~line 262): after creating card div, call `save.getLevelAchievement(level.id)`. If `"easy"` or `"hard"`, create `<div class="level-star">★</div>` and prepend to card. Add `.perfect-silver` or `.perfect-gold` CSS class to card accordingly

**Checkpoint**: Level cards visually reflect achievement status — silver star + frame for perfectEasy, gold star + pulsing glow for perfectHard, standard for none

---

## Phase 6: User Story 4 - Статусні ефекти на скінах кубиків (Priority: P4)

**Goal**: Skin cards in skin selector get silver/gold borders. In-game cube gets silver outline (perfectEasy) or gold glow + trail (perfectHard) on Canvas.

**Independent Test**: Manually set `perfect: "hard"` for a level in localStorage, select that level's skin, launch game — cube should have gold glow and leave gold trail during jumps.

### Implementation for User Story 4

- [x] T018 [P] [US4] Add CSS classes for skin card achievement states in `css/style.css`: `.skin-card.perfect-silver` (silver border + subtle glow), `.skin-card.perfect-gold` (gold border + goldPulse animation)
- [x] T019 [US4] Modify `buildSkinGrid()` in `js/main.js` (~line 611): for each skin card, get achievement status via `save.getLevelAchievement(level.id)`. Add `.perfect-silver` or `.perfect-gold` CSS class to `skinCard` if achievement exists
- [x] T020 [US4] Implement silver outline rendering in `renderPlayer()` at `js/engine.js` (~line 1617): when `achievement === "easy"`, after skin render, draw a thin `#d4dce8` strokeRect with small shadowBlur around cube, respecting cube rotation
- [x] T021 [US4] Implement gold glow rendering in `renderPlayer()` at `js/engine.js` (~line 1617): when `achievement === "hard"`, set `ctx.shadowBlur = 18` and `ctx.shadowColor = '#ffaa00'` before skin render, reset after. Read achievement via `save.getLevelAchievement(this.level.id)`
- [x] T022 [US4] Implement gold trail particles in `renderPlayer()` at `js/engine.js` (~line 1604): when `achievement === "hard"` and player is airborne (`!onGround`), record gold trail points in `this.player.goldTrail` array, render fading gold circles (max 15 particles, 0.4s lifetime), clear trail on reset/landing
- [x] T023 [US4] Clear `this.player.goldTrail` in Engine `reset()` method at `js/engine.js` (alongside existing `this.player.trail = []` and `this.player.meteorTrail = []`)

**Checkpoint**: Cube in-game shows silver outline (perfectEasy) or gold glow + jump trail (perfectHard). Skin cards in selector show corresponding borders.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge case hardening, performance validation, final integration

- [x] T024 [P] Ensure `calculateHitScore()` clamps result >= 0 with `Math.max(0, ...)` for SLOW + non-OK edge case (verification of existing implementation)
- [x] T025 [P] Ensure empty level (spikeCount=0) produces maxEasy=0 and maxHard=0, and no false achievement awarded (guard in `recordResult`)
- [x] T026 [P] Ensure gold card hover style does not conflict with goldPulse animation — add `.level-card.perfect-gold:hover` override in `css/style.css`
- [ ] T027 Verify `sanitizeSaveData()` handles corrupted `perfect` value (e.g., `"gold"`, `true`, `1`) by resetting to `null` — manual test via DevTools
- [ ] T028 Run all 8 quickstart validation scenarios from `specs/017-score-achievement-ui/quickstart.md` — confirm each scenario passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) — scoring formula must exist
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) and conceptually on US1 (needs score to test max), but technically can be developed in parallel with US1 since both extend different parts of Engine
- **User Story 3 (Phase 5)**: Depends on US2 (achievement data in localStorage must be readable via `getLevelAchievement()`)
- **User Story 4 (Phase 6)**: Depends on US2 (same reason — needs `getLevelAchievement()`) — can run in parallel with US3
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational)
    │
    ├──────────────┬────────────────┐
    ▼              ▼                ▼
Phase 3 (US1)  Phase 4 (US2)    (blocked)
    │              │
    └──────┬───────┘
           ▼
    ┌──────┴──────┐
    ▼              ▼
Phase 5 (US3)  Phase 6 (US4)
    │              │
    └──────┬───────┘
           ▼
Phase 7 (Polish)
```

### Within Each User Story

- US1: T006 (config object) → T007 (handleLetter) ∥ T008 (consumeJumpBuffer) → T009 (progress bar) — sequential within story
- US2: T010 (maxCalc) → T011 (expose) → T012 (recordResult) → T013 (main.js calls) — sequential
- US3: T014 ∥ T015 ∥ T016 (CSS, all [P]) → T017 (DOM modification) — CSS first then DOM
- US4: T018 (CSS, [P]) ∥ T019 (skin grid, [P]) → T020 (silver outline) ∥ T021 (gold glow) ∥ T022 (gold trail) → T023 (reset) — CSS/UI parallel, then Canvas effects partially parallel

### Parallel Opportunities

- **Phase 2**: T002, T003 can run in parallel (independent pure functions)
- **Phase 5**: T014, T015, T016 can run in parallel (different CSS sections, same file but non-conflicting additions)
- **Phase 6**: T018, T019 can run in parallel (CSS vs main.js). T020, T021 are in same function but affect different code paths (silver vs gold) — can be implemented together
- **Phase 7**: T024, T025, T026 can run in parallel (independent concerns)
- **Cross-phase**: US3 (Phase 5) and US4 (Phase 6) can run in parallel after US2 completes

---

## Parallel Example: User Story 3

```bash
# Launch all CSS tasks for US3 together:
Task: "Add CSS for silver perfect level card in css/style.css"
Task: "Add CSS for gold perfect level card + goldPulse keyframes in css/style.css"
Task: "Add CSS for star element + silver/gold gradients in css/style.css"

# After CSS, modify DOM:
Task: "Modify buildLevelCards() in js/main.js to add star + CSS classes"
```

---

## Parallel Example: User Story 4

```bash
# Launch CSS + UI tasks together:
Task: "Add CSS for skin card silver/gold states in css/style.css"
Task: "Modify buildSkinGrid() in js/main.js to add achievement CSS classes"

# Then launch Canvas rendering tasks (all in same function, sequential):
Task: "Implement silver outline in renderPlayer() at js/engine.js"
Task: "Implement gold glow in renderPlayer() at js/engine.js"
Task: "Implement gold trail particles in renderPlayer() at js/engine.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T005) — CRITICAL
3. Complete Phase 3: User Story 1 (T006–T009)
4. **STOP and VALIDATE**: Launch game, hit letters, verify score increments match formula
5. Deploy/demo — new scoring system is live

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → New scoring live, test → Deploy/Demo (MVP!)
3. Add US2 → Achievements unlock and persist, test → Deploy/Demo
4. Add US3 → Level cards show silver/gold stars, test → Deploy/Demo
5. Add US4 → Cube glows during gameplay, skin cards show status, test → Deploy/Demo
6. Polish → Edge cases covered, quickstart validated

---

## Notes

- [P] tasks = different files or non-conflicting same-file additions, no dependencies
- [Story] label maps task to specific user story for traceability
- All changes in 3 files only: `js/engine.js`, `js/main.js`, `css/style.css`
- No tests explicitly requested in spec — manual validation via quickstart.md scenarios
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

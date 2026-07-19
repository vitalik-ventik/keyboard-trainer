# Tasks: Адаптивна дуга стрибка

**Input**: Design documents from `specs/012-adaptive-jump-arc/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Manual visual testing in browser (no test framework). Demo mode serves as built-in validator.

**Organization**: Tasks are grouped by user story. All changes are in a single file (`js/engine.js`), so task parallelism is limited to non-overlapping code sections within the same file.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different code sections, no overlap)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All source changes are in `js/engine.js`. No other files modified.

---

## Phase 1: Setup (Constants & Infrastructure)

**Purpose**: Replace physical constants and prepare the `jump()` method for adaptive velocity computation.

**⚠️ CRITICAL**: All user stories depend on this phase. Must complete first.

- [x] T001 Замінити константу `JUMP_VELOCITY` (660) на `MIN_JUMP_VELOCITY = 420` та додати константу `SAFE_MARGIN = 25` у секції фізичних констант в `js/engine.js`
- [x] T002 Змінити сигнатуру методу `jump(perfect)` на `jump(distance, perfect)` та реалізувати обчислення `player.vy = Math.max(GRAVITY * distance / (2 * this.effectiveSpeed), MIN_JUMP_VELOCITY)` в `js/engine.js`

**Checkpoint**: Константи оновлено, `jump()` приймає `distance` і обчислює адаптивну швидкість. Можна переходити до користувацьких історій.

---

## Phase 2: User Story 1 — Адаптивний стрибок під час натискання правильної клавіші (Priority: P1) 🎯 MVP

**Goal**: Гравець натискає правильну літеру — кубик стрибає з висотою, пропорційною відстані до шипа.

**Independent Test**: Запустити рівень у `PLAYING`, натиснути правильну літеру на різних дистанціях до шипа. Висота стрибка візуально різна, кубик приземляється за шипом (див. V1 у quickstart.md).

### Implementation for User Story 1

- [x] T003 [US1] У методі `handleLetter()` в `js/engine.js`: після визначення `gap = spike.x - this.player.x` для успішного влучання (рядки 573–578), обчислити `distance = gap + SPIKE_W / 2 + SAFE_MARGIN` та передати в `this.jump(distance, perfect)` замість `this.jump(perfect)`
- [x] T004 [US1] У методі `handleLetter()` в `js/engine.js`: для випадку збереження в буфер (рядок 569, `correct && !this.player.onGround`), зберегти поточний `gap` разом зі spike для подальшого обчислення `distance` при споживанні буфера, або залишити без змін (оскільки `consumeJumpBuffer` сам обчислить `distance`)

**Checkpoint**: Основний геймплей використовує адаптивну дугу. Можна тестувати User Story 1 незалежно.

---

## Phase 3: User Story 2 — Адаптивний стрибок у демо-режимі (Priority: P2)

**Goal**: Демо-режим автоматично виконує адаптивні стрибки замість фіксованих.

**Independent Test**: Головне меню з демо-режимом — кубик стрибає з різною висотою, без колізій (див. V2 у quickstart.md).

### Implementation for User Story 2

- [x] T005 [US2] У демо-блоці методу `update()` в `js/engine.js` (рядки 654–663): після отримання `gap = target.x - this.player.x`, обчислити `distance = gap + SPIKE_W / 2 + SAFE_MARGIN` та передати в `this.jump(distance, true)` замість `this.jump(true)`

**Checkpoint**: Демо-режим використовує адаптивну дугу. Можна тестувати User Story 2 незалежно.

---

## Phase 4: User Story 3 — Адаптивний стрибок із буфера після приземлення (Priority: P3)

**Goal**: Споживання буфера після приземлення виконує стрибок з адаптивною дугою на основі актуальної відстані.

**Independent Test**: Рівень із частими шипами — натиснути літеру в повітрі, після приземлення кубик стрибає з адаптивною дугою (див. V3 у quickstart.md).

### Implementation for User Story 3

- [x] T006 [US3] У методі `consumeJumpBuffer()` в `js/engine.js` (рядки 485–501): після отримання `gap = spike.x - this.player.x`, обчислити `distance = gap + SPIKE_W / 2 + SAFE_MARGIN` та передати в `this.jump(distance, perfect)` замість `this.jump(perfect)`

**Checkpoint**: Буфер стрибка працює з адаптивною дугою. Можна тестувати User Story 3 незалежно.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Фінальна валідація та перевірка крайових випадків.

- [x] T007 Перевірити, що виклик `this.jump(perfect)` більше ніде не використовується зі старим одним параметром — усі виклики передають `(distance, perfect)` в `js/engine.js`
- [x] T008 Виконати всі сценарії валідації з quickstart.md (V1–V6) у браузері:
  - V1: адаптивний стрибок на різних дистанціях
  - V2: демо-режим у головному меню
  - V3: буфер стрибка після приземлення
  - V4: мінімальний стрибок на швидкому рівні
  - V5: прохідність усіх 31 рівнів у демо-режимі
  - V6: стани MENU/LEVEL_SELECT/SETTINGS без змін

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. BLOCKS all user stories.
- **User Story 1 (Phase 2)**: Depends on Phase 1 completion.
- **User Story 2 (Phase 3)**: Depends on Phase 1 completion. Independent from US1.
- **User Story 3 (Phase 4)**: Depends on Phase 1 completion. Independent from US1/US2.
- **Polish (Phase 5)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 1 (T001, T002). No dependencies on other stories.
- **User Story 2 (P2)**: Depends on Phase 1 (T001, T002). Independent from US1 — different code section.
- **User Story 3 (P3)**: Depends on Phase 1 (T001, T002). Independent from US1/US2 — different code section.

### Within Each User Story

- Phase 1 must complete first (T001, T002 are sequential — same file section)
- User stories can be implemented in any order after Phase 1
- T007 must run after all user story tasks to verify no stale calls remain

### Parallel Opportunities

- After Phase 1: US1 (T003), US2 (T005), and US3 (T006) modify different methods in `js/engine.js` and can be implemented in any order
- T004 is a sub-task of T003 (same method, same edit session)
- T007 and T008 can run in parallel (T007 is code search, T008 is manual testing)

---

## Parallel Example: After Phase 1

```bash
# All user stories can be implemented sequentially (same file, but different methods):
# 1. T003-T004 [US1]: Modify handleLetter() in js/engine.js
# 2. T005 [US2]: Modify update() demo block in js/engine.js
# 3. T006 [US3]: Modify consumeJumpBuffer() in js/engine.js
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002) — constants + jump() signature
2. Complete Phase 2: User Story 1 (T003, T004) — handleLetter() адаптивний стрибок
3. **STOP and VALIDATE**: Test User Story 1 via V1 in quickstart.md
4. Demo if ready — основна механіка працює

### Incremental Delivery

1. Phase 1 (T001, T002) → Foundation ready
2. Add US1 (T003, T004) → Test → MVP!
3. Add US2 (T005) → Test → Demo works
4. Add US3 (T006) → Test → Buffer works
5. Polish (T007, T008) → Full validation → Done

### Single Developer Strategy

Since all changes are in one file (`js/engine.js`), implement in this order:
1. T001 (constants) → T002 (jump signature) → **commit**
2. T003 (handleLetter) → T004 (buffer save in handleLetter) → **commit, test V1**
3. T005 (demo block) → **commit, test V2**
4. T006 (consumeJumpBuffer) → **commit, test V3**
5. T007 (stale call check) → T008 (full validation) → **final commit**

---

## Notes

- [P] tasks modify different code sections within `js/engine.js` — no line overlap, can be done in any order
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable via the scenarios in quickstart.md
- Demo mode serves as automated validator: if demo passes all 31 levels, physics is correct
- Commit after each logical group (Phase 1, each User Story, Polish)
- Stop at any checkpoint to validate story independently
- FR-007 (PLAYING state only) is inherently satisfied because `Engine` class is only instantiated for PLAYING state; menu/demo uses a separate engine instance that is not modified

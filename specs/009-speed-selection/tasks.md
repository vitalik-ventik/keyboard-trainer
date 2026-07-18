# Tasks: Вибір швидкості гри (Slow / Normal / Fast)

**Input**: Design documents from `/specs/009-speed-selection/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Не передбачені — проект не має автоматизованих тестів, валідація через quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- Проект — односторінковий Vanilla JS веб-застосунок
- Корінь репозиторію: `D:\Projects\KeyboardTrainer_v3`
- Зміни в 4 існуючих файлах: `js/engine.js`, `js/main.js`, `index.html`, `css/style.css`

---

## Phase 1: Foundational — SaveManager

**Purpose**: Додати підтримку `speed` у систему збереження.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 Додати поле `speed: "normal"` до `defaultSaveData()` в `js/engine.js`
- [x] T002 Додати валідацію `speed` у `sanitizeSaveData()`: якщо не входить у `{"slow", "normal", "fast"}` — скидати до `"normal"` в `js/engine.js`
- [x] T003 Додати методи `save.setSpeed(value)` та `save.getSpeed()` в `js/engine.js` за аналогією з `setDifficulty`/`getDifficulty`

**Checkpoint**: Foundation ready — speed зберігається, завантажується та валідується.

---

## Phase 2: User Story 1 — Налаштування швидкості в меню (Priority: P1) 🎯 MVP

**Goal**: Гравець бачить три кнопки швидкості в налаштуваннях, може перемикати їх, демо-рівень одразу змінює темп.

**Independent Test**: Відкрити налаштування, натиснути SLOW — кнопка підсвітилась, демо-рівень сповільнився. Натиснути FAST — прискорився. Збереження перевіряється через F5.

### Implementation for User Story 1

- [x] T004 [P] [US1] Додати HTML-розмітку для кнопок швидкості (блок «Швидкість» з трьома кнопками SLOW, NORMAL, FAST) після рядка зони стрибка в `index.html`
- [x] T005 [P] [US1] Додати CSS-стилі для `.speed-btn`, `.active-slow` (блакитний неон), `.active-normal` (зелений неон), `.active-fast` (червоний неон) та `.speed-hint` в `css/style.css`
- [x] T006 [US1] Реалізувати функцію `refreshSpeedButtons()` в `js/main.js`: отримує значення з `save.getSpeed()`, підсвічує активну кнопку, оновлює текст підказки (аналогічно `refreshDifficultyButtons`)
- [x] T007 [US1] Додати обробники подій `click` для btnSpeedSlow/btnSpeedNormal/btnSpeedFast в `js/main.js`, які викликають `save.setSpeed(value)` та `refreshSpeedButtons()`
- [x] T008 [US1] Оновити `setState("SETTINGS")` в `js/main.js` — додати виклик `refreshSpeedButtons()` разом з `refreshDifficultyButtons()` та `refreshHitWindowButtons()`
- [x] T009 [US1] Оновити `createDemoEngine()` в `js/main.js` — передати `save.getSpeed()` п'ятим аргументом конструктора `Engine`

**Checkpoint**: US1 complete — кнопки працюють, демо-рівень реагує на зміну швидкості.

---

## Phase 3: User Story 2 — Гра з обраною швидкістю (Priority: P1)

**Goal**: Рівень запускається з обраною швидкістю — скролінг, інтервали між шипами, обертання пилок і зони влучання відповідають множнику.

**Independent Test**: Обрати SLOW, почати рівень — темп нижчий за стандартний. Обрати FAST — швидший.

### Implementation for User Story 2

- [x] T010 [P] [US2] Додати п'ятий параметр `speed` до конструктора `Engine` в `js/engine.js`: створити карту `SPEED_MULTIPLIERS = { slow: 0.75, normal: 1.0, fast: 1.25 }`, виконати `this.level = { ...LEVELS.find(l => l.id === levelId) }` та `this.level.speed *= SPEED_MULTIPLIERS[speed] ?? 1.0` перед викликом `generateTrack()`
- [x] T011 [US2] Оновити `startLevel()` в `js/main.js` — передати `save.getSpeed()` п'ятим аргументом конструктора `Engine`

**Checkpoint**: US2 complete — швидкість застосовується до ігрового процесу.

---

## Phase 4: Polish & Validation

**Purpose**: Перевірити зворотну сумісність та відповідність конституції.

- [x] T012 Запустити локальний сервер (`start-http.cmd`) та виконати всі 6 сценаріїв із `quickstart.md`
- [x] T013 Перевірити зворотну сумісність: видалити ключ `dfp_save_v1` з localStorage, перезавантажити сторінку — активна кнопка NORMAL
- [x] T014 Перевірити Constitution Check: жодних фреймворків, нових модулів чи зовнішніх залежностей не додано

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — стартує першим, БЛОКУЄ все інше
- **US1 (Phase 2)**: Depends on Foundational — потребує `save.getSpeed()`
- **US2 (Phase 3)**: Depends on Foundational — потребує `save.getSpeed()`
- **Polish (Phase 4)**: Depends on US1 + US2

### User Story Dependencies

- **US1 (P1)**: Може стартувати після Foundational. Не залежить від US2.
- **US2 (P1)**: Може стартувати після Foundational. Не залежить від US1.
- US1 та US2 незалежні — можуть виконуватися паралельно.

### Parallel Opportunities

- T004 та T005 — різні файли (index.html vs style.css) — паралельно
- T010 (engine.js) — незалежний від T004-T009 (main.js, index.html, style.css) — паралельно з усіма задачами US1
- T006, T007, T008, T009 — всі в main.js, але різні функції — виконуються послідовно
- T012-T014 — фінальна перевірка, виконується після всіх імплементацій

---

## Parallel Example: User Story 1 та User Story 2

```bash
# Паралельно: HTML + CSS (різні файли)
Task: "T004 — index.html"
Task: "T005 — css/style.css"

# Після T004+T005: main.js (залежить від обох)
Task: "T006 — refreshSpeedButtons in main.js"

# Паралельно з US1: Engine (інший файл)
Task: "T010 — Engine constructor in js/engine.js"

# Після T010: startLevel wire
Task: "T011 — startLevel in js/main.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (SaveManager)
2. Complete Phase 2: User Story 1 (UI + demo engine)
3. **STOP and VALIDATE**: Можна натискати SLOW/NORMAL/FAST в налаштуваннях, демо-рівень змінює темп
4. Додати Phase 3: User Story 2 (Engine + game integration)

### Incremental Delivery

1. Foundational ready → speed зберігається/завантажується
2. Add US1 → налаштування в меню + демо (MVP!)
3. Add US2 → швидкість впливає на ігровий процес
4. Polish → перевірка всіх сценаріїв

---

## Notes

- [P] tasks = різні файли, без залежностей
- [Story] label maps task to specific user story
- Кожна user story має Independent Test для перевірки
- Всі зміни — в існуючих файлах, нові модулі не створюються
- Зміна швидкості під час PLAYING не впливає на поточний Engine (дизайн ізольований в US2)

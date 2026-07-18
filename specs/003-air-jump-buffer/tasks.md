---

description: "Task list template for feature implementation"
---

# Tasks: Буферизація стрибка при натисканні в повітрі

**Input**: Design documents from `/specs/003-air-jump-buffer/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Формальні тест-фреймворки заборонені Конституцією (нуль npm). Використовуються headless-симуляції Engine у Node (тимчасові .mjs-копії, як у фічі 001) + ручна валідація за `quickstart.md` (V12–V15).

**Organization**: Задачі згруповано за user story. УВАГА: всі зміни — в одному файлі `js/engine.js` (вимога користувача №1), тому всі задачі реалізації строго послідовні.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Можна виконувати паралельно — у цій фічі лише в Polish-фазі
- **[Story]**: До якої user story належить задача (US1, US2, US3)
- Кожна задача містить точний шлях до файлу

## Path Conventions

- ЄДИНИЙ файл змін: `js/engine.js` (клас `Engine`); `main.js`, `keyboard.js`,
  `assets.js`, `index.html`, `css/style.css` — НЕ ЧІПАТИ (plan.md).
- Публічні сигнатури Engine незмінні (contracts/engine-behavior-delta.md).
- Принцип VI Конституції: повний код без заглушок; коментарі українською.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Передумови

- [X] T001 Переконатися, що поточний `js/engine.js` синтаксично валідний і базова headless-симуляція фічі 001 досі проходить (EASY-проходження L1 → won 100%): скопіювати `js/engine.js` у тимчасовий .mjs і прогнати smoke-скрипт у Node; зміни файлів не потрібні

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Життєвий цикл поля буфера — обслуговує УСІ три user stories

**⚠️ CRITICAL**: Без цієї задачі жодна user story не реалізується

- [X] T002 Додати в клас `Engine` у `js/engine.js` поле буфера: у `reset()` ініціалізувати `this.jumpBuffer = null` разом з іншими змінними забігу (вимога користувача №4, FR-041); у `explode()` першим ділом (після guard `!this.player.alive`) встановлювати `this.jumpBuffer = null` (FR-040а; research.md R4); поле внутрішнє — БЕЗ змін публічного API та БЕЗ серіалізації в localStorage

**Checkpoint**: Життєвий цикл поля готовий — можна додавати логіку буферизації

---

## Phase 3: User Story 1 - Натискання в польоті зараховується після приземлення (Priority: P1) 🎯 MVP

**Goal**: Правильне натискання в повітрі буферизується і виконує автостибок у кадрі приземлення

**Independent Test**: Headless: симуляція польоту + натискання правильної літери в повітрі → після приземлення кубик стрибає, шип `cleared`, очки нараховано; браузер — quickstart.md V12

### Implementation for User Story 1

- [X] T003 [US1] Додати в `Engine.handleLetter()` у `js/engine.js` гілку буферизації ПЕРЕД перевіркою `inWindow` (research.md R2): якщо `correct && !this.player.onGround` → `this.jumpBuffer = spike; return;` — для ОБОХ режимів (FR-037); повторне натискання в повітрі природно перезаписує посилання (FR-039); решта гілок (неправильна літера, натискання на землі, demoMode) — байт-у-байт без змін (FR-042, FR-043; contracts/engine-behavior-delta.md, таблиця семантики)
- [X] T004 [US1] Додати в `Engine.update()` у `js/engine.js` перевірку буфера в точці переходу `onGround: false → true` (гілка `this.player.y <= 0` вертикальної фізики, ДО HARD-перевірки пропуску та колізій — research.md R3): якщо `jumpBuffer !== null` — при `jumpBuffer.state !== "ahead"` → скасувати; інакше обчислити `gap = jumpBuffer.x - this.player.x`: при `0 < gap ≤ this.okPx` → `jumpBuffer.state = "cleared"`, нарахувати очки як у ручному стрибку (+10, +5 perfect за фактичним gap: `gap <= this.perfectPx + this.okPx * 0.35`), викликати `this.jump(perfect)` (звук через onJump — FR-038, SC-015), обнулити буфер; при `gap ≤ 0` або `gap > this.okPx` → тихо обнулити буфер (Assumption зі spec)

**Checkpoint**: Ланцюжки шипів проходяться натисканнями в повітрі — MVP готовий

---

## Phase 4: User Story 2 - Чесність режиму HARD (Priority: P2)

**Goal**: Правильне натискання в повітрі на HARD не вибухає; помилки караються як раніше

**Independent Test**: Headless: HARD + правильна літера в повітрі → живий, автостибок після приземлення; HARD + неправильна літера в повітрі → вибух; браузер — quickstart.md V13

### Implementation for User Story 2

- [X] T005 [US2] Верифікувати HARD-семантику в `js/engine.js` headless-симуляцією (тимчасовий .mjs у Node): (а) HARD, кубик у повітрі, правильна літера наступного шипа → `exploded === false`, після приземлення `state === "cleared"` і стрибок виконано (SC-014); (б) HARD, у повітрі неправильна літера → миттєвий вибух; (в) HARD, на землі поза вікном правильна літера → вибух (FR-042, FR-043); за розбіжностей — виправити гілку з T003 так, щоб `return` стояв ДО HARD-гілки `explode()`

**Checkpoint**: HARD справедливий до завчасних правильних натискань

---

## Phase 5: User Story 3 - Буфер ніколи не спрацьовує «невлучно» (Priority: P3)

**Goal**: Скасування буфера при вибуху/пройденому шипі/недосяжності/рестарті — нуль «фантомних» стрибків

**Independent Test**: Headless: сценарії скасування → жодного автостибка; браузер — quickstart.md V14

### Implementation for User Story 3

- [X] T006 [US3] Верифікувати цілісність буфера в `js/engine.js` headless-симуляцією (тимчасовий .mjs у Node) за інваріантами data-model.md §3: (а) буфер + вибух до приземлення → після `reset()` нуль самовільних стрибків (FR-040а, FR-041); (б) буфер на шип, що став `cleared` до приземлення → автостибка немає (FR-040, інваріант 1); (в) буфер, а шип за `okPx` на момент приземлення → тихе скасування, без вибуху в обох режимах; (г) `JSON.stringify` збереження `dfp_save_v1` не містить полів буфера (FR-041); за розбіжностей — виправити T002/T004

**Checkpoint**: Усі три user stories працюють

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Регресія, аудит, фінальна валідація

- [X] T007 [P] Прогнати повну headless-регресію `js/engine.js` у Node (сценарії фічі 001: EASY L1 → won 100%; EASY без вводу → dead від колізії; демо 90 с без вибухів; фіксованість трас L6; без 3 однакових літер) + `node --check` копії як .mjs + аудит: нуль зовнішніх URL/заглушок, коментарі українською, публічні сигнатури Engine незмінні (Конституція I, VI; contracts/engine-behavior-delta.md)
- [ ] T008 Повна ручна валідація у браузері за `specs/003-air-jump-buffer/quickstart.md`: сценарії V12–V15 (щільні ланцюжки L5–L6, HARD-чесність, цілісність буфера, регресія фіч 001–002) з чистою консоллю; виправити знайдені дефекти в `js/engine.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: без залежностей
- **Foundational (Phase 2)**: після T001 — БЛОКУЄ всі stories
- **US1 (Phase 3)**: T003 → T004 (обидві після T002)
- **US2 (Phase 4)**: після T003–T004 (верифікує ту саму гілку коду)
- **US3 (Phase 5)**: після T004 (верифікує точки скасування T002+T004)
- **Polish (Phase N)**: після T006

### User Story Dependencies

- **US1 (P1)**: потребує лише T002 — самодостатній MVP
- **US2 (P2)**: код спільний з US1 (гілка T003) — лише верифікація/корекція
- **US3 (P3)**: код спільний з T002/T004 — лише верифікація/корекція

### Parallel Opportunities

- Відсутні в реалізації: усі задачі правлять/верифікують один файл
  `js/engine.js` — строго послідовно
- Polish: T007 (headless-регресія) паралельно з T008 (браузерна валідація)

---

## Parallel Example: Polish

```bash
# Єдина паралельна пара у фічі:
Task: "Headless-регресія та аудит js/engine.js у Node"
Task: "Ручна валідація V12–V15 у браузері за quickstart.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 (smoke) → T002 (життєвий цикл поля)
2. T003 (буферизація) → T004 (автостибок при приземленні)
3. **STOP і ВАЛІДУВАТИ**: headless-сценарій US1 + quickstart V12
4. MVP: щільні ланцюжки проходяться натисканнями в ритмі

### Incremental Delivery

1. T002 → фундамент (поле є, поведінка ще стара)
2. T003–T004 → US1 → headless + V12
3. T005 → US2 → V13
4. T006 → US3 → V14
5. T007–T008 → повна регресія та V15

---

## Notes

- Обсяг: ~25 рядків в 1 файлі; буфер = посилання на шип (research.md R1)
- Порядок в update() критичний: перевірка буфера ДО HARD-пропуску й колізій
  (research.md R3) — інакше кубик загине в кадрі приземлення
- Headless-тести — тимчасові файли в `C:\Users\opencode\AppData\Local\Temp\opencode`,
  прибрати після прогону

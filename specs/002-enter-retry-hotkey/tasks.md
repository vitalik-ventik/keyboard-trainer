---

description: "Task list template for feature implementation"
---

# Tasks: Гаряча клавіша Enter для швидкого перезапуску рівня

**Input**: Design documents from `/specs/002-enter-retry-hotkey/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Тести НЕ запитані специфікацією і не генеруються (Конституція забороняє npm-пакети). Валідація — ручна за `quickstart.md` (V7–V11).

**Organization**: Задачі згруповано за user story; обидві історії живляться одним фундаментним розширенням keyboard.js.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Можна виконувати паралельно (різні файли, без залежностей) — у цій фічі відсутні: обидва файли правляться послідовно
- **[Story]**: До якої user story належить задача (US1, US2)
- Кожна задача містить точний шлях до файлу

## Path Conventions

- Модифікуються лише наявні `js/keyboard.js` та `js/main.js` у корені
  репозиторію; нові файли не створюються (plan.md, Structure Decision).
- Принцип VI Конституції: кожна функція правиться повністю, без заглушок;
  коментарі українською.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Передумови

- [X] T001 Переконатися, що базова гра (фіча 001) запускається без помилок: `python -m http.server 8080`, відкрити `http://localhost:8080`, дійти до екрана поразки будь-якого рівня (передумова для перевірки задач нижче); зміни файлів не потрібні

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Розширення контракту введення — обслуговує ОБИДВІ user stories

**⚠️ CRITICAL**: Без цієї задачі жодна user story не працює

- [X] T002 Розширити `initKeyboardInput` у `js/keyboard.js` за contracts/keyboard-api-delta.md: нова сигнатура `initKeyboardInput(onLetter, onConfirm)`; у наявному keydown-обробнику перехоплювати `event.code === "Enter"` та `"NumpadEnter"` — `preventDefault()` ЗАВЖДИ за відсутності Ctrl/Alt/Meta (research.md R4, FR-033), при `event.repeat` — вихід без дії (FR-035), при модифікаторах — вихід без preventDefault і без дії (FR-036), інакше викликати `onConfirm()` якщо це функція; виклик з одним аргументом лишається коректним (зворотна сумісність); оновити JSDoc українською

**Checkpoint**: keyboard.js емітить дію `confirm` — можна підключати стани

---

## Phase 3: User Story 1 - Миттєвий повтор рівня після поразки (Priority: P1) 🎯 MVP

**Goal**: Enter на екрані поразки = клік «СПРОБУВАТИ ЩЕ»

**Independent Test**: Програти рівень, натиснути Enter → рівень перезапускається з 0% зі звуком кліку (quickstart.md V7)

### Implementation for User Story 1

- [X] T003 [US1] Передати другий колбек у виклик `initKeyboardInput` у `js/main.js`: усередині колбека `confirm` — якщо `state === "GAMEOVER"`, викликати `btnRetry.click()` (програмний клік гарантує звук кліку через document-делегат та `startLevel(currentLevelId)` — research.md R2, FR-030, FR-032); в усіх інших станах, крім VICTORY (додається у T004), — жодних дій (FR-034)

**Checkpoint**: US1 повністю робоча — Enter перезапускає рівень після поразки

---

## Phase 4: User Story 2 - Миттєвий повтор рівня після перемоги (Priority: P2)

**Goal**: Enter на екрані перемоги = клік «ЩЕ РАЗ» (поточний рівень, не наступний)

**Independent Test**: Пройти рівень на 100%, натиснути Enter → перезапускається той самий рівень (quickstart.md V8)

### Implementation for User Story 2

- [X] T004 [US2] Додати в той самий колбек `confirm` у `js/main.js` гілку: якщо `state === "VICTORY"`, викликати `btnRetryWin.click()` (перезапуск ПОТОЧНОГО рівня, НЕ `btnNext` — FR-031, FR-032)

**Checkpoint**: Обидві user stories працюють

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Верифікація та регресія

- [X] T005 Перевірити синтаксис зміненого коду (`node --check` для копій `js/keyboard.js` і `js/main.js` як .mjs) та провести аудит: нуль зовнішніх URL, нуль заглушок, коментарі українською, поведінка літер ЙЦУКЕН/Space/стрілок незмінна (Конституція I, IV, VI)
- [ ] T006 Повна ручна валідація за `specs/002-enter-retry-hotkey/quickstart.md`: сценарії V7–V11 (Enter/NumpadEnter, утримання, модифікатори, інші стани, фокус кнопок, регресія фічі 001) з чистою консоллю; виправити знайдені дефекти у `js/keyboard.js` / `js/main.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: без залежностей
- **Foundational (Phase 2)**: після Phase 1 — БЛОКУЄ US1 та US2
- **US1 (Phase 3)**: після T002
- **US2 (Phase 4)**: після T003 (той самий колбек у main.js — послідовно)
- **Polish (Phase N)**: після T004

### User Story Dependencies

- **US1 (P1)**: потребує лише T002
- **US2 (P2)**: технічно незалежна від US1 за логікою, але редагує той самий
  колбек у `js/main.js` — виконується після T003 (конфлікт файлу)

### Parallel Opportunities

- Відсутні: T002 → T003 → T004 — ланцюжок по спільних файлах;
  T005 і T006 можна виконувати паралельно (перевірка коду vs браузерна
  валідація)

---

## Parallel Example: Polish

```bash
# Єдина паралельна пара у фічі:
Task: "node --check копій js/keyboard.js та js/main.js + аудит коду"
Task: "Ручна валідація V7–V11 у браузері за quickstart.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 (передумова) → T002 (keyboard.js)
2. T003 (GAMEOVER → Enter)
3. **STOP і ВАЛІДУВАТИ**: quickstart.md V7
4. MVP готовий: найчастіший цикл «поразка → Enter → повтор» працює

### Incremental Delivery

1. T002 → фундамент (Enter блокується всюди, дія ще не підключена)
2. T003 → US1 → перевірити V7
3. T004 → US2 → перевірити V8
4. T005–T006 → V9–V11, регресія, чиста консоль

---

## Notes

- Обсяг: ~30 рядків у 2 файлах; `js/engine.js`, `js/assets.js`,
  `index.html`, `css/style.css` — НЕ чіпати
- Один фізичний Enter → один рестарт: два бар'єри (repeat-фільтр T002 +
  стан-бар'єр T003/T004) — SC-011
- Контракти зафіксовано в `contracts/keyboard-api-delta.md`

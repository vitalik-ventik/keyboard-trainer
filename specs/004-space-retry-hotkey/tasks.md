---

description: "Task list template for feature implementation"
---

# Tasks: Заміна гарячої клавіші перезапуску з Enter на Space

**Input**: Design documents from `/specs/004-space-retry-hotkey/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Тест-фреймворки заборонені Конституцією (нуль npm). Headless-тест keydown-обробника в Node (стаб `window`, як у фічі 002) + ручна валідація за `quickstart.md` (V16–V18).

**Organization**: Одна user story; всі зміни коду — в одному файлі `js/keyboard.js` (plan.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Можна виконувати паралельно — лише в Polish-фазі
- **[Story]**: US1 (єдина story фічі)
- Кожна задача містить точний шлях до файлу

## Path Conventions

- ЄДИНИЙ файл змін: `js/keyboard.js`; `main.js`, `engine.js`, `assets.js`,
  `index.html`, `css/style.css` — НЕ ЧІПАТИ (plan.md, Structure Decision).
- Сигнатура `initKeyboardInput(onLetter, onConfirm)` незмінна
  (contracts/keyboard-api-delta.md).
- Принцип VI Конституції: повний код без заглушок; коментарі українською.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Передумови

- [X] T001 Переконатися, що поточний `js/keyboard.js` синтаксично валідний (`node --check` копії як .mjs) і headless-тест фічі 002 досі проходить (Enter → confirm) — базова лінія перед заміною; зміни файлів не потрібні

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Немає окремих фундаментних задач — фіча складається з однієї атомарної зміни політики клавіш (переходьте до Phase 3)

---

## Phase 3: User Story 1 - Перезапуск рівня Пробілом замість Enter (Priority: P1) 🎯 MVP

**Goal**: Space емітить confirm; Enter/NumpadEnter лише блокуються; модифікатори не перехоплюються

**Independent Test**: Headless: Space → confirm+prevented; Enter/NumpadEnter → prevented БЕЗ confirm; Alt+Space → не перехоплено; браузер — quickstart.md V16–V17

### Implementation for User Story 1

- [X] T002 [US1] Оновити константи наборів клавіш у `js/keyboard.js` за contracts/keyboard-api-delta.md: `CONFIRM_CODES` = `{"Space"}` (research.md R1); `BLOCKED_CODES` = `{"Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab","Enter","NumpadEnter"}` (research.md R2 — Enter лишається заблокованим без дії, FR-045/FR-046); оновити коментарі українською (згадка FR-044)
- [X] T003 [US1] Змінити порядок перевірок у keydown-обробнику `initKeyboardInput` у `js/keyboard.js` (research.md R3): перевірку `event.ctrlKey || event.altKey || event.metaKey → return` перенести НА ПОЧАТОК обробника (до `BLOCKED_CODES`-preventDefault), далі блокування BLOCKED_CODES → гілка confirm (Space: preventDefault вже виконано, фільтр `event.repeat`, виклик `onConfirm`) → літери ЙЦУКЕН; JSDoc оновити (Space замість Enter/NumpadEnter)

**Checkpoint**: Пробіл перезапускає, Enter — ні; main.js отримує нову клавішу без змін

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Верифікація та регресія

- [X] T004 [P] Headless-тест keydown-обробника `js/keyboard.js` у Node (стаб `window.addEventListener`, тимчасовий .mjs): Space → confirm + prevented; Space repeat → prevented БЕЗ confirm; Enter та NumpadEnter → prevented БЕЗ confirm (SC-018); Ctrl+Space і Alt+Space → НЕ prevented, БЕЗ confirm; Shift+Space → prevented (Shift не модифікатор-виняток); літера KeyF → «А» як раніше (FR-048); виклик з одним аргументом не падає; + `node --check`
- [ ] T005 Повна ручна валідація у браузері за `specs/004-space-retry-hotkey/quickstart.md`: сценарії V16–V18 (Пробіл на обох екранах завершення, утримання, Enter/фокус-кнопки, інші стани, регресія літер і буферизації фічі 003) з чистою консоллю; виправити знайдені дефекти у `js/keyboard.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: без залежностей
- **US1 (Phase 3)**: T002 → T003 (той самий файл, послідовно)
- **Polish (Phase N)**: після T003

### User Story Dependencies

- **US1 (P1)**: єдина story — залежить лише від T001

### Parallel Opportunities

- Відсутні в реалізації (один файл)
- Polish: T004 (headless) паралельно з T005 (браузер)

---

## Parallel Example: Polish

```bash
# Єдина паралельна пара у фічі:
Task: "Headless-тест keydown-обробника js/keyboard.js у Node"
Task: "Ручна валідація V16–V18 у браузері за quickstart.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 (базова лінія) → T002 (константи) → T003 (порядок перевірок)
2. **STOP і ВАЛІДУВАТИ**: headless-тест + quickstart V16
3. Фіча однією story — MVP = повний обсяг

### Incremental Delivery

1. T002–T003 → US1 → headless + V16–V17
2. T004–T005 → повна регресія та V18

---

## Notes

- Обсяг: ~10 рядків в 1 файлі; `main.js` не редагується — шов `onConfirm`
  фічі 002 абстрагує вибір клавіші
- Побічний ефект R3 (свідомий): Ctrl/Alt + Стрілки/Tab більше не
  блокуються — безпечно, вони не скролять сторінку; Shift+Space лишається
  заблокованим (Shift не в переліку модифікаторів)
- Headless-тести — тимчасові файли в `C:\Users\opencode\AppData\Local\Temp\opencode`,
  прибрати після прогону

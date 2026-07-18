# Research: Розширені налаштування hit-зони (Normal / Large)

**Created**: 2026-07-18

## 1. Технічний аналіз поточного стану

### Decision: Кодова база вже готова до фічі на 70%

**Rationale**:
- `saveData.settings.hitWindow` уже існує в моделі даних (`defaultSaveData()`, engine.js:314)
- `sanitizeSaveData()` уже валідує `hitWindow` як `"normal"` | `"large"` (engine.js:327-329)
- `save.setHitWindow(size)` і `save.getHitWindow()` повністю реалізовані (engine.js:427-442), включаючи `persist()`
- Відсутнє: (a) UI в модальному вікні, (b) передача `hitWindow` у конструктор `Engine`, (c) застосування множника до `okPx` / `perfectPx`

**Alternatives considered**: Додавати нове поле в схему — відхилено, оскільки схема вже містить `hitWindow`.

---

## 2. Місце застосування множника

### Decision: Застосовувати множник одразу після розрахунку `okPx` / `perfectPx` у конструкторі `Engine`

**Rationale**: Усі точки використання (`handleLetter`, `consumeJumpBuffer`, `renderHitWindow`, демо-режим, HARD-вибух) посилаються на `this.okPx` / `this.perfectPx` безпосередньо. Застосувавши множник один раз у конструкторі, усі ці точки автоматично отримують масштабовані значення без додаткових змін.

**Alternatives considered**:
1. Додавати множник у кожній точці використання — відхилено через дублювання логіки та ризик пропустити якусь точку.
2. Створювати геттери `get okPx()` / `get perfectPx()` — відхилено як надмірне ускладнення для проекту без класів ES6.

**Implementation detail**: У конструкторі `Engine` після рядків, що обчислюють `this.okPx` та `this.perfectPx`, додати перевірку: якщо `hitWindow === "large"`, помножити обидва значення на 2.

---

## 3. Підпис конструктора Engine

### Decision: Додати параметр `hitWindow` до конструктора `Engine(levelId, difficulty, demoMode, hitWindow)`

**Rationale**: Дозволяє передати налаштування без глобального стану. За замовчуванням `hitWindow = "normal"`, що забезпечує зворотну сумісність (демо-режим у `createDemoEngine()` працюватиме без змін, але має отримати актуальне значення).

**Alternatives considered**:
1. Викликати `save.getHitWindow()` всередині `Engine` — відхилено, бо `Engine` не повинен знати про `save` (порушує single responsibility).
2. Зберігати `hitWindow` у глобальній змінній — відхилено, бо створює неявну залежність.

---

## 4. UI-дизайн кнопок NORMAL / LARGE

### Decision: Повторити шаблон кнопок складності (EASY / HARD)

**Rationale**: Узгодженість інтерфейсу. Кнопки EASY/HARD уже мають:
- Парний ряд у `<div class="difficulty-row">`
- CSS-класи `.diff-btn`, `.active-easy`, `.active-hard` з неоновим підсвічуванням
- Функцію `refreshDifficultyButtons()` у `main.js`
- Підпис-підказку `#diffHint`

Новий ряд кнопок отримує:
- Окремий `<div class="difficulty-row">` (перейменовується в `.option-row` для обох рядів)
- CSS-класи `.option-btn` (замість `.diff-btn`), `.active-normal`, `.active-large`
- Окремий підпис `#hitWindowHint`

**Alternatives considered**:
1. Використовувати той самий `<div class="difficulty-row">` для обох рядів — відхилено, кнопки складності та hit-зони логічно різні групи.
2. Додати окремий блок `<select>` — відхилено, суперечить стилістиці Geometry Dash (кнопки-перемикачі).

---

## 5. Кольорова схема для active-large

### Decision: Жовтий/золотий неон для «LARGE», зелений для «NORMAL»

**Rationale**: EASY — зелений, HARD — червоний. Не використовувати ті самі кольори, щоб уникнути плутанини зі складністю. Жовтий неон асоціюється з «підсиленням» / «power-up», що відповідає семантиці «LARGE». «NORMAL» — зелений (стандартний/безпечний).

**Alternatives considered**:
1. Синій/блакитний — конфліктує з ціановим кольором hit-зони «ОК».
2. Білий/сірий — недостатньо контрастний для неонової теми.

---

## 6. Вплив на демо-режим

### Decision: Демо-режим використовує актуальне значення `hitWindow`

**Rationale**: `createDemoEngine()` (main.js:121-123) передає `save.getDifficulty()` — за аналогією має передавати `save.getHitWindow()`. Демо-кубик стрибає у вікні `this.okPx * 0.5`, де `okPx` уже масштабоване — демо-режим автоматично отримує вдвічі ширше вікно при «LARGE», що візуально показує гравцеві різницю навіть на фоні меню.

**Alternatives considered**: Не змінювати демо-режим — відхилено, бо створює неузгодженість: гравець бачить одну поведінку в меню, іншу — в грі.

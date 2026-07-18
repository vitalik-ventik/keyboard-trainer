# Data Model: Розширені налаштування hit-зони (Normal / Large)

**Created**: 2026-07-18

## Зміни в даних

### 1. `saveData.settings.hitWindow` (уже існує — без змін у схемі)

**Джерело**: `engine.js:314` (defaultSaveData), `engine.js:327-329` (sanitizeSaveData)

**Тип**: `"normal"` | `"large"`

**Валідація**: Якщо значення не `"normal"` і не `"large"` — скидається до `"normal"` (уже реалізовано в `sanitizeSaveData`)

**Збереження**: `localStorage["dfp_save_v1"]` → `JSON.stringify(saveData)` (уже реалізовано в `save.persist()`)

**Дефолт**: `"normal"`

### 2. `Engine.hitWindowMult` (нове обчислюване поле, не зберігається)

**Джерело**: Конструктор `Engine`

**Тип**: `1` | `2`

**Виведення**: `hitWindow === "large" ? 2 : 1`

**Використання**: Застосовується до `this.okPx` та `this.perfectPx` одразу після розрахунку:
```
const windows = hitWindowTimes(this.level.id);
this.okPx = this.level.speed * windows.okTime * this.hitWindowMult;
this.perfectPx = this.level.speed * windows.perfectTime * this.hitWindowMult;
```

### 3. Додатковий стан DOM

**Новий елемент**: `<p class="option-hint" id="hitWindowHint">` — підпис-підказка під кнопками NORMAL/LARGE

**Нові CSS-класи**:
- `.option-btn` — базовий стиль кнопки опції (замінює `.diff-btn`)
- `.active-normal` — підсвічування NORMAL (зелений неон)
- `.active-large` — підсвічування LARGE (жовтий/золотий неон)

**Поточне значення в DOM**: Визначається за наявністю класу `active-normal` / `active-large` на кнопках, синхронізується з `save.getHitWindow()` через `refreshHitWindowButtons()`.

### 4. Відсутні зміни в entities

- **OK Zone / Perfect Zone**: Довжини залишаються в `Engine.okPx` / `Engine.perfectPx` — логіка не змінюється, лише множаться на `hitWindowMult`.
- **Spike / Track / Level**: Без змін.
- **Score**: Без змін (бали 10 / 15 залишаються, змінюється лише ширина вікна).

## Діаграма потоку даних

```
[localStorage: dfp_save_v1]
    │
    ▼
[settings.hitWindow: "normal"|"large"]  ◄── save.setHitWindow()
    │                                         (при натисканні кнопки)
    ▼
[save.getHitWindow()]
    │
    ▼
[Engine constructor: hitWindowMult = hitWindow === "large" ? 2 : 1]
    │
    ├─► okPx     = speed * okTime * hitWindowMult
    └─► perfectPx = speed * perfectTime * hitWindowMult
         │
         ├─► handleLetter()        — логіка колізій (inWindow, perfect)
         ├─► consumeJumpBuffer()   — повітряний буфер
         ├─► renderHitWindow()     — візуальний рендеринг
         ├─► demoMode auto-jump    — демо-режим
         └─► HARD miss check       — миттєвий вибух
```

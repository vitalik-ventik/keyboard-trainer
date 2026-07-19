# Implementation Plan: Адаптивна дуга стрибка

**Branch**: `012-adaptive-jump-arc` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-adaptive-jump-arc/spec.md`

## Summary

Заміна фіксованої вертикальної швидкості стрибка (`JUMP_VELOCITY`) на адаптивну дугу, що обчислюється за формулою фізики кинутого тіла: `vy = GRAVITY * distance / (2 * effectiveSpeed)`, де `distance` залежить від поточної відстані між кубиком і шипом. Зміни локалізовані в `js/engine.js` і діють виключно в стані `PLAYING`.

## Technical Context

**Language/Version**: Vanilla JS (ES6 Modules, ES2020+)

**Primary Dependencies**: None — чистий HTML5 Canvas 2D Context, zero npm-пакетів

**Storage**: localStorage (SaveManager); зміни не зачіпають персистентність

**Testing**: Ручне візуальне тестування в браузері (Windows 11); демо-режим як вбудований верифікатор прохідності рівнів

**Target Platform**: Сучасні браузери на Windows 11 (Chrome, Edge, Firefox)

**Project Type**: Односторінковий веб-застосунок (single-page game)

**Performance Goals**: Стабільні 60 FPS ігрового циклу через `requestAnimationFrame`; формула стрибка не додає суттєвих обчислень (одне множення/ділення на кадр)

**Constraints**: Без етапу збірки (відкрити `index.html`), офлайн-сумісний, жодних зовнішніх CDN

**Scale/Scope**: 31 рівень, 4 точки модифікації в одному файлі (`jump()`, `handleLetter()`, `consumeJumpBuffer()`, демо-блок в `update()`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I — Чистий стек: HTML5 Canvas + Vanilla JS ✅
- Зміни виключно в `js/engine.js` (Vanilla JS ES6 Modules). Жодних фреймворків, npm-пакетів чи систем збірки.

### Principle II — Модульна архітектура файлів ✅
- Усі модифікації локалізовані в межах одного файлу `js/engine.js`. Жоден інший модуль не зачіпається. Коментарі українською.

### Principle III — Canvas-рендеринг та процедурна графіка ✅
- Жодних змін у рендерингу. Усі ігрові об'єкти залишаються на Canvas. Фізика стрибка впливає лише на позицію `player.y`.

### Principle IV — Локальні ресурси та стійкість до помилок ✅
- Жодних нових аудіо-файлів чи зовнішніх ресурсів. `localStorage` не зачіпається.

### Principle V — Ігрові стани та механіка введення ЙЦУКЕН ✅
- Нова логіка діє виключно в стані `PLAYING`. Стани `MENU`, `LEVEL_SELECT`, `SETTINGS` незмінні. Українська розкладка не зачіпається.

### Principle VI — Повнота коду без скорочень ✅
- Кожна змінена функція буде переписана повністю. Жодних `// тут додайте логіку` чи часткових фрагментів.

**Gate Result**: PASS — усі принципи дотримано, порушень немає.

## Project Structure

### Documentation (this feature)

```text
specs/012-adaptive-jump-arc/
├── plan.md              # Цей файл
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (не застосовується — внутрішній модуль)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
js/
├── engine.js            # ⬅ ЄДИНИЙ змінений файл
├── main.js              # Не змінюється
├── keyboard.js          # Не змінюється
├── assets.js            # Не змінюється
└── renderer.js          # Не змінюється

index.html               # Не змінюється
css/
└── style.css            # Не змінюється
```

**Structure Decision**: Зміни локалізовані в `js/engine.js`. Усі інші файли залишаються без змін. Це відповідає модульній архітектурі проекту (Принцип II конституції).

## Constitution Check (Post-Design Re-evaluation)

*Re-checked after Phase 1 design artifacts (research.md, data-model.md, quickstart.md).*

### Principle I — Чистий стек ✅ (підтверджено)
- Дизайн не вводить жодних фреймворків, npm-пакетів чи систем збірки. Усі зміни — чистий Vanilla JS у межах існуючого `js/engine.js`.

### Principle II — Модульна архітектура ✅ (підтверджено)
- Зміни локалізовані в 4 методах одного файлу. Жоден новий модуль не створюється. Існуючі модулі не модифікуються.

### Principle III — Canvas-рендеринг ✅ (підтверджено)
- Фізика стрибка не зачіпає рендеринг. Усі ігрові об'єкти залишаються на Canvas.

### Principle IV — Локальні ресурси ✅ (підтверджено)
- Жодних нових ресурсів, аудіо чи зовнішніх посилань.

### Principle V — Ігрові стани ✅ (підтверджено)
- `data-model.md` чітко визначає, що адаптивна логіка діє лише в `Engine` (стан `PLAYING`). Стани `MENU`, `LEVEL_SELECT`, `SETTINGS` використовують окремий демо-рушій, який не змінюється.

### Principle VI — Повнота коду ✅ (підтверджено)
- Кожен метод, що модифікується (`jump()`, `handleLetter()`, `consumeJumpBuffer()`, демо-блок `update()`), буде переписано повністю.

**Post-Design Gate Result**: PASS — усі принципи дотримано після фази дизайну.

## Complexity Tracking

Жодних порушень конституції не виявлено. Таблиця не потрібна.

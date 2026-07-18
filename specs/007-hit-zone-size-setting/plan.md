# Implementation Plan: Розширені налаштування hit-зони (Normal / Large)

**Branch**: `007-hit-zone-size-setting` | **Date**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-hit-zone-size-setting/spec.md`

## Summary

Додати в модальне вікно налаштувань перемикач розміру hit-зони стрибка — «NORMAL» (поточна поведінка, множник 1×) та «LARGE» (подвоєння обох зон — «ОК» та «Ідеально», множник 2×). Множник застосовується до значень `okPx` / `perfectPx` при ініціалізації рівня і впливає як на візуальний рендеринг індикатора, так і на логіку колізій. Налаштування зберігається в localStorage разом з іншими параметрами. Модель даних (`settings.hitWindow`) та методи SaveManager API (`setHitWindow` / `getHitWindow`) уже існують — потрібно лише активувати їх використання в `Engine` і додати UI.

## Technical Context

**Language/Version**: Vanilla JavaScript ES6+ (ES Modules), HTML5, CSS3

**Primary Dependencies**: None (zero external dependencies, per AGENTS.md constraint)

**Storage**: `localStorage` — ключ `dfp_save_v1`, поле `settings.hitWindow` (вже існує в схемі)

**Testing**: Manual testing in browser (перевірка візуального рендерингу на Canvas, DOM-стану кнопок, логіки колізій, persistence через localStorage)

**Target Platform**: Windows 11, будь-який сучасний браузер (Chrome, Edge, Firefox) з підтримкою Canvas 2D

**Project Type**: Single-page web application (SPA) — модульний Vanilla JS з розділенням на `index.html`, `css/style.css`, `js/main.js`, `js/engine.js`, `js/keyboard.js`, `js/assets.js`

**Performance Goals**: 60 FPS (без деградації порівняно з поточною версією), множник застосовується O(1) при старті рівня без додаткових обчислень у ігровому циклі

**Constraints**: Не додавати нових файлів; змінювати лише `index.html`, `css/style.css`, `main.js`, `engine.js`; дотримуватися стилістики темного неонового кіберпанку; коментарі українською

**Scale/Scope**: 15 рівнів, 2 режими складності (EASY/HARD), ~10 рядків HTML + ~20 рядків CSS + ~20 рядків JS змін

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Конституція проекту (AGENTS.md) визначає наступні обмеження — усі виконуються:

| Rule | Status | Verification |
|------|--------|-------------|
| Чистий HTML5 (Canvas) + Vanilla JS (ES6 Modules), без фреймворків | **PASS** | Усі зміни в межах наявних `.html`/`.css`/`.js` файлів, без npm-пакетів |
| Розділення на логічні файли (main.js, engine.js, keyboard.js, assets.js) | **PASS** | Зміни в межах `main.js` (UI), `engine.js` (логіка), без нових файлів |
| Українська мова інтерфейсу та коментарів | **PASS** | Текст кнопок («NORMAL», «LARGE»), підпис-підказка — українською |
| Неонова кіберпанк-стилістика (Geometry Dash) | **PASS** | Стилі кнопок за аналогією з наявними EASY/HARD |
| Збереження виключно в localStorage | **PASS** | Використовує наявний ключ `dfp_save_v1`, схема вже містить `hitWindow` |
| `try/catch` для localStorage | **PASS** | Наявний SaveManager уже реалізує try/catch |

**Gate Result**: PASS — без порушень.

## Project Structure

### Documentation (this feature)

```text
specs/007-hit-zone-size-setting/
├── spec.md              # Feature specification (DONE)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (skip — no external interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
D:\Projects\KeyboardTrainer_v3\
├── index.html           # [+] Додати ряд кнопок NORMAL/LARGE у #settingsModal
├── css/
│   └── style.css        # [+] Додати .active-normal / .active-large стилі
├── js/
│   ├── main.js          # [+] Додати refreshHitWindowButtons(), обробники подій, передати hitWindow у Engine
│   ├── engine.js        # [+] Застосувати множник до okPx / perfectPx у конструкторі Engine
│   ├── keyboard.js      # [ ] Без змін
│   └── assets.js        # [ ] Без змін
```

**Structure Decision**: Однорівневий веб-застосунок (Option 1). Усі зміни зосереджені в 4 файлах, без нових директорій чи файлів.

## Complexity Tracking

> Жодних порушень Constitution Check — секція не застосовується.

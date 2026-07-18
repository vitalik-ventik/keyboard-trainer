# Implementation Plan: Реструктуризація прогресії на 15 рівнів із процедурними фонами та розумною клавіатурною індикацією

**Branch**: `006-15-level-progression` | **Date**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-15-level-progression/spec.md`

## Summary

Комплексна реструктуризація прогресії клавіатурного тренажера: розширення з 6 до 15 рівнів з анатомічною кривою складності (≤2 нові літери за рівень), 15 унікальних процедурних Canvas-фонів, 3 типи векторних перешкод (spike, double_spike, saw), та розумна кольорова індикація віртуальної клавіатури (cyan для пулу, lime/yellow для цілі, red для помилки). Усі зміни виключно в існуючих файлах `js/engine.js`, `js/keyboard.js`, `js/main.js` без додавання нових залежностей.

## Technical Context

**Language/Version**: Vanilla JavaScript ES6+ (ES6 Modules) — без транспіляції, без систем збірки

**Primary Dependencies**: HTML5 Canvas 2D Context, Web Audio API (через `assets.js`), `localStorage`. Жодних npm-пакетів чи CDN.

**Storage**: `localStorage` (ключ `dfp_save_v1`), try/catch на кожну операцію

**Testing**: Ручне тестування в браузері (Chrome/Edge на Windows 11). Автоматизованих тестів немає.

**Target Platform**: Сучасні браузери на Windows 11 (Chrome 90+, Edge 90+, Firefox 90+). Стабільні 60 FPS.

**Project Type**: Односторінковий веб-застосунок (SPA) — локальне відкриття `index.html` або статичний сервер

**Performance Goals**: 60 FPS на всіх 15 рівнях незалежно від складності процедурного фону; відгук на натискання < 16ms

**Constraints**: Офлайн-робота (жодних мережевих запитів у рантаймі); усі аудіо локальні; мова інтерфейсу та коментарів — українська

**Scale/Scope**: 15 рівнів, 33 українські літери, 15 фонових тем, 3 типи перешкод, 4 ігрові стани

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Статус | Обґрунтування |
|---------|--------|---------------|
| I. Чистий стек: HTML5 Canvas + Vanilla JS | ✅ PASS | Жодних фреймворків, npm-пакетів чи CDN не додається. Усі зміни в межах існуючих `.js` файлів. |
| II. Модульна архітектура файлів | ✅ PASS | Зміни обмежені `engine.js` (конфігурація рівнів, фонів, перешкод), `keyboard.js` (індикація клавіш), `main.js` (екран вибору рівнів, підключення wrongKeyError). Нові файли не створюються без необхідності. |
| III. Canvas-рендеринг та процедурна графіка | ✅ PASS | Усі 15 фонів генеруються процедурно через Canvas 2D Context (без зовнішніх зображень). Перешкоди рендеряться векторно. |
| IV. Локальні ресурси та стійкість до помилок | ✅ PASS | localStorage використовується з try/catch (існуючий патерн). Міграція даних безпечна — не втрачає прогрес. Жодних зовнішніх URL. |
| V. Ігрові стани та механіка введення ЙЦУКЕН | ✅ PASS | Стани `MENU, SETTINGS, LEVEL_SELECT, PLAYING, GAMEOVER, VICTORY` зберігаються. EASY/HARD механіка не змінюється. Додається wrongKeyError (in-memory, не стан). |
| VI. Повнота коду без скорочень | ✅ PASS | Код кожної функції/класу буде написаний повністю. Жодних `// TODO` чи `// решта без змін`. |

**Gate Result**: PASS — усі 6 принципів дотримано без порушень. Complexity Tracking не потрібен.

## Project Structure

### Documentation (this feature)

```text
specs/006-15-level-progression/
├── spec.md              # Специфікація функції (вхід)
├── plan.md              # Цей файл (результат /speckit.plan)
├── research.md          # Phase 0: дослідження та архітектурні рішення
├── data-model.md        # Phase 1: модель даних
├── quickstart.md        # Phase 1: посібник валідації
├── contracts/           # Phase 1: контракти інтерфейсів
│   ├── engine-api-delta.md
│   ├── keyboard-api-delta.md
│   └── storage-delta.md
└── tasks.md             # Phase 2 (/speckit.tasks — НЕ створюється зараз)
```

### Source Code (repository root)

```text
index.html               # Точка входу (оновлення: сітка вибору 15 рівнів)
css/style.css             # Стилі DOM-оверлеїв (оновлення: картки 15 рівнів)
js/
├── main.js               # Game loop, State Manager, UI (оновлення: 15 рівнів)
├── engine.js             # LEVELS, Engine, SaveManager (ОСНОВНІ зміни)
├── keyboard.js           # KEYS, drawKeyboard (оновлення: 3 кольори + помилка)
└── assets.js             # Аудіо (БЕЗ змін)
sounds/                   # SFX (БЕЗ змін)
music/                    # Музика (БЕЗ змін)
```

**Structure Decision**: Проект зберігає існуючу структуру. Усі зміни ізольовані в трьох файлах. Нові модулі не створюються, оскільки нова функціональність є розширенням існуючої, а не новою відповідальністю.

## Post-Design Constitution Re-Check

*Перевірка після Phase 1 (data-model.md, contracts/, quickstart.md)*

| Принцип | Статус | Зміни після дизайну |
|---------|--------|---------------------|
| I. Чистий стек | ✅ PASS | 15 методів фону використовують лише Canvas 2D API. Жодних зовнішніх залежностей. |
| II. Модульна архітектура | ✅ PASS | Зміни в 3 файлах: engine.js (конфігурація, фони, перешкоди), keyboard.js (кольори, wrongKeyError), main.js (інтеграція). |
| III. Canvas + процедурна графіка | ✅ PASS | 15 процедурних фонів, векторні перешкоди (3 типи), Canvas-клавіатура. Жодних зображень. |
| IV. Локальні ресурси + try/catch | ✅ PASS | localStorage з try/catch збережено. Міграція безпечна. Аудіо без змін. |
| V. Стани + ЙЦУКЕН | ✅ PASS | Стани не змінюються. EASY/HARD не змінюються. ЙЦУКЕН не змінюється. |
| VI. Повнота коду | ✅ PASS | Кожна функція/метод буде написано повністю. |

**Post-Design Gate Result**: PASS — дизайн не вносить жодних порушень.

## Complexity Tracking

> Жодних порушень конституції не виявлено. Таблиця не заповнюється.

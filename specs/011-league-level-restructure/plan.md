# Implementation Plan: Ліги, гейміфіковані назви рівнів та адаптивний UX карток меню

**Branch**: `011-league-level-restructure` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-league-level-restructure/spec.md`

## Summary

Перепроектування структури рівнів гри на 5 тематичних ліг (Базова — 16, Середня — 8, Складна — 4, Майстер — 2, Бос — 1) із вкладками (табами) в інтерфейсі вибору рівнів. Кожен підрівень отримує унікальну назву та конфігурацію процедурного фону. Картка рівня показує назву рівня та прев'ю активних літер. Ігровий HUD відображає повну інформацію «Ліга: [Назва] | [Номер]: [Назва рівня]». Прогресивне розблокування із збереженням у localStorage.

## Technical Context

**Language/Version**: ES6+ JavaScript (Vanilla, без фреймворків)

**Primary Dependencies**: Немає (чистий ES6 Modules: `main.js`, `engine.js`, `keyboard.js`, `assets.js`)

**Storage**: `localStorage` (ключ `"dfp_save_v1"`, try/catch захист)

**Testing**: Ручне тестування в браузері (Windows 11, сучасні Chrome/Edge/Firefox)

**Target Platform**: Сучасні браузери на Windows 11, Canvas 2D, 60 FPS

**Project Type**: Односторінковий веб-застосунок (HTML5 Canvas + DOM-оверлеї)

**Performance Goals**: Стабільні 60 FPS ігрового циклу, перемикання вкладок миттєве (< 16 мс)

**Constraints**:
- Жодних зовнішніх залежностей, CDN, npm-пакетів
- Аудіо тільки з локальних файлів `sounds/*.wav`, `music/*.mp3`
- Українська мова інтерфейсу та коментарів
- Процедурна графіка без статичних зображень
- ЙЦУКЕН розкладка

**Scale/Scope**: 31 рівень у 5 лігах, ~2000+ рядків коду в js/engine.js, ~500+ рядків CSS, ~500+ рядків main.js

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Принцип | Статус | Обґрунтування |
|---|---------|--------|---------------|
| I | Чистий стек: HTML5 Canvas + Vanilla JS | ✅ PASS | Жодних нових залежностей. Усі зміни в існуючих файлах `js/engine.js`, `js/main.js`, `css/style.css`, `index.html`. |
| II | Модульна архітектура файлів | ✅ PASS | Конфігурація ліг та логіка прогресу залишаються в `js/engine.js`. UI табів та карток — у `js/main.js` + `css/style.css`. Візуальна клавіатура — `js/keyboard.js`. Без нових модулів. |
| III | Canvas-рендеринг та процедурна графіка | ✅ PASS | 31 новий процедурний фон відповідно до тем рівнів (неонові сітки, градієнти, матриця, демон-режим тощо). HUD рендериться на Canvas. |
| IV | Локальні ресурси та стійкість до помилок | ✅ PASS | localStorage із try/catch. Жодних зовнішніх URL для аудіо. |
| V | Ігрові стани та механіка введення ЙЦУКЕН | ✅ PASS | Стани `LEVEL_SELECT` → `PLAYING` → `VICTORY`/`GAMEOVER` залишаються без змін. Механіка введення не змінюється. |
| VI | Повнота коду без скорочень | ✅ PASS | Увесь код буде написано повністю, без заглушок. |

**Gate Result**: ✅ All gates passed. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/011-league-level-restructure/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root) — affected files

```text
index.html               # DOM: league tabs, modified level grid
css/
└── style.css             # CSS: tabs, level card with letters preview
js/
├── main.js               # UI: buildLeagueTabs(), buildLevelCards(), setLevelState()
├── engine.js             # Config: LEVELS_CONFIG (leagues), SaveManager update, HUD update
├── keyboard.js           # No changes (keyboard rendering unchanged)
└── assets.js             # No changes (audio loading unchanged)
```

**Structure Decision**: Збережено існуючу модульну структуру проекту (Option 1: Single project). Усі зміни в межах 4 файлів: `index.html`, `css/style.css`, `js/main.js`, `js/engine.js`. Жодних нових файлів не створюється.

## Constitution Check (Post-Design Re-check)

*GATE: Re-evaluated after Phase 1 design completion.*

| # | Принцип | Статус | Обґрунтування |
|---|---------|--------|---------------|
| I | Чистий стек: HTML5 Canvas + Vanilla JS | ✅ PASS | Жодних нових залежностей. Усі зміни в 4 існуючих файлах. |
| II | Модульна архітектура файлів | ✅ PASS | Розширення існуючих модулів без порушення їхніх обов'язків. `engine.js` — конфігурація + рушій, `main.js` — UI + координація. |
| III | Canvas-рендеринг та процедурна графіка | ✅ PASS | 31 процедурний фон реалізовано через розширення існуючої системи `bgTheme` → функцій рендерингу. |
| IV | Локальні ресурси та стійкість до помилок | ✅ PASS | localStorage із try/catch, санітизація даних при завантаженні. |
| V | Ігрові стани та механіка введення ЙЦУКЕН | ✅ PASS | Стани не змінено. HUD оновлено в межах Canvas. Введення без змін. |
| VI | Повнота коду без скорочень | ✅ PASS | Дизайн передбачає повну реалізацію всіх 31 рівня, усіх фонів, усіх UI-елементів. |

**Gate Result**: ✅ All gates passed post-design.

## Complexity Tracking

> Жодних порушень конституції немає.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

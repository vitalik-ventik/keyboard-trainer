# Implementation Plan: Реєстр скінів гравця (31 рівень)

**Branch**: `016-player-skin-registry` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-player-skin-registry/spec.md`

## Summary

Доповнити конфігурацію `LEVELS_CONFIG` у `js/engine.js` полем `skin` для кожного з 31 підрівня. Реалізувати 31 унікальну функцію Canvas-рендерингу в методі `renderPlayer()`, що диспетчеризуються за `renderType`. Додати відстеження розблокування скінів у `localStorage` та сповіщення на екрані VICTORY. Усі скіни використовують виключно Canvas 2D API, без зовнішніх зображень.

## Technical Context

**Language/Version**: Vanilla JavaScript ES6+ (ES6 Modules)

**Primary Dependencies**: Немає — чистий HTML5 Canvas 2D Context (`CanvasRenderingContext2D`)

**Storage**: `localStorage` (ключ `"dfp_save_v1"`), огорнутий у `try/catch` (існуючий `SaveManager` у `js/engine.js:247-379`)

**Testing**: Ручне візуальне тестування у браузері (Windows 11) — запуск `index.html` через локальний HTTP-сервер

**Target Platform**: Сучасні браузери на Windows 11; 60 FPS стабільно

**Project Type**: Модульний веб-застосунок (HTML5 + Vanilla JS), без етапу збірки

**Performance Goals**: Стабільні 60 FPS; падіння не більше 5% при будь-якому скіні

**Constraints**: Жодних npm-пакетів, жодних зовнішніх CDN, жодних статичних зображень для скінів, лише Canvas 2D API

**Scale/Scope**: 31 унікальний скін, 5 ліг, 1 метод рендерингу (`renderPlayer`) модифікується

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Статус | Коментар |
|----------|--------|----------|
| **I. Чистий стек: HTML5 Canvas + Vanilla JS** | ✅ PASS | Усі зміни в межах `js/engine.js` — жодних фреймворків, npm-пакетів, систем збірки |
| **II. Модульна архітектура файлів** | ✅ PASS | Зміни локалізовано в існуючих файлах (`js/engine.js` для рендерингу + збереження; `js/main.js` для VICTORY-сповіщення); мова коментарів — українська |
| **III. Canvas-рендеринг та процедурна графіка** | ✅ PASS | Усі 31 скін рендеряться виключно через Canvas 2D API (`fillRect`, `strokeRect`, `arc`, `lineTo`, `createLinearGradient`, `createRadialGradient`, `shadowBlur`, `globalAlpha` тощо); жодних DOM-елементів чи зображень |
| **IV. Локальні ресурси та стійкість до помилок** | ✅ PASS | Збереження прогресу скінів через існуючий `SaveManager` із `try/catch`; жодних мережевих запитів |
| **V. Ігрові стани та механіка введення** | ✅ PASS | Сповіщення про розблокування скіна додається в існуючий стан VICTORY; введення не змінюється |
| **VI. Повнота коду без скорочень** | ✅ PASS | Кожна з 31 функції рендерингу буде написана повністю; жодних `// TODO` чи `// решта коду` |

**Результат**: Усі 6 принципів пройдено. Жодних порушень, що потребують Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/016-player-skin-registry/
├── plan.md              # Цей файл
├── research.md          # Phase 0: дизайн-рішення
├── data-model.md        # Phase 1: модель даних скінів
├── quickstart.md        # Phase 1: інструкція з валідації
├── contracts/           # Phase 1: контракти інтерфейсів
│   └── skin-renderer-api.md
└── tasks.md             # Phase 2 (через /speckit.tasks)
```

### Source Code (repository root)

```text
js/
├── engine.js            # Модифікується: LEVELS_CONFIG + skin поле, renderPlayer() + 31 функція рендерингу, SaveManager + unlockedSkins
└── main.js              # Модифікується: handleVictory() + сповіщення про розблокування скіна
```

**Structure Decision**: Зміни зосереджені в `js/engine.js` (основний обсяг — ~800 рядків нових функцій рендерингу) та `js/main.js` (малі зміни — ~15 рядків для VICTORY-сповіщення). Нових файлів не створюється — усе в межах існуючої модульної структури згідно з Принципом II.

## Complexity Tracking

> Жодних порушень конституції немає — таблиця не заповнюється.

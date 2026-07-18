# Implementation Plan: Візуальна індикація вікна стрибка на лінії землі

**Branch**: `005-hit-window-indicator` | **Date**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-hit-window-indicator/spec.md`

## Summary

Додати новий метод рендерингу `renderHitWindow(ctx, W, groundY, anchorX)` до класу `Engine` у `js/engine.js`, який малює на лінії землі горизонтальний індикатор вікна стрибка з двох зон (OK — ціан, Perfect — зелений з пульсацією). Індикатор з'являється лише коли кубик живий і попереду є активний шип (state === "ahead"). Виклик методу додається в `render()` після `renderGround()` і перед `renderSpikes()`. Жодних змін у фізиці, localStorage чи нових полів Engine.

## Technical Context

**Language/Version**: ES6+ (Vanilla JavaScript, ES6 Modules)
**Primary Dependencies**: HTML5 Canvas 2D API (нативний браузерний API, без зовнішніх бібліотек)
**Storage**: N/A (суто візуальна фіча, без персистентності)
**Testing**: Ручна візуальна верифікація в браузері (відкриття `index.html` через локальний сервер)
**Target Platform**: Сучасні браузери (Edge, Chrome, Firefox) на Windows 11
**Project Type**: Браузерна гра (односторінковий веб-застосунок)
**Performance Goals**: Стабільні 60 FPS ігрового циклу, без погіршення порівняно з поточною версією
**Constraints**: Без нових полів Engine, без змін фізики/колізій, тільки Canvas 2D, тільки `js/engine.js`
**Scale/Scope**: Один новий метод `renderHitWindow()` і один рядок виклику в `render()`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Чистий стек (HTML5 Canvas + Vanilla JS) — PASS

Новий метод `renderHitWindow` використовує виключно Canvas 2D API (`fillRect`, `shadowBlur`, `shadowColor`, `globalAlpha`). Жодних фреймворків, npm-пакетів чи систем збірки не додається.

### Principle II: Модульна архітектура файлів — PASS

Усі зміни ізольовані в межах класу `Engine` у `js/engine.js`. Нових файлів не створюється. Коментарі та назви — українською мовою.

### Principle III: Canvas-рендеринг та процедурна графіка — PASS

Індикатор рендериться виключно на Canvas. Жодного DOM-маніпулювання. Стилістика — темний неоновий кіберпанк (ціан `#00f6ff`, зелений `#39ff88`, `shadowBlur`).

### Principle IV: Локальні ресурси та стійкість до помилок — PASS

Фіча не використовує localStorage та не завантажує аудіо. Немає нових точок відмови.

### Principle V: Ігрові стани та механіка введення ЙЦУКЕН — PASS

Індикатор не змінює ігрові стани. Він природно з'являється/зникає залежно від наявності активного шипа та стану кубика. Жодних змін у `handleLetter`, `update` чи обробці `keydown`.

### Principle VI: Повнота коду без скорочень — PASS

Метод `renderHitWindow` буде написаний повністю, без `// TODO` чи `// решта коду без змін`.

**Gate Result**: Усі 6 принципів пройдено. Порушень немає. Complexity Tracking не потрібен.

### Post-Design Re-Check

Після Phase 1 — повторна перевірка не виявила нових порушень. Дизайн залишається в межах принципів I–VI.

## Project Structure

### Documentation (this feature)

```text
specs/005-hit-window-indicator/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (not applicable — skipped)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
js/
└── engine.js            # Клас Engine: новий метод renderHitWindow() + виклик у render()
```

**Structure Decision**: Зміни обмежені одним існуючим файлом `js/engine.js`. Нових модулів чи файлів не створюється. Це відповідає Принципу II (модульна архітектура) — метод логічно належить класу `Engine`, який відповідає за весь ігровий рендеринг.

## Complexity Tracking

> Жодних порушень Constitution Check не виявлено — таблиця не заповнюється.

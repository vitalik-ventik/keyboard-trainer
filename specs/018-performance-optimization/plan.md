# Implementation Plan: Оптимізація продуктивності для слабких ноутбуків

**Branch**: `018-performance-optimization` | **Date**: 2026-07-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/018-performance-optimization/spec.md`

## Summary

Оптимізація Canvas-рендерингу клавіатурного тренажера для стабільних 50-60 FPS на слабких ноутбуках (Intel UHD 620). Основні напрямки: (1) кешування процедурних фонів та візуальної клавіатури через off-screen canvas; (2) заміна ctx.shadowBlur (10-60px) на градієнтні ореоли для скінів, перешкод та фонів; (3) обмеження частинкових систем до 30 частинок із перевикористанням; (4) створення градієнтів один раз (а не кожен кадр); (5) пропуск кадрів при dt > 0.03s; (6) конвертація victory.wav (4.3MB) в MP3. Усі зміни в межах Vanilla JS + ES6 Modules без npm-пакетів.

## Technical Context

**Language/Version**: Vanilla JavaScript ES6+ (ES6 Modules, `<script type="module">`)

**Primary Dependencies**: Жодних (zero npm-пакетів, zero CDN). Web Audio API (вбудований у браузер), Canvas 2D API, localStorage API.

**Storage**: `localStorage` (ключ `dfp_save_v1`), формат JSON. Жодних мережевих запитів.

**Testing**: Ручне тестування у браузері (Chrome DevTools Performance tab, FPS-лічильник). Порівняння скріншотів до/після для візуальної ідентичності. Profiling через `console.profile()` / `performance.mark()`.

**Target Platform**: Windows 11, сучасні браузери (Chrome 120+, Edge 120+, Firefox 128+). Мінімальне GPU: Intel UHD 620 / AMD Vega 3. Роздільна здатність: 1366x768 (пріоритет), Full HD (1920x1080) підтримується.

**Project Type**: browser-single-page-game (односторінковий браузерний застосунок-гра без бекенду)

**Performance Goals**: 50-60 FPS стабільно на Intel UHD 620 для всіх 31 рівнів; час завантаження аудіо ≤ 3 секунди; рендер клавіатури ≤ 1 кадр (16ms); бюджет рендеру на кадр ≤ 16.6ms.

**Constraints**: Відсутність npm-пакетів (Constitution I); лише процедурні фони, жодних статичних зображень (Constitution III); аудіо лише з локальних файлів (Constitution IV); код повністю написаний без скорочень (Constitution VI); зворотна сумісність — візуальний вигляд ідентичний до оптимізації.

**Scale/Scope**: 31 рівень, 31 тема фону, 31 скін гравця, 41 клавіша клавіатури, ~30 частинкових систем, 8 аудіо-файлів, 1924 рядки engine.js, 807 рядків main.js, 75 рядків backgrounds.js, 228 рядків keyboard.js.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Статус | Обґрунтування |
|---------|--------|---------------|
| **I. Чистий стек: HTML5 Canvas + Vanilla JS** | ✅ PASS | Усі зміни в JS-модулях. Жодних npm-пакетів, фреймворків чи систем збірки не додається. |
| **II. Модульна архітектура файлів** | ✅ PASS | Планується новий модуль `js/cache.js` для off-screen canvas-кешування та `FrameController`. Решта змін — модифікації існуючих файлів без порушення їхніх меж відповідальності. |
| **III. Canvas-рендеринг та процедурна графіка** | ✅ PASS | Оптимізація націлена на Canvas-рендеринг. Процедурні фони зберігаються — кеш оновлює існуючі теми без заміни на статичні зображення. DOM-маніпуляції не зачіпаються для ігрових об'єктів. |
| **IV. Локальні ресурси та стійкість до помилок** | ✅ PASS | victory.wav конвертується в MP3 — залишається локальним файлом у `sounds/`. try/catch для аудіо-операцій зберігаються та посилюються. localStorage не зачіпається. |
| **V. Ігрові стани та механіка введення ЙЦУКЕН** | ✅ PASS | Оптимізація не змінює State Manager, обробку keydown, логіку режимів EASY/HARD. Ігровий цикл модифікується лише для пропуску кадрів (не впливає на логіку). |
| **VI. Повнота коду без скорочень** | ✅ PASS | Усі функції будуть написані повністю. Жодних `// тут додайте логіку` чи `// решта коду без змін`. |

**Gate Result**: ✅ PASS — усі 6 принципів дотримано. Жодних порушень не потребує Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/018-performance-optimization/
├── plan.md              # Цей файл
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A — внутрішня оптимізація без зовнішніх інтерфейсів)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
D:\Projects\KeyboardTrainer_v3\
├── index.html             # Без змін
├── css/
│   └── style.css          # Без змін
├── js/
│   ├── main.js            # Модифікація: frame controller, dt skip, keyboard cache usage
│   ├── engine.js          # Модифікація: shadowBlur→gradient, gradient reuse, particle limits
│   ├── keyboard.js        # Модифікація: keyboard cache (off-screen canvas)
│   ├── backgrounds.js     # Модифікація: bg cache (off-screen canvas), gradient reuse, particle limits
│   ├── assets.js          # Модифікація: victory.mp3 замість victory.wav, додаткові try/catch
│   └── cache.js           # НОВИЙ: утиліти для off-screen canvas кешування (BgCache, KbCache)
├── sounds/
│   ├── jump.wav           # Без змін (13 KB)
│   ├── click.wav          # Без змін (176 KB)
│   ├── explode.wav        # Без змін (282 KB)
│   ├── victory.mp3        # НОВИЙ (конвертований з victory.wav, ≤500 KB)
│   └── victory.wav        # ВИДАЛИТИ (4.3 MB → замінено на victory.mp3)
└── music/
    ├── menu.mp3           # Без змін
    ├── game.mp3           # Без змін
    ├── gameover.mp3       # Без змін
    └── win.mp3            # Без змін
```

**Structure Decision**: Додано єдиний новий модуль `js/cache.js` для інкапсуляції логіки off-screen canvas кешування — відповідає Принципу II (модульна архітектура, єдина відповідальність). Решта змін — модифікація існуючих файлів у межах їхньої відповідальності (engine.js — рендер скінів/перешкод, backgrounds.js — фоновий рендер, keyboard.js — клавіатура, main.js — ігровий цикл, assets.js — аудіо).

## Complexity Tracking

> Жодних порушень Конституції не виявлено. Таблиця не заповнюється.

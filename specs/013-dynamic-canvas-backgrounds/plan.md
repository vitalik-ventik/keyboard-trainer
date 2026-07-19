# Implementation Plan: Динамічні багатошарові Canvas-фони

**Branch**: `013-dynamic-canvas-backgrounds` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-dynamic-canvas-backgrounds/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Замінити поточні спрощені фонові ефекти (35 різних тем у switch-case в `engine.js`) на 10 цільових типів складних багатошарових фонів із паралаксом, неоновим світінням та системою часток. Робота зосереджена у файлі `js/engine.js` (методи рендерингу фону), з можливим винесенням фонових рендерерів в окремий модуль `js/backgrounds.js` для дотримання принципу модульної архітектури (Конституція, Принцип II). Усі нові фони генеруються процедурно через Canvas 2D API, без зовнішніх зображень.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES6+), HTML5 Canvas 2D Context

**Primary Dependencies**: Жодних (Vanilla JS, без npm-пакетів, без CDN)

**Storage**: N/A (лише `localStorage` для прогресу, не задіяно в цьому фічі)

**Testing**: Ручне тестування у браузері (Chrome/Firefox Edge на Windows 11). Моніторинг FPS через вбудовані інструменти розробника.

**Target Platform**: Сучасні браузери на Windows 11 (Chrome 120+, Edge 120+, Firefox 120+). HiDPI-сумісність через `devicePixelRatio`.

**Project Type**: Односторінковий ігровий веб-застосунок (single-page game app)

**Performance Goals**: Стабільні 60 FPS при всіх активних фонових ефектах + частках + glow. Бюджет на фоновий рендер: <8ms на кадр (при 16.67ms загальному бюджеті).

**Constraints**: 
- Жодних зовнішніх залежностей (CDN, npm, бібліотеки)
- Тільки Canvas 2D API (без WebGL)
- Повна офлайн-сумісність
- Адаптивність до будь-якої роздільної здатності (1366×768 – 3840×2160)
- Максимум 50 часток, 80 крапель одночасно

**Scale/Scope**: 
- 10 типів фонів (7 спеціалізованих + 3 універсальні)
- ~27 рівнів потребують оновлення bgTheme в LEVELS_CONFIG
- 1 основний файл для змін: `js/engine.js` (~2100 рядків)
- Можливе створення нового модуля `js/backgrounds.js`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Статус | Перевірка |
|---------|--------|-----------|
| **I. Чистий стек: HTML5 Canvas + Vanilla JS** | ✅ PASS | Усі фони рендеряться через Canvas 2D API. Жодних фреймворків, npm-пакетів чи CDN не використовується. |
| **II. Модульна архітектура файлів** | ✅ PASS | Планується винести фонові рендерери в `js/backgrounds.js` (окремий модуль з єдиною відповідальністю). Коментарі українською. |
| **III. Canvas-рендеринг та процедурна графіка** | ✅ PASS | Усі 10 типів фонів генеруються процедурно (математичні формули, без статичних зображень). Стилістика — темний неоновий кіберпанк. |
| **IV. Локальні ресурси та стійкість до помилок** | ✅ PASS | Функція не додає нових зовнішніх ресурсів. Рендеринг не залежить від мережі. `try/catch` для критичних операцій. |
| **V. Ігрові стани та механіка введення ЙЦУКЕН** | ✅ PASS | Фонові ефекти ізольовані від фізики/введення (FR-012). Пауза зупиняє анімацію (FR-015). GAMEOVER коректно очищає стан (FR-016). |
| **VI. Повнота коду без скорочень** | ✅ PASS | Кожен метод рендерингу буде написано повністю. Жодних `// TODO` чи `// решта без змін`. |

**Gate Result**: PASS — можна переходити до Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/013-dynamic-canvas-backgrounds/
├── plan.md              # Цей файл
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (специфікації інтерфейсів модулів)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
js/
├── main.js              # Ігровий цикл, менеджер станів, DOM (зміни: підключення нового модуля)
├── engine.js            # Ігрова логіка, LEVELS_CONFIG, колізії (зміни: оновлення bgTheme, видалення старих методів)
├── backgrounds.js       # [НОВИЙ] Модуль фонових рендерерів (10 типів + система часток)
├── keyboard.js          # Рендер віртуальної клавіатури (без змін)
└── assets.js            # Завантаження аудіо (без змін)

index.html               # Підключення backgrounds.js як модуля (зміни: +1 <script>)
css/
└── style.css            # Стилі (без змін)
```

**Structure Decision**: Обрано модульну структуру з новим файлом `js/backgrounds.js` відповідно до Принципу II (єдина відповідальність). Це розвантажує `engine.js` (~2100 рядків → ~1300 рядків) та спрощує тестування й підтримку фонів незалежно від ігрової логіки.

## Complexity Tracking

> Заповнюється лише при порушеннях Constitution Check. У цьому плані порушень немає.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (немає) | — | — |

---

## Post-Design Constitution Re-Check

*Виконано після Phase 1 (data-model.md, contracts/, quickstart.md).*

| Принцип | Статус | Перевірка |
|---------|--------|-----------|
| **I. Чистий стек** | ✅ PASS | `backgrounds.js` використовує лише Canvas 2D API. Жодних імпортів, бібліотек чи CDN. |
| **II. Модульна архітектура** | ✅ PASS | Новий модуль `js/backgrounds.js` має єдину відповідальність (рендеринг фонів + частки). Контракт задокументовано в `contracts/backgrounds-api.md`. |
| **III. Процедурна графіка** | ✅ PASS | Усі 10 моделей фонів — чиста математика (перспектива, синусоїди, шум, HSL). Жодних зовнішніх зображень. |
| **IV. Локальні ресурси** | ✅ PASS | Нових ресурсів не додається. Фон не залежить від мережі. |
| **V. Ігрові стани** | ✅ PASS | `reset()` викликається при зміні рівня/GAMEOVER. Метод `render()` не має сайд-ефектів на ігрову логіку. |
| **VI. Повнота коду** | ✅ PASS | Кожен із 10 методів рендерингу буде повністю реалізований у `backgrounds.js`. |

**Gate Result**: PASS — дизайн відповідає конституції. Можна переходити до `/speckit.tasks`.

## Generated Artifacts

| Artifact | Path |
|----------|------|
| Implementation Plan | `specs/013-dynamic-canvas-backgrounds/plan.md` |
| Research | `specs/013-dynamic-canvas-backgrounds/research.md` |
| Data Model | `specs/013-dynamic-canvas-backgrounds/data-model.md` |
| Contracts | `specs/013-dynamic-canvas-backgrounds/contracts/backgrounds-api.md` |
| Quickstart | `specs/013-dynamic-canvas-backgrounds/quickstart.md` |

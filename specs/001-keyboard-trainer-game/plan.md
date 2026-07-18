# Implementation Plan: Дитячий клавіатурний тренажер у стилі Geometry Dash

**Branch**: `001-keyboard-trainer-game` | **Date**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-keyboard-trainer-game/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Дитячий ігровий клавіатурний тренажер українською мовою — автентичний клон
Geometry Dash: кубик автоматично рухається трасою, дитина натискає українські
літери (ЙЦУКЕН) точно перед шипами, щоб стрибати. 6 фіксованих рівнів з
прогресією літер, режими EASY/HARD, візуальна Canvas-клавіатура з підсвіткою,
процедурні паралакс-фони, локальне збереження прогресу, повний аудіосупровід.

Технічний підхід: чистий HTML5 Canvas (2D) + Vanilla JS (ES6 Modules) без
жодних залежностей і збірки. Чотири модулі (`main.js` — цикл і State Manager,
`assets.js` — асинхронний AssetLoader на Web Audio API, `engine.js` — фізика,
рівні, частинки, фони, `keyboard.js` — матриця ЙЦУКЕН, рендер клавіатури,
обробка `keydown` за `event.code`). Прогрес — `localStorage` з in-memory
fallback у try/catch.

## Technical Context

**Language/Version**: JavaScript ES2020+ (Vanilla, ES6 Modules), HTML5, CSS3

**Primary Dependencies**: НЕМАЄ (нуль npm-пакетів, нуль CDN — вимога Конституції, Принцип I)

**Storage**: `localStorage` (ключ `dfp_save_v1`, JSON) з in-memory fallback при недоступності

**Testing**: Ручна валідація за `quickstart.md` (сценарії US1–US5); автоматизовані тести не запитані специфікацією і не додаються (заборона npm-пакетів унеможливлює тест-фреймворки)

**Target Platform**: Сучасні браузери на Windows 11 (Edge/Chrome), запуск через локальний статичний сервер (ES6 modules + fetch аудіо не працюють з `file://`)

**Project Type**: Клієнтський статичний веб-застосунок (single page, без бекенда)

**Performance Goals**: Стабільні 60 FPS ігрового циклу; затримка реакції на `keydown` < 50 мс; старт до меню < 5 с

**Constraints**: Повністю офлайн; без етапу збірки; графіка тільки процедурна на Canvas 2D; аудіо тільки локальні `sounds/*.wav`, `music/*.mp3`; UI українською

**Scale/Scope**: 1 локальний гравець; 6 рівнів (15–50+ шипів); 4 JS-модулі + 1 HTML + 1 CSS; 7 ігрових станів

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Вимога | Статус | Обґрунтування |
|---------|--------|--------|---------------|
| I. Чистий стек | Canvas 2D + Vanilla JS, без фреймворків/збірки/npm | ✅ PASS | Нуль залежностей; `<script type="module">` напряму в index.html |
| II. Модульна архітектура | `index.html`, `css/style.css`, `js/{main,assets,engine,keyboard}.js`, ES6-імпорти, українська мова | ✅ PASS | Структура точно збігається з константою (див. Project Structure) |
| III. Canvas-рендеринг | Ігрові об'єкти, клавіатура, процедурні паралакс-фони на Canvas; неоновий кіберпанк; адаптивність | ✅ PASS | DOM лише для модалки налаштувань/оверлеїв меню (дозволено: «стилізація DOM-елементів» — роль UI/UX Engineer); кубик/шипи/фони/клавіатура — 100% Canvas |
| IV. Локальні ресурси | Локальні wav/mp3, `localStorage`, try/catch на storage і аудіо | ✅ PASS | AssetLoader з try/catch на кожен файл; SaveManager з in-memory fallback |
| V. Стани та ЙЦУКЕН | Стани MENU/SETTINGS/LEVEL_SELECT/PLAYING/GAMEOVER/VICTORY + музика за станом; rAF; preventDefault; тільки укр. літери; EASY/HARD | ✅ PASS | State Manager у main.js; +технічний стан LOADING (не суперечить — перелік станів у конституції мінімально обов'язковий, музика LOADING відсутня) |
| VI. Повнота коду | Без заглушок, повний код кожної функції | ✅ PASS | Правило етапу імплементації; фіксується у tasks.md |

**Gate result (pre-Phase 0)**: PASS — порушень немає, Complexity Tracking не потрібен.

**Gate result (post-Phase 1)**: PASS — дизайн (data-model, контракти модулів,
схема storage) не вводить залежностей, DOM-ігрових об'єктів чи зовнішніх URL.

## Project Structure

### Documentation (this feature)

```text
specs/001-keyboard-trainer-game/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── module-api.md    # Публічні API чотирьох ES6-модулів
│   └── storage-schema.md# Схема localStorage (dfp_save_v1)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
index.html          # Розмітка: canvas, DOM-оверлеї (модалка налаштувань), підключення js/main.js як module
css/
└── style.css       # Неонова стилістика, модальні вікна, адаптивність, шрифти
js/
├── main.js         # Точка входу: ігровий цикл (rAF + clamped delta), State Manager, музика за станом, роутинг кліків
├── assets.js       # AssetLoader (Web Audio API): fetch+decode wav/mp3, try/catch на файл, розблокування AudioContext жестом
├── engine.js       # Рівні (6 фіксованих трас), кубик, шипи, колізії, EASY/HARD, частинки, trail, 3 типи паралакс-фонів, прогрес/очки, SaveManager (localStorage)
└── keyboard.js     # Матриця ЙЦУКЕН, мапа event.code→літера, рендер клавіатури на Canvas, підсвітка (група/найближчий шип), keydown з preventDefault
sounds/             # jump.wav, explode.wav, victory.wav, click.wav (наявні)
music/              # menu.mp3, game.mp3, gameover.mp3, win.mp3 (наявні)
```

**Structure Decision**: Єдиний статичний веб-застосунок у корені репозиторію —
структура продиктована Конституцією (Принцип II) і специфікацією користувача
1:1. Жодних папок `src/`, `tests/`, бекенда чи збірки. `main.js` — єдина точка
входу (`<script type="module" src="js/main.js">`), решта модулів підключаються
через ES6 `import`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Порушень немає — таблиця не заповнюється.

# Implementation Plan: Вибір швидкості гри (Slow / Normal / Fast)

**Branch**: `009-speed-selection` | **Date**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-speed-selection/spec.md`

## Summary

Додати до меню налаштувань трирівневий вибір швидкості гри (Slow / Normal / Fast).
Значення зберігається в localStorage і передається в конструктор Engine як п'ятий
параметр. Engine клонує об'єкт рівня та множить `level.speed` на коефіцієнт
(0.75 / 1.0 / 1.25), що пропорційно впливає на скролінг, інтервали між шипами,
обертання пилок і зони влучання.

## Technical Context

**Language/Version**: Vanilla JS (ES6 Modules)

**Primary Dependencies**: Відсутні (чистий HTML5 Canvas + Vanilla JS)

**Storage**: localStorage (ключ `dfp_save_v1`, поле `settings.speed`)

**Testing**: Ручне тестування в браузері — візуальна перевірка темпу демо-рівня
та ігрового процесу. Автоматизованих тестів у проекті немає.

**Target Platform**: Сучасні браузери на Windows 11 (Chrome, Edge, Firefox)

**Project Type**: Односторінковий веб-застосунок (HTML5 Canvas гра)

**Performance Goals**: 60 FPS стабільно; зміна швидкості не має впливати на
продуктивність — множення вже наявного `level.speed` на константу.

**Constraints**: Offline-capable, виключно локальні ресурси, без етапу збірки

**Scale/Scope**: Один користувач, один пристрій

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate I — Чистий стек (HTML5 Canvas + Vanilla JS) — ✅ PASS
Функція не додає жодних фреймворків, npm-пакетів чи систем збірки. Всі зміни
в межах Vanilla JS (ES6 Modules) та CSS.

### Gate II — Модульна архітектура файлів — ✅ PASS
Зміни зачіпають лише існуючі файли (js/engine.js, js/main.js, index.html,
css/style.css). Нових модулів не створюється. Мова інтерфейсу — українська.

### Gate III — Canvas-рендеринг та процедурна графіка — ✅ PASS
Налаштування рендеряться через DOM-модальне вікно (існуючий патерн).
Canvas-логіка гри не змінюється — лише масштабується швидкість через cloned
level.speed.

### Gate IV — Локальні ресурси та стійкість до помилок — ✅ PASS
Збереження через існуючий SaveManager (localStorage). Валідація в
sanitizeSaveData забезпечує зворотну сумісність. Нових аудіо- або
мережевих запитів не додається.

### Gate V — Ігрові стани та механіка введення — ✅ PASS
Швидкість фіксується при створенні Engine (startLevel / createDemoEngine).
Зміна під час PLAYING не впливає на поточний рівень. Стани MENU, SETTINGS,
LEVEL_SELECT використовують демо-двигун з актуальною швидкістю.

### Gate VI — Повнота коду без скорочень — ✅ PASS
Весь код у межах таски буде написаний повністю (без заглушок),
відповідно до принципу чистоти ES6+.

**Висновок**: Усі гейти пройдено. Жодних порушень конституції не виявлено.
Complexity Tracking не потрібен.

## Project Structure

### Documentation (this feature)

```text
specs/009-speed-selection/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

Зміни в чотирьох існуючих файлах:

```text
KeyboardTrainer_v3/
├── index.html            # + новий блок кнопок швидкості в модалці налаштувань
├── css/
│   └── style.css         # + стилі .speed-btn, .active-slow, .active-normal, .active-fast
└── js/
    ├── engine.js          # + SaveManager: setSpeed/getSpeed, sanitizeSpeed
    │                      # + Engine: 5-й параметр speed, clone+multiply level
    └── main.js            # + refreshSpeedButtons(), обробники click, передача speed
```

**Structure Decision**: Зміни вписуються в існуючу модульну структуру без
створення нових файлів або директорій. Це мінімальне втручання в архітектуру.

## Complexity Tracking

> Не потрібен — Constitution Check пройдено без порушень.

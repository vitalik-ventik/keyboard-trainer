# Implementation Plan: Буферизація стрибка при натисканні в повітрі

**Branch**: `003-air-jump-buffer` | **Date**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-air-jump-buffer/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Правильне натискання літери наступного шипа, зроблене в повітрі, більше не
губиться (EASY) і не карається вибухом (HARD): воно зберігається у
внутрішньому буфері класу `Engine` (`js/engine.js`) і виконує стрибок
автоматично у момент переходу `onGround: false → true`, якщо забуферений шип
усе ще попереду та в межах вікна стрибка. Буфер зберігає ПОСИЛАННЯ на
конкретний шип (не літеру), тож ніколи не спрацьовує для вже пройденого шипа;
скасовується при вибуху, приземленні поза досяжністю, перезаписі та в
`reset()`. Зміни строго обмежені класом `Engine` — жодних правок `main.js`,
`keyboard.js`, `assets.js`, `index.html`, `css/` (пряма вимога користувача).

## Technical Context

**Language/Version**: JavaScript ES2020+ (Vanilla, ES6 Modules) — без змін

**Primary Dependencies**: НЕМАЄ (Конституція, Принцип I)

**Storage**: НЕ зачіпається: буфер — runtime-поле Engine, БЕЗ серіалізації в `localStorage` (вимога користувача №4; FR-041)

**Testing**: Headless-симуляція логіки Engine у Node (як у фічі 001) + ручна валідація за `quickstart.md` (V12–V15)

**Target Platform**: Сучасні браузери на Windows 11; поведінка кадрово-детермінована в межах rAF-циклу

**Project Type**: Модифікація одного класу в одному файлі (`js/engine.js`)

**Performance Goals**: Нуль додаткових алокацій на кадр (буфер — одне поле-посилання); автостибок у тому ж кадрі, що й приземлення (SC-015)

**Constraints**: Публічний API Engine незмінний (конструктор, `update`, `render`, `handleLetter`, `getTargetLetter`, `getState`, `getOutcome` — сигнатури без змін); поведінка на землі та demoMode незмінні (FR-042, FR-043)

**Scale/Scope**: 1 файл, ~25 рядків: поле `jumpBuffer`, гілка в `handleLetter`, перевірка при приземленні в `update`, скидання в `explode` і `reset`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Вимога | Статус | Обґрунтування |
|---------|--------|--------|---------------|
| I. Чистий стек | Без фреймворків/npm | ✅ PASS | Зміна одного класу, нуль залежностей |
| II. Модульна архітектура | Логіка гри — в engine.js | ✅ PASS | Буфер — суто ігрова механіка; область змін збігається з відповідальністю модуля (вимога користувача №1 = Принцип II) |
| III. Canvas-рендеринг | — | ✅ PASS | Рендеринг не зачіпається |
| IV. Локальні ресурси | try/catch на storage/аудіо | ✅ PASS | Нових звернень немає; буфер свідомо НЕ серіалізується (FR-041) |
| V. Стани та ЙЦУКЕН | EASY/HARD семантика | ✅ PASS | Уточнення (не порушення) режимів: EASY «ігнорування завчасних» та HARD «помилка → вибух» зберігаються для ПОМИЛКОВИХ літер (FR-042); буферизація стосується лише правильних (спец. 003 як пізніша норма деталізує Конституцію) |
| VI. Повнота коду | Без заглушок | ✅ PASS | Правило етапу імплементації |

**Gate result (pre-Phase 0)**: PASS. **Gate result (post-Phase 1)**: PASS —
дизайн не змінює публічних контрактів і не додає файлів/залежностей.

## Project Structure

### Documentation (this feature)

```text
specs/003-air-jump-buffer/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── engine-behavior-delta.md  # Поведінковий контракт Engine (delta)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
js/
└── engine.js       # ЄДИНИЙ файл змін, клас Engine:
                    #  - reset(): this.jumpBuffer = null
                    #  - handleLetter(): гілка «правильна літера в повітрі» → буфер
                    #  - update(): перевірка буфера при переході onGround false→true
                    #  - explode(): this.jumpBuffer = null
```

**Structure Decision**: Зміни інкапсульовані в класі `Engine` (`js/engine.js`)
— вимога користувача №1. `main.js`, `keyboard.js`, `assets.js`, `index.html`,
`css/style.css` не модифікуються; публічні сигнатури Engine незмінні, тому
контракти фічі 001 (contracts/module-api.md) лишаються чинними без правок.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Порушень немає — таблиця не заповнюється.

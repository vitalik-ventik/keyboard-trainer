# Implementation Plan: Заміна гарячої клавіші перезапуску з Enter на Space

**Branch**: `004-space-retry-hotkey` | **Date**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-space-retry-hotkey/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Гаряча клавіша дії «Спробувати ще» на екранах GAMEOVER/VICTORY змінюється з
Enter/NumpadEnter на Пробіл (повна заміна). Технічний підхід: у
`js/keyboard.js` набір `CONFIRM_CODES` стає `{"Space"}`, а `Enter` і
`NumpadEnter` переносяться до `BLOCKED_CODES` (дефолтна поведінка й далі
блокується — захист від фантомної активації сфокусованих кнопок, спадок
фічі 002); порядок перевірок у keydown-обробнику коригується так, щоб
комбінації з модифікаторами не перехоплювались. `js/main.js` НЕ змінюється:
колбек `onConfirm` і диспетчеризація за станами лишаються тими самими —
семантика клавіші повністю інкапсульована в keyboard.js.

## Technical Context

**Language/Version**: JavaScript ES2020+ (Vanilla, ES6 Modules) — без змін

**Primary Dependencies**: НЕМАЄ (Конституція, Принцип I)

**Storage**: Не зачіпається

**Testing**: Headless-тест keydown-обробника в Node (стаб `window`, як у фічі 002) + ручна валідація за `quickstart.md` (V16–V18)

**Target Platform**: Сучасні браузери на Windows 11

**Project Type**: Модифікація одного модуля (`js/keyboard.js`)

**Performance Goals**: Без змін (SC-010 фічі 002 успадковується: реакція ≤ 100 мс)

**Constraints**: Сигнатура `initKeyboardInput(onLetter, onConfirm)` незмінна; `main.js` не редагується; блокування скролу Пробілом/Стрілками (FR-023) та дефолтного Enter (FR-046) зберігається

**Scale/Scope**: 1 файл, ~10 рядків змін (константи + порядок перевірок)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Вимога | Статус | Обґрунтування |
|---------|--------|--------|---------------|
| I. Чистий стек | Без фреймворків/npm | ✅ PASS | Правка констант і порядку перевірок в одному модулі |
| II. Модульна архітектура | Політика клавіш — у keyboard.js | ✅ PASS | Заміна клавіші повністю інкапсульована в keyboard.js; main.js не змінюється — підтверджує правильність шва, закладеного у фічі 002 |
| III. Canvas-рендеринг | — | ✅ PASS | Не зачіпається |
| IV. Локальні ресурси | — | ✅ PASS | Нових звернень немає |
| V. Стани та ЙЦУКЕН | preventDefault для Пробілу/Стрілок | ✅ PASS | Блокування скролу зберігається (FR-046); дія — лише у GAMEOVER/VICTORY через наявний стан-бар'єр main.js |
| VI. Повнота коду | Без заглушок | ✅ PASS | Правило етапу імплементації |

**Gate result (pre-Phase 0)**: PASS. **Gate result (post-Phase 1)**: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/004-space-retry-hotkey/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── keyboard-api-delta.md  # Оновлення контракту клавіші confirm
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
js/
└── keyboard.js     # ЄДИНИЙ файл змін:
                    #  - CONFIRM_CODES: {"Enter","NumpadEnter"} → {"Space"}
                    #  - BLOCKED_CODES: + "Enter", "NumpadEnter" (лише блокування)
                    #  - порядок перевірок: модифікатори → блокування → confirm → літери
```

**Structure Decision**: Зміна інкапсульована в `js/keyboard.js` — власнику
політики клавіш (Конституція, Принцип II). `js/main.js` не змінюється:
контракт `onConfirm` (фіча 002) абстрагує «яка саме клавіша» від «що робити».
Контракти фіч 001–002 лишаються чинними з одним уточненням набору клавіш
(див. contracts/keyboard-api-delta.md).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Порушень немає — таблиця не заповнюється.

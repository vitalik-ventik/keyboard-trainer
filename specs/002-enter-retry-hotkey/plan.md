# Implementation Plan: Гаряча клавіша Enter для швидкого перезапуску рівня

**Branch**: `002-enter-retry-hotkey` | **Date**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-enter-retry-hotkey/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

На екранах GAMEOVER та VICTORY натискання Enter (або NumpadEnter) виконує дію
«Спробувати ще» / «ЩЕ РАЗ» — перезапуск поточного рівня без миші. Технічний
підхід: `js/keyboard.js` розширюється другим колбеком `onConfirm` у
`initKeyboardInput` (перехоплення `Enter`/`NumpadEnter` за `event.code`,
`preventDefault`, ігнор `repeat` і модифікаторів); `js/main.js` у станах
GAMEOVER/VICTORY транслює подію у програмний клік по наявних кнопках
`#btnRetry`/`#btnRetryWin`, що гарантує 100% еквівалентність кліку (звук
кліку через наявний делегат, `startLevel(currentLevelId)`, музика, скидання
забігу). Зміни в `js/engine.js` не потрібні — перезапуск уже інкапсульований
у `startLevel()` (новий `Engine`).

## Technical Context

**Language/Version**: JavaScript ES2020+ (Vanilla, ES6 Modules) — без змін відносно фічі 001

**Primary Dependencies**: НЕМАЄ (Конституція, Принцип I)

**Storage**: Не зачіпається (перезапуск використовує наявний SaveManager опосередковано)

**Testing**: Ручна валідація за `quickstart.md` цієї фічі + headless-перевірка логіки не потрібна (зміна лише в обробці введення/UI-диспетчеризації)

**Target Platform**: Сучасні браузери на Windows 11 (Edge/Chrome), локальний статичний сервер

**Project Type**: Клієнтський статичний веб-застосунок (модифікація наявних `js/keyboard.js`, `js/main.js`)

**Performance Goals**: Реакція на Enter ≤ 100 мс до старту нового забігу (SC-010)

**Constraints**: Жодних нових файлів чи залежностей; поведінка кнопок мишею незмінна; Enter діє лише у GAMEOVER/VICTORY (FR-034)

**Scale/Scope**: 2 файли змінюються (~30 рядків); 1 новий контрактний колбек

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип | Вимога | Статус | Обґрунтування |
|---------|--------|--------|---------------|
| I. Чистий стек | Без фреймворків/npm | ✅ PASS | Розширення двох наявних модулів, нуль залежностей |
| II. Модульна архітектура | Логіка введення в keyboard.js, стани в main.js | ✅ PASS | Enter перехоплюється в keyboard.js (власник keydown-політики), диспетчеризація за станом — у main.js (власник State Manager) |
| III. Canvas-рендеринг | Без DOM для ігрових об'єктів | ✅ PASS | Рендеринг не змінюється; використовуються наявні DOM-кнопки оверлеїв |
| IV. Локальні ресурси | try/catch, localStorage | ✅ PASS | Нових звернень до storage/аудіо немає; звук кліку — через наявний делегат |
| V. Стани та ЙЦУКЕН | preventDefault, чіткі стани | ✅ PASS | preventDefault для Enter/NumpadEnter (FR-033); дія лише у GAMEOVER/VICTORY (FR-034) |
| VI. Повнота коду | Без заглушок | ✅ PASS | Правило етапу імплементації |

**Gate result (pre-Phase 0)**: PASS. **Gate result (post-Phase 1)**: PASS —
дизайн не вводить нових файлів, залежностей чи порушень.

## Project Structure

### Documentation (this feature)

```text
specs/002-enter-retry-hotkey/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── keyboard-api-delta.md  # Зміна контракту initKeyboardInput
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
js/
├── keyboard.js     # ЗМІНА: initKeyboardInput(onLetter, onConfirm) — перехоплення
│                   # Enter/NumpadEnter, preventDefault, ігнор repeat/модифікаторів
└── main.js         # ЗМІНА: колбек onConfirm — у GAMEOVER → btnRetry.click(),
                    # у VICTORY → btnRetryWin.click(), інакше ігнор
```

**Structure Decision**: Модифікація двох наявних модулів без нових файлів.
`engine.js` не змінюється: перезапуск рівня — це `startLevel()` у main.js
(створення нового `Engine`), і саме він викликається наявними обробниками
кнопок, які ми програмно активуємо (див. research.md R2).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Порушень немає — таблиця не заповнюється.

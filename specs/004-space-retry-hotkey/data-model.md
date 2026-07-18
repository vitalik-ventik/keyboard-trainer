# Data Model: Заміна гарячої клавіші на Space (004-space-retry-hotkey)

**Date**: 2026-07-18 | **Plan**: [plan.md](./plan.md)

Персистентних даних немає. Оновлюється одна runtime-сутність фічі 002.

## 1. ConfirmHotkey (оновлення сутності фічі 002, data-model.md §1)

| Поле | Було (фіча 002) | Стало |
|------|-----------------|-------|
| Фізичні клавіші | `event.code`: `Enter`, `NumpadEnter` | `event.code`: `Space` |
| Подія | `confirm` | `confirm` (без змін) |
| Фільтри | repeat → ігнор; Ctrl/Alt/Meta → ігнор | без змін (FR-047) |
| preventDefault | завжди (без модифікаторів) | без змін (FR-046) |

## 2. BlockedKeys (клавіші лише з блокуванням дефолту)

| Було | Стало |
|------|-------|
| Space, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Tab | + Enter, NumpadEnter (FR-045, FR-046; research.md R2) |

Space одночасно у BlockedKeys (скрол блокується завжди) і в ConfirmHotkey
(дія на екранах завершення).

## 3. Диспетчеризація за станом (без змін, фіча 002 §2)

| Стан | Реакція на `confirm` |
|------|----------------------|
| `GAMEOVER` | клік `#btnRetry` (FR-044) |
| `VICTORY` | клік `#btnRetryWin` (FR-044) |
| решта станів | жодних дій |

## 4. Інваріанти

1. Enter/NumpadEnter ніколи не емітять `confirm` (FR-045, SC-018), але їхня
   дефолтна поведінка блокується (FR-046).
2. Пробіл поза екранами завершення: скрол заблоковано, дій немає (SC-019) —
   стан-бар'єр main.js незмінний.
3. Комбінації Ctrl/Alt/Meta + будь-яка клавіша не перехоплюються взагалі
   (research.md R3).
4. Сигнатура `initKeyboardInput(onLetter, onConfirm)` та поведінка літер
   ЙЦУКЕН — без змін (FR-048).

# Contract: Оновлення клавіші confirm у js/keyboard.js (delta до фічі 002)

**Feature**: 004-space-retry-hotkey | **Date**: 2026-07-18

## Що змінюється

Контракт `contracts/keyboard-api-delta.md` фічі 002 лишається чинним, окрім
набору фізичних клавіш дії confirm:

| Аспект | Фіча 002 | Фіча 004 |
|--------|----------|----------|
| Клавіші confirm | `Enter`, `NumpadEnter` | `Space` |
| Enter/NumpadEnter | confirm + preventDefault | ЛИШЕ preventDefault (без дії) |
| Space | лише preventDefault (блок скролу) | preventDefault + confirm |

## Сигнатура (без змін)

```js
/**
 * @param {(letter:string) => void} onLetter
 * @param {() => void} [onConfirm] — дія підтвердження: Space,
 *   без Ctrl/Alt/Meta, без автоповтору (repeat)
 */
export function initKeyboardInput(onLetter, onConfirm);
```

## Гарантії keyboard.js (оновлені)

1. `onConfirm` емітиться ЛИШЕ для `event.code === "Space"` без модифікаторів
   і без repeat; щонайбільше один виклик на фізичне натискання (FR-044,
   FR-047).
2. `Enter`/`NumpadEnter`: `preventDefault()` виконується (захист від
   фантомної активації сфокусованих кнопок — спадок R4 фічі 002), `onConfirm`
   НЕ викликається (FR-045, FR-046).
3. `Space`: `preventDefault()` виконується завжди без модифікаторів
   (блок скролу — FR-023/FR-046), у т.ч. поза екранами завершення.
4. Порядок перевірок обробника: модифікатори (вихід без перехоплення) →
   BLOCKED_CODES (preventDefault) → confirm (Space) → літери ЙЦУКЕН
   (research.md R3). Наслідок: Ctrl/Alt/Meta + будь-що — не перехоплюється.
5. `KEYS`, `CODE_TO_LETTER`, `drawKeyboard`, поведінка літер — без змін
   (FR-048).

## Зобов'язання js/main.js

БЕЗ ЗМІН — файл не редагується. Наявний колбек confirm
(GAMEOVER → `btnRetry.click()`, VICTORY → `btnRetryWin.click()`, інші
стани — нічого) автоматично отримує нову клавішу.

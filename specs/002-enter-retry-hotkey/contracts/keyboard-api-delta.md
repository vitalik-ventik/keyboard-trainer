# Contract: Зміна API js/keyboard.js (delta до contracts фічі 001)

**Feature**: 002-enter-retry-hotkey | **Date**: 2026-07-18

## initKeyboardInput — нова сигнатура

```js
/**
 * Вішає keydown/keyup на window.
 * - preventDefault для Space/стрілок/Tab, ігрових літер
 *   та Enter/NumpadEnter (без модифікаторів) — FR-023, FR-033
 * - розкладко- та регістро-незалежно (event.code)
 * @param {(letter:string) => void} onLetter — колбек з українською літерою
 * @param {() => void} [onConfirm] — колбек дії підтвердження:
 *   Enter або NumpadEnter, без Ctrl/Alt/Meta, без автоповтору (repeat).
 *   Необов'язковий: за відсутності Enter лише блокується (preventDefault).
 */
export function initKeyboardInput(onLetter, onConfirm);
```

**Зворотна сумісність**: виклик з одним аргументом (як у фічі 001) лишається
коректним — Enter блокується, але не емітить дій.

**Гарантії keyboard.js**:

1. `onConfirm` викликається щонайбільше один раз на фізичне натискання
   (фільтр `event.repeat`).
2. `onConfirm` НЕ викликається при затиснутих Ctrl/Alt/Meta.
3. `preventDefault()` для Enter/NumpadEnter виконується незалежно від того,
   чи передано `onConfirm` (усунення «фантомної» активації сфокусованих
   кнопок — research.md R4).
4. Решта контракту `initKeyboardInput`, `KEYS`, `CODE_TO_LETTER`,
   `drawKeyboard` — без змін (contracts/module-api.md фічі 001).

## Зобов'язання js/main.js (споживач)

```js
initKeyboardInput(
  (letter) => { /* як у фічі 001: PLAYING → gameEngine.handleLetter */ },
  () => {
    // Дія confirm — ЛИШЕ у станах завершення (FR-034):
    //   GAMEOVER → btnRetry.click()      (FR-030)
    //   VICTORY  → btnRetryWin.click()   (FR-031)
    // Інші стани: жодних дій.
  }
);
```

- Програмний `element.click()` — єдиний шлях виконання дії: гарантує
  еквівалентність кліку мишею (звук кліку через document-делегат +
  `startLevel(currentLevelId)`) — FR-032, research.md R2.
- `js/engine.js` та `js/assets.js` — без змін.

## DOM-контракт

Без змін: використовуються наявні `#btnRetry` (GAMEOVER) і `#btnRetryWin`
(VICTORY) з index.html фічі 001.

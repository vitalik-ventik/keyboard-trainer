# Контракти API: Зміни в інтерфейсах Keyboard

**Created**: 2026-07-18
**Feature**: 006-15-level-progression

## 1. drawKeyboard() — новий параметр wrongKeyError

```js
/**
 * Малює візуальну клавіатуру ЙЦУКЕН на Canvas.
 *
 * Підсвітка (у порядку пріоритету):
 *  1. wrongKeyError.letter — яскраво-червоний (помилка)
 *  2. targetLetter — яскравий зелено-жовтий (найближча ціль)
 *  3. groupLetters — м'який неоново-блакитний (пул рівня)
 *  4. Усе інше — тьмяно-сірий (недоступно)
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x:number, y:number, w:number, h:number}} area
 * @param {string[]} groupLetters — літери пулу рівня (cyan)
 * @param {string|null} targetLetter — літера найближчої цілі (lime/yellow)
 * @param {{letter: string|null, timestamp: number}} wrongKeyError — стан помилки (red)
 * @param {number} time — секунди від старту застосунку
 */
export function drawKeyboard(ctx, area, groupLetters, targetLetter, wrongKeyError, time) { ... }
```

**Зміни відносно поточної версії**:
- Новий параметр: `wrongKeyError` (5-й аргумент, перед `time`)
- Кольори змінено:
  - **Було**: groupLetters → тьмяно-зелений (`#39ff88`), targetLetter → блимання червоний/жовтий
  - **Стало**: groupLetters → неоново-блакитний/cyan (`#00f6ff`), targetLetter → зелено-жовтий/lime-yellow (`#bfff00`), wrongKeyError → яскраво-червоний (`#ff2222`)
- Пріоритет: якщо літера одночасно в `wrongKeyError` і `groupLetters` — червоний; якщо в `targetLetter` і `groupLetters` — жовто-зелений
- Червоне підсвічування автоматично згасає через 350 мс (перевірка `time*1000 - wrongKeyError.timestamp`)

## 2. Константи кольорів

```js
const COLORS = {
    DEFAULT_FILL: "rgba(16, 20, 43, 0.9)",
    DEFAULT_STROKE: "rgba(70, 80, 120, 0.7)",
    DEFAULT_TEXT: "#5d6580",                         // тьмяно-сірий

    GROUP_FILL: "rgba(8, 32, 50, 0.9)",
    GROUP_STROKE: "rgba(0, 246, 255, 0.5)",           // cyan
    GROUP_TEXT: "rgba(0, 246, 255, 0.8)",
    GROUP_GLOW: "rgba(0, 246, 255, 0.3)",

    TARGET_FILL: "rgba(20, 38, 10, 0.95)",
    TARGET_STROKE: "rgb(191, 255, 0)",                 // lime-yellow
    TARGET_TEXT: "rgb(191, 255, 0)",
    TARGET_GLOW: "rgba(191, 255, 0, 0.7)",

    ERROR_FILL: "rgba(50, 10, 10, 0.95)",
    ERROR_STROKE: "rgb(255, 34, 34)",                  // bright red
    ERROR_TEXT: "rgb(255, 34, 34)",
    ERROR_GLOW: "rgba(255, 34, 34, 0.8)"
};
```

## 3. Інтеграція wrongKeyError в main.js

`main.js` відповідає за зв'язування `Engine.handleLetter()` з `KeyboardState.wrongKeyError`:

```js
// У main.js:
let wrongKeyError = { letter: null, timestamp: 0 };

initKeyboardInput(
    function (letter) {
        if (state === "PLAYING" && gameEngine) {
            // Скидання попередньої помилки при будь-якому натисканні
            wrongKeyError.letter = null;

            const outcome = gameEngine.handleLetter(letter);
            if (outcome.result === "wrong") {
                wrongKeyError = { letter: letter, timestamp: performance.now() };
            }
        }
    },
    function () { /* confirm handler без змін */ }
);

// У ігровому циклі (frame), при state === "PLAYING":
// Автоматичне згасання через 350ms
if (wrongKeyError.letter !== null && (performance.now() - wrongKeyError.timestamp) > 350) {
    wrongKeyError.letter = null;
}

drawKeyboard(ctx, keyboardArea,
    gameEngine.level.letters,
    gameEngine.getTargetLetter(),
    wrongKeyError,
    time
);
```

## 4. Матриця KEYS — без змін

Матриця `KEYS` (33 літери) **не змінюється**. Усі літери вже присутні в ній. Рівень 15 використовує повний набір.

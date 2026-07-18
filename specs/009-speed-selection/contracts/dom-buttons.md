# Contract: DOM Buttons (Speed UI)

## HTML-структура (index.html)

Новий блок вставляється після рядка «Розмір зони стрибка»:

```html
<p class="modal-caption">Швидкість</p>
<div class="speed-row">
    <button id="btnSlow" class="speed-btn" type="button">SLOW</button>
    <button id="btnNormal" class="speed-btn" type="button">NORMAL</button>
    <button id="btnFast" class="speed-btn" type="button">FAST</button>
</div>
<p class="speed-hint" id="speedHint">NORMAL: стандартна швидкість</p>
```

## CSS-класи (style.css)

| Клас | Стиль |
|------|-------|
| `.speed-btn` | Базовий стиль (темний фон, тьмяний текст, рамка) — аналог `.diff-btn` / `.option-btn` |
| `.active-slow` | Блакитний неон (box-shadow, border, color) |
| `.active-normal` | Зелений неон |
| `.active-fast` | Червоний/рожевий неон |

## JavaScript-функції (main.js)

### `refreshSpeedButtons()`

```js
const SPEED_HINTS = {
    slow: "SLOW: швидкість зменшена на 25% — більше часу на реакцію",
    normal: "NORMAL: стандартна швидкість рівня",
    fast: "FAST: швидкість збільшена на 25% — для досвідчених гравців"
};

function refreshSpeedButtons() {
    const speed = save.getSpeed();
    btnSlow.classList.toggle("active-slow", speed === "slow");
    btnNormal.classList.toggle("active-normal", speed === "normal");
    btnFast.classList.toggle("active-fast", speed === "fast");
    speedHintEl.textContent = SPEED_HINTS[speed] || SPEED_HINTS.normal;
}
```

### Event handlers

```js
btnSlow.addEventListener("click", function () {
    save.setSpeed("slow");
    refreshSpeedButtons();
    // demo engine is recreated via setState(SETTINGS) → gameLoop
});
btnNormal.addEventListener("click", function () {
    save.setSpeed("normal");
    refreshSpeedButtons();
});
btnFast.addEventListener("click", function () {
    save.setSpeed("fast");
    refreshSpeedButtons();
});
```

### Де викликається

- При відкритті налаштувань: `setState("SETTINGS")` → `refreshSpeedButtons()`
  (разом з `refreshDifficultyButtons()`, `refreshHitWindowButtons()`)

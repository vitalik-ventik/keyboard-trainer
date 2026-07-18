# Контракти API: Зміни в інтерфейсах Engine

**Created**: 2026-07-18
**Feature**: 006-15-level-progression

## 1. Engine Constructor

```js
/**
 * @param {number} levelId — 1..15 (було 1..6)
 * @param {"EASY"|"HARD"} difficulty
 * @param {boolean} demoMode
 */
constructor(levelId, difficulty, demoMode) { ... }
```

**Зміни**: рівень знаходиться в розширеному масиві `LEVELS` (15 елементів). Незнайдений `levelId` → fallback на `LEVELS[0]`.

## 2. Engine.generateTrack(level)

```js
function generateTrack(level) { ... }
```

**Зміни**:
- Перешкоди отримують поле `type: "spike" | "double_spike" | "saw"`
- Додано обмеження: не більше 2 `"saw"` поспіль
- Додано поле `rotationAngle: 0` для пил

## 3. Engine.renderBackground(ctx, W, H, groundY, time)

```js
renderBackground(ctx, W, H, groundY, time) {
    const theme = this.level.bgTheme;
    switch (theme) {
        case "deep_grid":     this.renderDeepGrid(ctx, W, H, groundY, time); break;
        case "city_night":    this.renderCityNight(ctx, W, H, groundY, time); break;
        case "synthwave":     this.renderSynthwave(ctx, W, H, groundY, time); break;
        case "equalizer":     this.renderEqualizer(ctx, W, H, groundY, time); break;
        case "pulse_grid":    this.renderPulseGrid(ctx, W, H, groundY, time); break;
        case "matrix":        this.renderMatrix(ctx, W, H, groundY, time); break;
        case "speed_lines":   this.renderSpeedLines(ctx, W, H, groundY, time); break;
        case "geometry":      this.renderGeometry(ctx, W, H, groundY, time); break;
        case "stalactites":   this.renderStalactites(ctx, W, H, groundY, time); break;
        case "light_pulse":   this.renderLightPulse(ctx, W, H, groundY, time); break;
        case "tunnel":        this.renderTunnel(ctx, W, H, groundY, time); break;
        case "rain":          this.renderRain(ctx, W, H, groundY, time); break;
        case "pulse_ripples": this.renderPulseRipples(ctx, W, H, groundY, time); break;
        case "flame":         this.renderFlame(ctx, W, H, groundY, time); break;
        case "demon":         this.renderDemon(ctx, W, H, groundY, time); break;
        default:              this.renderDeepGrid(ctx, W, H, groundY, time);
    }
}
```

**Видалено**: Старий `if/else` на 3 теми (`grid`, `city`, `boss`). Старі методи `renderGridBackground`, `renderCityBackground`, `renderBossBackground` **видаляються**. `renderCityLayer` зберігається як утиліта для `renderCityNight`.

## 4. Engine.renderSpikes → Engine.renderObstacles(ctx, W, groundY, anchorX, camX)

```js
renderObstacles(ctx, W, groundY, anchorX, camX) { ... }
```

**Зміни**:
- Перейменовано з `renderSpikes` на `renderObstacles`
- Всередині: switch за `spike.type`:
  - `"spike"` → існуюча логіка трикутника
  - `"double_spike"` → два трикутники зі зміщенням ±(SPIKE_W * 0.45)
  - `"saw"` → `drawSaw(ctx, x, y, radius, rotationAngle, color)`

## 5. Engine.handleLetter(letter) → розширене значення повернення

```js
/**
 * @param {string} letter
 * @returns {{result: "correct"|"wrong"|"ignored"|"exploded"|"no_target", letter: string}}
 */
handleLetter(letter) { ... }
```

**Зміни**: Метод повертає об'єкт із результатом для інтеграції з `wrongKeyError` у `main.js`.

## 6. Engine.getObstacleType() — новий метод

```js
/**
 * Повертає тип найближчої перешкоди (для рендерингу).
 * @returns {"spike"|"double_spike"|"saw"|null}
 */
getObstacleType() {
    const spike = this.nearestAheadSpike();
    return spike ? spike.type : null;
}
```

## 7. SaveManager.recordResult(levelId, pct, score) — розширений діапазон

```js
/**
 * @param {number} levelId — 1..15 (було 1..6)
 */
recordResult(levelId, pct, score) { ... }
```

**Зміни**:
- `levelId < 6` → `levelId < 15` (розблокування до Рівня 15)
- `unlocked` клампиться в `[1, 15]`

## 8. SaveManager.sanitizeSaveData(raw) — розширена міграція

```js
function sanitizeSaveData(raw) { ... }
```

**Зміни**:
- Цикл `for (const level of LEVELS)` тепер ітерує 15 рівнів
- `Math.min(6, ...)` → `Math.min(15, ...)`
- Відсутні записи для рівнів 7–15 створюються з `{ bestPct: 0, highScore: 0 }`

## 9. reactionTimeForLevel(levelId) — розширена формула

```js
function reactionTimeForLevel(levelId) {
    const t = (levelId - 1) / 14;  // було / 5
    return 1.2 - 0.7 * t;          // було 1.1 - 0.6 * t
}
```

**Зміни**: Діапазон часу реакції: від 1.2 с (Рівень 1) до 0.5 с (Рівень 15). Розширено для плавної прогресії через 15 рівнів.

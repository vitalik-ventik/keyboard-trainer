# Contract: Scoring API

**Feature**: 017-score-achievement-ui
**Module**: `js/engine.js`
**Type**: Internal function contract

---

## Function: `calculateHitScore(isOkZone, config)`

Окрема чиста функція для обчислення балів за одне натискання.

### Signature

```js
/**
 * Обчислює бали за одне влучання в зону таймінгу.
 *
 * @param {boolean} isOkZone - true якщо влучання в зону OK, false для іншої зони
 * @param {object} config - Конфігураційні бонуси
 * @param {string} config.difficulty - "EASY" | "HARD"
 * @param {string} config.hitWindow - "normal" | "large"
 * @param {string} config.speed - "slow" | "normal" | "fast"
 * @returns {number} Ціле число балів (≥ 0)
 */
function calculateHitScore(isOkZone, config)
```

### Behavior

| Вхід | Результат |
|------|-----------|
| `isOkZone=true, EASY/normal/normal` | `100 + 0 + 20 + 0 = 120` |
| `isOkZone=true, HARD/normal/fast` | `100 + 50 + 20 + 40 = 210` |
| `isOkZone=false, EASY/large/slow` | `80 + 0 + 0 + (−20) = 60` |
| `isOkZone=false, HARD/large/slow` | `80 + 50 + 0 + (−20) = 110` |
| `isOkZone=false, EASY/large/normal` | `80 + 0 + 0 + 0 = 80` |
| `isOkZone=true, EASY/normal/slow` | `Math.max(0, 100 + 0 + 20 + (−20)) = 100` |

**Гарантія**: Результат завжди `Math.max(0, ...)`, від'ємні значення неможливі.

### Integration Points

| Викликається з | Рядок (engine.js) | Контекст |
|----------------|-------------------|----------|
| `Engine.handleLetter()` | ~1229 | Натискання клавіші під час гри |
| `Engine.consumeJumpBuffer()` | ~1161 | Споживання буфера стрибка |

### Required Config Source

Конфігурація формується з полів екземпляра `Engine`:
- `this.difficulty` → `config.difficulty`
- `this.hitWindow` (обчислюється з `this.okPx` / `this.perfectPx`) → `config.hitWindow`
- `this.speed` (обчислюється з `this.effectiveSpeed`) → `config.speed`

**Примітка**: Поля `hitWindow` та `speed` потрібно зберігати в екземплярі Engine окремо від похідних значень (`okPx`, `effectiveSpeed`), щоб мати оригінальні рядкові значення для конфігурації балів.

---

## Function: `calculateMaxScores(spikeCount, hitWindow, speed)`

Обчислює теоретичні максимуми балів для рівня.

### Signature

```js
/**
 * Обчислює maxEasy та maxHard для рівня при заданій конфігурації.
 * Припускає, що ВСІ spikeCount натискань влучають у зону OK.
 *
 * @param {number} spikeCount - Кількість перешкод (натискань) на рівні
 * @param {string} hitWindow - "normal" | "large"
 * @param {string} speed - "slow" | "normal" | "fast"
 * @returns {{ maxEasy: number, maxHard: number }}
 */
function calculateMaxScores(spikeCount, hitWindow, speed)
```

### Behavior

```
zoneBonus = hitWindow === "normal" ? 20 : 0
speedBonus = speed === "fast" ? 40 : speed === "slow" ? -20 : 0

maxEasy = spikeCount * (100 + 0 + zoneBonus + speedBonus)
maxHard = spikeCount * (100 + 50 + zoneBonus + speedBonus)
```

**Приклад**: `spikeCount=26, hitWindow="normal", speed="fast"`
```
zoneBonus = 20, speedBonus = 40
maxEasy = 26 × (100 + 0 + 20 + 40) = 26 × 160 = 4160
maxHard = 26 × (100 + 50 + 20 + 40) = 26 × 210 = 5460
```

### Integration Point

Викликається в конструкторі `Engine` (після рядка ~1079) для встановлення `this.maxEasy` та `this.maxHard`.

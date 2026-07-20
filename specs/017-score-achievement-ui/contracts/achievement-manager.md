# Contract: Achievement Manager

**Feature**: 017-score-achievement-ui
**Module**: `js/engine.js` (SaveManager extension)
**Type**: localStorage data contract

---

## SaveManager Method: `recordResult(levelId, pct, score)`

Розширення існуючого методу (рядок 910) для перевірки та збереження досягнень.

### Modified Signature

```js
/**
 * Записує результат проходження рівня та перевіряє досягнення.
 *
 * @param {number} levelId - ID рівня
 * @param {number} pct - Відсоток проходження (0-100)
 * @param {number} score - Фінальний рахунок
 * @param {object} options - Додаткові параметри
 * @param {number} options.maxEasy - Теоретичний максимум для EASY
 * @param {number} options.maxHard - Теоретичний максимум для HARD
 * @param {string} options.difficulty - "EASY" | "HARD" (режим, у якому грали)
 * @returns {{ skinUnlocked?: object, achievementUnlocked?: string }}
 */
recordResult(levelId, pct, score, options)
```

### New Behavior (додається після існуючої логіки bestPct/highScore)

```js
const entry = saveData.progress.levels[String(levelId)];
const currentPerfect = entry.perfect || null;
const { maxEasy, maxHard, difficulty } = options;

// Check for perfect achievement
if (pct >= 100) {
    if (difficulty === "HARD" && score >= maxHard && currentPerfect !== "hard") {
        entry.perfect = "hard";
        result.achievementUnlocked = "hard";
    } else if (difficulty === "EASY" && score >= maxEasy && !currentPerfect) {
        entry.perfect = "easy";
        result.achievementUnlocked = "easy";
    }
}
```

### Achievement Hierarchy Rules

| Поточний `perfect` | Новий результат | Новий `perfect` | Причина |
|--------------------|-----------------|-----------------|---------|
| `null` | EASY, score == maxEasy | `"easy"` | Перше досягнення |
| `null` | HARD, score == maxHard | `"hard"` | Одразу золото |
| `"easy"` | HARD, score == maxHard | `"hard"` | Підвищення |
| `"easy"` | EASY, score == maxEasy | `"easy"` | Без змін (вже є) |
| `"easy"` | Будь-який, score < max | `"easy"` | Без змін |
| `"hard"` | Будь-який результат | `"hard"` | Золото не втрачається |

### Return Value Extension

```js
// Existing: { skinUnlocked?: { id, name, renderType } }
// New:
{
    skinUnlocked?: { id, name, renderType },
    achievementUnlocked?: "easy" | "hard"
}
```

### Caller Update (main.js)

У `main.js` рядки 187 та 200 — потрібно передати `maxEasy`, `maxHard`, `difficulty` у виклик `save.recordResult()`:

```js
// Було:
save.recordResult(currentLevelId, Math.floor(runState.progressPct), runState.score);

// Стало:
const result = save.recordResult(currentLevelId, Math.floor(runState.progressPct), runState.score, {
    maxEasy: runState.maxEasy,
    maxHard: runState.maxHard,
    difficulty: runState.difficulty
});
```

---

## SaveManager Method: `getLevelAchievement(levelId)`

Новий метод для читання статусу досягнення рівня.

### Signature

```js
/**
 * Повертає статус досягнення для рівня.
 *
 * @param {number} levelId - ID рівня
 * @returns {string|null} "easy" | "hard" | null
 */
getLevelAchievement(levelId)
```

### Implementation

```js
getLevelAchievement: function (levelId) {
    const entry = saveData.progress.levels[String(levelId)];
    return (entry && entry.perfect) || null;
}
```

### Callers

| Викликається з | Призначення |
|----------------|-------------|
| `main.js:buildLevelCards()` | Визначення CSS-класу для картки рівня |
| `main.js:buildSkinGrid()` | Визначення CSS-класу для картки скіна |
| `engine.js:renderPlayer()` | Визначення glow-ефекту кубика |

---

## `sanitizeSaveData()` Extension

Розширення існуючої функції (рядок 833) для міграції даних.

### New Logic (додається після існуючої валідації levels)

```js
// Ensure perfect field exists for all levels
for (const key of Object.keys(saveData.progress.levels)) {
    const entry = saveData.progress.levels[key];
    if (!("perfect" in entry)) {
        entry.perfect = null;
    } else if (![null, "easy", "hard"].includes(entry.perfect)) {
        entry.perfect = null;
    }
}
```

### Behavior

- Рівні без поля `perfect` → отримують `perfect: null`
- Рівні з некоректним значенням (напр., `"gold"`, `true`, `1`) → скидаються до `null`
- Валідні значення (`null`, `"easy"`, `"hard"`) → зберігаються без змін

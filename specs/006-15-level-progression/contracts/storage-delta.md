# Контракти API: Зміни в сховищі (SaveManager)

**Created**: 2026-07-18
**Feature**: 006-15-level-progression

## 1. Ключ збереження

**Незмінний**: `dfp_save_v1`

## 2. Схема даних (розширена)

```json
{
  "version": 1,
  "settings": {
    "difficulty": "EASY"
  },
  "progress": {
    "unlocked": 1,
    "levels": {
      "1": { "bestPct": 0, "highScore": 0 },
      "2": { "bestPct": 0, "highScore": 0 },
      "3": { "bestPct": 0, "highScore": 0 },
      "4": { "bestPct": 0, "highScore": 0 },
      "5": { "bestPct": 0, "highScore": 0 },
      "6": { "bestPct": 0, "highScore": 0 },
      "7": { "bestPct": 0, "highScore": 0 },
      "8": { "bestPct": 0, "highScore": 0 },
      "9": { "bestPct": 0, "highScore": 0 },
      "10": { "bestPct": 0, "highScore": 0 },
      "11": { "bestPct": 0, "highScore": 0 },
      "12": { "bestPct": 0, "highScore": 0 },
      "13": { "bestPct": 0, "highScore": 0 },
      "14": { "bestPct": 0, "highScore": 0 },
      "15": { "bestPct": 0, "highScore": 0 }
    }
  }
}
```

## 3. defaultSaveData() — розширено

```js
function defaultSaveData() {
    const levels = {};
    for (const level of LEVELS) {  // 15 рівнів
        levels[String(level.id)] = { bestPct: 0, highScore: 0 };
    }
    return {
        version: 1,
        settings: { difficulty: "EASY" },
        progress: { unlocked: 1, levels: levels }
    };
}
```

## 4. sanitizeSaveData(raw) — міграція

```js
function sanitizeSaveData(raw) {
    const clean = defaultSaveData();
    if (!raw || typeof raw !== "object" || raw.version !== 1) {
        return clean;
    }
    // ... налаштування difficulty без змін ...

    if (raw.progress && typeof raw.progress === "object") {
        const unlocked = Number(raw.progress.unlocked);
        if (Number.isFinite(unlocked)) {
            clean.progress.unlocked = Math.min(15, Math.max(1, Math.floor(unlocked)));
            //                                  ^^ було 6
        }
        if (raw.progress.levels && typeof raw.progress.levels === "object") {
            for (const level of LEVELS) {
                const key = String(level.id);
                const entry = raw.progress.levels[key];
                if (entry && typeof entry === "object") {
                    const pct = Number(entry.bestPct);
                    const score = Number(entry.highScore);
                    if (Number.isFinite(pct)) {
                        clean.progress.levels[key].bestPct = Math.min(100, Math.max(0, Math.round(pct)));
                    }
                    if (Number.isFinite(score)) {
                        clean.progress.levels[key].highScore = Math.max(0, Math.round(score));
                    }
                }
                // Якщо entry відсутній — залишається дефолт { bestPct: 0, highScore: 0 }
            }
        }
    }
    return clean;
}
```

**Ключова зміна**: `Math.min(6, ...)` → `Math.min(15, ...)`

## 5. recordResult(levelId, pct, score) — розширено

```js
recordResult(levelId, pct, score) {
    // ... перевірка saveData, оновлення bestPct/highScore без змін ...

    if (cleanPct === 100 && levelId < 15) {
        //                             ^^ було 6
        saveData.progress.unlocked = Math.max(saveData.progress.unlocked, levelId + 1);
    }
    this.persist();
}
```

## 6. save.getLastPlayable() — без змін

```js
getLastPlayable() {
    if (!saveData) this.load();
    return saveData.progress.unlocked;  // 1..15
}
```

Повертає останній розблокований рівень. Використовується для кнопки «СТАРТ» у меню та демо-заставки.

## 7. Міграційний сценарій: старе збереження → нове

| Стан старого збереження | Результат міграції |
|-------------------------|-------------------|
| `unlocked: 1` | `unlocked: 1`, рівні 7–15 з 0% |
| `unlocked: 6` (БОС пройдено) | `unlocked: 6`, рівні 7–15 з 0% |
| `levels.3.bestPct: 85` | `levels.3.bestPct: 85` (збережено) |
| `levels.6.highScore: 520` | `levels.6.highScore: 520` (збережено) |
| Відсутній ключ `levels.7` | Створюється `levels.7: { bestPct: 0, highScore: 0 }` |
| Пошкоджений JSON | Повний скид до дефолту (unlocked: 1) |
| localStorage недоступний | In-memory дефолт, гра продовжується |

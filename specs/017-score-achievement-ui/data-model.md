# Data Model: Система балів, досягнень та UI нагород

**Дата**: 2026-07-20

## Entities

### 1. ScoreConfig (Конфігурація балів) — нова

Параметри, що визначають бонуси до базових балів за одне натискання. Не зберігається окремо — формується на основі `saveData.settings` та параметрів рівня.

| Поле | Тип | Опис | Можливі значення |
|------|-----|------|------------------|
| `difficulty` | `string` | Режим складності | `"EASY"`, `"HARD"` |
| `hitWindow` | `string` | Розмір зони влучання | `"normal"`, `"large"` |
| `speed` | `string` | Множник швидкості | `"slow"`, `"normal"`, `"fast"` |

**Похідні значення** (не зберігаються, обчислюються):
| Поле | Тип | Формула |
|------|-----|---------|
| `difficultyBonus` | `number` | `difficulty === "HARD" ? 50 : 0` |
| `zoneSizeBonus` | `number` | `hitWindow === "normal" ? 20 : 0` |
| `speedBonus` | `number` | `speed === "fast" ? 40 : speed === "slow" ? -20 : 0` |

---

### 2. HitResult (Результат натискання) — нова

Фіксує результат одного натискання гравця на літеру.

| Поле | Тип | Опис |
|------|-----|------|
| `isOkZone` | `boolean` | Чи влучив гравець у зону OK (true) чи в іншу зону (false) |
| `score` | `number` | Нараховані бали за це натискання (ціле ≥ 0) |

**Формула**: `score = Math.max(0, (isOkZone ? 100 : 80) + difficultyBonus + zoneSizeBonus + speedBonus)`

---

### 3. LevelMaxScores (Максимальні бали рівня) — нова

Теоретичний максимум балів для рівня при даній конфігурації. Обчислюється в конструкторі Engine.

| Поле | Тип | Опис |
|------|-----|------|
| `maxEasy` | `number` | Максимум для EASY: `spikeCount × (100 + 0 + zoneSizeBonus + speedBonus)` |
| `maxHard` | `number` | Максимум для HARD: `spikeCount × (100 + 50 + zoneSizeBonus + speedBonus)` |

**Умова**: Усі `spikeCount` натискань влучають у зону OK без пропусків.

---

### 4. LevelData (Дані рівня в localStorage) — розширення

**Поточна структура** (`saveData.progress.levels[id]`):
```json
{
    "bestPct": 85,
    "highScore": 1200
}
```

**Нова структура**:
```json
{
    "bestPct": 85,
    "highScore": 1200,
    "perfect": null
}
```

| Поле | Тип | Опис | Значення за замовчуванням |
|------|-----|------|---------------------------|
| `perfect` | `string \| null` | Статус досягнення рівня | `null` |

**Можливі значення `perfect`**:

| Значення | Назва | Умова отримання | Пріоритет |
|----------|-------|-----------------|-----------|
| `null` | Немає досягнення | Початковий стан | 0 (базовий) |
| `"easy"` | Срібний Максимум (perfectEasy) | `finalScore === maxEasy` при грі на EASY | 1 |
| `"hard"` | Золотий Максимум (perfectHard) | `finalScore === maxHard` при грі на HARD | 2 (найвищий) |

---

### 5. PlayerProgress (Прогрес гравця) — без змін структури, розширення рівнів

```json
{
    "unlocked": 5,
    "unlockedSkins": ["skin_1_1", "skin_1_2", "skin_2_1"],
    "levels": {
        "1": { "bestPct": 100, "highScore": 1440, "perfect": "hard" },
        "2": { "bestPct": 100, "highScore": 1200, "perfect": "easy" },
        "3": { "bestPct": 85,  "highScore": 900,  "perfect": null },
        "4": { "bestPct": 0,   "highScore": 0,    "perfect": null }
    }
}
```

---

### 6. CubeRenderContext (Контекст рендерингу кубика) — розширення

Розширення існуючого контексту в `Engine.renderPlayer()` для підтримки статусних ефектів.

| Поле | Тип | Опис | Джерело |
|------|-----|------|---------|
| `achievement` | `string \| null` | Статус досягнення для рівня, до якого прив'язаний скін | `progress.levels[levelId].perfect` |
| `goldTrail` | `Array<{x, y, alpha}>` | Частинки золотого шлейфу (тільки для perfectHard) | Записується при стрибках |

---

### 7. LevelCardVisualState (Візуальний стан картки рівня) — нова

Визначає CSS-класи, що застосовуються до DOM-елемента `.level-card`.

| Статус `perfect` | CSS клас | Рамка | Зірка | Анімація |
|------------------|----------|------|-------|----------|
| `null` | (немає) | Стандартна неонова | Немає | Немає |
| `"easy"` | `.perfect-silver` | Тонка срібна (`#b0b8c8`) | `★` срібний градієнт | Немає |
| `"hard"` | `.perfect-gold` | Товста золота з градієнтом | `★` золотий градієнт | `goldPulse` 2s |

---

### 8. SkinCardVisualState (Візуальний стан картки скіна) — нова

Аналогічно для `.skin-card` у меню вибору скінів.

| Статус рівня скіна | CSS клас | Ефект |
|--------------------|----------|-------|
| `null` | (стандартний) | Звичайна рамка |
| `"easy"` | `.perfect-silver` | Срібний контур |
| `"hard"` | `.perfect-gold` | Золота рамка зі свіченням |

---

## State Transitions

### Життєвий цикл досягнення рівня

```
[Рівень без досягнення]  ──(victory, score == maxEasy)──>  [perfectEasy]
                                                                │
                                          (victory, score == maxHard)
                                                                │
                                                                ▼
                                                        [perfectHard]

[perfectEasy]  ──(victory, score == maxHard)──>  [perfectHard]

[perfectHard]  ──(victory, score == maxEasy)──>  [perfectHard]  (без змін)
```

**Правила переходу**:
1. `null → "easy"`: якщо difficulty === EASY AND finalScore === maxEasy
2. `null → "hard"`: якщо difficulty === HARD AND finalScore === maxHard
3. `"easy" → "hard"`: якщо difficulty === HARD AND finalScore === maxHard (підвищення)
4. `"hard" → "hard"`: навіть при perfectEasy на EASY — статус не знижується
5. Якщо score < max — статус не змінюється (ані підвищення, ані зниження)

### Визначення статусу для скіна

```
[Скін прив'язаний до рівня L]
        │
        ▼
[progress.levels[L].perfect]
        │
  ┌─────┼─────┐
  ▼     ▼     ▼
 null  easy  hard
  │     │     │
  ▼     ▼     ▼
без    срібний  золотий
ефектів контур   glow
```

---

## Validation Rules

| Правило | Застосовується до | Перевірка |
|---------|-------------------|-----------|
| `score >= 0` для кожного натискання | `calculateHitScore()` | `Math.max(0, total)` |
| `perfect ∈ {null, "easy", "hard"}` | `sanitizeSaveData()` | Перевірка при завантаженні, некоректні → `null` |
| `maxEasy ≤ maxHard` для будь-якого рівня | Конструктор Engine | Бонуси HARD > EASY завжди (+50 > +0) |
| `perfect` не знижується з `"hard"` | `save.recordResult()` | Перевірка поточного значення перед записом |
| Статус зберігається для рівня, не для конфігурації | `saveData.progress.levels[id]` | Одне поле `perfect` на рівень |

# Data Model: Реєстр скінів гравця (31 рівень)

**Дата**: 2026-07-19

## Entities

### 1. Skin (Скін)

Візуальне представлення кубика гравця, прив'язане до конкретного підрівня.

| Поле | Тип | Опис | Обмеження |
|------|-----|------|-----------|
| `id` | `string` | Унікальний ідентифікатор | Формат `"skin_L_N"` (L=ліга 1..5, N=підрівень 1..16) |
| `name` | `string` | Назва українською | Не порожній рядок |
| `renderType` | `string` | Ключ функції рендерингу | Один із 31 попередньо визначених ключів |

**Приклад**:
```json
{
    "id": "skin_1_1",
    "name": "Стандартний Неон",
    "renderType": "neon_base"
}
```

### 2. SubLevel (Підрівень) — розширення існуючої моделі

Кожен об'єкт підрівня в `LEVELS_CONFIG` розширюється полем `skin`.

**Нові поля**:
| Поле | Тип | Опис |
|------|-----|------|
| `skin` | `Skin` (вкладений об'єкт) | Скін, прив'язаний до цього підрівня |

**Існуючі поля (без змін)**: `id`, `leagueId`, `name`, `letters`, `speed`, `spikeCount`, `seed`, `bgTheme`, `accentColor`, `rhythmGroups`

### 3. PlayerProgress (Прогрес гравця) — розширення

Поточна структура `saveData.progress`:
```json
{
    "unlocked": 1,
    "levels": {
        "1": { "bestPct": 0, "highScore": 0 },
        "2": { "bestPct": 0, "highScore": 0 }
    }
}
```

**Нове поле**:
| Поле | Тип | Опис | Значення за замовчуванням |
|------|-----|------|---------------------------|
| `unlockedSkins` | `string[]` | Масив ідентифікаторів розблокованих скінів | `[]` |

**Нова структура**:
```json
{
    "unlocked": 3,
    "unlockedSkins": ["skin_1_1", "skin_1_2"],
    "levels": {
        "1": { "bestPct": 100, "highScore": 1200 },
        "2": { "bestPct": 100, "highScore": 980 },
        "3": { "bestPct": 45, "highScore": 340 }
    }
}
```

### 4. Player (об'єкт гравця) — розширення для Meteor

Для підтримки скіна «Метеор» (рівень 3-4) додається поле шлейфу.

| Поле | Тип | Опис | Ініціалізація |
|------|-----|------|---------------|
| `meteorTrail` | `Array<{x: number, y: number, alpha: number}>` | Історія позицій для шлейфу Метеора | `[]` (очищається в `reset()`) |

## State Transitions

### Життєвий цикл розблокування скіна

```
[Рівень не пройдено] ──(player.x >= finishX)──> [Рівень пройдено]
                                                        │
                                            ┌───────────┴───────────┐
                                            ▼                       ▼
                                   [Скін уже в            [Скін НЕ в
                                    unlockedSkins]         unlockedSkins]
                                            │                       │
                                            ▼                       ▼
                                   Без сповіщення         Додати skin.id
                                                          в unlockedSkins
                                                          │
                                                          ▼
                                                   Показати сповіщення
                                                   «Розблоковано
                                                    новий скін: [Назва]!»
```

### Вибір скіна для рендерингу

```
[Поточний рівень має skin?]
        │
  ┌─────┴─────┐
  ▼           ▼
 Так         Ні
  │           │
  ▼           ▼
Рендерити    Рендерити
skin         neon_base
рівня        (fallback)
```

## Validation Rules

| Правило | Застосовується до | Перевірка |
|---------|-------------------|-----------|
| `skin.id` унікальний | `LEVELS_CONFIG` | Кожен із 31 рівня має унікальний `skin.id` |
| `skin.renderType` відповідає функції | `SKIN_RENDERERS` | Ключ `renderType` існує в об'єкті `SKIN_RENDERERS` |
| `unlockedSkins` — масив рядків | `sanitizeSaveData()` | `Array.isArray(unlockedSkins) && unlockedSkins.every(s => typeof s === 'string')` |
| `unlockedSkins` без дублікатів | `save.recordResult()` | Перевірка `!unlockedSkins.includes(skin.id)` перед додаванням |
| `meteorTrail` очищається при reset | `Engine.reset()` | `this.player.meteorTrail = []` |

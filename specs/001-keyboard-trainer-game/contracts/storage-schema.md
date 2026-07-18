# Contract: Схема localStorage

**Feature**: 001-keyboard-trainer-game | **Date**: 2026-07-18 | **Research**: R5

## Ключ

`dfp_save_v1` — єдиний ключ; значення — JSON-рядок.

## Схема значення

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
      "6": { "bestPct": 0, "highScore": 0 }
    }
  }
}
```

## Правила

| Поле | Тип | Інваріанти |
|------|-----|-----------|
| `version` | number | Наразі `1`; невідома версія → мігрувати або скинути до дефолту |
| `settings.difficulty` | `"EASY"` \| `"HARD"` | Інше значення → `"EASY"` |
| `progress.unlocked` | number | 1–6; ніколи не зменшується |
| `levels[i].bestPct` | number | 0–100 (ціле); запис лише якщо нове > старого |
| `levels[i].highScore` | number | ≥ 0 (ціле); запис лише якщо нове > старого |

## Поведінка SaveManager

1. **Читання**: `try { JSON.parse(localStorage.getItem('dfp_save_v1')) }` —
   будь-яка помилка (SecurityError, битий JSON, null) → дефолтний об'єкт вище.
2. **Запис**: `try { localStorage.setItem(...) } catch {}` — при відмові
   (квота, приватний режим) стан живе в пам'яті до закриття вкладки; консоль
   чиста (Конституція, Принцип IV).
3. **Атомарність**: завжди пишеться весь об'єкт цілком.
4. **Оновлення після забігу** (`recordResult(levelId, pct, score)`):
   - `bestPct = max(старий, pct)`; `highScore = max(старий, score)`
   - якщо `pct === 100` і `levelId < 6` → `unlocked = max(unlocked, levelId+1)`
   - одразу `persist()`.

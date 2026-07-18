# Contract: Engine Constructor (Speed Parameter)

## Сигнатура

```js
new Engine(levelId, difficulty, demoMode, hitWindow, speed)
```

## Параметри

| Параметр | Тип | Допустимі значення | Опис |
|----------|-----|--------------------|------|
| `levelId` | number | 1–15 | ID рівня |
| `difficulty` | string | `"EASY"`, `"HARD"` | Режим складності |
| `demoMode` | boolean | `true`, `false` | Демо-режим (без введення) |
| `hitWindow` | string | `"normal"`, `"large"` | Розмір зони влучання |
| `speed` | string | `"slow"`, `"normal"`, `"fast"` | **НОВЕ** — швидкість гри |

## Логіка всередині конструктора

```js
const SPEED_MULTIPLIERS = { slow: 0.75, normal: 1.0, fast: 1.25 };

// Clone level object
this.level = { ...LEVELS.find(l => l.id === levelId) };
// Apply speed multiplier
this.level.speed *= SPEED_MULTIPLIERS[speed] ?? 1.0;
```

## Вимоги

1. **Клонування**: `{ ...level }` — поверхнева копія достатня, оскільки
   `level.speed` є примітивом (number)
   - Оригінальний масив `LEVELS` залишається незмінним
   - Кожен виклик конструктора створює незалежну копію
2. **Множник**: значення за замовчуванням `?? 1.0` — fallback на випадок
   невідомого рядка
3. **Порядок**: клонування та множення мають відбуватися ДО виклику
   `generateTrack()`, оскільки функція генерації траси залежить від
   `level.speed`

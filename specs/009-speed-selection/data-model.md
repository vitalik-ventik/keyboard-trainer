# Data Model: Вибір швидкості гри (Slow / Normal / Fast)

## SpeedSetting

Значення швидкості, що зберігається в налаштуваннях гравця.

| Поле | Тип | Допустимі значення | За замовчуванням | Опис |
|------|-----|--------------------|-------------------|------|
| `speed` | string | `"slow"`, `"normal"`, `"fast"` | `"normal"` | Вибір гравця |

### Валідація
- При завантаженні з localStorage значення має входити в множину
  {`"slow"`, `"normal"`, `"fast"`}
- Якщо значення відсутнє або недійсне → скидання до `"normal"`
- Регістр: малі літери

### Зберігання
```json
{
  "version": 1,
  "settings": {
    "difficulty": "EASY",
    "hitWindow": "normal",
    "speed": "normal"
  },
  "progress": { ... }
}
```
Ключ: `dfp_save_v1`

### Методи SaveManager
- `save.setSpeed(value)` — встановлює `speed` і викликає `persist()`
- `save.getSpeed()` — повертає поточне значення (або `"normal"` за замовчуванням)

---

## SpeedMultiplier

Числове відображення рядкового значення швидкості.

| Значення | Множник | Опис |
|----------|---------|------|
| `"slow"` | 0.75 | 25% повільніше |
| `"normal"` | 1.0 | Стандартна швидкість |
| `"fast"` | 1.25 | 25% швидше |

### Застосування
- Конструктор `Engine` отримує рядковий `speed` і конвертує в множник
- Створює cloned level: `{ ...LEVELS[id], speed: level.speed * multiplier }`
- Всі подальші обчислення (track generation, player movement, hit windows,
  saw rotation) використовують скорегований `level.speed`

### State Transitions
```
[Налаштування змінено] ──→ save.setSpeed(newValue) ──→ persist()
                                                              │
                         ┌───────────────────────────────────┘
                         ▼
                  [Створення Engine]
                         │
                    ┌─────┴─────┐
                    ▼           ▼
              demoEngine    levelEngine
              (MENU,        (PLAYING:
              SETTINGS,     speed frozen at
              LEVEL_SELECT) creation time)
```

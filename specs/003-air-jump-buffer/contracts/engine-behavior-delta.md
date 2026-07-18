# Contract: Поведінковий контракт Engine (delta до contracts фічі 001)

**Feature**: 003-air-jump-buffer | **Date**: 2026-07-18

## Незмінність публічного API

Сигнатури `Engine` НЕ змінюються: `constructor(levelId, difficulty, demoMode)`,
`reset()`, `update(dt)`, `render(ctx, W, H, time)`, `handleLetter(letter)`,
`getTargetLetter()`, `getState()`, `getOutcome()`, колбеки
`onJump/onExplode/onVictory`. Контракт `contracts/module-api.md` фічі 001
лишається чинним. Інші модулі (`main.js`, `keyboard.js`, `assets.js`) та
розмітка/стилі — без змін.

## Зміна семантики handleLetter(letter)

Стан гравця та літера → нова поведінка (зміни виділено):

| Умова | EASY (було → стало) | HARD (було → стало) |
|-------|---------------------|---------------------|
| Правильна літера, НА ЗЕМЛІ, у вікні | стрибок → стрибок | стрибок → стрибок |
| Правильна літера, НА ЗЕМЛІ, поза вікном | ігнор → ігнор | вибух → вибух |
| **Правильна літера, У ПОВІТРІ** | **ігнор → БУФЕР** | **вибух → БУФЕР** |
| Неправильна літера (будь-де) | ігнор → ігнор | вибух → вибух |
| demoMode / не живий / не running | вихід → вихід | вихід → вихід |

«Правильна» = літера найближчого шипа зі станом `ahead`
(`nearestAheadSpike()`), як і раніше.

## Нова поведінка update(dt): перевірка буфера при приземленні

У кадрі переходу `player.onGround: false → true` (гілка `player.y <= 0`
вертикальної фізики), ДО перевірки HARD-пропуску та колізій:

```text
якщо jumpBuffer !== null:
    якщо jumpBuffer.state !== 'ahead'        → jumpBuffer = null
    інакше gap = jumpBuffer.x - player.x:
        0 < gap ≤ okPx                       → jumpBuffer.state = 'cleared';
                                               очки (+10, +5 як perfect за
                                               фактичним gap); jump()
                                               (→ onJump → звук стрибка);
                                               jumpBuffer = null
        інакше (gap ≤ 0 або gap > okPx)      → jumpBuffer = null (тихо)
```

## Точки скасування (FR-040, FR-041)

| Подія | Дія |
|-------|-----|
| `explode()` (зіткнення, HARD-помилка, HARD-пропуск) | `jumpBuffer = null` |
| Приземлення: шип не `ahead` або недосяжний | `jumpBuffer = null` |
| Нове правильне натискання в повітрі | перезапис посилання |
| `reset()` (старт/рестарт забігу) | `jumpBuffer = null` (ініціалізація) |

## Гарантії

1. Автостибок ніколи не виконується для шипа зі станом `cleared`/`hit`.
2. Автостибок сурово еквівалентний ручному: той самий `jump()`, ті самі очки
   та звук (FR-038).
3. Нуль нових алокацій на кадр: буфер — одне поле-посилання.
4. `localStorage`-схема `dfp_save_v1` не змінюється (FR-041).

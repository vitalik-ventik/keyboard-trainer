# Data Model: Дитячий клавіатурний тренажер (001-keyboard-trainer-game)

**Date**: 2026-07-18 | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

Усі структури — прості JS-об'єкти/константи (без класів там, де достатньо
даних). Персистентні — лише `PlayerProgress` і `Settings` (див.
[contracts/storage-schema.md](./contracts/storage-schema.md)).

## 1. GameState (перелік станів)

| Значення | Опис | Музика |
|----------|------|--------|
| `LOADING` | Екран «ЗАВАНТАЖЕННЯ...», чекає AssetLoader | — |
| `MENU` | Головне меню + демо-заставка | `menu.mp3` (loop) |
| `SETTINGS` | Модалка налаштувань поверх меню (демо триває) | `menu.mp3` (продовжується) |
| `LEVEL_SELECT` | Сітка 6 карток | `menu.mp3` (продовжується) |
| `PLAYING` | Активний рівень | `game.mp3` (loop) |
| `GAMEOVER` | Екран поразки з % проходження | `gameover.mp3` |
| `VICTORY` | Екран перемоги (100%) | `win.mp3` |

**Переходи**: `LOADING→MENU`; `MENU↔SETTINGS`; `MENU↔LEVEL_SELECT`;
`MENU→PLAYING` (СТАРТ = останній відкритий рівень); `LEVEL_SELECT→PLAYING`
(лише відкриті рівні); `PLAYING→GAMEOVER|VICTORY`; `GAMEOVER→PLAYING(retry)|MENU`;
`VICTORY→PLAYING(next|retry)|MENU`. Інші переходи заборонені.

## 2. LevelDefinition (константа, 6 шт.)

| Поле | Тип | Опис / Валідація |
|------|-----|------------------|
| `id` | number | 1–6 |
| `name` | string | Напр. «Рівень 1» / «БОС» |
| `letters` | string[] | Кумулятивний набір літер рівня (FR-017) |
| `newLetters` | string[] | Нові літери рівня (для картки) |
| `speed` | number | Швидкість руху світу, лог. px/с (L1≈180 … L6≈420) |
| `spikeCount` | number | 15 (L1) → 50+ (L6) (FR-016) |
| `seed` | number | Фіксований сід PRNG → фіксована траса |
| `bgTheme` | `'grid'` \| `'city'` \| `'boss'` | L1–2 grid, L3–4 city, L5–6 boss (FR-025) |
| `rhythmGroups` | boolean | `true` лише для L6 (шипи групами 2–4) |

Конкретні набори: L1 `[А,О]`; L2 `+[В,Л]`; L3 `+[І,Д]`; L4 `=[Ф,І,В,А,О,Л,Д,Ж]`;
L5 `+[Е,Н,Г,Ш]`; L6 `=[Ґ,Є,Ї,Ю,Я]`.

## 3. Spike (перешкода, генерується з LevelDefinition)

| Поле | Тип | Опис |
|------|-----|------|
| `x` | number | Світова координата (лог. px від старту) |
| `letter` | string | Українська літера з `letters` рівня |
| `state` | `'ahead'` \| `'cleared'` \| `'hit'` | Життєвий цикл |

**Правила**: мінімальна дистанція між шипами залежить від `speed` (час реакції
≥ 0.9 с на L1, ≥ 0.45 с на L6); літера чергується PRNG-ом без трьох однакових
поспіль; `finishX = lastSpike.x + запас` — точка 100%.

## 4. Player (кубик, runtime)

| Поле | Тип | Опис |
|------|-----|------|
| `x` | number | Світова позиція (камера слідує) |
| `y`, `vy` | number | Вертикальна позиція/швидкість (гравітація) |
| `onGround` | boolean | Дозвіл стрибка |
| `rotation` | number | Обертання кубика в польоті (стиль GD) |
| `alive` | boolean | `false` після вибуху |
| `trail` | {x,y,alpha}[] | Слід (FR-026), макс. ~20 точок |

**Стрибок**: дозволений лише коли `onGround && alive`; імпульс підібраний так,
щоб дуга перекривала шип із зоною колізії (див. HitWindow).

## 5. HitWindow (зона колізії / ритм-вікно)

| Поле | Тип | Опис |
|------|-----|------|
| `perfectPx` | number | Вікно «ідеально» перед шипом (бонус очок) |
| `okPx` | number | Повне вікно зарахування стрибка (FR-021) |

Ширина вікна масштабується від `speed` (фіксований час ~0.35 с → px), ширше на
повільних рівнях (Assumption зі spec). Натискання правильної літери поза
вікном: EASY — ігнорується; HARD — миттєвий вибух. Неправильна літера:
EASY — ігнорується; HARD — вибух. Пропуск вікна: EASY — політ у шип (вибух від
контакту); HARD — вибух на межі вікна.

## 6. RunState (стан активного забігу)

| Поле | Тип | Опис |
|------|-----|------|
| `levelId` | number | Поточний рівень |
| `distance` | number | Пройдена дистанція |
| `progressPct` | number | 0–100, `distance / finishX` (FR-018) |
| `score` | number | Очки: +10 стрибок, +5 бонус за perfect |
| `combo` | number | Поспіль ідеальних (для світлових хвиль боса) |
| `particles` | Particle[] | Активні частинки вибуху |
| `paused` | boolean | Пауза при прихованій вкладці |

## 7. Particle (ефект вибуху)

| Поле | Тип |
|------|-----|
| `x, y, vx, vy` | number |
| `size, life, color` | number, number (0–1), string |

Вибух: 24–40 частинок, гравітація, згасання по `life`; оновлення в тому ж rAF.

## 8. PlayerProgress (персистентний)

| Поле | Тип | Валідація |
|------|-----|-----------|
| `unlocked` | number | 1–6; monotonic (тільки зростає) |
| `levels` | Record<levelId, {bestPct:number, highScore:number}> | `bestPct` 0–100; оновлення тільки якщо нове > старого (FR-015) |

**Похідне**: `lastPlayable = unlocked` — рівень для кнопки «СТАРТ» (FR-006).
100% на рівні N → `unlocked = max(unlocked, N+1)` (FR-014), кап 6.

## 9. Settings (персистентний)

| Поле | Тип | Дефолт |
|------|-----|--------|
| `difficulty` | `'EASY'` \| `'HARD'` | `'EASY'` (Assumption зі spec) |

## 10. KeyDef (клавіша візуальної клавіатури)

| Поле | Тип | Опис |
|------|-----|------|
| `code` | string | `event.code` (напр. `KeyA`) |
| `letter` | string | Українська літера (напр. `Ф`) |
| `row, col` | number | Позиція в матриці 3 рядів (12/12/9 + Ґ) |
| `highlight` | `'none'` \| `'group'` \| `'target'` | none — сіра; group — тьмяно-зелена (літера рівня); target — блимає червоним/жовтим (найближчий шип) (FR-020) |

## 11. AssetRegistry (результат AssetLoader)

| Поле | Тип | Опис |
|------|-----|------|
| `sounds` | Record<'jump'\|'explode'\|'victory'\|'click', AudioBuffer\|null> | `null` = файл не завантажився (гра працює далі, FR-002) |
| `music` | Record<'menu'\|'game'\|'gameover'\|'win', AudioBuffer\|null> | те саме |

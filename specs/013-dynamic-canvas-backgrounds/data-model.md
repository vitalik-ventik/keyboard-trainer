# Data Model: Динамічні багатошарові Canvas-фони

**Feature**: 013-dynamic-canvas-backgrounds
**Date**: 2026-07-19

## Entities

### 1. BackgroundEffect (Фоновий ефект)

Абстрактний тип, що представляє один із 10 алгоритмів рендерингу фону.

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Ідентифікатор типу: `cyber_grid`, `parallax_city`, `hyperspace_tunnel`, `bezier_waves`, `neon_rain`, `matrix_flow`, `equalizer`, `starfield`, `energy_grid`, `geo_landscape` |
| `speed` | number | Базова швидкість анімації (з LEVELS_CONFIG) |
| `accentColor` | string | Основний колір рівня (#rrggbb) |
| `time` | number | Поточний час анімації (мс, від performance.now) |

**Lifecycle**: Створюється при старті рівня → оновлюється щокадру → знищується при виході з рівня.

---

### 2. ParallaxLayer (Шар паралаксу)

Використовується в `parallax_city` та `starfield` для створення ефекту глибини.

| Field | Type | Description |
|-------|------|-------------|
| `speed` | number | Швидкість прокрутки відносно базової (0.0–1.0) |
| `elements` | Array | Масив візуальних елементів шару |
| `offset` | number | Поточний зсув шару |

**Lifecycle**: Ініціалізується при першому рендері → оновлюється щокадру → скидається при resize.

---

### 3. Particle (Частка)

Об'єкт системи часток вибуху. Максимум 50 одночасно.

| Field | Type | Description |
|-------|------|-------------|
| `x` | number | Позиція X |
| `y` | number | Позиція Y |
| `vx` | number | Швидкість X (px/s) |
| `vy` | number | Швидкість Y (px/s) |
| `life` | number | Поточний час життя (s) |
| `maxLife` | number | Максимальний час життя (0.4–0.6 s) |
| `color` | string | Колір (#rrggbb) |
| `size` | number | Розмір у пікселях (2–4) |
| `gravity` | number | Прискорення гравітації (300–500 px/s²) |

**Lifecycle**: 
```
CREATED (успішне подолання) → ACTIVE (оновлення позиції + гравітація) → 
FADING (life → 0) → REMOVED (life ≤ 0 або ліміт 50 перевищено)
```

**Invariants**:
- Кількість активних часток ≤ 50
- При створенні нової частки, якщо вже 50 активних — найстаріша (з найменшим life) видаляється

---

### 4. Raindrop (Крапля дощу)

Використовується в `neon_rain`. Максимум 80 одночасно.

| Field | Type | Description |
|-------|------|-------------|
| `x` | number | Позиція X (верхня точка) |
| `y` | number | Позиція Y (верхня точка) |
| `speed` | number | Швидкість падіння (px/s) |
| `length` | number | Довжина краплі (px) |
| `color` | string | Колір (ціановий/синій) |
| `angle` | number | Кут падіння (45° = π/4) |

**Lifecycle**:
```
SPAWNED (згори, випадковий x) → FALLING (y += speed*dt, x += speed*cos(45)*dt) → 
SPLASH (y ≥ H → створити 3 іскри) → REMOVED
```

**Invariants**:
- Кількість активних крапель ≤ 80
- Нові краплі не створюються, поки count ≥ 80

---

### 5. StreamColumn (Стовпчик матричного потоку)

Використовується в `matrix_flow`. Максимум 40 одночасно.

| Field | Type | Description |
|-------|------|-------------|
| `x` | number | Позиція X |
| `y` | number | Позиція Y голови стовпчика |
| `speed` | number | Швидкість падіння (px/s) |
| `chars` | string[] | Масив символів (1-20 елементів) |
| `maxLength` | number | Максимальна довжина хвоста |

**Lifecycle**:
```
ACTIVE (y збільшується) → RESET (y ≥ H + tail → y = random(-500, 0), новий x)
```

**Invariants**:
- Кількість активних стовпчиків ≤ 40

---

### 6. EqualizerBar (Стовпчик еквалайзера)

Використовується в `equalizer`. Статична кількість (16-24 шт.).

| Field | Type | Description |
|-------|------|-------------|
| `x` | number | Позиція X |
| `width` | number | Ширина стовпчика |
| `height` | number | Поточна висота (обчислюється щокадру) |
| `color` | string | Колір (градієнт magenta) |

**Lifecycle**: Створюються при ініціалізації → висота переобчислюється щокадру через `Math.sin()/Math.cos()`.

---

### 7. Star (Зірка для starfield)

Використовується в `starfield`. 100-150 об'єктів.

| Field | Type | Description |
|-------|------|-------------|
| `x` | number | Позиція X |
| `y` | number | Позиція Y |
| `z` | number | Глибина (0.3, 0.6, 1.0) |
| `size` | number | Розмір (1-3 px) |
| `twinklePhase` | number | Фаза мерехтіння |
| `twinkleSpeed` | number | Швидкість мерехтіння |
| `brightness` | number | Базова яскравість (0.3–1.0) |

---

## Level-to-Background Mapping

| Level ID | bgTheme (new) | Effect Type |
|----------|--------------|-------------|
| 1 | `cyber_grid` | Кібер-Сітка |
| 2 | `parallax_city` | Паралакс Міста |
| 3 | `starfield` | Зоряне Поле |
| 4 | `energy_grid` | Енергетична Решітка |
| 5 | `cyber_grid` | Кібер-Сітка |
| 6 | `geo_landscape` | Геометричний Ландшафт |
| 7 | `geo_landscape` | Геометричний Ландшафт |
| 8 | `cyber_grid` | Кібер-Сітка |
| 9 | `parallax_city` | Паралакс Міста |
| 10 | `hyperspace_tunnel` | Гіперпросторовий Тунель |
| 11 | `hyperspace_tunnel` | Гіперпросторовий Тунель |
| 12 | `neon_rain` | Неоновий Дощ |
| 13 | `bezier_waves` | Хвилі Безьє |
| 14 | `bezier_waves` | Синусоїдальні Хвилі |
| 15 | `starfield` | Зоряне Поле |
| 16 | `starfield` | Зоряне Поле (не в основному скоупі) |
| 17 | `parallax_city` | Паралакс Міста |
| 18 | `geo_landscape` | Геометричний Ландшафт |
| 19 | `neon_rain` | Неоновий Дощ |
| 20 | `matrix_flow` | Матричний Потік |
| 21 | `energy_grid` | Енергетична Решітка |
| 22 | `starfield` | Зоряне Поле (не в основному скоупі) |
| 23 | `starfield` | Зоряне Поле (не в основному скоупі) |
| 24 | `starfield` | Зоряне Поле (не в основному скоупі) |
| 25 | `equalizer` | Еквалайзер |
| 26 | `energy_grid` | Енергетична Решітка |
| 27 | `hyperspace_tunnel` | Гіперпросторовий Тунель |
| 28 | `neon_rain` | Неоновий Дощ |
| 29 | `geo_landscape` | Геометричний Ландшафт |
| 30 | `bezier_waves` | Синусоїдальні Хвилі |
| 31 | `demon` | Бос-рівень (не змінюється) |

**Примітка**: Рівні 16, 22-24, 31 не входили в оригінальний scope специфікації. Для них обрано найбільш підходящі типи (starfield як універсальний fallback, demon залишається без змін).

# Contracts: BackgroundRenderer Module

**Feature**: 013-dynamic-canvas-backgrounds
**Module**: `js/backgrounds.js`

## Interface Contract

### `BackgroundRenderer`

Глобальний об'єкт-модуль, що надає методи для рендерингу фонів і керування системою часток.

```js
// --- Ініціалізація ---

/**
 * Ініціалізує всі внутрішні структури даних.
 * Викликається при старті додатку та після кожного resize.
 * @param {number} W - ширина canvas (логічна, після DPR)
 * @param {number} H - висота canvas (логічна)
 * @param {number} groundY - Y-координата лінії землі
 */
function init(W, H, groundY)

/**
 * Скидає стан усіх систем (частки, краплі, стовпчики).
 * Викликається при переході між рівнями та при GAMEOVER/VICTORY.
 */
function reset()

// --- Основний рендер ---

/**
 * Рендерить фон для поточного рівня.
 * Викликається щокадру з gameLoop.
 * @param {CanvasRenderingContext2D} ctx - контекст canvas
 * @param {string} bgTheme - ідентифікатор теми (з LEVELS_CONFIG)
 * @param {number} W - ширина canvas
 * @param {number} H - висота canvas
 * @param {number} groundY - лінія землі
 * @param {number} time - час у секундах (від performance.now() / 1000)
 * @param {number} speed - швидкість гри (px/s)
 * @param {string} accentColor - акцентний колір рівня (#rrggbb)
 */
function render(ctx, bgTheme, W, H, groundY, time, speed, accentColor)

// --- Система часток ---

/**
 * Створює набір часток вибуху в заданій точці.
 * Викликається з engine.js при успішному подоланні перешкоди.
 * @param {number} x - X координата епіцентру
 * @param {number} y - Y координата епіцентру
 * @param {number} count - кількість часток (15-20)
 * @param {string[]} [palette] - масив кольорів (за замовчуванням: neon palette)
 */
function createParticles(x, y, count, palette)

/**
 * Оновлює стан усіх активних часток.
 * Викликається щокадру перед рендером.
 * @param {number} dt - дельта часу з попереднього кадру (секунди)
 */
function updateParticles(dt)

/**
 * Рендерить усі активні частки.
 * Викликається щокадру після рендеру фону.
 * @param {CanvasRenderingContext2D} ctx - контекст canvas
 */
function renderParticles(ctx)

// --- DPR-aware масштабування ---

/**
 * Повертає поточну конфігурацію розмірів (для зовнішнього використання).
 * @returns {{ W: number, H: number, groundY: number }}
 */
function getDimensions()
```

### Contract Behavior

| Виклик | Очікувана поведінка |
|--------|---------------------|
| `init(W, H, groundY)` → `render(ctx, "cyber_grid", ...)` | Фон рендериться з використанням переданих розмірів |
| `createParticles(x, y, 18)` коли активних часток 45 | Додаються 5 нових (50 - 45), найстаріші 13 видаляються (якщо потрібно) |
| `reset()` під час активних часток/крапель | Усі масиви очищаються, лічильники скидаються |
| `reset()` → наступний `render()` | Фон починається з початкового стану (offset=0, фази скинуто) |
| `init()` → `resizeCanvas()` → `init()` | Усі позиції перераховані для нового розміру |

### Error Handling

- Якщо `bgTheme` не розпізнано → рендериться fallback (суцільний темний фон #0a0a0a)
- Якщо `ctx` is null/undefined → метод повертається без помилки (defensive)
- `createParticles()` з `count < 1` → нічого не створюється (без помилки)

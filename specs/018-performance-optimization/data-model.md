# Data Model: Оптимізація продуктивності для слабких ноутбуків

**Feature**: 018-performance-optimization
**Date**: 2026-07-20

---

## Entity: BackgroundCache

Кеш процедурного фону рівня на off-screen canvas.

| Поле | Тип | Опис |
|------|-----|------|
| `canvas` | `HTMLCanvasElement` | Невидимий canvas (не доданий у DOM) для рендеру фону |
| `ctx` | `CanvasRenderingContext2D` | 2D-контекст для малювання на кеш-канвасі |
| `width` | `number` | Поточна ширина кешу (оновлюється при resize) |
| `height` | `number` | Поточна висота кешу (оновлюється при resize) |
| `currentTheme` | `string \| null` | Ідентифікатор поточної теми фону (`"cyber_grid"`, `"inferno_core"` тощо) |
| `frameCounter` | `number` | Лічильник кадрів (0-2 при skipFrames=3). Кеш оновлюється коли counter === 0 |
| `skipFrames` | `number` | Кожен N-й кадр оновлювати кеш. За замовчуванням 3 (~50ms). |
| `dirty` | `boolean` | `true` якщо кеш потребує негайного оновлення (resize, зміна теми) |
| `isInitialized` | `boolean` | Чи був виконаний перший рендер у кеш |

**Життєвий цикл**:
1. Створюється при `Engine.constructor()` → `BackgroundCache.init(W, H)`
2. Оновлюється при `BackgroundRenderer.render()` — якщо `dirty` або `frameCounter % skipFrames === 0`
3. Композитується при `Engine.render()` через `mainCtx.drawImage(bgCache.canvas, 0, 0)`
4. Перестворюється при зміні розміру вікна (`resizeCanvas`)
5. Знищується при `Engine.reset()` або переході в меню

**Валідація**: `width > 0`, `height > 0`, `canvas !== null`, `ctx !== null`

---

## Entity: KeyboardCache

Кеш візуальної клавіатури ЙЦУКЕН на off-screen canvas.

| Поле | Тип | Опис |
|------|-----|------|
| `canvas` | `HTMLCanvasElement` | Невидимий canvas для кешування клавіатури |
| `ctx` | `CanvasRenderingContext2D` | 2D-контекст кешу |
| `width` | `number` | Ширина кешу відповідно до `keyboardArea.w` |
| `height` | `number` | Висота кешу відповідно до `keyboardArea.h` |
| `lastTargetLetter` | `string \| null` | Остання цільова літера — для визначення dirty |
| `lastGroupLetters` | `string` | Серіалізований рядок `groupLetters.join(',')` — для порівняння |
| `lastWrongKeyLetter` | `string \| null` | Остання літера помилки — для визначення dirty |
| `dirty` | `boolean` | `true` якщо стан клавіатури змінився і кеш потребує оновлення |

**Життєвий цикл**:
1. Створюється при `frame()` — перший кадр стану PLAYING
2. Оновлюється лише коли `dirty === true` (зміна targetLetter, groupLetters або wrongKeyError)
3. Композитується при `frame()` через `mainCtx.drawImage(kbCache.canvas, kbX, kbY)`
4. Інвалідується при переході між рівнями
5. Перестворюється при resize

**Правила валідації dirty**:
- targetLetter змінився → dirty = true
- groupLetters.join(',') !== lastGroupLetters → dirty = true
- wrongKeyError.letter !== lastWrongKeyLetter → dirty = true
- Минуло 350ms з моменту wrongKeyError → dirty = true (щоб скинути червону підсвітку)

---

## Entity: ParticlePool

Пул частинок із фіксованим розміром для уникнення GC-пауз.

| Поле | Тип | Опис |
|------|-----|------|
| `pool` | `Particle[]` | Масив із 30 об'єктів-частинок, створених один раз при ініціалізації |
| `maxSize` | `number` | Максимальна кількість одночасно активних частинок (30) |
| `activeCount` | `number` | Поточна кількість активних частинок |
| `freeStack` | `number[]` | Стек індексів вільних частинок для швидкого acquire |

**Об'єкт Particle**:
| Поле | Тип | Опис |
|------|-----|------|
| `x` | `number` | Позиція X |
| `y` | `number` | Позиція Y |
| `vx` | `number` | Швидкість X |
| `vy` | `number` | Швидкість Y |
| `size` | `number` | Розмір (радіус або ширина) |
| `life` | `number` | Залишковий час життя (секунди) |
| `maxLife` | `number` | Початковий час життя (для alpha) |
| `color` | `string` | Колір (CSS-рядок) |
| `gravity` | `number` | Гравітація (px/s²) |
| `active` | `boolean` | Чи активна частинка зараз |

**Методи**:
- `acquire(config)` — повертає вільну частинку або перезаписує найстарішу. Ніколи не створює нових об'єктів.
- `release(index)` — позначає частинку як неактивну, додає індекс у freeStack.
- `update(dt)` — оновлює фізику всіх активних частинок, автоматично release для частинок із life ≤ 0.
- `render(ctx, groundY, anchorX, camX)` — малює всі активні частинки.

**Валідація**: `maxSize >= 1`, `pool.length === maxSize`, кожен `acquire` гарантовано повертає валідний об'єкт.

---

## Entity: GradientCache

Кеш попередньо створених Canvas-градієнтів для фонових тем.

| Поле | Тип | Опис |
|------|-----|------|
| `store` | `Map<string, CanvasGradient>` | Мапа: ключ = `"themeName_gradientId"`, значення = градієнт |
| `dirty` | `boolean` | `true` після resize — усі градієнти потрібно перестворити |
| `lastW` | `number` | Ширина при останньому створенні градієнтів |
| `lastH` | `number` | Висота при останньому створенні градієнтів |

**Стратегія кешування**:
- Градієнти, що не залежать від `time` або `speed` (статичні небесні градієнти, тіньові підкладки) — кешуються за іменем теми.
- Градієнти, що залежать від `time` (пульсуючі, анімовані) — оновлюються покадрово, але з використанням `GradientCache` для уникнення повторних алокацій: значення градієнта змінюється через `addColorStop`, а не створюється новий об'єкт.
- Ключ формується як `"${themeName}_${gradientId}"`, наприклад `"inferno_core_coreGlow"`.

**Життєвий цикл**:
1. Створюється при першому рендері теми
2. Очищається при `reset()` або resize
3. Перестворюється при зміні теми

---

## Entity: FrameController

Контролер частоти кадрів для запобігання спіралі відставання.

| Поле | Тип | Опис |
|------|-----|------|
| `lastTime` | `number \| null` | Час останнього обробленого кадру (performance.now) |
| `maxDt` | `number` | Максимальний допустимий dt для виконання update+render (0.05s) |
| `skipThreshold` | `number` | Поріг dt, при якому кадр пропускається повністю (0.03s) |
| `skippedFrames` | `number` | Лічильник пропущених кадрів поспіль (для діагностики) |
| `maxSkippedFrames` | `number` | Максимальна кількість пропущених кадрів поспіль (10) — після цього кадр виконується примусово |

**Логіка в `frame(now)`**:
1. `dt = now - lastTime`
2. Якщо `lastTime === null` → `lastTime = now; return`
3. Якщо `dt > skipThreshold && skippedFrames < maxSkippedFrames` → `skippedFrames++; lastTime = now; return` (пропуск)
4. Інакше `dt = Math.min(dt / 1000, maxDt); skippedFrames = 0` → update(dt) + render()

**Стан**: без збереження, лише в пам'яті. Скидається при `visibilitychange` (document.hidden).

---

## Зв'язки між сутностями

```
FrameController (main.js)
    │
    ├── BackgroundCache (cache.js) ── використовує ── GradientCache (cache.js)
    │         │                                          │
    │         └── BackgroundRenderer (backgrounds.js) ───┘
    │
    ├── KeyboardCache (cache.js)
    │         │
    │         └── drawKeyboard() (keyboard.js)
    │
    ├── ParticlePool (cache.js)
    │         │
    │         ├── BackgroundRenderer.createParticles()
    │         ├── Engine (explode частинки)
    │         └── Engine (perfect частинки)
    │
    └── Engine (engine.js) ── рендерить на головний canvas
              │
              └── SKIN_RENDERERS (shadowBlur→gradient)
```

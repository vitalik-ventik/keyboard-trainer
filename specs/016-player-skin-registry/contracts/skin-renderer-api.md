# Contract: Skin Renderer API

**Feature**: Реєстр скінів гравця (31 рівень)
**Date**: 2026-07-19
**Target file**: `js/engine.js`

## 1. Розширення LEVELS_CONFIG (схема поля `skin`)

Кожен об'єкт підрівня в `LEVELS_CONFIG` отримує нове поле `skin` такого типу:

```typescript
// TypeScript-подібна нотація для документування контракту
interface SkinConfig {
    id: string;        // "skin_1_1" .. "skin_5_1" (31 унікальних значень)
    name: string;      // Українська назва, напр. "Стандартний Неон"
    renderType: string; // Ключ із SKIN_RENDERERS, напр. "neon_base"
}
```

**Приклад використання в конфігурації рівня**:
```javascript
{
    id: 1,
    leagueId: 1,
    name: "Перші кроки",
    letters: ["А","О","В","Л"],
    speed: 165,
    spikeCount: 12,
    seed: 2001,
    bgTheme: "cyber_grid",
    accentColor: "#00f6ff",
    rhythmGroups: false,
    skin: { id: "skin_1_1", name: "Стандартний Неон", renderType: "neon_base" }
}
```

## 2. Об'єкт диспетчеризації SKIN_RENDERERS

```typescript
type SkinRenderFn = (ctx: CanvasRenderingContext2D, size: number, time: number) => void;

interface SkinRenderers {
    [renderType: string]: SkinRenderFn;
}
```

**Контракт функції рендерингу**:
- `ctx` — контекст Canvas після `ctx.save(); ctx.translate(0,0); ctx.rotate(rotation)` — центр кубика в точці (0,0)
- `size` — розмір кубика (`CUBE_SIZE = 42`)
- `time` — `performance.now()` для динамічних скінів; статичні скіни ігнорують цей параметр
- Функція НЕ викликає `ctx.save()` / `ctx.restore()` — це робить зовнішній код `renderPlayer()`
- Усі координати малювання в межах: X від `-size/2` до `+size/2`, Y від `-size/2` до `+size/2` (крім скінів «Крилатий» та «Корона Майстра», які можуть виходити за межі)

**Повний словник renderType → функція**:

| renderType | Назва скіна | Рівень |
|------------|------------|--------|
| `neon_base` | Стандартний Неон | 1-1 |
| `cyber_eye` | Кібер-Око | 1-2 |
| `retro_gamer` | Ретро-Геймер | 1-3 |
| `throne` | Трон | 1-4 |
| `crosshair` | Приціл | 1-5 |
| `matrix_pixel` | Матричний Піксель | 1-6 |
| `slice` | Слайс | 1-7 |
| `shining_diamond` | Сяючий Алмаз | 1-8 |
| `double_frame` | Подвійна Рамка | 1-9 |
| `monolith` | Моноліт | 1-10 |
| `radar` | Радар | 1-11 |
| `speed_arrow` | Стріла Швидкості | 1-12 |
| `neon_cross` | Неоновий Хрест | 1-13 |
| `liquid_gradient` | Рідкий Градієнт | 1-14 |
| `winged` | Крилатий | 1-15 |
| `light_cup` | Кубок Світла | 1-16 |
| `synthwave_sun` | Synthwave Sun | 2-1 |
| `cyberpunk_horizon` | Кіберпанк Горизонт | 2-2 |
| `glitch_cube` | Глітч-Куб | 2-3 |
| `gold_ingot` | Золотий Злиток | 2-4 |
| `orbit` | Орбіта | 2-5 |
| `stalagmite` | Сталагміт | 2-6 |
| `equalizer` | Еквалайзер | 2-7 |
| `shield` | Щит | 2-8 |
| `plasma` | Плазма | 3-1 |
| `vortex` | Вортекс | 3-2 |
| `quantum_barrier` | Квантовий Бар'єр | 3-3 |
| `meteor` | Метеор | 3-4 |
| `galaxy` | Галактика | 4-1 |
| `master_crown` | Корона Майстра | 4-2 |
| `demon_lord` | ЛОРД ДЕМОНІВ | 5-1 |

## 3. Модифікація renderPlayer() — контракт

```javascript
renderPlayer(ctx, groundY, anchorX) {
    // ... існуюча перевірка alive, рендеринг trail ...

    // === НОВЕ: рендеринг скіна ===
    const centerY = groundY - this.player.y - CUBE_SIZE / 2;
    ctx.save();
    ctx.translate(anchorX, centerY);
    ctx.rotate(this.player.rotation);

    const skinConfig = this.level.skin;
    const renderFn = skinConfig ? SKIN_RENDERERS[skinConfig.renderType] : null;
    if (renderFn) {
        renderFn(ctx, CUBE_SIZE, this.currentTime);
    } else {
        // Fallback: базовий скін
        SKIN_RENDERERS.neon_base(ctx, CUBE_SIZE, this.currentTime);
    }

    ctx.restore();
}
```

## 4. Розширення SaveManager — контракт

### Нове поле в defaultSaveData()
```javascript
function defaultSaveData() {
    // ... існуюча логіка ...
    return {
        version: 1,
        settings: { /* без змін */ },
        progress: {
            unlocked: 1,
            unlockedSkins: [],  // NEW
            levels: { /* без змін */ }
        }
    };
}
```

### Модифікація save.recordResult()
```javascript
recordResult(levelId, pct, score) {
    // ... існуюча логіка bestPct/highScore ...

    // NEW: розблокування скіна
    if (pct >= 100) {
        const level = getLevelById(levelId);
        if (level && level.skin && !saveData.progress.unlockedSkins.includes(level.skin.id)) {
            saveData.progress.unlockedSkins.push(level.skin.id);
            this.persist();
            return { skinUnlocked: level.skin };
        }
    }
    // ...
}
```

### Модифікація sanitizeSaveData()
```javascript
// NEW: валідація unlockedSkins
if (!Array.isArray(saveData.progress.unlockedSkins)) {
    saveData.progress.unlockedSkins = [];
}
```

## 5. Розширення handleVictory() — контракт (main.js)

```javascript
function handleVictory() {
    // ... існуюча логіка recordResult ...

    const result = save.recordResult(currentLevelId, 100, runState.score);

    // NEW: сповіщення про розблокування скіна
    if (result && result.skinUnlocked) {
        victoryUnlockEl.textContent = "Розблоковано новий скін: " + result.skinUnlocked.name + "!";
    }
    // ... решта існуючої логіки (nextLevel) ...
}
```

## 6. Розширення Engine — контракт

### Нове поле `currentTime`
```javascript
constructor(levelId, difficulty, demoMode, hitWindow, speed, leagueInfo) {
    // ... існуюча логіка ...
    this.currentTime = 0; // NEW: для динамічних скінів
}
```

### Оновлення в `update()`
```javascript
update(dt) {
    this.currentTime = performance.now(); // NEW
    // ... решта логіки ...
}
```

### Очищення в `reset()`
```javascript
reset() {
    // ... існуюча логіка ...
    this.player.meteorTrail = []; // NEW: для скіна Метеор (3-4)
    // ...
}
```

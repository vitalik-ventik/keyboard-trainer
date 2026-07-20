# Contract: Skin Glow Enhancement

**Feature**: 017-score-achievement-ui
**Module**: `js/engine.js` (renderPlayer extension), `js/main.js` (skin grid extension)
**Type**: Rendering contract

---

## Engine: `renderPlayer()` Extension

### Pre-Rendering: Golden Glow (perfectHard)

Перед викликом `renderFn()` встановити `shadowBlur` та `shadowColor`, якщо досягнення `"hard"`:

```js
// Line ~1617, before renderFn call:
const achievement = save.getLevelAchievement(this.level.id);

if (achievement === 'hard') {
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ffaa00';
}

// ... existing renderFn call ...

if (achievement === 'hard') {
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
}
```

### Post-Rendering: Silver Outline (perfectEasy)

Після рендерингу скіна намалювати контур, якщо досягнення `"easy"`:

```js
// After renderFn call and ctx.restore(), before returning:
if (achievement === 'easy') {
    ctx.save();
    ctx.translate(anchorX, centerY);
    ctx.rotate(this.player.rotation);
    ctx.strokeStyle = '#d4dce8';
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(200, 210, 225, 0.6)';
    ctx.strokeRect(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE, CUBE_SIZE);
    ctx.shadowBlur = 0;
    ctx.restore();
}
```

### Gold Trail During Jumps (perfectHard)

Розширення існуючої системи trail (рядки 1604-1611) для золотих частинок:

```js
// After existing trail rendering:
if (achievement === 'hard' && !this.player.onGround && this.player.vy !== 0) {
    this.player.goldTrail = this.player.goldTrail || [];
    this.player.goldTrail.push({
        x: this.player.x,
        y: this.player.y + CUBE_SIZE / 2,
        alpha: 1.0,
        time: this.currentTime
    });

    // Render gold trail particles
    for (let i = this.player.goldTrail.length - 1; i >= 0; i--) {
        const gp = this.player.goldTrail[i];
        const age = this.currentTime - gp.time;
        gp.alpha = Math.max(0, 1.0 - age / 0.4);
        if (gp.alpha <= 0) {
            this.player.goldTrail.splice(i, 1);
            continue;
        }
        const px = anchorX + (gp.x - this.player.x);
        const py = groundY - gp.y - CUBE_SIZE / 2;
        ctx.fillStyle = 'rgba(255, 200, 40, ' + (gp.alpha * 0.5) + ')';
        ctx.beginPath();
        ctx.arc(px, py, 4 * gp.alpha, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Limit trail size
if (this.player.goldTrail && this.player.goldTrail.length > 15) {
    this.player.goldTrail.splice(0, this.player.goldTrail.length - 15);
}
```

### Performance Constraint

- `shadowBlur = 18`: тестувати FPS на інтегрованій графіці. Якщо падіння нижче 55 FPS → зменшити до 14.
- Золотий шлейф — максимум 15 частинок, кожна живе 0.4 секунди
- `goldTrail` очищається в `Engine.reset()` разом із `this.player.trail`

---

## Main Menu: Skin Grid Enhancement

### `buildSkinGrid()` Extension (main.js ~611)

Після створення `.skin-card` для кожного рівня, додати CSS-клас на основі досягнення:

```js
// After creating skinCard div:
const levelId = level.id;
const achievement = save.getLevelAchievement(levelId);
if (achievement === 'easy') {
    skinCard.classList.add('perfect-silver');
} else if (achievement === 'hard') {
    skinCard.classList.add('perfect-gold');
}
```

### CSS Requirements (style.css)

```css
/* Silver contour for skin cards */
.skin-card.perfect-silver {
    border-color: #b0b8c8;
    box-shadow: 0 0 10px rgba(192, 200, 216, 0.5);
}

/* Gold glow for skin cards */
.skin-card.perfect-gold {
    border-color: #ffd700;
    box-shadow: 0 0 16px rgba(255, 215, 0, 0.6), 0 0 28px rgba(255, 180, 0, 0.3);
    animation: goldPulse 2s ease-in-out infinite;
}
```

---

## Main Menu: Level Cards Enhancement

### `buildLevelCards()` Extension (main.js ~262)

Після створення `.level-card`, додати CSS-клас та елемент зірки:

```js
// After creating card div:
const achievement = save.getLevelAchievement(level.id);

// Add star element for perfect levels
if (achievement) {
    const star = document.createElement('div');
    star.className = 'level-star';
    star.textContent = '\u2605'; // ★
    card.appendChild(star);
}

// Add CSS class
if (achievement === 'easy') {
    card.classList.add('perfect-silver');
} else if (achievement === 'hard') {
    card.classList.add('perfect-gold');
}
```

### CSS Requirements (style.css)

```css
/* Silver perfect level card */
.level-card.perfect-silver {
    border: 0.25vmin solid #b0b8c8;
    box-shadow: 0 0 10px rgba(192, 200, 216, 0.5);
}

/* Gold perfect level card */
.level-card.perfect-gold {
    border: 0.45vmin solid transparent;
    border-image: linear-gradient(135deg, #ffd700, #b8860b, #ffd700, #8b6914) 1;
    animation: goldPulse 2s ease-in-out infinite;
}

@keyframes goldPulse {
    0%, 100% {
        box-shadow: 0 0 14px rgba(255, 215, 0, 0.5), 0 0 28px rgba(255, 180, 0, 0.2), inset 0 0 20px rgba(255, 215, 0, 0.08);
        transform: scale(1);
    }
    50% {
        box-shadow: 0 0 24px rgba(255, 215, 0, 0.85), 0 0 48px rgba(255, 180, 0, 0.45), inset 0 0 32px rgba(255, 215, 0, 0.18);
        transform: scale(1.03);
    }
}

/* Silver star */
.level-star {
    font-size: 3vmin;
    line-height: 1;
    margin-bottom: -0.4vmin;
}

.perfect-silver .level-star {
    background: linear-gradient(180deg, #ffffff 0%, #b0b8c8 40%, #6b7280 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 8px rgba(192, 200, 216, 0.6);
}

/* Gold star */
.perfect-gold .level-star {
    background: linear-gradient(180deg, #fff7cc 0%, #ffd700 30%, #b8860b 70%, #8b6914 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 14px rgba(255, 215, 0, 0.8), 0 0 28px rgba(255, 180, 0, 0.4);
    animation: goldStarPulse 1.5s ease-in-out infinite;
}

@keyframes goldStarPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
}

/* Override hover transform for gold cards (animation handles it) */
.level-card.perfect-gold:hover {
    transform: translateY(-0.6vmin) scale(1.03);
}
```

// ============================================================
// cache.js — кешування та оптимізація рендерингу
// ParticlePool, GradientCache, FrameController,
// BackgroundCache, KeyboardCache
// Конституція, Принципи II, III, VI
// ============================================================

// ---------- ParticlePool (FR-004) ----------

export class ParticlePool {
    constructor(maxSize) {
        this.maxSize = maxSize || 30;
        this.activeCount = 0;
        this.freeStack = [];
        this.pool = [];
        for (var i = 0; i < this.maxSize; i++) {
            this.pool.push({
                x: 0, y: 0, vx: 0, vy: 0,
                size: 0, life: 0, maxLife: 0,
                color: "#ffffff", gravity: 0, active: false
            });
            this.freeStack.push(i);
        }
    }

    acquire(config) {
        var idx;
        if (this.freeStack.length > 0) {
            idx = this.freeStack.pop();
        } else {
            var minLife = Infinity;
            var minIdx = -1;
            for (var i = 0; i < this.maxSize; i++) {
                if (this.pool[i].life < minLife) {
                    minLife = this.pool[i].life;
                    minIdx = i;
                }
            }
            if (minIdx >= 0) {
                this.release(minIdx);
                idx = this.freeStack.pop();
            }
        }
        if (idx === undefined) {
            return null;
        }
        var p = this.pool[idx];
        p.x = config.x || 0;
        p.y = config.y || 0;
        p.vx = config.vx || 0;
        p.vy = config.vy || 0;
        p.size = config.size || 2;
        p.life = config.life || 0.5;
        p.maxLife = p.life;
        p.color = config.color || "#ffffff";
        p.gravity = config.gravity || 400;
        p.active = true;
        this.activeCount++;
        return idx;
    }

    release(idx) {
        if (idx < 0 || idx >= this.maxSize) return;
        this.pool[idx].active = false;
        this.activeCount = Math.max(0, this.activeCount - 1);
        this.freeStack.push(idx);
    }

    update(dt) {
        for (var i = 0; i < this.maxSize; i++) {
            var p = this.pool[i];
            if (!p.active) continue;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.gravity * dt;
            p.life -= dt;
            if (p.life <= 0) {
                this.release(i);
            }
        }
    }

    render(ctx, groundY, anchorX, camX) {
        for (var i = 0; i < this.maxSize; i++) {
            var p = this.pool[i];
            if (!p.active) continue;
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            ctx.fillStyle = p.color;
            ctx.fillRect(
                p.x - camX + anchorX - p.size / 2,
                groundY - p.y - p.size / 2,
                p.size, p.size
            );
        }
        ctx.globalAlpha = 1;
    }

    reset() {
        for (var i = 0; i < this.maxSize; i++) {
            this.pool[i].active = false;
        }
        this.activeCount = 0;
        this.freeStack = [];
        for (var j = 0; j < this.maxSize; j++) {
            this.freeStack.push(j);
        }
    }

    getActiveParticles() {
        var result = [];
        for (var i = 0; i < this.maxSize; i++) {
            if (this.pool[i].active) {
                result.push(this.pool[i]);
            }
        }
        return result;
    }
}

// ---------- GradientCache (FR-005) ----------

export class GradientCache {
    constructor() {
        this.store = new Map();
        this.dirty = true;
        this.lastW = 0;
        this.lastH = 0;
    }

    get(key, createFn, ctx) {
        if (this.dirty) {
            this.store.clear();
            this.dirty = false;
        }
        if (this.store.has(key)) {
            return this.store.get(key);
        }
        if (typeof createFn !== "function") {
            return null;
        }
        var gradient = createFn(ctx);
        if (gradient) {
            this.store.set(key, gradient);
        }
        return gradient;
    }

    invalidate(w, h) {
        this.lastW = w;
        this.lastH = h;
        this.dirty = true;
    }

    clear() {
        this.store.clear();
        this.dirty = true;
    }
}

// ---------- FrameController (FR-006) ----------

export class FrameController {
    constructor() {
        this.lastTime = null;
        this.maxDt = 0.05;
        // Пропускаємо кадр лише після довгої паузи (перемикання вкладки, зависання),
        // щоб не зробити один гігантський крок. Звичайні повільні кадри (30 fps)
        // не пропускаються — інакше гра сповільнюється в рази.
        this.pauseThreshold = 0.25;
    }

    shouldSkip(dt, time) {
        if (this.lastTime === null) {
            this.lastTime = time;
            return true;
        }
        if (dt / 1000 > this.pauseThreshold) {
            this.lastTime = time;
            return true;
        }
        return false;
    }

    clampDt(dt) {
        return Math.min(dt / 1000, this.maxDt);
    }

    advance(time) {
        this.lastTime = time;
    }

    reset() {
        this.lastTime = null;
    }
}

// ---------- KeyboardCache (FR-001, FR-002) ----------

export class KeyboardCache {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.width = 0;
        this.height = 0;
        this.lastTargetLetter = null;
        this.lastGroupLetters = "";
        this.lastWrongKeyLetter = null;
        this.dpr = 1;
        this.dirty = true;
    }

    shouldUpdate(targetLetter, groupLetters, wrongKeyLetter) {
        if (this.dirty) {
            return true;
        }
        var groupStr = (groupLetters || []).join(",");
        if (targetLetter !== this.lastTargetLetter ||
            groupStr !== this.lastGroupLetters ||
            wrongKeyLetter !== this.lastWrongKeyLetter) {
            return true;
        }
        return false;
    }

    markDirty() {
        this.dirty = true;
    }

    setState(targetLetter, groupLetters, wrongKeyLetter) {
        var groupStr = (groupLetters || []).join(",");
        var changed = targetLetter !== this.lastTargetLetter ||
            groupStr !== this.lastGroupLetters ||
            wrongKeyLetter !== this.lastWrongKeyLetter;
        this.lastTargetLetter = targetLetter;
        this.lastGroupLetters = groupStr;
        this.lastWrongKeyLetter = wrongKeyLetter;
        if (changed) {
            this.dirty = true;
        }
    }

    // Полотно кешу має фізичний розмір (w × dpr), щоб літери були чіткими
    // при масштабі Windows 125–150%
    resize(w, h, dpr) {
        var ratio = dpr || 1;
        if (this.width !== w || this.height !== h || this.dpr !== ratio) {
            this.width = w;
            this.height = h;
            this.dpr = ratio;
            this.canvas.width = Math.round(w * ratio);
            this.canvas.height = Math.round(h * ratio);
            this.dirty = true;
        }
    }

    render(drawFn) {
        if (!this.dirty) return;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        if (typeof drawFn === "function") {
            drawFn(this.ctx);
        }
        this.dirty = false;
    }

    drawImage(ctx, x, y) {
        if (this.canvas.width > 0 && this.canvas.height > 0) {
            ctx.drawImage(this.canvas, x, y, this.width, this.height);
        }
    }

    destroy() {
        this.canvas.width = 0;
        this.canvas.height = 0;
    }
}

// ---------- Адаптивна якість фону ----------

// Якщо кадри стабільно повільні (довше 25 мс, тобто нижче ~40 fps, сумарно 2 с),
// фон рендериться в меншій роздільній здатності (1 → 0.75 → 0.5) і розтягується
// на екран. Фони розмиті й неонові, тож різниця майже непомітна, а пікселів у 2–4 рази менше.
export const BackgroundQuality = {
    scale: 1,
    minScale: 0.5,
    // 0 — фон щокадру; якщо навіть мінімальної якості замало, фон малюється ~20 разів/с
    redrawInterval: 0,
    slowFrameThreshold: 25,
    slowBudgetMs: 2000,
    slowTime: 0,

    report(frameMs) {
        if (!(frameMs > 0) || frameMs > 250) {
            return;
        }
        if (frameMs > this.slowFrameThreshold) {
            this.slowTime += frameMs;
        } else {
            this.slowTime = Math.max(0, this.slowTime - frameMs * 0.5);
        }
        if (this.slowTime >= this.slowBudgetMs) {
            if (this.scale > this.minScale) {
                this.scale = Math.max(this.minScale, this.scale - 0.25);
            } else {
                this.redrawInterval = 0.045;
            }
            this.slowTime = 0;
        }
    }
};

// ---------- BackgroundCache (FR-001) ----------

export class BackgroundCache {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.width = 0;
        this.height = 0;
        this.scale = 1;
        this.currentTheme = null;
        this.lastRenderTime = null;
        this.dirty = true;
        this.isInitialized = false;
    }

    shouldUpdate(time) {
        if (this.dirty || this.lastRenderTime === null) return true;
        if (time < this.lastRenderTime || time - this.lastRenderTime >= BackgroundQuality.redrawInterval) {
            return true;
        }
        return false;
    }

    // Фон рендериться в повній роздільній здатності екрана (з урахуванням масштабу Windows,
    // але не більше 2×), помноженій на адаптивну якість
    resize(w, h) {
        var dpr = Math.min(2, (typeof window !== "undefined" && window.devicePixelRatio) || 1);
        var scale = dpr * BackgroundQuality.scale;
        if (this.width !== w || this.height !== h || this.scale !== scale) {
            this.width = w;
            this.height = h;
            this.scale = scale;
            this.canvas.width = Math.max(1, Math.round(w * scale));
            this.canvas.height = Math.max(1, Math.round(h * scale));
            this.dirty = true;
            this.isInitialized = false;
        }
    }

    setTheme(theme) {
        if (this.currentTheme !== theme) {
            this.currentTheme = theme;
            this.dirty = true;
            this.isInitialized = false;
        }
    }

    render(renderFn, time) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
        // Буфери сцен масштабуються без згладжування — піксельна графіка лишається чіткою
        this.ctx.imageSmoothingEnabled = false;
        if (typeof renderFn === "function") {
            renderFn(this.ctx);
        }
        this.lastRenderTime = time;
        this.isInitialized = true;
        this.dirty = false;
    }

    drawImage(ctx) {
        if (this.isInitialized && this.canvas.width > 0 && this.canvas.height > 0) {
            ctx.drawImage(this.canvas, 0, 0, this.width, this.height);
        }
    }

    reset() {
        this.dirty = true;
        this.isInitialized = false;
        this.currentTheme = null;
        this.lastRenderTime = null;
    }

    destroy() {
        this.canvas.width = 0;
        this.canvas.height = 0;
    }
}

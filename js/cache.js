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
        this.skipThreshold = 0.03;
        this.skippedFrames = 0;
        this.maxSkippedFrames = 10;
    }

    shouldSkip(dt, time) {
        if (this.lastTime === null) {
            this.lastTime = time;
            return true;
        }
        var dtSeconds = dt / 1000;
        if (dtSeconds > this.skipThreshold && this.skippedFrames < this.maxSkippedFrames) {
            this.skippedFrames++;
            this.lastTime = time;
            return true;
        }
        this.skippedFrames = 0;
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
        this.skippedFrames = 0;
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
        this.dirty = true;
    }

    shouldUpdate(targetLetter, groupLetters, wrongKeyLetter) {
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

    resize(w, h) {
        if (this.width !== w || this.height !== h) {
            this.width = w;
            this.height = h;
            this.canvas.width = Math.round(w);
            this.canvas.height = Math.round(h);
            this.dirty = true;
        }
    }

    render(drawFn) {
        if (!this.dirty) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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

// ---------- BackgroundCache (FR-001) ----------

export class BackgroundCache {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.width = 0;
        this.height = 0;
        this.currentTheme = null;
        this.frameCounter = 0;
        this.skipFrames = 3;
        this.dirty = true;
        this.isInitialized = false;
    }

    shouldUpdate() {
        if (this.dirty) return true;
        this.frameCounter++;
        if (this.frameCounter >= this.skipFrames) {
            this.frameCounter = 0;
            return true;
        }
        return false;
    }

    incrementFrame() {
        this.frameCounter++;
        if (this.frameCounter >= this.skipFrames) {
            this.frameCounter = 0;
        }
    }

    resize(w, h) {
        if (this.width !== w || this.height !== h) {
            this.width = w;
            this.height = h;
            this.canvas.width = Math.round(w);
            this.canvas.height = Math.round(h);
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

    render(renderFn) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (typeof renderFn === "function") {
            renderFn(this.ctx);
        }
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
        this.frameCounter = 0;
    }

    destroy() {
        this.canvas.width = 0;
        this.canvas.height = 0;
    }
}

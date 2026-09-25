// preview.js — сторінка перегляду всіх фонів і скінів (preview.html)
import { LEVELS_CONFIG, ALL_LEVELS, SKIN_RENDERERS, drawAchievementFrame } from "./engine.js";
import { BackgroundRenderer } from "./backgrounds.js";

const grid = document.getElementById("grid");
const errorEl = document.getElementById("error");

if (!LEVELS_CONFIG || !ALL_LEVELS || !BackgroundRenderer || !SKIN_RENDERERS) {
    errorEl.style.display = "block";
    throw new Error("Modules not loaded");
}

const cards = [];
const DPR = window.devicePixelRatio || 1;
const CARD_ASPECT = 16 / 9;
const GROUND_RATIO = 0.64;
const PLAYER_ANCHOR = 0.28;
const THUMB_SIZE = 56;
const THUMB_VARIANTS = [
    { label: "Звичайний", achievement: null },
    { label: "Срібло", achievement: "easy" },
    { label: "Золото", achievement: "hard" }
];
// Розмір кубика в грі (CUBE_SIZE) відносно висоти екрана ~900 px
const GAME_CUBE_SIZE = 42;
const GAME_REFERENCE_HEIGHT = 900;

function resizeCanvases() {
    const gridWidth = grid.clientWidth;
    const cardW = gridWidth;
    const cardH = Math.round(gridWidth / CARD_ASPECT);
    for (const c of cards) {
        c.canvas.width = Math.round(cardW * DPR);
        c.canvas.height = Math.round(cardH * DPR);
        c.canvas.style.width = cardW + "px";
        c.canvas.style.height = cardH + "px";
        c.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        c.w = cardW;
        c.h = cardH;
    }
}

window.addEventListener("resize", resizeCanvases);

// Анімуємо лише видимі картки — інакше сторінка малює 31 великий фон щокадру
const observer = new IntersectionObserver(function (entries) {
    for (const entry of entries) {
        const card = cards.find(function (c) { return c.element === entry.target; });
        if (card) {
            card.visible = entry.isIntersecting;
        }
    }
}, { rootMargin: "100px 0px" });

for (const level of ALL_LEVELS) {
    const league = LEVELS_CONFIG.find(lg => lg.id === level.leagueId);
    const levelIdx = league ? league.levels.indexOf(level) + 1 : 0;

    const card = document.createElement("div");
    card.className = "card";

    const canvas = document.createElement("canvas");

    const info = document.createElement("div");
    info.className = "card-info";

    // Три мініатюри скіна: без досягнення, срібна (EASY) та золота (HARD) рамка
    const thumbs = document.createElement("div");
    thumbs.className = "skin-thumbs";
    const thumbCtxs = [];
    for (const variant of THUMB_VARIANTS) {
        const wrap = document.createElement("div");
        wrap.className = "skin-thumb-wrap";
        const thumb = document.createElement("canvas");
        thumb.className = "skin-thumb";
        thumb.width = Math.round(THUMB_SIZE * DPR);
        thumb.height = Math.round(THUMB_SIZE * DPR);
        const tctx = thumb.getContext("2d");
        tctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        const caption = document.createElement("span");
        caption.textContent = variant.label;
        wrap.appendChild(thumb);
        wrap.appendChild(caption);
        thumbs.appendChild(wrap);
        thumbCtxs.push({ ctx: tctx, achievement: variant.achievement });
    }

    const text = document.createElement("div");
    text.className = "card-text";
    text.innerHTML =
        '<span class="card-name">' + level.leagueId + "-" + levelIdx + ": " + level.name + '</span><br>' +
        '<span class="card-league">Ліга: ' + (league ? league.name : "?") + '  |  Lv.' + level.id + '</span><br>' +
        '<span class="card-theme">Фон: ' + level.bgTheme + '</span>  ' +
        '<span class="card-skin">Скін: ' + (level.skin ? level.skin.name + " (" + level.skin.renderType + ")" : "—") + '</span>';

    const perf = document.createElement("div");
    perf.className = "card-perf";
    perf.textContent = "";

    info.appendChild(thumbs);
    info.appendChild(text);
    info.appendChild(perf);
    card.appendChild(canvas);
    card.appendChild(info);
    grid.appendChild(card);

    const entry = {
        element: card,
        canvas: canvas,
        ctx: canvas.getContext("2d"),
        thumbCtxs: thumbCtxs,
        perfEl: perf,
        level: level,
        w: 0,
        h: 0,
        visible: false
    };
    cards.push(entry);
    observer.observe(card);
}

resizeCanvases();

function getSkinRenderer(level) {
    if (level.skin && SKIN_RENDERERS[level.skin.renderType]) {
        return SKIN_RENDERERS[level.skin.renderType];
    }
    return SKIN_RENDERERS.neon_base;
}

function drawGround(ctx, w, groundY, accent) {
    ctx.fillStyle = "#070b1c";
    ctx.fillRect(0, groundY, w, 3);
    ctx.strokeStyle = accent || "#00f6ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();
}

function drawSkin(ctx, renderFn, x, y, size, nowMs) {
    ctx.save();
    ctx.translate(x, y);
    renderFn(ctx, size, nowMs, { onGround: true, vy: 0, rotation: 0 });
    ctx.restore();
}

// Замір: кожен фон малюється кілька разів у полотні розміру екрана; getImageData
// змушує браузер справді виконати малювання (інакше вимірюється лише черга команд)
const BENCH_WARMUP = 3;
const BENCH_FRAMES = 15;

function benchmarkLevel(level, benchCtx, w, h) {
    const groundY = h * GROUND_RATIO;
    BackgroundRenderer.init(w, h, groundY);
    for (let i = 0; i < BENCH_WARMUP; i++) {
        BackgroundRenderer.render(benchCtx, level.bgTheme, w, h, groundY, i * 0.05, level.speed, level.accentColor, level.id);
    }
    benchCtx.getImageData(0, 0, 1, 1);
    const t0 = performance.now();
    for (let i = 0; i < BENCH_FRAMES; i++) {
        BackgroundRenderer.render(benchCtx, level.bgTheme, w, h, groundY, 1 + i * 0.05, level.speed, level.accentColor, level.id);
    }
    benchCtx.getImageData(0, 0, 1, 1);
    return (performance.now() - t0) / BENCH_FRAMES;
}

function showPerf(card, ms) {
    card.perfEl.textContent = "Фон: " + ms.toFixed(1) + " мс";
    card.perfEl.className = "card-perf " + (ms < 4 ? "perf-ok" : ms < 10 ? "perf-mid" : "perf-slow");
}

let benchRunning = false;
const btnBench = document.getElementById("btnBench");
const benchStatus = document.getElementById("benchStatus");

btnBench.addEventListener("click", function () {
    if (benchRunning) {
        return;
    }
    benchRunning = true;
    btnBench.disabled = true;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const benchCanvas = document.createElement("canvas");
    benchCanvas.width = w;
    benchCanvas.height = h;
    const benchCtx = benchCanvas.getContext("2d");
    const results = [];
    let index = 0;

    // По одному фону за кадр, щоб сторінка не зависала
    function step() {
        if (index >= cards.length) {
            benchRunning = false;
            btnBench.disabled = false;
            results.sort(function (a, b) { return b.ms - a.ms; });
            const avg = results.reduce(function (sum, r) { return sum + r.ms; }, 0) / results.length;
            benchStatus.textContent = "Середнє: " + avg.toFixed(1) + " мс, найповільніший: " +
                results[0].theme + " (" + results[0].ms.toFixed(1) + " мс)";
            return;
        }
        const card = cards[index];
        benchStatus.textContent = "Замір " + (index + 1) + " / " + cards.length + "…";
        const ms = benchmarkLevel(card.level, benchCtx, w, h);
        showPerf(card, ms);
        results.push({ theme: card.level.bgTheme, ms: ms });
        index++;
        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
});

function renderCard(c, time, nowMs) {
    const w = c.w;
    const h = c.h;
    const groundY = h * GROUND_RATIO;
    const previewSpeed = c.level.speed * 0.35;
    BackgroundRenderer.render(c.ctx, c.level.bgTheme, w, h, groundY, time, previewSpeed, c.level.accentColor, c.level.id);

    drawGround(c.ctx, w, groundY, c.level.accentColor);
    const renderFn = getSkinRenderer(c.level);
    const cubeSize = Math.max(24, GAME_CUBE_SIZE * h / GAME_REFERENCE_HEIGHT);
    drawSkin(c.ctx, renderFn, w * PLAYER_ANCHOR, groundY - cubeSize / 2, cubeSize, nowMs);

    for (const t of c.thumbCtxs) {
        t.ctx.clearRect(0, 0, THUMB_SIZE, THUMB_SIZE);
        t.ctx.save();
        t.ctx.translate(THUMB_SIZE / 2, THUMB_SIZE / 2);
        renderFn(t.ctx, THUMB_SIZE * 0.6, nowMs, { onGround: true, vy: 0, rotation: 0 });
        drawAchievementFrame(t.ctx, THUMB_SIZE * 0.6, t.achievement, nowMs);
        t.ctx.restore();
    }
}

const fpsEl = document.getElementById("fps");
let fpsFrames = 0;
let fpsStart = null;

function frame(now) {
    const time = now / 1000;
    if (!benchRunning) {
        for (const c of cards) {
            if (c.visible) {
                renderCard(c, time, now);
            }
        }
    }
    fpsFrames++;
    if (fpsStart === null) {
        fpsStart = now;
    } else if (now - fpsStart >= 1000) {
        fpsEl.textContent = "FPS: " + Math.round(fpsFrames * 1000 / (now - fpsStart));
        fpsFrames = 0;
        fpsStart = now;
    }
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

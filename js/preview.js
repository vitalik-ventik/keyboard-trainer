// preview.js — сторінка перегляду всіх фонів і скінів (preview.html)
import { LEVELS_CONFIG, ALL_LEVELS, SKIN_RENDERERS, drawAchievementFrame } from "./engine.js";
import { BackgroundRenderer } from "./backgrounds.js";
import { SHOP_ITEMS, SHOP_TYPES, CHEST_TYPES, REPLAY_CHEST_CHANCE, CHEST_PITY_WINS, chestItemPool, rollChest, getShopItem, itemRarity, coinsText, heartsText, weaponCoinBonus, itemPerkText } from "./shop.js";
import { drawShopItemScene, drawChestScene, CHEST_SHAKE_MS, CHEST_OPEN_MS } from "./shop_preview.js";
import { loadAssets, unlockAudio, playSound, SOUND_NAMES, hasSound, soundDuration } from "./assets.js";
import { WEAPON_SOUNDS, weaponDemoEvents } from "./weapons.js";
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS, buildAchievementCard, buildAchievementToast } from "./achievements.js";

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
        '<span class="card-skin">Скін: ' + (level.skin ? level.skin.name + " (" + level.skin.renderType + ")" : "—") + '</span>  ' +
        '<span class="card-egg">Пасхалка: ' + BackgroundRenderer.easterEggType(level.bgTheme) + '</span>';

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

// Стан рівня для фону: прогрес (сюжет світу), пасхалка й погода — як у грі
const progressModeEl = document.getElementById("progressMode");
const eggToggleEl = document.getElementById("eggToggle");
const weatherModeEl = document.getElementById("weatherMode");
const progressLabelEl = document.getElementById("progressLabel");
const PREVIEW_PROGRESS_LOOP = 20;
// Пасхалка триває 5 с (як у грі) і повторюється кожні 9 с
const PREVIEW_EGG_PERIOD = 9;
const PREVIEW_EGG_TIME = 5;

function previewEffects(time) {
    const mode = progressModeEl ? progressModeEl.value : "auto";
    const progress = mode === "auto" ? (time % PREVIEW_PROGRESS_LOOP) / PREVIEW_PROGRESS_LOOP : Number(mode);
    const eggPhase = time % PREVIEW_EGG_PERIOD;
    const eggOn = !eggToggleEl || eggToggleEl.checked;
    return {
        progress: progress,
        combo: 0,
        perfect: 0,
        eggT: eggOn && eggPhase < PREVIEW_EGG_TIME ? eggPhase / PREVIEW_EGG_TIME : null,
        weather: weatherModeEl ? weatherModeEl.value : "clear",
        camY: 0,
        oops: 0
    };
}

function renderCard(c, time, nowMs) {
    const w = c.w;
    const h = c.h;
    const groundY = h * GROUND_RATIO;
    BackgroundRenderer.setEffects(previewEffects(time));
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

// ---------- Магазин: усі товари з увімкненими анімаціями ----------

const SHOP_SCALE = 1.5;
const SHOP_W = 150;
const SHOP_H = 100;
const REQUIREMENT_TEXT = {
    boss: function () { return "Умова: пройти Боса (5-1)"; },
    gold_count: function (req) { return "Умова: " + req.target + " золотих рамок"; },
    gold_league: function (req) { return "Умова: золото на всіх рівнях Ліги " + req.league; },
    clears: function (req) { return "Умова: пройти " + req.target + " рівнів"; },
    combo_levels: function () { return "Умова: пройти всі рівні-комбінації"; },
    achievements: function (req) { return "Умова: " + req.target + " досягнень"; }
};
const shopCards = [];
const shopSectionsEl = document.getElementById("shopSections");

const shopObserver = new IntersectionObserver(function (entries) {
    for (const entry of entries) {
        const card = shopCards.find(function (c) { return c.element === entry.target; }) ||
            chestCards.find(function (c) { return c.element === entry.target; });
        if (card) {
            card.visible = entry.isIntersecting;
        }
    }
}, { rootMargin: "100px 0px" });

if (shopSectionsEl) {
    for (const type of SHOP_TYPES) {
        const title = document.createElement("h2");
        title.className = "shop-type-title";
        title.textContent = type.name;
        shopSectionsEl.appendChild(title);
        const list = document.createElement("div");
        list.className = "shop-items";
        shopSectionsEl.appendChild(list);
        for (const item of SHOP_ITEMS) {
            if (item.type !== type.type) {
                continue;
            }
            const card = document.createElement("div");
            card.className = "shop-item" + (item.legendary ? " legendary" : "");
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(SHOP_W * SHOP_SCALE * DPR);
            canvas.height = Math.round(SHOP_H * SHOP_SCALE * DPR);
            canvas.style.width = SHOP_W * SHOP_SCALE + "px";
            canvas.style.height = SHOP_H * SHOP_SCALE + "px";
            const name = document.createElement("span");
            name.className = "shop-item-name";
            name.textContent = (item.legendary ? "⭐ " : "") + item.name;
            const meta = document.createElement("span");
            meta.className = "shop-item-meta";
            meta.textContent = (item.price > 0 ? "🪙 " + item.price : "безкоштовно") + " · " + item.id +
                (item.type === "weapon" && weaponCoinBonus(item.id) > 1 ? " · монети ×" + weaponCoinBonus(item.id) : "") +
                (itemPerkText(item.id) ? " · " + itemPerkText(item.id) : "");
            card.appendChild(canvas);
            card.appendChild(name);
            card.appendChild(meta);
            if (item.requirement && REQUIREMENT_TEXT[item.requirement.kind]) {
                const req = document.createElement("span");
                req.className = "shop-item-req";
                req.textContent = REQUIREMENT_TEXT[item.requirement.kind](item.requirement);
                card.appendChild(req);
            }
            list.appendChild(card);
            const entry = { element: card, ctx: canvas.getContext("2d"), item: item, visible: false, soundOn: false, lastNow: 0 };
            if (WEAPON_SOUNDS[item.id]) {
                // Клік по картці зброї вмикає її звуки синхронно з анімацією
                card.classList.add("has-sound");
                const hint = document.createElement("span");
                hint.className = "shop-item-sound";
                hint.textContent = "🔊 клацни, щоб чути звук разом з анімацією";
                card.appendChild(hint);
                card.addEventListener("click", function () {
                    enableAudio().then(function () {
                        entry.soundOn = !entry.soundOn;
                        entry.lastNow = performance.now();
                        card.classList.toggle("sound-on", entry.soundOn);
                        hint.textContent = entry.soundOn ? "🔊 звучить — клацни ще раз, щоб вимкнути" : "🔊 клацни, щоб чути звук разом з анімацією";
                    });
                });
            }
            shopCards.push(entry);
            shopObserver.observe(card);
        }
    }
}

function renderShopCard(c, nowMs) {
    c.ctx.setTransform(DPR * SHOP_SCALE, 0, 0, DPR * SHOP_SCALE, 0, 0);
    try {
        drawShopItemScene(c.ctx, c.item, nowMs, { skinType: "neon_base", accessory: null });
    } catch (err) {
        if (!c.errorShown) {
            c.errorShown = true;
            console.warn("Помилка прев'ю товару " + c.item.id + ":", err);
        }
    }
}

// ---------- Перевірка звуків ----------

const EVENT_LABELS = { fire: "постріл", swing: "мах", hit: "удар" };
const soundPanel = document.getElementById("soundPanel");
let audioReady = false;
let audioLoading = null;
let soundStatusEl = null;
let sequenceTimers = [];

function weaponName(id) {
    const item = SHOP_ITEMS.find(function (i) { return i.id === id; });
    return item ? item.name : id;
}

// Звук вмикається лише після кліку (правило браузера); файли вантажаться один раз
function enableAudio() {
    unlockAudio();
    if (!audioLoading) {
        if (soundStatusEl) {
            soundStatusEl.textContent = "Завантаження звуків…";
        }
        audioLoading = loadAssets(function (loaded, total) {
            if (soundStatusEl) {
                soundStatusEl.textContent = "Завантаження: " + loaded + " / " + total;
            }
        }).then(function () {
            audioReady = true;
            unlockAudio();
            refreshSoundRows();
        });
    }
    return audioLoading;
}

// Звуки, прив'язані до кожного файлу: [{ weapon, event, cue }]
function cuesForSound(name) {
    const out = [];
    for (const id of Object.keys(WEAPON_SOUNDS)) {
        for (const event of Object.keys(WEAPON_SOUNDS[id])) {
            if (WEAPON_SOUNDS[id][event].sound === name) {
                out.push({ weapon: id, event: event, cue: WEAPON_SOUNDS[id][event] });
            }
        }
    }
    return out;
}

const soundRows = [];

function refreshSoundRows() {
    let missing = 0;
    for (const row of soundRows) {
        const ok = hasSound(row.name);
        if (!ok) {
            missing++;
        }
        row.element.classList.toggle("missing", audioReady && !ok);
        row.meta.textContent = "sounds/" + row.name + ".wav · " +
            (audioReady ? (ok ? soundDuration(row.name).toFixed(2) + " с" : "НЕ ЗАВАНТАЖИВСЯ") : "—");
        for (const b of row.buttons) {
            b.disabled = audioReady && !ok;
        }
    }
    if (soundStatusEl && audioReady) {
        soundStatusEl.textContent = missing === 0
            ? "Усі " + soundRows.length + " звуків завантажено ✔"
            : "Не завантажилось: " + missing + " (червона рамка)";
    }
}

function stopSequence() {
    for (const id of sequenceTimers) {
        clearTimeout(id);
    }
    sequenceTimers = [];
}

// Уся зброя по черзі: спершу стрибок для порівняння гучності, далі кожна зброя
// з тими самими паузами між подіями, що в анімації
function playSequence() {
    stopSequence();
    const steps = [{ at: 0, label: "Стрибок (для порівняння гучності)", sound: "jump", cue: null }];
    let clock = 1.2;
    for (const id of Object.keys(WEAPON_SOUNDS)) {
        const plan = weaponDemoEvents(id, 0);
        const first = plan.events.length > 0 ? plan.events[0].at : 0;
        let last = 0;
        for (const e of plan.events) {
            const cue = WEAPON_SOUNDS[id][e.event];
            if (!cue) {
                continue;
            }
            const rel = e.at - first;
            steps.push({ at: clock + rel, label: weaponName(id) + " — " + EVENT_LABELS[e.event], sound: cue.sound, cue: cue });
            last = Math.max(last, rel + (cue.duration || Math.min(1.5, soundDuration(cue.sound) || 1)));
        }
        clock += last + 0.6;
    }
    for (const step of steps) {
        sequenceTimers.push(setTimeout(function () {
            playSound(step.sound, step.cue || undefined);
            if (soundStatusEl) {
                soundStatusEl.textContent = "▶ " + step.label;
            }
        }, step.at * 1000));
    }
    sequenceTimers.push(setTimeout(function () {
        refreshSoundRows();
    }, (clock + 0.5) * 1000));
}

function makeButton(text, onClick, primary) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    if (primary) {
        b.className = "primary";
    }
    b.addEventListener("click", function () {
        enableAudio().then(onClick);
    });
    return b;
}

if (soundPanel) {
    const help = document.createElement("p");
    help.className = "sound-help";
    help.innerHTML =
        "1) Натисни «Увімкнути звук» (браузер дозволяє звук лише після кліку).<br>" +
        "2) «▶ файл» — увесь файл цілком; «▶ Меч — мах» тощо — саме той шматок і з тією гучністю, що звучить у грі.<br>" +
        "3) «Уся зброя по черзі» — спершу звук стрибка для порівняння, далі кожна зброя з паузами, як в анімації: зручно порівнювати гучність.<br>" +
        "4) Нижче в магазині клацни картку зброї — зелена рамка, і звук іде синхронно з її анімацією. Ще клік — вимкнути.";
    soundPanel.appendChild(help);

    const bar = document.createElement("div");
    bar.className = "sound-toolbar";
    bar.appendChild(makeButton("🔊 Увімкнути звук", function () {}, true));
    bar.appendChild(makeButton("▶ Уся зброя по черзі", playSequence));
    bar.appendChild(makeButton("■ Зупинити", stopSequence));
    soundStatusEl = document.createElement("span");
    soundStatusEl.textContent = "Звук вимкнено";
    bar.appendChild(soundStatusEl);
    soundPanel.appendChild(bar);

    const table = document.createElement("div");
    table.className = "sound-table";
    for (const name of SOUND_NAMES) {
        const row = document.createElement("div");
        row.className = "sound-row";
        const info = document.createElement("div");
        info.className = "sound-name";
        const title = document.createElement("b");
        title.textContent = name;
        const meta = document.createElement("div");
        meta.className = "sound-meta";
        info.appendChild(title);
        info.appendChild(meta);
        row.appendChild(info);
        const buttons = [makeButton("▶ файл", function () { playSound(name); })];
        for (const c of cuesForSound(name)) {
            buttons.push(makeButton("▶ " + weaponName(c.weapon) + " — " + EVENT_LABELS[c.event], function () {
                playSound(c.cue.sound, c.cue);
            }));
        }
        for (const b of buttons) {
            row.appendChild(b);
        }
        table.appendChild(row);
        soundRows.push({ name: name, element: row, meta: meta, buttons: buttons });
    }
    soundPanel.appendChild(table);
    refreshSoundRows();
}

// Звук картки зброї синхронно з її анімацією: граємо події, час яких
// припав між попереднім і поточним кадром
function syncCardSound(c, nowMs) {
    const cur = weaponDemoEvents(c.item.id, nowMs);
    const cycleMs = cur.cycle * 1000;
    for (let k = cur.cycleIndex - 1; k <= cur.cycleIndex; k++) {
        if (k < 0) {
            continue;
        }
        const plan = weaponDemoEvents(c.item.id, k * cycleMs + 1);
        for (const e of plan.events) {
            const abs = k * cycleMs + e.at * 1000;
            const cue = WEAPON_SOUNDS[c.item.id][e.event];
            if (cue && abs > c.lastNow && abs <= nowMs) {
                playSound(cue.sound, cue);
            }
        }
    }
    c.lastNow = nowMs;
}

// ---------- Досягнення: усі картки й демонстрація плашки ----------

const achSectionEl = document.getElementById("achSection");
const achControlsEl = document.getElementById("achControls");
const achToastsEl = document.getElementById("achievementToasts");
// Як показати картки: усі отримані, усі в процесі (половина цілі), закриті чи впереміш
const ACH_VIEW_MODES = [
    { id: "mixed", label: "впереміш" },
    { id: "done", label: "усі отримані" },
    { id: "half", label: "усі в процесі (50%)" },
    { id: "locked", label: "усі закриті (0)" }
];
// Цілі, що залежать від гри (усі рівні, усі пасхалки)
const ACH_PREVIEW_TARGETS = {
    totalLevels: ALL_LEVELS.length,
    totalEggs: new Set(ALL_LEVELS.map(function (l) { return l.bgTheme; })).size
};
let achViewMode = "mixed";

function previewAchievementProgress(ach, index) {
    const target = ach.targetFromSnapshot ? ACH_PREVIEW_TARGETS[ach.targetFromSnapshot] : ach.target;
    let mode = achViewMode;
    if (mode === "mixed") {
        mode = ["done", "half", "locked"][index % 3];
    }
    if (mode === "done") {
        return { current: target, target: target, done: true };
    }
    if (mode === "half") {
        return { current: Math.floor(target / 2), target: target, done: false };
    }
    return { current: 0, target: target, done: false };
}

function showPreviewAchievementToast(ach) {
    if (!achToastsEl) {
        return;
    }
    achToastsEl.innerHTML = "";
    const chest = CHEST_TYPES[ach.chest];
    const toast = buildAchievementToast(ach, chest ? chest.name : "Сундук");
    achToastsEl.appendChild(toast);
    enableAudio().then(function () {
        playSound("achievement", { volume: 0.8, duration: 4 });
    });
    function hide() {
        toast.classList.add("leaving");
        setTimeout(function () { toast.remove(); }, 350);
    }
    toast.addEventListener("click", hide);
    setTimeout(hide, 4200);
}

function buildAchievementSection() {
    if (!achSectionEl) {
        return;
    }
    achSectionEl.innerHTML = "";
    let index = 0;
    const totals = { wood: 0, silver: 0, gold: 0 };
    for (const group of ACHIEVEMENT_GROUPS) {
        const items = ACHIEVEMENTS.filter(function (a) { return a.group === group.id; });
        if (items.length === 0) {
            continue;
        }
        const heading = document.createElement("h3");
        heading.className = "ach-group-title";
        heading.textContent = group.name + " (" + items.length + ")";
        achSectionEl.appendChild(heading);
        const grid = document.createElement("div");
        grid.className = "ach-grid";
        for (const ach of items) {
            const chest = CHEST_TYPES[ach.chest];
            const card = buildAchievementCard(ach, previewAchievementProgress(ach, index), chest ? chest.name : "Сундук");
            card.title = "id: " + ach.id + " — клацни, щоб побачити плашку";
            card.addEventListener("click", function () {
                showPreviewAchievementToast(ach);
            });
            grid.appendChild(card);
            totals[ach.chest] = (totals[ach.chest] || 0) + 1;
            index++;
        }
        achSectionEl.appendChild(grid);
    }
    const summary = document.createElement("p");
    summary.className = "subtitle";
    summary.textContent = "Разом " + ACHIEVEMENTS.length + " досягнень. Нагороди: дерев'яних сундуків — " + totals.wood +
        ", срібних — " + totals.silver + ", золотих — " + totals.gold + ".";
    achSectionEl.insertBefore(summary, achSectionEl.firstChild);
}

if (achControlsEl) {
    const label = document.createElement("label");
    label.textContent = "Показати картки: ";
    const select = document.createElement("select");
    for (const m of ACH_VIEW_MODES) {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.label;
        select.appendChild(opt);
    }
    select.addEventListener("change", function () {
        achViewMode = select.value;
        buildAchievementSection();
    });
    label.appendChild(select);
    achControlsEl.appendChild(label);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "🎲 Випадкова плашка";
    btn.addEventListener("click", function () {
        showPreviewAchievementToast(ACHIEVEMENTS[Math.floor(Math.random() * ACHIEVEMENTS.length)]);
    });
    achControlsEl.appendChild(btn);
    buildAchievementSection();
}

// ---------- Сундуки: зациклене відкривання з випадковою нагородою ----------

const CHEST_W = 380;
const CHEST_H = 260;
// Цикл: 1 с закритий, трусіння й відкривання, 2.6 с показ нагороди
const CHEST_IDLE_MS = 1000;
const CHEST_LOOP_MS = CHEST_IDLE_MS + CHEST_SHAKE_MS + CHEST_OPEN_MS + 2600;
const chestSectionEl = document.getElementById("chestSection");
const chestCards = [];
// У preview нічого не куплено — сундук може дати будь-що зі свого пулу
const nothingOwned = function () { return false; };

function pct(x) {
    const v = x * 100;
    return (v >= 1 ? v.toFixed(1) : v.toFixed(2)).replace(/\.0+$/, "") + "%";
}

function describeResult(result) {
    if (result.kind === "crystals") {
        return "🪙 +" + coinsText(result.amount);
    }
    if (result.kind === "heart") {
        return "❤ +" + heartsText(result.amount);
    }
    const item = getShopItem(result.id);
    return item.name + " — " + itemRarity(item).name;
}

// Опис шансів: скільки предмет/монети/легендарне й які речі найчастіші та найрідші
function chestInfoHtml(type) {
    const chest = CHEST_TYPES[type];
    const pool = chestItemPool(type, nothingOwned).sort(function (a, b) { return b.chance - a.chance; });
    // Порядок: легендарне → сердечко → предмет або монети
    const rest = (1 - chest.legendaryChance) * (1 - (chest.heartChance || 0));
    const itemShare = rest * chest.itemChance;
    const fmt = function (p) { return p.item.name + " " + pct(itemShare * p.chance); };
    return "<b>Предмет:</b> " + pct(itemShare) + " (ціною до " + chest.maxPrice + " 🪙, дешеві частіше) · " +
        "<b>Монети:</b> " + pct(rest * (1 - chest.itemChance)) + " (" + chest.crystals[0] + "–" + chest.crystals[1] + ") · " +
        "<b>❤ Сердечко:</b> " + pct((1 - chest.legendaryChance) * (chest.heartChance || 0)) + " · " +
        "<b>Легендарний:</b> " + pct(chest.legendaryChance) + "<br>" +
        "<b>Найчастіше:</b> " + pool.slice(0, 4).map(fmt).join(", ") + "<br>" +
        "<b>Найрідше:</b> " + pool.slice(-3).map(fmt).join(", ");
}

if (chestSectionEl) {
    const help = document.createElement("p");
    help.className = "chest-help";
    help.innerHTML =
        "<b>Коли випадає:</b> перше проходження рівня — дерев'яний (Ліга 1), срібний (Ліги 2–3), золотий (Ліги 4–5); " +
        "нова золота рамка — дерев'яний (за срібну — лише монети); повторна перемога — " + pct(REPLAY_CHEST_CHANCE) + " дерев'яний, " +
        "а на " + CHEST_PITY_WINS + "-ту перемогу поспіль без сундука — гарантовано.<br>" +
        "Кожен сундук тут відкривається по колу з новою випадковою нагородою (у preview нічого не куплено, тож може випасти будь-що). " +
        "«Відкрити ще» — одразу нова спроба. Клік по картці вмикає звуки сундука (спершу «Увімкнути звук» у розділі «Звуки»).";
    chestSectionEl.appendChild(help);
    const list = document.createElement("div");
    list.className = "chest-cards";
    chestSectionEl.appendChild(list);
    for (const type of Object.keys(CHEST_TYPES)) {
        const card = document.createElement("div");
        card.className = "chest-card";
        const title = document.createElement("span");
        title.className = "chest-card-title";
        title.textContent = CHEST_TYPES[type].name;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(CHEST_W * DPR);
        canvas.height = Math.round(CHEST_H * DPR);
        canvas.style.width = CHEST_W + "px";
        canvas.style.height = CHEST_H + "px";
        const result = document.createElement("span");
        result.className = "chest-card-result";
        const again = document.createElement("button");
        again.type = "button";
        again.textContent = "Відкрити ще";
        const info = document.createElement("div");
        info.className = "chest-card-info";
        info.innerHTML = chestInfoHtml(type);
        card.appendChild(title);
        card.appendChild(canvas);
        card.appendChild(result);
        card.appendChild(again);
        card.appendChild(info);
        list.appendChild(card);
        const entry = {
            element: card, ctx: canvas.getContext("2d"), type: type, resultEl: result,
            loopStart: performance.now(), roll: rollChest(type, nothingOwned), stage: -1, soundOn: false, visible: false
        };
        again.addEventListener("click", function (e) {
            e.stopPropagation();
            // Одразу до трусіння з новою нагородою
            entry.loopStart = performance.now() - CHEST_IDLE_MS;
            entry.roll = rollChest(type, nothingOwned);
            entry.stage = -1;
        });
        card.addEventListener("click", function () {
            enableAudio().then(function () {
                entry.soundOn = !entry.soundOn;
                card.classList.toggle("sound-on", entry.soundOn);
            });
        });
        chestCards.push(entry);
        shopObserver.observe(card);
    }
}

// Кадр сундука: фаза циклу, звуки на переходах, новий результат у кожному циклі
function renderChestCard(c, nowMs) {
    let t = nowMs - c.loopStart;
    if (t >= CHEST_LOOP_MS) {
        c.loopStart = nowMs;
        c.roll = rollChest(c.type, nothingOwned);
        c.stage = -1;
        t = 0;
    }
    const openT = t < CHEST_IDLE_MS ? null : t - CHEST_IDLE_MS;
    let stage = 0;
    if (openT !== null) {
        stage = openT < CHEST_SHAKE_MS ? 1 : openT < CHEST_SHAKE_MS + CHEST_OPEN_MS ? 2 : 3;
    }
    if (stage !== c.stage) {
        c.stage = stage;
        c.resultEl.textContent = stage === 3 ? describeResult(c.roll) : " ";
        if (c.soundOn && audioReady) {
            if (stage === 1) {
                playSound("chest_shake");
            } else if (stage === 2) {
                playSound("chest_open");
            } else if (stage === 3) {
                playSound(c.roll.kind === "item" ? "chest_item" : "chest_coins");
            }
        }
    }
    c.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawChestScene(c.ctx, CHEST_W, CHEST_H, c.type, openT, c.roll, nowMs, { skinType: "neon_base", accessory: null });
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
        for (const c of chestCards) {
            if (c.visible || c.soundOn) {
                renderChestCard(c, now);
            }
        }
        for (const c of shopCards) {
            if (c.visible) {
                renderShopCard(c, now);
            }
            if (c.soundOn && audioReady) {
                syncCardSound(c, now);
            }
        }
    }
    if (progressLabelEl) {
        progressLabelEl.textContent = "Зараз: " + Math.round(previewEffects(time).progress * 100) + "%";
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

// ============================================================
// backgrounds.js — процедурні фони рівнів
// Кожен рівень — сцена з кількох шарів паралаксу. Статичні шари
// малюються один раз у буфери, а щокадру лише копіюються зі зсувом
// на цілі пікселі. Тут також живуть частинки вибуху кубика.
// ============================================================

const MAX_PARTICLES = 50;
const NEON_PALETTE = ["#00f6ff", "#ff2ea6", "#ffe14d", "#00ff88"];

let _W = 0;
let _H = 0;
let _groundY = 0;
let _particles = [];

function rand(min, max) {
    return min + Math.random() * (max - min);
}

// Тема фону → метод рендерера. Невідома тема малює неоновий старт.
const THEME_RENDERERS = {
    neon_start: "renderNeonStart",
    sunset_city: "renderSunsetCity",
    cosmodrome: "renderCosmodrome",
    neon_highway: "renderNeonHighway",
    laser_range: "renderLaserRange",
    digital_forest: "renderDigitalForest",
    storm_sky: "renderStormSky",
    crystal_cave: "renderCrystalCave",
    dino_valley: "renderDinoValley",
    pixel_night: "renderPixelNight",
    secret_base: "renderSecretBase",
    luna_park: "renderLunaPark",
    sea_fabricator: "renderSeaFabricator",
    twin_sun_planet: "renderTwinSunPlanet",
    sky_city: "renderSkyCity",
    stadium: "renderStadium",
    neon_rooftops: "renderNeonRooftops",
    night_harbor: "renderNightHarbor",
    pirate_bay: "renderPirateBay",
    treasury: "renderTreasury",
    orbit_view: "renderOrbitView",
    dragon_lair: "renderDragonLair",
    pixel_cave: "renderPixelCave",
    knight_castle: "renderKnightCastle",
    pixel_snow: "renderPixelSnow",
    pixel_ocean: "renderPixelOcean",
    pixel_desert: "renderPixelDesert",
    pixel_islands: "renderPixelIslands",
    black_hole: "renderBlackHole",
    sky_citadel: "renderSkyCitadel",
    pixel_nether: "renderPixelNether"
};

// Поля з буферами сцен, які залежать від розміру екрана й будуються заново після init()
const SCENE_CACHE_KEYS = [
    "_neonStart", "_sunsetCity", "_cosmodrome", "_neonHighway", "_laserRange", "_digitalForest",
    "_stormSky", "_crystalCave", "_dinoValley", "_pixelNight", "_secretBase", "_lunaPark",
    "_seaFabricator", "_twinSun", "_skyCity", "_stadium", "_neonRooftops", "_nightHarbor",
    "_pirateBay", "_treasury", "_orbitView", "_dragonLair", "_pixelCave", "_knightCastle",
    "_pixelSnow", "_pixelOcean", "_pixelDesert", "_pixelIslands", "_blackHole", "_skyCitadel",
    "_pixelNether"
];

const BackgroundRenderer = {
    init(W, H, groundY) {
        _W = W;
        _H = H;
        _groundY = groundY;
        for (const key of SCENE_CACHE_KEYS) {
            this[key] = null;
        }
        _particles = [];
    },

    reset() {
        _particles = [];
    },

    // Частинки вибуху: розлітаються від кубика, найстаріші витісняються при переповненні
    createParticles(x, y, count, palette) {
        const colors = palette || NEON_PALETTE;
        for (let i = 0; i < count; i++) {
            if (_particles.length >= MAX_PARTICLES) {
                let minLife = Infinity;
                let minIndex = -1;
                for (let j = 0; j < _particles.length; j++) {
                    if (_particles[j].life < minLife) {
                        minLife = _particles[j].life;
                        minIndex = j;
                    }
                }
                if (minIndex >= 0) {
                    _particles.splice(minIndex, 1);
                }
            }
            const angle = rand(0, Math.PI * 2);
            const speed = rand(80, 200);
            const life = rand(0.4, 0.6);
            _particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - rand(40, 100),
                size: rand(2, 4),
                life: life,
                maxLife: life,
                color: colors[Math.floor(Math.random() * colors.length)],
                gravity: rand(300, 500)
            });
        }
    },

    updateParticles(dt) {
        for (let i = _particles.length - 1; i >= 0; i--) {
            const p = _particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.gravity * dt;
            p.life -= dt;
            if (p.life <= 0) {
                _particles.splice(i, 1);
            }
        }
    },

    renderParticles(ctx, groundY, anchorX, camX) {
        for (const p of _particles) {
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - camX + anchorX - p.size / 2, groundY - p.y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1;
    },

    render(ctx, bgTheme, W, H, groundY, time, speed, accentColor) {
        if (W !== _W || H !== _H || groundY !== _groundY) {
            this.init(W, H, groundY);
        }
        const method = THEME_RENDERERS[bgTheme] || "renderNeonStart";
        const saveFill = ctx.fillStyle;
        const saveStroke = ctx.strokeStyle;
        const saveAlpha = ctx.globalAlpha;
        try {
            this[method](ctx, W, H, groundY, time, speed, accentColor);
            this.renderSceneEffects(ctx, bgTheme, W, H, groundY, time, accentColor);
        } finally {
            ctx.fillStyle = saveFill;
            ctx.strokeStyle = saveStroke;
            ctx.globalAlpha = saveAlpha;
        }
    }
};

// ---------- Піксельні фони в стилі «блочного світу» ----------
// Статичні шари (небо, пагорби, стіни печери) малюються один раз у буфери,
// а щокадру лише копіюються зі зсувом на цілі пікселі — це дешево.

// Детермінований генератор випадкових чисел, щоб світ виглядав однаково при кожному запуску
function pixelRng(seed) {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pixelBlockSize(H) {
    return Math.max(8, Math.round(H / 28));
}

// Смуга шириною stripW повторюється по горизонталі зі зсувом factor × пройденої відстані
function drawScrollingStrip(ctx, strip, W, bottomY, time, speed, factor) {
    const stripW = strip.width;
    const offset = Math.round(time * speed * factor) % stripW;
    // Камера стежить за стрибком: ближчі шари (більший factor) зсуваються сильніше
    const camShift = (typeof _fx !== "undefined" && _fx.camY) ? _fx.camY * factor * 3 : 0;
    const y = Math.round(bottomY + camShift) - strip.height;
    for (let x = -offset; x < W; x += stripW) {
        ctx.drawImage(strip, x, y);
    }
}

function buildPixelNight(W, H, groundY, B) {
    const rng = pixelRng(1010);
    const gY = Math.round(groundY);

    // Небо з місяцем
    const sky = document.createElement("canvas");
    sky.width = Math.ceil(W);
    sky.height = Math.ceil(H);
    const sx = sky.getContext("2d");
    const grad = sx.createLinearGradient(0, 0, 0, gY);
    grad.addColorStop(0, "#070b24");
    grad.addColorStop(1, "#1d2a5c");
    sx.fillStyle = grad;
    sx.fillRect(0, 0, sky.width, sky.height);
    const moonX = Math.round(W * 0.74 / B) * B;
    const moonY = Math.round(H * 0.1 / B) * B;
    sx.fillStyle = "rgba(240, 240, 200, 0.05)";
    sx.fillRect(moonX - B * 2, moonY - B * 2, B * 7, B * 7);
    sx.fillStyle = "rgba(240, 240, 200, 0.08)";
    sx.fillRect(moonX - B, moonY - B, B * 5, B * 5);
    sx.fillStyle = "#f4f1d0";
    sx.fillRect(moonX, moonY, B * 3, B * 3);
    sx.fillStyle = "#d8d4ae";
    sx.fillRect(moonX + B * 0.5, moonY + B * 0.5, B * 0.75, B * 0.75);
    sx.fillRect(moonX + B * 1.75, moonY + B * 1.5, B, B * 0.75);
    sx.fillRect(moonX + B * 0.75, moonY + B * 2, B * 0.5, B * 0.5);

    // Зірки (мерехтять щокадру)
    const stars = [];
    const half = B / 2;
    for (let i = 0; i < 45; i++) {
        const starX = Math.round(rng() * W / half) * half;
        const starY = Math.round(rng() * gY * 0.55 / half) * half;
        const phase = rng() * Math.PI * 2;
        const speed = 0.8 + rng() * 2;
        // Без зірок на місяці та його ореолі
        if (starX > moonX - B * 3 && starX < moonX + B * 6 && starY > moonY - B * 3 && starY < moonY + B * 6) {
            continue;
        }
        stars.push({ x: starX, y: starY, phase: phase, speed: speed });
    }

    // Хмари з блоків
    const cloudCols = Math.ceil(W * 1.5 / B);
    const clouds = document.createElement("canvas");
    clouds.width = cloudCols * B;
    clouds.height = B * 3;
    const cx = clouds.getContext("2d");
    cx.fillStyle = "rgba(200, 210, 240, 0.16)";
    for (let c = 2; c < cloudCols - 8; c += 9 + Math.floor(rng() * 6)) {
        const len = 4 + Math.floor(rng() * 4);
        cx.fillRect(c * B, B, len * B, B);
        cx.fillRect((c + 1) * B, 0, (len - 2) * B, B);
        cx.fillRect((c + 1) * B, B * 2, (len - 1) * B, B);
    }

    // Періодичний рельєф: ціле число хвиль на ширину смуги, щоб смуга безшовно повторювалась
    function heights(cols, base, waves) {
        const hs = [];
        for (let c = 0; c < cols; c++) {
            let v = base;
            for (const w of waves) {
                v += w.amp * Math.sin(Math.PI * 2 * c * w.k / cols + w.ph);
            }
            hs.push(Math.max(1, Math.round(v)));
        }
        return hs;
    }

    // Далекі пагорби
    const farCols = Math.ceil(W * 1.5 / B);
    const farH = heights(farCols, 5, [{ amp: 2.5, k: 2, ph: 0.3 }, { amp: 1.2, k: 5, ph: 1.7 }]);
    const farMax = Math.max.apply(null, farH);
    const far = document.createElement("canvas");
    far.width = farCols * B;
    far.height = farMax * B;
    const fx = far.getContext("2d");
    for (let c = 0; c < farCols; c++) {
        const top = far.height - farH[c] * B;
        fx.fillStyle = "#141d3d";
        fx.fillRect(c * B, top, B, far.height - top);
        fx.fillStyle = "#1c2a55";
        fx.fillRect(c * B, top, B, B * 0.5);
    }

    // Ближні пагорби з травою, землею та деревами
    const nearCols = Math.ceil(W * 1.3 / B);
    const nearH = heights(nearCols, 3, [{ amp: 1.5, k: 3, ph: 2 }, { amp: 1, k: 7, ph: 0.5 }]);
    const nearMax = Math.max.apply(null, nearH) + 5;
    const near = document.createElement("canvas");
    near.width = nearCols * B;
    near.height = nearMax * B;
    const nx = near.getContext("2d");
    const p = B / 4;
    for (let c = 0; c < nearCols; c++) {
        const hBlocks = nearH[c];
        const top = near.height - hBlocks * B;
        for (let r = 0; r < hBlocks; r++) {
            const y = top + r * B;
            if (r === 0) {
                nx.fillStyle = "#2f7a22";
                nx.fillRect(c * B, y, B, B);
                nx.fillStyle = "#44a332";
                nx.fillRect(c * B, y, B, p);
                nx.fillStyle = "#2f7a22";
                nx.fillRect(c * B + p, y + p, p, p);
                nx.fillStyle = "#5a3b22";
                nx.fillRect(c * B, y + p * 3, B, p);
                nx.fillRect(c * B + p * 2, y + p * 2, p, p);
            } else {
                nx.fillStyle = (r + c) % 2 === 0 ? "#553820" : "#4a3019";
                nx.fillRect(c * B, y, B, B);
                nx.fillStyle = "#3d2714";
                nx.fillRect(c * B + ((r * 3 + c) % 4) * p, y + ((r + c * 2) % 4) * p, p, p);
            }
        }
        // Дерево на деяких вершинах
        if (c % 11 === 4 && c + 1 < nearCols) {
            nx.fillStyle = "#5b3a1e";
            nx.fillRect(c * B, top - B * 3, B, B * 3);
            nx.fillStyle = "#256319";
            nx.fillRect((c - 1) * B, top - B * 5, B * 3, B * 2);
            nx.fillRect(c * B, top - B * 6, B, B);
            nx.fillStyle = "#347f24";
            nx.fillRect((c - 1) * B + p, top - B * 5 + p, p * 2, p);
            nx.fillRect((c + 1) * B, top - B * 4 - p * 2, p, p);
        }
    }

    return { W: W, H: H, B: B, sky: sky, stars: stars, clouds: clouds, far: far, near: near };
}

function buildPixelCave(W, H, groundY, B) {
    const rng = pixelRng(2323);
    const gY = Math.round(groundY);
    const cols = Math.ceil(W * 1.3 / B);
    const rows = Math.ceil(gY / B) + 1;
    const p = B / 4;

    const wall = document.createElement("canvas");
    wall.width = cols * B;
    wall.height = rows * B;
    const wx = wall.getContext("2d");
    const stoneShades = ["#3a3a44", "#34343d", "#2e2e36"];
    const ores = [];
    const torches = [];
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            const x = c * B;
            const y = r * B;
            wx.fillStyle = stoneShades[Math.floor(rng() * stoneShades.length)];
            wx.fillRect(x, y, B, B);
            wx.fillStyle = "#26262d";
            for (let k = 0; k < 3; k++) {
                wx.fillRect(x + Math.floor(rng() * 4) * p, y + Math.floor(rng() * 4) * p, p, p);
            }
            // Руда: алмаз, золото або червона руда
            const roll = rng();
            let oreColor = null;
            let kind = null;
            if (roll < 0.015) {
                oreColor = "#2fd3cf";
                kind = "diamond";
            } else if (roll < 0.03) {
                oreColor = "#f2c84b";
                kind = "gold";
            } else if (roll < 0.04) {
                oreColor = "#e0302a";
                kind = "red";
            }
            if (oreColor) {
                wx.fillStyle = oreColor;
                wx.fillRect(x + p, y + p, p, p);
                wx.fillRect(x + p * 2, y + p * 2, p, p);
                wx.fillRect(x + p * 2, y, p, p);
                wx.fillRect(x, y + p * 3, p, p);
                if (kind !== "gold") {
                    ores.push({ x: x, y: y, kind: kind, phase: rng() * Math.PI * 2 });
                }
            }
        }
    }
    // Темні сталактити зверху та тінь по краях
    wx.fillStyle = "#15151b";
    for (let c = 0; c < cols; c++) {
        const len = 1 + Math.floor((Math.sin(c * 1.7) + 1) * 1.5);
        wx.fillRect(c * B, 0, B, len * B);
    }
    const shade = wx.createLinearGradient(0, 0, 0, wall.height);
    shade.addColorStop(0, "rgba(0, 0, 0, 0.55)");
    shade.addColorStop(0.5, "rgba(0, 0, 0, 0.15)");
    shade.addColorStop(1, "rgba(0, 0, 0, 0.45)");
    wx.fillStyle = shade;
    wx.fillRect(0, 0, wall.width, wall.height);
    // Факели на стінах
    for (let c = 5; c < cols - 2; c += 12) {
        const tx = c * B + p;
        const ty = Math.round(gY * 0.45 / B) * B;
        wx.fillStyle = "#6b4424";
        wx.fillRect(tx, ty, p * 2, B);
        torches.push({ x: tx, y: ty, phase: rng() * Math.PI * 2 });
    }

    // Лавове світіння біля землі
    const lava = document.createElement("canvas");
    lava.width = 1;
    lava.height = B * 3;
    const lx = lava.getContext("2d");
    const lg = lx.createLinearGradient(0, 0, 0, lava.height);
    lg.addColorStop(0, "rgba(255, 90, 0, 0)");
    lg.addColorStop(1, "rgba(255, 90, 0, 0.35)");
    lx.fillStyle = lg;
    lx.fillRect(0, 0, 1, lava.height);

    return { W: W, H: H, B: B, wall: wall, ores: ores, torches: torches, lava: lava };
}

BackgroundRenderer.renderPixelNight = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelNight;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelNight(W, H, groundY, B);
        this._pixelNight = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    const starSize = Math.max(2, Math.round(B / 4));
    ctx.fillStyle = "#ffffff";
    for (const star of st.stars) {
        ctx.globalAlpha = 0.35 + 0.65 * (Math.sin(time * star.speed + star.phase) * 0.5 + 0.5);
        ctx.fillRect(star.x, star.y, starSize, starSize);
    }
    ctx.globalAlpha = 1;
    drawScrollingStrip(ctx, st.clouds, W, Math.round(H * 0.3), time, speed, 0.04);
    drawScrollingStrip(ctx, st.far, W, groundY, time, speed, 0.12);
    drawScrollingStrip(ctx, st.near, W, groundY, time, speed, 0.3);
};

BackgroundRenderer.renderPixelCave = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelCave;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelCave(W, H, groundY, B);
        this._pixelCave = st;
    }
    ctx.fillStyle = "#0b0b10";
    ctx.fillRect(0, 0, W, H);
    const wallW = st.wall.width;
    const offset = Math.round(time * speed * 0.2) % wallW;
    const wallY = Math.round(groundY) - st.wall.height;
    for (let x = -offset; x < W; x += wallW) {
        ctx.drawImage(st.wall, x, wallY);
    }
    const p = B / 4;
    // Пульсуюче світіння руди та факелів (позиції зсуваються разом зі стіною)
    for (let copy = -offset; copy < W; copy += wallW) {
        for (const ore of st.ores) {
            const x = copy + ore.x;
            if (x < -B * 2 || x > W + B) {
                continue;
            }
            const pulse = Math.sin(time * (ore.kind === "red" ? 3 : 1.6) + ore.phase) * 0.5 + 0.5;
            ctx.fillStyle = ore.kind === "red" ? "rgba(255, 40, 30, 0.22)" : "rgba(60, 240, 230, 0.18)";
            ctx.globalAlpha = 0.3 + 0.7 * pulse;
            ctx.fillRect(x - p, wallY + ore.y - p, B + p * 2, B + p * 2);
        }
        for (const torch of st.torches) {
            const x = copy + torch.x;
            if (x < -B * 3 || x > W + B * 3) {
                continue;
            }
            const y = wallY + torch.y;
            const flicker = 0.75 + 0.25 * Math.sin(time * 11 + torch.phase) * Math.sin(time * 7.3);
            ctx.globalAlpha = 0.1 * flicker;
            ctx.fillStyle = "#ffaa33";
            ctx.fillRect(x - B * 2, y - B * 2, B * 4 + p * 2, B * 4);
            ctx.globalAlpha = 0.14 * flicker;
            ctx.fillRect(x - B, y - B, B * 2 + p * 2, B * 2);
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(x, y - p * 2, p * 2, p * 2);
            ctx.fillStyle = flicker > 0.85 ? "#ffffff" : "#ff7a00";
            ctx.fillRect(x + p * 0.5, y - p * 2.5, p, p);
        }
    }
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(time * 1.3);
    ctx.drawImage(st.lava, 0, Math.round(groundY) - st.lava.height, W, st.lava.height);
    ctx.globalAlpha = 1;
};

// ---------- Нові світи: сніг, океан, пустеля, острови, вогняний світ, неонові сцени ----------

function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return c;
}

// Небо-градієнт у буфері на весь екран
function makeSky(W, H, stops) {
    const sky = makeCanvas(W, H);
    const sx = sky.getContext("2d");
    const g = sx.createLinearGradient(0, 0, 0, H);
    for (const stop of stops) {
        g.addColorStop(stop[0], stop[1]);
    }
    sx.fillStyle = g;
    sx.fillRect(0, 0, sky.width, sky.height);
    return sky;
}

// Періодичні висоти стовпчиків: ціле число хвиль на ширину, щоб смуга безшовно повторювалась
function periodicHeights(cols, base, waves) {
    const hs = [];
    for (let c = 0; c < cols; c++) {
        let v = base;
        for (const w of waves) {
            v += w.amp * Math.sin(Math.PI * 2 * c * w.k / cols + w.ph);
        }
        hs.push(Math.max(1, Math.round(v)));
    }
    return hs;
}

// Блоковий рельєф: верхній блок одного кольору, нижче — «тіло» з піксельною текстурою
function drawBlockTerrain(ctx, heights, B, stripH, colors, rng) {
    const p = B / 4;
    for (let c = 0; c < heights.length; c++) {
        const top = stripH - heights[c] * B;
        for (let r = 0; r < heights[c]; r++) {
            const y = top + r * B;
            ctx.fillStyle = r === 0 ? colors.top : (r + c) % 2 === 0 ? colors.body : colors.body2;
            ctx.fillRect(c * B, y, B, B);
            if (r === 0 && colors.topLight) {
                ctx.fillStyle = colors.topLight;
                ctx.fillRect(c * B, y, B, p);
            }
            if (colors.speck) {
                ctx.fillStyle = colors.speck;
                ctx.fillRect(c * B + Math.floor(rng() * 4) * p, y + Math.floor(rng() * 4) * p, p, p);
            }
        }
    }
}

// Детерміновані «падаючі» частинки без стану: позиція обчислюється з часу
function drawFallingPixels(ctx, W, H, time, count, seed, opts) {
    const rng = pixelRng(seed);
    ctx.fillStyle = opts.color;
    for (let i = 0; i < count; i++) {
        const x0 = rng() * W;
        const y0 = rng() * H;
        const spd = opts.speedMin + rng() * (opts.speedMax - opts.speedMin);
        const sz = opts.sizeMin + Math.floor(rng() * (opts.sizeMax - opts.sizeMin + 1));
        const phase = rng() * Math.PI * 2;
        let y = (y0 + time * spd * opts.dir) % H;
        if (y < 0) {
            y += H;
        }
        const x = ((x0 + Math.sin(time * opts.sway + phase) * opts.swayAmp) % W + W) % W;
        ctx.globalAlpha = opts.alpha;
        ctx.fillRect(Math.round(x), Math.round(y), sz, sz * (opts.stretch || 1));
    }
    ctx.globalAlpha = 1;
}

// ---------- Сніжні гори (рівень 25) ----------

function buildPixelSnow(W, H, groundY, B) {
    const rng = pixelRng(2525);
    const sky = makeSky(W, H, [[0, "#0d1633"], [0.55, "#2c3f73"], [1, "#6d7fb0"]]);
    const skx = sky.getContext("2d");
    // Північне сяйво
    for (let i = 0; i < 26; i++) {
        const x = Math.round((W * 0.1 + i * W * 0.03) / B) * B;
        const len = (3 + Math.round(Math.sin(i * 0.7) * 2 + 2)) * B;
        skx.fillStyle = i % 2 === 0 ? "rgba(80, 255, 170, 0.08)" : "rgba(120, 200, 255, 0.07)";
        skx.fillRect(x, Math.round(H * 0.08 / B) * B + Math.round(Math.sin(i * 0.5) * 2) * B, B, len);
    }

    const farCols = Math.ceil(W * 1.5 / B);
    const farH = periodicHeights(farCols, 8, [{ amp: 4, k: 3, ph: 0.4 }, { amp: 2, k: 7, ph: 2 }]);
    const far = makeCanvas(farCols * B, Math.max.apply(null, farH) * B);
    const fx = far.getContext("2d");
    for (let c = 0; c < farCols; c++) {
        const top = far.height - farH[c] * B;
        fx.fillStyle = "#3b4a73";
        fx.fillRect(c * B, top, B, far.height - top);
        fx.fillStyle = "#e8f0ff";
        fx.fillRect(c * B, top, B, B * (farH[c] > 9 ? 2 : 1));
    }

    const nearCols = Math.ceil(W * 1.3 / B);
    const nearH = periodicHeights(nearCols, 3, [{ amp: 1.5, k: 2, ph: 1 }, { amp: 1, k: 5, ph: 0.2 }]);
    const nearMax = Math.max.apply(null, nearH) + 6;
    const near = makeCanvas(nearCols * B, nearMax * B);
    const nx = near.getContext("2d");
    drawBlockTerrain(nx, nearH, B, near.height, { top: "#f4f8ff", topLight: "#ffffff", body: "#8a94a8", body2: "#7a8498", speck: "#6a7488" }, rng);
    // Ялинки зі снігом
    for (let c = 3; c < nearCols - 2; c += 7 + Math.floor(rng() * 4)) {
        const top = near.height - nearH[c] * B;
        nx.fillStyle = "#5b3a1e";
        nx.fillRect(c * B, top - B, B, B);
        for (let t = 0; t < 3; t++) {
            const w = 3 - t;
            const y = top - B * (2 + t);
            nx.fillStyle = "#1f5a3a";
            nx.fillRect((c - w + 1) * B - (w > 1 ? 0 : 0), y, (w * 2 - 1) * B, B);
            nx.fillStyle = "#f4f8ff";
            nx.fillRect((c - w + 1) * B, y, (w * 2 - 1) * B, B / 4);
        }
    }
    return { W: W, H: H, sky: sky, far: far, near: near };
}

BackgroundRenderer.renderPixelSnow = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelSnow;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelSnow(W, H, groundY, B);
        this._pixelSnow = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, groundY, time, speed, 0.1);
    drawScrollingStrip(ctx, st.near, W, groundY, time, speed, 0.3);
    drawFallingPixels(ctx, W, groundY, time, 70, 77, {
        color: "#ffffff", dir: 1, speedMin: 25, speedMax: 70, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
        sway: 1.2, swayAmp: B * 0.6, alpha: 0.85
    });
};

// ---------- Інопланетний океан (рівень 26) ----------

function buildPixelOcean(W, H, groundY, B) {
    const rng = pixelRng(2626);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0b5b86"], [0.45, "#063a63"], [1, "#010818"]]);
    const skx = sky.getContext("2d");
    // Промені світла з поверхні
    for (let i = 0; i < 6; i++) {
        const x = W * (0.08 + i * 0.17);
        skx.fillStyle = "rgba(160, 230, 255, 0.05)";
        skx.beginPath();
        skx.moveTo(x, 0);
        skx.lineTo(x + W * 0.05, 0);
        skx.lineTo(x + W * 0.16, gY);
        skx.lineTo(x + W * 0.08, gY);
        skx.closePath();
        skx.fill();
    }

    // Морське дно з піском, камінням і світними коралами
    const cols = Math.ceil(W * 1.3 / B);
    const hs = periodicHeights(cols, 2, [{ amp: 1, k: 3, ph: 0.5 }, { amp: 0.8, k: 8, ph: 2 }]);
    const maxH = Math.max.apply(null, hs) + 3;
    const floor = makeCanvas(cols * B, maxH * B);
    const fx = floor.getContext("2d");
    drawBlockTerrain(fx, hs, B, floor.height, { top: "#c9b27a", topLight: "#e3d09a", body: "#8f7a4c", body2: "#7d6a40", speck: "#6e5c36" }, rng);
    const corals = [];
    const p = B / 4;
    for (let c = 1; c < cols - 1; c += 3 + Math.floor(rng() * 4)) {
        const top = floor.height - hs[c] * B;
        const kind = Math.floor(rng() * 3);
        const colors = [["#ff4fa3", "#ff9ed0"], ["#39ffd0", "#b0fff0"], ["#b06bff", "#e0c0ff"]][kind];
        const hBlocks = 1 + Math.floor(rng() * 2);
        fx.fillStyle = colors[0];
        fx.fillRect(c * B + p, top - hBlocks * B, p * 2, hBlocks * B);
        fx.fillRect(c * B, top - hBlocks * B, B, p * 2);
        fx.fillStyle = colors[1];
        fx.fillRect(c * B + p, top - hBlocks * B, p, p);
        corals.push({ x: c * B + B / 2, y: top - hBlocks * B, color: colors[0] });
    }

    // Водорості (коливаються щокадру)
    const kelp = [];
    for (let i = 0; i < 14; i++) {
        kelp.push({ x: Math.round(rng() * cols) * B, h: 4 + Math.floor(rng() * 6), phase: rng() * Math.PI * 2 });
    }
    // Зграї риб
    const fish = [];
    for (let i = 0; i < 9; i++) {
        fish.push({
            y: gY * (0.2 + rng() * 0.6),
            speed: 20 + rng() * 40,
            offset: rng() * W * 2,
            color: ["#ffcc33", "#ff7a3d", "#7df9ff", "#ff4fa3"][Math.floor(rng() * 4)],
            size: Math.round(B * (0.5 + rng() * 0.4))
        });
    }
    // Медузи
    const jelly = [];
    for (let i = 0; i < 4; i++) {
        jelly.push({ x: rng() * W, y: gY * (0.15 + rng() * 0.45), phase: rng() * Math.PI * 2 });
    }
    return { W: W, H: H, sky: sky, floor: floor, corals: corals, kelp: kelp, fish: fish, jelly: jelly, cols: cols };
}

// Силует велетенського блокового морського змія, що зрідка пропливає вдалині
function drawLeviathan(ctx, W, gY, B, time) {
    const period = 38;
    const t = (time % period) / period;
    if (t > 0.6) {
        return;
    }
    const headX = W * 1.2 - t / 0.6 * W * 2.2;
    const baseY = gY * 0.38;
    ctx.fillStyle = "rgba(2, 20, 40, 0.55)";
    for (let i = 0; i < 16; i++) {
        const sx = headX + i * B * 1.6;
        const sy = baseY + Math.sin(time * 1.5 - i * 0.5) * B * 1.2;
        const seg = Math.round(B * (2.2 - i * 0.09));
        ctx.fillRect(Math.round(sx), Math.round(sy - seg / 2), seg, seg);
    }
    // Око, що світиться
    ctx.fillStyle = "rgba(255, 80, 60, 0.7)";
    ctx.fillRect(Math.round(headX + B * 0.3), Math.round(baseY + Math.sin(time * 1.5) * B * 1.2 - B * 0.5), Math.round(B * 0.4), Math.round(B * 0.3));
}

BackgroundRenderer.renderPixelOcean = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelOcean;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelOcean(W, H, groundY, B);
        this._pixelOcean = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawLeviathan(ctx, W, gY, B, time);

    // Медузи пульсують і повільно дрейфують
    for (const j of st.jelly) {
        const pulse = Math.sin(time * 2 + j.phase) * 0.5 + 0.5;
        const x = Math.round(((j.x - time * 8) % (W + B * 4) + W + B * 4) % (W + B * 4) - B * 2);
        const y = Math.round(j.y + Math.sin(time * 0.7 + j.phase) * B);
        ctx.globalAlpha = 0.06 + 0.1 * pulse;
        ctx.fillStyle = "#c08bff";
        ctx.fillRect(x - B, y - B, B * 3, B * 3);
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "#e6c8ff";
        ctx.fillRect(x, y, B, B * 0.75);
        ctx.fillStyle = "#c08bff";
        const tl = B * (0.8 + pulse * 0.6);
        ctx.fillRect(x, y + B * 0.75, B / 5, tl);
        ctx.fillRect(x + B * 0.4, y + B * 0.75, B / 5, tl * 1.2);
        ctx.fillRect(x + B * 0.8, y + B * 0.75, B / 5, tl);
    }
    ctx.globalAlpha = 1;

    // Риби пливуть (частина — назустріч руху кубика)
    for (const f of st.fish) {
        const span = W + f.size * 8;
        const x = Math.round(span - ((f.offset + time * (f.speed + speed * 0.15)) % span) - f.size * 4);
        const y = Math.round(f.y + Math.sin(time * 2 + f.offset) * B * 0.3);
        ctx.fillStyle = f.color;
        ctx.fillRect(x, y, f.size, Math.round(f.size * 0.6));
        ctx.fillRect(x + f.size, y - Math.round(f.size * 0.15), Math.round(f.size * 0.4), Math.round(f.size * 0.9));
        ctx.fillStyle = "#00121e";
        ctx.fillRect(x + Math.round(f.size * 0.15), y + Math.round(f.size * 0.1), Math.max(2, Math.round(f.size * 0.15)), Math.max(2, Math.round(f.size * 0.15)));
    }

    // Дно зі зсувом і водорості, прив'язані до дна
    const floorW = st.floor.width;
    const offset = Math.round(time * speed * 0.3) % floorW;
    const floorY = gY - st.floor.height;
    for (let x = -offset; x < W; x += floorW) {
        for (const k of st.kelp) {
            const kx = x + k.x;
            if (kx < -B * 2 || kx > W + B * 2) {
                continue;
            }
            for (let seg = 0; seg < k.h; seg++) {
                const sway = Math.round(Math.sin(time * 1.6 + k.phase + seg * 0.5) * seg * B * 0.12);
                ctx.fillStyle = seg % 2 === 0 ? "#1f8a4a" : "#27a65a";
                ctx.fillRect(kx + sway, gY - B * (seg + 2), Math.round(B * 0.5), B);
            }
        }
        ctx.drawImage(st.floor, x, floorY);
        // Світіння коралів
        for (const c of st.corals) {
            const cx = x + c.x;
            if (cx < -B * 2 || cx > W + B * 2) {
                continue;
            }
            ctx.globalAlpha = 0.12 + 0.12 * Math.sin(time * 2.2 + c.x);
            ctx.fillStyle = c.color;
            ctx.fillRect(cx - B, floorY + c.y - B, B * 2, B * 2);
        }
        ctx.globalAlpha = 1;
    }

    // Бульбашки піднімаються
    drawFallingPixels(ctx, W, gY, time, 30, 262, {
        color: "#bff4ff", dir: -1, speedMin: 30, speedMax: 70, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
        sway: 2, swayAmp: B * 0.3, alpha: 0.55
    });
};

// ---------- Пустеля (рівень 27) ----------

function buildPixelDesert(W, H, groundY, B) {
    const rng = pixelRng(2727);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#1d0b3a"], [0.4, "#6a1f5e"], [0.62, "#ff6a3d"], [1, "#ffb35c"]]);
    const skx = sky.getContext("2d");
    // Велике квадратне сонце низько над обрієм
    const sunS = B * 5;
    const sunX = Math.round(W * 0.62 / B) * B;
    const sunY = Math.round((gY - B * 9) / B) * B;
    skx.fillStyle = "rgba(255, 220, 120, 0.15)";
    skx.fillRect(sunX - B, sunY - B, sunS + B * 2, sunS + B * 2);
    skx.fillStyle = "#ffd36b";
    skx.fillRect(sunX, sunY, sunS, sunS);
    skx.fillStyle = "#ffb347";
    for (let i = 1; i < 4; i++) {
        skx.fillRect(sunX, sunY + sunS - i * B * 1.2, sunS, B * 0.3);
    }

    // Далекі піраміди
    const farCols = Math.ceil(W * 1.5 / B);
    const far = makeCanvas(farCols * B, B * 9);
    const fx = far.getContext("2d");
    const pyramids = [[Math.round(farCols * 0.2), 8], [Math.round(farCols * 0.3), 5], [Math.round(farCols * 0.7), 7]];
    for (const pyr of pyramids) {
        for (let level = 0; level < pyr[1]; level++) {
            const w = (pyr[1] - level) * 2 - 1;
            fx.fillStyle = level % 2 === 0 ? "#b0703c" : "#9a6033";
            fx.fillRect((pyr[0] - (pyr[1] - level) + 1) * B, far.height - (level + 1) * B, w * B, B);
        }
    }

    // Дюни з кактусами
    const nearCols = Math.ceil(W * 1.3 / B);
    const nearH = periodicHeights(nearCols, 2.5, [{ amp: 1.3, k: 3, ph: 0.8 }, { amp: 0.7, k: 7, ph: 0.1 }]);
    const near = makeCanvas(nearCols * B, (Math.max.apply(null, nearH) + 4) * B);
    const nx = near.getContext("2d");
    drawBlockTerrain(nx, nearH, B, near.height, { top: "#e8b85c", topLight: "#f5d48a", body: "#d19a45", body2: "#c28c3c", speck: "#b07a30" }, rng);
    for (let c = 4; c < nearCols - 2; c += 8 + Math.floor(rng() * 5)) {
        const top = near.height - nearH[c] * B;
        const h = 2 + Math.floor(rng() * 2);
        nx.fillStyle = "#2f8a3a";
        nx.fillRect(c * B, top - h * B, B, h * B);
        nx.fillRect((c - 1) * B, top - (h - 1) * B, B / 2, B / 2);
        nx.fillRect((c - 1) * B, top - (h - 1) * B - B / 2, B / 2, B);
        nx.fillRect((c + 1) * B + B / 2, top - h * B + B / 2, B / 2, B);
        nx.fillStyle = "#4fb55a";
        nx.fillRect(c * B + B / 4, top - h * B, B / 4, h * B);
    }
    return { W: W, H: H, sky: sky, far: far, near: near };
}

BackgroundRenderer.renderPixelDesert = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelDesert;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelDesert(W, H, groundY, B);
        this._pixelDesert = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, groundY, time, speed, 0.08);
    drawScrollingStrip(ctx, st.near, W, groundY, time, speed, 0.3);
    // Пісок, що несе вітер
    drawFallingPixels(ctx, W, groundY, time, 20, 272, {
        color: "#ffe0a0", dir: 1, speedMin: 3, speedMax: 8, sizeMin: 2, sizeMax: 3,
        sway: 0.8, swayAmp: W * 0.4, alpha: 0.5
    });
};

// ---------- Парящі острови в космосі (рівень 28) ----------

function buildPixelIslands(W, H, groundY, B) {
    const rng = pixelRng(2828);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#05010d"], [0.6, "#140726"], [1, "#2a0f45"]]);
    const skx = sky.getContext("2d");
    for (let i = 0; i < 90; i++) {
        skx.fillStyle = rng() < 0.2 ? "#d9b3ff" : "#ffffff";
        skx.globalAlpha = 0.3 + rng() * 0.7;
        const s = rng() < 0.15 ? B / 3 : B / 6;
        skx.fillRect(Math.round(rng() * W), Math.round(rng() * gY), s, s);
    }
    skx.globalAlpha = 1;
    // Велика піксельна планета
    const pr = B * 4;
    const px = Math.round(W * 0.2);
    const py = Math.round(gY * 0.3);
    for (let y = -pr; y < pr; y += B / 2) {
        for (let x = -pr; x < pr; x += B / 2) {
            if (x * x + y * y > pr * pr) {
                continue;
            }
            skx.fillStyle = (y + x * 0.3) % (B * 2) < B ? "#6b3fa8" : "#57318c";
            if (x + y > pr * 0.6) {
                skx.fillStyle = "#3a1f63";
            }
            skx.fillRect(px + x, py + y, B / 2, B / 2);
        }
    }

    // Острови: світлий камінь зверху, темний низ, що звужується, кристали
    function islandsStrip(stripW, count, scale, seed) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, gY);
        const sx = strip.getContext("2d");
        for (let i = 0; i < count; i++) {
            const w = Math.round((3 + r() * 5) * scale);
            const x = Math.round((i + 0.2 + r() * 0.5) * stripW / count / B) * B;
            const y = Math.round((gY * (0.25 + r() * 0.5)) / B) * B;
            const rows = Math.ceil(w / 2);
            for (let row = 0; row < rows; row++) {
                const rowW = Math.max(1, w - row * 2);
                const rowX = x + row * B;
                sx.fillStyle = row === 0 ? "#e3dca8" : row === 1 ? "#c9c08c" : "#4a3f5c";
                sx.fillRect(rowX, y + row * B, rowW * B, B);
            }
            // Фіолетовий кристал на острові
            if (r() < 0.7) {
                const cx = x + Math.floor(w / 2) * B;
                sx.fillStyle = "#b35cff";
                sx.fillRect(cx, y - B * 2, B, B * 2);
                sx.fillStyle = "#e6bfff";
                sx.fillRect(cx, y - B * 2, B / 3, B);
            }
        }
        return strip;
    }
    const far = islandsStrip(Math.ceil(W * 1.5 / B) * B, 5, 0.6, 2801);
    const near = islandsStrip(Math.ceil(W * 1.3 / B) * B, 3, 1, 2802);
    return { W: W, H: H, sky: sky, far: far, near: near };
}

BackgroundRenderer.renderPixelIslands = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelIslands;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelIslands(W, H, groundY, B);
        this._pixelIslands = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    // Острови ледь погойдуються вгору-вниз
    const bobFar = Math.round(Math.sin(time * 0.6) * B * 0.3);
    const bobNear = Math.round(Math.sin(time * 0.8 + 1) * B * 0.4);
    drawScrollingStrip(ctx, st.far, W, st.far.height + bobFar, time, speed, 0.08);
    drawScrollingStrip(ctx, st.near, W, st.near.height + bobNear, time, speed, 0.2);
    // Фіолетові іскри піднімаються
    drawFallingPixels(ctx, W, Math.round(groundY), time, 35, 282, {
        color: "#d68bff", dir: -1, speedMin: 15, speedMax: 40, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
        sway: 1.5, swayAmp: B * 0.5, alpha: 0.7
    });
};

// ---------- Вогняний світ (рівень 31, бос) ----------
// Бій із демоном у три фази за прогресом рівня:
// 1) Пробудження — з лави видно лише роги й голову, очі заплющені;
// 2) Лють — демон розплющує очі й стежить за кубиком, падають метеори, б'ють гейзери;
// 3) Битва — демон підводиться на весь зріст, рве ланцюги, б'ють червоні блискавки.
// Помилка гравця змушує демона ревіти, а краї екрана пульсують, як серце.

const DEMON_PLAYER_ANCHOR = 0.28;

function smoothStep(x) {
    const t = Math.max(0, Math.min(1, x));
    return t * t * (3 - 2 * t);
}

// Силует демона в блоках: роги, голова, плечі, руки. Очі й паща малюються окремо
function buildDemonSprite(B) {
    const cols = 18;
    const rows = 20;
    const sprite = makeCanvas(cols * B, rows * B);
    const sx = sprite.getContext("2d");
    const rng = pixelRng(6666);
    const block = function (c, r, color) {
        sx.fillStyle = color || ((c + r) % 2 === 0 ? "#1c0505" : "#240707");
        sx.fillRect(c * B, r * B, B, B);
        if (!color && rng() < 0.18) {
            sx.fillStyle = "#3a0c08";
            sx.fillRect(c * B + B / 4, r * B + B / 4, B / 4, B / 4);
        }
    };
    // Роги, що вигинаються вгору й назовні: від темної основи до світлого кінчика
    const horn = [[5, 4], [4, 4], [4, 3], [3, 3], [3, 2], [2, 2], [2, 1], [1, 1], [1, 0]];
    const hornColors = ["#3a2a22", "#4a3a2e", "#5a4a3a", "#6e5e4a", "#827260", "#9a8a74", "#b4a48c", "#ccbca4", "#e8dcc4"];
    for (let i = 0; i < horn.length; i++) {
        block(horn[i][0], horn[i][1], hornColors[i]);
        block(cols - 1 - horn[i][0], horn[i][1], hornColors[i]);
    }
    // Голова
    for (let r = 4; r < 12; r++) {
        const inset = r < 5 ? 1 : r > 10 ? 1 : 0;
        for (let c = 5 + inset; c < 13 - inset; c++) {
            block(c, r);
        }
    }
    // Плечі та тулуб
    for (let r = 12; r < rows; r++) {
        const half = Math.min(9, 4 + (r - 12) * 2);
        for (let c = 9 - half; c < 9 + half; c++) {
            block(c, r);
        }
    }
    // Контурне світло лави знизу
    sx.globalCompositeOperation = "source-atop";
    const g = sx.createLinearGradient(0, rows * B * 0.4, 0, rows * B);
    g.addColorStop(0, "rgba(255, 80, 0, 0)");
    g.addColorStop(1, "rgba(255, 80, 0, 0.35)");
    sx.fillStyle = g;
    sx.fillRect(0, 0, sprite.width, sprite.height);
    sx.globalCompositeOperation = "source-over";
    // Розжарений контур, щоб силует читався на темному тлі
    const glow = makeCanvas(sprite.width, sprite.height);
    const gx = glow.getContext("2d");
    gx.drawImage(sprite, 0, 0);
    gx.globalCompositeOperation = "source-in";
    gx.fillStyle = "#c0300a";
    gx.fillRect(0, 0, glow.width, glow.height);
    const out = makeCanvas(sprite.width + B, sprite.height + B);
    const ox = out.getContext("2d");
    const e = Math.max(2, Math.round(B / 6));
    for (const d of [[-e, 0], [e, 0], [0, -e], [0, e]]) {
        ox.drawImage(glow, B / 2 + d[0], B / 2 + d[1]);
    }
    ox.drawImage(sprite, B / 2, B / 2);
    return {
        canvas: out,
        pad: B / 2,
        eyes: [{ x: 6.5 * B, y: 7 * B }, { x: 10.5 * B, y: 7 * B }],
        mouth: { x: 7 * B, y: 9.5 * B, w: 4 * B },
        wrists: [{ x: 2 * B, y: 17 * B }, { x: 16 * B, y: 17 * B }]
    };
}

// Червона віньєтка по краях: малюється раз у розмір екрана, щоб щокадру не розтягувати
function buildDemonVignette(W, H) {
    const v = makeCanvas(W, H);
    const vx = v.getContext("2d");
    vx.setTransform(W / 128, 0, 0, H / 128, 0, 0);
    const g = vx.createRadialGradient(64, 64, 30, 64, 64, 92);
    g.addColorStop(0, "rgba(255, 0, 0, 0)");
    g.addColorStop(1, "rgba(200, 0, 0, 0.9)");
    vx.fillStyle = g;
    vx.fillRect(0, 0, 128, 128);
    return v;
}

function buildPixelNether(W, H, groundY, B) {
    const rng = pixelRng(3131);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0d0000"], [0.5, "#2a0404"], [1, "#4a0a05"]]);

    // Скелі-стеля зверху (сталактити з вогняного каменю)
    const cols = Math.ceil(W * 1.4 / B);
    const ceilH = periodicHeights(cols, 3, [{ amp: 2, k: 4, ph: 0.2 }, { amp: 1, k: 9, ph: 1 }]);
    const ceil = makeCanvas(cols * B, (Math.max.apply(null, ceilH) + 1) * B);
    const cx = ceil.getContext("2d");
    const p = B / 4;
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < ceilH[c]; r++) {
            cx.fillStyle = (r + c) % 2 === 0 ? "#5a1616" : "#4a1010";
            cx.fillRect(c * B, r * B, B, B);
            cx.fillStyle = "#6e2020";
            cx.fillRect(c * B + Math.floor(rng() * 4) * p, r * B + Math.floor(rng() * 4) * p, p, p);
        }
    }

    // Скелі знизу з лавою
    const nearH = periodicHeights(cols, 2.5, [{ amp: 1.5, k: 3, ph: 1.3 }, { amp: 1, k: 8, ph: 0.4 }]);
    const near = makeCanvas(cols * B, (Math.max.apply(null, nearH) + 1) * B);
    const nx = near.getContext("2d");
    drawBlockTerrain(nx, nearH, B, near.height, { top: "#7a2020", topLight: "#9a3030", body: "#4a1010", body2: "#551414", speck: "#ff6a00" }, rng);

    // Тріщини в скелях, що розжарюються з другої фази
    const cracks = [];
    for (let c = 2; c < cols - 2; c += 3 + Math.floor(rng() * 4)) {
        let x = c * B;
        let y = near.height - nearH[c] * B + B / 2;
        const len = 3 + Math.floor(rng() * 4);
        for (let k = 0; k < len; k++) {
            cracks.push({ x: x, y: y });
            x += (rng() < 0.5 ? -1 : 1) * p;
            y += p;
        }
    }

    // Лавопади: стовпчики, що стікають зі стелі
    const falls = [];
    for (let c = 4; c < cols - 2; c += 9 + Math.floor(rng() * 6)) {
        falls.push({ x: c * B, top: ceilH[c] * B });
    }
    return {
        W: W, H: H, sky: sky, ceil: ceil, near: near, falls: falls, cracks: cracks,
        demon: buildDemonSprite(B), vignette: buildDemonVignette(W, H)
    };
}

// Ланцюг з ланок від стелі до зап'ястя; після розриву нижня частина падає
function drawChain(ctx, x1, y1, x2, y2, B, broken) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const links = Math.max(2, Math.floor(len / (B * 0.7)));
    const breakAt = Math.floor(links * 0.45);
    for (let i = 0; i < links; i++) {
        const t = i / links;
        let x = x1 + (x2 - x1) * t;
        let y = y1 + (y2 - y1) * t;
        let alpha = 1;
        if (broken > 0 && i >= breakAt) {
            y += broken * broken * B * 14;
            x += (i - breakAt) * broken * B * 0.3 * (x2 > x1 ? 1 : -1);
            alpha = 1 - broken;
        }
        if (alpha <= 0) {
            continue;
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = i % 2 === 0 ? "#6a6070" : "#4a4250";
        if (i % 2 === 0) {
            ctx.fillRect(Math.round(x - B * 0.2), Math.round(y), Math.round(B * 0.4), Math.round(B * 0.6));
        } else {
            ctx.fillRect(Math.round(x - B * 0.1), Math.round(y), Math.round(B * 0.2), Math.round(B * 0.6));
        }
    }
    ctx.globalAlpha = 1;
}

// Зигзаг блискавки від стелі донизу
function drawLightning(ctx, x, top, bottom, B, seed) {
    const rng = pixelRng(seed);
    ctx.fillStyle = "#ffd0d0";
    let cx = x;
    for (let y = top; y < bottom; y += B / 2) {
        cx += (rng() - 0.5) * B * 1.4;
        ctx.fillRect(Math.round(cx), Math.round(y), Math.max(3, B / 3), Math.round(B / 2) + 1);
    }
}

BackgroundRenderer.renderPixelNether = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelNether;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelNether(W, H, groundY, B);
        this._pixelNether = st;
    }
    const gY = Math.round(groundY);
    const progress = _fx.progress || 0;
    const roar = _fx.oops || 0;
    const rage = smoothStep((progress - 0.3) / 0.08);
    const battle = smoothStep((progress - 0.63) / 0.08);
    ctx.drawImage(st.sky, 0, 0);
    // Небо червоніє з кожною фазою
    ctx.fillStyle = "rgba(160, 0, 0, " + (0.12 * rage + 0.18 * battle).toFixed(3) + ")";
    ctx.fillRect(0, 0, W, gY);

    // Метеори з другої фази
    if (rage > 0) {
        for (let i = 0; i < 5; i++) {
            const period = 1.6 + i * 0.37;
            const k = ((time + i * 0.71) % period) / period;
            const rng = pixelRng(Math.floor((time + i * 0.71) / period) * 13 + i);
            const mx = W * (0.3 + rng() * 0.8) - k * W * 0.35;
            const my = -B * 2 + k * gY * 0.9;
            for (let t = 0; t < 6; t++) {
                ctx.globalAlpha = rage * (1 - t / 6);
                ctx.fillStyle = t === 0 ? "#fff0a0" : t < 3 ? "#ffaa33" : "#ff4400";
                const s = Math.max(3, Math.round(B * (0.7 - t * 0.08)));
                ctx.fillRect(Math.round(mx + t * B * 0.5), Math.round(my - t * B * 0.6), s, s);
            }
        }
        ctx.globalAlpha = 1;
    }

    // Демон: піднімається з лави з кожною фазою й ледь «дихає»
    const d = st.demon;
    const sprite = d.canvas;
    const rise = 0.6 + 0.2 * rage + 0.2 * battle;
    const breathe = Math.sin(time * 1.6) * B * 0.25;
    const dX = Math.round(W * 0.62 - sprite.width / 2) + d.pad;
    const dY = Math.round(gY - (sprite.height - d.pad) * rise + breathe + B);
    ctx.drawImage(sprite, dX - d.pad, dY - d.pad);

    // Очі: заплющені в першій фазі, потім розплющуються й стежать за кубиком
    const targetX = W * DEMON_PLAYER_ANCHOR;
    const targetY = gY - (_fx.camY || 0) * 2 - B;
    const open = Math.max(rage, roar);
    for (const e of d.eyes) {
        const ex = dX + e.x;
        const ey = dY + e.y;
        const eh = Math.max(2, Math.round(B * (0.15 + open * 0.85)));
        ctx.globalAlpha = 0.35 + 0.65 * Math.max(open, 0.2);
        ctx.fillStyle = roar > 0.3 ? "#ffffff" : "#ffea00";
        ctx.fillRect(Math.round(ex - B), Math.round(ey - eh / 2), B * 2, eh);
        if (open > 0.3) {
            const ang = Math.atan2(targetY - ey, targetX - ex);
            ctx.fillStyle = "#8a0000";
            ctx.fillRect(Math.round(ex - B * 0.25 + Math.cos(ang) * B * 0.55), Math.round(ey - Math.min(eh, B * 0.6) / 2 + Math.sin(ang) * eh * 0.2), Math.round(B * 0.5), Math.round(Math.min(eh, B * 0.6)));
        }
        // Сяйво очей
        ctx.globalAlpha = 0.18 * open + 0.3 * roar;
        ctx.fillStyle = "#ff3300";
        ctx.fillRect(Math.round(ex - B * 2), Math.round(ey - B * 1.2), B * 4, B * 2.4);
    }
    ctx.globalAlpha = 1;

    // Паща: розжарюється в битві й розкривається під час реву
    const mouthOpen = Math.max(battle * (0.3 + 0.2 * Math.sin(time * 3)), roar);
    if (mouthOpen > 0.02) {
        const mh = Math.round(B * (0.3 + mouthOpen * 1.6));
        ctx.fillStyle = "#ff5500";
        ctx.fillRect(dX + d.mouth.x, dY + d.mouth.y, d.mouth.w, mh);
        ctx.fillStyle = "#ffd040";
        ctx.fillRect(dX + d.mouth.x + B / 2, dY + d.mouth.y + mh * 0.3, d.mouth.w - B, Math.max(2, mh * 0.4));
        ctx.fillStyle = "#e8d8c0";
        for (let k = 0; k < 4; k++) {
            ctx.fillRect(dX + d.mouth.x + k * B + B * 0.3, dY + d.mouth.y, B * 0.3, B * 0.35);
        }
        // З пащі капає лава
        if (battle > 0.5) {
            for (let k = 0; k < 3; k++) {
                const f = (time * 0.9 + k * 0.33) % 1;
                ctx.globalAlpha = (1 - f) * battle;
                ctx.fillStyle = f < 0.3 ? "#ffcc33" : "#ff5500";
                ctx.fillRect(Math.round(dX + d.mouth.x + B * (0.6 + k * 1.3)), Math.round(dY + d.mouth.y + mh + f * B * 6), Math.round(B * 0.4), Math.round(B * 0.6));
            }
            ctx.globalAlpha = 1;
        }
    }

    // Стеля, лавопади й ланцюги
    const ceilW = st.ceil.width;
    const offset = Math.round(time * speed * 0.2) % ceilW;
    for (let x = -offset; x < W; x += ceilW) {
        for (const f of st.falls) {
            const fxp = x + f.x;
            if (fxp < -B || fxp > W + B) {
                continue;
            }
            const flowH = gY - f.top;
            ctx.fillStyle = "#ff6a00";
            ctx.fillRect(fxp, f.top, B, flowH);
            // «Течія»: світлі пікселі, що біжать донизу
            ctx.fillStyle = "#ffcc33";
            const step = B * 1.5;
            const shift = (time * 180) % step;
            for (let y = f.top + shift; y < gY; y += step) {
                ctx.fillRect(fxp + B / 4, Math.round(y), B / 4, B / 2);
            }
        }
        ctx.drawImage(st.ceil, x, 0);
    }
    const broken = smoothStep((progress - 0.7) / 0.08);
    for (let i = 0; i < d.wrists.length; i++) {
        const w = d.wrists[i];
        const topX = dX + w.x + (i === 0 ? -B * 3 : B * 3);
        drawChain(ctx, topX, B * 2, dX + w.x, dY + w.y, B, broken);
    }

    // Гейзери лави з другої фази
    if (rage > 0) {
        for (let i = 0; i < 3; i++) {
            const period = 2.4 + i * 0.6;
            const k = ((time + i * 1.1) % period) / period;
            if (k > 0.35) {
                continue;
            }
            const rng = pixelRng(Math.floor((time + i * 1.1) / period) * 17 + i);
            const gx = W * (0.35 + rng() * 0.6);
            const h = Math.sin(k / 0.35 * Math.PI) * gY * (0.25 + 0.15 * battle) * rage;
            ctx.fillStyle = "#ff6a00";
            ctx.fillRect(Math.round(gx - B * 0.6), Math.round(gY - h), Math.round(B * 1.2), Math.round(h));
            ctx.fillStyle = "#ffd040";
            ctx.fillRect(Math.round(gx - B * 0.25), Math.round(gY - h), Math.round(B * 0.5), Math.round(h));
            for (let dpx = 0; dpx < 5; dpx++) {
                ctx.fillRect(Math.round(gx + (dpx - 2) * B * 0.6), Math.round(gY - h - B * 0.4 - (dpx % 2) * B * 0.5), Math.max(3, B / 3), Math.max(3, B / 3));
            }
        }
    }

    // Скелі знизу з тріщинами, що розжарюються
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.35);
    if (rage > 0) {
        const nearW = st.near.width;
        const nOff = Math.round(time * speed * 0.35) % nearW;
        const nTop = gY - st.near.height;
        ctx.globalAlpha = rage * (0.6 + 0.4 * Math.sin(time * 4));
        ctx.fillStyle = "#ffaa22";
        const cs = Math.max(2, Math.round(B / 4));
        for (let x = -nOff; x < W; x += nearW) {
            for (const c of st.cracks) {
                const px = x + c.x;
                if (px < -cs || px > W) {
                    continue;
                }
                ctx.fillRect(Math.round(px), nTop + Math.round(c.y), cs, cs);
            }
        }
        ctx.globalAlpha = 1;
    }

    // Лава «підіймається» з прогресом рівня боса
    const lavaH = B * 2 * (1 + progress * 2.5);
    ctx.globalAlpha = 0.25 + 0.1 * Math.sin(time * 2);
    ctx.fillStyle = "#ff4400";
    ctx.fillRect(0, gY - lavaH, W, lavaH);
    ctx.globalAlpha = 1;
    drawFallingPixels(ctx, W, gY, time, 40 + Math.round(battle * 30), 313, {
        color: "#ffae42", dir: -1, speedMin: 20, speedMax: 60 + battle * 60, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
        sway: 1.8, swayAmp: B * 0.6, alpha: 0.75
    });

    // Червоні блискавки в третій фазі
    if (battle > 0) {
        const period = 2.8;
        const k = (time % period) / period;
        if (k < 0.06) {
            const seed = Math.floor(time / period);
            const bx = W * (0.2 + pixelRng(seed * 7)() * 0.7);
            ctx.globalAlpha = battle * (1 - k / 0.06);
            ctx.fillStyle = "rgba(255, 60, 60, 0.25)";
            ctx.fillRect(0, 0, W, gY);
            drawLightning(ctx, bx, B * 2, gY * 0.8, B, seed);
            ctx.globalAlpha = 1;
        }
    }

    // Серцебиття по краях екрана: частішає до фіналу
    const bpm = 60 + progress * 80;
    const beatT = (time * bpm / 60) % 1;
    const beat = Math.max(Math.exp(-beatT * 14), 0.7 * Math.exp(-Math.abs(beatT - 0.22) * 14));
    const vAlpha = (0.12 + 0.3 * progress) * beat + 0.4 * roar;
    if (vAlpha > 0.01) {
        ctx.globalAlpha = Math.min(1, vAlpha);
        ctx.drawImage(st.vignette, 0, 0);
        ctx.globalAlpha = 1;
    }
};

// ---------- Неонова траса (рівень 4) ----------

function buildNeonHighway(W, H, groundY) {
    const gY = Math.round(groundY);
    const horizon = Math.round(gY * 0.55);
    const sky = makeSky(W, H, [[0, "#07021a"], [0.35, "#2a0a4a"], [0.55, "#7a1a6a"], [1, "#07021a"]]);
    const sx = sky.getContext("2d");
    // Сонце з прорізами
    const sunR = Math.round(H * 0.16);
    const sunX = Math.round(W / 2);
    sx.save();
    sx.beginPath();
    sx.rect(0, 0, W, horizon);
    sx.clip();
    const sg = sx.createLinearGradient(0, horizon - sunR, 0, horizon);
    sg.addColorStop(0, "#ffe14d");
    sg.addColorStop(1, "#ff2ea6");
    sx.fillStyle = sg;
    sx.beginPath();
    sx.arc(sunX, horizon, sunR, 0, Math.PI * 2);
    sx.fill();
    sx.fillStyle = "#3a0d5a";
    for (let i = 0; i < 5; i++) {
        sx.fillRect(sunX - sunR, horizon - 6 - i * sunR * 0.17, sunR * 2, 2 + i);
    }
    sx.restore();
    // Силует міста на обрії
    const rng = pixelRng(404);
    sx.fillStyle = "#12052a";
    for (let x = 0; x < W; ) {
        const w = 20 + rng() * 60;
        const h = 15 + rng() * H * 0.12;
        sx.fillRect(x, horizon - h, w, h);
        x += w + rng() * 10;
    }
    // Земля під обрієм
    sx.fillStyle = "#08021a";
    sx.fillRect(0, horizon, W, H - horizon);
    return { W: W, H: H, sky: sky, horizon: horizon };
}

BackgroundRenderer.renderNeonHighway = function (ctx, W, H, groundY, time, speed) {
    let st = this._neonHighway;
    if (!st || st.W !== W || st.H !== H) {
        st = buildNeonHighway(W, H, groundY);
        this._neonHighway = st;
    }
    const gY = Math.round(groundY);
    const hz = st.horizon;
    ctx.drawImage(st.sky, 0, 0);
    const cx = W / 2;
    // Дорога в перспективі
    ctx.fillStyle = "#14062e";
    ctx.beginPath();
    ctx.moveTo(cx - W * 0.02, hz);
    ctx.lineTo(cx + W * 0.02, hz);
    ctx.lineTo(cx + W * 0.45, gY);
    ctx.lineTo(cx - W * 0.45, gY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ff2ea6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - W * 0.02, hz);
    ctx.lineTo(cx - W * 0.45, gY);
    ctx.moveTo(cx + W * 0.02, hz);
    ctx.lineTo(cx + W * 0.45, gY);
    ctx.stroke();
    // Розділова розмітка та ліхтарі, що біжать назустріч
    const phase = (time * speed * 0.004) % 1;
    ctx.fillStyle = "#ffe14d";
    for (let i = 0; i < 8; i++) {
        const t = (i + phase) / 8;
        const k = t * t;
        const y = hz + (gY - hz) * k;
        const w = 2 + k * 10;
        const hgt = 2 + k * 18;
        ctx.fillRect(cx - w / 2, y, w, hgt);
        // Ліхтарні стовпи обабіч
        const px = W * 0.02 + k * W * 0.5;
        const postH = 6 + k * H * 0.25;
        ctx.fillStyle = "#3a1a6a";
        ctx.fillRect(cx - px - 2, y - postH, 2 + k * 3, postH);
        ctx.fillRect(cx + px, y - postH, 2 + k * 3, postH);
        ctx.fillStyle = "#00f6ff";
        ctx.fillRect(cx - px - 2 - k * 6, y - postH, 4 + k * 12, 2 + k * 4);
        ctx.fillRect(cx + px - k * 6, y - postH, 4 + k * 12, 2 + k * 4);
        ctx.fillStyle = "#ffe14d";
    }
};

// ---------- Нічне неонове місто (рівень 17): далекі хмарочоси + дахи з вивісками ----------

function buildNeonRooftops(W, H, groundY) {
    const gY = Math.round(groundY);
    const rng = pixelRng(1818);
    const sky = makeSky(W, H, [[0, "#050314"], [0.6, "#1a0b3a"], [1, "#2e0f52"]]);
    const sx = sky.getContext("2d");
    sx.fillStyle = "rgba(244, 233, 255, 0.08)";
    sx.beginPath();
    sx.arc(W * 0.82, H * 0.14, H * 0.08, 0, Math.PI * 2);
    sx.fill();
    sx.fillStyle = "#f4e9ff";
    sx.beginPath();
    sx.arc(W * 0.82, H * 0.14, H * 0.05, 0, Math.PI * 2);
    sx.fill();
    const windowColors = ["rgba(255, 220, 140, 0.45)", "rgba(140, 220, 255, 0.35)", "rgba(255, 150, 220, 0.3)"];

    // Далекі хмарочоси з вікнами
    const farW = Math.ceil(W * 1.5);
    const far = makeCanvas(farW, gY * 0.7);
    const fx = far.getContext("2d");
    for (let x = 0; x < farW; ) {
        const w = 30 + rng() * 80;
        const h = far.height * (0.3 + rng() * 0.7);
        fx.fillStyle = rng() < 0.5 ? "#1b0f3a" : "#221449";
        fx.fillRect(x, far.height - h, w, h);
        fx.fillStyle = "rgba(120, 100, 200, 0.35)";
        fx.fillRect(x, far.height - h, w, 2);
        for (let wy = far.height - h + 8; wy < far.height - 6; wy += 12) {
            for (let wx = x + 5; wx < x + w - 6; wx += 10) {
                if (rng() < 0.3) {
                    fx.fillStyle = windowColors[Math.floor(rng() * windowColors.length)];
                    fx.fillRect(wx, wy, 4, 5);
                }
            }
        }
        x += w + 4 + rng() * 12;
    }

    // Ближні дахи: вивіски малюються одразу в смугу разом зі світінням
    const nearW = Math.ceil(W * 1.3);
    const near = makeCanvas(nearW, gY * 0.5);
    const nx = near.getContext("2d");
    const lights = [];
    const flickering = [];
    const signColors = ["#ff2ea6", "#00f6ff", "#39ff88", "#ffe14d", "#b06bff"];
    function drawSign(x, y, w, h, color) {
        nx.globalAlpha = 0.18;
        nx.fillStyle = color;
        nx.fillRect(x - 6, y - 6, w + 12, h + 12);
        nx.globalAlpha = 1;
        nx.strokeStyle = color;
        nx.lineWidth = 2;
        nx.strokeRect(x, y, w, h);
        // «Літери» вивіски — короткі риски
        nx.fillStyle = color;
        const vertical = h > w;
        const n = Math.max(2, Math.floor((vertical ? h : w) / 14));
        for (let i = 0; i < n; i++) {
            if (vertical) {
                nx.fillRect(x + 3, y + 4 + i * 14, w - 6, 8);
            } else {
                nx.fillRect(x + 4 + i * 14, y + 3, 8, h - 6);
            }
        }
    }
    for (let x = 0; x < nearW - 40; ) {
        const w = 90 + rng() * 140;
        const h = near.height * (0.35 + rng() * 0.45);
        const top = near.height - h;
        nx.fillStyle = "#0d0620";
        nx.fillRect(x, top, w, h);
        nx.fillStyle = "#2a1650";
        nx.fillRect(x, top, w, 4);
        // Кілька тьмяних вікон
        nx.fillStyle = "rgba(255, 220, 140, 0.25)";
        for (let wy = top + 40; wy < near.height - 8; wy += 16) {
            for (let wx = x + 8; wx < x + w - 10; wx += 14) {
                if (rng() < 0.15) {
                    nx.fillRect(wx, wy, 5, 6);
                }
            }
        }
        // Бак для води або антена
        if (rng() < 0.5) {
            nx.fillStyle = "#1a0d33";
            nx.fillRect(x + w * 0.2, top - 26, 22, 26);
            nx.fillRect(x + w * 0.2 + 4, top - 32, 14, 6);
        } else {
            nx.fillStyle = "#2a1650";
            nx.fillRect(x + w * 0.7, top - 50, 3, 50);
            lights.push({ x: x + w * 0.7 + 1, y: top - 52, phase: rng() * 6 });
        }
        // Горизонтальна вивіска на даху та вертикальна на стіні
        const signs = [];
        if (rng() < 0.85) {
            signs.push({ x: x + w * 0.3, y: top + 12, w: Math.round(w * 0.4), h: 14 });
        }
        if (rng() < 0.6 && h > 70) {
            signs.push({ x: x + w - 22, y: top + 34, w: 14, h: Math.round(Math.min(h - 50, 90)) });
        }
        for (const sg of signs) {
            const color = signColors[Math.floor(rng() * signColors.length)];
            drawSign(sg.x, sg.y, sg.w, sg.h, color);
            // Лише приблизно кожна четверта вивіска мерехтить
            if (rng() < 0.25) {
                flickering.push({ x: sg.x - 6, y: sg.y - 6, w: sg.w + 12, h: sg.h + 12, phase: rng() * 10 });
            }
        }
        x += w + 14 + rng() * 30;
    }
    return { W: W, H: H, sky: sky, far: far, near: near, lights: lights, flickering: flickering };
}

BackgroundRenderer.renderNeonRooftops = function (ctx, W, H, groundY, time, speed) {
    let st = this._neonRooftops;
    if (!st || st.W !== W || st.H !== H) {
        st = buildNeonRooftops(W, H, groundY);
        this._neonRooftops = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, gY, time, speed, 0.1);
    const nearW = st.near.width;
    const offset = Math.round(time * speed * 0.3) % nearW;
    const top = gY - st.near.height;
    for (let x = -offset; x < W; x += nearW) {
        ctx.drawImage(st.near, x, top);
        // М'яке мерехтіння: вивіска на мить тьмяніє, а не гасне повністю
        ctx.fillStyle = "rgba(13, 6, 32, 0.45)";
        for (const f of st.flickering) {
            const fx = x + f.x;
            if (fx < -f.w || fx > W) {
                continue;
            }
            const dip = Math.sin(time * 7 + f.phase) * Math.sin(time * 2.3 + f.phase * 2);
            if (dip > 0.8) {
                ctx.fillRect(fx, top + f.y, f.w, f.h);
            }
        }
        for (const l of st.lights) {
            const lx = x + l.x;
            if (lx < -10 || lx > W + 10) {
                continue;
            }
            const on = Math.sin(time * 3 + l.phase) > 0;
            ctx.fillStyle = on ? "#ff2222" : "#551111";
            ctx.fillRect(lx - 3, top + l.y - 3, 6, 6);
        }
    }
    // Дощ
    drawFallingPixels(ctx, W, gY, time, 60, 181, {
        color: "#8fb8ff", dir: 1, speedMin: 400, speedMax: 600, sizeMin: 1, sizeMax: 2,
        sway: 0, swayAmp: 0, alpha: 0.35, stretch: 8
    });
};

// ---------- Нічна гавань (рівень 18) ----------

function buildNightHarbor(W, H, groundY) {
    const gY = Math.round(groundY);
    const rng = pixelRng(1819);
    const horizon = Math.round(gY * 0.55);
    const sky = makeSky(W, H, [[0, "#04061a"], [0.5, "#101a4a"], [1, "#06081a"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, horizon * 0.7, 60, rng, 16);
    // Далеке місто на березі з вогнями
    const lights = [];
    for (let x = 0; x < W; ) {
        const w = 20 + rng() * 50;
        const h = 15 + rng() * horizon * 0.35;
        sx.fillStyle = "#0b1030";
        sx.fillRect(x, horizon - h, w, h);
        for (let wy = horizon - h + 6; wy < horizon - 4; wy += 9) {
            for (let wx = x + 3; wx < x + w - 4; wx += 7) {
                if (rng() < 0.25) {
                    const c = ["#ffcc66", "#66e0ff", "#ff66c4"][Math.floor(rng() * 3)];
                    sx.fillStyle = c;
                    sx.fillRect(wx, wy, 3, 3);
                    if (rng() < 0.3) {
                        lights.push({ x: wx, color: c, phase: rng() * 6 });
                    }
                }
            }
        }
        x += w + rng() * 6;
    }
    // Вода
    const water = sx.createLinearGradient(0, horizon, 0, gY);
    water.addColorStop(0, "#0a1440");
    water.addColorStop(1, "#040820");
    sx.fillStyle = water;
    sx.fillRect(0, horizon, W, gY - horizon);
    // Портові крани
    const cranes = makeCanvas(Math.ceil(W * 1.4), horizon);
    const cx = cranes.getContext("2d");
    for (let x = 40; x < cranes.width - 120; x += 260 + rng() * 120) {
        const h = horizon * (0.55 + rng() * 0.3);
        cx.fillStyle = "#2a1f3a";
        cx.fillRect(x, horizon - h, 8, h);
        cx.fillRect(x - 40, horizon - h, 140, 6);
        cx.fillRect(x + 90, horizon - h, 3, h * 0.5);
        cx.fillStyle = "#ff3355";
        cx.fillRect(x - 40, horizon - h - 4, 5, 4);
        cx.fillRect(x + 95, horizon - h - 4, 5, 4);
    }
    return { W: W, H: H, sky: sky, cranes: cranes, lights: lights, horizon: horizon };
}

BackgroundRenderer.renderNightHarbor = function (ctx, W, H, groundY, time, speed) {
    let st = this._nightHarbor;
    if (!st || st.W !== W || st.H !== H) {
        st = buildNightHarbor(W, H, groundY);
        this._nightHarbor = st;
    }
    const gY = Math.round(groundY);
    const hz = st.horizon;
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.cranes, W, hz, time, speed, 0.08);
    // Відображення вогнів у воді: смужки, що тремтять
    for (let i = 0; i < st.lights.length; i++) {
        const l = st.lights[i];
        const len = 6 + ((i * 7) % 5) * 6;
        for (let k = 0; k < 4; k++) {
            const y = hz + 4 + k * (gY - hz) / 5;
            const jitter = Math.round(Math.sin(time * 3 + l.phase + k) * 3);
            ctx.globalAlpha = 0.35 - k * 0.07;
            ctx.fillStyle = l.color;
            ctx.fillRect(l.x + jitter - len / 4, y, len / 2, 2);
        }
    }
    ctx.globalAlpha = 1;
    // Хвилі
    ctx.fillStyle = "rgba(120, 160, 255, 0.12)";
    const wo = (time * 20) % 40;
    for (let y = hz + 10; y < gY; y += 14) {
        for (let x = -wo + ((y / 14) % 2) * 20; x < W; x += 40) {
            ctx.fillRect(Math.round(x), y, 14, 2);
        }
    }
    // Кораблі з вогниками повільно пливуть
    for (let s = 0; s < 2; s++) {
        const span = W + 400;
        const x = Math.round(((s * 700 + time * (18 + s * 10)) % span) - 200);
        const y = hz + 8 + s * 28;
        const len = 160 - s * 40;
        ctx.fillStyle = "#1a1030";
        ctx.fillRect(x, y, len, 14 - s * 3);
        ctx.fillRect(x + len * 0.55, y - 16, len * 0.25, 16);
        ctx.fillStyle = "#ffcc66";
        for (let wx = x + 8; wx < x + len - 10; wx += 16) {
            ctx.fillRect(wx, y + 4, 4, 3);
        }
        ctx.fillStyle = Math.sin(time * 4 + s) > 0 ? "#39ff88" : "#ff3355";
        ctx.fillRect(x + len - 6, y - 4, 4, 4);
    }
};

// ---------- Ліга 1: сцени рівнів ----------

// Піксельний силует гір з неоновим контуром (для далекого плану)
function drawNeonMountains(ctx, W, baseY, B, heights, fill, edge) {
    ctx.fillStyle = fill;
    for (let c = 0; c < heights.length; c++) {
        ctx.fillRect(c * B, baseY - heights[c] * B, B, heights[c] * B);
    }
    ctx.fillStyle = edge;
    for (let c = 0; c < heights.length; c++) {
        ctx.fillRect(c * B, baseY - heights[c] * B, B, Math.max(2, B / 5));
        const prev = c > 0 ? heights[c - 1] : heights[c];
        if (prev !== heights[c]) {
            const top = baseY - Math.max(prev, heights[c]) * B;
            const hgt = Math.abs(prev - heights[c]) * B;
            ctx.fillRect(c * B, top, Math.max(2, B / 5), hgt);
        }
    }
}

// Зоряне небо у буфер
function drawStarsInto(ctx, W, maxY, count, rng, B) {
    for (let i = 0; i < count; i++) {
        ctx.fillStyle = rng() < 0.2 ? "#bfe9ff" : "#ffffff";
        ctx.globalAlpha = 0.3 + rng() * 0.7;
        const s = rng() < 0.1 ? Math.max(2, B / 4) : Math.max(1, B / 8);
        ctx.fillRect(Math.round(rng() * W), Math.round(rng() * maxY), s, s);
    }
    ctx.globalAlpha = 1;
}

// ---------- 1. Неоновий старт ----------

function buildNeonStart(W, H, groundY, B) {
    const rng = pixelRng(101);
    const horizon = Math.round(H * 0.35);
    const sky = makeSky(W, H, [[0, "#02030f"], [0.35, "#0a1035"], [1, "#0a1035"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, horizon - B, 80, rng, B);
    const cols = Math.ceil(W / B) + 1;
    const far = periodicHeights(cols, 4, [{ amp: 2, k: 3, ph: 0.4 }, { amp: 1.2, k: 7, ph: 1.1 }]);
    drawNeonMountains(sx, W, horizon, B, far, "#0b0f2e", "rgba(0, 246, 255, 0.55)");
    return { W: W, H: H, sky: sky, horizon: horizon };
}

BackgroundRenderer.renderNeonStart = function (ctx, W, H, groundY, time, speed, accentColor) {
    const B = pixelBlockSize(H);
    let st = this._neonStart;
    if (!st || st.W !== W || st.H !== H) {
        st = buildNeonStart(W, H, groundY, B);
        this._neonStart = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    const hz = st.horizon;
    const accent = accentColor || "#00f6ff";
    // Перспективна сітка: усі лінії однієї групи — один шлях
    const vanishX = W / 2;
    const spacing = W * 0.08;
    const offset = (time * speed * 0.25) % spacing;
    ctx.lineWidth = 1;
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    for (let x = -W * 2 - offset; x < W * 3; x += spacing) {
        ctx.moveTo(vanishX, hz);
        ctx.lineTo(x, groundY);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    for (let j = 1; j <= 14; j++) {
        const t = j / 14;
        const y = hz + (groundY - hz) * t * t;
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = accent;
    ctx.fillRect(0, hz - 1, W, 3);
    // Падаючі метеори: кожні ~4 с один проноситься небом
    for (let m = 0; m < 2; m++) {
        const period = 4 + m * 2.3;
        const t = ((time + m * 1.7) % period) / 1.1;
        if (t > 1) {
            continue;
        }
        const seed = Math.floor((time + m * 1.7) / period) * 7 + m;
        const startX = W * (0.3 + ((seed * 0.37) % 0.6));
        const x = startX - t * W * 0.35;
        const y = hz * 0.1 + t * hz * 0.55;
        for (let k = 0; k < 6; k++) {
            ctx.globalAlpha = (1 - k / 6) * (1 - t * 0.5);
            ctx.fillStyle = k === 0 ? "#ffffff" : "#7df9ff";
            ctx.fillRect(Math.round(x + k * B * 0.5), Math.round(y - k * B * 0.4), Math.max(2, B / 4), Math.max(2, B / 4));
        }
    }
    ctx.globalAlpha = 1;
};

// ---------- 2. Місто на заході сонця ----------

function buildSunsetCity(W, H, groundY, B) {
    const rng = pixelRng(202);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#1a0a2e"], [0.35, "#5a1450"], [0.62, "#e0445a"], [1, "#ffb35c"]]);
    const sx = sky.getContext("2d");
    const sunR = Math.round(H * 0.13);
    const sunX = Math.round(W * 0.5);
    const sunY = Math.round(gY * 0.72);
    sx.fillStyle = "#ffd36b";
    for (let y = -sunR; y < sunR; y += B / 2) {
        const half = Math.sqrt(sunR * sunR - y * y);
        sx.fillRect(Math.round(sunX - half), sunY + y, Math.round(half * 2), B / 2);
    }
    function cityStrip(stripW, maxH, colorBody, windowColors, winChance, seed) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, maxH);
        const cx = strip.getContext("2d");
        for (let x = 0; x < stripW; ) {
            const w = Math.round((3 + r() * 5)) * B / 2;
            const h = Math.round((0.35 + r() * 0.65) * maxH / (B / 2)) * B / 2;
            cx.fillStyle = colorBody;
            cx.fillRect(x, maxH - h, w, h);
            for (let wy = maxH - h + B / 2; wy < maxH - B / 2; wy += B / 2) {
                for (let wx = x + B / 4; wx < x + w - B / 4; wx += B / 2) {
                    if (r() < winChance) {
                        cx.fillStyle = windowColors[Math.floor(r() * windowColors.length)];
                        cx.fillRect(wx, wy, B / 4, B / 4);
                    }
                }
            }
            x += w + Math.round(r() * 2) * B / 4;
        }
        return strip;
    }
    const far = cityStrip(Math.ceil(W * 1.5 / B) * B, Math.round(gY * 0.45), "#3a1250", ["rgba(255, 180, 120, 0.5)"], 0.15, 2021);
    const near = cityStrip(Math.ceil(W * 1.3 / B) * B, Math.round(gY * 0.32), "#140620", ["#ffd36b", "#ff9ed0", "#7df9ff"], 0.3, 2022);
    const cars = [];
    for (let i = 0; i < 5; i++) {
        cars.push({ lane: i % 2, offset: rng() * W * 2, speed: 90 + rng() * 80, color: ["#ff2ea6", "#00f6ff", "#ffe14d"][i % 3] });
    }
    return { W: W, H: H, sky: sky, far: far, near: near, cars: cars };
}

BackgroundRenderer.renderSunsetCity = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._sunsetCity;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSunsetCity(W, H, groundY, B);
        this._sunsetCity = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, gY, time, speed, 0.08);
    // Літаючі машини-кубики зі світловим шлейфом
    for (const car of st.cars) {
        const span = W + B * 10;
        const x = Math.round(((car.offset + time * car.speed) % span) - B * 5);
        const y = Math.round(gY * (0.3 + car.lane * 0.12));
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = car.color;
        ctx.fillRect(x - B * 2, y + B * 0.2, B * 2, B * 0.25);
        ctx.globalAlpha = 1;
        ctx.fillRect(x, y, B, B * 0.6);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + B * 0.7, y + B * 0.1, B * 0.25, B * 0.2);
    }
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.3);
};

// ---------- 3. Космодром ----------

function buildCosmodrome(W, H, groundY, B) {
    const rng = pixelRng(303);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#020412"], [0.7, "#0b1640"], [1, "#1b2a5c"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, gY * 0.8, 110, rng, B);
    const cols = Math.ceil(W / B) + 1;
    const hills = periodicHeights(cols, 2, [{ amp: 1, k: 2, ph: 0.2 }, { amp: 0.6, k: 5, ph: 1 }]);
    sx.fillStyle = "#0a1026";
    for (let c = 0; c < cols; c++) {
        sx.fillRect(c * B, gY - hills[c] * B, B, hills[c] * B);
    }
    // Стартова вежа
    const towerX = Math.round(W * 0.72 / B) * B;
    sx.fillStyle = "#2a3350";
    sx.fillRect(towerX, gY - B * 12, B, B * 12);
    for (let i = 0; i < 12; i++) {
        sx.fillStyle = i % 2 === 0 ? "#3a4570" : "#2a3350";
        sx.fillRect(towerX - B / 2, gY - B * (i + 1), B * 2, B / 4);
    }
    sx.fillStyle = "#ff3333";
    sx.fillRect(towerX + B / 4, gY - B * 12.5, B / 2, B / 2);
    // Майданчик
    sx.fillStyle = "#39415e";
    sx.fillRect(towerX - B * 2, gY - B, B * 6, B);
    return { W: W, H: H, sky: sky, padX: towerX + B * 1.5, gY: gY };
}

BackgroundRenderer.renderCosmodrome = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._cosmodrome;
    if (!st || st.W !== W || st.H !== H) {
        st = buildCosmodrome(W, H, groundY, B);
        this._cosmodrome = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    // Ракета: заправляється, чекає кінця відліку (70% рівня) і злітає з вогняним слідом
    const progress = _fx.progress || 0;
    const launchAt = 5;
    const t = progress < 0.6 ? 3 : progress < 0.7 ? 4.5 : launchAt + (progress - 0.7) / 0.3 * 3.5;
    const lift = t < launchAt ? 0 : Math.pow(t - launchAt, 2) * B * 3;
    const rx = st.padX;
    const ry = st.gY - B - B * 6 - lift;
    if (ry > -B * 8) {
        if (t >= launchAt - 1) {
            // Вогонь і дим
            const flameH = B * (2 + Math.sin(time * 30) * 0.5 + (t >= launchAt ? 2 : 0));
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(rx + B * 0.25, ry + B * 6, B * 1.5, flameH);
            ctx.fillStyle = "#ff6a00";
            ctx.fillRect(rx + B * 0.5, ry + B * 6 + flameH * 0.3, B, flameH);
            ctx.fillStyle = "rgba(200, 200, 220, 0.25)";
            for (let k = 0; k < 6; k++) {
                const sz = B * (1 + k * 0.5);
                ctx.fillRect(rx + B - sz / 2 + Math.sin(k * 2 + time) * B, st.gY - B - sz, sz, sz);
            }
        }
        ctx.fillStyle = "#e8ecf2";
        ctx.fillRect(rx, ry + B, B * 2, B * 5);
        ctx.fillStyle = "#ff3355";
        ctx.fillRect(rx + B / 2, ry, B, B);
        ctx.fillRect(rx - B / 2, ry + B * 4.5, B / 2, B * 1.5);
        ctx.fillRect(rx + B * 2, ry + B * 4.5, B / 2, B * 1.5);
        ctx.fillStyle = "#39c6ff";
        ctx.fillRect(rx + B * 0.6, ry + B * 2, B * 0.8, B * 0.8);
    }
};

// ---------- 5. Лазерний полігон ----------
// Тренувальна арена майбутнього: стіни з шестикутних панелей, голографічне табло,
// турелі стріляють лазерними імпульсами по дронах-мішенях, що розлітаються на пікселі.

function buildLaserRange(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#06070f"], [1, "#10142a"]]);
    const skx = sky.getContext("2d");
    // Світильники під стелею
    for (let x = B * 2; x < W; x += B * 7) {
        skx.fillStyle = "#1c2238";
        skx.fillRect(x, 0, B * 3, B * 0.6);
        skx.fillStyle = "#ff3355";
        skx.fillRect(x + B * 0.3, B * 0.6, B * 2.4, B * 0.15);
    }

    // Стіна з шестикутних панелей
    const stripW = Math.ceil(W * 1.4 / (B * 3)) * B * 3;
    const wallH = Math.round(gY * 0.75);
    const wall = makeCanvas(stripW, wallH);
    const wx = wall.getContext("2d");
    wx.fillStyle = "#0c1020";
    wx.fillRect(0, 0, stripW, wallH);
    const hr = B * 1.5;
    for (let row = 0, y = hr; y < wallH + hr; row++, y += hr * 1.5) {
        for (let x = (row % 2) * hr * 0.87; x < stripW + hr; x += hr * 1.74) {
            wx.strokeStyle = "rgba(90, 120, 200, 0.22)";
            wx.lineWidth = 2;
            wx.beginPath();
            for (let k = 0; k < 6; k++) {
                const a = Math.PI / 6 + k * Math.PI / 3;
                const px = x + Math.cos(a) * hr * 0.95;
                const py = y + Math.sin(a) * hr * 0.95;
                if (k === 0) {
                    wx.moveTo(px, py);
                } else {
                    wx.lineTo(px, py);
                }
            }
            wx.closePath();
            wx.stroke();
        }
    }
    // Червона смуга безпеки
    wx.fillStyle = "rgba(255, 51, 85, 0.35)";
    wx.fillRect(0, wallH - B * 1.2, stripW, B * 0.2);

    // Турелі на підлозі
    const turretW = Math.ceil(W * 1.2 / (B * 9)) * B * 9;
    const turrets = makeCanvas(turretW, B * 3);
    const tx = turrets.getContext("2d");
    const guns = [];
    for (let x = B * 3; x < turretW; x += B * 9) {
        tx.fillStyle = "#2a3048";
        tx.fillRect(x - B, B * 2, B * 2, B);
        tx.fillStyle = "#3a4262";
        tx.fillRect(x - B * 0.7, B * 1.2, B * 1.4, B * 0.9);
        tx.fillStyle = "#ff3355";
        tx.fillRect(x - B * 0.2, B * 1.4, B * 0.4, B * 0.3);
        guns.push({ x: x, y: B * 1.3 });
    }
    return { W: W, H: H, sky: sky, wall: wall, turrets: turrets, guns: guns };
}

BackgroundRenderer.renderLaserRange = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._laserRange;
    if (!st || st.W !== W || st.H !== H) {
        st = buildLaserRange(W, H, groundY, B);
        this._laserRange = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.wall, W, gY, time, speed, 0.12);

    // Голографічне табло з лічильником влучань
    const hits = Math.floor(time / 2.2) % 100;
    const bx = Math.round(W * 0.42);
    const by = Math.round(gY * 0.1);
    ctx.fillStyle = "rgba(57, 198, 255, 0.12)";
    ctx.fillRect(bx, by, B * 7, B * 3.4);
    ctx.strokeStyle = "rgba(57, 198, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, B * 7, B * 3.4);
    drawBigDigit(ctx, Math.floor(hits / 10), bx + B * 2, by + B * 0.6, B * 0.45, "#7df9ff");
    drawBigDigit(ctx, hits % 10, bx + B * 3.8, by + B * 0.6, B * 0.45, "#7df9ff");
    ctx.fillStyle = "rgba(57, 198, 255, 0.25)";
    const scan = (time * 40) % (B * 3.4);
    ctx.fillRect(bx, by + scan, B * 7, 2);

    // Дрони-мішені: летять, у них влучає імпульс, вони вибухають і з'являються знову
    const tW = st.turrets.width;
    const tOff = Math.round(time * speed * 0.35) % tW;
    const tTop = gY - st.turrets.height;
    for (let x = -tOff; x < W; x += tW) {
        for (let i = 0; i < st.guns.length; i++) {
            const g = st.guns[i];
            const gxp = x + g.x;
            if (gxp < -W * 0.3 || gxp > W * 1.3) {
                continue;
            }
            const cycle = 2.2;
            const k = ((time + i * 0.7) % cycle) / cycle;
            const dx = gxp + Math.sin((time + i) * 1.3) * B * 3;
            const dy = gY * (0.3 + 0.12 * Math.sin(time * 0.9 + i * 2));
            if (k < 0.72) {
                // Дрон-мішень з мигалкою
                const blade = Math.abs(Math.sin(time * 30 + i)) * B * 0.9;
                ctx.fillStyle = "#c8d2da";
                ctx.fillRect(Math.round(dx - B), Math.round(dy - B * 0.4), Math.round(B * 2), Math.round(B * 0.8));
                ctx.fillStyle = "#8a96a4";
                ctx.fillRect(Math.round(dx - B * 1.6), Math.round(dy - B * 0.6), Math.round(B * 0.6), Math.round(B * 0.3));
                ctx.fillRect(Math.round(dx + B), Math.round(dy - B * 0.6), Math.round(B * 0.6), Math.round(B * 0.3));
                ctx.fillStyle = "#e8eef2";
                ctx.fillRect(Math.round(dx - B * 1.3 - blade / 2), Math.round(dy - B * 0.75), Math.round(blade), 2);
                ctx.fillRect(Math.round(dx + B * 1.3 - blade / 2), Math.round(dy - B * 0.75), Math.round(blade), 2);
                ctx.fillStyle = Math.sin(time * 8 + i) > 0 ? "#ff3355" : "#ffe14d";
                ctx.fillRect(Math.round(dx - B * 0.25), Math.round(dy - B * 0.2), Math.round(B * 0.5), Math.round(B * 0.4));
                // Приціл-мітка довкола мішені
                ctx.strokeStyle = "rgba(255, 51, 85, 0.7)";
                ctx.lineWidth = 2;
                const r = B * 1.6;
                ctx.beginPath();
                ctx.moveTo(dx - r, dy - r * 0.5); ctx.lineTo(dx - r, dy - r); ctx.lineTo(dx - r * 0.5, dy - r);
                ctx.moveTo(dx + r * 0.5, dy - r); ctx.lineTo(dx + r, dy - r); ctx.lineTo(dx + r, dy - r * 0.5);
                ctx.moveTo(dx + r, dy + r * 0.5); ctx.lineTo(dx + r, dy + r); ctx.lineTo(dx + r * 0.5, dy + r);
                ctx.moveTo(dx - r * 0.5, dy + r); ctx.lineTo(dx - r, dy + r); ctx.lineTo(dx - r, dy + r * 0.5);
                ctx.stroke();
                if (k > 0.55) {
                    // Лазерний імпульс летить від турелі до дрона
                    const q = (k - 0.55) / 0.17;
                    const sx = gxp;
                    const sy = tTop + g.y;
                    const px = sx + (dx - sx) * q;
                    const py = sy + (dy - sy) * q;
                    const len = B * 1.2;
                    const ang = Math.atan2(dy - sy, dx - sx);
                    ctx.strokeStyle = "#39ff88";
                    ctx.lineWidth = Math.max(3, B / 5);
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(px - Math.cos(ang) * len, py - Math.sin(ang) * len);
                    ctx.stroke();
                }
            } else {
                // Вибух на пікселі
                const q = (k - 0.72) / 0.28;
                ctx.globalAlpha = 1 - q;
                for (let b = 0; b < 8; b++) {
                    const a = b * Math.PI / 4;
                    ctx.fillStyle = b % 2 === 0 ? "#ffe14d" : "#ff3355";
                    ctx.fillRect(Math.round(dx + Math.cos(a) * q * B * 2.5), Math.round(dy + Math.sin(a) * q * B * 2.5), Math.max(3, B / 3), Math.max(3, B / 3));
                }
                ctx.globalAlpha = 1;
            }
        }
        ctx.drawImage(st.turrets, x, tTop);
    }
};

// ---------- 6. Цифровий ліс ----------

function buildDigitalForest(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#010805"], [1, "#04160c"]]);
    function forestStrip(stripW, trunkColor, leafColor, leafLight, height, seed, gap) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, height);
        const fx = strip.getContext("2d");
        const trees = [];
        for (let x = B; x < stripW - B * 3; x += B * (gap + Math.floor(r() * 3))) {
            const th = Math.round((0.35 + r() * 0.3) * height / B);
            fx.fillStyle = trunkColor;
            fx.fillRect(x + B, height - th * B, B, th * B);
            // Крона з блоків
            const crown = 2 + Math.floor(r() * 2);
            for (let row = 0; row < crown + 1; row++) {
                const w = crown * 2 + 1 - row * 2;
                fx.fillStyle = row % 2 === 0 ? leafColor : leafLight;
                fx.fillRect(x + B * 1.5 - (w * B) / 2, height - th * B - (row + 1) * B, w * B, B);
            }
            trees.push({ x: x + B, top: height - th * B, h: th * B });
        }
        return { canvas: strip, trees: trees };
    }
    const far = forestStrip(Math.ceil(W * 1.5 / B) * B, "#06200f", "#0a3318", "#0c3d1c", Math.round(gY * 0.6), 601, 4);
    const near = forestStrip(Math.ceil(W * 1.3 / B) * B, "#0f3a1c", "#146b2e", "#1b8a3a", Math.round(gY * 0.75), 602, 6);
    return { W: W, H: H, sky: sky, far: far, near: near };
}

BackgroundRenderer.renderDigitalForest = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._digitalForest;
    if (!st || st.W !== W || st.H !== H) {
        st = buildDigitalForest(W, H, groundY, B);
        this._digitalForest = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far.canvas, W, gY, time, speed, 0.1);
    const nearW = st.near.canvas.width;
    const offset = Math.round(time * speed * 0.3) % nearW;
    const top = gY - st.near.canvas.height;
    for (let x = -offset; x < W; x += nearW) {
        ctx.drawImage(st.near.canvas, x, top);
        // По стовбурах біжить зелений «код»
        for (let i = 0; i < st.near.trees.length; i++) {
            const tr = st.near.trees[i];
            const tx = x + tr.x;
            if (tx < -B || tx > W + B) {
                continue;
            }
            const cell = B / 3;
            const head = (time * (60 + i * 7) + i * 50) % (tr.h + cell * 6);
            for (let k = 0; k < 5; k++) {
                const y = head - k * cell;
                if (y < 0 || y > tr.h) {
                    continue;
                }
                ctx.fillStyle = k === 0 ? "#d8ffe0" : "rgba(0, 255, 90, " + (0.8 - k * 0.15).toFixed(2) + ")";
                ctx.fillRect(tx + cell, top + tr.top + y, cell, cell);
            }
        }
    }
    // Світлячки
    drawFallingPixels(ctx, W, gY, time, 25, 606, {
        color: "#c8ff5a", dir: -1, speedMin: 4, speedMax: 12, sizeMin: 2, sizeMax: 3,
        sway: 1.2, swayAmp: B * 1.5, alpha: 0.8
    });
};

// ---------- 7. Грозове небо ----------

function buildStormSky(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#06070f"], [0.7, "#161a2e"], [1, "#22283f"]]);
    const cols = Math.ceil(W / B) + 1;
    const sx = sky.getContext("2d");
    const hills = periodicHeights(cols, 3, [{ amp: 1.5, k: 2, ph: 0.5 }, { amp: 0.8, k: 6, ph: 2 }]);
    sx.fillStyle = "#121628";
    for (let c = 0; c < cols; c++) {
        sx.fillRect(c * B, gY - hills[c] * B, B, hills[c] * B);
    }
    // Хатинка з вогником у вікні та дерева на пагорбах
    const hc = Math.round(cols * 0.62);
    const hTop = gY - hills[hc] * B;
    sx.fillStyle = "#1c2238";
    sx.fillRect(hc * B, hTop - B * 2, B * 3, B * 2);
    sx.fillRect(hc * B + B / 2, hTop - B * 3, B * 2, B);
    sx.fillStyle = "#ffcc55";
    sx.fillRect(hc * B + B, hTop - B * 1.5, B * 0.6, B * 0.6);
    for (const tc of [Math.round(cols * 0.18), Math.round(cols * 0.35), Math.round(cols * 0.85)]) {
        const tTop = gY - hills[tc] * B;
        sx.fillStyle = "#161b30";
        sx.fillRect(tc * B + B / 3, tTop - B * 2, B / 3, B * 2);
        sx.fillRect(tc * B - B / 2, tTop - B * 3.5, B * 2, B * 1.8);
    }
    function cloudStrip(stripW, color, colorLight, seed, rows) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, rows * B);
        const cx = strip.getContext("2d");
        for (let x = 0; x < stripW; x += B) {
            const hgt = rows - Math.floor(r() * 2) - (Math.sin(x / stripW * Math.PI * 6) > 0 ? 0 : 1);
            cx.fillStyle = color;
            cx.fillRect(x, 0, B, hgt * B);
            cx.fillStyle = colorLight;
            cx.fillRect(x, (hgt - 1) * B, B, B / 3);
        }
        return strip;
    }
    const far = cloudStrip(Math.ceil(W * 1.5 / B) * B, "#1c2138", "#262c48", 701, 4);
    const near = cloudStrip(Math.ceil(W * 1.3 / B) * B, "#2a3050", "#3a4266", 702, 3);

    // Ферма на ближньому плані: поля, амбар, паркан; вітряки й дерева малюються щокадру
    const rng = pixelRng(7070);
    const farmW = Math.ceil(W * 1.5 / (B * 16)) * B * 16;
    const farmH = Math.round(B * 7);
    const farm = makeCanvas(farmW, farmH);
    const fx = farm.getContext("2d");
    for (let r = 0; r < 3; r++) {
        fx.fillStyle = r % 2 === 0 ? "#1f2a1c" : "#243020";
        fx.fillRect(0, farmH - (r + 1) * B * 0.6, farmW, B * 0.6);
    }
    const mills = [];
    const trees = [];
    const windows = [];
    for (let x = 0; x < farmW; x += B * 16) {
        // Амбар
        const bx = x + B * 2;
        fx.fillStyle = "#5a1e1e";
        fx.fillRect(bx, farmH - B * 4, B * 4, B * 3);
        for (let k = 0; k < 3; k++) {
            fx.fillRect(bx + k * B * 0.6, farmH - B * 4 - (k + 1) * B * 0.5, B * 4 - k * B * 1.2, B * 0.5);
        }
        fx.fillStyle = "#e8e0d0";
        fx.fillRect(bx + B * 1.4, farmH - B * 2.6, B * 1.2, B * 1.6);
        fx.fillStyle = "#5a1e1e";
        fx.fillRect(bx + B * 1.5, farmH - B * 2.5, B, B * 1.4);
        windows.push({ x: bx + B * 0.5, y: farmH - B * 3.6 });
        windows.push({ x: bx + B * 2.9, y: farmH - B * 3.6 });
        // Вітряк
        const mx = x + B * 10;
        fx.fillStyle = "#3a3448";
        for (let k = 0; k < 6; k++) {
            fx.fillRect(mx - B * 0.8 + k * B * 0.1, farmH - B * 1 - (k + 1) * B * 0.8, B * 1.6 - k * B * 0.2, B * 0.8);
        }
        mills.push({ x: mx, y: farmH - B * 5.6 });
        // Паркан
        fx.fillStyle = "#4a3a2a";
        fx.fillRect(x + B * 6.5, farmH - B * 1.6, B * 2.5, B * 0.2);
        fx.fillRect(x + B * 6.5, farmH - B * 1.1, B * 2.5, B * 0.2);
        for (let k = 0; k < 4; k++) {
            fx.fillRect(x + B * 6.6 + k * B * 0.75, farmH - B * 1.9, B * 0.2, B * 1.3);
        }
        trees.push({ x: x + B * 13.5, h: 3 + Math.floor(rng() * 2) });
        trees.push({ x: x + B * 15, h: 2 + Math.floor(rng() * 2) });
    }
    return { W: W, H: H, sky: sky, far: far, near: near, farm: farm, mills: mills, trees: trees, windows: windows };
}

BackgroundRenderer.renderStormSky = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._stormSky;
    if (!st || st.W !== W || st.H !== H) {
        st = buildStormSky(W, H, groundY, B);
        this._stormSky = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Блискавка кожні ~3.5 с у різному місці
    const period = 3.5;
    const calm = smoothStep(((_fx.progress || 0) - 0.63) / 0.08);
    const phase = calm > 0.5 ? period : time % period;
    const strike = Math.floor(time / period);
    if (phase < 0.35) {
        const flash = 1 - phase / 0.35;
        ctx.fillStyle = "rgba(200, 210, 255, " + (0.25 * flash).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
        const r = pixelRng(strike * 13 + 7);
        // Зигзаг блискавки: вертикальні відрізки, з'єднані горизонтальними, з ореолом
        let x = Math.round(W * (0.15 + r() * 0.7));
        let y = B * 3;
        const bw = Math.max(4, Math.round(B / 2.5));
        const segments = [];
        while (y < gY - B * 2) {
            const segH = B * (1 + Math.floor(r() * 2));
            const nx = x + (r() < 0.5 ? -1 : 1) * Math.round(B * 0.8);
            segments.push([x, y, segH, nx]);
            x = nx;
            y += segH;
        }
        for (let pass = 0; pass < 2; pass++) {
            const grow = pass === 0 ? bw : 0;
            ctx.fillStyle = pass === 0
                ? "rgba(140, 170, 255, " + (0.35 * flash).toFixed(3) + ")"
                : "rgba(255, 255, 255, " + flash.toFixed(3) + ")";
            for (const sg of segments) {
                ctx.fillRect(sg[0] - grow, sg[1] - grow, bw + grow * 2, sg[2] + grow * 2);
                ctx.fillRect(Math.min(sg[0], sg[3]) - grow, sg[1] + sg[2] - bw / 2 - grow, Math.abs(sg[3] - sg[0]) + bw + grow * 2, bw + grow * 2);
            }
        }
    }
    drawScrollingStrip(ctx, st.far, W, B * 5, time, speed, 0.04);
    drawScrollingStrip(ctx, st.near, W, B * 3, time, speed, 0.08);
    // Спалах підсвічує хмари
    if (phase < 0.35) {
        ctx.fillStyle = "rgba(200, 215, 255, " + (0.3 * (1 - phase / 0.35)).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, B * 5);
    }
    // Ферма: вітер гне дерева, лопаті вітряків крутяться, у вікні світло
    const farmW = st.farm.width;
    const fOff = Math.round(time * speed * 0.3) % farmW;
    const fTop = gY - st.farm.height;
    const wind = 1 - calm * 0.7;
    for (let x = -fOff; x < W; x += farmW) {
        ctx.drawImage(st.farm, x, fTop);
        for (let i = 0; i < st.trees.length; i++) {
            const t = st.trees[i];
            const tx = x + t.x;
            if (tx < -B * 3 || tx > W + B * 3) {
                continue;
            }
            const sway = Math.sin(time * 2.2 + i) * B * 0.6 * wind + B * 0.3 * wind;
            ctx.fillStyle = "#2a2018";
            ctx.fillRect(Math.round(tx), fTop + st.farm.height - B * (t.h + 1), Math.round(B * 0.4), B * (t.h + 1));
            ctx.fillStyle = "#1e3a22";
            ctx.fillRect(Math.round(tx - B + sway), fTop + st.farm.height - B * (t.h + 3), B * 2.4, B * 2);
            ctx.fillStyle = "#26482a";
            ctx.fillRect(Math.round(tx - B * 0.5 + sway * 1.3), fTop + st.farm.height - B * (t.h + 3.6), B * 1.4, B * 0.8);
        }
        for (let i = 0; i < st.mills.length; i++) {
            const m = st.mills[i];
            const mx = x + m.x;
            if (mx < -B * 5 || mx > W + B * 5) {
                continue;
            }
            const my = fTop + m.y;
            const rot = time * (1.5 + 2 * wind) + i;
            ctx.strokeStyle = "#8a8098";
            ctx.lineWidth = Math.max(3, B / 3);
            ctx.beginPath();
            for (let k = 0; k < 4; k++) {
                const a = rot + k * Math.PI / 2;
                ctx.moveTo(mx, my);
                ctx.lineTo(mx + Math.cos(a) * B * 3, my + Math.sin(a) * B * 3);
            }
            ctx.stroke();
            ctx.fillStyle = "#c8c0d8";
            ctx.fillRect(Math.round(mx - B * 0.3), Math.round(my - B * 0.3), Math.round(B * 0.6), Math.round(B * 0.6));
        }
        for (let i = 0; i < st.windows.length; i++) {
            const w = st.windows[i];
            ctx.fillStyle = (time * 0.7 + i) % 5 < 4.6 ? "#ffcc55" : "#6a5020";
            ctx.fillRect(Math.round(x + w.x), fTop + w.y, Math.round(B * 0.6), Math.round(B * 0.5));
        }
    }
    // Блискавка на мить освітлює ферму
    if (phase < 0.35) {
        ctx.fillStyle = "rgba(200, 215, 255, " + (0.25 * (1 - phase / 0.35)).toFixed(3) + ")";
        ctx.fillRect(0, fTop, W, gY - fTop);
    }
    drawFallingPixels(ctx, W, gY, time, Math.round(70 * (1 - calm)), 707, {
        color: "#9fb4ff", dir: 1, speedMin: 450, speedMax: 650, sizeMin: 1, sizeMax: 2,
        sway: 0, swayAmp: 0, alpha: 0.4, stretch: 7
    });
};

// ---------- 8. Кришталева печера ----------
// Велика печера: брили кристалів трьох кольорів, сталактити, світні гриби,
// підземне озеро з відблисками. Промінь світла крізь призму розкладається на веселку.

// Піксельний кристал-призма: шестикутна «колона» з гострою верхівкою
function drawCrystal(ctx, x, baseY, w, h, color, light, dark) {
    const p = Math.max(2, Math.round(w / 4));
    const tip = Math.min(h - p, Math.round(w * 1.5));
    ctx.fillStyle = color;
    ctx.fillRect(x, baseY - h + tip, w, h - tip);
    for (let r = 0; r < tip; r += p) {
        const inset = Math.round((1 - r / tip) * w / 2 / p) * p;
        ctx.fillRect(x + inset, baseY - h + r, w - inset * 2, p);
    }
    ctx.fillStyle = light;
    ctx.fillRect(x + p, baseY - h + tip, p, h - tip - p);
    ctx.fillStyle = dark;
    ctx.fillRect(x + w - p, baseY - h + tip, p, h - tip);
}

const CRYSTAL_COLORS = [
    ["#b35cff", "#e6bfff", "#6a2aa0"],
    ["#39c6ff", "#bff0ff", "#1a6a9a"],
    ["#ff5ad8", "#ffc8f0", "#9a2a80"]
];

function buildCrystalCave(W, H, groundY, B) {
    const rng = pixelRng(808);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#07040f"], [0.6, "#140a26"], [1, "#1e1036"]]);
    const cols = Math.ceil(W * 1.4 / B);

    // Далека стіна печери
    const farH = periodicHeights(cols, 9, [{ amp: 2.5, k: 3, ph: 0.2 }, { amp: 1.2, k: 7, ph: 1.4 }]);
    const far = makeCanvas(cols * B, (Math.max.apply(null, farH) + 1) * B);
    const fx = far.getContext("2d");
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < farH[c]; r++) {
            fx.fillStyle = (r + c) % 2 === 0 ? "#1a1030" : "#1d1236";
            fx.fillRect(c * B, far.height - (r + 1) * B, B, B);
        }
    }
    // Дрібні кристали на далекій стіні
    for (let i = 0; i < cols / 3; i++) {
        const c = Math.floor(rng() * cols);
        const pal = CRYSTAL_COLORS[i % 3];
        drawCrystal(fx, c * B, far.height - Math.floor(rng() * farH[c]) * B, Math.round(B * 0.6), Math.round(B * 1.4), pal[2], pal[0], "#120a20");
    }

    // Стеля зі сталактитами та кристалами, що звисають
    const ceilH = periodicHeights(cols, 2.5, [{ amp: 1.5, k: 5, ph: 0.9 }, { amp: 1, k: 11, ph: 0.3 }]);
    const ceil = makeCanvas(cols * B, (Math.max.apply(null, ceilH) + 4) * B);
    const cx = ceil.getContext("2d");
    for (let c = 0; c < cols; c++) {
        cx.fillStyle = c % 2 === 0 ? "#150c26" : "#180e2c";
        cx.fillRect(c * B, 0, B, ceilH[c] * B);
        if (rng() < 0.2) {
            const len = 1 + Math.floor(rng() * 3);
            for (let k = 0; k < len; k++) {
                cx.fillRect(c * B + k * B / 6, ceilH[c] * B + k * B, B - k * B / 3, B);
            }
        }
        if (rng() < 0.12) {
            const pal = CRYSTAL_COLORS[Math.floor(rng() * 3)];
            cx.save();
            cx.translate(c * B + B / 2, ceilH[c] * B);
            cx.scale(1, -1);
            drawCrystal(cx, -B / 3, 0, Math.round(B * 0.7), Math.round(B * 2), pal[0], pal[1], pal[2]);
            cx.restore();
        }
    }

    // Ближні брили кристалів і гриби
    const stripW = Math.ceil(W * 1.5 / B) * B;
    const nearH = Math.round(B * 8);
    const near = makeCanvas(stripW, nearH);
    const nx = near.getContext("2d");
    const glows = [];
    for (let x = B; x < stripW - B * 5; x += B * (5 + Math.floor(rng() * 4))) {
        const pal = CRYSTAL_COLORS[Math.floor(rng() * 3)];
        const n = 2 + Math.floor(rng() * 3);
        // Кам'яна основа
        nx.fillStyle = "#1c1030";
        nx.fillRect(x - B * 0.5, nearH - B, B * (n + 1.5), B);
        for (let k = 0; k < n; k++) {
            const h = Math.round(B * (2 + rng() * 4.5));
            const w = Math.round(B * (0.8 + rng() * 0.6));
            drawCrystal(nx, Math.round(x + k * B * 0.9), nearH - B * 0.6, w, h, pal[0], pal[1], pal[2]);
        }
        glows.push({ x: x + n * B * 0.45, y: nearH - B * 2.5, color: pal[0], phase: rng() * 6 });
        // Світні гриби поруч
        if (rng() < 0.6) {
            const mx = x + (n + 1) * B;
            nx.fillStyle = "#d8d0e8";
            nx.fillRect(mx, nearH - B * 1.4, B * 0.3, B * 0.8);
            nx.fillStyle = "#39ffd0";
            nx.fillRect(mx - B * 0.35, nearH - B * 1.7, B, B * 0.4);
            glows.push({ x: mx + B * 0.15, y: nearH - B * 1.5, color: "#39ffd0", phase: rng() * 6, small: true });
        }
    }
    return { W: W, H: H, sky: sky, far: far, ceil: ceil, near: near, glows: glows };
}

BackgroundRenderer.renderCrystalCave = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._crystalCave;
    if (!st || st.W !== W || st.H !== H) {
        st = buildCrystalCave(W, H, groundY, B);
        this._crystalCave = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);

    drawScrollingStrip(ctx, st.far, W, gY - B * 1.5, time, speed, 0.08);
    // Промінь крізь отвір у стелі падає на призму й розкладається на веселку
    const prismX = W * 0.35;
    const prismY = gY * 0.55;
    ctx.fillStyle = "rgba(255, 255, 240, 0.18)";
    ctx.beginPath();
    ctx.moveTo(W * 0.2, 0);
    ctx.lineTo(W * 0.2 + B * 2, 0);
    ctx.lineTo(prismX + B * 0.5, prismY);
    ctx.lineTo(prismX - B * 0.5, prismY);
    ctx.closePath();
    ctx.fill();
    const rainbow = ["255, 51, 85", "255, 154, 61", "255, 225, 77", "57, 255, 136", "57, 198, 255", "179, 92, 255"];
    const shimmer = 0.2 + 0.06 * Math.sin(time * 2);
    for (let i = 0; i < rainbow.length; i++) {
        const a0 = 0.15 + i * 0.07;
        ctx.fillStyle = "rgba(" + rainbow[i] + ", " + shimmer.toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(prismX, prismY);
        ctx.lineTo(prismX + Math.cos(a0) * W, prismY + Math.sin(a0) * W);
        ctx.lineTo(prismX + Math.cos(a0 + 0.06) * W, prismY + Math.sin(a0 + 0.06) * W);
        ctx.closePath();
        ctx.fill();
    }

    drawCrystal(ctx, Math.round(prismX - B * 0.8), Math.round(prismY + B * 1.2), Math.round(B * 1.6), Math.round(B * 2.6), "#e6f4ff", "#ffffff", "#9ab4d0");

    // Підземне озеро з відблисками
    ctx.fillStyle = "rgba(60, 30, 120, 0.45)";
    ctx.fillRect(0, gY - B * 1.8, W, B * 0.9);
    for (let i = 0; i < 12; i++) {
        const lx = ((i * W / 12 + Math.sin(time * 0.8 + i) * B) % W + W) % W;
        ctx.fillStyle = i % 2 === 0 ? "rgba(214, 139, 255, 0.5)" : "rgba(120, 220, 255, 0.5)";
        ctx.fillRect(Math.round(lx), gY - B * 1.5 + (i % 3) * 3, Math.round(B * (0.6 + (i % 3) * 0.3)), 2);
    }

    // Стеля зі сталактитами
    const ceilW = st.ceil.width;
    const cOff = Math.round(time * speed * 0.2) % ceilW;
    for (let x = -cOff; x < W; x += ceilW) {
        ctx.drawImage(st.ceil, x, 0);
    }

    // Брили кристалів пульсують світлом
    const nW = st.near.width;
    const nOff = Math.round(time * speed * 0.45) % nW;
    const nTop = gY - st.near.height;
    for (let x = -nOff; x < W; x += nW) {
        for (const g of st.glows) {
            const gx = x + g.x;
            if (gx < -B * 3 || gx > W + B * 3) {
                continue;
            }
            const pulse = 0.5 + 0.5 * Math.sin(time * 2 + g.phase);
            ctx.globalAlpha = (g.small ? 0.15 : 0.12) + 0.12 * pulse;
            drawPixelDisc(ctx, gx, nTop + g.y, B * (g.small ? 1 : 2.4), B / 2, g.color);
        }
        ctx.globalAlpha = 1;
        ctx.drawImage(st.near, x, nTop);
    }
    // Спори, що повільно злітають угору
    drawFallingPixels(ctx, W, gY, time, 26, 8080, {
        color: "#d68bff", dir: -1, speedMin: 8, speedMax: 20, sizeMin: 2, sizeMax: 3,
        sway: 1.1, swayAmp: B, alpha: 0.7
    });
};

// ---------- 9. Долина динозаврів ----------
// Вулкан на обрії димить і дедалі сильніше вивергається з прогресом рівня,
// у глибині бреде довгошия зауропода, над папоротями пролітають птеродактилі.

// Піксельний диск (сонце, місяць): рядки блоків за рівнянням кола
function drawPixelDisc(ctx, cx, cy, r, B, color) {
    ctx.fillStyle = color;
    const rows = Math.ceil(r / B);
    for (let i = -rows; i < rows; i++) {
        const yMid = (i + 0.5) * B;
        const half = Math.sqrt(Math.max(0, r * r - yMid * yMid));
        const w = Math.round(half / B) * B;
        if (w > 0) {
            ctx.fillRect(Math.round(cx - w), Math.round(cy + i * B), w * 2, B);
        }
    }
}

function buildDinoValley(W, H, groundY, B) {
    const rng = pixelRng(909);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#2a1f5a"], [0.45, "#b8506a"], [0.75, "#ff9a55"], [1, "#ffd08a"]]);
    const skx = sky.getContext("2d");
    // Велике низьке сонце
    drawPixelDisc(skx, W * 0.3, gY * 0.5, B * 5.5, B, "rgba(255, 230, 150, 0.25)");
    drawPixelDisc(skx, W * 0.3, gY * 0.5, B * 4, B, "#ffe9a8");

    // Вулкан — один великий силует у далекому шарі (не прокручується)
    const vW = B * 26;
    const vH = Math.round(gY * 0.55);
    const volcano = makeCanvas(vW, vH);
    const vx = volcano.getContext("2d");
    const rows = Math.ceil(vH / B);
    for (let r = 0; r < rows; r++) {
        const k = r / Math.max(1, rows - 1);
        const half = Math.min(13, Math.round(2 + k * 11 + (r > 1 && rng() < 0.3 ? 1 : 0)));
        for (let c = -half; c < half; c++) {
            // Кратер: виїмка у верхньому ряду
            if (r === 0 && c >= -1 && c < 1) {
                continue;
            }
            vx.fillStyle = c < -half * 0.3 ? "#241428" : (r + c) % 3 === 0 ? "#34203a" : "#2e1c34";
            vx.fillRect(vW / 2 + c * B, r * B, B, B);
        }
    }

    // Далекі гори
    const cols = Math.ceil(W * 1.4 / B);
    const farH = periodicHeights(cols, 5, [{ amp: 2.5, k: 3, ph: 0.4 }, { amp: 1, k: 7, ph: 1.1 }]);
    const far = makeCanvas(cols * B, (Math.max.apply(null, farH) + 1) * B);
    const fx = far.getContext("2d");
    for (let c = 0; c < cols; c++) {
        fx.fillStyle = c % 2 === 0 ? "#5a3456" : "#613a5c";
        fx.fillRect(c * B, far.height - farH[c] * B, B, farH[c] * B);
    }

    // Середній шар: джунглі з папоротей і саговників
    const mid = makeCanvas(cols * B, B * 9);
    const mx = mid.getContext("2d");
    const midH = periodicHeights(cols, 3, [{ amp: 1, k: 5, ph: 0.7 }, { amp: 0.7, k: 11, ph: 0.2 }]);
    for (let c = 0; c < cols; c++) {
        mx.fillStyle = c % 2 === 0 ? "#1e4a2a" : "#22532f";
        mx.fillRect(c * B, mid.height - midH[c] * B, B, midH[c] * B);
    }
    for (let c = 3; c < cols - 3; c += 7 + Math.floor(rng() * 5)) {
        const trunk = 4 + Math.floor(rng() * 3);
        const base = mid.height - midH[c] * B;
        mx.fillStyle = "#4a3020";
        mx.fillRect(c * B + B / 4, base - trunk * B, B / 2, trunk * B);
        mx.fillStyle = "#2f7a3a";
        const top = base - trunk * B;
        for (let k = -3; k <= 3; k++) {
            const droop = Math.abs(k) * B * 0.45;
            mx.fillRect(c * B + k * B * 0.8, top + droop - B / 4, B * 0.9, B / 2);
        }
        mx.fillStyle = "#3fa04a";
        mx.fillRect(c * B - B / 4, top - B / 2, B * 1.5, B / 2);
    }

    // Ближній шар: папороть і каміння біля землі
    const near = makeCanvas(cols * B, B * 3);
    const nx = near.getContext("2d");
    for (let c = 0; c < cols; c++) {
        const h = 1 + Math.floor(rng() * 2);
        nx.fillStyle = c % 3 === 0 ? "#2f8a3a" : "#277a32";
        nx.fillRect(c * B, near.height - h * B * 0.7, B, h * B * 0.7);
        if (rng() < 0.25) {
            nx.fillStyle = "#5a6070";
            nx.fillRect(c * B + B / 4, near.height - B * 0.6, B * 0.8, B * 0.6);
        }
        if (rng() < 0.3) {
            nx.fillStyle = "#4fb55a";
            nx.fillRect(c * B + B / 3, near.height - h * B * 0.7 - B / 2, B / 4, B / 2);
        }
    }
    return { W: W, H: H, sky: sky, volcano: volcano, far: far, mid: mid, near: near };
}

// Довгошия зауропода крокує в глибині сцени
function drawSauropod(ctx, x, baseY, B, time) {
    const step = Math.sin(time * 3);
    ctx.fillStyle = "#3d5a48";
    // Тулуб і хвіст
    ctx.fillRect(x, baseY - B * 4, B * 6, B * 2.5);
    ctx.fillRect(x - B * 3, baseY - B * 3.4, B * 3, B);
    ctx.fillRect(x - B * 5, baseY - B * 3, B * 2, B * 0.6);
    // Шия і голова
    const nod = Math.sin(time * 1.2) * B * 0.3;
    ctx.fillRect(x + B * 5, baseY - B * 6, B, B * 2.5);
    ctx.fillRect(x + B * 5.5, baseY - B * 8, B, B * 2.5);
    ctx.fillRect(x + B * 6, baseY - B * 9.5 + nod, B * 1.8, B);
    ctx.fillStyle = "#1a2a20";
    ctx.fillRect(x + B * 7.2, baseY - B * 9.3 + nod, B * 0.25, B * 0.25);
    // Ноги, що крокують
    ctx.fillStyle = "#2f4a3a";
    const a = step * B * 0.4;
    ctx.fillRect(x + B * 0.5 + a, baseY - B * 1.5, B, B * 1.5);
    ctx.fillRect(x + B * 4.2 - a, baseY - B * 1.5, B, B * 1.5);
    ctx.fillStyle = "#3d5a48";
    ctx.fillRect(x + B * 1.5 - a, baseY - B * 1.5, B, B * 1.5);
    ctx.fillRect(x + B * 5.2 + a, baseY - B * 1.5, B, B * 1.5);
}

// Птеродактиль з двокадровим помахом крил
function drawPterodactyl(ctx, x, y, B, time, phase) {
    const up = Math.sin(time * 6 + phase) > 0;
    const u = B * 0.5;
    ctx.fillStyle = "#5a2a3a";
    // Тулуб, голова з гребенем і дзьобом
    ctx.fillRect(x, y, u * 3, u);
    ctx.fillRect(x - u, y - u * 0.5, u * 1.5, u);
    ctx.fillRect(x - u * 2.5, y, u * 1.8, u * 0.5);
    ctx.fillRect(x + u * 0.2, y - u * 1.2, u * 1.4, u * 0.6);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(x - u * 0.6, y - u * 0.3, u * 0.35, u * 0.35);
    // Крила: «V» догори або «Λ» донизу
    ctx.fillStyle = "#7a3a4a";
    const dir = up ? -1 : 1;
    for (let k = 1; k <= 4; k++) {
        ctx.fillRect(x + u * 1.5 - k * u * 1.1, y + dir * k * u * 0.7, u * 1.2, u * 0.7);
        ctx.fillRect(x + u * 1.5 + (k - 1) * u * 1.1, y + dir * k * u * 0.7, u * 1.2, u * 0.7);
    }
}

BackgroundRenderer.renderDinoValley = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._dinoValley;
    if (!st || st.W !== W || st.H !== H) {
        st = buildDinoValley(W, H, groundY, B);
        this._dinoValley = st;
    }
    const gY = Math.round(groundY);
    const progress = _fx.progress || 0;
    ctx.drawImage(st.sky, 0, 0);

    // Вулкан: дим, а з прогресом — виверження з лавовими «бомбами»
    const vX = Math.round(W * 0.72 - st.volcano.width / 2);
    const vY = gY - st.volcano.height - B * 2;
    const craterX = vX + st.volcano.width / 2;
    for (let i = 0; i < 7; i++) {
        const k = ((time * 0.12 + i / 7) % 1);
        ctx.globalAlpha = (1 - k) * 0.5;
        drawPixelDisc(ctx, craterX + Math.sin(i * 2.1 + time * 0.4) * B * 1.5 + k * B * 5, vY - B - k * gY * 0.35, B * (1.2 + k * 2.5), B / 2, "#5a4a5e");
    }
    ctx.globalAlpha = 1;
    const erupt = Math.max(0, (progress - 0.3) / 0.7);
    if (erupt > 0) {
        const glow = 0.3 + 0.3 * Math.sin(time * 6);
        ctx.fillStyle = "rgba(255, 110, 40, " + (erupt * glow).toFixed(3) + ")";
        ctx.fillRect(craterX - B * 4, vY - B * 3, B * 8, B * 4);
        const bombs = Math.round(3 + erupt * 7);
        for (let i = 0; i < bombs; i++) {
            const k = (time * 0.7 + i * 0.37) % 1;
            const dir = ((i * 53) % 11) / 5.5 - 1;
            const bx = craterX + dir * k * B * 10;
            const by = vY - Math.sin(k * Math.PI) * B * (6 + (i % 3) * 3);
            ctx.fillStyle = k < 0.5 ? "#ffcc33" : "#ff6a2a";
            ctx.fillRect(Math.round(bx), Math.round(by), Math.round(B * 0.5), Math.round(B * 0.5));
        }
    }
    ctx.drawImage(st.volcano, vX, vY);
    ctx.fillStyle = "#ff8a3a";
    ctx.fillRect(craterX - B, vY, B * 2, B * 0.5);
    // Під час виверження лава стікає схилами
    if (erupt > 0) {
        ctx.fillStyle = "#ff6a2a";
        const flow = Math.min(1, erupt * 1.6);
        for (let k = 0; k < Math.round(flow * 7); k++) {
            ctx.fillRect(Math.round(craterX - B * 1.5 - k * B * 0.8), vY + k * B, Math.round(B * 0.5), B);
            ctx.fillRect(Math.round(craterX + B + k * B * 0.8), vY + k * B, Math.round(B * 0.5), B);
        }
    }

    drawScrollingStrip(ctx, st.far, W, gY - B * 2, time, speed, 0.08);

    // Зауропода повільно йде в глибині (з'являється знову з іншого боку)
    const loop = W + B * 20;
    const sx = W + B * 8 - ((time * speed * 0.14 + time * B * 0.6) % loop);
    drawSauropod(ctx, Math.round(sx), gY - B * 3, B, time);

    drawScrollingStrip(ctx, st.mid, W, gY, time, speed, 0.25);

    // Зграйка птеродактилів
    for (let i = 0; i < 3; i++) {
        const lp = W + B * 12;
        const px = W + B * 4 - ((time * (B * 3 + i * B) + i * W * 0.4) % lp);
        const py = gY * (0.18 + i * 0.09) + Math.sin(time * 1.5 + i) * B * 0.8;
        drawPterodactyl(ctx, Math.round(px), Math.round(py), B, time, i * 1.7);
    }

    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.55);
};

// ---------- 11. Секретна база ----------
// Нічний аеродром у горах: ангари з напівпрочиненими воротами, радар обертається,
// на вишці блимає маяк, вогні злітної смуги біжать, пролітає гелікоптер із прожектором.

function buildSecretBase(W, H, groundY, B) {
    const rng = pixelRng(1111);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#050912"], [0.7, "#0e1a2a"], [1, "#1a2a3a"]]);
    const skx = sky.getContext("2d");
    drawStarsInto(skx, W, gY * 0.55, 80, rng, B);

    // Гори на обрії
    const cols = Math.ceil(W * 1.4 / B);
    const mH = periodicHeights(cols, 6, [{ amp: 3, k: 2, ph: 0.5 }, { amp: 1.5, k: 5, ph: 1.7 }]);
    const mountains = makeCanvas(cols * B, (Math.max.apply(null, mH) + 1) * B);
    const mx = mountains.getContext("2d");
    for (let c = 0; c < cols; c++) {
        mx.fillStyle = c % 2 === 0 ? "#141f2e" : "#172334";
        mx.fillRect(c * B, mountains.height - mH[c] * B, B, mH[c] * B);
        if (mH[c] > 7) {
            mx.fillStyle = "#3a4a5e";
            mx.fillRect(c * B, mountains.height - mH[c] * B, B, B / 2);
        }
    }

    // Ангари, вишка, радари — середній шар
    const stripW = Math.ceil(W * 1.6 / B) * B;
    const baseH = Math.round(B * 9);
    const base = makeCanvas(stripW, baseH);
    const bx = base.getContext("2d");
    const hangars = [];
    const radars = [];
    const beacons = [];
    let x = B;
    let n = 0;
    while (x < stripW - B * 10) {
        const kind = n % 3;
        if (kind !== 2) {
            // Ангар з арковим дахом
            const w = B * 8;
            const h = B * 5;
            const top = baseH - h;
            bx.fillStyle = "#2a3646";
            bx.fillRect(x, top + B, w, h - B);
            for (let k = 0; k < 8; k++) {
                const lift = Math.round(Math.sin((k + 0.5) / 8 * Math.PI) * B * 1.4);
                bx.fillStyle = k % 2 === 0 ? "#34445a" : "#303f54";
                bx.fillRect(x + k * B, top + B - lift, B, lift + 2);
            }
            bx.fillStyle = "#1a2230";
            bx.fillRect(x + B, top + B * 1.6, w - B * 2, h - B * 1.6);
            // Номер ангара
            bx.fillStyle = "#ffcc33";
            bx.fillRect(x + B * 0.3, top + B * 1.3, B * 0.6, B * 0.3);
            hangars.push({ x: x + B, y: top + B * 1.6, w: w - B * 2, h: h - B * 1.6 });
            x += w + B * 2;
        } else {
            // Диспетчерська вишка й радар поруч
            const tw = B * 2;
            const th = B * 8;
            bx.fillStyle = "#2a3646";
            bx.fillRect(x + B * 0.5, baseH - th, B, th);
            bx.fillStyle = "#34445a";
            bx.fillRect(x, baseH - th - B * 0.2, tw, B * 1.4);
            bx.fillStyle = "#7df9ff";
            bx.fillRect(x + B * 0.2, baseH - th + B * 0.2, tw - B * 0.4, B * 0.5);
            beacons.push({ x: x + B, y: baseH - th - B * 0.6 });
            bx.fillStyle = "#2a3646";
            bx.fillRect(x + B * 4, baseH - B * 3, B * 0.5, B * 3);
            radars.push({ x: x + B * 4.25, y: baseH - B * 3.4 });
            // Цистерни з пальним
            bx.fillStyle = "#3a4a3a";
            bx.fillRect(x + B * 6, baseH - B * 2, B * 2.5, B * 2);
            bx.fillStyle = "#4a5a4a";
            bx.fillRect(x + B * 6, baseH - B * 2, B * 2.5, B * 0.4);
            x += B * 10;
        }
        n++;
    }
    // Паркан
    bx.fillStyle = "#2a3646";
    bx.fillRect(0, baseH - B * 0.9, stripW, 2);
    for (let fx = 0; fx < stripW; fx += B * 0.6) {
        bx.fillRect(fx, baseH - B * 1.1, 1, B * 1.1);
    }
    return { W: W, H: H, sky: sky, mountains: mountains, base: base, hangars: hangars, radars: radars, beacons: beacons };
}

BackgroundRenderer.renderSecretBase = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._secretBase;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSecretBase(W, H, groundY, B);
        this._secretBase = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.mountains, W, gY - B * 4, time, speed, 0.05);

    // Гелікоптер з прожектором пролітає над базою
    const hk = (time * 0.07) % 1;
    const hx = W * 1.15 - hk * W * 1.4;
    const hy = gY * 0.28 + Math.sin(time * 1.3) * B * 0.5;
    const sweep = Math.sin(time * 1.1) * 0.35;
    drawBeam(ctx, hx, hy + B * 0.6, Math.PI / 2 + sweep, gY * 0.8, 0.1, "rgba(230, 240, 255, 0.1)");
    ctx.fillStyle = "#26303e";
    ctx.fillRect(Math.round(hx), Math.round(hy), B * 2.2, B);
    ctx.fillRect(Math.round(hx + B * 2.2), Math.round(hy + B * 0.3), B * 2.2, B * 0.3);
    ctx.fillRect(Math.round(hx + B * 4.2), Math.round(hy - B * 0.1), B * 0.3, B * 0.7);
    ctx.fillStyle = "#7df9ff";
    ctx.fillRect(Math.round(hx + B * 0.2), Math.round(hy + B * 0.2), B * 0.7, B * 0.4);
    const rotor = Math.abs(Math.sin(time * 40)) * B * 2.2;
    ctx.fillStyle = "#5a6a7e";
    ctx.fillRect(Math.round(hx + B * 1.1 - rotor), Math.round(hy - B * 0.3), Math.round(rotor * 2), 2);
    ctx.fillStyle = Math.sin(time * 6) > 0 ? "#ff3355" : "#39ff88";
    ctx.fillRect(Math.round(hx + B * 4.3), Math.round(hy - B * 0.2), 3, 3);

    // База: ангари з теплим світлом, радари обертаються, маяки блимають
    const bW = st.base.width;
    const off = Math.round(time * speed * 0.3) % bW;
    const top = gY - st.base.height;
    for (let x = -off; x < W; x += bW) {
        ctx.drawImage(st.base, x, top);
        for (let i = 0; i < st.hangars.length; i++) {
            const hg = st.hangars[i];
            const hxp = x + hg.x;
            if (hxp > W || hxp + hg.w < 0) {
                continue;
            }
            // Ворота прочинені: смуга світла та силует літака всередині
            const gap = hg.w * (0.25 + 0.1 * Math.sin(time * 0.3 + i));
            ctx.fillStyle = "rgba(255, 210, 130, 0.55)";
            ctx.fillRect(Math.round(hxp + (hg.w - gap) / 2), top + hg.y, Math.round(gap), hg.h);
            ctx.fillStyle = "#2a3040";
            ctx.fillRect(Math.round(hxp + hg.w / 2 - B * 0.9), Math.round(top + hg.y + hg.h - B * 1.2), Math.round(B * 1.8), Math.round(B * 0.5));
            ctx.fillRect(Math.round(hxp + hg.w / 2 - B * 0.2), Math.round(top + hg.y + hg.h - B * 1.9), Math.round(B * 0.4), Math.round(B * 1.2));
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(Math.round(hxp - B * 0.6), top + hg.y + hg.h, hg.w + B * 1.2, 2);
        }
        for (let i = 0; i < st.radars.length; i++) {
            const r = st.radars[i];
            const rx = x + r.x;
            if (rx < -B * 3 || rx > W + B * 3) {
                continue;
            }
            const face = Math.cos(time * 1.6 + i);
            const w = Math.max(2, Math.abs(face) * B * 2.4);
            ctx.fillStyle = face > 0 ? "#c8d2da" : "#8a96a4";
            ctx.fillRect(Math.round(rx - w / 2), Math.round(top + r.y - B * 1.1), Math.round(w), Math.round(B * 1.1));
            ctx.fillStyle = "#e8eef2";
            ctx.fillRect(Math.round(rx - 1 + face * B * 0.6), Math.round(top + r.y - B * 1.6), 3, Math.round(B * 0.6));
        }
        for (let i = 0; i < st.beacons.length; i++) {
            const bc = st.beacons[i];
            const bxp = x + bc.x;
            if (bxp < -B * 3 || bxp > W + B * 3) {
                continue;
            }
            if ((time + i * 0.4) % 1.2 < 0.25) {
                ctx.fillStyle = "rgba(255, 60, 60, 0.3)";
                ctx.fillRect(Math.round(bxp - B), Math.round(top + bc.y - B), B * 2, B * 2);
                ctx.fillStyle = "#ff3344";
                ctx.fillRect(Math.round(bxp - B * 0.25), Math.round(top + bc.y - B * 0.25), Math.round(B * 0.5), Math.round(B * 0.5));
            }
        }
    }

    // Вогні злітної смуги біжать уздовж землі
    const gap = B * 1.5;
    const loff = Math.round(time * speed * 0.6) % gap;
    const chase = Math.floor(time * 10);
    for (let x = -loff, k = 0; x < W + gap; x += gap, k++) {
        const idx = Math.floor((time * speed * 0.6) / gap) + k;
        ctx.fillStyle = (idx - chase) % 8 === 0 ? "#ffffff" : "#39c6ff";
        ctx.fillRect(Math.round(x), gY - 4, 4, 3);
    }
};

// ---------- 12. Луна-парк уночі ----------
// Колесо огляду обертається над парком, вагончики американських гірок
// пролітають мертву петлю, у небі розквітають феєрверки.

// Траса гірок: пагорби й одна мертва петля. Точки однієї смуги, що безшовно повторюється
function buildCoasterPath(stripW, baseY, B) {
    const pts = [];
    const loopX = stripW * 0.62;
    const loopR = B * 3.2;
    const hill = function (x) {
        return baseY - B * 2 - (Math.sin(Math.PI * 2 * x * 2 / stripW) * 0.5 + 0.5) * B * 5;
    };
    const step = Math.max(2, B / 3);
    for (let x = 0; x < loopX; x += step) {
        pts.push({ x: x, y: hill(x) });
    }
    // Мертва петля: коло, що починається внизу
    const cy = hill(loopX) - loopR;
    const n = 40;
    for (let i = 0; i <= n; i++) {
        const a = Math.PI / 2 - (i / n) * Math.PI * 2;
        pts.push({ x: loopX + Math.cos(a) * loopR + (i / n) * B * 1.2, y: cy + Math.sin(a) * loopR });
    }
    for (let x = loopX + B * 1.2; x <= stripW; x += step) {
        pts.push({ x: x, y: hill(x) });
    }
    return { pts: pts, loopX: loopX, loopR: loopR, loopCY: cy };
}

function buildLunaPark(W, H, groundY, B) {
    const rng = pixelRng(1212);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#070624"], [0.6, "#241450"], [1, "#4a2070"]]);
    const skx = sky.getContext("2d");
    drawStarsInto(skx, W, gY * 0.6, 70, rng, B);

    // Далеке місто
    const cols = Math.ceil(W * 1.4 / B);
    const city = makeCanvas(cols * B, B * 8);
    const cx = city.getContext("2d");
    for (let c = 0; c < cols; c += 2) {
        const h = 3 + Math.floor(rng() * 5);
        cx.fillStyle = "#1a1238";
        cx.fillRect(c * B, city.height - h * B, B * 2, h * B);
        cx.fillStyle = "rgba(255, 220, 120, 0.5)";
        for (let w = 1; w < h; w++) {
            if (rng() < 0.35) {
                cx.fillRect(c * B + B / 3, city.height - w * B, B / 3, B / 3);
            }
        }
    }

    // Гірки: опори й рейки в окремій смузі
    const stripW = Math.ceil(W * 1.6 / B) * B;
    const coasterH = Math.round(gY * 0.62);
    const path = buildCoasterPath(stripW, coasterH, B);
    const coaster = makeCanvas(stripW, coasterH);
    const kx = coaster.getContext("2d");
    kx.fillStyle = "#3a2a5a";
    for (let i = 0; i < path.pts.length; i += 6) {
        const p = path.pts[i];
        if (Math.abs(p.x - path.loopX) < path.loopR * 1.3) {
            continue;
        }
        kx.fillRect(Math.round(p.x), Math.round(p.y), Math.max(2, B / 5), coasterH - p.y);
    }
    kx.fillRect(Math.round(path.loopX - B / 8), Math.round(path.loopCY + path.loopR), Math.max(2, B / 4), coasterH - path.loopCY - path.loopR);
    kx.strokeStyle = "#ff5ad8";
    kx.lineWidth = Math.max(2, B / 4);
    kx.beginPath();
    kx.moveTo(path.pts[0].x, path.pts[0].y);
    for (const p of path.pts) {
        kx.lineTo(p.x, p.y);
    }
    kx.stroke();
    kx.strokeStyle = "rgba(255, 180, 240, 0.6)";
    kx.lineWidth = 1;
    kx.stroke();

    // Ближній шар: шатра з смугастими дахами й гірляндами
    const tents = makeCanvas(stripW, B * 6);
    const tx = tents.getContext("2d");
    const bulbs = [];
    const stripes = [["#ff3355", "#ffffff"], ["#2a8aff", "#ffe14d"], ["#39c65a", "#ffffff"], ["#b35cff", "#ffcc33"]];
    let i = 0;
    for (let x = B; x < stripW - B * 6; x += B * 9) {
        const pal = stripes[i % stripes.length];
        const w = B * 6;
        const bodyTop = B * 3;
        tx.fillStyle = "#2a1a3a";
        tx.fillRect(x, bodyTop, w, tents.height - bodyTop);
        tx.fillStyle = "#ffcc66";
        tx.fillRect(x + w / 2 - B, bodyTop + B, B * 2, tents.height - bodyTop - B);
        for (let s = 0; s < 6; s++) {
            tx.fillStyle = pal[s % 2];
            tx.beginPath();
            tx.moveTo(x + w / 2, B * 0.6);
            tx.lineTo(x + s * B, bodyTop);
            tx.lineTo(x + (s + 1) * B, bodyTop);
            tx.closePath();
            tx.fill();
        }
        tx.fillStyle = pal[0];
        tx.fillRect(x + w / 2 - B / 8, 0, B / 4, B * 0.7);
        for (let s = 0; s <= 6; s++) {
            bulbs.push({ x: x + s * B, y: bodyTop, k: s + i });
        }
        i++;
    }
    return { W: W, H: H, sky: sky, city: city, coaster: coaster, path: path, tents: tents, bulbs: bulbs };
}

// Колесо огляду з кабінками, що завжди висять униз
function drawFerrisWheel(ctx, x, y, R, B, time) {
    const rot = time * 0.25;
    ctx.fillStyle = "#3a2a5a";
    ctx.beginPath();
    ctx.moveTo(x - B / 2, y);
    ctx.lineTo(x - R * 0.7, y + R * 1.25);
    ctx.lineTo(x - R * 0.6, y + R * 1.25);
    ctx.lineTo(x, y + B);
    ctx.lineTo(x + R * 0.6, y + R * 1.25);
    ctx.lineTo(x + R * 0.7, y + R * 1.25);
    ctx.lineTo(x + B / 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 220, 120, 0.55)";
    ctx.lineWidth = Math.max(1, B / 8);
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    const spokes = 12;
    for (let i = 0; i < spokes; i++) {
        const a = rot + i * Math.PI * 2 / spokes;
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R);
    }
    ctx.stroke();
    const colors = ["#ff3355", "#ffe14d", "#39c6ff", "#39ff88", "#ff5ad8", "#ff9a3d"];
    for (let i = 0; i < spokes; i++) {
        const a = rot + i * Math.PI * 2 / spokes;
        const gx = Math.round(x + Math.cos(a) * R);
        const gy = Math.round(y + Math.sin(a) * R);
        // Лампочки біжать по ободу
        ctx.fillStyle = (Math.floor(time * 6) + i) % 3 === 0 ? "#ffffff" : "#ffcc55";
        ctx.fillRect(gx - 2, gy - 2, 4, 4);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(gx - B * 0.45, gy + 2, B * 0.9, B * 0.7);
    }
    ctx.fillStyle = "#ffcc55";
    ctx.fillRect(x - B * 0.3, y - B * 0.3, B * 0.6, B * 0.6);
}

// Феєрверк: спалах із променів, що розлітаються й гаснуть. Усе обчислюється з часу
function drawFireworks(ctx, W, gY, B, time, extra) {
    const colors = ["#ff3355", "#ffe14d", "#39c6ff", "#39ff88", "#ff5ad8"];
    const count = 3 + (extra ? 2 : 0);
    for (let i = 0; i < count; i++) {
        const period = 2.2 + i * 0.45;
        const cycle = Math.floor((time + i * 0.9) / period);
        const t = ((time + i * 0.9) % period) / period;
        const rng = pixelRng(cycle * 31 + i * 7);
        const fx = W * (0.15 + rng() * 0.7);
        const fy = gY * (0.12 + rng() * 0.25);
        const color = colors[Math.floor(rng() * colors.length)];
        if (t < 0.25) {
            // Ракета злітає
            const k = t / 0.25;
            ctx.fillStyle = "#fff4c0";
            ctx.fillRect(Math.round(fx), Math.round(gY - (gY - fy) * k), 3, Math.max(3, B / 2));
            continue;
        }
        const k = (t - 0.25) / 0.75;
        const r = B * (1 + k * 4);
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = color;
        for (let a = 0; a < 14; a++) {
            const ang = a * Math.PI * 2 / 14;
            const px = fx + Math.cos(ang) * r;
            const py = fy + Math.sin(ang) * r + k * k * B * 2;
            ctx.fillRect(Math.round(px), Math.round(py), Math.max(2, B / 4), Math.max(2, B / 4));
        }
        ctx.globalAlpha = 1;
    }
}

BackgroundRenderer.renderLunaPark = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._lunaPark;
    if (!st || st.W !== W || st.H !== H) {
        st = buildLunaPark(W, H, groundY, B);
        this._lunaPark = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawFireworks(ctx, W, gY, B, time, _fx.combo >= 3);
    drawScrollingStrip(ctx, st.city, W, gY, time, speed, 0.05);

    // Колесо огляду повільно пропливає й повертається з іншого боку
    const R = Math.round(gY * 0.3);
    const wheelLoop = W + R * 4;
    const wx = W + R * 1.5 - ((time * speed * 0.1) % wheelLoop);
    drawFerrisWheel(ctx, Math.round(wx), Math.round(gY - R * 1.25), R, B, time);

    // Гірки та вагончики
    const stripW = st.coaster.width;
    const offset = Math.round(time * speed * 0.2) % stripW;
    const top = gY - st.coaster.height;
    const pts = st.path.pts;
    const carT = (time * 0.18) % 1;
    for (let x = -offset; x < W; x += stripW) {
        ctx.drawImage(st.coaster, x, top);
        for (let c = 0; c < 3; c++) {
            const idx = Math.floor(((carT * pts.length) - c * 3 + pts.length) % pts.length);
            const p = pts[idx];
            const q = pts[Math.min(pts.length - 1, idx + 1)];
            const ang = Math.atan2(q.y - p.y, q.x - p.x);
            ctx.save();
            ctx.translate(Math.round(x + p.x), Math.round(top + p.y));
            ctx.rotate(ang);
            ctx.fillStyle = c === 0 ? "#ffe14d" : "#39c6ff";
            ctx.fillRect(-B * 0.5, -B * 0.8, B, B * 0.7);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-B * 0.2, -B * 1.1, B * 0.3, B * 0.3);
            ctx.restore();
        }
    }

    // Шатра з гірляндами, що біжать вогниками
    const tentsW = st.tents.width;
    const toff = Math.round(time * speed * 0.45) % tentsW;
    const ttop = gY - st.tents.height;
    const chase = Math.floor(time * 8);
    for (let x = -toff; x < W; x += tentsW) {
        ctx.drawImage(st.tents, x, ttop);
        for (const b of st.bulbs) {
            const bx = x + b.x;
            if (bx < -4 || bx > W + 4) {
                continue;
            }
            ctx.fillStyle = (b.k + chase) % 3 === 0 ? "#ffffff" : "#ffb347";
            ctx.fillRect(Math.round(bx) - 2, ttop + b.y - 2, 4, 4);
        }
    }
};

// ---------- 13. Підводна фабрика ----------
// Цех підводної бази: за ілюмінаторами пропливають риби, фабрикатори
// лазерами «друкують» спорядження шар за шаром, готові речі їдуть конвеєром.

// Спорядження, яке друкують фабрикатори: піксельні спрайти 8×8 (символ → колір)
const FAB_ITEMS = [
    { name: "балон", rows: ["..3333..", "..3113..", ".222222.", ".211112.", ".211112.", ".211112.", ".211112.", ".222222."], colors: { 1: "#ffcc33", 2: "#c89a20", 3: "#8a90a0" } },
    { name: "ніж", rows: [".......1", "......11", ".....11.", "....11..", "...11...", "..33....", ".333....", "33......"], colors: { 1: "#dfe6ee", 3: "#ff9a3d" } },
    { name: "батарея", rows: ["...33...", ".111111.", ".122221.", ".122221.", ".111111.", ".122221.", ".122221.", ".111111."], colors: { 1: "#e8eef2", 2: "#39c6ff", 3: "#8a90a0" } },
    { name: "ліхтарик", rows: ["........", "11......", "1311111.", "13222221", "13222221", "1311111.", "11......", "........"], colors: { 1: "#e8eef2", 2: "#ff9a3d", 3: "#fff4a0" } },
    { name: "планшет", rows: ["11111111", "12222221", "12333321", "12222221", "12333321", "12222221", "11111111", "........"], colors: { 1: "#e8eef2", 2: "#1a3a5a", 3: "#39ffd0" } },
    { name: "буксир", rows: ["........", "...1111.", ".1122221", "11122223", "11122223", ".1122221", "...1111.", "........"], colors: { 1: "#ffcc33", 2: "#e8eef2", 3: "#39c6ff" } }
];

function buildFabItemSprite(item, px) {
    const c = makeCanvas(px * 8, px * 8);
    const cx = c.getContext("2d");
    for (let r = 0; r < 8; r++) {
        for (let k = 0; k < 8; k++) {
            const ch = item.rows[r][k];
            if (ch !== ".") {
                cx.fillStyle = item.colors[ch];
                cx.fillRect(k * px, r * px, px, px);
            }
        }
    }
    return c;
}

function buildSeaFabricator(W, H, groundY, B) {
    const rng = pixelRng(1313);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0b1a24"], [1, "#12303c"]]);
    const skx = sky.getContext("2d");
    // Труби під стелею зі світними смугами
    skx.fillStyle = "#1e3a48";
    skx.fillRect(0, B * 0.6, W, B * 0.9);
    skx.fillStyle = "#2a5060";
    skx.fillRect(0, B * 0.6, W, B * 0.2);
    skx.fillStyle = "#16303c";
    skx.fillRect(0, B * 1.8, W, B * 0.5);

    // Стіна з панелями та круглими ілюмінаторами (прокручується повільно)
    const stripW = Math.ceil(W * 1.4 / (B * 10)) * B * 10;
    const wallH = Math.round(gY * 0.72);
    const wall = makeCanvas(stripW, wallH);
    const wx = wall.getContext("2d");
    wx.fillStyle = "#183644";
    wx.fillRect(0, 0, stripW, wallH);
    for (let x = 0; x < stripW; x += B * 5) {
        wx.fillStyle = "#1f4352";
        wx.fillRect(x + 2, B, B * 5 - 4, wallH - B * 2);
        wx.fillStyle = "#12303c";
        wx.fillRect(x, 0, 2, wallH);
        for (let y = B * 2; y < wallH - B; y += B * 3) {
            wx.fillStyle = "#2a5566";
            wx.fillRect(x + B * 0.4, y, B * 0.25, B * 0.25);
            wx.fillRect(x + B * 4.35, y, B * 0.25, B * 0.25);
        }
    }
    const portholes = [];
    const pr = Math.round(B * 2.4);
    for (let x = B * 5; x < stripW; x += B * 10) {
        const py = Math.round(wallH * 0.38);
        // Рамка
        wx.fillStyle = "#e8eef2";
        wx.beginPath();
        wx.arc(x, py, pr + B * 0.5, 0, Math.PI * 2);
        wx.fill();
        wx.fillStyle = "#ff9a3d";
        for (let k = 0; k < 8; k++) {
            const a = k * Math.PI / 4;
            wx.fillRect(Math.round(x + Math.cos(a) * (pr + B * 0.25) - 2), Math.round(py + Math.sin(a) * (pr + B * 0.25) - 2), 4, 4);
        }
        // Вода за склом
        const g = wx.createLinearGradient(0, py - pr, 0, py + pr);
        g.addColorStop(0, "#1a7ab0");
        g.addColorStop(1, "#083a5a");
        wx.fillStyle = g;
        wx.beginPath();
        wx.arc(x, py, pr, 0, Math.PI * 2);
        wx.fill();
        // Промені світла у воді
        wx.save();
        wx.clip();
        wx.fillStyle = "rgba(160, 230, 255, 0.18)";
        for (let k = 0; k < 3; k++) {
            wx.fillRect(x - pr + k * pr * 0.7, py - pr, B * 0.4, pr * 2);
        }
        wx.fillStyle = "#0a4a3a";
        wx.fillRect(x - pr, py + pr * 0.6, pr * 2, pr);
        wx.fillStyle = "#39c67a";
        for (let k = 0; k < 5; k++) {
            wx.fillRect(Math.round(x - pr + rng() * pr * 2), Math.round(py + pr * 0.3 + rng() * pr * 0.3), B * 0.25, pr);
        }
        wx.restore();
        // Відблиск на склі
        wx.fillStyle = "rgba(255, 255, 255, 0.25)";
        wx.fillRect(Math.round(x - pr * 0.55), Math.round(py - pr * 0.6), B * 0.5, B * 1.4);
        portholes.push({ x: x, y: py, r: pr });
    }

    // Фабрикатори й конвеєр — ближній шар
    const px = Math.max(2, Math.round(B / 4));
    const items = FAB_ITEMS.map(function (it) { return buildFabItemSprite(it, px); });
    const nearW = stripW;
    const nearH = Math.round(B * 7);
    const near = makeCanvas(nearW, nearH);
    const nx = near.getContext("2d");
    const fabs = [];
    for (let x = B * 2; x < nearW - B * 6; x += B * 10) {
        const fw = B * 5;
        const fh = B * 5.5;
        const top = nearH - fh - B * 1.2;
        nx.fillStyle = "#e8eef2";
        nx.fillRect(x, top, fw, fh);
        nx.fillStyle = "#c8d2da";
        nx.fillRect(x, top + fh - B * 0.8, fw, B * 0.8);
        nx.fillStyle = "#ff9a3d";
        nx.fillRect(x, top + B * 0.4, fw, B * 0.3);
        // Віконце камери друку
        nx.fillStyle = "#07161e";
        nx.fillRect(x + B * 0.7, top + B * 1.1, fw - B * 1.4, B * 3.2);
        nx.fillStyle = "#39c6ff";
        nx.fillRect(x + B * 0.7, top + B * 4.3, fw - B * 1.4, B * 0.15);
        fabs.push({ x: x + B * 0.7, y: top + B * 1.1, w: fw - B * 1.4, h: B * 3.2 });
    }
    // Стрічка конвеєра
    nx.fillStyle = "#2a3a44";
    nx.fillRect(0, nearH - B * 1.2, nearW, B * 1.2);
    nx.fillStyle = "#3a4e5a";
    nx.fillRect(0, nearH - B * 1.2, nearW, B * 0.25);
    return { W: W, H: H, sky: sky, wall: wall, portholes: portholes, near: near, fabs: fabs, items: items, px: px };
}

BackgroundRenderer.renderSeaFabricator = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._seaFabricator;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSeaFabricator(W, H, groundY, B);
        this._seaFabricator = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);

    // Стіна з ілюмінаторами: за склом пропливають риби
    const wallW = st.wall.width;
    const wOff = Math.round(time * speed * 0.15) % wallW;
    const wTop = gY - st.wall.height;
    for (let x = -wOff; x < W; x += wallW) {
        ctx.drawImage(st.wall, x, wTop);
        for (let i = 0; i < st.portholes.length; i++) {
            const ph = st.portholes[i];
            const cx = x + ph.x;
            if (cx < -ph.r || cx > W + ph.r) {
                continue;
            }
            const cy = wTop + ph.y;
            for (let f = 0; f < 3; f++) {
                const k = ((time * (0.12 + f * 0.05) + i * 0.3 + f * 0.37) % 1);
                const fx = cx - ph.r - B + k * (ph.r * 2 + B * 2);
                const fy = cy + (f - 1) * ph.r * 0.45 + Math.sin(time * 2 + f) * B * 0.2;
                const dx = fx - cx;
                const dy = fy - cy;
                if (dx * dx + dy * dy > (ph.r - B * 0.6) * (ph.r - B * 0.6)) {
                    continue;
                }
                ctx.fillStyle = f === 1 ? "#ff9a3d" : "#ffe14d";
                ctx.fillRect(Math.round(fx), Math.round(fy), Math.round(B * 0.7), Math.round(B * 0.35));
                ctx.fillRect(Math.round(fx - B * 0.3), Math.round(fy - B * 0.1), Math.round(B * 0.3), Math.round(B * 0.55));
            }
            // Бульбашки
            const bk = (time * 0.6 + i * 0.4) % 1;
            ctx.fillStyle = "rgba(220, 245, 255, 0.7)";
            ctx.fillRect(Math.round(cx + ph.r * 0.3), Math.round(cy + ph.r * 0.6 - bk * ph.r * 1.4), 3, 3);
        }
    }

    // Фабрикатори друкують речі: сопло ходить над камерою, лазер «наростає» річ знизу вгору
    const nearW = st.near.width;
    const nOff = Math.round(time * speed * 0.4) % nearW;
    const nTop = gY - st.near.height;
    const itemSize = st.px * 8;
    for (let x = -nOff; x < W; x += nearW) {
        ctx.drawImage(st.near, x, nTop);
        for (let i = 0; i < st.fabs.length; i++) {
            const f = st.fabs[i];
            const fx = x + f.x;
            if (fx < -f.w || fx > W) {
                continue;
            }
            const cycle = 4;
            const k = ((time + i * 1.3) % cycle) / cycle;
            const itemIdx = (Math.floor((time + i * 1.3) / cycle) + i) % st.items.length;
            const sprite = st.items[itemIdx];
            const ix = Math.round(fx + (f.w - itemSize) / 2);
            const iy = Math.round(nTop + f.y + f.h - itemSize - B * 0.2);
            const printed = Math.min(1, k / 0.7);
            const shown = Math.round(itemSize * printed);
            if (shown > 0) {
                ctx.drawImage(sprite, 0, itemSize - shown, itemSize, shown, ix, iy + itemSize - shown, itemSize, shown);
            }
            if (k < 0.7) {
                // Сопло та промені
                const noz = fx + f.w * 0.5 + Math.sin(time * 9 + i) * f.w * 0.35;
                const lineY = iy + itemSize - shown;
                ctx.fillStyle = "#c8d2da";
                ctx.fillRect(Math.round(noz - B * 0.3), Math.round(nTop + f.y), Math.round(B * 0.6), Math.round(B * 0.4));
                ctx.strokeStyle = "rgba(90, 220, 255, 0.85)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(noz, nTop + f.y + B * 0.4);
                ctx.lineTo(ix + itemSize * (0.5 + Math.sin(time * 13 + i) * 0.5), lineY);
                ctx.stroke();
                ctx.fillStyle = "rgba(120, 230, 255, 0.9)";
                ctx.fillRect(ix - 2, Math.round(lineY) - 1, itemSize + 4, 2);
            } else {
                // Готово: річ світиться
                ctx.fillStyle = "rgba(90, 220, 255, " + (0.35 * (1 - (k - 0.7) / 0.3)).toFixed(3) + ")";
                ctx.fillRect(ix - 3, iy - 3, itemSize + 6, itemSize + 6);
            }
        }
    }

    // Конвеєр: готові речі їдуть до камери
    const beltY = gY - B * 1.2 - itemSize;
    const gap = B * 4;
    const bOff = (time * speed * 0.4 + time * B * 1.5) % gap;
    for (let x = -bOff, n = 0; x < W + gap; x += gap, n++) {
        const idx = (Math.floor((time * speed * 0.4 + time * B * 1.5) / gap) + n) % st.items.length;
        ctx.drawImage(st.items[(idx + st.items.length) % st.items.length], Math.round(x), Math.round(beltY));
    }
};

// ---------- 14. Планета двох сонць ----------

function buildTwinSunPlanet(W, H, groundY, B) {
    const rng = pixelRng(1414);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0a2a3a"], [0.5, "#1f6a6a"], [1, "#e08a4a"]]);
    const sx = sky.getContext("2d");
    function pixelDisc(cx, cy, r, color) {
        sx.fillStyle = color;
        for (let y = -r; y < r; y += B / 2) {
            const half = Math.sqrt(Math.max(0, r * r - y * y));
            sx.fillRect(Math.round(cx - half), cy + y, Math.round(half * 2), B / 2);
        }
    }
    pixelDisc(W * 0.28, Math.round(gY * 0.3), B * 3, "#ffdd66");
    pixelDisc(W * 0.7, Math.round(gY * 0.18), B * 2, "#ff7a5a");
    const cols = Math.ceil(W * 1.3 / B);
    const hs = periodicHeights(cols, 2, [{ amp: 1, k: 3, ph: 0.3 }, { amp: 0.6, k: 7, ph: 1 }]);
    const near = makeCanvas(cols * B, (Math.max.apply(null, hs) + 7) * B);
    const nx = near.getContext("2d");
    drawBlockTerrain(nx, hs, B, near.height, { top: "#6a3a8a", topLight: "#8a5aaa", body: "#3a1f4a", body2: "#331a42", speck: "#4a2a5a" }, rng);
    const bulbs = [];
    // Грибні дерева та рослини з кульками, що світяться
    for (let c = 2; c < cols - 3; c += 5 + Math.floor(rng() * 4)) {
        const top = near.height - hs[c] * B;
        if (rng() < 0.5) {
            const th = 3 + Math.floor(rng() * 3);
            nx.fillStyle = "#d8c8a8";
            nx.fillRect(c * B, top - th * B, B, th * B);
            nx.fillStyle = "#ff5a8a";
            nx.fillRect((c - 1) * B, top - th * B - B, B * 3, B);
            nx.fillRect(c * B - B * 1.5, top - th * B, B * 4, B / 2);
            nx.fillStyle = "#ffd0e0";
            nx.fillRect(c * B - B / 2, top - th * B - B * 0.7, B / 3, B / 3);
        } else {
            nx.fillStyle = "#2a8a6a";
            nx.fillRect(c * B + B / 3, top - B * 3, B / 3, B * 3);
            bulbs.push({ x: c * B + B / 2, y: top - B * 3.3, phase: rng() * 6 });
        }
    }
    return { W: W, H: H, sky: sky, near: near, bulbs: bulbs };
}

BackgroundRenderer.renderTwinSunPlanet = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._twinSun;
    if (!st || st.W !== W || st.H !== H) {
        st = buildTwinSunPlanet(W, H, groundY, B);
        this._twinSun = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const nearW = st.near.width;
    const offset = Math.round(time * speed * 0.3) % nearW;
    const top = gY - st.near.height;
    for (let x = -offset; x < W; x += nearW) {
        ctx.drawImage(st.near, x, top);
        for (const b of st.bulbs) {
            const bx = x + b.x;
            if (bx < -B * 2 || bx > W + B * 2) {
                continue;
            }
            const pulse = Math.sin(time * 2.5 + b.phase) * 0.5 + 0.5;
            ctx.fillStyle = "rgba(90, 255, 200, " + (0.15 + 0.2 * pulse).toFixed(3) + ")";
            ctx.fillRect(bx - B, top + b.y - B, B * 2, B * 2);
            ctx.fillStyle = "#9affd8";
            ctx.fillRect(bx - B * 0.4, top + b.y - B * 0.4, B * 0.8, B * 0.8);
        }
    }
    drawFallingPixels(ctx, W, gY, time, 30, 1414, {
        color: "#ffd0f0", dir: -1, speedMin: 6, speedMax: 18, sizeMin: 2, sizeMax: 3,
        sway: 0.9, swayAmp: B * 1.2, alpha: 0.6
    });
};

// ---------- 15. Місто над хмарами ----------

function buildSkyCity(W, H, groundY, B) {
    const rng = pixelRng(1515);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#1b3a7a"], [0.6, "#6a8fd8"], [1, "#ffc6a0"]]);
    function cloudStrip(stripW, color, light, height, seed) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, height);
        const cx = strip.getContext("2d");
        for (let x = 0; x < stripW; x += B) {
            const h = Math.round((0.4 + 0.3 * Math.sin(x / stripW * Math.PI * 8) + r() * 0.2) * height / B) * B;
            cx.fillStyle = color;
            cx.fillRect(x, height - h, B, h);
            cx.fillStyle = light;
            cx.fillRect(x, height - h, B, B / 3);
        }
        return strip;
    }
    const clouds = cloudStrip(Math.ceil(W * 1.5 / B) * B, "#e8eeff", "#ffffff", Math.round(gY * 0.3), 1501);
    // Летючі платформи з вежами
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const plat = makeCanvas(stripW, gY);
    const px = plat.getContext("2d");
    for (let x = B * 2; x < stripW - B * 8; x += B * (10 + Math.floor(rng() * 5))) {
        const y = Math.round(gY * (0.25 + rng() * 0.35) / B) * B;
        const w = 5 + Math.floor(rng() * 3);
        px.fillStyle = "#f4f0e0";
        px.fillRect(x, y, w * B, B);
        px.fillStyle = "#c8c0a8";
        px.fillRect(x + B, y + B, (w - 2) * B, B);
        px.fillStyle = "#ffffff";
        px.fillRect(x + B * 1.5, y - B * 4, B * 1.5, B * 4);
        px.fillRect(x + B * 3.5, y - B * 2.5, B * 1.5, B * 2.5);
        px.fillStyle = "#3a8adf";
        px.fillRect(x + B * 1.5, y - B * 5, B * 1.5, B);
        px.fillRect(x + B * 3.5, y - B * 3.5, B * 1.5, B);
        px.fillStyle = "#ffe14d";
        px.fillRect(x + B * 2, y - B * 3, B / 2, B / 2);
    }
    return { W: W, H: H, sky: sky, clouds: clouds, plat: plat };
}

BackgroundRenderer.renderSkyCity = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._skyCity;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSkyCity(W, H, groundY, B);
        this._skyCity = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const bob = Math.round(Math.sin(time * 0.8) * B * 0.3);
    drawScrollingStrip(ctx, st.plat, W, gY + bob, time, speed, 0.15);
    // Птахи: пари пікселів, що махають крилами
    for (let i = 0; i < 5; i++) {
        const span = W + B * 6;
        const x = Math.round(((i * 331 + time * (40 + i * 9)) % span) - B * 3);
        const y = Math.round(gY * (0.15 + i * 0.07) + Math.sin(time * 1.5 + i) * B * 0.5);
        const flap = Math.sin(time * 10 + i) > 0;
        ctx.fillStyle = "#1a2a4a";
        ctx.fillRect(x, y, B / 3, B / 3);
        ctx.fillRect(x - B / 3, y + (flap ? -B / 3 : B / 6), B / 3, B / 4);
        ctx.fillRect(x + B / 3, y + (flap ? -B / 3 : B / 6), B / 3, B / 4);
    }
    drawScrollingStrip(ctx, st.clouds, W, gY, time, speed, 0.3);
};

// ---------- 16. Футбольний стадіон ----------

function buildStadium(W, H, groundY, B) {
    const rng = pixelRng(1616);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#04030c"], [1, "#120a24"]]);
    const sx = sky.getContext("2d");
    // Трибуни з уболівальниками двох команд
    const standTop = Math.round(gY * 0.3);
    const rows = 8;
    const rowH = B * 0.8;
    const fans = [];
    for (let row = 0; row < rows; row++) {
        const y = standTop + row * rowH;
        sx.fillStyle = row % 2 === 0 ? "#1a1430" : "#161028";
        sx.fillRect(0, y, W, rowH);
        for (let x = (row % 2) * B / 3; x < W; x += B * 0.6) {
            if (rng() < 0.9) {
                const home = x < W / 2;
                const color = home ? (rng() < 0.7 ? "#2a6aff" : "#ffe14d") : (rng() < 0.7 ? "#e8173c" : "#ffffff");
                sx.fillStyle = color;
                sx.globalAlpha = 0.6;
                sx.fillRect(x, y + B * 0.15, B * 0.32, B * 0.32);
                sx.globalAlpha = 1;
                // Частина вболівальників махає шарфами (малюються щокадру)
                if (rng() < 0.08) {
                    fans.push({ x: x, y: y, color: color, phase: rng() * 6 });
                }
            }
        }
    }
    // Табло
    sx.fillStyle = "#0a0a14";
    sx.fillRect(W * 0.4, B * 0.8, W * 0.2, B * 3);
    sx.strokeStyle = "#39ff88";
    sx.lineWidth = 2;
    sx.strokeRect(W * 0.4, B * 0.8, W * 0.2, B * 3);
    sx.fillStyle = "#2a6aff";
    sx.fillRect(W * 0.415, B * 1.2, B * 0.9, B * 0.9);
    sx.fillStyle = "#e8173c";
    sx.fillRect(W * 0.585 - B * 0.9, B * 1.2, B * 0.9, B * 0.9);

    // Поле зі смугами трави, розміткою та воротами (прокручується)
    const fieldH = B * 3;
    const stripW = Math.ceil(W * 1.3 / (B * 2)) * B * 2;
    const field = makeCanvas(stripW, fieldH + B * 3);
    const fx = field.getContext("2d");
    const top = field.height - fieldH;
    for (let x = 0; x < stripW; x += B * 2) {
        fx.fillStyle = (x / (B * 2)) % 2 === 0 ? "#2f8a3a" : "#277a32";
        fx.fillRect(x, top, B * 2, fieldH);
    }
    fx.fillStyle = "rgba(255, 255, 255, 0.85)";
    fx.fillRect(0, top + B * 0.3, stripW, 3);
    // Центральна лінія та коло
    const mid = Math.round(stripW * 0.35);
    fx.fillRect(mid, top + B * 0.3, 3, fieldH - B * 0.3);
    fx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    fx.lineWidth = 3;
    fx.beginPath();
    fx.ellipse(mid + 1, top + fieldH * 0.6, B * 2.5, B * 0.9, 0, 0, Math.PI * 2);
    fx.stroke();
    // Ворота з сіткою
    const gx = Math.round(stripW * 0.8);
    fx.fillStyle = "#ffffff";
    fx.fillRect(gx, top - B * 2.2, B / 5, B * 2.2 + B * 0.5);
    fx.fillRect(gx + B * 2.5, top - B * 2.2, B / 5, B * 2.2 + B * 0.5);
    fx.fillRect(gx, top - B * 2.2, B * 2.7, B / 5);
    fx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    fx.lineWidth = 1;
    fx.beginPath();
    for (let k = 1; k < 6; k++) {
        fx.moveTo(gx + k * B * 0.45, top - B * 2);
        fx.lineTo(gx + k * B * 0.45, top + B * 0.3);
        fx.moveTo(gx, top - B * 2.2 + k * B * 0.45);
        fx.lineTo(gx + B * 2.7, top - B * 2.2 + k * B * 0.45);
    }
    fx.stroke();
    return { W: W, H: H, sky: sky, field: field, fans: fans, standTop: standTop, rowH: rowH };
}

// Цифри рахунку на табло 3×5 пікселів
const SCORE_DIGITS = {
    0: ["111", "101", "101", "101", "111"],
    1: ["010", "110", "010", "010", "111"],
    2: ["111", "001", "111", "100", "111"],
    3: ["111", "001", "111", "001", "111"]
};

function drawScoreDigit(ctx, digit, x, y, px, color) {
    const rows = SCORE_DIGITS[digit] || SCORE_DIGITS[0];
    ctx.fillStyle = color;
    for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < 3; c++) {
            if (rows[r][c] === "1") {
                ctx.fillRect(x + c * px, y + r * px, px, px);
            }
        }
    }
}

BackgroundRenderer.renderStadium = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._stadium;
    if (!st || st.W !== W || st.H !== H) {
        st = buildStadium(W, H, groundY, B);
        this._stadium = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Рахунок змінюється: кожні 8 с «забивають гол»
    const goals = Math.floor(time / 8) % 4;
    const home = Math.min(3, Math.floor((goals + 1) / 2));
    const away = Math.min(3, Math.floor(goals / 2));
    const px = Math.max(2, Math.round(B / 5));
    drawScoreDigit(ctx, home, Math.round(W * 0.47 - px * 3), Math.round(B * 1.3), px, "#ffe14d");
    ctx.fillStyle = "#ffe14d";
    ctx.fillRect(Math.round(W * 0.5 - px / 2), Math.round(B * 1.3 + px), px, px);
    ctx.fillRect(Math.round(W * 0.5 - px / 2), Math.round(B * 1.3 + px * 3), px, px);
    drawScoreDigit(ctx, away, Math.round(W * 0.53), Math.round(B * 1.3), px, "#ffe14d");
    // Уболівальники махають шарфами
    // Після «Ідеально» вболівальники підстрибують і махають активніше
    const cheer = _fx.perfect;
    for (const f of st.fans) {
        const wave = Math.sin(time * 6 + f.phase) * (1 + cheer * 2) - cheer * 1.5;
        ctx.fillStyle = f.color;
        ctx.fillRect(f.x - B * 0.15, f.y - B * 0.1 + wave * B * 0.15, B * 0.6, B * 0.18);
    }
    // Спалахи камер
    const r = pixelRng(Math.floor(time * 8));
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(Math.round(r() * W), Math.round(st.standTop + r() * st.rowH * 8), B / 3, B / 3);
    }
    // Прожектори
    for (let i = 0; i < 4; i++) {
        const baseX = W * (0.1 + i * 0.27);
        const ang = Math.PI / 2 + Math.sin(time * 0.9 + i * 1.7) * 0.45;
        ctx.fillStyle = "rgba(255, 255, 230, 0.06)";
        ctx.beginPath();
        ctx.moveTo(baseX, 0);
        ctx.lineTo(baseX + Math.cos(ang - 0.12) * gY * 1.3, Math.sin(ang - 0.12) * gY * 1.3);
        ctx.lineTo(baseX + Math.cos(ang + 0.12) * gY * 1.3, Math.sin(ang + 0.12) * gY * 1.3);
        ctx.closePath();
        ctx.fill();
    }
    drawScrollingStrip(ctx, st.field, W, gY, time, speed, 0.3);
    // М'яч стрибає полем по дузі від гравця до гравця
    const pass = 2.4;
    const t = (time % pass) / pass;
    const leg = Math.floor(time / pass);
    const fromX = W * (0.2 + ((leg * 0.37) % 0.6));
    const toX = W * (0.2 + (((leg + 1) * 0.37) % 0.6));
    const bx = fromX + (toX - fromX) * t;
    const by = gY - B * 1.4 - Math.sin(t * Math.PI) * B * 4;
    const bs = Math.round(B * 0.7);
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(Math.round(bx - bs / 2), gY - B * 0.9, bs, B / 5);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(bx - bs / 2), Math.round(by - bs / 2), bs, bs);
    ctx.fillStyle = "#111111";
    ctx.fillRect(Math.round(bx - bs / 6), Math.round(by - bs / 6), Math.round(bs / 3), Math.round(bs / 3));
    ctx.fillRect(Math.round(bx - bs / 2), Math.round(by - bs / 2), Math.round(bs / 4), Math.round(bs / 4));
    ctx.fillRect(Math.round(bx + bs / 4), Math.round(by + bs / 4), Math.round(bs / 4), Math.round(bs / 4));
};

// ---------- Ліги 2 та 4: сцени рівнів ----------

// ---------- 20. Скарбниця ----------
// Печера-скарбниця: кам'яні арки, гори золота, відчинені скрині, корона й самоцвіти.
// Із тріщини у склепінні сиплеться золотий водоспад монет.

function drawGoldMound(ctx, cx, baseY, halfW, h, rng, B) {
    const p = Math.max(2, Math.round(B / 3));
    for (let x = -halfW; x < halfW; x += p) {
        const k = 1 - Math.abs(x) / halfW;
        const top = baseY - Math.round(h * Math.sqrt(k) / p) * p;
        for (let y = top; y < baseY; y += p) {
            const shade = rng();
            ctx.fillStyle = y === top ? "#fff0a0" : shade < 0.15 ? "#fff0a0" : shade < 0.6 ? "#ffcc33" : "#d8a020";
            ctx.fillRect(cx + x, y, p, p);
        }
    }
}

function buildTreasury(W, H, groundY, B) {
    const rng = pixelRng(2020);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0e0806"], [1, "#2a1a0c"]]);

    // Арки з колонами (дальній план)
    const stripW = Math.ceil(W * 1.4 / (B * 8)) * B * 8;
    const archH = Math.round(gY * 0.85);
    const arches = makeCanvas(stripW, archH);
    const ax = arches.getContext("2d");
    ax.fillStyle = "#2a1c12";
    ax.fillRect(0, 0, stripW, archH);
    for (let x = 0; x < stripW; x += B * 8) {
        // Прохід арки — темніший
        ax.fillStyle = "#160e08";
        ax.fillRect(x + B * 1.5, archH * 0.3, B * 5, archH * 0.7);
        for (let k = 0; k < 5; k++) {
            const lift = Math.round(Math.sin((k + 0.5) / 5 * Math.PI) * B * 2);
            ax.fillRect(x + B * 1.5 + k * B, archH * 0.3 - lift, B, lift);
        }
        // Колони з блоків
        for (let y = 0; y < archH; y += B) {
            ax.fillStyle = (y / B) % 2 === 0 ? "#3a2a1c" : "#34261a";
            ax.fillRect(x, y, B * 1.5, B - 2);
            ax.fillRect(x + B * 6.5, y, B * 1.5, B - 2);
        }
        ax.fillStyle = "#c89a20";
        ax.fillRect(x, archH * 0.3 - B * 2.3, B * 8, B * 0.3);
    }

    // Гори золота з речами — ближній шар
    const nearW = Math.ceil(W * 1.5 / B) * B;
    const nearH = Math.round(B * 8);
    const near = makeCanvas(nearW, nearH);
    const nx = near.getContext("2d");
    const sparkles = [];
    for (let x = B * 3; x < nearW - B * 3; x += B * (7 + Math.floor(rng() * 4))) {
        const halfW = B * (2.5 + rng() * 2.5);
        const h = B * (2.5 + rng() * 3);
        drawGoldMound(nx, x, nearH, halfW, h, rng, B);
        for (let s = 0; s < 4; s++) {
            sparkles.push({ x: x + (rng() - 0.5) * halfW * 1.4, y: nearH - rng() * h * 0.8, phase: rng() * 6 });
        }
        const deco = Math.floor(rng() * 3);
        if (deco === 0) {
            // Відчинена скриня
            const cx = x + halfW * 0.6;
            nx.fillStyle = "#6a3a14";
            nx.fillRect(cx, nearH - B * 1.6, B * 2.4, B * 1.6);
            nx.fillStyle = "#8a4b1c";
            nx.fillRect(cx - B * 0.2, nearH - B * 2.8, B * 2.8, B * 0.9);
            nx.fillStyle = "#ffcc33";
            nx.fillRect(cx + B * 0.2, nearH - B * 1.9, B * 2, B * 0.4);
            nx.fillRect(cx + B * 1, nearH - B * 1.6, B * 0.4, B * 1.6);
        } else if (deco === 1) {
            // Корона на верхівці
            const cx = x - B;
            const ty = nearH - h - B * 0.4;
            nx.fillStyle = "#ffd700";
            nx.fillRect(cx, ty, B * 2, B * 0.8);
            nx.fillRect(cx, ty - B * 0.5, B * 0.4, B * 0.5);
            nx.fillRect(cx + B * 0.8, ty - B * 0.7, B * 0.4, B * 0.7);
            nx.fillRect(cx + B * 1.6, ty - B * 0.5, B * 0.4, B * 0.5);
            nx.fillStyle = "#ff3355";
            nx.fillRect(cx + B * 0.8, ty + B * 0.2, B * 0.4, B * 0.4);
        } else {
            // Самоцвіти
            const gems = ["#ff3355", "#39c6ff", "#39ff88", "#b35cff"];
            for (let g = 0; g < 5; g++) {
                nx.fillStyle = gems[g % 4];
                nx.fillRect(Math.round(x + (rng() - 0.5) * halfW), Math.round(nearH - rng() * h * 0.7 - B * 0.4), Math.round(B * 0.5), Math.round(B * 0.5));
            }
        }
    }
    return { W: W, H: H, sky: sky, arches: arches, near: near, sparkles: sparkles };
}

BackgroundRenderer.renderTreasury = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._treasury;
    if (!st || st.W !== W || st.H !== H) {
        st = buildTreasury(W, H, groundY, B);
        this._treasury = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.arches, W, gY, time, speed, 0.12);

    // Золотий водоспад монет із тріщини в склепінні
    const fx = Math.round(W * 0.66);
    ctx.fillStyle = "#0a0604";
    ctx.fillRect(fx - B * 1.2, 0, B * 2.4, B * 0.8);
    ctx.fillStyle = "rgba(255, 204, 51, 0.25)";
    ctx.fillRect(fx - B * 0.8, 0, B * 1.6, gY - B * 2);
    const step = B * 0.7;
    const shift = (time * B * 8) % step;
    for (let y = -step + shift; y < gY - B * 2; y += step) {
        for (let k = 0; k < 3; k++) {
            const wob = Math.sin(y * 0.1 + k * 2 + time * 3) * B * 0.3;
            ctx.fillStyle = (Math.floor(y / step) + k) % 3 === 0 ? "#fff0a0" : "#ffcc33";
            ctx.fillRect(Math.round(fx - B * 0.6 + k * B * 0.45 + wob), Math.round(y + k * step * 0.3), Math.max(3, Math.round(B / 3)), Math.max(3, Math.round(B / 4)));
        }
    }
    // Монети відскакують від купи внизу водоспаду
    for (let k = 0; k < 6; k++) {
        const q = (time * 1.4 + k / 6) % 1;
        const dir = k % 2 === 0 ? 1 : -1;
        ctx.fillStyle = "#ffe14d";
        ctx.fillRect(Math.round(fx + dir * q * B * (2 + k % 3)), Math.round(gY - B * 2 - Math.sin(q * Math.PI) * B * 1.8), Math.max(3, B / 3), Math.max(3, B / 3));
    }

    // Гори золота з блиском
    const nW = st.near.width;
    const nOff = Math.round(time * speed * 0.4) % nW;
    const nTop = gY - st.near.height;
    for (let x = -nOff; x < W; x += nW) {
        ctx.drawImage(st.near, x, nTop);
        for (const s of st.sparkles) {
            const sx = x + s.x;
            if (sx < -B || sx > W + B) {
                continue;
            }
            const tw = Math.sin(time * 3 + s.phase);
            if (tw > 0.6) {
                const r = Math.round(B * 0.5 * (tw - 0.6) / 0.4);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(Math.round(sx - r), Math.round(nTop + s.y), r * 2 + 2, 2);
                ctx.fillRect(Math.round(sx), Math.round(nTop + s.y - r), 2, r * 2 + 2);
            }
        }
    }
};

// ---------- 22. Лігво дракона ----------

function buildDragonLair(W, H, groundY, B) {
    const rng = pixelRng(2222);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0a0404"], [0.7, "#2a0a06"], [1, "#4a1808"]]);
    const sx = sky.getContext("2d");
    // Гора з печерою
    const cols = Math.ceil(W / B) + 1;
    const hs = periodicHeights(cols, 10, [{ amp: 5, k: 1, ph: 1.6 }, { amp: 1.5, k: 6, ph: 0.4 }]);
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < hs[c]; r++) {
            sx.fillStyle = (r + c) % 2 === 0 ? "#2a1a14" : "#241610";
            sx.fillRect(c * B, gY - (r + 1) * B, B, B);
        }
    }
    const caveX = Math.round(W * 0.5 / B) * B;
    sx.fillStyle = "#0a0402";
    sx.fillRect(caveX - B * 3, gY - B * 5, B * 6, B * 5);
    sx.fillRect(caveX - B * 2, gY - B * 6, B * 4, B);
    // Гніздо з яйцями та скарбами
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const nest = makeCanvas(stripW, B * 3);
    const nx = nest.getContext("2d");
    const eggs = [];
    for (let x = B * 2; x < stripW - B * 6; x += B * (9 + Math.floor(rng() * 5))) {
        nx.fillStyle = "#5a3a1e";
        nx.fillRect(x, B * 2, B * 5, B);
        nx.fillStyle = "#6e4a26";
        nx.fillRect(x - B / 2, B * 2.5, B * 6, B / 2);
        const colors = [["#39c66a", "#9dffb0"], ["#b06bff", "#e0c0ff"], ["#ff7a3d", "#ffc08a"]];
        for (let e = 0; e < 3; e++) {
            const col = colors[Math.floor(rng() * colors.length)];
            const ex = x + B * 0.5 + e * B * 1.5;
            nx.fillStyle = col[0];
            nx.fillRect(ex, B * 0.8, B, B * 1.4);
            nx.fillRect(ex + B / 6, B * 0.6, B * 0.66, B / 5);
            nx.fillStyle = col[1];
            nx.fillRect(ex + B / 5, B, B / 4, B / 4);
            nx.fillRect(ex + B / 2, B * 1.6, B / 5, B / 5);
            eggs.push({ x: ex + B / 2, y: B * 1.5, color: col[0], phase: rng() * 6 });
        }
        nx.fillStyle = "#ffcc33";
        nx.fillRect(x + B * 4.8, B * 2.2, B / 2, B / 3);
        nx.fillRect(x - B, B * 2.4, B / 2, B / 3);
    }
    return { W: W, H: H, sky: sky, nest: nest, eggs: eggs, caveX: caveX };
}

BackgroundRenderer.renderDragonLair = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._dragonLair;
    if (!st || st.W !== W || st.H !== H) {
        st = buildDragonLair(W, H, groundY, B);
        this._dragonLair = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Дихання дракона в печері: очі світяться, іноді спалах вогню
    const breath = Math.sin(time * 0.8) * 0.5 + 0.5;
    ctx.fillStyle = "rgba(255, 90, 0, " + (0.15 + 0.25 * breath).toFixed(3) + ")";
    ctx.fillRect(st.caveX - B * 3, gY - B * 5, B * 6, B * 5);
    const blink = (time % 5) < 0.2;
    if (!blink) {
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(st.caveX - B * 1.4, gY - B * 3.2, B * 0.8, B * 0.4);
        ctx.fillRect(st.caveX + B * 0.6, gY - B * 3.2, B * 0.8, B * 0.4);
    }
    const fire = (time % 7) / 1.2;
    if (fire < 1) {
        ctx.fillStyle = "rgba(255, 160, 40, " + (0.35 * (1 - fire)).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
        ctx.fillStyle = "rgba(255, 220, 80, " + (0.8 * (1 - fire)).toFixed(3) + ")";
        for (let k = 0; k < 8; k++) {
            ctx.fillRect(st.caveX - B + (k % 3) * B * 0.6, gY - B * 2.5 - k * B * 0.6 * fire * 4, B * 0.6, B * 0.6);
        }
    }
    const nw = st.nest.width;
    const offset = Math.round(time * speed * 0.3) % nw;
    const top = gY - st.nest.height;
    for (let x = -offset; x < W; x += nw) {
        ctx.drawImage(st.nest, x, top);
        // Яйця ледь світяться
        for (const e of st.eggs) {
            const ex = x + e.x;
            if (ex < -B * 2 || ex > W + B * 2) {
                continue;
            }
            ctx.globalAlpha = 0.08 + 0.1 * (Math.sin(time * 2 + e.phase) * 0.5 + 0.5);
            ctx.fillStyle = e.color;
            ctx.fillRect(ex - B, top + e.y - B, B * 2, B * 2);
        }
        ctx.globalAlpha = 1;
    }
    drawFallingPixels(ctx, W, gY, time, 30, 2222, {
        color: "#ffae42", dir: -1, speedMin: 20, speedMax: 50, sizeMin: 2, sizeMax: 3,
        sway: 1.5, swayAmp: B * 0.6, alpha: 0.7
    });
};

// ---------- 24. Лицарський замок ----------
// Нічний замок у глибину: далекий палац на пагорбі з вікнами, мур із вежами
// й конічними дахами, прапори майорять, вартові з списами ходять мурами,
// у дворі — опудала для тренувань, стійки зі зброєю та криниця.

function buildKnightCastle(W, H, groundY, B) {
    const rng = pixelRng(2424);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#070a1c"], [0.7, "#18204a"], [1, "#2a2f5a"]]);
    const skx = sky.getContext("2d");
    drawStarsInto(skx, W, gY * 0.5, 60, rng, B);
    drawPixelDisc(skx, W * 0.82, gY * 0.16, B * 2.6, B / 2, "rgba(255, 250, 220, 0.25)");
    drawPixelDisc(skx, W * 0.82, gY * 0.16, B * 1.8, B / 2, "#fff8dc");

    // Далекий палац на пагорбі (не прокручується разом із муром)
    const palace = makeCanvas(B * 22, Math.round(gY * 0.5));
    const px = palace.getContext("2d");
    const ph = palace.height;
    px.fillStyle = "#141a38";
    for (let c = 0; c < 22; c++) {
        const hill = Math.round(Math.sin((c + 0.5) / 22 * Math.PI) * B * 3);
        px.fillRect(c * B, ph - hill, B, hill);
    }
    const towers = [[3, 7, 1.6], [7, 10, 2], [11, 13, 2.4], [15, 9, 2], [18, 6, 1.6]];
    const windows = [];
    for (const t of towers) {
        const tx = t[0] * B;
        const th = t[1] * B;
        const tw = t[2] * B;
        px.fillStyle = "#1c2448";
        px.fillRect(tx, ph - B * 2.5 - th, tw, th);
        // Конічний дах
        for (let r = 0; r < 4; r++) {
            px.fillRect(tx - B * 0.2 + r * tw * 0.12, ph - B * 2.5 - th - (r + 1) * B * 0.6, tw + B * 0.4 - r * tw * 0.24, B * 0.6);
        }
        for (let w = 0; w < 3; w++) {
            windows.push({ x: tx + tw / 2 - 2, y: ph - B * 2.5 - th + B + w * B * 1.8, phase: rng() * 6 });
        }
    }
    px.fillRect(B * 3, ph - B * 5, B * 17, B * 2.6);

    // Мур із вежами — середній шар
    const stripW = Math.ceil(W * 1.5 / (B * 14)) * B * 14;
    const wallH = Math.round(B * 10);
    const wall = makeCanvas(stripW, wallH);
    const wx = wall.getContext("2d");
    const wallTop = B * 4;
    for (let y = wallTop; y < wallH; y += B * 0.8) {
        for (let x = ((y / (B * 0.8)) % 2) * B * 0.8; x < stripW; x += B * 1.6) {
            wx.fillStyle = rng() < 0.5 ? "#3a3f5a" : "#363a54";
            wx.fillRect(x, y, B * 1.6 - 2, B * 0.8 - 2);
        }
    }
    for (let x = 0; x < stripW; x += B * 1.2) {
        wx.fillStyle = "#3e4462";
        wx.fillRect(x, wallTop - B * 0.8, B * 0.7, B * 0.8);
    }
    const flags = [];
    const torches = [];
    for (let x = B * 2; x < stripW; x += B * 14) {
        // Вежа з конічним дахом
        wx.fillStyle = "#434a6a";
        wx.fillRect(x, B * 1.5, B * 3, wallH - B * 1.5);
        wx.fillStyle = "#8a2a3a";
        for (let r = 0; r < 4; r++) {
            wx.fillRect(x - B * 0.3 + r * B * 0.45, B * 1.5 - (r + 1) * B * 0.5, B * 3.6 - r * B * 0.9, B * 0.5);
        }
        wx.fillStyle = "#1a1c2a";
        wx.fillRect(x + B * 1.2, B * 3, B * 0.6, B * 1.2);
        flags.push({ x: x + B * 1.5, y: B * 1.5 - B * 2.2, color: flags.length % 2 === 0 ? "#3a6aff" : "#ff3355" });
        torches.push({ x: x + B * 6, y: wallTop + B * 2 });
        torches.push({ x: x + B * 10, y: wallTop + B * 2 });
    }
    // Брама з ґратами
    const gateX = B * 8;
    wx.fillStyle = "#1a1420";
    wx.fillRect(gateX, wallH - B * 4, B * 3, B * 4);
    wx.fillStyle = "#5a5a6a";
    for (let k = 0; k < 4; k++) {
        wx.fillRect(gateX + B * 0.2 + k * B * 0.8, wallH - B * 4, B * 0.2, B * 4);
    }

    // Двір — ближній шар
    const yardW = Math.ceil(W * 1.3 / B) * B;
    const yard = makeCanvas(yardW, B * 3);
    const yx = yard.getContext("2d");
    for (let x = B * 2; x < yardW - B * 3; x += B * (6 + Math.floor(rng() * 4))) {
        const kind = Math.floor(rng() * 3);
        if (kind === 0) {
            // Опудало з мішенню
            yx.fillStyle = "#6a4a2a";
            yx.fillRect(x + B * 0.4, B * 0.8, B * 0.2, B * 2.2);
            yx.fillRect(x - B * 0.2, B * 1.2, B * 1.4, B * 0.2);
            yx.fillStyle = "#c8a060";
            yx.fillRect(x + B * 0.1, B * 0.3, B * 0.8, B * 0.7);
            yx.fillStyle = "#ff3355";
            yx.fillRect(x + B * 0.35, B * 0.5, B * 0.3, B * 0.3);
        } else if (kind === 1) {
            // Стійка зі списами
            yx.fillStyle = "#5a3a1a";
            yx.fillRect(x, B * 2.2, B * 2, B * 0.3);
            for (let k = 0; k < 4; k++) {
                yx.fillStyle = "#8a6a4a";
                yx.fillRect(x + B * 0.2 + k * B * 0.5, B * 0.4, 2, B * 2.6);
                yx.fillStyle = "#c8d0e0";
                yx.fillRect(x + B * 0.1 + k * B * 0.5, B * 0.2, B * 0.25, B * 0.3);
            }
        } else {
            // Криниця
            yx.fillStyle = "#4a4e66";
            yx.fillRect(x, B * 1.8, B * 2, B * 1.2);
            yx.fillStyle = "#5a3a1a";
            yx.fillRect(x, B * 0.4, B * 0.2, B * 1.4);
            yx.fillRect(x + B * 1.8, B * 0.4, B * 0.2, B * 1.4);
            yx.fillStyle = "#8a2a3a";
            yx.fillRect(x - B * 0.3, B * 0.2, B * 2.6, B * 0.4);
        }
    }
    return { W: W, H: H, sky: sky, palace: palace, windows: windows, wall: wall, wallTop: wallTop, flags: flags, torches: torches, yard: yard };
}

BackgroundRenderer.renderKnightCastle = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._knightCastle;
    if (!st || st.W !== W || st.H !== H) {
        st = buildKnightCastle(W, H, groundY, B);
        this._knightCastle = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);

    // Далекий палац пропливає дуже повільно; вікна мерехтять
    const pW = st.palace.width;
    const loop = W + pW;
    const ppx = W - ((time * speed * 0.03) % loop);
    const ppy = gY - B * 6 - st.palace.height;
    ctx.drawImage(st.palace, Math.round(ppx), ppy);
    for (const w of st.windows) {
        ctx.fillStyle = Math.sin(time * 2 + w.phase) > -0.6 ? "#ffcc55" : "#8a6a30";
        ctx.fillRect(Math.round(ppx + w.x), Math.round(ppy + w.y), 4, 5);
    }

    // Мур: прапори майорять, смолоскипи мерехтять, вартові ходять туди-сюди
    const wW = st.wall.width;
    const off = Math.round(time * speed * 0.25) % wW;
    const top = gY - st.wall.height;
    for (let x = -off; x < W; x += wW) {
        ctx.drawImage(st.wall, x, top);
        for (let i = 0; i < st.flags.length; i++) {
            const f = st.flags[i];
            const fx = x + f.x;
            if (fx < -B * 4 || fx > W + B) {
                continue;
            }
            ctx.fillStyle = "#6a6a7a";
            ctx.fillRect(Math.round(fx), top + f.y, 2, B * 2.2);
            ctx.fillStyle = f.color;
            for (let k = 0; k < 4; k++) {
                const wave = Math.sin(time * 6 - k * 0.9 + i) * B * 0.15;
                ctx.fillRect(Math.round(fx + 2 + k * B * 0.45), Math.round(top + f.y + wave), Math.ceil(B * 0.45), Math.round(B * 0.8));
            }
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(Math.round(fx + B * 0.6), Math.round(top + f.y + B * 0.25 + Math.sin(time * 6 - 1 + i) * B * 0.15), Math.round(B * 0.3), Math.round(B * 0.3));
        }
        for (let i = 0; i < st.torches.length; i++) {
            const t = st.torches[i];
            const tx = x + t.x;
            if (tx < -B * 2 || tx > W + B * 2) {
                continue;
            }
            const fl = 0.8 + 0.2 * Math.sin(time * 11 + i * 3);
            ctx.globalAlpha = 0.14 * fl;
            drawPixelDisc(ctx, tx, top + t.y - B * 0.3, B * 1.1, B / 4, "#ffaa33");
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#5a3a1a";
            ctx.fillRect(Math.round(tx - 2), Math.round(top + t.y), 4, Math.round(B * 0.8));
            ctx.fillStyle = "#ff7a00";
            ctx.fillRect(Math.round(tx - B * 0.2), Math.round(top + t.y - B * 0.5 * fl), Math.round(B * 0.4), Math.round(B * 0.5 * fl));
        }
        // Вартові на мурі
        for (let i = 0; i < 3; i++) {
            const walk = Math.sin(time * 0.25 + i * 2.1);
            const gx = x + wW * (i + 0.5) / 3 + walk * B * 4;
            if (gx < -B * 2 || gx > W + B * 2) {
                continue;
            }
            const gyTop = top + st.wallTop - B * 2.2;
            const step = Math.sin(time * 8 + i) > 0 ? 1 : 0;
            ctx.fillStyle = "#8a90a8";
            ctx.fillRect(Math.round(gx), Math.round(gyTop), Math.round(B * 0.8), Math.round(B * 0.7));
            ctx.fillStyle = "#3a6aff";
            ctx.fillRect(Math.round(gx), Math.round(gyTop + B * 0.7), Math.round(B * 0.8), Math.round(B * 0.9));
            ctx.fillStyle = "#5a5a6a";
            ctx.fillRect(Math.round(gx + step * B * 0.2), Math.round(gyTop + B * 1.6), Math.round(B * 0.25), Math.round(B * 0.6));
            ctx.fillRect(Math.round(gx + B * 0.55 - step * B * 0.2), Math.round(gyTop + B * 1.6), Math.round(B * 0.25), Math.round(B * 0.6));
            ctx.fillStyle = "#8a6a4a";
            ctx.fillRect(Math.round(gx + (walk > 0 ? B * 0.9 : -B * 0.2)), Math.round(gyTop - B * 1), 2, Math.round(B * 2.8));
            ctx.fillStyle = "#e0e6f0";
            ctx.fillRect(Math.round(gx + (walk > 0 ? B * 0.85 : -B * 0.25)), Math.round(gyTop - B * 1.3), Math.round(B * 0.25), Math.round(B * 0.35));
        }
    }
    drawScrollingStrip(ctx, st.yard, W, gY, time, speed, 0.5);
};

// ---------- 29. Чорна діра ----------

function buildBlackHole(W, H, groundY, B) {
    const rng = pixelRng(2929);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#020108"], [1, "#0a0418"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, gY, 140, rng, B);
    const particles = [];
    for (let i = 0; i < 260; i++) {
        particles.push({ r: 0.05 + rng() * 1.05, a: rng() * Math.PI * 2, speed: 0.4 + rng() * 0.6, hot: rng() });
    }
    return { W: W, H: H, sky: sky, particles: particles, cx: W * 0.62, cy: gY * 0.42, R: Math.min(W, gY) * 0.16 };
}

BackgroundRenderer.renderBlackHole = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._blackHole;
    if (!st || st.W !== W || st.H !== H) {
        st = buildBlackHole(W, H, groundY, B);
        this._blackHole = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    // Діра росте, що ближче фініш
    const R = st.R * (1 + (_fx.progress || 0) * 0.8);
    const ps = Math.max(2, Math.round(B / 4));
    // Суцільні світні смуги диска (половина позаду діри, половина попереду)
    function drawBands(front) {
        const bands = [[1.25, "rgba(255, 240, 200, 0.55)", 6], [1.6, "rgba(255, 160, 70, 0.4)", 10], [2.1, "rgba(255, 80, 120, 0.25)", 14], [2.6, "rgba(160, 60, 200, 0.15)", 16]];
        for (const b of bands) {
            ctx.strokeStyle = b[1];
            ctx.lineWidth = b[2];
            ctx.beginPath();
            ctx.ellipse(st.cx, st.cy, R * b[0], R * b[0] * 0.28, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
            ctx.stroke();
        }
    }
    // Акреційний диск: частинки обертаються, ближчі — швидше й гарячіші
    function drawDisk(front) {
        for (const p of st.particles) {
            const ang = p.a + time * p.speed / p.r;
            const sinA = Math.sin(ang);
            if ((sinA > 0) !== front) {
                continue;
            }
            const rr = R * (1.1 + p.r * 1.6);
            const x = st.cx + Math.cos(ang) * rr;
            const y = st.cy + sinA * rr * 0.28;
            const heat = 1 - p.r / 1.1;
            ctx.fillStyle = heat > 0.5 ? "#fff0c0" : p.hot > 0.5 ? "#ff9a3d" : "#ff4f7a";
            ctx.globalAlpha = 0.5 + heat * 0.5;
            ctx.fillRect(Math.round(x), Math.round(y), ps, ps);
        }
        ctx.globalAlpha = 1;
    }
    drawBands(false);
    drawDisk(false);
    // Світне кільце та сама діра
    ctx.fillStyle = "rgba(255, 180, 90, 0.25)";
    ctx.beginPath();
    ctx.arc(st.cx, st.cy, R * 1.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(st.cx, st.cy, R, 0, Math.PI * 2);
    ctx.fill();
    drawBands(true);
    drawDisk(true);
    // Зорі, що затягуються спіраллю
    for (let i = 0; i < 6; i++) {
        const t = ((time * 0.12 + i / 6) % 1);
        const ang = i * 1.1 + t * Math.PI * 3;
        const rr = R * (4 - t * 3);
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = "#bfe9ff";
        ctx.fillRect(Math.round(st.cx + Math.cos(ang) * rr), Math.round(st.cy + Math.sin(ang) * rr * 0.5), ps, ps);
    }
    ctx.globalAlpha = 1;
};

// ---------- 30. Небесна цитадель ----------
// Золоті храми на летючих островах над морем хмар. Чим ближче фініш, тим
// вище піднімається цитадель — це останнє сходження перед боєм із босом.

// Летючий острів із храмом: скеля-«морквина» знизу, колони й купол згори
function drawTempleIsland(ctx, x, baseY, w, B, rng, big) {
    const p = B / 4;
    const cols = Math.round(w / B);
    // Скеля
    for (let c = 0; c < cols; c++) {
        const depth = Math.max(1, Math.round((1 - Math.abs(c - cols / 2 + 0.5) / (cols / 2)) * (big ? 5 : 3)) + (rng() < 0.3 ? 1 : 0));
        for (let r = 0; r < depth; r++) {
            ctx.fillStyle = r === 0 ? "#8a7a6a" : (r + c) % 2 === 0 ? "#5a4a4a" : "#4e4040";
            ctx.fillRect(x + c * B, baseY + r * B, B, B);
        }
    }
    ctx.fillStyle = "#6fbf5a";
    ctx.fillRect(x, baseY - p, cols * B, p * 2);
    // Храм
    const tw = Math.round(cols * (big ? 0.7 : 0.6));
    const tx = x + Math.round((cols - tw) / 2) * B;
    const th = B * (big ? 4 : 2.6);
    ctx.fillStyle = "#f4e6c0";
    ctx.fillRect(tx, baseY - B * 0.5, tw * B, B * 0.5);
    for (let k = 0; k <= tw; k += 1) {
        ctx.fillStyle = "#fff4dc";
        ctx.fillRect(tx + k * B - p, baseY - th, p * 2, th - B * 0.5);
        ctx.fillStyle = "#d8c49a";
        ctx.fillRect(tx + k * B + p, baseY - th, p * 0.6, th - B * 0.5);
    }
    ctx.fillStyle = "#f4e6c0";
    ctx.fillRect(tx - p, baseY - th - B * 0.5, tw * B + p * 2, B * 0.5);
    // Золотий купол
    ctx.fillStyle = "#ffcc33";
    const dw = tw * B * 0.8;
    const dx = tx + (tw * B - dw) / 2;
    for (let r = 0; r < 3; r++) {
        const shrink = r * dw * 0.18;
        ctx.fillRect(dx + shrink, baseY - th - B * (1 + r * 0.6), dw - shrink * 2, B * 0.6);
    }
    ctx.fillStyle = "#fff0a0";
    ctx.fillRect(dx + dw / 2 - p / 2, baseY - th - B * 3, p, B * 1.4);
}

function buildSkyCitadel(W, H, groundY, B) {
    const rng = pixelRng(3030);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#12246a"], [0.5, "#3a6ac8"], [0.85, "#ffd88a"], [1, "#fff0c8"]]);
    const skx = sky.getContext("2d");
    // Сонце
    drawPixelDisc(skx, W * 0.5, gY * 0.3, B * 5, B, "rgba(255, 240, 180, 0.3)");
    drawPixelDisc(skx, W * 0.5, gY * 0.3, B * 3.5, B, "#fff6d0");

    // Промені, що падають крізь хмари (намальовані просто в небо — без зайвого копіювання щокадру)
    const rx = skx;
    rx.fillStyle = "rgba(255, 240, 190, 0.14)";
    for (let i = 0; i < 6; i++) {
        const a = -0.9 + i * 0.36;
        rx.beginPath();
        rx.moveTo(W * 0.5, gY * 0.3);
        rx.lineTo(W * 0.5 + Math.tan(a) * gY * 1.2 - B * 3, gY);
        rx.lineTo(W * 0.5 + Math.tan(a) * gY * 1.2 + B * 3, gY);
        rx.closePath();
        rx.fill();
    }

    // Велика шестерня з золота
    const gearR = Math.round(gY * 0.22);
    const gear = makeCanvas(gearR * 2 + B * 2, gearR * 2 + B * 2);
    const gx = gear.getContext("2d");
    const gc = gear.width / 2;
    gx.fillStyle = "rgba(255, 214, 90, 0.6)";
    for (let t = 0; t < 16; t++) {
        const a = t * Math.PI * 2 / 16;
        gx.save();
        gx.translate(gc + Math.cos(a) * gearR, gc + Math.sin(a) * gearR);
        gx.rotate(a);
        gx.fillRect(-B * 0.6, -B * 0.5, B * 1.2, B);
        gx.restore();
    }
    gx.beginPath();
    gx.arc(gc, gc, gearR, 0, Math.PI * 2);
    gx.arc(gc, gc, gearR * 0.55, 0, Math.PI * 2, true);
    gx.fill();
    gx.fillRect(gc - B * 0.4, gc - gearR * 0.6, B * 0.8, gearR * 1.2);
    gx.fillRect(gc - gearR * 0.6, gc - B * 0.4, gearR * 1.2, B * 0.8);

    // Острови трьох планів
    const stripW = Math.ceil(W * 1.5 / B) * B;
    const layers = [];
    const specs = [
        { h: gY * 0.5, count: 4, wMin: 4, wMax: 6, big: false, tint: "rgba(120, 150, 220, 0.45)" },
        { h: gY * 0.6, count: 3, wMin: 6, wMax: 8, big: false, tint: "rgba(120, 150, 220, 0.2)" },
        { h: gY * 0.62, count: 2, wMin: 9, wMax: 11, big: true, tint: null }
    ];
    for (const spec of specs) {
        const layer = makeCanvas(stripW, Math.round(spec.h));
        const lx = layer.getContext("2d");
        const gap = stripW / spec.count;
        for (let i = 0; i < spec.count; i++) {
            const w = (spec.wMin + Math.floor(rng() * (spec.wMax - spec.wMin + 1))) * B;
            const x = Math.round((i * gap + rng() * (gap - w)) / B) * B;
            const baseY = Math.round(layer.height * (0.45 + rng() * 0.3));
            drawTempleIsland(lx, x, baseY, w, B, rng, spec.big);
        }
        if (spec.tint) {
            lx.globalCompositeOperation = "source-atop";
            lx.fillStyle = spec.tint;
            lx.fillRect(0, 0, layer.width, layer.height);
            lx.globalCompositeOperation = "source-over";
        }
        layers.push(layer);
    }

    // Море хмар унизу
    const cols = Math.ceil(W * 1.4 / B);
    const cloudH = periodicHeights(cols, 2.5, [{ amp: 1.2, k: 6, ph: 0.3 }, { amp: 0.8, k: 13, ph: 1.4 }]);
    const clouds = makeCanvas(cols * B, (Math.max.apply(null, cloudH) + 1) * B);
    const cx = clouds.getContext("2d");
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < cloudH[c]; r++) {
            cx.fillStyle = r === 0 ? "#ffffff" : r === 1 ? "#f0eefa" : "#d8d8ee";
            cx.fillRect(c * B, clouds.height - (cloudH[c] - r) * B, B, B);
        }
    }
    return {
        W: W, H: H, sky: sky, layers: layers, clouds: clouds,
        gearBig: buildGearFrames(gear, 1), gearSmall: buildGearFrames(gear, 0.6)
    };
}

// Шестерня має 16 зубців, тож поворот повторюється кожні 1/16 оберту.
// Кілька кадрів повороту малюються заздалегідь — поворот щокадру коштує дорого
const GEAR_FRAMES = 8;
const GEAR_TEETH = 16;

function buildGearFrames(gear, scale) {
    const size = Math.ceil(gear.width * scale);
    const frames = [];
    for (let i = 0; i < GEAR_FRAMES; i++) {
        const f = makeCanvas(size, size);
        const fx = f.getContext("2d");
        fx.translate(size / 2, size / 2);
        fx.rotate(i / GEAR_FRAMES * Math.PI * 2 / GEAR_TEETH);
        fx.scale(scale, scale);
        fx.drawImage(gear, -gear.width / 2, -gear.height / 2);
        frames.push(f);
    }
    return frames;
}

function drawGearFrame(ctx, frames, cx, cy, angle) {
    const step = Math.PI * 2 / GEAR_TEETH;
    const a = ((angle % step) + step) % step;
    const f = frames[Math.floor(a / step * GEAR_FRAMES) % GEAR_FRAMES];
    ctx.drawImage(f, Math.round(cx - f.width / 2), Math.round(cy - f.height / 2));
}

// Орел, що ширяє, зрідка змахуючи крилами
function drawEagle(ctx, x, y, B, time, phase) {
    const flap = Math.sin(time * 2.5 + phase) > 0.6;
    const u = B * 0.45;
    ctx.fillStyle = "#6a4a2a";
    ctx.fillRect(x, y, u * 3, u);
    ctx.fillRect(x + u * 3, y + u * 0.2, u * 1.4, u * 0.6);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - u * 1.2, y - u * 0.3, u * 1.4, u);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(x - u * 1.8, y, u * 0.7, u * 0.4);
    ctx.fillStyle = "#4a3018";
    const dir = flap ? -1 : 0.25;
    for (let k = 1; k <= 4; k++) {
        ctx.fillRect(x + u * 1.5 - k * u * 1.2, y + dir * k * u * 0.8, u * 1.3, u * 0.6);
        ctx.fillRect(x + u * 1.5 + (k - 1) * u * 1.2, y + dir * k * u * 0.8, u * 1.3, u * 0.6);
    }
}

BackgroundRenderer.renderSkyCitadel = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._skyCitadel;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSkyCitadel(W, H, groundY, B);
        this._skyCitadel = st;
    }
    const gY = Math.round(groundY);
    const progress = _fx.progress || 0;
    ctx.drawImage(st.sky, 0, 0);

    // Золоті кільця й шестерня повільно обертаються
    const cx = W * 0.5;
    const cy = gY * 0.3;
    ctx.strokeStyle = "rgba(255, 210, 90, 0.45)";
    ctx.lineWidth = Math.max(2, B / 4);
    for (let k = 0; k < 3; k++) {
        const rr = gY * (0.2 + k * 0.07);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rr, rr * (0.25 + 0.2 * Math.sin(time * 0.3 + k)), time * (0.15 + k * 0.07) * (k % 2 === 0 ? 1 : -1), 0, Math.PI * 2);
        ctx.stroke();
    }
    drawGearFrame(ctx, st.gearBig, W * 0.18, gY * 0.26, time * 0.2);
    drawGearFrame(ctx, st.gearSmall, W * 0.84, gY * 0.2, -time * 0.3);

    // Сходження: з прогресом острови й хмари опускаються — ніби ми злітаємо вгору
    const rise = Math.round(progress * B * 5);
    const factors = [0.08, 0.16, 0.3];
    for (let i = 0; i < st.layers.length; i++) {
        const bob = Math.round(Math.sin(time * 0.8 + i * 1.3) * B * 0.25);
        drawScrollingStrip(ctx, st.layers[i], W, gY - B * (2 - i * 0.5) + rise * (i + 1) * 0.5 + bob, time, speed, factors[i]);
    }

    for (let i = 0; i < 3; i++) {
        const lp = W + B * 10;
        const ex = W + B * 3 - ((time * (B * 2.2 + i * B * 0.6) + i * W * 0.35) % lp);
        const ey = gY * (0.14 + i * 0.1) + Math.sin(time * 0.9 + i * 2) * B;
        drawEagle(ctx, Math.round(ex), Math.round(ey), B, time, i * 2.3);
    }

    drawScrollingStrip(ctx, st.clouds, W, gY + rise, time, speed, 0.45);
};

// ---------- 19. Піратська бухта ----------

function buildPirateBay(W, H, groundY, B) {
    const rng = pixelRng(1920);
    const gY = Math.round(groundY);
    const horizon = Math.round(gY * 0.58);
    const sky = makeSky(W, H, [[0, "#2a1450"], [0.35, "#8a2a6a"], [0.58, "#ff8a4a"], [1, "#0a3a5a"]]);
    const sx = sky.getContext("2d");
    // Сонце, що сідає в море
    const sunR = Math.round(H * 0.09);
    const sunX = Math.round(W * 0.3);
    sx.save();
    sx.beginPath();
    sx.rect(0, 0, W, horizon);
    sx.clip();
    sx.fillStyle = "#ffd36b";
    for (let y = -sunR; y < sunR; y += B / 2) {
        const half = Math.sqrt(Math.max(0, sunR * sunR - y * y));
        sx.fillRect(Math.round(sunX - half), horizon - sunR * 0.3 + y, Math.round(half * 2), B / 2);
    }
    sx.restore();
    // Море
    const sea = sx.createLinearGradient(0, horizon, 0, gY);
    sea.addColorStop(0, "#1f6a9a");
    sea.addColorStop(1, "#0a2f4f");
    sx.fillStyle = sea;
    sx.fillRect(0, horizon, W, gY - horizon);
    // Сонячна доріжка на воді
    sx.fillStyle = "rgba(255, 210, 120, 0.35)";
    for (let y = horizon + 4; y < gY; y += 8) {
        const w = sunR * (0.6 + (y - horizon) / (gY - horizon) * 1.4) * (0.6 + rng() * 0.4);
        sx.fillRect(Math.round(sunX - w / 2), y, Math.round(w), 3);
    }
    // Далекий острів
    sx.fillStyle = "#1a3a2a";
    const islX = Math.round(W * 0.78);
    sx.fillRect(islX - B * 4, horizon - B, B * 8, B);
    sx.fillRect(islX - B * 2, horizon - B * 2, B * 4, B);

    // Пляж з пальмами та скринями в ближній смузі
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const beach = makeCanvas(stripW, B * 7);
    const bx = beach.getContext("2d");
    const top = beach.height - B;
    for (let x = 0; x < stripW; x += B) {
        bx.fillStyle = (x / B) % 2 === 0 ? "#e8c07a" : "#dab06a";
        bx.fillRect(x, top, B, B);
        bx.fillStyle = "#f5d89a";
        bx.fillRect(x, top, B, B / 5);
    }
    for (let x = B * 3; x < stripW - B * 5; x += B * (10 + Math.floor(rng() * 5))) {
        // Пальма з вигнутим стовбуром
        for (let k = 0; k < 5; k++) {
            bx.fillStyle = k % 2 === 0 ? "#8a5a2a" : "#7a4a1e";
            bx.fillRect(x + Math.round(k * k * 0.12) * B / 2, top - (k + 1) * B, B * 0.7, B);
        }
        const cx = x + B;
        const cy = top - B * 5.5;
        bx.fillStyle = "#2f9a3a";
        bx.fillRect(cx - B * 2.5, cy, B * 2.5, B / 2);
        bx.fillRect(cx, cy, B * 2.5, B / 2);
        bx.fillRect(cx - B * 3, cy + B / 2, B, B / 2);
        bx.fillRect(cx + B * 2, cy + B / 2, B, B / 2);
        bx.fillRect(cx - B / 2, cy - B, B * 1.5, B);
        bx.fillStyle = "#6a3a1a";
        bx.fillRect(cx, cy + B / 2, B / 2, B / 2);
        // Скриня біля деяких пальм
        if (rng() < 0.5) {
            bx.fillStyle = "#8a4b1c";
            bx.fillRect(x + B * 3, top - B, B * 1.4, B);
            bx.fillStyle = "#ffcc33";
            bx.fillRect(x + B * 3.55, top - B * 0.7, B * 0.3, B * 0.3);
        }
    }
    return { W: W, H: H, sky: sky, beach: beach, horizon: horizon };
}

// Піратський корабель із вітрилами та прапором (малюється щокадру — гойдається на хвилях)
function drawPirateShip(ctx, x, y, B, time) {
    const bob = Math.round(Math.sin(time * 1.4) * B * 0.25);
    const yy = y + bob;
    // Корпус
    ctx.fillStyle = "#4a2a14";
    ctx.fillRect(x, yy, B * 9, B * 1.5);
    ctx.fillRect(x + B * 0.5, yy + B * 1.5, B * 8, B * 0.6);
    ctx.fillRect(x + B * 7.5, yy - B, B * 2, B);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(x, yy + B * 0.4, B * 9, B / 6);
    ctx.fillStyle = "#1a0e06";
    for (let k = 0; k < 3; k++) {
        ctx.fillRect(x + B * (1.5 + k * 2), yy + B * 0.8, B / 3, B / 3);
    }
    // Щогли та вітрила
    ctx.fillStyle = "#3a2010";
    ctx.fillRect(x + B * 3, yy - B * 6, B / 4, B * 6);
    ctx.fillRect(x + B * 6, yy - B * 5, B / 4, B * 5);
    const puff = Math.round(Math.sin(time * 1.1) * B * 0.15);
    ctx.fillStyle = "#f0e6d0";
    ctx.fillRect(x + B * 1.8, yy - B * 5.5, B * 2.6 + puff, B * 2.2);
    ctx.fillRect(x + B * 1.8, yy - B * 3, B * 2.6 + puff, B * 1.8);
    ctx.fillRect(x + B * 4.9, yy - B * 4.5, B * 2.4 + puff, B * 2);
    // Прапор із черепом
    const wave = Math.round(Math.sin(time * 6) * B * 0.1);
    ctx.fillStyle = "#111111";
    ctx.fillRect(x + B * 3.25, yy - B * 6 + wave, B * 1.4, B * 0.9);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + B * 3.7, yy - B * 5.85 + wave, B * 0.5, B * 0.4);
    ctx.fillRect(x + B * 3.6, yy - B * 5.35 + wave, B * 0.7, B * 0.12);
}

BackgroundRenderer.renderPirateBay = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pirateBay;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPirateBay(W, H, groundY, B);
        this._pirateBay = st;
    }
    const gY = Math.round(groundY);
    const hz = st.horizon;
    ctx.drawImage(st.sky, 0, 0);
    // Хвилі на морі
    ctx.fillStyle = "rgba(200, 235, 255, 0.25)";
    const wo = (time * 25) % (B * 3);
    for (let y = hz + 6, row = 0; y < gY - B; y += B * 0.8, row++) {
        for (let x = -wo + (row % 2) * B * 1.5; x < W; x += B * 3) {
            ctx.fillRect(Math.round(x), Math.round(y), B, 2);
        }
    }
    // Корабель повільно пливе по горизонту
    const span = W + B * 20;
    const shipX = Math.round(W - ((time * 22) % span));
    drawPirateShip(ctx, shipX, hz - B * 0.8, B, time);
    // Чайки
    for (let i = 0; i < 4; i++) {
        const x = Math.round(((i * 413 + time * (35 + i * 8)) % (W + B * 6)) - B * 3);
        const y = Math.round(hz * (0.2 + i * 0.1) + Math.sin(time * 1.3 + i) * B * 0.6);
        const flap = Math.sin(time * 9 + i) > 0;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, B / 3, B / 5);
        ctx.fillRect(x - B / 3, y + (flap ? -B / 5 : B / 8), B / 3, B / 6);
        ctx.fillRect(x + B / 3, y + (flap ? -B / 5 : B / 8), B / 3, B / 6);
    }
    drawScrollingStrip(ctx, st.beach, W, gY, time, speed, 0.3);
};

// ---------- 21. Орбіта: вид на планету з космічної станції ----------

function buildOrbitView(W, H, groundY, B) {
    const rng = pixelRng(2121);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#010104"], [1, "#050818"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, gY, 150, rng, B);
    // Місяць
    sx.fillStyle = "#c8ccd8";
    const mx = Math.round(W * 0.85);
    const my = Math.round(gY * 0.15);
    const mr = B * 1.5;
    for (let y = -mr; y < mr; y += B / 3) {
        const half = Math.sqrt(Math.max(0, mr * mr - y * y));
        sx.fillRect(Math.round(mx - half), my + y, Math.round(half * 2), B / 3);
    }
    sx.fillStyle = "#a0a4b0";
    sx.fillRect(mx - B / 2, my - B / 3, B / 2, B / 2);
    sx.fillRect(mx + B / 3, my + B / 3, B / 3, B / 3);
    // Поверхня планети: континенти та хмари в смузі, що прокручується (планета обертається)
    const texW = Math.ceil(W * 1.6 / B) * B;
    const texH = Math.round(gY * 0.6);
    const tex = makeCanvas(texW, texH);
    const tx = tex.getContext("2d");
    tx.fillStyle = "#1a4a9a";
    tx.fillRect(0, 0, texW, texH);
    const cellW = B;
    const cols = texW / cellW;
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < texH / cellW; r++) {
            const n = Math.sin(c * 0.35) + Math.sin(c * 0.13 + r * 0.4) + Math.sin(r * 0.5 + c * 0.07) * 0.8;
            if (n > 0.9) {
                tx.fillStyle = n > 1.8 ? "#e8e0c0" : n > 1.3 ? "#3f8a3a" : "#5aa84a";
                tx.fillRect(c * cellW, r * cellW, cellW, cellW);
            }
        }
    }
    // Хмари
    tx.fillStyle = "rgba(255, 255, 255, 0.55)";
    for (let i = 0; i < 25; i++) {
        const cx = Math.round(rng() * cols) * cellW;
        const cy = Math.round(rng() * texH / cellW) * cellW;
        const len = 2 + Math.floor(rng() * 5);
        tx.fillRect(cx, cy, len * cellW, cellW / 2);
        tx.fillRect(cx + cellW, cy - cellW / 2, (len - 2) * cellW, cellW / 2);
    }
    return { W: W, H: H, sky: sky, tex: tex, planetR: W * 1.1, planetCx: W * 0.5, planetCy: gY + W * 1.1 - texH * 0.55 };
}

BackgroundRenderer.renderOrbitView = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._orbitView;
    if (!st || st.W !== W || st.H !== H) {
        st = buildOrbitView(W, H, groundY, B);
        this._orbitView = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Атмосфера — світне кільце над краєм планети
    ctx.strokeStyle = "rgba(90, 170, 255, 0.35)";
    ctx.lineWidth = B;
    ctx.beginPath();
    ctx.arc(st.planetCx, st.planetCy, st.planetR + B * 0.6, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    // Планета: поверхня обрізана колом і прокручується
    ctx.save();
    ctx.beginPath();
    ctx.arc(st.planetCx, st.planetCy, st.planetR, 0, Math.PI * 2);
    ctx.clip();
    const texW = st.tex.width;
    const offset = Math.round(time * speed * 0.05) % texW;
    const texTop = gY - st.tex.height;
    for (let x = -offset; x < W; x += texW) {
        ctx.drawImage(st.tex, x, texTop);
    }
    // Нічна тінь з одного боку
    const shade = ctx.createLinearGradient(0, 0, W, 0);
    shade.addColorStop(0, "rgba(0, 0, 20, 0)");
    shade.addColorStop(0.7, "rgba(0, 0, 20, 0.1)");
    shade.addColorStop(1, "rgba(0, 0, 20, 0.6)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, texTop, W, st.tex.height);
    ctx.restore();

    // Космічна станція: модулі, сонячні панелі, вогники
    const stX = Math.round(W * 0.22);
    const stY = Math.round(gY * 0.22 + Math.sin(time * 0.5) * B * 0.3);
    ctx.fillStyle = "#2a4a8a";
    for (const side of [-1, 1]) {
        for (let k = 0; k < 3; k++) {
            ctx.fillRect(stX + side * (B * 2 + k * B * 1.1) - (side < 0 ? B : 0), stY - B * 1.2, B, B * 2.4);
        }
    }
    ctx.fillStyle = "#6a7a9a";
    ctx.fillRect(stX - B * 2, stY - B / 6, B * 4, B / 3);
    ctx.fillStyle = "#e8ecf2";
    ctx.fillRect(stX - B, stY - B / 2, B * 2, B);
    ctx.fillRect(stX - B / 3, stY - B * 1.3, B * 0.66, B * 0.8);
    ctx.fillStyle = "#39c6ff";
    ctx.fillRect(stX - B * 0.6, stY - B / 4, B / 3, B / 3);
    ctx.fillRect(stX + B * 0.3, stY - B / 4, B / 3, B / 3);
    ctx.fillStyle = Math.sin(time * 4) > 0 ? "#ff3355" : "#551122";
    ctx.fillRect(stX - B / 8, stY - B * 1.5, B / 4, B / 4);
    ctx.fillStyle = Math.sin(time * 4 + 2) > 0 ? "#39ff88" : "#114422";
    ctx.fillRect(stX + B * 5.4, stY - B / 8, B / 4, B / 4);
    // Супутники пролітають
    for (let i = 0; i < 2; i++) {
        const period = 9 + i * 4;
        const t = ((time + i * 5) % period) / period;
        const x = Math.round(-B * 3 + t * (W + B * 6));
        const y = Math.round(gY * (0.35 + i * 0.12) - Math.sin(t * Math.PI) * B * 2);
        ctx.fillStyle = "#c8ccd8";
        ctx.fillRect(x, y, B * 0.6, B * 0.6);
        ctx.fillStyle = "#2a4a8a";
        ctx.fillRect(x - B, y + B * 0.1, B * 0.9, B * 0.4);
        ctx.fillRect(x + B * 0.7, y + B * 0.1, B * 0.9, B * 0.4);
        ctx.fillStyle = Math.sin(time * 6 + i) > 0 ? "#ffffff" : "#888888";
        ctx.fillRect(x + B * 0.2, y - B * 0.3, B / 5, B / 5);
    }
};

// ---------- Реакція фону на гру, пасхалки, серпанок і земля в стилі світу ----------

// Стан гри, який передає рушій перед малюванням фону
let _fx = { progress: 0, combo: 0, perfect: 0, eggT: null, weather: "clear", camY: 0, oops: 0 };

// Світи просто неба: до кінця рівня в них настає ніч
const DUSK_THEMES = new Set(["dino_valley", "sunset_city", "pirate_bay", "pixel_desert", "neon_highway", "sky_city", "twin_sun_planet", "stadium"]);

// Пасхалка кожного світу (одна за рівень)
const EASTER_EGG_BY_THEME = {
    sunset_city: "ufo", neon_rooftops: "ufo", neon_highway: "ufo", secret_base: "ufo", cosmodrome: "ufo",
    pixel_ocean: "whale", pirate_bay: "whale", night_harbor: "whale",
    knight_castle: "dragon", dragon_lair: "dragon", pixel_nether: "dragon",
    orbit_view: "meteors", black_hole: "meteors", pixel_islands: "meteors", twin_sun_planet: "meteors", neon_start: "meteors",
    digital_forest: "deer", pixel_night: "deer", pixel_snow: "deer", storm_sky: "deer",
    sea_fabricator: "whale", treasury: "cat",
    crystal_cave: "cat", pixel_cave: "cat", laser_range: "cat",
    dino_valley: "trex", luna_park: "balloons", sky_citadel: "meteors"
};

// Тип землі під шипами
const GROUND_BY_THEME = {
    pixel_night: "grass", digital_forest: "grass", dino_valley: "grass", storm_sky: "grass", stadium: "turf", twin_sun_planet: "alien",
    pixel_snow: "snow",
    pixel_desert: "sand", pirate_bay: "sand", pixel_ocean: "sand",
    pixel_cave: "stone", crystal_cave: "stone", dragon_lair: "stone", knight_castle: "stone", treasury: "stone",
    sky_citadel: "cloud",
    pixel_nether: "lava"
};

BackgroundRenderer.setEffects = function (fx) {
    _fx = fx || { progress: 0, combo: 0, perfect: 0, eggT: null, weather: "clear", camY: 0, oops: 0 };
};

// Ефекти поверх сцени: ніч, що настає, спалах «Ідеально», світіння серії, серпанок біля землі
BackgroundRenderer.renderSceneEffects = function (ctx, bgTheme, W, H, groundY, time, accentColor) {
    const gY = Math.round(groundY);
    if (DUSK_THEMES.has(bgTheme) && _fx.progress > 0.05) {
        const night = Math.min(1, _fx.progress);
        ctx.fillStyle = "rgba(8, 6, 40, " + (0.38 * night).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
        // Зорі проступають на темнішому небі
        const rng = pixelRng(4242);
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 40; i++) {
            const x = rng() * W;
            const y = rng() * gY * 0.45;
            const tw = Math.sin(time * (1 + rng() * 2) + i) * 0.5 + 0.5;
            ctx.globalAlpha = night * (0.3 + 0.6 * tw);
            ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
        }
        ctx.globalAlpha = 1;
    }
    this.renderStory(ctx, bgTheme, W, H, gY, time);
    this.renderWeather(ctx, _fx.weather, W, H, gY, time);
    // Серпанок біля землі додає глибини. Градієнти намальовані заздалегідь у крихітні
    // буфери й лише розтягуються — це в рази дешевше, ніж градієнт на пів екрана щокадру
    const grads = getEffectGradients(accentColor || "#00f6ff");
    const hazeH = Math.round(H * 0.18);
    ctx.drawImage(grads.haze, 0, gY - hazeH, W, hazeH);
    // Серія «Ідеально»: світіння по краях кольором рівня
    if (_fx.combo >= 3) {
        ctx.globalAlpha = Math.min(1, (_fx.combo - 2) * 0.14);
        ctx.drawImage(grads.edges, 0, 0, W, gY);
        ctx.globalAlpha = 1;
    }
    // Спалах «Ідеально»
    if (_fx.perfect > 0) {
        ctx.fillStyle = "rgba(255, 255, 255, " + (0.12 * _fx.perfect).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
    }
    if (_fx.eggT !== null && _fx.eggT >= 0 && _fx.eggT <= 1) {
        this.renderEasterEgg(ctx, EASTER_EGG_BY_THEME[bgTheme] || "comet", _fx.eggT, W, H, gY, time);
    }
};

// Кеш маленьких буферів-градієнтів для кожного кольору рівня
const _effectGradients = {};

function getEffectGradients(accent) {
    if (_effectGradients[accent]) {
        return _effectGradients[accent];
    }
    const haze = makeCanvas(1, 64);
    const hx = haze.getContext("2d");
    const hg = hx.createLinearGradient(0, 0, 0, 64);
    hg.addColorStop(0, "rgba(0, 0, 0, 0)");
    hg.addColorStop(1, hexToRgba(accent, 0.16));
    hx.fillStyle = hg;
    hx.fillRect(0, 0, 1, 64);
    const edges = makeCanvas(64, 1);
    const ex = edges.getContext("2d");
    const eg = ex.createLinearGradient(0, 0, 64, 0);
    eg.addColorStop(0, hexToRgba(accent, 0.22));
    eg.addColorStop(0.15, "rgba(0, 0, 0, 0)");
    eg.addColorStop(0.85, "rgba(0, 0, 0, 0)");
    eg.addColorStop(1, hexToRgba(accent, 0.22));
    ex.fillStyle = eg;
    ex.fillRect(0, 0, 64, 1);
    _effectGradients[accent] = { haze: haze, edges: edges };
    return _effectGradients[accent];
}

function hexToRgba(hex, alpha) {
    const v = hex.replace("#", "");
    const r = parseInt(v.slice(0, 2), 16);
    const g = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}

// ---------- Пасхалки ----------

BackgroundRenderer.renderEasterEgg = function (ctx, type, t, W, H, gY, time) {
    const B = pixelBlockSize(H);
    const fade = Math.min(1, t * 6, (1 - t) * 6);
    ctx.save();
    ctx.globalAlpha = fade;
    if (type === "ufo") {
        const x = W * 1.1 - t * W * 1.3;
        const y = gY * 0.2 + Math.sin(time * 2) * B * 0.5;
        // Промінь
        if (Math.sin(time * 3) > -0.3) {
            ctx.fillStyle = "rgba(150, 255, 180, 0.18)";
            ctx.beginPath();
            ctx.moveTo(x - B * 0.8, y + B * 0.6);
            ctx.lineTo(x + B * 0.8, y + B * 0.6);
            ctx.lineTo(x + B * 2.5, y + B * 6);
            ctx.lineTo(x - B * 2.5, y + B * 6);
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = "#9fb4c8";
        ctx.fillRect(x - B * 2, y, B * 4, B * 0.6);
        ctx.fillRect(x - B * 1.2, y - B * 0.3, B * 2.4, B * 0.3);
        ctx.fillStyle = "#7df9ff";
        ctx.fillRect(x - B * 0.7, y - B * 0.9, B * 1.4, B * 0.6);
        const blink = Math.floor(time * 6) % 3;
        const lights = ["#ff2ea6", "#ffe14d", "#39ff88"];
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = i === blink ? "#ffffff" : lights[i];
            ctx.fillRect(x - B * 1.4 + i * B * 1.2, y + B * 0.15, B * 0.3, B * 0.3);
        }
    } else if (type === "whale") {
        const x = W * 1.1 - t * W * 1.4;
        const y = gY * 0.55;
        ctx.fillStyle = "#2a5a8a";
        ctx.fillRect(x, y, B * 6, B * 2);
        ctx.fillRect(x + B * 0.5, y - B * 0.5, B * 4.5, B * 0.5);
        ctx.fillRect(x + B * 6, y + B * 0.3, B * 1.2, B);
        ctx.fillRect(x + B * 7, y - B * 0.4, B * 0.8, B * 1.8);
        ctx.fillStyle = "#c8dcef";
        ctx.fillRect(x + B * 0.3, y + B * 1.3, B * 4.5, B * 0.7);
        ctx.fillStyle = "#0a1a2a";
        ctx.fillRect(x + B * 1, y + B * 0.5, B * 0.35, B * 0.35);
        // Фонтан
        const spout = Math.max(0, Math.sin(t * Math.PI * 3));
        if (spout > 0.2) {
            ctx.fillStyle = "rgba(220, 245, 255, 0.8)";
            for (let k = 0; k < 4; k++) {
                ctx.fillRect(x + B * 2 + (k - 1.5) * B * 0.5 * spout, y - B * (1 + spout * 2) + Math.abs(k - 1.5) * B * 0.4, B * 0.35, B * 0.35);
            }
            ctx.fillRect(x + B * 2.1, y - B * 1.2 * spout - B * 0.5, B * 0.3, B * spout * 1.2);
        }
    } else if (type === "dragon") {
        const x = -B * 8 + t * (W + B * 16);
        const y = gY * 0.18 + Math.sin(t * Math.PI * 2) * B * 1.5;
        const flap = Math.sin(time * 8) > 0;
        ctx.fillStyle = "#1a3a1a";
        ctx.fillRect(x, y, B * 4, B * 1.2);
        ctx.fillRect(x + B * 4, y - B * 0.4, B * 1.4, B);
        ctx.fillRect(x - B * 2.5, y + B * 0.3, B * 2.5, B * 0.5);
        ctx.fillRect(x + B * 1, y + (flap ? -B * 2 : B * 1.2), B * 2, flap ? B * 2 : B * 1.2);
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(x + B * 4.8, y - B * 0.2, B * 0.3, B * 0.3);
        if (Math.sin(time * 1.5) > 0.6) {
            ctx.fillStyle = "#ff7a00";
            ctx.fillRect(x + B * 5.4, y, B * 2, B * 0.6);
            ctx.fillStyle = "#ffe14d";
            ctx.fillRect(x + B * 5.4, y + B * 0.15, B * 1.2, B * 0.3);
        }
    } else if (type === "meteors") {
        for (let i = 0; i < 7; i++) {
            const local = (t * 3 + i / 7) % 1;
            const sx = W * (0.2 + (i * 0.37) % 0.8) - local * W * 0.35;
            const sy = gY * 0.05 + local * gY * 0.5;
            for (let k = 0; k < 6; k++) {
                ctx.globalAlpha = fade * (1 - k / 6) * (1 - local * 0.5);
                ctx.fillStyle = k === 0 ? "#ffffff" : "#ffcc66";
                ctx.fillRect(Math.round(sx + k * B * 0.45), Math.round(sy - k * B * 0.3), Math.max(2, B / 4), Math.max(2, B / 4));
            }
        }
    } else if (type === "deer") {
        const x = W * 1.05 - t * W * 1.2;
        const leap = Math.abs(Math.sin(t * Math.PI * 6)) * B * 1.2;
        const y = gY - B * 2.2 - leap;
        ctx.fillStyle = "#8a5a2a";
        ctx.fillRect(x, y, B * 2.2, B);
        ctx.fillRect(x - B * 0.3, y - B * 0.9, B * 0.8, B * 1.2);
        ctx.fillStyle = "#c8a070";
        ctx.fillRect(x + B * 1.8, y - B * 0.1, B * 0.4, B * 0.4);
        ctx.fillStyle = "#5a3a1a";
        const legs = Math.sin(time * 14) > 0 ? B * 0.3 : 0;
        ctx.fillRect(x + B * 0.2 + legs, y + B, B * 0.25, B * 1.1);
        ctx.fillRect(x + B * 1.7 - legs, y + B, B * 0.25, B * 1.1);
        ctx.fillRect(x - B * 0.5, y - B * 1.6, B * 0.2, B * 0.8);
        ctx.fillRect(x - B * 0.8, y - B * 1.6, B * 0.6, B * 0.2);
        ctx.fillRect(x + B * 0.1, y - B * 1.5, B * 0.2, B * 0.7);
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(x - B * 0.2, y - B * 0.7, B * 0.2, B * 0.2);
    } else if (type === "cat") {
        const x = W * 1.05 - t * W * 1.2;
        const y = gY - B * 1.1;
        const step = Math.sin(time * 16) > 0;
        ctx.fillStyle = "#ff9a3d";
        ctx.fillRect(x, y, B * 1.6, B * 0.7);
        ctx.fillRect(x - B * 0.6, y - B * 0.5, B * 0.8, B * 0.8);
        ctx.fillRect(x - B * 0.6, y - B * 0.75, B * 0.2, B * 0.25);
        ctx.fillRect(x - B * 0.05, y - B * 0.75, B * 0.2, B * 0.25);
        ctx.fillRect(x + B * 1.6, y - B * 0.5 + (step ? 0 : B * 0.15), B * 0.2, B * 0.7);
        ctx.fillStyle = "#c86a1a";
        ctx.fillRect(x + B * 0.4, y, B * 0.25, B * 0.7);
        ctx.fillRect(x + B * 0.9, y, B * 0.25, B * 0.7);
        ctx.fillStyle = "#ff9a3d";
        ctx.fillRect(x + B * (step ? 0.1 : 0.3), y + B * 0.7, B * 0.2, B * 0.4);
        ctx.fillRect(x + B * (step ? 1.2 : 1.0), y + B * 0.7, B * 0.2, B * 0.4);
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(x - B * 0.45, y - B * 0.3, B * 0.12, B * 0.12);
    } else if (type === "trex") {
        // Тиранозавр пробігає в глибині сцени
        const x = W * 1.05 - t * W * 1.3;
        const bob = Math.abs(Math.sin(time * 9)) * B * 0.3;
        const y = gY - B * 5 - bob;
        const step = Math.sin(time * 9) > 0;
        ctx.fillStyle = "#3a5a2a";
        ctx.fillRect(x, y, B * 3, B * 2.2);
        ctx.fillRect(x - B * 1.6, y - B * 1.4, B * 2.2, B * 1.6);
        ctx.fillRect(x + B * 3, y + B * 0.3, B * 2.5, B * 0.9);
        ctx.fillRect(x + B * 5.5, y + B * 0.7, B * 1.2, B * 0.5);
        ctx.fillRect(x - B * 0.2, y + B * 1.6, B * 0.8, B * 0.3);
        ctx.fillStyle = "#2a4a1f";
        ctx.fillRect(x + B * (step ? 0.4 : 1.2), y + B * 2.2, B * 0.7, B * 2.8 + bob);
        ctx.fillRect(x + B * (step ? 1.6 : 0.6), y + B * 2.2, B * 0.7, B * 2.8 + bob);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - B * 1.4, y - B * 0.1, B * 1.6, B * 0.2);
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(x - B * 0.9, y - B * 1.1, B * 0.3, B * 0.3);
    } else if (type === "balloons") {
        // Зв'язка повітряних кульок відлітає в небо
        const x = W * (0.35 + t * 0.4);
        const y = gY - t * gY * 1.1;
        const colors = ["#ff3355", "#ffe14d", "#39c6ff", "#39ff88", "#ff5ad8"];
        for (let i = 0; i < 5; i++) {
            const bx = x + (i - 2) * B * 0.9 + Math.sin(time * 2 + i) * B * 0.2;
            const by = y - Math.abs(i - 2) * B * -0.4 - B * 2;
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.fillRect(Math.round(bx + B * 0.4), Math.round(by + B * 1.2), 1, Math.round(B * 1.8));
            ctx.fillStyle = colors[i];
            ctx.fillRect(Math.round(bx), Math.round(by), Math.round(B * 0.9), Math.round(B * 1.2));
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.fillRect(Math.round(bx + B * 0.15), Math.round(by + B * 0.15), Math.round(B * 0.2), Math.round(B * 0.3));
        }
    } else {
        // Комета через небо
        const x = W * 1.1 - t * W * 1.3;
        const y = gY * 0.1 + t * gY * 0.25;
        for (let k = 0; k < 14; k++) {
            ctx.globalAlpha = fade * (1 - k / 14);
            ctx.fillStyle = k < 2 ? "#ffffff" : "#9fe8ff";
            const s = Math.max(2, B * (0.5 - k * 0.025));
            ctx.fillRect(Math.round(x + k * B * 0.5), Math.round(y - k * B * 0.12), s, s);
        }
    }
    ctx.restore();
};

// ---------- Земля під шипами в стилі світу ----------

BackgroundRenderer.renderGroundDetail = function (ctx, bgTheme, W, H, groundY, camX, accentColor) {
    const type = GROUND_BY_THEME[bgTheme];
    const gY = Math.round(groundY);
    const B = pixelBlockSize(H);
    const cell = Math.max(6, Math.round(B / 2));
    const offset = Math.round(camX) % (cell * 2);
    if (!type) {
        // Неонові світи: діагональні смуги, як раніше
        const step = 140;
        const off = camX % step;
        ctx.strokeStyle = "rgba(0, 246, 255, 0.12)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = -off; x <= W; x += step) {
            ctx.moveTo(x, gY + 6);
            ctx.lineTo(x - 28, gY + 34);
        }
        ctx.stroke();
        return;
    }
    const palettes = {
        grass: ["#2f7a22", "#44a332", "#4a3019", "#553820"],
        turf: ["#277a32", "#2f8a3a", "#1f5a26", "#ffffff"],
        alien: ["#6a3a8a", "#8a5aaa", "#3a1f4a", "#331a42"],
        snow: ["#f4f8ff", "#ffffff", "#8a94a8", "#7a8498"],
        sand: ["#e8c07a", "#f5d89a", "#c89a55", "#b8884a"],
        stone: ["#4a4a55", "#5a5a68", "#34343d", "#2e2e36"],
        cloud: ["#ffffff", "#f0eefa", "#ffd86a", "#e8c050"],
        lava: ["#7a2020", "#ff6a00", "#4a1010", "#551414"]
    };
    const p = palettes[type];
    // Верхній шар (трава, сніг, пісок…) і нижній шар із текстурою
    for (let x = -offset - cell * 2; x < W + cell * 2; x += cell) {
        const idx = Math.floor((x + Math.round(camX)) / cell);
        ctx.fillStyle = idx % 2 === 0 ? p[0] : p[1];
        ctx.fillRect(x, gY + 2, cell, cell * 0.8);
        ctx.fillStyle = (idx + 1) % 3 === 0 ? p[2] : p[3];
        ctx.fillRect(x, gY + 2 + cell * 0.8, cell, cell * 1.6);
        if (type === "turf" && idx % 6 === 0) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.fillRect(x, gY + 2 + cell * 0.2, cell, 2);
        }
        if (type === "lava" && idx % 5 === 0) {
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(x + cell * 0.3, gY + 2 + cell * 1.2, cell * 0.4, cell * 0.3);
        }
    }
    // Плавний перехід у темряву нижче
    const fade = ctx.createLinearGradient(0, gY + cell, 0, gY + cell * 3);
    fade.addColorStop(0, "rgba(7, 11, 28, 0)");
    fade.addColorStop(1, "rgba(7, 11, 28, 1)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, gY + cell, W, cell * 2);
};

// Великі піксельні цифри 0–9 для табло
const BIG_DIGITS = [
    ["111", "101", "101", "101", "111"], ["010", "110", "010", "010", "111"], ["111", "001", "111", "100", "111"],
    ["111", "001", "111", "001", "111"], ["101", "101", "111", "001", "001"], ["111", "100", "111", "001", "111"],
    ["111", "100", "111", "101", "111"], ["111", "001", "010", "010", "010"], ["111", "101", "111", "101", "111"],
    ["111", "101", "111", "001", "111"]
];

function drawBigDigit(ctx, digit, x, y, px, color) {
    const rows = BIG_DIGITS[digit] || BIG_DIGITS[0];
    ctx.fillStyle = color;
    for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < 3; c++) {
            if (rows[r][c] === "1") {
                ctx.fillRect(Math.round(x + c * px), Math.round(y + r * px), Math.ceil(px), Math.ceil(px));
            }
        }
    }
}

// ---------- Сюжет світів: три фази за прогресом рівня та реакція на помилку ----------
// Кожен світ розповідає маленьку історію: початок → середина → фінал.
// Функції сюжету малюються поверх сцени й отримують:
// p — прогрес рівня (0…1), s1 — друга фаза (0→1 біля 30%), s2 — третя фаза (0→1 біля 63%),
// oops — реакція на помилку гравця (1 одразу після помилки, згасає до 0).

function storyPhase(p, start) {
    return smoothStep((p - start) / 0.08);
}

// Детерміновані координати для «розкиданих» елементів сюжету
function storyPoints(seed, count, W, yMin, yMax) {
    const rng = pixelRng(seed);
    const pts = [];
    for (let i = 0; i < count; i++) {
        pts.push({ x: rng() * W, y: yMin + rng() * (yMax - yMin), k: rng() });
    }
    return pts;
}

// Короткий спалах кольором при помилці
function storyOopsFlash(ctx, W, gY, oops, rgb, strength) {
    if (oops > 0.01) {
        ctx.fillStyle = "rgba(" + rgb + ", " + (strength * oops).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
    }
}

// Райдуга з піксельних дуг
function drawRainbow(ctx, cx, cy, R, B, alpha) {
    const colors = ["#ff3355", "#ff9a3d", "#ffe14d", "#39ff88", "#39c6ff", "#7a5cff"];
    const band = Math.max(3, Math.round(B / 2));
    ctx.globalAlpha = alpha;
    for (let i = 0; i < colors.length; i++) {
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = band;
        ctx.beginPath();
        ctx.arc(cx, cy, R - i * band, Math.PI, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

// Промінь прожектора з точки (x, y) під кутом ang
function drawBeam(ctx, x, y, ang, len, width, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang - width) * len, y + Math.sin(ang - width) * len);
    ctx.lineTo(x + Math.cos(ang + width) * len, y + Math.sin(ang + width) * len);
    ctx.closePath();
    ctx.fill();
}

// Ядро або камінь, що летить дугою від (x1, y1) до (x2, y2); k — 0…1
function drawArcShot(ctx, x1, y1, x2, y2, k, lift, size, color) {
    const x = x1 + (x2 - x1) * k;
    const y = y1 + (y2 - y1) * k - Math.sin(k * Math.PI) * lift;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
    return { x: x, y: y };
}

// Сплеск або пилова хмарка в точці падіння
function drawBurst(ctx, x, y, k, B, color) {
    ctx.globalAlpha = 1 - k;
    ctx.fillStyle = color;
    for (let i = 0; i < 6; i++) {
        const a = Math.PI + (i / 5) * Math.PI;
        ctx.fillRect(Math.round(x + Math.cos(a) * k * B * 2), Math.round(y + Math.sin(a) * k * B * 2.5), Math.max(2, B / 3), Math.max(2, B / 3));
    }
    ctx.globalAlpha = 1;
}

const STORY_BY_THEME = {
    // 1-1: неонові стовпи вмикаються один за одним, у фіналі спалахує горизонт
    neon_start(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const n = Math.floor(p * 14);
        const pts = storyPoints(101, 14, W, 0, 1);
        for (let i = 0; i < n; i++) {
            const h = gY * (0.2 + pts[i].k * 0.3) * (0.8 + 0.2 * Math.sin(time * 3 + i));
            ctx.fillStyle = i % 2 === 0 ? "rgba(0, 246, 255, 0.35)" : "rgba(255, 46, 166, 0.35)";
            ctx.fillRect(Math.round(pts[i].x), Math.round(gY * 0.62 - h), Math.max(3, B / 3), Math.round(h));
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(Math.round(pts[i].x), Math.round(gY * 0.62 - h), Math.max(3, B / 3), Math.max(2, B / 5));
        }
        if (s2 > 0) {
            for (let k = 0; k < 4; k++) {
                ctx.fillStyle = "rgba(0, 246, 255, " + (s2 * (0.22 - k * 0.05) * (0.8 + 0.2 * Math.sin(time * 4))).toFixed(3) + ")";
                ctx.fillRect(0, Math.round(gY * 0.62 - B * (k + 1)), W, B);
            }
        }
        // Помилка: «глюк» — зсунуті неонові смуги
        if (oops > 0.05) {
            const rng = pixelRng(Math.floor(time * 20));
            for (let i = 0; i < 4; i++) {
                ctx.fillStyle = i % 2 === 0 ? "rgba(255, 46, 166, " + (0.5 * oops).toFixed(3) + ")" : "rgba(0, 246, 255, " + (0.5 * oops).toFixed(3) + ")";
                ctx.fillRect(Math.round((rng() - 0.5) * B * 4), Math.round(rng() * gY), W, Math.max(2, Math.round(B / 4)));
            }
        }
    },

    // 1-2: вечір — прожектори над містом — салют
    sunset_city(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            for (let i = 0; i < 2; i++) {
                const ang = -Math.PI / 2 + Math.sin(time * 0.6 + i * 2) * 0.6;
                drawBeam(ctx, W * (0.3 + i * 0.4), gY * 0.75, ang, gY * 0.9, 0.06, "rgba(255, 240, 200, " + (0.12 * s1).toFixed(3) + ")");
            }
        }
        if (s2 > 0) {
            ctx.globalAlpha = s2;
            drawFireworks(ctx, W, gY * 0.7, B, time, true);
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "0, 0, 20", 0.35);
    },

    // 1-3: заправка з парою — зворотний відлік — ракета стартує (сама ракета — у сцені)
    cosmodrome(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const st = this._cosmodrome;
        if (!st) {
            return;
        }
        // Табло відліку: 9 → 0 між 30% і 70%
        if (s1 > 0) {
            const count = Math.max(0, Math.min(9, 9 - Math.floor((p - 0.3) / 0.4 * 10)));
            const bx = Math.round(st.padX - B * 7);
            const by = Math.round(gY * 0.45);
            ctx.globalAlpha = s1;
            ctx.fillStyle = "#0a0f1c";
            ctx.fillRect(bx - B * 0.4, by - B * 0.4, B * 2.6, B * 3.6);
            ctx.strokeStyle = "#39c6ff";
            ctx.lineWidth = 2;
            ctx.strokeRect(bx - B * 0.4, by - B * 0.4, B * 2.6, B * 3.6);
            drawBigDigit(ctx, count, bx, by, B * 0.6, count <= 3 ? "#ff3355" : "#39ff88");
            ctx.globalAlpha = 1;
        }
        // Заправка: пара з-під ракети до запалювання двигунів
        if (p < 0.6) {
            for (let i = 0; i < 4; i++) {
                const k = (time * 0.5 + i / 4) % 1;
                ctx.globalAlpha = (1 - k) * 0.35;
                drawPixelDisc(ctx, st.padX + B + (i % 2 === 0 ? -1 : 1) * k * B * 3, st.gY - B * 2 - k * B * 3, B * (0.5 + k), B / 2, "#e8ecf2");
            }
            ctx.globalAlpha = 1;
        }
        // Тривожна лампа на вежі при помилці
        if (oops > 0.05 && Math.sin(time * 30) > 0) {
            ctx.fillStyle = "#ff3355";
            ctx.fillRect(Math.round(st.padX - B * 1.8), Math.round(gY * 0.2), B, B);
        }
    },

    // 1-4: погоня з мигалками — фінішна арка з вогнів на обрії
    neon_highway(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            const loop = (time * 0.35) % 1;
            const x = W * 1.1 - loop * W * 1.3;
            const y = gY - B * 2.2;
            ctx.globalAlpha = s1;
            ctx.fillStyle = "#1a1a2e";
            ctx.fillRect(Math.round(x), Math.round(y), B * 3, B);
            ctx.fillRect(Math.round(x + B * 0.6), Math.round(y - B * 0.6), B * 1.6, B * 0.6);
            const blue = Math.sin(time * 20) > 0;
            ctx.fillStyle = blue ? "#3a7aff" : "#ff3355";
            ctx.fillRect(Math.round(x + B * 0.8), Math.round(y - B * 0.9), B * 0.6, B * 0.3);
            ctx.fillStyle = blue ? "rgba(58, 122, 255, 0.25)" : "rgba(255, 51, 85, 0.25)";
            ctx.fillRect(Math.round(x - B * 1.5), Math.round(y - B * 2.5), B * 6, B * 3.5);
            ctx.globalAlpha = 1;
        }
        if (s2 > 0) {
            const hz = Math.round(gY * 0.55);
            const aw = B * (2 + s2 * 4);
            const ah = B * (1.5 + s2 * 3);
            const chase = Math.floor(time * 10);
            for (let i = 0; i < 12; i++) {
                const a = Math.PI + (i / 11) * Math.PI;
                ctx.fillStyle = (i + chase) % 3 === 0 ? "#ffffff" : "#ff2ea6";
                ctx.globalAlpha = s2;
                ctx.fillRect(Math.round(W / 2 + Math.cos(a) * aw - 2), Math.round(hz + Math.sin(a) * ah - 2), 5, 5);
            }
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 51, 85", 0.15);
    },

    // 1-5: лазерів більшає — усі промені сходяться в одну точку
    laser_range(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const count = Math.round(2 + s1 * 5);
        const fx = W * 0.5;
        const fy = gY * 0.15;
        ctx.lineWidth = Math.max(2, B / 6);
        for (let i = 0; i < count; i++) {
            const x0 = W * (i + 0.5) / count;
            const sweep = Math.sin(time * (0.8 + i * 0.13) + i) * W * 0.25;
            const tx = x0 + sweep + (fx - x0 - sweep) * s2;
            const ty = gY + (fy - gY) * s2;
            ctx.strokeStyle = i % 2 === 0 ? "rgba(255, 51, 85, 0.55)" : "rgba(57, 255, 136, 0.55)";
            ctx.beginPath();
            ctx.moveTo(x0, 0);
            ctx.lineTo(tx, s2 > 0 ? ty : gY);
            ctx.stroke();
        }
        if (s2 > 0.3) {
            const r = B * (1 + s2 * 1.5) * (0.85 + 0.15 * Math.sin(time * 12));
            drawPixelDisc(ctx, fx, fy, r * 1.8, B / 2, "rgba(255, 255, 255, " + (0.25 * s2).toFixed(3) + ")");
            drawPixelDisc(ctx, fx, fy, r, B / 2, "#ffffff");
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 30, 60", 0.2);
    },

    // 1-6: світляків більшає — сходить повний місяць — пролітає сова
    digital_forest(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        drawFallingPixels(ctx, W, gY * 0.9, time, Math.round(10 + p * 40), 606, {
            color: "#c8ff5a", dir: -1, speedMin: 6, speedMax: 16, sizeMin: 2, sizeMax: 3,
            sway: 1.2, swayAmp: B, alpha: 0.5 + 0.3 * Math.sin(time * 3)
        });
        if (s1 > 0) {
            const my = gY * (0.45 - 0.25 * s1);
            ctx.globalAlpha = s1;
            drawPixelDisc(ctx, W * 0.78, my, B * 3.5, B / 2, "rgba(220, 255, 220, 0.2)");
            drawPixelDisc(ctx, W * 0.78, my, B * 2.4, B / 2, "#f0ffe8");
            ctx.globalAlpha = 1;
        }
        if (s2 > 0) {
            const k = ((time * 0.12) % 1);
            const x = W * 1.1 - k * W * 1.3;
            const y = gY * 0.25 + Math.sin(k * Math.PI * 4) * B;
            const up = Math.sin(time * 5) > 0;
            ctx.globalAlpha = s2;
            ctx.fillStyle = "#5a4a3a";
            ctx.fillRect(Math.round(x), Math.round(y), B * 1.4, B * 1.2);
            ctx.fillRect(Math.round(x - B * 1.2), Math.round(y + (up ? -B * 0.6 : B * 0.3)), B * 1.2, B * 0.4);
            ctx.fillRect(Math.round(x + B * 1.4), Math.round(y + (up ? -B * 0.6 : B * 0.3)), B * 1.2, B * 0.4);
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(Math.round(x + B * 0.2), Math.round(y + B * 0.25), B * 0.3, B * 0.3);
            ctx.fillRect(Math.round(x + B * 0.85), Math.round(y + B * 0.25), B * 0.3, B * 0.3);
            ctx.globalAlpha = 1;
        }
        // Помилка: світлячки спалахують
        storyOopsFlash(ctx, W, gY, oops, "200, 255, 90", 0.12);
    },

    // 1-7: гроза посилюється — стихає, виходить сонце й райдуга (дощ і блискавки згасають у сцені)
    storm_sky(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0 && s2 < 1) {
            drawFallingPixels(ctx, W, gY, time, Math.round(50 * s1 * (1 - s2)), 717, {
                color: "#c8d4ff", dir: 1, speedMin: 600, speedMax: 800, sizeMin: 1, sizeMax: 2,
                sway: 0, swayAmp: 0, alpha: 0.35, stretch: 9
            });
        }
        if (s2 > 0) {
            ctx.fillStyle = "rgba(255, 230, 170, " + (0.18 * s2).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, gY);
            drawRainbow(ctx, W * 0.55, gY * 0.95, gY * 0.6, B, 0.55 * s2);
        }
        // Помилка: гуркіт грому — білий спалах
        storyOopsFlash(ctx, W, gY, oops, "220, 230, 255", 0.3);
    },

    // 1-8: кристали розгоряються — у глибині світиться кристал-серце
    crystal_cave(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const pts = storyPoints(808, 30, W, B * 3, gY * 0.8);
        const n = Math.round(p * 30);
        for (let i = 0; i < n; i++) {
            const tw = Math.sin(time * 3 + i * 1.7) * 0.5 + 0.5;
            ctx.fillStyle = i % 3 === 0 ? "#5cc8ff" : "#d68bff";
            ctx.globalAlpha = 0.4 + 0.6 * tw;
            ctx.fillRect(Math.round(pts[i].x), Math.round(pts[i].y), Math.max(2, B / 4), Math.max(2, B / 4));
        }
        ctx.globalAlpha = 1;
        if (s2 > 0) {
            const cx = W * 0.5;
            const cy = gY * 0.38;
            const pulse = 0.85 + 0.15 * Math.sin(time * 4);
            const size = B * (1 + s2 * 3) * pulse;
            ctx.globalAlpha = 0.25 * s2;
            drawPixelDisc(ctx, cx, cy, size * 2, B / 2, "#b35cff");
            ctx.globalAlpha = s2;
            ctx.fillStyle = "#e6bfff";
            for (let r = -4; r <= 4; r++) {
                const w = (4 - Math.abs(r)) / 4 * size;
                ctx.fillRect(Math.round(cx - w / 2), Math.round(cy + r * size / 4 - size / 8), Math.round(w), Math.round(size / 4));
            }
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(Math.round(cx - size * 0.1), Math.round(cy - size * 0.6), Math.round(size * 0.2), Math.round(size * 0.6));
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "180, 90, 255", 0.2);
    },

    // 1-10: ніч — у темряві світяться очі павуків — світанок проганяє мобів
    pixel_night(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const eyes = storyPoints(1010, 10, W, gY * 0.62, gY * 0.9);
        const n = Math.round(s1 * 10 * (1 - s2));
        for (let i = 0; i < n; i++) {
            if ((time + eyes[i].k * 7) % 4 < 0.2) {
                continue;
            }
            ctx.fillStyle = "#ff2222";
            const ex = Math.round(eyes[i].x);
            const ey = Math.round(eyes[i].y);
            ctx.fillRect(ex, ey, Math.max(2, B / 4), Math.max(2, B / 4));
            ctx.fillRect(ex + B / 2, ey, Math.max(2, B / 4), Math.max(2, B / 4));
        }
        if (s2 > 0) {
            ctx.fillStyle = "rgba(255, 170, 110, " + (0.25 * s2).toFixed(3) + ")";
            ctx.fillRect(0, Math.round(gY * 0.4), W, Math.round(gY * 0.6));
            ctx.fillStyle = "rgba(140, 180, 255, " + (0.2 * s2).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, Math.round(gY * 0.4));
            const sy = gY * (0.55 - 0.3 * s2);
            drawPixelDisc(ctx, W * 0.15, sy, B * 2.5, B / 2, "#ffdd66");
        }
        // Помилка: шипить кріпер — зелений спалах
        storyOopsFlash(ctx, W, gY, oops, "90, 255, 90", 0.18);
    },

    // 1-11: тривога з червоними маяками — з бази злітає ракета
    secret_base(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            const blink = Math.sin(time * 6) * 0.5 + 0.5;
            ctx.fillStyle = "rgba(255, 30, 30, " + (0.12 * s1 * blink).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, gY);
            for (let i = 0; i < 3; i++) {
                const x = W * (0.2 + i * 0.3);
                drawBeam(ctx, x, gY * 0.7, -Math.PI / 2 + Math.sin(time * 3 + i * 2) * 1.1, gY * 0.5, 0.12, "rgba(255, 60, 60, " + (0.18 * s1).toFixed(3) + ")");
                ctx.fillStyle = "#ff3333";
                ctx.fillRect(Math.round(x - B / 3), Math.round(gY * 0.7 - B / 3), Math.round(B * 0.66), Math.round(B * 0.66));
            }
        }
        if (s2 > 0) {
            const k = Math.max(0, (p - 0.7) / 0.3);
            const x = W * 0.62;
            const y = gY * 0.8 - k * k * gY * 1.2;
            ctx.fillStyle = "#e8ecf2";
            ctx.fillRect(Math.round(x), Math.round(y - B * 3), B, B * 3);
            ctx.fillStyle = "#ff3355";
            ctx.fillRect(Math.round(x), Math.round(y - B * 3.6), B, B * 0.6);
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(Math.round(x + B * 0.2), Math.round(y), B * 0.6, B * (1 + Math.sin(time * 30) * 0.3));
            ctx.fillStyle = "rgba(200, 200, 220, 0.3)";
            for (let t = 1; t < 6; t++) {
                ctx.fillRect(Math.round(x - t * B * 0.2), Math.round(y + t * B), B + t * B * 0.4, B);
            }
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 30, 30", 0.25);
    },

    // 1-13: фабрикатори друкують дрібниці — дрони-будівельники збирають підводний апарат — він вмикає вогні й відпливає
    sea_fabricator(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const build = Math.max(0, Math.min(1, (p - 0.3) / 0.5));
        if (build <= 0) {
            storyOopsFlash(ctx, W, gY, oops, "255, 60, 60", 0.2);
            return;
        }
        const launch = Math.max(0, (p - 0.82) / 0.18);
        const cx = W * 0.62;
        const cy = gY * 0.42 - launch * launch * gY * 0.7;
        const u = B * 0.5;
        // Корпус апарата: піксельна мапа 16×9 (1 — білий корпус, 2 — жовті смуги, 3 — скло, 4 — фари)
        const rows = [
            "......3333......",
            "....33333333....",
            "...3333333333...",
            ".11111111111111.",
            "1122222222222211",
            "1111111111111114",
            ".11111111111111.",
            "..1..........1..",
            ".111........111."
        ];
        const colors = { 1: "#e8eef2", 2: "#ffcc33", 3: "rgba(120, 220, 255, 0.75)", 4: "#fff4a0" };
        const shownRows = Math.ceil(rows.length * build);
        const left = cx - 8 * u;
        const top = cy - 4.5 * u;
        // Каркас-силует ще не надрукованої частини
        ctx.fillStyle = "rgba(90, 220, 255, 0.18)";
        ctx.fillRect(Math.round(left), Math.round(top), Math.round(16 * u), Math.round((rows.length - shownRows) * u));
        for (let r = rows.length - shownRows; r < rows.length; r++) {
            for (let k = 0; k < 16; k++) {
                const ch = rows[r][k];
                if (ch === ".") {
                    continue;
                }
                ctx.fillStyle = ch === "4" && launch <= 0 ? "#8a8a70" : colors[ch];
                ctx.fillRect(Math.round(left + k * u), Math.round(top + r * u), Math.ceil(u), Math.ceil(u));
            }
        }
        // Дрони-будівельники з лазерами, поки апарат друкується
        if (build < 1) {
            const lineY = top + (rows.length - shownRows) * u;
            for (let i = 0; i < 3; i++) {
                const a = time * 1.5 + i * Math.PI * 2 / 3;
                const dx = cx + Math.cos(a) * u * 12;
                const dy = top - u * 3 + Math.sin(a * 2) * u * 1.5;
                ctx.fillStyle = "#e8eef2";
                ctx.fillRect(Math.round(dx - u), Math.round(dy - u * 0.5), Math.round(u * 2), Math.round(u));
                ctx.fillStyle = "#ff9a3d";
                ctx.fillRect(Math.round(dx - u * 1.4), Math.round(dy - u * 0.8), Math.round(u * 0.8), Math.round(u * 0.3));
                ctx.fillRect(Math.round(dx + u * 0.6), Math.round(dy - u * 0.8), Math.round(u * 0.8), Math.round(u * 0.3));
                ctx.strokeStyle = "rgba(90, 220, 255, 0.8)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(dx, dy + u * 0.5);
                ctx.lineTo(left + 16 * u * (0.5 + Math.sin(time * 7 + i * 2) * 0.5), lineY);
                ctx.stroke();
            }
            ctx.fillStyle = "rgba(120, 230, 255, 0.9)";
            ctx.fillRect(Math.round(left - 4), Math.round(lineY) - 1, Math.round(16 * u + 8), 2);
        } else {
            // Готовий апарат: фари світять, бульбашки з двигуна
            ctx.fillStyle = "rgba(255, 244, 160, 0.18)";
            ctx.beginPath();
            ctx.moveTo(left + 16 * u, top + 5.5 * u);
            ctx.lineTo(left + 16 * u + W * 0.25, top + 5.5 * u - B * 3);
            ctx.lineTo(left + 16 * u + W * 0.25, top + 5.5 * u + B * 3);
            ctx.closePath();
            ctx.fill();
            for (let k = 0; k < 5; k++) {
                const b = (time * 1.2 + k / 5) % 1;
                ctx.fillStyle = "rgba(220, 245, 255, " + (0.8 * (1 - b)).toFixed(3) + ")";
                ctx.fillRect(Math.round(left - b * B * 3), Math.round(top + 5 * u + Math.sin(k * 3) * u + b * B), 3, 3);
            }
        }
        // Помилка: червона тривожна лампа й спалах
        storyOopsFlash(ctx, W, gY, oops, "255, 60, 60", 0.2);
    },

    // 1-14: сонця сідають, одне закриває затемнення — ніч із кільцями планети
    twin_sun_planet(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            const k = Math.min(1, s1 * (0.6 + 0.4 * (1 - s2)));
            const mx = W * 0.28 + (1 - k) * B * 6;
            drawPixelDisc(ctx, mx, gY * 0.3, B * 2.9, B / 2, "rgba(40, 20, 60, " + (0.9 * s1).toFixed(3) + ")");
        }
        if (s2 > 0) {
            ctx.strokeStyle = "rgba(255, 200, 240, " + (0.35 * s2).toFixed(3) + ")";
            for (let i = 0; i < 3; i++) {
                ctx.lineWidth = Math.max(2, B / 3) - i;
                ctx.beginPath();
                ctx.ellipse(W * 0.5, gY * 0.95, W * (0.8 + i * 0.05), gY * (0.55 + i * 0.03), -0.08, Math.PI * 1.05, Math.PI * 1.95);
                ctx.stroke();
            }
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 120, 200", 0.15);
    },

    // 1-15: дирижаблі — проходимо крізь хмари — золоті повітряні кулі
    sky_city(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const k = (time * 0.05) % 1;
        const ax = W * 1.2 - k * W * 1.5;
        ctx.fillStyle = "#c8ccd8";
        ctx.fillRect(Math.round(ax), Math.round(gY * 0.18), B * 5, B * 1.6);
        ctx.fillRect(Math.round(ax + B * 5), Math.round(gY * 0.18 + B * 0.3), B, B);
        ctx.fillStyle = "#8a4b1c";
        ctx.fillRect(Math.round(ax + B * 1.5), Math.round(gY * 0.18 + B * 1.6), B * 2, B * 0.6);
        const fog = s1 * (1 - s2);
        if (fog > 0) {
            const pts = storyPoints(1515, 8, W, gY * 0.2, gY * 0.7);
            for (let i = 0; i < pts.length; i++) {
                const x = ((pts[i].x - time * B * (2 + pts[i].k * 3)) % (W + B * 12) + W + B * 12) % (W + B * 12) - B * 6;
                ctx.globalAlpha = 0.45 * fog;
                drawPixelDisc(ctx, x, pts[i].y, B * (2 + pts[i].k * 2), B, "#ffffff");
            }
            ctx.globalAlpha = 1;
        }
        if (s2 > 0) {
            const colors = [["#ff3355", "#ffe14d"], ["#39c6ff", "#ffffff"], ["#ff9a3d", "#b35cff"]];
            for (let i = 0; i < 3; i++) {
                const rise = ((time * 0.04 + i * 0.33) % 1);
                const bx = W * (0.2 + i * 0.3);
                const by = gY * 0.9 - rise * gY;
                ctx.globalAlpha = s2;
                drawPixelDisc(ctx, bx, by, B * 1.6, B / 2, colors[i][0]);
                ctx.fillStyle = colors[i][1];
                ctx.fillRect(Math.round(bx - B * 0.3), Math.round(by - B * 1.6), Math.round(B * 0.6), Math.round(B * 3.2));
                ctx.fillStyle = "#8a4b1c";
                ctx.fillRect(Math.round(bx - B * 0.4), Math.round(by + B * 2.2), Math.round(B * 0.8), Math.round(B * 0.6));
            }
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 255, 255", 0.2);
    },

    // 1-16: хвиля на трибунах — спалахи фотокамер і конфеті; помилка — трибуни гудуть
    stadium(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const st = this._stadium;
        if (!st) {
            return;
        }
        const top = st.standTop;
        const h = st.rowH * 8;
        if (s1 > 0) {
            const wx = ((time * W * 0.35) % (W + B * 8)) - B * 4;
            ctx.fillStyle = "rgba(255, 255, 255, " + (0.25 * s1).toFixed(3) + ")";
            ctx.fillRect(Math.round(wx), Math.round(top - B * 0.6), B * 4, Math.round(h));
        }
        if (s2 > 0) {
            const rng = pixelRng(Math.floor(time * 12));
            ctx.fillStyle = "#ffffff";
            for (let i = 0; i < Math.round(8 * s2); i++) {
                ctx.fillRect(Math.round(rng() * W), Math.round(top + rng() * h), B / 2, B / 2);
            }
            drawFallingPixels(ctx, W, gY, time, Math.round(40 * s2), 1616, {
                color: "#ffe14d", dir: 1, speedMin: 40, speedMax: 90, sizeMin: 3, sizeMax: 5,
                sway: 2, swayAmp: B, alpha: 0.8
            });
            drawFallingPixels(ctx, W, gY, time, Math.round(30 * s2), 1617, {
                color: "#39c6ff", dir: 1, speedMin: 40, speedMax: 90, sizeMin: 3, sizeMax: 5,
                sway: 2.3, swayAmp: B, alpha: 0.8
            });
        }
        if (oops > 0.05) {
            ctx.fillStyle = "rgba(0, 0, 0, " + (0.35 * oops).toFixed(3) + ")";
            ctx.fillRect(0, Math.round(top - B), W, Math.round(h + B));
        }
    },

    // 2-1: дрон з прожектором шукає кубик — салют з дахів
    neon_rooftops(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            const dx = W * 0.5 + Math.sin(time * 0.4) * W * 0.35;
            const dy = gY * 0.2 + Math.sin(time * 1.3) * B;
            drawBeam(ctx, dx, dy, Math.PI / 2 + Math.sin(time * 0.9) * 0.4, gY * 0.9, 0.12, "rgba(200, 240, 255, " + (0.14 * s1).toFixed(3) + ")");
            ctx.globalAlpha = s1;
            ctx.fillStyle = "#2a2a3a";
            ctx.fillRect(Math.round(dx - B), Math.round(dy - B * 0.3), B * 2, B * 0.6);
            ctx.fillRect(Math.round(dx - B * 1.6), Math.round(dy - B * 0.6), B * 0.8, B * 0.2);
            ctx.fillRect(Math.round(dx + B * 0.8), Math.round(dy - B * 0.6), B * 0.8, B * 0.2);
            ctx.fillStyle = Math.sin(time * 8) > 0 ? "#ff2ea6" : "#39ff88";
            ctx.fillRect(Math.round(dx - B * 0.15), Math.round(dy - B * 0.15), B * 0.3, B * 0.3);
            ctx.globalAlpha = 1;
        }
        if (s2 > 0) {
            ctx.globalAlpha = s2;
            drawFireworks(ctx, W, gY * 0.65, B, time, true);
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "0, 0, 20", 0.4);
    },

    // 2-2: туман і промінь маяка — у гавань заходить корабель із вогнями
    night_harbor(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const lx = W * 0.08;
        const ly = gY * 0.35;
        ctx.fillStyle = "#e8e0d0";
        ctx.fillRect(Math.round(lx - B * 0.6), Math.round(ly), Math.round(B * 1.2), Math.round(gY * 0.25));
        ctx.fillStyle = "#ff3355";
        ctx.fillRect(Math.round(lx - B * 0.6), Math.round(ly + B * 1.5), Math.round(B * 1.2), B * 0.6);
        ctx.fillStyle = "#ffe9a0";
        ctx.fillRect(Math.round(lx - B * 0.5), Math.round(ly - B * 0.8), B, B * 0.8);
        if (s1 > 0) {
            const ang = Math.sin(time * 0.7) * 0.5 + 0.1;
            drawBeam(ctx, lx, ly - B * 0.4, ang, W * 0.9, 0.05, "rgba(255, 240, 180, " + (0.2 * s1).toFixed(3) + ")");
            ctx.fillStyle = "rgba(180, 200, 230, " + (0.12 * s1 * (1 - s2 * 0.6)).toFixed(3) + ")";
            ctx.fillRect(0, Math.round(gY * 0.45), W, Math.round(gY * 0.55));
        }
        if (s2 > 0) {
            const x = W * 1.05 - s2 * W * 0.45 - Math.max(0, p - 0.7) * W * 0.6;
            const y = gY * 0.58;
            ctx.fillStyle = "#1a2030";
            ctx.fillRect(Math.round(x), Math.round(y - B * 1.5), B * 10, B * 1.5);
            ctx.fillRect(Math.round(x + B * 2), Math.round(y - B * 3.2), B * 5, B * 1.7);
            ctx.fillRect(Math.round(x + B * 5.5), Math.round(y - B * 4.5), B, B * 1.3);
            ctx.fillStyle = "#ffe14d";
            for (let i = 0; i < 6; i++) {
                ctx.fillRect(Math.round(x + B * (2.4 + i * 0.75)), Math.round(y - B * 2.6), Math.round(B * 0.35), Math.round(B * 0.35));
            }
            ctx.fillStyle = Math.sin(time * 4) > 0 ? "#ff3355" : "#39ff88";
            ctx.fillRect(Math.round(x + B * 5.7), Math.round(y - B * 4.9), Math.round(B * 0.5), Math.round(B * 0.4));
        }
        storyOopsFlash(ctx, W, gY, oops, "180, 200, 230", 0.2);
    },

    // 2-3: піратський корабель підходить — гарматна перестрілка з бризками
    pirate_bay(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const hz = Math.round(gY * 0.55);
        if (s1 > 0) {
            const ex = W * 0.04 + (1 - s1) * -B * 12;
            drawPirateShip(ctx, Math.round(ex), hz - B * 0.8, B, time);
            // Постріли з гармат
            const period = 1.8 - s2 * 0.8;
            const k = (time % period) / period;
            const shot = Math.floor(time / period);
            const target = W * (0.3 + pixelRng(shot * 3)() * 0.5);
            if (k < 0.12) {
                ctx.fillStyle = "rgba(255, 220, 120, " + (1 - k / 0.12).toFixed(3) + ")";
                ctx.fillRect(Math.round(ex + B * 6), Math.round(hz - B * 2), B * 1.5, B);
            }
            if (k < 0.7) {
                drawArcShot(ctx, ex + B * 7, hz - B * 1.5, target, hz + B * 0.5, k / 0.7, gY * 0.25, Math.max(4, B / 2), "#1a1a1a");
            } else {
                drawBurst(ctx, target, hz + B * 0.5, (k - 0.7) / 0.3, B, "#e8f6ff");
            }
        }
        storyOopsFlash(ctx, W, gY, oops, "230, 245, 255", 0.2);
    },

    // 2-4: смолоскипи загоряються один за одним — золотий дощ
    treasury(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const n = Math.round(1 + p * 7);
        for (let i = 0; i < 8; i++) {
            const x = W * (0.06 + i * 0.125);
            const y = gY * 0.3;
            ctx.fillStyle = "#5a3a1a";
            ctx.fillRect(Math.round(x - B * 0.2), Math.round(y), Math.round(B * 0.4), B * 1.4);
            if (i < n) {
                const fl = 0.8 + 0.2 * Math.sin(time * 12 + i * 3) - (oops > 0.05 ? 0.5 * oops : 0);
                ctx.globalAlpha = 0.25 * fl;
                drawPixelDisc(ctx, x, y - B * 0.4, B * 1.8, B / 2, "#ffaa33");
                ctx.globalAlpha = 1;
                ctx.fillStyle = "#ff7a00";
                ctx.fillRect(Math.round(x - B * 0.35), Math.round(y - B * 0.9 * fl), Math.round(B * 0.7), Math.round(B * 0.9 * fl));
                ctx.fillStyle = "#ffe14d";
                ctx.fillRect(Math.round(x - B * 0.15), Math.round(y - B * 0.6 * fl), Math.round(B * 0.3), Math.round(B * 0.6 * fl));
            }
        }
        if (s2 > 0) {
            drawFallingPixels(ctx, W, gY, time, Math.round(45 * s2), 2020, {
                color: "#ffcc33", dir: 1, speedMin: 80, speedMax: 160, sizeMin: 3, sizeMax: 5,
                sway: 3, swayAmp: B * 0.3, alpha: 0.9
            });
        }
    },

    // 2-5: на планеті настає ніч із вогнями міст — сонце сходить з-за краю планети
    orbit_view(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const st = this._orbitView;
        if (!st) {
            return;
        }
        const shadowX = W * (1.1 - Math.min(1, p * 1.4) * 1.2);
        if (shadowX < W) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(st.planetCx, st.planetCy, st.planetR, 0, Math.PI * 2);
            ctx.clip();
            ctx.fillStyle = "rgba(0, 5, 20, 0.6)";
            ctx.fillRect(Math.round(shadowX), 0, Math.round(W - shadowX), Math.round(H));
            const lights = storyPoints(2121, 40, W, st.planetCy - st.planetR, gY);
            ctx.fillStyle = "#ffcc55";
            for (const l of lights) {
                if (l.x > shadowX + B && (time * 2 + l.k * 10) % 5 > 0.3) {
                    ctx.fillRect(Math.round(l.x), Math.round(l.y), 2, 2);
                }
            }
            ctx.restore();
        }
        if (s2 > 0) {
            const edgeY = st.planetCy - st.planetR;
            const sx = W * 0.85;
            const glow = s2 * (0.8 + 0.2 * Math.sin(time * 2));
            ctx.globalAlpha = glow * 0.35;
            drawPixelDisc(ctx, sx, edgeY, B * 6, B, "#fff0c0");
            ctx.globalAlpha = glow;
            drawPixelDisc(ctx, sx, edgeY, B * 2, B / 2, "#ffffff");
            ctx.fillStyle = "rgba(255, 250, 220, " + (0.5 * glow).toFixed(3) + ")";
            ctx.fillRect(Math.round(sx - W * 0.25), Math.round(edgeY - 1), Math.round(W * 0.5), 3);
            ctx.fillRect(Math.round(sx - 1), Math.round(edgeY - B * 5), 3, Math.round(B * 10));
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 60, 60", 0.15);
    },

    // 2-6: дракон хропе димом — розплющує очі — пролітає над головою
    dragon_lair(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const st = this._dragonLair;
        if (!st) {
            return;
        }
        // Хропіння: кільця диму з печери
        if (s1 < 1) {
            for (let i = 0; i < 3; i++) {
                const k = (time * 0.3 + i / 3) % 1;
                ctx.globalAlpha = (1 - k) * 0.4 * (1 - s1);
                drawPixelDisc(ctx, st.caveX + Math.sin(k * 6 + i) * B, gY - B * 5 - k * gY * 0.4, B * (0.6 + k * 1.5), B / 2, "#8a7a6a");
            }
            ctx.globalAlpha = 1;
        }
        // Очі розплющуються й палають (і спалахують на помилку)
        const open = Math.max(s1, oops);
        if (open > 0.05) {
            ctx.fillStyle = oops > 0.3 ? "#ffffff" : "#ffea00";
            const eh = B * (0.4 + 0.5 * open);
            ctx.fillRect(Math.round(st.caveX - B * 1.5), Math.round(gY - B * 3.4 - eh / 2), B, Math.round(eh));
            ctx.fillRect(Math.round(st.caveX + B * 0.5), Math.round(gY - B * 3.4 - eh / 2), B, Math.round(eh));
            ctx.fillStyle = "#6a0000";
            ctx.fillRect(Math.round(st.caveX - B * 1.1), Math.round(gY - B * 3.4 - eh / 2), Math.round(B * 0.2), Math.round(eh));
            ctx.fillRect(Math.round(st.caveX + B * 0.9), Math.round(gY - B * 3.4 - eh / 2), Math.round(B * 0.2), Math.round(eh));
        }
        // Проліт дракона над головою
        if (p > 0.66 && p < 0.96) {
            const k = (p - 0.66) / 0.3;
            const x = W * 1.2 - k * W * 1.6;
            const y = gY * 0.15 + Math.sin(k * Math.PI) * gY * 0.1;
            const flap = Math.sin(time * 6) > 0;
            ctx.fillStyle = "#3a1a1a";
            ctx.fillRect(Math.round(x), Math.round(y), B * 8, B * 2);
            ctx.fillRect(Math.round(x - B * 2.4), Math.round(y - B * 0.6), B * 2.6, B * 1.8);
            ctx.fillRect(Math.round(x + B * 8), Math.round(y + B * 0.6), B * 5, B * 0.8);
            if (flap) {
                ctx.fillRect(Math.round(x + B * 2), Math.round(y - B * 5), B * 4, B * 5);
                ctx.fillRect(Math.round(x + B * 1), Math.round(y - B * 6), B * 3, B);
            } else {
                ctx.fillRect(Math.round(x + B * 2), Math.round(y + B * 2), B * 4, B * 3);
            }
            ctx.fillStyle = "#ffcc00";
            ctx.fillRect(Math.round(x - B * 2), Math.round(y - B * 0.2), Math.round(B * 0.5), Math.round(B * 0.4));
            if (Math.sin(time * 2) > 0.3) {
                ctx.fillStyle = "#ff7a00";
                ctx.fillRect(Math.round(x - B * 7), Math.round(y + B * 0.2), B * 4.6, B);
                ctx.fillStyle = "#ffe14d";
                ctx.fillRect(Math.round(x - B * 5), Math.round(y + B * 0.4), B * 2.6, B * 0.5);
            }
        }
    },

    // 2-7: вагонетки з рудою — обвал каміння — світло виходу й діаманти
    pixel_cave(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const k = (time * 0.15) % 1;
        const cx = W * 1.1 - k * W * 1.3;
        const cy = gY * 0.72;
        ctx.fillStyle = "#3a3a44";
        ctx.fillRect(0, Math.round(cy + B * 1.2), W, Math.max(2, B / 5));
        ctx.fillStyle = "#6a4a2a";
        ctx.fillRect(Math.round(cx), Math.round(cy), B * 2.4, B * 1.2);
        ctx.fillStyle = "#33d6d0";
        ctx.fillRect(Math.round(cx + B * 0.3), Math.round(cy - B * 0.4), B * 0.6, B * 0.6);
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(Math.round(cx + B * 1.2), Math.round(cy - B * 0.4), B * 0.6, B * 0.6);
        ctx.fillStyle = "#2a2a2a";
        ctx.fillRect(Math.round(cx + B * 0.3), Math.round(cy + B * 1.1), B * 0.5, B * 0.5);
        ctx.fillRect(Math.round(cx + B * 1.6), Math.round(cy + B * 1.1), B * 0.5, B * 0.5);
        const fall = s1 * (1 - s2);
        if (fall > 0) {
            drawFallingPixels(ctx, W, gY, time, Math.round(25 * fall), 2323, {
                color: "#7a7a88", dir: 1, speedMin: 200, speedMax: 320, sizeMin: Math.round(B / 3), sizeMax: Math.round(B / 2),
                sway: 0, swayAmp: 0, alpha: 0.9
            });
            ctx.fillStyle = "rgba(150, 140, 130, " + (0.12 * fall).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, gY);
        }
        if (s2 > 0) {
            drawBeam(ctx, W * 0.85, 0, Math.PI * 0.62, gY * 1.1, 0.12, "rgba(255, 250, 220, " + (0.22 * s2).toFixed(3) + ")");
            const pts = storyPoints(2324, 10, W, gY * 0.2, gY * 0.85);
            for (let i = 0; i < pts.length; i++) {
                const tw = Math.sin(time * 5 + i * 2) > 0.2;
                ctx.fillStyle = tw ? "#ffffff" : "#5cf6ff";
                ctx.globalAlpha = s2;
                ctx.fillRect(Math.round(pts[i].x), Math.round(pts[i].y), Math.round(B / 2), Math.round(B / 2));
            }
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "150, 140, 130", 0.25);
    },

    // 2-8: облога — катапульти кидають каміння — вогняні стріли
    knight_castle(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            for (let i = 0; i < 2; i++) {
                const period = 2.6 + i * 0.9;
                const k = ((time + i * 1.3) % period) / period;
                const tx = W * (0.25 + i * 0.35);
                const ty = gY * 0.5;
                if (k < 0.75) {
                    drawArcShot(ctx, W * 1.05, gY * 0.6, tx, ty, k / 0.75, gY * 0.4, Math.round(B * 0.7), "#5a5a66");
                } else {
                    drawBurst(ctx, tx, ty, (k - 0.75) / 0.25, B, "#a09a90");
                }
            }
        }
        if (s2 > 0) {
            for (let i = 0; i < 6; i++) {
                const k = ((time * 0.8 + i / 6) % 1);
                const x = W * (1 - k) + i * B;
                const y = gY * 0.15 + k * gY * 0.4 - Math.sin(k * Math.PI) * gY * 0.1;
                ctx.globalAlpha = s2;
                ctx.fillStyle = "#6a4a2a";
                ctx.fillRect(Math.round(x), Math.round(y), B, Math.max(2, B / 6));
                ctx.fillStyle = Math.sin(time * 20 + i) > 0 ? "#ffcc33" : "#ff6a00";
                ctx.fillRect(Math.round(x - B * 0.3), Math.round(y - B * 0.15), Math.round(B * 0.4), Math.round(B * 0.4));
            }
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "160, 150, 140", 0.2);
    },

    // 3-1: ясно — хуртовина — північне сяйво
    pixel_snow(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const storm = s1 * (1 - s2);
        if (storm > 0) {
            drawFallingPixels(ctx, W, gY, time, Math.round(90 * storm), 2525, {
                color: "#ffffff", dir: 1, speedMin: 120, speedMax: 220, sizeMin: 2, sizeMax: 4,
                sway: 2.5, swayAmp: W * 0.1, alpha: 0.85
            });
            ctx.fillStyle = "rgba(230, 240, 255, " + (0.25 * storm).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, gY);
        }
        if (s2 > 0) {
            const colors = ["#39ff88", "#39ffd0", "#b35cff"];
            for (let i = 0; i < 24; i++) {
                const x = W * i / 24;
                const wave = Math.sin(time * 0.8 + i * 0.5) * 0.5 + 0.5;
                ctx.globalAlpha = s2 * (0.15 + 0.25 * wave);
                ctx.fillStyle = colors[i % 3];
                ctx.fillRect(Math.round(x), Math.round(gY * (0.05 + 0.08 * Math.sin(i * 0.7 + time * 0.3))), Math.ceil(W / 24), Math.round(gY * (0.2 + 0.15 * wave)));
            }
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 255, 255", 0.3);
    },

    // 3-2: занурюємося глибше, світяться риби — пропливає величезний левіафан
    pixel_ocean(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        ctx.fillStyle = "rgba(0, 10, 30, " + (0.35 * p).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
        const fish = storyPoints(2626, 24, W, gY * 0.15, gY * 0.85);
        const n = Math.round(s1 * 24);
        for (let i = 0; i < n; i++) {
            const x = ((fish[i].x - time * B * (1 + fish[i].k * 2)) % W + W) % W;
            ctx.fillStyle = i % 2 === 0 ? "#39ffd0" : "#ff5ad8";
            ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time * 3 + i);
            ctx.fillRect(Math.round(x), Math.round(fish[i].y), Math.round(B * 0.6), Math.max(2, Math.round(B / 4)));
        }
        ctx.globalAlpha = 1;
        if (p > 0.64 && p < 0.97) {
            const k = (p - 0.64) / 0.33;
            const headX = W * 1.2 - k * W * 2.4;
            const baseY = gY * 0.3;
            ctx.fillStyle = "rgba(10, 30, 50, 0.85)";
            for (let i = 0; i < 20; i++) {
                const sx = headX + i * B * 2;
                const sy = baseY + Math.sin(time * 1.5 - i * 0.45) * B * 1.5;
                const seg = Math.round(B * (3.2 - i * 0.12));
                ctx.fillRect(Math.round(sx), Math.round(sy - seg / 2), seg, seg);
            }
            ctx.fillStyle = "#ff5040";
            ctx.fillRect(Math.round(headX + B * 0.4), Math.round(baseY + Math.sin(time * 1.5) * B * 1.5 - B * 0.7), Math.round(B * 0.7), Math.round(B * 0.5));
        }
        // Помилка: хмарка бульбашок
        if (oops > 0.05) {
            drawFallingPixels(ctx, W, gY, time, Math.round(30 * oops), 2627, {
                color: "#dff6ff", dir: -1, speedMin: 80, speedMax: 160, sizeMin: 2, sizeMax: 4,
                sway: 2, swayAmp: B, alpha: 0.8 * oops
            });
        }
    },

    // 3-3: марево спеки — піщана буря — оазис із пальмами
    pixel_desert(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        for (let i = 0; i < 5; i++) {
            const y = gY * (0.6 + i * 0.07);
            ctx.fillStyle = "rgba(255, 240, 200, " + (0.08 * (1 - s1)).toFixed(3) + ")";
            ctx.fillRect(Math.round(Math.sin(time * 2 + i) * B), Math.round(y), W, Math.max(2, B / 5));
        }
        if (s2 > 0) {
            const ox = W * 0.8;
            const oy = gY * 0.82;
            ctx.globalAlpha = s2;
            ctx.fillStyle = "#39c6ff";
            ctx.fillRect(Math.round(ox - B * 4), Math.round(oy), B * 8, B * 0.8);
            ctx.fillStyle = "#bff4ff";
            ctx.fillRect(Math.round(ox - B * 3 + Math.sin(time * 2) * B), Math.round(oy + B * 0.2), B * 2, Math.max(2, B / 5));
            for (const dx of [-3.5, 3]) {
                ctx.fillStyle = "#6a4a2a";
                ctx.fillRect(Math.round(ox + dx * B), Math.round(oy - B * 4), Math.round(B * 0.5), B * 4);
                ctx.fillStyle = "#2f8a3a";
                for (let k = -2; k <= 2; k++) {
                    ctx.fillRect(Math.round(ox + dx * B + k * B * 0.8 - B * 0.2), Math.round(oy - B * 4.3 + Math.abs(k) * B * 0.4), B, Math.round(B * 0.4));
                }
            }
            ctx.globalAlpha = 1;
        }
        if (s1 > 0 && s2 < 1) {
            ctx.globalAlpha = s1 * (1 - s2);
            this.renderWeather(ctx, "sandstorm", W, H, gY, time);
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "230, 190, 120", 0.25);
    },

    // 3-4: метеоритний дощ — відкривається портал
    pixel_islands(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            for (let i = 0; i < 6; i++) {
                const k = (time * 0.6 + i / 6) % 1;
                const sx = W * (0.3 + (i * 0.37) % 0.8) - k * W * 0.4;
                const sy = k * gY * 0.7;
                for (let t = 0; t < 5; t++) {
                    ctx.globalAlpha = s1 * (1 - t / 5);
                    ctx.fillStyle = t === 0 ? "#ffffff" : "#d68bff";
                    ctx.fillRect(Math.round(sx + t * B * 0.5), Math.round(sy - t * B * 0.6), Math.max(3, B / 3), Math.max(3, B / 3));
                }
            }
            ctx.globalAlpha = 1;
        }
        if (s2 > 0) {
            const cx = W * 0.55;
            const cy = gY * 0.35;
            const r = B * 4 * s2;
            ctx.globalAlpha = 0.3 * s2;
            drawPixelDisc(ctx, cx, cy, r * 1.2, B / 2, "#b35cff");
            ctx.globalAlpha = 1;
            for (let k = 0; k < 3; k++) {
                ctx.strokeStyle = ["#b35cff", "#5cc8ff", "#ff4fd8"][k];
                ctx.lineWidth = Math.max(2, B / 4);
                ctx.beginPath();
                const rot = time * (2 + k) * (k % 2 === 0 ? 1 : -1);
                ctx.ellipse(cx, cy, r - k * B * 0.6, (r - k * B * 0.6) * 1.3, 0, rot, rot + Math.PI * 1.4);
                ctx.stroke();
            }
        }
        storyOopsFlash(ctx, W, gY, oops, "214, 139, 255", 0.2);
    },

    // Світи з власними фазами у сцені: лише реакція на помилку
    dino_valley(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        storyOopsFlash(ctx, W, gY, oops, "255, 120, 40", 0.18);
    },
    luna_park(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        storyOopsFlash(ctx, W, gY, oops, "0, 0, 20", 0.4);
    },
    sky_citadel(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        storyOopsFlash(ctx, W, gY, oops, "255, 220, 120", 0.22);
    },

    // 4-1: чорна діра росте (у сцені), зорі затягує дедалі швидше — спалах горизонту подій
    black_hole(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const st = this._blackHole;
        if (!st) {
            return;
        }
        const n = Math.round(6 + s1 * 18);
        for (let i = 0; i < n; i++) {
            const t = ((time * (0.2 + s2 * 0.3) + i / n) % 1);
            const ang = i * 2.4 + t * Math.PI * 2;
            const rr = W * 0.6 * (1 - t);
            ctx.globalAlpha = t * 0.9;
            ctx.fillStyle = i % 3 === 0 ? "#ffcc88" : "#bfe9ff";
            ctx.fillRect(Math.round(st.cx + Math.cos(ang) * rr), Math.round(st.cy + Math.sin(ang) * rr * 0.6), Math.max(2, B / 4), Math.max(2, B / 4));
        }
        ctx.globalAlpha = 1;
        if (p > 0.93) {
            ctx.fillStyle = "rgba(255, 255, 255, " + (Math.min(1, (p - 0.93) / 0.07) * 0.5).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, gY);
        }
        storyOopsFlash(ctx, W, gY, oops, "120, 60, 200", 0.2);
    }
};

BackgroundRenderer.renderStory = function (ctx, bgTheme, W, H, gY, time) {
    const story = STORY_BY_THEME[bgTheme];
    if (!story) {
        return;
    }
    const p = _fx.progress || 0;
    const B = pixelBlockSize(H);
    story.call(this, ctx, W, H, gY, time, B, p, storyPhase(p, 0.3), storyPhase(p, 0.63), _fx.oops || 0);
};

// ---------- Назви світів, фініші, погода ----------

const WORLD_NAMES = {
    neon_start: "Неоновий старт", sunset_city: "Місто на заході сонця", cosmodrome: "Космодром",
    neon_highway: "Неонова траса", laser_range: "Лазерний полігон", digital_forest: "Цифровий ліс",
    storm_sky: "Грозове небо", crystal_cave: "Кришталева печера", dino_valley: "Долина динозаврів",
    pixel_night: "Нічні пагорби", secret_base: "Секретна база", luna_park: "Луна-парк уночі",
    sea_fabricator: "Підводна фабрика", twin_sun_planet: "Планета двох сонць", sky_city: "Місто над хмарами",
    stadium: "Футбольний стадіон", neon_rooftops: "Нічне неонове місто", night_harbor: "Нічна гавань",
    pirate_bay: "Піратська бухта", treasury: "Скарбниця", orbit_view: "Орбіта",
    dragon_lair: "Лігво дракона", pixel_cave: "Рудна печера", knight_castle: "Лицарський замок",
    pixel_snow: "Сніжні гори", pixel_ocean: "Інопланетний океан", pixel_desert: "Пустеля",
    pixel_islands: "Парящі острови", black_hole: "Чорна діра", sky_citadel: "Небесна цитадель",
    pixel_nether: "Вогняний світ"
};

BackgroundRenderer.worldName = function (theme) {
    return WORLD_NAMES[theme] || "";
};

// Вид фінішу кожного світу
const FINISH_BY_THEME = {
    pirate_bay: "chest", treasury: "chest", pixel_desert: "chest",
    knight_castle: "gate", sky_citadel: "gate", dragon_lair: "gate", pixel_cave: "gate", crystal_cave: "gate",
    orbit_view: "portal", black_hole: "portal", pixel_islands: "portal", cosmodrome: "portal", twin_sun_planet: "portal",
    stadium: "goal",
    dino_valley: "egg",
    pixel_nether: "demon"
};

// Фініш у стилі світу. open — від 0 (далеко) до 1 (кубик на фініші)
BackgroundRenderer.renderFinishGate = function (ctx, theme, x, gY, open, time) {
    const type = FINISH_BY_THEME[theme] || "flag";
    ctx.save();
    if (type === "chest") {
        // Скриня відчиняється, з неї летять монети
        ctx.fillStyle = "#8a4b1c";
        ctx.fillRect(x - 30, gY - 36, 60, 36);
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(x - 24, gY - 36, 8, 36);
        ctx.fillRect(x + 16, gY - 36, 8, 36);
        const lid = open * 1.9;
        ctx.save();
        ctx.translate(x - 30, gY - 36);
        ctx.rotate(-lid);
        ctx.fillStyle = "#a35d25";
        ctx.fillRect(0, -16, 60, 16);
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(6, -16, 8, 16);
        ctx.fillRect(46, -16, 8, 16);
        ctx.restore();
        ctx.fillStyle = "#ffd84a";
        ctx.fillRect(x - 5, gY - 30, 10, 12);
        if (open > 0.5) {
            const k = (open - 0.5) * 2;
            ctx.fillStyle = "rgba(255, 220, 80, " + (0.35 * k).toFixed(3) + ")";
            ctx.fillRect(x - 40, gY - 110, 80, 76);
            for (let i = 0; i < 8; i++) {
                const a = -Math.PI / 2 + (i - 3.5) * 0.25;
                const r = 30 + k * 60 + (i % 3) * 8;
                ctx.fillStyle = i % 2 === 0 ? "#ffd700" : "#fff2a0";
                ctx.fillRect(x + Math.cos(a) * r - 4, gY - 40 + Math.sin(a) * r - 4, 8, 8);
            }
        }
    } else if (type === "gate") {
        // Замкова брама, решітка піднімається
        ctx.fillStyle = "#555a70";
        ctx.fillRect(x - 46, gY - 130, 20, 130);
        ctx.fillRect(x + 26, gY - 130, 20, 130);
        ctx.fillRect(x - 46, gY - 146, 92, 20);
        for (let k = 0; k < 5; k++) {
            ctx.fillRect(x - 46 + k * 20, gY - 158, 12, 12);
        }
        ctx.fillStyle = "#0c0a10";
        ctx.fillRect(x - 26, gY - 126, 52, 126);
        const lift = open * 110;
        ctx.fillStyle = "#3a3f52";
        for (let k = 0; k < 5; k++) {
            ctx.fillRect(x - 24 + k * 12, gY - 126, 4, 126 - lift);
        }
        for (let k = 0; k < 6; k++) {
            const y = gY - 120 + k * 22 - lift;
            if (y > gY - 126) {
                ctx.fillRect(x - 26, y, 52, 4);
            }
        }
        ctx.fillStyle = "rgba(255, 200, 80, " + (0.25 * open).toFixed(3) + ")";
        ctx.fillRect(x - 26, gY - 126, 52, 126);
    } else if (type === "portal") {
        // Кружляючий портал, що розкривається
        const r = 40 + open * 24;
        for (let k = 0; k < 4; k++) {
            ctx.strokeStyle = ["#b35cff", "#5cc8ff", "#ff4fd8", "#ffffff"][k];
            ctx.lineWidth = 4;
            ctx.beginPath();
            const rot = time * (2 + k * 0.7) * (k % 2 === 0 ? 1 : -1);
            ctx.ellipse(x, gY - 70, r - k * 6, (r - k * 6) * 1.6, 0, rot, rot + Math.PI * 1.3);
            ctx.stroke();
        }
        ctx.fillStyle = "rgba(180, 120, 255, " + (0.2 + 0.4 * open).toFixed(3) + ")";
        ctx.beginPath();
        ctx.ellipse(x, gY - 70, r * 0.6, r * 1.0, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === "goal") {
        // Ворота: м'яч залітає в сітку, коли кубик фінішує
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - 6, gY - 110, 6, 110);
        ctx.fillRect(x - 6, gY - 110, 70, 6);
        ctx.fillRect(x + 60, gY - 110, 6, 110);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = 1; k < 6; k++) {
            ctx.moveTo(x + k * 11, gY - 104);
            ctx.lineTo(x + k * 11, gY);
            ctx.moveTo(x, gY - 104 + k * 18);
            ctx.lineTo(x + 60, gY - 104 + k * 18);
        }
        ctx.stroke();
        if (open > 0.3) {
            const k = (open - 0.3) / 0.7;
            const bx = x - 120 + k * 150;
            const by = gY - 20 - Math.sin(k * Math.PI) * 70;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(bx - 9, by - 9, 18, 18);
            ctx.fillStyle = "#111111";
            ctx.fillRect(bx - 3, by - 3, 6, 6);
            if (k > 0.9) {
                ctx.fillStyle = "#ffe14d";
                ctx.font = "bold 28px 'Segoe UI', Arial, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("ГОЛ!", x + 30, gY - 130);
            }
        }
    } else if (type === "demon") {
        // Голова демона розсипається на пікселі
        const pieces = 6;
        const blast = Math.max(0, open - 0.5) * 2;
        for (let i = 0; i < pieces; i++) {
            for (let j = 0; j < pieces; j++) {
                const px = x - 48 + i * 16;
                const py = gY - 150 + j * 16;
                const dx = (i - 2.5) * blast * 30;
                const dy = (j - 2.5) * blast * 30 - blast * 20;
                const isEye = j === 2 && (i === 1 || i === 4);
                const isMouth = j === 4 && i > 0 && i < 5;
                ctx.fillStyle = isEye ? "#ffea00" : isMouth ? "#4a0000" : (i + j) % 2 === 0 ? "#3a0d0a" : "#2a0805";
                ctx.globalAlpha = 1 - blast;
                ctx.fillRect(px + dx, py + dy, 16, 16);
            }
        }
        ctx.globalAlpha = 1 - blast;
        ctx.fillStyle = "#ff6a00";
        ctx.beginPath();
        ctx.moveTo(x - 48, gY - 150);
        ctx.lineTo(x - 60, gY - 190);
        ctx.lineTo(x - 30, gY - 150);
        ctx.moveTo(x + 48, gY - 150);
        ctx.lineTo(x + 60, gY - 190);
        ctx.lineTo(x + 30, gY - 150);
        ctx.fill();
        ctx.globalAlpha = 1;
    } else if (type === "egg") {
        // Велике яйце динозавра тріскає, і з нього визирає динозаврик
        const crack = Math.min(1, open * 1.4);
        const shake = open > 0.4 && open < 0.95 ? Math.sin(time * 40) * 2 : 0;
        const hatched = open > 0.85;
        ctx.translate(shake, 0);
        ctx.fillStyle = "#f4ecd8";
        const rows = [[-16, 16, 0], [-24, 24, 12], [-28, 28, 24], [-30, 30, 36], [-30, 30, 48], [-28, 28, 60], [-22, 22, 72]];
        for (const r of rows) {
            if (hatched && r[2] < 30) {
                continue;
            }
            ctx.fillRect(x + r[0], gY - 84 + r[2], r[1] - r[0], 12);
        }
        ctx.fillStyle = "#7ab85a";
        ctx.fillRect(x - 18, gY - 60, 8, 8);
        ctx.fillRect(x + 10, gY - 40, 10, 10);
        ctx.fillRect(x - 8, gY - 24, 8, 8);
        if (crack > 0.1) {
            ctx.fillStyle = "#5a4a3a";
            const n = Math.round(crack * 7);
            for (let k = 0; k < n; k++) {
                ctx.fillRect(x - 24 + k * 7, gY - 58 + (k % 2 === 0 ? 0 : 5), 7, 3);
            }
        }
        if (hatched) {
            const up = Math.min(1, (open - 0.85) / 0.15);
            // Верхня половинка шкаралупи злітає
            ctx.fillStyle = "#f4ecd8";
            ctx.fillRect(x - 24 + up * 30, gY - 96 - up * 40, 48, 30);
            ctx.fillStyle = "#6ab84a";
            ctx.fillRect(x - 12, gY - 58 - up * 22, 24, 22);
            ctx.fillRect(x + 6, gY - 66 - up * 22, 16, 12);
            ctx.fillStyle = "#111111";
            ctx.fillRect(x + 12, gY - 62 - up * 22, 4, 4);
        }
    } else {
        // Картатий фінішний прапор, що майорить
        ctx.fillStyle = "#39ff88";
        ctx.fillRect(x - 3, gY - 170, 6, 170);
        const cell = 10;
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 6; c++) {
                const wave = Math.sin(time * 6 + c * 0.7) * 4;
                ctx.fillStyle = (r + c) % 2 === 0 ? "#ffffff" : "#111111";
                ctx.fillRect(x + 3 + c * cell, gY - 168 + r * cell + wave, cell, cell);
            }
        }
        ctx.fillStyle = "rgba(57, 255, 136, " + (0.15 + 0.35 * open).toFixed(3) + ")";
        ctx.fillRect(x - 20, gY - 170, 40, 170);
    }
    ctx.restore();
};

// ---------- Погода, яка змінюється від спроби до спроби ----------

// Світи просто неба, де може бути дощ, туман або сніг
const WEATHER_THEMES = new Set([
    "neon_start", "sunset_city", "neon_highway", "digital_forest", "pixel_night", "secret_base",
    "sky_city", "stadium", "night_harbor", "dino_valley", "luna_park", "pirate_bay", "knight_castle", "pixel_snow",
    "pixel_desert", "twin_sun_planet", "cosmodrome"
]);

// Вибір погоди для спроби (рушій викликає під час скидання рівня)
BackgroundRenderer.pickWeather = function (theme) {
    if (!WEATHER_THEMES.has(theme)) {
        return "clear";
    }
    const roll = Math.random();
    if (theme === "pixel_snow") {
        return roll < 0.35 ? "fog" : "clear";
    }
    if (theme === "pixel_desert") {
        return roll < 0.35 ? "sandstorm" : "clear";
    }
    if (roll < 0.5) {
        return "clear";
    }
    if (roll < 0.7) {
        return "rain";
    }
    if (roll < 0.85) {
        return "fog";
    }
    return "snow";
};

const _fogCache = {};

function getFogBand(color) {
    if (_fogCache[color]) {
        return _fogCache[color];
    }
    const c = makeCanvas(1, 64);
    const cx = c.getContext("2d");
    const g = cx.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, "rgba(" + color + ", 0)");
    g.addColorStop(0.6, "rgba(" + color + ", 0.35)");
    g.addColorStop(1, "rgba(" + color + ", 0.5)");
    cx.fillStyle = g;
    cx.fillRect(0, 0, 1, 64);
    _fogCache[color] = c;
    return c;
}

BackgroundRenderer.renderWeather = function (ctx, weather, W, H, gY, time) {
    if (!weather || weather === "clear") {
        return;
    }
    const B = pixelBlockSize(H);
    if (weather === "rain") {
        drawFallingPixels(ctx, W, gY, time, 90, 9001, {
            color: "#a8c4ff", dir: 1, speedMin: 500, speedMax: 700, sizeMin: 1, sizeMax: 2,
            sway: 0, swayAmp: 0, alpha: 0.45, stretch: 9
        });
        ctx.fillStyle = "rgba(20, 30, 60, 0.18)";
        ctx.fillRect(0, 0, W, gY);
    } else if (weather === "snow") {
        drawFallingPixels(ctx, W, gY, time, 80, 9002, {
            color: "#ffffff", dir: 1, speedMin: 25, speedMax: 60, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
            sway: 1.3, swayAmp: B * 0.6, alpha: 0.85
        });
    } else if (weather === "fog" || weather === "sandstorm") {
        const color = weather === "fog" ? "200, 210, 230" : "230, 190, 120";
        const band = getFogBand(color);
        const drift = Math.sin(time * 0.3) * 0.05;
        ctx.drawImage(band, 0, gY * (0.25 + drift), W, gY * (0.75 - drift));
        if (weather === "sandstorm") {
            drawFallingPixels(ctx, W, gY, time, 60, 9003, {
                color: "#ffe0a0", dir: 1, speedMin: 5, speedMax: 12, sizeMin: 2, sizeMax: 3,
                sway: 1.5, swayAmp: W * 0.5, alpha: 0.6
            });
        }
    }
};

export { BackgroundRenderer };


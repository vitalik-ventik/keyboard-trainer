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
    retro_arcade: "renderRetroArcade",
    pixel_night: "renderPixelNight",
    secret_base: "renderSecretBase",
    metro_tunnel: "renderMetroTunnel",
    robot_factory: "renderRobotFactory",
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
    throne_room: "renderThroneRoom",
    pixel_nether: "renderPixelNether"
};

// Поля з буферами сцен, які залежать від розміру екрана й будуються заново після init()
const SCENE_CACHE_KEYS = [
    "_neonStart", "_sunsetCity", "_cosmodrome", "_neonHighway", "_laserRange", "_digitalForest",
    "_stormSky", "_crystalCave", "_retroArcade", "_pixelNight", "_secretBase", "_metroTunnel",
    "_robotFactory", "_twinSun", "_skyCity", "_stadium", "_neonRooftops", "_nightHarbor",
    "_pirateBay", "_treasury", "_orbitView", "_dragonLair", "_pixelCave", "_knightCastle",
    "_pixelSnow", "_pixelOcean", "_pixelDesert", "_pixelIslands", "_blackHole", "_throneRoom",
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

    // Лавопади: стовпчики, що стікають зі стелі
    const falls = [];
    for (let c = 4; c < cols - 2; c += 9 + Math.floor(rng() * 6)) {
        falls.push({ x: c * B, top: ceilH[c] * B });
    }
    return { W: W, H: H, sky: sky, ceil: ceil, near: near, falls: falls };
}

BackgroundRenderer.renderPixelNether = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelNether;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelNether(W, H, groundY, B);
        this._pixelNether = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);

    // Лавові колони-еквалайзери в глибині пульсують у такт (120 ударів на хвилину)
    const beat = Math.pow(Math.max(0, Math.sin(time * Math.PI * 2)), 4);
    const barCount = 18;
    const barW = Math.round(W / barCount);
    for (let i = 0; i < barCount; i++) {
        const level = 0.25 + 0.35 * (Math.sin(time * 1.7 + i * 0.9) * 0.5 + 0.5) + 0.3 * beat * (i % 3 === 0 ? 1 : 0.6);
        const blocks = Math.round(level * gY * 0.55 / B);
        for (let b = 0; b < blocks; b++) {
            ctx.fillStyle = b === blocks - 1 ? "rgba(255, 200, 60, 0.35)" : "rgba(255, 70, 0, " + (0.1 + b * 0.012).toFixed(3) + ")";
            ctx.fillRect(i * barW + 2, gY - (b + 1) * B, barW - 4, B - 2);
        }
    }

    // Стеля та лавопади зсуваються разом
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
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.35);

    // Лавове світіння біля землі та попіл
    // Лава «підіймається» з прогресом рівня боса
    const lavaH = B * 2 * (1 + _fx.progress * 2.5);
    ctx.globalAlpha = 0.25 + 0.15 * beat;
    ctx.fillStyle = "#ff4400";
    ctx.fillRect(0, gY - lavaH, W, lavaH);
    ctx.globalAlpha = 1;
    drawFallingPixels(ctx, W, gY, time, 40, 313, {
        color: "#ffae42", dir: -1, speedMin: 20, speedMax: 60, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
        sway: 1.8, swayAmp: B * 0.6, alpha: 0.75
    });
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
    // Ракета: стоїть кілька секунд, потім злітає з вогняним слідом
    const period = 14;
    const t = time % period;
    const launchAt = 5;
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

function buildLaserRange(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#05060d"], [1, "#101528"]]);
    const sx = sky.getContext("2d");
    // Панелі стін
    for (let x = 0; x < W; x += B * 3) {
        sx.fillStyle = (x / (B * 3)) % 2 === 0 ? "#0c1022" : "#0e1328";
        sx.fillRect(x, 0, B * 3, gY);
        sx.fillStyle = "#1a2140";
        sx.fillRect(x, 0, 2, gY);
    }
    // Мішені на стійках у смузі
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const strip = makeCanvas(stripW, B * 6);
    const tx = strip.getContext("2d");
    for (let x = B * 3; x < stripW - B * 3; x += B * 9) {
        tx.fillStyle = "#39415e";
        tx.fillRect(x + B * 1.25, B * 3, B / 2, B * 3);
        const rings = ["#ff3333", "#ffffff", "#ff3333", "#ffffff", "#ffcc00"];
        for (let r = 0; r < rings.length; r++) {
            const s = B * 3 - r * B * 0.6;
            tx.fillStyle = rings[r];
            tx.fillRect(x + (B * 3 - s) / 2, (B * 3 - s) / 2, s, s);
        }
    }
    return { W: W, H: H, sky: sky, targets: strip };
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
    drawScrollingStrip(ctx, st.targets, W, gY, time, speed, 0.3);
    // Сканувальні лазери зі стелі
    const emitters = 5;
    for (let i = 0; i < emitters; i++) {
        const ex = W * (i + 0.5) / emitters;
        const angle = Math.sin(time * (0.7 + i * 0.13) + i * 1.3) * 0.6;
        const endX = ex + Math.tan(angle) * gY;
        const color = i % 2 === 0 ? "255, 40, 60" : "40, 255, 140";
        ctx.strokeStyle = "rgba(" + color + ", 0.15)";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(ex, 0);
        ctx.lineTo(endX, gY);
        ctx.stroke();
        ctx.strokeStyle = "rgba(" + color + ", 0.85)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#39415e";
        ctx.fillRect(ex - B / 2, 0, B, B / 2);
        ctx.fillStyle = "rgba(" + color + ", 0.6)";
        ctx.fillRect(endX - B / 2, gY - B / 4, B, B / 4);
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
    return { W: W, H: H, sky: sky, far: far, near: near };
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
    const phase = time % period;
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
    drawFallingPixels(ctx, W, gY, time, 70, 707, {
        color: "#9fb4ff", dir: 1, speedMin: 450, speedMax: 650, sizeMin: 1, sizeMax: 2,
        sway: 0, swayAmp: 0, alpha: 0.4, stretch: 7
    });
};

// ---------- 8. Кришталева печера ----------

function buildCrystalCave(W, H, groundY, B) {
    const rng = pixelRng(808);
    const gY = Math.round(groundY);
    const cols = Math.ceil(W * 1.3 / B);
    const rows = Math.ceil(gY / B) + 1;
    const p = B / 4;
    const wall = makeCanvas(cols * B, rows * B);
    const wx = wall.getContext("2d");
    const shades = ["#1d1430", "#221838", "#1a1129"];
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            wx.fillStyle = shades[Math.floor(rng() * shades.length)];
            wx.fillRect(c * B, r * B, B, B);
            wx.fillStyle = "#140d22";
            wx.fillRect(c * B + Math.floor(rng() * 4) * p, r * B + Math.floor(rng() * 4) * p, p, p);
        }
    }
    // Сталактити
    wx.fillStyle = "#0e0918";
    for (let c = 0; c < cols; c++) {
        const len = 1 + Math.floor((Math.sin(c * 1.3) + 1) * 1.6);
        wx.fillRect(c * B, 0, B, len * B);
    }
    // Кластери кристалів
    const crystals = [];
    const palette = [["#b35cff", "#e6bfff"], ["#ff4fd8", "#ffc0f0"], ["#5cc8ff", "#c8f0ff"]];
    for (let c = 2; c < cols - 2; c += 4 + Math.floor(rng() * 4)) {
        const onFloor = rng() < 0.6;
        const colr = palette[Math.floor(rng() * palette.length)];
        const baseY = onFloor ? rows * B - B : B * (2 + Math.floor(rng() * 2));
        const count = 2 + Math.floor(rng() * 2);
        for (let k = 0; k < count; k++) {
            const h = (1 + Math.floor(rng() * 3)) * B;
            const x = c * B + k * B * 0.7;
            wx.fillStyle = colr[0];
            if (onFloor) {
                wx.fillRect(x, baseY - h + B, B * 0.6, h);
                wx.fillStyle = colr[1];
                wx.fillRect(x, baseY - h + B, B * 0.2, h);
            } else {
                wx.fillRect(x, baseY, B * 0.6, h);
                wx.fillStyle = colr[1];
                wx.fillRect(x, baseY, B * 0.2, h);
            }
        }
        crystals.push({ x: c * B + B, y: onFloor ? baseY - B : baseY + B, color: colr[0], phase: rng() * 6 });
    }
    return { W: W, H: H, wall: wall, crystals: crystals };
}

BackgroundRenderer.renderCrystalCave = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._crystalCave;
    if (!st || st.W !== W || st.H !== H) {
        st = buildCrystalCave(W, H, groundY, B);
        this._crystalCave = st;
    }
    ctx.fillStyle = "#07040d";
    ctx.fillRect(0, 0, W, H);
    const wallW = st.wall.width;
    const offset = Math.round(time * speed * 0.2) % wallW;
    const wallY = Math.round(groundY) - st.wall.height;
    for (let x = -offset; x < W; x += wallW) {
        ctx.drawImage(st.wall, x, wallY);
        for (const c of st.crystals) {
            const cx = x + c.x;
            if (cx < -B * 3 || cx > W + B * 3) {
                continue;
            }
            const pulse = Math.sin(time * 1.8 + c.phase) * 0.5 + 0.5;
            ctx.globalAlpha = 0.08 + 0.14 * pulse;
            ctx.fillStyle = c.color;
            ctx.fillRect(cx - B * 2, wallY + c.y - B * 2, B * 4, B * 4);
            ctx.globalAlpha = 0.1 + 0.1 * pulse;
            ctx.fillRect(cx - B, wallY + c.y - B, B * 2, B * 2);
        }
    }
    ctx.globalAlpha = 1;
    drawFallingPixels(ctx, W, Math.round(groundY), time, 25, 808, {
        color: "#e6bfff", dir: -1, speedMin: 8, speedMax: 20, sizeMin: 2, sizeMax: 3,
        sway: 1, swayAmp: B, alpha: 0.6
    });
};

// ---------- 9. Ретро-аркада ----------

function buildRetroArcade(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0a0418"], [1, "#1a0a30"]]);
    const sx = sky.getContext("2d");
    // Неонові смуги на стелі
    sx.fillStyle = "rgba(255, 46, 166, 0.5)";
    sx.fillRect(0, B, W, B / 4);
    sx.fillStyle = "rgba(0, 246, 255, 0.4)";
    sx.fillRect(0, B * 1.6, W, B / 4);
    // Автомати в смузі
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const cabH = B * 8;
    const strip = makeCanvas(stripW, cabH);
    const cx = strip.getContext("2d");
    const screens = [];
    const bodyColors = ["#3a1a6a", "#1a3a6a", "#6a1a3a"];
    let i = 0;
    for (let x = B; x < stripW - B * 5; x += B * 6) {
        const body = bodyColors[i % bodyColors.length];
        cx.fillStyle = body;
        cx.fillRect(x, 0, B * 4, cabH);
        cx.fillStyle = "#0a0a14";
        cx.fillRect(x + B * 0.5, B * 1.5, B * 3, B * 2.5);
        cx.fillStyle = "#ffe14d";
        cx.fillRect(x + B * 0.5, B * 0.4, B * 3, B * 0.7);
        // Пульт з кнопками
        cx.fillStyle = "#222";
        cx.fillRect(x + B * 0.3, B * 4.5, B * 3.4, B);
        cx.fillStyle = "#ff3355";
        cx.fillRect(x + B * 2.2, B * 4.7, B * 0.5, B * 0.5);
        cx.fillStyle = "#39ff88";
        cx.fillRect(x + B * 2.9, B * 4.7, B * 0.5, B * 0.5);
        cx.fillStyle = "#cccccc";
        cx.fillRect(x + B * 0.9, B * 4.4, B * 0.25, B * 0.6);
        screens.push({ x: x + B * 0.5, y: B * 1.5, w: B * 3, h: B * 2.5, kind: i % 3 });
        i++;
    }
    return { W: W, H: H, sky: sky, strip: strip, screens: screens };
}

BackgroundRenderer.renderRetroArcade = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._retroArcade;
    if (!st || st.W !== W || st.H !== H) {
        st = buildRetroArcade(W, H, groundY, B);
        this._retroArcade = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const stripW = st.strip.width;
    const offset = Math.round(time * speed * 0.3) % stripW;
    const top = gY - st.strip.height;
    for (let x = -offset; x < W; x += stripW) {
        ctx.drawImage(st.strip, x, top);
        // Анімовані екрани автоматів
        for (const s of st.screens) {
            const sx = x + s.x;
            if (sx < -s.w || sx > W) {
                continue;
            }
            const sy = top + s.y;
            const px = B / 4;
            if (s.kind === 0) {
                // «Тенісна» гра: м'ячик між двома ракетками
                const bx = sx + px + ((Math.sin(time * 3) + 1) / 2) * (s.w - px * 3);
                const by = sy + px + ((Math.sin(time * 4.3) + 1) / 2) * (s.h - px * 3);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(sx + px * 0.5, by - px, px * 0.5, px * 3);
                ctx.fillRect(sx + s.w - px, by - px, px * 0.5, px * 3);
                ctx.fillRect(bx, by, px, px);
            } else if (s.kind === 1) {
                // Кольорові смуги, що пробігають
                const shift = Math.floor(time * 6) % 4;
                const colors = ["#ff2ea6", "#00f6ff", "#ffe14d", "#39ff88"];
                for (let r = 0; r < 4; r++) {
                    ctx.fillStyle = colors[(r + shift) % 4];
                    ctx.fillRect(sx, sy + r * s.h / 4, s.w, s.h / 4);
                }
            } else {
                // Піксельний кубик, що стрибає через шип
                const jump = Math.abs(Math.sin(time * 3)) * s.h * 0.4;
                ctx.fillStyle = "#0a0a14";
                ctx.fillRect(sx, sy, s.w, s.h);
                ctx.fillStyle = "#00f6ff";
                ctx.fillRect(sx + s.w * 0.3, sy + s.h * 0.7 - jump, px * 2, px * 2);
                ctx.fillStyle = "#ff2ea6";
                ctx.fillRect(sx + s.w * 0.65, sy + s.h * 0.78, px * 1.5, px * 1.5);
                ctx.fillStyle = "#39ff88";
                ctx.fillRect(sx, sy + s.h * 0.78 + px * 1.5, s.w, px * 0.5);
            }
        }
    }
    // Мерехтливі лампи на стелі
    ctx.globalAlpha = 0.5 + 0.5 * (Math.sin(time * 5) > 0 ? 1 : 0.4);
    ctx.fillStyle = "#ff2ea6";
    ctx.fillRect(0, B, W, B / 4);
    ctx.globalAlpha = 1;
};

// ---------- 11. Секретна база ----------

function buildSecretBase(W, H, groundY, B) {
    const rng = pixelRng(1111);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#02050c"], [1, "#0a1a1a"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, gY * 0.6, 60, rng, B);
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const strip = makeCanvas(stripW, B * 10);
    const bx = strip.getContext("2d");
    const dishes = [];
    const towers = [];
    // Паркан
    bx.fillStyle = "#1a2a2a";
    bx.fillRect(0, B * 8, stripW, B / 6);
    for (let x = 0; x < stripW; x += B) {
        bx.fillRect(x, B * 7.5, B / 8, B * 2.5);
    }
    for (let x = B * 2; x < stripW - B * 6; x += B * 14) {
        // Бункер і радарна тарілка на ньому
        bx.fillStyle = "#16302a";
        bx.fillRect(x, B * 7, B * 5, B * 3);
        bx.fillStyle = "#0e201c";
        bx.fillRect(x + B * 2, B * 8, B, B * 2);
        bx.fillStyle = "#39415e";
        bx.fillRect(x + B * 2.3, B * 5.5, B * 0.4, B * 1.5);
        dishes.push({ x: x + B * 2.5, y: B * 5.5 });
        // Вишка з прожектором
        const tx = x + B * 9;
        bx.fillStyle = "#1a2a2a";
        bx.fillRect(tx, B * 3, B / 4, B * 7);
        bx.fillRect(tx + B * 1.75, B * 3, B / 4, B * 7);
        bx.fillRect(tx - B / 2, B * 2.5, B * 3, B * 0.7);
        towers.push({ x: tx + B, y: B * 2.5 });
    }
    return { W: W, H: H, sky: sky, strip: strip, dishes: dishes, towers: towers };
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
    const stripW = st.strip.width;
    const offset = Math.round(time * speed * 0.3) % stripW;
    const top = gY - st.strip.height;
    for (let x = -offset; x < W; x += stripW) {
        // Промені прожекторів (під смугою, щоб вишки були попереду)
        for (let i = 0; i < st.towers.length; i++) {
            const tw = st.towers[i];
            const tx = x + tw.x;
            if (tx < -W || tx > W * 2) {
                continue;
            }
            const ang = -Math.PI / 2 + Math.sin(time * 0.6 + i * 2) * 0.8;
            const len = gY * 1.2;
            ctx.fillStyle = "rgba(255, 255, 200, 0.07)";
            ctx.beginPath();
            ctx.moveTo(tx, top + tw.y);
            ctx.lineTo(tx + Math.cos(ang - 0.1) * len, top + tw.y + Math.sin(ang - 0.1) * len);
            ctx.lineTo(tx + Math.cos(ang + 0.1) * len, top + tw.y + Math.sin(ang + 0.1) * len);
            ctx.closePath();
            ctx.fill();
        }
        ctx.drawImage(st.strip, x, top);
        // Радарні тарілки обертаються (ширина еліпса змінюється)
        for (let i = 0; i < st.dishes.length; i++) {
            const d = st.dishes[i];
            const dx = x + d.x;
            if (dx < -B * 3 || dx > W + B * 3) {
                continue;
            }
            const turn = Math.cos(time * 1.5 + i);
            const w = Math.max(B * 0.3, Math.abs(turn) * B * 2.4);
            ctx.fillStyle = turn > 0 ? "#8fa3b8" : "#5a6a7a";
            ctx.fillRect(Math.round(dx - w / 2), top + d.y - B * 1.6, Math.round(w), B * 1.6);
            ctx.fillStyle = "#ff3333";
            if (Math.sin(time * 4 + i) > 0) {
                ctx.fillRect(Math.round(dx - B / 8), top + d.y - B * 2, B / 4, B / 4);
            }
        }
    }
};

// ---------- 12. Швидкісне метро ----------

function buildMetroTunnel(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0a0a10"], [1, "#16161f"]]);
    const sx = sky.getContext("2d");
    // Плитка стін
    for (let y = B * 2; y < gY; y += B) {
        for (let x = ((y / B) % 2) * B / 2; x < W; x += B) {
            sx.fillStyle = (x / B + y / B) % 3 === 0 ? "#1c1c28" : "#191923";
            sx.fillRect(x, y, B - 1, B - 1);
        }
    }
    sx.fillStyle = "#26263a";
    sx.fillRect(0, 0, W, B * 2);
    // Кольорова смуга лінії метро
    sx.fillStyle = "#39ff88";
    sx.fillRect(0, gY * 0.55, W, B / 2);
    return { W: W, H: H, sky: sky };
}

BackgroundRenderer.renderMetroTunnel = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._metroTunnel;
    if (!st || st.W !== W || st.H !== H) {
        st = buildMetroTunnel(W, H, groundY, B);
        this._metroTunnel = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Лампи на стелі пробігають повз
    const lampGap = B * 6;
    const lampOff = Math.round(time * speed * 0.6) % lampGap;
    for (let x = -lampOff; x < W + lampGap; x += lampGap) {
        ctx.fillStyle = "rgba(255, 240, 200, 0.12)";
        ctx.fillRect(x - B, B * 2, B * 4, B * 3);
        ctx.fillStyle = "#fff4d0";
        ctx.fillRect(x, B * 1.5, B * 2, B / 2);
    }
    // Потяг проноситься кожні 6 с
    const period = 6;
    const t = (time % period) / 1.6;
    if (t < 1) {
        const trainLen = W * 1.4;
        const tx = W - t * (W + trainLen);
        const ty = Math.round(gY * 0.3);
        const th = Math.round(gY * 0.35);
        ctx.fillStyle = "#c8ccd8";
        ctx.fillRect(tx, ty, trainLen, th);
        ctx.fillStyle = "#39ff88";
        ctx.fillRect(tx, ty + th * 0.7, trainLen, B / 3);
        ctx.fillStyle = "#1a2a3a";
        for (let wx = tx + B; wx < tx + trainLen - B * 2; wx += B * 3) {
            ctx.fillRect(wx, ty + B * 0.6, B * 2, th * 0.4);
        }
        ctx.fillStyle = "#fff4a0";
        ctx.fillRect(tx - B * 0.3, ty + th * 0.5, B * 0.3, B * 0.6);
    }
    // Рейки
    ctx.fillStyle = "#3a3a4a";
    ctx.fillRect(0, gY - B / 3, W, B / 6);
    const sleeperGap = B * 1.5;
    const so = Math.round(time * speed) % sleeperGap;
    ctx.fillStyle = "#2a2018";
    for (let x = -so; x < W; x += sleeperGap) {
        ctx.fillRect(x, gY - B / 6, B * 0.6, B / 6);
    }
};

// ---------- 13. Завод роботів ----------

function buildRobotFactory(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0d1014"], [1, "#1c2229"]]);
    const sx = sky.getContext("2d");
    // Труби на стелі
    sx.fillStyle = "#39414e";
    sx.fillRect(0, B, W, B / 2);
    sx.fillRect(0, B * 2, W, B / 3);
    for (let x = B * 3; x < W; x += B * 8) {
        sx.fillRect(x, B, B / 2, B * 3);
    }
    // Попереджувальні смуги
    for (let x = 0; x < W; x += B) {
        sx.fillStyle = (x / B) % 2 === 0 ? "#ffcc00" : "#1a1a1a";
        sx.fillRect(x, gY - B * 4.6, B, B / 3);
    }
    return { W: W, H: H, sky: sky };
}

BackgroundRenderer.renderRobotFactory = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._robotFactory;
    if (!st || st.W !== W || st.H !== H) {
        st = buildRobotFactory(W, H, groundY, B);
        this._robotFactory = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const beltY = gY - B * 3;
    // Конвеєр з ящиками
    ctx.fillStyle = "#2a2f38";
    ctx.fillRect(0, beltY, W, B);
    const boxGap = B * 5;
    const bo = Math.round(time * speed * 0.35) % boxGap;
    for (let x = -bo; x < W + boxGap; x += boxGap) {
        ctx.fillStyle = "#b07a3a";
        ctx.fillRect(x, beltY - B * 1.5, B * 1.5, B * 1.5);
        ctx.fillStyle = "#8a5a2a";
        ctx.fillRect(x, beltY - B * 0.8, B * 1.5, B / 6);
    }
    ctx.fillStyle = "#1a1d24";
    for (let x = -(Math.round(time * speed * 0.35) % B); x < W; x += B) {
        ctx.fillRect(x, beltY + B * 0.4, B / 2, B / 5);
    }
    // Роботизовані руки: плече гойдається, рука «зварює» ящики
    const arms = 3;
    for (let i = 0; i < arms; i++) {
        const baseX = W * (i + 0.5) / arms;
        const a1 = Math.PI / 2 + Math.sin(time * 1.3 + i * 2) * 0.5;
        const a2 = a1 + 0.9 + Math.sin(time * 2 + i) * 0.4;
        const l1 = B * 3.5;
        const l2 = B * 3;
        const jx = baseX + Math.cos(a1) * l1;
        const jy = B * 2 + Math.sin(a1) * l1;
        const ex = jx + Math.cos(a2) * l2;
        const ey = jy + Math.sin(a2) * l2;
        ctx.strokeStyle = "#ff8c00";
        ctx.lineWidth = B * 0.5;
        ctx.beginPath();
        ctx.moveTo(baseX, B * 2);
        ctx.lineTo(jx, jy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.fillStyle = "#39414e";
        ctx.fillRect(baseX - B / 2, B * 1.6, B, B * 0.8);
        ctx.fillRect(jx - B * 0.35, jy - B * 0.35, B * 0.7, B * 0.7);
        // Іскри зварювання
        if (Math.sin(time * 6 + i * 3) > 0.3) {
            ctx.fillStyle = "#fff4a0";
            ctx.fillRect(ex - B * 0.3, ey - B * 0.3, B * 0.6, B * 0.6);
            const r = pixelRng(Math.floor(time * 20) + i * 100);
            ctx.fillStyle = "#ffcc33";
            for (let k = 0; k < 6; k++) {
                ctx.fillRect(ex + (r() - 0.5) * B * 3, ey + (r() - 0.2) * B * 2, 3, 3);
            }
        }
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

function buildTreasury(W, H, groundY, B) {
    const rng = pixelRng(2020);
    const gY = Math.round(groundY);
    const wall = makeSky(W, H, [[0, "#140e08"], [1, "#2a1c0e"]]);
    const wx = wall.getContext("2d");
    // Кам'яна кладка
    for (let y = 0; y < gY; y += B) {
        for (let x = ((y / B) % 2) * B; x < W; x += B * 2) {
            wx.fillStyle = (x + y) % 3 === 0 ? "#2e2214" : "#281d10";
            wx.fillRect(x, y, B * 2 - 2, B - 2);
        }
    }
    // Двері сховища
    const dx = Math.round(W * 0.7);
    const dy = Math.round(gY * 0.42);
    const dr = Math.round(gY * 0.26);
    wx.fillStyle = "#5a5f6a";
    wx.beginPath();
    wx.arc(dx, dy, dr, 0, Math.PI * 2);
    wx.fill();
    wx.fillStyle = "#7a808c";
    wx.beginPath();
    wx.arc(dx, dy, dr * 0.82, 0, Math.PI * 2);
    wx.fill();
    wx.fillStyle = "#4a4f5a";
    for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2;
        wx.fillRect(dx + Math.cos(a) * dr * 0.9 - 4, dy + Math.sin(a) * dr * 0.9 - 4, 8, 8);
    }
    // Купи монет і злитків
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const piles = makeCanvas(stripW, B * 6);
    const px = piles.getContext("2d");
    const glints = [];
    for (let x = B; x < stripW - B * 6; x += B * (7 + Math.floor(rng() * 4))) {
        const levels = 3 + Math.floor(rng() * 3);
        for (let l = 0; l < levels; l++) {
            const w = (levels - l) * 2;
            for (let k = 0; k < w; k++) {
                px.fillStyle = (k + l) % 2 === 0 ? "#ffcc33" : "#e0a820";
                px.fillRect(x + (l + k) * B / 2, piles.height - (l + 1) * B / 2, B / 2, B / 2);
                px.fillStyle = "#fff2a0";
                px.fillRect(x + (l + k) * B / 2, piles.height - (l + 1) * B / 2, B / 6, B / 8);
            }
            glints.push({ x: x + (l + 1) * B, y: piles.height - (l + 1) * B / 2, phase: rng() * 6 });
        }
        // Злитки поруч
        px.fillStyle = "#d99a00";
        px.fillRect(x + levels * B + B, piles.height - B / 2, B * 1.2, B / 2);
        px.fillRect(x + levels * B + B * 1.3, piles.height - B, B * 1.2, B / 2);
        px.fillStyle = "#fff2a0";
        px.fillRect(x + levels * B + B, piles.height - B / 2, B * 1.2, B / 8);
    }
    return { W: W, H: H, wall: wall, piles: piles, glints: glints };
}

BackgroundRenderer.renderTreasury = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._treasury;
    if (!st || st.W !== W || st.H !== H) {
        st = buildTreasury(W, H, groundY, B);
        this._treasury = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.wall, 0, 0);
    const pw = st.piles.width;
    const offset = Math.round(time * speed * 0.3) % pw;
    const top = gY - st.piles.height;
    for (let x = -offset; x < W; x += pw) {
        ctx.drawImage(st.piles, x, top);
        // Іскорки на монетах
        for (const g of st.glints) {
            const gx = x + g.x;
            if (gx < -B || gx > W + B) {
                continue;
            }
            const s = Math.sin(time * 3 + g.phase);
            if (s > 0.7) {
                const a = (s - 0.7) / 0.3;
                const sz = Math.max(2, B / 5);
                ctx.globalAlpha = a;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(gx - sz / 2, top + g.y - sz * 1.5, sz, sz * 3);
                ctx.fillRect(gx - sz * 1.5, top + g.y - sz / 2, sz * 3, sz);
            }
        }
        ctx.globalAlpha = 1;
    }
    // Тепле світло
    ctx.fillStyle = "rgba(255, 180, 60, 0.06)";
    ctx.fillRect(0, 0, W, gY);
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

function buildKnightCastle(W, H, groundY, B) {
    const rng = pixelRng(2424);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#070a1c"], [0.7, "#1a2248"], [1, "#2a3060"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, gY * 0.5, 60, rng, B);
    sx.fillStyle = "#f4f1d0";
    sx.fillRect(Math.round(W * 0.15), Math.round(H * 0.08), B * 3, B * 3);
    // Стіна замку з зубцями та вежами в смузі
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const wallH = B * 9;
    const wall = makeCanvas(stripW, wallH + B * 5);
    const wx = wall.getContext("2d");
    const baseTop = wall.height - wallH;
    const flags = [];
    const torches = [];
    for (let x = 0; x < stripW; x += B) {
        for (let y = baseTop; y < wall.height; y += B / 2) {
            wx.fillStyle = ((x / B) + (y / (B / 2))) % 2 === 0 ? "#4a4f63" : "#40455a";
            wx.fillRect(x, y, B, B / 2 - 1);
        }
        if ((x / B) % 2 === 0) {
            wx.fillStyle = "#4a4f63";
            wx.fillRect(x, baseTop - B, B, B);
        }
    }
    for (let x = B * 3; x < stripW - B * 6; x += B * (14 + Math.floor(rng() * 4))) {
        // Вежа
        wx.fillStyle = "#555a70";
        wx.fillRect(x, baseTop - B * 4, B * 4, B * 4);
        for (let k = 0; k < 4; k += 2) {
            wx.fillRect(x + k * B, baseTop - B * 5, B, B);
        }
        wx.fillStyle = "#1a1e2e";
        wx.fillRect(x + B * 1.5, baseTop - B * 2.5, B, B * 1.5);
        wx.fillStyle = "#3a3f52";
        wx.fillRect(x + B * 3.8, baseTop - B * 5, B / 6, B * 1.5);
        flags.push({ x: x + B * 3.9, y: baseTop - B * 5, color: rng() < 0.5 ? "#e8173c" : "#2a6aff" });
        // Факели на стіні
        torches.push({ x: x - B * 3, y: baseTop + B * 2 });
        wx.fillStyle = "#5b3a1e";
        wx.fillRect(x - B * 3, baseTop + B * 2, B / 4, B * 0.8);
    }
    // Брама
    wx.fillStyle = "#1a1210";
    wx.fillRect(Math.round(stripW * 0.5), wall.height - B * 4, B * 3, B * 4);
    wx.fillStyle = "#3a2a1a";
    for (let k = 0; k < 3; k++) {
        wx.fillRect(Math.round(stripW * 0.5) + k * B + B / 3, wall.height - B * 4, B / 6, B * 4);
    }
    return { W: W, H: H, sky: sky, wall: wall, flags: flags, torches: torches };
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
    const ww = st.wall.width;
    const offset = Math.round(time * speed * 0.25) % ww;
    const top = gY - st.wall.height;
    for (let x = -offset; x < W; x += ww) {
        ctx.drawImage(st.wall, x, top);
        // Прапори майорять
        for (let i = 0; i < st.flags.length; i++) {
            const f = st.flags[i];
            const fx = x + f.x;
            if (fx < -B * 3 || fx > W + B) {
                continue;
            }
            ctx.fillStyle = f.color;
            for (let k = 0; k < 4; k++) {
                const wave = Math.round(Math.sin(time * 5 + i + k * 0.8) * B * 0.12);
                ctx.fillRect(fx + k * B * 0.4, top + f.y + wave, B * 0.4, B * 0.8);
            }
            ctx.fillStyle = "#ffe14d";
            ctx.fillRect(fx + B * 0.5, top + f.y + B * 0.25 + Math.round(Math.sin(time * 5 + i + 1) * B * 0.12), B * 0.3, B * 0.3);
        }
        // Факели мерехтять
        for (let i = 0; i < st.torches.length; i++) {
            const t = st.torches[i];
            const tx = x + t.x;
            if (tx < -B * 2 || tx > W + B * 2) {
                continue;
            }
            const fl = 0.75 + 0.25 * Math.sin(time * 11 + i * 3) * Math.sin(time * 7.1 + i);
            ctx.globalAlpha = 0.12 * fl;
            ctx.fillStyle = "#ffaa33";
            ctx.fillRect(tx - B * 1.5, top + t.y - B * 1.5, B * 3.25, B * 3);
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(tx - B / 8, top + t.y - B / 2, B / 2, B / 2);
            ctx.fillStyle = fl > 0.9 ? "#ffffff" : "#ff7a00";
            ctx.fillRect(tx, top + t.y - B * 0.35, B / 4, B / 4);
        }
    }
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
    const R = st.R;
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

// ---------- 30. Тронна зала ----------

function buildThroneRoom(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const room = makeSky(W, H, [[0, "#1a0a14"], [1, "#2e1224"]]);
    const rx = room.getContext("2d");
    const cx = W / 2;
    const backY = Math.round(gY * 0.35);
    // Задня стіна з троном
    rx.fillStyle = "#3a1a2e";
    rx.fillRect(cx - W * 0.2, 0, W * 0.4, backY + B * 2);
    rx.fillStyle = "#c98a00";
    rx.fillRect(cx - B * 2, backY - B * 4, B * 4, B * 5);
    rx.fillStyle = "#8a1a2a";
    rx.fillRect(cx - B * 1.4, backY - B * 3.4, B * 2.8, B * 3);
    rx.fillStyle = "#ffd700";
    rx.fillRect(cx - B * 2, backY - B * 4.8, B / 2, B);
    rx.fillRect(cx + B * 1.5, backY - B * 4.8, B / 2, B);
    rx.fillRect(cx - B / 4, backY - B * 5, B / 2, B);
    // Червона доріжка в перспективі
    rx.fillStyle = "#a01830";
    rx.beginPath();
    rx.moveTo(cx - B * 1.5, backY + B);
    rx.lineTo(cx + B * 1.5, backY + B);
    rx.lineTo(cx + W * 0.18, gY);
    rx.lineTo(cx - W * 0.18, gY);
    rx.closePath();
    rx.fill();
    rx.fillStyle = "#ffcc33";
    rx.fillRect(cx - W * 0.18, gY - 3, W * 0.36, 3);
    // Колони обабіч
    for (let i = 0; i < 4; i++) {
        const t = (i + 1) / 5;
        const k = t * t;
        const px = W * 0.2 + k * W * 0.3;
        const w = B * (0.6 + k * 1.6);
        const h = backY + (gY - backY) * k;
        for (const side of [-1, 1]) {
            const x = cx + side * px - w / 2;
            rx.fillStyle = "#6a5a70";
            rx.fillRect(x, 0, w, h);
            rx.fillStyle = "#8a7a90";
            rx.fillRect(x, 0, w * 0.25, h);
            // Прапор із гербом
            rx.fillStyle = "#1a3a8a";
            rx.fillRect(x + w * 0.1, h * 0.25, w * 0.8, h * 0.25);
            rx.fillStyle = "#ffd700";
            rx.fillRect(x + w * 0.4, h * 0.3, w * 0.2, h * 0.12);
        }
    }
    return { W: W, H: H, room: room };
}

BackgroundRenderer.renderThroneRoom = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._throneRoom;
    if (!st || st.W !== W || st.H !== H) {
        st = buildThroneRoom(W, H, groundY, B);
        this._throneRoom = st;
    }
    ctx.drawImage(st.room, 0, 0);
    // Люстри зі свічками, що мерехтять і ледь гойдаються
    for (let i = 0; i < 3; i++) {
        const cx = W * (0.25 + i * 0.25) + Math.sin(time * 0.8 + i) * B * 0.3;
        const cy = B * 3 + i % 2 * B;
        ctx.fillStyle = "#c98a00";
        ctx.fillRect(cx - B * 2, cy, B * 4, B / 3);
        ctx.fillRect(cx - B / 12, 0, B / 6, cy);
        for (let k = 0; k < 5; k++) {
            const fx = cx - B * 1.8 + k * B * 0.9;
            const fl = 0.7 + 0.3 * Math.sin(time * 9 + i * 5 + k * 2);
            ctx.globalAlpha = 0.15 * fl;
            ctx.fillStyle = "#ffcc55";
            ctx.fillRect(fx - B * 0.6, cy - B * 1.2, B * 1.2, B * 1.2);
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#fff4d0";
            ctx.fillRect(fx - B / 10, cy - B / 2, B / 5, B / 2);
            ctx.fillStyle = fl > 0.9 ? "#ffffff" : "#ffaa33";
            ctx.fillRect(fx - B / 10, cy - B * 0.75, B / 5, B / 4);
        }
    }
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
let _fx = { progress: 0, combo: 0, perfect: 0, eggT: null, weather: "clear", camY: 0 };

// Світи просто неба: до кінця рівня в них настає ніч
const DUSK_THEMES = new Set(["sunset_city", "pirate_bay", "pixel_desert", "neon_highway", "sky_city", "twin_sun_planet", "stadium"]);

// Пасхалка кожного світу (одна за рівень)
const EASTER_EGG_BY_THEME = {
    sunset_city: "ufo", neon_rooftops: "ufo", neon_highway: "ufo", secret_base: "ufo", cosmodrome: "ufo",
    pixel_ocean: "whale", pirate_bay: "whale", night_harbor: "whale",
    knight_castle: "dragon", dragon_lair: "dragon", pixel_nether: "dragon",
    orbit_view: "meteors", black_hole: "meteors", pixel_islands: "meteors", twin_sun_planet: "meteors", neon_start: "meteors",
    digital_forest: "deer", pixel_night: "deer", pixel_snow: "deer", storm_sky: "deer",
    retro_arcade: "cat", robot_factory: "cat", treasury: "cat", throne_room: "cat",
    crystal_cave: "cat", pixel_cave: "cat", laser_range: "cat", metro_tunnel: "cat"
};

// Тип землі під шипами
const GROUND_BY_THEME = {
    pixel_night: "grass", digital_forest: "grass", storm_sky: "grass", stadium: "turf", twin_sun_planet: "alien",
    pixel_snow: "snow",
    pixel_desert: "sand", pirate_bay: "sand", pixel_ocean: "sand",
    pixel_cave: "stone", crystal_cave: "stone", dragon_lair: "stone", knight_castle: "stone", treasury: "stone", metro_tunnel: "stone",
    throne_room: "carpet",
    pixel_nether: "lava"
};

BackgroundRenderer.setEffects = function (fx) {
    _fx = fx || { progress: 0, combo: 0, perfect: 0, eggT: null, weather: "clear", camY: 0 };
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
        carpet: ["#a01830", "#c02040", "#ffcc33", "#801020"],
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

// ---------- Назви світів, фініші, погода ----------

const WORLD_NAMES = {
    neon_start: "Неоновий старт", sunset_city: "Місто на заході сонця", cosmodrome: "Космодром",
    neon_highway: "Неонова траса", laser_range: "Лазерний полігон", digital_forest: "Цифровий ліс",
    storm_sky: "Грозове небо", crystal_cave: "Кришталева печера", retro_arcade: "Ретро-аркада",
    pixel_night: "Нічні пагорби", secret_base: "Секретна база", metro_tunnel: "Швидкісне метро",
    robot_factory: "Завод роботів", twin_sun_planet: "Планета двох сонць", sky_city: "Місто над хмарами",
    stadium: "Футбольний стадіон", neon_rooftops: "Нічне неонове місто", night_harbor: "Нічна гавань",
    pirate_bay: "Піратська бухта", treasury: "Скарбниця", orbit_view: "Орбіта",
    dragon_lair: "Лігво дракона", pixel_cave: "Рудна печера", knight_castle: "Лицарський замок",
    pixel_snow: "Сніжні гори", pixel_ocean: "Інопланетний океан", pixel_desert: "Пустеля",
    pixel_islands: "Парящі острови", black_hole: "Чорна діра", throne_room: "Тронна зала",
    pixel_nether: "Вогняний світ"
};

BackgroundRenderer.worldName = function (theme) {
    return WORLD_NAMES[theme] || "";
};

// Вид фінішу кожного світу
const FINISH_BY_THEME = {
    pirate_bay: "chest", treasury: "chest", pixel_desert: "chest",
    knight_castle: "gate", throne_room: "gate", dragon_lair: "gate", pixel_cave: "gate", crystal_cave: "gate",
    orbit_view: "portal", black_hole: "portal", pixel_islands: "portal", cosmodrome: "portal", twin_sun_planet: "portal",
    stadium: "goal",
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
    "sky_city", "stadium", "night_harbor", "pirate_bay", "knight_castle", "pixel_snow",
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


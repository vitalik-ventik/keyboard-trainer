// ============================================================
// backgrounds/core.js — ядро процедурних фонів рівнів
// BackgroundRenderer: розміри сцени, частинки вибуху кубика, вибір рендерера
// за темою (THEME_RENDERERS) і скидання буферів сцен (SCENE_CACHE_KEYS).
// Кожен світ дописує свій метод render… у BackgroundRenderer у власному модулі.
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

// Тема фону → метод рендерера. Невідома тема малює кубічне селище.
const THEME_RENDERERS = {
    block_village: "renderBlockVillage",
    sunset_city: "renderSunsetCity",
    cosmodrome: "renderCosmodrome",
    neon_highway: "renderNeonHighway",
    jungle_temple: "renderJungleTemple",
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
    "_blockVillage", "_sunsetCity", "_cosmodrome", "_neonHighway", "_jungleTemple", "_digitalForest",
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
        const method = THEME_RENDERERS[bgTheme] || "renderBlockVillage";
        // Стан полотна повністю ізольовано: сцена не може «протекти» прозорістю,
        // пунктиром чи зсувом у те, що малюється після неї. Якщо в сцені трапиться
        // помилка, кадр фону просто пропускається, а гра малює далі.
        ctx.save();
        try {
            this[method](ctx, W, H, groundY, time, speed, accentColor);
            this.renderSceneEffects(ctx, bgTheme, W, H, groundY, time, accentColor);
        } catch (err) {
            if (!this._renderErrorShown) {
                this._renderErrorShown = true;
                console.warn("Помилка малювання фону «" + bgTheme + "»:", err);
            }
        } finally {
            ctx.restore();
        }
    }
};

export { BackgroundRenderer, SCENE_CACHE_KEYS, THEME_RENDERERS };

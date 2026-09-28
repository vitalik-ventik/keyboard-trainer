// ============================================================
// weapons.js — зброя з магазину: параметри атаки (WEAPON_SPECS), звуки, тайминги
// ударів і гравітаційного захвату, спільні хелпери; точка входу для всього про зброю.
// Рушій (engine.js) вирішує, КОЛИ шип знищено; малювання — weapons_held.js (зброя в руці),
// weapons_projectiles.js (снаряди й промені), weapons_destruction.js (руйнування шипа),
// weapons_preview.js (прев'ю в магазині). Координати екранні: groundY — лінія землі, вісь Y донизу.
// ============================================================


// mode:
//   melee — замах одразу, удар, коли шип підʼїде майже впритул (bolt — ще й блискавка з неба)
//   axe   — якщо шип ближче за reach, рубає впритул, як меч; інакше кидає бумеранг
//           (thrown — вигляд кинутої зброї, типово "axe"; кинута зброя повертається в руку)
//   shot  — снаряд летить до шипа (speed — пікселів за секунду, arc — висота дуги,
//           launch — звідки вилітає [x, y] у частках кубика, aim — куди влучає в частках висоти шипа)
//   burst — черга з кількох куль, кожна відколює шматок
//   beam  — дія на відстані без снаряда: промінь лазера, струмінь вогнемета,
//           блискавка молота, захват гравітаційної гармати (beam — вигляд,
//           time — тривалість, hit — мить, коли шип знищено)
// fx — анімація руйнування шипа
export const WEAPON_SPECS = {
    weapon_sword:   { mode: "melee", fx: "slice" },
    weapon_axe:     { mode: "axe", reach: 64, speed: 760, arc: 26, fx: "split" },
    weapon_bow:     { mode: "shot", projectile: "arrow", speed: 720, arc: 34, fx: "shatter" },
    weapon_pickaxe: { mode: "melee", fx: "break" },
    // Бейсбольна бита, як у Roblox: удар «хоум-ран» відправляє шип у небо
    weapon_bat:     { mode: "melee", fx: "homerun" },
    // М'яч б'ють з землі: летить низом від ноги кубика (launch — частки розміру кубика
    // вперед і вгору від центру-низу) і влучає в основу шипа (aim — частка висоти шипа)
    weapon_ball:    { mode: "shot", projectile: "ball", speed: 620, arc: 6, launch: [0.72, 0.2], aim: 0.3, fx: "goal" },
    weapon_pistol:  { mode: "shot", projectile: "bullet", speed: 1900, arc: 0, fx: "pop" },
    weapon_rifle:   { mode: "burst", projectile: "bullet", speed: 2100, arc: 0, count: 4, gap: 0.07, fx: "crumble" },
    weapon_flamethrower: { mode: "beam", beam: "flame", time: 0.6, hit: 0.28, fx: "burn" },
    weapon_laser:   { mode: "beam", beam: "laser", time: 0.35, hit: 0.12, fx: "melt" },
    weapon_rocket:  { mode: "shot", projectile: "rocket", speed: 640, arc: 10, fx: "blast" },
    // Легендарна зброя
    weapon_firesword: { mode: "melee", fx: "fireslice" },
    weapon_thunder:   { mode: "melee", bolt: true, fx: "zap" },
    weapon_gravity:   { mode: "beam", beam: "gravity", time: 0.73, hit: 0.18, fx: "fling" },
    // Світлові мечі: зблизька рубають, здалеку летять, крутячись, як сокира, і повертаються
    weapon_saber_green: { mode: "axe", reach: 64, speed: 820, arc: 18, fx: "saber_green", saber: "#39ff5a" },
    weapon_saber_blue:  { mode: "axe", reach: 64, speed: 820, arc: 18, fx: "saber_blue", saber: "#3aa0ff" },
    weapon_saber_red:   { mode: "axe", reach: 64, speed: 820, arc: 18, fx: "saber_red", saber: "#ff2a2a" },
    // Ліга 4: плазмова гармата стріляє сяйною кулею плазми, сюрикени летять віялом по три
    weapon_plasma:   { mode: "shot", projectile: "plasma", speed: 1100, arc: 0, fx: "plasma" },
    weapon_shuriken: { mode: "burst", projectile: "shuriken", speed: 1300, arc: 8, count: 3, gap: 0.08, fx: "shred" },
    // Сундукова зброя: не продається, лише випадає із «свого» сундука (поле chestOnly у shop.js).
    // Малювання — weapons_chest.js (у руці, снаряди, промені) і weapons_chest_fx.js (руйнування шипа).
    // Дерев'яний сундук: тризуб (як у Minecraft — летить і повертається), арбалет, сніжки, рогатка (Roblox)
    weapon_trident:   { mode: "axe", thrown: "trident", reach: 64, speed: 900, arc: 10, fx: "splash" },
    weapon_crossbow:  { mode: "shot", projectile: "bolt", speed: 1300, arc: 8, fx: "shatter" },
    weapon_snowball:  { mode: "burst", projectile: "snowball", speed: 850, arc: 24, count: 3, gap: 0.09, fx: "freeze" },
    weapon_slingshot: { mode: "shot", projectile: "pebble", speed: 800, arc: 30, fx: "pop" },
    // Срібний сундук: булава хрестоносця й коса некроманта (Diablo 3), банхамер і пейнтбол (Roblox)
    weapon_mace:      { mode: "melee", fx: "smash" },
    weapon_scythe:    { mode: "melee", fx: "reap" },
    weapon_banhammer: { mode: "melee", fx: "ban" },
    weapon_paintball: { mode: "burst", projectile: "paint", speed: 1500, arc: 4, count: 3, gap: 0.08, fx: "paint", colors: ["#ff3a8a", "#3ae0ff", "#ffe23a"] },
    // Золотий сундук: посохи чарівника з Diablo 3 (ланцюгова блискавка, метеор, крижана сфера)
    // і жезл вітру з Minecraft (вітровий заряд здуває шип)
    weapon_chain_staff:  { mode: "beam", beam: "chain", time: 0.45, hit: 0.1, fx: "zap" },
    weapon_meteor_staff: { mode: "beam", beam: "meteor", time: 0.7, hit: 0.42, fx: "blast" },
    weapon_wind_rod:     { mode: "shot", projectile: "wind", speed: 1000, arc: 0, fx: "gust" },
    weapon_frost_orb:    { mode: "shot", projectile: "frost_orb", speed: 700, arc: 0, fx: "freeze" }
};

// Вигляд кинутої зброї (режим axe): світловий меч, тризуб чи сокира
export function thrownKind(spec) {
    if (!spec) {
        return "axe";
    }
    return spec.saber ? "saber" : spec.thrown || "axe";
}

// Колір снаряда index у черзі (світловий меч — колір леза, пейнтбол — фарби по черзі)
export function shotColor(spec, index) {
    if (!spec) {
        return null;
    }
    if (spec.saber) {
        return spec.saber;
    }
    if (spec.colors && spec.colors.length > 0) {
        return spec.colors[(index || 0) % spec.colors.length];
    }
    return null;
}

// Колір леза світлового меча для анімації розрізу
const SABER_FX_COLORS = { saber_green: "#39ff5a", saber_blue: "#3aa0ff", saber_red: "#ff2a2a" };

// Чи зброя — світловий меч (для малювання в руці й у польоті)
export function saberColor(id) {
    const spec = WEAPON_SPECS[id];
    return spec && spec.saber ? spec.saber : null;
}

// Звуки зброї за подіями: «fire» — постріл, кидок або промінь, «swing» — мах
// ближнього бою, «hit» — шип знищено, «chunk» — снаряд черги відколов шматок шипа. sound — ключ із assets.js (SOUND_FILES),
// offset/duration — яку частину файлу грати (довгі файли обрізаються з затуханням),
// volume — гучність, вирівняна за рівнем звуку стрибка.
export const WEAPON_SOUNDS = {
    weapon_sword: { swing: { sound: "sword", volume: 0.85 } },
    weapon_firesword: { swing: { sound: "fire_sword", duration: 0.9, volume: 0.65 } },
    weapon_axe: { hit: { sound: "axe", volume: 0.32 } },
    weapon_pickaxe: { hit: { sound: "pickaxe", volume: 0.9 } },
    weapon_bat: { hit: { sound: "bat", volume: 0.8 } },
    weapon_thunder: { hit: { sound: "thunder", duration: 1.8, volume: 0.75 } },
    weapon_bow: { fire: { sound: "bow", volume: 0.55 } },
    weapon_ball: { fire: { sound: "soccer", volume: 2.2 } },
    weapon_pistol: { fire: { sound: "gun", volume: 1.0 } },
    weapon_rifle: { fire: { sound: "machine_gun", duration: 0.4, volume: 0.45 } },
    weapon_flamethrower: { fire: { sound: "flamethrower", offset: 0.15, duration: 0.8, volume: 1.3 } },
    weapon_laser: { fire: { sound: "laser_gun", volume: 0.5 } },
    // У файлі ракети спершу політ (0.15–1.2 с), потім вибух (з 1.2 с): граємо частинами
    weapon_rocket: {
        fire: { sound: "missile_boom", offset: 0.15, duration: 0.6, volume: 0.75 },
        hit: { sound: "missile_boom", offset: 1.18, duration: 2.2, volume: 0.8 }
    },
    weapon_gravity: { fire: { sound: "gravi_sound", volume: 0.75 } },
    // Гудіння світлового меча: і на замах, і на кидок
    weapon_saber_green: { swing: { sound: "lightsaber", duration: 1.0, volume: 0.4 }, fire: { sound: "lightsaber", volume: 0.4 } },
    weapon_saber_blue: { swing: { sound: "lightsaber", duration: 1.0, volume: 0.4 }, fire: { sound: "lightsaber", volume: 0.4 } },
    weapon_saber_red: { swing: { sound: "lightsaber", duration: 1.0, volume: 0.4 }, fire: { sound: "lightsaber", volume: 0.4 } },
    weapon_plasma: { fire: { sound: "laser_gun", volume: 0.6 }, hit: { sound: "thunder", duration: 0.5, volume: 0.3 } },
    // Сюрикени: у звуці кидка — черга з трьох свистів; кожен сюрикен черги влучає зі своїм звуком
    weapon_shuriken: { fire: { sound: "shuriken_throw", volume: 0.25 }, chunk: { sound: "shuriken_hit", volume: 0.3 }, hit: { sound: "shuriken_hit", volume: 0.43 } },
    // Сундукова зброя: власні звуки, змішані з наявних і синтезованих шарів
    weapon_trident: { fire: { sound: "trident_throw", volume: 0.58 }, swing: { sound: "trident_throw", volume: 0.51 }, hit: { sound: "trident_splash", volume: 1.28 } },
    weapon_crossbow: { fire: { sound: "crossbow", volume: 0.7 } },
    // Сніжки й пейнтбол: у звуці пострілу — черга з трьох, кожен снаряд черги ще й влучає зі своїм звуком
    weapon_snowball: { fire: { sound: "snow_throw", volume: 0.75 }, chunk: { sound: "snow_hit", volume: 0.55 }, hit: { sound: "snow_hit", volume: 0.86 } },
    weapon_slingshot: { fire: { sound: "slingshot", volume: 0.6 }, hit: { sound: "slingshot_hit", volume: 0.62 } },
    weapon_mace: { hit: { sound: "mace_hit", volume: 0.5 } },
    weapon_scythe: { swing: { sound: "scythe_swing", volume: 0.75 }, hit: { sound: "scythe_soul", volume: 0.45 } },
    weapon_banhammer: { hit: { sound: "banhammer", volume: 1.03 } },
    weapon_paintball: { fire: { sound: "paint_shot", volume: 0.55 }, chunk: { sound: "paint_splat", volume: 0.65 }, hit: { sound: "paint_splat", volume: 1.0 } },
    weapon_chain_staff: { fire: { sound: "chain_lightning", volume: 0.8 } },
    weapon_meteor_staff: { fire: { sound: "meteor_fall", volume: 0.45 }, hit: { sound: "meteor_boom", volume: 0.8 } },
    weapon_wind_rod: { fire: { sound: "wind_blast", volume: 0.44 } },
    weapon_frost_orb: { fire: { sound: "frost_orb", volume: 0.55 }, hit: { sound: "ice_shatter", volume: 0.75 } }
};

// Звук зброї для події або null
export function getWeaponSound(id, event) {
    const cues = WEAPON_SOUNDS[id];
    return cues && cues[event] ? cues[event] : null;
}

export function getWeaponSpec(id) {
    return WEAPON_SPECS[id] || null;
}

// Тривалість анімації руйнування (секунди)
export const DESTRUCTION_TIME = {
    slice: 0.75,
    split: 0.8,
    shatter: 0.35,
    break: 1.3,
    homerun: 1.3,
    goal: 1.1,
    pop: 0.3,
    crumble: 0.5,
    melt: 1.0,
    blast: 2.6,
    burn: 1.4,
    fireslice: 0.9,
    saber_green: 0.9,
    saber_blue: 0.9,
    saber_red: 0.9,
    zap: 0.6,
    fling: 1.7,
    plasma: 0.9,
    shred: 0.8,
    // Сундукова зброя (weapons_chest_fx.js)
    splash: 0.9,
    freeze: 1.0,
    smash: 1.0,
    reap: 1.1,
    ban: 1.3,
    paint: 1.2,
    gust: 1.2
};

// Гравітаційна гармата: промінь летить до шипа зі швидкістю GRAVITY_BEAM_SPEED
// (до близького шипа — майже миттєво, але не довше за GRAVITY_GRAB), потім GRAVITY_LIFT
// шип піднімається й підтягується до кубика; коли промінь гасне, гармата відстрілює його вперед.
export const GRAVITY_GRAB = 0.18;
export const GRAVITY_LIFT = 0.7;
export const GRAVITY_BEAM_SPEED = 1400;
// Шип злітає швидко (за GRAVITY_RISE) і вище кубика, далі висить і погойдується
const GRAVITY_RISE = 0.16;
const GRAVITY_LIFT_RATIO = 1.35;

// Час, за який промінь дотягнеться до шипа на відстані dist
export function gravityGrabTime(dist) {
    return Math.min(GRAVITY_GRAB, Math.max(0.03, dist / GRAVITY_BEAM_SPEED));
}

// На скільки піднято шип висотою h через ft секунд після захоплення (вгору — мінус)
export function gravityLiftOffset(ft, h) {
    const k = clamp01(ft / GRAVITY_RISE);
    const rise = 1 - Math.pow(1 - k, 3);
    const hover = ft > GRAVITY_RISE ? Math.sin((ft - GRAVITY_RISE) * 9) * 0.08 : 0;
    return -h * GRAVITY_LIFT_RATIO * (rise + hover);
}

// Де тримається шип через ft секунд після захоплення: спершу злітає вгору, потім
// плавно підтягується на відстань toPull (до точки перед кубиком; зазвичай від'ємна)
// і встигає трохи повисіти, перш ніж промінь згасне
export function gravityHoldOffset(ft, h, toPull) {
    const start = GRAVITY_RISE * 0.5;
    const k = clamp01((ft - start) / (GRAVITY_LIFT - start - 0.12));
    const ease = k * k * (3 - 2 * k);
    return { dx: (toPull || 0) * ease, dy: gravityLiftOffset(ft, h) };
}

// Тривалість удару ближнього бою і момент, коли лезо торкається шипа
export const SWING_TIME = 0.2;
export const SWING_HIT = 0.07;
// Проміжок між гранню кубика й шипом у мить, коли лезо його торкається
export const MELEE_CONTACT = 5;
// Тривалість блискавки громового молота
export const BOLT_TIME = 0.45;

// Відстань від центру кубика до ближнього краю шипа, на якій треба почати мах,
// щоб лезо влучило майже впритул: шип устигає під'їхати за час до удару
export function meleeTriggerGap(cubeSize, speed) {
    return cubeSize / 2 + MELEE_CONTACT + speed * SWING_HIT;
}
// Скільки триває дія на відстані й коли вона знищує шип (типово — як у лазера)
export const BEAM_TIME = 0.35;
export const BEAM_HIT = 0.12;

export function beamTiming(spec) {
    return { time: (spec && spec.time) || BEAM_TIME, hit: (spec && spec.hit) || BEAM_HIT };
}

// Детермінований «випадок» для анімацій (без мерехтіння між кадрами)
function hashRand(n) {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
}

function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
}

export { GRAVITY_LIFT_RATIO, SABER_FX_COLORS, clamp01, hashRand };

// Реекспорт: рушій і магазин імпортують усе про зброю з weapons.js
export { drawFlameTongue, drawFootball, drawHeldWeapon, drawShurikenShape } from "./weapons_held.js";
export { drawBeam, drawLaserBeam, drawProjectile, drawStuckArrow } from "./weapons_projectiles.js";
export { drawSpikeDestruction } from "./weapons_destruction.js";
export { drawWeaponDemo, weaponDemoEvents } from "./weapons_preview.js";

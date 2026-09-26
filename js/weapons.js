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
//   shot  — снаряд летить до шипа (speed — пікселів за секунду, arc — висота дуги)
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
    weapon_ball:    { mode: "shot", projectile: "ball", speed: 620, arc: 46, fx: "goal" },
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
    weapon_shuriken: { mode: "burst", projectile: "shuriken", speed: 1300, arc: 8, count: 3, gap: 0.08, fx: "shred" }
};

// Колір леза світлового меча для анімації розрізу
const SABER_FX_COLORS = { saber_green: "#39ff5a", saber_blue: "#3aa0ff", saber_red: "#ff2a2a" };

// Чи зброя — світловий меч (для малювання в руці й у польоті)
export function saberColor(id) {
    const spec = WEAPON_SPECS[id];
    return spec && spec.saber ? spec.saber : null;
}

// Звуки зброї за подіями: «fire» — постріл, кидок або промінь, «swing» — мах
// ближнього бою, «hit» — шип знищено. sound — ключ із assets.js (SOUND_FILES),
// offset/duration — яку частину файлу грати (довгі файли обрізаються з затуханням),
// volume — гучність, вирівняна за рівнем звуку стрибка.
export const WEAPON_SOUNDS = {
    weapon_sword: { swing: { sound: "sword", volume: 0.85 } },
    weapon_firesword: { swing: { sound: "fire_sword", duration: 0.9, volume: 0.65 } },
    weapon_axe: { hit: { sound: "axe", volume: 0.32 } },
    weapon_pickaxe: { hit: { sound: "pickaxe", volume: 0.9 } },
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
    weapon_shuriken: { fire: { sound: "bow", volume: 0.45 }, hit: { sound: "sword", volume: 0.5 } }
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
    shred: 0.8
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

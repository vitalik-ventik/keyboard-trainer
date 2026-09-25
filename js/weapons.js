// ============================================================
// weapons.js — зброя з магазину: як вона атакує та як це виглядає
// Рушій (engine.js) вирішує, КОЛИ шип знищено; тут — лише параметри
// зброї та малювання: зброя в руці кубика, снаряди, промінь лазера
// й анімації руйнування шипа (свої для кожної зброї).
// Координати екранні: groundY — лінія землі, вісь Y донизу.
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
    weapon_saber_red:   { mode: "axe", reach: 64, speed: 820, arc: 18, fx: "saber_red", saber: "#ff2a2a" }
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
    weapon_saber_red: { swing: { sound: "lightsaber", duration: 1.0, volume: 0.4 }, fire: { sound: "lightsaber", volume: 0.4 } }
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
    fling: 1.7
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

// ---------- Зброя в руці кубика ----------

// Меч: руків'я біля правого боку кубика, лезо — вздовж осі -Y після повороту
function drawSwordShape(ctx, s) {
    ctx.fillStyle = "#6a3a1a";
    ctx.fillRect(-s * 0.05, -s * 0.02, s * 0.1, s * 0.22);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(-s * 0.16, -s * 0.06, s * 0.32, s * 0.06);
    const blade = ctx.createLinearGradient(-s * 0.06, 0, s * 0.06, 0);
    blade.addColorStop(0, "#ffffff");
    blade.addColorStop(1, "#8ad8ff");
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.moveTo(-s * 0.06, -s * 0.06);
    ctx.lineTo(-s * 0.06, -s * 0.72);
    ctx.lineTo(0, -s * 0.84);
    ctx.lineTo(s * 0.06, -s * 0.72);
    ctx.lineTo(s * 0.06, -s * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(40, 90, 140, 0.5)";
    ctx.fillRect(-s * 0.01, -s * 0.7, s * 0.02, s * 0.62);
}

function drawAxeShape(ctx, s) {
    ctx.fillStyle = "#8a5a2a";
    ctx.fillRect(-s * 0.04, -s * 0.7, s * 0.08, s * 0.9);
    ctx.fillStyle = "#b8c4d0";
    ctx.beginPath();
    ctx.moveTo(s * 0.04, -s * 0.66);
    ctx.quadraticCurveTo(s * 0.42, -s * 0.72, s * 0.36, -s * 0.4);
    ctx.lineTo(s * 0.04, -s * 0.44);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(s * 0.3, -s * 0.66, s * 0.05, s * 0.24);
    ctx.fillStyle = "#6a7a8a";
    ctx.fillRect(-s * 0.1, -s * 0.62, s * 0.14, s * 0.14);
}

function drawPickaxeShape(ctx, s) {
    ctx.fillStyle = "#8a5a2a";
    ctx.fillRect(-s * 0.04, -s * 0.66, s * 0.08, s * 0.86);
    ctx.fillStyle = "#39d6d0";
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, -s * 0.46);
    ctx.quadraticCurveTo(0, -s * 0.8, s * 0.42, -s * 0.46);
    ctx.lineTo(s * 0.36, -s * 0.44);
    ctx.quadraticCurveTo(0, -s * 0.64, -s * 0.36, -s * 0.44);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#b8fff8";
    ctx.fillRect(-s * 0.08, -s * 0.68, s * 0.16, s * 0.06);
}

function drawBowShape(ctx, s, pull) {
    ctx.strokeStyle = "#a86a2a";
    ctx.lineWidth = Math.max(2, s * 0.08);
    ctx.beginPath();
    ctx.arc(-s * 0.1, 0, s * 0.42, -1.2, 1.2);
    ctx.stroke();
    const tipX = -s * 0.1 + Math.cos(1.2) * s * 0.42;
    const tipY = Math.sin(1.2) * s * 0.42;
    ctx.strokeStyle = "#f4f4f4";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tipX, -tipY);
    ctx.lineTo(-s * 0.1 - pull * s * 0.2, 0);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    if (pull > 0.2) {
        ctx.fillStyle = "#c8a060";
        ctx.fillRect(-s * 0.1 - pull * s * 0.2, -1, s * 0.6, 2);
    }
}

function drawPistolShape(ctx, s) {
    ctx.fillStyle = "#3a3f4a";
    ctx.fillRect(0, -s * 0.1, s * 0.46, s * 0.14);
    ctx.fillStyle = "#1a1d24";
    ctx.fillRect(0, 0, s * 0.14, s * 0.26);
    ctx.fillStyle = "#8a93a3";
    ctx.fillRect(s * 0.06, -s * 0.1, s * 0.36, s * 0.04);
}

function drawRifleShape(ctx, s) {
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(-s * 0.16, -s * 0.06, s * 0.2, s * 0.16);
    ctx.fillStyle = "#2a2e36";
    ctx.fillRect(0, -s * 0.1, s * 0.62, s * 0.14);
    ctx.fillRect(s * 0.22, s * 0.02, s * 0.1, s * 0.26);
    ctx.fillStyle = "#1a1d24";
    ctx.fillRect(s * 0.62, -s * 0.07, s * 0.16, s * 0.06);
    ctx.fillStyle = "#5a6070";
    ctx.fillRect(s * 0.1, -s * 0.16, s * 0.2, s * 0.06);
}

function drawLaserShape(ctx, s, time) {
    ctx.fillStyle = "#e6ecf5";
    ctx.fillRect(0, -s * 0.12, s * 0.5, s * 0.18);
    ctx.fillStyle = "#8a93a3";
    ctx.fillRect(0, s * 0.04, s * 0.14, s * 0.22);
    const glow = 0.6 + 0.4 * Math.sin(time * 0.01);
    ctx.fillStyle = "rgba(255, 40, 120, " + glow.toFixed(2) + ")";
    ctx.fillRect(s * 0.08, -s * 0.08, s * 0.3, s * 0.06);
    ctx.fillStyle = "#ff2e88";
    ctx.fillRect(s * 0.5, -s * 0.09, s * 0.08, s * 0.12);
}

function drawRocketLauncherShape(ctx, s, loaded) {
    ctx.fillStyle = "#4a6a3a";
    ctx.fillRect(-s * 0.3, -s * 0.16, s * 0.9, s * 0.22);
    ctx.fillStyle = "#2e4a22";
    ctx.fillRect(-s * 0.3, -s * 0.16, s * 0.08, s * 0.22);
    ctx.fillRect(s * 0.52, -s * 0.18, s * 0.08, s * 0.26);
    ctx.fillStyle = "#1a1d24";
    ctx.fillRect(s * 0.06, s * 0.06, s * 0.1, s * 0.2);
    if (loaded) {
        ctx.fillStyle = "#e8202a";
        ctx.beginPath();
        ctx.moveTo(s * 0.6, -s * 0.13);
        ctx.lineTo(s * 0.72, -s * 0.05);
        ctx.lineTo(s * 0.6, s * 0.03);
        ctx.closePath();
        ctx.fill();
    }
}

// Вогняний меч: розпечене лезо, по якому бігають язики полум'я
// Світловий меч: металеве руків'я й лезо, що світиться й ледь тремтить
function drawSaberShape(ctx, s, time, color) {
    ctx.fillStyle = "#9aa0ac";
    ctx.fillRect(-s * 0.06, -s * 0.04, s * 0.12, s * 0.28);
    ctx.fillStyle = "#3a3e48";
    ctx.fillRect(-s * 0.06, s * 0.04, s * 0.12, s * 0.04);
    ctx.fillRect(-s * 0.06, s * 0.14, s * 0.12, s * 0.04);
    ctx.fillStyle = "#e0303a";
    ctx.fillRect(s * 0.03, 0, s * 0.03, s * 0.04);
    // Лезо ледь помітно тремтить (утричі слабше й повільніше, ніж спершу) і м'яко «дихає» сяйвом
    const len = s * 1.05 * (1 + Math.sin(time * 0.03) * 0.013);
    const glow = 0.32 + 0.06 * Math.sin(time * 0.006);
    ctx.globalAlpha *= glow;
    ctx.fillStyle = color;
    ctx.fillRect(-s * 0.1, -len - s * 0.04, s * 0.2, len);
    ctx.globalAlpha /= glow;
    ctx.fillStyle = color;
    ctx.fillRect(-s * 0.05, -len, s * 0.1, len - s * 0.04);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-s * 0.02, -len + s * 0.02, s * 0.04, len - s * 0.08);
}

function drawFireSwordShape(ctx, s, time) {
    ctx.fillStyle = "#3a1a0a";
    ctx.fillRect(-s * 0.05, -s * 0.02, s * 0.1, s * 0.22);
    ctx.fillStyle = "#ff5a1a";
    ctx.fillRect(-s * 0.18, -s * 0.07, s * 0.36, s * 0.07);
    const blade = ctx.createLinearGradient(0, -s * 0.9, 0, 0);
    blade.addColorStop(0, "#fff4a0");
    blade.addColorStop(0.5, "#ffb81a");
    blade.addColorStop(1, "#ff3a1a");
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.moveTo(-s * 0.07, -s * 0.07);
    ctx.lineTo(-s * 0.07, -s * 0.76);
    ctx.lineTo(0, -s * 0.9);
    ctx.lineTo(s * 0.07, -s * 0.76);
    ctx.lineTo(s * 0.07, -s * 0.07);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 4; i++) {
        const fy = -s * (0.2 + i * 0.17);
        const flick = Math.sin(time * 0.02 + i * 1.9);
        drawFlameTongue(ctx, s * (0.08 + flick * 0.02), fy, s * 0.14, time + i * 97);
    }
}

// Вогнемет: балон за спиною, шланг і сопло з вогником
function drawFlamethrowerShape(ctx, s, time) {
    ctx.fillStyle = "#c8202a";
    ctx.fillRect(-s * 0.95, -s * 0.34, s * 0.22, s * 0.5);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(-s * 0.95, -s * 0.22, s * 0.22, s * 0.05);
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = Math.max(2, s * 0.06);
    ctx.beginPath();
    ctx.moveTo(-s * 0.84, s * 0.16);
    ctx.quadraticCurveTo(-s * 0.4, s * 0.45, 0, s * 0.08);
    ctx.stroke();
    ctx.fillStyle = "#5a606a";
    ctx.fillRect(0, -s * 0.1, s * 0.52, s * 0.16);
    ctx.fillStyle = "#3a3f4a";
    ctx.fillRect(s * 0.1, s * 0.04, s * 0.12, s * 0.22);
    ctx.fillStyle = "#8a93a3";
    ctx.fillRect(s * 0.44, -s * 0.13, s * 0.14, s * 0.22);
    // Черговий вогник біля сопла
    drawFlameTongue(ctx, s * 0.62, -s * 0.02, s * 0.12, time);
}

// Громовий молот: масивна голова з блискавкою
function drawThunderHammerShape(ctx, s, time) {
    ctx.fillStyle = "#6a4a2a";
    ctx.fillRect(-s * 0.04, -s * 0.5, s * 0.08, s * 0.72);
    ctx.fillStyle = "#b8c4d8";
    ctx.fillRect(-s * 0.26, -s * 0.78, s * 0.52, s * 0.3);
    ctx.fillStyle = "#8a96ac";
    ctx.fillRect(-s * 0.26, -s * 0.56, s * 0.52, s * 0.08);
    ctx.fillStyle = "#eef4ff";
    ctx.fillRect(-s * 0.26, -s * 0.78, s * 0.52, s * 0.05);
    const glow = 0.6 + 0.4 * Math.sin(time * 0.012);
    ctx.fillStyle = "rgba(120, 220, 255, " + glow.toFixed(2) + ")";
    ctx.beginPath();
    ctx.moveTo(s * 0.02, -s * 0.75);
    ctx.lineTo(-s * 0.08, -s * 0.62);
    ctx.lineTo(0, -s * 0.62);
    ctx.lineTo(-s * 0.04, -s * 0.51);
    ctx.lineTo(s * 0.08, -s * 0.65);
    ctx.lineTo(0, -s * 0.65);
    ctx.closePath();
    ctx.fill();
}

// Гравітаційна гармата: корпус із сяйною сферою-ядром
function drawGravityGunShape(ctx, s, time) {
    ctx.fillStyle = "#e6ecf5";
    ctx.fillRect(-s * 0.06, -s * 0.14, s * 0.46, s * 0.22);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(-s * 0.06, -s * 0.14, s * 0.46, s * 0.04);
    ctx.fillStyle = "#3a3f4a";
    ctx.fillRect(s * 0.02, s * 0.06, s * 0.12, s * 0.2);
    // Дві «клешні» на кінці
    ctx.fillStyle = "#9aa4b8";
    ctx.fillRect(s * 0.4, -s * 0.2, s * 0.2, s * 0.06);
    ctx.fillRect(s * 0.4, s * 0.08, s * 0.2, s * 0.06);
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.008);
    const orb = ctx.createRadialGradient(s * 0.5, -s * 0.03, 0, s * 0.5, -s * 0.03, s * 0.14);
    orb.addColorStop(0, "rgba(255, 255, 255, 1)");
    orb.addColorStop(0.5, "rgba(170, 120, 255, " + (0.7 + 0.3 * pulse).toFixed(2) + ")");
    orb.addColorStop(1, "rgba(90, 60, 255, 0)");
    ctx.fillStyle = orb;
    ctx.beginPath();
    ctx.arc(s * 0.5, -s * 0.03, s * 0.14, 0, Math.PI * 2);
    ctx.fill();
}

// Язик полум'я (основа в x, y; size — висота), колір від жовтого до червоного
export function drawFlameTongue(ctx, x, y, size, time) {
    const sway = Math.sin(time * 0.017) * size * 0.2;
    const hgt = size * (0.8 + 0.3 * Math.abs(Math.sin(time * 0.023)));
    ctx.fillStyle = "rgba(255, 90, 20, 0.85)";
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35, y);
    ctx.quadraticCurveTo(x - size * 0.3, y - hgt * 0.6, x + sway, y - hgt);
    ctx.quadraticCurveTo(x + size * 0.3, y - hgt * 0.6, x + size * 0.35, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255, 220, 90, 0.9)";
    ctx.beginPath();
    ctx.moveTo(x - size * 0.16, y);
    ctx.quadraticCurveTo(x - size * 0.14, y - hgt * 0.4, x + sway * 0.6, y - hgt * 0.62);
    ctx.quadraticCurveTo(x + size * 0.14, y - hgt * 0.4, x + size * 0.16, y);
    ctx.closePath();
    ctx.fill();
}

// Футбольний м'яч у локальних координатах (центр 0,0), радіус r
export function drawFootball(ctx, r, rot) {
    ctx.save();
    ctx.rotate(rot || 0);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
        const px = Math.cos(a) * r * 0.36;
        const py = Math.sin(a) * r * 0.36;
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

// Спалах пострілу біля дула
function drawMuzzleFlash(ctx, x, y, size, strength) {
    if (strength <= 0) {
        return;
    }
    ctx.fillStyle = "rgba(255, 230, 120, " + strength.toFixed(2) + ")";
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.5);
    ctx.lineTo(x + size * 1.3, y);
    ctx.lineTo(x, y + size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, " + strength.toFixed(2) + ")";
    ctx.fillRect(x, y - size * 0.15, size * 0.6, size * 0.3);
}

// Зброя в руці кубика (локальні координати кубика, центр 0,0, розмір s).
// pose: { raise 0..1 — замах, swing 0..1 або -1, recoil 0..1, away — зброю кинуто }
export function drawHeldWeapon(ctx, id, s, pose, time) {
    if (!id || id === "weapon_none" || !WEAPON_SPECS[id]) {
        return;
    }
    const raise = pose ? pose.raise || 0 : 0;
    const swing = pose && pose.swing >= 0 ? pose.swing : -1;
    const recoil = pose ? pose.recoil || 0 : 0;
    ctx.save();
    const saber = saberColor(id);
    if (id === "weapon_sword" || id === "weapon_axe" || id === "weapon_pickaxe" || id === "weapon_firesword" || id === "weapon_thunder" || saber) {
        if (pose && pose.away) {
            ctx.restore();
            return;
        }
        // Кут: у спокої злегка вперед, у замаху — назад за голову, удар — різкий мах уперед
        let angle = 0.35 - raise * 1.05;
        if (swing >= 0) {
            const k = 1 - Math.pow(1 - swing, 3);
            angle = -0.9 + k * 2.6;
            // Дуга-слід удару
            if (saber) {
                ctx.strokeStyle = saber;
                ctx.globalAlpha = 0.85 * (1 - swing);
            } else {
                ctx.strokeStyle = id === "weapon_firesword"
                    ? "rgba(255, 150, 40, " + (0.85 * (1 - swing)).toFixed(2) + ")"
                    : "rgba(220, 245, 255, " + (0.8 * (1 - swing)).toFixed(2) + ")";
            }
            ctx.lineWidth = s * 0.14;
            ctx.beginPath();
            ctx.arc(s * 0.42, s * 0.12, s * 0.8, -Math.PI / 2 - 0.9, -Math.PI / 2 + angle);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        ctx.translate(s * 0.42, s * 0.12);
        ctx.rotate(angle);
        if (saber) {
            drawSaberShape(ctx, s, time, saber);
        } else if (id === "weapon_sword") {
            drawSwordShape(ctx, s);
        } else if (id === "weapon_firesword") {
            drawFireSwordShape(ctx, s, time);
        } else if (id === "weapon_thunder") {
            drawThunderHammerShape(ctx, s, time);
        } else if (id === "weapon_axe") {
            drawAxeShape(ctx, s);
        } else {
            drawPickaxeShape(ctx, s);
        }
    } else if (id === "weapon_bow") {
        ctx.translate(s * 0.62, 0);
        drawBowShape(ctx, s, recoil > 0 ? 1 - recoil : 0.3);
    } else if (id === "weapon_ball") {
        // М'яч лежить перед кубиком, доки його не пнули
        if (recoil <= 0) {
            ctx.translate(s * 0.72, s * 0.3);
            drawFootball(ctx, s * 0.2, 0);
        }
    } else {
        ctx.translate(s * 0.36 - recoil * s * 0.14, s * 0.12);
        ctx.rotate(-recoil * 0.25);
        if (id === "weapon_pistol") {
            drawPistolShape(ctx, s);
            drawMuzzleFlash(ctx, s * 0.46, -s * 0.03, s * 0.3, recoil > 0.55 ? (recoil - 0.55) * 2.2 : 0);
        } else if (id === "weapon_rifle") {
            drawRifleShape(ctx, s);
            drawMuzzleFlash(ctx, s * 0.78, -s * 0.04, s * 0.34, recoil > 0.55 ? (recoil - 0.55) * 2.2 : 0);
        } else if (id === "weapon_laser") {
            drawLaserShape(ctx, s, time);
        } else if (id === "weapon_flamethrower") {
            drawFlamethrowerShape(ctx, s, time);
        } else if (id === "weapon_gravity") {
            drawGravityGunShape(ctx, s, time);
        } else if (id === "weapon_rocket") {
            drawRocketLauncherShape(ctx, s, recoil <= 0);
        }
    }
    ctx.restore();
}

// ---------- Снаряди ----------

// kind: arrow / bullet / rocket / axe / ball. angle — напрям польоту, age — секунди польоту.
// prev — попередні точки польоту (для диму ракети).
export function drawProjectile(ctx, kind, x, y, angle, age, s, prev, color) {
    ctx.save();
    if (kind === "rocket" && prev) {
        for (let i = 0; i < prev.length; i++) {
            const p = prev[i];
            const a = 0.45 * (1 - i / prev.length);
            ctx.fillStyle = "rgba(200, 200, 210, " + a.toFixed(2) + ")";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3 + i * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.translate(x, y);
    if (kind === "axe") {
        ctx.rotate(age * 22);
        ctx.translate(0, s * 0.3);
        drawAxeShape(ctx, s);
    } else if (kind === "saber") {
        // Меч летить, обертаючись навколо центру, і лишає світлий слід
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = color || "#39ff5a";
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.62, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.rotate(age * 20);
        ctx.translate(0, s * 0.45);
        drawSaberShape(ctx, s * 0.85, age * 1000, color || "#39ff5a");
    } else if (kind === "ball") {
        drawFootball(ctx, s * 0.2, age * 18);
    } else {
        ctx.rotate(angle);
        if (kind === "arrow") {
            ctx.fillStyle = "#c8a060";
            ctx.fillRect(-s * 0.6, -1, s * 0.6, 2);
            ctx.fillStyle = "#b8c4d0";
            ctx.beginPath();
            ctx.moveTo(0, -4);
            ctx.lineTo(8, 0);
            ctx.lineTo(0, 4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-s * 0.6, -4, 6, 3);
            ctx.fillRect(-s * 0.6, 1, 6, 3);
        } else if (kind === "bullet") {
            const g = ctx.createLinearGradient(-28, 0, 4, 0);
            g.addColorStop(0, "rgba(255, 220, 120, 0)");
            g.addColorStop(1, "rgba(255, 250, 200, 1)");
            ctx.fillStyle = g;
            ctx.fillRect(-28, -1.5, 32, 3);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, -2, 5, 4);
        } else if (kind === "rocket") {
            const flame = 6 + Math.sin(age * 60) * 3;
            ctx.fillStyle = "#ffb81a";
            ctx.beginPath();
            ctx.moveTo(-s * 0.3, -3);
            ctx.lineTo(-s * 0.3 - flame, 0);
            ctx.lineTo(-s * 0.3, 3);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#dcdcdc";
            ctx.fillRect(-s * 0.3, -4, s * 0.4, 8);
            ctx.fillStyle = "#e8202a";
            ctx.beginPath();
            ctx.moveTo(s * 0.1, -4);
            ctx.lineTo(s * 0.24, 0);
            ctx.lineTo(s * 0.1, 4);
            ctx.closePath();
            ctx.fill();
            ctx.fillRect(-s * 0.3, -7, 6, 3);
            ctx.fillRect(-s * 0.3, 4, 6, 3);
        }
    }
    ctx.restore();
}

// Промінь лазера від дула до шипа; t — від 0 до 1 за час пострілу
export function drawLaserBeam(ctx, x1, y1, x2, y2, t, time) {
    const a = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
    const w = 3 + 5 * a + Math.sin(time * 0.08) * 1.2;
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 46, 136, " + (0.35 * a).toFixed(2) + ")";
    ctx.lineWidth = w * 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 120, 190, " + a.toFixed(2) + ")";
    ctx.lineWidth = w;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, " + a.toFixed(2) + ")";
    ctx.lineWidth = Math.max(1, w * 0.35);
    ctx.stroke();
    // Спалах у точці влучання
    ctx.fillStyle = "rgba(255, 220, 240, " + (0.8 * a).toFixed(2) + ")";
    ctx.beginPath();
    ctx.arc(x2, y2, 6 + 6 * a, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// Струмінь вогнемета: хвиля язиків полум'я від сопла до шипа
function drawFlameStream(ctx, x1, y1, x2, y2, t, time) {
    const reach = Math.min(1, t / 0.3);
    const fade = t > 0.75 ? Math.max(0, 1 - (t - 0.75) / 0.25) : 1;
    const n = 14;
    ctx.save();
    for (let i = n - 1; i >= 0; i--) {
        const k = i / (n - 1);
        if (k > reach) {
            continue;
        }
        const px = x1 + (x2 - x1) * k;
        const wob = Math.sin(time * 0.03 + i * 1.7) * (2 + k * 6);
        const py = y1 + (y2 - y1) * k + wob;
        const r = 3 + k * 11;
        const colors = ["255, 240, 150", "255, 180, 40", "255, 90, 20", "200, 40, 10"];
        const ci = Math.min(3, Math.floor(k * 4));
        ctx.fillStyle = "rgba(" + colors[ci] + ", " + (0.85 * fade).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
    }
    // Дим на кінці струменя
    ctx.fillStyle = "rgba(80, 70, 70, " + (0.35 * fade * reach).toFixed(2) + ")";
    ctx.beginPath();
    ctx.arc(x2 + 6, y2 - 16 - t * 20, 9 + t * 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// Блискавка з неба в шип
function drawThunderBolt(ctx, x2, y2, t, time) {
    const a = t < 0.1 ? t / 0.1 : Math.max(0, 1 - (t - 0.1) / 0.9);
    if (a <= 0) {
        return;
    }
    const top = y2 - 420;
    const seg = 9;
    const seed = Math.floor(time / 60);
    const pts = [];
    for (let i = 0; i <= seg; i++) {
        const k = i / seg;
        const jitter = i === 0 || i === seg ? 0 : (hashRand(seed * 13 + i) - 0.5) * 36;
        pts.push([x2 + jitter, top + (y2 - top) * k]);
    }
    ctx.save();
    ctx.lineJoin = "round";
    const passes = [[14, "rgba(120, 200, 255, " + (0.35 * a).toFixed(2) + ")"], [6, "rgba(170, 230, 255, " + (0.8 * a).toFixed(2) + ")"], [2.5, "rgba(255, 255, 255, " + a.toFixed(2) + ")"]];
    for (const pass of passes) {
        ctx.strokeStyle = pass[1];
        ctx.lineWidth = pass[0];
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.stroke();
    }
    const flash = ctx.createRadialGradient(x2, y2, 2, x2, y2, 70);
    flash.addColorStop(0, "rgba(255, 255, 255, " + (0.9 * a).toFixed(2) + ")");
    flash.addColorStop(1, "rgba(120, 200, 255, 0)");
    ctx.fillStyle = flash;
    ctx.fillRect(x2 - 70, y2 - 70, 140, 140);
    ctx.restore();
}

// Гравітаційний захват: промінь витягується з гармати до шипа, тримає його,
// поки той піднімається, і гасне в мить кидка. t — від 0 до 1 за весь час променя.
function drawGravityTether(ctx, x1, y1, x2, y2, t, time, grabFrac) {
    const ext = clamp01(t / grabFrac);
    const a = t > 0.94 ? clamp01((1 - t) / 0.06) : 1;
    if (a <= 0) {
        return;
    }
    const ex = x1 + (x2 - x1) * ext;
    const ey = y1 + (y2 - y1) * ext;
    ctx.save();
    ctx.lineCap = "round";
    // Широке сяйво й хвиляста серцевина
    ctx.strokeStyle = "rgba(140, 90, 255, " + (0.3 * a).toFixed(2) + ")";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.strokeStyle = "rgba(200, 170, 255, " + (0.9 * a).toFixed(2) + ")";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const n = 20;
    for (let i = 0; i <= n; i++) {
        const k = i / n;
        const px = x1 + (ex - x1) * k;
        const py = y1 + (ey - y1) * k + Math.sin(k * 14 - time * 0.03) * 3.5 * Math.sin(Math.PI * k);
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
    // Кільця, що біжать від гармати до шипа
    for (let i = 0; i < 3; i++) {
        const k = ((time * 0.002) + i / 3) % 1;
        if (k > ext) {
            continue;
        }
        const px = x1 + (x2 - x1) * k;
        const py = y1 + (y2 - y1) * k;
        ctx.strokeStyle = "rgba(220, 200, 255, " + (0.7 * a * (1 - k)).toFixed(2) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(px, py, 4, 8 + k * 6, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Захват на кінці променя, коли він дотягнувся до шипа
    if (ext >= 1) {
        const pulse = 0.6 + 0.4 * Math.sin(time * 0.02);
        const grip = ctx.createRadialGradient(ex, ey, 1, ex, ey, 22);
        grip.addColorStop(0, "rgba(255, 255, 255, " + (0.8 * a * pulse).toFixed(2) + ")");
        grip.addColorStop(0.4, "rgba(180, 140, 255, " + (0.5 * a).toFixed(2) + ")");
        grip.addColorStop(1, "rgba(120, 80, 255, 0)");
        ctx.fillStyle = grip;
        ctx.fillRect(ex - 22, ey - 22, 44, 44);
    }
    ctx.restore();
}

// Дія зброї на відстані: вигляд залежить від зброї
// grabFrac — для гравітаційної гармати: частка часу, за яку промінь дотягується до шипа
export function drawBeam(ctx, kind, x1, y1, x2, y2, t, time, grabFrac) {
    if (kind === "flame") {
        drawFlameStream(ctx, x1, y1, x2, y2, t, time);
    } else if (kind === "thunder") {
        drawThunderBolt(ctx, x2, y2, t, time);
    } else if (kind === "gravity") {
        drawGravityTether(ctx, x1, y1, x2, y2, t, time, grabFrac || GRAVITY_GRAB / (GRAVITY_GRAB + GRAVITY_LIFT));
    } else {
        drawLaserBeam(ctx, x1, y1, x2, y2, t, time);
    }
}

// Стріла, що застрягла в землі й дрижить
export function drawStuckArrow(ctx, x, groundY, t, s) {
    const wobble = Math.sin(t * 40) * Math.max(0, 0.3 - t) * 0.8;
    const alpha = t > 1.6 ? Math.max(0, 1 - (t - 1.6) / 0.4) : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, groundY);
    ctx.rotate(0.5 + wobble);
    ctx.fillStyle = "#c8a060";
    ctx.fillRect(-1, -s * 0.6, 2, s * 0.6);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-4, -s * 0.6, 3, 6);
    ctx.fillRect(1, -s * 0.6, 3, 6);
    ctx.restore();
}

// ---------- Руйнування шипа ----------

// Кругла півплощина для відсікання: усе з одного боку прямої (x1,y1)-(x2,y2)
function clipHalfPlane(ctx, x1, y1, x2, y2, side) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len * side * 400;
    const ny = dx / len * side * 400;
    const ex = dx / len * 400;
    const ey = dy / len * 400;
    ctx.beginPath();
    ctx.moveTo(x1 - ex, y1 - ey);
    ctx.lineTo(x2 + ex, y2 + ey);
    ctx.lineTo(x2 + ex + nx, y2 + ey + ny);
    ctx.lineTo(x1 - ex + nx, y1 - ey + ny);
    ctx.closePath();
    ctx.clip();
}

// Малює анімацію руйнування. drawShape(ctx) малює цілий шип на його місці.
// x — центр шипа на екрані, hw — половина ширини, h — висота.
// opts (необов'язково): { pullX } — куди гравітаційна гармата притягує шип (x точки перед кубиком)
export function drawSpikeDestruction(ctx, kind, t, x, groundY, hw, h, drawShape, opts) {
    const dur = DESTRUCTION_TIME[kind] || 0.5;
    const k = clamp01(t / dur);
    ctx.save();
    if (kind === "slice") {
        // Меч розрізає шип навскіс: верх з'їжджає й падає, низ осідає
        const x1 = x - hw * 1.2;
        const y1 = groundY - h * 0.25;
        const x2 = x + hw * 1.2;
        const y2 = groundY - h * 0.7;
        const fade = 1 - clamp01((t - 0.35) / 0.4);
        ctx.globalAlpha = fade;
        ctx.save();
        clipHalfPlane(ctx, x1, y1, x2, y2, -1);
        ctx.translate(0, t * t * 30);
        drawShape(ctx);
        ctx.restore();
        ctx.save();
        clipHalfPlane(ctx, x1, y1, x2, y2, 1);
        ctx.translate(t * 70, -t * 40 + t * t * 260);
        ctx.translate(x, groundY - h * 0.6);
        ctx.rotate(t * 2.2);
        ctx.translate(-x, -(groundY - h * 0.6));
        drawShape(ctx);
        ctx.restore();
        ctx.globalAlpha = 1;
        // Біла лінія розрізу
        if (t < 0.22) {
            const a = 1 - t / 0.22;
            ctx.strokeStyle = "rgba(255, 255, 255, " + a.toFixed(2) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x1 - 12, y1 + 5);
            ctx.lineTo(x2 + 12, y2 - 5);
            ctx.stroke();
        }
    } else if (kind === "split") {
        // Сокира розколює шип навпіл: половинки розвалюються в боки
        const ang = Math.min(1.5, t * t * 5);
        const fade = 1 - clamp01((t - 0.45) / 0.35);
        ctx.globalAlpha = fade;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - 200, groundY - 300, 200, 320);
        ctx.clip();
        ctx.translate(x - hw, groundY);
        ctx.rotate(-ang);
        ctx.translate(-(x - hw) - t * 10, -groundY);
        drawShape(ctx);
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, groundY - 300, 200, 320);
        ctx.clip();
        ctx.translate(x + hw, groundY);
        ctx.rotate(ang);
        ctx.translate(-(x + hw) + t * 10, -groundY);
        drawShape(ctx);
        ctx.restore();
        ctx.globalAlpha = 1;
        if (t < 0.18) {
            ctx.fillStyle = "rgba(255, 255, 255, " + (1 - t / 0.18).toFixed(2) + ")";
            ctx.fillRect(x - 2, groundY - h - 10, 4, h + 10);
        }
    } else if (kind === "shatter" || kind === "pop") {
        // Лук і пістолет: шип спалахує й розлітається на уламки (уламки — у рушії)
        const grow = 1 + k * 0.25;
        ctx.globalAlpha = 1 - k;
        ctx.translate(x, groundY - h * 0.4);
        ctx.scale(grow, grow);
        ctx.translate(-x, -(groundY - h * 0.4));
        drawShape(ctx);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(255, 255, 255, " + (0.8 * (1 - k)).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(x, groundY - h * 0.45, h * (0.3 + k * 0.5), 0, Math.PI * 2);
        ctx.fill();
    } else if (kind === "crumble") {
        // Автомат: остання чверть осідає в землю
        ctx.beginPath();
        ctx.rect(x - hw - 10, groundY - h * 0.25, hw * 2 + 20, h * 0.25);
        ctx.clip();
        ctx.globalAlpha = 1 - k;
        ctx.translate(0, k * h * 0.25);
        drawShape(ctx);
    } else if (kind === "melt") {
        // Лазер: шип розжарюється, розпливається й осідає попелом
        const heat = clamp01(t / 0.3);
        const squash = t < 0.3 ? 1 : 1 - clamp01((t - 0.3) / 0.6);
        if (squash > 0.02) {
            ctx.save();
            ctx.translate(x, groundY);
            ctx.scale(1 + (1 - squash) * 0.5, squash);
            ctx.translate(-x, -groundY);
            drawShape(ctx);
            ctx.restore();
            // Розжарення поверх шипа
            ctx.save();
            ctx.translate(x, groundY);
            ctx.scale(1 + (1 - squash) * 0.5, squash);
            const glow = ctx.createRadialGradient(0, -h * 0.4, 2, 0, -h * 0.4, h * 0.9);
            glow.addColorStop(0, "rgba(255, 240, 160, " + (0.9 * heat).toFixed(2) + ")");
            glow.addColorStop(0.5, "rgba(255, 120, 20, " + (0.7 * heat).toFixed(2) + ")");
            glow.addColorStop(1, "rgba(255, 40, 0, 0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.moveTo(-hw, 0);
            ctx.lineTo(0, -h);
            ctx.lineTo(hw, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        // Калюжа розплаву, що холоне
        const pool = clamp01((t - 0.3) / 0.3) * (1 - clamp01((t - 0.7) / 0.3));
        if (pool > 0) {
            ctx.fillStyle = "rgba(255, 110, 20, " + (0.8 * pool).toFixed(2) + ")";
            ctx.beginPath();
            ctx.ellipse(x, groundY - 2, hw * 1.3, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (kind === "blast") {
        // Ракета: великий вибух, дим і воронка, що лишається на землі
        const craterA = 1 - clamp01((t - 1.8) / 0.8);
        ctx.fillStyle = "rgba(20, 12, 8, " + (0.75 * craterA).toFixed(2) + ")";
        ctx.beginPath();
        ctx.ellipse(x, groundY + 1, hw * 1.6, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 120, 30, " + (0.6 * craterA * (1 - clamp01(t / 1.2))).toFixed(2) + ")";
        ctx.beginPath();
        ctx.ellipse(x, groundY, hw * 1.1, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        if (t < 0.9) {
            const e = t / 0.9;
            // Ударна хвиля
            ctx.strokeStyle = "rgba(255, 255, 255, " + (0.7 * (1 - e)).toFixed(2) + ")";
            ctx.lineWidth = 4 * (1 - e) + 1;
            ctx.beginPath();
            ctx.arc(x, groundY - h * 0.4, 20 + e * 140, 0, Math.PI * 2);
            ctx.stroke();
            // Вогняні кулі
            for (let i = 0; i < 9; i++) {
                const a = hashRand(i + 3) * Math.PI * 2;
                const d = (0.3 + hashRand(i + 11) * 0.7) * 60 * Math.sqrt(e);
                const rr = (14 + hashRand(i + 21) * 16) * (1 - e * 0.7);
                const cx = x + Math.cos(a) * d;
                const cy = groundY - h * 0.5 + Math.sin(a) * d * 0.7 - e * 30;
                const colors = ["rgba(255, 240, 160, ", "rgba(255, 170, 40, ", "rgba(255, 80, 20, "];
                ctx.fillStyle = colors[i % 3] + (1 - e).toFixed(2) + ")";
                ctx.beginPath();
                ctx.arc(cx, cy, rr, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        // Дим, що здіймається
        if (t > 0.3 && t < 2.2) {
            const sm = (t - 0.3) / 1.9;
            for (let i = 0; i < 5; i++) {
                const cx = x + (hashRand(i + 40) - 0.5) * 50 + sm * 15;
                const cy = groundY - h * 0.6 - sm * 90 - i * 12;
                ctx.fillStyle = "rgba(90, 90, 100, " + (0.45 * (1 - sm)).toFixed(2) + ")";
                ctx.beginPath();
                ctx.arc(cx, cy, 12 + sm * 18 + i * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } else if (kind === "break") {
        // Кирка: шип тріскається, розсипається блоками, випадає «предмет»
        if (t < 0.18) {
            drawShape(ctx);
            ctx.strokeStyle = "rgba(20, 10, 10, 0.9)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            const stages = 1 + Math.floor(t / 0.06);
            for (let i = 0; i < stages * 2; i++) {
                const a = hashRand(i + 5) * Math.PI * 2;
                const len = h * (0.2 + hashRand(i + 9) * 0.25);
                ctx.moveTo(x, groundY - h * 0.4);
                ctx.lineTo(x + Math.cos(a) * len, groundY - h * 0.4 + Math.sin(a) * len * 0.8);
            }
            ctx.stroke();
        }
        // Предмет-кубик підстрибує на місці шипа
        const it = t - 0.12;
        if (it > 0) {
            const bounceT = it % 0.45;
            const amp = 40 * Math.pow(0.45, Math.floor(it / 0.45));
            const y = groundY - 8 - amp * 4 * (bounceT / 0.45) * (1 - bounceT / 0.45);
            const alpha = 1 - clamp01((t - 1.0) / 0.3);
            ctx.globalAlpha = alpha;
            ctx.translate(x, y);
            ctx.rotate(Math.sin(it * 3) * 0.3);
            ctx.fillStyle = "#39d6d0";
            ctx.fillRect(-7, -7, 14, 14);
            ctx.fillStyle = "#b8fff8";
            ctx.fillRect(-7, -7, 6, 6);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-7, -7, 14, 14);
        }
    } else if (kind === "goal") {
        // М'яч: шип перекидається назад і відлітає, спалахує «ГОЛ!»
        ctx.save();
        ctx.globalAlpha = 1 - clamp01((t - 0.7) / 0.4);
        ctx.translate(x + hw + t * 200, groundY - t * 260 + t * t * 240);
        ctx.rotate(t * 7);
        ctx.translate(-(x + hw), -groundY);
        drawShape(ctx);
        ctx.restore();
        ctx.save();
        ctx.translate(x + 40 + t * 140, groundY - h * 0.5 - t * 60);
        drawFootball(ctx, 8, t * 20);
        ctx.restore();
        const pop = t < 0.2 ? t / 0.2 : 1;
        const textA = 1 - clamp01((t - 0.8) / 0.3);
        ctx.globalAlpha = textA;
        ctx.translate(x, groundY - h - 46);
        ctx.scale(0.6 + pop * 0.6, 0.6 + pop * 0.6);
        ctx.font = "900 24px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#0a1a0a";
        ctx.strokeText("ГОЛ!", 0, 0);
        ctx.fillStyle = "#39ff88";
        ctx.fillText("ГОЛ!", 0, 0);
    } else if (kind === "burn") {
        // Вогнемет: шип охоплює полум'я, він чорніє, осідає й лишає жарини
        const char = clamp01(t / 0.6);
        const sink = clamp01((t - 0.55) / 0.6);
        if (sink < 1) {
            ctx.save();
            ctx.translate(x, groundY);
            ctx.scale(1, 1 - sink * 0.9);
            ctx.translate(-x, -groundY);
            drawShape(ctx);
            // Обвуглення поверх шипа
            ctx.fillStyle = "rgba(20, 10, 6, " + (0.85 * char).toFixed(2) + ")";
            ctx.beginPath();
            ctx.moveTo(x - hw, groundY);
            ctx.lineTo(x, groundY - h);
            ctx.lineTo(x + hw, groundY);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        // Язики полум'я на шипі
        const fireA = t < 1.0 ? 1 : Math.max(0, 1 - (t - 1.0) / 0.4);
        ctx.globalAlpha = fireA;
        for (let i = 0; i < 5; i++) {
            const fx = x + (i - 2) * hw * 0.4;
            const fy = groundY - h * (1 - sink * 0.9) * (0.25 + 0.6 * (1 - Math.abs(i - 2) / 2.5));
            drawFlameTongue(ctx, fx, Math.min(groundY, fy + h * 0.2), h * (0.45 + 0.2 * hashRand(i)), t * 1000 + i * 131);
        }
        ctx.globalAlpha = 1;
        // Купка жару
        const pile = clamp01((t - 0.8) / 0.2) * (1 - clamp01((t - 1.1) / 0.3));
        if (pile > 0) {
            ctx.fillStyle = "rgba(255, 110, 30, " + (0.8 * pile).toFixed(2) + ")";
            ctx.beginPath();
            ctx.ellipse(x, groundY - 2, hw, 5, 0, Math.PI, 0);
            ctx.fill();
        }
    } else if (SABER_FX_COLORS[kind]) {
        // Світловий меч: розріз навскіс, краї розрізу розжарені кольором леза
        const color = SABER_FX_COLORS[kind];
        const x1 = x - hw * 1.2;
        const y1 = groundY - h * 0.25;
        const x2 = x + hw * 1.2;
        const y2 = groundY - h * 0.7;
        const fade = 1 - clamp01((t - 0.45) / 0.45);
        ctx.globalAlpha = fade;
        ctx.save();
        clipHalfPlane(ctx, x1, y1, x2, y2, -1);
        ctx.translate(0, t * t * 30);
        drawShape(ctx);
        ctx.restore();
        ctx.save();
        clipHalfPlane(ctx, x1, y1, x2, y2, 1);
        ctx.translate(t * 80, -t * 50 + t * t * 260);
        ctx.translate(x, groundY - h * 0.6);
        ctx.rotate(t * 2.4);
        ctx.translate(-x, -(groundY - h * 0.6));
        drawShape(ctx);
        ctx.restore();
        // Розжарений край на нижній половині поступово згасає
        ctx.strokeStyle = color;
        ctx.globalAlpha = fade * (1 - clamp01(t / 0.7));
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (t < 0.25) {
            const a = 1 - t / 0.25;
            ctx.strokeStyle = "rgba(255, 255, 255, " + a.toFixed(2) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x1 - 14, y1 + 6);
            ctx.lineTo(x2 + 14, y2 - 6);
            ctx.stroke();
        }
    } else if (kind === "fireslice") {
        // Вогняний меч: розріз навскіс, обидві половинки палають
        const x1 = x - hw * 1.2;
        const y1 = groundY - h * 0.25;
        const x2 = x + hw * 1.2;
        const y2 = groundY - h * 0.7;
        const fade = 1 - clamp01((t - 0.45) / 0.45);
        ctx.globalAlpha = fade;
        ctx.save();
        clipHalfPlane(ctx, x1, y1, x2, y2, -1);
        ctx.translate(0, t * t * 30);
        drawShape(ctx);
        ctx.restore();
        ctx.save();
        clipHalfPlane(ctx, x1, y1, x2, y2, 1);
        ctx.translate(t * 80, -t * 50 + t * t * 260);
        ctx.translate(x, groundY - h * 0.6);
        ctx.rotate(t * 2.6);
        ctx.translate(-x, -(groundY - h * 0.6));
        drawShape(ctx);
        drawFlameTongue(ctx, x, groundY - h * 0.5, h * 0.5, t * 1000);
        ctx.restore();
        drawFlameTongue(ctx, x - hw * 0.4, groundY - h * 0.3, h * 0.45, t * 1000 + 300);
        drawFlameTongue(ctx, x + hw * 0.3, groundY - h * 0.2, h * 0.35, t * 1000 + 600);
        ctx.globalAlpha = 1;
        if (t < 0.25) {
            const a = 1 - t / 0.25;
            ctx.strokeStyle = "rgba(255, 200, 60, " + a.toFixed(2) + ")";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(x1 - 14, y1 + 6);
            ctx.lineTo(x2 + 14, y2 - 6);
            ctx.stroke();
        }
    } else if (kind === "zap") {
        // Громовий молот: шип спалахує блакитним, по ньому біжать розряди, і він розлітається
        const grow = 1 + k * 0.2;
        ctx.save();
        ctx.globalAlpha = 1 - k;
        ctx.translate(x, groundY - h * 0.4);
        ctx.scale(grow, grow);
        ctx.translate(-x, -(groundY - h * 0.4));
        drawShape(ctx);
        ctx.fillStyle = "rgba(170, 230, 255, 0.6)";
        ctx.beginPath();
        ctx.moveTo(x - hw, groundY);
        ctx.lineTo(x, groundY - h);
        ctx.lineTo(x + hw, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = "rgba(220, 245, 255, " + (1 - k).toFixed(2) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            let px = x;
            let py = groundY - h * 0.5;
            ctx.moveTo(px, py);
            for (let j = 0; j < 3; j++) {
                px += Math.cos(i * 1.3 + j) * 10 + (hashRand(i * 7 + j + Math.floor(t * 30)) - 0.5) * 12;
                py += Math.sin(i * 1.3 + j) * 10 + (hashRand(i * 11 + j) - 0.5) * 12;
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
    } else if (kind === "fling") {
        // Гравітаційна гармата: промінь піднімає шип, притягує його до кубика й тримає,
        // погойдуючи; щойно промінь гасне — шип відстрілюється вперед і вгору, зникаючи зірочкою
        const liftPx = h * GRAVITY_LIFT_RATIO;
        const toPull = opts && typeof opts.pullX === "number" ? opts.pullX - x : 0;
        const hold = gravityHoldOffset(Math.min(t, GRAVITY_LIFT), h, toPull);
        let dx = hold.dx;
        let dy = hold.dy;
        // Поки тягне, шип нахиляється до кубика
        let spin = Math.sin(t * 14) * 0.12 * clamp01(t / 0.15) - 0.35 * clamp01(t / GRAVITY_LIFT) * (toPull < 0 ? 1 : 0);
        let scale = 1;
        const f = t - GRAVITY_LIFT;
        if (f > 0) {
            dx = hold.dx + f * 900 + f * f * 700;
            dy = -liftPx - f * 260 - f * f * 260;
            spin = f * 13;
            scale = Math.max(0, 1 - f * 1.1);
        }
        if (scale > 0.02) {
            const cy = groundY - h * 0.4 + dy;
            const glow = ctx.createRadialGradient(x + dx, cy, 2, x + dx, cy, h * 0.9 * scale);
            glow.addColorStop(0, "rgba(190, 150, 255, 0.55)");
            glow.addColorStop(1, "rgba(120, 80, 255, 0)");
            ctx.fillStyle = glow;
            ctx.fillRect(x + dx - h, cy - h, h * 2, h * 2);
            ctx.save();
            ctx.translate(x + dx, cy);
            ctx.rotate(spin);
            ctx.scale(scale, scale);
            ctx.translate(-x, -(groundY - h * 0.4));
            drawShape(ctx);
            ctx.restore();
        }
        // Спалах-кільце в мить пострілу — там, де шип висів перед кубиком
        if (f > 0 && f < 0.25) {
            const e = f / 0.25;
            ctx.strokeStyle = "rgba(220, 200, 255, " + (1 - e).toFixed(2) + ")";
            ctx.lineWidth = 3 * (1 - e) + 1;
            ctx.beginPath();
            ctx.arc(x + hold.dx, groundY - h * 0.4 - liftPx, 10 + e * 40, 0, Math.PI * 2);
            ctx.stroke();
            // Смуги швидкості позаду шипа
            ctx.fillStyle = "rgba(200, 180, 255, " + (0.7 * (1 - e)).toFixed(2) + ")";
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(x + dx - 30 - i * 14, groundY - h * 0.4 + dy - 8 + i * 8, 24, 2);
            }
        }
        // Зірочка там, де шип зник у небі
        const star = f > 0.6 ? Math.sin(clamp01((f - 0.6) / 0.35) * Math.PI) : 0;
        if (star > 0) {
            const sf = 0.72;
            const sx = x + hold.dx + sf * 900 + sf * sf * 700;
            const sy = groundY - h * 0.4 - liftPx - sf * 260 - sf * sf * 260;
            ctx.fillStyle = "rgba(255, 255, 255, " + star.toFixed(2) + ")";
            ctx.fillRect(sx - 1.5, sy - 9 * star, 3, 18 * star);
            ctx.fillRect(sx - 9 * star, sy - 1.5, 18 * star, 3);
        }
    }
    ctx.restore();
}

// ---------- Прев'ю зброї в магазині ----------

// Простий неоновий шип для прев'ю
function drawPreviewSpike(ctx, x, groundY, hw, h) {
    ctx.fillStyle = "#4a1030";
    ctx.strokeStyle = "#ff2ea6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - hw, groundY);
    ctx.lineTo(x, groundY - h);
    ctx.lineTo(x + hw, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// Зациклена сценка: шип під'їжджає, кубик атакує, шип руйнується.
// drawCube(ctx, size) малює кубик гравця в локальних координатах.
// План зацикленої сценки: коли натиснуто літеру (press), коли почався мах (swingAt),
// коли шип знищено (hitAt), як летить снаряд і скільки триває промінь
function planWeaponDemo(id, w, h, time) {
    const spec = WEAPON_SPECS[id];
    const groundY = h * 0.82;
    const s = 30;
    const scale = s / 42;
    const cubeX = 30;
    const hw = 13;
    const sh = 28;
    const cycle = 2.8;
    const u = (time / 1000) % cycle;
    const spikeSpeed = 45;
    const spikeAt = function (tt) { return w + 10 - spikeSpeed * tt; };
    let press = 0.7;
    // Сокира через раз показує обидва прийоми: кидок здалеку й удар зблизька
    if (spec && spec.mode === "axe" && Math.floor(time / 1000 / cycle) % 2 === 1) {
        press = (w + 10 - hw - cubeX - spec.reach * scale * 0.7) / spikeSpeed;
    }
    const muzzleX = cubeX + s * 0.6;
    const muzzleY = groundY - s * 0.55;

    // Коли шип буде знищено (hitAt) і як летить снаряд
    let hitAt = Infinity;
    let demoBeam = null;
    let swingAt = -1;
    let flight = null;
    if (spec) {
        const reach = spec.reach ? spec.reach * scale : 0;
        // Відстані рахуються від центру кубика до ближнього краю шипа, як у грі
        const gapAtPress = spikeAt(press) - hw - cubeX;
        if (spec.mode === "melee" || (spec.mode === "axe" && gapAtPress <= reach)) {
            swingAt = Math.max(press, (w + 10 - hw - cubeX - meleeTriggerGap(s, spikeSpeed)) / spikeSpeed);
            hitAt = swingAt + SWING_HIT;
        } else if (spec.mode === "beam") {
            demoBeam = spec.beam === "gravity"
                ? { hit: gravityGrabTime(spikeAt(press) - muzzleX), time: gravityGrabTime(spikeAt(press) - muzzleX) + GRAVITY_LIFT }
                : beamTiming(spec);
            hitAt = press + demoBeam.hit;
        } else {
            const tx = spikeAt(press);
            const dur = Math.max(0.08, (tx - muzzleX) / (spec.speed * 0.45));
            const count = spec.mode === "burst" ? spec.count : 1;
            flight = { tx: tx, dur: dur, count: count, gap: spec.gap || 0 };
            hitAt = press + dur + (count - 1) * (spec.gap || 0);
        }
    }
    return {
        spec: spec, groundY: groundY, s: s, scale: scale, cubeX: cubeX, hw: hw, sh: sh,
        cycle: cycle, u: u, spikeSpeed: spikeSpeed, spikeAt: spikeAt, press: press,
        muzzleX: muzzleX, muzzleY: muzzleY, hitAt: hitAt, demoBeam: demoBeam,
        swingAt: swingAt, flight: flight
    };
}

// Події сценки для звуку в preview: «fire» — постріл/кидок/промінь, «swing» — мах,
// «hit» — шип знищено. at — секунди від початку циклу, cycleIndex — номер циклу.
export function weaponDemoEvents(id, time) {
    const plan = planWeaponDemo(id, 150, 100, time);
    const events = [];
    if (plan.spec) {
        if (plan.swingAt >= 0) {
            events.push({ at: plan.swingAt, event: "swing" });
        } else {
            events.push({ at: plan.press, event: "fire" });
        }
        if (plan.hitAt < Infinity) {
            events.push({ at: plan.hitAt, event: "hit" });
        }
    }
    return { cycleIndex: Math.floor(time / 1000 / plan.cycle), cycle: plan.cycle, u: plan.u, events: events };
}

// Зациклена сценка: шип під'їжджає, кубик атакує, шип руйнується.
// drawCube(ctx, size) малює кубик гравця в локальних координатах.
export function drawWeaponDemo(ctx, id, w, h, time, drawCube) {
    const plan = planWeaponDemo(id, w, h, time);
    const { spec, groundY, s, scale, cubeX, hw, sh, u, spikeAt, press, muzzleX, muzzleY, hitAt, demoBeam, swingAt, flight } = plan;
    const spikeX = u < hitAt ? spikeAt(u) : spikeAt(hitAt);

    // Шип або його руйнування
    if (u < hitAt || !spec) {
        let chunks = 0;
        if (flight && flight.count > 1) {
            for (let i = 0; i < flight.count - 1; i++) {
                if (u >= press + flight.dur + i * flight.gap) {
                    chunks = i + 1;
                }
            }
        }
        ctx.save();
        if (chunks > 0) {
            ctx.beginPath();
            ctx.rect(0, groundY - sh * (1 - chunks * 0.22), w, h);
            ctx.clip();
        }
        drawPreviewSpike(ctx, spikeX, groundY, hw, sh);
        ctx.restore();
    } else {
        drawSpikeDestruction(ctx, spec.fx, u - hitAt, spikeX, groundY, hw, sh, function (c) {
            drawPreviewSpike(c, spikeX, groundY, hw, sh);
        }, { pullX: cubeX + s * 1.6 });
    }

    // Снаряди та промінь
    let away = false;
    let recoil = 0;
    if (spec && flight) {
        for (let i = 0; i < flight.count; i++) {
            const t0 = press + i * flight.gap;
            const ft = u - t0;
            if (ft >= 0 && ft < 0.3) {
                recoil = Math.max(recoil, 1 - ft / 0.3);
            }
            if (ft < 0) {
                continue;
            }
            const kind = spec.mode === "axe" ? (spec.saber ? "saber" : "axe") : spec.projectile;
            let px;
            let py;
            if (ft <= flight.dur) {
                const k = ft / flight.dur;
                px = muzzleX + (flight.tx - muzzleX) * k;
                py = muzzleY + (groundY - sh * 0.4 - muzzleY) * k - Math.sin(Math.PI * k) * (spec.arc || 0) * scale;
            } else if ((kind === "axe" || kind === "saber") && ft <= flight.dur + 0.32) {
                const k = (ft - flight.dur) / 0.32;
                px = flight.tx + (muzzleX - flight.tx) * k;
                py = groundY - sh * 0.4 + (muzzleY - (groundY - sh * 0.4)) * k - Math.sin(Math.PI * k) * 20;
            } else {
                continue;
            }
            if (kind === "axe" || kind === "saber") {
                away = true;
            }
            drawProjectile(ctx, kind, px, py, 0, ft, s, null, spec.saber);
        }
    }
    if (spec && spec.bolt && u >= hitAt && u < hitAt + BOLT_TIME) {
        drawBeam(ctx, "thunder", spikeX, groundY - sh * 0.45, spikeX, groundY - sh * 0.45, (u - hitAt) / BOLT_TIME, time);
    }
    if (spec && spec.mode === "beam" && demoBeam) {
        const bt = demoBeam.time;
        if (u >= press && u < press + bt) {
            const endX = u > hitAt ? spikeX : spikeAt(press);
            const hold = spec.beam === "gravity" && u > hitAt ? gravityHoldOffset(u - hitAt, sh, cubeX + s * 1.6 - endX) : { dx: 0, dy: 0 };
            drawBeam(ctx, spec.beam, muzzleX + s * 0.08, muzzleY, endX + hold.dx, groundY - sh * 0.45 + hold.dy, (u - press) / bt, time, demoBeam.hit / demoBeam.time);
            recoil = 1 - (u - press) / bt;
        }
    }

    // Кубик зі зброєю
    let raise = 0;
    let swing = -1;
    if (swingAt >= 0) {
        if (u >= press && u < swingAt) {
            raise = 1;
        } else if (u >= swingAt && u < swingAt + SWING_TIME) {
            swing = (u - swingAt) / SWING_TIME;
        }
    }
    ctx.save();
    ctx.translate(cubeX, groundY - s / 2);
    drawCube(ctx, s);
    drawHeldWeapon(ctx, id, s, { raise: raise, swing: swing, recoil: recoil, away: away }, time);
    ctx.restore();
}

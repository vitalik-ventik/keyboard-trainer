// ============================================================
// pet_gear.js — спорядження улюбленців під зброю кубика: одна накладка на групу зброї
// (шолом лицаря, каска шахтаря, сагайдак, м'ячик, каска з окулярами, пожежна каска,
// антени, сяйво світлового меча, реактивний ранець, пов'язка ніндзя, блискавки,
// невагомість). Кожен улюбленець задає точки кріплення в PET_ANCHORS
// ============================================================

import { PET_OUTLINE, fillEllipse, fillRoundRect, petLine } from "./pet_parts.js";

// Точки кріплення в частках розміру s (центр улюбленця — (0, 0)):
// head — середина верху голови (туди ставиться шапка), w — ширина голови,
// back — спина (сагайдак, ранець, щит)
export const PET_ANCHORS = {
    pet_puppy: { head: [0.2, -0.38], w: 0.4, back: [-0.2, 0.0] },
    pet_capybara: { head: [0.26, -0.32], w: 0.38, back: [-0.2, -0.1] },
    pet_duck: { head: [0.1, -0.47], w: 0.3, back: [-0.2, -0.08] },
    pet_llama: { head: [0.22, -0.57], w: 0.26, back: [-0.14, -0.08] },
    pet_alpaca: { head: [0.27, -0.42], w: 0.26, back: [-0.12, -0.08] },
    pet_turtle: { head: [0.33, -0.15], w: 0.24, back: [-0.07, -0.3] },
    pet_jellyfish: { head: [0.02, -0.3], w: 0.4, back: [-0.26, -0.05] },
    pet_dolphin: { head: [0.22, -0.16], w: 0.26, back: [-0.12, -0.16] },
    pet_kavunotto: { head: [0.3, -0.24], w: 0.3, back: [-0.12, -0.08] },
    pet_pelmenino: { head: [0.0, -0.52], w: 0.4, back: [-0.26, 0.05] },
    pet_capibaro_mandarino: { head: [0.24, -0.54], w: 0.34, back: [-0.2, -0.1] },
    pet_hamster: { head: [0.06, -0.28], w: 0.36, back: [-0.28, -0.04] },
    pet_slime: { head: [0.02, -0.04], w: 0.5, back: [-0.3, 0.22] },
    pet_bunny: { head: [0.2, -0.27], w: 0.3, back: [-0.2, 0.02] },
    pet_kitten: { head: [0.2, -0.32], w: 0.38, back: [-0.16, 0.02] },
    pet_seal: { head: [0.18, -0.31], w: 0.32, back: [-0.1, 0.04] },
    pet_octopus: { head: [0.0, -0.34], w: 0.46, back: [-0.28, -0.05] },
    pet_bubliko: { head: [0.2, -0.66], w: 0.24, back: [-0.12, -0.04] },
    pet_tapochkino: { head: [0.22, -0.16], w: 0.28, back: [-0.16, -0.12] },
    pet_klaviatoro: { head: [0.31, -0.38], w: 0.3, back: [-0.42, -0.1] },
    pet_owl: { head: [0.04, -0.3], w: 0.44, back: [-0.2, 0.02] },
    pet_ghost: { head: [0.02, -0.34], w: 0.44, back: [-0.28, 0.0] },
    pet_mini_dragon: { head: [0.18, -0.29], w: 0.32, back: [-0.08, -0.04] },
    pet_ufo: { head: [0.0, -0.28], w: 0.34, back: [-0.3, 0.04] },
    pet_drone: { head: [0.0, -0.2], w: 0.5, back: [-0.3, 0.02] },
    pet_phoenix: { head: [0.02, -0.26], w: 0.34, back: [-0.2, 0.02] },
    pet_borshchelino: { head: [0.1, -0.46], w: 0.3, back: [-0.3, 0.2] },
    pet_bobrani: { head: [0.24, -0.3], w: 0.34, back: [-0.1, -0.05] },
    pet_tapko_sahur: { head: [0.0, -0.5], w: 0.38, back: [-0.18, -0.1] },
    pet_banan_gangstero: { head: [0.02, -0.52], w: 0.32, back: [-0.18, 0.0] },
    pet_hotdog: { head: [0.36, -0.24], w: 0.28, back: [-0.1, -0.06] },
    pet_skibidino: { head: [0.08, -0.36], w: 0.3, back: [-0.34, -0.1] },
    pet_kartoplino: { head: [0.0, -0.46], w: 0.5, back: [-0.26, 0.02] },
    pet_akuloni: { head: [0.22, -0.14], w: 0.28, back: [-0.16, -0.1] },
    pet_kavun_bomboni: { head: [0.02, -0.32], w: 0.46, back: [-0.26, 0.0] },
    pet_ballerino: { head: [0.0, -0.4], w: 0.36, back: [-0.1, -0.02] },
    pet_shimpanzini: { head: [0.02, -0.34], w: 0.34, back: [-0.2, 0.08] },
    pet_pelmen_mafiozo: { head: [0.02, -0.4], w: 0.4, back: [-0.3, 0.05] },
    pet_fridge: { head: [0.0, -0.54], w: 0.42, back: [-0.24, -0.1] },
    pet_bombardino: { head: [0.2, -0.18], w: 0.2, back: [-0.12, -0.08] },
    pet_traktorino: { head: [-0.11, -0.44], w: 0.34, back: [-0.3, -0.1] },
    pet_goldoni: { head: [0.04, -0.34], w: 0.44, back: [-0.3, -0.05] },
    pet_shaurmino: { head: [0.06, -0.44], w: 0.3, back: [-0.2, 0.0] },
    pet_borgini: { head: [0.2, -0.34], w: 0.36, back: [-0.14, 0.02] },
    pet_kubo_kriperino: { head: [0.0, -0.36], w: 0.5, back: [-0.28, -0.05] },
    pet_flamingo: { head: [0.14, -0.47], w: 0.18, back: [-0.14, -0.06] },
    pet_raptor_raketoni: { head: [0.28, -0.3], w: 0.26, back: [-0.16, -0.24] },
    pet_motocyclino: { head: [0.28, -0.14], w: 0.26, back: [-0.1, 0.02] },
    pet_idol: { head: [0.0, -0.44], w: 0.44, back: [-0.24, 0.0] },
    pet_glitcho: { head: [0.22, -0.24], w: 0.3, back: [-0.1, 0.0] },
    pet_gromoni: { head: [0.0, -0.32], w: 0.44, back: [-0.3, -0.02] },
    pet_kristalozavr: { head: [0.3, -0.15], w: 0.28, back: [-0.1, -0.02] },
    pet_tirex: { head: [0.2, -0.38], w: 0.4, back: [-0.12, 0.04] },
    pet_skeletoni: { head: [0.2, -0.23], w: 0.3, back: [-0.1, 0.0] },
    pet_agent_homiakoni: { head: [0.02, -0.35], w: 0.38, back: [-0.2, 0.06] },
    pet_klouno: { head: [0.0, -0.38], w: 0.38, back: [-0.2, 0.0] },
    pet_roboakulo: { head: [0.22, -0.14], w: 0.28, back: [-0.16, -0.1] },
    pet_dvoholovo: { head: [0.2, -0.3], w: 0.24, back: [-0.2, 0.1] },
    pet_dyryzhabloni: { head: [0.1, -0.26], w: 0.3, back: [-0.2, -0.1] },
    pet_golkiperoni: { head: [0.1, -0.3], w: 0.4, back: [-0.24, 0.0] },
    pet_ninja_ravlino: { head: [0.29, -0.18], w: 0.24, back: [-0.12, -0.1] },
    pet_yakorino: { head: [0.02, -0.3], w: 0.3, back: [-0.2, 0.06] },
    pet_krakeno: { head: [0.0, -0.36], w: 0.5, back: [-0.26, -0.04] },
    pet_mimik: { head: [0.04, -0.28], w: 0.5, back: [-0.3, 0.1] },
    pet_astronavto: { head: [0.02, -0.4], w: 0.36, back: [-0.28, 0.0] },
    pet_drakon_skarboni: { head: [0.28, -0.22], w: 0.3, back: [-0.1, -0.2] },
    pet_krotoni: { head: [0.16, -0.26], w: 0.34, back: [-0.2, 0.04] },
    pet_bekonino: { head: [0.0, -0.46], w: 0.36, back: [-0.22, 0.0] },
    pet_pingvino_snow: { head: [0.02, -0.25], w: 0.36, back: [-0.2, 0.04] },
    pet_meduzoni: { head: [0.0, -0.3], w: 0.5, back: [-0.28, -0.04] },
    pet_kaktusoni: { head: [0.0, -0.48], w: 0.32, back: [-0.18, -0.06] },
    pet_ostrivoni: { head: [0.32, -0.02], w: 0.18, back: [-0.2, 0.0] },
    pet_chornodiro: { head: [0.0, -0.2], w: 0.4, back: [-0.3, 0.0] },
    pet_angelo_gusoni: { head: [0.22, -0.36], w: 0.2, back: [-0.14, 0.0] },
    pet_demonino: { head: [0.0, -0.3], w: 0.5, back: [-0.3, -0.02] },
    pet_fusion: { head: [0.1, -0.3], w: 0.28, back: [-0.16, -0.12] }
};

const DEFAULT_ANCHOR = { head: [0, -0.35], w: 0.36, back: [-0.25, 0] };

// Група спорядження для кожної зброї
export const WEAPON_GEAR = {
    weapon_sword: "knight",
    weapon_axe: "knight",
    weapon_firesword: "fire_knight",
    weapon_pickaxe: "miner",
    weapon_bat: "baseball",
    weapon_bow: "archer",
    weapon_ball: "ball",
    weapon_pistol: "soldier",
    weapon_rifle: "soldier",
    weapon_flamethrower: "firefighter",
    weapon_laser: "laser",
    weapon_plasma: "plasma",
    weapon_saber_green: "saber_green",
    weapon_saber_blue: "saber_blue",
    weapon_saber_red: "saber_red",
    weapon_rocket: "jetpack",
    weapon_shuriken: "ninja",
    weapon_thunder: "thunder",
    weapon_gravity: "gravity",
    // Сундукова зброя — у спорядженні найближчої за духом групи
    weapon_trident: "knight",
    weapon_crossbow: "archer",
    weapon_snowball: "ball",
    weapon_slingshot: "archer",
    weapon_mace: "knight",
    weapon_scythe: "plasma",
    weapon_banhammer: "baseball",
    weapon_paintball: "soldier",
    weapon_chain_staff: "thunder",
    weapon_meteor_staff: "fire_knight",
    weapon_wind_rod: "gravity",
    weapon_frost_orb: "laser"
};

const GLOW_COLORS = {
    laser: "0, 246, 255",
    plasma: "176, 107, 255",
    saber_green: "57, 255, 136",
    saber_blue: "60, 150, 255",
    saber_red: "255, 60, 70",
    thunder: "255, 225, 77",
    gravity: "176, 107, 255"
};

export function petGear(weaponId) {
    return (weaponId && WEAPON_GEAR[weaponId]) || null;
}

function anchorOf(petId) {
    return PET_ANCHORS[petId] || DEFAULT_ANCHOR;
}

// Наскільки піднятий улюбленець у невагомості (гравітаційна гармата)
export function gearLift(gear, size, time) {
    if (gear !== "gravity") {
        return 0;
    }
    return size * 0.14 + (time ? Math.sin(time * 0.004) * size * 0.05 : 0);
}

// ---------- Шапки ----------

// Купол-шолом із козирком: x, y — середина низу, w — ширина
function domeHelmet(ctx, x, y, w, fill, brim, s) {
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.5, w * 0.42, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    if (brim) {
        fillRoundRect(ctx, x - w * 0.56, y - w * 0.06, w * 1.12, w * 0.12, w * 0.05, brim, s * 0.8);
    }
}

function knightHelmet(ctx, x, y, w, s, t, fire) {
    // Плюмаж: червоний або (вогняний меч) полум'я, що мерехтить
    const flick = t ? Math.sin(t * 0.02) : 0;
    if (fire) {
        fillEllipse(ctx, x - w * 0.05, y - w * 0.5, w * 0.16, w * (0.3 + flick * 0.04), "#ff7a1a", s * 0.6, -0.3);
        fillEllipse(ctx, x - w * 0.05, y - w * 0.46, w * 0.08, w * 0.16, "#ffe14d", 0, -0.3);
    } else {
        fillEllipse(ctx, x - w * 0.08, y - w * 0.48, w * 0.2, w * 0.1, "#ff3b4f", s * 0.6, -0.4 + flick * 0.1);
    }
    domeHelmet(ctx, x, y, w, "#c9d1dc", null, s);
    // Щілина забрала
    ctx.fillStyle = PET_OUTLINE;
    ctx.fillRect(x + w * 0.02, y - w * 0.2, w * 0.4, w * 0.07);
    fillEllipse(ctx, x - w * 0.18, y - w * 0.26, w * 0.06, w * 0.05, "rgba(255, 255, 255, 0.7)");
}

function knightShield(ctx, x, y, s) {
    const w = s * 0.26;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y - w / 2);
    ctx.lineTo(x + w / 2, y - w / 2);
    ctx.lineTo(x + w / 2, y);
    ctx.quadraticCurveTo(x + w / 2, y + w * 0.45, x, y + w * 0.65);
    ctx.quadraticCurveTo(x - w / 2, y + w * 0.45, x - w / 2, y);
    ctx.closePath();
    ctx.fillStyle = "#2f7bff";
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    ctx.fillStyle = "#ffd23f";
    ctx.fillRect(x - w * 0.07, y - w * 0.4, w * 0.14, w * 0.9);
    ctx.fillRect(x - w * 0.35, y - w * 0.12, w * 0.7, w * 0.14);
}

function minerHelmet(ctx, x, y, w, s, t) {
    // Промінь ліхтарика вперед
    ctx.save();
    ctx.globalAlpha = 0.8 + (t ? Math.sin(t * 0.006) * 0.2 : 0);
    const beam = ctx.createLinearGradient(x + w * 0.35, 0, x + w * 1.5, 0);
    beam.addColorStop(0, "rgba(255, 236, 140, 0.55)");
    beam.addColorStop(1, "rgba(255, 236, 140, 0)");
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.35, y - w * 0.28);
    ctx.lineTo(x + w * 1.5, y - w * 0.6);
    ctx.lineTo(x + w * 1.5, y + w * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    domeHelmet(ctx, x, y, w, "#ffc629", "#e0a800", s);
    fillEllipse(ctx, x + w * 0.3, y - w * 0.26, w * 0.12, w * 0.12, "#fff8d0", s * 0.6);
}

function soldierHelmet(ctx, x, y, w, s) {
    domeHelmet(ctx, x, y, w * 1.05, "#5d7a3a", "#4a6230", s);
    // Окуляри на касці
    fillRoundRect(ctx, x - w * 0.36, y - w * 0.3, w * 0.72, w * 0.1, w * 0.05, "#2a2a2a");
    fillEllipse(ctx, x - w * 0.14, y - w * 0.25, w * 0.1, w * 0.08, "#7fd8ff", s * 0.5);
    fillEllipse(ctx, x + w * 0.14, y - w * 0.25, w * 0.1, w * 0.08, "#7fd8ff", s * 0.5);
}

function firefighterHelmet(ctx, x, y, w, s) {
    // Довгий задній козирок, як у пожежників
    ctx.beginPath();
    ctx.moveTo(x - w * 0.8, y + w * 0.04);
    ctx.quadraticCurveTo(x - w * 0.6, y - w * 0.08, x - w * 0.3, y - w * 0.04);
    ctx.lineTo(x + w * 0.5, y - w * 0.02);
    ctx.lineTo(x + w * 0.5, y + w * 0.06);
    ctx.closePath();
    ctx.fillStyle = "#c81e2a";
    ctx.fill();
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.strokeStyle = PET_OUTLINE;
    ctx.stroke();
    domeHelmet(ctx, x, y, w, "#e8323f", null, s);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.1, y - w * 0.36);
    ctx.lineTo(x + w * 0.2, y - w * 0.22);
    ctx.lineTo(x + w * 0.1, y - w * 0.08);
    ctx.lineTo(x, y - w * 0.22);
    ctx.closePath();
    ctx.fillStyle = "#ffd23f";
    ctx.fill();
    ctx.stroke();
}

// Бейсболка (бита): червоний купол, козирок уперед і гудзик на маківці
function baseballCap(ctx, x, y, w, s) {
    fillRoundRect(ctx, x + w * 0.1, y - w * 0.07, w * 0.62, w * 0.1, w * 0.05, "#b81e2e", s * 0.8);
    domeHelmet(ctx, x, y, w, "#e02a3a", null, s);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(x + w * 0.02, y - w * 0.3, w * 0.22, w * 0.2);
    fillEllipse(ctx, x, y - w * 0.43, w * 0.06, w * 0.04, "#b81e2e", s * 0.5);
}

function antennae(ctx, x, y, w, s, t, rgb) {
    const pulse = t ? 0.6 + Math.sin(t * 0.01) * 0.4 : 1;
    ctx.lineWidth = petLine(s) * 0.8;
    ctx.strokeStyle = PET_OUTLINE;
    for (const side of [-1, 1]) {
        const tipX = x + side * w * 0.3;
        const tipY = y - w * 0.55;
        ctx.beginPath();
        ctx.moveTo(x + side * w * 0.12, y + w * 0.02);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
        ctx.save();
        ctx.globalAlpha = 0.4 * pulse;
        fillEllipse(ctx, tipX, tipY, w * 0.18, w * 0.18, "rgb(" + rgb + ")");
        ctx.restore();
        fillEllipse(ctx, tipX, tipY, w * 0.08, w * 0.08, "rgb(" + rgb + ")", s * 0.5);
    }
}

function ninjaBand(ctx, x, y, w, s, t) {
    const band = y + w * 0.12;
    fillRoundRect(ctx, x - w * 0.55, band - w * 0.08, w * 1.1, w * 0.16, w * 0.05, "#e02a3a", s * 0.7);
    fillEllipse(ctx, x + w * 0.1, band, w * 0.08, w * 0.06, "#c8d0e0", s * 0.5);
    // Кінці пов'язки розвіваються позаду
    const flow = t ? Math.sin(t * 0.015) * w * 0.1 : 0;
    ctx.lineCap = "round";
    ctx.lineWidth = w * 0.1;
    ctx.strokeStyle = "#e02a3a";
    ctx.beginPath();
    ctx.moveTo(x - w * 0.5, band);
    ctx.quadraticCurveTo(x - w * 0.8, band - w * 0.1 + flow, x - w * 1.1, band + flow);
    ctx.moveTo(x - w * 0.5, band + w * 0.02);
    ctx.quadraticCurveTo(x - w * 0.8, band + w * 0.12 - flow, x - w * 1.05, band + w * 0.2 - flow);
    ctx.stroke();
}

// ---------- Спина й довкола ----------

function quiver(ctx, x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.5);
    // Оперення стріл
    const colors = ["#ff3b4f", "#ffd23f", "#39c6ff"];
    for (let i = 0; i < 3; i++) {
        fillEllipse(ctx, -s * 0.05 + i * s * 0.05, -s * 0.24, s * 0.025, s * 0.06, colors[i], s * 0.4);
    }
    fillRoundRect(ctx, -s * 0.09, -s * 0.2, s * 0.18, s * 0.36, s * 0.05, "#8a5a2b", s * 0.8);
    ctx.fillStyle = "#c98a4b";
    ctx.fillRect(-s * 0.09, -s * 0.08, s * 0.18, s * 0.04);
    ctx.restore();
}

function jetpack(ctx, x, y, s, t) {
    for (const dx of [-s * 0.07, s * 0.07]) {
        const flame = t ? 0.8 + Math.sin(t * 0.05 + dx) * 0.2 : 0.9;
        fillEllipse(ctx, x + dx, y + s * 0.24, s * 0.05, s * 0.12 * flame, "#ff7a1a");
        fillEllipse(ctx, x + dx, y + s * 0.2, s * 0.028, s * 0.06 * flame, "#ffe14d");
        fillRoundRect(ctx, x + dx - s * 0.065, y - s * 0.16, s * 0.13, s * 0.3, s * 0.06, "#aab6c8", s * 0.8);
        fillEllipse(ctx, x + dx, y - s * 0.13, s * 0.05, s * 0.03, "#ff3b4f");
    }
}

function rollingBall(ctx, x, y, s, t) {
    const r = s * 0.1;
    fillEllipse(ctx, x, y - r, r, r, "#ffffff", s * 0.7);
    ctx.save();
    ctx.translate(x, y - r);
    ctx.rotate(t ? t * 0.012 : 0);
    ctx.fillStyle = PET_OUTLINE;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5;
        ctx.lineTo(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function lightningSparks(ctx, s, t) {
    if (t && Math.floor(t / 90) % 3 === 0) {
        return;
    }
    const seed = t ? Math.floor(t / 90) : 1;
    ctx.strokeStyle = "#ffe14d";
    ctx.lineWidth = Math.max(1, s * 0.035);
    ctx.lineJoin = "round";
    for (let i = 0; i < 2; i++) {
        const a = (seed * 1.7 + i * 2.6) % (Math.PI * 2);
        const x = Math.cos(a) * s * 0.42;
        const y = Math.sin(a) * s * 0.34 - s * 0.05;
        ctx.beginPath();
        ctx.moveTo(x, y - s * 0.1);
        ctx.lineTo(x + s * 0.04, y - s * 0.02);
        ctx.lineTo(x - s * 0.02, y);
        ctx.lineTo(x + s * 0.03, y + s * 0.1);
        ctx.stroke();
    }
}

// Шар позаду улюбленця: сяйво (лазер, плазма, світлові мечі, грім, гравітація),
// сагайдак і ранець на спині
export function drawPetGearBack(ctx, petId, gear, s, t) {
    if (!gear) {
        return;
    }
    const a = anchorOf(petId);
    if (GLOW_COLORS[gear]) {
        const rgb = GLOW_COLORS[gear];
        const pulse = t ? 0.75 + Math.sin(t * 0.006) * 0.25 : 1;
        const g = ctx.createRadialGradient(0, 0, s * 0.15, 0, 0, s * 0.7);
        g.addColorStop(0, "rgba(" + rgb + ", " + (0.55 * pulse).toFixed(3) + ")");
        g.addColorStop(1, "rgba(" + rgb + ", 0)");
        ctx.fillStyle = g;
        ctx.fillRect(-s * 0.75, -s * 0.75, s * 1.5, s * 1.5);
    }
    if (gear === "gravity") {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = "rgb(" + GLOW_COLORS.gravity + ")";
        ctx.lineWidth = Math.max(1, s * 0.04);
        ctx.beginPath();
        ctx.ellipse(0, s * 0.56, s * 0.34, s * 0.07, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    if (gear === "archer") {
        quiver(ctx, a.back[0] * s, a.back[1] * s, s);
    }
}

// Шар поверх улюбленця: шапки, щит, м'ячик, блискавки
export function drawPetGearFront(ctx, petId, gear, s, t, flies) {
    if (!gear) {
        return;
    }
    const a = anchorOf(petId);
    const hx = a.head[0] * s;
    const hy = a.head[1] * s;
    const w = a.w * s * 1.1;
    if (gear === "knight" || gear === "fire_knight") {
        knightShield(ctx, a.back[0] * s + s * 0.06, a.back[1] * s + s * 0.14, s);
        knightHelmet(ctx, hx, hy + w * 0.12, w, s, t, gear === "fire_knight");
    } else if (gear === "miner") {
        minerHelmet(ctx, hx, hy + w * 0.12, w, s, t);
    } else if (gear === "baseball") {
        baseballCap(ctx, hx, hy + w * 0.12, w, s);
    } else if (gear === "soldier") {
        soldierHelmet(ctx, hx, hy + w * 0.12, w, s);
    } else if (gear === "firefighter") {
        firefighterHelmet(ctx, hx, hy + w * 0.12, w, s);
    } else if (gear === "laser" || gear === "plasma") {
        antennae(ctx, hx, hy + w * 0.05, w, s, t, GLOW_COLORS[gear]);
    } else if (gear === "ninja") {
        ninjaBand(ctx, hx, hy, w, s, t);
    } else if (gear === "jetpack") {
        // Ранець висунутий за спину, щоб його було видно збоку
        jetpack(ctx, a.back[0] * s - s * 0.1, a.back[1] * s, s, t);
    } else if (gear === "thunder") {
        lightningSparks(ctx, s, t);
    } else if (gear === "ball") {
        // Земні ведуть м'ячик попереду, летючі тримають під собою
        if (flies) {
            rollingBall(ctx, 0, s * 0.62, s, t);
        } else {
            rollingBall(ctx, s * 0.5, s * 0.5, s, t);
        }
    }
}

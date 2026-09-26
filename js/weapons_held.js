// ============================================================
// weapons_held.js — зброя в руці кубика: форми всіх видів зброї, спалах пострілу,
// drawHeldWeapon
// ============================================================

import { WEAPON_SPECS, saberColor } from "./weapons.js";

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

// Плазмова гармата: масивний корпус, три сяйні котушки й ядро плазми біля дула
function drawPlasmaGunShape(ctx, s, time) {
    ctx.fillStyle = "#2e3440";
    ctx.fillRect(-s * 0.1, -s * 0.16, s * 0.62, s * 0.26);
    ctx.fillStyle = "#4a5466";
    ctx.fillRect(-s * 0.1, -s * 0.16, s * 0.62, s * 0.05);
    ctx.fillStyle = "#1a1d24";
    ctx.fillRect(s * 0.02, s * 0.08, s * 0.12, s * 0.2);
    for (let k = 0; k < 3; k++) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.012 - k * 1.2);
        ctx.fillStyle = "rgba(60, 255, 200, " + (0.45 + 0.55 * pulse).toFixed(2) + ")";
        ctx.fillRect(s * (0.06 + k * 0.13), -s * 0.2, s * 0.06, s * 0.34);
    }
    ctx.fillStyle = "#6a7488";
    ctx.fillRect(s * 0.5, -s * 0.12, s * 0.14, s * 0.18);
    const glow = 0.6 + 0.4 * Math.sin(time * 0.02);
    ctx.fillStyle = "rgba(120, 255, 220, " + (0.35 * glow).toFixed(2) + ")";
    ctx.beginPath();
    ctx.arc(s * 0.66, -s * 0.03, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d8fff4";
    ctx.beginPath();
    ctx.arc(s * 0.66, -s * 0.03, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
}

// Сюрикен: чотирипроменева металева зірка з отвором посередині (центр 0,0, радіус r)
export function drawShurikenShape(ctx, r, rot) {
    ctx.save();
    ctx.rotate(rot || 0);
    ctx.fillStyle = "#b8c0cc";
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.lineTo(Math.cos(a + Math.PI / 4) * r * 0.3, Math.sin(a + Math.PI / 4) * r * 0.3);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#eef2f8";
    for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.lineTo(Math.cos(a + Math.PI / 4) * r * 0.3, Math.sin(a + Math.PI / 4) * r * 0.3);
        ctx.closePath();
        ctx.fill();
    }
    ctx.fillStyle = "#2a2e36";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
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
        } else if (id === "weapon_plasma") {
            drawPlasmaGunShape(ctx, s, time);
        } else if (id === "weapon_shuriken") {
            // Сюрикен у руці повільно крутиться; після кидка в руці одразу з'являється наступний
            drawShurikenShape(ctx, s * 0.26, time * 0.004 + recoil * 3);
        }
    }
    ctx.restore();
}

export { drawAxeShape, drawSaberShape };

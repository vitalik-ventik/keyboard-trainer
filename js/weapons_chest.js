// ============================================================
// weapons_chest.js — сундукова зброя (не продається, лише випадає із сундуків):
// вигляд у руці кубика, снаряди й промені. Параметри атаки — WEAPON_SPECS у weapons.js,
// руйнування шипа — weapons_chest_fx.js. Координати екранні, вісь Y донизу.
// ============================================================

import { WEAPON_SPECS, clamp01, hashRand } from "./weapons.js";

// ---------- Ближній бій: руків'я в (0, 0), зброя вздовж осі -Y ----------

// Тризуб (Minecraft): темне древко й три бірюзові зубці, що ледь мерехтять
function drawTridentShape(ctx, s, time) {
    ctx.fillStyle = "#1f5a55";
    ctx.fillRect(-s * 0.035, -s * 0.62, s * 0.07, s * 0.84);
    ctx.fillStyle = "#123a36";
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(-s * 0.035, -s * 0.48 + i * s * 0.2, s * 0.07, s * 0.03);
    }
    const shine = 0.75 + 0.25 * Math.sin((time || 0) * 0.006);
    ctx.fillStyle = "rgba(106, 240, 222, " + shine.toFixed(2) + ")";
    ctx.fillRect(-s * 0.17, -s * 0.68, s * 0.34, s * 0.07);
    ctx.fillRect(-s * 0.17, -s * 0.86, s * 0.055, s * 0.2);
    ctx.fillRect(s * 0.115, -s * 0.86, s * 0.055, s * 0.2);
    ctx.fillRect(-s * 0.03, -s * 0.96, s * 0.06, s * 0.3);
    // Вістря зубців
    ctx.fillStyle = "#c8fff6";
    const tips = [[-s * 0.1425, -s * 0.86], [s * 0.1425, -s * 0.86], [0, -s * 0.96]];
    for (const tip of tips) {
        ctx.beginPath();
        ctx.moveTo(tip[0] - s * 0.04, tip[1]);
        ctx.lineTo(tip[0], tip[1] - s * 0.09);
        ctx.lineTo(tip[0] + s * 0.04, tip[1]);
        ctx.closePath();
        ctx.fill();
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillRect(-s * 0.012, -s * 0.9, s * 0.02, s * 0.2);
}

// Булава хрестоносця (Diablo 3): кована куля з шипами й золоте кільце
function drawMaceShape(ctx, s, time) {
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(-s * 0.04, -s * 0.56, s * 0.08, s * 0.78);
    ctx.fillStyle = "#3a2410";
    ctx.fillRect(-s * 0.05, s * 0.02, s * 0.1, s * 0.16);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(-s * 0.08, -s * 0.57, s * 0.16, s * 0.06);
    // Шипи довкола голови
    ctx.fillStyle = "#dfe6f0";
    for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a - 0.3) * s * 0.15, -s * 0.72 + Math.sin(a - 0.3) * s * 0.15);
        ctx.lineTo(Math.cos(a) * s * 0.27, -s * 0.72 + Math.sin(a) * s * 0.27);
        ctx.lineTo(Math.cos(a + 0.3) * s * 0.15, -s * 0.72 + Math.sin(a + 0.3) * s * 0.15);
        ctx.closePath();
        ctx.fill();
    }
    const head = ctx.createRadialGradient(-s * 0.05, -s * 0.77, s * 0.02, 0, -s * 0.72, s * 0.18);
    head.addColorStop(0, "#eef2f8");
    head.addColorStop(1, "#7a8496");
    ctx.fillStyle = head;
    ctx.beginPath();
    ctx.arc(0, -s * 0.72, s * 0.17, 0, Math.PI * 2);
    ctx.fill();
    // Золотий хрест-оздоба, що світиться святим сяйвом
    const glow = 0.7 + 0.3 * Math.sin((time || 0) * 0.008);
    ctx.fillStyle = "rgba(255, 214, 90, " + glow.toFixed(2) + ")";
    ctx.fillRect(-s * 0.025, -s * 0.8, s * 0.05, s * 0.16);
    ctx.fillRect(-s * 0.07, -s * 0.75, s * 0.14, s * 0.045);
}

// Коса некроманта (Diablo 3): кістяне древко й фіолетове примарне лезо
function drawScytheShape(ctx, s, time) {
    ctx.fillStyle = "#e8dcc0";
    ctx.fillRect(-s * 0.035, -s * 0.9, s * 0.07, s * 1.12);
    ctx.fillStyle = "#b8a888";
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.72 + i * s * 0.26, s * 0.055, s * 0.03, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    // Череп на верхівці
    ctx.fillStyle = "#f4ecd8";
    ctx.beginPath();
    ctx.arc(0, -s * 0.94, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2a1a3a";
    ctx.fillRect(-s * 0.045, -s * 0.96, s * 0.03, s * 0.03);
    ctx.fillRect(s * 0.015, -s * 0.96, s * 0.03, s * 0.03);
    // Лезо: півмісяць уперед
    const pulse = 0.75 + 0.25 * Math.sin((time || 0) * 0.007);
    const blade = ctx.createLinearGradient(0, -s * 0.95, s * 0.6, -s * 0.6);
    blade.addColorStop(0, "#f0e8ff");
    blade.addColorStop(1, "rgba(138, 90, 255, " + pulse.toFixed(2) + ")");
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.moveTo(s * 0.02, -s * 0.9);
    ctx.quadraticCurveTo(s * 0.48, -s * 1.0, s * 0.64, -s * 0.56);
    ctx.quadraticCurveTo(s * 0.38, -s * 0.8, s * 0.02, -s * 0.76);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(200, 170, 255, " + (0.5 * pulse).toFixed(2) + ")";
    ctx.lineWidth = Math.max(1, s * 0.03);
    ctx.stroke();
}

// Банхамер (Roblox): велетенський червоний молот із написом BAN
function drawBanhammerShape(ctx, s) {
    ctx.fillStyle = "#6a4a2a";
    ctx.fillRect(-s * 0.04, -s * 0.58, s * 0.08, s * 0.8);
    ctx.fillStyle = "#3a3a44";
    ctx.fillRect(-s * 0.05, s * 0.04, s * 0.1, s * 0.16);
    ctx.fillStyle = "#b81a22";
    ctx.fillRect(-s * 0.32, -s * 0.92, s * 0.64, s * 0.36);
    ctx.fillStyle = "#e8323a";
    ctx.fillRect(-s * 0.32, -s * 0.92, s * 0.64, s * 0.3);
    ctx.fillStyle = "#ff7a80";
    ctx.fillRect(-s * 0.32, -s * 0.92, s * 0.64, s * 0.05);
    ctx.fillStyle = "#1a1a22";
    ctx.fillRect(-s * 0.34, -s * 0.94, s * 0.06, s * 0.4);
    ctx.fillRect(s * 0.28, -s * 0.94, s * 0.06, s * 0.4);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold " + Math.max(6, Math.round(s * 0.2)) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("BAN", 0, -s * 0.76);
}

// Малювальники зброї ближнього бою та колір сліду удару (rgb)
export const CHEST_MELEE_SHAPES = {
    weapon_trident: drawTridentShape,
    weapon_mace: drawMaceShape,
    weapon_scythe: drawScytheShape,
    weapon_banhammer: drawBanhammerShape
};

export const CHEST_SWING_TRAILS = {
    weapon_trident: "120, 240, 222",
    weapon_mace: "255, 220, 120",
    weapon_scythe: "180, 130, 255",
    weapon_banhammer: "255, 90, 90"
};

// ---------- Зброя на відстані: у руці, дуло вздовж +X ----------

// Арбалет (Minecraft): ложе, дуга поперек і болт, доки не вистрілив
function drawCrossbowShape(ctx, s, time, recoil) {
    ctx.fillStyle = "#8a5a2a";
    ctx.fillRect(-s * 0.14, -s * 0.06, s * 0.64, s * 0.1);
    ctx.fillStyle = "#6a3a1a";
    ctx.fillRect(0, s * 0.02, s * 0.1, s * 0.22);
    ctx.fillStyle = "#9aa4b0";
    ctx.fillRect(s * 0.44, -s * 0.07, s * 0.08, s * 0.12);
    ctx.strokeStyle = "#5a3a1a";
    ctx.lineWidth = Math.max(2, s * 0.07);
    ctx.beginPath();
    ctx.moveTo(s * 0.3, -s * 0.36);
    ctx.quadraticCurveTo(s * 0.5, -s * 0.01, s * 0.3, s * 0.34);
    ctx.stroke();
    const loaded = recoil <= 0.3;
    const pull = loaded ? s * 0.12 : s * 0.3;
    ctx.strokeStyle = "#eeeeee";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(s * 0.3, -s * 0.36);
    ctx.lineTo(pull, -s * 0.01);
    ctx.lineTo(s * 0.3, s * 0.34);
    ctx.stroke();
    if (loaded) {
        ctx.fillStyle = "#8a6a3a";
        ctx.fillRect(s * 0.1, -s * 0.03, s * 0.46, s * 0.04);
        ctx.fillStyle = "#c8d0dc";
        ctx.beginPath();
        ctx.moveTo(s * 0.56, -s * 0.06);
        ctx.lineTo(s * 0.66, -s * 0.01);
        ctx.lineTo(s * 0.56, s * 0.04);
        ctx.closePath();
        ctx.fill();
    }
}

// Сніжка (центр 0, 0, радіус r)
export function drawSnowball(ctx, r, rot) {
    ctx.save();
    ctx.rotate(rot || 0);
    ctx.fillStyle = "#f4f8ff";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c8d8ea";
    ctx.beginPath();
    ctx.arc(r * 0.2, r * 0.25, r * 0.7, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-r * 0.5, -r * 0.5, r * 0.35, r * 0.35);
    ctx.strokeStyle = "rgba(120, 150, 190, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

// Сніжка в руці: після кидка в руці одразу ліпиться наступна
function drawSnowballHeld(ctx, s, time, recoil) {
    const grow = 1 - clamp01(recoil * 1.5);
    if (grow <= 0.05) {
        return;
    }
    ctx.save();
    ctx.translate(s * 0.12, -s * 0.02);
    ctx.scale(grow, grow);
    drawSnowball(ctx, s * 0.14, 0);
    ctx.restore();
}

// Рогатка (класична зброя Roblox): дерев'яна рогулька, гумка й камінчик
function drawSlingshotShape(ctx, s, time, recoil) {
    ctx.strokeStyle = "#8a5a2a";
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(2, s * 0.08);
    ctx.beginPath();
    ctx.moveTo(s * 0.22, s * 0.26);
    ctx.lineTo(s * 0.22, s * 0.02);
    ctx.lineTo(s * 0.1, -s * 0.24);
    ctx.moveTo(s * 0.22, s * 0.02);
    ctx.lineTo(s * 0.36, -s * 0.24);
    ctx.stroke();
    ctx.lineCap = "butt";
    // Гумка натягнута, доки камінчик у ній
    const loaded = recoil <= 0.3;
    const pouchX = loaded ? -s * 0.06 : s * 0.23;
    const pouchY = loaded ? -s * 0.1 : -s * 0.2;
    ctx.strokeStyle = "#e84a3a";
    ctx.lineWidth = Math.max(1, s * 0.03);
    ctx.beginPath();
    ctx.moveTo(s * 0.1, -s * 0.24);
    ctx.lineTo(pouchX, pouchY);
    ctx.lineTo(s * 0.36, -s * 0.24);
    ctx.stroke();
    if (loaded) {
        ctx.save();
        ctx.translate(pouchX, pouchY);
        drawPebble(ctx, s * 0.08, 0);
        ctx.restore();
    }
}

// Камінчик для рогатки (центр 0, 0)
function drawPebble(ctx, r, rot) {
    ctx.save();
    ctx.rotate(rot || 0);
    ctx.fillStyle = "#8a8f98";
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
        const a = i * Math.PI * 2 / 7;
        const rr = r * (0.8 + hashRand(i + 3) * 0.35);
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#c0c6d0";
    ctx.fillRect(-r * 0.4, -r * 0.45, r * 0.4, r * 0.3);
    ctx.restore();
}

// Пейнтбольний автомат (Roblox): яскравий корпус і прозорий бункер із кульками фарби
function drawPaintballGunShape(ctx, s, time, recoil) {
    const colors = WEAPON_SPECS.weapon_paintball.colors;
    ctx.fillStyle = "#2ab0ff";
    ctx.fillRect(-s * 0.04, -s * 0.1, s * 0.56, s * 0.16);
    ctx.fillStyle = "#1a7ac8";
    ctx.fillRect(-s * 0.04, s * 0.02, s * 0.56, s * 0.04);
    ctx.fillStyle = "#1a1d24";
    ctx.fillRect(s * 0.52, -s * 0.07, s * 0.22, s * 0.08);
    ctx.fillRect(s * 0.06, s * 0.06, s * 0.1, s * 0.2);
    // Бункер
    ctx.fillStyle = "rgba(230, 245, 255, 0.55)";
    ctx.beginPath();
    ctx.ellipse(s * 0.2, -s * 0.24, s * 0.14, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 4; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(s * (0.12 + (i % 2) * 0.13), -s * (0.2 + Math.floor(i / 2) * 0.08), s * 0.045, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(s * 0.2, -s * 0.24, s * 0.14, s * 0.12, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Кольорова хмаринка біля дула після пострілу
    if (recoil > 0.5) {
        const a = (recoil - 0.5) * 2;
        ctx.fillStyle = colors[Math.floor((time || 0) / 80) % colors.length];
        ctx.globalAlpha = a * 0.8;
        ctx.beginPath();
        ctx.arc(s * 0.8, -s * 0.03, s * 0.08 + (1 - a) * s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Посох чарівника: древко вперед-угору, на кінці — кристал (glow — сила сяйва).
// Кінець посоха там, звідки б'є промінь (як дуло лазера)
function drawStaff(ctx, s, time, recoil, colors) {
    ctx.strokeStyle = "#4a3a6a";
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(2, s * 0.07);
    ctx.beginPath();
    ctx.moveTo(-s * 0.14, s * 0.22);
    ctx.lineTo(s * 0.26, -s * 0.1);
    ctx.stroke();
    ctx.strokeStyle = "#ffcc33";
    ctx.lineWidth = Math.max(1, s * 0.03);
    ctx.beginPath();
    ctx.moveTo(s * 0.02, s * 0.09);
    ctx.lineTo(s * 0.07, s * 0.05);
    ctx.moveTo(s * 0.2, -s * 0.05);
    ctx.lineTo(s * 0.25, -s * 0.09);
    ctx.stroke();
    ctx.lineCap = "butt";
    const pulse = 0.5 + 0.5 * Math.sin((time || 0) * 0.01);
    const power = Math.max(0.35 + 0.25 * pulse, recoil);
    const cx = s * 0.32;
    const cy = -s * 0.15;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * (0.16 + power * 0.14));
    glow.addColorStop(0, "rgba(" + colors.glow + ", " + (0.9 * power).toFixed(2) + ")");
    glow.addColorStop(1, "rgba(" + colors.glow + ", 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.crystal;
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.1);
    ctx.lineTo(cx + s * 0.06, cy);
    ctx.lineTo(cx, cy + s * 0.08);
    ctx.lineTo(cx - s * 0.06, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx - s * 0.015, cy - s * 0.06, s * 0.03, s * 0.06);
}

function drawChainStaffShape(ctx, s, time, recoil) {
    drawStaff(ctx, s, time, recoil, { glow: "120, 200, 255", crystal: "#8ad8ff" });
    // Іскри довкола кристала
    if (recoil > 0.2 || Math.sin((time || 0) * 0.013) > 0.6) {
        ctx.strokeStyle = "rgba(220, 245, 255, 0.9)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        const seed = Math.floor((time || 0) / 70);
        for (let i = 0; i < 3; i++) {
            const a = hashRand(seed * 5 + i) * Math.PI * 2;
            ctx.moveTo(s * 0.32 + Math.cos(a) * s * 0.07, -s * 0.15 + Math.sin(a) * s * 0.07);
            ctx.lineTo(s * 0.32 + Math.cos(a + 0.4) * s * 0.17, -s * 0.15 + Math.sin(a + 0.4) * s * 0.17);
        }
        ctx.stroke();
    }
}

function drawMeteorStaffShape(ctx, s, time, recoil) {
    drawStaff(ctx, s, time, recoil, { glow: "255, 140, 40", crystal: "#ff7a2a" });
}

// Жезл вітру (стрижень вихора з Minecraft): блідий стрижень і вихор біля кінця
function drawWindRodShape(ctx, s, time, recoil) {
    ctx.save();
    ctx.translate(-s * 0.1, s * 0.16);
    ctx.rotate(-0.68);
    ctx.fillStyle = "#dfe8f4";
    ctx.fillRect(0, -s * 0.035, s * 0.52, s * 0.07);
    ctx.fillStyle = "#8aa8d8";
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(s * (0.06 + i * 0.12), -s * 0.05, s * 0.04, s * 0.1);
    }
    ctx.restore();
    const spin = (time || 0) * 0.012 + recoil * 4;
    ctx.strokeStyle = "rgba(220, 240, 255, " + (0.55 + 0.45 * recoil).toFixed(2) + ")";
    ctx.lineWidth = Math.max(1, s * 0.03);
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(s * 0.32, -s * 0.15, s * (0.06 + i * 0.04), spin + i * 2.1, spin + i * 2.1 + Math.PI * 0.9);
        ctx.stroke();
    }
}

// Крижана сфера (Diablo 3): сяйне ядро, довкола кружляють крижані скалки
export function drawFrostOrb(ctx, r, age) {
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2);
    glow.addColorStop(0, "rgba(220, 245, 255, 0.9)");
    glow.addColorStop(0.5, "rgba(120, 200, 255, 0.35)");
    glow.addColorStop(1, "rgba(80, 160, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dff6ff";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.3, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9ad8ff";
    for (let i = 0; i < 6; i++) {
        const a = age * 6 + i * Math.PI / 3;
        const px = Math.cos(a) * r * 1.7;
        const py = Math.sin(a) * r * 1.7;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(-r * 0.35, 0);
        ctx.lineTo(0, -r * 0.14);
        ctx.lineTo(r * 0.35, 0);
        ctx.lineTo(0, r * 0.14);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

function drawFrostOrbHeld(ctx, s, time, recoil) {
    const grow = 1 - clamp01(recoil * 1.4);
    if (grow <= 0.05) {
        return;
    }
    ctx.save();
    ctx.translate(s * 0.2, -s * 0.12 + Math.sin((time || 0) * 0.005) * s * 0.03);
    ctx.scale(grow, grow);
    drawFrostOrb(ctx, s * 0.08, (time || 0) / 1000);
    ctx.restore();
}

// Малювальники зброї на відстані: (ctx, s, time, recoil)
export const CHEST_RANGED_SHAPES = {
    weapon_crossbow: drawCrossbowShape,
    weapon_snowball: drawSnowballHeld,
    weapon_slingshot: drawSlingshotShape,
    weapon_paintball: drawPaintballGunShape,
    weapon_chain_staff: drawChainStaffShape,
    weapon_meteor_staff: drawMeteorStaffShape,
    weapon_wind_rod: drawWindRodShape,
    weapon_frost_orb: drawFrostOrbHeld
};

// ---------- Снаряди ----------

// Снаряд сундукової зброї; повертає false, якщо kind не сундуковий.
// angle — напрям польоту, age — секунди польоту, prev — попередні точки (екранні), color — колір снаряда
export function drawChestProjectile(ctx, kind, x, y, angle, age, s, prev, color) {
    if (kind === "trident") {
        ctx.save();
        // Бризки води за тризубом
        if (prev) {
            for (let i = 1; i < prev.length; i++) {
                ctx.fillStyle = "rgba(120, 220, 255, " + (0.5 * (1 - i / prev.length)).toFixed(2) + ")";
                ctx.beginPath();
                ctx.arc(prev[i].x, prev[i].y + Math.sin(i * 2.1) * 3, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.translate(0, s * 0.4);
        drawTridentShape(ctx, s * 0.9, age * 1000);
        ctx.restore();
        return true;
    }
    if (kind === "bolt") {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = "#6a4a2a";
        ctx.fillRect(-s * 0.5, -1.5, s * 0.5, 3);
        ctx.fillStyle = "#c8d0dc";
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(9, 0);
        ctx.lineTo(0, 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#3a3a44";
        ctx.fillRect(-s * 0.5, -4, 5, 3);
        ctx.fillRect(-s * 0.5, 1, 5, 3);
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(-s * 0.9, -0.5, s * 0.35, 1);
        ctx.restore();
        return true;
    }
    if (kind === "snowball") {
        ctx.save();
        if (prev) {
            for (let i = 2; i < prev.length; i += 2) {
                ctx.fillStyle = "rgba(240, 248, 255, " + (0.5 * (1 - i / prev.length)).toFixed(2) + ")";
                ctx.fillRect(prev[i].x - 1, prev[i].y - 1, 2, 2);
            }
        }
        ctx.translate(x, y);
        drawSnowball(ctx, s * 0.12, age * 10);
        ctx.restore();
        return true;
    }
    if (kind === "pebble") {
        ctx.save();
        ctx.translate(x, y);
        drawPebble(ctx, s * 0.09, age * 20);
        ctx.restore();
        return true;
    }
    if (kind === "paint") {
        const c = color || "#ff3a8a";
        ctx.save();
        if (prev) {
            ctx.globalAlpha = 0.45;
            ctx.fillStyle = c;
            for (let i = 1; i < prev.length; i++) {
                ctx.beginPath();
                ctx.arc(prev[i].x, prev[i].y, Math.max(0.5, s * 0.07 * (1 - i / prev.length)), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(x, y, s * 0.09, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.beginPath();
        ctx.arc(x - s * 0.03, y - s * 0.03, s * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
    }
    if (kind === "wind") {
        ctx.save();
        // Смуги вітру позаду
        if (prev) {
            ctx.strokeStyle = "rgba(220, 240, 255, 0.45)";
            ctx.lineWidth = 1.5;
            for (let k = -1; k <= 1; k++) {
                ctx.beginPath();
                for (let i = 0; i < prev.length; i++) {
                    const py = prev[i].y + k * s * 0.12 + Math.sin(age * 30 + i + k) * 2;
                    if (i === 0) {
                        ctx.moveTo(prev[i].x, py);
                    } else {
                        ctx.lineTo(prev[i].x, py);
                    }
                }
                ctx.stroke();
            }
        }
        ctx.translate(x, y);
        ctx.fillStyle = "rgba(200, 230, 255, 0.45)";
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, s * (0.06 + i * 0.05), age * 25 + i * 2.1, age * 25 + i * 2.1 + Math.PI);
            ctx.stroke();
        }
        ctx.restore();
        return true;
    }
    if (kind === "frost_orb") {
        ctx.save();
        if (prev) {
            for (let i = 2; i < prev.length; i++) {
                ctx.fillStyle = "rgba(180, 230, 255, " + (0.6 * (1 - i / prev.length)).toFixed(2) + ")";
                const jx = (hashRand(i * 7 + Math.floor(age * 20)) - 0.5) * 8;
                const jy = (hashRand(i * 13 + Math.floor(age * 20)) - 0.5) * 8;
                ctx.fillRect(prev[i].x + jx - 1.5, prev[i].y + jy - 1.5, 3, 3);
            }
        }
        ctx.translate(x, y);
        drawFrostOrb(ctx, s * 0.13, age);
        ctx.restore();
        return true;
    }
    return false;
}

// ---------- Промені ----------

// Ланцюгова блискавка: ламана з кінця посоха до шипа й кілька відгалужень
function drawChainLightning(ctx, x1, y1, x2, y2, t, time) {
    const a = t < 0.1 ? t / 0.1 : Math.max(0, 1 - (t - 0.1) / 0.9);
    if (a <= 0) {
        return;
    }
    const seed = Math.floor(time / 45);
    const seg = 8;
    const pts = [];
    for (let i = 0; i <= seg; i++) {
        const k = i / seg;
        const jitter = i === 0 || i === seg ? 0 : (hashRand(seed * 17 + i) - 0.5) * 26;
        pts.push([x1 + (x2 - x1) * k, y1 + (y2 - y1) * k + jitter]);
    }
    ctx.save();
    ctx.lineJoin = "round";
    const passes = [[12, "rgba(90, 170, 255, " + (0.3 * a).toFixed(2) + ")"], [5, "rgba(150, 215, 255, " + (0.85 * a).toFixed(2) + ")"], [2, "rgba(255, 255, 255, " + a.toFixed(2) + ")"]];
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
    // Відгалуження, що перескакують далі (як ланцюг між ворогами)
    ctx.strokeStyle = "rgba(200, 235, 255, " + (0.8 * a).toFixed(2) + ")";
    ctx.lineWidth = 1.5;
    for (let b = 0; b < 3; b++) {
        const from = pts[2 + b * 2];
        let px = from[0];
        let py = from[1];
        ctx.beginPath();
        ctx.moveTo(px, py);
        for (let j = 0; j < 3; j++) {
            px += 8 + hashRand(seed * 3 + b * 11 + j) * 10;
            py += (hashRand(seed * 5 + b * 7 + j) - 0.5) * 30;
            ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
    const flash = ctx.createRadialGradient(x2, y2, 1, x2, y2, 40);
    flash.addColorStop(0, "rgba(255, 255, 255, " + (0.9 * a).toFixed(2) + ")");
    flash.addColorStop(1, "rgba(120, 200, 255, 0)");
    ctx.fillStyle = flash;
    ctx.fillRect(x2 - 40, y2 - 40, 80, 80);
    ctx.restore();
}

// Метеор: на землі спалахує руна-приціл, з неба навскіс падає палаюча брила.
// Падіння триває до миті удару (hit / time у WEAPON_SPECS), далі вибух малює руйнування шипа
function drawMeteorFall(ctx, x2, y2, t, time) {
    const spec = WEAPON_SPECS.weapon_meteor_staff;
    const fall = spec.hit / spec.time;
    if (t >= fall) {
        return;
    }
    const k = t / fall;
    const groundY = y2 + 14;
    ctx.save();
    // Руна-приціл
    const pulse = 0.6 + 0.4 * Math.sin(time * 0.03);
    ctx.strokeStyle = "rgba(255, 150, 40, " + (0.8 * pulse * Math.min(1, k * 3)).toFixed(2) + ")";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x2, groundY, 26 - k * 6, 6 - k, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x2, groundY, 14, 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Брила летить навскіс згори зліва, набираючи швидкість
    const e = k * k;
    const sx = x2 - 150;
    const sy = y2 - 380;
    const mx = sx + (x2 - sx) * e;
    const my = sy + (y2 - sy) * e;
    const dx = (x2 - sx) / 380;
    const dy = (y2 - sy) / 380;
    for (let i = 8; i >= 1; i--) {
        const tx = mx - dx * i * 14;
        const ty = my - dy * i * 14;
        const r = 12 - i * 1.1;
        const colors = ["255, 240, 160", "255, 170, 40", "255, 80, 20", "120, 60, 40"];
        ctx.fillStyle = "rgba(" + colors[Math.min(3, Math.floor(i / 2.2))] + ", " + (0.8 * (1 - i / 9)).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(tx + Math.sin(time * 0.04 + i) * 2, ty, Math.max(2, r), 0, Math.PI * 2);
        ctx.fill();
    }
    const glow = ctx.createRadialGradient(mx, my, 2, mx, my, 26);
    glow.addColorStop(0, "rgba(255, 220, 120, 0.8)");
    glow.addColorStop(1, "rgba(255, 90, 20, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(mx - 26, my - 26, 52, 52);
    ctx.fillStyle = "#4a2a1a";
    ctx.beginPath();
    ctx.arc(mx, my, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffb81a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mx - 6, my - 2);
    ctx.lineTo(mx - 1, my + 1);
    ctx.lineTo(mx + 3, my - 4);
    ctx.moveTo(mx - 2, my + 5);
    ctx.lineTo(mx + 5, my + 3);
    ctx.stroke();
    ctx.restore();
}

// Дія сундукової зброї на відстані; повертає false, якщо kind не сундуковий
export function drawChestBeam(ctx, kind, x1, y1, x2, y2, t, time) {
    if (kind === "chain") {
        drawChainLightning(ctx, x1, y1, x2, y2, t, time);
        return true;
    }
    if (kind === "meteor") {
        drawMeteorFall(ctx, x2, y2, t, time);
        return true;
    }
    return false;
}

// ============================================================
// shop_accessories.js — малювання аксесуарів кубика
// ============================================================

import { drawHeartLife } from "./shop_effects.js";

// ---------- Аксесуари ----------

// Малюються в системі координат кубика (центр 0,0, повернута разом із ним)
export function drawAccessory(ctx, id, size, time) {
    if (!id || id === "acc_none") {
        return;
    }
    const h = size / 2;
    if (id === "acc_cap") {
        ctx.fillStyle = "#e8202a";
        ctx.fillRect(-h * 0.8, -h - size * 0.22, size * 0.8, size * 0.24);
        ctx.fillRect(-h * 0.6, -h - size * 0.3, size * 0.6, size * 0.1);
        ctx.fillRect(-h * 0.8 + size * 0.8, -h - size * 0.04, size * 0.4, size * 0.07);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-size * 0.06, -h - size * 0.18, size * 0.12, size * 0.1);
    } else if (id === "acc_bow") {
        const wiggle = Math.sin(time * 0.004) * size * 0.02;
        ctx.fillStyle = "#ff5ad8";
        ctx.fillRect(-h - size * 0.08, -h - size * 0.12 + wiggle, size * 0.22, size * 0.2);
        ctx.fillRect(-h + size * 0.2, -h - size * 0.12 - wiggle, size * 0.22, size * 0.2);
        ctx.fillStyle = "#ff9ae8";
        ctx.fillRect(-h + size * 0.12, -h - size * 0.07, size * 0.1, size * 0.12);
    } else if (id === "acc_glasses") {
        ctx.fillStyle = "#111111";
        ctx.fillRect(-h * 0.85, -size * 0.14, size * 0.36, size * 0.18);
        ctx.fillRect(size * 0.07, -size * 0.14, size * 0.36, size * 0.18);
        ctx.fillRect(-size * 0.07, -size * 0.1, size * 0.14, size * 0.05);
        ctx.fillRect(-h, -size * 0.12, size * 0.1, size * 0.04);
        ctx.fillRect(h - size * 0.1, -size * 0.12, size * 0.1, size * 0.04);
        ctx.fillStyle = "rgba(120, 200, 255, 0.8)";
        ctx.fillRect(-h * 0.85 + size * 0.04, -size * 0.12, size * 0.08, size * 0.04);
        ctx.fillRect(size * 0.11, -size * 0.12, size * 0.08, size * 0.04);
    } else if (id === "acc_headphones") {
        ctx.fillStyle = "#2a2a3a";
        ctx.fillRect(-h - size * 0.04, -h - size * 0.14, size + size * 0.08, size * 0.1);
        ctx.fillRect(-h - size * 0.1, -h - size * 0.06, size * 0.1, size * 0.3);
        ctx.fillRect(h, -h - size * 0.06, size * 0.1, size * 0.3);
        ctx.fillStyle = "#39c6ff";
        ctx.fillRect(-h - size * 0.16, -size * 0.2, size * 0.18, size * 0.32);
        ctx.fillRect(h - size * 0.02, -size * 0.2, size * 0.18, size * 0.32);
        ctx.fillStyle = Math.sin(time * 0.01) > 0 ? "#39ff88" : "#1a6a3a";
        ctx.fillRect(h + size * 0.04, -size * 0.12, size * 0.06, size * 0.06);
    } else if (id === "acc_cowboy") {
        ctx.fillStyle = "#8a5a2a";
        ctx.fillRect(-h - size * 0.2, -h - size * 0.08, size * 1.4, size * 0.1);
        ctx.fillRect(-h * 0.6, -h - size * 0.38, size * 0.6, size * 0.32);
        ctx.fillStyle = "#6a4018";
        ctx.fillRect(-h * 0.6, -h - size * 0.14, size * 0.6, size * 0.06);
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(-size * 0.04, -h - size * 0.14, size * 0.08, size * 0.06);
    } else if (id === "acc_horns") {
        ctx.fillStyle = "#e8202a";
        for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(side * h * 0.75, -h + size * 0.02);
            ctx.lineTo(side * h * 0.95, -h - size * 0.32);
            ctx.lineTo(side * h * 0.35, -h + size * 0.02);
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = "#ff8a8a";
        ctx.fillRect(-h * 0.9, -h - size * 0.2, size * 0.04, size * 0.08);
        ctx.fillRect(h * 0.8, -h - size * 0.2, size * 0.04, size * 0.08);
    } else if (id === "acc_pirate") {
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.moveTo(-h - size * 0.12, -h + size * 0.02);
        ctx.lineTo(h + size * 0.12, -h + size * 0.02);
        ctx.lineTo(h * 0.5, -h - size * 0.36);
        ctx.lineTo(-h * 0.5, -h - size * 0.36);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(-h - size * 0.1, -h - size * 0.02, size * 1.2, size * 0.04);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-size * 0.08, -h - size * 0.26, size * 0.16, size * 0.12);
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(-size * 0.05, -h - size * 0.22, size * 0.03, size * 0.03);
        ctx.fillRect(size * 0.02, -h - size * 0.22, size * 0.03, size * 0.03);
    } else if (id === "acc_halo") {
        const bob = Math.sin(time * 0.004) * size * 0.04;
        ctx.strokeStyle = "rgba(255, 225, 77, 0.35)";
        ctx.lineWidth = size * 0.14;
        ctx.beginPath();
        ctx.ellipse(0, -h - size * 0.2 + bob, size * 0.34, size * 0.1, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#ffe14d";
        ctx.lineWidth = size * 0.06;
        ctx.stroke();
    } else if (id === "acc_heart_pendant") {
        // Ланцюжок на шиї й кулон-сердечко, що погойдується
        const sway = Math.sin(time * 0.003) * size * 0.02;
        ctx.strokeStyle = "#e8d8a0";
        ctx.lineWidth = Math.max(1, size * 0.03);
        ctx.beginPath();
        ctx.moveTo(-h * 0.7, h * 0.15);
        ctx.lineTo(sway, h * 0.55);
        ctx.lineTo(h * 0.7, h * 0.15);
        ctx.stroke();
        drawHeartLife(ctx, sway, h * 0.72, size * 0.26, time);
    } else if (id === "acc_flower_wreath") {
        // Зелений вінок із кольоровими квіточками
        ctx.fillStyle = "#3aa83a";
        ctx.fillRect(-h * 0.95, -h - size * 0.06, size * 0.95, size * 0.1);
        const flowers = ["#ff5ad8", "#ffe14d", "#ffffff", "#ff8a3a", "#8ad0ff"];
        for (let k = 0; k < 5; k++) {
            const fx = -h * 0.85 + k * size * 0.2;
            const fy = -h - size * 0.07 + Math.sin(time * 0.003 + k) * size * 0.01;
            ctx.fillStyle = flowers[k];
            ctx.fillRect(fx - size * 0.05, fy - size * 0.05, size * 0.1, size * 0.1);
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(fx - size * 0.02, fy - size * 0.02, size * 0.04, size * 0.04);
        }
    } else if (id === "acc_wings") {
        // Білі крила по боках повільно змахують
        const flap = Math.sin(time * 0.005) * size * 0.08;
        for (const side of [-1, 1]) {
            ctx.fillStyle = "#f4f6ff";
            ctx.beginPath();
            ctx.moveTo(side * h * 0.9, -size * 0.1);
            ctx.lineTo(side * (h + size * 0.42), -size * 0.36 - flap);
            ctx.lineTo(side * (h + size * 0.36), size * 0.02 - flap * 0.5);
            ctx.lineTo(side * (h + size * 0.22), size * 0.14);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#c8d4f0";
            ctx.fillRect(side > 0 ? h + size * 0.08 : -h - size * 0.2, -size * 0.12 - flap * 0.5, size * 0.12, size * 0.04);
            ctx.fillRect(side > 0 ? h + size * 0.12 : -h - size * 0.24, -size * 0.02 - flap * 0.3, size * 0.12, size * 0.04);
        }
    } else if (id === "acc_crown") {
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(-h * 0.8, -h - size * 0.12, size * 0.8, size * 0.14);
        for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            ctx.moveTo(-h * 0.8 + k * size * 0.27, -h - size * 0.12);
            ctx.lineTo(-h * 0.8 + k * size * 0.27 + size * 0.13, -h - size * 0.34);
            ctx.lineTo(-h * 0.8 + k * size * 0.27 + size * 0.26, -h - size * 0.12);
            ctx.closePath();
            ctx.fill();
        }
        const gems = ["#ff3355", "#39c6ff", "#39ff88"];
        for (let k = 0; k < 3; k++) {
            ctx.fillStyle = gems[k];
            ctx.fillRect(-h * 0.8 + k * size * 0.27 + size * 0.09, -h - size * 0.09, size * 0.08, size * 0.08);
        }
        const glint = (time * 0.001) % 2;
        if (glint < 0.2) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-h * 0.8 + glint * size * 3.5, -h - size * 0.1, size * 0.04, size * 0.1);
        }
    } else if (id === "acc_ninja_band") {
        // Синя пов'язка з металевою пластиною та знаком листка; кінці тріпочуть
        const flutter = Math.sin(time * 0.008) * size * 0.05;
        ctx.fillStyle = "#1e3a8a";
        ctx.beginPath();
        ctx.moveTo(h, -h + size * 0.08);
        ctx.lineTo(h + size * 0.34, -h + size * 0.02 + flutter);
        ctx.lineTo(h + size * 0.3, -h + size * 0.12 + flutter);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(h, -h + size * 0.14);
        ctx.lineTo(h + size * 0.28, -h + size * 0.2 - flutter);
        ctx.lineTo(h + size * 0.22, -h + size * 0.27 - flutter);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(-h - size * 0.02, -h + size * 0.04, size * 1.04, size * 0.16);
        ctx.fillStyle = "#8a8e96";
        ctx.fillRect(-size * 0.24, -h + size * 0.03, size * 0.48, size * 0.18);
        ctx.fillStyle = "#d0d4dc";
        ctx.fillRect(-size * 0.22, -h + size * 0.05, size * 0.44, size * 0.14);
        ctx.strokeStyle = "#4a4e56";
        ctx.lineWidth = Math.max(1, size * 0.025);
        ctx.beginPath();
        ctx.arc(0, -h + size * 0.12, size * 0.045, 0.3, Math.PI * 1.8);
        ctx.moveTo(size * 0.03, -h + size * 0.09);
        ctx.lineTo(size * 0.1, -h + size * 0.06);
        ctx.lineTo(size * 0.07, -h + size * 0.14);
        ctx.stroke();
    } else if (id === "acc_cyber_visor") {
        // Червоний напівпрозорий візор із HUD: смуга сканування бігає туди-сюди
        ctx.fillStyle = "#2a2a34";
        ctx.fillRect(-h - size * 0.06, -size * 0.22, size * 0.1, size * 0.24);
        ctx.fillRect(h - size * 0.04, -size * 0.22, size * 0.1, size * 0.24);
        ctx.fillStyle = "rgba(255, 40, 40, 0.35)";
        ctx.fillRect(-h + size * 0.02, -size * 0.2, size * 0.96, size * 0.2);
        ctx.strokeStyle = "#ff3a3a";
        ctx.lineWidth = Math.max(1, size * 0.025);
        ctx.strokeRect(-h + size * 0.02, -size * 0.2, size * 0.96, size * 0.2);
        const scan = (Math.sin(time * 0.003) * 0.5 + 0.5) * size * 0.86;
        ctx.fillStyle = "rgba(255, 180, 180, 0.9)";
        ctx.fillRect(-h + size * 0.05 + scan, -size * 0.19, size * 0.04, size * 0.18);
        ctx.fillStyle = "#ff8a8a";
        for (let k = 0; k < 4; k++) {
            ctx.fillRect(-h + size * 0.08 + k * size * 0.06, -size * 0.06, size * 0.03, size * 0.03);
        }
        ctx.fillStyle = Math.sin(time * 0.012) > 0 ? "#ff3a3a" : "#6a1a1a";
        ctx.fillRect(h, -size * 0.14, size * 0.04, size * 0.04);
    } else if (id === "acc_heart_orbit") {
        // Три сердечка кружляють навколо кубика
        for (let k = 0; k < 3; k++) {
            const ang = time * 0.002 + k * Math.PI * 2 / 3;
            const hx = Math.cos(ang) * size * 0.78;
            const hy = -size * 0.05 + Math.sin(ang) * size * 0.28;
            drawHeartLife(ctx, hx, hy, size * (0.24 + 0.04 * Math.sin(ang)), time + k * 300);
        }
    } else if (id === "acc_diamond_crown") {
        // Діамантова корона: блакитна, з рожевими каменями й зірочками-блисками
        ctx.fillStyle = "#1e9aa8";
        ctx.fillRect(-h * 0.9, -h - size * 0.1, size * 0.9, size * 0.14);
        ctx.fillStyle = "#4ae8f0";
        ctx.fillRect(-h * 0.9, -h - size * 0.13, size * 0.9, size * 0.12);
        for (let k = 0; k < 5; k++) {
            const px = -h * 0.9 + k * size * 0.18;
            const tall = k % 2 === 0 ? 0.4 : 0.3;
            ctx.fillStyle = "#4ae8f0";
            ctx.beginPath();
            ctx.moveTo(px, -h - size * 0.12);
            ctx.lineTo(px + size * 0.09, -h - size * tall);
            ctx.lineTo(px + size * 0.18, -h - size * 0.12);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#b8fbff";
            ctx.fillRect(px + size * 0.07, -h - size * (tall - 0.06), size * 0.03, size * 0.08);
        }
        const gems = ["#ff5ad8", "#b35cff", "#ff5ad8"];
        for (let k = 0; k < 3; k++) {
            ctx.fillStyle = gems[k];
            ctx.fillRect(-h * 0.9 + size * (0.12 + k * 0.28), -h - size * 0.1, size * 0.08, size * 0.07);
        }
        for (let k = 0; k < 3; k++) {
            const tw = Math.max(0, Math.sin(time * 0.004 + k * 2.1));
            if (tw <= 0.05) {
                continue;
            }
            const sx = -h * 0.8 + k * size * 0.4;
            const sy = -h - size * (0.42 + (k % 2) * 0.08);
            const st = size * 0.035 * tw;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(sx - st / 2, sy - st * 2, st, st * 4);
            ctx.fillRect(sx - st * 2, sy - st / 2, st * 4, st);
        }
    }
}

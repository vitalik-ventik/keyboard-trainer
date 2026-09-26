// ============================================================
// shop_effects.js — малювання товарів-ефектів: сердечко-життя, значок монети,
// шлейфи кубика й ефекти вибуху
// ============================================================


// ---------- Сердечко: запасне життя ----------

// Піксельне червоне сердечко, як у Minecraft (cx, cy — центр, size — розмір)
export function drawHeartLife(ctx, cx, cy, size, time) {
    const rows = [
        "0110110",
        "1221111",
        "1211111",
        "1111111",
        "0111110",
        "0011100",
        "0001000"
    ];
    const p = size / 7;
    const x0 = cx - size / 2;
    const y0 = cy - size / 2;
    // Легке «биття» сяйва
    const glow = 0.2 + 0.15 * Math.sin((time || 0) * 0.005);
    ctx.save();
    ctx.globalAlpha *= glow;
    ctx.fillStyle = "#ff3a5a";
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].length; c++) {
            const v = rows[r][c];
            if (v === "0") {
                continue;
            }
            ctx.fillStyle = v === "2" ? "#ffd0d8" : (r >= 4 ? "#c8102e" : "#ff2a4a");
            ctx.fillRect(Math.round(x0 + c * p), Math.round(y0 + r * p), Math.ceil(p), Math.ceil(p));
        }
    }
}

// «1 сердечко», «2 сердечка», «5 сердечок»
export function heartsText(n) {
    const abs = Math.abs(Math.floor(n));
    const last = abs % 10;
    const lastTwo = abs % 100;
    if (last === 1 && lastTwo !== 11) {
        return n + " сердечко";
    }
    if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
        return n + " сердечка";
    }
    return n + " сердечок";
}

// ---------- Золота монета: значок валюти ----------

export function drawCoinIcon(ctx, x, y, s) {
    const r = s / 2;
    ctx.save();
    // Ребро, золото й внутрішнє кільце
    ctx.fillStyle = "#a8641a";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffc93a";
    ctx.beginPath();
    ctx.arc(x, y, r * 0.82, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e8961e";
    ctx.lineWidth = Math.max(1, s * 0.07);
    ctx.beginPath();
    ctx.arc(x, y, r * 0.56, 0, Math.PI * 2);
    ctx.stroke();
    // Карбована риска посередині
    ctx.fillStyle = "#b8741a";
    ctx.fillRect(Math.round(x - s * 0.07), Math.round(y - r * 0.45), Math.max(1, Math.round(s * 0.14)), Math.max(1, Math.round(r * 0.9)));
    // Відблиск
    ctx.fillStyle = "#fff6c8";
    ctx.fillRect(Math.round(x - r * 0.55), Math.round(y - r * 0.6), Math.max(1, Math.round(s * 0.13)), Math.max(1, Math.round(s * 0.13)));
    ctx.restore();
}

// «1 монета», «3 монети», «25 монет»
export function coinsText(n) {
    const abs = Math.abs(Math.floor(n));
    const last = abs % 10;
    const lastTwo = abs % 100;
    let word = "монет";
    if (last === 1 && lastTwo !== 11) {
        word = "монета";
    } else if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
        word = "монети";
    }
    return n + " " + word;
}

// ---------- Детерміновані випадкові числа для ефектів ----------

function hashRand(n) {
    const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
}

// ---------- Шлейфи ----------

// points — точки шлейфу { sx, sy, alpha, i }: екранні координати, яскравість (0…0.55) і номер
export function drawTrail(ctx, id, points, cube, time) {
    if (id === "trail_default" || !id) {
        for (const p of points) {
            const size = cube * 0.55;
            ctx.fillStyle = "rgba(0, 246, 255, " + Math.max(0, p.alpha * 0.35).toFixed(3) + ")";
            ctx.fillRect(p.sx - size / 2, p.sy - size / 2, size, size);
        }
        return;
    }
    if (id === "trail_neon") {
        if (points.length < 2) {
            return;
        }
        for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass === 0 ? "rgba(255, 46, 166, 0.45)" : "rgba(0, 246, 255, 0.9)";
            ctx.lineWidth = pass === 0 ? cube * 0.35 : cube * 0.12;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(points[0].sx, points[0].sy);
            for (let k = 1; k < points.length; k++) {
                ctx.lineTo(points[k].sx, points[k].sy);
            }
            ctx.stroke();
        }
        ctx.lineCap = "butt";
        return;
    }
    if (id === "trail_plasma") {
        // Блискавка: ламана лінія, що мерехтить (зсуви оновлюються кожні 60 мс)
        if (points.length < 2) {
            return;
        }
        const flick = Math.floor(time / 60);
        for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass === 0 ? "rgba(80, 150, 255, 0.4)" : "rgba(225, 245, 255, 0.95)";
            ctx.lineWidth = pass === 0 ? cube * 0.3 : cube * 0.07;
            ctx.lineJoin = "round";
            ctx.beginPath();
            for (let k = 0; k < points.length; k++) {
                const jit = k === points.length - 1 ? 0 : (hashRand(points[k].i * 7 + flick) - 0.5) * cube * 0.45;
                if (k === 0) {
                    ctx.moveTo(points[k].sx, points[k].sy + jit);
                } else {
                    ctx.lineTo(points[k].sx, points[k].sy + jit);
                }
            }
            ctx.stroke();
        }
        ctx.lineJoin = "miter";
        // Іскри
        ctx.fillStyle = "#ffffff";
        for (const p of points) {
            if (hashRand(p.i * 3 + flick) < 0.15) {
                ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha / 0.55));
                ctx.fillRect(p.sx + (hashRand(p.i + flick) - 0.5) * cube * 0.8, p.sy + (hashRand(p.i * 5 + flick) - 0.5) * cube * 0.8, 3, 3);
            }
        }
        ctx.globalAlpha = 1;
        return;
    }
    for (const p of points) {
        const a = Math.max(0, Math.min(1, p.alpha / 0.55));
        const age = 1 - a;
        const r = hashRand(p.i);
        if (id === "trail_bubbles") {
            const rad = cube * (0.1 + age * 0.22 + r * 0.08);
            ctx.globalAlpha = a * 0.8;
            ctx.strokeStyle = "#bff0ff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(p.sx + (r - 0.5) * cube * 0.6, p.sy - age * cube * 0.8, rad, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(p.sx + (r - 0.5) * cube * 0.6 - rad * 0.4, p.sy - age * cube * 0.8 - rad * 0.5, 2, 2);
        } else if (id === "trail_rainbow") {
            const colors = ["#ff3355", "#ff9a3d", "#ffe14d", "#39ff88", "#39c6ff", "#b35cff"];
            const band = cube / colors.length;
            ctx.globalAlpha = a * 0.85;
            for (let c = 0; c < colors.length; c++) {
                ctx.fillStyle = colors[c];
                ctx.fillRect(p.sx - cube * 0.25, p.sy - cube / 2 + c * band, cube * 0.5, band);
            }
        } else if (id === "trail_blocks") {
            const colors = ["#5ab84a", "#8a6a3a", "#8a8a8a", "#6a4a2a"];
            const s = cube * (0.18 + r * 0.14);
            ctx.globalAlpha = a;
            ctx.fillStyle = colors[Math.floor(r * colors.length)];
            ctx.fillRect(p.sx + (r - 0.5) * cube * 0.7 - s / 2, p.sy + age * cube * 0.6 + (hashRand(p.i + 9) - 0.5) * cube * 0.5, s, s);
            ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
            ctx.fillRect(p.sx + (r - 0.5) * cube * 0.7 - s / 2, p.sy + age * cube * 0.6 + (hashRand(p.i + 9) - 0.5) * cube * 0.5 + s * 0.7, s, s * 0.3);
        } else if (id === "trail_stars") {
            if (p.i % 2 !== 0) {
                continue;
            }
            const s = cube * (0.08 + r * 0.08) * (0.6 + 0.4 * Math.sin(time * 0.02 + p.i));
            const x = p.sx + (r - 0.5) * cube * 0.8;
            const y = p.sy + (hashRand(p.i + 3) - 0.5) * cube * 0.8;
            ctx.globalAlpha = a;
            ctx.fillStyle = r < 0.5 ? "#ffe14d" : "#ffffff";
            ctx.fillRect(x - s / 2, y - s * 1.5, s, s * 3);
            ctx.fillRect(x - s * 1.5, y - s / 2, s * 3, s);
        } else if (id === "trail_comet") {
            // Хвіст комети: біле ядро, блакитне сяйво, що звужується, і зірочки
            const rad = cube * 0.42 * (1 - age * 0.8);
            ctx.globalAlpha = a * 0.35;
            ctx.fillStyle = age < 0.5 ? "#8ad8ff" : "#b58cff";
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, rad, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = a * 0.8;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, rad * 0.35, 0, Math.PI * 2);
            ctx.fill();
            if (p.i % 3 === 0) {
                const x = p.sx + (r - 0.5) * cube * 1.1;
                const y = p.sy + (hashRand(p.i + 13) - 0.5) * cube * 1.1;
                const st = cube * 0.05 * (0.6 + 0.4 * Math.sin(time * 0.015 + p.i));
                ctx.fillStyle = "#e8f6ff";
                ctx.fillRect(x - st / 2, y - st * 1.5, st, st * 3);
                ctx.fillRect(x - st * 1.5, y - st / 2, st * 3, st);
            }
        } else if (id === "trail_blackhole") {
            // Чорна діра: фіолетові кільця обертаються, до центру затягує частинки
            if (p.i % 2 !== 0) {
                continue;
            }
            const rad = cube * (0.2 + age * 0.3);
            ctx.globalAlpha = a * 0.9;
            ctx.strokeStyle = "#b35cff";
            ctx.lineWidth = Math.max(1.5, cube * 0.06);
            ctx.beginPath();
            ctx.ellipse(p.sx, p.sy, rad, rad * 0.4, time * 0.004 + p.i, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "#ff5ad8";
            ctx.lineWidth = Math.max(1, cube * 0.025);
            ctx.stroke();
            ctx.fillStyle = "#07000f";
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, rad * 0.3, 0, Math.PI * 2);
            ctx.fill();
            // Частинка, що спіраллю падає в діру
            const ang = time * 0.006 + r * 6.28;
            const d = rad * (1.4 - ((time * 0.001 + r) % 1));
            ctx.fillStyle = "#e0c8ff";
            ctx.fillRect(p.sx + Math.cos(ang) * d - 1.5, p.sy + Math.sin(ang) * d * 0.4 - 1.5, 3, 3);
        } else if (id === "trail_fire") {
            const s = cube * (0.35 - age * 0.25) * (0.8 + r * 0.4);
            ctx.globalAlpha = a;
            ctx.fillStyle = age < 0.3 ? "#fff4a0" : age < 0.6 ? "#ffaa22" : "#ff4a1a";
            ctx.fillRect(p.sx - s / 2 + (r - 0.5) * cube * 0.3, p.sy - s / 2 - age * cube * 0.7, s, s);
        }
    }
    ctx.globalAlpha = 1;
}

// ---------- Ефекти вибуху ----------

export const EXPLOSION_DURATION = 1.4;

// t — секунди від вибуху; (x, y) — центр кубика на екрані; cube — розмір кубика
export function drawExplosion(ctx, id, t, x, y, cube) {
    if (!id || id === "boom_default" || t > EXPLOSION_DURATION) {
        return;
    }
    const k = t / EXPLOSION_DURATION;
    const fade = Math.max(0, 1 - k);
    ctx.save();
    if (id === "boom_confetti") {
        const colors = ["#ff3355", "#ffe14d", "#39c6ff", "#39ff88", "#ff5ad8", "#ff9a3d"];
        for (let i = 0; i < 40; i++) {
            const ang = hashRand(i) * Math.PI * 2;
            const sp = cube * (2 + hashRand(i + 50) * 4);
            const px = x + Math.cos(ang) * sp * t * 1.4;
            const py = y + Math.sin(ang) * sp * t * 1.4 - cube * 3 * t + cube * 6 * t * t;
            ctx.globalAlpha = fade;
            ctx.fillStyle = colors[i % colors.length];
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(t * 10 + i);
            ctx.fillRect(-cube * 0.1, -cube * 0.05, cube * 0.2, cube * 0.1);
            ctx.restore();
        }
    } else if (id === "boom_pixels") {
        const colors = ["#5ab84a", "#8a6a3a", "#8a8a8a", "#6a4a2a", "#3a8a2a"];
        for (let i = 0; i < 24; i++) {
            const ang = hashRand(i) * Math.PI * 2;
            const sp = cube * (2 + hashRand(i + 20) * 3);
            const px = x + Math.cos(ang) * sp * t;
            const py = y + Math.sin(ang) * sp * t - cube * 4 * t + cube * 9 * t * t;
            const s = cube * (0.18 + hashRand(i + 40) * 0.16);
            ctx.globalAlpha = fade;
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(px - s / 2, py - s / 2, s, s);
            ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            ctx.fillRect(px - s / 2, py - s / 2, s, s * 0.25);
        }
    } else if (id === "boom_bubbles") {
        for (let i = 0; i < 18; i++) {
            const ang = hashRand(i) * Math.PI * 2;
            const dist = cube * (0.6 + hashRand(i + 7) * 2.2) * Math.min(1, t * 2.5);
            const px = x + Math.cos(ang) * dist;
            const py = y + Math.sin(ang) * dist - cube * 1.5 * t;
            const pop = hashRand(i + 30) * 0.6 + 0.5;
            if (t > pop) {
                if (t < pop + 0.12) {
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = "#ffffff";
                    for (let d = 0; d < 4; d++) {
                        ctx.fillRect(px + Math.cos(d * 1.57) * cube * 0.25, py + Math.sin(d * 1.57) * cube * 0.25, 3, 3);
                    }
                }
                continue;
            }
            const rad = cube * (0.15 + hashRand(i + 60) * 0.25);
            ctx.globalAlpha = 0.9;
            ctx.strokeStyle = ["#bff0ff", "#ffc8f0", "#e0ffd0"][i % 3];
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, rad, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(px - rad * 0.45, py - rad * 0.5, 3, 3);
        }
    } else if (id === "boom_watermelon") {
        for (let i = 0; i < 16; i++) {
            const ang = hashRand(i) * Math.PI * 2;
            const sp = cube * (2 + hashRand(i + 11) * 3);
            const px = x + Math.cos(ang) * sp * t;
            const py = y + Math.sin(ang) * sp * t - cube * 3 * t + cube * 8 * t * t;
            const s = cube * (0.3 + hashRand(i + 5) * 0.2);
            ctx.globalAlpha = fade;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(t * 6 + i);
            ctx.fillStyle = "#2f8a3a";
            ctx.fillRect(-s / 2, s * 0.3, s, s * 0.2);
            ctx.fillStyle = "#ff4a5a";
            ctx.fillRect(-s / 2, -s / 2, s, s * 0.8);
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(-s * 0.2, -s * 0.2, s * 0.12, s * 0.16);
            ctx.fillRect(s * 0.15, -s * 0.05, s * 0.12, s * 0.16);
            ctx.restore();
        }
        // Бризки соку
        ctx.globalAlpha = fade * 0.7;
        ctx.fillStyle = "#ff6a7a";
        for (let i = 0; i < 12; i++) {
            const ang = hashRand(i + 90) * Math.PI * 2;
            ctx.fillRect(x + Math.cos(ang) * cube * 3 * t, y + Math.sin(ang) * cube * 3 * t + cube * 3 * t * t, 3, 3);
        }
    } else if (id === "boom_fireworks") {
        const colors = ["#ff3355", "#ffe14d", "#39c6ff", "#39ff88", "#ff5ad8"];
        for (let b = 0; b < 3; b++) {
            const start = b * 0.25;
            const tb = t - start;
            if (tb < 0) {
                continue;
            }
            const bx = x + (b - 1) * cube * 1.6;
            const by = y - cube * (1.2 + b % 2);
            const kb = Math.min(1, tb / 0.9);
            for (let r = 0; r < 14; r++) {
                const ang = r * Math.PI * 2 / 14;
                const rad = cube * 1.8 * Math.sqrt(kb);
                ctx.globalAlpha = Math.max(0, 1 - kb);
                ctx.fillStyle = colors[(b + r) % colors.length];
                ctx.fillRect(bx + Math.cos(ang) * rad - 2, by + Math.sin(ang) * rad + kb * kb * cube * 0.8 - 2, 4, 4);
                ctx.fillRect(bx + Math.cos(ang) * rad * 0.7 - 1, by + Math.sin(ang) * rad * 0.7 + kb * kb * cube * 0.6 - 1, 2, 2);
            }
        }
    } else if (id === "boom_plasma") {
        // Спалах і блискавки на всі боки, що мерехтять
        const flick = Math.floor(t * 20);
        const len = cube * 3.2 * Math.min(1, t * 3);
        if (t < 0.18) {
            ctx.globalAlpha = 1 - t / 0.18;
            ctx.fillStyle = "#e0f4ff";
            ctx.beginPath();
            ctx.arc(x, y, cube * (0.6 + t * 6), 0, Math.PI * 2);
            ctx.fill();
        }
        for (let b = 0; b < 8; b++) {
            const ang = b * Math.PI / 4 + hashRand(b) * 0.4;
            for (let pass = 0; pass < 2; pass++) {
                ctx.globalAlpha = fade * (pass === 0 ? 0.45 : 1);
                ctx.strokeStyle = pass === 0 ? "#5a9aff" : "#ffffff";
                ctx.lineWidth = pass === 0 ? cube * 0.18 : cube * 0.05;
                ctx.beginPath();
                ctx.moveTo(x, y);
                for (let seg = 1; seg <= 5; seg++) {
                    const d = len * seg / 5;
                    const side = (hashRand(b * 13 + seg + flick * 7) - 0.5) * cube * 0.6;
                    ctx.lineTo(x + Math.cos(ang) * d - Math.sin(ang) * side, y + Math.sin(ang) * d + Math.cos(ang) * side);
                }
                ctx.stroke();
            }
        }
    } else if (id === "boom_supernova") {
        // Білий спалах, три кольорові хвилі й розліт зірочок
        if (t < 0.2) {
            ctx.globalAlpha = 1 - t / 0.2;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(x, y, cube * (0.8 + t * 8), 0, Math.PI * 2);
            ctx.fill();
        }
        const ringColors = ["#ffe14d", "#ff5ad8", "#5ad0ff"];
        for (let rg = 0; rg < 3; rg++) {
            const tr = t - rg * 0.15;
            if (tr <= 0) {
                continue;
            }
            const kr = Math.min(1, tr / 1.0);
            ctx.globalAlpha = Math.max(0, 1 - kr);
            ctx.strokeStyle = ringColors[rg];
            ctx.lineWidth = cube * 0.22 * (1 - kr) + 1;
            ctx.beginPath();
            ctx.arc(x, y, cube * 3.5 * Math.sqrt(kr), 0, Math.PI * 2);
            ctx.stroke();
        }
        for (let i = 0; i < 16; i++) {
            const ang = hashRand(i + 70) * Math.PI * 2;
            const d = cube * (2 + hashRand(i + 80) * 2.5) * Math.sqrt(k);
            const st = cube * 0.07;
            ctx.globalAlpha = fade;
            ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#ffe14d";
            ctx.fillRect(x + Math.cos(ang) * d - st / 2, y + Math.sin(ang) * d - st * 1.5, st, st * 3);
            ctx.fillRect(x + Math.cos(ang) * d - st * 1.5, y + Math.sin(ang) * d - st / 2, st * 3, st);
        }
    } else if (id === "boom_atomic") {
        // Спалах, ударна хвиля по землі й гриб, що росте й темніє
        if (t < 0.15) {
            ctx.globalAlpha = 1 - t / 0.15;
            ctx.fillStyle = "#fff8d0";
            ctx.beginPath();
            ctx.arc(x, y, cube * (1 + t * 12), 0, Math.PI * 2);
            ctx.fill();
        }
        const ground = y + cube * 0.5;
        ctx.globalAlpha = fade * 0.8;
        ctx.strokeStyle = "#ffcc66";
        ctx.lineWidth = Math.max(1.5, cube * 0.08);
        ctx.beginPath();
        ctx.ellipse(x, ground, cube * 4.5 * Math.sqrt(k), cube * 0.5 * Math.sqrt(k), 0, 0, Math.PI * 2);
        ctx.stroke();
        const rise = Math.min(1, t / 0.7);
        const top = ground - cube * 3.2 * rise;
        const hot = Math.max(0, 1 - k * 1.6);
        const colA = hot > 0.5 ? "#ffcc33" : hot > 0.15 ? "#ff7a2a" : "#8a7a70";
        const colB = hot > 0.5 ? "#ff7a1a" : hot > 0.15 ? "#c84a1a" : "#5a524c";
        ctx.globalAlpha = fade;
        // Ніжка гриба
        ctx.fillStyle = colB;
        ctx.fillRect(x - cube * 0.28, top + cube * 0.4, cube * 0.56, ground - top - cube * 0.4);
        ctx.fillStyle = colA;
        ctx.fillRect(x - cube * 0.14, top + cube * 0.4, cube * 0.28, ground - top - cube * 0.4);
        // Шапка з клубів
        const capR = cube * (0.5 + 0.9 * rise);
        for (let c = 0; c < 7; c++) {
            const ang = Math.PI + c * Math.PI / 6;
            const cx = x + Math.cos(ang) * capR * 0.8;
            const cy = top + Math.sin(ang) * capR * 0.45 + cube * 0.2;
            ctx.fillStyle = c % 2 === 0 ? colA : colB;
            ctx.beginPath();
            ctx.arc(cx, cy, capR * 0.45, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = colA;
        ctx.beginPath();
        ctx.arc(x, top + cube * 0.1, capR * 0.6, 0, Math.PI * 2);
        ctx.fill();
        // Кільце диму навколо ніжки
        ctx.fillStyle = colB;
        ctx.fillRect(x - cube * 0.6 * rise, top + (ground - top) * 0.55, cube * 1.2 * rise, cube * 0.18);
    } else if (id === "boom_starfall") {
        for (let i = 0; i < 20; i++) {
            const ang = -Math.PI / 2 + (hashRand(i) - 0.5) * 2.2;
            const sp = cube * (3 + hashRand(i + 3) * 3);
            const px = x + Math.cos(ang) * sp * t;
            const py = y + Math.sin(ang) * sp * t + cube * 7 * t * t;
            const s = cube * (0.08 + hashRand(i + 8) * 0.08);
            ctx.globalAlpha = fade;
            ctx.fillStyle = i % 3 === 0 ? "#ffffff" : "#ffe14d";
            ctx.fillRect(px - s / 2, py - s * 1.5, s, s * 3);
            ctx.fillRect(px - s * 1.5, py - s / 2, s * 3, s);
        }
    }
    ctx.restore();
}

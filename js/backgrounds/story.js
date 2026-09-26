// backgrounds/story.js — сюжет світів (STORY_BY_THEME): три фази за прогресом і реакція на помилку

import { BackgroundRenderer } from "./core.js";
import { drawFallingPixels, drawPixelDisc, pixelBlockSize, pixelRng, smoothStep } from "./helpers.js";
import { drawFireworks } from "./crystal_dino_base_luna.js";
import { drawPirateShip } from "./blackhole_citadel_pirate_orbit.js";
import { _fx, drawBigDigit } from "./effects.js";

// ---------- Сюжет світів: три фази за прогресом рівня та реакція на помилку ----------
// Кожен світ розповідає маленьку історію: початок → середина → фінал.
// Функції сюжету малюються поверх сцени й отримують:
// p — прогрес рівня (0…1), s1 — друга фаза (0→1 біля 30%), s2 — третя фаза (0→1 біля 63%),
// oops — реакція на помилку гравця (1 одразу після помилки, згасає до 0).

function storyPhase(p, start) {
    return smoothStep((p - start) / 0.08);
}

// Детерміновані координати для «розкиданих» елементів сюжету
function storyPoints(seed, count, W, yMin, yMax) {
    const rng = pixelRng(seed);
    const pts = [];
    for (let i = 0; i < count; i++) {
        pts.push({ x: rng() * W, y: yMin + rng() * (yMax - yMin), k: rng() });
    }
    return pts;
}

// Короткий спалах кольором при помилці
function storyOopsFlash(ctx, W, gY, oops, rgb, strength) {
    if (oops > 0.01) {
        ctx.fillStyle = "rgba(" + rgb + ", " + (strength * oops).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
    }
}

// Райдуга з піксельних дуг
function drawRainbow(ctx, cx, cy, R, B, alpha) {
    const colors = ["#ff3355", "#ff9a3d", "#ffe14d", "#39ff88", "#39c6ff", "#7a5cff"];
    const band = Math.max(3, Math.round(B / 2));
    ctx.globalAlpha = alpha;
    for (let i = 0; i < colors.length; i++) {
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = band;
        ctx.beginPath();
        ctx.arc(cx, cy, R - i * band, Math.PI, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

// Промінь прожектора з точки (x, y) під кутом ang
function drawBeam(ctx, x, y, ang, len, width, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang - width) * len, y + Math.sin(ang - width) * len);
    ctx.lineTo(x + Math.cos(ang + width) * len, y + Math.sin(ang + width) * len);
    ctx.closePath();
    ctx.fill();
}

// Ядро або камінь, що летить дугою від (x1, y1) до (x2, y2); k — 0…1
function drawArcShot(ctx, x1, y1, x2, y2, k, lift, size, color) {
    const x = x1 + (x2 - x1) * k;
    const y = y1 + (y2 - y1) * k - Math.sin(k * Math.PI) * lift;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
    return { x: x, y: y };
}

// Сплеск або пилова хмарка в точці падіння
function drawBurst(ctx, x, y, k, B, color) {
    ctx.globalAlpha = 1 - k;
    ctx.fillStyle = color;
    for (let i = 0; i < 6; i++) {
        const a = Math.PI + (i / 5) * Math.PI;
        ctx.fillRect(Math.round(x + Math.cos(a) * k * B * 2), Math.round(y + Math.sin(a) * k * B * 2.5), Math.max(2, B / 3), Math.max(2, B / 3));
    }
    ctx.globalAlpha = 1;
}

const STORY_BY_THEME = {
    // 1-1: жителі займаються справами — повз проходить залізний голем — вечір зі світлячками
    block_village(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0 && p < 0.9) {
            const k = Math.min(1, (p - 0.3) / 0.6);
            const x = W * 1.1 - k * W * 1.3;
            const y = gY - B * 1.2;
            const step = Math.sin(time * 4) > 0 ? 1 : 0;
            ctx.globalAlpha = s1;
            ctx.fillStyle = "#c8c0b0";
            ctx.fillRect(Math.round(x), Math.round(y - B * 4.4), Math.round(B * 1.4), Math.round(B * 1.2));
            ctx.fillRect(Math.round(x - B * 0.4), Math.round(y - B * 3.2), Math.round(B * 2.2), Math.round(B * 1.8));
            ctx.fillRect(Math.round(x - B * 0.9), Math.round(y - B * 3.1), Math.round(B * 0.5), Math.round(B * 2.4));
            ctx.fillRect(Math.round(x + B * 1.8), Math.round(y - B * 3.1), Math.round(B * 0.5), Math.round(B * 2.4));
            ctx.fillStyle = "#a89880";
            ctx.fillRect(Math.round(x + step * B * 0.2), Math.round(y - B * 1.4), Math.round(B * 0.6), Math.round(B * 1.4));
            ctx.fillRect(Math.round(x + B * 0.8 - step * B * 0.2), Math.round(y - B * 1.4), Math.round(B * 0.6), Math.round(B * 1.4));
            ctx.fillStyle = "#6a2a1a";
            ctx.fillRect(Math.round(x + B * 0.2), Math.round(y - B * 3.9), 3, 3);
            ctx.fillRect(Math.round(x + B * 0.9), Math.round(y - B * 3.9), 3, 3);
            ctx.fillStyle = "#3a8a2a";
            ctx.fillRect(Math.round(x - B * 0.2), Math.round(y - B * 2.6), Math.round(B * 0.5), Math.round(B * 0.3));
            ctx.globalAlpha = 1;
        }
        if (s2 > 0) {
            drawFallingPixels(ctx, W, gY, time, Math.round(30 * s2), 1111, {
                color: "#e8ff80", dir: -1, speedMin: 5, speedMax: 12, sizeMin: 2, sizeMax: 3,
                sway: 1.2, swayAmp: B, alpha: 0.5 + 0.4 * Math.sin(time * 3)
            });
        }
        storyOopsFlash(ctx, W, gY, oops, "120, 255, 120", 0.15);
    },

    // 1-5: метелики в джунглях — туман від водоспаду й мавпи — храм прокидається (у сцені)
    jungle_temple(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const n = Math.round(4 + s1 * 10);
        const pts = storyPoints(505, 14, W, gY * 0.4, gY * 0.85);
        const colors = ["#ff5ad8", "#ffe14d", "#39c6ff", "#ff9a3d"];
        for (let i = 0; i < n; i++) {
            const x = ((pts[i].x + Math.sin(time * 0.7 + i) * B * 3 - time * B * 0.8) % W + W) % W;
            const y = pts[i].y + Math.sin(time * 2.3 + i * 1.7) * B;
            const open = Math.sin(time * 14 + i) > 0;
            ctx.fillStyle = colors[i % 4];
            ctx.fillRect(Math.round(x - (open ? B * 0.35 : B * 0.15)), Math.round(y), Math.round(open ? B * 0.3 : B * 0.12), Math.round(B * 0.3));
            ctx.fillRect(Math.round(x + B * 0.08), Math.round(y), Math.round(open ? B * 0.3 : B * 0.12), Math.round(B * 0.3));
        }
        if (s1 > 0) {
            ctx.fillStyle = "rgba(230, 250, 245, " + (0.14 * s1 * (1 - s2 * 0.5)).toFixed(3) + ")";
            ctx.fillRect(0, Math.round(gY * 0.55), W, Math.round(gY * 0.45));
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 255, 255", 0.2);
    },

    // 1-2: вечір — прожектори над містом — салют
    sunset_city(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            for (let i = 0; i < 2; i++) {
                const ang = -Math.PI / 2 + Math.sin(time * 0.6 + i * 2) * 0.6;
                drawBeam(ctx, W * (0.3 + i * 0.4), gY * 0.75, ang, gY * 0.9, 0.06, "rgba(255, 240, 200, " + (0.12 * s1).toFixed(3) + ")");
            }
        }
        if (s2 > 0) {
            ctx.globalAlpha = s2;
            drawFireworks(ctx, W, gY * 0.7, B, time, true);
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "0, 0, 20", 0.35);
    },

    // 1-3: заправка з парою — зворотний відлік — ракета стартує (сама ракета — у сцені)
    cosmodrome(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const st = this._cosmodrome;
        if (!st) {
            return;
        }
        // Табло відліку: 9 → 0 між 30% і 70%
        if (s1 > 0) {
            const count = Math.max(0, Math.min(9, 9 - Math.floor((p - 0.3) / 0.4 * 10)));
            const bx = Math.round(st.padX - B * 7);
            const by = Math.round(gY * 0.45);
            ctx.globalAlpha = s1;
            ctx.fillStyle = "#0a0f1c";
            ctx.fillRect(bx - B * 0.4, by - B * 0.4, B * 2.6, B * 3.6);
            ctx.strokeStyle = "#39c6ff";
            ctx.lineWidth = 2;
            ctx.strokeRect(bx - B * 0.4, by - B * 0.4, B * 2.6, B * 3.6);
            drawBigDigit(ctx, count, bx, by, B * 0.6, count <= 3 ? "#ff3355" : "#39ff88");
            ctx.globalAlpha = 1;
        }
        // Заправка: пара з-під ракети до запалювання двигунів
        if (p < 0.6) {
            for (let i = 0; i < 4; i++) {
                const k = (time * 0.5 + i / 4) % 1;
                ctx.globalAlpha = (1 - k) * 0.35;
                drawPixelDisc(ctx, st.padX + B + (i % 2 === 0 ? -1 : 1) * k * B * 3, st.gY - B * 2 - k * B * 3, B * (0.5 + k), B / 2, "#e8ecf2");
            }
            ctx.globalAlpha = 1;
        }
        // Тривожна лампа на вежі при помилці
        if (oops > 0.05 && Math.sin(time * 30) > 0) {
            ctx.fillStyle = "#ff3355";
            ctx.fillRect(Math.round(st.padX - B * 1.8), Math.round(gY * 0.2), B, B);
        }
    },

    // 1-4: погоня з мигалками — фінішна арка з вогнів на обрії
    neon_highway(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            const loop = (time * 0.35) % 1;
            const x = W * 1.1 - loop * W * 1.3;
            const y = gY - B * 2.2;
            ctx.globalAlpha = s1;
            ctx.fillStyle = "#1a1a2e";
            ctx.fillRect(Math.round(x), Math.round(y), B * 3, B);
            ctx.fillRect(Math.round(x + B * 0.6), Math.round(y - B * 0.6), B * 1.6, B * 0.6);
            const blue = Math.sin(time * 20) > 0;
            ctx.fillStyle = blue ? "#3a7aff" : "#ff3355";
            ctx.fillRect(Math.round(x + B * 0.8), Math.round(y - B * 0.9), B * 0.6, B * 0.3);
            ctx.fillStyle = blue ? "rgba(58, 122, 255, 0.25)" : "rgba(255, 51, 85, 0.25)";
            ctx.fillRect(Math.round(x - B * 1.5), Math.round(y - B * 2.5), B * 6, B * 3.5);
            ctx.globalAlpha = 1;
        }
        if (s2 > 0) {
            const hz = Math.round(gY * 0.55);
            const aw = B * (2 + s2 * 4);
            const ah = B * (1.5 + s2 * 3);
            const chase = Math.floor(time * 10);
            for (let i = 0; i < 12; i++) {
                const a = Math.PI + (i / 11) * Math.PI;
                ctx.fillStyle = (i + chase) % 3 === 0 ? "#ffffff" : "#ff2ea6";
                ctx.globalAlpha = s2;
                ctx.fillRect(Math.round(W / 2 + Math.cos(a) * aw - 2), Math.round(hz + Math.sin(a) * ah - 2), 5, 5);
            }
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 51, 85", 0.15);
    },

    // 1-6: світляків більшає — сходить повний місяць — пролітає сова
    digital_forest(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        drawFallingPixels(ctx, W, gY * 0.9, time, Math.round(10 + p * 40), 606, {
            color: "#c8ff5a", dir: -1, speedMin: 6, speedMax: 16, sizeMin: 2, sizeMax: 3,
            sway: 1.2, swayAmp: B, alpha: 0.5 + 0.3 * Math.sin(time * 3)
        });
        if (s1 > 0) {
            const my = gY * (0.45 - 0.25 * s1);
            ctx.globalAlpha = s1;
            drawPixelDisc(ctx, W * 0.78, my, B * 3.5, B / 2, "rgba(220, 255, 220, 0.2)");
            drawPixelDisc(ctx, W * 0.78, my, B * 2.4, B / 2, "#f0ffe8");
            ctx.globalAlpha = 1;
        }
        if (s2 > 0) {
            const k = ((time * 0.12) % 1);
            const x = W * 1.1 - k * W * 1.3;
            const y = gY * 0.25 + Math.sin(k * Math.PI * 4) * B;
            const up = Math.sin(time * 5) > 0;
            ctx.globalAlpha = s2;
            ctx.fillStyle = "#5a4a3a";
            ctx.fillRect(Math.round(x), Math.round(y), B * 1.4, B * 1.2);
            ctx.fillRect(Math.round(x - B * 1.2), Math.round(y + (up ? -B * 0.6 : B * 0.3)), B * 1.2, B * 0.4);
            ctx.fillRect(Math.round(x + B * 1.4), Math.round(y + (up ? -B * 0.6 : B * 0.3)), B * 1.2, B * 0.4);
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(Math.round(x + B * 0.2), Math.round(y + B * 0.25), B * 0.3, B * 0.3);
            ctx.fillRect(Math.round(x + B * 0.85), Math.round(y + B * 0.25), B * 0.3, B * 0.3);
            ctx.globalAlpha = 1;
        }
        // Помилка: світлячки спалахують
        storyOopsFlash(ctx, W, gY, oops, "200, 255, 90", 0.12);
    },

    // 1-7: гроза посилюється — стихає, виходить сонце й райдуга (дощ і блискавки згасають у сцені)
    storm_sky(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0 && s2 < 1) {
            drawFallingPixels(ctx, W, gY, time, Math.round(50 * s1 * (1 - s2)), 717, {
                color: "#c8d4ff", dir: 1, speedMin: 600, speedMax: 800, sizeMin: 1, sizeMax: 2,
                sway: 0, swayAmp: 0, alpha: 0.35, stretch: 9
            });
        }
        if (s2 > 0) {
            ctx.fillStyle = "rgba(255, 230, 170, " + (0.18 * s2).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, gY);
            drawRainbow(ctx, W * 0.55, gY * 0.95, gY * 0.6, B, 0.55 * s2);
        }
        // Помилка: гуркіт грому — білий спалах
        storyOopsFlash(ctx, W, gY, oops, "220, 230, 255", 0.3);
    },

    // 1-8: кристали розгоряються — у глибині світиться кристал-серце
    crystal_cave(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const pts = storyPoints(808, 30, W, B * 3, gY * 0.8);
        const n = Math.round(p * 30);
        for (let i = 0; i < n; i++) {
            const tw = Math.sin(time * 3 + i * 1.7) * 0.5 + 0.5;
            ctx.fillStyle = i % 3 === 0 ? "#5cc8ff" : "#d68bff";
            ctx.globalAlpha = 0.4 + 0.6 * tw;
            ctx.fillRect(Math.round(pts[i].x), Math.round(pts[i].y), Math.max(2, B / 4), Math.max(2, B / 4));
        }
        ctx.globalAlpha = 1;
        if (s2 > 0) {
            const cx = W * 0.5;
            const cy = gY * 0.38;
            const pulse = 0.85 + 0.15 * Math.sin(time * 4);
            const size = B * (1 + s2 * 3) * pulse;
            ctx.globalAlpha = 0.25 * s2;
            drawPixelDisc(ctx, cx, cy, size * 2, B / 2, "#b35cff");
            ctx.globalAlpha = s2;
            ctx.fillStyle = "#e6bfff";
            for (let r = -4; r <= 4; r++) {
                const w = (4 - Math.abs(r)) / 4 * size;
                ctx.fillRect(Math.round(cx - w / 2), Math.round(cy + r * size / 4 - size / 8), Math.round(w), Math.round(size / 4));
            }
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(Math.round(cx - size * 0.1), Math.round(cy - size * 0.6), Math.round(size * 0.2), Math.round(size * 0.6));
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "180, 90, 255", 0.2);
    },

    // 1-10: ніч — у темряві світяться очі павуків — світанок проганяє мобів
    pixel_night(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const eyes = storyPoints(1010, 10, W, gY * 0.62, gY * 0.9);
        const n = Math.round(s1 * 10 * (1 - s2));
        for (let i = 0; i < n; i++) {
            if ((time + eyes[i].k * 7) % 4 < 0.2) {
                continue;
            }
            ctx.fillStyle = "#ff2222";
            const ex = Math.round(eyes[i].x);
            const ey = Math.round(eyes[i].y);
            ctx.fillRect(ex, ey, Math.max(2, B / 4), Math.max(2, B / 4));
            ctx.fillRect(ex + B / 2, ey, Math.max(2, B / 4), Math.max(2, B / 4));
        }
        if (s2 > 0) {
            ctx.fillStyle = "rgba(255, 170, 110, " + (0.25 * s2).toFixed(3) + ")";
            ctx.fillRect(0, Math.round(gY * 0.4), W, Math.round(gY * 0.6));
            ctx.fillStyle = "rgba(140, 180, 255, " + (0.2 * s2).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, Math.round(gY * 0.4));
            const sy = gY * (0.55 - 0.3 * s2);
            drawPixelDisc(ctx, W * 0.15, sy, B * 2.5, B / 2, "#ffdd66");
        }
        // Помилка: шипить кріпер — зелений спалах
        storyOopsFlash(ctx, W, gY, oops, "90, 255, 90", 0.18);
    },

    // 1-11: тривога з червоними маяками — з бази злітає ракета
    secret_base(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            const blink = Math.sin(time * 6) * 0.5 + 0.5;
            ctx.fillStyle = "rgba(255, 30, 30, " + (0.12 * s1 * blink).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, gY);
            for (let i = 0; i < 3; i++) {
                const x = W * (0.2 + i * 0.3);
                drawBeam(ctx, x, gY * 0.7, -Math.PI / 2 + Math.sin(time * 3 + i * 2) * 1.1, gY * 0.5, 0.12, "rgba(255, 60, 60, " + (0.18 * s1).toFixed(3) + ")");
                ctx.fillStyle = "#ff3333";
                ctx.fillRect(Math.round(x - B / 3), Math.round(gY * 0.7 - B / 3), Math.round(B * 0.66), Math.round(B * 0.66));
            }
        }
        if (s2 > 0) {
            const k = Math.max(0, (p - 0.7) / 0.3);
            const x = W * 0.62;
            const y = gY * 0.8 - k * k * gY * 1.2;
            ctx.fillStyle = "#e8ecf2";
            ctx.fillRect(Math.round(x), Math.round(y - B * 3), B, B * 3);
            ctx.fillStyle = "#ff3355";
            ctx.fillRect(Math.round(x), Math.round(y - B * 3.6), B, B * 0.6);
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(Math.round(x + B * 0.2), Math.round(y), B * 0.6, B * (1 + Math.sin(time * 30) * 0.3));
            ctx.fillStyle = "rgba(200, 200, 220, 0.3)";
            for (let t = 1; t < 6; t++) {
                ctx.fillRect(Math.round(x - t * B * 0.2), Math.round(y + t * B), B + t * B * 0.4, B);
            }
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 30, 30", 0.25);
    },

    // 1-13: фабрикатори друкують дрібниці — дрони-будівельники збирають підводний апарат — він вмикає вогні й відпливає
    sea_fabricator(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const build = Math.max(0, Math.min(1, (p - 0.3) / 0.5));
        if (build <= 0) {
            storyOopsFlash(ctx, W, gY, oops, "255, 60, 60", 0.2);
            return;
        }
        const launch = Math.max(0, (p - 0.82) / 0.18);
        const cx = W * 0.62;
        const cy = gY * 0.42 - launch * launch * gY * 0.7;
        const u = B * 0.5;
        // Корпус апарата: піксельна мапа 16×9 (1 — білий корпус, 2 — жовті смуги, 3 — скло, 4 — фари)
        const rows = [
            "......3333......",
            "....33333333....",
            "...3333333333...",
            ".11111111111111.",
            "1122222222222211",
            "1111111111111114",
            ".11111111111111.",
            "..1..........1..",
            ".111........111."
        ];
        const colors = { 1: "#e8eef2", 2: "#ffcc33", 3: "rgba(120, 220, 255, 0.75)", 4: "#fff4a0" };
        const shownRows = Math.ceil(rows.length * build);
        const left = cx - 8 * u;
        const top = cy - 4.5 * u;
        // Каркас-силует ще не надрукованої частини
        ctx.fillStyle = "rgba(90, 220, 255, 0.18)";
        ctx.fillRect(Math.round(left), Math.round(top), Math.round(16 * u), Math.round((rows.length - shownRows) * u));
        for (let r = rows.length - shownRows; r < rows.length; r++) {
            for (let k = 0; k < 16; k++) {
                const ch = rows[r][k];
                if (ch === ".") {
                    continue;
                }
                ctx.fillStyle = ch === "4" && launch <= 0 ? "#8a8a70" : colors[ch];
                ctx.fillRect(Math.round(left + k * u), Math.round(top + r * u), Math.ceil(u), Math.ceil(u));
            }
        }
        // Дрони-будівельники з лазерами, поки апарат друкується
        if (build < 1) {
            const lineY = top + (rows.length - shownRows) * u;
            for (let i = 0; i < 3; i++) {
                const a = time * 1.5 + i * Math.PI * 2 / 3;
                const dx = cx + Math.cos(a) * u * 12;
                const dy = top - u * 3 + Math.sin(a * 2) * u * 1.5;
                ctx.fillStyle = "#e8eef2";
                ctx.fillRect(Math.round(dx - u), Math.round(dy - u * 0.5), Math.round(u * 2), Math.round(u));
                ctx.fillStyle = "#ff9a3d";
                ctx.fillRect(Math.round(dx - u * 1.4), Math.round(dy - u * 0.8), Math.round(u * 0.8), Math.round(u * 0.3));
                ctx.fillRect(Math.round(dx + u * 0.6), Math.round(dy - u * 0.8), Math.round(u * 0.8), Math.round(u * 0.3));
                ctx.strokeStyle = "rgba(90, 220, 255, 0.8)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(dx, dy + u * 0.5);
                ctx.lineTo(left + 16 * u * (0.5 + Math.sin(time * 7 + i * 2) * 0.5), lineY);
                ctx.stroke();
            }
            ctx.fillStyle = "rgba(120, 230, 255, 0.9)";
            ctx.fillRect(Math.round(left - 4), Math.round(lineY) - 1, Math.round(16 * u + 8), 2);
        } else {
            // Готовий апарат: фари світять, бульбашки з двигуна
            ctx.fillStyle = "rgba(255, 244, 160, 0.18)";
            ctx.beginPath();
            ctx.moveTo(left + 16 * u, top + 5.5 * u);
            ctx.lineTo(left + 16 * u + W * 0.25, top + 5.5 * u - B * 3);
            ctx.lineTo(left + 16 * u + W * 0.25, top + 5.5 * u + B * 3);
            ctx.closePath();
            ctx.fill();
            for (let k = 0; k < 5; k++) {
                const b = (time * 1.2 + k / 5) % 1;
                ctx.fillStyle = "rgba(220, 245, 255, " + (0.8 * (1 - b)).toFixed(3) + ")";
                ctx.fillRect(Math.round(left - b * B * 3), Math.round(top + 5 * u + Math.sin(k * 3) * u + b * B), 3, 3);
            }
        }
        // Помилка: червона тривожна лампа й спалах
        storyOopsFlash(ctx, W, gY, oops, "255, 60, 60", 0.2);
    },

    // 1-14: сонця сідають, одне закриває затемнення — ніч із кільцями планети
    twin_sun_planet(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            const k = Math.min(1, s1 * (0.6 + 0.4 * (1 - s2)));
            const mx = W * 0.28 + (1 - k) * B * 6;
            drawPixelDisc(ctx, mx, gY * 0.3, B * 2.9, B / 2, "rgba(40, 20, 60, " + (0.9 * s1).toFixed(3) + ")");
        }
        if (s2 > 0) {
            ctx.strokeStyle = "rgba(255, 200, 240, " + (0.35 * s2).toFixed(3) + ")";
            for (let i = 0; i < 3; i++) {
                ctx.lineWidth = Math.max(2, B / 3) - i;
                ctx.beginPath();
                ctx.ellipse(W * 0.5, gY * 0.95, W * (0.8 + i * 0.05), gY * (0.55 + i * 0.03), -0.08, Math.PI * 1.05, Math.PI * 1.95);
                ctx.stroke();
            }
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 120, 200", 0.15);
    },

    // 1-15: дирижаблі — проходимо крізь хмари — золоті повітряні кулі
    sky_city(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const k = (time * 0.05) % 1;
        const ax = W * 1.2 - k * W * 1.5;
        ctx.fillStyle = "#c8ccd8";
        ctx.fillRect(Math.round(ax), Math.round(gY * 0.18), B * 5, B * 1.6);
        ctx.fillRect(Math.round(ax + B * 5), Math.round(gY * 0.18 + B * 0.3), B, B);
        ctx.fillStyle = "#8a4b1c";
        ctx.fillRect(Math.round(ax + B * 1.5), Math.round(gY * 0.18 + B * 1.6), B * 2, B * 0.6);
        const fog = s1 * (1 - s2);
        if (fog > 0) {
            const pts = storyPoints(1515, 8, W, gY * 0.2, gY * 0.7);
            for (let i = 0; i < pts.length; i++) {
                const x = ((pts[i].x - time * B * (2 + pts[i].k * 3)) % (W + B * 12) + W + B * 12) % (W + B * 12) - B * 6;
                ctx.globalAlpha = 0.45 * fog;
                drawPixelDisc(ctx, x, pts[i].y, B * (2 + pts[i].k * 2), B, "#ffffff");
            }
            ctx.globalAlpha = 1;
        }
        if (s2 > 0) {
            const colors = [["#ff3355", "#ffe14d"], ["#39c6ff", "#ffffff"], ["#ff9a3d", "#b35cff"]];
            for (let i = 0; i < 3; i++) {
                const rise = ((time * 0.04 + i * 0.33) % 1);
                const bx = W * (0.2 + i * 0.3);
                const by = gY * 0.9 - rise * gY;
                ctx.globalAlpha = s2;
                drawPixelDisc(ctx, bx, by, B * 1.6, B / 2, colors[i][0]);
                ctx.fillStyle = colors[i][1];
                ctx.fillRect(Math.round(bx - B * 0.3), Math.round(by - B * 1.6), Math.round(B * 0.6), Math.round(B * 3.2));
                ctx.fillStyle = "#8a4b1c";
                ctx.fillRect(Math.round(bx - B * 0.4), Math.round(by + B * 2.2), Math.round(B * 0.8), Math.round(B * 0.6));
            }
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 255, 255", 0.2);
    },

    // 1-16: хвиля на трибунах — спалахи фотокамер і конфеті; помилка — трибуни гудуть
    stadium(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const st = this._stadium;
        if (!st) {
            return;
        }
        const top = st.standTop;
        const h = st.rowH * 8;
        if (s1 > 0) {
            const wx = ((time * W * 0.35) % (W + B * 8)) - B * 4;
            ctx.fillStyle = "rgba(255, 255, 255, " + (0.25 * s1).toFixed(3) + ")";
            ctx.fillRect(Math.round(wx), Math.round(top - B * 0.6), B * 4, Math.round(h));
        }
        if (s2 > 0) {
            const rng = pixelRng(Math.floor(time * 12));
            ctx.fillStyle = "#ffffff";
            for (let i = 0; i < Math.round(8 * s2); i++) {
                ctx.fillRect(Math.round(rng() * W), Math.round(top + rng() * h), B / 2, B / 2);
            }
            drawFallingPixels(ctx, W, gY, time, Math.round(40 * s2), 1616, {
                color: "#ffe14d", dir: 1, speedMin: 40, speedMax: 90, sizeMin: 3, sizeMax: 5,
                sway: 2, swayAmp: B, alpha: 0.8
            });
            drawFallingPixels(ctx, W, gY, time, Math.round(30 * s2), 1617, {
                color: "#39c6ff", dir: 1, speedMin: 40, speedMax: 90, sizeMin: 3, sizeMax: 5,
                sway: 2.3, swayAmp: B, alpha: 0.8
            });
        }
        if (oops > 0.05) {
            ctx.fillStyle = "rgba(0, 0, 0, " + (0.35 * oops).toFixed(3) + ")";
            ctx.fillRect(0, Math.round(top - B), W, Math.round(h + B));
        }
    },

    // 2-1: дрон з прожектором шукає кубик — салют з дахів
    neon_rooftops(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            const dx = W * 0.5 + Math.sin(time * 0.4) * W * 0.35;
            const dy = gY * 0.2 + Math.sin(time * 1.3) * B;
            drawBeam(ctx, dx, dy, Math.PI / 2 + Math.sin(time * 0.9) * 0.4, gY * 0.9, 0.12, "rgba(200, 240, 255, " + (0.14 * s1).toFixed(3) + ")");
            ctx.globalAlpha = s1;
            ctx.fillStyle = "#2a2a3a";
            ctx.fillRect(Math.round(dx - B), Math.round(dy - B * 0.3), B * 2, B * 0.6);
            ctx.fillRect(Math.round(dx - B * 1.6), Math.round(dy - B * 0.6), B * 0.8, B * 0.2);
            ctx.fillRect(Math.round(dx + B * 0.8), Math.round(dy - B * 0.6), B * 0.8, B * 0.2);
            ctx.fillStyle = Math.sin(time * 8) > 0 ? "#ff2ea6" : "#39ff88";
            ctx.fillRect(Math.round(dx - B * 0.15), Math.round(dy - B * 0.15), B * 0.3, B * 0.3);
            ctx.globalAlpha = 1;
        }
        if (s2 > 0) {
            ctx.globalAlpha = s2;
            drawFireworks(ctx, W, gY * 0.65, B, time, true);
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "0, 0, 20", 0.4);
    },

    // 2-2: туман і промінь маяка — у гавань заходить корабель із вогнями
    night_harbor(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const lx = W * 0.08;
        const ly = gY * 0.35;
        ctx.fillStyle = "#e8e0d0";
        ctx.fillRect(Math.round(lx - B * 0.6), Math.round(ly), Math.round(B * 1.2), Math.round(gY * 0.25));
        ctx.fillStyle = "#ff3355";
        ctx.fillRect(Math.round(lx - B * 0.6), Math.round(ly + B * 1.5), Math.round(B * 1.2), B * 0.6);
        ctx.fillStyle = "#ffe9a0";
        ctx.fillRect(Math.round(lx - B * 0.5), Math.round(ly - B * 0.8), B, B * 0.8);
        if (s1 > 0) {
            const ang = Math.sin(time * 0.7) * 0.5 + 0.1;
            drawBeam(ctx, lx, ly - B * 0.4, ang, W * 0.9, 0.05, "rgba(255, 240, 180, " + (0.2 * s1).toFixed(3) + ")");
            ctx.fillStyle = "rgba(180, 200, 230, " + (0.12 * s1 * (1 - s2 * 0.6)).toFixed(3) + ")";
            ctx.fillRect(0, Math.round(gY * 0.45), W, Math.round(gY * 0.55));
        }
        if (s2 > 0) {
            const x = W * 1.05 - s2 * W * 0.45 - Math.max(0, p - 0.7) * W * 0.6;
            const y = gY * 0.58;
            ctx.fillStyle = "#1a2030";
            ctx.fillRect(Math.round(x), Math.round(y - B * 1.5), B * 10, B * 1.5);
            ctx.fillRect(Math.round(x + B * 2), Math.round(y - B * 3.2), B * 5, B * 1.7);
            ctx.fillRect(Math.round(x + B * 5.5), Math.round(y - B * 4.5), B, B * 1.3);
            ctx.fillStyle = "#ffe14d";
            for (let i = 0; i < 6; i++) {
                ctx.fillRect(Math.round(x + B * (2.4 + i * 0.75)), Math.round(y - B * 2.6), Math.round(B * 0.35), Math.round(B * 0.35));
            }
            ctx.fillStyle = Math.sin(time * 4) > 0 ? "#ff3355" : "#39ff88";
            ctx.fillRect(Math.round(x + B * 5.7), Math.round(y - B * 4.9), Math.round(B * 0.5), Math.round(B * 0.4));
        }
        storyOopsFlash(ctx, W, gY, oops, "180, 200, 230", 0.2);
    },

    // 2-3: піратський корабель підходить — гарматна перестрілка з бризками
    pirate_bay(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const hz = Math.round(gY * 0.55);
        if (s1 > 0) {
            const ex = W * 0.04 + (1 - s1) * -B * 12;
            drawPirateShip(ctx, Math.round(ex), hz - B * 0.8, B, time);
            // Постріли з гармат
            const period = 1.8 - s2 * 0.8;
            const k = (time % period) / period;
            const shot = Math.floor(time / period);
            const target = W * (0.3 + pixelRng(shot * 3)() * 0.5);
            if (k < 0.12) {
                ctx.fillStyle = "rgba(255, 220, 120, " + (1 - k / 0.12).toFixed(3) + ")";
                ctx.fillRect(Math.round(ex + B * 6), Math.round(hz - B * 2), B * 1.5, B);
            }
            if (k < 0.7) {
                drawArcShot(ctx, ex + B * 7, hz - B * 1.5, target, hz + B * 0.5, k / 0.7, gY * 0.25, Math.max(4, B / 2), "#1a1a1a");
            } else {
                drawBurst(ctx, target, hz + B * 0.5, (k - 0.7) / 0.3, B, "#e8f6ff");
            }
        }
        storyOopsFlash(ctx, W, gY, oops, "230, 245, 255", 0.2);
    },

    // 2-4: смолоскипи загоряються один за одним — золотий дощ
    treasury(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const n = Math.round(1 + p * 7);
        for (let i = 0; i < 8; i++) {
            const x = W * (0.06 + i * 0.125);
            const y = gY * 0.3;
            ctx.fillStyle = "#5a3a1a";
            ctx.fillRect(Math.round(x - B * 0.2), Math.round(y), Math.round(B * 0.4), B * 1.4);
            if (i < n) {
                const fl = 0.8 + 0.2 * Math.sin(time * 12 + i * 3) - (oops > 0.05 ? 0.5 * oops : 0);
                ctx.globalAlpha = 0.25 * fl;
                drawPixelDisc(ctx, x, y - B * 0.4, B * 1.8, B / 2, "#ffaa33");
                ctx.globalAlpha = 1;
                ctx.fillStyle = "#ff7a00";
                ctx.fillRect(Math.round(x - B * 0.35), Math.round(y - B * 0.9 * fl), Math.round(B * 0.7), Math.round(B * 0.9 * fl));
                ctx.fillStyle = "#ffe14d";
                ctx.fillRect(Math.round(x - B * 0.15), Math.round(y - B * 0.6 * fl), Math.round(B * 0.3), Math.round(B * 0.6 * fl));
            }
        }
        if (s2 > 0) {
            drawFallingPixels(ctx, W, gY, time, Math.round(45 * s2), 2020, {
                color: "#ffcc33", dir: 1, speedMin: 80, speedMax: 160, sizeMin: 3, sizeMax: 5,
                sway: 3, swayAmp: B * 0.3, alpha: 0.9
            });
        }
    },

    // 2-5: на планеті настає ніч із вогнями міст — сонце сходить з-за краю планети
    orbit_view(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const st = this._orbitView;
        if (!st) {
            return;
        }
        const shadowX = W * (1.1 - Math.min(1, p * 1.4) * 1.2);
        if (shadowX < W) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(st.planetCx, st.planetCy, st.planetR, 0, Math.PI * 2);
            ctx.clip();
            ctx.fillStyle = "rgba(0, 5, 20, 0.6)";
            ctx.fillRect(Math.round(shadowX), 0, Math.round(W - shadowX), Math.round(H));
            const lights = storyPoints(2121, 40, W, st.planetCy - st.planetR, gY);
            ctx.fillStyle = "#ffcc55";
            for (const l of lights) {
                if (l.x > shadowX + B && (time * 2 + l.k * 10) % 5 > 0.3) {
                    ctx.fillRect(Math.round(l.x), Math.round(l.y), 2, 2);
                }
            }
            ctx.restore();
        }
        if (s2 > 0) {
            const edgeY = st.planetCy - st.planetR;
            const sx = W * 0.85;
            const glow = s2 * (0.8 + 0.2 * Math.sin(time * 2));
            ctx.globalAlpha = glow * 0.35;
            drawPixelDisc(ctx, sx, edgeY, B * 6, B, "#fff0c0");
            ctx.globalAlpha = glow;
            drawPixelDisc(ctx, sx, edgeY, B * 2, B / 2, "#ffffff");
            ctx.fillStyle = "rgba(255, 250, 220, " + (0.5 * glow).toFixed(3) + ")";
            ctx.fillRect(Math.round(sx - W * 0.25), Math.round(edgeY - 1), Math.round(W * 0.5), 3);
            ctx.fillRect(Math.round(sx - 1), Math.round(edgeY - B * 5), 3, Math.round(B * 10));
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 60, 60", 0.15);
    },

    // 2-6: дракон хропе димом — розплющує очі — пролітає над головою
    dragon_lair(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const st = this._dragonLair;
        if (!st) {
            return;
        }
        // Хропіння: кільця диму з печери
        if (s1 < 1) {
            for (let i = 0; i < 3; i++) {
                const k = (time * 0.3 + i / 3) % 1;
                ctx.globalAlpha = (1 - k) * 0.4 * (1 - s1);
                drawPixelDisc(ctx, st.caveX + Math.sin(k * 6 + i) * B, gY - B * 5 - k * gY * 0.4, B * (0.6 + k * 1.5), B / 2, "#8a7a6a");
            }
            ctx.globalAlpha = 1;
        }
        // Очі розплющуються й палають (і спалахують на помилку)
        const open = Math.max(s1, oops);
        if (open > 0.05) {
            ctx.fillStyle = oops > 0.3 ? "#ffffff" : "#ffea00";
            const eh = B * (0.4 + 0.5 * open);
            ctx.fillRect(Math.round(st.caveX - B * 1.5), Math.round(gY - B * 3.4 - eh / 2), B, Math.round(eh));
            ctx.fillRect(Math.round(st.caveX + B * 0.5), Math.round(gY - B * 3.4 - eh / 2), B, Math.round(eh));
            ctx.fillStyle = "#6a0000";
            ctx.fillRect(Math.round(st.caveX - B * 1.1), Math.round(gY - B * 3.4 - eh / 2), Math.round(B * 0.2), Math.round(eh));
            ctx.fillRect(Math.round(st.caveX + B * 0.9), Math.round(gY - B * 3.4 - eh / 2), Math.round(B * 0.2), Math.round(eh));
        }
        // Проліт дракона над головою
        if (p > 0.66 && p < 0.96) {
            const k = (p - 0.66) / 0.3;
            const x = W * 1.2 - k * W * 1.6;
            const y = gY * 0.15 + Math.sin(k * Math.PI) * gY * 0.1;
            const flap = Math.sin(time * 6) > 0;
            ctx.fillStyle = "#3a1a1a";
            ctx.fillRect(Math.round(x), Math.round(y), B * 8, B * 2);
            ctx.fillRect(Math.round(x - B * 2.4), Math.round(y - B * 0.6), B * 2.6, B * 1.8);
            ctx.fillRect(Math.round(x + B * 8), Math.round(y + B * 0.6), B * 5, B * 0.8);
            if (flap) {
                ctx.fillRect(Math.round(x + B * 2), Math.round(y - B * 5), B * 4, B * 5);
                ctx.fillRect(Math.round(x + B * 1), Math.round(y - B * 6), B * 3, B);
            } else {
                ctx.fillRect(Math.round(x + B * 2), Math.round(y + B * 2), B * 4, B * 3);
            }
            ctx.fillStyle = "#ffcc00";
            ctx.fillRect(Math.round(x - B * 2), Math.round(y - B * 0.2), Math.round(B * 0.5), Math.round(B * 0.4));
            if (Math.sin(time * 2) > 0.3) {
                ctx.fillStyle = "#ff7a00";
                ctx.fillRect(Math.round(x - B * 7), Math.round(y + B * 0.2), B * 4.6, B);
                ctx.fillStyle = "#ffe14d";
                ctx.fillRect(Math.round(x - B * 5), Math.round(y + B * 0.4), B * 2.6, B * 0.5);
            }
        }
    },

    // 2-7: вагонетки з рудою — обвал каміння — світло виходу й діаманти
    pixel_cave(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const k = (time * 0.15) % 1;
        const cx = W * 1.1 - k * W * 1.3;
        const cy = gY * 0.72;
        ctx.fillStyle = "#3a3a44";
        ctx.fillRect(0, Math.round(cy + B * 1.2), W, Math.max(2, B / 5));
        ctx.fillStyle = "#6a4a2a";
        ctx.fillRect(Math.round(cx), Math.round(cy), B * 2.4, B * 1.2);
        ctx.fillStyle = "#33d6d0";
        ctx.fillRect(Math.round(cx + B * 0.3), Math.round(cy - B * 0.4), B * 0.6, B * 0.6);
        ctx.fillStyle = "#ffcc33";
        ctx.fillRect(Math.round(cx + B * 1.2), Math.round(cy - B * 0.4), B * 0.6, B * 0.6);
        ctx.fillStyle = "#2a2a2a";
        ctx.fillRect(Math.round(cx + B * 0.3), Math.round(cy + B * 1.1), B * 0.5, B * 0.5);
        ctx.fillRect(Math.round(cx + B * 1.6), Math.round(cy + B * 1.1), B * 0.5, B * 0.5);
        const fall = s1 * (1 - s2);
        if (fall > 0) {
            drawFallingPixels(ctx, W, gY, time, Math.round(25 * fall), 2323, {
                color: "#7a7a88", dir: 1, speedMin: 200, speedMax: 320, sizeMin: Math.round(B / 3), sizeMax: Math.round(B / 2),
                sway: 0, swayAmp: 0, alpha: 0.9
            });
            ctx.fillStyle = "rgba(150, 140, 130, " + (0.12 * fall).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, gY);
        }
        if (s2 > 0) {
            drawBeam(ctx, W * 0.85, 0, Math.PI * 0.62, gY * 1.1, 0.12, "rgba(255, 250, 220, " + (0.22 * s2).toFixed(3) + ")");
            const pts = storyPoints(2324, 10, W, gY * 0.2, gY * 0.85);
            for (let i = 0; i < pts.length; i++) {
                const tw = Math.sin(time * 5 + i * 2) > 0.2;
                ctx.fillStyle = tw ? "#ffffff" : "#5cf6ff";
                ctx.globalAlpha = s2;
                ctx.fillRect(Math.round(pts[i].x), Math.round(pts[i].y), Math.round(B / 2), Math.round(B / 2));
            }
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "150, 140, 130", 0.25);
    },

    // 2-8: облога — катапульти кидають каміння — вогняні стріли
    knight_castle(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            for (let i = 0; i < 2; i++) {
                const period = 2.6 + i * 0.9;
                const k = ((time + i * 1.3) % period) / period;
                const tx = W * (0.25 + i * 0.35);
                const ty = gY * 0.5;
                if (k < 0.75) {
                    drawArcShot(ctx, W * 1.05, gY * 0.6, tx, ty, k / 0.75, gY * 0.4, Math.round(B * 0.7), "#5a5a66");
                } else {
                    drawBurst(ctx, tx, ty, (k - 0.75) / 0.25, B, "#a09a90");
                }
            }
        }
        if (s2 > 0) {
            for (let i = 0; i < 6; i++) {
                const k = ((time * 0.8 + i / 6) % 1);
                const x = W * (1 - k) + i * B;
                const y = gY * 0.15 + k * gY * 0.4 - Math.sin(k * Math.PI) * gY * 0.1;
                ctx.globalAlpha = s2;
                ctx.fillStyle = "#6a4a2a";
                ctx.fillRect(Math.round(x), Math.round(y), B, Math.max(2, B / 6));
                ctx.fillStyle = Math.sin(time * 20 + i) > 0 ? "#ffcc33" : "#ff6a00";
                ctx.fillRect(Math.round(x - B * 0.3), Math.round(y - B * 0.15), Math.round(B * 0.4), Math.round(B * 0.4));
            }
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "160, 150, 140", 0.2);
    },

    // 3-1: ясно — хуртовина — північне сяйво
    pixel_snow(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const storm = s1 * (1 - s2);
        if (storm > 0) {
            drawFallingPixels(ctx, W, gY, time, Math.round(90 * storm), 2525, {
                color: "#ffffff", dir: 1, speedMin: 120, speedMax: 220, sizeMin: 2, sizeMax: 4,
                sway: 2.5, swayAmp: W * 0.1, alpha: 0.85
            });
            ctx.fillStyle = "rgba(230, 240, 255, " + (0.25 * storm).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, gY);
        }
        if (s2 > 0) {
            const colors = ["#39ff88", "#39ffd0", "#b35cff"];
            for (let i = 0; i < 24; i++) {
                const x = W * i / 24;
                const wave = Math.sin(time * 0.8 + i * 0.5) * 0.5 + 0.5;
                ctx.globalAlpha = s2 * (0.15 + 0.25 * wave);
                ctx.fillStyle = colors[i % 3];
                ctx.fillRect(Math.round(x), Math.round(gY * (0.05 + 0.08 * Math.sin(i * 0.7 + time * 0.3))), Math.ceil(W / 24), Math.round(gY * (0.2 + 0.15 * wave)));
            }
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "255, 255, 255", 0.3);
    },

    // 3-2: занурюємося глибше, світяться риби — пропливає величезний левіафан
    pixel_ocean(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        ctx.fillStyle = "rgba(0, 10, 30, " + (0.35 * p).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
        const fish = storyPoints(2626, 24, W, gY * 0.15, gY * 0.85);
        const n = Math.round(s1 * 24);
        for (let i = 0; i < n; i++) {
            const x = ((fish[i].x - time * B * (1 + fish[i].k * 2)) % W + W) % W;
            ctx.fillStyle = i % 2 === 0 ? "#39ffd0" : "#ff5ad8";
            ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time * 3 + i);
            ctx.fillRect(Math.round(x), Math.round(fish[i].y), Math.round(B * 0.6), Math.max(2, Math.round(B / 4)));
        }
        ctx.globalAlpha = 1;
        if (p > 0.64 && p < 0.97) {
            const k = (p - 0.64) / 0.33;
            const headX = W * 1.2 - k * W * 2.4;
            const baseY = gY * 0.3;
            ctx.fillStyle = "rgba(10, 30, 50, 0.85)";
            for (let i = 0; i < 20; i++) {
                const sx = headX + i * B * 2;
                const sy = baseY + Math.sin(time * 1.5 - i * 0.45) * B * 1.5;
                const seg = Math.round(B * (3.2 - i * 0.12));
                ctx.fillRect(Math.round(sx), Math.round(sy - seg / 2), seg, seg);
            }
            ctx.fillStyle = "#ff5040";
            ctx.fillRect(Math.round(headX + B * 0.4), Math.round(baseY + Math.sin(time * 1.5) * B * 1.5 - B * 0.7), Math.round(B * 0.7), Math.round(B * 0.5));
        }
        // Помилка: хмарка бульбашок
        if (oops > 0.05) {
            drawFallingPixels(ctx, W, gY, time, Math.round(30 * oops), 2627, {
                color: "#dff6ff", dir: -1, speedMin: 80, speedMax: 160, sizeMin: 2, sizeMax: 4,
                sway: 2, swayAmp: B, alpha: 0.8 * oops
            });
        }
    },

    // 3-3: марево спеки — піщана буря — оазис із пальмами
    pixel_desert(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        for (let i = 0; i < 5; i++) {
            const y = gY * (0.6 + i * 0.07);
            ctx.fillStyle = "rgba(255, 240, 200, " + (0.08 * (1 - s1)).toFixed(3) + ")";
            ctx.fillRect(Math.round(Math.sin(time * 2 + i) * B), Math.round(y), W, Math.max(2, B / 5));
        }
        if (s2 > 0) {
            const ox = W * 0.8;
            const oy = gY * 0.82;
            ctx.globalAlpha = s2;
            ctx.fillStyle = "#39c6ff";
            ctx.fillRect(Math.round(ox - B * 4), Math.round(oy), B * 8, B * 0.8);
            ctx.fillStyle = "#bff4ff";
            ctx.fillRect(Math.round(ox - B * 3 + Math.sin(time * 2) * B), Math.round(oy + B * 0.2), B * 2, Math.max(2, B / 5));
            for (const dx of [-3.5, 3]) {
                ctx.fillStyle = "#6a4a2a";
                ctx.fillRect(Math.round(ox + dx * B), Math.round(oy - B * 4), Math.round(B * 0.5), B * 4);
                ctx.fillStyle = "#2f8a3a";
                for (let k = -2; k <= 2; k++) {
                    ctx.fillRect(Math.round(ox + dx * B + k * B * 0.8 - B * 0.2), Math.round(oy - B * 4.3 + Math.abs(k) * B * 0.4), B, Math.round(B * 0.4));
                }
            }
            ctx.globalAlpha = 1;
        }
        if (s1 > 0 && s2 < 1) {
            ctx.globalAlpha = s1 * (1 - s2);
            this.renderWeather(ctx, "sandstorm", W, H, gY, time);
            ctx.globalAlpha = 1;
        }
        storyOopsFlash(ctx, W, gY, oops, "230, 190, 120", 0.25);
    },

    // 3-4: метеоритний дощ — відкривається портал
    pixel_islands(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        if (s1 > 0) {
            for (let i = 0; i < 6; i++) {
                const k = (time * 0.6 + i / 6) % 1;
                const sx = W * (0.3 + (i * 0.37) % 0.8) - k * W * 0.4;
                const sy = k * gY * 0.7;
                for (let t = 0; t < 5; t++) {
                    ctx.globalAlpha = s1 * (1 - t / 5);
                    ctx.fillStyle = t === 0 ? "#ffffff" : "#d68bff";
                    ctx.fillRect(Math.round(sx + t * B * 0.5), Math.round(sy - t * B * 0.6), Math.max(3, B / 3), Math.max(3, B / 3));
                }
            }
            ctx.globalAlpha = 1;
        }
        if (s2 > 0) {
            const cx = W * 0.55;
            const cy = gY * 0.35;
            const r = B * 4 * s2;
            ctx.globalAlpha = 0.3 * s2;
            drawPixelDisc(ctx, cx, cy, r * 1.2, B / 2, "#b35cff");
            ctx.globalAlpha = 1;
            for (let k = 0; k < 3; k++) {
                ctx.strokeStyle = ["#b35cff", "#5cc8ff", "#ff4fd8"][k];
                ctx.lineWidth = Math.max(2, B / 4);
                ctx.beginPath();
                const rot = time * (2 + k) * (k % 2 === 0 ? 1 : -1);
                // Поки портал лише розкривається, внутрішні кільця ще не мають розміру
                const rk = Math.max(1, r - k * B * 0.6);
                ctx.ellipse(cx, cy, rk, rk * 1.3, 0, rot, rot + Math.PI * 1.4);
                ctx.stroke();
            }
        }
        storyOopsFlash(ctx, W, gY, oops, "214, 139, 255", 0.2);
    },

    // Світи з власними фазами у сцені: лише реакція на помилку
    dino_valley(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        storyOopsFlash(ctx, W, gY, oops, "255, 120, 40", 0.18);
    },
    luna_park(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        storyOopsFlash(ctx, W, gY, oops, "0, 0, 20", 0.4);
    },
    sky_citadel(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        storyOopsFlash(ctx, W, gY, oops, "255, 220, 120", 0.22);
    },

    // 4-1: чорна діра росте (у сцені), зорі затягує дедалі швидше — спалах горизонту подій
    black_hole(ctx, W, H, gY, time, B, p, s1, s2, oops) {
        const st = this._blackHole;
        if (!st) {
            return;
        }
        const n = Math.round(6 + s1 * 18);
        for (let i = 0; i < n; i++) {
            const t = ((time * (0.2 + s2 * 0.3) + i / n) % 1);
            const ang = i * 2.4 + t * Math.PI * 2;
            const rr = W * 0.6 * (1 - t);
            ctx.globalAlpha = t * 0.9;
            ctx.fillStyle = i % 3 === 0 ? "#ffcc88" : "#bfe9ff";
            ctx.fillRect(Math.round(st.cx + Math.cos(ang) * rr), Math.round(st.cy + Math.sin(ang) * rr * 0.6), Math.max(2, B / 4), Math.max(2, B / 4));
        }
        ctx.globalAlpha = 1;
        if (p > 0.93) {
            ctx.fillStyle = "rgba(255, 255, 255, " + (Math.min(1, (p - 0.93) / 0.07) * 0.5).toFixed(3) + ")";
            ctx.fillRect(0, 0, W, gY);
        }
        storyOopsFlash(ctx, W, gY, oops, "120, 60, 200", 0.2);
    }
};

BackgroundRenderer.renderStory = function (ctx, bgTheme, W, H, gY, time) {
    const story = STORY_BY_THEME[bgTheme];
    if (!story) {
        return;
    }
    const p = _fx.progress || 0;
    const B = pixelBlockSize(H);
    story.call(this, ctx, W, H, gY, time, B, p, storyPhase(p, 0.3), storyPhase(p, 0.63), _fx.oops || 0);
};

export { STORY_BY_THEME, drawBeam, storyOopsFlash, storyPhase };

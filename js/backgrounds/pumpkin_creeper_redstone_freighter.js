// backgrounds/pumpkin_creeper_redstone_freighter.js — Ліга 1: гарбузові пасовища, ліс кріперів,
// червоні шахти, космічний вантажник

import { BackgroundRenderer } from "./core.js";
import { drawBlockTerrain, drawPixelDisc, drawScrollingStrip, drawStripCopies, extraStripW, makeCanvas, makeSky, periodicHeights, pixelBlockSize, pixelRng } from "./helpers.js";
import { _fx } from "./effects.js";
import { storyPhase } from "./story.js";

// ============================================================
// Нові світи Ліги 1: Гарбузові пасовища, Ліс кріперів, Червоні шахти,
// Космічний вантажник, Джунглі мисливця, Туманне болото, Підземелля, Вулик
// ============================================================

// Піксельний гарбуз (bx, by — низ по центру)
function drawPumpkinBlock(ctx, bx, by, sz, B) {
    const p = Math.max(1, Math.round(B / 4));
    ctx.fillStyle = "#e8741a";
    ctx.fillRect(Math.round(bx - sz / 2), Math.round(by - sz * 0.8), Math.round(sz), Math.round(sz * 0.8));
    ctx.fillStyle = "#c85a0a";
    ctx.fillRect(Math.round(bx - sz * 0.2), Math.round(by - sz * 0.8), p, Math.round(sz * 0.8));
    ctx.fillRect(Math.round(bx + sz * 0.15), Math.round(by - sz * 0.8), p, Math.round(sz * 0.8));
    ctx.fillStyle = "#ffa04a";
    ctx.fillRect(Math.round(bx - sz / 2), Math.round(by - sz * 0.8), Math.round(sz), p);
    ctx.fillStyle = "#4a7a22";
    ctx.fillRect(Math.round(bx - p / 2), Math.round(by - sz * 0.8 - p * 2), p, p * 2);
}

// ---------- Гарбузові пасовища ----------

function buildPumpkinPastures(W, H, groundY, B) {
    const rng = pixelRng(3201);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#3a1a4a"], [0.5, "#a8402a"], [1, "#ffb05a"]]);
    const stripW = extraStripW(W, B);
    const farCols = stripW / B;
    const farH = periodicHeights(farCols, 5, [{ amp: 2, k: 2, ph: 0.4 }, { amp: 1, k: 5, ph: 1.1 }]);
    const far = makeCanvas(stripW, (Math.max.apply(null, farH) + 1) * B);
    drawBlockTerrain(far.getContext("2d"), farH, B, far.height, { top: "#4a2a4a", body: "#3a2040", body2: "#341c3a" }, rng);
    // Середній план: поле гарбузів, паркан, опудало й млини (крила — у render)
    const midH = B * 9;
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    mx.fillStyle = "#5a3a1a";
    mx.fillRect(0, midH - B * 2, stripW, B * 2);
    mx.fillStyle = "#6a8a2a";
    mx.fillRect(0, midH - B * 2, stripW, B * 0.4);
    const pumpkins = [];
    for (let x = B; x < stripW - B * 2; x += B * (2 + Math.floor(rng() * 3))) {
        const sz = B * (1 + rng() * 0.8);
        drawPumpkinBlock(mx, x, midH - B * 1.2, sz, B);
        pumpkins.push({ x: x, y: midH - B * 1.2, sz: sz });
    }
    // Паркан
    mx.fillStyle = "#8a6a40";
    mx.fillRect(0, midH - B * 3, stripW, B * 0.3);
    for (let x = 0; x < stripW; x += B * 3) {
        mx.fillRect(x, midH - B * 3.6, B * 0.4, B * 1.8);
    }
    const mills = [];
    for (let x = B * 8; x < stripW - B * 6; x += B * 30) {
        // Башта млина
        mx.fillStyle = "#c8a878";
        mx.fillRect(x - B, midH - B * 8, B * 2, B * 6);
        mx.fillStyle = "#8a3a2a";
        mx.fillRect(x - B * 1.4, midH - B * 8.6, B * 2.8, B * 0.8);
        mx.fillStyle = "#3a2a1a";
        mx.fillRect(x - B * 0.3, midH - B * 3.6, B * 0.6, B * 1.2);
        mills.push({ x: x, y: midH - B * 7.4 });
        // Опудало
        const sx = x + B * 12;
        mx.fillStyle = "#8a6a40";
        mx.fillRect(sx, midH - B * 5, B * 0.3, B * 3.4);
        mx.fillRect(sx - B * 1.2, midH - B * 4.2, B * 2.7, B * 0.3);
        mx.fillStyle = "#d8b060";
        mx.fillRect(sx - B * 0.4, midH - B * 5.6, B * 1.1, B * 0.9);
        mx.fillStyle = "#4a3a8a";
        mx.fillRect(sx - B * 0.6, midH - B * 4.6, B * 1.5, B * 1.4);
        mx.fillStyle = "#3a2a1a";
        mx.fillRect(sx - B * 0.6, midH - B * 6, B * 1.5, B * 0.5);
    }
    // Ближній план: трава й дрібні гарбузики
    const near = makeCanvas(stripW, B * 2);
    const nx = near.getContext("2d");
    for (let x = 0; x < stripW; x += B / 2) {
        nx.fillStyle = rng() < 0.5 ? "#4a7a22" : "#5a9a2a";
        nx.fillRect(x, B * 2 - B * (0.4 + rng() * 0.8), B / 2, B * 2);
    }
    for (let x = B * 3; x < stripW - B; x += B * (6 + Math.floor(rng() * 6))) {
        drawPumpkinBlock(nx, x, B * 2, B * 0.9, B);
    }
    return { W: W, H: H, sky: sky, far: far, mid: mid, near: near, pumpkins: pumpkins, mills: mills };
}

BackgroundRenderer.renderPumpkinPastures = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pumpkinPastures;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPumpkinPastures(W, H, groundY, B);
        this._pumpkinPastures = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Місяць урожаю: до кінця рівня більшає й жовтіє
    const s2 = storyPhase(_fx.progress || 0, 0.63);
    const moonR = B * (3 + s2 * 1.5);
    drawPixelDisc(ctx, W * 0.72, gY * 0.28, moonR * 1.5, B, "rgba(255, 200, 120, 0.12)");
    drawPixelDisc(ctx, W * 0.72, gY * 0.28, moonR, B, s2 > 0.5 ? "#ffcf6a" : "#ffe8b0");
    // Ворони
    for (let i = 0; i < 4; i++) {
        const k = ((time * 0.04 + i * 0.27) % 1.2) - 0.1;
        const x = W * (1 - k);
        const y = gY * (0.18 + i * 0.05) + Math.sin(time * 2 + i) * B * 0.5;
        const wing = Math.sin(time * 8 + i) > 0 ? -B * 0.4 : B * 0.2;
        ctx.fillStyle = "#1a1020";
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(B * 0.6), Math.round(B * 0.3));
        ctx.fillRect(Math.round(x - B * 0.5), Math.round(y + wing), Math.round(B * 0.5), Math.round(B * 0.2));
        ctx.fillRect(Math.round(x + B * 0.6), Math.round(y + wing), Math.round(B * 0.5), Math.round(B * 0.2));
    }
    drawScrollingStrip(ctx, st.far, W, gY - B * 4, time, speed, 0.06);
    const midTop = gY - B * 0.6 - st.mid.height;
    const s1 = storyPhase(_fx.progress || 0, 0.3);
    drawStripCopies(ctx, st.mid, W, midTop, time, speed, 0.25, function (x) {
        // Крила млинів
        for (const m of st.mills) {
            const cx = x + m.x;
            if (cx < -B * 6 || cx > W + B * 6) {
                continue;
            }
            const a = time * 0.8;
            ctx.fillStyle = "#e8d8b0";
            for (let k = 0; k < 4; k++) {
                const ang = a + k * Math.PI / 2;
                ctx.save();
                ctx.translate(cx, midTop + m.y);
                ctx.rotate(ang);
                ctx.fillRect(0, -B * 0.25, B * 3.4, B * 0.5);
                ctx.restore();
            }
            ctx.fillStyle = "#6a4a2a";
            ctx.fillRect(Math.round(cx - B * 0.3), Math.round(midTop + m.y - B * 0.3), Math.round(B * 0.6), Math.round(B * 0.6));
        }
        // Увечері гарбузи засвічуються, як ліхтарі
        if (s1 > 0) {
            for (let i = 0; i < st.pumpkins.length; i += 2) {
                const pk = st.pumpkins[i];
                const px = x + pk.x;
                if (px < -B * 2 || px > W + B * 2) {
                    continue;
                }
                const fl = 0.7 + 0.3 * Math.sin(time * 9 + i);
                ctx.fillStyle = "rgba(255, 230, 90, " + (s1 * fl).toFixed(3) + ")";
                const fy = midTop + pk.y - pk.sz * 0.55;
                ctx.fillRect(Math.round(px - pk.sz * 0.3), Math.round(fy), Math.max(2, Math.round(pk.sz * 0.18)), Math.max(2, Math.round(pk.sz * 0.14)));
                ctx.fillRect(Math.round(px + pk.sz * 0.12), Math.round(fy), Math.max(2, Math.round(pk.sz * 0.18)), Math.max(2, Math.round(pk.sz * 0.14)));
                ctx.fillRect(Math.round(px - pk.sz * 0.25), Math.round(fy + pk.sz * 0.28), Math.round(pk.sz * 0.5), Math.max(2, Math.round(pk.sz * 0.1)));
            }
        }
    });
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

// ---------- Ліс кріперів ----------

function buildCreeperWoods(W, H, groundY, B) {
    const rng = pixelRng(3301);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0a2a2a"], [1, "#2a5a3a"]]);
    const stripW = extraStripW(W, B);
    // Далекі дерева-силуети
    const farH = Math.round(gY * 0.75);
    const far = makeCanvas(stripW, farH);
    const fx = far.getContext("2d");
    for (let x = 0; x < stripW - B * 3; x += B * (3 + Math.floor(rng() * 3))) {
        const h = farH * (0.5 + rng() * 0.45);
        fx.fillStyle = "#0e3326";
        fx.fillRect(x + B, farH - h, B, h);
        fx.fillStyle = "#123d2c";
        fx.fillRect(x, farH - h - B * 2, B * 3, B * 3);
    }
    // Середні дерева з кронами й кущі, з яких визирають кріпери
    const midH = Math.round(gY * 0.62);
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    const bushes = [];
    for (let x = B * 2; x < stripW - B * 6; x += B * (7 + Math.floor(rng() * 4))) {
        const trunkH = midH * (0.45 + rng() * 0.2);
        mx.fillStyle = "#5a3a1a";
        mx.fillRect(x + B * 1.5, midH - trunkH, B, trunkH);
        mx.fillStyle = "#6a4a2a";
        mx.fillRect(x + B * 1.5, midH - trunkH, B * 0.3, trunkH);
        for (let k = 0; k < 10; k++) {
            mx.fillStyle = k % 3 === 0 ? "#2a7a2a" : k % 3 === 1 ? "#1f6a24" : "#3a8a2a";
            mx.fillRect(x + Math.floor(rng() * 4) * B, midH - trunkH - B * (1 + Math.floor(rng() * 3)), B, B);
        }
        mx.fillStyle = "#1f6a24";
        mx.fillRect(x, midH - trunkH - B, B * 4, B * 1.5);
        // Кущ біля дерева
        const bx = x + B * 4;
        mx.fillStyle = "#2a7a2a";
        mx.fillRect(bx, midH - B * 1.6, B * 2.4, B * 1.6);
        mx.fillStyle = "#3a9a34";
        mx.fillRect(bx + B * 0.4, midH - B * 2, B * 1.6, B * 0.6);
        bushes.push({ x: bx + B * 1.2, y: midH - B * 1.6 });
    }
    // Ближній план: трава й гриби
    const near = makeCanvas(stripW, B * 2);
    const nx = near.getContext("2d");
    const mushrooms = [];
    for (let x = 0; x < stripW; x += B / 2) {
        nx.fillStyle = rng() < 0.5 ? "#2a6a22" : "#3a8a2a";
        nx.fillRect(x, B * 2 - B * (0.3 + rng() * 0.9), B / 2, B * 2);
    }
    for (let x = B * 4; x < stripW - B; x += B * (7 + Math.floor(rng() * 5))) {
        const red = rng() < 0.6;
        nx.fillStyle = "#e8e0c8";
        nx.fillRect(x, B * 1.3, B * 0.4, B * 0.7);
        nx.fillStyle = red ? "#d8202a" : "#a8703a";
        nx.fillRect(x - B * 0.4, B * 0.9, B * 1.2, B * 0.5);
        if (red) {
            nx.fillStyle = "#ffffff";
            nx.fillRect(x - B * 0.2, B * 1, B * 0.2, B * 0.2);
            nx.fillRect(x + B * 0.4, B * 1.05, B * 0.2, B * 0.2);
        }
        mushrooms.push({ x: x + B * 0.2, y: B * 1.1 });
    }
    return { W: W, H: H, sky: sky, far: far, mid: mid, near: near, bushes: bushes, mushrooms: mushrooms };
}

// Голова кріпера, що визирає з куща (k — наскільки висунулась, 0…1)
function drawCreeperPeek(ctx, x, y, B, k) {
    if (k <= 0) {
        return;
    }
    const s = B * 1.4;
    const top = y - s * k;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - s, y - s * 1.2, s * 2, s * 1.2);
    ctx.clip();
    ctx.fillStyle = "#4caf3a";
    ctx.fillRect(Math.round(x - s / 2), Math.round(top), Math.round(s), Math.round(s));
    ctx.fillStyle = "#3a9a2e";
    ctx.fillRect(Math.round(x - s / 2), Math.round(top), Math.round(s * 0.3), Math.round(s * 0.3));
    ctx.fillStyle = "#101a10";
    const q = s / 8;
    ctx.fillRect(Math.round(x - q * 3), Math.round(top + q * 2), Math.round(q * 2), Math.round(q * 2));
    ctx.fillRect(Math.round(x + q), Math.round(top + q * 2), Math.round(q * 2), Math.round(q * 2));
    ctx.fillRect(Math.round(x - q), Math.round(top + q * 4), Math.round(q * 2), Math.round(q * 3));
    ctx.restore();
}

BackgroundRenderer.renderCreeperWoods = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._creeperWoods;
    if (!st || st.W !== W || st.H !== H) {
        st = buildCreeperWoods(W, H, groundY, B);
        this._creeperWoods = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Косі промені світла крізь крони
    ctx.fillStyle = "rgba(200, 255, 180, 0.06)";
    for (let i = 0; i < 4; i++) {
        const x = ((i * 0.3 + 0.1) * W - time * speed * 0.02) % (W * 1.2);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + B * 3, 0);
        ctx.lineTo(x + B * 9, gY);
        ctx.lineTo(x + B * 5, gY);
        ctx.closePath();
        ctx.fill();
    }
    drawScrollingStrip(ctx, st.far, W, gY - B, time, speed, 0.08);
    const s1 = storyPhase(_fx.progress || 0, 0.3);
    const midTop = gY - B * 0.4 - st.mid.height;
    drawStripCopies(ctx, st.mid, W, midTop, time, speed, 0.25, function (x) {
        for (let i = 0; i < st.bushes.length; i++) {
            const b = st.bushes[i];
            const bx = x + b.x;
            if (bx < -B * 3 || bx > W + B * 3) {
                continue;
            }
            // Кріпери визирають по черзі; далі по рівню — частіше
            const period = 6 - s1 * 2.5;
            const ph = ((time + i * 2.3) % period) / period;
            const k = ph < 0.3 ? Math.sin(ph / 0.3 * Math.PI) : 0;
            drawCreeperPeek(ctx, bx, midTop + b.y + B * 0.4, B, k);
        }
    });
    const s2 = storyPhase(_fx.progress || 0, 0.63);
    if (s2 > 0) {
        ctx.fillStyle = "rgba(5, 15, 25, " + (0.35 * s2).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
    }
    drawStripCopies(ctx, st.near, W, gY - st.near.height, time, speed, 0.45, function (x) {
        if (s2 <= 0) {
            return;
        }
        // Уночі гриби світяться
        for (const m of st.mushrooms) {
            const mx = x + m.x;
            if (mx < -B * 2 || mx > W + B * 2) {
                continue;
            }
            ctx.fillStyle = "rgba(255, 120, 160, " + (0.25 * s2 * (0.7 + 0.3 * Math.sin(time * 3 + mx))).toFixed(3) + ")";
            ctx.fillRect(Math.round(mx - B), Math.round(gY - st.near.height + m.y - B * 0.6), B * 2, B * 1.2);
        }
    });
};

// ---------- Червоні шахти ----------

function buildRedstoneMines(W, H, groundY, B) {
    const rng = pixelRng(3401);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#141218"], [1, "#2a2024"]]);
    const stripW = extraStripW(W, B);
    // Задня кам'яна стіна з рудою
    const wallH = gY;
    const wall = makeCanvas(stripW, wallH);
    const wx = wall.getContext("2d");
    const ores = [];
    for (let y = 0; y < wallH; y += B) {
        for (let x = 0; x < stripW; x += B) {
            const v = rng();
            wx.fillStyle = v < 0.3 ? "#3a3640" : v < 0.6 ? "#34303a" : "#403c48";
            wx.fillRect(x, y, B, B);
            if (v > 0.985) {
                ores.push({ x: x, y: y });
            } else if (v > 0.97) {
                wx.fillStyle = "#6a6a74";
                wx.fillRect(x + B / 4, y + B / 4, B / 4, B / 4);
            }
        }
    }
    for (const o of ores) {
        wx.fillStyle = "#7a1a1a";
        wx.fillRect(o.x, o.y, B, B);
    }
    // Кріплення з балок і ліхтарі
    const midH = Math.round(gY * 0.7);
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    const lamps = [];
    for (let x = B * 3; x < stripW - B * 6; x += B * 12) {
        mx.fillStyle = "#6a4a2a";
        mx.fillRect(x, 0, B * 0.8, midH);
        mx.fillRect(x + B * 5, 0, B * 0.8, midH);
        mx.fillRect(x, 0, B * 5.8, B * 0.8);
        mx.fillStyle = "#8a6a3a";
        mx.fillRect(x, 0, B * 0.25, midH);
        mx.fillRect(x + B * 5, 0, B * 0.25, midH);
        lamps.push({ x: x + B * 2.9, y: B * 1.6 });
        mx.fillStyle = "#3a3a44";
        mx.fillRect(x + B * 2.8, B * 0.8, B * 0.2, B * 0.8);
    }
    // Рейки біля землі
    const near = makeCanvas(stripW, B * 1.2);
    const nx = near.getContext("2d");
    for (let x = 0; x < stripW; x += B) {
        nx.fillStyle = "#5a3a1a";
        nx.fillRect(x, B * 0.5, B * 0.6, B * 0.7);
    }
    nx.fillStyle = "#9aa0aa";
    nx.fillRect(0, B * 0.3, stripW, B * 0.25);
    return { W: W, H: H, sky: sky, wall: wall, ores: ores, mid: mid, lamps: lamps, near: near };
}

BackgroundRenderer.renderRedstoneMines = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._redstoneMines;
    if (!st || st.W !== W || st.H !== H) {
        st = buildRedstoneMines(W, H, groundY, B);
        this._redstoneMines = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const s2 = storyPhase(_fx.progress || 0, 0.63);
    drawStripCopies(ctx, st.wall, W, gY - st.wall.height, time, speed, 0.1, function (x) {
        // Руда пульсує; до кінця рівня — яскравіше
        const pulse = 0.5 + 0.5 * Math.sin(time * 2.2);
        ctx.fillStyle = "rgba(255, 50, 40, " + (0.35 + 0.35 * pulse + 0.3 * s2).toFixed(3) + ")";
        for (const o of st.ores) {
            const ox = x + o.x;
            if (ox < -B || ox > W) {
                continue;
            }
            ctx.fillRect(ox + B / 4, gY - st.wall.height + o.y + B / 4, B / 2, B / 2);
        }
    });
    const midTop = gY - B * 1.2 - st.mid.height;
    drawStripCopies(ctx, st.mid, W, midTop, time, speed, 0.3, function (x) {
        for (let i = 0; i < st.lamps.length; i++) {
            const l = st.lamps[i];
            const lx = x + l.x;
            if (lx < -B * 4 || lx > W + B * 4) {
                continue;
            }
            const on = 0.6 + 0.4 * s2;
            const fl = 0.85 + 0.15 * Math.sin(time * 11 + i * 3);
            ctx.fillStyle = "rgba(255, 180, 90, " + (0.18 * on * fl).toFixed(3) + ")";
            ctx.fillRect(Math.round(lx - B * 2), Math.round(midTop + l.y - B), B * 4, B * 3);
            ctx.fillStyle = s2 > 0.5 ? "#ff5a3a" : "#ffcf6a";
            ctx.fillRect(Math.round(lx - B * 0.3), Math.round(midTop + l.y), Math.round(B * 0.6), Math.round(B * 0.6));
        }
    });
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.45);
};

// ---------- Космічний вантажник ----------

function buildAlienFreighter(W, H, groundY, B) {
    const rng = pixelRng(3501);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0c1014"], [1, "#1a2228"]]);
    const stripW = extraStripW(W, B);
    // Задня стіна: ребристі панелі, труби, жовто-чорні смуги
    const wallH = gY;
    const wall = makeCanvas(stripW, wallH);
    const wx = wall.getContext("2d");
    wx.fillStyle = "#1e262c";
    wx.fillRect(0, 0, stripW, wallH);
    for (let x = 0; x < stripW; x += B * 2) {
        wx.fillStyle = "#26303a";
        wx.fillRect(x, 0, B * 1.4, wallH);
        wx.fillStyle = "#2e3a44";
        wx.fillRect(x, 0, B * 0.2, wallH);
    }
    wx.fillStyle = "#3a4650";
    wx.fillRect(0, B * 2, stripW, B * 0.8);
    wx.fillRect(0, B * 3.4, stripW, B * 0.5);
    wx.fillStyle = "#4a5660";
    wx.fillRect(0, B * 2, stripW, B * 0.2);
    for (let x = 0; x < stripW; x += B) {
        wx.fillStyle = (x / B) % 2 === 0 ? "#e8b020" : "#1a1a1a";
        wx.fillRect(x, wallH - B * 3, B, B * 0.5);
    }
    const blinkers = [];
    for (let x = B * 3; x < stripW; x += B * (5 + Math.floor(rng() * 4))) {
        blinkers.push({ x: x, y: B * (5 + Math.floor(rng() * 6)), ph: rng() * 6 });
    }
    // Шлюзові арки з екранами детектора руху
    const midH = Math.round(gY * 0.9);
    const mid = makeCanvas(stripW, midH);
    const mx = mid.getContext("2d");
    const screens = [];
    for (let x = B * 4; x < stripW - B * 8; x += B * 20) {
        mx.fillStyle = "#3a444c";
        mx.fillRect(x, 0, B * 1.6, midH);
        mx.fillRect(x + B * 8, 0, B * 1.6, midH);
        mx.fillRect(x, 0, B * 9.6, B * 1.4);
        mx.fillStyle = "#4a5660";
        mx.fillRect(x, 0, B * 0.3, midH);
        mx.fillRect(x + B * 8, 0, B * 0.3, midH);
        // Скошені кути арки
        mx.fillStyle = "#3a444c";
        for (let k = 0; k < 3; k++) {
            mx.fillRect(x + B * 1.6 + k * B, B * 1.4 + k * B, B, B);
            mx.fillRect(x + B * 7 - k * B, B * 1.4 + k * B, B, B);
        }
        // Екран на стійці
        mx.fillStyle = "#0a1410";
        mx.fillRect(x + B * 10.5, midH * 0.4, B * 3, B * 2.4);
        mx.fillStyle = "#2a3a34";
        mx.fillRect(x + B * 11.8, midH * 0.4 + B * 2.4, B * 0.4, midH * 0.6 - B * 2.4);
        screens.push({ x: x + B * 12, y: midH * 0.4 + B * 1.2 });
    }
    // Підлога-решітка з вентиляцією
    const near = makeCanvas(stripW, B);
    const nx = near.getContext("2d");
    nx.fillStyle = "#2a343c";
    nx.fillRect(0, 0, stripW, B);
    const vents = [];
    for (let x = 0; x < stripW; x += B * 0.5) {
        nx.fillStyle = "#1a2228";
        nx.fillRect(x, B * 0.2, B * 0.2, B * 0.6);
    }
    for (let x = B * 6; x < stripW; x += B * 14) {
        vents.push({ x: x });
    }
    return { W: W, H: H, sky: sky, wall: wall, blinkers: blinkers, mid: mid, screens: screens, near: near, vents: vents };
}

BackgroundRenderer.renderAlienFreighter = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._alienFreighter;
    if (!st || st.W !== W || st.H !== H) {
        st = buildAlienFreighter(W, H, groundY, B);
        this._alienFreighter = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawStripCopies(ctx, st.wall, W, 0, time, speed, 0.12, function (x) {
        for (const b of st.blinkers) {
            const bx = x + b.x;
            if (bx < -B || bx > W) {
                continue;
            }
            ctx.fillStyle = Math.sin(time * 3 + b.ph) > 0.4 ? "#ff3a3a" : "#3a1a1a";
            ctx.fillRect(Math.round(bx), Math.round(b.y), Math.round(B * 0.3), Math.round(B * 0.3));
        }
    });
    const midTop = gY - B - st.mid.height;
    drawStripCopies(ctx, st.mid, W, midTop, time, speed, 0.3, function (x) {
        // Детектор руху: промінь-розгортка й «біпи»
        for (let i = 0; i < st.screens.length; i++) {
            const sc = st.screens[i];
            const cx = x + sc.x;
            if (cx < -B * 3 || cx > W + B * 3) {
                continue;
            }
            const cy = midTop + sc.y + B;
            const a = (time * 2 + i) % (Math.PI * 2);
            ctx.strokeStyle = "rgba(90, 255, 120, 0.8)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(-Math.PI / 2 + Math.sin(a) * 1.2) * B * 1.1, cy - Math.abs(Math.cos(a)) * B * 1.0 - B * 0.1);
            ctx.stroke();
            const beep = (time * 0.7 + i * 0.4) % 1;
            ctx.fillStyle = "rgba(90, 255, 120, " + (1 - beep).toFixed(2) + ")";
            ctx.fillRect(Math.round(cx - B * 0.6 + beep * B * 0.3), Math.round(cy - B * 0.9 + beep * B * 0.4), 3, 3);
        }
    });
    drawStripCopies(ctx, st.near, W, gY - st.near.height, time, speed, 0.45, function (x) {
        // Пара з вентиляції
        for (let i = 0; i < st.vents.length; i++) {
            const vx = x + st.vents[i].x;
            if (vx < -B * 3 || vx > W + B * 3) {
                continue;
            }
            for (let k = 0; k < 4; k++) {
                const t = ((time * 0.5 + k * 0.25 + i * 0.13) % 1);
                ctx.fillStyle = "rgba(200, 210, 220, " + (0.25 * (1 - t)).toFixed(3) + ")";
                const sz = B * (0.6 + t * 1.6);
                ctx.fillRect(Math.round(vx - sz / 2 + Math.sin(t * 5 + k) * B * 0.4), Math.round(gY - B - t * B * 5 - sz / 2), Math.round(sz), Math.round(sz));
            }
        }
    });
};

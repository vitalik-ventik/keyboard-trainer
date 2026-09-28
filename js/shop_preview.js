// ============================================================
// shop_preview.js — живі сценки товарів магазину (150×100)
// Спільні для магазину в грі (main.js) і сторінки перегляду (preview.html).
// ============================================================

import { SKIN_RENDERERS, drawAchievementFrame } from "./engine.js";
import { drawTrail, drawExplosion, drawAccessory, drawCoinIcon, drawHeartLife, drawChest, drawPet, drawPetAura, getShopItem, itemRarity, MAX_PET_SLOTS, PET_MUTATIONS } from "./shop.js";
import { drawHeldWeapon, drawWeaponDemo } from "./weapons.js";

// Сценка скіна: темне тло, земля й кубик (з аксесуаром, якщо його передано)
export function drawShopSkinScene(pctx, item, time, accessory) {
    const w = 150;
    const h = 100;
    pctx.fillStyle = "#070b1c";
    pctx.fillRect(0, 0, w, h);
    const groundY = h * 0.84;
    pctx.fillStyle = "#12203a";
    pctx.fillRect(0, groundY, w, h - groundY);
    pctx.fillStyle = "#00f6ff";
    pctx.fillRect(0, groundY, w, 2);
    const size = 44;
    const hop = time > 0 ? Math.abs(Math.sin(time * 0.003)) * 6 : 0;
    pctx.save();
    pctx.translate(w / 2, groundY - size / 2 - hop);
    SKIN_RENDERERS[item.renderType](pctx, size, time, {});
    if (accessory) {
        drawAccessory(pctx, accessory, size, time);
    }
    pctx.restore();
}

// Прев'ю зброї: шип під'їжджає, кубик із поточним скіном атакує
// Чорний квадрат зі знаками питання (центр cx, cy, сторона size)
function drawMysteryBox(pctx, cx, cy, size) {
    pctx.fillStyle = "#000000";
    pctx.fillRect(cx - size / 2, cy - size / 2, size, size);
    pctx.strokeStyle = "#2a2f44";
    pctx.lineWidth = 2;
    pctx.strokeRect(cx - size / 2, cy - size / 2, size, size);
    pctx.fillStyle = "#6a7088";
    pctx.font = "bold " + Math.round(size * 0.42) + "px 'Segoe UI', Arial";
    pctx.textAlign = "center";
    pctx.textBaseline = "middle";
    pctx.fillText("???", cx, cy + 1);
}

function drawWeaponScene(pctx, item, now, opts) {
    const w = 150;
    const h = 100;
    pctx.fillStyle = "#070b1c";
    pctx.fillRect(0, 0, w, h);
    const groundY = h * 0.82;
    pctx.fillStyle = "#12203a";
    pctx.fillRect(0, groundY, w, h - groundY);
    pctx.fillStyle = "#00f6ff";
    pctx.fillRect(0, groundY, w, 2);
    if (opts.silhouette) {
        // Сундукова зброя, ще не знайдена: лише чорний квадрат зі знаками питання
        drawMysteryBox(pctx, w / 2, groundY - 36, 50);
        return;
    }
    const skinFn = SKIN_RENDERERS[opts.skinType] || SKIN_RENDERERS.neon_base;
    pctx.save();
    pctx.beginPath();
    pctx.rect(0, 0, w, h);
    pctx.clip();
    if (item.id === "weapon_none") {
        // Без зброї: кубик просто перестрибує шип
        const cycle = 1800;
        const ph = (now % cycle) / cycle;
        const spikeX = w + 10 - ph * (w + 20);
        pctx.fillStyle = "#4a1030";
        pctx.strokeStyle = "#ff2ea6";
        pctx.lineWidth = 2;
        pctx.beginPath();
        pctx.moveTo(spikeX - 13, groundY);
        pctx.lineTo(spikeX, groundY - 28);
        pctx.lineTo(spikeX + 13, groundY);
        pctx.closePath();
        pctx.fill();
        pctx.stroke();
        const d = spikeX - 30;
        const hop = Math.abs(d) < 45 ? Math.cos(d / 45 * Math.PI / 2) * 42 : 0;
        pctx.translate(30, groundY - 15 - hop);
        pctx.rotate(hop > 0 ? (1 - d / 45) * Math.PI / 2 : 0);
        skinFn(pctx, 30, now, {});
    } else {
        drawWeaponDemo(pctx, item.id, w, h, now, function (c, size) {
            skinFn(c, size, now, {});
        });
    }
    pctx.restore();
}

// Сценка улюбленця: кубик із поточним скіном стрибає, улюбленець біжить позаду
// й підстрибує слідом від радості. time = 0 — нерухомий кадр (для сірого знімка)
function drawPetScene(pctx, item, now, opts) {
    const w = 150;
    const h = 100;
    pctx.fillStyle = "#070b1c";
    pctx.fillRect(0, 0, w, h);
    const groundY = h * 0.84;
    pctx.fillStyle = "#12203a";
    pctx.fillRect(0, groundY, w, h - groundY);
    pctx.fillStyle = "#00f6ff";
    pctx.fillRect(0, groundY, w, 2);
    const cycle = 2600;
    const ph = now > 0 ? now % cycle : 0;
    const cubeSize = 36;
    const cubeHop = ph < 500 ? Math.sin(ph / 500 * Math.PI) * 26 : 0;
    const skinFn = SKIN_RENDERERS[opts.skinType] || SKIN_RENDERERS.neon_base;
    pctx.save();
    pctx.translate(114, groundY - cubeSize / 2 - cubeHop);
    pctx.rotate(ph < 500 ? ph / 500 * Math.PI / 2 : 0);
    skinFn(pctx, cubeSize, now, {});
    pctx.restore();
    // Улюбленець трохи менший за кубик — як на трасі, але великий, щоб роздивитися
    const size = 34;
    const happyT = ph >= 350 && ph < 1150 ? (ph - 350) / 800 : 0;
    const base = item.move === "swim" ? size * 0.3 : item.move === "fly" ? size * 0.55 : 0;
    const lift = base + (happyT > 0 ? Math.sin(happyT * Math.PI) * 10 : 0);
    const x = 58;
    drawPetAura(pctx, item.id, x, groundY - 1, size, now);
    pctx.save();
    pctx.translate(x, groundY - size / 2 - lift);
    drawPet(pctx, item.id, size, now, {
        mood: happyT > 0 ? "happy" : null,
        moving: now > 0,
        happyT: happyT,
        mutation: opts.mutation || null,
        water: false,
        silhouette: !!opts.silhouette,
        weapon: opts.weapon || null
    });
    pctx.restore();
    // Значок мутації в кутку
    const mutation = opts.mutation ? PET_MUTATIONS[opts.mutation] : null;
    if (mutation) {
        pctx.font = "bold 11px 'Segoe UI', Arial";
        pctx.textAlign = "left";
        pctx.textBaseline = "top";
        pctx.lineWidth = 3;
        pctx.strokeStyle = "#070b1c";
        pctx.strokeText(mutation.icon + " " + mutation.name, 5, 5);
        pctx.fillStyle = "#ffe14d";
        pctx.fillText(mutation.icon + " " + mutation.name, 5, 5);
    }
}

// Жива сценка товару 150×100 (полотно вже масштабоване під dpr).
// opts: { skinType — скін кубика, accessory — одягнутий аксесуар, mutation — мутація улюбленця,
//         silhouette — показати улюбленця чорним силуетом (секретний, ще не знайдений),
//                      а сундукову зброю — чорним квадратом зі знаками питання,
//         weapon — зброя кубика (улюбленець у спорядженні під неї) }
export function drawShopItemScene(pctx, item, now, opts) {
    if (item.type === "pet") {
        drawPetScene(pctx, item, now, opts);
        return;
    }
    if (item.type === "skin") {
        drawShopSkinScene(pctx, item, now, opts.accessory);
        return;
    }
    if (item.type === "weapon") {
        drawWeaponScene(pctx, item, now, opts);
        return;
    }
    const w = 150;
    const h = 100;
    pctx.fillStyle = "#070b1c";
    pctx.fillRect(0, 0, w, h);
    const groundY = h * 0.82;
    pctx.fillStyle = "#12203a";
    pctx.fillRect(0, groundY, w, h - groundY);
    pctx.fillStyle = "#00f6ff";
    pctx.fillRect(0, groundY, w, 2);

    // Аксесуари показуємо на більшому кубику, щоб було видно деталі
    const size = item.type === "accessory" ? 46 : item.type === "explosion" ? 34 : 30;
    const skinFn = SKIN_RENDERERS[opts.skinType] || SKIN_RENDERERS.neon_base;
    const accessory = item.type === "accessory" ? item.id : opts.accessory;
    let cx = w * 0.5;
    let cy = groundY - size / 2;
    let rot = 0;
    let showCube = true;

    if (item.type === "trail") {
        cx = w * 0.7;
        const hop = function (t) {
            return Math.abs(Math.sin(t * 0.003)) * h * 0.35;
        };
        const points = [];
        for (let k = 0; k < 18; k++) {
            const tk = now - k * 16;
            points.push({
                sx: cx - k * 5,
                sy: groundY - size / 2 - hop(tk),
                alpha: 0.55 * (1 - k / 18),
                i: Math.floor(tk / 16)
            });
        }
        drawTrail(pctx, item.id, points, size, now);
        cy = groundY - size / 2 - hop(now);
        rot = (now * 0.006) % (Math.PI * 2);
    } else if (item.type === "explosion") {
        const cycle = 2400;
        const ph = now % cycle;
        if (ph >= 700) {
            showCube = false;
            const t = (ph - 700) / 1000;
            if (item.id === "boom_default") {
                // Звичайний вибух: квадратні уламки
                for (let i = 0; i < 10; i++) {
                    const a = i * Math.PI * 2 / 10;
                    const d = t * size * 2.4;
                    pctx.globalAlpha = Math.max(0, 1 - t / 1.2);
                    pctx.fillStyle = i % 2 === 0 ? "#00f6ff" : "#ff2ea6";
                    pctx.fillRect(cx + Math.cos(a) * d - 3, cy + Math.sin(a) * d + t * t * 30 - 3, 6, 6);
                }
                pctx.globalAlpha = 1;
            } else {
                drawExplosion(pctx, item.id, t, cx, cy, size);
            }
        }
    } else {
        cy = groundY - size / 2 - Math.abs(Math.sin(now * 0.004)) * 6;
        cx = w * 0.5;
        cy += 4;
    }
    if (showCube) {
        pctx.save();
        pctx.translate(cx, cy);
        pctx.rotate(rot);
        skinFn(pctx, size, now, {});
        drawAccessory(pctx, accessory, size, now);
        pctx.restore();
    }
}

// ---------- Гравець у рейтингу ----------

// Предмет із каталогу потрібного типу або null (id з бази могли прийти з новішої версії гри)
function avatarItem(id, type) {
    const item = typeof id === "string" ? getShopItem(id) : null;
    return item && item.type === type ? id : null;
}

/**
 * Гравець, як він виглядає у своїй грі: кубик зі скіном, рамкою, аксесуаром і зброєю
 * стоїть на землі, за ним — шлейф і зграя улюбленців. Без стрибків і ударів:
 * рухаються лише власні анімації скіна, шлейфу, улюбленців і предметів.
 * Тло прозоре. avatar — { skin, frame, accessory, weapon, trail, pets, mutations } із рейтингу.
 * @param {CanvasRenderingContext2D} ctx — уже масштабований під dpr
 * @param {Object} avatar
 * @param {number} w
 * @param {number} h
 * @param {number} now — мілісекунди (0 — нерухомий кадр)
 */
export function drawPlayerScene(ctx, avatar, w, h, now) {
    const a = avatar || {};
    const skinFn = typeof a.skin === "string" && SKIN_RENDERERS[a.skin] ? SKIN_RENDERERS[a.skin] : SKIN_RENDERERS.neon_base;
    const frame = a.frame === "easy" || a.frame === "hard" ? a.frame : null;
    const accessory = avatarItem(a.accessory, "accessory");
    const weapon = avatarItem(a.weapon, "weapon");
    const trail = avatarItem(a.trail, "trail") || "trail_default";
    const mutations = a.mutations && typeof a.mutations === "object" ? a.mutations : {};
    const pets = (Array.isArray(a.pets) ? a.pets : []).filter(function (id) {
        return !!avatarItem(id, "pet");
    }).slice(0, MAX_PET_SLOTS);

    const groundY = h - 5;
    const cube = Math.round(h * 0.55);
    const petSize = Math.round(cube * 0.7);
    const petFirst = cube * 1.35;
    const petGap = petSize * 1.3;
    // Зграя з кубиком вирівняна по лівому краю: найдальший улюбленець біля краю,
    // тож що більша зграя, то далі праворуч стоїть кубик — видно, у кого більше улюбленців
    const cubeX = pets.length > 0 ? 2 + petSize / 2 + petFirst + (pets.length - 1) * petGap : 2 + cube / 2;

    // Земля — тонка неонова лінія
    ctx.fillStyle = "rgba(0, 246, 255, 0.35)";
    ctx.fillRect(0, groundY, w, 1.5);

    // Шлейф: попередні положення кубика, що «від'їжджають» ліворуч
    const points = [];
    for (let k = 0; k < 14; k++) {
        const tk = now - k * 16;
        points.push({
            sx: cubeX - k * 4,
            sy: groundY - cube / 2,
            alpha: 0.55 * (1 - k / 14),
            i: Math.floor(tk / 16)
        });
    }
    drawTrail(ctx, trail, points, cube, now);

    // Улюбленці позаду кубика: плавучі трохи над землею, летючі — вище й ледь гойдаються
    for (let i = pets.length - 1; i >= 0; i--) {
        const id = pets[i];
        const item = getShopItem(id);
        const offset = petFirst + i * petGap;
        const lift = item.move === "swim" ? petSize * 0.35 : item.move === "fly" ? petSize * 0.9 + Math.sin(now * 0.004 + i) * petSize * 0.12 : 0;
        const x = cubeX - offset;
        const mutation = typeof mutations[id] === "string" && PET_MUTATIONS[mutations[id]] ? mutations[id] : null;
        drawPetAura(ctx, id, x, groundY - 1, petSize, now);
        ctx.save();
        ctx.translate(x, groundY - petSize / 2 - lift);
        drawPet(ctx, id, petSize, now, { moving: now > 0, mutation: mutation, water: false, weapon: weapon });
        ctx.restore();
    }

    ctx.save();
    ctx.translate(cubeX, groundY - cube / 2);
    skinFn(ctx, cube, now, {});
    drawAchievementFrame(ctx, cube, frame, now);
    drawAccessory(ctx, accessory, cube, now);
    if (weapon) {
        drawHeldWeapon(ctx, weapon, cube, null, now);
    }
    ctx.restore();
}

// ---------- Сундук ----------

// Тривалість трусіння й відкривання кришки (мс)
export const CHEST_SHAKE_MS = 900;
export const CHEST_OPEN_MS = 450;

// Сценка сундука W×H. openT — мс від натискання «Відкрити» (null — ще закритий):
// 0…CHEST_SHAKE_MS трусіння, далі відкривання, потім нагорода вилітає й зависає.
// result — { kind: "crystals", amount }, { kind: "heart", amount }, { kind: "item", id, mutation? }
// або { kind: "mutation", id, mutation } (мутував улюбленець, який уже є).
// opts: { skinType, accessory } — для живої сценки предмета.
export function drawChestScene(c, W, H, type, openT, result, now, opts) {
    c.clearRect(0, 0, W, H);
    const cx = W / 2;
    const bottom = H - 24;
    const size = 130;
    let shake = 0;
    let open = 0;
    let glow = 0;
    let bob = Math.sin(now * 0.004) * 3;
    let revealT = -1;
    if (openT !== null && openT !== undefined) {
        bob = 0;
        if (openT < CHEST_SHAKE_MS) {
            const k = openT / CHEST_SHAKE_MS;
            shake = Math.sin(now * 0.08) * (2 + k * 9);
            glow = k * 0.4;
        } else if (openT < CHEST_SHAKE_MS + CHEST_OPEN_MS) {
            const k = (openT - CHEST_SHAKE_MS) / CHEST_OPEN_MS;
            open = k;
            glow = 0.4 + k * 0.6;
        } else {
            open = 1;
            glow = 0.8 + 0.2 * Math.sin(now * 0.004);
            revealT = openT - CHEST_SHAKE_MS - CHEST_OPEN_MS;
        }
    }
    drawChest(c, type, cx, bottom + bob, size, shake, open, glow);

    // Нагорода вилітає з сундука й зависає над ним
    if (revealT >= 0 && result) {
        const k = Math.min(1, revealT / 500);
        const ease = 1 - Math.pow(1 - k, 3);
        c.save();
        c.globalAlpha = Math.min(1, k * 1.5);
        if (result.kind === "crystals") {
            const y = bottom - 90 - ease * 70;
            drawCoinIcon(c, cx - 30, y, 46 + ease * 10);
            c.font = "900 30px 'Segoe UI', Arial";
            c.textAlign = "left";
            c.textBaseline = "middle";
            c.lineWidth = 5;
            c.strokeStyle = "#070b1c";
            c.strokeText("+" + result.amount, cx - 2, y);
            c.fillStyle = "#ffd84a";
            c.fillText("+" + result.amount, cx - 2, y);
        } else if (result.kind === "heart") {
            const y = bottom - 90 - ease * 70;
            drawHeartLife(c, cx - 30, y, 44 + ease * 10, now);
            c.font = "900 30px 'Segoe UI', Arial";
            c.textAlign = "left";
            c.textBaseline = "middle";
            c.lineWidth = 5;
            c.strokeStyle = "#070b1c";
            c.strokeText("+" + result.amount, cx - 2, y);
            c.fillStyle = "#ff4a6a";
            c.fillText("+" + result.amount, cx - 2, y);
        } else {
            // Жива сценка предмета в рамці кольору рідкості
            const item = getShopItem(result.id);
            const rarity = itemRarity(item);
            const scale = 0.4 + ease * 0.75;
            const w = 150 * scale;
            const h = 100 * scale;
            c.translate(cx - w / 2, bottom - 95 - ease * 60 - h / 2);
            c.scale(scale, scale);
            c.save();
            c.beginPath();
            c.rect(0, 0, 150, 100);
            c.clip();
            drawShopItemScene(c, item, now, Object.assign({}, opts || {}, { mutation: result.mutation || null }));
            c.restore();
            c.strokeStyle = rarity.color;
            c.lineWidth = 3 / scale;
            c.strokeRect(0, 0, 150, 100);
        }
        c.restore();
    }
}

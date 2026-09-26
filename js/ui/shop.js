// ============================================================
// ui/shop.js — вікно вибору скіна та магазин: вкладки, картки товарів,
// прев'ю, підказки бонусів, купівля й екіпірування
// ============================================================

import { playSound } from "../assets.js";
import { ALL_LEVELS, DEFAULT_SKIN, LEVELS_CONFIG, SKIN_RENDERERS, drawAchievementFrame, levelSkinPerk, save } from "../engine.js";
import { SHOP_ITEMS, SHOP_TYPES, drawAccessory, itemPerkHint, itemPerkText, levelSkinPerkHint, shopTabHints, skinPerkText, weaponCoinBonus } from "../shop.js";
import { drawShopItemScene, drawShopSkinScene } from "../shop_preview.js";
import { announceAchievements } from "./achievements.js";
import { refreshCrystalDisplays, requirementLabel } from "./coins.js";
import { refreshChestButtons } from "./chests.js";

const skinTriggerEl = document.getElementById("skin-selector-trigger");
const activeSkinCanvas = document.getElementById("active-skin-canvas");
const skinsModalEl = document.getElementById("skins-modal");
const skinsGridEl = document.getElementById("skinsGrid");
const btnCloseSkins = document.getElementById("btnCloseSkins");
const shopTriggerEl = document.getElementById("shop-trigger");
const shopModalEl = document.getElementById("shop-modal");
const shopGridEl = document.getElementById("shopGrid");
const shopTabsEl = document.getElementById("shopTabs");
const btnCloseShop = document.getElementById("btnCloseShop");
// ---------- Селектор скінів ----------

var activeSkinCache = null;

function renderCurrentSkinIcon() {
    var canvas = activeSkinCanvas;
    if (!canvas) return;
    var skinCtx = canvas.getContext("2d");
    // Логічний розмір запам'ятовуємо один раз: canvas.width далі множиться на dpr,
    // і повторне читання з нього збільшувало б значок при кожному поверненні в меню
    if (!canvas.dataset.logicalSize) {
        canvas.dataset.logicalSize = String(canvas.width);
    }
    var size = Number(canvas.dataset.logicalSize);
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    skinCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    skinCtx.clearRect(0, 0, size, size);

    var activeSkinId = save.getActiveSkin();
    var renderType = null;
    var achievement = null;
    if (activeSkinId && SKIN_RENDERERS[activeSkinId]) {
        renderType = activeSkinId;
        var skinLevel = ALL_LEVELS.find(function (l) { return l.skin && l.skin.renderType === activeSkinId; });
        if (skinLevel) {
            achievement = save.getLevelAchievement(skinLevel.id);
        }
    }

    if (!renderType) {
        skinCtx.fillStyle = "rgba(0, 246, 255, 0.3)";
        skinCtx.fillRect(6, 6, size - 12, size - 12);
        skinCtx.strokeStyle = "rgba(0, 246, 255, 0.6)";
        skinCtx.lineWidth = 2;
        skinCtx.strokeRect(6, 6, size - 12, size - 12);
        skinCtx.fillStyle = "#eaf6ff";
        skinCtx.font = (size * 0.22) + "px 'Segoe UI', Arial";
        skinCtx.textAlign = "center";
        skinCtx.textBaseline = "middle";
        skinCtx.fillText("?", size / 2, size / 2);
        return;
    }

    // З аксесуаром кубик трохи менший і нижче, щоб капелюх чи корона вмістилися
    var accessory = save.getEquipped("accessory");
    var withAccessory = accessory && accessory !== "acc_none";
    var miniSize = size * (withAccessory ? 0.62 : 0.8);
    skinCtx.save();
    skinCtx.translate(size / 2, size / 2 + (withAccessory ? size * 0.1 : 0));
    var nowMs = performance.now();
    SKIN_RENDERERS[renderType](skinCtx, miniSize, nowMs);
    drawAchievementFrame(skinCtx, miniSize, achievement, nowMs);
    drawAccessory(skinCtx, accessory, miniSize, nowMs);
    skinCtx.restore();
    activeSkinCache = activeSkinId;
}

// Перетворює вміст полотна на відтінки сірого (для ще не куплених скінів).
// Працює через getImageData, тож не залежить від підтримки ctx.filter.
function grayscaleCanvas(canvasEl) {
    try {
        const gctx = canvasEl.getContext("2d");
        const img = gctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
            const y = Math.round(d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11);
            d[i] = y;
            d[i + 1] = y;
            d[i + 2] = y;
        }
        gctx.putImageData(img, 0, 0);
    } catch (err) {
        console.warn("Не вдалося знебарвити прев'ю скіна:", err);
    }
}

// Нерухомий сірий кадр скіна (time = 0) на картці вибору скіна
function drawStaticGraySkin(cardCanvas, renderType, psize) {
    const pctx = cardCanvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    cardCanvas.width = Math.round(psize * dpr);
    cardCanvas.height = Math.round(psize * dpr);
    cardCanvas.style.width = psize + "px";
    cardCanvas.style.height = psize + "px";
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pctx.save();
    pctx.translate(psize / 2, psize / 2);
    SKIN_RENDERERS[renderType](pctx, psize * 0.75, 0, {});
    pctx.restore();
    grayscaleCanvas(cardCanvas);
}

function addSkinSectionTitle(grid, text) {
    const title = document.createElement("div");
    title.className = "skins-section-title";
    title.textContent = text;
    grid.appendChild(title);
}

function buildSkinGrid() {
    var grid = skinsGridEl;
    if (!grid) return;
    grid.innerHTML = "";

    var progress = save.getProgress();
    var activeSkinId = save.getActiveSkin();
    // Перший — стартовий скін, відкритий завжди; далі скіни рівнів, що відкриваються після проходження
    var entries = [{ level: null, skin: { id: "skin_base", name: "Стандартний Неон", renderType: DEFAULT_SKIN } }];
    for (var li = 0; li < ALL_LEVELS.length; li++) {
        if (ALL_LEVELS[li].skin) {
            entries.push({ level: ALL_LEVELS[li], skin: ALL_LEVELS[li].skin });
        }
    }

    addSkinSectionTitle(grid, "Скіни рівнів");
    for (var i = 0; i < entries.length; i++) {
        var level = entries[i].level;
        var skin = entries[i].skin;

        var isUnlocked = !level || (progress.unlockedSkins && progress.unlockedSkins.indexOf(skin.id) !== -1);
        var isActive = (skin.renderType === activeSkinId);
        var achievement = level ? save.getLevelAchievement(level.id) : null;

        var card = document.createElement("div");
        card.className = "skin-card" + (isUnlocked ? "" : " locked") + (isActive ? " active" : "");
        if (achievement === "easy") {
            card.classList.add("perfect-silver");
        } else if (achievement === "hard") {
            card.classList.add("perfect-gold");
        }
        card.setAttribute("data-skin-type", skin.renderType);
        card.setAttribute("data-skin-id", skin.id);

        var previewCanvas = document.createElement("canvas");
        previewCanvas.width = 80;
        previewCanvas.height = 80;
        previewCanvas.className = "skin-preview";
        card.appendChild(previewCanvas);

        var nameSpan = document.createElement("span");
        nameSpan.className = "skin-card-name";
        // Назву закритого скіна не показуємо — нехай буде сюрприз
        nameSpan.textContent = isUnlocked ? skin.name : "???";
        card.appendChild(nameSpan);

        // Бонус скіна рівня (сила залежить від рамки на рівні)
        var levelPerk = levelSkinPerk(level);
        if (levelPerk) {
            var perkLabel = document.createElement("span");
            perkLabel.className = "weapon-coin-bonus";
            perkLabel.textContent = skinPerkText(levelPerk.kind, levelPerk.value);
            perkLabel.dataset.tip = levelSkinPerkHint(levelPerk.kind);
            card.appendChild(perkLabel);
        }

        if (!isUnlocked) {
            var hint = document.createElement("span");
            hint.className = "unlock-hint";
            hint.textContent = "Пройди рівень " + (level.leagueId || "?") + "-" +
                (LEVELS_CONFIG[level.leagueId - 1].levels.indexOf(level) + 1) +
                ", щоб відкрити";
            card.appendChild(hint);
        }

        if (isUnlocked) {
            card.addEventListener("click", function (e) {
                var skinType = this.getAttribute("data-skin-type");
                save.setActiveSkin(skinType);
                renderCurrentSkinIcon();
                buildSkinGrid();
                skinsModalEl.classList.add("hidden");
            });
        }

        grid.appendChild(card);

        if (isUnlocked) {
            (function (cardCanvas, renderType, achv) {
                requestAnimationFrame(function () {
                    var pctx = cardCanvas.getContext("2d");
                    var dpr2 = window.devicePixelRatio || 1;
                    var psize = 80;
                    cardCanvas.width = Math.round(psize * dpr2);
                    cardCanvas.height = Math.round(psize * dpr2);
                    cardCanvas.style.width = psize + "px";
                    cardCanvas.style.height = psize + "px";
                    pctx.setTransform(dpr2, 0, 0, dpr2, 0, 0);
                    pctx.save();
                    pctx.translate(psize / 2, psize / 2);
                    var previewSize = psize * 0.75;
                    var nowMs = performance.now();
                    SKIN_RENDERERS[renderType](pctx, previewSize, nowMs);
                    drawAchievementFrame(pctx, previewSize, achv, nowMs);
                    pctx.restore();
                });
            })(previewCanvas, skin.renderType, achievement);
        } else {
            (function (cardCanvas) {
                requestAnimationFrame(function () {
                    var pctx = cardCanvas.getContext("2d");
                    var dpr2 = window.devicePixelRatio || 1;
                    var psize = 80;
                    cardCanvas.width = Math.round(psize * dpr2);
                    cardCanvas.height = Math.round(psize * dpr2);
                    cardCanvas.style.width = psize + "px";
                    cardCanvas.style.height = psize + "px";
                    pctx.setTransform(dpr2, 0, 0, dpr2, 0, 0);
                    pctx.fillStyle = "rgba(60, 62, 75, 0.5)";
                    pctx.fillRect(8, 8, psize - 16, psize - 16);
                    pctx.strokeStyle = "rgba(80, 82, 90, 0.5)";
                    pctx.lineWidth = 2;
                    pctx.strokeRect(8, 8, psize - 16, psize - 16);
                });
            })(previewCanvas);
        }
    }
    buildShopSkinSection(grid, activeSkinId);
}

// Скіни з магазину: куплені вибираються як звичайні, решта — сірі й ведуть до магазину
function buildShopSkinSection(grid, activeSkinId) {
    addSkinSectionTitle(grid, "Скіни з магазину");
    for (const item of SHOP_ITEMS) {
        if (item.type !== "skin") {
            continue;
        }
        const owned = save.isOwned(item.id);
        const card = document.createElement("div");
        card.className = "skin-card" + (owned ? "" : " for-sale") + (item.renderType === activeSkinId ? " active" : "") +
            (item.legendary ? " legendary" : "");
        const previewCanvas = document.createElement("canvas");
        previewCanvas.width = 80;
        previewCanvas.height = 80;
        previewCanvas.className = "skin-preview";
        card.appendChild(previewCanvas);
        const nameSpan = document.createElement("span");
        nameSpan.className = "skin-card-name";
        nameSpan.textContent = (item.legendary ? "⭐ " : "") + item.name;
        card.appendChild(nameSpan);
        // Бонус скіна з магазину
        if (itemPerkText(item.id)) {
            const perkSpan = document.createElement("span");
            perkSpan.className = "weapon-coin-bonus";
            perkSpan.textContent = itemPerkText(item.id);
            perkSpan.dataset.tip = itemPerkHint(item.id);
            card.appendChild(perkSpan);
        }
        if (owned) {
            card.addEventListener("click", function () {
                save.setActiveSkin(item.renderType);
                renderCurrentSkinIcon();
                skinsModalEl.classList.add("hidden");
            });
            requestAnimationFrame(function () {
                const pctx = previewCanvas.getContext("2d");
                const dpr2 = window.devicePixelRatio || 1;
                previewCanvas.width = Math.round(80 * dpr2);
                previewCanvas.height = Math.round(80 * dpr2);
                previewCanvas.style.width = "80px";
                previewCanvas.style.height = "80px";
                pctx.setTransform(dpr2, 0, 0, dpr2, 0, 0);
                pctx.save();
                pctx.translate(40, 40);
                SKIN_RENDERERS[item.renderType](pctx, 60, performance.now(), {});
                pctx.restore();
            });
        } else {
            const hint = document.createElement("span");
            hint.className = "sale-hint";
            const reqProgress = save.getRequirementProgress(item);
            hint.textContent = reqProgress.met ? "🪙 " + item.price + " — у магазині" : requirementLabel(reqProgress);
            card.appendChild(hint);
            card.addEventListener("click", function () {
                // Відкриваємо магазин одразу на вкладці скінів із цим товаром
                skinsModalEl.classList.add("hidden");
                activeShopType = "skin";
                openShop();
            });
            requestAnimationFrame(function () {
                drawStaticGraySkin(previewCanvas, item.renderType, 80);
            });
        }
        grid.appendChild(card);
    }
}

if (skinTriggerEl) {
    skinTriggerEl.addEventListener("click", function () {
        buildSkinGrid();
        skinsModalEl.classList.remove("hidden");
    });
}

if (btnCloseSkins) {
    btnCloseSkins.addEventListener("click", function () {
        skinsModalEl.classList.add("hidden");
    });
}

skinsModalEl.addEventListener("click", function (e) {
    if (e.target === skinsModalEl) {
        skinsModalEl.classList.add("hidden");
    }
});

// ---------- Магазин ----------

let activeShopType = "skin";
// Щойно куплений скін: його прев'ю «заливається» кольором знизу вгору
let justBought = null;
let confirmItemId = null;
let shopPreviews = [];
let shopAnimating = false;

function buildShopTabs() {
    shopTabsEl.innerHTML = "";
    for (const t of SHOP_TYPES) {
        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = "league-tab" + (t.type === activeShopType ? " active" : "");
        tab.textContent = t.name;
        tab.addEventListener("click", function () {
            activeShopType = t.type;
            confirmItemId = null;
            buildShop();
        });
        shopTabsEl.appendChild(tab);
    }
}

// Спливаюча підказка для підписів бонусів (data-tip): з'являється при наведенні
const perkTipEl = document.createElement("div");
perkTipEl.className = "perk-tip hidden";
document.body.appendChild(perkTipEl);

document.addEventListener("mouseover", function (e) {
    const target = e.target && e.target.closest ? e.target.closest("[data-tip]") : null;
    if (!target || !target.dataset.tip) {
        perkTipEl.classList.add("hidden");
        return;
    }
    perkTipEl.textContent = target.dataset.tip;
    perkTipEl.classList.remove("hidden");
    const r = target.getBoundingClientRect();
    const tipW = Math.min(320, window.innerWidth - 20);
    perkTipEl.style.maxWidth = tipW + "px";
    const left = Math.max(10, Math.min(window.innerWidth - tipW - 10, r.left + r.width / 2 - tipW / 2));
    perkTipEl.style.left = left + "px";
    perkTipEl.style.top = Math.max(10, r.top - perkTipEl.offsetHeight - 8) + "px";
});

// Пояснення бонусів поточної вкладки внизу магазину
function buildShopLegend() {
    const el = document.getElementById("shopLegend");
    if (!el) {
        return;
    }
    el.innerHTML = "";
    for (const line of shopTabHints(activeShopType)) {
        const row = document.createElement("div");
        row.textContent = line;
        el.appendChild(row);
    }
    el.classList.toggle("hidden", el.childElementCount === 0);
}

function buildShop() {
    refreshCrystalDisplays();
    buildShopTabs();
    buildShopLegend();
    shopGridEl.innerHTML = "";
    shopPreviews = [];
    const balance = save.getCrystals();
    const equipped = activeShopType === "skin" ? null : save.getEquipped(activeShopType);
    const activeSkin = save.getActiveSkin();
    for (const item of SHOP_ITEMS) {
        if (item.type !== activeShopType) {
            continue;
        }
        const owned = save.isOwned(item.id);
        const isEquipped = item.type === "skin" ? activeSkin === item.renderType : equipped === item.id;
        const card = document.createElement("div");
        card.className = "skin-card shop-card" + (isEquipped ? " active" : "") + (item.legendary ? " legendary" : "");
        const reqProgress = save.getRequirementProgress(item);

        const canvas = document.createElement("canvas");
        canvas.className = "skin-preview";
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(150 * dpr);
        canvas.height = Math.round(100 * dpr);
        canvas.style.width = "150px";
        canvas.style.height = "100px";
        card.appendChild(canvas);
        const entry = { canvas: canvas, item: item, dpr: dpr, owned: owned, drawn: false, gray: null };
        // Некуплений товар — сірий нерухомий кадр: як він працює, видно лише після покупки
        if (!owned || (justBought && justBought.id === item.id)) {
            entry.gray = makeGraySnapshot(item, dpr);
        }
        shopPreviews.push(entry);

        const name = document.createElement("span");
        name.className = "skin-card-name";
        name.textContent = (item.legendary ? "⭐ " : "") + item.name;
        card.appendChild(name);
        // Зброя дає бонус до монет — видно одразу на картці
        if (item.type === "weapon" && weaponCoinBonus(item.id) > 1) {
            const bonus = document.createElement("span");
            bonus.className = "weapon-coin-bonus";
            bonus.textContent = "🪙 Монети ×" + weaponCoinBonus(item.id);
            bonus.dataset.tip = itemPerkHint(item.id);
            card.appendChild(bonus);
        }
        // Аксесуари, шлейфи й вибухи дають бонус: монети, сундуки, повільніша траса, ширша зона
        if (itemPerkText(item.id)) {
            const perk = document.createElement("span");
            perk.className = "weapon-coin-bonus";
            perk.textContent = itemPerkText(item.id);
            perk.dataset.tip = itemPerkHint(item.id);
            card.appendChild(perk);
        }

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "shop-btn";
        if (isEquipped) {
            btn.classList.add("equipped");
            btn.textContent = "ОДЯГНУТО";
            btn.disabled = true;
        } else if (owned) {
            btn.classList.add("equip");
            btn.textContent = "ОДЯГНУТИ";
            btn.addEventListener("click", function () {
                save.equipItem(item.id);
                confirmItemId = null;
                renderCurrentSkinIcon();
                buildShop();
            });
        } else if (!reqProgress.met) {
            // Легендарний товар ще закритий умовою
            btn.classList.add("poor");
            btn.textContent = requirementLabel(reqProgress);
            btn.disabled = true;
        } else if (balance >= item.price) {
            if (confirmItemId === item.id) {
                btn.classList.add("confirm");
                btn.textContent = "ТОЧНО? 🪙 " + item.price;
            } else {
                btn.textContent = "КУПИТИ 🪙 " + item.price;
            }
            btn.addEventListener("click", function () {
                if (confirmItemId !== item.id) {
                    // Перше натискання лише просить підтвердження — щоб не купити випадково
                    confirmItemId = item.id;
                    buildShop();
                    return;
                }
                confirmItemId = null;
                if (save.buyItem(item.id)) {
                    save.equipItem(item.id);
                    playSound("click");
                    justBought = { id: item.id, start: performance.now() };
                    announceAchievements(save.checkAchievements());
                    refreshChestButtons();
                }
                renderCurrentSkinIcon();
                buildShop();
            });
        } else {
            btn.classList.add("poor");
            btn.textContent = "Ще " + (item.price - balance) + " 🪙";
            btn.disabled = true;
        }
        card.appendChild(btn);
        shopGridEl.appendChild(card);
    }
}

// Момент, який показує сірий знімок некупленого товару: кубик зі шлейфом,
// перша мить вибуху, кубик з аксесуаром, кубик зі зброєю перед атакою
const GRAY_FRAME_TIME = { skin: 0, trail: 500, explosion: 780, accessory: 0, weapon: 500 };

// Сірий нерухомий знімок товару для картки магазину
function makeGraySnapshot(item, dpr) {
    const snap = document.createElement("canvas");
    snap.width = Math.round(150 * dpr);
    snap.height = Math.round(100 * dpr);
    const sctx = snap.getContext("2d");
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (item.type === "skin") {
        drawShopSkinScene(sctx, item, 0, null);
    } else {
        drawShopItemLive({ canvas: snap, item: item, dpr: dpr }, GRAY_FRAME_TIME[item.type] || 0);
    }
    grayscaleCanvas(snap);
    return snap;
}

// Напис після покупки залежно від типу товару
const BOUGHT_TEXT = {
    skin: "Новий скін!",
    trail: "Новий шлейф!",
    explosion: "Новий вибух!",
    accessory: "Новий аксесуар!",
    weapon: "Нова зброя!"
};

const BUY_POUR_MS = 1100;
const BUY_BANNER_MS = 2600;

// Прев'ю товару: сірий нерухомий кадр до покупки, живий кольоровий після,
// а щойно куплений ще й «заливається» кольором із написом «Новий …!»
function drawShopPreview(entry, now) {
    const pctx = entry.canvas.getContext("2d");
    if (!entry.owned) {
        if (!entry.drawn && entry.gray) {
            pctx.setTransform(1, 0, 0, 1, 0, 0);
            pctx.drawImage(entry.gray, 0, 0);
            entry.drawn = true;
        }
        return;
    }
    drawShopItemLive(entry, now);
    pctx.setTransform(entry.dpr, 0, 0, entry.dpr, 0, 0);
    if (!justBought || justBought.id !== entry.item.id) {
        return;
    }
    const elapsed = now - justBought.start;
    if (elapsed > BUY_BANNER_MS) {
        justBought = null;
        return;
    }
    const k = Math.min(1, elapsed / BUY_POUR_MS);
    if (k < 1 && entry.gray) {
        // Сіра частина зверху зменшується — колір підіймається знизу
        const grayH = Math.round(entry.gray.height * (1 - k));
        if (grayH > 0) {
            pctx.setTransform(1, 0, 0, 1, 0, 0);
            pctx.drawImage(entry.gray, 0, 0, entry.gray.width, grayH, 0, 0, entry.gray.width, grayH);
            pctx.setTransform(entry.dpr, 0, 0, entry.dpr, 0, 0);
            pctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            pctx.fillRect(0, grayH / entry.dpr - 1, 150, 2);
        }
    } else {
        // Спалах і напис
        const after = elapsed - BUY_POUR_MS;
        const flash = Math.max(0, 1 - after / 300);
        if (flash > 0) {
            pctx.fillStyle = "rgba(255, 255, 255, " + (flash * 0.7).toFixed(2) + ")";
            pctx.fillRect(0, 0, 150, 100);
        }
        const fade = Math.min(1, (BUY_BANNER_MS - elapsed) / 400);
        pctx.globalAlpha = Math.max(0, fade);
        pctx.font = "bold 15px 'Segoe UI', Arial";
        pctx.textAlign = "center";
        pctx.textBaseline = "middle";
        pctx.lineWidth = 3;
        pctx.strokeStyle = "#070b1c";
        const boughtText = BOUGHT_TEXT[entry.item.type] || "Куплено!";
        pctx.strokeText(boughtText, 75, 16);
        pctx.fillStyle = "#ffcc33";
        pctx.fillText(boughtText, 75, 16);
        pctx.globalAlpha = 1;
    }
}

// Жива сценка товару на кубику з поточним скіном та аксесуаром
function drawShopItemLive(entry, now) {
    const pctx = entry.canvas.getContext("2d");
    pctx.setTransform(entry.dpr, 0, 0, entry.dpr, 0, 0);
    drawShopItemScene(pctx, entry.item, now, { skinType: save.getActiveSkin(), accessory: save.getEquipped("accessory") });
}

function animateShop(now) {
    if (shopModalEl.classList.contains("hidden")) {
        shopAnimating = false;
        return;
    }
    for (const entry of shopPreviews) {
        drawShopPreview(entry, now);
    }
    requestAnimationFrame(animateShop);
}

function openShop() {
    confirmItemId = null;
    buildShop();
    shopModalEl.classList.remove("hidden");
    if (!shopAnimating) {
        shopAnimating = true;
        requestAnimationFrame(animateShop);
    }
}

function closeShop() {
    confirmItemId = null;
    shopModalEl.classList.add("hidden");
    refreshCrystalDisplays();
    renderCurrentSkinIcon();
}

if (shopTriggerEl) {
    shopTriggerEl.addEventListener("click", openShop);
}

if (btnCloseShop) {
    btnCloseShop.addEventListener("click", closeShop);
}

shopModalEl.addEventListener("click", function (e) {
    if (e.target === shopModalEl) {
        closeShop();
    }
});

export { closeShop, renderCurrentSkinIcon, shopModalEl, skinsModalEl };

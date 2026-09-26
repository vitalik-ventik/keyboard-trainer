// ============================================================
// ui/chests.js — вікно сундуків: трясіння, відкриття, результат і екіпірування
// ============================================================

import { playSound } from "../assets.js";
import { save } from "../engine.js";
import { CHEST_TYPES, SHOP_TYPES, coinsText, getShopItem, heartsText, itemRarity } from "../shop.js";
import { CHEST_OPEN_MS, CHEST_SHAKE_MS, drawChestScene } from "../shop_preview.js";
import { renderCurrentSkinIcon } from "./shop.js";
import { announceAchievements } from "./achievements.js";
import { refreshCrystalDisplays } from "./coins.js";

// ---------- Сундуки ----------

const chestModalEl = document.getElementById("chest-modal");
const chestCanvas = document.getElementById("chestCanvas");
const chestTitleEl = document.getElementById("chestTitle");
const chestResultEl = document.getElementById("chestResult");
const btnChestOpen = document.getElementById("btnChestOpen");
const btnChestEquip = document.getElementById("btnChestEquip");
const btnChestNext = document.getElementById("btnChestNext");
const btnChestClose = document.getElementById("btnChestClose");
const btnVictoryChest = document.getElementById("btnVictoryChest");
const btnMenuChests = document.getElementById("btnMenuChests");

const CHEST_W = 380;
const CHEST_H = 260;

// Стан вікна: який сундук показано, коли почали відкривати й що випало
let chestView = null;
let chestAnimating = false;

// Кнопки «Відкрити сундук» на екрані перемоги та «Сундуки» в меню
function refreshChestButtons() {
    const count = save.getPendingChests().length;
    const label = count > 1 ? "🎁 ВІДКРИТИ СУНДУКИ (" + count + ")" : "🎁 ВІДКРИТИ СУНДУК";
    if (btnVictoryChest) {
        btnVictoryChest.textContent = label;
        btnVictoryChest.classList.toggle("hidden", count === 0);
    }
    if (btnMenuChests) {
        btnMenuChests.textContent = count > 1 ? "🎁 СУНДУКИ: " + count : "🎁 СУНДУК ЧЕКАЄ!";
        btnMenuChests.classList.toggle("hidden", count === 0);
    }
}

function setChestButtons(phase) {
    btnChestOpen.classList.toggle("hidden", phase !== "closed");
    const revealed = phase === "reveal";
    const result = chestView && chestView.opened ? chestView.opened.result : null;
    const canEquip = revealed && result && result.kind === "item" && !chestView.equipped;
    btnChestEquip.classList.toggle("hidden", !canEquip);
    btnChestNext.classList.toggle("hidden", !(revealed && save.getPendingChests().length > 0));
    btnChestClose.classList.toggle("hidden", !revealed);
}

// Показати наступний сундук із черги (ще закритий)
function showNextChest() {
    const pending = save.getPendingChests();
    if (pending.length === 0) {
        closeChestModal();
        return;
    }
    const type = pending[0];
    chestView = { type: type, phase: "closed", start: 0, opened: null, equipped: false };
    chestTitleEl.textContent = CHEST_TYPES[type].name.toUpperCase();
    chestResultEl.innerHTML = pending.length > 1 ? "Сундуків: " + pending.length : "&nbsp;";
    setChestButtons("closed");
}

function openChestModal() {
    if (save.getPendingChests().length === 0) {
        return;
    }
    const dpr = window.devicePixelRatio || 1;
    chestCanvas.width = Math.round(CHEST_W * dpr);
    chestCanvas.height = Math.round(CHEST_H * dpr);
    chestCanvas.style.width = CHEST_W + "px";
    chestCanvas.style.height = CHEST_H + "px";
    chestModalEl.classList.remove("hidden");
    showNextChest();
    if (!chestAnimating) {
        chestAnimating = true;
        requestAnimationFrame(animateChest);
    }
}

function closeChestModal() {
    chestModalEl.classList.add("hidden");
    chestView = null;
    refreshChestButtons();
    refreshCrystalDisplays();
    renderCurrentSkinIcon();
}

// Натиснули «Відкрити»: нагорода визначається й зберігається одразу, анімація — лише показ
function startOpenChest() {
    if (!chestView || chestView.phase !== "closed") {
        return;
    }
    const opened = save.openNextChest();
    if (!opened) {
        closeChestModal();
        return;
    }
    chestView.opened = opened;
    // Відкритий сундук може дати досягнення («Скарбошукач», «Легенда», перша річ);
    // сундук-нагорода стає в чергу й відкривається кнопкою «Наступний»
    announceAchievements(save.checkAchievements());
    chestView.phase = "shaking";
    chestView.start = performance.now();
    chestResultEl.innerHTML = "&nbsp;";
    setChestButtons("shaking");
    playSound("chest_shake");
}

// Enter у вікні сундука: відкрити → наступний → закрити
function chestPrimaryAction() {
    if (!chestView) {
        return;
    }
    if (chestView.phase === "closed") {
        startOpenChest();
    } else if (chestView.phase === "reveal") {
        if (save.getPendingChests().length > 0) {
            showNextChest();
        } else {
            closeChestModal();
        }
    }
}

function showChestResult() {
    const result = chestView.opened.result;
    if (result.kind === "crystals") {
        chestResultEl.innerHTML = "🪙 +" + coinsText(result.amount) + "!";
        playSound("chest_coins");
    } else if (result.kind === "heart") {
        chestResultEl.innerHTML = "❤ +" + heartsText(result.amount) + "! Запасне життя на випадок помилки";
        playSound("chest_item");
    } else {
        const item = getShopItem(result.id);
        const rarity = itemRarity(item);
        const typeName = (SHOP_TYPES.find(function (st) { return st.type === item.type; }) || { name: "" }).name;
        chestResultEl.innerHTML = "";
        chestResultEl.appendChild(document.createTextNode("Новий предмет: " + item.name + "!"));
        const r = document.createElement("span");
        r.className = "rarity";
        r.style.color = rarity.color;
        r.textContent = rarity.name + " · " + typeName;
        chestResultEl.appendChild(r);
        playSound("chest_item");
    }
    refreshCrystalDisplays();
    setChestButtons("reveal");
}

function animateChest(now) {
    if (chestModalEl.classList.contains("hidden") || !chestView) {
        chestAnimating = false;
        return;
    }
    // Перемикання фаз (звуки й підпис нагороди); малює сценку спільна функція
    if (chestView.phase === "shaking" && now - chestView.start >= CHEST_SHAKE_MS) {
        chestView.phase = "opening";
        playSound("chest_open");
    } else if (chestView.phase === "opening" && now - chestView.start >= CHEST_SHAKE_MS + CHEST_OPEN_MS) {
        chestView.phase = "reveal";
        showChestResult();
    }
    const dpr = window.devicePixelRatio || 1;
    const c = chestCanvas.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const openT = chestView.phase === "closed" ? null : now - chestView.start;
    drawChestScene(c, CHEST_W, CHEST_H, chestView.type, openT, chestView.opened ? chestView.opened.result : null, now,
        { skinType: save.getActiveSkin(), accessory: save.getEquipped("accessory") });
    requestAnimationFrame(animateChest);
}

if (btnVictoryChest) {
    btnVictoryChest.addEventListener("click", openChestModal);
}
if (btnMenuChests) {
    btnMenuChests.addEventListener("click", openChestModal);
}
btnChestOpen.addEventListener("click", startOpenChest);
btnChestNext.addEventListener("click", showNextChest);
btnChestClose.addEventListener("click", closeChestModal);
btnChestEquip.addEventListener("click", function () {
    if (chestView && chestView.opened && chestView.opened.result.kind === "item") {
        save.equipItem(chestView.opened.result.id);
        chestView.equipped = true;
        renderCurrentSkinIcon();
        setChestButtons("reveal");
    }
});
chestModalEl.addEventListener("click", function (e) {
    if (e.target === chestModalEl && chestView && chestView.phase !== "shaking" && chestView.phase !== "opening") {
        closeChestModal();
    }
});

export { chestModalEl, chestPrimaryAction, closeChestModal, refreshChestButtons };

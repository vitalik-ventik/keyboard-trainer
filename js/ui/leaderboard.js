// ============================================================
// ui/leaderboard.js — вікно «Рейтинг»: загальна таблиця гравців із Firebase
// Свій рядок підсвічується й береться з локального збереження (найсвіжіші дані),
// клік по рядку розгортає детальну статистику гравця.
// ============================================================

import { SKIN_RENDERERS, save } from "../engine.js";
import { drawAccessory, drawPet, getShopItem } from "../shop.js";
import { fetchLeaderboard, getPlayerId, getPlayerName, requestSync } from "../cloud.js";
import { openNamePrompt } from "./name_prompt.js";

const lbTriggerEl = document.getElementById("lb-trigger");
const lbModalEl = document.getElementById("lb-modal");
const lbListEl = document.getElementById("lbList");
const lbSummaryEl = document.getElementById("lbSummary");
const menuRatingEl = document.getElementById("menuRating");
const btnCloseLb = document.getElementById("btnCloseLb");
const btnRefreshLb = document.getElementById("btnRefreshLb");

// Розмір аватара в рядку (логічні пікселі): кубик ліворуч, улюбленці праворуч
const AVATAR_W = 136;
const AVATAR_H = 52;
const MAX_AVATAR_PETS = 3;
const MEDALS = ["🥇", "🥈", "🥉"];

let loading = false;

export function isLeaderboardOpen() {
    return !!lbModalEl && !lbModalEl.classList.contains("hidden");
}

// Власний рейтинг на кнопці в меню
export function refreshLeaderboardBadge() {
    if (menuRatingEl) {
        menuRatingEl.textContent = "🏆 " + save.getRating().rating;
    }
}

// Свій рядок — зі збереження, а не з бази: там найсвіжіші дані, навіть якщо
// останнє надсилання ще не дійшло
function mergeOwnRow(players) {
    const myId = getPlayerId();
    const myName = getPlayerName();
    if (!myName) {
        return players;
    }
    const snapshot = save.getCloudSnapshot();
    const own = {
        id: myId || "me",
        name: myName,
        rating: snapshot.rating,
        stats: snapshot.stats,
        avatar: snapshot.avatar,
        updatedAt: new Date(),
        me: true
    };
    const list = players.filter(function (p) { return !myId || p.id !== myId; });
    list.push(own);
    list.sort(function (a, b) { return b.rating - a.rating; });
    return list;
}

// «сьогодні», «учора», «3 дн. тому» або дата
function lastSeenText(date) {
    if (!date) {
        return "";
    }
    const startOfDay = function (d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
    const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
    if (days <= 0) {
        return "сьогодні";
    }
    if (days === 1) {
        return "учора";
    }
    if (days < 7) {
        return days + " дн. тому";
    }
    return String(date.getDate()).padStart(2, "0") + "." + String(date.getMonth() + 1).padStart(2, "0") + "." + date.getFullYear();
}

function num(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

// Кубик гравця з аксесуаром і до трьох улюбленців зграї
function drawAvatar(canvas, avatar) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(AVATAR_W * dpr);
    canvas.height = Math.round(AVATAR_H * dpr);
    canvas.style.width = AVATAR_W + "px";
    canvas.style.height = AVATAR_H + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, AVATAR_W, AVATAR_H);
    const skin = typeof avatar.skin === "string" ? avatar.skin : null;
    const accessory = typeof avatar.accessory === "string" && getShopItem(avatar.accessory) ? avatar.accessory : null;
    const withAccessory = accessory && accessory !== "acc_none";
    const cubeSize = withAccessory ? 30 : 36;
    try {
        ctx.save();
        ctx.translate(26, AVATAR_H / 2 + (withAccessory ? 5 : 0));
        if (skin && SKIN_RENDERERS[skin]) {
            SKIN_RENDERERS[skin](ctx, cubeSize, 0);
            if (withAccessory) {
                drawAccessory(ctx, accessory, cubeSize, 0);
            }
        } else {
            ctx.fillStyle = "rgba(0, 246, 255, 0.3)";
            ctx.fillRect(-cubeSize / 2, -cubeSize / 2, cubeSize, cubeSize);
        }
        ctx.restore();
        const pets = Array.isArray(avatar.pets) ? avatar.pets.filter(function (id) {
            const item = typeof id === "string" ? getShopItem(id) : null;
            return !!item && item.type === "pet";
        }).slice(0, MAX_AVATAR_PETS) : [];
        const mutations = avatar.mutations && typeof avatar.mutations === "object" ? avatar.mutations : {};
        const petSize = 24;
        for (let i = 0; i < pets.length; i++) {
            ctx.save();
            ctx.translate(60 + i * 26, AVATAR_H - 6 - petSize / 2);
            drawPet(ctx, pets[i], petSize, 0, { mutation: typeof mutations[pets[i]] === "string" ? mutations[pets[i]] : null });
            ctx.restore();
        }
    } catch (err) {
        // Невідомий скін чи улюбленець із новішої версії гри не ламає таблицю
        console.warn("Не вдалося намалювати аватар:", err);
        ctx.restore();
    }
}

function addChip(parent, label, value) {
    const chip = document.createElement("span");
    chip.className = "rating-chip";
    chip.appendChild(document.createTextNode(label + ": "));
    const b = document.createElement("b");
    b.textContent = value;
    chip.appendChild(b);
    parent.appendChild(chip);
}

function buildRow(player, place) {
    const s = player.stats || {};
    const row = document.createElement("div");
    row.className = "lb-row" + (player.me ? " lb-me" : "") + (place <= 3 ? " lb-top" : "");

    const placeEl = document.createElement("span");
    placeEl.className = "lb-place";
    placeEl.textContent = place <= 3 ? MEDALS[place - 1] : String(place);
    row.appendChild(placeEl);

    const avatarCanvas = document.createElement("canvas");
    avatarCanvas.className = "lb-avatar";
    row.appendChild(avatarCanvas);
    drawAvatar(avatarCanvas, player.avatar || {});

    const main = document.createElement("div");
    main.className = "lb-main";
    const nameEl = document.createElement("div");
    nameEl.className = "lb-name";
    nameEl.textContent = player.name;
    if (player.me) {
        const you = document.createElement("span");
        you.className = "lb-you";
        you.textContent = "ТИ";
        nameEl.appendChild(you);
    }
    main.appendChild(nameEl);
    const sub = [];
    const cleared = num(s.levelsCleared);
    const total = num(s.levelsTotal);
    if (cleared !== null) {
        sub.push("Рівні " + cleared + (total ? " / " + total : "") + (num(s.levelsHard) ? " (HARD " + num(s.levelsHard) + ")" : ""));
    }
    if (num(s.accuracy) !== null) {
        sub.push("точність " + num(s.accuracy) + "%");
    }
    if (num(s.lettersPerMinute) !== null) {
        sub.push(num(s.lettersPerMinute) + " літ/хв");
    }
    const seen = player.me ? "" : lastSeenText(player.updatedAt);
    if (seen) {
        sub.push(seen);
    }
    const subEl = document.createElement("div");
    subEl.className = "lb-sub";
    subEl.textContent = sub.join(" · ");
    main.appendChild(subEl);
    row.appendChild(main);

    const ratingEl = document.createElement("span");
    ratingEl.className = "lb-rating";
    ratingEl.textContent = "🏆 " + player.rating;
    row.appendChild(ratingEl);

    // Детальна статистика — розгортається кліком по рядку
    const details = document.createElement("div");
    details.className = "lb-details rating-chips hidden";
    if (num(s.achievements) !== null) {
        addChip(details, "Досягнення", num(s.achievements) + (num(s.achievementsTotal) ? " / " + num(s.achievementsTotal) : ""));
    }
    if (num(s.silver) !== null || num(s.gold) !== null) {
        addChip(details, "Рамки", "срібних " + (num(s.silver) || 0) + " · золотих " + (num(s.gold) || 0));
    }
    if (num(s.runs) !== null) {
        addChip(details, "Забігів", num(s.runs) + (num(s.minutes) ? " · " + num(s.minutes) + " хв" : ""));
    }
    if (num(s.days) !== null) {
        addChip(details, "Днів у грі", String(num(s.days)));
    }
    if (num(s.bestCombo)) {
        addChip(details, "Найкраща серія", String(num(s.bestCombo)));
    }
    if (Array.isArray(s.weakLetters) && s.weakLetters.length > 0) {
        addChip(details, "Найважчі літери", s.weakLetters.filter(function (l) { return typeof l === "string"; }).join(" "));
    }
    if (num(s.base) !== null) {
        addChip(details, "За рівні", String(num(s.base)) + (num(s.bonus) ? " + практика " + num(s.bonus) : ""));
    }
    row.appendChild(details);
    row.addEventListener("click", function () {
        details.classList.toggle("hidden");
        row.classList.toggle("lb-open", !details.classList.contains("hidden"));
    });
    return row;
}

function showMessage(text, withNameButton) {
    lbListEl.textContent = "";
    const p = document.createElement("p");
    p.className = "lb-message";
    p.textContent = text;
    lbListEl.appendChild(p);
    if (withNameButton) {
        lbListEl.appendChild(buildNameButton());
    }
}

function buildNameButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "text-btn lb-name-btn";
    btn.textContent = "ВКАЗАТИ ІМ'Я";
    btn.addEventListener("click", function () {
        openNamePrompt(function (saved) {
            if (saved) {
                loadLeaderboard();
            }
        });
    });
    return btn;
}

function renderList(players) {
    lbListEl.textContent = "";
    const list = mergeOwnRow(players);
    let myPlace = 0;
    list.forEach(function (player, i) {
        if (player.me) {
            myPlace = i + 1;
        }
        lbListEl.appendChild(buildRow(player, i + 1));
    });
    if (!getPlayerName()) {
        const hint = document.createElement("p");
        hint.className = "lb-message";
        hint.textContent = "Тебе ще немає в рейтингу — вкажи ім'я, і твій результат з'явиться тут";
        lbListEl.appendChild(hint);
        lbListEl.appendChild(buildNameButton());
    }
    if (list.length === 0) {
        showMessage("Поки що в рейтингу нікого немає. Будь першим!", !getPlayerName());
    }
    lbSummaryEl.textContent = "Гравців: " + list.length + (myPlace ? "   ·   Твоє місце: " + myPlace : "") + "   ·   клікни на гравця, щоб побачити більше";
}

function loadLeaderboard() {
    if (loading) {
        return;
    }
    loading = true;
    lbSummaryEl.textContent = "";
    showMessage("Завантаження рейтингу…", false);
    // Один повтор, якщо мережа зірвалася (наприклад, на мить зник Wi-Fi)
    fetchLeaderboard().catch(function () {
        return fetchLeaderboard();
    }).then(function (players) {
        if (isLeaderboardOpen()) {
            renderList(players);
        }
    }).catch(function (err) {
        console.warn("Рейтинг не завантажено:", err);
        if (isLeaderboardOpen()) {
            showMessage("Не вдалося завантажити рейтинг — перевір інтернет і натисни «ОНОВИТИ»", false);
        }
    }).finally(function () {
        loading = false;
        // Після завантаження таблиці надсилаємо свій свіжий результат (свій рядок
        // і так показано з локального збереження)
        requestSync();
    });
}

export function openLeaderboard() {
    if (!lbModalEl) {
        return;
    }
    lbModalEl.classList.remove("hidden");
    const scroll = lbModalEl.querySelector(".list-modal-scroll");
    if (scroll) {
        scroll.scrollTop = 0;
    }
    loadLeaderboard();
}

export function closeLeaderboard() {
    if (lbModalEl) {
        lbModalEl.classList.add("hidden");
    }
}

if (lbTriggerEl) {
    lbTriggerEl.addEventListener("click", openLeaderboard);
}

if (btnCloseLb) {
    btnCloseLb.addEventListener("click", closeLeaderboard);
}

if (btnRefreshLb) {
    btnRefreshLb.addEventListener("click", loadLeaderboard);
}

if (lbModalEl) {
    lbModalEl.addEventListener("click", function (e) {
        if (e.target === lbModalEl) {
            closeLeaderboard();
        }
    });
}

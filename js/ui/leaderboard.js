// ============================================================
// ui/leaderboard.js — вікно «Рейтинг»: загальна таблиця гравців із Firebase
// Свій рядок підсвічується й береться з локального збереження (найсвіжіші дані),
// клік по рядку розгортає детальну статистику гравця.
// ============================================================

import { save } from "../engine.js";
import { drawPlayerScene } from "../shop_preview.js";
import { fetchLeaderboard, getPlayerId, getPlayerName, requestSync } from "../cloud.js";
import { openNamePrompt } from "./name_prompt.js";

const lbTriggerEl = document.getElementById("lb-trigger");
const lbModalEl = document.getElementById("lb-modal");
const lbListEl = document.getElementById("lbList");
const lbSummaryEl = document.getElementById("lbSummary");
const menuRatingEl = document.getElementById("menuRating");
const btnCloseLb = document.getElementById("btnCloseLb");
const btnRefreshLb = document.getElementById("btnRefreshLb");

// Розмір живої сценки гравця в рядку (логічні пікселі): зграя ліворуч, кубик праворуч
const AVATAR_W = 300;
const AVATAR_H = 92;
const MEDALS = ["🥇", "🥈", "🥉"];

let loading = false;

// Живі сценки гравців: анімуються лише ті, що зараз видно у списку
let avatarScenes = [];
let avatarObserver = null;
let avatarFrame = 0;

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

// Полотно сценки під dpr; малюється в animateAvatars
function createAvatarCanvas(avatar, seed) {
    const canvas = document.createElement("canvas");
    canvas.className = "lb-avatar";
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(AVATAR_W * dpr);
    canvas.height = Math.round(AVATAR_H * dpr);
    canvas.style.width = AVATAR_W + "px";
    canvas.style.height = AVATAR_H + "px";
    const scene = {
        canvas: canvas,
        ctx: canvas.getContext("2d"),
        dpr: dpr,
        avatar: avatar || {},
        // Зсув у часі, щоб гравці стрибали не всі разом
        shift: (seed * 977) % 2600,
        visible: true,
        broken: false
    };
    avatarScenes.push(scene);
    if (avatarObserver) {
        avatarObserver.observe(canvas);
    }
    drawAvatarScene(scene, performance.now());
    return canvas;
}

function drawAvatarScene(scene, now) {
    if (scene.broken) {
        return;
    }
    const ctx = scene.ctx;
    ctx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
    ctx.clearRect(0, 0, AVATAR_W, AVATAR_H);
    try {
        ctx.save();
        drawPlayerScene(ctx, scene.avatar, AVATAR_W, AVATAR_H, now + scene.shift);
        ctx.restore();
    } catch (err) {
        // Предмет із новішої версії гри не ламає таблицю: сценка просто зупиняється
        console.warn("Не вдалося намалювати гравця:", err);
        scene.broken = true;
    }
}

function animateAvatars(now) {
    if (!isLeaderboardOpen()) {
        avatarFrame = 0;
        return;
    }
    for (const scene of avatarScenes) {
        if (scene.visible) {
            drawAvatarScene(scene, now);
        }
    }
    avatarFrame = requestAnimationFrame(animateAvatars);
}

function resetAvatars() {
    avatarScenes = [];
    if (avatarObserver) {
        avatarObserver.disconnect();
    }
    if (typeof IntersectionObserver === "function") {
        avatarObserver = new IntersectionObserver(function (entries) {
            for (const entry of entries) {
                const scene = avatarScenes.find(function (sc) { return sc.canvas === entry.target; });
                if (scene) {
                    scene.visible = entry.isIntersecting;
                }
            }
        }, { root: lbModalEl ? lbModalEl.querySelector(".list-modal-scroll") : null });
    }
}

function startAvatarAnimation() {
    if (!avatarFrame) {
        avatarFrame = requestAnimationFrame(animateAvatars);
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

    row.appendChild(createAvatarCanvas(player.avatar, place));

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
    if (num(s.masteredLetters) !== null) {
        sub.push("освоєно літер " + num(s.masteredLetters) + (num(s.lettersTotal) ? " / " + num(s.lettersTotal) : ""));
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
    resetAvatars();
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
    resetAvatars();
    const list = mergeOwnRow(players);
    let myPlace = 0;
    list.forEach(function (player, i) {
        if (player.me) {
            myPlace = i + 1;
        }
        lbListEl.appendChild(buildRow(player, i + 1));
    });
    startAvatarAnimation();
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

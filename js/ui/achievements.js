// ============================================================
// ui/achievements.js — лічильники забігу, спливаючі плашки досягнень
// і вікно «Досягнення»
// ============================================================

import { playSound } from "../assets.js";
import { ALL_LEVELS, save } from "../engine.js";
import { CHEST_TYPES } from "../shop.js";
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS, achievementProgress, buildAchievementCard, buildAchievementToast } from "../achievements.js";
import { refreshChestButtons } from "./chests.js";
import { gameEngine } from "../main.js";

// ---------- Досягнення: лічильники забігу й спливаючі плашки ----------

const achievementToastsEl = document.getElementById("achievementToasts");
const ACHIEVEMENT_TOAST_TIME = 4200;
// Коли в черзі ще є плашки, кожна показується коротше
const ACHIEVEMENT_TOAST_TIME_QUEUED = 2800;
// Фанфара звучить раз на всю пачку досягнень і обрізається з затуханням
const ACHIEVEMENT_SOUND_TIME = 4;
const achievementQueue = [];
let achievementToastBusy = false;

// Передає підсумок забігу в лічильники досягнень
function noteRunForAchievements(runState, won) {
    const stats = gameEngine.getLetterStats();
    let misses = 0;
    for (const letter of Object.keys(stats)) {
        misses += stats[letter].miss || 0;
    }
    save.recordRunForAchievements({
        hits: runState.runHits,
        words: runState.runWords,
        maxCombo: runState.runMaxCombo,
        weaponHits: runState.runWeaponHits,
        won: won,
        flawless: won && misses === 0,
        leagueId: (ALL_LEVELS.find(function (l) { return l.id === runState.levelId; }) || { leagueId: 0 }).leagueId,
        eggTheme: runState.eggSeen ? runState.bgTheme : null,
        exploded: !won
    });
}

// Ставить щойно відкриті досягнення в чергу показу
function announceAchievements(list) {
    if (!list || list.length === 0) {
        return;
    }
    for (const ach of list) {
        achievementQueue.push(ach);
    }
    refreshChestButtons();
    refreshAchievementBadge();
    showNextAchievementToast();
}

// ---------- Вікно «Досягнення» ----------

const achTriggerEl = document.getElementById("ach-trigger");
const achModalEl = document.getElementById("ach-modal");
const achListEl = document.getElementById("achList");
const achSummaryEl = document.getElementById("achSummary");
const menuAchCountEl = document.getElementById("menuAchCount");
const btnCloseAch = document.getElementById("btnCloseAch");

function countDoneAchievements() {
    let done = 0;
    for (const ach of ACHIEVEMENTS) {
        if (save.isAchievementDone(ach.id)) {
            done++;
        }
    }
    return done;
}

// Лічильник на кнопці в меню: «7 / 40»
function refreshAchievementBadge() {
    if (menuAchCountEl) {
        menuAchCountEl.textContent = countDoneAchievements() + " / " + ACHIEVEMENTS.length;
    }
}

// Список досягнень групами: отримані підсвічені, інші — з прогресом
function buildAchievementList() {
    if (!achListEl) {
        return;
    }
    const snapshot = save.getAchievementSnapshot();
    achListEl.innerHTML = "";
    let chestsWon = 0;
    for (const group of ACHIEVEMENT_GROUPS) {
        const items = ACHIEVEMENTS.filter(function (a) { return a.group === group.id; });
        if (items.length === 0) {
            continue;
        }
        const doneInGroup = items.filter(function (a) { return save.isAchievementDone(a.id); }).length;
        const heading = document.createElement("h3");
        heading.className = "ach-group-title";
        heading.textContent = group.name + " — " + doneInGroup + " / " + items.length;
        achListEl.appendChild(heading);
        const grid = document.createElement("div");
        grid.className = "ach-grid";
        for (const ach of items) {
            const progress = achievementProgress(ach, snapshot);
            // Уже отримане досягнення лишається отриманим, навіть якщо лічильник згодом змінився
            if (save.isAchievementDone(ach.id)) {
                progress.done = true;
                progress.current = progress.target;
                chestsWon++;
            } else {
                progress.done = false;
            }
            const chest = CHEST_TYPES[ach.chest];
            grid.appendChild(buildAchievementCard(ach, progress, chest ? chest.name : "Сундук"));
        }
        achListEl.appendChild(grid);
    }
    if (achSummaryEl) {
        achSummaryEl.textContent = "🏆 Отримано " + countDoneAchievements() + " з " + ACHIEVEMENTS.length + "   ·   🎁 сундуків за досягнення: " + chestsWon;
    }
}

function openAchievements() {
    buildAchievementList();
    achModalEl.classList.remove("hidden");
    const scroll = achModalEl.querySelector(".list-modal-scroll");
    if (scroll) {
        scroll.scrollTop = 0;
    }
}

function closeAchievements() {
    achModalEl.classList.add("hidden");
}

if (achTriggerEl) {
    achTriggerEl.addEventListener("click", openAchievements);
}

if (btnCloseAch) {
    btnCloseAch.addEventListener("click", closeAchievements);
}

if (achModalEl) {
    achModalEl.addEventListener("click", function (e) {
        if (e.target === achModalEl) {
            closeAchievements();
        }
    });
}

// Плашки показуються по одній, щоб не накладатися
function showNextAchievementToast() {
    if (achievementToastBusy || achievementQueue.length === 0 || !achievementToastsEl) {
        return;
    }
    achievementToastBusy = true;
    const ach = achievementQueue.shift();
    const chest = CHEST_TYPES[ach.chest];
    const toast = buildAchievementToast(ach, chest ? chest.name : "сундук");
    achievementToastsEl.appendChild(toast);
    // Звук лише на першій плашці пачки: наступні з'являються, поки він ще грає
    if (!achievementToastsEl.dataset.batch) {
        achievementToastsEl.dataset.batch = "1";
        playSound("achievement", { volume: 0.8, duration: ACHIEVEMENT_SOUND_TIME });
    }
    const showTime = achievementQueue.length > 0 ? ACHIEVEMENT_TOAST_TIME_QUEUED : ACHIEVEMENT_TOAST_TIME;
    let finished = false;
    function finish() {
        if (finished) {
            return;
        }
        finished = true;
        toast.classList.add("leaving");
        setTimeout(function () {
            toast.remove();
            achievementToastBusy = false;
            if (achievementQueue.length === 0) {
                delete achievementToastsEl.dataset.batch;
            }
            showNextAchievementToast();
        }, 350);
    }
    toast.addEventListener("click", finish);
    setTimeout(finish, showTime);
}

export { achModalEl, announceAchievements, closeAchievements, noteRunForAchievements, refreshAchievementBadge };

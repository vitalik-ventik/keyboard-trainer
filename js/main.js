// ============================================================
// main.js — точка входу
// Ігровий цикл (requestAnimationFrame + кламп delta),
// Менеджер Станів, музика за станом, DOM-оверлеї, введення
// 5 ліг, 31 рівень, розумна клавіатурна індикація
// ============================================================

import { loadAssets, unlockAudio, playSound, playMusic } from "./assets.js";
import { LEVELS_CONFIG, ALL_LEVELS, Engine, save, SKIN_RENDERERS, drawAchievementFrame, DEFAULT_SKIN } from "./engine.js";
import { initKeyboardInput, drawKeyboard, drawTargetPulse } from "./keyboard.js";
import { BackgroundRenderer } from "./backgrounds.js";
import { FrameController, KeyboardCache, BackgroundQuality } from "./cache.js";
import { APP_VERSION, formatVersion, startUpdateWatcher } from "./version.js";
import { SHOP_ITEMS, SHOP_TYPES, computeReward, drawTrail, drawExplosion, drawAccessory } from "./shop.js";

// ---------- Полотно та адаптивність ----------

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let W = 0;
let H = 0;

const frameCtrl = new FrameController();
const kbCache = new KeyboardCache();

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    BackgroundRenderer.init(W, H, H * 0.64);
    kbCache.markDirty();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ---------- DOM-елементи ----------

const overlays = {
    LOADING: document.getElementById("loadingScreen"),
    MENU: document.getElementById("mainMenu"),
    SETTINGS: document.getElementById("settingsModal"),
    LEVEL_SELECT: document.getElementById("levelSelect"),
    GAMEOVER: document.getElementById("gameoverScreen"),
    VICTORY: document.getElementById("victoryScreen")
};

const loadingProgressEl = document.getElementById("loadingProgress");
const levelGridEl = document.getElementById("levelGrid");
const gameoverPctEl = document.getElementById("gameoverPct");
const gameoverScoreEl = document.getElementById("gameoverScore");
const victoryScoreEl = document.getElementById("victoryScore");
const victoryUnlockEl = document.getElementById("victoryUnlock");
const diffHintEl = document.getElementById("diffHint");
const hitWindowHintEl = document.getElementById("hitWindowHint");
const speedHintEl = document.getElementById("speedHint");
const btnStart = document.getElementById("btnStart");
const btnLevels = document.getElementById("btnLevels");
const btnSettings = document.getElementById("btnSettings");
const btnEasy = document.getElementById("btnEasy");
const btnHard = document.getElementById("btnHard");
const btnCloseSettings = document.getElementById("btnCloseSettings");
const btnNormal = document.getElementById("btnNormal");
const btnLarge = document.getElementById("btnLarge");
const btnSpeedSlow = document.getElementById("btnSpeedSlow");
const btnSpeedNormal = document.getElementById("btnSpeedNormal");
const btnSpeedFast = document.getElementById("btnSpeedFast");
const btnLevelsBack = document.getElementById("btnLevelsBack");
const btnCamOn = document.getElementById("btnCamOn");
const btnCamOff = document.getElementById("btnCamOff");
const cameraHintEl = document.getElementById("cameraHint");
const btnRetry = document.getElementById("btnRetry");
const btnGoMenu = document.getElementById("btnGoMenu");
const btnNext = document.getElementById("btnNext");
const btnRetryWin = document.getElementById("btnRetryWin");
const btnWinMenu = document.getElementById("btnWinMenu");
const skinTriggerEl = document.getElementById("skin-selector-trigger");
const activeSkinCanvas = document.getElementById("active-skin-canvas");
const skinsModalEl = document.getElementById("skins-modal");
const skinsGridEl = document.getElementById("skinsGrid");
const btnCloseSkins = document.getElementById("btnCloseSkins");
const shopTriggerEl = document.getElementById("shop-trigger");
const shopModalEl = document.getElementById("shop-modal");
const shopGridEl = document.getElementById("shopGrid");
const shopTabsEl = document.getElementById("shopTabs");
const shopBalanceEl = document.getElementById("shopBalance");
const menuCrystalsEl = document.getElementById("menuCrystals");
const btnCloseShop = document.getElementById("btnCloseShop");
const victoryCrystalsEl = document.getElementById("victoryCrystals");
const gameoverCrystalsEl = document.getElementById("gameoverCrystals");

// ---------- Менеджер Станів ----------

const STATES = ["LOADING", "MENU", "SETTINGS", "LEVEL_SELECT", "PLAYING", "GAMEOVER", "VICTORY"];

const TRANSITIONS = {
    LOADING: ["MENU"],
    MENU: ["SETTINGS", "LEVEL_SELECT", "PLAYING"],
    SETTINGS: ["MENU"],
    LEVEL_SELECT: ["MENU", "PLAYING"],
    PLAYING: ["GAMEOVER", "VICTORY", "MENU"],
    GAMEOVER: ["PLAYING", "MENU"],
    VICTORY: ["PLAYING", "MENU"]
};

const STATE_MUSIC = {
    LOADING: null,
    MENU: "menu",
    SETTINGS: "menu",
    LEVEL_SELECT: "menu",
    PLAYING: "game",
    GAMEOVER: "gameover",
    VICTORY: "win"
};

let state = "LOADING";
let demoEngine = null;
let gameEngine = null;
let currentLevelId = 1;
let currentLeagueId = 1;
let resultRecorded = false;

// Стан помилки клавіатури (in-memory, не серіалізується)
let wrongKeyError = { letter: null, timestamp: 0 };

function setState(next) {
    if (!STATES.includes(next)) {
        console.warn("Невідомий стан: " + next);
        return;
    }
    if (state !== next && TRANSITIONS[state] && !TRANSITIONS[state].includes(next)) {
        console.warn("Заборонений перехід стану: " + state + " → " + next);
        return;
    }
    state = next;

    for (const key of Object.keys(overlays)) {
        overlays[key].classList.add("hidden");
    }
    if (next === "SETTINGS" || next === "LEVEL_SELECT") {
        // Налаштування й вибір рівня — вікна поверх меню
        overlays.MENU.classList.remove("hidden");
        overlays[next].classList.remove("hidden");
    } else if (overlays[next]) {
        overlays[next].classList.remove("hidden");
    }

    if (next === "MENU") {
        renderCurrentSkinIcon();
        refreshCrystalDisplays();
    }

    playMusic(STATE_MUSIC[next]);
}

// ---------- Демо-заставка меню ----------

// Вітрина світів: фон меню по черзі показує вже відкриті світи
const SHOWCASE_INTERVAL = 9;
const SHOWCASE_FADE = 0.5;
let demoLevelId = null;
let demoAge = 0;

function createDemoEngine(levelId) {
    demoLevelId = levelId || save.getLastPlayable();
    demoEngine = new Engine(demoLevelId, "EASY", true, save.getHitWindow(), save.getSpeed());
    demoAge = 0;
}

function nextShowcaseLevel() {
    const unlocked = save.getLastPlayable();
    const current = ALL_LEVELS.find(function (l) { return l.id === demoLevelId; });
    const candidates = ALL_LEVELS.filter(function (l) {
        return l.id <= unlocked && (!current || l.bgTheme !== current.bgTheme);
    });
    if (candidates.length === 0) {
        return demoLevelId;
    }
    return candidates[Math.floor(Math.random() * candidates.length)].id;
}

// ---------- Запуск рівня ----------

function getLevelLeagueInfo(levelId) {
    const level = ALL_LEVELS.find(function (l) { return l.id === levelId; });
    if (!level) return null;
    const league = LEVELS_CONFIG.find(function (lg) { return lg.id === level.leagueId; });
    const levelIdx = league.levels.indexOf(level);
    const levelNumber = level.leagueId + "-" + (levelIdx + 1);
    return {
        leagueName: league.name,
        levelNumber: levelNumber,
        levelName: BackgroundRenderer.worldName(level.bgTheme) || level.name,
        lettersText: level.letters.length === 33 ? "усі 33 літери" : "літери " + level.letters.join(" ")
    };
}

// Підпис рівня для екранів: «1-3: Космодром»
function levelLabel(level) {
    const info = getLevelLeagueInfo(level.id);
    return info ? info.levelNumber + ": " + info.levelName : level.name;
}

function startLevel(levelId) {
    currentLevelId = levelId;
    const level = ALL_LEVELS.find(function (l) { return l.id === levelId; });
    if (level) {
        currentLeagueId = level.leagueId;
    }
    resultRecorded = false;
    wrongKeyError = { letter: null, timestamp: 0 };
    kbCache.markDirty();
    const leagueInfo = getLevelLeagueInfo(levelId);
    gameEngine = new Engine(levelId, save.getDifficulty(), false, save.getHitWindow(), save.getSpeed(), leagueInfo);
    gameEngine.onJump = function () {
        playSound("jump");
    };
    gameEngine.onExplode = function () {
        playSound("explode");
    };
    setState("PLAYING");
}

// ---------- Завершення забігу ----------

function handleGameOver() {
    if (!resultRecorded) {
        resultRecorded = true;
        const runState = gameEngine.getState();
        save.recordResult(currentLevelId, Math.floor(runState.progressPct), runState.score, {
            maxEasy: runState.maxEasy,
            maxHard: runState.maxHard,
            difficulty: runState.difficulty
        });
        // Вибух: зберігається половина кристалів, зібраних у забігу
        const balanceBefore = save.getCrystals();
        const reward = computeReward({
            perfect: runState.runPerfect,
            series: runState.runSeries,
            won: false,
            difficulty: save.getDifficulty(),
            speed: save.getSpeed(),
            hitWindow: save.getHitWindow()
        });
        save.addCrystals(reward.total);
        renderRewardBreakdown(gameoverCrystalsEl, reward, balanceBefore);
        refreshCrystalDisplays();
    }
    const runState = gameEngine.getState();
    gameoverPctEl.textContent = Math.floor(runState.progressPct) + "%";
    gameoverScoreEl.textContent = String(runState.score);
    setState("GAMEOVER");
}

function handleVictory() {
    var victorySkinResult = null;
    const unlockedBefore = save.getLastPlayable();
    if (!resultRecorded) {
        resultRecorded = true;
        const runState = gameEngine.getState();
        const paidBefore = save.getPaid(currentLevelId);
        victorySkinResult = save.recordResult(currentLevelId, 100, runState.score, {
            maxEasy: runState.maxEasy,
            maxHard: runState.maxHard,
            difficulty: runState.difficulty
        });
        // Кристали: стрибки, серії, фініш і разові бонуси рівня
        const wonLevel = ALL_LEVELS.find(function (l) { return l.id === currentLevelId; });
        const achievementNow = save.getLevelAchievement(currentLevelId);
        const balanceBefore = save.getCrystals();
        const reward = computeReward({
            perfect: runState.runPerfect,
            series: runState.runSeries,
            won: true,
            leagueId: wonLevel ? wonLevel.leagueId : 1,
            firstClear: !paidBefore.first,
            newSilver: !!achievementNow && !paidBefore.silver,
            newGold: achievementNow === "hard" && !paidBefore.gold,
            difficulty: save.getDifficulty(),
            speed: save.getSpeed(),
            hitWindow: save.getHitWindow()
        });
        save.addCrystals(reward.total);
        save.markPaid(currentLevelId, {
            first: true,
            silver: !!achievementNow,
            gold: achievementNow === "hard"
        });
        renderRewardBreakdown(victoryCrystalsEl, reward, balanceBefore);
        refreshCrystalDisplays();
    }
    const runState = gameEngine.getState();
    victoryScoreEl.textContent = String(runState.score);

    const currentLevel = ALL_LEVELS.find(function (l) { return l.id === currentLevelId; });
    var skinUnlockText = "";
    if (victorySkinResult && victorySkinResult.skinUnlocked) {
        skinUnlockText = "Розблоковано новий скін: " + victorySkinResult.skinUnlocked.name + "!";
    }
    if (victorySkinResult && victorySkinResult.achievementUnlocked) {
        const achName = victorySkinResult.achievementUnlocked === "hard"
            ? "Золотий Максимум"
            : "Срібний Максимум";
        skinUnlockText = (skinUnlockText ? skinUnlockText + " | " : "") + achName + "!";
    }

    const currentLeague = currentLevel ? LEVELS_CONFIG.find(function (lg) { return lg.id === currentLevel.leagueId; }) : null;
    let nextLevel = null;
    if (currentLevel && currentLeague) {
        const idx = currentLeague.levels.indexOf(currentLevel);
        if (idx >= 0 && idx < currentLeague.levels.length - 1) {
            nextLevel = currentLeague.levels[idx + 1];
        } else if (currentLeague.id < 5) {
            const nextLeague = LEVELS_CONFIG[currentLeague.id];
            if (nextLeague && nextLeague.levels.length > 0) {
                nextLevel = nextLeague.levels[0];
            }
        }
    }

    if (currentLevelId === 31) {
        victoryUnlockEl.textContent = skinUnlockText || "Ти переміг! Усі 31 рівень пройдено! Повний алфавіт освоєно!";
        btnNext.classList.add("hidden");
    } else if (nextLevel && save.getLastPlayable() >= nextLevel.id) {
        // «Відкрито» — лише якщо наступний рівень відкрився саме цією перемогою
        const justUnlocked = nextLevel.id > unlockedBefore;
        const nextText = justUnlocked
            ? "Відкрито: " + levelLabel(nextLevel) + "!"
            : "Наступний рівень: " + levelLabel(nextLevel);
        victoryUnlockEl.textContent = skinUnlockText || nextText;
        btnNext.classList.remove("hidden");
    } else {
        victoryUnlockEl.textContent = skinUnlockText;
        btnNext.classList.add("hidden");
    }
    setState("VICTORY");
}

// ---------- Екран вибору рівня (5 ліг, 31 рівень) ----------

let activeLeagueId = 1;

function buildLeagueTabs() {
    const tabsEl = document.getElementById("leagueTabs");
    if (!tabsEl) return;
    tabsEl.innerHTML = "";
    for (const league of LEVELS_CONFIG) {
        const tab = document.createElement("button");
        tab.className = "league-tab";
        tab.textContent = league.name;
        tab.type = "button";
        if (league.id === activeLeagueId) {
            tab.classList.add("active");
        }
        tab.addEventListener("click", function () {
            activeLeagueId = league.id;
            buildLevelCards();
        });
        tabsEl.appendChild(tab);
    }
}

function buildLevelCards() {
    const progress = save.getProgress();
    buildLeagueTabs();
    levelGridEl.innerHTML = "";
    const league = LEVELS_CONFIG.find(function (lg) { return lg.id === activeLeagueId; });
    if (!league) return;
    let levelIdx = 0;
    for (const level of league.levels) {
        levelIdx++;
        const entry = progress.levels[String(level.id)];
        const locked = level.id > progress.unlocked;

        const card = document.createElement("div");
        card.className = "level-card";
        if (locked) {
            card.classList.add("locked");
        }
        if (level.id === 31) {
            card.classList.add("boss-card");
        }

        // Назва світу рівня; закриті рівні свою назву не показують
        const number = level.leagueId + "-" + levelIdx;
        const worldName = BackgroundRenderer.worldName(level.bgTheme) || level.name;
        const titleEl = document.createElement("div");
        titleEl.className = "level-title";
        titleEl.textContent = locked ? number : number + ": " + worldName;
        card.appendChild(titleEl);

        if (locked) {
            const lockIcon = document.createElement("div");
            lockIcon.className = "level-lock-icon";
            lockIcon.textContent = "\uD83D\uDD12";
            card.appendChild(lockIcon);
        }

        const record = document.createElement("div");
        record.className = "level-record";
        record.textContent = locked
            ? "Рівень ще не відкрито"
            : "Кращий: " + entry.bestPct + "% | HS: " + entry.highScore;
        card.appendChild(record);

        const achievement = save.getLevelAchievement(level.id);
        if (achievement) {
            const star = document.createElement("div");
            star.className = "level-star";
            star.textContent = "★";
            card.insertBefore(star, card.firstChild);
            card.classList.add(achievement === "hard" ? "perfect-gold" : "perfect-silver");
        }

        const lettersPreview = document.createElement("div");
        lettersPreview.className = "level-letters-preview";
        if (level.letters.length === 33) {
            lettersPreview.textContent = "Усі 33 літери";
        } else {
            lettersPreview.textContent = level.letters.join(" ");
        }
        card.appendChild(lettersPreview);

        if (!locked) {
            card.addEventListener("click", function () {
                playSound("click");
                startLevel(level.id);
            });
        }
        levelGridEl.appendChild(card);
    }
}

// ---------- Модалка налаштувань ----------

const DIFF_HINTS = {
    EASY: "EASY: помилки ігноруються, вибух лише при зіткненні з шипом",
    HARD: "HARD: будь-яка помилка чи пропуск таймінгу — миттєвий вибух"
};

function refreshDifficultyButtons() {
    const difficulty = save.getDifficulty();
    btnEasy.classList.toggle("active-easy", difficulty === "EASY");
    btnHard.classList.toggle("active-hard", difficulty === "HARD");
    diffHintEl.textContent = DIFF_HINTS[difficulty];
}

const HIT_WINDOW_HINTS = {
    normal: "NORMAL: стандартний розмір зон «ОК» та «Ідеально»",
    large: "LARGE: подвоєний розмір обох зон — «ОК» та «Ідеально»"
};

function refreshHitWindowButtons() {
    const hitWindow = save.getHitWindow();
    btnNormal.classList.toggle("active-normal", hitWindow === "normal");
    btnLarge.classList.toggle("active-large", hitWindow === "large");
    hitWindowHintEl.textContent = HIT_WINDOW_HINTS[hitWindow] || HIT_WINDOW_HINTS.normal;
}

const SPEED_HINTS = {
    slow: "SLOW: швидкість зменшена на 25% — більше часу на реакцію",
    normal: "NORMAL: стандартна швидкість рівня",
    fast: "FAST: швидкість збільшена на 25% — для досвідчених гравців"
};

function refreshSpeedButtons() {
    const speed = save.getSpeed();
    btnSpeedSlow.classList.toggle("active-slow", speed === "slow");
    btnSpeedNormal.classList.toggle("active-normal", speed === "normal");
    btnSpeedFast.classList.toggle("active-fast", speed === "fast");
    speedHintEl.textContent = SPEED_HINTS[speed] || SPEED_HINTS.normal;
}

const CAMERA_HINTS = {
    on: "УВІМК: камера стежить за стрибком, екран струшується при вибуху",
    off: "ВИМК: камера нерухома — для тих, кого заколисує"
};

function refreshCameraButtons() {
    const on = save.getCameraMotion();
    btnCamOn.classList.toggle("active-on", on);
    btnCamOff.classList.toggle("active-off", !on);
    cameraHintEl.textContent = on ? CAMERA_HINTS.on : CAMERA_HINTS.off;
}

// ---------- Кнопки ----------

btnStart.addEventListener("click", function () {
    startLevel(save.getLastPlayable());
});

btnLevels.addEventListener("click", function () {
    // Відкриваємо лігу останнього зіграного рівня, а не завжди першу
    activeLeagueId = currentLeagueId;
    buildLevelCards();
    setState("LEVEL_SELECT");
});

btnSettings.addEventListener("click", function () {
    refreshDifficultyButtons();
    refreshHitWindowButtons();
    refreshSpeedButtons();
    refreshCameraButtons();
    setState("SETTINGS");
});

btnEasy.addEventListener("click", function () {
    save.setDifficulty("EASY");
    refreshDifficultyButtons();
    createDemoEngine();
});

btnHard.addEventListener("click", function () {
    save.setDifficulty("HARD");
    refreshDifficultyButtons();
    createDemoEngine();
});

btnCloseSettings.addEventListener("click", function () {
    createDemoEngine();
    setState("MENU");
});

btnNormal.addEventListener("click", function () {
    save.setHitWindow("normal");
    refreshHitWindowButtons();
    createDemoEngine();
});

btnLarge.addEventListener("click", function () {
    save.setHitWindow("large");
    refreshHitWindowButtons();
    createDemoEngine();
});

btnSpeedSlow.addEventListener("click", function () {
    save.setSpeed("slow");
    refreshSpeedButtons();
    createDemoEngine();
});

btnSpeedNormal.addEventListener("click", function () {
    save.setSpeed("normal");
    refreshSpeedButtons();
    createDemoEngine();
});

btnSpeedFast.addEventListener("click", function () {
    save.setSpeed("fast");
    refreshSpeedButtons();
    createDemoEngine();
});

btnCamOn.addEventListener("click", function () {
    save.setCameraMotion(true);
    refreshCameraButtons();
    createDemoEngine();
});

btnCamOff.addEventListener("click", function () {
    save.setCameraMotion(false);
    refreshCameraButtons();
    createDemoEngine();
});

btnLevelsBack.addEventListener("click", function () {
    setState("MENU");
});

// Клік поза вікном вибору рівня закриває його
overlays.LEVEL_SELECT.addEventListener("click", function (e) {
    if (e.target === overlays.LEVEL_SELECT) {
        btnLevelsBack.click();
    }
});

btnRetry.addEventListener("click", function () {
    startLevel(currentLevelId);
});

btnGoMenu.addEventListener("click", function () {
    createDemoEngine();
    setState("MENU");
});

btnNext.addEventListener("click", function () {
    const currentLevel = ALL_LEVELS.find(function (l) { return l.id === currentLevelId; });
    if (currentLevel) {
        const league = LEVELS_CONFIG.find(function (lg) { return lg.id === currentLevel.leagueId; });
        if (league) {
            const idx = league.levels.indexOf(currentLevel);
            if (idx >= 0 && idx < league.levels.length - 1) {
                const nextId = league.levels[idx + 1].id;
                if (save.getLastPlayable() >= nextId) {
                    startLevel(nextId);
                }
                return;
            }
        }
    }
    const nextId = currentLevelId + 1;
    if (nextId <= 31 && save.getLastPlayable() >= nextId) {
        startLevel(nextId);
    }
});

btnRetryWin.addEventListener("click", function () {
    startLevel(currentLevelId);
});

btnWinMenu.addEventListener("click", function () {
    createDemoEngine();
    setState("MENU");
});

document.addEventListener("click", function (event) {
    if (event.target && event.target.closest("button")) {
        playSound("click");
    }
});

function firstGestureUnlock() {
    unlockAudio();
}
window.addEventListener("pointerdown", firstGestureUnlock);
window.addEventListener("keydown", firstGestureUnlock);

// ---------- Введення з клавіатури (з wrongKeyError) ----------

initKeyboardInput(
    function (letter) {
        if (state === "PLAYING" && gameEngine) {
            wrongKeyError.letter = null;
            const outcome = gameEngine.handleLetter(letter);
            if (outcome.result === "wrong") {
                wrongKeyError = { letter: letter, timestamp: performance.now() };
            }
        }
    },
    function () {
        if (state === "GAMEOVER") {
            btnRetry.click();
        } else if (state === "VICTORY") {
            if (!btnNext.classList.contains("hidden")) {
                btnNext.click();
            } else {
                btnRetryWin.click();
            }
        }
    },
    function () {
        handleEscape();
    }
);

// Esc: закриває відкрите вікно або повертає до головного меню (зокрема з рівня — без запису результату)
function handleEscape() {
    if (!shopModalEl.classList.contains("hidden")) {
        closeShop();
        return;
    }
    if (!skinsModalEl.classList.contains("hidden")) {
        skinsModalEl.classList.add("hidden");
        return;
    }
    if (state === "SETTINGS") {
        btnCloseSettings.click();
    } else if (state === "LEVEL_SELECT") {
        btnLevelsBack.click();
    } else if (state === "GAMEOVER") {
        btnGoMenu.click();
    } else if (state === "VICTORY") {
        btnWinMenu.click();
    } else if (state === "PLAYING") {
        wrongKeyError = { letter: null, timestamp: 0 };
        createDemoEngine();
        setState("MENU");
    }
}

// ---------- Автоматичне оновлення гри ----------

// Підпис версії в налаштуваннях
const versionLineEl = document.getElementById("versionLine");
if (versionLineEl) {
    versionLineEl.textContent = "Версія: " + formatVersion(APP_VERSION);
}

// Нова версія підхоплюється лише в меню, щоб не перервати рівень чи екран результату
startUpdateWatcher(function () {
    return state === "MENU" || state === "LEVEL_SELECT" || state === "SETTINGS";
});

// ---------- Пауза при прихованій вкладці ----------

document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        frameCtrl.reset();
    }
});

// ---------- Ігровий цикл ----------

const appStart = performance.now();

function frame(now) {
    requestAnimationFrame(frame);
    const dtMs = now - (frameCtrl.lastTime || now);
    if (frameCtrl.shouldSkip(dtMs, now)) {
        return;
    }
    const dt = frameCtrl.clampDt(dtMs);
    frameCtrl.advance(now);
    if (!document.hidden) {
        BackgroundQuality.report(dtMs);
    }
    const time = (now - appStart) / 1000;

    ctx.clearRect(0, 0, W, H);

    if (state === "LOADING") {
        return;
    }

    if (state === "MENU" || state === "SETTINGS" || state === "LEVEL_SELECT") {
        if (demoEngine) {
            demoAge += dt;
            if (demoAge >= SHOWCASE_INTERVAL) {
                createDemoEngine(nextShowcaseLevel());
            }
            demoEngine.update(dt);
            demoEngine.render(ctx, W, H, time);
            // Плавний перехід між світами: затемнення наприкінці й на початку показу
            const fade = Math.max(
                0,
                1 - demoAge / SHOWCASE_FADE,
                1 - (SHOWCASE_INTERVAL - demoAge) / SHOWCASE_FADE
            );
            if (fade > 0) {
                ctx.fillStyle = "rgba(2, 3, 10, " + Math.min(1, fade).toFixed(3) + ")";
                ctx.fillRect(0, 0, W, H);
            }
        }
        return;
    }

    if (gameEngine) {
        gameEngine.update(dt);
        gameEngine.render(ctx, W, H, time);

        if (state === "PLAYING" || state === "GAMEOVER") {
            if (wrongKeyError.letter !== null && (performance.now() - wrongKeyError.timestamp) > 350) {
                wrongKeyError.letter = null;
            }

            const keyboardArea = {
                x: W * 0.04,
                y: H * 0.70,
                w: W * 0.92,
                h: H * 0.28
            };
            var tarLetter = gameEngine.getTargetLetter();
            var grpLetters = gameEngine.level.letters;
            var wrongLetter = wrongKeyError.letter;
            // Розмір перевіряється щокадру: після зміни розміру вікна клавіатура одразу перемальовується
            kbCache.resize(keyboardArea.w, keyboardArea.h, window.devicePixelRatio || 1);
            if (kbCache.shouldUpdate(tarLetter, grpLetters, wrongLetter)) {
                kbCache.setState(tarLetter, grpLetters, wrongLetter);
                kbCache.render(function (cacheCtx) {
                    drawKeyboard(
                        cacheCtx,
                        { x: 0, y: 0, w: keyboardArea.w, h: keyboardArea.h },
                        grpLetters,
                        tarLetter,
                        wrongKeyError,
                        time
                    );
                });
            }
            kbCache.drawImage(ctx, keyboardArea.x, keyboardArea.y);
            if (state === "PLAYING" && wrongLetter === null) {
                drawTargetPulse(ctx, keyboardArea, tarLetter, time);
            }

            if (state === "PLAYING") {
                const outcome = gameEngine.getOutcome();
                if (outcome === "dead") {
                    handleGameOver();
                } else if (outcome === "won") {
                    handleVictory();
                }
            }
        }
    }
}

requestAnimationFrame(frame);

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

// ---------- Кристали: відображення й розбивка нагороди ----------

function refreshCrystalDisplays() {
    const balance = String(save.getCrystals());
    if (menuCrystalsEl) {
        menuCrystalsEl.textContent = balance;
    }
    if (shopBalanceEl) {
        shopBalanceEl.textContent = balance;
    }
}

function addBreakdownRow(el, label, value, extraClass) {
    const l = document.createElement("span");
    l.textContent = label;
    const v = document.createElement("span");
    v.className = "cb-value";
    v.textContent = value;
    if (extraClass) {
        l.classList.add(extraClass);
        v.classList.add(extraClass);
    }
    el.appendChild(l);
    el.appendChild(v);
}

// Показує, за що нараховано кристали, та підказує, на що тепер вистачає
function renderRewardBreakdown(el, reward, balanceBefore) {
    if (!el) {
        return;
    }
    el.innerHTML = "";
    for (const line of reward.lines) {
        addBreakdownRow(el, "💎 " + line.label, "+" + line.value);
    }
    if (reward.mult !== 1) {
        addBreakdownRow(el, "Множник налаштувань", "×" + reward.mult);
    }
    if (reward.half) {
        addBreakdownRow(el, "Вибух — лишається половина", "÷2");
    }
    const balanceAfter = balanceBefore + reward.total;
    addBreakdownRow(el, "Разом (усього " + balanceAfter + ")", "+" + reward.total + " 💎", "cb-total");
    const newlyAffordable = SHOP_ITEMS.filter(function (item) {
        return item.price > balanceBefore && item.price <= balanceAfter && !save.isOwned(item.id);
    });
    if (newlyAffordable.length > 0) {
        const note = document.createElement("span");
        note.className = "cb-note";
        note.textContent = "Тепер вистачає на: " + newlyAffordable.slice(0, 2).map(function (i) { return i.name; }).join(", ") + "!";
        el.appendChild(note);
    }
}

// ---------- Магазин ----------

let activeShopType = "trail";
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

function buildShop() {
    refreshCrystalDisplays();
    buildShopTabs();
    shopGridEl.innerHTML = "";
    shopPreviews = [];
    const balance = save.getCrystals();
    const equipped = save.getEquipped(activeShopType);
    for (const item of SHOP_ITEMS) {
        if (item.type !== activeShopType) {
            continue;
        }
        const owned = save.isOwned(item.id);
        const isEquipped = equipped === item.id;
        const card = document.createElement("div");
        card.className = "skin-card shop-card" + (isEquipped ? " active" : "");

        const canvas = document.createElement("canvas");
        canvas.className = "skin-preview";
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(150 * dpr);
        canvas.height = Math.round(100 * dpr);
        canvas.style.width = "150px";
        canvas.style.height = "100px";
        card.appendChild(canvas);
        shopPreviews.push({ canvas: canvas, item: item, dpr: dpr });

        const name = document.createElement("span");
        name.className = "skin-card-name";
        name.textContent = item.name;
        card.appendChild(name);

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
        } else if (balance >= item.price) {
            if (confirmItemId === item.id) {
                btn.classList.add("confirm");
                btn.textContent = "ТОЧНО? 💎 " + item.price;
            } else {
                btn.textContent = "КУПИТИ 💎 " + item.price;
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
                }
                renderCurrentSkinIcon();
                buildShop();
            });
        } else {
            btn.classList.add("poor");
            btn.textContent = "Ще " + (item.price - balance) + " 💎";
            btn.disabled = true;
        }
        card.appendChild(btn);
        shopGridEl.appendChild(card);
    }
}

// Живий попередній перегляд товару на кубику з поточним скіном
function drawShopPreview(entry, now) {
    const c = entry.canvas;
    const pctx = c.getContext("2d");
    const w = 150;
    const h = 100;
    pctx.setTransform(entry.dpr, 0, 0, entry.dpr, 0, 0);
    pctx.fillStyle = "#070b1c";
    pctx.fillRect(0, 0, w, h);
    const groundY = h * 0.82;
    pctx.fillStyle = "#12203a";
    pctx.fillRect(0, groundY, w, h - groundY);
    pctx.fillStyle = "#00f6ff";
    pctx.fillRect(0, groundY, w, 2);

    // Аксесуари показуємо на більшому кубику, щоб було видно деталі
    const size = entry.item.type === "accessory" ? 46 : entry.item.type === "explosion" ? 34 : 30;
    const skinType = save.getActiveSkin();
    const skinFn = SKIN_RENDERERS[skinType] || SKIN_RENDERERS.neon_base;
    const accessory = entry.item.type === "accessory" ? entry.item.id : save.getEquipped("accessory");
    const item = entry.item;
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

// ---------- Старт застосунку ----------

save.load();
refreshCrystalDisplays();
currentLevelId = save.getLastPlayable();
currentLeagueId = (ALL_LEVELS.find(function (l) { return l.id === currentLevelId; }) || { leagueId: 1 }).leagueId;

loadAssets(function (loaded, total) {
    loadingProgressEl.textContent = loaded + " / " + total;
}).then(function () {
    createDemoEngine();
    setState("MENU");
});

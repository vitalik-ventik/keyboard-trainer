// ============================================================
// main.js — точка входу
// Ігровий цикл (requestAnimationFrame + кламп delta),
// Менеджер Станів, музика за станом, DOM-оверлеї, введення
// 5 ліг, 31 рівень, розумна клавіатурна індикація.
// Вікна скінів і магазину, досягнень, сундуків і показ монет — у js/ui/
// ============================================================

import { audioFileCount, loadAssets, playMusic, playSound, unlockAudio } from "./assets.js";
import { ALL_LEVELS, BOSS_LEVEL_ID, COMBO_KINDS, Engine, LEVELS_CONFIG, levelOrderIndex, nextLevelOf, save } from "./engine.js";
import { drawKeyboard, drawTargetPulse, initKeyboardInput } from "./keyboard.js";
import { BackgroundRenderer } from "./backgrounds.js";
import { BackgroundQuality, FrameController, KeyboardCache } from "./cache.js";
import { APP_VERSION, formatVersion, startUpdateWatcher } from "./version.js";
import { accessoryPerk, chestsForVictory, computeReward, drawHeartLife, heartsText } from "./shop.js";
import { closeShop, renderCurrentSkinIcon, shopModalEl, skinsModalEl } from "./ui/shop.js";
import { achModalEl, announceAchievements, closeAchievements, noteRunForAchievements, refreshAchievementBadge } from "./ui/achievements.js";
import { refreshCrystalDisplays, renderRewardBreakdown, showRetroNotice } from "./ui/coins.js";
import { chestModalEl, chestPrimaryAction, closeChestModal, refreshChestButtons } from "./ui/chests.js";

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
// Мелодії результату (перемога, вибух) звучать один раз, а не по колу:
// якщо гравець лишив екран результату відкритим, далі — тиша
const ONE_SHOT_MUSIC = { win: true, gameover: true };

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

    if (next === "SETTINGS") {
        refreshWeakLetters();
    }
    if (next === "MENU") {
        renderCurrentSkinIcon();
        refreshCrystalDisplays();
        refreshChestButtons();
    }

    playMusic(STATE_MUSIC[next], !ONE_SHOT_MUSIC[STATE_MUSIC[next]]);
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
    const current = ALL_LEVELS.find(function (l) { return l.id === demoLevelId; });
    const candidates = ALL_LEVELS.filter(function (l) {
        return save.isLevelUnlocked(l.id) && (!current || l.bgTheme !== current.bgTheme);
    });
    if (candidates.length === 0) {
        return demoLevelId;
    }
    return candidates[Math.floor(Math.random() * candidates.length)].id;
}

// ---------- Запуск рівня ----------

// Підпис літер рівня: звичайні літери, слова або «твої найважчі літери»
function levelLettersText(level) {
    if (level.adaptive) {
        return "твої найважчі літери";
    }
    if (level.combo && COMBO_KINDS[level.combo]) {
        return COMBO_KINDS[level.combo].name.toLowerCase() + " з літер " + level.letters.join(" ");
    }
    if (Array.isArray(level.words)) {
        return "слова з літер " + level.letters.join(" ");
    }
    return level.letters.length === 33 ? "усі 33 літери" : "літери " + level.letters.join(" ");
}

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
        lettersText: levelLettersText(level)
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
    gameEngine.onSound = function (cue) {
        playSound(cue.sound, cue);
    };
    gameEngine.onExplode = function () {
        playSound("explode");
    };
    // Помилка, а в запасі є сердечко: гра на паузі й питає, чи використати його
    gameEngine.onReviveOffer = function (count) {
        openReviveModal(count);
    };
    setState("PLAYING");
    // Рівень починається на паузі: можна роздивитися літери й приготуватися, старт — Пробілом
    gameEngine.pauseGame("start");
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
        save.recordLetterStats(gameEngine.getLetterStats());
        noteRunForAchievements(runState, false);
        // Вибух: зберігається половина монет, зібраних у забігу
        const balanceBefore = save.getCrystals();
        const reward = computeReward({
            hits: runState.runHits,
            words: runState.runWords,
            combos: runState.runCombos,
            wordsMult: runState.wordsMult,
            perfect: runState.runPerfect,
            series: runState.runSeries,
            weapon: runState.weapon,
            weaponId: runState.weaponId,
            accessoryId: save.getEquipped("accessory"),
            won: false,
            difficulty: save.getDifficulty(),
            speed: save.getSpeed(),
            hitWindow: save.getHitWindow()
        });
        save.addCrystals(reward.total);
        renderRewardBreakdown(gameoverCrystalsEl, reward, balanceBefore);
        refreshCrystalDisplays();
        announceAchievements(save.checkAchievements());
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
        save.recordLetterStats(gameEngine.getLetterStats());
        noteRunForAchievements(runState, true);
        // Монети: стрибки, серії, фініш і разові бонуси рівня
        const wonLevel = ALL_LEVELS.find(function (l) { return l.id === currentLevelId; });
        const achievementNow = save.getLevelAchievement(currentLevelId);
        const balanceBefore = save.getCrystals();
        const reward = computeReward({
            hits: runState.runHits,
            words: runState.runWords,
            combos: runState.runCombos,
            wordsMult: runState.wordsMult,
            perfect: runState.runPerfect,
            series: runState.runSeries,
            weapon: runState.weapon,
            weaponId: runState.weaponId,
            accessoryId: save.getEquipped("accessory"),
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
        // Сундуки за перемогу: перше проходження, нова рамка або щасливий повтор
        const drop = chestsForVictory({
            firstClear: !paidBefore.first,
            leagueId: wonLevel ? wonLevel.leagueId : 1,
            newSilver: !!achievementNow && !paidBefore.silver,
            newGold: achievementNow === "hard" && !paidBefore.gold,
            winsWithoutChest: save.getWinsWithoutChest(),
            chestBonus: accessoryPerk(save.getEquipped("accessory")).chest || 0
        });
        save.setWinsWithoutChest(drop.winsWithoutChest);
        save.addChests(drop.chests);
        refreshCrystalDisplays();
        // Досягнення перевіряємо після всіх нарахувань: рамки, ліги, зібрані предмети
        announceAchievements(save.checkAchievements());
    }
    refreshChestButtons();
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

    const nextLevel = nextLevelOf(currentLevelId);

    if (currentLevelId === BOSS_LEVEL_ID) {
        victoryUnlockEl.textContent = skinUnlockText || "Ти переміг! Усі рівні пройдено! Повний алфавіт освоєно!";
        btnNext.classList.add("hidden");
    } else if (nextLevel && save.isLevelUnlocked(nextLevel.id)) {
        // «Відкрито» — лише якщо наступний рівень відкрився саме цією перемогою
        const justUnlocked = levelOrderIndex(nextLevel.id) > levelOrderIndex(unlockedBefore);
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
        const locked = !save.isLevelUnlocked(level.id);

        const card = document.createElement("div");
        card.className = "level-card";
        if (locked) {
            card.classList.add("locked");
        }
        if (level.id === BOSS_LEVEL_ID) {
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
        if (level.adaptive) {
            lettersPreview.textContent = "Твої найважчі літери";
        } else if (level.combo && COMBO_KINDS[level.combo]) {
            lettersPreview.textContent = COMBO_KINDS[level.combo].name + ": " + level.words.slice(0, 4).join(" ") + "…";
        } else if (Array.isArray(level.words)) {
            lettersPreview.textContent = "Слова: " + level.words.slice(0, 3).join(", ") + "…";
        } else if (level.letters.length === 33) {
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

// «Почати заново»: перше натискання питає «ТОЧНО?», друге (протягом 4 с) стирає прогрес
const btnResetProgress = document.getElementById("btnResetProgress");
let resetArmedUntil = 0;
if (btnResetProgress) {
    btnResetProgress.addEventListener("click", function () {
        const now = Date.now();
        if (now > resetArmedUntil) {
            resetArmedUntil = now + 4000;
            btnResetProgress.textContent = "ТОЧНО? НАТИСНИ ЩЕ РАЗ";
            setTimeout(function () {
                if (Date.now() >= resetArmedUntil) {
                    btnResetProgress.textContent = "🗑 ПОЧАТИ ЗАНОВО";
                }
            }, 4100);
            return;
        }
        save.resetProgress();
        window.location.reload();
    });
}

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
    const next = nextLevelOf(currentLevelId);
    if (next && save.isLevelUnlocked(next.id)) {
        startLevel(next.id);
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
    // Пробіл: у грі — пауза / продовження; на екранах результату й сундука — «далі»
    function () {
        if (isReviveOpen()) {
            // Сердечко підтверджується лише Enter, щоб не використати його випадково
            return;
        }
        if (state === "PLAYING" && gameEngine) {
            togglePause();
            return;
        }
        confirmResultScreen();
    },
    function () {
        handleEscape();
    },
    // Enter: використати сердечко; на екранах результату й сундука — те саме, що Пробіл
    function () {
        if (isReviveOpen()) {
            acceptRevive();
            return;
        }
        if (state !== "PLAYING") {
            confirmResultScreen();
        }
    }
);

function confirmResultScreen() {
    if (!chestModalEl.classList.contains("hidden")) {
        chestPrimaryAction();
        return;
    }
    if (state === "GAMEOVER") {
        btnRetry.click();
    } else if (state === "VICTORY") {
        if (!btnNext.classList.contains("hidden")) {
            btnNext.click();
        } else {
            btnRetryWin.click();
        }
    }
}

// Пауза гравця: Пробілом, дотиком до екрана або коли вкладку сховано
function togglePause() {
    if (!gameEngine || isReviveOpen()) {
        return;
    }
    if (gameEngine.isUserPaused()) {
        gameEngine.resumeGame();
    } else {
        gameEngine.pauseGame("user");
    }
    kbCache.markDirty();
}

// Дотик або клік по ігровому полю під час паузи — продовжити (зручно на планшеті)
canvas.addEventListener("pointerdown", function () {
    if (state === "PLAYING" && gameEngine && gameEngine.isUserPaused() && !isReviveOpen()) {
        togglePause();
    }
});

// ---------- Сердечко: друге життя ----------

const reviveModalEl = document.getElementById("reviveModal");
const reviveCountEl = document.getElementById("reviveCount");
const reviveHeartCanvas = document.getElementById("reviveHeart");

function isReviveOpen() {
    return reviveModalEl && !reviveModalEl.classList.contains("hidden");
}

function openReviveModal(count) {
    reviveCountEl.textContent = heartsText(count);
    const hctx = reviveHeartCanvas.getContext("2d");
    hctx.clearRect(0, 0, reviveHeartCanvas.width, reviveHeartCanvas.height);
    drawHeartLife(hctx, 36, 36, 52, 0);
    reviveModalEl.classList.remove("hidden");
}

function closeReviveModal() {
    reviveModalEl.classList.add("hidden");
}

function acceptRevive() {
    if (!isReviveOpen()) {
        return;
    }
    closeReviveModal();
    if (gameEngine) {
        gameEngine.acceptRevive();
    }
    playSound("chest_item", { volume: 0.7 });
}

function declineRevive() {
    if (!isReviveOpen()) {
        return;
    }
    closeReviveModal();
    if (gameEngine) {
        gameEngine.declineRevive();
    }
}

document.getElementById("btnReviveYes").addEventListener("click", acceptRevive);
document.getElementById("btnReviveNo").addEventListener("click", declineRevive);

// Esc: закриває відкрите вікно або повертає до головного меню (зокрема з рівня — без запису результату)
function handleEscape() {
    if (isReviveOpen()) {
        declineRevive();
        return;
    }
    if (!chestModalEl.classList.contains("hidden")) {
        closeChestModal();
        return;
    }
    if (!shopModalEl.classList.contains("hidden")) {
        closeShop();
        return;
    }
    if (achModalEl && !achModalEl.classList.contains("hidden")) {
        closeAchievements();
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

// Найскладніші літери гравця (за статистикою помилок) — у налаштуваннях
function refreshWeakLetters() {
    const el = document.getElementById("weakLettersLine");
    if (!el) {
        return;
    }
    const report = save.getLetterReport(5);
    el.textContent = "";
    if (report.length === 0) {
        el.textContent = "Найважчі літери: ще мало даних — пограй кілька рівнів";
        return;
    }
    // Компактні плашки «Літера — % помилок», що переносяться рядками
    const title = document.createElement("span");
    title.className = "weak-title";
    title.textContent = "Найважчі літери (% помилок):";
    el.appendChild(title);
    const row = document.createElement("span");
    row.className = "weak-chips";
    for (const r of report) {
        const chip = document.createElement("span");
        chip.className = "weak-chip";
        const letter = document.createElement("b");
        letter.textContent = r.letter;
        chip.appendChild(letter);
        chip.appendChild(document.createTextNode(" " + r.missPct + "%"));
        row.appendChild(chip);
    }
    el.appendChild(row);
}

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
        // Вкладку сховано посеред рівня — ставимо на паузу, щоб не програти за відсутності
        if (state === "PLAYING" && gameEngine && !gameEngine.isUserPaused()) {
            gameEngine.pauseGame("user");
        }
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
            // На паузі ціль не підсвічується: видно всі літери рівня, щоб роздивитися їх
            var tarLetter = gameEngine.paused ? null : gameEngine.getTargetLetter();
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

// ---------- Старт застосунку ----------

save.load();
showRetroNotice(save.grantRetroactive());
refreshCrystalDisplays();
currentLevelId = save.getLastPlayable();
currentLeagueId = (ALL_LEVELS.find(function (l) { return l.id === currentLevelId; }) || { leagueId: 1 }).leagueId;

// Загальна кількість файлів відома одразу — лічильник не «стрибає» з кількості в розмітці
loadingProgressEl.textContent = "0 / " + audioFileCount();
loadAssets(function (loaded, total) {
    loadingProgressEl.textContent = loaded + " / " + total;
}).then(function () {
    createDemoEngine();
    setState("MENU");
    // Сьогоднішній день гри й досягнення, вже виконані раніше (ліги, рамки, предмети)
    save.markPlayDay();
    announceAchievements(save.checkAchievements());
    refreshChestButtons();
    refreshAchievementBadge();
});

export { gameEngine };

// ============================================================
// main.js — точка входу
// Ігровий цикл (requestAnimationFrame + кламп delta),
// Менеджер Станів, музика за станом, DOM-оверлеї, введення
// 5 ліг, 31 рівень, розумна клавіатурна індикація
// ============================================================

import { loadAssets, unlockAudio, playSound, playMusic, audioFileCount } from "./assets.js";
import { LEVELS_CONFIG, ALL_LEVELS, COMBO_KINDS, Engine, save, levelSkinPerk, SKIN_RENDERERS, drawAchievementFrame, DEFAULT_SKIN, BOSS_LEVEL_ID, levelOrderIndex, nextLevelOf } from "./engine.js";
import { initKeyboardInput, drawKeyboard, drawTargetPulse } from "./keyboard.js";
import { BackgroundRenderer } from "./backgrounds.js";
import { FrameController, KeyboardCache, BackgroundQuality } from "./cache.js";
import { APP_VERSION, formatVersion, startUpdateWatcher } from "./version.js";
import { SHOP_ITEMS, SHOP_TYPES, getShopItem, computeReward, drawAccessory, CHEST_TYPES, chestsForVictory, itemRarity, coinsText, heartsText, drawHeartLife, weaponCoinBonus, accessoryPerk, itemPerkText, itemPerkHint, shopTabHints, skinPerkText, levelSkinPerkHint } from "./shop.js";
import { drawShopItemScene, drawShopSkinScene, drawChestScene, CHEST_SHAKE_MS, CHEST_OPEN_MS } from "./shop_preview.js";
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS, achievementProgress, buildAchievementCard, buildAchievementToast } from "./achievements.js";

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

    if (next === "SETTINGS") {
        refreshWeakLetters();
    }
    if (next === "MENU") {
        renderCurrentSkinIcon();
        refreshCrystalDisplays();
        refreshChestButtons();
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
    function () {
        if (isReviveOpen()) {
            acceptRevive();
            return;
        }
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
    },
    function () {
        handleEscape();
    }
);

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
    el.textContent = report.length === 0
        ? "Найважчі літери: ще мало даних — пограй кілька рівнів"
        : "Найважчі літери: " + report.map(function (r) { return r.letter + " (" + r.missPct + "% помилок)"; }).join(", ");
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

// ---------- Монети: відображення й розбивка нагороди ----------

// Повідомлення в меню про монети, нараховані задним числом за вже пройдені рівні
function showRetroNotice(result) {
    const el = document.getElementById("retroNotice");
    if (!el || !result || result.total <= 0) {
        return;
    }
    el.textContent = "🪙 +" + result.total + " за вже пройдені рівні (" + result.levels + ")! Заглянь у магазин.";
    el.classList.remove("hidden");
    el.addEventListener("click", function () {
        el.classList.add("hidden");
    });
    setTimeout(function () {
        el.classList.add("hidden");
    }, 12000);
}

// Текст замка легендарного товару: «🔒 Золоті рамки 3/10»
function requirementLabel(progress) {
    if (progress.target > 1) {
        return "🔒 " + progress.text + " " + progress.current + "/" + progress.target;
    }
    return "🔒 " + progress.text;
}

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

// Показує, за що нараховано монети, та підказує, на що тепер вистачає
function renderRewardBreakdown(el, reward, balanceBefore) {
    if (!el) {
        return;
    }
    el.innerHTML = "";
    // Спершу монети забігу й множники до них, потім разові бонуси рівня (без множників)
    for (const line of reward.lines) {
        if (!line.flat) {
            addBreakdownRow(el, "🪙 " + line.label, "+" + line.value);
        }
    }
    if (reward.mult !== 1) {
        addBreakdownRow(el, "Множник налаштувань", "×" + reward.mult);
    }
    if (reward.weaponMult && reward.weaponMult !== 1) {
        addBreakdownRow(el, "Бонус зброї", "×" + reward.weaponMult);
    }
    if (reward.accessoryMult && reward.accessoryMult !== 1) {
        addBreakdownRow(el, "Бонус аксесуара", "×" + Math.round(reward.accessoryMult * 100) / 100);
    }
    for (const line of reward.lines) {
        if (line.flat) {
            addBreakdownRow(el, "🎖 " + line.label, "+" + line.value);
        }
    }
    if (reward.half) {
        addBreakdownRow(el, "Вибух — лишається половина", "÷2");
    }
    const balanceAfter = balanceBefore + reward.total;
    addBreakdownRow(el, "Разом (усього " + balanceAfter + ")", "+" + reward.total + " 🪙", "cb-total");
    const newlyAffordable = SHOP_ITEMS.filter(function (item) {
        return item.price > balanceBefore && item.price <= balanceAfter && !save.isOwned(item.id) &&
            save.getRequirementProgress(item).met;
    });
    if (newlyAffordable.length > 0) {
        const note = document.createElement("span");
        note.className = "cb-note";
        note.textContent = "Тепер вистачає на: " + newlyAffordable.slice(0, 2).map(function (i) { return i.name; }).join(", ") + "!";
        el.appendChild(note);
    }
}

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

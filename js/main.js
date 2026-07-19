// ============================================================
// main.js — точка входу
// Ігровий цикл (requestAnimationFrame + кламп delta),
// Менеджер Станів, музика за станом, DOM-оверлеї, введення
// 5 ліг, 31 рівень, розумна клавіатурна індикація
// ============================================================

import { loadAssets, unlockAudio, playSound, playMusic } from "./assets.js";
import { LEVELS_CONFIG, ALL_LEVELS, Engine, save } from "./engine.js";
import { initKeyboardInput, drawKeyboard } from "./keyboard.js";
import { BackgroundRenderer } from "./backgrounds.js";

// ---------- Полотно та адаптивність ----------

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let W = 0;
let H = 0;

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    BackgroundRenderer.init(W, H, H * 0.64);
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
const btnRetry = document.getElementById("btnRetry");
const btnGoMenu = document.getElementById("btnGoMenu");
const btnNext = document.getElementById("btnNext");
const btnRetryWin = document.getElementById("btnRetryWin");
const btnWinMenu = document.getElementById("btnWinMenu");

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
    if (next === "SETTINGS") {
        overlays.MENU.classList.remove("hidden");
        overlays.SETTINGS.classList.remove("hidden");
    } else if (overlays[next]) {
        overlays[next].classList.remove("hidden");
    }

    playMusic(STATE_MUSIC[next]);
}

// ---------- Демо-заставка меню ----------

function createDemoEngine() {
    demoEngine = new Engine(save.getLastPlayable(), "EASY", true, save.getHitWindow(), save.getSpeed());
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
        levelName: level.name
    };
}

function startLevel(levelId) {
    currentLevelId = levelId;
    const level = ALL_LEVELS.find(function (l) { return l.id === levelId; });
    if (level) {
        currentLeagueId = level.leagueId;
    }
    resultRecorded = false;
    wrongKeyError = { letter: null, timestamp: 0 };
    const leagueInfo = getLevelLeagueInfo(levelId);
    gameEngine = new Engine(levelId, save.getDifficulty(), false, save.getHitWindow(), save.getSpeed(), leagueInfo);
    gameEngine.onJump = function () {
        playSound("jump");
    };
    gameEngine.onExplode = function () {
        playSound("explode");
    };
    gameEngine.onVictory = function () {
        playSound("victory");
    };
    setState("PLAYING");
}

// ---------- Завершення забігу ----------

function handleGameOver() {
    if (!resultRecorded) {
        resultRecorded = true;
        const runState = gameEngine.getState();
        save.recordResult(currentLevelId, Math.floor(runState.progressPct), runState.score);
    }
    const runState = gameEngine.getState();
    gameoverPctEl.textContent = Math.floor(runState.progressPct) + "%";
    gameoverScoreEl.textContent = String(runState.score);
    setState("GAMEOVER");
}

function handleVictory() {
    if (!resultRecorded) {
        resultRecorded = true;
        const runState = gameEngine.getState();
        save.recordResult(currentLevelId, 100, runState.score);
    }
    const runState = gameEngine.getState();
    victoryScoreEl.textContent = String(runState.score);

    const currentLevel = ALL_LEVELS.find(function (l) { return l.id === currentLevelId; });
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
        victoryUnlockEl.textContent = "Ти переміг! Усі 31 рівень пройдено! Повний алфавіт освоєно!";
        btnNext.classList.add("hidden");
    } else if (nextLevel && save.getLastPlayable() >= nextLevel.id) {
        victoryUnlockEl.textContent = "Відкрито: " + nextLevel.name + "!";
        btnNext.classList.remove("hidden");
    } else {
        victoryUnlockEl.textContent = "";
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

        const titleEl = document.createElement("div");
        titleEl.className = "level-title";
        titleEl.textContent = level.leagueId + "-" + levelIdx + ": " + level.name;
        card.appendChild(titleEl);

        if (locked) {
            const lockIcon = document.createElement("div");
            lockIcon.className = "level-lock-icon";
            lockIcon.textContent = "\uD83D\uDD12";
            card.appendChild(lockIcon);
        }

        const record = document.createElement("div");
        record.className = "level-record";
        record.textContent = "Кращий: " + entry.bestPct + "% | HS: " + entry.highScore;
        card.appendChild(record);

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

// ---------- Кнопки ----------

btnStart.addEventListener("click", function () {
    startLevel(save.getLastPlayable());
});

btnLevels.addEventListener("click", function () {
    buildLevelCards();
    setState("LEVEL_SELECT");
});

btnSettings.addEventListener("click", function () {
    refreshDifficultyButtons();
    refreshHitWindowButtons();
    refreshSpeedButtons();
    setState("SETTINGS");
});

btnEasy.addEventListener("click", function () {
    save.setDifficulty("EASY");
    refreshDifficultyButtons();
});

btnHard.addEventListener("click", function () {
    save.setDifficulty("HARD");
    refreshDifficultyButtons();
});

btnCloseSettings.addEventListener("click", function () {
    setState("MENU");
});

btnNormal.addEventListener("click", function () {
    save.setHitWindow("normal");
    refreshHitWindowButtons();
});

btnLarge.addEventListener("click", function () {
    save.setHitWindow("large");
    refreshHitWindowButtons();
});

btnSpeedSlow.addEventListener("click", function () {
    save.setSpeed("slow");
    refreshSpeedButtons();
});

btnSpeedNormal.addEventListener("click", function () {
    save.setSpeed("normal");
    refreshSpeedButtons();
});

btnSpeedFast.addEventListener("click", function () {
    save.setSpeed("fast");
    refreshSpeedButtons();
});

btnLevelsBack.addEventListener("click", function () {
    setState("MENU");
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
            btnRetryWin.click();
        }
    }
);

// ---------- Пауза при прихованій вкладці ----------

let lastTime = null;

document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        lastTime = null;
    }
});

// ---------- Ігровий цикл ----------

const appStart = performance.now();

function frame(now) {
    requestAnimationFrame(frame);
    if (lastTime === null) {
        lastTime = now;
        return;
    }
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const time = (now - appStart) / 1000;

    ctx.clearRect(0, 0, W, H);

    if (state === "LOADING") {
        return;
    }

    if (state === "MENU" || state === "SETTINGS" || state === "LEVEL_SELECT") {
        if (demoEngine) {
            demoEngine.update(dt);
            demoEngine.render(ctx, W, H, time);
        }
        return;
    }

    if (gameEngine) {
        gameEngine.update(dt);
        gameEngine.render(ctx, W, H, time);

        if (state === "PLAYING") {
            if (wrongKeyError.letter !== null && (performance.now() - wrongKeyError.timestamp) > 350) {
                wrongKeyError.letter = null;
            }

            const keyboardArea = {
                x: W * 0.04,
                y: H * 0.70,
                w: W * 0.92,
                h: H * 0.28
            };
            drawKeyboard(
                ctx,
                keyboardArea,
                gameEngine.level.letters,
                gameEngine.getTargetLetter(),
                wrongKeyError,
                time
            );

            const outcome = gameEngine.getOutcome();
            if (outcome === "dead") {
                handleGameOver();
            } else if (outcome === "won") {
                handleVictory();
            }
        }
    }
}

requestAnimationFrame(frame);

// ---------- Старт застосунку ----------

save.load();

loadAssets(function (loaded, total) {
    loadingProgressEl.textContent = loaded + " / " + total;
}).then(function () {
    createDemoEngine();
    setState("MENU");
});

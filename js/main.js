// ============================================================
// main.js — точка входу
// Ігровий цикл (requestAnimationFrame + кламп delta),
// Менеджер Станів, музика за станом, DOM-оверлеї, введення
// 15 рівнів, розумна клавіатурна індикація
// ============================================================

import { loadAssets, unlockAudio, playSound, playMusic } from "./assets.js";
import { LEVELS, Engine, save } from "./engine.js";
import { initKeyboardInput, drawKeyboard } from "./keyboard.js";

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
const btnStart = document.getElementById("btnStart");
const btnLevels = document.getElementById("btnLevels");
const btnSettings = document.getElementById("btnSettings");
const btnEasy = document.getElementById("btnEasy");
const btnHard = document.getElementById("btnHard");
const btnCloseSettings = document.getElementById("btnCloseSettings");
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
    demoEngine = new Engine(save.getLastPlayable(), "EASY", true);
}

// ---------- Запуск рівня ----------

function startLevel(levelId) {
    currentLevelId = levelId;
    resultRecorded = false;
    wrongKeyError = { letter: null, timestamp: 0 };
    gameEngine = new Engine(levelId, save.getDifficulty(), false);
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

    const nextId = currentLevelId + 1;
    const hasNext = nextId <= 15 && save.getLastPlayable() >= nextId;
    if (currentLevelId === 15) {
        victoryUnlockEl.textContent = "Ти переміг! Усі 15 рівнів пройдено! Повний алфавіт освоєно!";
        btnNext.classList.add("hidden");
    } else if (hasNext) {
        victoryUnlockEl.textContent = "Відкрито Рівень " + nextId + "!";
        btnNext.classList.remove("hidden");
    } else {
        victoryUnlockEl.textContent = "";
        btnNext.classList.add("hidden");
    }
    setState("VICTORY");
}

// ---------- Екран вибору рівня (15 рівнів) ----------

function buildLevelCards() {
    const progress = save.getProgress();
    levelGridEl.innerHTML = "";
    for (const level of LEVELS) {
        const entry = progress.levels[String(level.id)];
        const locked = level.id > progress.unlocked;

        const card = document.createElement("div");
        card.className = "level-card";
        if (locked) {
            card.classList.add("locked");
        }
        if (level.id === 10 || level.id === 15) {
            card.classList.add("boss-card");
        }

        const num = document.createElement("div");
        num.className = "level-num";
        if (level.id === 10) {
            num.textContent = level.id + " · КОНСОЛІДАЦІЯ";
        } else if (level.id === 15) {
            num.textContent = level.id + " · DEMON";
        } else {
            num.textContent = String(level.id);
        }
        card.appendChild(num);

        if (locked) {
            const lockIcon = document.createElement("div");
            lockIcon.className = "level-lock-icon";
            lockIcon.textContent = "\uD83D\uDD12";
            card.appendChild(lockIcon);
        }

        const letters = document.createElement("div");
        letters.className = "level-letters";
        letters.textContent = level.letters.join(" ");
        card.appendChild(letters);

        const record = document.createElement("div");
        record.className = "level-record";
        record.textContent = "Кращий: " + entry.bestPct + "% | HS: " + entry.highScore;
        card.appendChild(record);

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
    const nextId = Math.min(15, currentLevelId + 1);
    if (save.getLastPlayable() >= nextId) {
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

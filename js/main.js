// ============================================================
// main.js — точка входу
// Ігровий цикл (requestAnimationFrame + кламп delta),
// Менеджер Станів, музика за станом, DOM-оверлеї, введення
// ============================================================

import { loadAssets, unlockAudio, playSound, playMusic } from "./assets.js";
import { LEVELS, Engine, save } from "./engine.js";
import { initKeyboardInput, drawKeyboard } from "./keyboard.js";

// ---------- Полотно та адаптивність (R7) ----------

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

// ---------- DOM-елементи (DOM-контракт) ----------

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

// ---------- Менеджер Станів (data-model.md §1) ----------

const STATES = ["LOADING", "MENU", "SETTINGS", "LEVEL_SELECT", "PLAYING", "GAMEOVER", "VICTORY"];

// Дозволені переходи між станами
const TRANSITIONS = {
    LOADING: ["MENU"],
    MENU: ["SETTINGS", "LEVEL_SELECT", "PLAYING"],
    SETTINGS: ["MENU"],
    LEVEL_SELECT: ["MENU", "PLAYING"],
    PLAYING: ["GAMEOVER", "VICTORY", "MENU"],
    GAMEOVER: ["PLAYING", "MENU"],
    VICTORY: ["PLAYING", "MENU"]
};

// Музика для кожного стану (FR-004)
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
let demoEngine = null;   // заставка меню
let gameEngine = null;   // активний забіг
let currentLevelId = 1;
let resultRecorded = false;

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

    // Видимість оверлеїв: SETTINGS показується ПОВЕРХ меню
    for (const key of Object.keys(overlays)) {
        overlays[key].classList.add("hidden");
    }
    if (next === "SETTINGS") {
        overlays.MENU.classList.remove("hidden");
        overlays.SETTINGS.classList.remove("hidden");
    } else if (overlays[next]) {
        overlays[next].classList.remove("hidden");
    }

    // Музика за станом (повторний виклик того самого треку — без рестарту)
    playMusic(STATE_MUSIC[next]);
}

// ---------- Демо-заставка меню (US2) ----------

function createDemoEngine() {
    demoEngine = new Engine(save.getLastPlayable(), "EASY", true);
}

// ---------- Запуск рівня (US1) ----------

function startLevel(levelId) {
    currentLevelId = levelId;
    resultRecorded = false;
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

// ---------- Завершення забігу: поразка / перемога ----------

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
    const hasNext = nextId <= 6 && save.getLastPlayable() >= nextId;
    if (currentLevelId === 6) {
        victoryUnlockEl.textContent = "Ти переміг БОСА! Усі рівні пройдено!";
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

// ---------- Екран вибору рівня (US3) ----------

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
        if (level.id === 6) {
            card.classList.add("boss-card");
        }

        const num = document.createElement("div");
        num.className = "level-num";
        num.textContent = level.id === 6 ? "6 · БОС" : String(level.id);
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
        record.textContent = "Кращий результат: " + entry.bestPct + "% | HighScore: " + entry.highScore + " очок";
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

// ---------- Модалка налаштувань (US4) ----------

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
    const nextId = Math.min(6, currentLevelId + 1);
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

// Звук кліку для всіх кнопок (FR-007)
document.addEventListener("click", function (event) {
    if (event.target && event.target.closest("button")) {
        playSound("click");
    }
});

// Розблокування аудіо першим жестом (autoplay-політика, R2)
function firstGestureUnlock() {
    unlockAudio();
}
window.addEventListener("pointerdown", firstGestureUnlock);
window.addEventListener("keydown", firstGestureUnlock);

// ---------- Введення з клавіатури (US1) ----------

initKeyboardInput(
    function (letter) {
        if (state === "PLAYING" && gameEngine) {
            gameEngine.handleLetter(letter);
        }
    },
    function () {
        // Гаряча клавіша Enter/NumpadEnter — лише на екранах завершення
        // (FR-034). Програмний клік по кнопці гарантує повну еквівалентність
        // кліку мишею: звук кліку через document-делегат + startLevel
        // (FR-030..FR-032, research.md R2 фічі 002).
        if (state === "GAMEOVER") {
            btnRetry.click();
        } else if (state === "VICTORY") {
            btnRetryWin.click();
        }
    }
);

// ---------- Пауза при прихованій вкладці (R4, FR-027) ----------

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
        // Фон під екраном завантаження малює CSS
        return;
    }

    if (state === "MENU" || state === "SETTINGS" || state === "LEVEL_SELECT") {
        if (demoEngine) {
            demoEngine.update(dt);
            demoEngine.render(ctx, W, H, time);
        }
        return;
    }

    // PLAYING / GAMEOVER / VICTORY: рендеримо світ (за оверлеями теж)
    if (gameEngine) {
        gameEngine.update(dt);
        gameEngine.render(ctx, W, H, time);

        if (state === "PLAYING") {
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

// ---------- Старт застосунку: LOADING → MENU (US5) ----------

save.load();

loadAssets(function (loaded, total) {
    loadingProgressEl.textContent = loaded + " / " + total;
}).then(function () {
    createDemoEngine();
    setState("MENU");
});

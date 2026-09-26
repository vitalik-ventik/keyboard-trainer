// ============================================================
// track.js — фіксовані траси рівнів: детермінований PRNG і генерація
// перешкод з урахуванням рук, таймінгів приземлення й відстаней між шипами
// ============================================================

import { KEYS } from "./keyboard.js";
import { GRAVITY, MIN_JUMP_VELOCITY, SAFE_MARGIN, spikeHalfWidth } from "./game_constants.js";

// ---------- Детермінований PRNG (фіксовані траси) ----------

function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ---------- Генерація фіксованої траси ----------

// Ліва половина розкладки ЙЦУКЕН (набирається лівою рукою), решта — правою
const LEFT_HAND_LETTERS = new Set([
    "Й","Ц","У","К","Е",
    "Ф","І","В","А","П",
    "Я","Ч","С","М","И"
]);

// Стовпець кожної літери на клавіатурі (для уникнення стрибків «вгору-вниз» одним пальцем)
const LETTER_COLUMN = {};
for (const key of KEYS) {
    LETTER_COLUMN[key.letter] = key.col;
}

// Ймовірність, що наступна літера буде з протилежного боку клавіатури
const HAND_SWITCH_CHANCE = 0.7;

function reactionTimeForLevel(levelId) {
    const t = (levelId - 1) / 30;
    return 1.2 - 0.7 * t;
}

function pickObstacleType(rng, lastTypes) {
    const roll = rng();
    let type;
    if (roll < 0.50) {
        type = "spike";
    } else if (roll < 0.80) {
        type = "double_spike";
    } else {
        type = "saw";
    }
    if (lastTypes.length >= 2 && lastTypes[0] === "saw" && lastTypes[1] === "saw" && type === "saw") {
        type = rng() < 0.5 ? "spike" : "double_spike";
    }
    return type;
}

// Час після приземлення, перш ніж наступний шип увійде в зону натискання
const LANDING_REACTION_TIME = 0.12;

// Максимальна відстань від центру шипа до точки приземлення після стрибка через нього.
// Зазвичай кубик приземляється на SAFE_MARGIN за правим краєм шипа, але мінімальна
// швидкість стрибка може зробити політ довшим.
function landingOffset(type, effectiveSpeed) {
    const halfW = spikeHalfWidth(type);
    const minFlight = effectiveSpeed * 2 * MIN_JUMP_VELOCITY / GRAVITY;
    return Math.max(halfW + SAFE_MARGIN, minFlight - halfW);
}

// Мінімальна відстань між центрами сусідніх шипів: кубик має приземлитися
// до того, як наступний шип увійде в зону «ОК», і ще встигнути помітити літеру
function minSpikeSpacing(prevType, nextType, effectiveSpeed, okPx) {
    return landingOffset(prevType, effectiveSpeed) +
        spikeHalfWidth(nextType) +
        okPx +
        effectiveSpeed * LANDING_REACTION_TIME;
}

function generateTrack(level, effectiveSpeed, okPx) {
    const rng = mulberry32(level.seed);
    const spikes = [];
    const moveSpeed = effectiveSpeed || level.speed;
    const windowPx = okPx || 0;

    function placeAt(candidateX, obstacleType) {
        if (spikes.length === 0) {
            return candidateX;
        }
        const prev = spikes[spikes.length - 1];
        return Math.max(candidateX, prev.x + minSpikeSpacing(prev.type, obstacleType, moveSpeed, windowPx));
    }
    // Нові рівні, вставлені всередину ліги, мають складність сусіднього (tuneAs)
    const baseGapTime = reactionTimeForLevel(level.tuneAs || level.id);
    let x = level.speed * 3.0;
    let lastLetter1 = null;
    const lastTypes = [];

    const leftPool = level.letters.filter(function (l) { return LEFT_HAND_LETTERS.has(l); });
    const rightPool = level.letters.filter(function (l) { return !LEFT_HAND_LETTERS.has(l); });
    const canAlternate = leftPool.length > 0 && rightPool.length > 0;

    // Вибір пулу: переважно чергуємо руки, щоб літери не йшли довгою серією з одного боку
    function choosePool() {
        if (!canAlternate || lastLetter1 === null) {
            return level.letters;
        }
        const lastWasLeft = LEFT_HAND_LETTERS.has(lastLetter1);
        // handSwitch у рівні: 1 — руки строго по черзі
        const switchHand = rng() < (typeof level.handSwitch === "number" ? level.handSwitch : HAND_SWITCH_CHANCE);
        if (lastWasLeft === switchHand) {
            return rightPool;
        }
        return leftPool;
    }

    // «Мішок» для кожного пулу: літери видаються без повторів, доки не вичерпаються всі,
    // тож кожна літера рівня гарантовано трапляється і тренується порівну
    const bags = new Map();

    function drawFromBag(pool) {
        let bag = bags.get(pool);
        if (!bag || bag.length === 0) {
            bag = pool.slice();
            bags.set(pool, bag);
        }
        // Спершу — літери з іншого стовпця, ніж попередня (не «одна під одною»),
        // потім — будь-яка інша літера, і лише в крайньому разі — та сама
        const lastColumn = lastLetter1 === null ? null : LETTER_COLUMN[lastLetter1];
        let candidates = [];
        // Рівень «стрибки між рядами»: наступна літера — з того самого стовпця, але з іншого ряду
        if (level.columnJumps && lastColumn !== null) {
            for (let i = 0; i < bag.length; i++) {
                if (bag[i] !== lastLetter1 && LETTER_COLUMN[bag[i]] === lastColumn) {
                    candidates.push(i);
                }
            }
            if (candidates.length > 0) {
                const pick = candidates[Math.floor(rng() * candidates.length)];
                return bag.splice(pick, 1)[0];
            }
        }
        for (let i = 0; i < bag.length; i++) {
            if (bag[i] !== lastLetter1 && LETTER_COLUMN[bag[i]] !== lastColumn) {
                candidates.push(i);
            }
        }
        if (candidates.length === 0) {
            for (let i = 0; i < bag.length; i++) {
                if (bag[i] !== lastLetter1) {
                    candidates.push(i);
                }
            }
        }
        if (candidates.length === 0) {
            for (let i = 0; i < bag.length; i++) {
                candidates.push(i);
            }
        }
        const idx = candidates[Math.floor(rng() * candidates.length)];
        return bag.splice(idx, 1)[0];
    }

    function pickLetter() {
        const letter = drawFromBag(choosePool());
        lastLetter1 = letter;
        return letter;
    }

    if (Array.isArray(level.words) && level.words.length > 0) {
        // Рівень-слова: шипи по черзі складають справжні слова; між словами — пауза
        const order = level.words.slice();
        let wordIdx = 0;
        let placed = 0;
        while (placed < level.spikeCount) {
            if (wordIdx % order.length === 0) {
                // Кожне коло слів — у новому випадковому порядку
                for (let i = order.length - 1; i > 0; i--) {
                    const j = Math.floor(rng() * (i + 1));
                    const tmp = order[i];
                    order[i] = order[j];
                    order[j] = tmp;
                }
            }
            const word = order[wordIdx % order.length];
            for (let c = 0; c < word.length; c++) {
                const obstacleType = pickObstacleType(rng, lastTypes);
                lastTypes.push(obstacleType);
                if (lastTypes.length > 2) {
                    lastTypes.shift();
                }
                x = placeAt(x, obstacleType);
                spikes.push({
                    x: x,
                    letter: word[c],
                    state: "ahead",
                    type: obstacleType,
                    rotationAngle: 0,
                    word: word,
                    wordIdx: wordIdx,
                    charIdx: c,
                    combo: level.combo || null
                });
                placed++;
                x += level.speed * (baseGapTime + rng() * 0.35);
            }
            // Між словами — пауза; між короткими складами — трохи менша, щоб тримати ритм
            x += level.speed * (level.combo === "syllables" ? 0.5 : 0.7);
            wordIdx++;
        }
    } else if (level.rhythmGroups) {
        let placed = 0;
        while (placed < level.spikeCount) {
            const groupSize = Math.min(
                2 + Math.floor(rng() * 3),
                level.spikeCount - placed
            );
            for (let i = 0; i < groupSize; i++) {
                const obstacleType = pickObstacleType(rng, lastTypes);
                lastTypes.push(obstacleType);
                if (lastTypes.length > 2) {
                    lastTypes.shift();
                }
                x = placeAt(x, obstacleType);
                spikes.push({
                    x: x,
                    letter: pickLetter(),
                    state: "ahead",
                    type: obstacleType,
                    rotationAngle: 0
                });
                placed++;
                if (i < groupSize - 1) {
                    x += level.speed * 0.55;
                }
            }
            x += level.speed * (1.25 + rng() * 0.5);
        }
    } else {
        for (let i = 0; i < level.spikeCount; i++) {
            const obstacleType = pickObstacleType(rng, lastTypes);
            lastTypes.push(obstacleType);
            if (lastTypes.length > 2) {
                lastTypes.shift();
            }
            x = placeAt(x, obstacleType);
            spikes.push({
                x: x,
                letter: pickLetter(),
                state: "ahead",
                type: obstacleType,
                rotationAngle: 0
            });
            x += level.speed * (baseGapTime + rng() * 0.55);
        }
    }

    const finishX = spikes[spikes.length - 1].x + level.speed * 2.5;
    return { spikes: spikes, finishX: finishX };
}

export { generateTrack, mulberry32 };

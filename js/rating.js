// ============================================================
// rating.js — рейтинг гравця
// За кожен рівень зараховується лише найкращий забіг:
//   очки = вага рівня × пройдено × точність × складність × швидкість × зона стрибка.
// Рейтинг = сума найкращих очок по рівнях + невеликий бонус за практику.
// Монети в рейтинг не входять, тож сотня повторів одного рівня майже нічого не дає,
// а пройдені рівні й складні налаштування — дають багато.
// ============================================================

import { ALL_LEVELS, BOSS_LEVEL_ID, getLevelById } from "./levels.js";

// Вага рівня за лігою: що далі ліга, то дорожчий рівень
export const LEAGUE_WEIGHTS = { 1: 10, 2: 15, 3: 22, 4: 30, 5: 40 };
export const BOSS_WEIGHT = 50;

export const DIFFICULTY_MULT = { EASY: 1.0, HARD: 1.6 };
export const SPEED_MULT = { slow: 0.75, normal: 1.0, fast: 1.25 };
export const HIT_WINDOW_MULT = { normal: 1.0, large: 0.85 };

// Навіть неакуратне проходження дає половину очок: точність множить у межах 0.5…1
const ACCURACY_FLOOR = 0.5;

// Бонус за практику: частка від суми, що росте як логарифм від кількості забігів
// і не перевищує PRACTICE_BONUS_MAX (31 забіг — уже повний бонус)
export const PRACTICE_BONUS_MAX = 0.1;
const PRACTICE_BONUS_STEP = 0.02;

// Оцінка для старих збережень, де ще не записано, як пройдено рівень
const LEGACY_ACCURACY = 0.8;

export function levelWeight(levelId) {
    if (levelId === BOSS_LEVEL_ID) {
        return BOSS_WEIGHT;
    }
    const level = getLevelById(levelId);
    if (!level) {
        return 0;
    }
    return LEAGUE_WEIGHTS[level.leagueId] || LEAGUE_WEIGHTS[1];
}

// Найбільше очок, яке можна отримати на рівні (HARD, FAST, звичайна зона, 100% точність)
export function maxLevelPoints(levelId) {
    return levelWeight(levelId) * DIFFICULTY_MULT.HARD * SPEED_MULT.fast * HIT_WINDOW_MULT.normal;
}

function roundPoints(value) {
    return Math.round(value * 10) / 10;
}

/**
 * Точність забігу за статистикою літер { літера: { ok, miss } }.
 * @returns {number|null} частка правильних (0…1) або null, якщо нажимань не було
 */
export function runAccuracy(letterStats) {
    let ok = 0;
    let miss = 0;
    for (const letter of Object.keys(letterStats || {})) {
        ok += Number(letterStats[letter].ok) || 0;
        miss += Number(letterStats[letter].miss) || 0;
    }
    if (ok + miss === 0) {
        return null;
    }
    return ok / (ok + miss);
}

/**
 * Очки за один забіг.
 * @param {{levelId:number, pct:number, accuracy:number|null, difficulty:string, speed:string, hitWindow:string}} run
 */
export function runPoints(run) {
    const weight = levelWeight(run.levelId);
    const done = Math.min(100, Math.max(0, Number(run.pct) || 0)) / 100;
    const accuracy = run.accuracy === null || run.accuracy === undefined ? 0 : Math.min(1, Math.max(0, run.accuracy));
    const quality = ACCURACY_FLOOR + (1 - ACCURACY_FLOOR) * accuracy;
    const diff = DIFFICULTY_MULT[run.difficulty] || DIFFICULTY_MULT.EASY;
    const speed = SPEED_MULT[run.speed] || SPEED_MULT.normal;
    const zone = HIT_WINDOW_MULT[run.hitWindow] || HIT_WINDOW_MULT.normal;
    return roundPoints(weight * done * quality * diff * speed * zone);
}

// Оцінка очок рівня зі старого збереження: EASY з точністю 80%,
// а рівень, ідеально пройдений на HARD, — HARD зі 100%
export function legacyLevelPoints(levelId, bestPct, perfect) {
    if (perfect === "hard") {
        return runPoints({ levelId: levelId, pct: 100, accuracy: 1, difficulty: "HARD", speed: "normal", hitWindow: "normal" });
    }
    return runPoints({ levelId: levelId, pct: bestPct, accuracy: perfect === "easy" ? 1 : LEGACY_ACCURACY, difficulty: "EASY", speed: "normal", hitWindow: "normal" });
}

export function practiceBonusShare(runs) {
    const n = Math.max(0, Number(runs) || 0);
    return Math.min(PRACTICE_BONUS_MAX, PRACTICE_BONUS_STEP * Math.log2(1 + n));
}

/**
 * Рейтинг і його розбивка.
 * @param {Object<string, {bestPct:number, bestPoints:number, clearedHard:boolean}>} levels
 * @param {{runs:number, seconds:number, ok:number, miss:number}} totals
 */
export function computeRating(levels, totals) {
    let base = 0;
    let cleared = 0;
    let clearedHard = 0;
    for (const level of ALL_LEVELS) {
        const entry = levels[String(level.id)];
        if (!entry) {
            continue;
        }
        base += Number(entry.bestPoints) || 0;
        if (entry.bestPct >= 100) {
            cleared++;
            if (entry.clearedHard) {
                clearedHard++;
            }
        }
    }
    const t = totals || {};
    const bonus = base * practiceBonusShare(t.runs);
    const presses = (t.ok || 0) + (t.miss || 0);
    const minutes = (t.seconds || 0) / 60;
    return {
        rating: Math.round(base + bonus),
        base: roundPoints(base),
        bonus: roundPoints(bonus),
        bonusShare: practiceBonusShare(t.runs),
        levelsCleared: cleared,
        levelsHard: clearedHard,
        levelsTotal: ALL_LEVELS.length,
        runs: t.runs || 0,
        minutes: Math.round(minutes),
        accuracy: presses > 0 ? (t.ok || 0) / presses : null
    };
}

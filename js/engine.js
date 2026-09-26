// ============================================================
// engine.js — ігрова логіка: клас Engine (фізика кубика, введення, колізії,
// бали, демо-режим, рендеринг кадру). Константи й бали — game_constants.js,
// рівні — levels.js, траси — track.js, скіни — skins.js і skin_renderers.js,
// збереження — save.js, вигляд шипів — spike_styles.js
// ============================================================

import { BOLT_TIME, DESTRUCTION_TIME, GRAVITY_LIFT, MELEE_CONTACT, SWING_HIT, SWING_TIME, beamTiming, drawBeam, drawHeldWeapon, drawProjectile, drawSpikeDestruction, drawStuckArrow, getWeaponSound, getWeaponSpec, gravityGrabTime, gravityHoldOffset, meleeTriggerGap } from "./weapons.js";
import { BackgroundCache } from "./cache.js";
import { BackgroundRenderer } from "./backgrounds.js";
import { EXPLOSION_DURATION, drawAccessory, drawCoinIcon, drawExplosion, drawHeartLife, drawTrail, explosionWindowBonus, seriesBonus, trailSlowdown } from "./shop.js";
import { ALL_LEVELS, COMBO_KINDS, getLevelById } from "./levels.js";
import { activeSkinPerk, drawAchievementFrame, sampleSkinColors } from "./skins.js";
import { SKIN_RENDERERS } from "./skin_renderers.js";
import { CUBE_SIZE, DEATH_DELAY, DEMO_RESTART_DELAY, EASTER_EGG_DURATION, FINISH_OPEN_DISTANCE, GRAVITY, GRAVITY_PULL_AHEAD, LANDING_FX, MIN_JUMP_VELOCITY, OOPS_TIME, PERFECT_FLASH_TIME, PLAYER_ANCHOR, POINTS_COLOR, SAFE_MARGIN, SHAKE_TIME, SPIKE_H, SPIKE_W, TITLE_TIME, TRAIL_MAX, calculateHitScore, calculateMaxScores, hitWindowTimes, spikeHalfWidth } from "./game_constants.js";
import { generateTrack, mulberry32 } from "./track.js";
import { save } from "./save.js";
import { SPIKE_STYLE_BY_THEME, SPIKE_STYLE_COLORS, drawKeycap, drawStyledSpikeShape, roundedRectPath } from "./spike_styles.js";

const SPIKE_POP_DISTANCE = 140;
const SPIKE_CRUMBLE_TIME = 0.35;
// Бонус монет за слово без жодної помилки
const WORD_BONUS = 2;
// Бонус за комбінацію (склад, перекат, повтор) без жодної помилки
const COMBO_BONUS = 1;
// ---------- Клас Engine ----------

export class Engine {
    constructor(levelId, difficulty, demoMode, hitWindow, speed, leagueInfo) {
        const SPEED_MULTIPLIERS = { slow: 0.75, normal: 1.0, fast: 1.25 };
        this.level = { ...getLevelById(levelId) };
        // Тренування помилок: літери рівня — ті, на яких гравець помиляється найчастіше
        // (поки даних замало — звичайні літери рівня)
        if (this.level.adaptive) {
            const weak = save.getWeakLetters(this.level.adaptive.pool, this.level.adaptive.count);
            if (weak) {
                this.level.letters = weak;
            }
            this.adaptiveFromStats = !!weak;
        }
        this.effectiveSpeed = this.level.speed * (SPEED_MULTIPLIERS[speed] ?? 1.0);
        // Бонуси з магазину (лише в справжній грі): шлейф сповільнює трасу, вибух розширює зону стрибка
        const trailSlow = demoMode ? 0 : trailSlowdown(save.getEquipped("trail"));
        const windowBonus = demoMode ? 0 : explosionWindowBonus(save.getEquipped("explosion"));
        this.effectiveSpeed *= 1 - trailSlow;
        this.difficulty = difficulty === "HARD" ? "HARD" : "EASY";
        this.demoMode = !!demoMode;
        this.leagueInfo = leagueInfo || null;
        this.hitWindowSetting = hitWindow === "large" ? "large" : "normal";
        this.speedSetting = speed === "slow" || speed === "fast" ? speed : "normal";

        this.onJump = null;
        // Звук зброї: onSound(cue) з WEAPON_SOUNDS (у демо в меню не призначається — тиша)
        this.onSound = null;
        this.onExplode = null;
        this.onVictory = null;
        this.currentTime = 0;

        const windows = hitWindowTimes(this.level.tuneAs || this.level.id);
        const multiplier = (this.hitWindowSetting === "large" ? 2 : 1) * (1 + windowBonus);
        this.okPx = this.effectiveSpeed * windows.okTime * multiplier;
        this.perfectPx = this.effectiveSpeed * windows.perfectTime * multiplier;
        // Бонус скіна з магазину: серії, слова, ширша зона «Ідеально» або щит
        const perkInfo = demoMode ? null : activeSkinPerk(save.getActiveSkin());
        this.skinPerk = perkInfo ? perkInfo.kind : null;
        this.skinPerkValue = perkInfo ? perkInfo.value : 0;
        if (this.skinPerk === "perfect") {
            this.perfectPx = Math.min(this.okPx * 0.9, this.perfectPx * (1 + this.skinPerkValue));
        }
        this.shieldReady = this.skinPerk === "shield";
        this.shieldFlash = 0;
        // Пропозиція сердечка: гра на паузі, доки гравець не вирішить
        this.onReviveOffer = null;
        this.pendingRevive = null;
        this.paused = false;
        // Причина паузи: "start" (перед стартом рівня), "user" (Пробіл), "resume" (після сердечка),
        // "revive" (вікно «Друге життя?»)
        this.pauseReason = null;
        this.pauseStart = null;
        this.pausedTotal = 0;
        this.heartFlash = 0;

        this.cameraMotion = save.getCameraMotion();

        this.scoreConfig = {
            difficulty: this.difficulty,
            hitWindow: this.hitWindowSetting,
            speed: this.speedSetting
        };

        this.bgCache = new BackgroundCache();

        this.reset();
    }

    reset() {
        BackgroundRenderer.reset();
        this.bgCache.reset();
        const track = generateTrack(this.level, this.effectiveSpeed, this.okPx);
        this.spikes = track.spikes;
        this.finishX = track.finishX;
        // Максимум очок — за справжньою кількістю шипів: на рівнях зі словами
        // останнє слово добудовується повністю, тож шипів буває більше за spikeCount
        const maxScores = calculateMaxScores(this.spikes.length, this.hitWindowSetting, this.speedSetting);
        this.maxEasy = maxScores.maxEasy;
        this.maxHard = maxScores.maxHard;

        this.player = {
            x: 0,
            y: 0,
            vy: 0,
            onGround: true,
            rotation: 0,
            alive: true,
            trail: [],
            meteorTrail: [],
            goldTrail: []
        };

        this.progressPct = 0;
        this.score = 0;
        this.combo = 0;
        this.particles = [];
        this.perfectParticles = [];
        this.perfectPopups = [];
        this.waves = [];
        this.ripples = [];
        this.pulse = 0;
        this.deathTimer = 0;
        this.demoRestartTimer = 0;
        this.outcome = "running";
        this.trailTick = 0;
        this.jumpBuffer = null;
        // Уламки вибуху та пил приземлення (квадратні «блоки»)
        this.debris = [];
        this.perfectFlash = 0;
        this.scorePopups = [];
        this.spikeStyle = SPIKE_STYLE_BY_THEME[this.level.bgTheme] || "neon";
        // Пасхалка: з'являється один раз, коли гравець пройде випадкову частину рівня (30–70%)
        this.eggAt = 0.3 + mulberry32(this.level.seed + 7)() * 0.4;
        this.eggStart = null;
        this.weather = BackgroundRenderer.pickWeather(this.level.bgTheme);
        this.shakeTime = 0;
        this.oopsTime = 0;
        this.elapsed = 0;
        // Кристали за цей забіг (без множника налаштувань) і ефект вибуху з магазину
        // Статистика літер цього забігу (влучання й помилки) — для тренування помилок
        this.letterStats = {};
        this.runWords = 0;
        this.runCombos = 0;
        this.runHits = 0;
        this.runPerfect = 0;
        this.runSeries = 0;
        // Для досягнень: найдовша серія «Ідеально» та шипи, знищені зброєю
        this.runMaxCombo = 0;
        this.runWeaponHits = 0;
        this.boom = null;
        // Зброя з магазину: замість стрибка кубик знищує шип
        this.weaponId = save.getEquipped("weapon");
        this.weaponSpec = getWeaponSpec(this.weaponId);
        this.attacks = [];
        this.shots = [];
        this.stuckArrows = [];
        this.weaponRecoil = 0;
    }

    // Тип скіна, яким зараз малюється кубик (вибраний гравцем або скін рівня)
    getSkinRenderType() {
        var activeSkinId = save.getActiveSkin ? save.getActiveSkin() : null;
        if (activeSkinId && SKIN_RENDERERS[activeSkinId]) {
            return activeSkinId;
        }
        if (this.level.skin && SKIN_RENDERERS[this.level.skin.renderType]) {
            return this.level.skin.renderType;
        }
        return "neon_base";
    }

    // Шип подолано: він розсипається на уламки, над ним спливають зароблені очки
    markSpikeCleared(spike, points) {
        spike.state = "cleared";
        spike.clearedAt = this.currentTime;
        const colors = SPIKE_STYLE_COLORS[this.spikeStyle] || [this.level.accentColor || "#ff2ea6", "#ffffff"];
        this.spawnDebris(10, {
            x: spike.x,
            y: SPIKE_H * 0.4,
            spread: SPIKE_W * 0.6,
            angleMin: Math.PI * 0.1,
            angleMax: Math.PI * 0.9,
            speedMin: 90,
            speedMax: 220,
            sizeMin: 4,
            sizeMax: 8,
            spin: 10,
            colors: colors,
            gravity: 700,
            life: 0.7,
            outline: true
        });
        if (points > 0) {
            this.scorePopups.push({ x: spike.x, y: SPIKE_H + 12, text: "+" + points, life: 0.9, maxLife: 0.9, points: true });
        }
    }

    // Світ відповідає на приземлення: бульбашки, світлячки, сніг, пісок, камінці, іскри
    spawnLandingReaction() {
        const fx = LANDING_FX[this.level.bgTheme];
        if (!fx) {
            return;
        }
        const base = { x: this.player.x, spin: 3, outline: false, colors: fx.colors };
        if (fx.kind === "bubbles") {
            this.spawnDebris(6, Object.assign(base, { y: 6, spread: CUBE_SIZE, angleMin: Math.PI * 0.35, angleMax: Math.PI * 0.65, speedMin: 30, speedMax: 80, sizeMin: 3, sizeMax: 6, gravity: -160, life: 1.1 }));
        } else if (fx.kind === "fireflies") {
            this.spawnDebris(5, Object.assign(base, { y: 8, spread: CUBE_SIZE * 2, angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 20, speedMax: 60, sizeMin: 3, sizeMax: 4, gravity: -40, life: 1.4 }));
        } else if (fx.kind === "splash") {
            this.spawnDebris(10, Object.assign(base, { y: 3, spread: CUBE_SIZE, angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.9, speedMin: 60, speedMax: 170, sizeMin: 3, sizeMax: 5, gravity: 400, life: 0.6 }));
        } else if (fx.kind === "pebbles") {
            this.spawnDebris(4, Object.assign(base, { x: this.player.x + 60, y: 380, spread: 260, angleMin: -Math.PI * 0.55, angleMax: -Math.PI * 0.45, speedMin: 10, speedMax: 40, sizeMin: 4, sizeMax: 7, gravity: 900, life: 1.2, outline: true }));
        } else if (fx.kind === "sparks") {
            this.spawnDebris(7, Object.assign(base, { y: 4, spread: CUBE_SIZE, angleMin: Math.PI * 0.15, angleMax: Math.PI * 0.85, speedMin: 100, speedMax: 220, sizeMin: 2, sizeMax: 4, gravity: 500, life: 0.5 }));
        }
    }

    spawnDebris(count, options) {
        for (var i = 0; i < count; i++) {
            var angle = options.angleMin + Math.random() * (options.angleMax - options.angleMin);
            var speed = options.speedMin + Math.random() * (options.speedMax - options.speedMin);
            this.debris.push({
                x: options.x + (Math.random() - 0.5) * options.spread,
                y: options.y + (Math.random() - 0.5) * options.spread,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rot: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * options.spin,
                size: options.sizeMin + Math.random() * (options.sizeMax - options.sizeMin),
                color: options.colors[Math.floor(Math.random() * options.colors.length)],
                gravity: options.gravity,
                life: options.life,
                maxLife: options.life,
                outline: options.outline
            });
        }
        if (this.debris.length > 80) {
            this.debris.splice(0, this.debris.length - 80);
        }
    }

    nearestAheadSpike() {
        for (const spike of this.spikes) {
            if (spike.state === "ahead" && spike.x - spikeHalfWidth(spike.type) + 0.01 >= this.player.x) {
                return spike;
            }
        }
        return null;
    }

    getTargetLetter() {
        const spike = this.nearestAheadSpike();
        return spike ? spike.letter : null;
    }

    getObstacleType() {
        const spike = this.nearestAheadSpike();
        return spike ? spike.type : null;
    }

    getState() {
        return {
            levelId: this.level.id,
            progressPct: this.progressPct,
            score: this.score,
            combo: this.combo,
            runHits: this.runHits,
            runWords: this.runWords,
            runCombos: this.runCombos,
            wordsMult: this.wordsMult(),
            runPerfect: this.runPerfect,
            runSeries: this.runSeries,
            runMaxCombo: this.runMaxCombo,
            runWeaponHits: this.runWeaponHits,
            // Пасхалку зараховуємо, якщо її показували хоча б секунду
            eggSeen: this.eggStart !== null && this.currentTime - this.eggStart >= 1000,
            bgTheme: this.level.bgTheme,
            weapon: !!this.weaponSpec,
            weaponId: this.weaponSpec ? this.weaponId : null,
            alive: this.player.alive,
            maxEasy: this.maxEasy,
            maxHard: this.maxHard,
            difficulty: this.difficulty
        };
    }

    getOutcome() {
        return this.outcome;
    }

    consumeJumpBuffer() {
        if (this.jumpBuffer === null) {
            return;
        }
        const spike = this.jumpBuffer;
        this.jumpBuffer = null;
        if (spike.state !== "ahead") {
            return;
        }
        const gap = spike.x - spikeHalfWidth(spike.type) - this.player.x;
        if (gap > 0 && gap <= this.okPx) {
            const perfect = gap <= this.perfectPx + this.okPx * 0.35;
            const points = calculateHitScore(true, this.scoreConfig, perfect);
            this.score += points;
            this.noteSpikeDone(spike);
            this.markSpikeCleared(spike, points);
            const distance = gap + 2 * spikeHalfWidth(spike.type) + SAFE_MARGIN;
            this.jump(distance, perfect);
        }
    }

    jump(distance, perfect) {
        const computedVy = GRAVITY * distance / (2 * this.effectiveSpeed);
        this.player.vy = computedVy > MIN_JUMP_VELOCITY ? computedVy : MIN_JUMP_VELOCITY;
        this.player.onGround = false;
        this.registerHit(perfect);
    }

    // Успішна дія (стрибок або удар зброєю): серія, монети, «Ідеально», звук
    registerHit(perfect) {
        this.pulse = 1;
        if (!this.demoMode) {
            // Кристал за кожен подоланий шип; «Ідеально» — ще +1 і бонус за серію
            this.runHits++;
            if (this.weaponSpec) {
                this.runWeaponHits++;
            }
            let gain = 1;
            let bonus = 0;
            if (perfect) {
                this.runPerfect++;
                bonus = seriesBonus(this.combo + 1);
                if (bonus > 0 && this.skinPerk === "series") {
                    bonus = Math.round(bonus * this.skinPerkValue);
                }
                this.runSeries += bonus;
                gain += 1 + bonus;
            }
            this.scorePopups.push({
                x: this.player.x,
                y: this.player.y + CUBE_SIZE * 2.4,
                text: bonus > 0 ? "Серія ×" + (this.combo + 1) + "! +" + gain : "+" + gain,
                life: bonus > 0 ? 1.4 : 0.8,
                maxLife: bonus > 0 ? 1.4 : 0.8,
                crystal: true
            });
        }
        if (perfect) {
            this.combo++;
            if (this.combo > this.runMaxCombo) {
                this.runMaxCombo = this.combo;
            }
            const count = 8 + Math.floor(Math.random() * 5);
            const isHard = this.difficulty === "HARD";
            const silverColors = ["#f0f4ff", "#c8d0e0", "#e8ecf2", "#d4dce8", "#88aacc"];
            const goldColors = ["#ffd700", "#ffaa00", "#ffe14d", "#ff8c00", "#ffcc44"];
            const palette = isHard ? goldColors : silverColors;
            for (var pi = 0; pi < count; pi++) {
                var angle = Math.random() * Math.PI * 2;
                var speed = 40 + Math.random() * 120;
                this.perfectParticles.push({
                    x: this.player.x,
                    y: this.player.y + CUBE_SIZE / 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1.2,
                    maxLife: 1.2,
                    size: 2 + Math.random() * 3,
                    color: palette[Math.floor(Math.random() * palette.length)]
                });
            }
            this.perfectPopups.push({
                x: this.player.x,
                y: this.player.y + CUBE_SIZE,
                life: 1.5,
                maxLife: 1.5
            });
            this.perfectFlash = PERFECT_FLASH_TIME;
        } else {
            this.combo = 0;
        }
        this.waves.push({ r: 10, alpha: 0.8 });
        // Зі зброєю звук стрибка не граємо — у зброї свої звуки
        if (typeof this.onJump === "function" && !this.weaponSpec) {
            this.onJump();
        }
    }

    // Множник монет за слова й комбінації (бонус скіна)
    wordsMult() {
        return this.skinPerk === "words" ? this.skinPerkValue : 1;
    }

    // Щит легендарного скіна: пробачає одну помилку чи зіткнення за рівень.
    // Повертає true, якщо щит спрацював (тоді вибуху немає)
    useShield() {
        if (!this.shieldReady || this.demoMode || !this.player.alive) {
            return false;
        }
        this.shieldReady = false;
        this.shieldFlash = 1;
        this.combo = 0;
        this.scorePopups.push({
            x: this.player.x,
            y: this.player.y + CUBE_SIZE * 2.2,
            text: "🛡 Щит!",
            life: 1.3,
            maxLife: 1.3
        });
        return true;
    }

    // Помилка, що мала б закінчитися вибухом. kind: "wrong" (не та літера на HARD),
    // "late" (запізнення на HARD), "collision" (зіткнення з шипом).
    // Спершу безкоштовний щит скіна, потім пропозиція сердечка, інакше — вибух
    failAt(kind, spike, gap) {
        if (this.useShield()) {
            this.forgiveMistake(kind, spike, gap);
            return "forgiven";
        }
        if (!this.demoMode && typeof this.onReviveOffer === "function" && save.getHearts() > 0 && this.player.alive) {
            this.pendingRevive = { kind: kind, spike: spike, gap: gap };
            this.paused = true;
            this.pauseReason = "revive";
            this.onReviveOffer(save.getHearts());
            return "paused";
        }
        if (kind === "collision" && spike) {
            spike.state = "hit";
        }
        this.explode();
        return "exploded";
    }

    // Пробачена помилка: після запізнення кубик сам перестрибує шип, після зіткнення
    // шип розбивається; після не тієї літери можна просто натиснути правильну
    forgiveMistake(kind, spike, gap) {
        if (!spike) {
            return;
        }
        if (kind === "late") {
            this.markSpikeCleared(spike, 0);
            this.jump(Math.max(0, gap) + 2 * spikeHalfWidth(spike.type) + SAFE_MARGIN, false);
        } else if (kind === "collision") {
            this.markSpikeCleared(spike, 0);
        }
    }

    // Гравець погодився використати сердечко (Enter). Гра лишається на паузі,
    // доки гравець не натисне Пробіл — встигне приготуватися
    acceptRevive() {
        const r = this.pendingRevive;
        if (!r) {
            return;
        }
        this.pendingRevive = null;
        this.paused = true;
        this.pauseReason = "resume";
        save.useHeart();
        this.heartFlash = 1;
        this.combo = 0;
        this.scorePopups.push({
            x: this.player.x,
            y: this.player.y + CUBE_SIZE * 2.2,
            text: "❤ Друге життя!",
            life: 1.4,
            maxLife: 1.4
        });
        this.forgiveMistake(r.kind, r.spike, r.gap);
    }

    // Гравець відмовився (Esc) — вибух, як зазвичай
    declineRevive() {
        const r = this.pendingRevive;
        if (!r) {
            return;
        }
        this.pendingRevive = null;
        this.paused = false;
        this.pauseReason = null;
        if (r.kind === "collision" && r.spike) {
            r.spike.state = "hit";
        }
        this.explode();
    }

    // Пауза гравця: перед стартом рівня ("start"), Пробілом ("user") чи після сердечка ("resume").
    // Під час вікна «Друге життя?» не вмикається й не знімається
    pauseGame(reason) {
        if (this.demoMode || this.outcome !== "running" || !this.player.alive || this.pendingRevive) {
            return false;
        }
        this.paused = true;
        this.pauseReason = reason || "user";
        return true;
    }

    resumeGame() {
        if (!this.paused || this.pendingRevive) {
            return false;
        }
        this.paused = false;
        this.pauseReason = null;
        return true;
    }

    // Чи стоїть гра на паузі гравця (не вікно сердечка)
    isUserPaused() {
        return this.paused && !this.pendingRevive;
    }

    explode() {
        if (!this.player.alive) {
            return;
        }
        this.jumpBuffer = null;
        this.player.alive = false;
        this.deathTimer = 0;
        this.combo = 0;
        const isDemon = this.level.bgTheme === "pixel_nether";
        const palette = isDemon
            ? ["#ff1111", "#ff4400", "#ffe14d"]
            : ["#00f6ff", "#ff2ea6", "#ffe14d", "#00ff88"];
        if (this.cameraMotion) {
            this.shakeTime = SHAKE_TIME;
        }
        const count = isDemon ? 20 : 8;
        const gameX = this.player.x;
        const gameY = this.player.y + CUBE_SIZE / 2;
        // Ефект вибуху, куплений у магазині
        this.boom = { id: save.getEquipped("explosion"), t: 0, x: gameX, y: gameY };
        BackgroundRenderer.createParticles(gameX, gameY, count, palette);
        // Кубик розлітається на квадратні уламки кольорів свого скіна
        this.spawnDebris(22, {
            x: gameX,
            y: gameY,
            spread: CUBE_SIZE * 0.6,
            angleMin: 0,
            angleMax: Math.PI * 2,
            speedMin: 120,
            speedMax: 380,
            sizeMin: CUBE_SIZE * 0.14,
            sizeMax: CUBE_SIZE * 0.3,
            spin: 14,
            colors: sampleSkinColors(this.getSkinRenderType()),
            gravity: 900,
            life: 1.1,
            outline: true
        });
        if (typeof this.onExplode === "function") {
            this.onExplode();
        }
    }

    handleLetter(letter) {
        if (this.paused) {
            return { result: "paused", letter: letter };
        }
        if (this.demoMode || !this.player.alive || this.outcome !== "running") {
            return { result: "no_target", letter: letter };
        }
        const upperLetter = letter.toUpperCase();
        const spike = this.nearestAheadSpike();
        if (!spike) {
            // Після останнього шипа цілі немає — натискання ні на що не впливає навіть у HARD
            return { result: "no_target", letter: letter };
        }
        const gap = spike.x - spikeHalfWidth(spike.type) - this.player.x;
        const inWindow = gap > 0 && gap <= this.okPx && this.player.onGround;
        const correct = upperLetter === spike.letter.toUpperCase();

        // У повітрі правильна літера запам'ятовується лише тоді, коли шип уже в зоні.
        // Траса будується так, що приземлення завжди відбувається до початку зони
        // наступного шипа, тож натискання в повітрі — це зарано (як і на землі).
        if (correct && !this.player.onGround && gap > 0 && gap <= this.okPx) {
            this.jumpBuffer = spike;
            return { result: "correct", letter: letter };
        }

        if (correct && inWindow) {
            const perfect = gap <= this.perfectPx + this.okPx * 0.35;
            const points = calculateHitScore(true, this.scoreConfig, perfect);
            this.score += points;
            this.noteSpikeDone(spike);
            if (this.weaponSpec) {
                this.strike(spike, gap, perfect, points);
                return { result: "correct", letter: letter };
            }
            this.markSpikeCleared(spike, points);
            const distance = gap + 2 * spikeHalfWidth(spike.type) + SAFE_MARGIN;
            this.jump(distance, perfect);
            return { result: "correct", letter: letter };
        }

        // Не та літера (або правильна, але зарано) — помилка на цьому шипі
        if (!correct) {
            this.noteSpikeMiss(spike);
        }
        this.worldReact();
        if (this.difficulty === "HARD") {
            const fate = this.failAt("wrong", spike, 0);
            if (fate === "exploded") {
                return { result: "exploded", letter: letter };
            }
            return { result: fate === "paused" ? "paused" : "wrong", letter: letter };
        }

        return { result: "wrong", letter: letter };
    }

    // ---------- Зброя ----------

    // Правильна літера зі зброєю: шип «приречений» (більше не може зачепити кубик
    // і не є ціллю), а сама атака добігає своїм ходом — удар, снаряд або промінь
    strike(spike, gap, perfect, points) {
        spike.state = "doomed";
        spike.points = points;
        spike.chunks = 0;
        this.registerHit(perfect);
        const spec = this.weaponSpec;
        const muzzleX = this.player.x + CUBE_SIZE * 0.6;
        const muzzleY = CUBE_SIZE * 0.55;
        const targetY = spike.type === "saw" ? SPIKE_H * 0.6 : SPIKE_H * 0.4;
        if (spec.mode === "melee" || (spec.mode === "axe" && gap <= spec.reach)) {
            // Замах одразу; удар — коли шип підійде на відстань руки
            this.attacks.push({ kind: "melee", spike: spike, stage: "wait", t: 0, hit: false });
        } else if (spec.mode === "beam") {
            const beamAttack = { kind: "beam", spike: spike, stage: "beam", t: 0, hit: false };
            if (spec.beam === "gravity") {
                // Промінь гравітаційної гармати дотягується тим швидше, чим ближче шип
                beamAttack.hitAt = gravityGrabTime(spike.x - muzzleX);
                beamAttack.time = beamAttack.hitAt + GRAVITY_LIFT;
            }
            this.attacks.push(beamAttack);
            this.emitWeaponSound("fire");
            this.weaponRecoil = 1;
        } else {
            const count = spec.mode === "burst" ? spec.count : 1;
            for (let i = 0; i < count; i++) {
                this.shots.push({
                    kind: spec.mode === "axe" ? (spec.saber ? "saber" : "axe") : spec.projectile,
                    color: spec.saber || null,
                    spike: spike,
                    t: -(spec.gap || 0) * i,
                    index: i,
                    last: i === count - 1,
                    fromX: muzzleX,
                    fromY: muzzleY,
                    toX: spike.x,
                    toY: targetY,
                    arc: spec.arc || 0,
                    dur: Math.max(0.06, (spike.x - muzzleX) / spec.speed),
                    returning: false,
                    prev: []
                });
            }
            this.emitWeaponSound("fire");
            this.weaponRecoil = 1;
        }
    }

    // Облік літери для статистики помилок (у демо не ведеться)
    noteLetter(letter, ok) {
        if (this.demoMode || !letter) {
            return;
        }
        const s = this.letterStats[letter] || (this.letterStats[letter] = { ok: 0, miss: 0 });
        if (ok) {
            s.ok++;
        } else {
            s.miss++;
        }
    }

    // Помилка на шипі (не та літера, запізнення, зіткнення) — рахується один раз на шип
    noteSpikeMiss(spike) {
        if (spike && !spike.missed) {
            spike.missed = true;
            this.noteLetter(spike.letter, false);
        }
    }

    // Шип подолано правильною літерою: статистика й бонус за слово без помилок
    noteSpikeDone(spike) {
        if (!spike.missed) {
            this.noteLetter(spike.letter, true);
        }
        if (this.demoMode || spike.word === undefined || spike.charIdx !== spike.word.length - 1) {
            return;
        }
        const wordSpikes = this.spikes.filter(function (s) { return s.wordIdx === spike.wordIdx; });
        if (spike.combo && wordSpikes.every(function (s) { return !s.missed; })) {
            this.runCombos++;
            const kind = COMBO_KINDS[spike.combo];
            this.scorePopups.push({
                x: spike.x,
                y: SPIKE_H + 90,
                text: (kind ? kind.unit : "Комбо") + " «" + spike.word + "»! +" + COMBO_BONUS * this.wordsMult(),
                life: 1.3,
                maxLife: 1.3,
                crystal: true
            });
        } else if (!spike.combo && wordSpikes.every(function (s) { return !s.missed; })) {
            this.runWords++;
            this.scorePopups.push({
                x: spike.x,
                y: SPIKE_H + 90,
                text: "Слово «" + spike.word + "»! +" + WORD_BONUS * this.wordsMult(),
                life: 1.5,
                maxLife: 1.5,
                crystal: true
            });
        }
    }

    // Статистика літер за забіг (main зберігає її після завершення)
    getLetterStats() {
        return this.letterStats;
    }

    // Звук зброї для події «fire» / «swing» / «hit»
    emitWeaponSound(event) {
        if (typeof this.onSound !== "function" || !this.weaponSpec) {
            return;
        }
        const cue = getWeaponSound(this.weaponId, event);
        if (cue) {
            this.onSound(cue);
        }
    }

    // Шип знищено: запускаємо анімацію руйнування й уламки під конкретну зброю
    destroySpike(spike) {
        if (spike.state === "cleared") {
            return;
        }
        const fx = this.weaponSpec ? this.weaponSpec.fx : "shatter";
        spike.state = "cleared";
        spike.clearedAt = this.currentTime;
        spike.fx = { kind: fx, t0: this.currentTime };
        this.emitWeaponSound("hit");
        const colors = SPIKE_STYLE_COLORS[this.spikeStyle] || [this.level.accentColor || "#ff2ea6", "#ffffff"];
        const base = { x: spike.x, y: SPIKE_H * 0.4, spread: SPIKE_W * 0.6, spin: 10, colors: colors, outline: true };
        if (fx === "shatter" || fx === "pop") {
            this.spawnDebris(fx === "shatter" ? 16 : 10, Object.assign(base, { angleMin: Math.PI * 0.05, angleMax: Math.PI * 0.95, speedMin: 120, speedMax: 300, sizeMin: 3, sizeMax: 7, gravity: 800, life: 0.8 }));
            if (fx === "shatter") {
                this.stuckArrows.push({ x: spike.x + SPIKE_W * 0.3, t: 0 });
            }
        } else if (fx === "split") {
            this.spawnDebris(8, Object.assign(base, { colors: ["#c8883a", "#8a5a2a", colors[0]], angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 90, speedMax: 200, sizeMin: 3, sizeMax: 5, gravity: 700, life: 0.7 }));
        } else if (fx === "slice") {
            this.spawnDebris(6, Object.assign(base, { colors: ["#ffffff", "#8ad8ff"], angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.6, speedMin: 120, speedMax: 260, sizeMin: 2, sizeMax: 4, gravity: 600, life: 0.5, outline: false }));
        } else if (fx === "crumble") {
            this.spawnDebris(8, Object.assign(base, { y: SPIKE_H * 0.15, angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 60, speedMax: 150, sizeMin: 3, sizeMax: 6, gravity: 700, life: 0.6 }));
        } else if (fx === "melt") {
            this.spawnDebris(12, Object.assign(base, { colors: ["rgba(80, 80, 90, 0.9)", "rgba(140, 140, 150, 0.8)", "#ff8a2a"], angleMin: Math.PI * 0.35, angleMax: Math.PI * 0.65, speedMin: 30, speedMax: 90, sizeMin: 2, sizeMax: 5, gravity: -120, life: 1.2, outline: false, spin: 3 }));
        } else if (fx === "blast") {
            this.spawnDebris(22, Object.assign(base, { colors: colors.concat(["#ffb81a", "#3a2a1a"]), angleMin: Math.PI * 0.05, angleMax: Math.PI * 0.95, speedMin: 200, speedMax: 480, sizeMin: 4, sizeMax: 9, gravity: 900, life: 1.1, spin: 16 }));
            if (this.cameraMotion) {
                this.shakeTime = Math.max(this.shakeTime, SHAKE_TIME * 0.6);
            }
        } else if (fx === "burn") {
            this.spawnDebris(14, Object.assign(base, { colors: ["#ffb81a", "#ff5a1a", "#ffe680", "rgba(60, 50, 50, 0.9)"], angleMin: Math.PI * 0.3, angleMax: Math.PI * 0.7, speedMin: 40, speedMax: 120, sizeMin: 2, sizeMax: 4, gravity: -140, life: 1.4, outline: false, spin: 3 }));
        } else if (fx === "saber_green" || fx === "saber_blue" || fx === "saber_red") {
            const glow = this.weaponSpec.saber || "#ffffff";
            this.spawnDebris(10, Object.assign(base, { colors: [glow, "#ffffff", colors[0]], angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.8, speedMin: 90, speedMax: 240, sizeMin: 2, sizeMax: 4, gravity: 300, life: 0.7, outline: false }));
        } else if (fx === "fireslice") {
            this.spawnDebris(12, Object.assign(base, { colors: ["#ffb81a", "#ff5a1a", "#fff4a0"], angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.8, speedMin: 90, speedMax: 240, sizeMin: 2, sizeMax: 4, gravity: 200, life: 0.8, outline: false }));
        } else if (fx === "zap") {
            this.spawnDebris(16, Object.assign(base, { colors: colors.concat(["#bff4ff", "#ffffff"]), angleMin: Math.PI * 0.05, angleMax: Math.PI * 0.95, speedMin: 140, speedMax: 340, sizeMin: 3, sizeMax: 7, gravity: 800, life: 0.8 }));
            if (this.cameraMotion) {
                this.shakeTime = Math.max(this.shakeTime, SHAKE_TIME * 0.35);
            }
        } else if (fx === "fling") {
            this.spawnDebris(10, Object.assign(base, { colors: ["#c8a8ff", "#8a6aff", "#ffffff"], angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 30, speedMax: 110, sizeMin: 2, sizeMax: 4, gravity: -60, life: 1.0, outline: false, spin: 4 }));
        } else if (fx === "plasma") {
            this.spawnDebris(16, Object.assign(base, { colors: ["#7affd8", "#3affc0", "#ffffff"], angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.9, speedMin: 60, speedMax: 200, sizeMin: 2, sizeMax: 4, gravity: -80, life: 1.0, outline: false, spin: 4 }));
        } else if (fx === "shred") {
            this.spawnDebris(10, Object.assign(base, { colors: colors.concat(["#dfe8f4"]), angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.9, speedMin: 100, speedMax: 260, sizeMin: 2, sizeMax: 5, gravity: 800, life: 0.7 }));
        } else if (fx === "break") {
            this.spawnDebris(12, Object.assign(base, { angleMin: Math.PI * 0.15, angleMax: Math.PI * 0.85, speedMin: 100, speedMax: 240, sizeMin: 5, sizeMax: 9, gravity: 900, life: 0.8, spin: 6 }));
        }
        if (spike.points > 0) {
            this.scorePopups.push({ x: spike.x, y: SPIKE_H + 12, text: "+" + spike.points, life: 0.9, maxLife: 0.9, points: true });
        }
    }

    // Політ снарядів, удари ближнього бою й промінь лазера
    updateWeapons(dt) {
        this.weaponRecoil = Math.max(0, this.weaponRecoil - dt * 3.2);
        for (let i = this.attacks.length - 1; i >= 0; i--) {
            const a = this.attacks[i];
            if (a.kind === "melee") {
                if (a.stage === "wait") {
                    const gap = a.spike.x - spikeHalfWidth(a.spike.type) - this.player.x;
                    if (gap <= meleeTriggerGap(CUBE_SIZE, this.effectiveSpeed)) {
                        a.stage = "swing";
                        this.emitWeaponSound("swing");
                        a.t = 0;
                    }
                    continue;
                }
                a.t += dt;
                // Лезо влучає, коли шип дійшов майже впритул (з поправкою на пів кадру),
                // а не за таймером — тоді проміжок однаковий на будь-якій швидкості
                const hitGap = a.spike.x - spikeHalfWidth(a.spike.type) - this.player.x;
                const contactGap = CUBE_SIZE / 2 + MELEE_CONTACT + this.effectiveSpeed * dt * 0.5;
                if (!a.hit && (hitGap <= contactGap || a.t >= SWING_HIT * 2)) {
                    a.hit = true;
                    this.destroySpike(a.spike);
                    if (this.weaponSpec.bolt) {
                        // Громовий молот: у мить удару з неба б'є блискавка
                        this.attacks.push({ kind: "bolt", spike: a.spike, stage: "bolt", t: 0, hit: true });
                    }
                }
                if (a.t >= SWING_TIME) {
                    this.attacks.splice(i, 1);
                }
            } else if (a.kind === "bolt") {
                a.t += dt;
                if (a.t >= BOLT_TIME) {
                    this.attacks.splice(i, 1);
                }
            } else {
                a.t += dt;
                const timing = a.time ? { time: a.time, hit: a.hitAt } : beamTiming(this.weaponSpec);
                // Поки діє струмінь чи промінь, зброя лишається «в роботі»
                this.weaponRecoil = Math.max(this.weaponRecoil, 1 - a.t / timing.time);
                if (!a.hit && a.t >= timing.hit) {
                    a.hit = true;
                    this.destroySpike(a.spike);
                }
                if (a.t >= timing.time) {
                    this.attacks.splice(i, 1);
                }
            }
        }
        for (let i = this.shots.length - 1; i >= 0; i--) {
            const s = this.shots[i];
            s.t += dt;
            if (s.t < 0) {
                continue;
            }
            if (s.index > 0 && s.t - dt < 0) {
                // Наступна куля черги вилітає з дула — рухаємо старт разом із кубиком
                s.fromX = this.player.x + CUBE_SIZE * 0.6;
                s.dur = Math.max(0.05, (s.toX - s.fromX) / this.weaponSpec.speed);
                this.weaponRecoil = 1;
            }
            const pos = this.shotPosition(s);
            s.prev.unshift({ x: pos.x, y: pos.y });
            if (s.prev.length > 8) {
                s.prev.pop();
            }
            if (!s.returning && s.t >= s.dur) {
                if ((s.kind === "bullet" || s.kind === "shuriken") && !s.last) {
                    // Куля черги чи сюрикен відколює шматок зверху
                    s.spike.chunks = Math.max(s.spike.chunks || 0, s.index + 1);
                    this.spawnDebris(4, { x: s.spike.x, y: SPIKE_H * (1 - (s.index + 1) * 0.22), spread: SPIKE_W * 0.4, angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 80, speedMax: 180, sizeMin: 3, sizeMax: 5, spin: 8, colors: SPIKE_STYLE_COLORS[this.spikeStyle] || [this.level.accentColor || "#ff2ea6"], gravity: 700, life: 0.5, outline: true });
                } else {
                    this.destroySpike(s.spike);
                }
                if (s.kind === "axe" || s.kind === "saber") {
                    // Сокира-бумеранг і світловий меч повертаються в руку
                    s.returning = true;
                    s.t = 0;
                    s.dur = 0.32;
                    s.fromX = s.toX;
                    s.fromY = s.toY;
                } else {
                    this.shots.splice(i, 1);
                }
                continue;
            }
            if (s.returning && s.t >= s.dur) {
                this.shots.splice(i, 1);
            }
        }
        for (let i = this.stuckArrows.length - 1; i >= 0; i--) {
            this.stuckArrows[i].t += dt;
            if (this.stuckArrows[i].t > 2) {
                this.stuckArrows.splice(i, 1);
            }
        }
    }

    // Позиція снаряда в ігрових координатах (y — вгору від землі)
    shotPosition(s) {
        const u = Math.min(1, Math.max(0, s.t / s.dur));
        if (s.returning) {
            // Назад — до руки кубика, що біжить уперед
            const hx = this.player.x + CUBE_SIZE * 0.5;
            const hy = CUBE_SIZE * 0.6;
            return {
                x: s.fromX + (hx - s.fromX) * u,
                y: s.fromY + (hy - s.fromY) * u + Math.sin(Math.PI * u) * 30,
                u: u
            };
        }
        return {
            x: s.fromX + (s.toX - s.fromX) * u,
            y: s.fromY + (s.toY - s.fromY) * u + Math.sin(Math.PI * u) * s.arc,
            u: u
        };
    }

    // Поза зброї в руці: замах, фаза удару, віддача, чи кинуто сокиру
    weaponPose() {
        let raise = 0;
        let swing = -1;
        for (const a of this.attacks) {
            if (a.kind !== "melee") {
                continue;
            }
            if (a.stage === "wait") {
                raise = 1;
            } else {
                swing = Math.max(swing, a.t / SWING_TIME);
            }
        }
        let away = false;
        for (const s of this.shots) {
            if (s.kind === "axe" || s.kind === "saber") {
                away = true;
            }
        }
        return { raise: raise, swing: swing, recoil: this.weaponRecoil, away: away };
    }

    // Снаряди, промінь лазера й стріли в землі
    renderWeapons(ctx, groundY, anchorX, camX) {
        if (!this.weaponSpec) {
            return;
        }
        const time = this.currentTime;
        for (const arrow of this.stuckArrows) {
            drawStuckArrow(ctx, anchorX + arrow.x - camX, groundY, arrow.t, CUBE_SIZE);
        }
        for (const a of this.attacks) {
            if (a.kind === "beam") {
                const x1 = anchorX + CUBE_SIZE * 0.6 + CUBE_SIZE * 0.08;
                const y1 = groundY - this.player.y - CUBE_SIZE / 2 - CUBE_SIZE * 0.03;
                let x2 = anchorX + a.spike.x - camX;
                let y2 = groundY - SPIKE_H * 0.45;
                if (this.weaponSpec.beam === "gravity" && a.spike.fx) {
                    // Кінець променя тримає шип, що піднімається й підтягується до кубика
                    const hold = gravityHoldOffset((this.currentTime - a.spike.fx.t0) / 1000, SPIKE_H, anchorX + CUBE_SIZE * GRAVITY_PULL_AHEAD - x2);
                    x2 += hold.dx;
                    y2 += hold.dy;
                }
                const beamTime = a.time || beamTiming(this.weaponSpec).time;
                drawBeam(ctx, this.weaponSpec.beam, x1, y1, x2, y2, a.t / beamTime, time, a.time ? a.hitAt / a.time : undefined);
            } else if (a.kind === "bolt") {
                const bx = anchorX + a.spike.x - camX;
                const by = groundY - SPIKE_H * 0.45;
                drawBeam(ctx, "thunder", bx, by, bx, by, a.t / BOLT_TIME, time);
            }
        }
        for (const s of this.shots) {
            if (s.t < 0) {
                continue;
            }
            const pos = this.shotPosition(s);
            const prev = s.prev.length > 1 ? s.prev[1] : { x: s.fromX, y: s.fromY };
            const angle = Math.atan2(-(pos.y - prev.y), pos.x - prev.x);
            const trail = s.prev.map(function (p) { return { x: anchorX + p.x - camX, y: groundY - p.y }; });
            drawProjectile(ctx, s.kind, anchorX + pos.x - camX, groundY - pos.y, angle, s.t, CUBE_SIZE, trail, s.color);
        }
    }

    // Світ реагує на кожну помилку: гуркіт грому, гудіння трибун, спалах очей дракона…
    // На рівні боса демон реве, а екран ледь здригається
    worldReact() {
        this.oopsTime = OOPS_TIME;
        if (this.level.bgTheme === "pixel_nether" && this.cameraMotion) {
            this.shakeTime = Math.max(this.shakeTime, SHAKE_TIME * 0.4);
        }
    }

    update(dt) {
        if (this.outcome === "won") {
            return;
        }
        // Пауза, поки гравець вирішує щодо сердечка
        if (this.paused) {
            return;
        }

        this.currentTime = performance.now();
        this.pulse = Math.max(0, this.pulse - dt * 2.2);
        for (const wave of this.waves) {
            wave.r += dt * 620;
            wave.alpha -= dt * 1.1;
        }
        this.waves = this.waves.filter(function (w) { return w.alpha > 0; });

        BackgroundRenderer.updateParticles(dt);

        for (var ppi = this.perfectParticles.length - 1; ppi >= 0; ppi--) {
            var pp = this.perfectParticles[ppi];
            pp.life -= dt;
            if (pp.life <= 0) {
                this.perfectParticles.splice(ppi, 1);
                continue;
            }
            pp.x += pp.vx * dt;
            pp.y += pp.vy * dt;
            pp.vy += 400 * dt;
        }
        for (var poi = this.perfectPopups.length - 1; poi >= 0; poi--) {
            var po = this.perfectPopups[poi];
            po.life -= dt;
            if (po.life <= 0) {
                this.perfectPopups.splice(poi, 1);
                continue;
            }
            po.y += 80 * dt;
        }
        for (var di = this.debris.length - 1; di >= 0; di--) {
            var db = this.debris[di];
            db.life -= dt;
            if (db.life <= 0) {
                this.debris.splice(di, 1);
                continue;
            }
            db.x += db.vx * dt;
            db.y += db.vy * dt;
            db.vy -= db.gravity * dt;
            db.rot += db.vr * dt;
            if (db.y < db.size / 2) {
                db.y = db.size / 2;
                db.vy = -db.vy * 0.35;
                db.vx *= 0.7;
            }
        }
        this.perfectFlash = Math.max(0, this.perfectFlash - dt);
        this.shieldFlash = Math.max(0, (this.shieldFlash || 0) - dt * 1.2);
        this.heartFlash = Math.max(0, (this.heartFlash || 0) - dt * 1.2);
        if (this.boom) {
            this.boom.t += dt;
            if (this.boom.t > EXPLOSION_DURATION) {
                this.boom = null;
            }
        }
        this.shakeTime = Math.max(0, this.shakeTime - dt);
        this.oopsTime = Math.max(0, this.oopsTime - dt);
        this.elapsed += dt;
        for (var si = this.scorePopups.length - 1; si >= 0; si--) {
            var sp = this.scorePopups[si];
            sp.life -= dt;
            sp.y += 60 * dt;
            if (sp.life <= 0) {
                this.scorePopups.splice(si, 1);
            }
        }

        if (this.weaponSpec) {
            this.updateWeapons(dt);
        }

        if (!this.player.alive) {
            this.deathTimer += dt;
            if (this.demoMode) {
                this.demoRestartTimer += dt;
                if (this.demoRestartTimer >= DEMO_RESTART_DELAY) {
                    this.reset();
                }
            } else if (this.deathTimer >= DEATH_DELAY) {
                this.outcome = "dead";
            }
            return;
        }

        this.player.x += this.effectiveSpeed * dt;

        if (!this.player.onGround) {
            this.player.vy -= GRAVITY * dt;
            this.player.y += this.player.vy * dt;
            this.player.rotation += dt * 7.5;
            if (this.player.y <= 0) {
                this.player.y = 0;
                this.player.vy = 0;
                this.player.onGround = true;
                this.player.rotation = 0;
                // Пил із-під кубика при приземленні
                this.spawnDebris(8, {
                    x: this.player.x,
                    y: 2,
                    spread: CUBE_SIZE * 0.8,
                    angleMin: Math.PI * 0.05,
                    angleMax: Math.PI * 0.95,
                    speedMin: 40,
                    speedMax: 130,
                    sizeMin: 3,
                    sizeMax: 6,
                    spin: 4,
                    colors: ["rgba(200, 210, 230, 0.9)", this.level.accentColor || "#00f6ff"],
                    gravity: 260,
                    life: 0.45,
                    outline: false
                });
                this.spawnLandingReaction();
                this.consumeJumpBuffer();
            }
        }

        this.trailTick += dt;
        if (this.trailTick >= 0.016) {
            this.trailTick = 0;
            this.player.trail.push({ x: this.player.x, y: this.player.y, alpha: 0.55 });
            if (this.player.trail.length > TRAIL_MAX) {
                this.player.trail.shift();
            }
        }
        for (const point of this.player.trail) {
            point.alpha -= dt * 1.4;
        }
        this.player.trail = this.player.trail.filter(function (t) { return t.alpha > 0; });

        if (!this.player.onGround) {
            this.player.meteorTrail.unshift({ x: this.player.x, y: this.player.y, alpha: 1 });
            if (this.player.meteorTrail.length > 2) {
                this.player.meteorTrail.pop();
            }
        } else if (this.player.meteorTrail.length > 0) {
            for (var mt = 0; mt < this.player.meteorTrail.length; mt++) {
                this.player.meteorTrail[mt].alpha -= dt * 3;
            }
            this.player.meteorTrail = this.player.meteorTrail.filter(function (t) { return t.alpha > 0; });
        }

        if (this.demoMode) {
            const target = this.nearestAheadSpike();
            if (target && this.player.onGround) {
                const gap = target.x - spikeHalfWidth(target.type) - this.player.x;
                if (gap > 0 && gap <= this.okPx * 0.5 && this.weaponSpec) {
                    // Демо в меню показує куплену зброю
                    this.strike(target, gap, true, 0);
                } else if (gap > 0 && gap <= this.okPx * 0.5) {
                    this.markSpikeCleared(target, 0);
                    const distance = gap + 2 * spikeHalfWidth(target.type) + SAFE_MARGIN;
                    this.jump(distance, true);
                }
            }
        }

        if (!this.demoMode && this.difficulty === "HARD") {
            const target = this.nearestAheadSpike();
            if (target && this.player.onGround) {
                const gap = target.x - spikeHalfWidth(target.type) - this.player.x;
                if (gap <= CUBE_SIZE * 0.4) {
                    this.noteSpikeMiss(target);
                    // Щит або сердечко перестрибують шип замість вибуху
                    if (this.failAt("late", target, gap) !== "forgiven") {
                        return;
                    }
                }
            }
        }

        for (const spike of this.spikes) {
            if (spike.state !== "ahead") {
                continue;
            }
            const dx = Math.abs(spike.x - this.player.x);
            const halfW = spikeHalfWidth(spike.type);
            if (dx < halfW + CUBE_SIZE * 0.32 && this.player.y < SPIKE_H * 0.72) {
                this.noteSpikeMiss(spike);
                // Щит або сердечко розбивають шип, і кубик їде далі
                if (this.failAt("collision", spike, 0) !== "forgiven") {
                    return;
                }
                continue;
            }
            if (spike.x + halfW < this.player.x) {
                spike.state = "cleared";
                if (spike.clearedAt === undefined) {
                    spike.clearedAt = this.currentTime;
                }
            }
        }

        for (const spike of this.spikes) {
            if (spike.type === "saw" && spike.state === "ahead") {
                spike.rotationAngle += this.effectiveSpeed * 0.02 * dt;
            }
        }

        this.progressPct = Math.min(100, (this.player.x / this.finishX) * 100);
        if (this.player.x >= this.finishX) {
            this.progressPct = 100;
            if (this.demoMode) {
                this.reset();
            } else {
                this.outcome = "won";
                if (typeof this.onVictory === "function") {
                    this.onVictory();
                }
            }
        }
    }

    // ---------- Рендер ----------

    render(ctx, W, H, time) {
        const realTime = time;
        // Під час паузи фон і всі анімації завмирають: час рендера не йде вперед
        if (this.paused) {
            if (this.pauseStart === null) {
                this.pauseStart = time;
            }
            time = this.pauseStart - this.pausedTotal;
        } else {
            if (this.pauseStart !== null) {
                this.pausedTotal += time - this.pauseStart;
                this.pauseStart = null;
            }
            time -= this.pausedTotal;
        }
        var groundY = H * 0.64;
        var anchorX = W * PLAYER_ANCHOR;
        var camX = this.player.x;

        this.bgCache.setTheme(this.level.bgTheme);
        this.bgCache.resize(W, H);
        if (this.eggStart === null && this.progressPct / 100 >= this.eggAt) {
            this.eggStart = this.currentTime;
        }
        var eggT = this.eggStart === null ? null : (this.currentTime - this.eggStart) / EASTER_EGG_DURATION;
        BackgroundRenderer.setEffects({
            progress: this.progressPct / 100,
            combo: this.combo,
            perfect: this.perfectFlash / PERFECT_FLASH_TIME,
            eggT: eggT !== null && eggT <= 1 ? eggT : null,
            weather: this.weather,
            camY: this.cameraMotion ? this.player.y * 0.35 : 0,
            oops: this.oopsTime / OOPS_TIME,
            // Літера, яку треба натиснути зараз (гірлянда з абеткою в «Дивному містечку»)
            letter: this.getTargetLetter()
        });
        if (this.bgCache.shouldUpdate(time)) {
            var self = this;
            this.bgCache.render(function (cacheCtx) {
                BackgroundRenderer.render(cacheCtx, self.level.bgTheme, W, H, groundY, time, self.effectiveSpeed, self.level.accentColor, self.level.id);
            }, time);
        }
        // Струс екрана після вибуху (лише ігрова сцена, клавіатура нерухома)
        ctx.save();
        if (this.shakeTime > 0) {
            const amp = 9 * this.shakeTime / SHAKE_TIME;
            ctx.translate((Math.random() - 0.5) * amp * 2, (Math.random() - 0.5) * amp * 2);
        }
        this.bgCache.drawImage(ctx);
        this.renderWaves(ctx, W, groundY);
        this.renderGround(ctx, W, H, groundY, camX);
        this.renderCubeLight(ctx, groundY, anchorX);
        this.renderHitWindow(ctx, W, groundY, anchorX, time);
        this.renderFinish(ctx, W, groundY, anchorX, camX);
        this.renderObstacles(ctx, W, groundY, anchorX, camX);
        this.renderPlayer(ctx, groundY, anchorX);
        this.renderWeapons(ctx, groundY, anchorX, camX);
        BackgroundRenderer.renderParticles(ctx, groundY, anchorX, camX);
        this.renderDebris(ctx, groundY, anchorX, camX);
        if (this.boom) {
            drawExplosion(ctx, this.boom.id, this.boom.t, anchorX + this.boom.x - camX, groundY - this.boom.y, CUBE_SIZE);
        }
        this.renderPerfectParticles(ctx, groundY, anchorX, camX);
        this.renderPerfectPopups(ctx, groundY, anchorX, camX);
        this.renderScorePopups(ctx, groundY, anchorX, camX);
        ctx.restore();
        if (!this.demoMode) {
            this.renderWordBar(ctx, W);
            // Назва світу не накладається на екран паузи
            if (!this.isUserPaused()) {
                this.renderWorldTitle(ctx, W, H);
            }
            this.renderProgressBar(ctx, W);
            this.renderHearts(ctx);
            if (this.isUserPaused() && this.outcome === "running") {
                this.renderPauseOverlay(ctx, W, H, realTime);
            }
        }
    }

    // Літери рівня в порядку появи на трасі (для екрана паузи)
    getLevelLetters() {
        const seen = [];
        for (const spike of this.spikes) {
            const l = (spike.letter || "").toUpperCase();
            if (l && seen.indexOf(l) === -1) {
                seen.push(l);
            }
        }
        return seen;
    }

    // Екран паузи над ігровим полем (клавіатуру внизу не закриває):
    // заголовок, літери рівня й мигаюча підказка «Натисни ПРОБІЛ»
    renderPauseOverlay(ctx, W, H, time) {
        const areaH = H * 0.68;
        const reason = this.pauseReason;
        ctx.save();
        ctx.fillStyle = "rgba(5, 6, 20, 0.72)";
        ctx.fillRect(0, 0, W, areaH);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const unit = Math.min(W, H);
        // Заголовок
        const title = reason === "start" ? "ГОТОВИЙ?" : reason === "resume" ? "❤ ДРУГЕ ЖИТТЯ" : "ПАУЗА";
        ctx.font = "bold " + Math.round(unit * 0.075) + "px 'Segoe UI', Arial, sans-serif";
        ctx.lineWidth = Math.max(3, unit * 0.008);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
        ctx.strokeText(title, W / 2, areaH * 0.2);
        ctx.fillStyle = reason === "resume" ? "#ff6a8a" : "#00f6ff";
        ctx.fillText(title, W / 2, areaH * 0.2);
        // Літери рівня — великими плашками
        const letters = this.getLevelLetters();
        ctx.font = Math.round(unit * 0.028) + "px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#c8d6f0";
        ctx.fillText("Літери рівня:", W / 2, areaH * 0.38);
        const size = Math.min(unit * 0.085, (W * 0.9) / Math.max(1, letters.length) - unit * 0.015);
        const gap = unit * 0.015;
        const rowW = letters.length * size + (letters.length - 1) * gap;
        let x = W / 2 - rowW / 2;
        const y = areaH * 0.52 - size / 2;
        ctx.font = "bold " + Math.round(size * 0.55) + "px 'Segoe UI', Arial, sans-serif";
        for (const letter of letters) {
            ctx.fillStyle = "rgba(0, 246, 255, 0.12)";
            ctx.fillRect(x, y, size, size);
            ctx.strokeStyle = "#00f6ff";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(letter, x + size / 2, y + size / 2 + 1);
            x += size + gap;
        }
        // Мигаюча підказка
        // time — секунди (як у головному циклі)
        const blink = 0.55 + 0.45 * Math.sin(time * 5);
        const action = reason === "start" ? "почати" : "продовжити";
        ctx.globalAlpha = blink;
        ctx.font = "bold " + Math.round(unit * 0.042) + "px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#ffe14d";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
        ctx.lineWidth = Math.max(3, unit * 0.006);
        const prompt = "Натисни ПРОБІЛ, щоб " + action;
        ctx.strokeText(prompt, W / 2, areaH * 0.74);
        ctx.fillText(prompt, W / 2, areaH * 0.74);
        ctx.globalAlpha = 1;
        ctx.font = Math.round(unit * 0.024) + "px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#9fb4d8";
        const note = reason === "start"
            ? "Під час гри Пробіл — пауза · Esc — вийти в меню"
            : "Esc — вийти в меню";
        ctx.fillText(note, W / 2, areaH * 0.86);
        ctx.restore();
    }

    // Запас сердечок — у лівому верхньому куті під панеллю
    renderHearts(ctx) {
        const count = save.getHearts();
        if (count <= 0 && this.heartFlash <= 0) {
            return;
        }
        const x = 26;
        const y = 78;
        ctx.save();
        const pulse = 1 + (this.heartFlash || 0) * 0.5;
        drawHeartLife(ctx, x, y, 28 * pulse, performance.now());
        ctx.font = "bold 18px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(5, 5, 20, 0.9)";
        ctx.strokeText("×" + count, x + 18, y + 2);
        ctx.fillStyle = "#ffe14d";
        ctx.fillText("×" + count, x + 18, y + 2);
        ctx.restore();
    }

    // Рівень-слова: під панеллю прогресу — поточне слово, набрані літери зелені,
    // потрібна зараз — жовта, решта — білі
    renderWordBar(ctx, W) {
        if (!Array.isArray(this.level.words) || this.spikes.length === 0) {
            return;
        }
        let current = this.nearestAheadSpike();
        if (!current) {
            for (let i = this.spikes.length - 1; i >= 0; i--) {
                if (this.spikes[i].state !== "ahead") {
                    current = this.spikes[i];
                    break;
                }
            }
        }
        if (!current || current.word === undefined) {
            return;
        }
        const wordSpikes = this.spikes.filter(function (s) { return s.wordIdx === current.wordIdx; });
        const cell = 34;
        const gapPx = 6;
        const total = wordSpikes.length * cell + (wordSpikes.length - 1) * gapPx;
        const x0 = Math.round(W / 2 - total / 2);
        const y0 = 64;
        ctx.save();
        ctx.fillStyle = "rgba(5, 8, 20, 0.72)";
        roundedRectPath(ctx, x0 - 14, y0 - 8, total + 28, cell + 16, 10);
        ctx.fill();
        ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let i = 0; i < wordSpikes.length; i++) {
            const s = wordSpikes[i];
            const x = x0 + i * (cell + gapPx);
            const done = s.state !== "ahead";
            const isCurrent = s === current && s.state === "ahead";
            ctx.fillStyle = done ? (s.missed ? "rgba(120, 40, 60, 0.9)" : "rgba(20, 90, 50, 0.95)") : isCurrent ? "rgba(90, 80, 20, 0.95)" : "rgba(40, 44, 70, 0.9)";
            roundedRectPath(ctx, x, y0, cell, cell, 6);
            ctx.fill();
            ctx.strokeStyle = done ? (s.missed ? "#ff4466" : "#39ff88") : isCurrent ? "#ffe14d" : "rgba(160, 170, 210, 0.5)";
            ctx.lineWidth = isCurrent ? 2.5 : 1.5;
            ctx.stroke();
            ctx.fillStyle = done ? "#ffffff" : isCurrent ? "#ffe14d" : "#e8ecf8";
            ctx.fillText(s.letter, x + cell / 2, y0 + cell / 2 + 1);
        }
        ctx.restore();
    }

    // Світло від кубика кольору скіна підсвічує землю й найближчі шипи
    renderCubeLight(ctx, groundY, anchorX) {
        if (!this.player.alive) {
            return;
        }
        let base = sampleSkinColors(this.getSkinRenderType())[0] || "rgb(0, 246, 255)";
        if (base.charAt(0) === "#") {
            base = "rgb(" + parseInt(base.slice(1, 3), 16) + ", " + parseInt(base.slice(3, 5), 16) + ", " + parseInt(base.slice(5, 7), 16) + ")";
        }
        const color = base.replace("rgb(", "rgba(").replace(")", ", 0.28)");
        const cy = groundY - this.player.y - CUBE_SIZE / 2;
        const r = 150;
        const light = ctx.createRadialGradient(anchorX, cy, 10, anchorX, cy, r);
        light.addColorStop(0, color);
        light.addColorStop(1, base.replace("rgb(", "rgba(").replace(")", ", 0)"));
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = light;
        ctx.fillRect(anchorX - r, cy - r, r * 2, r * 2);
        ctx.restore();
    }

    // Заставка світу: назва плавно з'являється на початку рівня й зникає
    renderWorldTitle(ctx, W, H) {
        if (this.elapsed >= TITLE_TIME) {
            return;
        }
        const name = BackgroundRenderer.worldName(this.level.bgTheme);
        if (!name) {
            return;
        }
        const t = this.elapsed;
        const alpha = Math.min(1, t / 0.35, (TITLE_TIME - t) / 0.6);
        const rise = (1 - Math.min(1, t / 0.35)) * 20;
        const accent = this.level.accentColor || "#00f6ff";
        let y = H * 0.24 + rise;
        let jitterX = 0;
        // Заставка боса тремтить, а над нею розплющується око демона
        const isBoss = this.level.bgTheme === "pixel_nether";
        if (isBoss) {
            jitterX = (Math.random() - 0.5) * 6;
            y += (Math.random() - 0.5) * 6;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "900 " + Math.round(H * 0.07) + "px 'Segoe UI', Arial, sans-serif";
        // Піксельна «об'ємна» тінь
        ctx.fillStyle = "rgba(5, 5, 20, 0.9)";
        for (let k = 4; k >= 1; k--) {
            ctx.fillText(name.toUpperCase(), W / 2 + k * 2, y + k * 2);
        }
        ctx.fillStyle = accent;
        ctx.fillText(name.toUpperCase(), W / 2 + 2 + jitterX, y);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(name.toUpperCase(), W / 2 + jitterX, y - 2);
        if (isBoss) {
            const eyeOpen = Math.min(1, t / 1.2);
            const eh = Math.max(2, H * 0.03 * eyeOpen);
            const ey = y - H * 0.1;
            ctx.fillStyle = "rgba(255, 40, 0, 0.35)";
            ctx.fillRect(W / 2 - H * 0.09, ey - eh, H * 0.18, eh * 2);
            ctx.fillStyle = "#ffea00";
            ctx.fillRect(W / 2 - H * 0.06, ey - eh / 2, H * 0.12, eh);
            ctx.fillStyle = "#8a0000";
            ctx.fillRect(W / 2 - H * 0.008, ey - eh / 2, H * 0.016, eh);
        }
        if (this.leagueInfo) {
            ctx.font = "bold " + Math.round(H * 0.028) + "px 'Segoe UI', Arial, sans-serif";
            // Темна тінь під підписом — щоб читався й на світлому тлі
            ctx.fillStyle = "rgba(5, 5, 20, 0.85)";
            ctx.fillText("Рівень " + this.leagueInfo.levelNumber + " · " + (this.leagueInfo.lettersText || ""), W / 2 + 2, y + H * 0.065 + 2);
            ctx.fillStyle = accent;
            ctx.fillText("Рівень " + this.leagueInfo.levelNumber + " · " + (this.leagueInfo.lettersText || ""), W / 2, y + H * 0.065);
        }
        ctx.restore();
    }

    // ---------- Хвилі стрибка ----------

    renderWaves(ctx, W, groundY) {
        const anchorX = W * PLAYER_ANCHOR;
        for (const wave of this.waves) {
            ctx.beginPath();
            ctx.arc(anchorX, groundY - CUBE_SIZE / 2 - this.player.y, wave.r, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0, 246, 255, " + Math.max(0, wave.alpha * 0.6).toFixed(3) + ")";
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    // ---------- Земля, Hit Window, Фініш, Перешкоди, Гравець ----------

    renderGround(ctx, W, H, groundY, camX) {
        ctx.fillStyle = "#070b1c";
        ctx.fillRect(0, groundY, W, H - groundY);

        const accent = this.level.accentColor || "#00f6ff";
        var groundGrad = ctx.createLinearGradient(0, groundY - 6, 0, groundY + 6);
        groundGrad.addColorStop(0, "transparent");
        groundGrad.addColorStop(0.5, accent);
        groundGrad.addColorStop(1, "transparent");
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY - 6, W, 12);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(W, groundY);
        ctx.stroke();

        // Земля під шипами в стилі світу (трава, сніг, пісок, камінь, лава…)
        BackgroundRenderer.renderGroundDetail(ctx, this.level.bgTheme, W, H, groundY, camX, accent);
        // Неонова лінія землі поверх текстури
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(W, groundY);
        ctx.stroke();
    }

    renderHitWindow(ctx, W, groundY, anchorX, time) {
        if (!this.player.alive) {
            return;
        }
        const spike = this.nearestAheadSpike();
        if (!spike) {
            return;
        }
        const hwH = 5;
        const perfectWidth = this.perfectPx + this.okPx * 0.35;
        const okWidth = this.okPx;
        const pulseAlpha = 0.4 + 0.2 * (Math.sin(time * 6) + 1) / 2;

        const topY = groundY - hwH - 2;
        const botY = groundY + 2;

        ctx.fillStyle = "rgba(57, 255, 136, " + pulseAlpha.toFixed(3) + ")";
        ctx.fillRect(anchorX, topY, perfectWidth, hwH);

        ctx.fillStyle = "rgba(0, 246, 255, 0.2)";
        ctx.fillRect(anchorX, botY, okWidth, hwH);
    }

    renderFinish(ctx, W, groundY, anchorX, camX) {
        const screenX = this.finishX - camX + anchorX;
        if (screenX < -120 || screenX > W + 120) {
            return;
        }
        // Фініш у стилі світу «відчиняється», коли кубик підбігає
        const open = Math.min(1, Math.max(0, 1 - (this.finishX - this.player.x) / FINISH_OPEN_DISTANCE));
        BackgroundRenderer.renderFinishGate(ctx, this.level.bgTheme, screenX, groundY, open, this.currentTime / 1000);
    }

    // ---------- Перешкоди (3 типи) ----------

    drawSpike(ctx, screenX, groundY, accentColor, cleared) {
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        var glowR = cleared ? 20 : 40;
        var glowGrad = ctx.createRadialGradient(screenX, groundY - SPIKE_H * 0.4, 4, screenX, groundY - SPIKE_H * 0.4, glowR);
        glowGrad.addColorStop(0, color);
        glowGrad.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = glowGrad;
        ctx.fillRect(screenX - glowR, groundY - SPIKE_H - glowR * 0.5, glowR * 2, SPIKE_H + glowR);
        ctx.globalAlpha = 1;
        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.8)" : "#4a1030";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(screenX - SPIKE_W / 2, groundY);
        ctx.lineTo(screenX, groundY - SPIKE_H);
        ctx.lineTo(screenX + SPIKE_W / 2, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawDoubleSpike(ctx, screenX, groundY, accentColor, cleared) {
        const offset = SPIKE_W * 0.45;
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        var glowR = cleared ? 18 : 36;
        var glowGrad = ctx.createRadialGradient(screenX, groundY - SPIKE_H * 0.4, 4, screenX, groundY - SPIKE_H * 0.4, glowR);
        glowGrad.addColorStop(0, color);
        glowGrad.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = glowGrad;
        ctx.fillRect(screenX - glowR - offset, groundY - SPIKE_H - glowR * 0.5, (glowR + offset) * 2, SPIKE_H + glowR);
        ctx.globalAlpha = 1;
        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.8)" : "#4a1030";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(screenX - offset - SPIKE_W / 2, groundY);
        ctx.lineTo(screenX - offset, groundY - SPIKE_H);
        ctx.lineTo(screenX - offset + SPIKE_W / 2, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(screenX + offset - SPIKE_W / 2, groundY);
        ctx.lineTo(screenX + offset, groundY - SPIKE_H);
        ctx.lineTo(screenX + offset + SPIKE_W / 2, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawSaw(ctx, screenX, groundY, radius, rotationAngle, accentColor, cleared) {
        const centerY = groundY - radius;
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        const teeth = 8;

        var glowR = cleared ? radius * 0.8 : radius * 1.2;
        var glowGrad = ctx.createRadialGradient(screenX, centerY, radius * 0.2, screenX, centerY, glowR);
        glowGrad.addColorStop(0, color);
        glowGrad.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(screenX, centerY, glowR, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.translate(screenX, centerY);
        ctx.rotate(rotationAngle);

        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.8)" : "#301030";
        ctx.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
            const angle = (i / (teeth * 2)) * Math.PI * 2;
            const r = i % 2 === 0 ? radius : radius * 0.65;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Світні кінчики зубців і «слід» обертання
        if (!cleared) {
            ctx.fillStyle = "#ffffff";
            for (let i = 0; i < teeth; i++) {
                const angle = (i / teeth) * Math.PI * 2;
                ctx.fillRect(Math.cos(angle) * radius - 1.5, Math.sin(angle) * radius - 1.5, 3, 3);
            }
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 1.12, 0, Math.PI * 0.6);
            ctx.moveTo(Math.cos(Math.PI) * radius * 1.12, Math.sin(Math.PI) * radius * 1.12);
            ctx.arc(0, 0, radius * 1.12, Math.PI, Math.PI * 1.6);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.6)" : "rgba(20, 10, 20, 0.9)";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }

    // Тіло перешкоди (шип, подвійний шип або пилка) у стилі світу
    drawObstacleBody(ctx, spike, screenX, groundY, accentColor, cleared) {
        if (spike.type === "saw") {
            this.drawSaw(ctx, screenX, groundY, SPIKE_H * 0.6, spike.rotationAngle || 0, accentColor, cleared);
        } else if (this.spikeStyle === "neon") {
            if (spike.type === "double_spike") {
                this.drawDoubleSpike(ctx, screenX, groundY, accentColor, cleared);
            } else {
                this.drawSpike(ctx, screenX, groundY, accentColor, cleared);
            }
        } else {
            const offsets = spike.type === "double_spike" ? [-SPIKE_W * 0.45, SPIKE_W * 0.45] : [0];
            // «Небезпечна» аура: перешкоду завжди видно на тлі схожих декорацій світу
            if (!cleared) {
                const auraW = spike.type === "double_spike" ? SPIKE_W * 1.6 : SPIKE_W;
                const aura = ctx.createRadialGradient(screenX, groundY - SPIKE_H * 0.35, 4, screenX, groundY - SPIKE_H * 0.35, auraW);
                aura.addColorStop(0, "rgba(255, 40, 80, 0.45)");
                aura.addColorStop(1, "rgba(255, 40, 80, 0)");
                ctx.fillStyle = aura;
                ctx.fillRect(screenX - auraW, groundY - SPIKE_H * 1.3, auraW * 2, SPIKE_H * 1.3);
            }
            for (const off of offsets) {
                ctx.save();
                ctx.translate(screenX + off, groundY);
                drawStyledSpikeShape(ctx, this.spikeStyle, accentColor, this.currentTime);
                // Червона «лінія небезпеки» біля основи
                ctx.fillStyle = "rgba(255, 40, 80, 0.85)";
                ctx.fillRect(-SPIKE_W / 2, -3, SPIKE_W, 3);
                ctx.restore();
            }
        }
    }

    renderObstacles(ctx, W, groundY, anchorX, camX) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
        const accentColor = this.level.accentColor || "#ff2ea6";
        const target = this.player.alive ? this.nearestAheadSpike() : null;
        const perfectWidth = this.perfectPx + this.okPx * 0.35;

        for (const spike of this.spikes) {
            const screenX = spike.x - camX + anchorX;
            if (screenX < -80 || screenX > W + 80) {
                continue;
            }
            const cleared = spike.state === "cleared";
            // Шип, знищений зброєю, показує свою анімацію руйнування
            if (cleared && spike.fx) {
                const ft = (this.currentTime - spike.fx.t0) / 1000;
                if (ft <= (DESTRUCTION_TIME[spike.fx.kind] || 0.5)) {
                    const self = this;
                    const spikeTop = spike.type === "saw" ? SPIKE_H * 1.2 : SPIKE_H;
                    // Уламки не провалюються під землю (там клавіатура)
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(screenX - 400, 0, 800, groundY + 8);
                    ctx.clip();
                    drawSpikeDestruction(ctx, spike.fx.kind, ft, screenX, groundY, spikeHalfWidth(spike.type), spikeTop, function (c) {
                        self.drawObstacleBody(c, spike, screenX, groundY, accentColor, false);
                    }, { pullX: anchorX + CUBE_SIZE * GRAVITY_PULL_AHEAD });
                    ctx.restore();
                }
                continue;
            }
            // Подоланий шип за мить «осідає» в землю
            let crumble = 1;
            if (cleared) {
                const since = spike.clearedAt === undefined ? 1 : (this.currentTime - spike.clearedAt) / 1000;
                crumble = 1 - since / SPIKE_CRUMBLE_TIME;
                if (crumble <= 0) {
                    continue;
                }
            }
            // Поява: шип «виростає» із землі, коли заходить на екран
            const appear = Math.min(1, Math.max(0, (W + 40 - screenX) / SPIKE_POP_DISTANCE));
            const grow = (1 - Math.pow(1 - appear, 3)) * crumble;
            if (grow <= 0.01) {
                continue;
            }

            // Підсвітка моменту натискання для цільового шипа
            let zone = null;
            if (spike === target) {
                const gap = spike.x - spikeHalfWidth(spike.type) - this.player.x;
                if (gap > 0 && gap <= perfectWidth) {
                    zone = "perfect";
                } else if (gap > 0 && gap <= this.okPx) {
                    zone = "ok";
                }
            }
            if (zone) {
                const zoneColor = zone === "perfect" ? "57, 255, 136" : "0, 246, 255";
                const glow = ctx.createRadialGradient(screenX, groundY - SPIKE_H * 0.45, 4, screenX, groundY - SPIKE_H * 0.45, SPIKE_H * 1.1);
                glow.addColorStop(0, "rgba(" + zoneColor + ", 0.55)");
                glow.addColorStop(1, "rgba(" + zoneColor + ", 0)");
                ctx.fillStyle = glow;
                ctx.fillRect(screenX - SPIKE_H * 1.1, groundY - SPIKE_H * 1.6, SPIKE_H * 2.2, SPIKE_H * 1.6);
            }

            ctx.save();
            ctx.translate(screenX, groundY);
            ctx.scale(1, grow);
            ctx.translate(-screenX, -groundY);
            if (spike.chunks > 0) {
                // Кулі автомата вже відкололи верхні шматки
                const spikeTop = spike.type === "saw" ? SPIKE_H * 1.2 : SPIKE_H;
                ctx.beginPath();
                ctx.rect(screenX - 200, groundY - spikeTop * (1 - spike.chunks * 0.22), 400, spikeTop * 2);
                ctx.clip();
            }
            this.drawObstacleBody(ctx, spike, screenX, groundY, accentColor, cleared);
            ctx.restore();

            // Клавіша з літерою над перешкодою
            if (!cleared) {
                const topY = spike.type === "saw" ? groundY - SPIKE_H * 1.2 : groundY - SPIKE_H;
                // Шип, по якому вже вдарила зброя, світиться зеленим до руйнування
                const state = spike.state === "doomed" ? "perfect" : zone ? zone : spike === target ? "target" : "idle";
                ctx.globalAlpha = grow;
                drawKeycap(ctx, screenX, topY - 12, spike.letter, state);
                ctx.globalAlpha = 1;
            }
        }
        ctx.restore();
    }

    renderScorePopups(ctx, groundY, anchorX, camX) {
        if (this.scorePopups.length === 0) {
            return;
        }
        ctx.save();
        ctx.font = "bold 20px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.lineJoin = "round";
        for (const sp of this.scorePopups) {
            ctx.globalAlpha = Math.min(1, sp.life / sp.maxLife * 1.5);
            const x = sp.x - camX + anchorX;
            const y = groundY - sp.y;
            ctx.lineWidth = 4;
            ctx.strokeStyle = "rgba(5, 5, 20, 0.9)";
            ctx.strokeText(sp.text, x, y);
            // Монети — золоті, очки — бірюзові (як напис «Очки» вгорі), решта — жовті
            ctx.fillStyle = sp.crystal ? "#ffd84a" : sp.points ? POINTS_COLOR : "#ffe14d";
            ctx.fillText(sp.text, x, y);
            if (sp.crystal) {
                // Значок монети праворуч від напису
                const w = ctx.measureText(sp.text).width;
                drawCoinIcon(ctx, x + w / 2 + 11, y - 10, 16);
            }
        }
        ctx.restore();
    }

    // ---------- Кубик та частинки ----------

    renderPlayer(ctx, groundY, anchorX) {
        if (!this.player.alive) {
            return;
        }
        // Шлейф (звичайний або куплений у магазині)
        const trailPoints = [];
        for (let ti = 0; ti < this.player.trail.length; ti++) {
            const point = this.player.trail[ti];
            if (point.seq === undefined) {
                point.seq = this.trailSeq = (this.trailSeq || 0) + 1;
            }
            trailPoints.push({
                sx: anchorX + point.x - this.player.x,
                sy: groundY - point.y - CUBE_SIZE / 2,
                alpha: point.alpha,
                i: point.seq
            });
        }
        drawTrail(ctx, save.getEquipped("trail"), trailPoints, CUBE_SIZE, this.currentTime);

        // Gold trail for perfectHard
        var achievementLevelId = this.level.id;
        var activeSkinId = save.getActiveSkin ? save.getActiveSkin() : null;
        if (activeSkinId) {
            var skinLevel = ALL_LEVELS.find(function (l) { return l.skin && l.skin.renderType === activeSkinId; });
            if (skinLevel) {
                achievementLevelId = skinLevel.id;
            }
        }
        const achievement = save.getLevelAchievement ? save.getLevelAchievement(achievementLevelId) : null;
        if (achievement === "hard" && !this.player.onGround && this.player.vy !== 0) {
            this.player.goldTrail = this.player.goldTrail || [];
            this.player.goldTrail.push({
                x: this.player.x,
                y: this.player.y + CUBE_SIZE / 2,
                alpha: 1.0,
                time: this.currentTime
            });
            for (var gi = this.player.goldTrail.length - 1; gi >= 0; gi--) {
                var gp = this.player.goldTrail[gi];
                var gage = (this.currentTime - gp.time) / 1000;
                gp.alpha = Math.max(0, 1.0 - gage / 0.4);
                if (gp.alpha <= 0) {
                    this.player.goldTrail.splice(gi, 1);
                    continue;
                }
                var gpx = anchorX + (gp.x - this.player.x);
                var gpy = groundY - gp.y - CUBE_SIZE / 2;
                ctx.fillStyle = "rgba(255, 200, 40, " + (gp.alpha * 0.5).toFixed(3) + ")";
                ctx.beginPath();
                ctx.arc(gpx, gpy, 4 * gp.alpha, 0, Math.PI * 2);
                ctx.fill();
            }
            if (this.player.goldTrail.length > 15) {
                this.player.goldTrail.splice(0, this.player.goldTrail.length - 15);
            }
        }

        const centerY = groundY - this.player.y - CUBE_SIZE / 2;
        ctx.save();
        ctx.translate(anchorX, centerY);
        ctx.rotate(this.player.rotation);

        var activeSkinId = save.getActiveSkin ? save.getActiveSkin() : null;

        const skinConfig = this.level.skin;
        var effectiveSkinConfig = skinConfig;
        if (activeSkinId && SKIN_RENDERERS[activeSkinId]) {
            effectiveSkinConfig = { renderType: activeSkinId };
        }
        const renderFn = effectiveSkinConfig ? SKIN_RENDERERS[effectiveSkinConfig.renderType] : null;
        if (renderFn) {
            renderFn(ctx, CUBE_SIZE, this.currentTime, this.player);
        } else {
            SKIN_RENDERERS.neon_base(ctx, CUBE_SIZE, this.currentTime, this.player);
        }

        drawAchievementFrame(ctx, CUBE_SIZE, achievement, this.currentTime);
        drawAccessory(ctx, save.getEquipped("accessory"), CUBE_SIZE, this.currentTime);
        if (this.weaponSpec) {
            drawHeldWeapon(ctx, this.weaponId, CUBE_SIZE, this.weaponPose(), this.currentTime);
        }

        // Щит: поки не використаний — ледь помітна бульбашка; спрацював — яскравий спалах, що гасне
        if (this.shieldReady || this.shieldFlash > 0) {
            const flash = this.shieldFlash || 0;
            const r = CUBE_SIZE * (0.85 + flash * 0.4);
            ctx.strokeStyle = "rgba(140, 220, 255, " + (this.shieldReady ? 0.35 + 0.15 * Math.sin(this.currentTime * 0.004) : flash).toFixed(3) + ")";
            ctx.lineWidth = this.shieldReady ? 2 : 4;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Спалах рамки після «Ідеально»
        if (this.perfectFlash > 0) {
            var flashT = this.perfectFlash / PERFECT_FLASH_TIME;
            var grow = (1 - flashT) * 8;
            ctx.strokeStyle = "rgba(255, 255, 255, " + (flashT * 0.9).toFixed(3) + ")";
            ctx.lineWidth = 3;
            ctx.strokeRect(-CUBE_SIZE / 2 - grow, -CUBE_SIZE / 2 - grow, CUBE_SIZE + grow * 2, CUBE_SIZE + grow * 2);
        }

        ctx.restore();
    }

    renderProgressBar(ctx, W) {
        var barW = W * 0.6;
        var barX = (W - barW) / 2;
        var barY = 30;
        var barH = 14;

        // Темна підкладка, щоб написи читалися й на світлому денному небі
        var panelX = Math.max(4, barX - 150);
        var panelR = Math.min(W - 4, barX + barW + 128);
        ctx.fillStyle = "rgba(5, 8, 20, 0.55)";
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(panelX, 2, panelR - panelX, barY + barH + 8, 8);
        } else {
            ctx.rect(panelX, 2, panelR - panelX, barY + barH + 8);
        }
        ctx.fill();

        if (this.leagueInfo !== null) {
            ctx.font = "bold 14px 'Segoe UI', Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#00f6ff";
            ctx.fillText(
                "Ліга: " + this.leagueInfo.leagueName + " | " + this.leagueInfo.levelNumber + ": " + this.leagueInfo.levelName,
                W / 2,
                6
            );
        }

        ctx.fillStyle = "rgba(8, 10, 26, 0.8)";
        ctx.fillRect(barX, barY, barW, barH);
        ctx.strokeStyle = "rgba(0, 246, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barW, barH);
        var fillW = barW * (this.progressPct / 100);
        var gradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        gradient.addColorStop(0, "#00f6ff");
        gradient.addColorStop(1, "#39ff88");
        ctx.fillStyle = gradient;
        ctx.fillRect(barX + 1, barY + 1, Math.max(0, fillW - 2), barH - 2);
        ctx.fillStyle = "#eaf6ff";
        ctx.font = "bold 14px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(Math.floor(this.progressPct) + "%", barX + barW + 12, barY + barH / 2);
        // Монети, зібрані в цьому забігу
        drawCoinIcon(ctx, barX + barW + 70, barY + barH / 2, 16);
        ctx.fillStyle = "#ffd84a";
        ctx.fillText(String(this.runHits + this.runPerfect + this.runSeries + (this.runWords * WORD_BONUS + this.runCombos * COMBO_BONUS) * this.wordsMult()), barX + barW + 82, barY + barH / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = POINTS_COLOR;
        var maxForMode = this.difficulty === "HARD" ? this.maxHard : this.maxEasy;
        ctx.fillText("Очки: " + this.score + " / " + maxForMode, barX - 12, barY + barH / 2);
    }

    renderPerfectParticles(ctx, groundY, anchorX, camX) {
        for (var i = 0; i < this.perfectParticles.length; i++) {
            var pp = this.perfectParticles[i];
            var alpha = pp.life / pp.maxLife;
            var sx = pp.x - camX + anchorX;
            var sy = groundY - pp.y;
            // Піксельна зірочка «плюсом»
            var ps = Math.max(1.5, pp.size * (0.5 + alpha * 0.5));
            ctx.fillStyle = pp.color;
            ctx.globalAlpha = alpha * 0.9;
            ctx.fillRect(sx - ps / 2, sy - ps * 1.5, ps, ps * 3);
            ctx.fillRect(sx - ps * 1.5, sy - ps / 2, ps * 3, ps);
        }
        ctx.globalAlpha = 1;
    }

    renderDebris(ctx, groundY, anchorX, camX) {
        for (var i = 0; i < this.debris.length; i++) {
            var db = this.debris[i];
            var alpha = Math.min(1, db.life / db.maxLife * 1.5);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(db.x - camX + anchorX, groundY - db.y);
            ctx.rotate(db.rot);
            ctx.fillStyle = db.color;
            ctx.fillRect(-db.size / 2, -db.size / 2, db.size, db.size);
            if (db.outline) {
                ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-db.size / 2, -db.size / 2, db.size, db.size);
            }
            ctx.restore();
        }
    }

    renderPerfectPopups(ctx, groundY, anchorX, camX) {
        var isHard = this.difficulty === "HARD";
        var popColor = isHard ? "#ffd700" : "#e8ecf2";
        for (var i = 0; i < this.perfectPopups.length; i++) {
            var po = this.perfectPopups[i];
            var alpha = po.life / po.maxLife;
            var sx = po.x - camX + anchorX;
            var sy = groundY - po.y;
            ctx.save();
            ctx.font = "bold 16px 'Segoe UI', Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.globalAlpha = alpha;
            ctx.fillStyle = popColor;
            ctx.fillText("PERFECT!", sx, sy);
            ctx.restore();
        }
    }
}

// Реекспорт для сумісності: main.js, preview.js і shop_preview.js імпортують це з engine.js
export { ALL_LEVELS, BOSS_LEVEL_ID, COMBO_KINDS, DEFAULT_SKIN, LEVELS_CONFIG, levelOrderIndex, nextLevelOf } from "./levels.js";
export { activeSkinPerk, drawAchievementFrame, levelSkinPerk } from "./skins.js";
export { SKIN_RENDERERS } from "./skin_renderers.js";
export { save } from "./save.js";

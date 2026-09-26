// ============================================================
// save.js — SaveManager: прогрес, налаштування, монети, магазин,
// статистика літер і досягнення в localStorage
// ============================================================

import { ACHIEVEMENTS, achievementProgress, defaultAchievementData, localDayKey, sanitizeAchievementData } from "./achievements.js";
import { CHEST_TYPES, DEFAULT_ITEMS, FIRST_CLEAR_BONUS, GOLD_BONUS, SILVER_BONUS, accessoryPerk, getShopItem, getShopSkinByRenderType, rollChest, shopTierLeague } from "./shop.js";
import { EGG_BY_THEME } from "./easter_eggs.js";
import { KEYS } from "./keyboard.js";
import { ALL_LEVELS, BOSS_LEVEL_ID, DEFAULT_SKIN, getLevelById, levelOrderIndex, nextLevelOf } from "./levels.js";
import { activeSkinPerk } from "./skins.js";
import { SKIN_RENDERERS } from "./skin_renderers.js";

// Літери екранної клавіатури (без Ґ — її розташування різниться між виробниками)
const KEY_LETTERS = new Set(KEYS.map(function (k) { return k.letter; }));

// ---------- SaveManager ----------

const SAVE_KEY = "dfp_save_v1";

function defaultSaveData() {
    const levels = {};
    for (const level of ALL_LEVELS) {
        levels[String(level.id)] = { bestPct: 0, highScore: 0, perfect: null };
    }
    return {
        version: 1,
        settings: { difficulty: "EASY", hitWindow: "normal", speed: "normal", activeSkin: null, cameraMotion: true },
        progress: { unlocked: 1, unlockedSkins: [], levels: levels, letterStats: {} },
        // Кристали, куплені товари, надіте та вже виплачені разові бонуси рівнів
        shop: {
            crystals: 0,
            owned: [],
            equipped: { trail: DEFAULT_ITEMS.trail, explosion: DEFAULT_ITEMS.explosion, accessory: DEFAULT_ITEMS.accessory, weapon: DEFAULT_ITEMS.weapon },
            paid: {},
            // Ще не відкриті сундуки та скільки перемог поспіль минуло без сундука
            chests: [],
            winsWithoutChest: 0,
            // Сердечка — запасні життя з сундуків
            hearts: 0
        },
        // Відкриті досягнення й лічильники для них
        achievements: defaultAchievementData()
    };
}

function sanitizeSaveData(raw) {
    const clean = defaultSaveData();
    if (!raw || typeof raw !== "object" || raw.version !== 1) {
        return clean;
    }
    if (raw.settings && (raw.settings.difficulty === "EASY" || raw.settings.difficulty === "HARD")) {
        clean.settings.difficulty = raw.settings.difficulty;
    }
    if (raw.settings && (raw.settings.hitWindow === "normal" || raw.settings.hitWindow === "large")) {
        clean.settings.hitWindow = raw.settings.hitWindow;
    }
    if (raw.settings && (raw.settings.speed === "slow" || raw.settings.speed === "normal" || raw.settings.speed === "fast")) {
        clean.settings.speed = raw.settings.speed;
    }
    if (raw.settings && typeof raw.settings.cameraMotion === "boolean") {
        clean.settings.cameraMotion = raw.settings.cameraMotion;
    }
    if (raw.settings && typeof raw.settings.activeSkin === "string" && raw.settings.activeSkin.length > 0) {
        clean.settings.activeSkin = raw.settings.activeSkin;
    }
    if (raw.progress && typeof raw.progress === "object") {
        const unlocked = Number(raw.progress.unlocked);
        if (Number.isFinite(unlocked)) {
            // Невідомий рівень у збереженні — починаємо з першого
            clean.progress.unlocked = levelOrderIndex(Math.floor(unlocked)) >= 0 ? Math.floor(unlocked) : ALL_LEVELS[0].id;
        }
        if (raw.progress.letterStats && typeof raw.progress.letterStats === "object") {
            for (const letter of Object.keys(raw.progress.letterStats)) {
                const s = raw.progress.letterStats[letter];
                const ok = Number(s && s.ok);
                const miss = Number(s && s.miss);
                if (letter.length === 1 && Number.isFinite(ok) && Number.isFinite(miss) && ok >= 0 && miss >= 0) {
                    clean.progress.letterStats[letter] = { ok: Math.min(ok, 1000), miss: Math.min(miss, 1000) };
                }
            }
        }
        if (Array.isArray(raw.progress.unlockedSkins)) {
            clean.progress.unlockedSkins = raw.progress.unlockedSkins.filter(function (s) { return typeof s === "string"; });
        }
        if (raw.progress.levels && typeof raw.progress.levels === "object") {
            for (const level of ALL_LEVELS) {
                const key = String(level.id);
                const entry = raw.progress.levels[key];
                if (entry && typeof entry === "object") {
                    const pct = Number(entry.bestPct);
                    const score = Number(entry.highScore);
                    if (Number.isFinite(pct)) {
                        clean.progress.levels[key].bestPct = Math.min(100, Math.max(0, Math.round(pct)));
                    }
                    if (Number.isFinite(score)) {
                        clean.progress.levels[key].highScore = Math.max(0, Math.round(score));
                    }
                    if (entry.perfect === "easy" || entry.perfect === "hard") {
                        clean.progress.levels[key].perfect = entry.perfect;
                    }
                }
            }
        }
    }
    if (raw.shop && typeof raw.shop === "object") {
        const crystals = Number(raw.shop.crystals);
        if (Number.isFinite(crystals)) {
            clean.shop.crystals = Math.max(0, Math.floor(crystals));
        }
        if (Array.isArray(raw.shop.owned)) {
            clean.shop.owned = raw.shop.owned.filter(function (id, idx, arr) {
                const item = typeof id === "string" ? getShopItem(id) : null;
                return item && item.price > 0 && arr.indexOf(id) === idx;
            });
        }
        if (raw.shop.equipped && typeof raw.shop.equipped === "object") {
            for (const type of Object.keys(DEFAULT_ITEMS)) {
                const id = raw.shop.equipped[type];
                const item = typeof id === "string" ? getShopItem(id) : null;
                if (item && item.type === type && (item.price === 0 || clean.shop.owned.indexOf(id) !== -1)) {
                    clean.shop.equipped[type] = id;
                }
            }
        }
        if (raw.shop.paid && typeof raw.shop.paid === "object") {
            for (const level of ALL_LEVELS) {
                const entry = raw.shop.paid[String(level.id)];
                if (entry && typeof entry === "object") {
                    clean.shop.paid[String(level.id)] = { first: entry.first === true, silver: entry.silver === true, gold: entry.gold === true };
                }
            }
        }
        if (Array.isArray(raw.shop.chests)) {
            clean.shop.chests = raw.shop.chests.filter(function (c) { return typeof c === "string" && CHEST_TYPES[c]; }).slice(0, 50);
        }
        const hearts = Number(raw.shop.hearts);
        if (Number.isFinite(hearts)) {
            clean.shop.hearts = Math.max(0, Math.min(99, Math.floor(hearts)));
        }
        const wins = Number(raw.shop.winsWithoutChest);
        if (Number.isFinite(wins)) {
            clean.shop.winsWithoutChest = Math.max(0, Math.min(100, Math.floor(wins)));
        }
    }
    clean.achievements = sanitizeAchievementData(raw.achievements);
    return clean;
}

let saveData = null;

export const save = {
    load() {
        let raw = null;
        try {
            const text = localStorage.getItem(SAVE_KEY);
            if (text) {
                raw = JSON.parse(text);
            }
        } catch (err) {
            console.warn("Локальне сховище недоступне або пошкоджене — прогрес житиме лише в цьому сеансі.", err);
            raw = null;
        }
        saveData = sanitizeSaveData(raw);
        return {
            progress: saveData.progress,
            settings: saveData.settings
        };
    },

    // Почати заново: стирає рівні, монети, покупки, сундуки й досягнення.
    // Налаштування (складність, швидкість, камера) лишаються, скін — стартовий
    resetProgress() {
        if (!saveData) {
            this.load();
        }
        const settings = saveData.settings;
        saveData = defaultSaveData();
        saveData.settings = Object.assign({}, settings, { activeSkin: null });
        this.persist();
    },

    persist() {
        if (!saveData) {
            saveData = defaultSaveData();
        }
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        } catch (err) {
            console.warn("Не вдалося записати прогрес у локальне сховище — він збережеться лише до закриття вкладки.", err);
        }
    },

    recordResult(levelId, pct, score, options) {
        if (!saveData) {
            this.load();
        }
        const key = String(levelId);
        const entry = saveData.progress.levels[key];
        if (!entry) {
            return;
        }
        const cleanPct = Math.min(100, Math.max(0, Math.round(pct)));
        const cleanScore = Math.max(0, Math.round(score));
        let skinUnlocked = null;
        let achievementUnlocked = null;
        if (cleanPct > entry.bestPct) {
            entry.bestPct = cleanPct;
        }
        if (cleanScore > entry.highScore) {
            entry.highScore = cleanScore;
        }
        if (cleanPct === 100 && options) {
            const currentPerfect = entry.perfect || null;
            const maxHard = Number(options.maxHard) || 0;
            const maxEasy = Number(options.maxEasy) || 0;
            const difficulty = options.difficulty || "EASY";
            if (maxHard > 0 && difficulty === "HARD" && cleanScore >= maxHard && currentPerfect !== "hard") {
                entry.perfect = "hard";
                achievementUnlocked = "hard";
            } else if (maxEasy > 0 && difficulty === "EASY" && cleanScore >= maxEasy && !currentPerfect) {
                entry.perfect = "easy";
                achievementUnlocked = "easy";
            }
        }
        if (cleanPct === 100) {
            // Відкриваємо наступний за порядком рівень (якщо він ще не відкритий)
            const next = nextLevelOf(levelId);
            if (next && levelOrderIndex(next.id) > levelOrderIndex(saveData.progress.unlocked)) {
                saveData.progress.unlocked = next.id;
            }
            const level = getLevelById(levelId);
            if (level && level.skin && !saveData.progress.unlockedSkins.includes(level.skin.id)) {
                saveData.progress.unlockedSkins.push(level.skin.id);
                skinUnlocked = level.skin;
            }
        }
        this.persist();
        const result = {};
        if (skinUnlocked) {
            result.skinUnlocked = skinUnlocked;
        }
        if (achievementUnlocked) {
            result.achievementUnlocked = achievementUnlocked;
        }
        return (result.skinUnlocked || result.achievementUnlocked) ? result : undefined;
    },

    setDifficulty(difficulty) {
        if (!saveData) {
            this.load();
        }
        if (difficulty === "EASY" || difficulty === "HARD") {
            saveData.settings.difficulty = difficulty;
            this.persist();
        }
    },

    getDifficulty() {
        if (!saveData) {
            this.load();
        }
        return saveData.settings.difficulty;
    },

    setHitWindow(size) {
        if (!saveData) {
            this.load();
        }
        if (size === "normal" || size === "large") {
            saveData.settings.hitWindow = size;
            this.persist();
        }
    },

    getHitWindow() {
        if (!saveData) {
            this.load();
        }
        return saveData.settings.hitWindow || "normal";
    },

    setSpeed(speed) {
        if (!saveData) {
            this.load();
        }
        if (speed === "slow" || speed === "normal" || speed === "fast") {
            saveData.settings.speed = speed;
            this.persist();
        }
    },

    getSpeed() {
        if (!saveData) {
            this.load();
        }
        return saveData.settings.speed || "normal";
    },

    // Рух камери: стеження за стрибком і струс при вибуху
    setCameraMotion(enabled) {
        if (!saveData) {
            this.load();
        }
        saveData.settings.cameraMotion = !!enabled;
        this.persist();
    },

    getCameraMotion() {
        if (!saveData) {
            this.load();
        }
        return saveData.settings.cameraMotion !== false;
    },

    getActiveSkin() {
        if (!saveData) {
            this.load();
        }
        // Скін, якого більше немає в грі, замінюємо стартовим
        const stored = saveData.settings.activeSkin;
        if (stored && !SKIN_RENDERERS[stored]) {
            return DEFAULT_SKIN;
        }
        // Магазинний скін, який не куплено (наприклад, після підробки збереження)
        const shopSkin = stored ? getShopSkinByRenderType(stored) : null;
        if (shopSkin && !this.isOwned(shopSkin.id)) {
            return DEFAULT_SKIN;
        }
        // Поки гравець нічого не вибрав, кубик носить стартовий скін (завжди відкритий)
        return saveData.settings.activeSkin || DEFAULT_SKIN;
    },

    setActiveSkin(skinId) {
        if (!saveData) {
            this.load();
        }
        saveData.settings.activeSkin = skinId || null;
        this.persist();
    },

    getProgress() {
        if (!saveData) {
            this.load();
        }
        return saveData.progress;
    },

    getLastPlayable() {
        if (!saveData) {
            this.load();
        }
        return saveData.progress.unlocked;
    },

    // Чи відкритий рівень: він не далі за найдальший відкритий у порядку проходження
    isLevelUnlocked(levelId) {
        if (!saveData) {
            this.load();
        }
        const idx = levelOrderIndex(levelId);
        return idx >= 0 && idx <= levelOrderIndex(saveData.progress.unlocked);
    },

    // ---------- Статистика літер (для тренування помилок) ----------

    // stats: { "Ж": { ok: 3, miss: 2 }, … } за один забіг
    recordLetterStats(stats) {
        if (!saveData) {
            this.load();
        }
        const all = saveData.progress.letterStats;
        for (const letter of Object.keys(stats)) {
            const cur = all[letter] || { ok: 0, miss: 0 };
            cur.ok += stats[letter].ok || 0;
            cur.miss += stats[letter].miss || 0;
            // Пам'ятаємо лише недавнє: коли спроб багато, старі поступово «забуваються»,
            // і вивчена літера перестає вважатися складною
            const total = cur.ok + cur.miss;
            if (total > LETTER_MEMORY) {
                const k = LETTER_MEMORY / total;
                cur.ok = Math.round(cur.ok * k * 10) / 10;
                cur.miss = Math.round(cur.miss * k * 10) / 10;
            }
            all[letter] = cur;
        }
        this.persist();
    },

    // Частка помилок на літері (зі згладжуванням, щоб одна помилка не робила літеру «найгіршою»)
    letterErrorRate(letter) {
        if (!saveData) {
            this.load();
        }
        const s = saveData.progress.letterStats[letter];
        if (!s) {
            return 0;
        }
        return (s.miss + 0.3) / (s.ok + s.miss + 3);
    },

    // Найскладніші літери з pool: ті, де помилок найбільше. null — якщо даних ще замало
    getWeakLetters(pool, count) {
        if (!saveData) {
            this.load();
        }
        const self = this;
        const stats = saveData.progress.letterStats;
        const known = pool.filter(function (l) {
            const s = stats[l];
            return s && s.ok + s.miss >= 3 && s.miss > 0;
        });
        if (known.length < 3) {
            return null;
        }
        known.sort(function (a, b) { return self.letterErrorRate(b) - self.letterErrorRate(a); });
        return known.slice(0, count);
    },

    // Звіт для налаштувань: до n найскладніших літер із відсотком помилок
    getLetterReport(n) {
        if (!saveData) {
            this.load();
        }
        const self = this;
        const stats = saveData.progress.letterStats;
        return Object.keys(stats)
            .filter(function (l) { return KEY_LETTERS.has(l) && stats[l].ok + stats[l].miss >= 3 && stats[l].miss > 0; })
            .sort(function (a, b) { return self.letterErrorRate(b) - self.letterErrorRate(a); })
            .slice(0, n)
            .map(function (l) {
                const s = stats[l];
                return { letter: l, missPct: Math.round(100 * s.miss / (s.ok + s.miss)) };
            });
    },

    getLevelAchievement(levelId) {
        if (!saveData) {
            this.load();
        }
        const entry = saveData.progress.levels[String(levelId)];
        return (entry && entry.perfect) || null;
    },

    // ---------- Кристали й магазин ----------

    getCrystals() {
        if (!saveData) {
            this.load();
        }
        return saveData.shop.crystals;
    },

    addCrystals(amount) {
        if (!saveData) {
            this.load();
        }
        const n = Math.max(0, Math.floor(Number(amount) || 0));
        saveData.shop.crystals += n;
        this.persist();
        return saveData.shop.crystals;
    },

    isOwned(itemId) {
        if (!saveData) {
            this.load();
        }
        const item = getShopItem(itemId);
        return !!item && (item.price === 0 || saveData.shop.owned.indexOf(itemId) !== -1);
    },

    // Купівля: true — куплено, false — не вистачає монет або товар уже є
    buyItem(itemId) {
        if (!saveData) {
            this.load();
        }
        const item = getShopItem(itemId);
        if (!item || this.isOwned(itemId) || saveData.shop.crystals < item.price) {
            return false;
        }
        // Легендарний товар продається лише після виконання умови
        if (!this.getRequirementProgress(item).met) {
            return false;
        }
        saveData.shop.crystals -= item.price;
        saveData.shop.owned.push(itemId);
        this.persist();
        return true;
    },

    getEquipped(type) {
        if (!saveData) {
            this.load();
        }
        return saveData.shop.equipped[type] || DEFAULT_ITEMS[type];
    },

    equipItem(itemId) {
        if (!saveData) {
            this.load();
        }
        const item = getShopItem(itemId);
        if (!item || !this.isOwned(itemId)) {
            return false;
        }
        if (item.type === "skin") {
            // Скін одягається так само, як скіни рівнів
            saveData.settings.activeSkin = item.renderType;
        } else {
            saveData.shop.equipped[item.type] = itemId;
        }
        this.persist();
        return true;
    },

    // Разові бонуси рівня: перше проходження, срібна й золота рамки
    getPaid(levelId) {
        if (!saveData) {
            this.load();
        }
        return saveData.shop.paid[String(levelId)] || { first: false, silver: false, gold: false };
    },

    markPaid(levelId, flags) {
        if (!saveData) {
            this.load();
        }
        const current = this.getPaid(levelId);
        saveData.shop.paid[String(levelId)] = {
            first: current.first || !!flags.first,
            silver: current.silver || !!flags.silver,
            gold: current.gold || !!flags.gold
        };
        this.persist();
    },

    // ---------- Сундуки ----------

    getPendingChests() {
        if (!saveData) {
            this.load();
        }
        return saveData.shop.chests.slice();
    },

    addChests(types) {
        if (!saveData) {
            this.load();
        }
        for (const type of types) {
            if (CHEST_TYPES[type]) {
                saveData.shop.chests.push(type);
            }
        }
        this.persist();
    },

    getWinsWithoutChest() {
        if (!saveData) {
            this.load();
        }
        return saveData.shop.winsWithoutChest || 0;
    },

    setWinsWithoutChest(n) {
        if (!saveData) {
            this.load();
        }
        saveData.shop.winsWithoutChest = Math.max(0, Math.floor(n) || 0);
        this.persist();
    },

    // Відкриває перший сундук у черзі: предмет одразу стає купленим, монети — на рахунок.
    // Повертає { type, result: { kind: "item", id } | { kind: "crystals", amount } } або null
    openNextChest() {
        if (!saveData) {
            this.load();
        }
        if (saveData.shop.chests.length === 0) {
            return null;
        }
        const type = saveData.shop.chests.shift();
        saveData.achievements.stats.chestsOpened++;
        const self = this;
        // Аксесуар може підвищити шанс, що з сундука випаде річ;
        // скін і аксесуар із бонусом «сердечка» — шанс сердечка
        const accPerk = accessoryPerk(this.getEquipped("accessory"));
        const itemBonus = accPerk.item || 0;
        const skin = activeSkinPerk(this.getActiveSkin());
        const heartBonus = (accPerk.hearts || 0) + (skin && skin.kind === "hearts" ? skin.value : 0);
        // Звичайні товари, ще не відкриті за лігою, із сундука не випадають
        const unavailable = function (id) {
            if (self.isOwned(id)) {
                return true;
            }
            const it = getShopItem(id);
            return !!it && !it.legendary && !self.getRequirementProgress(it).met;
        };
        const result = rollChest(type, unavailable, undefined, itemBonus, heartBonus);
        if (result.kind === "item") {
            saveData.shop.owned.push(result.id);
        } else if (result.kind === "heart") {
            saveData.shop.hearts = Math.min(99, (saveData.shop.hearts || 0) + result.amount);
        } else {
            saveData.shop.crystals += result.amount;
        }
        this.persist();
        return { type: type, result: result };
    },

    // ---------- Сердечка (запасні життя) ----------

    getHearts() {
        if (!saveData) {
            this.load();
        }
        return saveData.shop.hearts || 0;
    },

    addHearts(n) {
        if (!saveData) {
            this.load();
        }
        saveData.shop.hearts = Math.max(0, Math.min(99, (saveData.shop.hearts || 0) + Math.floor(n)));
        this.persist();
    },

    // Витратити одне сердечко: true — вдалося
    useHeart() {
        if (!saveData) {
            this.load();
        }
        if ((saveData.shop.hearts || 0) <= 0) {
            return false;
        }
        saveData.shop.hearts--;
        this.persist();
        return true;
    },

    // Умова легендарного товару: { met, current, target, text }.
    // Для звичайних товарів умова завжди виконана.
    getRequirementProgress(item) {
        if (!saveData) {
            this.load();
        }
        const req = item && item.requirement;
        if (!req) {
            // Дорожчі звичайні товари відкриваються в наступних лігах
            const needLeague = shopTierLeague(item);
            const reached = (getLevelById(saveData.progress.unlocked) || { leagueId: 1 }).leagueId;
            if (reached < needLeague) {
                return { met: false, current: 0, target: 1, text: "Відкриється в Лізі " + needLeague };
            }
            return { met: true, current: 0, target: 0, text: "" };
        }
        const levels = saveData.progress.levels;
        if (req.kind === "boss") {
            const boss = levels[String(BOSS_LEVEL_ID)];
            const done = !!boss && boss.bestPct === 100;
            return { met: done, current: done ? 1 : 0, target: 1, text: "Пройди Боса (5-1)" };
        }
        if (req.kind === "gold_count") {
            let golds = 0;
            for (const level of ALL_LEVELS) {
                const entry = levels[String(level.id)];
                if (entry && entry.perfect === "hard") {
                    golds++;
                }
            }
            return { met: golds >= req.target, current: Math.min(golds, req.target), target: req.target, text: "Золоті рамки" };
        }
        if (req.kind === "gold_league") {
            const leagueLevels = ALL_LEVELS.filter(function (l) { return l.leagueId === req.league; });
            let golds = 0;
            for (const level of leagueLevels) {
                const entry = levels[String(level.id)];
                if (entry && entry.perfect === "hard") {
                    golds++;
                }
            }
            return { met: golds >= leagueLevels.length, current: golds, target: leagueLevels.length, text: "Золото на всіх рівнях Ліги " + req.league };
        }
        if (req.kind === "clears") {
            // Скільки будь-яких рівнів пройдено до кінця
            let cleared = 0;
            for (const level of ALL_LEVELS) {
                const entry = levels[String(level.id)];
                if (entry && entry.bestPct === 100) {
                    cleared++;
                }
            }
            return { met: cleared >= req.target, current: Math.min(cleared, req.target), target: req.target, text: "Пройдені рівні" };
        }
        if (req.kind === "combo_levels") {
            // Усі рівні-комбінації (склади, перекати, печатки…)
            const comboLevels = ALL_LEVELS.filter(function (l) { return !!l.combo; });
            let done = 0;
            for (const level of comboLevels) {
                const entry = levels[String(level.id)];
                if (entry && entry.bestPct === 100) {
                    done++;
                }
            }
            return { met: done >= comboLevels.length, current: done, target: comboLevels.length, text: "Пройди всі рівні-комбінації" };
        }
        if (req.kind === "achievements") {
            const got = saveData.achievements.done.length;
            return { met: got >= req.target, current: Math.min(got, req.target), target: req.target, text: "Досягнення" };
        }
        return { met: false, current: 0, target: 1, text: "" };
    },

    // ---------- Досягнення ----------

    // Підсумок забігу для лічильників досягнень.
    // run: { hits, words, maxCombo, weaponHits, won, flawless, leagueId, eggTheme, exploded }
    recordRunForAchievements(run) {
        if (!saveData) {
            this.load();
        }
        const st = saveData.achievements.stats;
        st.letters += Math.max(0, Math.floor(run.hits) || 0);
        st.words += Math.max(0, Math.floor(run.words) || 0);
        st.bestCombo = Math.max(st.bestCombo, Math.floor(run.maxCombo) || 0);
        st.weaponHits += Math.max(0, Math.floor(run.weaponHits) || 0);
        const league = Math.floor(run.leagueId) || 0;
        if (run.won && run.flawless && league >= 1 && league <= 9 && st.flawlessLeagues.indexOf(league) === -1) {
            st.flawlessLeagues.push(league);
        }
        if (run.exploded) {
            st.explosions++;
        }
        if (run.eggTheme && EGG_BY_THEME[run.eggTheme] && st.eggs.indexOf(run.eggTheme) === -1) {
            st.eggs.push(run.eggTheme);
        }
        this.markPlayDay();
    },

    // Рахує різні дні, у які грали (не обов'язково поспіль)
    markPlayDay() {
        if (!saveData) {
            this.load();
        }
        const st = saveData.achievements.stats;
        const today = localDayKey();
        if (st.lastDay !== today) {
            st.lastDay = today;
            st.days++;
        }
        this.persist();
    },

    // Знімок усього, від чого залежать досягнення
    getAchievementSnapshot() {
        if (!saveData) {
            this.load();
        }
        const levels = saveData.progress.levels;
        const st = saveData.achievements.stats;
        const leagueDone = {};
        const leagueLeft = {};
        let clears = 0;
        let silvers = 0;
        let golds = 0;
        const themes = [];
        for (const level of ALL_LEVELS) {
            const entry = levels[String(level.id)];
            const cleared = !!entry && entry.bestPct === 100;
            if (cleared) {
                clears++;
            }
            if (entry && entry.perfect) {
                silvers++;
            }
            if (entry && entry.perfect === "hard") {
                golds++;
            }
            leagueLeft[level.leagueId] = (leagueLeft[level.leagueId] || 0) + (cleared ? 0 : 1);
            if (EGG_BY_THEME[level.bgTheme] && themes.indexOf(level.bgTheme) === -1) {
                themes.push(level.bgTheme);
            }
        }
        for (const id of Object.keys(leagueLeft)) {
            leagueDone[id] = leagueLeft[id] === 0;
        }
        const boss = levels[String(BOSS_LEVEL_ID)];
        let mastered = 0;
        for (const key of KEYS) {
            const s = saveData.progress.letterStats[key.letter];
            if (s && s.ok + s.miss >= 10 && s.miss / (s.ok + s.miss) < 0.1) {
                mastered++;
            }
        }
        let weapons = 0;
        let legendary = 0;
        let shopSkins = 0;
        for (const id of saveData.shop.owned) {
            const item = getShopItem(id);
            if (!item) {
                continue;
            }
            if (item.type === "weapon") {
                weapons++;
            }
            if (item.type === "skin") {
                shopSkins++;
            }
            if (item.legendary) {
                legendary++;
            }
        }
        return {
            clears: clears,
            leagueDone: leagueDone,
            bossDone: !!boss && boss.bestPct === 100,
            silvers: silvers,
            golds: golds,
            totalLevels: ALL_LEVELS.length,
            flawlessLeagues: st.flawlessLeagues.reduce(function (acc, id) { acc[id] = true; return acc; }, {}),
            bestCombo: st.bestCombo,
            letters: st.letters,
            words: st.words,
            masteredLetters: mastered,
            eggs: st.eggs.filter(function (t) { return themes.indexOf(t) !== -1; }).length,
            totalEggs: themes.length,
            itemsOwned: saveData.shop.owned.length,
            weaponsOwned: weapons,
            skins: saveData.progress.unlockedSkins.length + shopSkins,
            chestsOpened: st.chestsOpened,
            legendaryOwned: legendary,
            days: st.days,
            explosions: st.explosions,
            weaponHits: st.weaponHits
        };
    },

    // Відкриває всі виконані досягнення, кладе сундуки-нагороди в чергу.
    // Повертає масив щойно відкритих досягнень (порожній, якщо нових немає)
    checkAchievements() {
        if (!saveData) {
            this.load();
        }
        const snapshot = this.getAchievementSnapshot();
        const done = saveData.achievements.done;
        const fresh = [];
        for (const ach of ACHIEVEMENTS) {
            if (done.indexOf(ach.id) !== -1) {
                continue;
            }
            if (achievementProgress(ach, snapshot).done) {
                done.push(ach.id);
                if (CHEST_TYPES[ach.chest]) {
                    saveData.shop.chests.push(ach.chest);
                }
                fresh.push(ach);
            }
        }
        if (fresh.length > 0) {
            this.persist();
        }
        return fresh;
    },

    isAchievementDone(id) {
        if (!saveData) {
            this.load();
        }
        return saveData.achievements.done.indexOf(id) !== -1;
    },

    // Кристали задним числом за рівні, пройдені ще до появи магазину:
    // перше проходження, срібна й золота рамки. Кожен бонус видається один раз
    // (позначки в shop.paid), тож повторний виклик нічого не додає.
    grantRetroactive() {
        if (!saveData) {
            this.load();
        }
        let total = 0;
        let levelsCount = 0;
        for (const level of ALL_LEVELS) {
            const entry = saveData.progress.levels[String(level.id)];
            if (!entry || entry.bestPct !== 100) {
                continue;
            }
            const paid = this.getPaid(level.id);
            let add = 0;
            if (!paid.first) {
                add += FIRST_CLEAR_BONUS[level.leagueId] || 0;
            }
            if (entry.perfect && !paid.silver) {
                add += SILVER_BONUS;
            }
            if (entry.perfect === "hard" && !paid.gold) {
                add += GOLD_BONUS;
            }
            if (add > 0) {
                total += add;
                levelsCount++;
                saveData.shop.paid[String(level.id)] = {
                    first: true,
                    silver: paid.silver || !!entry.perfect,
                    gold: paid.gold || entry.perfect === "hard"
                };
            }
        }
        if (total > 0) {
            saveData.shop.crystals += total;
            this.persist();
        }
        return { total: total, levels: levelsCount };
    }
};

// Скільки останніх спроб на літеру пам'ятає статистика помилок
const LETTER_MEMORY = 40;

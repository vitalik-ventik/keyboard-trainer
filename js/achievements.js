// ============================================================
// achievements.js — досягнення та сундуки за них
// Кожне досягнення має ціль (target) і функцію value(s), що рахує поточний
// прогрес зі «знімка» гравця s (його будує save.getAchievementSnapshot()).
// Коли value(s) >= target, досягнення відкривається один раз і дає сундук.
// ============================================================

// Групи — для підписів і майбутнього екрана «Досягнення»
export const ACHIEVEMENT_GROUPS = [
    { id: "clear", name: "Проходження" },
    { id: "mastery", name: "Майстерність" },
    { id: "combo", name: "Серії" },
    { id: "typing", name: "Набір" },
    { id: "eggs", name: "Пасхалки" },
    { id: "collect", name: "Колекція" },
    { id: "days", name: "Завзятість" },
    { id: "fun", name: "Кумедні" }
];

export const ACHIEVEMENTS = [
    // Проходження
    { id: "first_win", group: "clear", icon: "🏁", name: "Перша перемога", desc: "Пройди будь-який рівень", chest: "wood", target: 1, value: function (s) { return s.clears; } },
    { id: "clears_10", group: "clear", icon: "🔟", name: "Десятка", desc: "Пройди 10 рівнів", chest: "wood", target: 10, value: function (s) { return s.clears; } },
    { id: "league_1", group: "clear", icon: "🥉", name: "Базова ліга", desc: "Пройди всі рівні Базової ліги", chest: "silver", target: 1, value: function (s) { return s.leagueDone[1] ? 1 : 0; } },
    { id: "league_2", group: "clear", icon: "🥈", name: "Середня ліга", desc: "Пройди всі рівні Середньої ліги", chest: "silver", target: 1, value: function (s) { return s.leagueDone[2] ? 1 : 0; } },
    { id: "league_3", group: "clear", icon: "🥇", name: "Складна ліга", desc: "Пройди всі рівні Складної ліги", chest: "silver", target: 1, value: function (s) { return s.leagueDone[3] ? 1 : 0; } },
    { id: "league_4", group: "clear", icon: "🎖️", name: "Майстер-ліга", desc: "Пройди всі рівні ліги Майстер", chest: "gold", target: 1, value: function (s) { return s.leagueDone[4] ? 1 : 0; } },
    { id: "boss", group: "clear", icon: "👹", name: "Переможець демона", desc: "Здолай Боса", chest: "gold", target: 1, value: function (s) { return s.bossDone ? 1 : 0; } },

    // Майстерність
    { id: "silver_5", group: "mastery", icon: "⚪", name: "Срібна п'ятірка", desc: "Отримай 5 срібних рамок", chest: "wood", target: 5, value: function (s) { return s.silvers; } },
    { id: "silver_15", group: "mastery", icon: "🪙", name: "Срібний збирач", desc: "Отримай 15 срібних рамок", chest: "silver", target: 15, value: function (s) { return s.silvers; } },
    { id: "silver_all", group: "mastery", icon: "💿", name: "Усе в сріблі", desc: "Отримай срібну рамку на кожному рівні", chest: "gold", target: 0, value: function (s) { return s.silvers; }, targetFromSnapshot: "totalLevels" },
    { id: "gold_5", group: "mastery", icon: "🟡", name: "Золота п'ятірка", desc: "Отримай 5 золотих рамок", chest: "silver", target: 5, value: function (s) { return s.golds; } },
    { id: "gold_15", group: "mastery", icon: "🏅", name: "Золотий збирач", desc: "Отримай 15 золотих рамок", chest: "silver", target: 15, value: function (s) { return s.golds; } },
    { id: "gold_all", group: "mastery", icon: "👑", name: "Усе в золоті", desc: "Отримай золоту рамку на кожному рівні", chest: "gold", target: 0, value: function (s) { return s.golds; }, targetFromSnapshot: "totalLevels" },
    { id: "flawless", group: "mastery", icon: "✨", name: "Без жодної помилки", desc: "Пройди рівень, не натиснувши жодної зайвої літери", chest: "silver", target: 1, value: function (s) { return s.flawless; } },

    // Серії «Ідеально»
    { id: "combo_10", group: "combo", icon: "🔥", name: "Розігрів", desc: "10 «Ідеально» поспіль", chest: "wood", target: 10, value: function (s) { return s.bestCombo; } },
    { id: "combo_25", group: "combo", icon: "⚡", name: "Блискавка", desc: "25 «Ідеально» поспіль", chest: "silver", target: 25, value: function (s) { return s.bestCombo; } },
    { id: "combo_50", group: "combo", icon: "🌟", name: "Непереможна серія", desc: "50 «Ідеально» поспіль", chest: "gold", target: 50, value: function (s) { return s.bestCombo; } },

    // Набір
    { id: "letters_1000", group: "typing", icon: "⌨️", name: "Тисяча літер", desc: "Набери 1 000 літер", chest: "wood", target: 1000, value: function (s) { return s.letters; } },
    { id: "letters_5000", group: "typing", icon: "📜", name: "П'ять тисяч літер", desc: "Набери 5 000 літер", chest: "silver", target: 5000, value: function (s) { return s.letters; } },
    { id: "letters_20000", group: "typing", icon: "📚", name: "Друкарська машинка", desc: "Набери 20 000 літер", chest: "gold", target: 20000, value: function (s) { return s.letters; } },
    { id: "words_100", group: "typing", icon: "📝", name: "Сто слів", desc: "Набери 100 слів", chest: "wood", target: 100, value: function (s) { return s.words; } },
    { id: "words_500", group: "typing", icon: "📖", name: "П'ятсот слів", desc: "Набери 500 слів", chest: "silver", target: 500, value: function (s) { return s.words; } },
    { id: "all_letters", group: "typing", icon: "🔤", name: "Знавець абетки", desc: "Усі 33 літери з точністю понад 90%", chest: "silver", target: 33, value: function (s) { return s.masteredLetters; } },

    // Пасхалки
    { id: "eggs_10", group: "eggs", icon: "🥚", name: "Уважне око", desc: "Побач 10 різних пасхалок", chest: "wood", target: 10, value: function (s) { return s.eggs; } },
    { id: "eggs_25", group: "eggs", icon: "🔍", name: "Слідопит", desc: "Побач 25 різних пасхалок", chest: "silver", target: 25, value: function (s) { return s.eggs; } },
    { id: "eggs_all", group: "eggs", icon: "🕵️", name: "Мисливець за пасхалками", desc: "Побач усі пасхалки гри", chest: "gold", target: 0, value: function (s) { return s.eggs; }, targetFromSnapshot: "totalEggs" },

    // Колекція
    { id: "first_item", group: "collect", icon: "🛒", name: "Перша річ", desc: "Отримай перший предмет із магазину чи сундука", chest: "wood", target: 1, value: function (s) { return s.itemsOwned; } },
    { id: "first_weapon", group: "collect", icon: "🗡️", name: "Озброєний", desc: "Отримай першу зброю", chest: "wood", target: 1, value: function (s) { return s.weaponsOwned; } },
    { id: "skins_10", group: "collect", icon: "🎨", name: "Модник", desc: "Збери 10 скінів", chest: "wood", target: 10, value: function (s) { return s.skins; } },
    { id: "chests_30", group: "collect", icon: "🎁", name: "Скарбошукач", desc: "Відкрий 30 сундуків", chest: "wood", target: 30, value: function (s) { return s.chestsOpened; } },
    { id: "legendary", group: "collect", icon: "⭐", name: "Легенда", desc: "Отримай легендарний предмет", chest: "silver", target: 1, value: function (s) { return s.legendaryOwned; } },

    // Завзятість (дні не обов'язково поспіль)
    { id: "days_3", group: "days", icon: "📅", name: "Три дні", desc: "Грай у 3 різні дні", chest: "wood", target: 3, value: function (s) { return s.days; } },
    { id: "days_7", group: "days", icon: "🗓️", name: "Тиждень гри", desc: "Грай у 7 різних днів", chest: "wood", target: 7, value: function (s) { return s.days; } },
    { id: "days_15", group: "days", icon: "🏆", name: "Справжній тренер", desc: "Грай у 15 різних днів", chest: "silver", target: 15, value: function (s) { return s.days; } },

    // Кумедні
    { id: "boom_100", group: "fun", icon: "💥", name: "Вибуховий характер", desc: "Вибухни 100 разів", chest: "wood", target: 100, value: function (s) { return s.explosions; } },
    { id: "weapon_100", group: "fun", icon: "⚔️", name: "Руйнівник шипів", desc: "Знищ зброєю 100 шипів", chest: "wood", target: 100, value: function (s) { return s.weaponHits; } }
];

// Ціль досягнення (для «усі рівні», «усі пасхалки» вона залежить від гри)
export function achievementTarget(ach, snapshot) {
    if (ach.targetFromSnapshot) {
        return Math.max(1, snapshot[ach.targetFromSnapshot] || 1);
    }
    return ach.target;
}

// Поточний прогрес: { current, target, done }
export function achievementProgress(ach, snapshot) {
    const target = achievementTarget(ach, snapshot);
    const value = Math.max(0, Math.floor(Number(ach.value(snapshot)) || 0));
    return { current: Math.min(value, target), target: target, done: value >= target };
}

export function getAchievement(id) {
    for (const ach of ACHIEVEMENTS) {
        if (ach.id === id) {
            return ach;
        }
    }
    return null;
}

// Лічильники, яких немає в іншій частині збереження
export function defaultAchievementData() {
    return {
        done: [],
        stats: {
            letters: 0,
            words: 0,
            bestCombo: 0,
            flawless: 0,
            eggs: [],
            chestsOpened: 0,
            days: 0,
            lastDay: "",
            explosions: 0,
            weaponHits: 0
        }
    };
}

// Перевірка даних із localStorage: усе невідоме чи зіпсоване замінюється нулями
export function sanitizeAchievementData(raw) {
    const clean = defaultAchievementData();
    if (!raw || typeof raw !== "object") {
        return clean;
    }
    if (Array.isArray(raw.done)) {
        clean.done = raw.done.filter(function (id, idx, arr) {
            return typeof id === "string" && getAchievement(id) && arr.indexOf(id) === idx;
        });
    }
    const st = raw.stats;
    if (st && typeof st === "object") {
        for (const key of ["letters", "words", "bestCombo", "flawless", "chestsOpened", "days", "explosions", "weaponHits"]) {
            const n = Number(st[key]);
            if (Number.isFinite(n) && n >= 0) {
                clean.stats[key] = Math.min(Math.floor(n), 100000000);
            }
        }
        if (Array.isArray(st.eggs)) {
            clean.stats.eggs = st.eggs.filter(function (e, idx, arr) {
                return typeof e === "string" && e.length < 64 && arr.indexOf(e) === idx;
            }).slice(0, 200);
        }
        if (typeof st.lastDay === "string" && st.lastDay.length <= 10) {
            clean.stats.lastDay = st.lastDay;
        }
    }
    return clean;
}

// Сьогоднішня дата за місцевим часом, «2026-09-25»
export function localDayKey(date) {
    const d = date || new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
}

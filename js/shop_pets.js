// ============================================================
// shop_pets.js — улюбленці: рідкості, бонуси (перки) й межі зграї, місця для
// улюбленців, мутації та підписи для магазину. Малювання — pets_draw.js і pet_renderers.js,
// поведінка на трасі — engine_pets.js. Товари-улюбленці (type: "pet") — у каталозі shop.js
// ============================================================

// ---------- Рідкості ----------

// Рідкість замість ліги: колір плашки й рамки. Ліга, з якої улюбленець продається,
// задана в товарі полем league (звичайний і рідкісний — Ліга 1, епічний — 2,
// легендарний — 3, міфічний — 4)
export const PET_RARITIES = {
    common: { name: "Звичайний", color: "#c8d0e0" },
    rare: { name: "Рідкісний", color: "#39c6ff" },
    epic: { name: "Епічний", color: "#d68bff" },
    legendary: { name: "Легендарний", color: "#ffcc33" },
    mythic: { name: "Міфічний", color: "#ff4a5a" },
    brainrot: { name: "Брейнрот", color: "#ff6bd6", rainbow: true },
    secret: { name: "Секретний", color: "#9cffe8" },
    ultra: { name: "Ультра-секрет", color: "#ffe14d", rainbow: true }
};

export function petRarity(item) {
    return PET_RARITIES[item && item.rarity] || PET_RARITIES.common;
}

// Колір рідкості в цю мить: у «Брейнрота» він переливається веселкою
export function petRarityColor(item, time) {
    const rarity = petRarity(item);
    if (rarity.rainbow) {
        return "hsl(" + Math.round(((time || 0) * 0.12) % 360) + ", 95%, 65%)";
    }
    return rarity.color;
}

// ---------- Бонуси улюбленців ----------

// Кожен улюбленець дає один-два (дорожчі — три) бонуси з тих, що вже є в грі,
// приблизно вдвічі слабші, ніж такий самий бонус аксесуара, шлейфа, вибуху чи скіна:
//   coins — більше монет за забіг, chest — шанс сундука за повторну перемогу,
//   item — шанс речі в сундуку, hearts — шанс сердечка в сундуку,
//   slow — повільніша траса, window — ширша зона стрибка,
//   series — множник монет за серії (додається до ×1), words — множник монет за слова,
//   perfect — ширша зона «Ідеально», shield — щит на одну помилку,
//   consolation — «Утіха»: яка частка монет лишається після вибуху (замість половини)
export const PET_PERKS = {
    pet_hamster: { series: 0.15 },
    pet_puppy: { chest: 0.03 },
    pet_slime: { window: 0.02, slow: 0.02 },
    pet_bunny: { window: 0.03 },
    pet_kitten: { item: 0.05, hearts: 0.03 },
    pet_seal: { series: 0.2, coins: 0.02 },
    pet_owl: { item: 0.08, words: 0.2 },
    pet_ghost: { consolation: 0.7, hearts: 0.05 },
    pet_octopus: { words: 0.3, chest: 0.05 },
    pet_mini_dragon: { perfect: 0.1, series: 0.3 },
    pet_ufo: { window: 0.06, slow: 0.04 },
    pet_drone: { window: 0.08, perfect: 0.15 },
    pet_bubliko: { coins: 0.06, perfect: 0.12, hearts: 0.05 },
    pet_tapochkino: { coins: 0.1, window: 0.08, series: 0.3 },
    pet_phoenix: { shield: true, consolation: 0.75 },
    pet_klaviatoro: { coins: 0.1, words: 0.4, consolation: 0.75 },
    pet_capybara: { consolation: 0.6 },
    pet_duck: { slow: 0.02 },
    pet_llama: { coins: 0.03 },
    pet_alpaca: { series: 0.2, hearts: 0.03 },
    pet_turtle: { slow: 0.03, hearts: 0.03 },
    pet_jellyfish: { window: 0.04, consolation: 0.6 },
    pet_dolphin: { perfect: 0.1, coins: 0.04 },
    pet_kavunotto: { words: 0.3, item: 0.05 },
    pet_pelmenino: { coins: 0.06, chest: 0.06, consolation: 0.65 },
    pet_capibaro_mandarino: { consolation: 0.7, coins: 0.08, perfect: 0.1 },
    // Секретні: по два-три бонуси, найсильніші — із золотого сундука
    pet_bobrani: { chest: 0.06, item: 0.06 },
    pet_tapko_sahur: { series: 0.3, perfect: 0.1 },
    pet_banan_gangstero: { coins: 0.06, consolation: 0.65 },
    pet_hotdog: { words: 0.3, hearts: 0.05 },
    pet_skibidino: { window: 0.06, slow: 0.03 },
    pet_kartoplino: { hearts: 0.06, window: 0.04 },
    pet_akuloni: { slow: 0.04, perfect: 0.12, coins: 0.05 },
    pet_kavun_bomboni: { series: 0.35, words: 0.25 },
    pet_ballerino: { perfect: 0.15, window: 0.06 },
    pet_shimpanzini: { item: 0.1, chest: 0.06, coins: 0.04 },
    pet_pelmen_mafiozo: { coins: 0.1, consolation: 0.7 },
    pet_fridge: { slow: 0.05, hearts: 0.06 },
    pet_borshchelino: { coins: 0.12, chest: 0.1, item: 0.1, shield: true },
    pet_bombardino: { coins: 0.1, series: 0.4, perfect: 0.12 },
    pet_traktorino: { shield: true, window: 0.08, slow: 0.04 },
    pet_goldoni: { coins: 0.15, chest: 0.08, item: 0.08 },
    pet_shaurmino: { words: 0.5, consolation: 0.75, hearts: 0.06 },
    pet_borgini: { shield: true, perfect: 0.2, window: 0.1 },
    // Секретні улюбленці світів
    pet_kubo_kriperino: { words: 0.3, chest: 0.05 },
    pet_flamingo: { perfect: 0.14, consolation: 0.65 },
    pet_raptor_raketoni: { coins: 0.08, series: 0.3 },
    pet_motocyclino: { slow: 0.04, window: 0.06 },
    pet_idol: { item: 0.1, hearts: 0.05 },
    pet_glitcho: { window: 0.07, perfect: 0.1 },
    pet_gromoni: { series: 0.4, coins: 0.05 },
    pet_kristalozavr: { shield: true, hearts: 0.04 },
    pet_tirex: { words: 0.35, consolation: 0.65 },
    pet_skeletoni: { perfect: 0.12, slow: 0.03, series: 0.2 },
    pet_agent_homiakoni: { chest: 0.08, item: 0.06 },
    pet_klouno: { consolation: 0.7, series: 0.3 },
    pet_roboakulo: { coins: 0.08, slow: 0.04 },
    pet_dvoholovo: { words: 0.3, perfect: 0.1, window: 0.04 },
    pet_dyryzhabloni: { slow: 0.05, hearts: 0.06, coins: 0.04 },
    pet_golkiperoni: { shield: true, perfect: 0.08 },
    pet_ninja_ravlino: { perfect: 0.14, slow: 0.03 },
    pet_yakorino: { consolation: 0.7, hearts: 0.05 },
    pet_krakeno: { item: 0.1, chest: 0.06 },
    pet_mimik: { chest: 0.1, coins: 0.06 },
    pet_astronavto: { slow: 0.05, window: 0.05 },
    pet_drakon_skarboni: { coins: 0.1, item: 0.06 },
    pet_krotoni: { item: 0.08, words: 0.25 },
    pet_bekonino: { shield: true, series: 0.25 },
    pet_pingvino_snow: { slow: 0.04, series: 0.3 },
    pet_meduzoni: { window: 0.07, consolation: 0.65 },
    pet_kaktusoni: { words: 0.35, perfect: 0.08 },
    pet_ostrivoni: { hearts: 0.07, slow: 0.03 },
    pet_chornodiro: { slow: 0.06, coins: 0.05 },
    pet_angelo_gusoni: { hearts: 0.06, consolation: 0.7 },
    pet_demonino: { series: 0.4, words: 0.3 },
    // Ультра-секретний — усе потроху
    pet_fusion: { coins: 0.15, series: 0.4, words: 0.4, perfect: 0.15, consolation: 0.75, shield: true }
};

// Межі зграї: однакові бонуси кількох улюбленців складаються, але не більше за межу.
// «Утіха» не складається — діє найбільша з улюбленців (і теж не більше за межу)
export const PET_PERK_CAPS = {
    coins: 0.25,
    chest: 0.2,
    item: 0.2,
    hearts: 0.15,
    slow: 0.08,
    window: 0.1,
    series: 0.5,
    words: 0.6,
    perfect: 0.2,
    consolation: 0.75
};

// Порядок і вигляд бонусів у магазині
const PERK_ORDER = ["coins", "chest", "item", "hearts", "slow", "window", "series", "words", "perfect", "consolation", "shield"];

const PERK_LABELS = {
    coins: function (v) { return "🪙 Монети +" + pct(v); },
    chest: function (v) { return "🎁 Сундуки +" + pct(v); },
    item: function (v) { return "✨ Речі +" + pct(v); },
    hearts: function (v) { return "❤ Сердечка +" + pct(v); },
    slow: function (v) { return "🐢 Швидкість −" + pct(v); },
    window: function (v) { return "🎯 Зона +" + pct(v); },
    series: function (v) { return "🔥 Серії ×" + round2(1 + v); },
    words: function (v) { return "📝 Слова ×" + round2(1 + v); },
    perfect: function (v) { return "💠 Ідеально +" + pct(v); },
    consolation: function (v) { return "🧸 Утіха " + pct(v); },
    shield: function () { return "🛡 Щит на 1 помилку"; }
};

export const PET_PERK_HINTS = {
    coins: "🪙 Монети — монети, зароблені в забігу, більші (разові бонуси рівня не змінюються)",
    chest: "🎁 Сундуки — вищий шанс отримати сундук за повторну перемогу рівня",
    item: "✨ Речі — у сундуку частіше випадає предмет замість монет",
    hearts: "❤ Сердечка — у сундуку частіше випадає сердечко, запасне життя",
    slow: "🐢 Швидкість — шипи рухаються повільніше, тож більше часу знайти потрібну клавішу",
    window: "🎯 Зона — зона, де можна натиснути літеру («ОК» та «Ідеально»), ширша",
    series: "🔥 Серії — бонусні монети за кілька «Ідеально» поспіль більші",
    words: "📝 Слова — монети за слова й комбінації без помилки множаться",
    perfect: "💠 Ідеально — зона «Ідеально» ширша",
    consolation: "🧸 Утіха — після вибуху лишається більша частка монет забігу, а не половина. Не складається: діє найбільша",
    shield: "🛡 Щит — одна помилка чи зіткнення за рівень пробачається"
};

function pct(v) {
    return Math.round(v * 100) + "%";
}

function round2(v) {
    return Math.round(v * 100) / 100;
}

// ---------- Мутації ----------

// Мутація робить улюбленця іншого кольору й посилює всі його бонуси (factor),
// але межі зграї однакові для всіх. Мутації випадають лише із сундуків
export const PET_MUTATIONS = {
    gold: { name: "Золотий", icon: "🥇", tint: "#ffcf3a", alpha: 0.5, factor: 1.25 },
    diamond: { name: "Алмазний", icon: "💎", tint: "#8ff6ff", alpha: 0.5, factor: 1.25 },
    rainbow: { name: "Райдужний", icon: "🌈", tint: null, alpha: 0.6, factor: 1.5 },
    lava: { name: "Лавовий", icon: "🔥", tint: "#ff5a1a", alpha: 0.45, factor: 1.25 },
    candy: { name: "Цукерковий", icon: "🍬", tint: "#ff8ad8", alpha: 0.4, factor: 1.25 }
};

export const PET_MUTATION_KEYS = Object.keys(PET_MUTATIONS);

// Шанс, що новий улюбленець випаде із сундука вже мутованим
export const PET_MUTATION_CHANCE = 0.12;

// ---------- Секретні улюбленці ----------

// Секретний улюбленець не продається. Поле secret товару — сундук, з якого він випадає
// ("wood" | "silver" | "gold"), або "world": тоді поле world — тема світу, і улюбленець
// випадає з будь-якого сундука, виграного в цьому світі. Випадає лише той, кого ще немає
export const SECRET_PET_CHANCE = { wood: 0.01, silver: 0.015, gold: 0.02 };
export const SECRET_WORLD_CHANCE = 0.05;

// М'яка гарантія: кожен сундук без секретного (коли в ньому ще є кого знайти) додає
// до шансу SECRET_PITY_STEP, а SECRET_PITY_MAX-й такий сундук поспіль дає секретного напевно
export const SECRET_PITY_STEP = 0.001;
export const SECRET_PITY_MAX = 70;

// Звідки секретний улюбленець (для підказки на картці)
export const SECRET_CHEST_SOURCES = {
    wood: { icon: "🪵", text: "Лише з дерев'яного сундука" },
    silver: { icon: "🥈", text: "Лише зі срібного сундука" },
    gold: { icon: "🥇", text: "Лише із золотого сундука" }
};

// Підказка, де шукати секретного улюбленця. worldName — назва світу для secret: "world"
export function secretPetSource(item, worldName) {
    if (!item || !item.secret) {
        return null;
    }
    if (item.secret === "fusion") {
        return { icon: "🏆", text: "Нагорода за всіх інших секретних" };
    }
    if (item.secret === "world") {
        return { icon: "🌍", text: "Лише зі світу «" + (worldName || item.world) + "»" };
    }
    return SECRET_CHEST_SOURCES[item.secret] || SECRET_CHEST_SOURCES.gold;
}

// Шанс, що сундук замість монет мутує одного з уже наявних улюбленців без мутації
export const PET_MUTATE_OWNED_CHANCE = { wood: 0.04, silver: 0.08, gold: 0.15 };

// Випадкова мутація (райдужна — найрідкісніша)
export function rollPetMutation(random) {
    const rnd = random || Math.random;
    const weights = { gold: 3, diamond: 2, lava: 3, candy: 3, rainbow: 1 };
    let total = 0;
    for (const key of PET_MUTATION_KEYS) {
        total += weights[key];
    }
    let r = rnd() * total;
    for (const key of PET_MUTATION_KEYS) {
        r -= weights[key];
        if (r <= 0) {
            return key;
        }
    }
    return PET_MUTATION_KEYS[0];
}

// Бонуси одного улюбленця з урахуванням мутації
export function petPerk(petId, mutation) {
    const base = PET_PERKS[petId] || {};
    const factor = mutation && PET_MUTATIONS[mutation] ? PET_MUTATIONS[mutation].factor : 1;
    const out = {};
    for (const key of Object.keys(base)) {
        if (key === "shield") {
            out.shield = !!base.shield;
        } else if (key === "consolation") {
            // Посилюється лише надбавка понад звичайну половину
            out.consolation = 0.5 + (base.consolation - 0.5) * factor;
        } else {
            out[key] = base[key] * factor;
        }
    }
    return out;
}

// Сумарні бонуси зграї. pets — масив { id, mutation }.
// Повертає { coins, chest, …, consolation (0.5, якщо немає), shield }
export function petPerkTotals(pets) {
    const totals = { coins: 0, chest: 0, item: 0, hearts: 0, slow: 0, window: 0, series: 0, words: 0, perfect: 0, consolation: 0.5, shield: false };
    for (const pet of pets || []) {
        const perk = petPerk(pet.id, pet.mutation);
        for (const key of Object.keys(perk)) {
            if (key === "shield") {
                totals.shield = totals.shield || perk.shield;
            } else if (key === "consolation") {
                totals.consolation = Math.max(totals.consolation, perk.consolation);
            } else {
                totals[key] += perk[key];
            }
        }
    }
    for (const key of Object.keys(PET_PERK_CAPS)) {
        totals[key] = Math.min(PET_PERK_CAPS[key], totals[key]);
    }
    return totals;
}

// Рядки бонусів улюбленця для картки: [{ text, tip }]
export function petPerkLines(petId, mutation) {
    const perk = petPerk(petId, mutation);
    const lines = [];
    for (const key of PERK_ORDER) {
        if (perk[key] === undefined || perk[key] === false) {
            continue;
        }
        lines.push({ text: PERK_LABELS[key](perk[key]), tip: PET_PERK_HINTS[key] });
    }
    return lines;
}

// Підсумок бонусів зграї для магазину: [{ text, tip }] — «🪙 Монети +6% (межа 25%)»
export function petTotalsLines(pets) {
    const totals = petPerkTotals(pets);
    const lines = [];
    for (const key of PERK_ORDER) {
        if (key === "shield") {
            if (totals.shield) {
                lines.push({ text: PERK_LABELS.shield(), tip: PET_PERK_HINTS.shield });
            }
            continue;
        }
        const empty = key === "consolation" ? totals.consolation <= 0.5 : totals[key] <= 0;
        if (empty) {
            continue;
        }
        const cap = PET_PERK_CAPS[key];
        const capText = key === "series" || key === "words" ? "×" + round2(1 + cap) : pct(cap);
        lines.push({ text: PERK_LABELS[key](totals[key]) + " (межа " + capText + ")", tip: PET_PERK_HINTS[key] });
    }
    return lines;
}

// Короткий підпис усіх бонусів улюбленця одним рядком (сторінка перегляду, підказки)
export function petPerkText(petId) {
    return petPerkLines(petId, null).map(function (l) { return l.text; }).join(" · ");
}

export function petPerkHint(petId) {
    return petPerkLines(petId, null).map(function (l) { return l.tip; }).join("\n");
}

// ---------- Місця для улюбленців ----------

// Перше місце безкоштовне, решта купуються у вкладці «Улюбленці».
// Ціна й ліга, з якої місце можна купити (індекс — номер місця від 0)
export const PET_SLOTS = [
    { price: 0, league: 1 },
    { price: 400, league: 1 },
    { price: 1500, league: 2 },
    { price: 5000, league: 3 },
    { price: 12000, league: 4 }
];

export const MAX_PET_SLOTS = PET_SLOTS.length;

// ---------- Рух і середовище ----------

// Світи з водою: там плавучі улюбленці пливуть без бульбашки
export const WATER_THEMES = ["pixel_ocean", "pirate_bay", "night_harbor", "sea_fabricator", "soggy_swamp", "sponge_reef", "kaiju_bay", "pixel_islands"];

export function isWaterTheme(theme) {
    return WATER_THEMES.indexOf(theme) !== -1;
}

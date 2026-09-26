// ============================================================
// easter_eggs.js — унікальна пасхалка для кожного рівня: EGG_BY_THEME (тема → пасхалка),
// хелпери й реєстр EGG_DRAWERS, зібраний з easter_eggs_1.js і easter_eggs_2.js.
// Пасхалка з'являється один раз за рівень на 5 секунд (t від 0 до 1).
// Малюнок будується з піксельних прямокутників у одиницях блоку B.
// ============================================================

import { EGG_DRAWERS_1 } from "./easter_eggs_1.js";
import { EGG_DRAWERS_2 } from "./easter_eggs_2.js";

// ============================================================

// Пасхалка кожного світу: ключ малюнка й назва для підпису в preview
export const EGG_BY_THEME = {
    block_village: { key: "chicken", name: "Курка" },
    sunset_city: { key: "superhero", name: "Кубик-супергерой" },
    pumpkin_pastures: { key: "pig", name: "Свинка" },
    cosmodrome: { key: "satellite", name: "Супутник" },
    neon_highway: { key: "timecar", name: "Машина часу" },
    creeper_woods: { key: "enderman", name: "Ендермен" },
    jungle_temple: { key: "jaguar", name: "Ягуар" },
    digital_forest: { key: "deer", name: "Олень" },
    redstone_mines: { key: "minecart", name: "Вагонетка з шахтарем" },
    storm_sky: { key: "kite", name: "Повітряний змій" },
    crystal_cave: { key: "bats", name: "Зграя кажанів" },
    alien_freighter: { key: "jonesy", name: "Кіт Джонсі" },
    dino_valley: { key: "trex", name: "Тиранозавр" },
    pixel_night: { key: "zombie", name: "Зомбі" },
    hunter_jungle: { key: "cloaked", name: "Мисливець-невидимка" },
    secret_base: { key: "spydrone", name: "Дрон-шпигун" },
    luna_park: { key: "balloons", name: "Повітряні кульки" },
    soggy_swamp: { key: "slime", name: "Болотяні слизи" },
    sea_fabricator: { key: "reaper", name: "Жнець-левіафан" },
    twin_sun_planet: { key: "sandworm", name: "Піщаний хробак" },
    dungeon_depths: { key: "keygolem", name: "Ключ-голем" },
    sky_city: { key: "paperplane", name: "Паперовий літачок" },
    stadium: { key: "goalball", name: "М'яч-свічка" },
    alien_hive: { key: "chestburster", name: "Малюк-ксеноморф" },
    neon_rooftops: { key: "ufo", name: "НЛО" },
    desert_temple: { key: "scorpion", name: "Скорпіон" },
    night_harbor: { key: "whale", name: "Кит" },
    fiery_forge: { key: "phoenix", name: "Фенікс" },
    pirate_bay: { key: "kraken", name: "Кракен" },
    treasury: { key: "mimic", name: "Сундук-мімік" },
    planet_colony: { key: "dropship", name: "Десантний човник" },
    orbit_view: { key: "meteors", name: "Метеорний дощ" },
    hunter_ship: { key: "disc", name: "Диск мисливця" },
    dragon_lair: { key: "babydragon", name: "Дракончик" },
    pixel_cave: { key: "mole", name: "Кріт-шахтар" },
    obsidian_peak: { key: "phantom", name: "Фантом" },
    knight_castle: { key: "knight", name: "Лицар на коні" },
    hangar_bay: { key: "cleanbot", name: "Робот-прибиральник" },
    pixel_snow: { key: "penguin", name: "Пінгвін" },
    pixel_ocean: { key: "dolphin", name: "Дельфін" },
    pixel_desert: { key: "dustdevil", name: "Піщаний вихор" },
    pixel_islands: { key: "parrot", name: "Папуга-балакун" },
    black_hole: { key: "astronaut", name: "Астронавт" },
    sky_citadel: { key: "pegasus", name: "Пегас" },
    pixel_nether: { key: "ghast", name: "Гаст" },
    sponge_reef: { key: "starfish", name: "Морська зірка" },
    ninja_temple: { key: "skelbike", name: "Скелет на мотоциклі" },
    machine_war: { key: "liquidcop", name: "Рідкий метал" },
    kaiju_bay: { key: "mothra", name: "Велетенський метелик" },
    strange_town: { key: "demogorgon", name: "Демогоргон у стіні" },
    leaf_village: { key: "ninefox", name: "Дев'ятихвостий лис" }
};

// Малювальник прямокутників у одиницях блоку відносно точки (ox, oy).
// flip дзеркалить малюнок: фігури намальовані мордою вліво, з flip — управо
function painter(ctx, B, ox, oy, flip) {
    return function (color, x, y, w, h) {
        ctx.fillStyle = color;
        const px = flip ? ox - (x + w) * B : ox + x * B;
        ctx.fillRect(Math.round(px), Math.round(oy + y * B), Math.max(1, Math.round(w * B)), Math.max(1, Math.round(h * B)));
    };
}

// Рух через увесь екран справа наліво та зліва направо
function crossLeft(t, W, B, span) {
    return W + span * B - t * (W + span * B * 2);
}

function crossRight(t, W, B, span) {
    return -span * B + t * (W + span * B * 2);
}

// Детермінований генератор для частинок
function eggRng(seed) {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        let r = a;
        r = Math.imul(r ^ (r >>> 15), r | 1);
        r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

// Напис у піксельній бульбашці (папуга, кіт)
function speechBubble(ctx, x, y, B, text, color) {
    ctx.font = "bold " + Math.round(B * 0.8) + "px monospace";
    const w = ctx.measureText(text).width + B * 0.8;
    const h = B * 1.2;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(x - w / 2), Math.round(y - h), Math.round(w), Math.round(h));
    ctx.fillRect(Math.round(x - B * 0.2), Math.round(y), Math.round(B * 0.4), Math.round(B * 0.4));
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, Math.round(x), Math.round(y - h / 2));
}

export const EGG_DRAWERS = Object.assign({}, EGG_DRAWERS_1, EGG_DRAWERS_2);

export { crossLeft, crossRight, eggRng, painter, speechBubble };

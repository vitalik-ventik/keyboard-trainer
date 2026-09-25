// ============================================================
// easter_eggs.js — унікальна пасхалка для кожного рівня
// Пасхалка з'являється один раз за рівень на 5 секунд (t від 0 до 1).
// Кожен світ має власного персонажа чи подію, що не повторюється в інших.
// Малюнок будується з піксельних прямокутників у одиницях блоку B.
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
    machine_war: { key: "liquidcop", name: "Рідкий метал" }
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

export const EGG_DRAWERS = {

    // Рожева морська зірка в зелених шортах шкутильгає піском і махає рукою
    starfish(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 3) * 0.7 + W * 0.2;
        const wave = Math.sin(time * 8) * 0.4;
        const bob = Math.abs(Math.sin(time * 5)) * 0.15;
        const p = painter(ctx, B, x, gY - bob * B, false);
        const st = Math.sin(time * 5) > 0 ? 0.15 : -0.15;
        p("#ff8aa0", -0.7 + st, -1.2, 0.5, 1.2);
        p("#ff8aa0", 0.3 - st, -1.2, 0.5, 1.2);
        p("#5ad85a", -0.8, -2.0, 1.7, 0.9);
        p("#3aa83a", -0.8, -1.5, 1.7, 0.12);
        p("#ff8aa0", -0.6, -3.2, 1.3, 1.3);
        p("#ff8aa0", -0.3, -4.2, 0.7, 1.0);
        p("#ff8aa0", -1.4, -3.0 + wave, 0.9, 0.45);
        p("#ff8aa0", 0.6, -3.6 - wave, 0.9, 0.45);
        p("#ffb0c0", -0.4, -3.1, 0.3, 0.3);
        p("#ffffff", -0.35, -3.9, 0.3, 0.35);
        p("#ffffff", 0.05, -3.9, 0.3, 0.35);
        p("#1a1a1a", -0.28, -3.8, 0.12, 0.15);
        p("#1a1a1a", 0.12, -3.8, 0.12, 0.15);
        p("#c8406a", -0.3, -3.35, 0.6, 0.12);
    },

    // Скелет-воїн мчить на кістяному мотоциклі, з вихлопної труби — зелений дим
    skelbike(ctx, t, W, H, gY, time, B) {
        const x = W * 1.1 - t * W * 1.35;
        const bump = Math.abs(Math.sin(time * 14)) * 0.1;
        const p = painter(ctx, B, x, gY - bump * B, false);
        const base = ctx.globalAlpha;
        for (let k = 0; k < 5; k++) {
            ctx.globalAlpha = base * (1 - k / 5) * 0.7;
            p("#7aff5a", 3.4 + k * 0.7, -1.2 - k * 0.15, 0.5 + k * 0.1, 0.5 + k * 0.1);
        }
        ctx.globalAlpha = base;
        p("#1a1a1a", -0.2, -1.0, 1.0, 1.0);
        p("#1a1a1a", 2.4, -1.0, 1.0, 1.0);
        p("#6a6a74", 0.1, -0.7, 0.4, 0.4);
        p("#6a6a74", 2.7, -0.7, 0.4, 0.4);
        p("#3a3a44", 0.3, -1.8, 2.8, 0.7);
        p("#e8e0d0", 0.2, -2.1, 0.5, 0.3);
        p("#8a8a94", 3.0, -1.4, 0.6, 0.2);
        p("#e8e0d0", 1.4, -3.4, 0.9, 1.6);
        p("#c8c0b0", 1.5, -3.2, 0.7, 0.12);
        p("#c8c0b0", 1.5, -2.8, 0.7, 0.12);
        p("#e8e0d0", 0.6, -3.0, 0.9, 0.25);
        p("#e8e0d0", 1.1, -4.4, 1.0, 1.0);
        p("#1a1a1a", 1.2, -4.1, 0.25, 0.25);
        p("#1a1a1a", 1.6, -4.1, 0.25, 0.25);
        p("#3a3a44", 1.0, -4.7, 1.2, 0.35);
        p("#e8e0d0", 1.5, -1.8, 0.3, 0.8);
    },

    // Калюжа рідкого металу витягується в сріблясту фігуру, дивиться навколо й знову розтікається
    liquidcop(ctx, t, W, H, gY, time, B) {
        const x = W * 0.66;
        const rise = t < 0.3 ? t / 0.3 : t > 0.75 ? (1 - t) / 0.25 : 1;
        const shine = (time * 0.8) % 1;
        const p = painter(ctx, B, x, gY, false);
        p("#9aa4b4", -1.6 * (1 - rise * 0.5), -0.25, 3.2 * (1 - rise * 0.5), 0.25);
        const h = 5 * rise;
        if (h > 0.3) {
            p("#aeb6c4", -0.55, -h * 0.45, 0.45, h * 0.45);
            p("#aeb6c4", 0.1, -h * 0.45, 0.45, h * 0.45);
            p("#c0c8d6", -0.7, -h * 0.82, 1.4, h * 0.4);
            p("#aeb6c4", -1.0, -h * 0.8, 0.3, h * 0.35);
            p("#aeb6c4", 0.7, -h * 0.8, 0.3, h * 0.35);
            p("#c8d0de", -0.4, -h, 0.8, h * 0.18);
            p("#ffffff", -0.6 + shine * 1.0, -h * 0.9, 0.12, h * 0.8);
            if (rise > 0.9) {
                const look = Math.sin(time * 2) * 0.1;
                p("#5a6474", -0.25 + look, -h * 0.94, 0.15, 0.1);
                p("#5a6474", 0.1 + look, -h * 0.94, 0.15, 0.1);
            }
        }
    },
    // Курка ходить і клює зернятка
    chicken(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 3) * 0.6 + W * 0.3;
        const peck = Math.sin(time * 5) > 0.5;
        const st = Math.sin(time * 12) > 0 ? 0.2 : 0;
        const p = painter(ctx, B, x, gY, false);
        p("#ffb020", 0.3 + st, -0.6, 0.15, 0.6);
        p("#ffb020", 0.9 - st, -0.6, 0.15, 0.6);
        p("#ffffff", 0, -1.6, 1.4, 1.0);
        p("#e8e8e8", 0.4, -1.3, 0.7, 0.5);
        p("#ffffff", 1.3, -1.9, 0.35, 0.5);
        const hy = peck ? -1.3 : -2.3;
        p("#ffffff", -0.2, hy, 0.7, 0.8);
        p("#ffb020", -0.55, hy + 0.25, 0.4, 0.25);
        p("#e02020", -0.1, hy + 0.55, 0.3, 0.3);
        p("#e02020", 0.05, hy - 0.2, 0.35, 0.2);
        p("#000000", 0.0, hy + 0.15, 0.15, 0.15);
        if (peck) {
            p("#ffe08a", -0.6, -0.15, 0.15, 0.15);
            p("#ffe08a", -0.2, -0.1, 0.15, 0.15);
        }
    },

    // Кубик-супергерой пролітає над містом у червоному плащі
    superhero(ctx, t, W, H, gY, time, B) {
        const x = crossRight(t, W, B, 5);
        const y = gY * 0.3 + Math.sin(time * 3) * B * 0.4;
        const wave = Math.sin(time * 14) * 0.2;
        const p = painter(ctx, B, x, y, true);
        for (let k = 0; k < 3; k++) {
            p("rgba(255, 255, 255, 0.45)", 3.6 + k * 0.4, 0.1 + k * 0.3, 1.4, 0.08);
        }
        p("#e0203a", 1.0, -0.1 + wave, 2.2, 0.6);
        p("#e0203a", 3.0, 0.2 - wave, 0.8, 0.4);
        p("#2a6aff", 1.2, 0.6, 1.1, 0.3);
        p("#2a6aff", 0, 0, 1.3, 1.0);
        p("#ffe14d", 0.35, 0.3, 0.55, 0.4);
        p("#e0203a", 0.5, 0.4, 0.25, 0.2);
        p("#ffd0a0", -0.8, -0.1, 0.8, 0.8);
        p("#1a1a1a", -0.8, 0.1, 0.8, 0.18);
        p("#ffffff", -0.65, 0.12, 0.15, 0.12);
        p("#2a6aff", -1.7, 0.15, 0.9, 0.3);
        p("#e0203a", -1.9, 0.1, 0.35, 0.4);
    },

    // Рожева свинка тупцяє по пасовищу, над нею сердечко
    pig(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4) * 0.7 + W * 0.2;
        const bob = Math.abs(Math.sin(time * 8)) * 0.1;
        const st = Math.sin(time * 10) > 0 ? 0.15 : -0.15;
        const p = painter(ctx, B, x, gY - bob * B, false);
        p("#e08a98", 0.1 + st, -0.7, 0.4, 0.7);
        p("#e08a98", 0.6 - st, -0.7, 0.4, 0.7);
        p("#e08a98", 1.3 + st, -0.7, 0.4, 0.7);
        p("#e08a98", 1.8 - st, -0.7, 0.4, 0.7);
        p("#f0a0a8", 0, -1.8, 2.2, 1.1);
        p("#e07a88", 2.2, -1.7, 0.25, 0.25);
        p("#f0a0a8", -1.0, -2.2, 1.1, 1.1);
        p("#e07a88", -1.25, -1.75, 0.45, 0.4);
        p("#8a3a48", -1.2, -1.65, 0.1, 0.12);
        p("#8a3a48", -1.0, -1.65, 0.1, 0.12);
        p("#ffffff", -0.95, -2.0, 0.2, 0.2);
        p("#1a1a1a", -0.8, -2.0, 0.15, 0.2);
        const heart = (time * 0.8) % 1;
        ctx.globalAlpha *= 1 - heart;
        p("#ff4a6a", -0.8, -3.0 - heart * 1.5, 0.25, 0.25);
        p("#ff4a6a", -0.45, -3.0 - heart * 1.5, 0.25, 0.25);
        p("#ff4a6a", -0.75, -2.8 - heart * 1.5, 0.45, 0.25);
        p("#ff4a6a", -0.6, -2.6 - heart * 1.5, 0.15, 0.15);
    },

    // Супутник з сонячними панелями пропливає небом і шле сигнал
    satellite(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4);
        const y = gY * 0.15 + t * gY * 0.1;
        const p = painter(ctx, B, x, y, false);
        p("#c8c8d0", -1.2, -0.1, 2.4, 0.2);
        for (const side of [-3.4, 1.2]) {
            p("#2a4a98", side, -0.35, 2.2, 0.7);
            p("#6a8ae0", side + 0.1, -0.25, 0.9, 0.2);
            p("#6a8ae0", side + 1.15, -0.25, 0.9, 0.2);
            p("#6a8ae0", side + 0.1, 0.05, 0.9, 0.2);
            p("#6a8ae0", side + 1.15, 0.05, 0.9, 0.2);
        }
        p("#d8b040", -0.6, -0.6, 1.2, 1.2);
        p("#b08a20", -0.6, 0.3, 1.2, 0.3);
        p("#e8e8e8", -0.35, -1.1, 0.7, 0.5);
        p("#9a9aa4", -0.05, -1.4, 0.1, 0.3);
        p(Math.floor(time * 3) % 2 ? "#ff3355" : "#551122", 0.3, -0.45, 0.2, 0.2);
        ctx.strokeStyle = "#9fe8ff";
        ctx.lineWidth = Math.max(1, B * 0.12);
        const base = ctx.globalAlpha;
        for (let k = 0; k < 3; k++) {
            const r = ((time * 1.5 + k / 3) % 1);
            ctx.globalAlpha = base * (1 - r) * 0.8;
            ctx.beginPath();
            ctx.arc(x, y - B * 1.4, B * (0.6 + r * 2.5), Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();
        }
        ctx.globalAlpha = base;
    },

    // Сріблясте авто мчить шосе й лишає два вогняні сліди
    timecar(ctx, t, W, H, gY, time, B) {
        const x = W * 1.15 - t * W * 1.5;
        const p = painter(ctx, B, x, gY, false);
        const flick = Math.sin(time * 30) * 0.3;
        for (let k = 0; k < 10; k++) {
            ctx.globalAlpha = Math.max(0, 1 - k / 10);
            const c = k < 2 ? "#ffffff" : k < 5 ? "#ffcc33" : "#ff5a00";
            p(c, 4.0 + k * 0.9, -0.25, 0.9, 0.12 + (k === 0 ? 0 : flick * 0.1 + 0.05));
            p(c, 4.0 + k * 0.9, -0.08, 0.9, 0.08);
        }
        ctx.globalAlpha = 1;
        p("#9a9ea8", 0, -1.0, 4.0, 0.65);
        p("#c8ccd4", 0.1, -1.0, 3.8, 0.3);
        p("#c8ccd4", 0.9, -1.55, 2.1, 0.55);
        p("#3a4a6a", 1.0, -1.45, 0.85, 0.4);
        p("#3a4a6a", 2.0, -1.45, 0.85, 0.4);
        p("#1a1a1a", 0.4, -0.45, 0.8, 0.45);
        p("#1a1a1a", 2.8, -0.45, 0.8, 0.45);
        p("#6a6a74", 0.6, -0.35, 0.4, 0.25);
        p("#6a6a74", 3.0, -0.35, 0.4, 0.25);
        p("#ffffa0", -0.1, -0.9, 0.3, 0.25);
        p("#ff3355", 3.9, -0.9, 0.15, 0.25);
        const rng = eggRng(Math.floor(time * 20));
        for (let i = 0; i < 4; i++) {
            p("#7df9ff", rng() * 4, -1.8 + rng() * 1.6, 0.12, 0.12);
        }
    },

    // Ендермен телепортується з місця на місце у фіолетових іскрах
    enderman(ctx, t, W, H, gY, time, B) {
        const idx = Math.min(3, Math.floor(t * 4));
        const local = t * 4 - idx;
        const x = W * (0.82 - idx * 0.18);
        const pop = Math.min(1, local * 5, (1 - local) * 5);
        const base = ctx.globalAlpha;
        const rng = eggRng(idx * 31 + Math.floor(time * 10));
        const p = painter(ctx, B, x, gY, false);
        ctx.globalAlpha = base * 0.9;
        for (let i = 0; i < 14; i++) {
            const burst = 1 - pop;
            p(i % 2 ? "#d070ff" : "#8a2ae0", -1.5 + rng() * 3.5, -5 + rng() * 5, 0.18 + burst * 0.1, 0.18 + burst * 0.1);
        }
        ctx.globalAlpha = base * pop;
        p("#141018", 0.05, -1.8, 0.25, 1.8);
        p("#141018", 0.45, -1.8, 0.25, 1.8);
        p("#141018", 0, -3.3, 0.75, 1.5);
        p("#141018", -0.25, -3.3, 0.2, 2.0);
        p("#141018", 0.8, -3.3, 0.2, 2.0);
        p("#141018", -0.15, -4.3, 1.05, 1.0);
        p("#d070ff", -0.05, -3.8, 0.35, 0.12);
        p("#d070ff", 0.55, -3.8, 0.35, 0.12);
        p("#f0c0ff", 0.05, -3.8, 0.12, 0.12);
        p("#f0c0ff", 0.65, -3.8, 0.12, 0.12);
        ctx.globalAlpha = base;
    },

    // Ягуар великими стрибками мчить крізь джунглі
    jaguar(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 5);
        const phase = Math.abs(Math.sin(t * Math.PI * 5));
        const y = gY - phase * B * 1.2;
        const s = phase > 0.5 ? 0.4 : 0;
        const p = painter(ctx, B, x, y, false);
        p("#d8a020", -0.3 - s, -0.8, 0.3, 0.8);
        p("#d8a020", 0.3 - s * 0.5, -0.8, 0.3, 0.8);
        p("#d8a020", 1.9 + s * 0.5, -0.8, 0.3, 0.8);
        p("#d8a020", 2.4 + s, -0.8, 0.3, 0.8);
        p("#e8b030", 0, -1.6, 2.7, 0.85);
        p("#f5d890", 0.3, -0.9, 2.0, 0.2);
        p("#e8b030", 2.6, -1.8, 1.2, 0.22);
        p("#e8b030", 3.6, -2.2, 0.22, 0.5);
        p("#1a1208", 3.6, -2.3, 0.22, 0.2);
        for (const sp of [[0.4, -1.4], [1.0, -1.5], [1.6, -1.3], [2.2, -1.5], [0.7, -1.1], [1.9, -1.05], [3.0, -1.75]]) {
            p("#3a2a10", sp[0], sp[1], 0.25, 0.22);
        }
        p("#e8b030", -1.0, -2.0, 1.1, 0.85);
        p("#e8b030", -0.9, -2.25, 0.25, 0.25);
        p("#e8b030", -0.35, -2.25, 0.25, 0.25);
        p("#f5d890", -1.05, -1.5, 0.45, 0.3);
        p("#1a1208", -1.05, -1.5, 0.12, 0.12);
        p("#39ff88", -0.75, -1.8, 0.18, 0.15);
        p("#3a2a10", -0.3, -1.95, 0.2, 0.2);
    },

    // Вагонетка з кубиком-шахтарем котиться рейками, з-під коліс іскри
    minecart(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4);
        const wave = Math.sin(time * 8) > 0;
        const p = painter(ctx, B, x, gY, false);
        p("#6a4a2a", -3, -0.12, 9, 0.12);
        p("#9a9aa4", -3, -0.22, 9, 0.08);
        p("#c89a70", 0.7, -2.4, 1.0, 0.95);
        p("#4a2a10", 0.7, -2.4, 1.0, 0.3);
        p("#ffffff", 0.8, -2.0, 0.22, 0.15);
        p("#3a3aa0", 0.85, -2.0, 0.1, 0.15);
        p("#ffffff", 1.3, -2.0, 0.22, 0.15);
        p("#3a3aa0", 1.35, -2.0, 0.1, 0.15);
        p("#3a8ac8", 0.4, wave ? -3.2 : -2.6, 0.22, 0.8);
        p("#8a8a94", 0.15, wave ? -3.6 : -3.0, 0.5, 0.2);
        p("#6a4a2a", 0.35, wave ? -3.4 : -2.8, 0.12, 0.5);
        p("#6a6a74", 0, -1.55, 2.4, 1.1);
        p("#8a8a94", 0, -1.55, 2.4, 0.2);
        p("#4a4a54", 0.2, -1.2, 2.0, 0.1);
        p("#2a2a2a", 0.3, -0.5, 0.5, 0.45);
        p("#2a2a2a", 1.6, -0.5, 0.5, 0.45);
        const rng = eggRng(Math.floor(time * 16));
        for (let i = 0; i < 5; i++) {
            p(i % 2 ? "#ffe14d" : "#ff9a00", 2.2 + rng() * 1.2, -0.4 - rng() * 0.6, 0.12, 0.12);
        }
    },

    // Повітряний змій зі стрічками бореться з вітром
    kite(ctx, t, W, H, gY, time, B) {
        const x = W * (0.15 + t * 0.7) + Math.sin(time * 2.3) * B;
        const y = gY * 0.38 - Math.sin(t * Math.PI) * gY * 0.18 + Math.sin(time * 3) * B * 0.6;
        const tilt = Math.sin(time * 2.7) * 0.3;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + B * 1.6);
        ctx.quadraticCurveTo(x - W * 0.1, y + gY * 0.3, x - W * 0.25, gY + B);
        ctx.stroke();
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tilt);
        const quads = [["#ff3355", 0, -1, -1, 0], ["#ffe14d", 0, -1, 1, 0], ["#39c6ff", 0, 1.6, -1, 0], ["#39ff88", 0, 1.6, 1, 0]];
        for (const q of quads) {
            ctx.fillStyle = q[0];
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(q[1] * B, q[2] * B * 1.1);
            ctx.lineTo(q[3] * B, q[4]);
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-1, -B * 1.1, 2, B * 2.9);
        ctx.fillRect(-B, -1, B * 2, 2);
        const colors = ["#ff3355", "#ffe14d", "#39c6ff", "#ff5ad8"];
        for (let k = 0; k < 4; k++) {
            const bx = Math.sin(time * 5 + k) * B * 0.5 - k * B * 0.2;
            const by = B * (2.2 + k * 0.8);
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.fillRect(Math.round(bx), Math.round(by - B * 0.6), 1, Math.round(B * 0.8));
            ctx.fillStyle = colors[k];
            ctx.fillRect(Math.round(bx - B * 0.3), Math.round(by), Math.round(B * 0.25), Math.round(B * 0.25));
            ctx.fillRect(Math.round(bx + B * 0.05), Math.round(by), Math.round(B * 0.25), Math.round(B * 0.25));
        }
        ctx.restore();
    },

    // Зграя кажанів із червоними очима пурхає печерою
    bats(ctx, t, W, H, gY, time, B) {
        const x0 = crossLeft(t, W, B, 12);
        for (let i = 0; i < 7; i++) {
            const bx = x0 + i * B * 1.6 + Math.sin(time * 3 + i * 2) * B * 0.5;
            const by = gY * 0.28 + (i % 3) * B * 1.1 + Math.sin(time * 5 + i) * B * 0.6;
            const flap = Math.sin(time * 16 + i * 1.3) > 0;
            const p = painter(ctx, B, bx, by, false);
            p("#2a1a3a", -0.9, flap ? -0.45 : 0.05, 0.9, 0.3);
            p("#2a1a3a", 0.4, flap ? -0.45 : 0.05, 0.9, 0.3);
            p("#2a1a3a", -0.5, flap ? -0.2 : 0.2, 0.3, 0.2);
            p("#2a1a3a", 0.4, flap ? -0.2 : 0.2, 0.3, 0.2);
            p("#3a2a4a", -0.1, -0.2, 0.6, 0.55);
            p("#3a2a4a", -0.05, -0.35, 0.12, 0.15);
            p("#3a2a4a", 0.33, -0.35, 0.12, 0.15);
            p("#ff3344", 0.0, -0.1, 0.1, 0.1);
            p("#ff3344", 0.3, -0.1, 0.1, 0.1);
        }
    },

    // Рудий кіт Джонсі йде коридором, раптом вигинає спину й шипить, а тоді тікає
    jonesy(ctx, t, W, H, gY, time, B) {
        let x;
        if (t < 0.4) {
            x = W * 1.05 - (t / 0.4) * W * 0.5;
        } else if (t < 0.65) {
            x = W * 0.55;
        } else {
            x = W * 0.55 - ((t - 0.65) / 0.35) * W * 0.8;
        }
        const arch = t >= 0.4 && t < 0.65;
        const moving = !arch;
        const step = moving && Math.sin(time * (t >= 0.65 ? 30 : 16)) > 0;
        const lift = arch ? 0.45 : 0;
        const p = painter(ctx, B, x, gY, false);
        p("#ff9a3d", step ? 0.1 : 0.3, -0.45 - lift, 0.2, 0.45 + lift);
        p("#ff9a3d", step ? 1.2 : 1.0, -0.45 - lift, 0.2, 0.45 + lift);
        p("#ff9a3d", 0, -1.15 - lift, 1.6, 0.7);
        if (arch) {
            p("#ff9a3d", 0.3, -1.45 - lift, 1.0, 0.35);
            for (let k = 0; k < 5; k++) {
                p("#ffb870", 0.2 + k * 0.28, -1.65 - lift, 0.12, 0.25);
            }
        }
        p("#c86a1a", 0.4, -1.15 - lift, 0.25, 0.7);
        p("#c86a1a", 0.9, -1.15 - lift, 0.25, 0.7);
        p("#ff9a3d", 1.6, arch ? -2.3 : -1.6 + (step ? 0 : 0.15), 0.2, arch ? 1.2 : 0.7);
        p("#ff9a3d", -0.6, -1.6 - lift, 0.8, 0.8);
        p("#ffffff", -0.6, -1.0 - lift, 0.5, 0.2);
        p("#ff9a3d", -0.6, -1.85 - lift, 0.2, 0.25);
        p("#ff9a3d", -0.05, -1.85 - lift, 0.2, 0.25);
        p("#1a1a1a", -0.45, -1.4 - lift, 0.12, 0.12);
        if (arch) {
            p("#ffffff", -0.55, -1.05 - lift, 0.1, 0.12);
            speechBubble(ctx, x - B * 1.2, gY - B * (2.8 + lift), B, "Ш-Ш-Ш!", "#c86a1a");
        }
    },

    // Зомбі шкандибає з витягнутими руками
    zombie(ctx, t, W, H, gY, time, B) {
        const x = W * 1.02 - t * W * 0.95;
        const sway = Math.sin(time * 4) * 0.15;
        const step = Math.sin(time * 4) > 0 ? 0.12 : -0.12;
        const p = painter(ctx, B, x, gY, false);
        p("#3a3aa0", 0.1 + step, -1.5, 0.35, 1.5);
        p("#3a3aa0", 0.5 - step, -1.5, 0.35, 1.5);
        p("#2aa0a8", 0.05, -2.6, 0.85, 1.15);
        p("#4a8a3a", -0.85, -2.5 + sway, 1.0, 0.28);
        p("#4a8a3a", -0.85, -2.1 - sway, 1.0, 0.28);
        p("#4a8a3a", 0, -3.5, 0.95, 0.95);
        p("#3a6a2a", 0.5, -3.5, 0.45, 0.25);
        p("#1a2a1a", 0.05, -3.15, 0.22, 0.18);
        p("#1a2a1a", 0.5, -3.15, 0.22, 0.18);
        p("#2a4a1f", 0.2, -2.85, 0.5, 0.12);
        if (Math.sin(time * 1.3) > 0.4) {
            ctx.font = "bold " + Math.round(B * 0.6) + "px monospace";
            ctx.fillStyle = "#8aff7a";
            ctx.textAlign = "center";
            ctx.fillText("Ууу…", Math.round(x + B * 0.5), Math.round(gY - B * 4));
        }
    },

    // Мисливець-невидимка перебігає джунглі тремтливим маревом і на мить стає видимим
    cloaked(ctx, t, W, H, gY, time, B) {
        const x = crossRight(t, W, B, 3);
        const reveal = Math.max(0, 1 - Math.abs(t - 0.55) * 8);
        const base = ctx.globalAlpha;
        const lean = Math.sin(time * 14) * B * 0.15;
        ctx.save();
        ctx.translate(x, gY);
        const shapes = [[-0.6, -5.2, 1.2, 1.1], [-1.1, -4.1, 2.2, 1.8], [-1.0, -2.3, 0.8, 2.3], [0.2, -2.3, 0.8, 2.3], [-1.6, -4.0, 0.5, 1.8], [1.1, -4.0, 0.5, 1.8]];
        for (let k = 0; k < 3; k++) {
            ctx.globalAlpha = base * (0.35 - k * 0.08) * (1 - reveal);
            ctx.strokeStyle = k === 0 ? "#d8f0ff" : "#8ac8ff";
            ctx.lineWidth = Math.max(1, B * 0.1);
            const off = Math.sin(time * 20 + k * 2) * B * 0.15;
            for (const s of shapes) {
                ctx.strokeRect(Math.round(s[0] * B + off + lean), Math.round(s[1] * B), Math.round(s[2] * B), Math.round(s[3] * B));
            }
        }
        ctx.restore();
        if (reveal > 0) {
            ctx.globalAlpha = base;
            const p = painter(ctx, B, x + lean, gY, false);
            ctx.globalAlpha = base * reveal;
            p("#6a6a3a", -1.0, -2.3, 0.8, 2.3);
            p("#6a6a3a", 0.2, -2.3, 0.8, 2.3);
            p("#8a8a94", -1.1, -4.1, 2.2, 1.8);
            p("#6a6a3a", -1.6, -4.0, 0.5, 1.8);
            p("#6a6a3a", 1.1, -4.0, 0.5, 1.8);
            p("#9a9aa4", -0.6, -5.2, 1.2, 1.1);
            p("#1a1a1a", -0.8, -4.3, 0.2, 1.2);
            p("#1a1a1a", 0.6, -4.3, 0.2, 1.2);
            p("#ff2a2a", -0.35, -4.8, 0.2, 0.15);
            p("#ff2a2a", 0.15, -4.8, 0.2, 0.15);
        }
        ctx.globalAlpha = base;
    },

    // Дрон-шпигун обшукує землю червоним променем
    spydrone(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4);
        const y = gY * 0.35 + Math.sin(time * 2) * B * 0.5;
        const sweep = Math.sin(time * 2.5) * B * 3;
        const base = ctx.globalAlpha;
        ctx.globalAlpha = base * 0.18;
        ctx.fillStyle = "#ff3355";
        ctx.beginPath();
        ctx.moveTo(x, y + B * 0.5);
        ctx.lineTo(x + sweep - B * 1.8, gY);
        ctx.lineTo(x + sweep + B * 1.8, gY);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = base * 0.6;
        ctx.fillRect(Math.round(x + sweep - B * 1.8), gY - 2, Math.round(B * 3.6), 2);
        ctx.globalAlpha = base;
        const p = painter(ctx, B, x, y, false);
        p("#4a4a58", -1.9, -0.35, 3.8, 0.15);
        p("#4a4a58", -1.7, -0.55, 0.15, 0.3);
        p("#4a4a58", 1.55, -0.55, 0.15, 0.3);
        const blur = 0.6 + Math.abs(Math.sin(time * 40)) * 0.5;
        p("rgba(200, 220, 255, 0.6)", -1.65 - blur / 2, -0.62, blur, 0.1);
        p("rgba(200, 220, 255, 0.6)", 1.6 - blur / 2, -0.62, blur, 0.1);
        p("#2a2a34", -0.8, -0.25, 1.6, 0.55);
        p("#1a1a22", -0.3, 0.3, 0.6, 0.3);
        p("#ff3355", -0.12, 0.35, 0.24, 0.2);
        p(Math.floor(time * 4) % 2 ? "#39ff88" : "#0a3a1a", 0.5, -0.15, 0.15, 0.15);
    },

    // Великий і маленький слизи стрибають болотом, сплющуючись при приземленні
    slime(ctx, t, W, H, gY, time, B) {
        const x0 = crossLeft(t, W, B, 6);
        const slimes = [[0, 1.6, 0], [2.6, 0.9, 1.3], [4.0, 0.55, 2.1]];
        for (const sl of slimes) {
            const size = sl[1];
            const jump = Math.abs(Math.sin(time * 3.2 + sl[2]));
            const sq = Math.max(0, 1 - jump * 3);
            const w = size * (1 + 0.3 * sq);
            const h = size * (1 - 0.3 * sq);
            const p = painter(ctx, B, x0 + sl[0] * B, gY - jump * B * 2.2 * size, false);
            p("rgba(110, 210, 90, 0.75)", -w / 2, -h, w, h);
            p("#3a8a2a", -w * 0.25, -h * 0.7, w * 0.5, h * 0.5);
            p("#1a3a10", -w * 0.3, -h * 0.75, w * 0.15, h * 0.15);
            p("#1a3a10", w * 0.1, -h * 0.75, w * 0.15, h * 0.15);
            p("#1a3a10", -w * 0.1, -h * 0.4, w * 0.12, h * 0.1);
            p("rgba(220, 255, 200, 0.6)", -w * 0.42, -h * 0.9, w * 0.15, h * 0.12);
        }
    },

    // Довгий жнець-левіафан пропливає в глибині
    reaper(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 16);
        const y = gY * 0.42;
        const base = ctx.globalAlpha;
        ctx.globalAlpha = base * 0.85;
        for (let i = 14; i >= 0; i--) {
            const sx = x + i * B * 0.9;
            const sy = y + Math.sin(time * 3 - i * 0.5) * B * 0.6;
            const r = Math.max(0.35, 1.3 - i * 0.07);
            ctx.fillStyle = i % 3 === 0 ? "#8a3a2a" : "#c8b89a";
            ctx.fillRect(Math.round(sx), Math.round(sy - r * B / 2), Math.round(B * 1.0), Math.round(r * B));
            if (i % 4 === 1) {
                ctx.fillStyle = "#6a5a4a";
                ctx.fillRect(Math.round(sx), Math.round(sy + r * B / 2), Math.round(B * 0.3), Math.round(B * 0.5));
            }
        }
        const hy = y + Math.sin(time * 3) * B * 0.6;
        const jaw = Math.sin(time * 5) * 0.3 + 0.3;
        const p = painter(ctx, B, x, hy, false);
        p("#c8b89a", -1.2, -0.8, 1.4, 1.6);
        p("#8a3a2a", -1.9, -1.1 - jaw, 0.9, 0.3);
        p("#8a3a2a", -1.9, 0.8 + jaw, 0.9, 0.3);
        p("#8a3a2a", -1.6, -0.65 - jaw * 0.5, 0.5, 0.25);
        p("#8a3a2a", -1.6, 0.4 + jaw * 0.5, 0.5, 0.25);
        p("#ff5a3a", -0.9, -0.5, 0.25, 0.2);
        p("#ff5a3a", -0.9, 0.3, 0.25, 0.2);
        ctx.globalAlpha = base;
    },

    // Піщаний хробак вистрибує з піску дугою й пірнає назад
    sandworm(ctx, t, W, H, gY, time, B) {
        const cx = W * 0.5;
        const R = W * 0.3;
        const head = -0.15 + t * 1.3;
        const rng = eggRng(Math.floor(time * 12));
        for (const edge of [0, 1]) {
            const near = edge === 0 ? Math.max(0, 1 - Math.abs(head - 0) * 5) : Math.max(0, 1 - Math.abs(head - 1) * 5);
            if (near > 0) {
                ctx.fillStyle = "#e8c07a";
                const ex = cx + (edge === 0 ? -R : R);
                for (let i = 0; i < 10; i++) {
                    ctx.fillRect(Math.round(ex + (rng() - 0.5) * B * 4), Math.round(gY - rng() * B * 3 * near), Math.round(B * 0.3), Math.round(B * 0.3));
                }
            }
        }
        for (let k = 18; k >= 0; k--) {
            const s = head - k * 0.035;
            if (s < 0 || s > 1) {
                continue;
            }
            const a = Math.PI * s;
            const sx = cx - R * Math.cos(a);
            const sy = gY - R * 0.9 * Math.sin(a);
            const r = B * Math.max(0.5, 1.1 - k * 0.025);
            ctx.fillStyle = k % 2 ? "#a07a3a" : "#c89a55";
            ctx.fillRect(Math.round(sx - r), Math.round(sy - r), Math.round(r * 2), Math.round(r * 2));
            if (k === 0) {
                ctx.fillStyle = "#4a1a10";
                ctx.fillRect(Math.round(sx - r * 0.6), Math.round(sy - r * 0.6), Math.round(r * 1.2), Math.round(r * 1.2));
                ctx.fillStyle = "#ffffff";
                for (let q = 0; q < 4; q++) {
                    const ang = q * Math.PI / 2 + time * 3;
                    ctx.fillRect(Math.round(sx + Math.cos(ang) * r * 0.45 - 2), Math.round(sy + Math.sin(ang) * r * 0.45 - 2), 4, 4);
                }
            }
        }
    },

    // Золотий ключ-голем з ключем на спині тікає, підстрибуючи
    keygolem(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 3);
        const hop = Math.abs(Math.sin(time * 9)) * 0.5;
        const st = Math.sin(time * 18) > 0 ? 0.15 : 0;
        const p = painter(ctx, B, x, gY - hop * B, false);
        p("#8a7a5a", 0.1 + st, -0.45, 0.3, 0.45);
        p("#8a7a5a", 0.6 - st, -0.45, 0.3, 0.45);
        p("#e8c040", 0, -1.45, 1.0, 1.0);
        p("#b08a20", 0, -0.65, 1.0, 0.2);
        p("#8a7a5a", -0.3, -1.2, 0.3, 0.5);
        p("#8a7a5a", 1.0, -1.2, 0.3, 0.5);
        p("#3a2a10", 0.15, -1.2, 0.2, 0.2);
        p("#3a2a10", 0.55, -1.2, 0.2, 0.2);
        const spin = Math.abs(Math.cos(time * 4));
        p("#ffd84a", 0.4, -2.5, 0.2, 1.1);
        p("#ffd84a", 0.5 - 0.35 * spin, -2.9, 0.7 * spin + 0.1, 0.45);
        p("#e8c040", 0.5 - 0.15 * spin, -2.8, 0.3 * spin + 0.05, 0.25);
        p("#ffd84a", 0.6, -1.9, 0.25, 0.12);
        const sp = (time * 2) % 1;
        p("#fffbe0", 1.4 + sp * 0.5, -2.2 - sp, 0.15, 0.15);
        p("#fffbe0", -0.5 - sp * 0.4, -2.0 - sp * 0.8, 0.12, 0.12);
    },

    // Паперовий літачок робить мертву петлю між хмарами
    paperplane(ctx, t, W, H, gY, time, B) {
        // Під час петлі літачок не просувається вперед, а крутиться на місці
        const u = t < 0.4 ? t : t < 0.62 ? 0.4 : t - 0.22;
        let x = crossRight(u / 0.78, W, B, 3);
        let y = gY * 0.35;
        let ang = 0;
        if (t > 0.4 && t < 0.62) {
            const a = (t - 0.4) / 0.22 * Math.PI * 2;
            const R = B * 3;
            x += R * Math.sin(a);
            y = gY * 0.35 - R + R * Math.cos(a);
            ang = -a;
        }
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(B * 1.2, 0);
        ctx.lineTo(-B * 1.0, -B * 0.6);
        ctx.lineTo(-B * 0.6, 0);
        ctx.lineTo(-B * 1.0, B * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#c8d8ec";
        ctx.beginPath();
        ctx.moveTo(B * 1.2, 0);
        ctx.lineTo(-B * 0.6, 0);
        ctx.lineTo(-B * 0.8, B * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        const base = ctx.globalAlpha;
        ctx.fillStyle = "#ffffff";
        for (let k = 1; k < 7; k++) {
            ctx.globalAlpha = base * (1 - k / 7) * 0.6;
            ctx.fillRect(Math.round(x - Math.cos(ang) * B * (1 + k * 0.6)), Math.round(y - Math.sin(ang) * B * (1 + k * 0.6)), 2, 2);
        }
        ctx.globalAlpha = base;
    },

    // М'яч злітає «свічкою» над стадіоном, а табло кричить «ГОЛ!»
    goalball(ctx, t, W, H, gY, time, B) {
        const x = W * (0.12 + 0.76 * t);
        const y = gY - B * 0.6 - Math.sin(Math.PI * t) * gY * 0.78;
        const base = ctx.globalAlpha;
        for (let k = 1; k < 8; k++) {
            const tk = Math.max(0, t - k * 0.012);
            ctx.globalAlpha = base * (1 - k / 8) * 0.5;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(Math.round(W * (0.12 + 0.76 * tk) - 2), Math.round(gY - B * 0.6 - Math.sin(Math.PI * tk) * gY * 0.78 - 2), 4, 4);
        }
        ctx.globalAlpha = base;
        const r = B * 0.8;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a1a1a";
        for (let q = 0; q < 5; q++) {
            const a = time * 8 + q * Math.PI * 2 / 5;
            ctx.fillRect(Math.round(x + Math.cos(a) * r * 0.55 - r * 0.18), Math.round(y + Math.sin(a) * r * 0.55 - r * 0.18), Math.round(r * 0.36), Math.round(r * 0.36));
        }
        ctx.fillRect(Math.round(x - r * 0.2), Math.round(y - r * 0.2), Math.round(r * 0.4), Math.round(r * 0.4));
        if (t > 0.7 && Math.floor(time * 6) % 2 === 0) {
            ctx.font = "bold " + Math.round(B * 2.2) + "px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ffe14d";
            ctx.fillText("ГОЛ!", Math.round(W * 0.5), Math.round(gY * 0.22));
        }
    },

    // Малюк-ксеноморф вилазить із землі, роззирається, пищить і ховається
    chestburster(ctx, t, W, H, gY, time, B) {
        const x = W * 0.62;
        const rise = t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1;
        const look = t > 0.25 && t < 0.75 ? Math.sin((t - 0.25) * Math.PI * 4) : 0;
        const h = rise * 2.6;
        const rng = eggRng(Math.floor(time * 10));
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W, gY);
        ctx.clip();
        const p = painter(ctx, B, x + look * B * 0.3, gY + (2.6 - h) * B, look < 0);
        p("#c8b8a8", -0.35, -2.2, 0.7, 2.2);
        p("#a89888", -0.35, -1.4, 0.7, 0.15);
        p("#a89888", -0.35, -0.8, 0.7, 0.15);
        p("#d8c8b8", -1.3, -2.8, 1.8, 0.8);
        p("#e8dccc", -1.1, -2.75, 0.6, 0.2);
        p("#ffffff", -1.3, -2.25, 0.12, 0.15);
        p("#ffffff", -1.1, -2.25, 0.12, 0.15);
        p("#ffffff", -0.9, -2.25, 0.12, 0.15);
        p("#c8b8a8", -0.6, -1.9, 0.35, 0.12);
        p("#c8b8a8", 0.35, -1.9, 0.35, 0.12);
        ctx.restore();
        if (rise > 0.1 && rise < 0.95) {
            ctx.fillStyle = "#5a3a2a";
            for (let i = 0; i < 6; i++) {
                ctx.fillRect(Math.round(x + (rng() - 0.5) * B * 2.5), Math.round(gY - rng() * B * 1.5), Math.round(B * 0.25), Math.round(B * 0.25));
            }
        }
        if (t > 0.45 && t < 0.6) {
            ctx.strokeStyle = "#e8dccc";
            ctx.lineWidth = Math.max(1, B * 0.1);
            for (let k = 0; k < 3; k++) {
                ctx.beginPath();
                ctx.arc(x - B * 1.4, gY - B * 2.4, B * (0.6 + k * 0.5 + (time * 3 % 0.5)), Math.PI * 0.75, Math.PI * 1.25);
                ctx.stroke();
            }
        }
    },

    // Скорпіон повзе піском і б'є жалом
    scorpion(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4);
        const strike = Math.max(0, Math.sin(time * 3)) ** 4;
        const legs = Math.sin(time * 20) > 0 ? 0.08 : 0;
        const p = painter(ctx, B, x, gY, false);
        for (let k = 0; k < 4; k++) {
            p("#2a1a0a", 0.2 + k * 0.35 + (k % 2 ? legs : -legs), -0.35, 0.1, 0.35);
        }
        p("#5a3a1a", 0, -0.75, 1.6, 0.45);
        p("#7a5a2a", 0.1, -0.7, 1.4, 0.12);
        p("#5a3a1a", -0.6, -0.65, 0.6, 0.15);
        p("#5a3a1a", -1.0, -0.85, 0.45, 0.35);
        p("#5a3a1a", -1.15, -0.95, 0.2, 0.15);
        p("#1a0a0a", 0.05, -0.85, 0.1, 0.1);
        const segs = [[1.6, -0.9], [1.95, -1.3], [2.1, -1.8], [1.9, -2.2]];
        for (let i = 0; i < segs.length; i++) {
            const sx = segs[i][0] - strike * i * 0.25;
            const sy = segs[i][1] - strike * i * 0.05;
            p("#5a3a1a", sx, sy, 0.4, 0.4);
        }
        p("#ff3a2a", 1.55 - strike * 1.0, -2.25 + strike * 0.4, 0.3, 0.25);
    },

    // Вогняний фенікс пролітає, розсипаючи жарини
    phoenix(ctx, t, W, H, gY, time, B) {
        const x = crossRight(t, W, B, 5);
        const y = gY * 0.3 + Math.sin(t * Math.PI * 3) * B * 1.5;
        const flap = Math.sin(time * 9);
        const base = ctx.globalAlpha;
        const rng = eggRng(7);
        for (let i = 0; i < 16; i++) {
            const age = (time * 1.5 + rng()) % 1;
            ctx.globalAlpha = base * (1 - age);
            ctx.fillStyle = i % 3 === 0 ? "#ffe14d" : "#ff6a00";
            ctx.fillRect(Math.round(x - B * (2 + age * 6 + rng() * 2)), Math.round(y + B * (rng() - 0.3) * 2 + age * B * 2), Math.round(B * 0.25), Math.round(B * 0.25));
        }
        ctx.globalAlpha = base;
        const p = painter(ctx, B, x, y, true);
        const flick = Math.sin(time * 25) * 0.2;
        p("#ff3a00", 1.4, 0.1, 1.8 + flick, 0.25);
        p("#ffb000", 1.4, 0.35, 2.3 - flick, 0.2);
        p("#ff6a00", 1.4, -0.15, 1.3, 0.2);
        p("#ff6a00", 0, -0.2, 1.6, 0.7);
        p("#ffb000", 0.2, 0.2, 1.0, 0.3);
        p("#ff3a00", 0.3, flap > 0 ? -1.6 : 0.4, 1.0, flap > 0 ? 1.4 : 1.0);
        p("#ffe14d", 0.4, flap > 0 ? -1.5 : 0.5, 0.6, 0.35);
        p("#ff6a00", -0.6, -0.5, 0.7, 0.6);
        p("#ffe14d", -0.5, -0.8, 0.25, 0.35);
        p("#ffe14d", -1.0, -0.3, 0.4, 0.2);
        p("#1a1a1a", -0.4, -0.35, 0.12, 0.12);
    },

    // Щупальця кракена виринають із води, розгойдуються й ховаються
    kraken(ctx, t, W, H, gY, time, B) {
        const up = Math.pow(Math.sin(Math.PI * t), 0.7);
        const roots = [0.52, 0.64, 0.78, 0.9];
        for (let i = 0; i < roots.length; i++) {
            const rx = W * roots[i];
            const len = (5 + (i % 2) * 1.5) * up;
            const n = 12;
            for (let k = 0; k < n; k++) {
                const f = k / n;
                const sx = rx + Math.sin(time * 2.5 + i * 1.7 + f * 4) * B * 1.2 * f;
                const sy = gY - f * len * B;
                const w = B * (1.0 - f * 0.7);
                ctx.fillStyle = "#6a2a8a";
                ctx.fillRect(Math.round(sx - w / 2), Math.round(sy - len * B / n), Math.round(w), Math.round(len * B / n + 1));
                if (k % 2 === 0 && k < n - 2) {
                    ctx.fillStyle = "#ff9ad0";
                    ctx.fillRect(Math.round(sx + w * 0.15), Math.round(sy - B * 0.2), Math.round(w * 0.3), Math.round(w * 0.3));
                }
            }
        }
        if (up > 0.6) {
            const ey = gY - B * 1.1 * (up - 0.6) / 0.4;
            const p = painter(ctx, B, W * 0.71, ey, false);
            p("#6a2a8a", -1.2, -0.2, 2.4, 1.4);
            p("#ffe14d", -0.7, 0.1, 1.4, 0.7);
            p("#1a0a1a", -0.15 + Math.sin(time * 1.5) * 0.4, 0.1, 0.3, 0.7);
        }
        const rng = eggRng(Math.floor(time * 10));
        ctx.fillStyle = "rgba(220, 245, 255, 0.8)";
        for (let i = 0; i < 8 * up; i++) {
            ctx.fillRect(Math.round(W * (0.5 + rng() * 0.42)), Math.round(gY - rng() * B), 3, 3);
        }
    },

    // Сундук-мімік стрибає й клацає зубастою кришкою
    mimic(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 3);
        const hop = Math.abs(Math.sin(t * Math.PI * 7));
        const open = hop > 0.4 ? (hop - 0.4) / 0.6 : 0;
        const p = painter(ctx, B, x, gY - hop * B * 1.2, false);
        p("#6a3a1a", 0, -1.1, 1.9, 1.1);
        p("#ffd84a", 0, -1.1, 1.9, 0.12);
        p("#ffd84a", 0, -0.2, 1.9, 0.12);
        p("#ffd84a", 0.85, -0.9, 0.2, 0.35);
        const ly = -1.1 - open * 0.8;
        p("#3a0a0a", 0.05, ly, 1.8, open * 0.8 + 0.05);
        if (open > 0.2) {
            p("#ff4a6a", -0.3, -1.2, 0.8, 0.2);
            p("#ffe14d", 0.4, ly + 0.45, 0.2, 0.2);
            p("#ffe14d", 1.2, ly + 0.45, 0.2, 0.2);
        }
        p("#8a5a2a", 0, ly - 0.55, 1.9, 0.6);
        p("#ffd84a", 0, ly - 0.55, 1.9, 0.12);
        for (let k = 0; k < 5; k++) {
            p("#ffffff", 0.1 + k * 0.36, ly + 0.05, 0.18, 0.22);
            if (open > 0.3) {
                p("#ffffff", 0.2 + k * 0.36, -1.3, 0.18, 0.2);
            }
        }
    },

    // Десантний човник знижується над колонією, мигаючи вогнями
    dropship(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 5);
        const y = gY * 0.22 + t * gY * 0.2;
        const p = painter(ctx, B, x, y, false);
        const glow = 0.3 + Math.abs(Math.sin(time * 20)) * 0.3;
        p("#7df9ff", 2.9, 0.3, 0.5 + glow, 0.35);
        p("#7df9ff", 2.9, -0.35, 0.4 + glow, 0.3);
        p("#3a3a3a", 1.9, 0.25, 1.0, 0.45);
        p("#3a3a3a", 1.9, -0.4, 1.0, 0.4);
        p("#5a6a5a", -2.0, -0.45, 4.0, 0.9);
        p("#4a5a4a", -2.8, -0.2, 0.8, 0.55);
        p("#6a7a6a", -1.6, -0.45, 3.4, 0.2);
        p("#5a6a5a", 1.2, -1.2, 0.6, 0.75);
        p("#5a6a5a", -0.8, 0.45, 2.2, 0.25);
        p("#9fd8ff", -2.2, -0.2, 0.6, 0.25);
        p("#3a4a3a", -0.4, 0.05, 0.6, 0.2);
        p("#3a4a3a", 0.4, 0.05, 0.6, 0.2);
        const blink = Math.floor(time * 3) % 2;
        p(blink ? "#ff3355" : "#551122", -2.9, -0.25, 0.2, 0.2);
        p(blink ? "#39ff88" : "#0a3a1a", 1.3, -1.35, 0.2, 0.2);
        if (Math.sin(time * 1.5) > 0) {
            const base = ctx.globalAlpha;
            ctx.globalAlpha = base * 0.15;
            ctx.fillStyle = "#ffffcc";
            ctx.beginPath();
            ctx.moveTo(x - B * 0.2, y + B * 0.7);
            ctx.lineTo(x - B * 2.5, gY);
            ctx.lineTo(x + B * 1.5, gY);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = base;
        }
    },

    // Диск мисливця розрізає повітря й повертається бумерангом
    disc(ctx, t, W, H, gY, time, B) {
        const x = W * (0.95 - 0.8 * Math.sin(Math.PI * t));
        const y = gY * 0.4 + Math.sin(Math.PI * 2 * t) * B * 2.5;
        const base = ctx.globalAlpha;
        for (let k = 1; k < 8; k++) {
            const tk = Math.max(0, t - k * 0.01);
            ctx.globalAlpha = base * (1 - k / 8) * 0.5;
            ctx.fillStyle = "#ff5a3a";
            ctx.fillRect(Math.round(W * (0.95 - 0.8 * Math.sin(Math.PI * tk)) - 2), Math.round(gY * 0.4 + Math.sin(Math.PI * 2 * tk) * B * 2.5 - 1), 4, 2);
        }
        ctx.globalAlpha = base;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, 0.45);
        ctx.rotate(time * 18);
        ctx.fillStyle = "#c8ccd4";
        for (let q = 0; q < 6; q++) {
            ctx.rotate(Math.PI / 3);
            ctx.beginPath();
            ctx.moveTo(0, -B * 0.4);
            ctx.lineTo(B * 1.3, -B * 0.1);
            ctx.lineTo(B * 0.5, B * 0.4);
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = "#6a6a74";
        ctx.beginPath();
        ctx.arc(0, 0, B * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff5a3a";
        ctx.fillRect(-B * 0.15, -B * 0.15, B * 0.3, B * 0.3);
        ctx.restore();
    },

    // Дракончик-малюк підстрибує й чхає кільцями диму та іскрою вогню
    babydragon(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 3) * 0.8 + W * 0.15;
        const hop = Math.abs(Math.sin(time * 6)) * 0.5;
        const sneeze = (time * 0.7) % 1;
        const flap = Math.sin(time * 14) > 0;
        const p = painter(ctx, B, x, gY - hop * B, false);
        p("#6a3aa8", 0.2, -0.5, 0.3, 0.5);
        p("#6a3aa8", 0.9, -0.5, 0.3, 0.5);
        p("#8a4ac8", 0, -1.4, 1.4, 1.0);
        p("#d8b0ff", 0.2, -0.9, 0.9, 0.4);
        p("#8a4ac8", 1.4, -1.0, 0.8, 0.25);
        p("#6a3aa8", 2.1, -1.25, 0.3, 0.3);
        p("#b080ff", 0.4, flap ? -2.3 : -1.7, 0.8, flap ? 0.9 : 0.5);
        p("#8a4ac8", -0.8, -2.1, 1.0, 0.9);
        p("#ffe14d", -0.5, -2.35, 0.15, 0.3);
        p("#ffe14d", -0.1, -2.35, 0.15, 0.3);
        p("#ffffff", -0.55, -1.9, 0.25, 0.25);
        p("#1a1a1a", -0.5, -1.85, 0.12, 0.15);
        p("#5a2a88", -0.85, -1.45, 0.12, 0.1);
        if (sneeze < 0.35) {
            const s = sneeze / 0.35;
            const base = ctx.globalAlpha;
            ctx.globalAlpha = base * (1 - s);
            p("#aaaaaa", -1.3 - s * 1.5, -1.7 - s * 0.6, 0.5 + s * 0.4, 0.5 + s * 0.4);
            p("#ff9a00", -1.2 - s * 0.8, -1.5, 0.3, 0.2);
            p("#ffe14d", -1.1 - s * 0.5, -1.45, 0.15, 0.12);
            ctx.globalAlpha = base;
        }
    },

    // Кріт у шахтарській касці визирає з нірок одна за одною
    mole(ctx, t, W, H, gY, time, B) {
        const idx = Math.min(2, Math.floor(t * 3));
        const local = t * 3 - idx;
        const x = W * (0.8 - idx * 0.25);
        const h = Math.sin(local * Math.PI);
        const p0 = painter(ctx, B, x, gY, false);
        for (let k = 0; k <= idx; k++) {
            const hp = painter(ctx, B, W * (0.8 - k * 0.25), gY, false);
            hp("#5a3a1a", -1.0, -0.35, 2.0, 0.35);
            hp("#6a4a2a", -0.7, -0.55, 1.4, 0.2);
        }
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W, gY - B * 0.3);
        ctx.clip();
        const look = Math.sin(time * 3) * 0.1;
        const p = painter(ctx, B, x + look * B, gY - B * 0.3 + (1 - h) * B * 2.2, false);
        p("#5a4a3a", -0.6, -1.9, 1.2, 1.9);
        p("#ffb0b0", -0.2, -1.2, 0.4, 0.25);
        p("#1a1a1a", -0.4, -1.55, 0.15, 0.15);
        p("#1a1a1a", 0.25, -1.55, 0.15, 0.15);
        p("#ffd84a", -0.7, -2.3, 1.4, 0.5);
        p("#ffffff", -0.15, -2.2, 0.3, 0.25);
        p("#d8c8b8", -0.45, -0.4, 0.3, 0.3);
        p("#d8c8b8", 0.15, -0.4, 0.3, 0.3);
        ctx.restore();
        if (h > 0.5) {
            const base = ctx.globalAlpha;
            ctx.globalAlpha = base * 0.2 * h;
            ctx.fillStyle = "#fff6b0";
            const dir = Math.sin(time * 3) > 0 ? 1 : -1;
            const ly = gY - B * 0.3 - B * 2.1 * h;
            ctx.beginPath();
            ctx.moveTo(x, ly);
            ctx.lineTo(x + dir * B * 6, ly - B * 1.5);
            ctx.lineTo(x + dir * B * 6, ly + B * 1.5);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = base;
        }
        p0("#6a4a2a", -0.8, -0.3, 1.6, 0.3);
    },

    // Фантом пікірує з неба на широких крилах
    phantom(ctx, t, W, H, gY, time, B) {
        const x = crossRight(t, W, B, 5);
        const y = gY * 0.1 + Math.sin(Math.PI * t) * gY * 0.45;
        const flap = Math.sin(time * 6) * 0.6;
        const p = painter(ctx, B, x, y, true);
        p("#3a4a7a", 2.4, -0.1, 1.2, 0.3);
        p("#4a5a8a", 0, -0.35, 2.4, 0.6);
        p("#5a6a9a", 0.4, -0.35, 1.6, 0.2);
        p("#3a4a7a", 0.3, -0.35 - 1.6 - flap, 0.6, 1.6 + flap);
        p("#3a4a7a", 0.9, -0.35 - 1.0 - flap * 0.6, 0.6, 1.0 + flap * 0.6);
        p("#2a3a6a", 0.3, 0.25, 0.6, 1.0 - flap * 0.5);
        p("#2a3a6a", 0.9, 0.25, 0.6, 0.6 - flap * 0.3);
        p("#4a5a8a", -0.7, -0.3, 0.7, 0.5);
        p("#9aff5a", -0.6, -0.2, 0.2, 0.15);
    },

    // Лицар зі списом і прапорцем мчить галопом
    knight(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 6);
        const gallop = Math.abs(Math.sin(time * 10)) * 0.3;
        const legs = Math.sin(time * 10) > 0 ? 0.3 : -0.3;
        const p = painter(ctx, B, x, gY - gallop * B, false);
        p("#6a4a2a", 0.2 - legs, -1.1, 0.3, 1.1);
        p("#6a4a2a", 0.7 + legs, -1.1, 0.3, 1.1);
        p("#6a4a2a", 2.0 - legs, -1.1, 0.3, 1.1);
        p("#6a4a2a", 2.5 + legs, -1.1, 0.3, 1.1);
        p("#f0f0f0", 0, -2.2, 3.0, 1.2);
        p("#3a5ac8", 0.6, -2.3, 1.8, 1.0);
        p("#ffd84a", 0.6, -1.4, 1.8, 0.12);
        p("#f0f0f0", -0.8, -3.0, 1.0, 1.2);
        p("#f0f0f0", -1.3, -2.5, 0.6, 0.6);
        p("#1a1a1a", -0.6, -2.8, 0.15, 0.15);
        p("#8a6a4a", -0.1, -3.2, 0.3, 1.0);
        p("#8a6a4a", 3.0, -2.2, 0.6, 0.9);
        p("#b8bcc8", 1.0, -3.6, 0.9, 1.4);
        p("#9a9eaa", 1.0, -4.4, 0.9, 0.8);
        p("#1a1a1a", 1.0, -4.1, 0.6, 0.12);
        p("#ff3355", 1.3, -4.7, 0.3, 0.3);
        p("#d8d8e0", -3.5, -3.1, 4.6, 0.15);
        const wave = Math.sin(time * 12) * 0.12;
        p("#ff3355", -2.6, -3.5 + wave, 0.9, 0.4);
        p("#ffe14d", -2.6, -3.3 + wave, 0.9, 0.12);
    },

    // Робот-прибиральник їздить підлогою ангара зі щіткою й бурчить «біп»
    cleanbot(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 3) * 0.75 + W * 0.2;
        const brush = Math.sin(time * 14) * 0.2;
        const p = painter(ctx, B, x, gY, false);
        const base = ctx.globalAlpha;
        const rng = eggRng(Math.floor(time * 8));
        ctx.globalAlpha = base * 0.6;
        for (let i = 0; i < 5; i++) {
            p("#9a9aa4", -1.4 - rng() * 1.2, -0.3 - rng() * 0.6, 0.2 + rng() * 0.2, 0.2);
        }
        ctx.globalAlpha = base;
        p("#1a1a1a", 0.1, -0.35, 0.4, 0.35);
        p("#1a1a1a", 1.1, -0.35, 0.4, 0.35);
        p("#e8e8ee", 0, -1.2, 1.6, 0.9);
        p("#ffa21a", 0, -0.55, 1.6, 0.15);
        p("#3a4a6a", 0.2, -1.05, 1.2, 0.4);
        p("#7df9ff", 0.35 + Math.sin(time * 2) * 0.15, -0.95, 0.2, 0.2);
        p("#7df9ff", 0.85 + Math.sin(time * 2) * 0.15, -0.95, 0.2, 0.2);
        p("#9a9aa4", 0.75, -1.7, 0.1, 0.5);
        p(Math.floor(time * 4) % 2 ? "#ff3355" : "#39ff88", 0.7, -1.85, 0.2, 0.2);
        p("#9a9aa4", -0.6, -0.9, 0.6, 0.12);
        p("#ffd84a", -1.0 + brush, -0.4, 0.5, 0.4);
        p("#c8a040", -0.9 + brush, -0.1, 0.35, 0.1);
        if (Math.sin(time * 1.7) > 0.5) {
            speechBubble(ctx, x + B * 0.8, gY - B * 2.4, B, "біп-біп", "#3a4a6a");
        }
    },

    // Пінгвін ковзає на животі по снігу
    penguin(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4);
        const p = painter(ctx, B, x, gY, false);
        const rng = eggRng(Math.floor(time * 14));
        for (let i = 0; i < 7; i++) {
            p("#ffffff", 2.2 + rng() * 2, -0.2 - rng() * 1.0, 0.18, 0.18);
        }
        p("#ff9a00", 2.0, -0.55, 0.4, 0.2);
        p("#ff9a00", 2.0, -0.3, 0.4, 0.2);
        p("#1a1a2a", 0, -0.95, 2.1, 0.55);
        p("#f4f8ff", 0.2, -0.45, 1.8, 0.4);
        p("#1a1a2a", 0.6, -0.6 - Math.abs(Math.sin(time * 4)) * 0.2, 0.9, 0.2);
        p("#1a1a2a", -0.7, -1.05, 0.8, 0.7);
        p("#f4f8ff", -0.55, -0.85, 0.3, 0.3);
        p("#1a1a1a", -0.45, -0.78, 0.12, 0.12);
        p("#ff9a00", -1.05, -0.75, 0.4, 0.2);
    },

    // Дельфін пропливає хвилею, робить сальто й пускає бульбашки
    dolphin(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4);
        const baseY = gY * 0.55;
        const flip = t > 0.45 && t < 0.6 ? (t - 0.45) / 0.15 * Math.PI * 2 : 0;
        const y = baseY + Math.sin(time * 3) * B * 0.8 - Math.sin(flip / 2) * B * 2;
        const ang = Math.cos(time * 3) * 0.25 - flip;
        const base = ctx.globalAlpha;
        const rng = eggRng(11);
        for (let i = 0; i < 6; i++) {
            const age = (time * 0.8 + rng()) % 1;
            ctx.globalAlpha = base * (1 - age) * 0.8;
            ctx.strokeStyle = "#c8f0ff";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x - B * 1.2 + rng() * B + age * B * 3, y - B * 0.6 - age * B * 4, B * (0.12 + rng() * 0.15), 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = base;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        const p = painter(ctx, B, 0, 0, false);
        p("#5aa0d8", -1.6, -0.45, 3.2, 0.9);
        p("#d8eef8", -1.3, 0.15, 2.6, 0.3);
        p("#5aa0d8", 1.6, -0.2, 0.6, 0.35);
        p("#4a88c0", 2.1, -0.6, 0.35, 1.2);
        p("#4a88c0", -0.2, -0.95, 0.6, 0.5);
        p("#4a88c0", -0.4, 0.4, 0.5, 0.35);
        p("#5aa0d8", -2.2, -0.15, 0.6, 0.35);
        p("#1a1a2a", -1.3, -0.25, 0.15, 0.15);
        p("#ffffff", -1.35, -0.3, 0.06, 0.06);
        ctx.restore();
    },

    // Піщаний вихор пробігає пустелею й крутить піщинки
    dustdevil(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4);
        const base = ctx.globalAlpha;
        for (let k = 0; k < 11; k++) {
            const w = B * (0.6 + k * 0.4);
            const y = gY - B * 0.6 - k * B * 0.6;
            const off = Math.sin(time * 6 + k * 0.7) * B * 0.5 + k * B * 0.12;
            ctx.globalAlpha = base * (0.8 - k * 0.03);
            ctx.fillStyle = k % 2 ? "#a0703a" : "#7a5228";
            ctx.fillRect(Math.round(x + off - w / 2), Math.round(y), Math.round(w), Math.round(B * 0.6));
        }
        ctx.globalAlpha = base;
        ctx.fillStyle = "#4a3018";
        for (let i = 0; i < 14; i++) {
            const a = time * 5 + i * 0.9;
            const hgt = (i / 14) * 6;
            const r = B * (0.5 + hgt * 0.4);
            ctx.fillRect(Math.round(x + Math.cos(a) * r + hgt * B * 0.12), Math.round(gY - B * 0.6 - hgt * B * 0.6), 3, 3);
        }
    },

    // Папуга-балакун пролітає й вигукує «ПРИВІТ!»
    parrot(ctx, t, W, H, gY, time, B) {
        const x = crossRight(t, W, B, 4);
        const y = gY * 0.3 + Math.sin(time * 3) * B * 0.8;
        const flap = Math.sin(time * 12) > 0;
        const p = painter(ctx, B, x, y, true);
        p("#2a6aff", 1.3, 0.1, 1.6, 0.25);
        p("#ffe14d", 1.3, 0.3, 1.3, 0.2);
        p("#e0203a", 0, -0.3, 1.5, 0.75);
        p("#2a6aff", 0.3, flap ? -1.4 : 0.3, 0.9, flap ? 1.2 : 0.9);
        p("#ffe14d", 0.3, flap ? -0.6 : 0.3, 0.9, 0.3);
        p("#e0203a", -0.7, -0.7, 0.9, 0.85);
        p("#ffffff", -0.55, -0.5, 0.35, 0.3);
        p("#1a1a1a", -0.45, -0.45, 0.12, 0.15);
        p("#e8e8d0", -1.1, -0.45, 0.45, 0.45);
        p("#1a1a1a", -1.0, -0.1, 0.3, 0.15);
        if (t > 0.3 && t < 0.7) {
            speechBubble(ctx, x + B * 1.0, y - B * 1.3, B, "ПРИВІТ!", "#e0203a");
        }
    },

    // Астронавт пропливає, крутячись у невагомості, і махає рукою
    astronaut(ctx, t, W, H, gY, time, B) {
        const x = crossRight(t, W, B, 3);
        const y = gY * 0.35 + Math.sin(t * Math.PI * 2) * B * 2;
        const wave = Math.sin(time * 8) > 0;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 0.9);
        const p = painter(ctx, B, 0, 0, false);
        p("#c8ccd4", -0.9, -0.5, 0.7, 1.4);
        p("#f0f0f4", -0.5, -0.8, 1.0, 1.6);
        p("#f0f0f4", -0.4, 0.8, 0.35, 0.9);
        p("#f0f0f4", 0.1, 0.8, 0.35, 0.9);
        p("#f0f0f4", -0.9, -0.4, 0.4, 0.9);
        p("#f0f0f4", 0.5, wave ? -1.2 : -0.6, 0.4, 0.9);
        p("#f0f0f4", -0.55, -1.7, 1.1, 1.0);
        p("#ffb040", -0.35, -1.5, 0.7, 0.6);
        p("#ffe0a0", -0.2, -1.45, 0.2, 0.2);
        p("#ff3355", -0.2, -0.3, 0.4, 0.3);
        ctx.restore();
    },

    // Золотогривий пегас пролітає між баштами цитаделі
    pegasus(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 5);
        const y = gY * 0.28 + Math.sin(t * Math.PI * 2) * B * 1.2;
        const flap = Math.sin(time * 7);
        const legs = Math.sin(time * 7) > 0 ? 0.25 : -0.25;
        const p = painter(ctx, B, x, y, false);
        p("#e8e8f0", 0.2 + legs, 0.4, 0.25, 0.8);
        p("#e8e8f0", 0.6 - legs, 0.4, 0.25, 0.8);
        p("#e8e8f0", 2.0 + legs, 0.4, 0.25, 0.8);
        p("#e8e8f0", 2.4 - legs, 0.4, 0.25, 0.8);
        p("#ffffff", 0, -0.4, 2.8, 1.0);
        p("#ffd84a", 2.8, -0.3, 0.9, 0.35);
        p("#ffd84a", 3.4, -0.1, 0.4, 0.6);
        p("#ffffff", -0.7, -1.3, 0.9, 1.1);
        p("#ffffff", -1.3, -1.0, 0.7, 0.5);
        p("#ffd84a", 0.1, -1.4, 0.35, 1.0);
        p("#ffd84a", -0.3, -1.6, 0.5, 0.3);
        p("#1a1a1a", -0.5, -1.05, 0.12, 0.12);
        p("#f0f4ff", 0.9, flap > 0 ? -2.2 : -0.6, 1.2, flap > 0 ? 1.9 : 0.6);
        p("#d8e4ff", 1.2, flap > 0 ? -2.8 : -0.4, 1.4, flap > 0 ? 0.7 : 0.35);
        const sp = (time * 2) % 1;
        p("#fffbe0", 3.5 + sp * 2, 0.3 - sp * 0.5, 0.15, 0.15);
        p("#fffbe0", 3.0 + sp * 2.5, 0.8, 0.12, 0.12);
    },

    // Гаст пливе над лавою й плюється вогняними кулями
    ghast(ctx, t, W, H, gY, time, B) {
        const x = crossLeft(t, W, B, 4) * 0.8 + W * 0.15;
        const y = gY * 0.2 + Math.sin(time * 1.5) * B * 0.6;
        const shoot = (time * 0.6) % 1;
        const angry = shoot < 0.15;
        const p = painter(ctx, B, x, y, false);
        for (let k = 0; k < 7; k++) {
            const len = 1.2 + (k % 3) * 0.5 + Math.sin(time * 3 + k) * 0.3;
            p("#e8e8e8", 0.15 + k * 0.4, 2.8, 0.22, len);
        }
        p("#f4f4f4", 0, 0, 3.0, 2.9);
        p("#d8d8d8", 0, 2.4, 3.0, 0.5);
        p("#b0b0b0", 0.4, angry ? 0.7 : 0.9, 0.6, angry ? 0.45 : 0.15);
        p("#b0b0b0", 1.9, angry ? 0.7 : 0.9, 0.6, angry ? 0.45 : 0.15);
        if (angry) {
            p("#ff3a2a", 0.55, 0.8, 0.25, 0.25);
            p("#ff3a2a", 2.05, 0.8, 0.25, 0.25);
        }
        p("#6a6a6a", 1.1, 1.6, 0.8, angry ? 0.7 : 0.3);
        if (shoot > 0.1 && shoot < 0.9) {
            const f = (shoot - 0.1) / 0.8;
            const fx = x + B * 1.5 - f * W * 0.3;
            const fy = y + B * 2 + f * (gY - y - B * 2);
            const fp = painter(ctx, B, fx, fy, false);
            fp("#ff6a00", -0.45, -0.45, 0.9, 0.9);
            fp("#ffe14d", -0.25, -0.25, 0.5, 0.5);
            fp("rgba(255, 106, 0, 0.5)", 0.45, -0.7, 0.4, 0.4);
            fp("rgba(255, 106, 0, 0.3)", 0.9, -1.1, 0.35, 0.35);
        }
    }
};

// ============================================================
// shop.js — золоті монети та магазин: каталог товарів (SHOP_ITEMS, SHOP_TYPES)
// і точка входу для всього магазинного. Нарахування монет — shop_rewards.js,
// сердечко, монета, шлейфи й вибухи — shop_effects.js, аксесуари — shop_accessories.js,
// сундуки — shop_chests.js, улюбленці (рідкості, бонуси, місця, мутації) — shop_pets.js,
// їх малювання — pets_draw.js. Скіни магазину — shop_skins.js.
// ============================================================

// ---------- Каталог ----------

// Перший товар кожного типу безкоштовний і відкритий завжди — це «без прикрас»
// Скіни (type: "skin") носять renderType — ключ малювальника з shop_skins.js;
// надітий скін зберігається, як і скіни рівнів, у settings.activeSkin
export const SHOP_ITEMS = [
    { id: "shop_night_dragon", type: "skin", name: "Чорний дракончик", price: 120, renderType: "shop_night_dragon" },
    { id: "shop_panda", type: "skin", name: "Кубик-панда", price: 220, renderType: "shop_panda" },
    { id: "shop_dog", type: "skin", name: "Кубик-пес", price: 220, renderType: "shop_dog" },
    { id: "shop_fox", type: "skin", name: "Кубик-лисичка", price: 280, renderType: "shop_fox" },
    { id: "shop_penguin", type: "skin", name: "Кубик-пінгвін", price: 280, renderType: "shop_penguin" },
    { id: "shop_owl", type: "skin", name: "Кубик-сова", price: 280, renderType: "shop_owl" },
    { id: "shop_frog", type: "skin", name: "Кубик-жабка", price: 350, renderType: "shop_frog" },
    { id: "shop_shark", type: "skin", name: "Кубик-акула", price: 350, renderType: "shop_shark" },
    { id: "shop_villager", type: "skin", name: "Кубик-житель", price: 350, renderType: "shop_villager" },
    { id: "shop_zombie", type: "skin", name: "Кубик-зомбі", price: 350, renderType: "shop_zombie" },
    { id: "shop_axolotl", type: "skin", name: "Аксолотль", price: 350, renderType: "shop_axolotl" },
    { id: "shop_bee", type: "skin", name: "Бджілка", price: 350, renderType: "shop_bee" },
    { id: "shop_peeper", type: "skin", name: "Рибка-пішер", price: 350, renderType: "shop_peeper" },
    { id: "shop_patrick", type: "skin", name: "Морська зірка", price: 350, renderType: "shop_patrick" },
    { id: "shop_waffle", type: "skin", name: "Вафля", price: 350, renderType: "shop_waffle" },
    { id: "shop_creeper", type: "skin", name: "Кубик-кріпер", price: 450, renderType: "shop_creeper" },
    { id: "shop_skeleton", type: "skin", name: "Кубик-скелет", price: 450, renderType: "shop_skeleton" },
    { id: "shop_ninja", type: "skin", name: "Кубик-ніндзя", price: 450, renderType: "shop_ninja" },
    { id: "shop_firefighter", type: "skin", name: "Кубик-пожежник", price: 450, renderType: "shop_firefighter" },
    { id: "shop_national", type: "skin", name: "Збірна", price: 450, renderType: "shop_national" },
    { id: "shop_iron_golem", type: "skin", name: "Залізний голем", price: 600, renderType: "shop_iron_golem" },
    { id: "shop_knight", type: "skin", name: "Кубик-лицар", price: 600, renderType: "shop_knight" },
    { id: "shop_astronaut", type: "skin", name: "Кубик-астронавт", price: 600, renderType: "shop_astronaut" },
    { id: "shop_robot", type: "skin", name: "Кубик-робот", price: 600, renderType: "shop_robot" },
    { id: "shop_illager", type: "skin", name: "Ілагер", price: 600, renderType: "shop_illager" },
    { id: "shop_goalkeeper", type: "skin", name: "Воротар", price: 600, renderType: "shop_goalkeeper" },
    { id: "shop_green_ninja", type: "skin", name: "Зелений ніндзя", price: 600, renderType: "shop_green_ninja" },
    { id: "shop_enderman", type: "skin", name: "Кубик-ендермен", price: 1200, league: 2, renderType: "shop_enderman" },
    { id: "shop_wizard", type: "skin", name: "Кубик-чарівник", price: 1200, league: 2, renderType: "shop_wizard" },
    { id: "shop_gamer", type: "skin", name: "Кубик-геймер", price: 1200, league: 2, renderType: "shop_gamer" },
    { id: "shop_diver", type: "skin", name: "Водолаз", price: 1200, league: 2, renderType: "shop_diver" },
    { id: "shop_gorilla", type: "skin", name: "Горила", price: 1200, league: 2, renderType: "shop_gorilla" },
    { id: "shop_gd_spider", type: "skin", name: "GD-павук", price: 1200, league: 2, renderType: "shop_gd_spider" },
    { id: "shop_superhero", type: "skin", name: "Кубик-супергерой", price: 1500, league: 2, renderType: "shop_superhero" },
    { id: "shop_crystal_golem", type: "skin", name: "Кристальний голем", price: 1500, league: 2, renderType: "shop_crystal_golem" },
    { id: "shop_shades", type: "skin", name: "Кубик у темних окулярах", price: 1500, league: 2, renderType: "shop_shades" },
    { id: "shop_ufo", type: "skin", name: "Кубик-НЛО", price: 1950, league: 2, renderType: "shop_ufo" },
    { id: "shop_warden", type: "skin", name: "Вартовий", price: 1950, league: 2, renderType: "shop_warden" },
    { id: "shop_sharingan", type: "skin", name: "Шарінган", price: 1950, league: 2, renderType: "shop_sharingan" },
    { id: "shop_dragon", type: "skin", name: "Кубик-дракончик", price: 2400, league: 2, renderType: "shop_dragon" },
    { id: "shop_galaxy", type: "skin", name: "Кубик-галактика", price: 3000, league: 2, renderType: "shop_galaxy" },
    // Скіни пізніх ліг (league — з якої ліги відкриваються)
    { id: "shop_terminator", type: "skin", name: "Термінатор", price: 5000, league: 3, renderType: "shop_terminator" },
    { id: "shop_predator", type: "skin", name: "Хижак", price: 6000, league: 3, renderType: "shop_predator" },
    { id: "shop_kurama", type: "skin", name: "Дев'ятихвостий лис", price: 7000, league: 3, renderType: "shop_kurama" },
    { id: "shop_godzilla", type: "skin", name: "Ґодзілла", price: 12000, league: 4, renderType: "shop_godzilla" },
    { id: "shop_demogorgon", type: "skin", name: "Демогоргон", price: 15000, league: 4, renderType: "shop_demogorgon" },
    { id: "shop_reaper", type: "skin", name: "Жнець-левіафан", price: 18000, league: 4, renderType: "shop_reaper" },

    // Легендарні скіни: купуються лише після виконання умови (requirement)
    { id: "shop_phoenix", type: "skin", name: "Вогняний фенікс", price: 6000, renderType: "shop_phoenix", legendary: true, requirement: { kind: "clears", target: 25 } },
    { id: "shop_golden_ninja", type: "skin", name: "Золотий ніндзя", price: 7000, renderType: "shop_golden_ninja", legendary: true, requirement: { kind: "combo_levels" } },
    { id: "shop_rainbow", type: "skin", name: "Кубик-райдуга", price: 8000, renderType: "shop_rainbow", legendary: true, requirement: { kind: "gold_count", target: 10 } },
    { id: "shop_trophy", type: "skin", name: "Кубок досягнень", price: 9000, renderType: "shop_trophy", legendary: true, requirement: { kind: "achievements", target: 25 } },
    { id: "shop_golden", type: "skin", name: "Золотий кубик", price: 10000, renderType: "shop_golden", legendary: true, requirement: { kind: "gold_league", league: 1 } },

    { id: "trail_default", type: "trail", name: "Звичайний", price: 0 },
    { id: "trail_neon", type: "trail", name: "Неонова лінія", price: 200 },
    { id: "trail_bubbles", type: "trail", name: "Бульбашки", price: 280 },
    { id: "trail_rainbow", type: "trail", name: "Райдуга", price: 380 },
    { id: "trail_blocks", type: "trail", name: "Кубічні пікселі", price: 480 },
    { id: "trail_stars", type: "trail", name: "Зірочки", price: 600 },
    { id: "trail_fire", type: "trail", name: "Вогонь", price: 1500, league: 2 },
    { id: "trail_plasma", type: "trail", name: "Плазма", price: 5000, league: 3 },
    { id: "trail_comet", type: "trail", name: "Комета", price: 6400, league: 3 },
    { id: "trail_blackhole", type: "trail", name: "Чорна діра", price: 13500, league: 4 },

    { id: "boom_default", type: "explosion", name: "Звичайний", price: 0 },
    { id: "boom_confetti", type: "explosion", name: "Конфеті", price: 200 },
    { id: "boom_pixels", type: "explosion", name: "Пікселі-кубики", price: 280 },
    { id: "boom_bubbles", type: "explosion", name: "Мильні бульбашки", price: 380 },
    { id: "boom_watermelon", type: "explosion", name: "Кавун", price: 480 },
    { id: "boom_fireworks", type: "explosion", name: "Феєрверк", price: 600 },
    { id: "boom_starfall", type: "explosion", name: "Зорепад", price: 1500, league: 2 },
    { id: "boom_plasma", type: "explosion", name: "Плазмовий розряд", price: 5000, league: 3 },
    { id: "boom_supernova", type: "explosion", name: "Наднова", price: 6400, league: 3 },
    { id: "boom_atomic", type: "explosion", name: "Атомний вибух", price: 13500, league: 4 },

    { id: "weapon_none", type: "weapon", name: "Без зброї (стрибки)", price: 0 },
    { id: "weapon_sword", type: "weapon", name: "Меч", price: 200, league: 1, bonus: 1.05 },
    { id: "weapon_axe", type: "weapon", name: "Сокира-бумеранг", price: 300, league: 1, bonus: 1.1 },
    { id: "weapon_pickaxe", type: "weapon", name: "Кирка", price: 400, league: 1, bonus: 1.15 },
    { id: "weapon_bat", type: "weapon", name: "Бейсбольна бита", price: 450, league: 1, bonus: 1.17 },
    { id: "weapon_bow", type: "weapon", name: "Лук", price: 500, league: 1, bonus: 1.2 },
    { id: "weapon_ball", type: "weapon", name: "Футбольний м'яч", price: 600, league: 1, bonus: 1.25 },
    { id: "weapon_pistol", type: "weapon", name: "Пістолет", price: 1350, league: 2, bonus: 1.3 },
    { id: "weapon_rifle", type: "weapon", name: "Автомат", price: 1800, league: 2, bonus: 1.35 },
    { id: "weapon_flamethrower", type: "weapon", name: "Вогнемет", price: 2250, league: 2, bonus: 1.4 },
    { id: "weapon_laser", type: "weapon", name: "Лазер", price: 2850, league: 2, bonus: 1.45 },
    { id: "weapon_saber_green", type: "weapon", name: "Світловий меч (зелений)", price: 5000, league: 3, bonus: 1.5 },
    { id: "weapon_saber_blue", type: "weapon", name: "Світловий меч (синій)", price: 5000, league: 3, bonus: 1.5 },
    { id: "weapon_saber_red", type: "weapon", name: "Світловий меч (червоний)", price: 5000, league: 3, bonus: 1.5 },
    { id: "weapon_rocket", type: "weapon", name: "Ракетниця", price: 6400, league: 3, bonus: 1.6 },
    { id: "weapon_plasma", type: "weapon", name: "Плазмова гармата", price: 12000, league: 4, bonus: 1.65 },
    { id: "weapon_shuriken", type: "weapon", name: "Сюрикени", price: 15000, league: 4, bonus: 1.7 },
    // Легендарна зброя: як легендарні скіни, купується лише після виконання умови
    { id: "weapon_firesword", type: "weapon", name: "Вогняний меч", price: 8000, bonus: 1.7, legendary: true, requirement: { kind: "clears", target: 15 } },
    { id: "weapon_thunder", type: "weapon", name: "Громовий молот", price: 10000, bonus: 1.8, legendary: true, requirement: { kind: "gold_count", target: 10 } },
    { id: "weapon_gravity", type: "weapon", name: "Гравітаційна гармата", price: 12000, bonus: 1.9, legendary: true, requirement: { kind: "gold_count", target: 20 } },

    { id: "acc_none", type: "accessory", name: "Без аксесуара", price: 0 },
    { id: "acc_cap", type: "accessory", name: "Кепка", price: 200 },
    { id: "acc_bow", type: "accessory", name: "Бант", price: 220 },
    { id: "acc_glasses", type: "accessory", name: "Сонцезахисні окуляри", price: 240 },
    { id: "acc_heart_pendant", type: "accessory", name: "Кулон-сердечко", price: 260 },
    { id: "acc_headphones", type: "accessory", name: "Навушники", price: 450 },
    { id: "acc_cowboy", type: "accessory", name: "Ковбойський капелюх", price: 480 },
    { id: "acc_horns", type: "accessory", name: "Ріжки", price: 520 },
    { id: "acc_flower_wreath", type: "accessory", name: "Квітковий вінок", price: 560 },
    { id: "acc_pirate", type: "accessory", name: "Піратський капелюх", price: 1200, league: 2 },
    { id: "acc_halo", type: "accessory", name: "Німб", price: 1275, league: 2 },
    { id: "acc_crown", type: "accessory", name: "Корона", price: 1350, league: 2 },
    { id: "acc_wings", type: "accessory", name: "Крила", price: 1500, league: 2 },
    { id: "acc_ninja_band", type: "accessory", name: "Пов'язка ніндзя", price: 5000, league: 3 },
    { id: "acc_cyber_visor", type: "accessory", name: "Кібер-візор", price: 5600, league: 3 },
    { id: "acc_heart_orbit", type: "accessory", name: "Орбіта сердець", price: 12000, league: 4 },
    { id: "acc_diamond_crown", type: "accessory", name: "Діамантова корона", price: 15000, league: 4 },

    // Улюбленці бігають за кубиком. rarity — рідкість (показується замість ліги),
    // league — з якої ліги продається, move — "ground" (біжить), "swim" (пливе в бульбашці)
    // або "fly" (летить над шипами). Безкоштовного улюбленця немає: перше місце в зграї
    // просто порожнє. Легендарні (legendary) купуються після умови, як легендарні скіни;
    // секретний (secret) не продається — лише випадає із золотого сундука
    { id: "pet_hamster", type: "pet", name: "Хом'ячок", price: 130, league: 1, rarity: "common", move: "ground" },
    { id: "pet_puppy", type: "pet", name: "Цуценя", price: 120, league: 1, rarity: "common", move: "ground" },
    { id: "pet_capybara", type: "pet", name: "Капібара", price: 150, league: 1, rarity: "common", move: "ground" },
    { id: "pet_duck", type: "pet", name: "Каченя в кружечку", price: 180, league: 1, rarity: "common", move: "swim" },
    { id: "pet_slime", type: "pet", name: "Слизень-желе", price: 160, league: 1, rarity: "common", move: "ground" },
    { id: "pet_bunny", type: "pet", name: "Кролик", price: 200, league: 1, rarity: "common", move: "ground" },
    { id: "pet_llama", type: "pet", name: "Лама", price: 220, league: 1, rarity: "common", move: "ground" },
    { id: "pet_kitten", type: "pet", name: "Кошеня", price: 300, league: 1, rarity: "rare", move: "ground" },
    { id: "pet_alpaca", type: "pet", name: "Альпака", price: 320, league: 1, rarity: "rare", move: "ground" },
    { id: "pet_turtle", type: "pet", name: "Черепашка", price: 380, league: 1, rarity: "rare", move: "swim" },
    { id: "pet_seal", type: "pet", name: "Тюлень", price: 420, league: 1, rarity: "rare", move: "swim" },
    { id: "pet_jellyfish", type: "pet", name: "Медуза", price: 450, league: 1, rarity: "rare", move: "swim" },
    { id: "pet_dolphin", type: "pet", name: "Дельфінчик", price: 1200, league: 2, rarity: "epic", move: "swim" },
    { id: "pet_owl", type: "pet", name: "Сова", price: 1250, league: 2, rarity: "epic", move: "fly" },
    { id: "pet_ghost", type: "pet", name: "Привид", price: 1300, league: 2, rarity: "epic", move: "fly" },
    { id: "pet_octopus", type: "pet", name: "Восьминіжка", price: 1350, league: 2, rarity: "epic", move: "swim" },
    { id: "pet_mini_dragon", type: "pet", name: "Дракончик", price: 1450, league: 2, rarity: "epic", move: "fly" },
    { id: "pet_kavunotto", type: "pet", name: "Кавунотто Крокодило", price: 1500, league: 2, rarity: "epic", move: "ground" },
    { id: "pet_pelmenino", type: "pet", name: "Пельменіно Пінгвіно", price: 5000, league: 3, rarity: "legendary", move: "ground" },
    { id: "pet_ufo", type: "pet", name: "Міні-НЛО", price: 5500, league: 3, rarity: "legendary", move: "fly" },
    { id: "pet_drone", type: "pet", name: "Робот-дрон", price: 6000, league: 3, rarity: "legendary", move: "fly" },
    { id: "pet_bubliko", type: "pet", name: "Бубліко Жирафіно", price: 6500, league: 3, rarity: "legendary", move: "ground" },
    { id: "pet_capibaro_mandarino", type: "pet", name: "Капібаро Мандаріно", price: 12000, league: 4, rarity: "mythic", move: "ground" },
    { id: "pet_tapochkino", type: "pet", name: "Тапочкіно Акуліно", price: 15000, league: 4, rarity: "mythic", move: "swim" },
    { id: "pet_phoenix", type: "pet", name: "Фенікс-пташеня", price: 7000, rarity: "legendary", move: "fly", legendary: true, requirement: { kind: "clears", target: 20 } },
    { id: "pet_klaviatoro", type: "pet", name: "Клавіаторо Равліко", price: 9000, rarity: "brainrot", move: "ground", legendary: true, requirement: { kind: "achievements", target: 20 } },
    // Секретні улюбленці: не продаються, випадають лише із «свого» сундука (поле secret)
    { id: "pet_bobrani", type: "pet", name: "Пилоріно Бобрані", price: 3000, rarity: "secret", move: "ground", secret: "wood" },
    { id: "pet_tapko_sahur", type: "pet", name: "Тапко Тапкіні Сахуріно", price: 3000, rarity: "secret", move: "ground", secret: "wood" },
    { id: "pet_banan_gangstero", type: "pet", name: "Банан Бананіно Гангстеро", price: 3000, rarity: "secret", move: "ground", secret: "wood" },
    { id: "pet_hotdog", type: "pet", name: "Хот-Догоні Такса", price: 3000, rarity: "secret", move: "ground", secret: "wood" },
    { id: "pet_skibidino", type: "pet", name: "Унітазо Скібідіно", price: 3000, rarity: "secret", move: "ground", secret: "wood" },
    { id: "pet_kartoplino", type: "pet", name: "Картопліно Бульбоні", price: 3000, rarity: "secret", move: "ground", secret: "wood" },
    { id: "pet_akuloni", type: "pet", name: "Акулоні Турбоні", price: 8000, rarity: "secret", move: "swim", secret: "silver" },
    { id: "pet_kavun_bomboni", type: "pet", name: "Кавуноні Бомбоні", price: 8000, rarity: "secret", move: "ground", secret: "silver" },
    { id: "pet_ballerino", type: "pet", name: "Капучино Балеріно", price: 8000, rarity: "secret", move: "ground", secret: "silver" },
    { id: "pet_shimpanzini", type: "pet", name: "Шимпанзіні Бананіні", price: 8000, rarity: "secret", move: "ground", secret: "silver" },
    { id: "pet_pelmen_mafiozo", type: "pet", name: "Пельменіно Мафіозо", price: 8000, rarity: "secret", move: "ground", secret: "silver" },
    { id: "pet_fridge", type: "pet", name: "Фрідж Холодоні", price: 8000, rarity: "secret", move: "ground", secret: "silver" },
    { id: "pet_borshchelino", type: "pet", name: "Борщеліно Драконіно", price: 20000, rarity: "secret", move: "fly", secret: "gold" },
    { id: "pet_bombardino", type: "pet", name: "Бомбардіно Крокодило", price: 20000, rarity: "secret", move: "fly", secret: "gold" },
    { id: "pet_traktorino", type: "pet", name: "Трактор Тракторіно Мегазорд", price: 20000, rarity: "secret", move: "ground", secret: "gold" },
    { id: "pet_goldoni", type: "pet", name: "Голд Голдоні Слиткоіно", price: 20000, rarity: "secret", move: "ground", secret: "gold" },
    { id: "pet_shaurmino", type: "pet", name: "Дракон Шаурміно", price: 20000, rarity: "secret", move: "ground", secret: "gold" },
    { id: "pet_borgini", type: "pet", name: "Боргіні Кіборгіні", price: 20000, rarity: "secret", move: "ground", secret: "gold" },
    // Секретні улюбленці світів: випадають лише із сундуків, виграних у своєму світі (поле world)
    { id: "pet_kubo_kriperino", type: "pet", name: "Кубо Кріперіно", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "block_village" },
    { id: "pet_flamingo", type: "pet", name: "Фламінго Рожевіно", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "sunset_city" },
    { id: "pet_raptor_raketoni", type: "pet", name: "Раптор Ракетоні", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "cosmodrome" },
    { id: "pet_motocyclino", type: "pet", name: "Мотоцикліно Ящероні", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "neon_highway" },
    { id: "pet_idol", type: "pet", name: "Ідол Кам'яно", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "jungle_temple" },
    { id: "pet_glitcho", type: "pet", name: "Глітчо Лисоні", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "digital_forest" },
    { id: "pet_gromoni", type: "pet", name: "Громоні Хмароні", price: 8000, rarity: "secret", move: "fly", secret: "world", world: "storm_sky" },
    { id: "pet_kristalozavr", type: "pet", name: "Кристалозавр", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "crystal_cave" },
    { id: "pet_tirex", type: "pet", name: "Тірекс Мікроні", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "dino_valley" },
    { id: "pet_skeletoni", type: "pet", name: "Скелетоні Скейтоні", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "pixel_night" },
    { id: "pet_agent_homiakoni", type: "pet", name: "Агент Хом'яконі", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "secret_base" },
    { id: "pet_klouno", type: "pet", name: "Клоуно Страшиліно", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "luna_park" },
    { id: "pet_roboakulo", type: "pet", name: "Робоакуло Заводоні", price: 8000, rarity: "secret", move: "swim", secret: "world", world: "sea_fabricator" },
    { id: "pet_dvoholovo", type: "pet", name: "Двоголово Інопланетоні", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "twin_sun_planet" },
    { id: "pet_dyryzhabloni", type: "pet", name: "Дирижаблоні Китоні", price: 8000, rarity: "secret", move: "fly", secret: "world", world: "sky_city" },
    { id: "pet_golkiperoni", type: "pet", name: "Голкіпероні М'ячоні", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "stadium" },
    { id: "pet_ninja_ravlino", type: "pet", name: "Ніндзя Равліно", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "neon_rooftops" },
    { id: "pet_yakorino", type: "pet", name: "Якоріно Крабоні", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "night_harbor" },
    { id: "pet_krakeno", type: "pet", name: "Кракено Піратоні", price: 8000, rarity: "secret", move: "swim", secret: "world", world: "pirate_bay" },
    { id: "pet_mimik", type: "pet", name: "Мімік Сундуконі", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "treasury" },
    { id: "pet_astronavto", type: "pet", name: "Астронавто Котоні", price: 8000, rarity: "secret", move: "fly", secret: "world", world: "orbit_view" },
    { id: "pet_drakon_skarboni", type: "pet", name: "Дракончик Скарбоні", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "dragon_lair" },
    { id: "pet_krotoni", type: "pet", name: "Кротоні Бурові", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "pixel_cave" },
    { id: "pet_bekonino", type: "pet", name: "Лицар Беконіно", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "knight_castle" },
    { id: "pet_pingvino_snow", type: "pet", name: "Пінгвіно Сноубордіно", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "pixel_snow" },
    { id: "pet_meduzoni", type: "pet", name: "Медузоні Тріоко", price: 8000, rarity: "secret", move: "swim", secret: "world", world: "pixel_ocean" },
    { id: "pet_kaktusoni", type: "pet", name: "Кактусоні Мачете", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "pixel_desert" },
    { id: "pet_ostrivoni", type: "pet", name: "Острівоні Черепахоні", price: 8000, rarity: "secret", move: "fly", secret: "world", world: "pixel_islands" },
    { id: "pet_chornodiro", type: "pet", name: "Чорнодіро Вакуумоні", price: 8000, rarity: "secret", move: "fly", secret: "world", world: "black_hole" },
    { id: "pet_angelo_gusoni", type: "pet", name: "Ангело Гусоні", price: 8000, rarity: "secret", move: "fly", secret: "world", world: "sky_citadel" },
    { id: "pet_demonino", type: "pet", name: "Демоніно Лавіні", price: 8000, rarity: "secret", move: "ground", secret: "world", world: "pixel_nether" },
    // Ультра-секретний: з'являється сам, коли зібрано всіх інших секретних
    { id: "pet_fusion", type: "pet", name: "Мега Брейнроті Фьюжн", price: 50000, rarity: "ultra", move: "fly", secret: "fusion" }
];

export const SHOP_TYPES = [
    { type: "skin", name: "Скіни" },
    { type: "trail", name: "Шлейфи" },
    { type: "explosion", name: "Вибухи" },
    { type: "accessory", name: "Аксесуари" },
    { type: "weapon", name: "Зброя" },
    { type: "pet", name: "Улюбленці" }
];

// Безкоштовний товар кожного типу (надітий за замовчуванням).
// Улюбленців тут немає: їх може бути кілька, вони зберігаються окремим списком (save.getEquippedPets)
export const DEFAULT_ITEMS = { trail: "trail_default", explosion: "boom_default", accessory: "acc_none", weapon: "weapon_none" };

export function getShopItem(id) {
    for (const item of SHOP_ITEMS) {
        if (item.id === id) {
            return item;
        }
    }
    return null;
}

// Товар-скін за ключем малювальника (null — це не магазинний скін)
export function getShopSkinByRenderType(renderType) {
    for (const item of SHOP_ITEMS) {
        if (item.type === "skin" && item.renderType === renderType) {
            return item;
        }
    }
    return null;
}

// Реекспорт: інші модулі імпортують усе магазинне з shop.js
export { ACCESSORY_PERKS, EXPLOSION_PERKS, FIRST_CLEAR_BONUS, GOLD_BONUS, LEAGUE_COIN_MULT, SHOP_SKIN_PERK_STEPS, SILVER_BONUS, SKIN_HEART_PERKS, SKIN_PERFECT_BONUS, SKIN_PERK_TIERS, SKIN_SERIES_MULT, SKIN_WORDS_MULT, TRAIL_PERKS, accessoryPerk, accessoryPerkText, basePrice, computeReward, explosionWindowBonus, itemPerkHint, itemPerkText, levelSkinPerkHint, rewardMultiplier, seriesBonus, shopSkinPerkValue, shopTabHints, skinPerk, skinPerkText, skinPerkValue, trailSlowdown, weaponCoinBonus } from "./shop_rewards.js";
export { EXPLOSION_DURATION, coinsText, drawCoinIcon, drawExplosion, drawHeartLife, drawTrail, heartsText } from "./shop_effects.js";
export { drawAccessory } from "./shop_accessories.js";
export { MAX_PET_SLOTS, PET_MUTATIONS, PET_MUTATION_KEYS, SECRET_CHEST_SOURCES, SECRET_PET_CHANCE, SECRET_PITY_MAX, SECRET_PITY_STEP, SECRET_WORLD_CHANCE, secretPetSource, PET_MUTATION_CHANCE, PET_MUTATE_OWNED_CHANCE, PET_PERK_CAPS, PET_PERK_HINTS, PET_RARITIES, PET_SLOTS, isWaterTheme, petPerk, petPerkHint, petPerkLines, petPerkText, petPerkTotals, petRarity, petRarityColor, petTotalsLines, rollPetMutation } from "./shop_pets.js";
export { drawPet, drawPetAura } from "./pets_draw.js";
export { CHEST_PITY_WINS, CHEST_TYPES, NON_SKIN_ITEM_KEEP, REPLAY_CHEST_CHANCE, chestItemPool, chestsForVictory, drawChest, itemRarity, rollChest, rollSecretPet, secretPetPool, shopTierLeague } from "./shop_chests.js";

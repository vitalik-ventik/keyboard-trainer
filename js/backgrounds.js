// ============================================================
// backgrounds.js — точка входу процедурних фонів рівнів.
// Сам код розкладено по модулях у js/backgrounds/: core.js — BackgroundRenderer,
// частинки й реєстри тем; helpers.js — спільні хелпери; решта — світи, сюжети, ефекти.
// Порядок імпортів нижче — це порядок реєстрації світів; нові модулі додавати в кінець
// (а також у список MODULES в index.html і preview.html).
// ============================================================

import "./backgrounds/core.js";
import "./backgrounds/helpers.js";
import "./backgrounds/pixel_worlds.js";
import "./backgrounds/nether.js";
import "./backgrounds/neon_city.js";
import "./backgrounds/village_sunset_cosmodrome.js";
import "./backgrounds/jungle_forest_storm.js";
import "./backgrounds/crystal_dino_base_luna.js";
import "./backgrounds/fabricator_twinsun_skycity_stadium.js";
import "./backgrounds/treasury_dragon_castle.js";
import "./backgrounds/blackhole_citadel_pirate_orbit.js";
import "./backgrounds/effects.js";
import "./backgrounds/story.js";
import "./backgrounds/names_finish_weather.js";
import "./backgrounds/pumpkin_creeper_redstone_freighter.js";
import "./backgrounds/hunter_swamp_dungeon_hive.js";
import "./backgrounds/desert_forge_colony_ship_obsidian.js";
import "./backgrounds/hangar_bay.js";
import "./backgrounds/monsters.js";
import "./backgrounds/living_worlds.js";
import "./backgrounds/sponge_ninja_machines.js";
import "./backgrounds/kaiju_strange_leaf.js";

export { BackgroundRenderer } from "./backgrounds/core.js";

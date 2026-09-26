// ============================================================
// skin_renderers.js — реєстр SKIN_RENDERERS: скіни рівнів (skin_renderers_1.js,
// skin_renderers_2.js), скіни з магазину й нових рівнів Ліги 1
// ============================================================

import { SHOP_SKIN_RENDERERS } from "./shop_skins.js";
import { EXTRA_LEVEL_SKINS } from "./level_skins_extra.js";
import { LEVEL_SKINS_1 } from "./skin_renderers_1.js";
import { LEVEL_SKINS_2 } from "./skin_renderers_2.js";

export const SKIN_RENDERERS = Object.assign({}, LEVEL_SKINS_1, LEVEL_SKINS_2);

// Скіни з магазину малюються так само, як скіни рівнів
Object.assign(SKIN_RENDERERS, SHOP_SKIN_RENDERERS);
// Скіни нових рівнів Ліги 1
Object.assign(SKIN_RENDERERS, EXTRA_LEVEL_SKINS);

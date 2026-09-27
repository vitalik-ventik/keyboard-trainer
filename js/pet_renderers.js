// ============================================================
// pet_renderers.js — реєстр PET_RENDERERS: малювальники улюбленців, зібрані з частин
// (pet_renderers_1.js — перші улюбленці, pet_renderers_2.js — земні й плавучі другого
// етапу та брейнроти, pet_renderers_3.js — летючі й Борщеліно, pet_renderers_4…6.js —
// секретні брейнроти дерев'яного, срібного й золотого сундуків, pet_renderers_7…8.js —
// секретні улюбленці світів). Ключ = id товару.
// Кожен малює улюбленця з центром у (0, 0), лапи стоять на y = s / 2, дивиться праворуч.
// fn(ctx, s, t, o): s — розмір, t — час у мс (0 — нерухомий кадр),
// o — { mood: "happy" | "sad" | "oops" | "combo" | null, moving, happyT (0…1) }
// ============================================================

import { PET_RENDERERS_1 } from "./pet_renderers_1.js";
import { PET_RENDERERS_2 } from "./pet_renderers_2.js";
import { PET_RENDERERS_3 } from "./pet_renderers_3.js";
import { PET_RENDERERS_4 } from "./pet_renderers_4.js";
import { PET_RENDERERS_5 } from "./pet_renderers_5.js";
import { PET_RENDERERS_6 } from "./pet_renderers_6.js";
import { PET_RENDERERS_7 } from "./pet_renderers_7.js";
import { PET_RENDERERS_8 } from "./pet_renderers_8.js";

export const PET_RENDERERS = Object.assign({}, PET_RENDERERS_1, PET_RENDERERS_2, PET_RENDERERS_3, PET_RENDERERS_4, PET_RENDERERS_5, PET_RENDERERS_6, PET_RENDERERS_7, PET_RENDERERS_8);

// ============================================================
// engine_pets.js — методи Engine для улюбленців (підключаються в engine.js):
// зграя біжить за кубиком, повторюючи його шлях, радіє «Ідеально» й ударам зброї,
// сумує після вибуху; спорядження під зброю малює pet_gear.js
// ============================================================

import { drawPet, drawPetAura, getShopItem, isWaterTheme } from "./shop.js";
import { CUBE_SIZE, SPIKE_H } from "./game_constants.js";
import { save } from "./save.js";

// Розмір улюбленця й відстані в зграї (у пікселях траси):
// улюбленці помітно менші за кубик, як в інших іграх
const PET_SIZE = CUBE_SIZE * 0.45;
const PET_FIRST_OFFSET = CUBE_SIZE * 1.1;
const PET_GAP = PET_SIZE * 1.4;
// Скільки триває радість після «Ідеально» (с) і на скільки пізніше радіє кожен наступний
const PET_HAPPY_TIME = 0.8;
const PET_HAPPY_STAGGER = 0.12;
// Серія, з якої улюбленці «загоряються»
const PET_COMBO_GLOW = 5;

// Улюбленці: зграя з місць у магазині
class EnginePets {
    initPets() {
        const list = save.getEquippedPets();
        this.pets = [];
        for (let i = 0; i < list.length; i++) {
            const item = getShopItem(list[i].id);
            if (!item) {
                continue;
            }
            this.pets.push({
                id: list[i].id,
                mutation: list[i].mutation,
                swims: item.move === "swim",
                flies: item.move === "fly",
                offset: PET_FIRST_OFFSET + this.pets.length * PET_GAP,
                y: 0,
                happy: 0
            });
        }
        // Шлях кубика: { x, y } — улюбленець у точці x бере висоту, на якій там був кубик,
        // тож перестрибує ті самі шипи
        this.petPath = [];
        this.petWater = isWaterTheme(this.level.bgTheme);
    }

    // Висота кубика в точці траси x (лінійно між записаними точками)
    petPathHeight(x) {
        const path = this.petPath;
        if (path.length === 0 || x <= path[0].x) {
            return 0;
        }
        for (let i = path.length - 1; i > 0; i--) {
            const a = path[i - 1];
            const b = path[i];
            if (a.x <= x) {
                if (b.x <= a.x) {
                    return b.y;
                }
                const k = Math.min(1, (x - a.x) / (b.x - a.x));
                return a.y + (b.y - a.y) * k;
            }
        }
        return path[path.length - 1].y;
    }

    updatePets(dt) {
        if (!this.pets || this.pets.length === 0) {
            return;
        }
        if (this.player.alive) {
            this.petPath.push({ x: this.player.x, y: this.player.y });
            const farthest = this.pets[this.pets.length - 1].offset + CUBE_SIZE;
            let drop = 0;
            while (drop < this.petPath.length - 2 && this.petPath[drop + 1].x < this.player.x - farthest) {
                drop++;
            }
            if (drop > 0) {
                this.petPath.splice(0, drop);
            }
        }
        for (const pet of this.pets) {
            if (this.player.alive) {
                // Летючі й так над шипами — стрибки кубика повторюють лише наполовину
                pet.y = this.petPathHeight(this.player.x - pet.offset) * (pet.flies ? 0.5 : 1);
            } else {
                // Після вибуху улюбленці опускаються на землю й сумують
                pet.y = Math.max(0, pet.y - 320 * dt);
            }
            pet.happy = Math.max(0, pet.happy - dt);
        }
    }

    // «Ідеально» або удар зброєю: улюбленці по черзі підстрибують від радості
    cheerPets() {
        if (!this.pets) {
            return;
        }
        for (let i = 0; i < this.pets.length; i++) {
            this.pets[i].happy = PET_HAPPY_TIME + i * PET_HAPPY_STAGGER;
        }
    }

    petMood(pet) {
        if (!this.player.alive) {
            return "sad";
        }
        if (this.oopsTime > 0) {
            return "oops";
        }
        if (pet.happy > 0 && pet.happy <= PET_HAPPY_TIME) {
            return "happy";
        }
        if (this.combo >= PET_COMBO_GLOW) {
            return "combo";
        }
        return null;
    }

    renderPets(ctx, groundY, anchorX) {
        if (!this.pets || this.pets.length === 0) {
            return;
        }
        const time = this.currentTime;
        // Спершу найдальші, щоб ближчі до кубика були попереду
        for (let i = this.pets.length - 1; i >= 0; i--) {
            const pet = this.pets[i];
            const mood = this.petMood(pet);
            const happyT = mood === "happy" ? 1 - pet.happy / PET_HAPPY_TIME : 0;
            const x = anchorX - pet.offset;
            // Плавучі тримаються трохи над землею (у бульбашці чи на хвилі),
            // летючі — вище за шипи й трохи гойдаються
            let lift = pet.swims ? PET_SIZE * (this.petWater ? 0.15 : 0.35) : 0;
            if (pet.flies) {
                lift = this.player.alive ? SPIKE_H * 0.85 + Math.sin(time * 0.004 + i) * PET_SIZE * 0.12 : PET_SIZE * 0.2;
            }
            if (happyT > 0) {
                lift += Math.sin(happyT * Math.PI) * PET_SIZE * 0.6;
            }
            const y = groundY - pet.y - PET_SIZE / 2 - lift;
            drawPetAura(ctx, pet.id, x, groundY - 1, PET_SIZE, time);
            ctx.save();
            ctx.translate(x, y);
            drawPet(ctx, pet.id, PET_SIZE, time, {
                mood: mood,
                moving: this.player.alive,
                happyT: happyT,
                mutation: pet.mutation,
                water: this.petWater,
                weapon: this.weaponSpec ? this.weaponId : null
            });
            ctx.restore();
        }
    }
}

export { EnginePets };

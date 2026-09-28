// ============================================================
// engine_pets.js — методи Engine для улюбленців (підключаються в engine.js):
// зграя на повідцях біжить за кубиком і тягнеться за ним у стрибку, радіє «Ідеально» й ударам зброї,
// сумує після вибуху; спорядження під зброю малює pet_gear.js
// ============================================================

import { drawPet, drawPetAura, getShopItem, isWaterTheme } from "./shop.js";
import { CUBE_SIZE, GRAVITY, SPIKE_H } from "./game_constants.js";
import { save } from "./save.js";

// Розмір улюбленця й відстані в зграї (у пікселях траси):
// улюбленці трохи менші за кубик
const PET_SIZE = CUBE_SIZE * 0.7;
const PET_FIRST_OFFSET = CUBE_SIZE * 1.35;
const PET_GAP = PET_SIZE * 1.3;
// Скільки триває радість після «Ідеально» (с) і на скільки пізніше радіє кожен наступний
const PET_HAPPY_TIME = 0.8;
const PET_HAPPY_STAGGER = 0.12;
// Серія, з якої улюбленці «загоряються»
const PET_COMBO_GLOW = 5;

// Повідці: зграя — ланцюжок, кубик тягне першого улюбленця, той — наступного.
// Довжина повідця (для малювання) трохи більша за відстань між сусідами, тож на бігу він провисає
const PET_LEASH_SLACK = 1.08;
// Тяжіння улюбленців (легше за кубик, щоб вони пливли за ним у повітрі);
// летючі майже невагомі
const PET_GRAVITY = GRAVITY * 0.75;
const PET_FLY_GRAVITY = GRAVITY * 0.3;
// Пружина, що повертає улюбленця на своє місце в зграї по горизонталі, і її гасіння
const PET_SPRING = 70;
const PET_DAMPING = 11;
// Провисання повідця: на скільки пікселів нижче тягнеться улюбленець за кожен піксель
// відстані до найвищої точки шляху кубика попереду нього
const PET_LEASH_DROOP = 0.3;
// Скільки кроків фізики на кадр — щоб повідці не «рвались» на повільних кадрах
const PET_SUBSTEPS = 4;

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
            const offset = PET_FIRST_OFFSET + this.pets.length * PET_GAP;
            this.pets.push({
                id: list[i].id,
                mutation: list[i].mutation,
                swims: item.move === "swim",
                flies: item.move === "fly",
                offset: offset,
                // Довжина повідця до попередньої ланки (кубика чи улюбленця)
                leash: (this.pets.length === 0 ? PET_FIRST_OFFSET : PET_GAP) * PET_LEASH_SLACK,
                // Положення відносно кубика: x — по горизонталі (на місці -offset), y — висота над землею
                x: -offset,
                y: 0,
                vx: 0,
                vy: 0,
                happy: 0
            });
        }
        // Шлях кубика: { x, y } — улюбленець у точці x не опускається нижче, ніж там був кубик,
        // тож перелітає ті самі шипи
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

    // Нижня межа для улюбленця в точці x: найвища точка шляху кубика між улюбленцем
    // і кубиком, опущена на провисання повідця. Улюбленець рушає вгору разом із кубиком
    // і не просідає, доки не перелетить найвищу точку, — одна плавна дуга, а не два стрибки
    petFloor(x) {
        let best = this.petPathHeight(x);
        for (const point of this.petPath) {
            if (point.x > x) {
                const h = point.y - (point.x - x) * PET_LEASH_DROOP;
                if (h > best) {
                    best = h;
                }
            }
        }
        return best;
    }

    // Один крок фізики зграї: тяжіння, пружина на своє місце й нижня межа —
    // земля, а на бігу ще й повідець (petFloor), який тягне улюбленця вгору за кубиком
    stepPets(h, tethered) {
        for (const pet of this.pets) {
            const prevY = pet.y;
            pet.vx += ((-pet.offset - pet.x) * PET_SPRING - pet.vx * PET_DAMPING) * h;
            pet.vy -= (pet.flies ? PET_FLY_GRAVITY : PET_GRAVITY) * h;
            pet.x += pet.vx * h;
            pet.y += pet.vy * h;
            pet.vy = (pet.y - prevY) / h;
            // Летючим досить половини висоти. Повідець підтягує без розгону,
            // тож на вершині улюбленець зупиняється й плавно опускається, а не підскакує
            const floor = tethered ? this.petFloor(this.player.x + pet.x) * (pet.flies ? 0.5 : 1) : 0;
            if (pet.y <= floor) {
                pet.y = floor;
                pet.vy = Math.max(0, pet.vy);
            }
        }
    }

    updatePets(dt) {
        if (!this.pets || this.pets.length === 0) {
            return;
        }
        if (this.player.alive) {
            this.petPath.push({ x: this.player.x, y: this.player.y });
            const farthest = this.pets[this.pets.length - 1].offset + CUBE_SIZE * 2;
            let drop = 0;
            while (drop < this.petPath.length - 2 && this.petPath[drop + 1].x < this.player.x - farthest) {
                drop++;
            }
            if (drop > 0) {
                this.petPath.splice(0, drop);
            }
        }
        if (dt > 0) {
            // Після вибуху повідці відпускаються: улюбленці опускаються на землю й сумують
            const h = dt / PET_SUBSTEPS;
            for (let s = 0; s < PET_SUBSTEPS; s++) {
                this.stepPets(h, this.player.alive);
            }
        }
        for (const pet of this.pets) {
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

    // Де малювати улюбленця на екрані (центр): плавучі тримаються трохи над землею
    // (у бульбашці чи на хвилі), летючі — вище за шипи й трохи гойдаються
    petScreenPos(pet, index, groundY, anchorX) {
        const time = this.currentTime;
        let lift = pet.swims ? PET_SIZE * (this.petWater ? 0.15 : 0.35) : 0;
        if (pet.flies) {
            lift = this.player.alive ? SPIKE_H * 0.85 + Math.sin(time * 0.004 + index) * PET_SIZE * 0.12 : PET_SIZE * 0.2;
        }
        if (this.petMood(pet) === "happy") {
            // Радісний підскок — лише біля землі: у повітрі улюбленця й так несе повідець
            const nearGround = Math.max(0, 1 - pet.y / (PET_SIZE * 0.5));
            lift += Math.sin((1 - pet.happy / PET_HAPPY_TIME) * Math.PI) * PET_SIZE * 0.6 * nearGround;
        }
        return { x: anchorX + pet.x, y: groundY - pet.y - PET_SIZE / 2 - lift };
    }

    // Повідці між кубиком і улюбленцями: провисають, коли ланки близько, і випрямляються в ривку
    renderPetLeashes(ctx, groundY, anchorX, points) {
        const accent = this.level.accentColor || "#00f6ff";
        let from = { x: anchorX - CUBE_SIZE * 0.35, y: groundY - this.player.y - CUBE_SIZE * 0.35 };
        ctx.save();
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        for (let i = 0; i < this.pets.length; i++) {
            const to = { x: points[i].x + PET_SIZE * 0.3, y: points[i].y };
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const sag = Math.max(0, this.pets[i].leash - dist) * 0.5 + 4;
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.quadraticCurveTo((from.x + to.x) / 2, (from.y + to.y) / 2 + sag, to.x, to.y);
            ctx.stroke();
            from = { x: points[i].x - PET_SIZE * 0.3, y: points[i].y };
        }
        ctx.restore();
    }

    renderPets(ctx, groundY, anchorX) {
        if (!this.pets || this.pets.length === 0) {
            return;
        }
        const time = this.currentTime;
        const points = [];
        for (let i = 0; i < this.pets.length; i++) {
            points.push(this.petScreenPos(this.pets[i], i, groundY, anchorX));
        }
        if (this.player.alive) {
            this.renderPetLeashes(ctx, groundY, anchorX, points);
        }
        // Спершу найдальші, щоб ближчі до кубика були попереду
        for (let i = this.pets.length - 1; i >= 0; i--) {
            const pet = this.pets[i];
            const mood = this.petMood(pet);
            const happyT = mood === "happy" ? 1 - pet.happy / PET_HAPPY_TIME : 0;
            drawPetAura(ctx, pet.id, points[i].x, groundY - 1, PET_SIZE, time);
            ctx.save();
            ctx.translate(points[i].x, points[i].y);
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

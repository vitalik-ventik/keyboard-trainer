// ============================================================
// engine_weapons.js — методи Engine для зброї кубика: звуки, руйнування шипів,
// постріли й удари, поза й малювання зброї (підключаються в engine.js)
// ============================================================

import { BOLT_TIME, MELEE_CONTACT, SWING_HIT, SWING_TIME, beamTiming, drawBeam, drawProjectile, drawStuckArrow, getWeaponSound, gravityHoldOffset, meleeTriggerGap } from "./weapons.js";
import { CUBE_SIZE, GRAVITY_PULL_AHEAD, SHAKE_TIME, SPIKE_H, SPIKE_W, spikeHalfWidth } from "./game_constants.js";
import { SPIKE_STYLE_COLORS } from "./spike_styles.js";

// Зброя кубика: звуки, руйнування шипів, постріли й удари, поза й малювання зброї
class EngineWeapons {
    // Звук зброї для події «fire» / «swing» / «hit»
    emitWeaponSound(event) {
        if (typeof this.onSound !== "function" || !this.weaponSpec) {
            return;
        }
        const cue = getWeaponSound(this.weaponId, event);
        if (cue) {
            this.onSound(cue);
        }
    }

    // Шип знищено: запускаємо анімацію руйнування й уламки під конкретну зброю
    destroySpike(spike) {
        if (spike.state === "cleared") {
            return;
        }
        const fx = this.weaponSpec ? this.weaponSpec.fx : "shatter";
        spike.state = "cleared";
        spike.clearedAt = this.currentTime;
        spike.fx = { kind: fx, t0: this.currentTime };
        this.emitWeaponSound("hit");
        const colors = SPIKE_STYLE_COLORS[this.spikeStyle] || [this.level.accentColor || "#ff2ea6", "#ffffff"];
        const base = { x: spike.x, y: SPIKE_H * 0.4, spread: SPIKE_W * 0.6, spin: 10, colors: colors, outline: true };
        if (fx === "shatter" || fx === "pop") {
            this.spawnDebris(fx === "shatter" ? 16 : 10, Object.assign(base, { angleMin: Math.PI * 0.05, angleMax: Math.PI * 0.95, speedMin: 120, speedMax: 300, sizeMin: 3, sizeMax: 7, gravity: 800, life: 0.8 }));
            if (fx === "shatter") {
                this.stuckArrows.push({ x: spike.x + SPIKE_W * 0.3, t: 0 });
            }
        } else if (fx === "split") {
            this.spawnDebris(8, Object.assign(base, { colors: ["#c8883a", "#8a5a2a", colors[0]], angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 90, speedMax: 200, sizeMin: 3, sizeMax: 5, gravity: 700, life: 0.7 }));
        } else if (fx === "slice") {
            this.spawnDebris(6, Object.assign(base, { colors: ["#ffffff", "#8ad8ff"], angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.6, speedMin: 120, speedMax: 260, sizeMin: 2, sizeMax: 4, gravity: 600, life: 0.5, outline: false }));
        } else if (fx === "crumble") {
            this.spawnDebris(8, Object.assign(base, { y: SPIKE_H * 0.15, angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 60, speedMax: 150, sizeMin: 3, sizeMax: 6, gravity: 700, life: 0.6 }));
        } else if (fx === "melt") {
            this.spawnDebris(12, Object.assign(base, { colors: ["rgba(80, 80, 90, 0.9)", "rgba(140, 140, 150, 0.8)", "#ff8a2a"], angleMin: Math.PI * 0.35, angleMax: Math.PI * 0.65, speedMin: 30, speedMax: 90, sizeMin: 2, sizeMax: 5, gravity: -120, life: 1.2, outline: false, spin: 3 }));
        } else if (fx === "blast") {
            this.spawnDebris(22, Object.assign(base, { colors: colors.concat(["#ffb81a", "#3a2a1a"]), angleMin: Math.PI * 0.05, angleMax: Math.PI * 0.95, speedMin: 200, speedMax: 480, sizeMin: 4, sizeMax: 9, gravity: 900, life: 1.1, spin: 16 }));
            if (this.cameraMotion) {
                this.shakeTime = Math.max(this.shakeTime, SHAKE_TIME * 0.6);
            }
        } else if (fx === "burn") {
            this.spawnDebris(14, Object.assign(base, { colors: ["#ffb81a", "#ff5a1a", "#ffe680", "rgba(60, 50, 50, 0.9)"], angleMin: Math.PI * 0.3, angleMax: Math.PI * 0.7, speedMin: 40, speedMax: 120, sizeMin: 2, sizeMax: 4, gravity: -140, life: 1.4, outline: false, spin: 3 }));
        } else if (fx === "saber_green" || fx === "saber_blue" || fx === "saber_red") {
            const glow = this.weaponSpec.saber || "#ffffff";
            this.spawnDebris(10, Object.assign(base, { colors: [glow, "#ffffff", colors[0]], angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.8, speedMin: 90, speedMax: 240, sizeMin: 2, sizeMax: 4, gravity: 300, life: 0.7, outline: false }));
        } else if (fx === "fireslice") {
            this.spawnDebris(12, Object.assign(base, { colors: ["#ffb81a", "#ff5a1a", "#fff4a0"], angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.8, speedMin: 90, speedMax: 240, sizeMin: 2, sizeMax: 4, gravity: 200, life: 0.8, outline: false }));
        } else if (fx === "zap") {
            this.spawnDebris(16, Object.assign(base, { colors: colors.concat(["#bff4ff", "#ffffff"]), angleMin: Math.PI * 0.05, angleMax: Math.PI * 0.95, speedMin: 140, speedMax: 340, sizeMin: 3, sizeMax: 7, gravity: 800, life: 0.8 }));
            if (this.cameraMotion) {
                this.shakeTime = Math.max(this.shakeTime, SHAKE_TIME * 0.35);
            }
        } else if (fx === "fling") {
            this.spawnDebris(10, Object.assign(base, { colors: ["#c8a8ff", "#8a6aff", "#ffffff"], angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 30, speedMax: 110, sizeMin: 2, sizeMax: 4, gravity: -60, life: 1.0, outline: false, spin: 4 }));
        } else if (fx === "plasma") {
            this.spawnDebris(16, Object.assign(base, { colors: ["#7affd8", "#3affc0", "#ffffff"], angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.9, speedMin: 60, speedMax: 200, sizeMin: 2, sizeMax: 4, gravity: -80, life: 1.0, outline: false, spin: 4 }));
        } else if (fx === "shred") {
            this.spawnDebris(10, Object.assign(base, { colors: colors.concat(["#dfe8f4"]), angleMin: Math.PI * 0.1, angleMax: Math.PI * 0.9, speedMin: 100, speedMax: 260, sizeMin: 2, sizeMax: 5, gravity: 800, life: 0.7 }));
        } else if (fx === "break") {
            this.spawnDebris(12, Object.assign(base, { angleMin: Math.PI * 0.15, angleMax: Math.PI * 0.85, speedMin: 100, speedMax: 240, sizeMin: 5, sizeMax: 9, gravity: 900, life: 0.8, spin: 6 }));
        }
        if (spike.points > 0) {
            this.scorePopups.push({ x: spike.x, y: SPIKE_H + 12, text: "+" + spike.points, life: 0.9, maxLife: 0.9, points: true });
        }
    }

    // Політ снарядів, удари ближнього бою й промінь лазера
    updateWeapons(dt) {
        this.weaponRecoil = Math.max(0, this.weaponRecoil - dt * 3.2);
        for (let i = this.attacks.length - 1; i >= 0; i--) {
            const a = this.attacks[i];
            if (a.kind === "melee") {
                if (a.stage === "wait") {
                    const gap = a.spike.x - spikeHalfWidth(a.spike.type) - this.player.x;
                    if (gap <= meleeTriggerGap(CUBE_SIZE, this.effectiveSpeed)) {
                        a.stage = "swing";
                        this.emitWeaponSound("swing");
                        a.t = 0;
                    }
                    continue;
                }
                a.t += dt;
                // Лезо влучає, коли шип дійшов майже впритул (з поправкою на пів кадру),
                // а не за таймером — тоді проміжок однаковий на будь-якій швидкості
                const hitGap = a.spike.x - spikeHalfWidth(a.spike.type) - this.player.x;
                const contactGap = CUBE_SIZE / 2 + MELEE_CONTACT + this.effectiveSpeed * dt * 0.5;
                if (!a.hit && (hitGap <= contactGap || a.t >= SWING_HIT * 2)) {
                    a.hit = true;
                    this.destroySpike(a.spike);
                    if (this.weaponSpec.bolt) {
                        // Громовий молот: у мить удару з неба б'є блискавка
                        this.attacks.push({ kind: "bolt", spike: a.spike, stage: "bolt", t: 0, hit: true });
                    }
                }
                if (a.t >= SWING_TIME) {
                    this.attacks.splice(i, 1);
                }
            } else if (a.kind === "bolt") {
                a.t += dt;
                if (a.t >= BOLT_TIME) {
                    this.attacks.splice(i, 1);
                }
            } else {
                a.t += dt;
                const timing = a.time ? { time: a.time, hit: a.hitAt } : beamTiming(this.weaponSpec);
                // Поки діє струмінь чи промінь, зброя лишається «в роботі»
                this.weaponRecoil = Math.max(this.weaponRecoil, 1 - a.t / timing.time);
                if (!a.hit && a.t >= timing.hit) {
                    a.hit = true;
                    this.destroySpike(a.spike);
                }
                if (a.t >= timing.time) {
                    this.attacks.splice(i, 1);
                }
            }
        }
        for (let i = this.shots.length - 1; i >= 0; i--) {
            const s = this.shots[i];
            s.t += dt;
            if (s.t < 0) {
                continue;
            }
            if (s.index > 0 && s.t - dt < 0) {
                // Наступна куля черги вилітає з дула — рухаємо старт разом із кубиком
                s.fromX = this.player.x + CUBE_SIZE * 0.6;
                s.dur = Math.max(0.05, (s.toX - s.fromX) / this.weaponSpec.speed);
                this.weaponRecoil = 1;
            }
            const pos = this.shotPosition(s);
            s.prev.unshift({ x: pos.x, y: pos.y });
            if (s.prev.length > 8) {
                s.prev.pop();
            }
            if (!s.returning && s.t >= s.dur) {
                if ((s.kind === "bullet" || s.kind === "shuriken") && !s.last) {
                    // Куля черги чи сюрикен відколює шматок зверху
                    s.spike.chunks = Math.max(s.spike.chunks || 0, s.index + 1);
                    this.spawnDebris(4, { x: s.spike.x, y: SPIKE_H * (1 - (s.index + 1) * 0.22), spread: SPIKE_W * 0.4, angleMin: Math.PI * 0.2, angleMax: Math.PI * 0.8, speedMin: 80, speedMax: 180, sizeMin: 3, sizeMax: 5, spin: 8, colors: SPIKE_STYLE_COLORS[this.spikeStyle] || [this.level.accentColor || "#ff2ea6"], gravity: 700, life: 0.5, outline: true });
                } else {
                    this.destroySpike(s.spike);
                }
                if (s.kind === "axe" || s.kind === "saber") {
                    // Сокира-бумеранг і світловий меч повертаються в руку
                    s.returning = true;
                    s.t = 0;
                    s.dur = 0.32;
                    s.fromX = s.toX;
                    s.fromY = s.toY;
                } else {
                    this.shots.splice(i, 1);
                }
                continue;
            }
            if (s.returning && s.t >= s.dur) {
                this.shots.splice(i, 1);
            }
        }
        for (let i = this.stuckArrows.length - 1; i >= 0; i--) {
            this.stuckArrows[i].t += dt;
            if (this.stuckArrows[i].t > 2) {
                this.stuckArrows.splice(i, 1);
            }
        }
    }

    // Позиція снаряда в ігрових координатах (y — вгору від землі)
    shotPosition(s) {
        const u = Math.min(1, Math.max(0, s.t / s.dur));
        if (s.returning) {
            // Назад — до руки кубика, що біжить уперед
            const hx = this.player.x + CUBE_SIZE * 0.5;
            const hy = CUBE_SIZE * 0.6;
            return {
                x: s.fromX + (hx - s.fromX) * u,
                y: s.fromY + (hy - s.fromY) * u + Math.sin(Math.PI * u) * 30,
                u: u
            };
        }
        return {
            x: s.fromX + (s.toX - s.fromX) * u,
            y: s.fromY + (s.toY - s.fromY) * u + Math.sin(Math.PI * u) * s.arc,
            u: u
        };
    }

    // Поза зброї в руці: замах, фаза удару, віддача, чи кинуто сокиру
    weaponPose() {
        let raise = 0;
        let swing = -1;
        for (const a of this.attacks) {
            if (a.kind !== "melee") {
                continue;
            }
            if (a.stage === "wait") {
                raise = 1;
            } else {
                swing = Math.max(swing, a.t / SWING_TIME);
            }
        }
        let away = false;
        for (const s of this.shots) {
            if (s.kind === "axe" || s.kind === "saber") {
                away = true;
            }
        }
        return { raise: raise, swing: swing, recoil: this.weaponRecoil, away: away };
    }

    // Снаряди, промінь лазера й стріли в землі
    renderWeapons(ctx, groundY, anchorX, camX) {
        if (!this.weaponSpec) {
            return;
        }
        const time = this.currentTime;
        for (const arrow of this.stuckArrows) {
            drawStuckArrow(ctx, anchorX + arrow.x - camX, groundY, arrow.t, CUBE_SIZE);
        }
        for (const a of this.attacks) {
            if (a.kind === "beam") {
                const x1 = anchorX + CUBE_SIZE * 0.6 + CUBE_SIZE * 0.08;
                const y1 = groundY - this.player.y - CUBE_SIZE / 2 - CUBE_SIZE * 0.03;
                let x2 = anchorX + a.spike.x - camX;
                let y2 = groundY - SPIKE_H * 0.45;
                if (this.weaponSpec.beam === "gravity" && a.spike.fx) {
                    // Кінець променя тримає шип, що піднімається й підтягується до кубика
                    const hold = gravityHoldOffset((this.currentTime - a.spike.fx.t0) / 1000, SPIKE_H, anchorX + CUBE_SIZE * GRAVITY_PULL_AHEAD - x2);
                    x2 += hold.dx;
                    y2 += hold.dy;
                }
                const beamTime = a.time || beamTiming(this.weaponSpec).time;
                drawBeam(ctx, this.weaponSpec.beam, x1, y1, x2, y2, a.t / beamTime, time, a.time ? a.hitAt / a.time : undefined);
            } else if (a.kind === "bolt") {
                const bx = anchorX + a.spike.x - camX;
                const by = groundY - SPIKE_H * 0.45;
                drawBeam(ctx, "thunder", bx, by, bx, by, a.t / BOLT_TIME, time);
            }
        }
        for (const s of this.shots) {
            if (s.t < 0) {
                continue;
            }
            const pos = this.shotPosition(s);
            const prev = s.prev.length > 1 ? s.prev[1] : { x: s.fromX, y: s.fromY };
            const angle = Math.atan2(-(pos.y - prev.y), pos.x - prev.x);
            const trail = s.prev.map(function (p) { return { x: anchorX + p.x - camX, y: groundY - p.y }; });
            drawProjectile(ctx, s.kind, anchorX + pos.x - camX, groundY - pos.y, angle, s.t, CUBE_SIZE, trail, s.color);
        }
    }
}

export { EngineWeapons };

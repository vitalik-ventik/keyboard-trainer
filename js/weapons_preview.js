// ============================================================
// weapons_preview.js — прев'ю зброї в магазині
// ============================================================

import { drawHeldWeapon } from "./weapons_held.js";
import { drawBeam, drawProjectile } from "./weapons_projectiles.js";
import { drawSpikeDestruction } from "./weapons_destruction.js";
import { BOLT_TIME, GRAVITY_LIFT, SWING_HIT, SWING_TIME, WEAPON_SPECS, beamTiming, gravityGrabTime, gravityHoldOffset, meleeTriggerGap } from "./weapons.js";

// ---------- Прев'ю зброї в магазині ----------

// Простий неоновий шип для прев'ю
function drawPreviewSpike(ctx, x, groundY, hw, h) {
    ctx.fillStyle = "#4a1030";
    ctx.strokeStyle = "#ff2ea6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - hw, groundY);
    ctx.lineTo(x, groundY - h);
    ctx.lineTo(x + hw, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// Зациклена сценка: шип під'їжджає, кубик атакує, шип руйнується.
// drawCube(ctx, size) малює кубик гравця в локальних координатах.
// План зацикленої сценки: коли натиснуто літеру (press), коли почався мах (swingAt),
// коли шип знищено (hitAt), як летить снаряд і скільки триває промінь
function planWeaponDemo(id, w, h, time) {
    const spec = WEAPON_SPECS[id];
    const groundY = h * 0.82;
    const s = 30;
    const scale = s / 42;
    const cubeX = 30;
    const hw = 13;
    const sh = 28;
    const cycle = 2.8;
    const u = (time / 1000) % cycle;
    const spikeSpeed = 45;
    const spikeAt = function (tt) { return w + 10 - spikeSpeed * tt; };
    let press = 0.7;
    // Сокира через раз показує обидва прийоми: кидок здалеку й удар зблизька
    if (spec && spec.mode === "axe" && Math.floor(time / 1000 / cycle) % 2 === 1) {
        press = (w + 10 - hw - cubeX - spec.reach * scale * 0.7) / spikeSpeed;
    }
    const muzzleX = cubeX + s * 0.6;
    const muzzleY = groundY - s * 0.55;

    // Коли шип буде знищено (hitAt) і як летить снаряд
    let hitAt = Infinity;
    let demoBeam = null;
    let swingAt = -1;
    let flight = null;
    if (spec) {
        const reach = spec.reach ? spec.reach * scale : 0;
        // Відстані рахуються від центру кубика до ближнього краю шипа, як у грі
        const gapAtPress = spikeAt(press) - hw - cubeX;
        if (spec.mode === "melee" || (spec.mode === "axe" && gapAtPress <= reach)) {
            swingAt = Math.max(press, (w + 10 - hw - cubeX - meleeTriggerGap(s, spikeSpeed)) / spikeSpeed);
            hitAt = swingAt + SWING_HIT;
        } else if (spec.mode === "beam") {
            demoBeam = spec.beam === "gravity"
                ? { hit: gravityGrabTime(spikeAt(press) - muzzleX), time: gravityGrabTime(spikeAt(press) - muzzleX) + GRAVITY_LIFT }
                : beamTiming(spec);
            hitAt = press + demoBeam.hit;
        } else {
            const tx = spikeAt(press);
            const dur = Math.max(0.08, (tx - muzzleX) / (spec.speed * 0.45));
            const count = spec.mode === "burst" ? spec.count : 1;
            flight = { tx: tx, dur: dur, count: count, gap: spec.gap || 0 };
            hitAt = press + dur + (count - 1) * (spec.gap || 0);
        }
    }
    return {
        spec: spec, groundY: groundY, s: s, scale: scale, cubeX: cubeX, hw: hw, sh: sh,
        cycle: cycle, u: u, spikeSpeed: spikeSpeed, spikeAt: spikeAt, press: press,
        muzzleX: muzzleX, muzzleY: muzzleY, hitAt: hitAt, demoBeam: demoBeam,
        swingAt: swingAt, flight: flight
    };
}

// Події сценки для звуку в preview: «fire» — постріл/кидок/промінь, «swing» — мах,
// «hit» — шип знищено. at — секунди від початку циклу, cycleIndex — номер циклу.
export function weaponDemoEvents(id, time) {
    const plan = planWeaponDemo(id, 150, 100, time);
    const events = [];
    if (plan.spec) {
        if (plan.swingAt >= 0) {
            events.push({ at: plan.swingAt, event: "swing" });
        } else {
            events.push({ at: plan.press, event: "fire" });
        }
        if (plan.hitAt < Infinity) {
            events.push({ at: plan.hitAt, event: "hit" });
        }
    }
    return { cycleIndex: Math.floor(time / 1000 / plan.cycle), cycle: plan.cycle, u: plan.u, events: events };
}

// Зациклена сценка: шип під'їжджає, кубик атакує, шип руйнується.
// drawCube(ctx, size) малює кубик гравця в локальних координатах.
export function drawWeaponDemo(ctx, id, w, h, time, drawCube) {
    const plan = planWeaponDemo(id, w, h, time);
    const { spec, groundY, s, scale, cubeX, hw, sh, u, spikeAt, press, muzzleX, muzzleY, hitAt, demoBeam, swingAt, flight } = plan;
    const spikeX = u < hitAt ? spikeAt(u) : spikeAt(hitAt);

    // Шип або його руйнування
    if (u < hitAt || !spec) {
        let chunks = 0;
        if (flight && flight.count > 1) {
            for (let i = 0; i < flight.count - 1; i++) {
                if (u >= press + flight.dur + i * flight.gap) {
                    chunks = i + 1;
                }
            }
        }
        ctx.save();
        if (chunks > 0) {
            ctx.beginPath();
            ctx.rect(0, groundY - sh * (1 - chunks * 0.22), w, h);
            ctx.clip();
        }
        drawPreviewSpike(ctx, spikeX, groundY, hw, sh);
        ctx.restore();
    } else {
        drawSpikeDestruction(ctx, spec.fx, u - hitAt, spikeX, groundY, hw, sh, function (c) {
            drawPreviewSpike(c, spikeX, groundY, hw, sh);
        }, { pullX: cubeX + s * 1.6 });
    }

    // Снаряди та промінь
    let away = false;
    let recoil = 0;
    if (spec && flight) {
        for (let i = 0; i < flight.count; i++) {
            const t0 = press + i * flight.gap;
            const ft = u - t0;
            if (ft >= 0 && ft < 0.3) {
                recoil = Math.max(recoil, 1 - ft / 0.3);
            }
            if (ft < 0) {
                continue;
            }
            const kind = spec.mode === "axe" ? (spec.saber ? "saber" : "axe") : spec.projectile;
            let px;
            let py;
            if (ft <= flight.dur) {
                const k = ft / flight.dur;
                px = muzzleX + (flight.tx - muzzleX) * k;
                py = muzzleY + (groundY - sh * 0.4 - muzzleY) * k - Math.sin(Math.PI * k) * (spec.arc || 0) * scale;
            } else if ((kind === "axe" || kind === "saber") && ft <= flight.dur + 0.32) {
                const k = (ft - flight.dur) / 0.32;
                px = flight.tx + (muzzleX - flight.tx) * k;
                py = groundY - sh * 0.4 + (muzzleY - (groundY - sh * 0.4)) * k - Math.sin(Math.PI * k) * 20;
            } else {
                continue;
            }
            if (kind === "axe" || kind === "saber") {
                away = true;
            }
            drawProjectile(ctx, kind, px, py, 0, ft, s, null, spec.saber);
        }
    }
    if (spec && spec.bolt && u >= hitAt && u < hitAt + BOLT_TIME) {
        drawBeam(ctx, "thunder", spikeX, groundY - sh * 0.45, spikeX, groundY - sh * 0.45, (u - hitAt) / BOLT_TIME, time);
    }
    if (spec && spec.mode === "beam" && demoBeam) {
        const bt = demoBeam.time;
        if (u >= press && u < press + bt) {
            const endX = u > hitAt ? spikeX : spikeAt(press);
            const hold = spec.beam === "gravity" && u > hitAt ? gravityHoldOffset(u - hitAt, sh, cubeX + s * 1.6 - endX) : { dx: 0, dy: 0 };
            drawBeam(ctx, spec.beam, muzzleX + s * 0.08, muzzleY, endX + hold.dx, groundY - sh * 0.45 + hold.dy, (u - press) / bt, time, demoBeam.hit / demoBeam.time);
            recoil = 1 - (u - press) / bt;
        }
    }

    // Кубик зі зброєю
    let raise = 0;
    let swing = -1;
    if (swingAt >= 0) {
        if (u >= press && u < swingAt) {
            raise = 1;
        } else if (u >= swingAt && u < swingAt + SWING_TIME) {
            swing = (u - swingAt) / SWING_TIME;
        }
    }
    ctx.save();
    ctx.translate(cubeX, groundY - s / 2);
    drawCube(ctx, s);
    drawHeldWeapon(ctx, id, s, { raise: raise, swing: swing, recoil: recoil, away: away }, time);
    ctx.restore();
}

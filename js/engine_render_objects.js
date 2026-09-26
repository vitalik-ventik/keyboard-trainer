// ============================================================
// engine_render_objects.js — методи Engine для малювання об'єктів: шипи, пилка,
// перешкоди, кубик, смуга прогресу, частинки, уламки, спливаючі написи (підключаються в engine.js)
// ============================================================

import { drawAccessory, drawCoinIcon, drawTrail } from "./shop.js";
import { DESTRUCTION_TIME, drawHeldWeapon, drawSpikeDestruction } from "./weapons.js";
import { ALL_LEVELS } from "./levels.js";
import { drawAchievementFrame } from "./skins.js";
import { SKIN_RENDERERS } from "./skin_renderers.js";
import { COMBO_BONUS, CUBE_SIZE, GRAVITY_PULL_AHEAD, PERFECT_FLASH_TIME, POINTS_COLOR, SPIKE_CRUMBLE_TIME, SPIKE_H, SPIKE_POP_DISTANCE, SPIKE_W, WORD_BONUS, spikeHalfWidth } from "./game_constants.js";
import { save } from "./save.js";
import { drawKeycap, drawStyledSpikeShape } from "./spike_styles.js";

// Малювання об'єктів: шипи, пилка, перешкоди, кубик, смуга прогресу, частинки, уламки, спливаючі написи
class EngineRenderObjects {
    // ---------- Перешкоди (3 типи) ----------

    drawSpike(ctx, screenX, groundY, accentColor, cleared) {
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        var glowR = cleared ? 20 : 40;
        var glowGrad = ctx.createRadialGradient(screenX, groundY - SPIKE_H * 0.4, 4, screenX, groundY - SPIKE_H * 0.4, glowR);
        glowGrad.addColorStop(0, color);
        glowGrad.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = glowGrad;
        ctx.fillRect(screenX - glowR, groundY - SPIKE_H - glowR * 0.5, glowR * 2, SPIKE_H + glowR);
        ctx.globalAlpha = 1;
        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.8)" : "#4a1030";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(screenX - SPIKE_W / 2, groundY);
        ctx.lineTo(screenX, groundY - SPIKE_H);
        ctx.lineTo(screenX + SPIKE_W / 2, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawDoubleSpike(ctx, screenX, groundY, accentColor, cleared) {
        const offset = SPIKE_W * 0.45;
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        var glowR = cleared ? 18 : 36;
        var glowGrad = ctx.createRadialGradient(screenX, groundY - SPIKE_H * 0.4, 4, screenX, groundY - SPIKE_H * 0.4, glowR);
        glowGrad.addColorStop(0, color);
        glowGrad.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = glowGrad;
        ctx.fillRect(screenX - glowR - offset, groundY - SPIKE_H - glowR * 0.5, (glowR + offset) * 2, SPIKE_H + glowR);
        ctx.globalAlpha = 1;
        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.8)" : "#4a1030";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(screenX - offset - SPIKE_W / 2, groundY);
        ctx.lineTo(screenX - offset, groundY - SPIKE_H);
        ctx.lineTo(screenX - offset + SPIKE_W / 2, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(screenX + offset - SPIKE_W / 2, groundY);
        ctx.lineTo(screenX + offset, groundY - SPIKE_H);
        ctx.lineTo(screenX + offset + SPIKE_W / 2, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawSaw(ctx, screenX, groundY, radius, rotationAngle, accentColor, cleared) {
        const centerY = groundY - radius;
        const color = cleared ? "rgba(57, 255, 136, 0.5)" : accentColor;
        const teeth = 8;

        var glowR = cleared ? radius * 0.8 : radius * 1.2;
        var glowGrad = ctx.createRadialGradient(screenX, centerY, radius * 0.2, screenX, centerY, glowR);
        glowGrad.addColorStop(0, color);
        glowGrad.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(screenX, centerY, glowR, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.translate(screenX, centerY);
        ctx.rotate(rotationAngle);

        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.8)" : "#301030";
        ctx.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
            const angle = (i / (teeth * 2)) * Math.PI * 2;
            const r = i % 2 === 0 ? radius : radius * 0.65;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Світні кінчики зубців і «слід» обертання
        if (!cleared) {
            ctx.fillStyle = "#ffffff";
            for (let i = 0; i < teeth; i++) {
                const angle = (i / teeth) * Math.PI * 2;
                ctx.fillRect(Math.cos(angle) * radius - 1.5, Math.sin(angle) * radius - 1.5, 3, 3);
            }
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 1.12, 0, Math.PI * 0.6);
            ctx.moveTo(Math.cos(Math.PI) * radius * 1.12, Math.sin(Math.PI) * radius * 1.12);
            ctx.arc(0, 0, radius * 1.12, Math.PI, Math.PI * 1.6);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        ctx.fillStyle = cleared ? "rgba(20, 60, 40, 0.6)" : "rgba(20, 10, 20, 0.9)";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }

    // Тіло перешкоди (шип, подвійний шип або пилка) у стилі світу
    drawObstacleBody(ctx, spike, screenX, groundY, accentColor, cleared) {
        if (spike.type === "saw") {
            this.drawSaw(ctx, screenX, groundY, SPIKE_H * 0.6, spike.rotationAngle || 0, accentColor, cleared);
        } else if (this.spikeStyle === "neon") {
            if (spike.type === "double_spike") {
                this.drawDoubleSpike(ctx, screenX, groundY, accentColor, cleared);
            } else {
                this.drawSpike(ctx, screenX, groundY, accentColor, cleared);
            }
        } else {
            const offsets = spike.type === "double_spike" ? [-SPIKE_W * 0.45, SPIKE_W * 0.45] : [0];
            // «Небезпечна» аура: перешкоду завжди видно на тлі схожих декорацій світу
            if (!cleared) {
                const auraW = spike.type === "double_spike" ? SPIKE_W * 1.6 : SPIKE_W;
                const aura = ctx.createRadialGradient(screenX, groundY - SPIKE_H * 0.35, 4, screenX, groundY - SPIKE_H * 0.35, auraW);
                aura.addColorStop(0, "rgba(255, 40, 80, 0.45)");
                aura.addColorStop(1, "rgba(255, 40, 80, 0)");
                ctx.fillStyle = aura;
                ctx.fillRect(screenX - auraW, groundY - SPIKE_H * 1.3, auraW * 2, SPIKE_H * 1.3);
            }
            for (const off of offsets) {
                ctx.save();
                ctx.translate(screenX + off, groundY);
                drawStyledSpikeShape(ctx, this.spikeStyle, accentColor, this.currentTime);
                // Червона «лінія небезпеки» біля основи
                ctx.fillStyle = "rgba(255, 40, 80, 0.85)";
                ctx.fillRect(-SPIKE_W / 2, -3, SPIKE_W, 3);
                ctx.restore();
            }
        }
    }

    renderObstacles(ctx, W, groundY, anchorX, camX) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
        const accentColor = this.level.accentColor || "#ff2ea6";
        const target = this.player.alive ? this.nearestAheadSpike() : null;
        const perfectWidth = this.perfectPx + this.okPx * 0.35;

        for (const spike of this.spikes) {
            const screenX = spike.x - camX + anchorX;
            if (screenX < -80 || screenX > W + 80) {
                continue;
            }
            const cleared = spike.state === "cleared";
            // Шип, знищений зброєю, показує свою анімацію руйнування
            if (cleared && spike.fx) {
                const ft = (this.currentTime - spike.fx.t0) / 1000;
                if (ft <= (DESTRUCTION_TIME[spike.fx.kind] || 0.5)) {
                    const self = this;
                    const spikeTop = spike.type === "saw" ? SPIKE_H * 1.2 : SPIKE_H;
                    // Уламки не провалюються під землю (там клавіатура)
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(screenX - 400, 0, 800, groundY + 8);
                    ctx.clip();
                    drawSpikeDestruction(ctx, spike.fx.kind, ft, screenX, groundY, spikeHalfWidth(spike.type), spikeTop, function (c) {
                        self.drawObstacleBody(c, spike, screenX, groundY, accentColor, false);
                    }, { pullX: anchorX + CUBE_SIZE * GRAVITY_PULL_AHEAD });
                    ctx.restore();
                }
                continue;
            }
            // Подоланий шип за мить «осідає» в землю
            let crumble = 1;
            if (cleared) {
                const since = spike.clearedAt === undefined ? 1 : (this.currentTime - spike.clearedAt) / 1000;
                crumble = 1 - since / SPIKE_CRUMBLE_TIME;
                if (crumble <= 0) {
                    continue;
                }
            }
            // Поява: шип «виростає» із землі, коли заходить на екран
            const appear = Math.min(1, Math.max(0, (W + 40 - screenX) / SPIKE_POP_DISTANCE));
            const grow = (1 - Math.pow(1 - appear, 3)) * crumble;
            if (grow <= 0.01) {
                continue;
            }

            // Підсвітка моменту натискання для цільового шипа
            let zone = null;
            if (spike === target) {
                const gap = spike.x - spikeHalfWidth(spike.type) - this.player.x;
                if (gap > 0 && gap <= perfectWidth) {
                    zone = "perfect";
                } else if (gap > 0 && gap <= this.okPx) {
                    zone = "ok";
                }
            }
            if (zone) {
                const zoneColor = zone === "perfect" ? "57, 255, 136" : "0, 246, 255";
                const glow = ctx.createRadialGradient(screenX, groundY - SPIKE_H * 0.45, 4, screenX, groundY - SPIKE_H * 0.45, SPIKE_H * 1.1);
                glow.addColorStop(0, "rgba(" + zoneColor + ", 0.55)");
                glow.addColorStop(1, "rgba(" + zoneColor + ", 0)");
                ctx.fillStyle = glow;
                ctx.fillRect(screenX - SPIKE_H * 1.1, groundY - SPIKE_H * 1.6, SPIKE_H * 2.2, SPIKE_H * 1.6);
            }

            ctx.save();
            ctx.translate(screenX, groundY);
            ctx.scale(1, grow);
            ctx.translate(-screenX, -groundY);
            if (spike.chunks > 0) {
                // Кулі автомата вже відкололи верхні шматки
                const spikeTop = spike.type === "saw" ? SPIKE_H * 1.2 : SPIKE_H;
                ctx.beginPath();
                ctx.rect(screenX - 200, groundY - spikeTop * (1 - spike.chunks * 0.22), 400, spikeTop * 2);
                ctx.clip();
            }
            this.drawObstacleBody(ctx, spike, screenX, groundY, accentColor, cleared);
            ctx.restore();

            // Клавіша з літерою над перешкодою
            if (!cleared) {
                const topY = spike.type === "saw" ? groundY - SPIKE_H * 1.2 : groundY - SPIKE_H;
                // Шип, по якому вже вдарила зброя, світиться зеленим до руйнування
                const state = spike.state === "doomed" ? "perfect" : zone ? zone : spike === target ? "target" : "idle";
                ctx.globalAlpha = grow;
                drawKeycap(ctx, screenX, topY - 12, spike.letter, state);
                ctx.globalAlpha = 1;
            }
        }
        ctx.restore();
    }

    renderScorePopups(ctx, groundY, anchorX, camX) {
        if (this.scorePopups.length === 0) {
            return;
        }
        ctx.save();
        ctx.font = "bold 20px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.lineJoin = "round";
        for (const sp of this.scorePopups) {
            ctx.globalAlpha = Math.min(1, sp.life / sp.maxLife * 1.5);
            const x = sp.x - camX + anchorX;
            const y = groundY - sp.y;
            ctx.lineWidth = 4;
            ctx.strokeStyle = "rgba(5, 5, 20, 0.9)";
            ctx.strokeText(sp.text, x, y);
            // Монети — золоті, очки — бірюзові (як напис «Очки» вгорі), решта — жовті
            ctx.fillStyle = sp.crystal ? "#ffd84a" : sp.points ? POINTS_COLOR : "#ffe14d";
            ctx.fillText(sp.text, x, y);
            if (sp.crystal) {
                // Значок монети праворуч від напису
                const w = ctx.measureText(sp.text).width;
                drawCoinIcon(ctx, x + w / 2 + 11, y - 10, 16);
            }
        }
        ctx.restore();
    }

    // ---------- Кубик та частинки ----------

    renderPlayer(ctx, groundY, anchorX) {
        if (!this.player.alive) {
            return;
        }
        // Шлейф (звичайний або куплений у магазині)
        const trailPoints = [];
        for (let ti = 0; ti < this.player.trail.length; ti++) {
            const point = this.player.trail[ti];
            if (point.seq === undefined) {
                point.seq = this.trailSeq = (this.trailSeq || 0) + 1;
            }
            trailPoints.push({
                sx: anchorX + point.x - this.player.x,
                sy: groundY - point.y - CUBE_SIZE / 2,
                alpha: point.alpha,
                i: point.seq
            });
        }
        drawTrail(ctx, save.getEquipped("trail"), trailPoints, CUBE_SIZE, this.currentTime);

        // Gold trail for perfectHard
        var achievementLevelId = this.level.id;
        var activeSkinId = save.getActiveSkin ? save.getActiveSkin() : null;
        if (activeSkinId) {
            var skinLevel = ALL_LEVELS.find(function (l) { return l.skin && l.skin.renderType === activeSkinId; });
            if (skinLevel) {
                achievementLevelId = skinLevel.id;
            }
        }
        const achievement = save.getLevelAchievement ? save.getLevelAchievement(achievementLevelId) : null;
        if (achievement === "hard" && !this.player.onGround && this.player.vy !== 0) {
            this.player.goldTrail = this.player.goldTrail || [];
            this.player.goldTrail.push({
                x: this.player.x,
                y: this.player.y + CUBE_SIZE / 2,
                alpha: 1.0,
                time: this.currentTime
            });
            for (var gi = this.player.goldTrail.length - 1; gi >= 0; gi--) {
                var gp = this.player.goldTrail[gi];
                var gage = (this.currentTime - gp.time) / 1000;
                gp.alpha = Math.max(0, 1.0 - gage / 0.4);
                if (gp.alpha <= 0) {
                    this.player.goldTrail.splice(gi, 1);
                    continue;
                }
                var gpx = anchorX + (gp.x - this.player.x);
                var gpy = groundY - gp.y - CUBE_SIZE / 2;
                ctx.fillStyle = "rgba(255, 200, 40, " + (gp.alpha * 0.5).toFixed(3) + ")";
                ctx.beginPath();
                ctx.arc(gpx, gpy, 4 * gp.alpha, 0, Math.PI * 2);
                ctx.fill();
            }
            if (this.player.goldTrail.length > 15) {
                this.player.goldTrail.splice(0, this.player.goldTrail.length - 15);
            }
        }

        const centerY = groundY - this.player.y - CUBE_SIZE / 2;
        ctx.save();
        ctx.translate(anchorX, centerY);
        ctx.rotate(this.player.rotation);

        var activeSkinId = save.getActiveSkin ? save.getActiveSkin() : null;

        const skinConfig = this.level.skin;
        var effectiveSkinConfig = skinConfig;
        if (activeSkinId && SKIN_RENDERERS[activeSkinId]) {
            effectiveSkinConfig = { renderType: activeSkinId };
        }
        const renderFn = effectiveSkinConfig ? SKIN_RENDERERS[effectiveSkinConfig.renderType] : null;
        if (renderFn) {
            renderFn(ctx, CUBE_SIZE, this.currentTime, this.player);
        } else {
            SKIN_RENDERERS.neon_base(ctx, CUBE_SIZE, this.currentTime, this.player);
        }

        drawAchievementFrame(ctx, CUBE_SIZE, achievement, this.currentTime);
        drawAccessory(ctx, save.getEquipped("accessory"), CUBE_SIZE, this.currentTime);
        if (this.weaponSpec) {
            drawHeldWeapon(ctx, this.weaponId, CUBE_SIZE, this.weaponPose(), this.currentTime);
        }

        // Щит: поки не використаний — ледь помітна бульбашка; спрацював — яскравий спалах, що гасне
        if (this.shieldReady || this.shieldFlash > 0) {
            const flash = this.shieldFlash || 0;
            const r = CUBE_SIZE * (0.85 + flash * 0.4);
            ctx.strokeStyle = "rgba(140, 220, 255, " + (this.shieldReady ? 0.35 + 0.15 * Math.sin(this.currentTime * 0.004) : flash).toFixed(3) + ")";
            ctx.lineWidth = this.shieldReady ? 2 : 4;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Спалах рамки після «Ідеально»
        if (this.perfectFlash > 0) {
            var flashT = this.perfectFlash / PERFECT_FLASH_TIME;
            var grow = (1 - flashT) * 8;
            ctx.strokeStyle = "rgba(255, 255, 255, " + (flashT * 0.9).toFixed(3) + ")";
            ctx.lineWidth = 3;
            ctx.strokeRect(-CUBE_SIZE / 2 - grow, -CUBE_SIZE / 2 - grow, CUBE_SIZE + grow * 2, CUBE_SIZE + grow * 2);
        }

        ctx.restore();
    }

    renderProgressBar(ctx, W) {
        var barW = W * 0.6;
        var barX = (W - barW) / 2;
        var barY = 30;
        var barH = 14;

        // Темна підкладка, щоб написи читалися й на світлому денному небі
        var panelX = Math.max(4, barX - 150);
        var panelR = Math.min(W - 4, barX + barW + 128);
        ctx.fillStyle = "rgba(5, 8, 20, 0.55)";
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(panelX, 2, panelR - panelX, barY + barH + 8, 8);
        } else {
            ctx.rect(panelX, 2, panelR - panelX, barY + barH + 8);
        }
        ctx.fill();

        if (this.leagueInfo !== null) {
            ctx.font = "bold 14px 'Segoe UI', Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#00f6ff";
            ctx.fillText(
                "Ліга: " + this.leagueInfo.leagueName + " | " + this.leagueInfo.levelNumber + ": " + this.leagueInfo.levelName,
                W / 2,
                6
            );
        }

        ctx.fillStyle = "rgba(8, 10, 26, 0.8)";
        ctx.fillRect(barX, barY, barW, barH);
        ctx.strokeStyle = "rgba(0, 246, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barW, barH);
        var fillW = barW * (this.progressPct / 100);
        var gradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        gradient.addColorStop(0, "#00f6ff");
        gradient.addColorStop(1, "#39ff88");
        ctx.fillStyle = gradient;
        ctx.fillRect(barX + 1, barY + 1, Math.max(0, fillW - 2), barH - 2);
        ctx.fillStyle = "#eaf6ff";
        ctx.font = "bold 14px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(Math.floor(this.progressPct) + "%", barX + barW + 12, barY + barH / 2);
        // Монети, зібрані в цьому забігу
        drawCoinIcon(ctx, barX + barW + 70, barY + barH / 2, 16);
        ctx.fillStyle = "#ffd84a";
        ctx.fillText(String(this.runHits + this.runPerfect + this.runSeries + (this.runWords * WORD_BONUS + this.runCombos * COMBO_BONUS) * this.wordsMult()), barX + barW + 82, barY + barH / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = POINTS_COLOR;
        var maxForMode = this.difficulty === "HARD" ? this.maxHard : this.maxEasy;
        ctx.fillText("Очки: " + this.score + " / " + maxForMode, barX - 12, barY + barH / 2);
    }

    renderPerfectParticles(ctx, groundY, anchorX, camX) {
        for (var i = 0; i < this.perfectParticles.length; i++) {
            var pp = this.perfectParticles[i];
            var alpha = pp.life / pp.maxLife;
            var sx = pp.x - camX + anchorX;
            var sy = groundY - pp.y;
            // Піксельна зірочка «плюсом»
            var ps = Math.max(1.5, pp.size * (0.5 + alpha * 0.5));
            ctx.fillStyle = pp.color;
            ctx.globalAlpha = alpha * 0.9;
            ctx.fillRect(sx - ps / 2, sy - ps * 1.5, ps, ps * 3);
            ctx.fillRect(sx - ps * 1.5, sy - ps / 2, ps * 3, ps);
        }
        ctx.globalAlpha = 1;
    }

    renderDebris(ctx, groundY, anchorX, camX) {
        for (var i = 0; i < this.debris.length; i++) {
            var db = this.debris[i];
            var alpha = Math.min(1, db.life / db.maxLife * 1.5);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(db.x - camX + anchorX, groundY - db.y);
            ctx.rotate(db.rot);
            ctx.fillStyle = db.color;
            ctx.fillRect(-db.size / 2, -db.size / 2, db.size, db.size);
            if (db.outline) {
                ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-db.size / 2, -db.size / 2, db.size, db.size);
            }
            ctx.restore();
        }
    }

    renderPerfectPopups(ctx, groundY, anchorX, camX) {
        var isHard = this.difficulty === "HARD";
        var popColor = isHard ? "#ffd700" : "#e8ecf2";
        for (var i = 0; i < this.perfectPopups.length; i++) {
            var po = this.perfectPopups[i];
            var alpha = po.life / po.maxLife;
            var sx = po.x - camX + anchorX;
            var sy = groundY - po.y;
            ctx.save();
            ctx.font = "bold 16px 'Segoe UI', Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.globalAlpha = alpha;
            ctx.fillStyle = popColor;
            ctx.fillText("PERFECT!", sx, sy);
            ctx.restore();
        }
    }
}

export { EngineRenderObjects };

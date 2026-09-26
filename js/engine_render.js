// ============================================================
// engine_render.js — методи Engine для рендера кадру: фон і шари, HUD, пауза,
// серця, смуга слів, назва світу, хвилі, земля, зона влучання, фініш (підключаються в engine.js)
// ============================================================

import { BackgroundRenderer } from "./backgrounds.js";
import { drawExplosion, drawHeartLife } from "./shop.js";
import { sampleSkinColors } from "./skins.js";
import { CUBE_SIZE, EASTER_EGG_DURATION, FINISH_OPEN_DISTANCE, OOPS_TIME, PERFECT_FLASH_TIME, PLAYER_ANCHOR, SHAKE_TIME, TITLE_TIME } from "./game_constants.js";
import { save } from "./save.js";
import { roundedRectPath } from "./spike_styles.js";

// Рендер кадру: фон, шари, HUD, пауза, серця, слова, назва світу, земля, зона влучання, фініш
class EngineRender {
    // ---------- Рендер ----------

    render(ctx, W, H, time) {
        const realTime = time;
        // Під час паузи фон і всі анімації завмирають: час рендера не йде вперед
        if (this.paused) {
            if (this.pauseStart === null) {
                this.pauseStart = time;
            }
            time = this.pauseStart - this.pausedTotal;
        } else {
            if (this.pauseStart !== null) {
                this.pausedTotal += time - this.pauseStart;
                this.pauseStart = null;
            }
            time -= this.pausedTotal;
        }
        var groundY = H * 0.64;
        var anchorX = W * PLAYER_ANCHOR;
        var camX = this.player.x;

        this.bgCache.setTheme(this.level.bgTheme);
        this.bgCache.resize(W, H);
        if (this.eggStart === null && this.progressPct / 100 >= this.eggAt) {
            this.eggStart = this.currentTime;
        }
        var eggT = this.eggStart === null ? null : (this.currentTime - this.eggStart) / EASTER_EGG_DURATION;
        BackgroundRenderer.setEffects({
            progress: this.progressPct / 100,
            combo: this.combo,
            perfect: this.perfectFlash / PERFECT_FLASH_TIME,
            eggT: eggT !== null && eggT <= 1 ? eggT : null,
            weather: this.weather,
            camY: this.cameraMotion ? this.player.y * 0.35 : 0,
            oops: this.oopsTime / OOPS_TIME,
            // Літера, яку треба натиснути зараз (гірлянда з абеткою в «Дивному містечку»)
            letter: this.getTargetLetter()
        });
        if (this.bgCache.shouldUpdate(time)) {
            var self = this;
            this.bgCache.render(function (cacheCtx) {
                BackgroundRenderer.render(cacheCtx, self.level.bgTheme, W, H, groundY, time, self.effectiveSpeed, self.level.accentColor, self.level.id);
            }, time);
        }
        // Струс екрана після вибуху (лише ігрова сцена, клавіатура нерухома)
        ctx.save();
        if (this.shakeTime > 0) {
            const amp = 9 * this.shakeTime / SHAKE_TIME;
            ctx.translate((Math.random() - 0.5) * amp * 2, (Math.random() - 0.5) * amp * 2);
        }
        this.bgCache.drawImage(ctx);
        this.renderWaves(ctx, W, groundY);
        this.renderGround(ctx, W, H, groundY, camX);
        this.renderCubeLight(ctx, groundY, anchorX);
        this.renderHitWindow(ctx, W, groundY, anchorX, time);
        this.renderFinish(ctx, W, groundY, anchorX, camX);
        this.renderObstacles(ctx, W, groundY, anchorX, camX);
        this.renderPlayer(ctx, groundY, anchorX);
        this.renderWeapons(ctx, groundY, anchorX, camX);
        BackgroundRenderer.renderParticles(ctx, groundY, anchorX, camX);
        this.renderDebris(ctx, groundY, anchorX, camX);
        if (this.boom) {
            drawExplosion(ctx, this.boom.id, this.boom.t, anchorX + this.boom.x - camX, groundY - this.boom.y, CUBE_SIZE);
        }
        this.renderPerfectParticles(ctx, groundY, anchorX, camX);
        this.renderPerfectPopups(ctx, groundY, anchorX, camX);
        this.renderScorePopups(ctx, groundY, anchorX, camX);
        ctx.restore();
        if (!this.demoMode) {
            this.renderWordBar(ctx, W);
            // Назва світу не накладається на екран паузи
            if (!this.isUserPaused()) {
                this.renderWorldTitle(ctx, W, H);
            }
            this.renderProgressBar(ctx, W);
            this.renderHearts(ctx);
            if (this.isUserPaused() && this.outcome === "running") {
                this.renderPauseOverlay(ctx, W, H, realTime);
            }
        }
    }

    // Літери рівня в порядку появи на трасі (для екрана паузи)
    getLevelLetters() {
        const seen = [];
        for (const spike of this.spikes) {
            const l = (spike.letter || "").toUpperCase();
            if (l && seen.indexOf(l) === -1) {
                seen.push(l);
            }
        }
        return seen;
    }

    // Екран паузи над ігровим полем (клавіатуру внизу не закриває):
    // заголовок, літери рівня й мигаюча підказка «Натисни ПРОБІЛ»
    renderPauseOverlay(ctx, W, H, time) {
        const areaH = H * 0.68;
        const reason = this.pauseReason;
        ctx.save();
        ctx.fillStyle = "rgba(5, 6, 20, 0.72)";
        ctx.fillRect(0, 0, W, areaH);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const unit = Math.min(W, H);
        // Заголовок
        const title = reason === "start" ? "ГОТОВИЙ?" : reason === "resume" ? "❤ ДРУГЕ ЖИТТЯ" : "ПАУЗА";
        ctx.font = "bold " + Math.round(unit * 0.075) + "px 'Segoe UI', Arial, sans-serif";
        ctx.lineWidth = Math.max(3, unit * 0.008);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
        ctx.strokeText(title, W / 2, areaH * 0.2);
        ctx.fillStyle = reason === "resume" ? "#ff6a8a" : "#00f6ff";
        ctx.fillText(title, W / 2, areaH * 0.2);
        // Літери рівня — великими плашками
        const letters = this.getLevelLetters();
        ctx.font = Math.round(unit * 0.028) + "px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#c8d6f0";
        ctx.fillText("Літери рівня:", W / 2, areaH * 0.38);
        const size = Math.min(unit * 0.085, (W * 0.9) / Math.max(1, letters.length) - unit * 0.015);
        const gap = unit * 0.015;
        const rowW = letters.length * size + (letters.length - 1) * gap;
        let x = W / 2 - rowW / 2;
        const y = areaH * 0.52 - size / 2;
        ctx.font = "bold " + Math.round(size * 0.55) + "px 'Segoe UI', Arial, sans-serif";
        for (const letter of letters) {
            ctx.fillStyle = "rgba(0, 246, 255, 0.12)";
            ctx.fillRect(x, y, size, size);
            ctx.strokeStyle = "#00f6ff";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(letter, x + size / 2, y + size / 2 + 1);
            x += size + gap;
        }
        // Мигаюча підказка
        // time — секунди (як у головному циклі)
        const blink = 0.55 + 0.45 * Math.sin(time * 5);
        const action = reason === "start" ? "почати" : "продовжити";
        ctx.globalAlpha = blink;
        ctx.font = "bold " + Math.round(unit * 0.042) + "px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#ffe14d";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
        ctx.lineWidth = Math.max(3, unit * 0.006);
        const prompt = "Натисни ПРОБІЛ, щоб " + action;
        ctx.strokeText(prompt, W / 2, areaH * 0.74);
        ctx.fillText(prompt, W / 2, areaH * 0.74);
        ctx.globalAlpha = 1;
        ctx.font = Math.round(unit * 0.024) + "px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#9fb4d8";
        const note = reason === "start"
            ? "Під час гри Пробіл — пауза · Esc — вийти в меню"
            : "Esc — вийти в меню";
        ctx.fillText(note, W / 2, areaH * 0.86);
        ctx.restore();
    }

    // Запас сердечок — у лівому верхньому куті під панеллю
    renderHearts(ctx) {
        const count = save.getHearts();
        if (count <= 0 && this.heartFlash <= 0) {
            return;
        }
        const x = 26;
        const y = 78;
        ctx.save();
        const pulse = 1 + (this.heartFlash || 0) * 0.5;
        drawHeartLife(ctx, x, y, 28 * pulse, performance.now());
        ctx.font = "bold 18px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(5, 5, 20, 0.9)";
        ctx.strokeText("×" + count, x + 18, y + 2);
        ctx.fillStyle = "#ffe14d";
        ctx.fillText("×" + count, x + 18, y + 2);
        ctx.restore();
    }

    // Рівень-слова: під панеллю прогресу — поточне слово, набрані літери зелені,
    // потрібна зараз — жовта, решта — білі
    renderWordBar(ctx, W) {
        if (!Array.isArray(this.level.words) || this.spikes.length === 0) {
            return;
        }
        let current = this.nearestAheadSpike();
        if (!current) {
            for (let i = this.spikes.length - 1; i >= 0; i--) {
                if (this.spikes[i].state !== "ahead") {
                    current = this.spikes[i];
                    break;
                }
            }
        }
        if (!current || current.word === undefined) {
            return;
        }
        const wordSpikes = this.spikes.filter(function (s) { return s.wordIdx === current.wordIdx; });
        const cell = 34;
        const gapPx = 6;
        const total = wordSpikes.length * cell + (wordSpikes.length - 1) * gapPx;
        const x0 = Math.round(W / 2 - total / 2);
        const y0 = 64;
        ctx.save();
        ctx.fillStyle = "rgba(5, 8, 20, 0.72)";
        roundedRectPath(ctx, x0 - 14, y0 - 8, total + 28, cell + 16, 10);
        ctx.fill();
        ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let i = 0; i < wordSpikes.length; i++) {
            const s = wordSpikes[i];
            const x = x0 + i * (cell + gapPx);
            const done = s.state !== "ahead";
            const isCurrent = s === current && s.state === "ahead";
            ctx.fillStyle = done ? (s.missed ? "rgba(120, 40, 60, 0.9)" : "rgba(20, 90, 50, 0.95)") : isCurrent ? "rgba(90, 80, 20, 0.95)" : "rgba(40, 44, 70, 0.9)";
            roundedRectPath(ctx, x, y0, cell, cell, 6);
            ctx.fill();
            ctx.strokeStyle = done ? (s.missed ? "#ff4466" : "#39ff88") : isCurrent ? "#ffe14d" : "rgba(160, 170, 210, 0.5)";
            ctx.lineWidth = isCurrent ? 2.5 : 1.5;
            ctx.stroke();
            ctx.fillStyle = done ? "#ffffff" : isCurrent ? "#ffe14d" : "#e8ecf8";
            ctx.fillText(s.letter, x + cell / 2, y0 + cell / 2 + 1);
        }
        ctx.restore();
    }

    // Світло від кубика кольору скіна підсвічує землю й найближчі шипи
    renderCubeLight(ctx, groundY, anchorX) {
        if (!this.player.alive) {
            return;
        }
        let base = sampleSkinColors(this.getSkinRenderType())[0] || "rgb(0, 246, 255)";
        if (base.charAt(0) === "#") {
            base = "rgb(" + parseInt(base.slice(1, 3), 16) + ", " + parseInt(base.slice(3, 5), 16) + ", " + parseInt(base.slice(5, 7), 16) + ")";
        }
        const color = base.replace("rgb(", "rgba(").replace(")", ", 0.28)");
        const cy = groundY - this.player.y - CUBE_SIZE / 2;
        const r = 150;
        const light = ctx.createRadialGradient(anchorX, cy, 10, anchorX, cy, r);
        light.addColorStop(0, color);
        light.addColorStop(1, base.replace("rgb(", "rgba(").replace(")", ", 0)"));
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = light;
        ctx.fillRect(anchorX - r, cy - r, r * 2, r * 2);
        ctx.restore();
    }

    // Заставка світу: назва плавно з'являється на початку рівня й зникає
    renderWorldTitle(ctx, W, H) {
        if (this.elapsed >= TITLE_TIME) {
            return;
        }
        const name = BackgroundRenderer.worldName(this.level.bgTheme);
        if (!name) {
            return;
        }
        const t = this.elapsed;
        const alpha = Math.min(1, t / 0.35, (TITLE_TIME - t) / 0.6);
        const rise = (1 - Math.min(1, t / 0.35)) * 20;
        const accent = this.level.accentColor || "#00f6ff";
        let y = H * 0.24 + rise;
        let jitterX = 0;
        // Заставка боса тремтить, а над нею розплющується око демона
        const isBoss = this.level.bgTheme === "pixel_nether";
        if (isBoss) {
            jitterX = (Math.random() - 0.5) * 6;
            y += (Math.random() - 0.5) * 6;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "900 " + Math.round(H * 0.07) + "px 'Segoe UI', Arial, sans-serif";
        // Піксельна «об'ємна» тінь
        ctx.fillStyle = "rgba(5, 5, 20, 0.9)";
        for (let k = 4; k >= 1; k--) {
            ctx.fillText(name.toUpperCase(), W / 2 + k * 2, y + k * 2);
        }
        ctx.fillStyle = accent;
        ctx.fillText(name.toUpperCase(), W / 2 + 2 + jitterX, y);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(name.toUpperCase(), W / 2 + jitterX, y - 2);
        if (isBoss) {
            const eyeOpen = Math.min(1, t / 1.2);
            const eh = Math.max(2, H * 0.03 * eyeOpen);
            const ey = y - H * 0.1;
            ctx.fillStyle = "rgba(255, 40, 0, 0.35)";
            ctx.fillRect(W / 2 - H * 0.09, ey - eh, H * 0.18, eh * 2);
            ctx.fillStyle = "#ffea00";
            ctx.fillRect(W / 2 - H * 0.06, ey - eh / 2, H * 0.12, eh);
            ctx.fillStyle = "#8a0000";
            ctx.fillRect(W / 2 - H * 0.008, ey - eh / 2, H * 0.016, eh);
        }
        if (this.leagueInfo) {
            ctx.font = "bold " + Math.round(H * 0.028) + "px 'Segoe UI', Arial, sans-serif";
            // Темна тінь під підписом — щоб читався й на світлому тлі
            ctx.fillStyle = "rgba(5, 5, 20, 0.85)";
            ctx.fillText("Рівень " + this.leagueInfo.levelNumber + " · " + (this.leagueInfo.lettersText || ""), W / 2 + 2, y + H * 0.065 + 2);
            ctx.fillStyle = accent;
            ctx.fillText("Рівень " + this.leagueInfo.levelNumber + " · " + (this.leagueInfo.lettersText || ""), W / 2, y + H * 0.065);
        }
        ctx.restore();
    }

    // ---------- Хвилі стрибка ----------

    renderWaves(ctx, W, groundY) {
        const anchorX = W * PLAYER_ANCHOR;
        for (const wave of this.waves) {
            ctx.beginPath();
            ctx.arc(anchorX, groundY - CUBE_SIZE / 2 - this.player.y, wave.r, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0, 246, 255, " + Math.max(0, wave.alpha * 0.6).toFixed(3) + ")";
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    // ---------- Земля, Hit Window, Фініш, Перешкоди, Гравець ----------

    renderGround(ctx, W, H, groundY, camX) {
        ctx.fillStyle = "#070b1c";
        ctx.fillRect(0, groundY, W, H - groundY);

        const accent = this.level.accentColor || "#00f6ff";
        var groundGrad = ctx.createLinearGradient(0, groundY - 6, 0, groundY + 6);
        groundGrad.addColorStop(0, "transparent");
        groundGrad.addColorStop(0.5, accent);
        groundGrad.addColorStop(1, "transparent");
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY - 6, W, 12);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(W, groundY);
        ctx.stroke();

        // Земля під шипами в стилі світу (трава, сніг, пісок, камінь, лава…)
        BackgroundRenderer.renderGroundDetail(ctx, this.level.bgTheme, W, H, groundY, camX, accent);
        // Неонова лінія землі поверх текстури
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(W, groundY);
        ctx.stroke();
    }

    renderHitWindow(ctx, W, groundY, anchorX, time) {
        if (!this.player.alive) {
            return;
        }
        const spike = this.nearestAheadSpike();
        if (!spike) {
            return;
        }
        const hwH = 5;
        const perfectWidth = this.perfectPx + this.okPx * 0.35;
        const okWidth = this.okPx;
        const pulseAlpha = 0.4 + 0.2 * (Math.sin(time * 6) + 1) / 2;

        const topY = groundY - hwH - 2;
        const botY = groundY + 2;

        ctx.fillStyle = "rgba(57, 255, 136, " + pulseAlpha.toFixed(3) + ")";
        ctx.fillRect(anchorX, topY, perfectWidth, hwH);

        ctx.fillStyle = "rgba(0, 246, 255, 0.2)";
        ctx.fillRect(anchorX, botY, okWidth, hwH);
    }

    renderFinish(ctx, W, groundY, anchorX, camX) {
        const screenX = this.finishX - camX + anchorX;
        if (screenX < -120 || screenX > W + 120) {
            return;
        }
        // Фініш у стилі світу «відчиняється», коли кубик підбігає
        const open = Math.min(1, Math.max(0, 1 - (this.finishX - this.player.x) / FINISH_OPEN_DISTANCE));
        BackgroundRenderer.renderFinishGate(ctx, this.level.bgTheme, screenX, groundY, open, this.currentTime / 1000);
    }
}

export { EngineRender };

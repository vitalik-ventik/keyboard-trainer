// ============================================================
// ui/pet_reveal.js — вікно «Отримано!»: новий улюбленець вилітає з обертом у спалаху
// кольору рідкості, за ним крутяться промені й сиплеться конфеті
// ============================================================

import { playSound } from "../assets.js";
import { save } from "../engine.js";
import { PET_MUTATIONS, drawPet, getShopItem, petRarity, petRarityColor } from "../shop.js";

const revealEl = document.getElementById("pet-reveal");
const revealCanvas = document.getElementById("petRevealCanvas");
const revealNameEl = document.getElementById("petRevealName");
const revealRarityEl = document.getElementById("petRevealRarity");
const btnRevealClose = document.getElementById("btnPetRevealClose");

const REVEAL_W = 380;
const REVEAL_H = 260;
// Скільки триває виліт улюбленця (мс)
const REVEAL_IN_MS = 900;
const CONFETTI_COLORS = ["#ff4a7a", "#ffe14d", "#39c6ff", "#7dff8a", "#d68bff", "#ff9a1a"];

let reveal = null;
let revealAnimating = false;

function makeConfetti() {
    const pieces = [];
    for (let i = 0; i < 46; i++) {
        pieces.push({
            x: Math.random() * REVEAL_W,
            y: -Math.random() * REVEAL_H * 0.8,
            vy: 50 + Math.random() * 90,
            vx: (Math.random() - 0.5) * 40,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 8,
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]
        });
    }
    return pieces;
}

function drawReveal(now) {
    const dpr = window.devicePixelRatio || 1;
    const c = revealCanvas.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, REVEAL_W, REVEAL_H);
    const item = getShopItem(reveal.id);
    const color = petRarityColor(item, now);
    const t = now - reveal.start;
    const dt = Math.min(0.05, (now - reveal.last) / 1000);
    reveal.last = now;
    const cx = REVEAL_W / 2;
    const cy = REVEAL_H * 0.52;
    // Промені кольору рідкості
    c.save();
    c.translate(cx, cy);
    c.rotate(now * 0.0006);
    c.globalAlpha = 0.28;
    c.fillStyle = color;
    for (let i = 0; i < 12; i++) {
        c.rotate(Math.PI / 6);
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(-18, -REVEAL_W);
        c.lineTo(18, -REVEAL_W);
        c.closePath();
        c.fill();
    }
    c.restore();
    // Спалах на початку
    if (t < 500) {
        c.save();
        c.globalAlpha = 1 - t / 500;
        c.fillStyle = "#ffffff";
        c.beginPath();
        c.arc(cx, cy, 20 + t * 0.5, 0, Math.PI * 2);
        c.fill();
        c.restore();
    }
    // Улюбленець вилітає з обертом, далі радісно підстрибує
    const k = Math.min(1, t / REVEAL_IN_MS);
    const ease = 1 - Math.pow(1 - k, 3);
    const hop = k >= 1 ? Math.abs(Math.sin((t - REVEAL_IN_MS) * 0.006)) * 12 : 0;
    c.save();
    c.translate(cx, cy - hop);
    c.rotate((1 - ease) * Math.PI * 4);
    c.scale(0.2 + ease * 0.8, 0.2 + ease * 0.8);
    drawPet(c, reveal.id, 120, now, {
        mood: k >= 1 ? "happy" : null,
        moving: false,
        happyT: k >= 1 ? ((t - REVEAL_IN_MS) % 1600) / 1600 : 0,
        mutation: reveal.mutation,
        weapon: save.getEquipped("weapon")
    });
    c.restore();
    // Конфеті
    for (const p of reveal.confetti) {
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        p.rot += p.vr * dt;
        if (p.y > REVEAL_H + 10) {
            p.y = -10;
            p.x = Math.random() * REVEAL_W;
        }
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.fillStyle = p.color;
        c.fillRect(-4, -2, 8, 4);
        c.restore();
    }
}

function animateReveal(now) {
    if (!reveal || revealEl.classList.contains("hidden")) {
        revealAnimating = false;
        return;
    }
    drawReveal(now);
    requestAnimationFrame(animateReveal);
}

// Показати новенького улюбленця. mutation — ключ мутації або null
function showPetReveal(petId, mutation) {
    const item = getShopItem(petId);
    if (!item || !revealEl) {
        return;
    }
    const dpr = window.devicePixelRatio || 1;
    revealCanvas.width = Math.round(REVEAL_W * dpr);
    revealCanvas.height = Math.round(REVEAL_H * dpr);
    revealCanvas.style.width = REVEAL_W + "px";
    revealCanvas.style.height = REVEAL_H + "px";
    const now = performance.now();
    reveal = { id: petId, mutation: mutation || null, start: now, last: now, confetti: makeConfetti() };
    const rarity = petRarity(item);
    const mut = mutation ? PET_MUTATIONS[mutation] : null;
    revealNameEl.textContent = item.name;
    revealRarityEl.textContent = rarity.name.toUpperCase() + (mut ? " · " + mut.icon + " " + mut.name : "");
    revealRarityEl.style.color = rarity.color;
    revealRarityEl.classList.toggle("rarity-rainbow", !!rarity.rainbow);
    revealEl.style.setProperty("--rarity", rarity.color);
    revealEl.classList.remove("hidden");
    playSound("chest_item");
    if (!revealAnimating) {
        revealAnimating = true;
        requestAnimationFrame(animateReveal);
    }
}

function closePetReveal() {
    revealEl.classList.add("hidden");
    reveal = null;
}

function isPetRevealOpen() {
    return !!revealEl && !revealEl.classList.contains("hidden");
}

if (btnRevealClose) {
    btnRevealClose.addEventListener("click", closePetReveal);
}
if (revealEl) {
    revealEl.addEventListener("click", function (e) {
        if (e.target === revealEl) {
            closePetReveal();
        }
    });
}

export { closePetReveal, isPetRevealOpen, showPetReveal };

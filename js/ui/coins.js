// ============================================================
// ui/coins.js — баланс монет у меню й магазині та розбивка нагороди за забіг
// ============================================================

import { save } from "../engine.js";
import { SHOP_ITEMS } from "../shop.js";

const shopBalanceEl = document.getElementById("shopBalance");
const menuCrystalsEl = document.getElementById("menuCrystals");
// ---------- Монети: відображення й розбивка нагороди ----------

// Повідомлення в меню про монети, нараховані задним числом за вже пройдені рівні
function showRetroNotice(result) {
    const el = document.getElementById("retroNotice");
    if (!el || !result || result.total <= 0) {
        return;
    }
    el.textContent = "🪙 +" + result.total + " за вже пройдені рівні (" + result.levels + ")! Заглянь у магазин.";
    el.classList.remove("hidden");
    el.addEventListener("click", function () {
        el.classList.add("hidden");
    });
    setTimeout(function () {
        el.classList.add("hidden");
    }, 12000);
}

// Текст замка легендарного товару: «🔒 Золоті рамки 3/10»
function requirementLabel(progress) {
    if (progress.target > 1) {
        return "🔒 " + progress.text + " " + progress.current + "/" + progress.target;
    }
    return "🔒 " + progress.text;
}

function refreshCrystalDisplays() {
    const balance = String(save.getCrystals());
    if (menuCrystalsEl) {
        menuCrystalsEl.textContent = balance;
    }
    if (shopBalanceEl) {
        shopBalanceEl.textContent = balance;
    }
}

function addBreakdownRow(el, label, value, extraClass) {
    const l = document.createElement("span");
    l.textContent = label;
    const v = document.createElement("span");
    v.className = "cb-value";
    v.textContent = value;
    if (extraClass) {
        l.classList.add(extraClass);
        v.classList.add(extraClass);
    }
    el.appendChild(l);
    el.appendChild(v);
}

// Показує, за що нараховано монети, та підказує, на що тепер вистачає
function renderRewardBreakdown(el, reward, balanceBefore) {
    if (!el) {
        return;
    }
    el.innerHTML = "";
    // Спершу монети забігу й множники до них, потім разові бонуси рівня (без множників)
    for (const line of reward.lines) {
        if (!line.flat) {
            addBreakdownRow(el, "🪙 " + line.label, "+" + line.value);
        }
    }
    if (reward.mult !== 1) {
        addBreakdownRow(el, "Множник налаштувань", "×" + reward.mult);
    }
    if (reward.leagueMult && reward.leagueMult !== 1) {
        addBreakdownRow(el, "Бонус ліги", "×" + reward.leagueMult);
    }
    if (reward.weaponMult && reward.weaponMult !== 1) {
        addBreakdownRow(el, "Бонус зброї", "×" + reward.weaponMult);
    }
    if (reward.accessoryMult && reward.accessoryMult !== 1) {
        addBreakdownRow(el, "Бонус аксесуара", "×" + Math.round(reward.accessoryMult * 100) / 100);
    }
    for (const line of reward.lines) {
        if (line.flat) {
            addBreakdownRow(el, "🎖 " + line.label, "+" + line.value);
        }
    }
    if (reward.half) {
        addBreakdownRow(el, "Вибух — лишається половина", "÷2");
    }
    const balanceAfter = balanceBefore + reward.total;
    addBreakdownRow(el, "Разом (усього " + balanceAfter + ")", "+" + reward.total + " 🪙", "cb-total");
    const newlyAffordable = SHOP_ITEMS.filter(function (item) {
        return item.price > balanceBefore && item.price <= balanceAfter && !save.isOwned(item.id) &&
            save.getRequirementProgress(item).met;
    });
    if (newlyAffordable.length > 0) {
        const note = document.createElement("span");
        note.className = "cb-note";
        note.textContent = "Тепер вистачає на: " + newlyAffordable.slice(0, 2).map(function (i) { return i.name; }).join(", ") + "!";
        el.appendChild(note);
    }
}

export { refreshCrystalDisplays, renderRewardBreakdown, requirementLabel, showRetroNotice };

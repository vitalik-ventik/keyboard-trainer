// ============================================================
// ui/name_prompt.js — вікно «Як тебе звати?» для загального рейтингу
// Відкривається перед першим надсиланням рейтингу, а також із налаштувань,
// щоб змінити ім'я. «Пізніше» закриває вікно до наступного запуску гри.
// ============================================================

import { NAME_MAX, cleanPlayerName, getPlayerName, setPlayerName } from "../cloud.js";

const nameModalEl = document.getElementById("nameModal");
const nameInputEl = document.getElementById("nameInput");
const nameErrorEl = document.getElementById("nameError");
const btnNameOk = document.getElementById("btnNameOk");
const btnNameLater = document.getElementById("btnNameLater");

let onCloseCallback = null;

export function isNamePromptOpen() {
    return !!nameModalEl && !nameModalEl.classList.contains("hidden");
}

/**
 * Відкрити вікно. У полі — поточне ім'я (якщо вже є).
 * @param {function(boolean)} [onClose] — true, якщо ім'я збережено
 */
export function openNamePrompt(onClose) {
    if (!nameModalEl) {
        return;
    }
    onCloseCallback = typeof onClose === "function" ? onClose : null;
    nameInputEl.maxLength = NAME_MAX;
    nameInputEl.value = getPlayerName() || "";
    nameErrorEl.textContent = "";
    nameModalEl.classList.remove("hidden");
    // Фокус після показу вікна, щоб одразу можна було друкувати
    setTimeout(function () {
        nameInputEl.focus();
        nameInputEl.select();
    }, 50);
}

function finish(saved) {
    nameModalEl.classList.add("hidden");
    nameInputEl.blur();
    const callback = onCloseCallback;
    onCloseCallback = null;
    if (callback) {
        callback(saved);
    }
}

export function closeNamePrompt() {
    if (isNamePromptOpen()) {
        finish(false);
    }
}

function submitName() {
    const name = cleanPlayerName(nameInputEl.value);
    if (name.length === 0) {
        nameErrorEl.textContent = "Напиши хоча б одну літеру";
        nameInputEl.focus();
        return;
    }
    setPlayerName(name);
    finish(true);
}

if (nameModalEl) {
    btnNameOk.addEventListener("click", submitName);
    btnNameLater.addEventListener("click", closeNamePrompt);
    // Enter у полі — зберегти, Esc — «Пізніше» (інші клавіші поле обробляє саме)
    nameInputEl.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            submitName();
        } else if (event.key === "Escape") {
            event.preventDefault();
            closeNamePrompt();
        }
    });
}

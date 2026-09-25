// ============================================================
// version.js — Версія гри та автоматичне оновлення без Ctrl+F5
// ============================================================
// Файл version.json оновлює GitHub Action після кожного пуша в main.
// Завантажувач у index.html читає його без кешу й підключає CSS та модулі
// з міткою ?v=<версія>, тому браузер бере свіжі файли одразу після оновлення.
// Відкрита гра періодично перевіряє version.json і перезавантажується,
// щойно з'являється нова версія, але лише коли гравець не проходить рівень.

const CHECK_INTERVAL_MS = 60 * 1000;

// Версія, з якою завантажено сторінку (записує завантажувач у index.html)
export const APP_VERSION = (typeof window !== "undefined" && window.APP_VERSION) || "";

// Читає поточну версію з сервера в обхід кешу; null — якщо не вдалося
export async function fetchLatestVersion() {
    try {
        const response = await fetch("version.json?t=" + Date.now(), { cache: "no-store" });
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        return (data && typeof data.version === "string") ? data.version : null;
    } catch (err) {
        return null;
    }
}

// Людський підпис версії: «25.09.2026 12:35» у місцевому часі
export function formatVersion(version) {
    if (!version) {
        return "локальна збірка";
    }
    const date = new Date(version);
    if (isNaN(date.getTime())) {
        return version;
    }
    const pad = function (n) { return String(n).padStart(2, "0"); };
    return pad(date.getDate()) + "." + pad(date.getMonth() + 1) + "." + date.getFullYear() +
        " " + pad(date.getHours()) + ":" + pad(date.getMinutes());
}

// Стежить за новими версіями. canReload() каже, чи можна зараз перезавантажити
// сторінку (наприклад, не під час рівня). Якщо зараз не можна — перевіряє знову
// кожні кілька секунд, доки момент не настане.
export function startUpdateWatcher(canReload) {
    if (!APP_VERSION) {
        // Локальний запуск без version.json — стежити нема за чим
        return;
    }
    let pendingVersion = null;
    let checking = false;

    function tryReload() {
        if (pendingVersion && canReload()) {
            location.reload();
        }
    }

    async function check() {
        if (checking || pendingVersion) {
            tryReload();
            return;
        }
        checking = true;
        const latest = await fetchLatestVersion();
        checking = false;
        if (latest && latest !== APP_VERSION) {
            pendingVersion = latest;
            tryReload();
        }
    }

    setInterval(check, CHECK_INTERVAL_MS);
    setInterval(tryReload, 2000);
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) {
            check();
        }
    });
    window.addEventListener("focus", check);
}

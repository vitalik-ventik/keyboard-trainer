// ============================================================
// cloud.js — онлайн-рейтинг у Firebase через REST (без SDK і без CDN)
// Прогрес гри живе в localStorage; у Firestore надсилається лише копія
// статистики для загального рейтингу: ім'я, рейтинг, статистика й аватар.
// Гравець входить анонімно: Firebase видає id і ключ, вони лежать у localStorage,
// і правила бази дозволяють писати лише у свій рядок players/{id}.
// Без інтернету все тихо пропускається — гра працює як раніше.
// ============================================================

import { save } from "./save.js";

const FIREBASE = {
    apiKey: "AIzaSyA__Ylox43DndhUrG0qWqiwLTeQAhTzuzA",
    projectId: "keyboard-trainer-c7164"
};

const AUTH_SIGNUP_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + FIREBASE.apiKey;
const AUTH_REFRESH_URL = "https://securetoken.googleapis.com/v1/token?key=" + FIREBASE.apiKey;
const FIRESTORE_URL = "https://firestore.googleapis.com/v1/projects/" + FIREBASE.projectId + "/databases/(default)/documents";

// Окремий ключ: «Почати заново» стирає прогрес, але гравець лишається тим самим
const CLOUD_KEY = "dfp_cloud_v1";
export const NAME_MAX = 20;

// Стан надсилання для налаштувань: "idle" | "sending" | "ok" | "error"
let syncStatus = "idle";
let cloudData = null;
let idToken = null;
let idTokenExpires = 0;
let syncRunning = false;
let syncAgain = false;
const statusListeners = [];

// Запит, що завис (повільна мережа), обривається, щоб надсилання не «висіло» вічно
const REQUEST_TIMEOUT_MS = 30000;

function fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS);
    return fetch(url, Object.assign({}, options, { signal: controller.signal })).finally(function () {
        clearTimeout(timer);
    });
}

function loadCloud() {
    if (cloudData) {
        return cloudData;
    }
    cloudData = { uid: null, refreshToken: null, name: null };
    try {
        const raw = JSON.parse(localStorage.getItem(CLOUD_KEY) || "null");
        if (raw && typeof raw === "object") {
            if (typeof raw.uid === "string" && raw.uid.length > 0 && raw.uid.length <= 128) {
                cloudData.uid = raw.uid;
            }
            if (typeof raw.refreshToken === "string" && raw.refreshToken.length > 0) {
                cloudData.refreshToken = raw.refreshToken;
            }
            const name = cleanPlayerName(raw.name);
            cloudData.name = name.length > 0 ? name : null;
        }
    } catch (err) {
        console.warn("Не вдалося прочитати дані рейтингу:", err);
    }
    return cloudData;
}

function persistCloud() {
    try {
        localStorage.setItem(CLOUD_KEY, JSON.stringify(cloudData));
    } catch (err) {
        console.warn("Не вдалося зберегти дані рейтингу:", err);
    }
}

function setStatus(status) {
    syncStatus = status;
    for (const listener of statusListeners) {
        try {
            listener(status);
        } catch (err) {
            console.warn(err);
        }
    }
}

/**
 * Ім'я для рейтингу: без керівних символів і зайвих пробілів, не довше NAME_MAX.
 * @param {*} raw
 * @returns {string} порожній рядок, якщо ім'я непридатне
 */
export function cleanPlayerName(raw) {
    if (typeof raw !== "string") {
        return "";
    }
    const text = raw.replace(/[\u0000-\u001f\u007f-\u009f]/g, "").replace(/\s+/g, " ").trim();
    return Array.from(text).slice(0, NAME_MAX).join("").trim();
}

export function getPlayerName() {
    return loadCloud().name;
}

// Id гравця в рейтингу (з'являється після першого надсилання)
export function getPlayerId() {
    return loadCloud().uid;
}

export function getSyncStatus() {
    return syncStatus;
}

export function onSyncStatus(listener) {
    statusListeners.push(listener);
}

/**
 * Задає ім'я й одразу надсилає рейтинг.
 * @param {string} name
 * @returns {boolean} false, якщо ім'я порожнє
 */
export function setPlayerName(name) {
    const clean = cleanPlayerName(name);
    if (clean.length === 0) {
        return false;
    }
    loadCloud().name = clean;
    persistCloud();
    requestSync();
    return true;
}

// ---------- Анонімний вхід ----------

async function postJson(url, body, headers) {
    const response = await fetchWithTimeout(url, {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/json" }, headers || {}),
        body: JSON.stringify(body)
    });
    const data = await response.json().catch(function () { return null; });
    if (!response.ok) {
        const message = data && data.error ? (data.error.message || data.error.status) : response.status;
        throw new Error("Firebase: " + message);
    }
    return data;
}

// Новий анонімний гравець
async function signUp() {
    const data = await postJson(AUTH_SIGNUP_URL, { returnSecureToken: true });
    const cloud = loadCloud();
    cloud.uid = data.localId;
    cloud.refreshToken = data.refreshToken;
    persistCloud();
    idToken = data.idToken;
    idTokenExpires = Date.now() + (Number(data.expiresIn) || 3600) * 1000;
}

// Оновлення короткого токена за ключем із localStorage
async function refresh() {
    const cloud = loadCloud();
    const response = await fetchWithTimeout(AUTH_REFRESH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=refresh_token&refresh_token=" + encodeURIComponent(cloud.refreshToken)
    });
    const data = await response.json().catch(function () { return null; });
    if (!response.ok || !data || !data.id_token) {
        const message = data && data.error ? (data.error.message || data.error.status) : response.status;
        throw new Error("Firebase: " + message);
    }
    cloud.uid = data.user_id || cloud.uid;
    cloud.refreshToken = data.refresh_token || cloud.refreshToken;
    persistCloud();
    idToken = data.id_token;
    idTokenExpires = Date.now() + (Number(data.expires_in) || 3600) * 1000;
}

async function getIdToken() {
    // Запас у хвилину, щоб токен не прострочився посеред запиту
    if (idToken && Date.now() < idTokenExpires - 60000) {
        return idToken;
    }
    const cloud = loadCloud();
    if (cloud.refreshToken) {
        await refresh();
    } else {
        await signUp();
    }
    return idToken;
}

// ---------- Формат Firestore ----------

function toFirestoreValue(value) {
    if (value === null || value === undefined) {
        return { nullValue: null };
    }
    if (typeof value === "boolean") {
        return { booleanValue: value };
    }
    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            return { nullValue: null };
        }
        return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    }
    if (typeof value === "string") {
        return { stringValue: value };
    }
    if (value instanceof Date) {
        return { timestampValue: value.toISOString() };
    }
    if (Array.isArray(value)) {
        return { arrayValue: { values: value.map(toFirestoreValue) } };
    }
    return { mapValue: { fields: toFirestoreFields(value) } };
}

function toFirestoreFields(obj) {
    const fields = {};
    for (const key of Object.keys(obj)) {
        fields[key] = toFirestoreValue(obj[key]);
    }
    return fields;
}

// ---------- Надсилання ----------

async function sendPlayer() {
    const name = getPlayerName();
    if (!name) {
        return;
    }
    const token = await getIdToken();
    const snapshot = save.getCloudSnapshot();
    const doc = {
        name: name,
        rating: snapshot.rating,
        stats: snapshot.stats,
        avatar: snapshot.avatar,
        updatedAt: new Date()
    };
    const url = FIRESTORE_URL + "/players/" + encodeURIComponent(loadCloud().uid);
    let response = await fetchWithTimeout(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ fields: toFirestoreFields(doc) })
    });
    if (response.status === 401) {
        // Токен відкликано чи прострочено — пробуємо ще раз зі свіжим
        idToken = null;
        const fresh = await getIdToken();
        response = await fetchWithTimeout(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + fresh },
            body: JSON.stringify({ fields: toFirestoreFields(doc) })
        });
    }
    if (!response.ok) {
        const data = await response.json().catch(function () { return null; });
        throw new Error("Firestore: " + (data && data.error ? data.error.message : response.status));
    }
}

/**
 * Надіслати рейтинг у фоні. Поки йде надсилання, нові запити не дублюються,
 * а виконуються ще раз після нього. Помилки мережі не заважають грі.
 */
export function requestSync() {
    if (!getPlayerName()) {
        return;
    }
    if (syncRunning) {
        syncAgain = true;
        return;
    }
    syncRunning = true;
    setStatus("sending");
    sendPlayer().then(function () {
        setStatus("ok");
    }).catch(function (err) {
        console.warn("Рейтинг не надіслано:", err);
        setStatus("error");
    }).finally(function () {
        syncRunning = false;
        if (syncAgain) {
            syncAgain = false;
            requestSync();
        }
    });
}

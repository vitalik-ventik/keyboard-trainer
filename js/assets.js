// ============================================================
// assets.js — асинхронний завантажувач звуків та музики
// Web Audio API: ефекти з мінімальною затримкою + зациклена музика
// Конституція, Принцип IV: локальні файли, try/catch усюди
// ============================================================

const SOUND_FILES = {
    jump: "sounds/jump.wav",
    explode: "sounds/explode.wav",
    click: "sounds/click.wav"
};

const MUSIC_FILES = {
    menu: "music/menu.mp3",
    game: "music/game.mp3",
    gameover: "music/gameover.mp3",
    win: "music/win.mp3"
};

// Публічний доступ до AudioContext (лениве створення, suspended до жесту)
export const audio = {
    ctx: null
};

// Реєстр декодованих буферів: null = файл не завантажився (гра працює далі)
const registry = {
    sounds: { jump: null, explode: null, click: null },
    music: { menu: null, game: null, gameover: null, win: null }
};

let sfxGain = null;
let musicGain = null;
let currentMusicSource = null;
let currentMusicName = null;

// Лениве створення AudioContext та вузлів гучності
function ensureContext() {
    if (audio.ctx) {
        return audio.ctx;
    }
    try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) {
            return null;
        }
        audio.ctx = new Ctor();
        sfxGain = audio.ctx.createGain();
        sfxGain.gain.value = 0.9;
        sfxGain.connect(audio.ctx.destination);
        musicGain = audio.ctx.createGain();
        musicGain.gain.value = 0.45;
        musicGain.connect(audio.ctx.destination);
        return audio.ctx;
    } catch (err) {
        console.warn("Аудіо недоступне: не вдалося створити AudioContext.", err);
        audio.ctx = null;
        return null;
    }
}

// Завантаження та декодування одного файлу; ніколи не кидає — повертає буфер або null
async function loadOneBuffer(ctx, path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        return audioBuffer;
    } catch (err) {
        console.warn("Не вдалося завантажити аудіофайл «" + path + "» — гра продовжить без нього.", err);
        return null;
    }
}

/**
 * Асинхронно вантажить усі 8 аудіофайлів.
 * НІКОЛИ не reject-иться: невдалі файли лишаються null у реєстрі.
 * @param {(loaded:number, total:number) => void} onProgress
 * @returns {Promise<{sounds: Object, music: Object}>}
 */
export async function loadAssets(onProgress) {
    const ctx = ensureContext();
    const entries = [];
    for (const name of Object.keys(SOUND_FILES)) {
        entries.push({ kind: "sounds", name: name, path: SOUND_FILES[name] });
    }
    for (const name of Object.keys(MUSIC_FILES)) {
        entries.push({ kind: "music", name: name, path: MUSIC_FILES[name] });
    }
    const total = entries.length;
    let loaded = 0;

    if (!ctx) {
        // Аудіо повністю недоступне — миттєво "завантажено", гра працює в тиші
        for (let i = 0; i < total; i++) {
            loaded++;
            if (typeof onProgress === "function") {
                try {
                    onProgress(loaded, total);
                } catch (err) {
                    console.warn("Помилка колбека прогресу завантаження.", err);
                }
            }
        }
        return registry;
    }

    await Promise.all(entries.map(async (entry) => {
        const buffer = await loadOneBuffer(ctx, entry.path);
        registry[entry.kind][entry.name] = buffer;
        loaded++;
        if (typeof onProgress === "function") {
            try {
                onProgress(loaded, total);
            } catch (err) {
                console.warn("Помилка колбека прогресу завантаження.", err);
            }
        }
    }));

    return registry;
}

/**
 * Розблоковує AudioContext після першого жесту користувача
 * (autoplay-політика браузера). Ідемпотентно, ніколи не кидає.
 */
export function unlockAudio() {
    try {
        const ctx = ensureContext();
        if (ctx && ctx.state === "suspended") {
            ctx.resume().catch(function (err) {
                console.warn("Не вдалося відновити AudioContext.", err);
            });
        }
    } catch (err) {
        console.warn("Помилка розблокування аудіо.", err);
    }
}

/**
 * Відтворює звуковий ефект один раз.
 * Тихо ігнорує відсутній буфер або недоступний контекст.
 * @param {"jump"|"explode"|"click"} name
 */
export function playSound(name) {
    try {
        const ctx = audio.ctx;
        const buffer = registry.sounds[name];
        if (!ctx || !buffer || !sfxGain) {
            return;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(sfxGain);
        source.start(0);
    } catch (err) {
        console.warn("Не вдалося відтворити звук «" + name + "».", err);
    }
}

/**
 * Перемикає фонову музику: зупиняє попередній трек і запускає новий.
 * Повторний виклик із тим самим треком нічого не робить (музика триває).
 * name = null → повна тиша.
 * @param {"menu"|"game"|"gameover"|"win"|null} name
 * @param {boolean} loop
 */
export function playMusic(name, loop) {
    if (loop === undefined) {
        loop = true;
    }
    try {
        if (name === currentMusicName && currentMusicSource) {
            return;
        }
        if (currentMusicSource) {
            try {
                currentMusicSource.onended = null;
                currentMusicSource.stop();
            } catch (err) {
                // Джерело могло вже завершитися — це не помилка
            }
            currentMusicSource = null;
        }
        currentMusicName = name;
        if (name === null) {
            return;
        }
        const ctx = audio.ctx;
        const buffer = registry.music[name];
        if (!ctx || !buffer || !musicGain) {
            return;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        source.connect(musicGain);
        source.start(0);
        currentMusicSource = source;
        if (!loop) {
            source.onended = function () {
                if (currentMusicSource === source) {
                    currentMusicSource = null;
                    currentMusicName = null;
                }
            };
        }
    } catch (err) {
        console.warn("Не вдалося відтворити музику «" + name + "».", err);
    }
}

// ============================================================
// assets.js — асинхронний завантажувач звуків та музики
// Web Audio API: ефекти з мінімальною затримкою + зациклена музика
// Конституція, Принцип IV: локальні файли, try/catch усюди
// ============================================================

const SOUND_FILES = {
    jump: "sounds/jump.wav",
    explode: "sounds/explode.wav",
    click: "sounds/click.wav",
    // Зброя з магазину
    sword: "sounds/sword.wav",
    fire_sword: "sounds/fire_sword.wav",
    axe: "sounds/axe.wav",
    pickaxe: "sounds/pickaxe.wav",
    bow: "sounds/bow.wav",
    soccer: "sounds/soccer.wav",
    gun: "sounds/gun.wav",
    machine_gun: "sounds/machine_gun.wav",
    flamethrower: "sounds/flamethrower.wav",
    laser_gun: "sounds/laser_gun.wav",
    missile_boom: "sounds/missile_boom.wav",
    thunder: "sounds/thunder.wav",
    gravi_sound: "sounds/gravi_sound.wav",
    // Сундук (тимчасові синтезовані звуки — можна замінити файлами з тими самими іменами)
    chest_shake: "sounds/chest_shake.wav",
    chest_open: "sounds/chest_open.wav",
    chest_item: "sounds/chest_item.wav",
    chest_coins: "sounds/chest_coins.wav",
    // Фанфара нового досягнення
    achievement: "sounds/achievement.mp3"
};

// Звуки, яких може ще не бути в папці sounds/ — їх відсутність не вважається помилкою
const OPTIONAL_SOUNDS = ["chest_shake", "chest_open", "chest_item", "chest_coins"];

export function isOptionalSound(name) {
    return OPTIONAL_SOUNDS.indexOf(name) !== -1;
}

// Список усіх звукових ефектів (для сторінки перевірки звуків у preview)
export const SOUND_NAMES = Object.keys(SOUND_FILES);

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
    sounds: {},
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
async function loadOneBuffer(ctx, path, optional) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        return audioBuffer;
    } catch (err) {
        if (!optional) {
            console.warn("Не вдалося завантажити аудіофайл «" + path + "» — гра продовжить без нього.", err);
        }
        return null;
    }
}

/**
 * Скільки аудіофайлів буде завантажено (для лічильника на екрані завантаження).
 * @returns {number}
 */
export function audioFileCount() {
    return Object.keys(SOUND_FILES).length + Object.keys(MUSIC_FILES).length;
}

/**
 * Асинхронно вантажить усі аудіофайли (звуки й музику).
 * НІКОЛИ не reject-иться: невдалі файли лишаються null у реєстрі.
 * @param {(loaded:number, total:number) => void} onProgress
 * @returns {Promise<{sounds: Object, music: Object}>}
 */
export async function loadAssets(onProgress) {
    const ctx = ensureContext();
    const entries = [];
    for (const name of Object.keys(SOUND_FILES)) {
        entries.push({ kind: "sounds", name: name, path: SOUND_FILES[name], optional: isOptionalSound(name) });
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
        const buffer = await loadOneBuffer(ctx, entry.path, entry.optional);
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

// Час затухання в кінці обрізаного звуку, щоб не було клацання
const SOUND_FADE = 0.12;

/**
 * Відтворює звуковий ефект один раз.
 * Тихо ігнорує відсутній буфер або недоступний контекст.
 * opts (необов'язково): { offset — з якої секунди файлу почати,
 *   duration — скільки секунд грати (далі плавне затухання), volume — гучність 0..2 }
 * @param {string} name — ключ із SOUND_FILES
 * @returns {boolean} true — звук запущено
 */
export function playSound(name, opts) {
    try {
        const ctx = audio.ctx;
        const buffer = registry.sounds[name];
        if (!ctx || !buffer || !sfxGain) {
            return false;
        }
        const offset = opts && opts.offset ? Math.min(opts.offset, buffer.duration) : 0;
        const volume = opts && typeof opts.volume === "number" ? opts.volume : 1;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.value = volume;
        source.connect(gain);
        gain.connect(sfxGain);
        const now = ctx.currentTime;
        if (opts && opts.duration && offset + opts.duration < buffer.duration) {
            const fadeStart = now + Math.max(0, opts.duration - SOUND_FADE);
            gain.gain.setValueAtTime(volume, fadeStart);
            gain.gain.linearRampToValueAtTime(0, now + opts.duration);
            source.start(now, offset, opts.duration);
        } else {
            source.start(now, offset);
        }
        return true;
    } catch (err) {
        console.warn("Не вдалося відтворити звук «" + name + "».", err);
        return false;
    }
}

// Чи завантажено звук (для сторінки перевірки)
export function hasSound(name) {
    return !!registry.sounds[name];
}

// Тривалість файлу звуку в секундах або 0
export function soundDuration(name) {
    const buffer = registry.sounds[name];
    return buffer ? buffer.duration : 0;
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

// ============================================================
// keyboard.js — українська розкладка ЙЦУКЕН
// Матриця літер, обробка keydown за event.code (незалежно від
// системної розкладки та регістру), рендер клавіатури на Canvas
// Розумна індикація: cyan (пул), lime/yellow (ціль), red (помилка)
// Кольори пальців: кожна клавіша має смужку та відтінок кольору пальця,
// яким її натискають за десятипальцевим методом
// ============================================================

export const KEYS = [
    { code: "KeyQ", letter: "Й", row: 0, col: 0 },
    { code: "KeyW", letter: "Ц", row: 0, col: 1 },
    { code: "KeyE", letter: "У", row: 0, col: 2 },
    { code: "KeyR", letter: "К", row: 0, col: 3 },
    { code: "KeyT", letter: "Е", row: 0, col: 4 },
    { code: "KeyY", letter: "Н", row: 0, col: 5 },
    { code: "KeyU", letter: "Г", row: 0, col: 6 },
    { code: "KeyI", letter: "Ш", row: 0, col: 7 },
    { code: "KeyO", letter: "Щ", row: 0, col: 8 },
    { code: "KeyP", letter: "З", row: 0, col: 9 },
    { code: "BracketLeft", letter: "Х", row: 0, col: 10 },
    { code: "BracketRight", letter: "Ї", row: 0, col: 11 },
    { code: "KeyA", letter: "Ф", row: 1, col: 0 },
    { code: "KeyS", letter: "І", row: 1, col: 1 },
    { code: "KeyD", letter: "В", row: 1, col: 2 },
    { code: "KeyF", letter: "А", row: 1, col: 3 },
    { code: "KeyG", letter: "П", row: 1, col: 4 },
    { code: "KeyH", letter: "Р", row: 1, col: 5 },
    { code: "KeyJ", letter: "О", row: 1, col: 6 },
    { code: "KeyK", letter: "Л", row: 1, col: 7 },
    { code: "KeyL", letter: "Д", row: 1, col: 8 },
    { code: "Semicolon", letter: "Ж", row: 1, col: 9 },
    { code: "Quote", letter: "Є", row: 1, col: 10 },
    { code: "KeyZ", letter: "Я", row: 2, col: 0 },
    { code: "KeyX", letter: "Ч", row: 2, col: 1 },
    { code: "KeyC", letter: "С", row: 2, col: 2 },
    { code: "KeyV", letter: "М", row: 2, col: 3 },
    { code: "KeyB", letter: "И", row: 2, col: 4 },
    { code: "KeyN", letter: "Т", row: 2, col: 5 },
    { code: "KeyM", letter: "Ь", row: 2, col: 6 },
    { code: "Comma", letter: "Б", row: 2, col: 7 },
    { code: "Period", letter: "Ю", row: 2, col: 8 }
];

export const CODE_TO_LETTER = {};
for (const key of KEYS) {
    CODE_TO_LETTER[key.code] = key.letter;
}

const BLOCKED_CODES = new Set([
    "Space",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Tab",
    "Enter",
    "NumpadEnter"
]);

// Пробіл — пауза в грі та «далі» на екранах результату; Enter — підтвердження (сердечко)
const CONFIRM_CODES = new Set([
    "Space"
]);

const ENTER_CODES = new Set([
    "Enter",
    "NumpadEnter"
]);

export function initKeyboardInput(onLetter, onConfirm, onEscape, onEnter) {
    window.addEventListener("keydown", function (event) {
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }
        // Поле введення (ім'я для рейтингу) обробляє клавіші саме: літери й пробіл
        // мають друкуватися, а не керувати грою
        const target = event.target;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
            return;
        }
        if (event.code === "Escape") {
            if (!event.repeat && typeof onEscape === "function") {
                onEscape();
            }
            return;
        }
        if (BLOCKED_CODES.has(event.code)) {
            event.preventDefault();
        }
        if (CONFIRM_CODES.has(event.code)) {
            if (event.repeat) {
                return;
            }
            if (typeof onConfirm === "function") {
                onConfirm();
            }
            return;
        }
        if (ENTER_CODES.has(event.code)) {
            if (event.repeat) {
                return;
            }
            if (typeof onEnter === "function") {
                onEnter();
            }
            return;
        }
        const letter = CODE_TO_LETTER[event.code];
        if (!letter) {
            return;
        }
        event.preventDefault();
        if (event.repeat) {
            return;
        }
        if (typeof onLetter === "function") {
            onLetter(letter);
        }
    });
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// Ґ свідомо не показуємо й не використовуємо: вона рідкісна, а її клавіша
// в різних виробників стоїть у різних місцях
const ROW_COUNTS = [12, 11, 9];

// ---------- Пальці десятипальцевого методу ----------

// Колір кожного пальця (r, g, b) — однакові пальці обох рук мають однаковий колір,
// лише вказівні різняться, бо кожен із них відповідає за дві колонки
const FINGERS = {
    L_PINKY: { rgb: "255, 70, 170", name: "Мізинець" },
    L_RING: { rgb: "255, 140, 40", name: "Безіменний" },
    L_MIDDLE: { rgb: "60, 220, 110", name: "Середній" },
    L_INDEX: { rgb: "155, 123, 255", name: "Вказівний" },
    R_INDEX: { rgb: "77, 155, 255", name: "Вказівний" },
    R_MIDDLE: { rgb: "60, 220, 110", name: "Середній" },
    R_RING: { rgb: "255, 140, 40", name: "Безіменний" },
    R_PINKY: { rgb: "255, 70, 170", name: "Мізинець" }
};

// Дві схеми пальців. Верхній і середній ряди в них однакові, різниться нижній ряд
// лівої руки: у класичній кожен палець іде своєю колонкою (С — середнім),
// у косій пальці йдуть по діагоналі за зсувом ряду (С — вказівним, И — правим вказівним)
const FINGER_SCHEMES = {
    classic: {
        L_PINKY: ["Й", "Ф", "Я"],
        L_RING: ["Ц", "І", "Ч"],
        L_MIDDLE: ["У", "В", "С"],
        L_INDEX: ["К", "Е", "А", "П", "М", "И"],
        R_INDEX: ["Н", "Г", "Р", "О", "Т", "Ь"],
        R_MIDDLE: ["Ш", "Л", "Б"],
        R_RING: ["Щ", "Д", "Ю"],
        R_PINKY: ["З", "Х", "Ї", "Ж", "Є"]
    },
    diagonal: {
        L_PINKY: ["Й", "Ф"],
        L_RING: ["Ц", "І", "Я"],
        L_MIDDLE: ["У", "В", "Ч"],
        L_INDEX: ["К", "Е", "А", "П", "С", "М"],
        R_INDEX: ["Н", "Г", "Р", "О", "И", "Т", "Ь"],
        R_MIDDLE: ["Ш", "Л", "Б"],
        R_RING: ["Щ", "Д", "Ю"],
        R_PINKY: ["З", "Х", "Ї", "Ж", "Є"]
    }
};

export const FINGER_BY_LETTER = {};
let activeFingerScheme = "";

/**
 * Вибирає схему пальців ("classic" або "diagonal"). Після зміни клавіатуру
 * треба перемалювати (кеш клавіатури позначити застарілим).
 * @param {string} scheme
 */
export function setFingerScheme(scheme) {
    const name = FINGER_SCHEMES[scheme] ? scheme : "classic";
    if (name === activeFingerScheme) {
        return;
    }
    activeFingerScheme = name;
    const fingers = FINGER_SCHEMES[name];
    for (const letter in FINGER_BY_LETTER) {
        delete FINGER_BY_LETTER[letter];
    }
    for (const finger in fingers) {
        for (const letter of fingers[finger]) {
            FINGER_BY_LETTER[letter] = finger;
        }
    }
}

setFingerScheme("classic");

function fingerColor(letter, alpha) {
    const finger = FINGERS[FINGER_BY_LETTER[letter]];
    if (!finger) {
        return null;
    }
    return "rgba(" + finger.rgb + ", " + alpha + ")";
}

// ---------- Константи кольорів для розумної індикації ----------

const COLORS = {
    DEFAULT_FILL: "rgba(16, 20, 43, 0.9)",
    DEFAULT_STROKE: "rgba(70, 80, 120, 0.7)",
    DEFAULT_TEXT: "#5d6580",

    GROUP_FILL: "rgba(8, 32, 50, 0.9)",
    GROUP_STROKE: "rgba(0, 246, 255, 0.95)",
    GROUP_TEXT: "#ffffff",
    GROUP_GLOW: 6,
    GROUP_GLOW_COLOR: "rgba(0, 246, 255, 0.5)",

    TARGET_FILL: "rgba(20, 38, 10, 0.95)",
    TARGET_STROKE: "rgb(191, 255, 0)",
    TARGET_TEXT: "rgb(191, 255, 0)",
    TARGET_GLOW: 14,
    TARGET_GLOW_COLOR: "rgba(191, 255, 0, 0.6)",

    ERROR_FILL: "rgba(50, 10, 10, 0.95)",
    ERROR_STROKE: "rgb(255, 34, 34)",
    ERROR_TEXT: "rgb(255, 34, 34)",
    ERROR_GLOW: 14,
    ERROR_GLOW_COLOR: "rgba(255, 34, 34, 0.8)"
};

/**
 * Малює візуальну клавіатуру ЙЦУКЕН на Canvas.
 * Пріоритет підсвітки (від найвищого):
 *  1. wrongKeyError.letter — яскраво-червоний (помилка, згасає через 350 мс)
 *  2. targetLetter — яскравий зелено-жовтий (найближча ціль)
 *  3. groupLetters — м'який неоново-блакитний (пул рівня)
 *  4. Усе інше — тьмяно-сірий (недоступно)
 * Клавіші з виступами (А, О) додатково мають бурштинову позначку.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x:number, y:number, w:number, h:number}} area
 * @param {string[]} groupLetters
 * @param {string|null} targetLetter
 * @param {{letter: string|null, timestamp: number}} wrongKeyError
 * @param {number} time — секунди від старту застосунку
 */
// Геометрія клавіатури в межах області area (спільна для кешованої клавіатури та пульсації цілі)
// Зсув рядів, як на справжній клавіатурі (у ширинах клавіші): середній ряд
// починається на ¼ клавіші правіше за верхній, нижній — на ¾. Тому, наприклад,
// Я стоїть між Ф та І, а Ф — між Й та Ц
const ROW_OFFSETS = [0, 0.25, 0.75];

// Ширина всієї клавіатури в клавішах: найдовший ряд разом зі зсувом
function layoutUnits() {
    let units = 0;
    for (let r = 0; r < ROW_COUNTS.length; r++) {
        units = Math.max(units, ROW_OFFSETS[r] + ROW_COUNTS[r]);
    }
    return units;
}

function computeLayout(area) {
    const gap = Math.max(2, area.w * 0.006);
    const units = layoutUnits();
    const keyW = Math.min(
        (area.w - gap * (units - 1)) / units,
        (area.h - gap * 3) / 3 * 1.15
    );
    const keyH = Math.min((area.h - gap * 3) / 3, keyW * 1.05);
    const totalH = keyH * 3 + gap * 2;
    const startY = area.y + (area.h - totalH) / 2;
    return { gap: gap, keyW: keyW, keyH: keyH, startY: startY };
}

function keyPosition(area, layout, key) {
    // Уся клавіатура центрується як один блок, а ряди зсуваються відносно його лівого краю
    const unit = layout.keyW + layout.gap;
    const blockWidth = layoutUnits() * unit - layout.gap;
    const blockStartX = area.x + (area.w - blockWidth) / 2;
    const rowStartX = blockStartX + ROW_OFFSETS[key.row] * unit;
    return {
        x: rowStartX + key.col * (layout.keyW + layout.gap),
        y: layout.startY + key.row * (layout.keyH + layout.gap)
    };
}

/**
 * Яка літера під точкою дотику (координати в тих самих одиницях, що й area).
 * Дозволяє грати на сенсорному екрані, торкаючись клавіш на полотні.
 *
 * @param {{x:number, y:number, w:number, h:number}} area
 * @param {number} px
 * @param {number} py
 * @returns {string|null} велика літера або null, якщо дотик повз клавіші
 */
export function hitTestKey(area, px, py) {
    const layout = computeLayout(area);
    // Невеликий запас навколо клавіші, щоб дотик пальцем у проміжок теж рахувався
    const slop = layout.gap / 2;
    for (let i = 0; i < KEYS.length; i++) {
        const pos = keyPosition(area, layout, KEYS[i]);
        if (px >= pos.x - slop && px <= pos.x + layout.keyW + slop &&
            py >= pos.y - slop && py <= pos.y + layout.keyH + slop) {
            return KEYS[i].letter;
        }
    }
    return null;
}

/**
 * Пульсуюче світіння навколо цільової клавіші. Малюється щокадру поверх кешованої
 * клавіатури, тому анімація не вимагає перемальовувати всю клавіатуру.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x:number, y:number, w:number, h:number}} area
 * @param {string|null} targetLetter
 * @param {number} time — секунди від старту застосунку
 */
export function drawTargetPulse(ctx, area, targetLetter, time) {
    if (!targetLetter) {
        return;
    }
    const targetUpper = targetLetter.toUpperCase();
    const key = KEYS.find(function (k) { return k.letter === targetUpper; });
    if (!key) {
        return;
    }
    const layout = computeLayout(area);
    const pos = keyPosition(area, layout, key);
    const blink = (Math.sin(time * 6) + 1) / 2;
    const spread = 3 + blink * Math.min(8, layout.keyW * 0.14);
    ctx.save();
    roundRect(
        ctx,
        pos.x - spread,
        pos.y - spread,
        layout.keyW + spread * 2,
        layout.keyH + spread * 2,
        Math.min(8, layout.keyW * 0.16) + spread
    );
    // Ореол — широкий напівпрозорий штрих замість shadowBlur (без дорогого розмиття щокадру)
    ctx.globalAlpha = 0.15 + 0.25 * blink;
    ctx.lineWidth = 6 + 4 * blink;
    ctx.strokeStyle = COLORS.TARGET_GLOW_COLOR;
    ctx.stroke();
    ctx.globalAlpha = 0.35 + 0.5 * blink;
    ctx.lineWidth = 2;
    ctx.strokeStyle = COLORS.TARGET_STROKE;
    ctx.stroke();
    ctx.restore();
}

export function drawKeyboard(ctx, area, groupLetters, targetLetter, wrongKeyError, time) {
    const group = new Set((groupLetters || []).map(function (l) { return l.toUpperCase(); }));
    const targetUpper = (targetLetter || "").toUpperCase() || null;
    const layout = computeLayout(area);
    const keyW = layout.keyW;
    const keyH = layout.keyH;

    const now = time * 1000;
    let errLetter = null;
    if (wrongKeyError && wrongKeyError.letter && wrongKeyError.timestamp) {
        if (now - wrongKeyError.timestamp < 350) {
            errLetter = wrongKeyError.letter;
        }
    }

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold " + Math.floor(keyH * 0.44) + "px 'Segoe UI', Arial, sans-serif";

    for (const key of KEYS) {
        const pos = keyPosition(area, layout, key);
        const x = pos.x;
        const y = pos.y;

        let fill = COLORS.DEFAULT_FILL;
        let stroke = COLORS.DEFAULT_STROKE;
        let textColor = COLORS.DEFAULT_TEXT;
        let glow = 0;
        let glowColor = "rgba(0,0,0,0)";
        let state = "default";

        if (errLetter !== null && key.letter === errLetter.toUpperCase()) {
            fill = COLORS.ERROR_FILL;
            stroke = COLORS.ERROR_STROKE;
            textColor = COLORS.ERROR_TEXT;
            glow = COLORS.ERROR_GLOW;
            glowColor = COLORS.ERROR_GLOW_COLOR;
            state = "error";
        } else if (key.letter === targetUpper) {
            fill = COLORS.TARGET_FILL;
            stroke = COLORS.TARGET_STROKE;
            textColor = COLORS.TARGET_TEXT;
            glow = COLORS.TARGET_GLOW;
            glowColor = COLORS.TARGET_GLOW_COLOR;
            state = "target";
        } else if (group.has(key.letter)) {
            fill = COLORS.GROUP_FILL;
            stroke = COLORS.GROUP_STROKE;
            textColor = COLORS.GROUP_TEXT;
            glow = COLORS.GROUP_GLOW;
            glowColor = COLORS.GROUP_GLOW_COLOR;
            state = "group";
        }

        // Клавіші не з рівня напівпрозорі: колір пальця видно, але вони не відволікають
        // від літер рівня
        ctx.globalAlpha = state === "default" ? DEFAULT_KEY_ALPHA : 1;

        if (glow > 0) {
            var glowR = Math.round(Math.min(8, keyW * 0.16));
            var centerX = x + keyW / 2;
            var centerY = y + keyH / 2;
            var glowRadius = Math.max(keyW, keyH) * 0.7;
            var glowGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
            glowGrad.addColorStop(0, glowColor);
            glowGrad.addColorStop(1, "transparent");
            ctx.save();
            ctx.globalAlpha = 0.35;
            roundRect(ctx, x - glowR, y - glowR, keyW + glowR * 2, keyH + glowR * 2, Math.max(glowR + 2, keyW * 0.2));
            ctx.fillStyle = glowGrad;
            ctx.fill();
            ctx.restore();
        }
        const keyRadius = Math.min(8, keyW * 0.16);
        roundRect(ctx, x, y, keyW, keyH, keyRadius);
        ctx.fillStyle = fill;
        ctx.fill();
        drawFingerTint(ctx, key.letter, x, y, keyW, keyH, keyRadius, state);
        roundRect(ctx, x, y, keyW, keyH, keyRadius);
        ctx.lineWidth = state === "group" ? 3 : 2;
        ctx.strokeStyle = stroke;
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.fillText(key.letter, x + keyW / 2, y + keyH / 2 + 1);

        if (BUMP_KEYS.has(key.letter)) {
            drawBumpMark(ctx, x, y, keyW, keyH);
        }
    }

    ctx.restore();

    drawFingerLegend(ctx, area, layout);
}

// Прозорість клавіш, яких немає в рівні
const DEFAULT_KEY_ALPHA = 0.45;

// Відтінок і смужка кольору пальця зверху клавіші. Для недоступних клавіш — ледь
// помітно, щоб не сплутати з пулом рівня; для пулу й цілі — яскраво
const FINGER_TINT = {
    default: { fill: 0.12, stripe: 0.8 },
    group: { fill: 0.32, stripe: 1 },
    target: { fill: 0.0, stripe: 1 },
    error: { fill: 0.0, stripe: 0.6 }
};

function drawFingerTint(ctx, letter, x, y, keyW, keyH, radius, state) {
    const tint = FINGER_TINT[state] || FINGER_TINT.default;
    const fillColor = fingerColor(letter, tint.fill);
    const stripeColor = fingerColor(letter, tint.stripe);
    if (!fillColor) {
        return;
    }
    ctx.save();
    roundRect(ctx, x, y, keyW, keyH, radius);
    ctx.clip();
    if (tint.fill > 0) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, keyW, keyH);
    }
    ctx.fillStyle = stripeColor;
    ctx.fillRect(x, y, keyW, Math.max(3, keyH * 0.13));
    ctx.restore();
}

// Легенда пальців обабіч клавіатури: ліва рука зліва, права — справа.
// Малюється, лише якщо збоку вистачає місця
const LEGEND_LEFT = ["L_PINKY", "L_RING", "L_MIDDLE", "L_INDEX"];
const LEGEND_RIGHT = ["R_INDEX", "R_MIDDLE", "R_RING", "R_PINKY"];

function drawFingerLegend(ctx, area, layout) {
    const unit = layout.keyW + layout.gap;
    const blockWidth = layoutUnits() * unit - layout.gap;
    const sideSpace = (area.w - blockWidth) / 2;
    const fontSize = Math.max(10, Math.min(16, Math.floor(layout.keyH * 0.2)));
    const legendW = fontSize * 7.5;
    if (sideSpace < legendW + layout.gap * 2) {
        return;
    }
    const totalH = layout.keyH * 3 + layout.gap * 2;
    const lineH = totalH / 5;
    const dot = fontSize * 0.8;
    ctx.save();
    ctx.textBaseline = "middle";
    const sides = [
        { title: "Ліва рука", fingers: LEGEND_LEFT, right: false },
        { title: "Права рука", fingers: LEGEND_RIGHT, right: true }
    ];
    for (const side of sides) {
        // Легенда притискається до клавіатури: зліва — правим краєм, справа — лівим
        const x0 = side.right
            ? area.x + area.w - sideSpace + layout.gap * 2
            : area.x + sideSpace - layout.gap * 2 - legendW;
        ctx.font = "bold " + fontSize + "px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(200, 210, 240, 0.85)";
        ctx.fillText(side.title, x0, layout.startY + lineH * 0.5);
        ctx.font = fontSize + "px 'Segoe UI', Arial, sans-serif";
        for (let i = 0; i < side.fingers.length; i++) {
            const finger = FINGERS[side.fingers[i]];
            const cy = layout.startY + lineH * (i + 1.5);
            ctx.fillStyle = "rgba(" + finger.rgb + ", 0.95)";
            roundRect(ctx, x0, cy - dot / 2, dot * 1.6, dot, dot * 0.3);
            ctx.fill();
            ctx.fillStyle = "rgba(" + finger.rgb + ", 0.9)";
            ctx.fillText(finger.name, x0 + dot * 2.1, cy);
        }
    }
    ctx.restore();
}

// Клавіші з виступами (як F і J на англійській розкладці): від них рахують решту клавіш
export const BUMP_KEYS = new Set(["А", "О"]);

// Позначка виступу: тонка бурштинова рамка та опукла рисочка внизу клавіші,
// як на справжній клавіатурі — видно, навіть коли клавіша не з поточного рівня
function drawBumpMark(ctx, x, y, keyW, keyH) {
    const inset = Math.max(2, keyW * 0.06);
    ctx.save();
    roundRect(ctx, x + inset, y + inset, keyW - inset * 2, keyH - inset * 2, Math.min(6, keyW * 0.12));
    ctx.lineWidth = Math.max(1, keyW * 0.025);
    ctx.strokeStyle = "rgba(255, 196, 90, 0.7)";
    ctx.stroke();
    const barW = keyW * 0.36;
    const barH = Math.max(2, keyH * 0.07);
    const barX = x + (keyW - barW) / 2;
    const barY = y + keyH * 0.8;
    // Тінь під рисочкою — ніби вона випукла
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    roundRect(ctx, barX, barY + barH * 0.6, barW, barH, barH / 2);
    ctx.fill();
    ctx.fillStyle = "#ffd27a";
    roundRect(ctx, barX, barY, barW, barH, barH / 2);
    ctx.fill();
    ctx.restore();
}

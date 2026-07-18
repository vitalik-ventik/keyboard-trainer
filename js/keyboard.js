// ============================================================
// keyboard.js — українська розкладка ЙЦУКЕН
// Матриця літер, обробка keydown за event.code (незалежно від
// системної розкладки та регістру), рендер клавіатури на Canvas
// ============================================================

// Матриця клавіш: 33 українські літери у 3 рядах фізичної клавіатури.
// Службові клавіші (Shift, Enter, CapsLock, Space) НЕ відображаються.
export const KEYS = [
    // Ряд 1
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
    // Ряд 2
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
    { code: "Backslash", letter: "Ґ", row: 1, col: 11 },
    // Ряд 3
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

// Мапа фізичного коду клавіші → українська літера
export const CODE_TO_LETTER = {};
for (const key of KEYS) {
    CODE_TO_LETTER[key.code] = key.letter;
}

// Клавіші, стандартну поведінку яких блокуємо завжди:
// скрол Пробілом/Стрілками, фокус Tab-ом (FR-023), а також Enter —
// щоб дефолтний Enter не активував сфокусовану DOM-кнопку «фантомно»
// (FR-045, FR-046; спадок захисту фічі 002)
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

// Клавіша дії «підтвердження» — гаряча клавіша перезапуску рівня
// на екранах завершення (FR-044): Пробіл (заміна Enter, фіча 004)
const CONFIRM_CODES = new Set([
    "Space"
]);

/**
 * Вішає глобальний обробник keydown.
 * - event.code → літера ЙЦУКЕН: незалежно від системної розкладки
 *   та регістру (FR-022)
 * - preventDefault для Пробілу/Стрілок/Tab/Enter та ігрових літер
 *   (FR-023, FR-046)
 * - Пробіл: емітить onConfirm без автоповтору (FR-044, FR-047)
 * - комбінації з Ctrl/Alt/Meta не перехоплюються взагалі
 * @param {(letter: string) => void} onLetter
 * @param {() => void} [onConfirm] — необов'язковий колбек дії підтвердження;
 *   за відсутності Пробіл лише блокується
 */
export function initKeyboardInput(onLetter, onConfirm) {
    window.addEventListener("keydown", function (event) {
        // Комбінації з модифікаторами (Ctrl+..., Alt+..., Win+...)
        // не чіпаємо ВЗАГАЛІ — жодного preventDefault (research.md R3
        // фічі 004: Alt+Space — системне меню вікна Windows)
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }
        if (BLOCKED_CODES.has(event.code)) {
            event.preventDefault();
        }
        // Гаряча клавіша підтвердження: Пробіл (preventDefault уже
        // виконано вище — Space входить у BLOCKED_CODES)
        if (CONFIRM_CODES.has(event.code)) {
            if (event.repeat) {
                return;
            }
            if (typeof onConfirm === "function") {
                onConfirm();
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

// Заокруглений прямокутник (утиліта рендера)
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

// Кількість клавіш у кожному ряду (для центрування)
const ROW_COUNTS = [12, 12, 9];

/**
 * Малює візуальну клавіатуру ЙЦУКЕН на Canvas.
 * Підсвітка:
 *  - літери групи рівня — тьмяно-зелені (FR-020)
 *  - літера найближчого шипа — блимає червоним/жовтим
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x:number, y:number, w:number, h:number}} area
 * @param {string[]} groupLetters
 * @param {string|null} targetLetter
 * @param {number} time — секунди (для анімації блимання)
 */
export function drawKeyboard(ctx, area, groupLetters, targetLetter, time) {
    const group = new Set(groupLetters || []);
    const gap = Math.max(2, area.w * 0.006);
    const keyW = Math.min(
        (area.w - gap * 12) / 12,
        (area.h - gap * 3) / 3 * 1.15
    );
    const keyH = Math.min((area.h - gap * 3) / 3, keyW * 1.05);
    const totalH = keyH * 3 + gap * 2;
    const startY = area.y + (area.h - totalH) / 2;

    // Пульс блимання цільової клавіші: 0..1
    const blink = (Math.sin(time * 12) + 1) / 2;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold " + Math.floor(keyH * 0.44) + "px 'Segoe UI', Arial, sans-serif";

    for (const key of KEYS) {
        const rowCount = ROW_COUNTS[key.row];
        const rowWidth = rowCount * keyW + (rowCount - 1) * gap;
        const rowStartX = area.x + (area.w - rowWidth) / 2 + key.row * keyW * 0.18;
        const x = rowStartX + key.col * (keyW + gap);
        const y = startY + key.row * (keyH + gap);

        let fill = "rgba(16, 20, 43, 0.9)";
        let stroke = "rgba(70, 80, 120, 0.7)";
        let textColor = "#5d6580";
        let glow = 0;
        let glowColor = "rgba(0,0,0,0)";

        if (key.letter === targetLetter) {
            // Найближчий шип — яскраве блимання червоним/жовтим
            const r = Math.round(255);
            const g = Math.round(56 + (225 - 56) * blink);
            const b = Math.round(96 * (1 - blink) + 77 * blink);
            const c = "rgb(" + r + "," + g + "," + b + ")";
            fill = "rgba(60, 18, 30, 0.95)";
            stroke = c;
            textColor = c;
            glow = 18 + 14 * blink;
            glowColor = c;
        } else if (group.has(key.letter)) {
            // Літера групи рівня — тьмяно-зелена
            fill = "rgba(10, 38, 26, 0.9)";
            stroke = "rgba(57, 255, 136, 0.45)";
            textColor = "rgba(57, 255, 136, 0.75)";
            glow = 6;
            glowColor = "rgba(57, 255, 136, 0.35)";
        }

        ctx.shadowBlur = glow;
        ctx.shadowColor = glowColor;
        roundRect(ctx, x, y, keyW, keyH, Math.min(8, keyW * 0.16));
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = stroke;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = textColor;
        ctx.fillText(key.letter, x + keyW / 2, y + keyH / 2 + 1);
    }

    ctx.restore();
}

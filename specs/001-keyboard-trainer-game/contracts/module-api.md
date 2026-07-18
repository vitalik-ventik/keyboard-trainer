# Contract: Публічні API ES6-модулів

**Feature**: 001-keyboard-trainer-game | **Date**: 2026-07-18

Єдиний зовнішній інтерфейс застосунку — браузер (Canvas + DOM + клавіатура).
Внутрішні контракти — публічні експорти чотирьох модулів. Усе, що не
перелічено, — приватне для модуля. Зміна сигнатури нижче = зміна контракту.

## js/assets.js

```js
export const audio = {
  /** AudioContext (створюється лениво, suspended до першого жесту) */
  ctx: AudioContext | null,
};

/**
 * Асинхронно вантажить усі 8 аудіофайлів.
 * НІКОЛИ не reject-иться: невдалі файли → null у реєстрі (try/catch на файл).
 * @param {(loaded:number, total:number) => void} onProgress — для екрана LOADING
 * @returns {Promise<AssetRegistry>}  // див. data-model.md §11
 */
export async function loadAssets(onProgress);

/** Розблоковує AudioContext (виклик з першого pointerdown/keydown). Ідемпотентно. */
export function unlockAudio();

/** Відтворює ефект один раз; тихо ігнорує null-буфер. */
export function playSound(name /* 'jump'|'explode'|'victory'|'click' */);

/**
 * Перемикає фонову музику (зупиняє попередню). loop=true за замовч.
 * name=null → тиша. Тихо ігнорує null-буфер.
 */
export function playMusic(name /* 'menu'|'game'|'gameover'|'win'|null */, loop = true);
```

## js/keyboard.js

```js
/** Матриця клавіш ЙЦУКЕН: KeyDef[] (data-model.md §10). 33 літери, 3 ряди. */
export const KEYS;

/** Мапа event.code → українська літера (напр. 'KeyA' → 'Ф'). */
export const CODE_TO_LETTER;

/**
 * Вішає keydown/keyup на window.
 * - preventDefault для Space/стрілок/Tab та всіх ігрових клавіш (FR-023)
 * - розкладко- та регістро-незалежно (event.code, R3)
 * @param {(letter:string) => void} onLetter — колбек з українською літерою
 */
export function initKeyboardInput(onLetter);

/**
 * Малює візуальну клавіатуру на Canvas у прямокутнику area.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x,y,w,h}} area — нижня зона екрана
 * @param {string[]} groupLetters — літери рівня (підсвітка 'group')
 * @param {string|null} targetLetter — літера найближчого шипа ('target', блимає)
 * @param {number} time — секунди для анімації блимання
 */
export function drawKeyboard(ctx, area, groupLetters, targetLetter, time);
```

## js/engine.js

```js
/** Константи 6 рівнів: LevelDefinition[] (data-model.md §2). */
export const LEVELS;

export class Engine {
  /**
   * @param {number} levelId 1–6
   * @param {'EASY'|'HARD'} difficulty
   * @param {boolean} demoMode — true для заставки меню (автогра, без прогресу)
   */
  constructor(levelId, difficulty, demoMode = false);

  /**
   * Крок симуляції. Емітить події через колбеки, задані полями:
   *   onJump(), onExplode(), onVictory() — для звуку/музики в main.js
   * @param {number} dt — секунди, вже клампнуті (R4)
   */
  update(dt);

  /** Повний рендер кадру: фон(паралакс) → шипи → кубик → частинки → прогрес-бар. */
  render(ctx, W, H, time);

  /** Обробка літери від keyboard.js. Ігнорується в demoMode. */
  handleLetter(letter);

  /** Літера найближчого шипа попереду або null (для підсвітки 'target'). */
  getTargetLetter();

  /** Поточний RunState (data-model.md §6): progressPct, score, стан життя. */
  getState();

  /** 'running' | 'dead' (вибух завершено) | 'won' */
  getOutcome();
}

/** SaveManager (localStorage, R5; схема — storage-schema.md) */
export const save = {
  /** Повертає {progress: PlayerProgress, settings: Settings}; ніколи не кидає. */
  load(),
  /** Персистує поточний стан; ніколи не кидає (in-memory fallback). */
  persist(),
  /** Записує результат забігу; оновлює рекорди/розблокування тільки на краще. */
  recordResult(levelId, pct, score),
  setDifficulty(d /* 'EASY'|'HARD' */),
  getDifficulty(),
  getProgress(),      // PlayerProgress
  getLastPlayable(),  // number 1–6 — для кнопки «СТАРТ»
};
```

## js/main.js (точка входу — без експортів)

Зобов'язання перед іншими модулями та DOM:

1. Єдиний rAF-цикл; `dt` клампиться до 0.05 с (R4); пауза на `visibilitychange`.
2. State Manager зі станами `LOADING, MENU, SETTINGS, LEVEL_SELECT, PLAYING,
   GAMEOVER, VICTORY` і лише дозволеними переходами (data-model.md §1).
3. На кожен перехід: `playMusic()` відповідно до таблиці станів,
   показ/приховання DOM-оверлеїв, `playSound('click')` на кнопки (FR-007).
4. `LOADING → MENU` тільки після резолву `loadAssets()`.
5. У MENU крутить `Engine(levelId, 'EASY', demoMode=true)` як заставку.
6. Прокидає `initKeyboardInput` → `engine.handleLetter` (лише в PLAYING).

## DOM-контракт (index.html ↔ css/style.css ↔ main.js)

| id | Елемент | Показується у стані |
|----|---------|---------------------|
| `#gameCanvas` | canvas | завжди (фон для всього) |
| `#loadingScreen` | div «ЗАВАНТАЖЕННЯ...» + прогрес | LOADING |
| `#mainMenu` | div: `#btnStart` (центр), `#btnLevels` (зліва), `#btnSettings` (справа, шестірня) | MENU |
| `#settingsModal` | модалка: `#btnEasy`, `#btnHard`, `#btnCloseSettings` | SETTINGS |
| `#levelSelect` | сітка `.level-card` ×6 (2×3): номер, літери, «Кращий результат: Х% \| HighScore: Y очок», клас `.locked` із замком | LEVEL_SELECT |
| `#gameoverScreen` | div: %, `#btnRetry`, `#btnGoMenu` | GAMEOVER |
| `#victoryScreen` | div: рахунок, `#btnNext`, `#btnRetryWin`, `#btnWinMenu` | VICTORY |

Усі написи — українською (FR-028). Стилі: темний неоновий кіберпанк, кнопки
меню круглі, адаптивність до розміру вікна (FR-029).

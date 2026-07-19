# Contracts: Інтерфейси модулів

**Feature**: 011-league-level-restructure

Тип проекту: односторінковий веб-застосунок без зовнішніх API. Контракти описують інтерфейси між внутрішніми модулями.

---

## 1. LEVELS_CONFIG — Конфігурація ліг та рівнів

**Файл**: `js/engine.js` (експортована константа)

### Exported

```js
export const LEVELS_CONFIG: League[];
export const ALL_LEVELS: Level[];  // LEVELS_CONFIG.flatMap(l => l.levels)
```

### League Interface

```ts
interface League {
  id: number;       // 1..5
  name: string;     // "Базова" | "Середня" | "Складна" | "Майстер" | "Бос"
  levels: Level[];
}
```

### Level Interface

```ts
interface Level {
  id: number;          // Глобальний ID 1..31
  leagueId: number;    // ID ліги 1..5
  name: string;        // Унікальна назва, напр. "Перші кроки"
  letters: string[];   // Активні літери, 4..33 елементів
  speed: number;       // px/s
  spikeCount: number;
  seed: number;        // PRNG seed
  bgTheme: string;     // Ідентифікатор процедурного фону
  accentColor: string; // hex колір
  rhythmGroups: boolean;
}
```

### Інваріанти

- `ALL_LEVELS.length === 31`
- `ALL_LEVELS[i].id === i + 1` для всіх i
- `ALL_LEVELS[i].leagueId` відповідає лізі згідно з мапінгом
- `LEVELS_CONFIG[0].levels.length === 16` (Базова)
- `LEVELS_CONFIG[1].levels.length === 8` (Середня)
- `LEVELS_CONFIG[4].levels.length === 1` (Бос)

---

## 2. SaveManager — Управління прогресом

**Файл**: `js/engine.js` (експортований об'єкт `save`)

### Exported Methods

```ts
interface SaveManager {
  load(): { progress: PlayerProgress; settings: PlayerSettings };
  persist(): void;
  recordResult(levelId: number, pct: number, score: number): void;
  getProgress(): PlayerProgress;
  getLastPlayable(): number;
  setDifficulty(d: string): void;
  getDifficulty(): string;
  setHitWindow(s: string): void;
  getHitWindow(): string;
  setSpeed(s: string): void;
  getSpeed(): string;
}
```

### recordResult(levelId, pct, score) — поведінка

```
Input: levelId (1..31), pct (0..100), score (number ≥ 0)

1. Оновити progress.levels[levelId]:
   - bestPct = max(існуючий, pct)
   - highScore = max(існуючий, score)

2. ЯКЩО pct === 100:
   a. Знайти рівень за levelId у ALL_LEVELS
   b. ЯКЩО рівень НЕ останній у своїй лізі:
      - unlocked = levelId + 1
   c. ЯКЩО рівень останній у лізі І ліга не остання:
      - unlocked = перший рівень наступної ліги
   d. ЯКЩО рівень останній у лізі 4 (Майстер):
      - unlocked = 31 (Бос)

3. persist() — зберегти в localStorage

4. Повернути: { bestPct, highScore, unlocked: нове значення }
```

### Гарантії

- `getLastPlayable()` завжди повертає ID ≥ 1, ≤ 31
- `recordResult()` не кидає винятків (усі помилки localStorage оброблено)
- При пошкоджених даних `load()` повертає дефолтні значення

---

## 3. Engine — Ігровий рушій

**Файл**: `js/engine.js` (експортований клас `Engine`)

### Конструктор (оновлений)

```ts
constructor(level: Level, difficulty: string, leagueInfo?: LeagueInfo)

interface LeagueInfo {
  leagueName: string;   // "Базова"
  levelNumber: string;  // "1-1"
  levelName: string;    // "Перші кроки"
}
```

Якщо `leagueInfo` не передано (демо-режим), HUD показує старий формат «Рівень X» для зворотної сумісності.

### renderProgressBar() — оновлений HUD

```
Відображає вгорі Canvas:
  - Якщо leagueInfo передано:
    "Ліга: {leagueName} | {levelNumber}: {levelName}"
    + прогрес-бар
    + "Очки: {score} | {pct}%"
  - Якщо leagueInfo НЕ передано (демо):
    залишає стару поведінку
```

---

## 4. UI Functions — main.js

### buildLevelCards() — оновлений

```ts
function buildLevelCards(activeLeagueId: number): void
```

1. Генерує вкладки ліг (`#leagueTabs`) з `LEVELS_CONFIG`
2. Встановлює активну вкладку за `activeLeagueId` (за замовчуванням 1)
3. Генерує картки рівнів для активної ліги
4. Кожна картка містить:
   - `.level-title`: "L-N: Назва"
   - `.level-letters-preview`: перелік літер зменшеним шрифтом
   - CSS клас `.locked` якщо `level.id > save.getProgress().unlocked`

### setLevelState — оновлений

Оновлює стан `LEVEL_SELECT`: перемальовує картки з поточними даними прогресу.

---

## 5. DOM Structure — index.html (зміни)

```html
<div id="levelSelect" class="overlay hidden">
    <h2 class="neon-title">ВИБІР РІВНЯ</h2>
    <div id="leagueTabs" class="league-tabs">
        <!-- Генерується динамічно в buildLevelCards() -->
    </div>
    <div id="levelGrid" class="level-grid">
        <!-- Генерується динамічно в buildLevelCards() -->
    </div>
    <button id="btnLevelsBack" class="text-btn" type="button">НАЗАД</button>
</div>
```

### CSS — нові класи

```css
.league-tabs { /* flex-контейнер для вкладок */ }
.league-tab { /* одна вкладка */ }
.league-tab.active { /* активна вкладка: неонове підсвічування */ }
.level-title { /* заголовок рівня на картці: великий, жирний, по центру */ }
.level-letters-preview { /* прев'ю літер: зменшений, напівпрозорий */ }
```

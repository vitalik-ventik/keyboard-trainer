---

description: "Task list template for feature implementation"
---

# Tasks: Дитячий клавіатурний тренажер у стилі Geometry Dash

**Input**: Design documents from `/specs/001-keyboard-trainer-game/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Тести НЕ запитані специфікацією і не генеруються (Конституція забороняє npm-пакети → тест-фреймворки недоступні). Валідація — ручна за `quickstart.md`.

**Organization**: Задачі згруповано за user story для незалежної реалізації та перевірки кожної історії.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Можна виконувати паралельно (різні файли, без залежностей від незавершених задач)
- **[Story]**: До якої user story належить задача (US1–US5)
- Кожна задача містить точний шлях до файлу

## Path Conventions

- Статичний веб-застосунок у корені репозиторію (Конституція, Принцип II):
  `index.html`, `css/style.css`, `js/{main,assets,engine,keyboard}.js`,
  `sounds/`, `music/` — без `src/`, без `tests/`, без збірки.
- Обов'язково: повний код кожної функції без заглушок (Принцип VI); усі написи
  українською; try/catch на localStorage та аудіо (Принцип IV).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Каркас проєкту — розмітка, стилі, перевірка ресурсів

- [X] T001 Створити папки `css/` та `js/`; перевірити наявність аудіофайлів `sounds/jump.wav`, `sounds/explode.wav`, `sounds/victory.wav`, `sounds/click.wav`, `music/menu.mp3`, `music/game.mp3`, `music/gameover.mp3`, `music/win.mp3` (усі вже в репозиторії)
- [X] T002 Створити `index.html`: `<canvas id="gameCanvas">`, DOM-оверлеї точно за DOM-контрактом (`#loadingScreen`, `#mainMenu` з `#btnStart`/`#btnLevels`/`#btnSettings`, `#settingsModal` з `#btnEasy`/`#btnHard`/`#btnCloseSettings`, `#levelSelect` із контейнером карток, `#gameoverScreen` з `#btnRetry`/`#btnGoMenu`, `#victoryScreen` з `#btnNext`/`#btnRetryWin`/`#btnWinMenu`), підключення `<script type="module" src="js/main.js">`; усі написи українською (contracts/module-api.md, розділ «DOM-контракт»)
- [X] T003 [P] Створити `css/style.css`: повна неонова кіберпанк-стилістика — повноекранний canvas, темні напівпрозорі оверлеї, гігантська кругла кнопка «СТАРТ» по центру та круглі бічні кнопки, модалка налаштувань, сітка карток рівнів 2×3 (`.level-card`, стан `.locked` — сіра із замком, доступна — неонова з світінням), екрани поразки/перемоги, неоновий напис «ЗАВАНТАЖЕННЯ...», адаптивність до розміру вікна (FR-029)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Модулі-фундаменти, без яких жодна user story не працює

**⚠️ CRITICAL**: Жодна робота над user stories не починається до завершення цієї фази

- [X] T004 [P] Написати `js/assets.js` повністю за contracts/module-api.md: лениве створення `AudioContext` (`audio.ctx`), `loadAssets(onProgress)` — fetch+decodeAudioData усіх 8 файлів з try/catch на КОЖЕН файл (невдалий → `null`, без reject, консоль чиста), `unlockAudio()` (resume на перший жест, ідемпотентно), `playSound(name)` через одноразові `AudioBufferSourceNode`, `playMusic(name, loop)` із зупинкою попереднього треку та окремим `GainNode` для музики (research.md R2, data-model.md §11)
- [X] T005 [P] Написати `js/keyboard.js` повністю за contracts/module-api.md: константа `KEYS` — 33 українські літери ЙЦУКЕН у 3 рядах (research.md R3: ряд 1 `Й…Ї` KeyQ–BracketRight, ряд 2 `Ф…Є` KeyA–Quote + `Ґ` Backslash, ряд 3 `Я…Ю` KeyZ–Period), мапа `CODE_TO_LETTER`, `initKeyboardInput(onLetter)` за `event.code` (незалежно від розкладки/регістру, FR-022) з `preventDefault` для Space/стрілок/Tab та ігрових клавіш (FR-023), `drawKeyboard(ctx, area, groupLetters, targetLetter, time)` — блоки-клавіші без службових клавіш, підсвітка: `group` тьмяно-зелена, `target` блимає червоним/жовтим (FR-019, FR-020)
- [X] T006 [P] Написати в `js/engine.js` (частина 1): PRNG mulberry32, константу `LEVELS` — 6 рівнів за data-model.md §2 (літери L1 «А,О» … L6 «Ґ,Є,Ї,Ю,Я», швидкості, 15→50+ шипів, сіди, теми фонів, `rhythmGroups` для L6), генератор фіксованих трас (мін. дистанції від швидкості, без 3 однакових літер поспіль, ритмічні групи 2–4 для L6, `finishX`), об'єкт `save` (SaveManager) за contracts/storage-schema.md — ключ `dfp_save_v1`, try/catch читання/запису, in-memory fallback, `recordResult` оновлює рекорди лише на краще та розблоковує наступний рівень при 100% (FR-014, FR-015; research.md R5, R6)
- [X] T007 Написати скелет `js/main.js`: ініціалізація canvas із devicePixelRatio та перерахунком на `resize` (research.md R7), єдиний rAF-цикл з клампом `dt ≤ 0.05 с` та паузою на `visibilitychange` (research.md R4, FR-027), State Manager зі станами `LOADING, MENU, SETTINGS, LEVEL_SELECT, PLAYING, GAMEOVER, VICTORY` і лише дозволеними переходами (data-model.md §1), `setState()` — перемикання DOM-оверлеїв і музики за таблицею станів (FR-003, FR-004), `playSound('click')` на всі кнопки (FR-007), `unlockAudio()` на перший pointerdown/keydown

**Checkpoint**: Фундамент готовий — можна починати user stories

---

## Phase 3: User Story 1 - Проходження рівня через натискання літер (Priority: P1) 🎯 MVP

**Goal**: Повний ігровий цикл: кубик їде, літери-шипи, ритм-стрибки, прогрес 0–100%, вибух/перемога, збереження результату

**Independent Test**: Запустити Рівень 1 (тимчасово — одразу з `setState('PLAYING')` або через кнопку «СТАРТ»): правильні літери в зоні колізії ведуть до 100% і екрана перемоги; зіткнення з шипом — вибух із частинками та екран поразки (quickstart.md V2)

### Implementation for User Story 1

- [X] T008 [US1] Написати в `js/engine.js` клас `Engine` (ядро): конструктор `(levelId, difficulty, demoMode)`, фізика кубика (гравітація, стрибок лише з землі, обертання в польоті, trail до ~20 точок), рух світу зі швидкістю рівня, `HitWindow` від швидкості (шире на повільних рівнях, data-model.md §5), `handleLetter()` — зарахування стрибка тільки у вікні перед шипом (FR-021), правила EASY (завчасні/неправильні ігноруються, вибух лише від контакту — FR-009) та HARD (не та літера або пропуск вікна — миттєвий вибух, FR-010), фізична колізія з шипом, вибух 24–40 частинок, `score` (+10 стрибок, +5 perfect) і `combo`, `progressPct`, колбеки `onJump/onExplode/onVictory`, методи `getTargetLetter()/getState()/getOutcome()` (contracts/module-api.md)
- [X] T009 [US1] Написати в `js/engine.js` метод `Engine.render(ctx, W, H, time)` (світ): земля, шипи з українськими літерами над ними, неоновий кубик із trail та обертанням, частинки вибуху, смуга прогресу 0–100% зверху екрана (FR-018, FR-024, FR-026); пропорції — земля ≈72% висоти, зона клавіатури — нижні 26% (research.md R7)
- [X] T010 [US1] Додати в `js/engine.js` три процедурні паралакс-теми фону в `Engine.render`: `grid` — рухома темно-синя неонова сітка (L1–2), `city` — далекі фіолетові хмарочоси/гори з сяючими вікнами у 2+ шарах паралаксу (L3–4), `boss` — пульсуюче рожево-бірюзове тло, лінії еквалайзера в такт (амплітуда від `combo`/часу), світлові хвилі від правильних натискань (L5–6) (FR-025; spec US1/V6)
- [X] T011 [US1] Реалізувати в `js/main.js` стан PLAYING: створення `new Engine(levelId, save.getDifficulty(), false)`, `initKeyboardInput` → `engine.handleLetter` лише у PLAYING, у циклі — `engine.update(dt)`, `engine.render(...)`, `drawKeyboard(ctx, нижня зона, level.letters, engine.getTargetLetter(), time)`; колбеки: `onJump→playSound('jump')`, `onExplode→playSound('explode')`, `onVictory→playSound('victory')`; за `getOutcome()` — перехід у GAMEOVER або VICTORY (FR-004)
- [X] T012 [US1] Реалізувати в `js/main.js` екрани GAMEOVER та VICTORY: показ відсотка проходження і рахунку в DOM-оверлеях, при VICTORY — виклик `save.recordResult(levelId, 100, score)`, при GAMEOVER — `save.recordResult(levelId, pct, score)` (рекорди лише на краще, FR-015), кнопки `#btnRetry`/`#btnRetryWin` — перезапуск рівня, `#btnGoMenu`/`#btnWinMenu` — у MENU, `#btnNext` — наступний рівень якщо відкритий (spec US1 сценарій 4)

**Checkpoint**: User Story 1 повністю грабельна — MVP готовий

---

## Phase 4: User Story 2 - Головне меню з демо-заставкою (Priority: P2)

**Goal**: Меню в стилі GD: демо-кубик сам грає на тлі, меню-музика, три круглі кнопки

**Independent Test**: Відкрити застосунок до меню: демо-кубик стрибає сам, після першого кліку грає menu.mp3, «СТАРТ» запускає останній відкритий рівень (quickstart.md V1)

### Implementation for User Story 2

- [X] T013 [US2] Додати в `js/engine.js` режим `demoMode`: автогра — Engine сам викликає стрибок при вході правильної літери у вікно (ідеальний таймінг), прогрес/рекорди НЕ записуються, після вибуху/фінішу траса перезапускається безшовно (spec US2, Assumption про демо)
- [X] T014 [US2] Реалізувати в `js/main.js` стан MENU: фоновий демо-`Engine(1..unlocked, 'EASY', true)` рендериться під DOM-кнопками, `playMusic('menu')` (продовжується у SETTINGS/LEVEL_SELECT), `#btnStart` → PLAYING з `save.getLastPlayable()` (FR-006), `#btnLevels` → LEVEL_SELECT, `#btnSettings` → SETTINGS (FR-005..FR-007)

**Checkpoint**: User Stories 1–2 працюють незалежно

---

## Phase 5: User Story 3 - Вибір рівня з картками прогресу (Priority: P3)

**Goal**: Сітка 6 карток 2×3 з рекордами, блокуванням і розблокуванням за 100%

**Independent Test**: З чистим збереженням доступний лише Рівень 1 (решта сірі із замком); після 100% Рівня 1 картка Рівня 2 стає неоновою, рекорди на картках оновлюються (quickstart.md V3)

### Implementation for User Story 3

- [X] T015 [US3] Реалізувати в `js/main.js` стан LEVEL_SELECT: динамічна побудова 6 карток `.level-card` з `LEVELS` та `save.getProgress()` — номер, літери рівня (`newLetters`), рядок «Кращий результат: Х% | HighScore: Y очок», клас `.locked` для закритих (клік ігнорується), клік по відкритій → PLAYING з обраним рівнем (FR-012, FR-013)
- [X] T016 [US3] Реалізувати в `js/main.js` наскрізне оновлення прогресії: повернення у LEVEL_SELECT після забігу перебудовує картки з новими рекордами/розблокуваннями, `#btnNext` на VICTORY веде на щойно розблокований рівень (або ховається на Рівні 6 чи якщо наступний закритий) (FR-014; spec US3 сценарій 2)

**Checkpoint**: User Stories 1–3 працюють незалежно

---

## Phase 6: User Story 4 - Налаштування складності EASY/HARD (Priority: P4)

**Goal**: Модалка поверх меню з вибором складності, що зберігається між сеансами

**Independent Test**: EASY — помилкове натискання далеко від шипа ігнорується; HARD — миттєвий вибух; вибір переживає перезавантаження сторінки (quickstart.md V4)

### Implementation for User Story 4

- [X] T017 [US4] Реалізувати в `js/main.js` стан SETTINGS: відкриття `#settingsModal` поверх меню (демо і музика тривають), кнопки `#btnEasy`/`#btnHard` — активна підсвічена, вибір → `save.setDifficulty()` + `save.persist()`, `#btnCloseSettings` → MENU; складність застосовується при кожному старті рівня (FR-008, FR-011; поведінка EASY/HARD вже в Engine з T008)

**Checkpoint**: User Stories 1–4 працюють незалежно

---

## Phase 7: User Story 5 - Екран завантаження ресурсів (Priority: P5)

**Goal**: Неоновий екран «ЗАВАНТАЖЕННЯ...» до готовності аудіо; стійкість до відсутніх файлів

**Independent Test**: При відкритті видно «ЗАВАНТАЖЕННЯ...» з лічильником; після resolve — меню; з перейменованим jump.wav гра запускається без звуку стрибка і без фатальних помилок (quickstart.md V1, V5)

### Implementation for User Story 5

- [X] T018 [US5] Реалізувати в `js/main.js` стан LOADING: показ `#loadingScreen` з прогресом `X/8` через колбек `onProgress` від `loadAssets()`, автоперехід `LOADING → MENU` після resolve (FR-001), гра коректно працює з `null`-буферами відсутніх файлів (FR-002; тиха деградація вже в assets.js з T004)

**Checkpoint**: Усі user stories функціонують незалежно

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Відповідність Конституції, продуктивність, фінальна валідація

- [X] T019 [P] Аудит відповідності Конституції по всіх файлах (`index.html`, `css/style.css`, `js/*.js`): нуль зовнішніх URL/CDN (вкладка Network — лише localhost), try/catch на всіх зверненнях до localStorage та аудіо, жодних заглушок типу «// додайте код тут», усі написи та коментарі українською (Принципи I, IV, VI; FR-028)
- [ ] T020 [P] Перевірка продуктивності на Рівні 6 (бос: 50+ шипів, еквалайзер, частинки, хвилі): стабільні 60 FPS без ривків, за потреби оптимізувати рендер у `js/engine.js` (кешування градієнтів, ліміт частинок) (SC-004; FR-027)
- [ ] T021 Повна ручна валідація за `specs/001-keyboard-trainer-game/quickstart.md` (сценарії V1–V6) з виправленням знайдених дефектів у відповідних файлах; переконатися, що консоль чиста в усіх сценаріях, включно з edge cases (розкладка EN, згорнуте вікно, приватний режим)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: без залежностей — старт одразу
- **Foundational (Phase 2)**: після Phase 1 — БЛОКУЄ всі user stories
- **User Stories (Phase 3–7)**: після Phase 2
  - US1 (P1) — перша: створює клас Engine, який використовують US2 (демо) і далі
  - US2 залежить від Engine (T008–T010) для демо-режиму
  - US3 залежить від завершення забігу (T012) для оновлення рекордів
  - US4 та US5 — незалежні від US2/US3 (потрібні лише Phase 2 + Engine для перевірки US4)
- **Polish (Phase N)**: після всіх бажаних user stories

### User Story Dependencies

- **US1 (P1)**: лише Foundational — самодостатній MVP
- **US2 (P2)**: Foundational + Engine з US1 (T008–T010)
- **US3 (P3)**: Foundational + результати забігів з US1 (T012)
- **US4 (P4)**: Foundational + правила EASY/HARD з US1 (T008)
- **US5 (P5)**: лише Foundational (T004, T007)

### Within Each User Story

- engine.js → main.js (логіка перед підключенням до станів)
- Задачі в одному файлі — строго послідовно (без [P])

### Parallel Opportunities

- Phase 1: T003 (css) паралельно з T002 (html) після T001
- Phase 2: T004 (assets.js), T005 (keyboard.js), T006 (engine.js ч.1) — три різні файли, повністю паралельно; T007 (main.js) — після них
- Phase 7 (US5) можна виконувати паралельно з Phase 4–6 (інший розробник)
- Polish: T019 і T020 паралельно

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Запустити три фундаментні модулі паралельно (різні файли):
Task: "Написати js/assets.js повністю за contracts/module-api.md"
Task: "Написати js/keyboard.js повністю за contracts/module-api.md"
Task: "Написати js/engine.js частина 1: LEVELS, PRNG, траси, SaveManager"

# Потім послідовно:
Task: "Написати скелет js/main.js: rAF, State Manager, музика за станом"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001–T003)
2. Phase 2: Foundational (T004–T007) — КРИТИЧНО, блокує все
3. Phase 3: US1 (T008–T012)
4. **STOP і ВАЛІДУВАТИ**: quickstart.md V2 — рівень грається від старту до перемоги/поразки
5. Демо готове: гра запускається одразу в рівень

### Incremental Delivery

1. Setup + Foundational → фундамент
2. US1 → ядро геймплею → перевірити V2 (MVP!)
3. US2 → меню з демо → перевірити V1
4. US3 → картки і прогресія → перевірити V3
5. US4 → складність → перевірити V4
6. US5 → екран завантаження → перевірити V1, V5
7. Polish → V1–V6 повністю, аудит Конституції

---

## Notes

- Проєкт має лише 6 файлів коду — більшість задач у межах story послідовні
  (спільні файли); паралелізм зосереджений у Phase 2
- Кожна задача самодостатня: контракти зафіксовані в
  `contracts/module-api.md` і `contracts/storage-schema.md`
- Принцип VI Конституції: кожна функція пишеться повністю, без заглушок
- Валідація після кожного checkpoint — відповідний сценарій quickstart.md

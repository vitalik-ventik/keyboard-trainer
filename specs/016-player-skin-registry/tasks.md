# Tasks: Реєстр скінів гравця (31 рівень)

**Input**: Design documents from `/specs/016-player-skin-registry/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/skin-renderer-api.md, quickstart.md

**Tests**: Не передбачено специфікацією — ручне візуальне тестування через quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Source: `js/engine.js` (основний файл змін), `js/main.js` (VICTORY-сповіщення)
- Config: `js/engine.js` (LEVELS_CONFIG)
- No new files created

---

## Phase 1: Foundational (Блокувальні передумови)

**Purpose**: Інфраструктура двигуна та сховища, необхідна для всіх користувацьких історій

**⚠️ CRITICAL**: Жодна користувацька історія не може початися до завершення цієї фази

- [x] T001 Додати поле `this.currentTime = 0` в конструктор Engine у `js/engine.js` (рядок ~405, після існуючих полів конструктора)
- [x] T002 Оновити `this.currentTime = performance.now()` на початку методу `Engine.update(dt)` у `js/engine.js` (рядок ~600)
- [x] T003 Додати `this.player.meteorTrail = []` в метод `Engine.reset()` у `js/engine.js` (рядок ~440, після `this.player.trail`)
- [x] T004 Розширити `defaultSaveData()` — додати `unlockedSkins: []` до `progress` у `js/engine.js` (рядки 194–204)
- [x] T005 Розширити `sanitizeSaveData()` — додати валідацію `unlockedSkins` як `Array.isArray` із fallback на `[]` у `js/engine.js` (рядки 206–243)
- [x] T006 Модифікувати `save.recordResult()` — при `pct >= 100` додавати `level.skin.id` до `unlockedSkins` (якщо ще немає) та повертати `{ skinUnlocked: level.skin }` у `js/engine.js` (рядки 277–313)

**Checkpoint**: Engine готовий — `currentTime`, `meteorTrail`, `unlockedSkins` ініціалізуються та зберігаються коректно

---

## Phase 2: User Story 1 — Базовий скін доступний одразу (Priority: P1) 🎯 MVP

**Goal**: Кубик рендериться з базовим скіном «Стандартний Неон» через обертання навколо центру. Словник `SKIN_RENDERERS` створено як інфраструктуру для всіх майбутніх скінів.

**Independent Test**: Запустити гру на рівні 1-1. Кубик синій із білою рамкою і внутрішнім світінням. При стрибку скін обертається без спотворень.

### Implementation for User Story 1

- [x] T007 [US1] Створити об'єкт-словник `const SKIN_RENDERERS = {}` після `getLevelById()` у `js/engine.js` (після рядка ~95)
- [x] T008 [P] [US1] Реалізувати функцію `SKIN_RENDERERS.neon_base(ctx, size, time)` — яскраво-синій квадрат із `createLinearGradient`, внутрішнє світіння через `shadowBlur`, біла тонка рамка через `strokeRect` у `js/engine.js`
- [x] T009 [US1] Модифікувати `renderPlayer(ctx, groundY, anchorX)` — замінити існуючий рендеринг кубика (рядки 938–959) на: `ctx.save()/translate/rotate`, виклик `SKIN_RENDERERS[this.level.skin.renderType]` або fallback до `neon_base`, `ctx.restore()` у `js/engine.js`

**Checkpoint**: Кубик на будь-якому рівні рендериться з базовим неоновим скіном і коректно обертається

---

## Phase 3: User Story 2 — Розблокування скіна при першому проходженні (Priority: P1)

**Goal**: При першому проходженні рівня гравець бачить сповіщення «Розблоковано новий скін: [Назва]!» на екрані VICTORY.

**Independent Test**: Пройти рівень 1-1 уперше → сповіщення на екрані VICTORY. Пройти повторно → сповіщення немає.

### Implementation for User Story 2

- [x] T010 [US2] Модифікувати `handleVictory()` у `js/main.js` (рядки 186–221) — після виклику `save.recordResult()` перевіряти `result.skinUnlocked`; якщо є — встановити `victoryUnlockEl.textContent = "Розблоковано новий скін: " + result.skinUnlocked.name + "!"`

**Checkpoint**: Екран VICTORY показує сповіщення про новий скін лише при першому проходженні

---

## Phase 4: User Story 3 — Унікальний скін для кожного з 31 підрівня (Priority: P1)

**Goal**: Кожен підрівень має власне поле `skin` у `LEVELS_CONFIG` та відповідну функцію рендерингу в `SKIN_RENDERERS`.

**Independent Test**: Для кожного з 31 рівнів кубик візуально відрізняється та відповідає опису з реєстру.

### Phase 4a: Конфігурація LEVELS_CONFIG — усі 31 поле `skin`

- [x] T011 [US3] Додати поле `skin: { id: "skin_1_1", name: "Стандартний Неон", renderType: "neon_base" }` до рівня 1-1 в `LEVELS_CONFIG` у `js/engine.js`
- [x] T012 [P] [US3] Додати поля `skin` до рівнів 1-2, 1-3, 1-4, 1-5 у `LEVELS_CONFIG` у `js/engine.js`
- [x] T013 [P] [US3] Додати поля `skin` до рівнів 1-6, 1-7, 1-8, 1-9, 1-10 у `LEVELS_CONFIG` у `js/engine.js`
- [x] T014 [P] [US3] Додати поля `skin` до рівнів 1-11, 1-12, 1-13, 1-14, 1-15, 1-16 у `LEVELS_CONFIG` у `js/engine.js`
- [x] T015 [P] [US3] Додати поля `skin` до рівнів 2-1, 2-2, 2-3, 2-4, 2-5, 2-6, 2-7, 2-8 у `LEVELS_CONFIG` у `js/engine.js`
- [x] T016 [P] [US3] Додати поля `skin` до рівнів 3-1, 3-2, 3-3, 3-4 у `LEVELS_CONFIG` у `js/engine.js`
- [x] T017 [P] [US3] Додати поля `skin` до рівнів 4-1, 4-2 у `LEVELS_CONFIG` у `js/engine.js`
- [x] T018 [US3] Додати поле `skin: { id: "skin_5_1", name: "ЛОРД ДЕМОНІВ", renderType: "demon_lord" }` до рівня 5-1 у `LEVELS_CONFIG` у `js/engine.js`

### Phase 4b: Функції рендерингу — Група 1: Базова ліга (16 скінів)

- [x] T019 [US3] Реалізувати `SKIN_RENDERERS.neon_base` — яскраво-синій квадрат із градієнтом, `shadowBlur` світіння, біла рамка `strokeRect` у `js/engine.js` (якщо не зроблено в T008 — інакше перевірити відповідність)
- [x] T020 [P] [US3] Реалізувати `SKIN_RENDERERS.cyber_eye` — бірюзове коло-зіниця, зміщене до правого краю, зі світінням через `shadowBlur` у `js/engine.js`
- [x] T021 [P] [US3] Реалізувати `SKIN_RENDERERS.retro_gamer` — дві зелені вертикальні лінії по боках + горизонтальна риска знизу (усмішка) у `js/engine.js`
- [x] T022 [P] [US3] Реалізувати `SKIN_RENDERERS.throne` — дві діагональні перехресні лінії (X-подібний візерунок) фіолетового кольору через `lineTo` у `js/engine.js`
- [x] T023 [P] [US3] Реалізувати `SKIN_RENDERERS.crosshair` — червоне коло + хрестик із тонких ліній по центру через `arc` + `lineTo` у `js/engine.js`
- [x] T024 [P] [US3] Реалізувати `SKIN_RENDERERS.matrix_pixel` — темно-зелене тло + 3 фіксовані яскраво-зелені квадрати (позиції через замикання або статичний масив) через `fillRect` у `js/engine.js`
- [x] T025 [P] [US3] Реалізувати `SKIN_RENDERERS.slice` — діагональний поділ: помаранчева нижня половина (`fillRect` відрізана через `beginPath/lineTo/clip`), темно-сірий верх у `js/engine.js`
- [x] T026 [P] [US3] Реалізувати `SKIN_RENDERERS.shining_diamond` — ромб усередині через `lineTo` із підвищеним `globalAlpha` відносно країв у `js/engine.js`
- [x] T027 [P] [US3] Реалізувати `SKIN_RENDERERS.double_frame` — бордовий кубик + дві концентричні рамки, що пульсують через `sin(time * 0.005) * 2` у `js/engine.js`
- [x] T028 [P] [US3] Реалізувати `SKIN_RENDERERS.monolith` — матово-сірий фон + товста біла вертикальна смуга по центру через `fillRect` у `js/engine.js`
- [x] T029 [P] [US3] Реалізувати `SKIN_RENDERERS.radar` — світло-сірі концентричні кола, що розходяться від центру через `arc` зі збільшенням радіуса у `js/engine.js`
- [x] T030 [P] [US3] Реалізувати `SKIN_RENDERERS.speed_arrow` — дві жовті стрілки `>>` через `lineTo` + `strokeStyle`, спрямовані вправо у `js/engine.js`
- [x] T031 [P] [US3] Реалізувати `SKIN_RENDERERS.neon_cross` — яскраво-жовтий плюс `+` на весь розмір кубика з `shadowBlur` через `fillRect` у `js/engine.js`
- [x] T032 [P] [US3] Реалізувати `SKIN_RENDERERS.liquid_gradient` — `createLinearGradient` від глибокого червоного до фіолетового, заповнення всього кубика у `js/engine.js`
- [x] T033 [P] [US3] Реалізувати `SKIN_RENDERERS.winged` — синій кубик + маленькі трикутники-крила з боків (за межами `-size/2..+size/2` на 5–7px) через `lineTo` у `js/engine.js`
- [x] T034 [P] [US3] Реалізувати `SKIN_RENDERERS.light_cup` — смарагдовий фон + золота 5-кутна зірка в центрі через `lineTo` з 5 точками у `js/engine.js`

### Phase 4c: Функції рендерингу — Група 2: Середня ліга (8 скінів)

- [x] T035 [P] [US3] Реалізувати `SKIN_RENDERERS.synthwave_sun` — верхня половина рожева, нижня має 3 горизонтальні чорні смуги-прорізи через `fillRect` у `js/engine.js`
- [x] T036 [P] [US3] Реалізувати `SKIN_RENDERERS.cyberpunk_horizon` — горизонтальний фіолетово-жовтий градієнт + тонка нео-синя лінія зверху через `createLinearGradient` + `strokeRect` у `js/engine.js`
- [x] T037 [P] [US3] Реалізувати `SKIN_RENDERERS.glitch_cube` — червоний та синій зміщені контури кубика (ефект хроматичної аберації) через два `strokeRect` з різними зсувами у `js/engine.js`
- [x] T038 [P] [US3] Реалізувати `SKIN_RENDERERS.gold_ingot` — золотий дзеркальний градієнт через `createLinearGradient` + маленький білий ромб у верхньому кутку через `lineTo` у `js/engine.js`
- [x] T039 [P] [US3] Реалізувати `SKIN_RENDERERS.orbit` — центральне коло-ядро + тонкий нахилений еліпс-кільце через `arc` + `ellipse` (або `save/scale/arc/restore`) у `js/engine.js`
- [x] T040 [P] [US3] Реалізувати `SKIN_RENDERERS.stalagmite` — нижній край із гострими трикутними зубцями через `lineTo` (3–4 зубці) у `js/engine.js`
- [x] T041 [P] [US3] Реалізувати `SKIN_RENDERERS.equalizer` — 3 вертикальні кольорові смуги різної висоти всередині кубика через `fillRect` у `js/engine.js`
- [x] T042 [P] [US3] Реалізувати `SKIN_RENDERERS.shield` — залізно-сірий фон + 4 точки-заклепки по кутах через `arc` + `fill` у `js/engine.js`

### Phase 4d: Функції рендерингу — Група 3: Складна ліга (4 скіни)

- [x] T043 [P] [US3] Реалізувати `SKIN_RENDERERS.plasma` — радіальний градієнт із центру, радіус = `size/2 + Math.sin(time * 0.003) * 8` через `createRadialGradient` у `js/engine.js`
- [x] T044 [P] [US3] Реалізувати `SKIN_RENDERERS.vortex` — спіраль із 3 витків від центру до кутів через `lineTo` (апроксимація 15–20 точками) у `js/engine.js`
- [x] T045 [P] [US3] Реалізувати `SKIN_RENDERERS.quantum_barrier` — прозоре тіло (`globalAlpha ~0.15`) + товста яскраво-біла рамка з максимальним `shadowBlur` у `js/engine.js`
- [x] T046 [P] [US3] Реалізувати `SKIN_RENDERERS.meteor` — базовий кубик + малювання 2 напівпрозорих копій із `this.player.meteorTrail` (функція приймає об'єкт player як додатковий параметр або через замикання) у `js/engine.js`

### Phase 4e: Функції рендерингу — Група 4–5: Ліга майстрів + Бос (3 скіни)

- [x] T047 [P] [US3] Реалізувати `SKIN_RENDERERS.galaxy` — темно-фіолетове тло + 5–6 білих крапок-зірок різного розміру (фіксовані позиції) через `arc` + `fill` у `js/engine.js`
- [x] T048 [P] [US3] Реалізувати `SKIN_RENDERERS.master_crown` — золота корона з трьох зубців над верхнім краєм кубика (y < -size/2) через `lineTo` у `js/engine.js`
- [x] T049 [US3] Реалізувати `SKIN_RENDERERS.demon_lord` — вугільно-чорний фон + два червоні трикутники-очі + два роги зверху з максимальним `shadowBlur` через `lineTo` + `fill` у `js/engine.js`

**Checkpoint**: Усі 31 скін візуально відрізняються; кожен рівень має унікальний вигляд кубика

---

## Phase 5: User Story 4 — Скін «Метеор» із візуальним шлейфом (Priority: P2)

**Goal**: На рівні 3-4 під час стрибка за кубиком тягнеться шлейф із двох напівпрозорих копій.

**Independent Test**: Запустити рівень 3-4, виконати стрибок → видно 2 напівпрозорі копії кубика позаду.

### Implementation for User Story 4

- [x] T050 [US4] Додати логіку оновлення `this.player.meteorTrail` у метод `Engine.update()` у `js/engine.js` (після оновлення позиції гравця, рядок ~630): зсувати попередні позиції (максимум 2 записи `{x, y, alpha}`) із `alpha` згасанням, додавати поточну позицію
- [x] T051 [US4] Адаптувати `SKIN_RENDERERS.meteor` (з T046) для малювання шлейфу: отримувати `this.player.meteorTrail` через додатковий параметр або `this` контекст Engine, малювати 2 копії з `globalAlpha` за координатами шлейфу у `js/engine.js`
- [x] T052 [US4] Модифікувати `renderPlayer()` — передавати `this` (Engine) або `this.player` у `meteor` рендерер для доступу до `meteorTrail` у `js/engine.js`

**Checkpoint**: Стрибок на рівні 3-4 створює візуальний шлейф із двох напівпрозорих копій кубика

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Фінальна валідація та виправлення

- [x] T053 Виконати сценарії валідації з `quickstart.md` — перевірити V1 (базовий скін), V2 (розблокування), V3 (без повторного сповіщення), V4 (збереження між сесіями)
- [x] T054 Виконати сценарій V5 з `quickstart.md` — перевірити всі 31 скін на візуальну відмінність
- [x] T055 Виконати сценарії V6–V10 з `quickstart.md` — перевірити Метеор, динамічні скіни, відмовостійкість, продуктивність, сумісність
- [x] T056 Виправити дубльовані поля в об'єктах `LEVELS_CONFIG` (рівні 5, 7, 8, 9, 11, 14, 15, 16 мають повторювані `accentColor`/`rhythmGroups`) у `js/engine.js`
- [x] T057 Фінальна перевірка відповідності конституції — переконатися, що всі 6 принципів дотримано (жодних зовнішніх залежностей, Canvas-лише рендеринг, try/catch для localStorage, українська мова коментарів)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Немає залежностей — починається негайно. BLOCKS усі користувацькі історії.
- **US1 (Phase 2)**: Залежить від Phase 1 (потребує `this.currentTime` з T001/T002). Може виконуватися паралельно з US2.
- **US2 (Phase 3)**: Залежить від Phase 1 (потребує `save.recordResult()` з T006). Може виконуватися паралельно з US1.
- **US3 (Phase 4)**: Залежить від Phase 1 + US1 (потребує `SKIN_RENDERERS` з T007).
- **US4 (Phase 5)**: Залежить від Phase 1 + US3 (потребує `SKIN_RENDERERS.meteor` з T046 та `meteorTrail` із T003).
- **Polish (Phase 6)**: Залежить від усіх попередніх фаз.

### User Story Dependencies

- **US1 (P1)**: Може стартувати після Foundational. Незалежний від інших історій. ⚠️ Відкриває US3.
- **US2 (P1)**: Може стартувати після Foundational. Незалежний від US1 (різні файли: `js/main.js` vs `js/engine.js`).
- **US3 (P1)**: Може стартувати після US1 (потребує об'єкт `SKIN_RENDERERS`).
- **US4 (P2)**: Може стартувати після US3 (потребує `SKIN_RENDERERS.meteor`).

### Within Each User Story

- US1: T007 → T008 [P] + T009 (T009 залежить від T007)
- US2: T010 (одна задача)
- US3 Phase 4a: T011–T018 — усі [P] (різні рівні в LEVELS_CONFIG)
- US3 Phase 4b–4e: T019–T049 — усі [P] (різні функції в SKIN_RENDERERS), крім T019 яка може бути вже зроблена в T008
- US4: T050 → T051 → T052

### Parallel Opportunities

- **Phase 1**: T001, T002, T003 послідовні (один файл); T004, T005, T006 послідовні
- **Phase 2 + Phase 3**: US1 (T007–T009) та US2 (T010) можуть виконуватися **паралельно** — різні файли
- **Phase 4a**: Усі 8 задач T011–T018 — паралельні (різні рівні в одному масиві)
- **Phase 4b**: T020–T034 — усі 15 задач паралельні (різні функції в одному об'єкті)
- **Phase 4c**: T035–T042 — усі 8 задач паралельні
- **Phase 4d**: T043–T046 — усі 4 задачі паралельні
- **Phase 4e**: T047–T049 — T047+T048 паралельні, T049 послідовна (окремий скін)

---

## Parallel Example: Phase 4c (Середня ліга)

```bash
# Усі 8 функцій рендерингу можуть бути написані одночасно:
Task: "SKIN_RENDERERS.synthwave_sun в js/engine.js"
Task: "SKIN_RENDERERS.cyberpunk_horizon в js/engine.js"
Task: "SKIN_RENDERERS.glitch_cube в js/engine.js"
Task: "SKIN_RENDERERS.gold_ingot в js/engine.js"
Task: "SKIN_RENDERERS.orbit в js/engine.js"
Task: "SKIN_RENDERERS.stalagmite в js/engine.js"
Task: "SKIN_RENDERERS.equalizer в js/engine.js"
Task: "SKIN_RENDERERS.shield в js/engine.js"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Foundational (T001–T006)
2. Complete Phase 2: US1 (T007–T009)
3. **STOP and VALIDATE**: Запустити гру — кубик має базовий неоновий скін, обертається
4. Deploy/demo — базова версія скінів готова

### Incremental Delivery

1. Foundational → Foundation ready
2. +US1 → Базовий скін працює (MVP!)
3. +US2 → Сповіщення про розблокування
4. +US3 → Усі 31 скін доступні (повна цінність фічі)
5. +US4 → Метеор зі шлейфом
6. +Phase 6 → Валідація та polish

### Parallel Team Strategy

З кількома розробниками:
1. Team completes Phase 1 together
2. Once Foundational done:
   - Developer A: US1 (T007–T009) → відкриває US3
   - Developer B: US2 (T010) — незалежно, інший файл `js/main.js`
3. Developer B done → help with US3
4. Developer A starts US3 Phase 4a (LEVELS_CONFIG), Developer B starts US3 Phase 4b (skins Group 1)
5. Continue through Groups 2–5
6. Developer A: US4 (Meteor trail)
7. Team: Phase 6 (validation)

---

## Notes

- [P] tasks = різні функції/рівні в одному файлі, без конфліктів (різні рядки)
- [Story] label maps task to specific user story for traceability
- Файл `js/engine.js` є центральним — більшість задач модифікують різні його секції
- Файл `js/main.js` змінюється лише в T010 (US2) — мінімальний вплив
- Перевіряти FPS після додавання великої кількості функцій рендерингу (особливо динамічних)
- Commit після кожної фази або логічної групи задач

---

## Phase 7: Convergence

**Purpose**: Виправити виявлені розбіжності між специфікацією та кодом після імплементації.

- [x] T058 [US4] Виправити рендеринг шлейфу Метеора — обчислювати зміщення `pt.x - player.x` та `-(pt.y - player.y)` для кожної копії шлейфу в `SKIN_RENDERERS.meteor` у `js/engine.js` (partial per FR-008 / US4/AC1)

---

## Phase 8: Convergence — Селектор скінів (UI)

**Purpose**: Додати відсутній інтерфейс вибору скінів згідно з вимогами користувача.

- [x] T059 Додати тригер-кнопку поточного скіна (`#skin-selector-trigger` з дочірнім міні-canvas `#active-skin-canvas`) у головне меню `index.html` (missing per user requirement: skin selector trigger)
- [x] T060 Додати модальне вікно вибору скіна (`#skins-modal` з `.modal-overlay`, `.modal-content`, сіткою `.skins-grid`, кнопкою закриття `.close-btn`) у `index.html` (missing per user requirement: skins modal)
- [x] T061 [P] Додати стилі для `.skin-trigger` (cursor, неоновий ефект, hover-анімація transform) у `css/style.css` (missing per user requirement: skin selector CSS)
- [x] T062 [P] Додати стилі для `.modal-overlay` (fixed, затемнення, центрування), `.skins-grid` (display: grid, auto-fill, minmax 100px, gap 15px) у `css/style.css` (missing per user requirement: skins modal CSS)
- [x] T063 [P] Додати стилі для `.skin-card`, `.skin-card.locked` (opacity 0.5, сірий фільтр, замок), `.skin-card.active` (зелене неонове світіння) у `css/style.css` (missing per user requirement: skin card states CSS)
- [x] T064 Додати збереження/читання `activeSkin` у `localStorage` через `save` об'єкт у `js/engine.js` (missing per user requirement: skin selection persistence)
- [x] T065 Реалізувати функцію `renderCurrentSkinIcon()` — малювання міні-варіанту поточного скіна на `#active-skin-canvas` у `js/main.js` (missing per user requirement: current skin display)
- [x] T066 Реалізувати функцію `buildSkinGrid()` — динамічна генерація 31 картки скіна з canvas-прев'ю, перевірка стану розблокування, обробка кліків у `js/main.js` (missing per user requirement: skin grid + interaction)
- [x] T067 Реалізувати обробку відкриття/закриття модального вікна (клік на `#skin-selector-trigger` → показати `.skins-modal`, клік на `.close-btn` → сховати) у `js/main.js` (missing per user requirement: modal toggle)
- [x] T068 Оновити `renderPlayer()` у `js/engine.js` — використовувати `activeSkin` із localStorage замість `this.level.skin` якщо скін вибрано вручну (missing per user requirement: active skin override)

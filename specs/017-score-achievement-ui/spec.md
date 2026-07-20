# Feature Specification: Система балів, досягнень та UI нагород

**Feature Branch**: `017-score-achievement-ui`

**Created**: 2026-07-20

**Status**: Implemented (Synced 2026-07-20)

**Input**: User description: "Нова система балів, досягнень та UI нагород — адитивна система цілих балів із бонусами за конфігурацію, досягнення Срібного та Золотого Максимуму, візуальне оформлення карток рівнів та скінів кубиків на основі статусу проходження, візуальні ефекти Perfect Hit."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Адитивне нарахування балів із Perfect-бонусом (Priority: P1)

Гравець проходить рівень, і система нараховує бали за кожне влучання в зону таймінгу. Базові бали залежать від точності влучання (OK або інша зона), до них додаються бонуси за конфігурацію, а також бонус +30 за влучання в зону Perfect (зелена зона). Бали накопичуються та відображаються в реальному часі разом із поточним максимумом. При влучанні в зону Perfect спалахують частинки та з'являється спливаючий текст "PERFECT!".

**Why this priority**: Фундаментальна зміна механіки. Perfect-бонус (+30) робить досягнення maxEasy/maxHard нетривіальними — потрібно влучати саме в зелену зону, а не просто в OK.

**Independent Test**: Запустити рівень — бали за OK = 120 (EASY/NORMAL/NORMAL), за Perfect = 150. Частинки та "PERFECT!" з'являються при влучанні в зелену зону.

**Acceptance Scenarios**:

1. **Given** EASY / NORMAL / NORMAL, **When** влучання в OK, **Then** +120 (без Perfect-бонусу)
2. **Given** EASY / NORMAL / NORMAL, **When** влучання в Perfect (зелена зона), **Then** +150 (100 база + 0 + 20 + 0 + 30 Perfect) + спалах частинок + "PERFECT!"
3. **Given** HARD / NORMAL / FAST, **When** влучання в Perfect, **Then** +240 (100 + 50 + 20 + 40 + 30) + золоті частинки
4. **Given** EASY / LARGE / SLOW, **When** влучання в іншу зону (не OK), **Then** +60 (80 + 0 + 0 − 20), без частинок
5. **Given** будь-яка конфігурація, **When** пропуск натискання, **Then** 0 балів

---

### User Story 2 - Максимальний бал та досягнення perfectEasy/perfectHard (Priority: P2)

MaxEasy та maxHard обчислюються з припущенням, що ВСІ натискання — Perfect (+30 кожне). При перемозі фінальний рахунок порівнюється з цими максимумами. Досягнення perfectEasy (Срібний Максимум) та perfectHard (Золотий Максимум) зберігаються в localStorage із пріоритетом золота над сріблом. Гравцю показується сповіщення про розблокування досягнення на екрані перемоги.

**Independent Test**: Пройти рівень із усіма Perfect-влучаннями → перевірити `perfect: "easy"/"hard"` у localStorage.

**Acceptance Scenarios**:

1. **Given** spikeCount=12, EASY/NORMAL/NORMAL, **When** усі 12 влучань Perfect, **Then** score = 12 × 150 = 1800 = maxEasy → perfectEasy
2. **Given** spikeCount=12, HARD/NORMAL/FAST, **When** усі 12 влучань Perfect, **Then** score = 12 × 240 = 2880 = maxHard → perfectHard
3. **Given** perfectEasy існує, **When** проходження на HARD із maxHard, **Then** статус → perfectHard
4. **Given** perfectHard існує, **When** проходження на EASY із maxEasy, **Then** статус залишається perfectHard
5. **Given** рівень без досягнень, **When** НЕ всі влучання Perfect, **Then** score < max, статус не надається

---

### User Story 3 - Візуальне оформлення карток рівнів на мапі (Priority: P3)

Картки рівнів у меню вибору відображають статус досягнень: срібна рамка + зірка ★ для perfectEasy, золота рамка з пульсацією + золота зірка ★ для perfectHard. Усе засобами CSS (градієнти, keyframes), без зображень.

**Independent Test**: Виставити `perfect: "easy"` / `"hard"` у localStorage → перезавантажити → картки візуально змінюються.

**Acceptance Scenarios**:

1. **Given** perfectEasy, **When** меню вибору рівнів, **Then** картка має срібну рамку (#b0b8c8) + срібну зірку ★ з градієнтом
2. **Given** perfectHard, **When** меню вибору рівнів, **Then** картка має золоту рамку (gradient border-image) + анімацію goldPulse + золоту зірку ★ з пульсацією
3. **Given** немає досягнення, **When** меню вибору рівнів, **Then** стандартний вигляд
4. **Given** perfectEasy, **When** перезавантаження, **Then** оформлення відновлюється з localStorage

---

### User Story 4 - Статусні ефекти на скінах кубиків (Priority: P4)

Досягнення рівня, до якого прив'язаний скін, відображається в чотирьох місцях:
- **Картка скіна в меню вибору**: CSS-рамка (срібна/золота) на DOM-елементі + відповідний ефект на Canvas-прев'ю
- **Кнопка «Скін» на головному меню**: Canvas-рендеринг активного скіна з рамкою досягнення
- **Кубик під час гри на Canvas**: срібний контур (perfectEasy) або золоте свічення + шлейф (perfectHard)

Усі Canvas-ефекти малюються ПІСЛЯ рендерингу скіна, щоб уникнути конфліктів із внутрішніми shadowBlur скінів. Досягнення читається з рівня, до якого прив'язаний скін (не з поточного рівня гри).

**Independent Test**: Виставити `perfect: "hard"` для рівня → обрати його скін → кубик має золоте свічення + шлейф.

**Acceptance Scenarios**:

1. **Given** perfectEasy на рівні скіна, **When** відкрито меню скінів, **Then** картка має CSS-клас perfect-silver + срібний контур на Canvas-прев'ю
2. **Given** perfectEasy на рівні скіна, **When** скін активний, **Then** кнопка «Скін» показує срібний контур на Canvas-іконці
3. **Given** perfectEasy на рівні скіна, **When** гра, **Then** навколо кубика — срібний strokeRect (#d4dce8, shadowBlur:6)
4. **Given** perfectHard на рівні скіна, **When** гра + стрибок, **Then** золотий strokeRect (#ffaa00, shadowBlur:18) + золотий шлейф із частинок

---

### Edge Cases

- Від'ємний бал за натискання неможливий — `Math.max(0, ...)` у calculateHitScore.
- Пустий рівень (spikeCount=0): maxEasy=0, maxHard=0, досягнення не надається (перевірка `maxHard > 0` / `maxEasy > 0`).
- Зміна структури рівня після отримання досягнення: статус зберігається, новий максимум перераховується для майбутніх спроб.
- Пошкодження localStorage: try/catch у load/persist, sanitizeSaveData скидає некоректні perfect до null.
- Скіни, що змінюють shadowBlur (neon_base та ін.): ефекти досягнень малюються ПІСЛЯ скіна через strokeRect, не конфліктують.
- Активний скін з іншого рівня: досягнення читається з рівня, до якого прив'язаний скін (пошук через ALL_LEVELS за renderType).
- Демо-режим не оновлювався при зміні налаштувань: createDemoEngine() викликається при кожній зміні difficulty/hitWindow/speed та при закритті налаштувань.

## Requirements *(mandatory)*

### Functional Requirements

**Система балів:**
- **FR-001**: 100 балів за OK, 80 за іншу зону (базова ставка)
- **FR-002**: Бонуси: HARD +50, EASY +0; NORMAL зона +20, LARGE +0; FAST +40, NORMAL +0, SLOW −20
- **FR-003**: Бонус +30 за влучання в зону Perfect (зелена зона). Perfect = `gap <= perfectPx + okPx * 0.35`
- **FR-004**: Підсумковий бал ≥ 0 (Math.max)
- **FR-005**: `calculateMaxScores()` включає +30 за кожне натискання (припускаючи всі Perfect)

**Розрахунок gap від лівого краю перешкоди:**
- **FR-006**: `spikeHalfWidth(type)`: spike=22px, saw=28.8px, double_spike=41.8px
- **FR-007**: gap = `spike.x - spikeHalfWidth(type) - player.x` — від лівого краю шипа до гравця
- **FR-008**: gap використовується в handleLetter, consumeJumpBuffer, update (колізія + HARD auto-kill), nearestAheadSpike, demo-режимі

**Досягнення:**
- **FR-009**: При перемозі (pct=100) порівняти score з maxEasy/maxHard
- **FR-010**: score ≥ maxEasy → perfectEasy; score ≥ maxHard → perfectHard
- **FR-011**: perfectHard має пріоритет над perfectEasy (не знижується)
- **FR-012**: `perfect` зберігається в `saveData.progress.levels[id].perfect` (null | "easy" | "hard")
- **FR-013**: `sanitizeSaveData()` мігрує старі дані (додає `perfect: null`) і валідує значення
- **FR-014**: `getLevelAchievement(levelId)` повертає поточний статус
- **FR-015**: На екрані VICTORY показується "Срібний Максимум!" / "Золотий Максимум!" при розблокуванні

**Картки рівнів (CSS):**
- **FR-016**: `.level-card.perfect-silver`: срібна рамка #b0b8c8, зірка ★ з біло-сірим градієнтом
- **FR-017**: `.level-card.perfect-gold`: золотий border-image градієнт, @keyframes goldPulse (2s, box-shadow + scale), зірка ★ з золотим градієнтом + @keyframes goldStarPulse (1.5s)
- **FR-018**: `buildLevelCards()` додає `<div class="level-star">★</div>` та CSS-клас на основі getLevelAchievement()

**Скіни — DOM-картки:**
- **FR-019**: `.skin-card.perfect-silver`: срібний border-color + box-shadow
- **FR-020**: `.skin-card.perfect-gold`: золотий border-color + box-shadow + goldPulse
- **FR-021**: `buildSkinGrid()` додає CSS-клас perfect-silver/perfect-gold на основі getLevelAchievement()

**Скіни — Canvas-прев'ю в меню:**
- **FR-022**: Прев'ю скіна (80×80 canvas) малює ефект досягнення ПІСЛЯ рендерингу скіна:
  - perfectEasy: срібний strokeRect (#d4dce8, lineWidth 1.8, shadowBlur 6)
  - perfectHard: золотий strokeRect (#ffaa00, lineWidth 3, shadowBlur 18)

**Скіни — кнопка «Скін» на головному меню:**
- **FR-023**: `renderCurrentSkinIcon()` знаходить рівень активного скіна через ALL_LEVELS, читає getLevelAchievement(), малює відповідний ефект на Canvas-іконці (52×52)

**Скіни — кубик під час гри:**
- **FR-024**: `renderPlayer()` визначає achievementLevelId: якщо є activeSkin, шукає його рівень; інакше використовує this.level.id
- **FR-025**: Ефекти малюються ПІСЛЯ renderFn(), щоб уникнути конфліктів із shadowBlur скінів
- **FR-026**: perfectEasy: ctx.strokeStyle="#d4dce8", lineWidth 1.8, shadowBlur 6 навколо кубика
- **FR-027**: perfectHard: ctx.strokeStyle="rgba(255,170,0,0.9)", lineWidth 3, shadowBlur 18, shadowColor="#ffaa00"
- **FR-028**: perfectHard + стрибок: золотий шлейф (goldTrail, до 15 частинок, 1.2s життя, колір rgba(255,200,40, alpha*0.5))

**Візуальні ефекти Perfect Hit:**
- **FR-029**: `perfectParticles`: 8-12 частинок при Perfect-влучанні. EASY: срібний/білий/блакитний; HARD: золотий/помаранчевий/жовтий. Розліт 360°, гравітація, життя 1.2s
- **FR-030**: `perfectPopups`: текст "PERFECT!" над кубиком. Плавний рух угору (80px/s), затухання за 1.5s. EASY: срібний колір; HARD: золотий. Шрифт bold 16px Segoe UI, shadowBlur 10

**Hit Window візуалізація:**
- **FR-031**: Дві смуги над/під землею: зелена (perfect, perfectWidth = perfectPx + okPx * 0.35) зверху, блакитна (OK, okPx) знизу. Ширина без додавання halfW — відповідає gap-порогам безпосередньо
- **FR-032**: Жовтий вертикальний маркер на позиції шипа (spikeScreenX) для візуальної прив'язки

**Оновлення демо-режиму:**
- **FR-033**: `createDemoEngine()` викликається при кожній зміні difficulty, hitWindow, speed та при закритті налаштувань

**localStorage:**
- **FR-034**: Усі операції читання/запису localStorage обгорнуті в try/catch

### Key Entities

- **ScoreConfig**: difficulty, hitWindow, speed → бонусні модифікатори
- **LevelData**: bestPct, highScore, perfect (null | "easy" | "hard") у localStorage
- **SpikeHalfWidth**: функція, що повертає половину візуальної ширини перешкоди залежно від типу
- **Achievement**: статус perfectEasy/perfectHard, прив'язаний до рівня, визначає візуальні ефекти скіна
- **PerfectParticle**: частинка спалаху (x, y, vx, vy, life, maxLife, size, color)
- **PerfectPopup**: спливаючий текст (x, y, life, maxLife)

## Success Criteria *(mandatory)*

- **SC-001**: Рахунок оновлюється після кожного натискання, показується з максимумом ("Очки: 240 / 1800")
- **SC-002**: maxEasy/maxHard коректні для всіх комбінацій конфігурацій (враховуючи +30 Perfect)
- **SC-003**: perfectEasy/perfectHard лише при score ≥ max (всі Perfect-влучання)
- **SC-004**: Статуси зберігаються між сесіями, gold > silver ієрархія
- **SC-005**: Картки рівнів візуально відрізняються (срібло/золото/стандарт)
- **SC-006**: Золоте свічення не знижує FPS нижче 60
- **SC-007**: Canvas-ефекти досягнень не конфліктують із shadowBlur скінів (малюються після)
- **SC-008**: Gap від лівого краю коректний для всіх типів перешкод (spike/saw/double_spike)

## Assumptions

- 31 рівень, кожен має spikeCount, визначений у LEVELS_CONFIG
- localStorage ключ "dfp_save_v1", схема розширюється полем perfect
- Система скінів (spec 016) реалізована — ця специфікація додає статусні ефекти поверх
- Усі візуальні ефекти — CSS (keyframes, градієнти) або Canvas (shadowBlur, strokeRect)
- Гравець використовує сучасний браузер (CSS-анімації, Canvas shadowBlur)
- `save` об'єкт експортується з engine.js та імпортується в main.js

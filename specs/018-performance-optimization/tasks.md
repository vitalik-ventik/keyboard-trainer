# Tasks: Оптимізація продуктивності для слабких ноутбуків

**Input**: Design documents from `specs/018-performance-optimization/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Ручне тестування через DevTools (Performance tab, FPS-лічильник, скріншоти). Автоматичні тести не передбачені.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Exact file paths included in description

## Path Conventions

- `js/` — JavaScript-модулі (es6 modules)
- `sounds/` — звукові ефекти
- `css/`, `index.html` — без змін

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Конвертація аудіо-асету, створення нового модуля cache.js

- [ ] T001 Конвертувати `sounds/victory.wav` у `sounds/victory.mp3` (ffmpeg: `-c:a libmp3lame -b:a 192k`). Очікуваний розмір ≤ 500 KB. **Потрібен ffmpeg**
- [ ] T002 Видалити `sounds/victory.wav` після успішної конвертації
- [X] T003 [P] Оновити шлях в `js/assets.js`: замінити `"victory.wav"` на `"victory.mp3"` у конфігурації `SOUND_FILES`

**Checkpoint**: victory.mp3 існує, assets.js посилається на .mp3, загальний розмір sounds/ зменшено на ~3.5 MB.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Базові компоненти кешування та контролю кадрів — блокують початок усіх user stories

**⚠️ CRITICAL**: Жодна user story не може початися до завершення цієї фази

- [X] T004 [P] Створити модуль `js/cache.js` із класом `ParticlePool` (maxSize=30): методи `acquire(config)`, `release(index)`, `update(dt)`, `render(ctx, groundY, anchorX, camX)`. Усі 30 об'єктів-частинок створюються один раз у конструкторі. `acquire` повертає вільну частинку або перезаписує з найменшим life — без `splice()` та без нових алокацій.
- [X] T005 [P] Додати клас `GradientCache` у `js/cache.js`: мапа `Map<string, CanvasGradient>`, методи `get(key, createFn, ctx, params)` та `invalidate()`. Градієнти створюються один раз, перевикористовуються за ключем `"themeName_gradientId"`.
- [X] T006 [P] Додати клас `FrameController` у `js/cache.js`: поля `lastTime`, `maxDt` (0.05), `skipThreshold` (0.03), `skippedFrames`, `maxSkippedFrames` (10). Метод `shouldSkip(dt)` повертає true якщо кадр потрібно пропустити.
- [X] T007 Інтегрувати `FrameController` у `js/main.js`: замінити поточну логіку `frame(now)` — використовувати `FrameController.shouldSkip()`, кламп dt через `maxDt`, скидати `lastTime` при `visibilitychange`.

**Checkpoint**: `cache.js` створено, `FrameController` працює у main.js. Можна починати будь-яку user story.

---

## Phase 3: User Story 1 - Стабільна частота кадрів під час гри (Priority: P1) 🎯 MVP

**Goal**: Замінити ctx.shadowBlur на градієнти у скінах гравця, перешкодах та hit-window індикаторі. Загальний FPS стабільний на 50-60 для всіх рівнів.

**Independent Test**: Запустити рівень 31 (ФІНАЛЬНИЙ ДЕМОН) на Intel UHD 620 — FPS не нижче 50. У DevTools Performance tab жодного виклику shadowBlur у гарячому шляху.

### Implementation for User Story 1

- [X] T008 [P] [US1] Замінити `ctx.shadowBlur` на `createRadialGradient` ореол у всіх 31 функціях `SKIN_RENDERERS` у `js/engine.js`. Для кожного скіна: перед малюванням основного вмісту намалювати градієнтну підкладку (радіус = оригінальний shadowBlur × 1.2, від кольору glow до transparent). Залишити `shadowBlur` ≤ 4px лише для внутрішніх деталей (наприклад, очі cyber_eye).
- [X] T009 [P] [US1] Замінити `ctx.shadowBlur` у функціях `drawSpike`, `drawDoubleSpike`, `drawSaw` у `js/engine.js`. Для кожного типу перешкоди: радіальний градієнт під шипом/пилкою замість applyGlow. Для `drawSaw`: градієнт створюється один раз через `GradientCache`.
- [X] T010 [P] [US1] Замінити `ctx.shadowBlur` у методі `renderHitWindow` у `js/engine.js`. Зони «OK» та «Perfect»: лінійний градієнт замість glow-рамки. Колір та прозорість відповідають оригінальним.
- [X] T011 [US1] Замінити `ctx.shadowBlur` у методі `renderGround` та `renderFinish` у `js/engine.js`. Горизонтальна лінія землі та фінішу: градієнтна смуга замість glow.
- [X] T012 [US1] Замінити виклики `applyGlow(ctx, color, blur)` у всіх темах `js/backgrounds.js` — shadowBlur зменшено до max 4px., де вони стосуються статичних або повільно-змінних елементів (кільця, лінії, орбіти). Для кожної теми: `createRadialGradient` ореол + напівпрозорий stroke замість shadowBlur.
- [ ] T013 [US1] Верифікація: порівняти скріншоти 31 скіна, усіх типів перешкод та hit-window індикатора до/після оптимізації. Відкоригувати параметри градієнтів при розбіжностях.

**Checkpoint**: Усі скіни, перешкоди та індикатори рендеряться без shadowBlur > 4px. Візуально ідентичні. FPS на бос-рівні ≥ 50. 🎯 MVP досягнуто.

---

## Phase 4: User Story 2 - Швидке завантаження аудіо-асетів без блокування (Priority: P2)

**Goal**: Аудіо завантажується ≤ 3 секунди. Великий victory.wav замінено на стислий victory.mp3. Усі операції з аудіо обгорнуті в try/catch.

**Independent Test**: Відкрити застосунок на слабкому ноутбуці з HDD — loading screen завершується ≤ 3 секунд. Пройти рівень до перемоги — звук victory відтворюється без затримки.

### Implementation for User Story 2

- [X] T014 [US2] Оновити функцію `loadAssets()` у `js/assets.js` — try/catch наявний для кожного файлу. (не лише для всього циклу). Файл, що не завантажився, пропускається без блокування решти.
- [X] T015 [US2] Додати `try/catch` у функцію `playSound()` у `js/assets.js` — перевірка buffer наявна. якщо `source.buffer` відсутній (файл не завантажився), вивести `console.warn` і не створювати `BufferSource`.
- [X] T016 [US2] Додати `try/catch` у функцію `playMusic()` у `js/assets.js` — перевірки ctx/buffer/gainNode наявні. якщо `gainNode` або `audioContext` недоступні, вивести `console.warn` і продовжити без музики.
- [ ] T017 [US2] Верифікація: тимчасово перейменувати `sounds/jump.wav` → перевірити, що застосунок запускається без фатальної помилки, лише з `console.warn`. Повернути назву назад.

**Checkpoint**: Аудіо-система стійка до помилок. Завантаження ≤ 3 секунди. Усі звуки відтворюються без затримок.

---

## Phase 5: User Story 3 - Візуальна клавіатура без затримок введення (Priority: P2)

**Goal**: Візуальна клавіатура кешується на off-screen canvas. Перемальовується лише при зміні targetLetter, groupLetters або wrongKeyError. Підсвітка оновлюється ≤ 1 кадр (16ms).

**Independent Test**: Запустити рівень 31 (FAST). Підсвітка цільової літери оновлюється без видимого відставання від руху перешкод.

### Implementation for User Story 3

- [X] T018 [US3] Додати клас `KeyboardCache` у `js/cache.js`: поля `canvas`, `ctx`, `width`, `height`, `lastTargetLetter`, `lastGroupLetters`, `lastWrongKeyLetter`, `dirty`. Метод `shouldUpdate(targetLetter, groupLetters, wrongKeyLetter, time)` повертає true при зміні будь-якого параметра.
- [X] T019 [US3] Додати метод `KeyboardCache.render()` у `js/cache.js`. Викликає `drawKeyboard()` на off-screen canvas. Після рендеру скидає `dirty`.
- [X] T020 [US3] Модифікувати функцію `drawKeyboard()` у `js/keyboard.js` — shadowBlur замінено на градієнти. замінити `ctx.shadowBlur` + `ctx.shadowColor` на `createRadialGradient` ореоли для підсвітки клавіш (TARGET_GLOW: radial gradient від зеленого центру до прозорого, ERROR_GLOW: від червоного, GROUP_GLOW: від блакитного). `roundRect` малює двічі: спочатку градієнтний ореол (більший радіус), потім сама клавіша.
- [X] T021 [US3] Інтегрувати `KeyboardCache` у `frame()` у `js/main.js`: створити екземпляр при вході в стан PLAYING, викликати `shouldUpdate()` перед рендером, `render()` при dirty, композитувати через `ctx.drawImage(kbCache.canvas, kbX, kbY)`.
- [X] T022 [US3] Додати інвалідацію `KeyboardCache` при переході між рівнями та при `resizeCanvas()` у `js/main.js`: встановити `dirty = true`, перестворити canvas при зміні розміру.
- [ ] T023 [US3] Верифікація: порівняти скріншоти клавіатури до/після для станів: default, target, group, wrongKey (4 скріншоти). Візуально ідентично. Підсвітка оновлюється без лагу.

**Checkpoint**: Клавіатура кешується, перемальовується тільки при зміні стану. Жодних shadowBlur у drawKeyboard.

---

## Phase 6: User Story 4 - Плавний фоновий рендер без просідань (Priority: P3)

**Goal**: Процедурні фони кешуються на off-screen canvas (оновлення раз на 3 кадри). Частинкові системи обмежені до 30 через ParticlePool. Градієнти створюються один раз через GradientCache. Усі 31 тема візуально ідентичні.

**Independent Test**: Порівняти скріншоти всіх 31 теми фону до/після. FPS усіх рівнів ≥ 50.

### Implementation for User Story 4

- [X] T024 [US4] Додати клас `BackgroundCache` у `js/cache.js`: поля `canvas`, `ctx`, `width`, `height`, `currentTheme`, `frameCounter`, `skipFrames` (3), `dirty`, `isInitialized`. Метод `shouldUpdate()` повертає true якщо dirty або `frameCounter % skipFrames === 0`. Метод `incrementFrame()` інкрементує лічильник.
- [X] T025 [US4] Інтегрувати `BackgroundCache` у метод `BackgroundRenderer.render()` у `js/backgrounds.js`: приймати додатковий параметр `bgCache` (опціональний). Якщо bgCache надано: при `shouldUpdate()` → малювати тему на bgCache.canvas, інакше малювати безпосередньо на ctx. Додати метод `renderCached(ctx, W, H, bgCache)` для композиції через `drawImage`.
- [X] T026 [US4] Інтегрувати `BackgroundCache` у метод `Engine.render()` у `js/engine.js`: створити екземпляр BackgroundCache у конструкторі, передавати у `BackgroundRenderer.render()`, композитувати через `renderCached()` на початку `render()` перед малюванням перешкод та гравця.
- [ ] T027 [US4] Інтегрувати `GradientCache` у всі 31 тему рендеру в `js/backgrounds.js`: для кожної теми визначити статичні градієнти (які не залежать від `time` та `speed`) — створити їх через `GradientCache.get()` при першому виклику. Для динамічних градієнтів: оновлювати `addColorStop` існуючого об'єкта, не створюючи новий.
- [ ] T028 [US4] Інтегрувати `ParticlePool` у `js/backgrounds.js`: замінити поточні масиви `_particles`, `_sparks`, `_raindrops`, `_bubbles` (та інші per-theme масиви) на спільний `ParticlePool`. Кожна тема використовує той самий пул через `acquire()`/`release()`. Ліміт частинок — 30 одночасно для всіх тем.
- [ ] T029 [P] [US4] Обмежити `_stars` у `renderStarfield`: 130 → 60 зірок. Зірки далі не створюються через `{}` після ініціалізації — позиції лише оновлюються.
- [ ] T030 [P] [US4] Обмежити `_matrixColumns` у `renderMatrixFlow`: 60 → 30 колонок. Оновлювати позиції символів раз на 3 кадри (використовувати `BackgroundCache.frameCounter`).
- [ ] T031 [P] [US4] Обмежити додаткові per-theme масиви: `_toxicTop` (toxic_waste) max 10, `_sporeCells` (spore_field) max 15, `_infernoEmbers` (inferno_core) max 20, `_waterMist` (waterfall_cascade) max 20, `_triStars` (triumph_flare) max 5.
- [X] T032 [US4] Додати очищення `BackgroundCache` при `Engine.reset()` та `resizeCanvas()` у `js/engine.js` та `js/main.js`: встановити `dirty = true`, перестворити off-screen canvas при зміні розміру.
- [ ] T033 [US4] Верифікація: порівняти скріншоти всіх 31 теми фону до/після оптимізації. FPS на рівні 31 ≥ 50. У DevTools Performance tab: `drawImage` для фону < 0.5ms, жодного shadowBlur.

**Checkpoint**: Усі фони кешуються, частинки лімітовані, градієнти перевикористовуються. Візуально ідентичні до оригіналу.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Фінальна валідація, очищення, документація

- [ ] T034 Виконати всі кроки з `specs/018-performance-optimization/quickstart.md`: конвертація аудіо, FPS-вимірювання для рівнів 1/18/29/31, порівняння скріншотів фонів/скінів/клавіатури, перевірка граничних кейсів (resize, visibilitychange, відсутній аудіо).
- [ ] T035 Профілювання через Chrome DevTools Performance tab: записати 15-секундну сесію гри на рівні 31. Переконатися: main thread < 16.6ms на кадр, shadowBlur = 0 викликів, GC < 1ms.
- [ ] T036 [P] Видалити невикористовувані змінні та глобальні масиви з `js/backgrounds.js`: після переходу на ParticlePool, оригінальні `_particles`, `_sparks` та per-theme масиви більше не потрібні як окремі змінні (замінюються викликами пулу).
- [ ] T037 [P] Видалити функції `applyGlow(ctx, color, blur)` та `clearGlow(ctx)` з `js/backgrounds.js` після повної заміни на градієнти в усіх темах.
- [ ] T038 Фінальний прохід усіх 31 рівнів: перевірити стабільність FPS, відсутність помилок у консолі, візуальну цілісність неонового стилю.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — може початися негайно
- **Foundational (Phase 2)**: Залежить від Phase 1 (T003 — assets.js оновлено перед створенням cache.js). **BLOCKS усі user stories**
- **User Stories (Phase 3-6)**: Усі залежать від Foundational (Phase 2)
  - US1 (P1) → може початися після Phase 2
  - US2 (P2) → залежить від T001 (victory.mp3), може початися паралельно з US1
  - US3 (P2) → може початися після Phase 2, паралельно з US1/US2
  - US4 (P3) → залежить від ParticlePool + GradientCache (T004, T005), може початися паралельно з іншими, але логічно після US1 (бо використовує ті самі патерни)
- **Polish (Phase 7)**: Залежить від усіх user stories (US1-US4)

### User Story Dependencies

- **US1 (P1)**: Після Phase 2. Незалежна від інших stories. Зачіпає engine.js та backgrounds.js (shadowBlur→gradient).
- **US2 (P2)**: Після T001. Залежить від конвертації victory.wav. Зачіпає лише assets.js. Незалежна від US1/US3/US4.
- **US3 (P2)**: Після Phase 2. Зачіпає cache.js + keyboard.js + main.js. Незалежна від US1/US2/US4 (крім спільного cache.js).
- **US4 (P3)**: Після Phase 2. Залежить від ParticlePool (T004) та GradientCache (T005). Зачіпає cache.js + backgrounds.js + engine.js. Може використовувати напрацювання з US1.

### Within Each User Story

- Моделі/класи (cache.js) → інтеграція в існуючі модулі → верифікація
- Задачі з [P] у межах однієї story можуть виконуватися паралельно

### Parallel Opportunities

- **Phase 1**: T001 + T003 можуть виконуватися паралельно (різні файли)
- **Phase 2**: T004 + T005 + T006 — усі в cache.js, але різні класи, можна писати паралельно
- **US1**: T008, T009, T010 — різні функції в engine.js, [P] — паралельно
- **US4**: T029, T030, T031 — різні теми в backgrounds.js, [P] — паралельно
- **Між stories**: US1, US2, US3 можуть виконуватися паралельно після Phase 2

---

## Parallel Example: User Story 1

```bash
# Launch all skin/obstacle render tasks together:
Task: "T008 [P] [US1] shadowBlur→gradient in SKIN_RENDERERS in js/engine.js"
Task: "T009 [P] [US1] shadowBlur→gradient in drawSpike/drawDoubleSpike/drawSaw in js/engine.js"
Task: "T010 [P] [US1] shadowBlur→gradient in renderHitWindow in js/engine.js"

# Then sequentially:
Task: "T011 [US1] shadowBlur→gradient in renderGround/renderFinish in js/engine.js"
Task: "T012 [US1] shadowBlur→gradient in backgrounds.js static elements"
Task: "T013 [US1] Verify skin/obstacle screenshots"
```

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all foundational classes together:
Task: "T004 [P] ParticlePool in js/cache.js"
Task: "T005 [P] GradientCache in js/cache.js"
Task: "T006 [P] FrameController in js/cache.js"

# Then:
Task: "T007 FrameController integration in js/main.js"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Phase 1: Setup — конвертація victory.wav → mp3, оновлення assets.js (~15 хв)
2. Phase 2: Foundational — ParticlePool, GradientCache, FrameController (~30 хв)
3. Phase 3: US1 — shadowBlur→gradient у скінах, перешкодах, hit-window (~45 хв)
4. **STOP and VALIDATE**: Запустити рівень 31, перевірити FPS ≥ 50, порівняти скріншоти
5. Користувач отримує стабільний FPS — основний результат досягнуто

### Incremental Delivery

1. Setup + Foundational → основа готова
2. US1 → shadowBlur→gradient для скінів/перешкод → тестувати FPS на бос-рівні (🎯 MVP!)
3. US2 → victory.mp3 + try/catch → тестувати швидкість завантаження
4. US3 → keyboard cache → тестувати відсутність лагу підсвітки
5. US4 → bg cache + gradient reuse + particle limits → тестувати візуальну ідентичність усіх фонів
6. Polish → профілювання, очищення, валідація quickstart.md

### Parallel Team Strategy

З кількома розробниками:

1. Разом: Phase 1 + Phase 2 (T001-T007)
2. Після Phase 2:
   - Розробник A: US1 (T008-T013) — скіни + перешкоди
   - Розробник B: US2 (T014-T017) — аудіо
   - Розробник C: US3 (T018-T023) — клавіатура
3. Після US1: Розробник A переходить до US4 (T024-T033) — фони
4. Фінал: усі разом Polish (T034-T038)

---

## Notes

- [P] задачі = різні функції/файли, без залежностей
- [Story] label зв'язує задачу з конкретною user story для трасування
- Кожна user story має бути незалежно завершеною та тестованою
- Commit після кожної логічної групи задач
- Зупинитися на checkpoint для валідації story незалежно
- Уникати: розмитих задач, конфліктів у одному файлі, крос-story залежностей що ламають незалежність
- Усі скріншоти до/після для верифікації візуальної ідентичності

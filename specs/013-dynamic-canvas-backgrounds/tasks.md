# Tasks: Динамічні багатошарові Canvas-фони

**Input**: Design documents from `/specs/013-dynamic-canvas-backgrounds/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Не передбачені специфікацією (ручне тестування через quickstart.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- `js/` — JavaScript модулі (ES6)
- `index.html` — точка входу, підключення скриптів
- `specs/013-dynamic-canvas-backgrounds/` — документація фічі

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Створення нового модуля та інтеграція з існуючою кодовою базою

- [x] T001 Створити файл `js/backgrounds.js` з об'єктом `BackgroundRenderer` та повними методами-заглушками: `init()`, `reset()`, `render()`, `createParticles()`, `updateParticles()`, `renderParticles()`, `getDimensions()`.
- [x] T002 Підключити `js/backgrounds.js` як модуль у `index.html`
- [x] T003 [P] Оновити `js/engine.js` — імпортувати `BackgroundRenderer`, замінити виклик `this.renderBackground()` на `BackgroundRenderer.render()` у методі `Engine.render()`.
- [x] T004 [P] Оновити `js/engine.js` — додати виклик `BackgroundRenderer.reset()` у методі `Engine.reset()`.
- [x] T005 Оновити `js/main.js` — додати виклик `BackgroundRenderer.init(W, H, groundY)` у `resizeCanvas()`. Імпортувати модуль.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ядро BackgroundRenderer, від якого залежать усі користувацькі історії

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Реалізувати метод `BackgroundRenderer.init(W, H, groundY)`
- [x] T007 Реалізувати метод `BackgroundRenderer.reset()`
- [x] T008 Реалізувати диспетчер фонів — метод `BackgroundRenderer.render()`
- [x] T009 Реалізувати метод `BackgroundRenderer.getDimensions()`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Імерсивне візуальне середовище (Priority: P1) 🎯 MVP

**Goal**: Усі рівні гри отримують нові динамічні багатошарові фони замість спрощених попередніх версій.

**Independent Test**: Запустити будь-який рівень з новим bgTheme — фон має бути анімованим, багатошаровим, візуально відмінним від старої версії.

### Implementation for User Story 1

- [x] T010 [P] [US1] Реалізувати рендерер `renderCyberGrid()` у `js/backgrounds.js`
- [x] T011 [P] [US1] Реалізувати рендерер `renderParallaxCity()` у `js/backgrounds.js`
- [x] T012 [P] [US1] Реалізувати рендерер `renderHyperspaceTunnel()` у `js/backgrounds.js`
- [x] T013 [P] [US1] Реалізувати рендерер `renderBezierWaves()` у `js/backgrounds.js`
- [x] T014 [P] [US1] Реалізувати рендерер `renderStarfield()` у `js/backgrounds.js`
- [x] T015 [P] [US1] Реалізувати рендерер `renderEnergyGrid()` у `js/backgrounds.js`
- [x] T016 [P] [US1] Реалізувати рендерер `renderGeoLandscape()` у `js/backgrounds.js`
- [x] T017 [US1] Оновити `LEVELS_CONFIG` — замінити bgTheme для рівнів 1-30
- [x] T018 [US1] Видалити застарілі методи рендерингу з `js/engine.js`

**Checkpoint**: На цьому етапі всі рівні (крім 22-24, 31) мають нові динамічні фони. US1 готовий до незалежного тестування.

---

## Phase 4: User Story 2 - Візуальний зворотний зв'язок (Priority: P2)

**Goal**: При успішному подоланні перешкоди з'являється спалах часток (15-20 шт.), які розлітаються і згасають за ~0.5 с.

**Independent Test**: На будь-якому рівні успішно подолати перешкоду — спостерігати спалах часток у точці контакту.

### Implementation for User Story 2

- [x] T019 [US2] Реалізувати метод `BackgroundRenderer.createParticles()`
- [x] T020 [US2] Реалізувати метод `BackgroundRenderer.updateParticles()`
- [x] T021 [US2] Реалізувати метод `BackgroundRenderer.renderParticles()`
- [x] T022 [US2] Інтегрувати систему часток з `js/engine.js`
- [x] T023 [US2] Додати логіку GAMEOVER для часток

**Checkpoint**: Система часток працює на всіх рівнях. US2 готовий до незалежного тестування.

---

## Phase 5: User Story 3 - Унікальні тематичні ефекти (Priority: P3)

**Goal**: На спеціальних рівнях з'являються унікальні візуальні ефекти (неоновий дощ, матричний потік, еквалайзер) + глобальний glow на всіх рівнях.

**Independent Test**: Запустити рівень 1-12 (дощ), 2-4 (матриця), 3-1 (еквалайзер) — спостерігати відповідні унікальні ефекти.

### Implementation for User Story 3

- [x] T024 [P] [US3] Реалізувати рендерер `renderNeonRain()` у `js/backgrounds.js`
- [x] T025 [P] [US3] Реалізувати рендерер `renderMatrixFlow()` у `js/backgrounds.js`
- [x] T026 [P] [US3] Реалізувати рендерер `renderEqualizer()` у `js/backgrounds.js`
- [x] T027 [US3] Додати глобальний glow-ефект у `js/backgrounds.js`
- [x] T028 [US3] Оновити `LEVELS_CONFIG` для спецефектів

**Checkpoint**: Усі спеціальні ефекти працюють. US3 готовий до незалежного тестування.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Фінальна очистка, оптимізація та валідація

- [x] T029 [P] Видалити залишковий код з `js/engine.js`
- [x] T030 Оптимізувати продуктивність — перевірити кількість draw-викликів, оптимізувати через `beginPath()` з одним `stroke()`, переконатися що shadowBlur застосовується лише до обмеженої кількості елементів.
- [ ] T031 Виконати перевірку згідно з `quickstart.md` — ⚠️ потребує ручного тестування в браузері
- [x] T032 [P] Перевірити відповідність конституції (Constitution Check)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — може починатись одразу
- **Foundational (Phase 2)**: Залежить від Phase 1 — БЛОКУЄ всі користувацькі історії
- **User Story 1 (Phase 3)**: Залежить від Phase 2 — може починатись після нього
- **User Story 2 (Phase 4)**: Залежить від Phase 2 — може починатись після нього. Може виконуватись паралельно з US1
- **User Story 3 (Phase 5)**: Залежить від Phase 2 — може починатись після нього. Може виконуватись паралельно з US1 та US2
- **Polish (Phase 6)**: Залежить від US1, US2, US3

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational — Незалежний від US1 (використовує загальний BackgroundRenderer API)
- **User Story 3 (P3)**: Can start after Foundational — Незалежний від US1/US2 (власні методи рендерингу)

### Within Each User Story

- Рендерери фонів (US1, US3) незалежні один від одного — всі позначені [P]
- US2: createParticles → updateParticles → renderParticles → інтеграція з engine.js (послідовно)
- Кожна історія завершується оновленням LEVELS_CONFIG

### Parallel Opportunities

- Усі 7 рендерерів US1 (T010-T016) можуть виконуватись паралельно
- Усі 3 рендерери US3 (T024-T026) можуть виконуватись паралельно
- US1, US2, US3 можуть виконуватись паралельно після Phase 2
- T029, T032 у Phase 6 можуть виконуватись паралельно

---

## Parallel Example: User Story 1

```bash
# Запустити всі рендерери US1 паралельно:
Task: "Реалізувати renderCyberGrid() у js/backgrounds.js"
Task: "Реалізувати renderParallaxCity() у js/backgrounds.js"
Task: "Реалізувати renderHyperspaceTunnel() у js/backgrounds.js"
Task: "Реалізувати renderBezierWaves() у js/backgrounds.js"
Task: "Реалізувати renderStarfield() у js/backgrounds.js"
Task: "Реалізувати renderEnergyGrid() у js/backgrounds.js"
Task: "Реалізувати renderGeoLandscape() у js/backgrounds.js"
```

## Parallel Example: User Story 3

```bash
# Запустити всі спецефекти US3 паралельно:
Task: "Реалізувати renderNeonRain() у js/backgrounds.js"
Task: "Реалізувати renderMatrixFlow() у js/backgrounds.js"
Task: "Реалізувати renderEqualizer() у js/backgrounds.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T009)
3. Complete Phase 3: User Story 1 (T010-T018)
4. **STOP and VALIDATE**: Протестувати US1 незалежно — усі рівні мають нові фони
5. За бажанням — задеплоїти/продемонструвати MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Додати US1 → Тестувати незалежно → MVP готовий!
3. Додати US2 → Тестувати незалежно → Частки працюють
4. Додати US3 → Тестувати незалежно → Спецефекти працюють
5. Polish → Фінальна валідація → Готово

### Parallel Team Strategy

Якщо кілька розробників:

1. Команда разом виконує Setup + Foundational
2. Після Foundational:
   - Developer A: User Story 1 (7 рендерерів + LEVELS_CONFIG)
   - Developer B: User Story 2 (система часток + інтеграція)
   - Developer C: User Story 3 (3 спецефекти + glow)
3. Усі історії завершуються та інтегруються незалежно

---

## Notes

- [P] tasks = різні методи/файли, без залежностей
- [Story] label прив'язує задачу до конкретної користувацької історії для відстежуваності
- Кожна користувацька історія має бути незалежно завершуваною та тестованою
- Комітити після кожної задачі або логічної групи
- Зупинятись на будь-якому checkpoint для незалежної валідації історії
- Уникати: розмитих задач, конфліктів у одному файлі, між-історійних залежностей

---

## Phase 7: Convergence

**Purpose**: Усунути виявлені розбіжності між специфікацією та поточною реалізацією після першого проходу `/speckit.implement`.

- [x] T033 [US1] Виправити `renderCyberGrid()` у `js/backgrounds.js` — збільшити інтервал між вертикальними лініями (`spacing = W * 0.12` замість `W * 0.06`), додати плавний fade-in/fade-out цикл для кожної лінії: кожна лінія або група з 2-3 ліній отримує власну фазу (`phase = (i * 0.37) % (Math.PI * 2)`), прозорість обчислюється через `alpha = 0.3 + 0.7 * (Math.sin(time * 1.2 + phase) * 0.5 + 0.5)`, глобальний `ctx.globalAlpha` замінити на індивідуальний `rgba()` з динамічним alpha для кожного виклику `ctx.strokeStyle`. per FR-002 (partial)
- [x] T034 [P] [US1] Виправити `renderCyberGrid()` у `js/backgrounds.js` — замінити `offset = (time * speed * 0.25) % 1` на `offset = (time * speed * 0.25) % (cols * spacing)` для плавного циклічного руху без стрибків. per FR-002 (partial)
- [ ] T035 [US1] Виконати ручне тестування згідно з `quickstart.md` — відкрити `index.html` у браузері, перевірити якість фону рівня 1-1 (кібер-сітка: відстань між лініями, плавність fade-циклів), а також пройти 7 сценаріїв перевірки. per T031 (partial)

---

## Phase 8: Convergence

**Purpose**: Усунути виявлені розбіжності після другого проходу `/speckit.implement`.

- [x] T036 [US1] Виправити `renderCyberGrid()` у `js/backgrounds.js` — замінити глобальний `offset % wrapPeriod` на циклічне обертання кожної лінії: `continuousOffset = time * speed * 0.25`, позиція лінії `rawPos = vanishX + (i * spacing - continuousOffset)`, загорнути через `(rawPos - vanishX + totalRange) % totalRange - totalRange / 2`, малювати `2 * cols` ліній щоб wrap був непомітним, додати fade-to-zero для ліній біля країв (`alpha *= clamp(1 - |rawPos - vanishX| / (W * 0.6), 0, 1)`). per FR-002 (partial)

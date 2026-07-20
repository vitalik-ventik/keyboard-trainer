# Implementation Plan: Система балів, досягнень та UI нагород

**Branch**: `017-score-achievement-ui` | **Date**: 2026-07-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/017-score-achievement-ui/spec.md`

## Summary

Заміна поточної спрощеної системи балів (+10/+15 за натискання) на адитивну систему цілих балів із бонусами за конфігурацію (складність, розмір зони, швидкість). Додавання системи досягнень «Срібний Максимум» (perfectEasy) та «Золотий Максимум» (perfectHard) із порівнянням фінального рахунку з теоретичним максимумом рівня. Розширення UI: срібні/золоті рамки та зірки на картках рівнів (CSS), золоте свічення та шлейф навколо кубика (Canvas shadowBlur). Усі зміни в межах існуючого стеку: Vanilla JS (ES6 Modules) + HTML5 Canvas + CSS + localStorage.

## Technical Context

**Language/Version**: ES6+ Vanilla JavaScript (ES6 Modules)

**Primary Dependencies**: None (чистий HTML5 Canvas 2D API, DOM API, Web Audio API)

**Storage**: localStorage (ключ `"dfp_save_v1"`)

**Testing**: Ручне тестування в браузері (Windows 11, Chrome/Edge/Firefox), перевірка через localStorage inspector

**Target Platform**: Windows 11, сучасні браузери з підтримкою Canvas 2D, CSS-анімацій (keyframes), та Canvas shadowBlur

**Project Type**: Односторінковий веб-застосунок (SPA) — HTML + CSS + Vanilla JS

**Performance Goals**: 60 FPS під час гри з активним золотим свіченням (shadowBlur), без падіння кадрів на інтегрованій графіці

**Constraints**: Жодних зовнішніх зображень, CDN, npm-пакетів. Українська мова інтерфейсу та коментарів. Усі візуальні ефекти — засобами CSS або Canvas.

**Scale/Scope**: 31 рівень × 5 ліг, 3 режими складності, 3 розміри зони, 3 швидкості = максимум 27 комбінацій конфігурації на рівень

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Файл `.specify/memory/constitution.md` відсутній. Перевірка виконується на основі `AGENTS.md` (AI Roles, Tech Stack & Constraints):

| Принцип | Статус | Обґрунтування |
|---------|--------|---------------|
| Чистий HTML5 Canvas + Vanilla JS (ES6 Modules) | ✅ PASS | Усі зміни в `js/engine.js`, `js/main.js`, `css/style.css` — без фреймворків |
| Українська мова інтерфейсу та коментарів | ✅ PASS | Усі назви, статуси, коментарі — українською |
| localStorage без зовнішніх залежностей | ✅ PASS | Досягнення зберігаються в існуючий ключ `dfp_save_v1` із try/catch |
| Без зовнішніх зображень/CDN | ✅ PASS | Зірки, рамки — CSS-градієнти/символи; свічення — Canvas shadowBlur |
| Модульна структура (index.html + css/ + js/) | ✅ PASS | Зміни в існуючих файлах `js/engine.js`, `js/main.js`, `css/style.css` |

## Project Structure

### Documentation (this feature)

```text
specs/017-score-achievement-ui/
├── spec.md              # Специфікація функції
├── plan.md              # Цей файл (результат /speckit.plan)
├── research.md          # Phase 0: дослідження та рішення
├── data-model.md        # Phase 1: модель даних
├── quickstart.md        # Phase 1: інструкція валідації
├── contracts/           # Phase 1: контракти інтерфейсів
│   ├── scoring-api.md
│   ├── achievement-manager.md
│   └── skin-glow-enhancement.md
└── tasks.md             # Phase 2: завдання (результат /speckit.tasks)
```

### Source Code (repository root)

```text
js/
├── engine.js            # Основний файл змін: нова логіка балів, maxScore, досягнення, glow-ефекти кубика
├── main.js              # UI зміни: картки рівнів зі статусами, картки скінів зі статусами
├── keyboard.js          # Без змін
├── assets.js            # Без змін
└── backgrounds.js       # Без змін

css/
└── style.css            # Нові класи: .perfect-silver, .perfect-gold, анімації @keyframes

index.html               # Без змін (потрібні DOM-елементи вже існують)
```

**Structure Decision**: Усі зміни зосереджені в існуючих файлах `engine.js` (core-логіка), `main.js` (DOM UI), `style.css` (візуальне оформлення). Нові файли не створюються — лише розширення існуючих. Документація в `specs/017-score-achievement-ui/`.

## Complexity Tracking

> Жодних порушень Constitution Check не виявлено. Секція не заповнюється.

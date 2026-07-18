# Data Model: Гаряча клавіша Enter (002-enter-retry-hotkey)

**Date**: 2026-07-18 | **Plan**: [plan.md](./plan.md)

Фіча не додає персистентних даних. Одна runtime-сутність.

## 1. ConfirmHotkey (мапінг гарячої клавіші)

| Поле | Значення | Опис |
|------|----------|------|
| Фізичні клавіші | `event.code`: `Enter`, `NumpadEnter` | Обидві еквівалентні (FR-036) |
| Подія | `confirm` | Єдина семантична дія, яку емітить keyboard.js |
| Фільтри | `repeat === true` → ігнор; Ctrl/Alt/Meta → ігнор | FR-035, FR-036 |
| preventDefault | Завжди (без модифікаторів) | FR-033; research.md R4 |

## 2. Диспетчеризація за станом (розширення GameState, фіча 001 §1)

| Стан | Реакція на `confirm` |
|------|----------------------|
| `GAMEOVER` | Програмний клік `#btnRetry` → `startLevel(currentLevelId)` (FR-030) |
| `VICTORY` | Програмний клік `#btnRetryWin` → `startLevel(currentLevelId)` (FR-031) |
| `LOADING`, `MENU`, `SETTINGS`, `LEVEL_SELECT`, `PLAYING` | Жодних дій (FR-034) |

**Інваріанти**:

- Дія `confirm` ніколи не запускає наступний рівень — лише поточний (FR-031).
- Один фізичний натиск → максимум один перезапуск: repeat-фільтр у
  keyboard.js + стан-бар'єр у main.js (SC-011).
- Переходи станів не змінюються: використовуються наявні
  `GAMEOVER → PLAYING` та `VICTORY → PLAYING` (data-model фічі 001, §1).

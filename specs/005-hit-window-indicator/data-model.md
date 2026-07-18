# Data Model: Візуальна індикація вікна стрибка на лінії землі

**Feature**: 005-hit-window-indicator
**Phase**: 1 — Design & Contracts
**Date**: 2026-07-18

## Overview

Фіча є суто візуальною — вона не додає нових структур даних, не змінює існуючі моделі та не потребує персистентності. Цей документ описує лише зміни в потоці рендерингу для прозорості архітектурного дизайну.

## Existing Entities (unchanged)

Усі існуючі сутності залишаються без змін:

| Entity | Location | Status |
|--------|----------|--------|
| `Engine.player` | `js/engine.js:342` | Без змін |
| `Engine.spikes[]` | `js/engine.js:339` | Без змін |
| `Engine.okPx` | `js/engine.js:330` | Без змін, лише читання |
| `Engine.perfectPx` | `js/engine.js:331` | Без змін, лише читання |
| `LEVELS[]` | `js/engine.js:23` | Без змін |
| `save` (SaveManager) | `js/engine.js:201` | Без змін |

## Visual Entities (render-only)

Нові візуальні сутності існують лише в контексті рендерингу — не мають полів у класі Engine.

### Hit Window Indicator

Візуальний індикатор на лінії землі, що рендериться методом `Engine.renderHitWindow()`.

**Умови відображення**:
- `this.player.alive === true`
- `this.nearestAheadSpike() !== null`

**Геометрія**:
- Початок: `x = anchorX`, `y = groundY - 3`
- Висота: 6 px (центровано на `groundY`)

**Складові зони**:

| Зона | Довжина (x-вісь) | Колір заливки | `shadowBlur` | Анімація |
|------|-------------------|---------------|-------------|----------|
| OK (зовнішня) | `this.okPx` | `rgba(0, 246, 255, 0.15)` | 6 | Ні (статична) |
| Perfect (внутрішня) | `this.perfectPx` | `rgba(57, 255, 136, alpha)` | 10 | `alpha = 0.35 + 0.15 * (sin(t*6)+1)/2` |

**Порядок малювання** (z-order):
1. Спочатку OK-зона (зовнішня, довша) — фоновий шар
2. Потім Perfect-зона (внутрішня, коротша) — передній шар з пульсацією

## Rendering Pipeline Change

**Before** (поточний `render()`):

```text
renderBackground → renderGround → renderFinish → renderSpikes → renderPlayer → renderParticles → renderProgressBar
```

**After** (зі зміною):

```text
renderBackground → renderGround → renderHitWindow → renderFinish → renderSpikes → renderPlayer → renderParticles → renderProgressBar
```

## State Transitions (none)

Фіча не вводить нових станів. Індикатор реагує на вже існуючі зміни стану:

- `player.alive`: true → false → індикатор зникає
- `nearestAheadSpike()`: spike → null → індикатор зникає
- `nearestAheadSpike()`: null → spike → індикатор з'являється

## Contracts

Фіча не має зовнішніх інтерфейсів — це внутрішня зміна рендерингу. Директорія `contracts/` не створюється.

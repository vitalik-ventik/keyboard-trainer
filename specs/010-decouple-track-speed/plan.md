# Implementation Plan: Розділення швидкості генерації траси та швидкості руху

**Branch**: `010-decouple-track-speed` | **Date**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

## Summary

Виправити імплементацію швидкості з 009 — розділити `level.speed` на базову (для генерації траси) та ефективну (для руху та hit window).

## Технічний контекст

- **Файл**: `js/engine.js` (конструктор Engine, update, generateTrack)
- **Змін**: 3 локації — конструктор, `update()`, конструктор (okPx/perfectPx)
- **Інші файли**: без змін

## Конституція

✅ PASS — жодних фреймворків, нових модулів, порушень.

## Задачі

- [x] T001 У конструкторі Engine: зберігати `this.level.speed` без множника, додати `this.effectiveSpeed = this.level.speed * SPEED_MULTIPLIERS[speed] ?? 1.0`
- [x] T002 В конструкторі: використати `this.effectiveSpeed` для `okPx` / `perfectPx`
- [x] T003 В `update()`: замінити `this.level.speed` на `this.effectiveSpeed` для руху гравця та обертання пилок

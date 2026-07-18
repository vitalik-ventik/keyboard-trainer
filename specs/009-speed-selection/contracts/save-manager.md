# Contract: SaveManager (Speed API)

## Методи

### `save.setSpeed(value)`

- **Приймає**: рядок `value` ∈ {`"slow"`, `"normal"`, `"fast"`}
- **Повертає**: `undefined`
- **Побічний ефект**: Оновлює `saveData.settings.speed` → викликає `persist()`
- **Блокування**: `try/catch` навколо `localStorage.setItem` (згідно з
  AGENTS.md та конституцією, Принцип IV)

### `save.getSpeed()`

- **Приймає**: нічого
- **Повертає**: рядок ∈ {`"slow"`, `"normal"`, `"fast"`}
- **Гарантія**: Завжди повертає валідне значення. Якщо `speed` відсутній
  або недійсний — `"normal"` (через `sanitizeSaveData`)

## Валідація (`sanitizeSaveData`)

```js
if (!["slow", "normal", "fast"].includes(raw.settings.speed)) {
    raw.settings.speed = "normal";
}
```

## Приклад використання

```js
save.setSpeed("slow");
console.log(save.getSpeed()); // "slow"

save.setSpeed("turbo"); // ignored by sanitize, reset to "normal" on load
```

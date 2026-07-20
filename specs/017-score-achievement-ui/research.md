# Research: Система балів, досягнень та UI нагород

**Дата**: 2026-07-20

## R1: Формула нарахування балів — інтеграція в Engine

**Decision**: Модифікувати `handleLetter()` (рядок 1229) та `consumeJumpBuffer()` (рядок 1161) у `js/engine.js` для використання нової адитивної формули. Замінити `this.score += 10 + (perfect ? 5 : 0)` на виклик нової чистої функції `calculateHitScore(isOkZone, config)`.

**Rationale**: Поточна формула (`10 + 5 за perfect`) не враховує конфігурацію (складність, розмір зони, швидкість). Нова формула: `baseScore + difficultyBonus + zoneSizeBonus + speedBonus`, де:
- `baseScore`: 100 для OK, 80 для іншої зони
- `difficultyBonus`: HARD = +50, EASY = +0
- `zoneSizeBonus`: NORMAL = +20, LARGE = +0
- `speedBonus`: FAST = +40, NORMAL = +0, SLOW = −20

Підсумковий бал обмежується знизу нулем (`Math.max(0, ...)`) для FR-003.

**Alternatives considered**:
- Використання таблиці пошуку (lookup table) для всіх 36 комбінацій — надлишково, формула простіша для розуміння та тестування
- Модифікація значень в об'єкті `this` без окремої функції — менш тестовано та дублює код у двох методах

**Integration points**:
- `js/engine.js:1063-1079` — прочитати `this.difficulty`, `this.okPx`/`this.perfectPx` для визначення `hitWindow`, `this.effectiveSpeed` для швидкості
- `js/engine.js:1229` — замінити нарахування балів у `handleLetter()`
- `js/engine.js:1161` — замінити нарахування балів у `consumeJumpBuffer()`

---

## R2: Розрахунок максимального балу рівня

**Decision**: Статичне обчислення `maxEasy` та `maxHard` для кожного рівня на основі `level.spikeCount`. Оскільки розмір зони та швидкість можуть змінюватися між запусками, максимальний бал залежить від поточної конфігурації гравця:
- `maxEasy = spikeCount × (100 + 0 + zoneBonus + speedBonus)`
- `maxHard = spikeCount × (100 + 50 + zoneBonus + speedBonus)`

Обчислення виконується в конструкторі `Engine` після застосування налаштувань і зберігається як `this.maxEasy` та `this.maxHard`. При перемозі ці значення порівнюються з `this.score`.

**Rationale**: 

Максимум залежить від поточної конфігурації (згідно з acceptance scenarios у spec.md, де maxEasy = 10 × 120 = 1200 для EASY/NORMAL/NORMAL). Це означає, що гравець може отримати perfectEasy при різних конфігураціях, якщо влучає в OK кожного разу. Значення зберігаються в екземплярі Engine для доступу при завершенні рівня.

**Alternatives considered**:
- Глобальний абсолютний максимум для кожної конфігурації — надлишково, ускладнює порівняння
- Збереження maxScore у localStorage — непотрібно, оскільки spikeCount є статичною властивістю рівня
- Динамічний перерахунок на кожному натисканні — зайві обчислення

---

## R3: Розширення схеми localStorage для досягнень

**Decision**: Додати поле `perfect` до кожного запису рівня в `saveData.progress.levels[id]`. Поточна структура:

```json
"1": { "bestPct": 85, "highScore": 1200 }
```

Нова структура:

```json
"1": { "bestPct": 85, "highScore": 1200, "perfect": null }
```

Де `perfect` може бути `null` (немає досягнення), `"easy"` (Срібний Максимум) або `"hard"` (Золотий Максимум).

**Rationale**: Мінімальне розширення існуючої схеми. Значення за замовчуванням `null` забезпечує зворотну сумісність із наявними збереженнями (через `sanitizeSaveData()`). Ієрархія "hard" > "easy" > null реалізується при записі: якщо поточне значення `"hard"`, нове `"easy"` не перезаписує його.

**Alternatives considered**:
- Окремий ключ `dfp_achievements_v1` — ускладнює синхронізацію, більше коду для sanitize
- Булеві поля `perfectEasy`/`perfectHard` — надлишково, три стани простіше одним полем
- Числове кодування (0/1/2) — менш читабельне при інспектуванні localStorage

**Sanitize logic**: `sanitizeSaveData()` має перевіряти, що `perfect` ∈ {null, "easy", "hard"} і встановлювати `null` для некоректних значень.

---

## R4: CSS-оформлення срібної та золотої зірки

**Decision**: Використовувати HTML-символ зірки `★` (U+2605) із CSS-градієнтами для створення металевого ефекту. Для срібної зірки — лінійний градієнт від білого до темно-сірого. Для золотої зірки — градієнт від яскраво-жовтого до темно-золотого з `text-shadow` для ефекту розплавленого золота.

**Срібна зірка**:
```css
.perfect-silver .level-star {
    font-size: 3vmin;
    background: linear-gradient(180deg, #ffffff 0%, #b0b8c8 40%, #6b7280 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 8px rgba(192, 200, 216, 0.6);
}
```

**Золота зірка**:
```css
.perfect-gold .level-star {
    font-size: 3vmin;
    background: linear-gradient(180deg, #fff7cc 0%, #ffd700 30%, #b8860b 70%, #8b6914 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 14px rgba(255, 215, 0, 0.8), 0 0 28px rgba(255, 180, 0, 0.4);
    animation: goldStarPulse 1.5s ease-in-out infinite;
}
```

**Rationale**: Чистий CSS без зображень (відповідає вимогам AGENTS.md). `background-clip: text` створює металевий градієнт на символі. `text-shadow` додає свічення. CSS-анімація для золотої зірки створює ефект пульсації.

**Alternatives considered**:
- SVG-зірка — потребує додаткової розмітки, складніше в DOM-генерації
- CSS clip-path зірка — складніше, гірша підтримка
- Псевдоелемент із border — обмежена геометрія для п'ятикутної зірки
- Emoji ⭐ — неконтрольований вигляд, залежить від ОС

---

## R5: CSS-анімація пульсуючого неонового свічення для золотої картки

**Decision**: CSS `@keyframes` для пульсації `box-shadow` та легкого масштабування. Додати клас `.perfect-gold` до `.level-card`:

```css
@keyframes goldPulse {
    0%, 100% {
        box-shadow:
            0 0 16px rgba(255, 215, 0, 0.6),
            0 0 32px rgba(255, 180, 0, 0.3),
            inset 0 0 24px rgba(255, 215, 0, 0.15);
        transform: scale(1);
    }
    50% {
        box-shadow:
            0 0 28px rgba(255, 215, 0, 0.9),
            0 0 56px rgba(255, 180, 0, 0.5),
            inset 0 0 36px rgba(255, 215, 0, 0.25);
        transform: scale(1.03);
    }
}

.perfect-gold {
    border: 0.45vmin solid transparent;
    border-image: linear-gradient(135deg, #ffd700, #b8860b, #ffd700, #8b6914) 1;
    animation: goldPulse 2s ease-in-out infinite;
}
```

**Срібна картка** — статична, без анімації:
```css
.perfect-silver {
    border: 0.25vmin solid #b0b8c8;
    box-shadow: 0 0 10px rgba(192, 200, 216, 0.5);
}
```

**Rationale**: Пульсація з періодом 2 секунди створює помітний, але не дратівливий ефект. Легке масштабування (1.03) додає «дихання». Для срібла — стримана статична рамка, як і вимагає специфікація.

**Alternatives considered**:
- `animation: pulse 1s` — занадто швидко, може дратувати
- `filter: drop-shadow()` — гірша продуктивність
- `outline` замість `border` — outline не підтримує градієнти та заокруглення

---

## R6: Canvas-рендеринг срібного контуру та золотого свічення кубика

**Decision**: Модифікувати `renderPlayer()` (рядок 1598) у `js/engine.js` для додавання ефектів перед рендерингом скіна:

**Срібний контур** (perfectEasy): Після рендерингу скіна, намалювати тонкий прямокутник із біло-срібним кольором поверх кубика:
```js
if (achievementStatus === 'easy') {
    ctx.strokeStyle = '#e8ecf2';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(200, 210, 225, 0.7)';
    ctx.strokeRect(-size/2, -size/2, size, size);
    ctx.shadowBlur = 0;
}
```

**Золоте свічення** (perfectHard): Встановити `shadowBlur` та `shadowColor` перед рендерингом скіна, щоб усе тіло кубика випромінювало золоте сяйво. Для шлейфу при стрибках — додати окремі золоті частинки в масив `trail`:
```js
if (achievementStatus === 'hard') {
    ctx.shadowBlur = 22;
    ctx.shadowColor = '#ffb800';
    // ... render skin with glow ...
    ctx.shadowBlur = 0;
    
    // Gold trail particles during jumps
    if (!this.player.onGround && this.player.vy !== 0) {
        for (const point of this.player.goldTrail) {
            // draw fading gold spark
        }
    }
}
```

**Rationale**: `shadowBlur` — нативний Canvas API для свічення, не потребує додаткових обчислень. Срібний контур — простий `strokeRect` поверх скіна. Золотий шлейф — розширення існуючої системи `trail` (рядки 1604-1611) із золотими кольорами та підвищеною яскравістю.

**Performance note**: `shadowBlur = 22` може впливати на FPS на слабкому GPU. Рекомендовано кешувати результат або зменшувати значення при виявленні падіння кадрів нижче 55 FPS (SC-006). Альтернативно — використовувати `shadowBlur = 14` для балансу між візуалом і продуктивністю.

**Alternatives considered**:
- `ctx.globalCompositeOperation = 'lighter'` + додаткові шари — складніше, більше обчислень
- Окремий канвас для свічення (offscreen canvas) — надлишково для однієї фічі
- CSS `filter: drop-shadow()` на canvas — впливає на весь канвас, не лише на кубик

---

## R7: Інтеграція з існуючою системою скінів

**Decision**: Досягнення (`perfect`) читаються з `saveData.progress.levels[levelId].perfect` і передаються в `renderPlayer()` як додатковий параметр. Для скінів, прив'язаних до рівня, статус досягнення цього рівня визначає візуальні ефекти:

- **У меню вибору скінів** (`main.js:buildSkinGrid`, рядок 611): додати CSS-клас `.perfect-silver` або `.perfect-gold` до `.skin-card`, якщо рівень, до якого прив'язаний скін, має відповідний статус
- **У грі** (`engine.js:renderPlayer`, рядок 1598): читати `saveData.progress.levels[this.level.id].perfect` і застосовувати glow-ефекти

**Визначення статусу для скіна**: Скін прив'язаний до рівня через `level.skin`. Статус досягнення береться з `progress.levels[level.id].perfect`. Якщо гравець використовує активний скін (не прив'язаний до поточного рівня), ефекти все одно застосовуються на основі статусу рівня, до якого цей скін прив'язаний.

**Rationale**: Мінімальне втручання в існуючу архітектуру. Статус уже зберігається в localStorage, потрібно лише прочитати його при рендерингу.

**Alternatives considered**:
- Збереження статусу безпосередньо в об'єкті скіна — дублювання даних, ризик розсинхронізації
- Окремий реєстр досягнень — зайва абстракція для 2 значень на рівень

---

## R8: Оновлення `sanitizeSaveData()` для зворотної сумісності

**Decision**: Розширити функцію `sanitizeSaveData()` (рядок 833) для додавання поля `perfect: null` до кожного рівня, якщо воно відсутнє в наявних даних:

```js
for (const key of Object.keys(saveData.progress.levels)) {
    const entry = saveData.progress.levels[key];
    if (!("perfect" in entry)) {
        entry.perfect = null;
    } else if (![null, "easy", "hard"].includes(entry.perfect)) {
        entry.perfect = null;
    }
}
```

**Rationale**: Забезпечує коректну міграцію наявних збережень без втрати даних. Гравці з існуючим прогресом отримають `perfect: null` для всіх рівнів.

---

## R9: Відображення поточного рахунку та maxScore на progress bar

**Decision**: Оновити рядок 1674 у `engine.js`, де рендериться `"Очки: " + this.score`, додати відображення поточного рахунку порівняно з максимумом:

```js
const maxForMode = this.difficulty === "HARD" ? this.maxHard : this.maxEasy;
ctx.fillText("Очки: " + this.score + " / " + maxForMode, barX - 12, barY + barH / 2);
```

**Rationale**: Гравець бачить не лише поточний рахунок, але й ціль для досягнення максимуму, що відповідає SC-001.

---

## Summary of All Decisions

| ID | Topic | Decision |
|----|-------|----------|
| R1 | Scoring formula | Чиста функція `calculateHitScore(isOk, config)` в `engine.js` |
| R2 | Max score calc | Статичне обчислення в конструкторі Engine за поточною конфігурацією |
| R3 | localStorage schema | `perfect: null | "easy" | "hard"` у `progress.levels[id]` |
| R4 | Silver/gold stars | HTML-символ ★ із CSS `background-clip: text` градієнтами |
| R5 | Gold card glow | CSS `@keyframes goldPulse` 2s для `box-shadow` + `transform` |
| R6 | Canvas glow | `shadowBlur` + `shadowColor` перед рендерингом скіна кубика |
| R7 | Skin integration | Читати `progress.levels[levelId].perfect` при рендерингу скіна |
| R8 | Backward compat | `sanitizeSaveData()` додає `perfect: null` за замовчуванням |
| R9 | Score display | `"Очки: {score} / {maxForMode}"` на progress bar |

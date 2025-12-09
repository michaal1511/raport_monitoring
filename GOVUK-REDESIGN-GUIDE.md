# 🇬🇧 GOV.UK Design System - Przewodnik Redesignu

## Cel
Przeprojektowanie całej aplikacji Monitoring Dostępności używając GOV.UK Design System z kolorystyką: **czarny, biały, szary** (bez żadnych jaskrawych kolorów).

## Zasoby

### Framework
- **govuk-style.css** - Kompletny framework GOV.UK (już utworzony)

### Kolory
- **Tekst główny:** `#0b0c0c` (prawie czarny)
- **Tło:** `#ffffff` (biały)
- **Tło secondary:** `#f3f2f1` (jasny szary)
- **Obramowania:** `#b1b4b6` (średni szary)
- **Tekst pomocniczy:** `#505a5f` (ciemny szary)
- **Błędy:** `#d4351c` (czerwony)

## Konwersja Komponentów

### 1. Header

**PRZED:**
```html
<header>
    <h1 id="main-title">Monitoring strony</h1>
    <div class="header-actions">
        <button class="btn btn-small btn-secondary">...</button>
    </div>
</header>
```

**PO (GOV.UK):**
```html
<header class="govuk-header" role="banner">
    <div class="govuk-width-container">
        <div class="govuk-header__container">
            <div class="govuk-header__logo">
                Monitoring Dostępności
            </div>
            <div class="govuk-header__content">
                <!-- Navigation buttons -->
            </div>
        </div>
    </div>
</header>
```

### 2. Przyciski

**PRZED:**
```html
<button class="btn btn-primary">Zapisz</button>
<button class="btn btn-secondary">Anuluj</button>
<button class="btn btn-danger">Usuń</button>
<button class="btn btn-small">Mały</button>
```

**PO (GOV.UK):**
```html
<button class="govuk-button">Zapisz</button>
<button class="govuk-button govuk-button--secondary">Anuluj</button>
<button class="govuk-button govuk-button--warning">Usuń</button>
<button class="govuk-button govuk-button--small">Mały</button>
```

### 3. Formularze

**PRZED:**
```html
<div class="form-group">
    <label for="name">Nazwa:</label>
    <input type="text" id="name" class="form-control">
</div>
```

**PO (GOV.UK):**
```html
<div class="govuk-form-group">
    <label class="govuk-label" for="name">
        Nazwa
    </label>
    <input class="govuk-input" id="name" name="name" type="text">
</div>
```

### 4. Select

**PRZED:**
```html
<select id="klient" class="form-control">
    <option>-- Wybierz --</option>
</select>
```

**PO (GOV.UK):**
```html
<select class="govuk-select" id="klient" name="klient">
    <option value="">Wybierz klienta</option>
</select>
```

### 5. Textarea

**PRZED:**
```html
<textarea id="notes" class="form-control" rows="5"></textarea>
```

**PO (GOV.UK):**
```html
<textarea class="govuk-textarea" id="notes" name="notes" rows="5"></textarea>
```

### 6. Tabele

**PRZED:**
```html
<table class="data-table">
    <thead>
        <tr><th>Nazwa</th></tr>
    </thead>
    <tbody>
        <tr><td>Wartość</td></tr>
    </tbody>
</table>
```

**PO (GOV.UK):**
```html
<table class="govuk-table">
    <thead class="govuk-table__head">
        <tr class="govuk-table__row">
            <th scope="col" class="govuk-table__header">Nazwa</th>
        </tr>
    </thead>
    <tbody class="govuk-table__body">
        <tr class="govuk-table__row">
            <td class="govuk-table__cell">Wartość</td>
        </tr>
    </tbody>
</table>
```

### 7. Taby

**PRZED:**
```html
<div class="tabs">
    <button class="tab active">Tab 1</button>
    <button class="tab">Tab 2</button>
</div>
<div class="tab-content active">Content 1</div>
<div class="tab-content">Content 2</div>
```

**PO (GOV.UK):**
```html
<div class="govuk-tabs">
    <ul class="govuk-tabs__list">
        <li class="govuk-tabs__list-item">
            <a class="govuk-tabs__tab govuk-tabs__tab--selected" href="#tab1">
                Tab 1
            </a>
        </li>
        <li class="govuk-tabs__list-item">
            <a class="govuk-tabs__tab" href="#tab2">
                Tab 2
            </a>
        </li>
    </ul>
    <div class="govuk-tabs__panel" id="tab1">Content 1</div>
    <div class="govuk-tabs__panel govuk-tabs__panel--hidden" id="tab2">Content 2</div>
</div>
```

### 8. Tagi/Badges (dla typów plików)

**PRZED:**
```html
<span class="file-type-badge file-type-html">HTML</span>
```

**PO (GOV.UK):**
```html
<strong class="govuk-tag">HTML</strong>
<strong class="govuk-tag govuk-tag--grey">JSON</strong>
<strong class="govuk-tag govuk-tag--black">CSV</strong>
```

### 9. Panele/Boxes

**PRZED:**
```html
<div class="info-box">
    <p>Ważna informacja</p>
</div>
```

**PO (GOV.UK):**
```html
<div class="govuk-inset-text">
    Ważna informacja
</div>

<!-- LUB dla większego panelu -->
<div class="govuk-panel">
    <p class="govuk-body">Ważna informacja</p>
</div>
```

### 10. Notyfikacje/Alerty

**PRZED:**
```html
<div class="alert alert-error">
    <p>Błąd!</p>
</div>
```

**PO (GOV.UK):**
```html
<div class="govuk-error-summary" role="alert">
    <h2 class="govuk-error-summary__title">
        Wystąpił problem
    </h2>
    <div class="govuk-error-summary__body">
        <p>Błąd!</p>
    </div>
</div>
```

### 11. Loading Spinner

**PRZED:**
```html
<div class="loading-spinner"></div>
```

**PO (GOV.UK):**
```html
<div class="govuk-loader"></div>

<!-- Z overlay -->
<div class="govuk-loader-overlay govuk-loader-overlay--active">
    <div class="govuk-loader"></div>
</div>
```

### 12. Nagłówki

**PRZED:**
```html
<h1>Tytuł</h1>
<h2>Podtytuł</h2>
```

**PO (GOV.UK):**
```html
<h1 class="govuk-heading-xl">Tytuł</h1>
<h2 class="govuk-heading-l">Podtytuł</h2>
<h3 class="govuk-heading-m">Średni</h3>
<p class="govuk-body">Normalny tekst</p>
```

## Zasady Designu GOV.UK

### ✅ DO:
- Używaj Arial jako głównej czcionki
- 19px jako bazowy rozmiar fontu
- Ostre kąty (border-radius: 0)
- Wysokie kontrasty (czarny na białym)
- Proste cienie tylko na przyciskach (0 2px 0)
- Focus state: żółty outline (#ffdd00)
- Przestrzeń: dużo marginesów i paddingów
- Semantyczny HTML (proper headings, labels, etc.)

### ❌ NIE UŻYWAJ:
- Gradientów
- Zaokrąglonych rogów (border-radius)
- Animacji (oprócz loading spinner)
- Jaskrawych kolorów
- Cieni na innych elementach niż przyciski
- Fancy efektów hover

## Layout

### Container

```html
<div class="govuk-width-container">
    <main class="govuk-main-wrapper">
        <!-- Treść -->
    </main>
</div>
```

### Responsive

Framework jest responsywny - na mobile (<640px):
- Przyciski stają się full-width
- Fonty są mniejsze
- Layout się dostosowuje

## Utilities

```html
<!-- Marginesy -->
<p class="govuk-!-margin-bottom-0">Zero margin</p>
<p class="govuk-!-margin-bottom-3">15px margin</p>
<p class="govuk-!-margin-bottom-6">30px margin</p>

<!-- Font weight -->
<span class="govuk-!-font-weight-bold">Bold</span>
<span class="govuk-!-font-weight-regular">Regular</span>

<!-- Visually hidden (dla screen readers) -->
<span class="govuk-visually-hidden">Tylko dla czytników</span>
```

## Przykład Kompletnej Strony

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Strona - System Monitoringu</title>
    <link rel="stylesheet" href="govuk-style.css">
</head>
<body>
    <!-- Header -->
    <header class="govuk-header" role="banner">
        <div class="govuk-width-container">
            <div class="govuk-header__container">
                <div class="govuk-header__logo">
                    Monitoring Dostępności
                </div>
                <div class="govuk-header__content">
                    <button class="govuk-button govuk-button--secondary govuk-button--small">
                        Wyloguj
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <div class="govuk-width-container">
        <main class="govuk-main-wrapper">

            <h1 class="govuk-heading-xl">Tytuł Strony</h1>

            <form>
                <div class="govuk-form-group">
                    <label class="govuk-label" for="input1">
                        Pole tekstowe
                    </label>
                    <input class="govuk-input" id="input1" name="input1" type="text">
                </div>

                <button type="submit" class="govuk-button">
                    Zapisz
                </button>
            </form>

        </main>
    </div>

    <script src="app.js"></script>
</body>
</html>
```

## Kolejność Redesignu

1. ✅ **login.html** - Gotowe
2. ⏳ **scans.html** - W trakcie
3. ⏳ **client-view.html** - Zaplanowane
4. ⏳ **index.html** - Zaplanowane

## Testowanie

Po redesignie każdej strony, przetestuj:
- [ ] Wszystkie przyciski działają
- [ ] Formularze się wysyłają
- [ ] JavaScript działa poprawnie
- [ ] Responsywność na mobile
- [ ] Focus states (Tab navigation)
- [ ] Loading states
- [ ] Komunikaty błędów

## Accessibility Checklist

- [ ] Wszystkie formularze mają `<label>` połączone z inputami
- [ ] Przyciski mają opisowy tekst
- [ ] Kolory mają wystarczający kontrast (4.5:1)
- [ ] Focus jest widoczny (żółty outline)
- [ ] ARIA labels gdzie potrzebne
- [ ] Semantyczny HTML (heading hierarchy)
- [ ] Alt text na obrazkach

---

**Status:** Redesign w trakcie
**Framework:** govuk-style.css (gotowy)
**Kolory:** Czarny, biały, szary tylko

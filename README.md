# Generator Raportów z Monitoringu Dostępności Cyfrowej

Interaktywna aplikacja webowa do generowania raportów z monitoringu stron internetowych pod kątem zgodności z ustawą o dostępności cyfrowej.

## Funkcjonalności

### Podstawowe funkcje
- **Automatyczne wypełnianie danych** - dane wykonawcy i klientów wczytywane z plików tekstowych
- **Dynamiczny formularz** - możliwość dodawania dowolnej liczby zweryfikowanych elementów
- **Automatyczny zapis** - dane zapisywane co minutę w przeglądarce
- **Eksport/Import JSON** - możliwość zapisania i wczytania raportu
- **Eksport do PDF** - profesjonalny raport w formacie PDF z watermarkiem i timestampem

### Szczegółowe możliwości

#### Sekcja podstawowa
- Tytuł z aktualną datą
- Data monitoringu (date picker)
- Wykonawca (automatycznie z pliku `wykonawca.txt`)
- Klient (lista rozwijana z pliku `klienci.txt`)
- Zakres raportu (automatycznie generowany na podstawie umowy)
- Okres monitoringu (od-do z date pickerem)

#### Zweryfikowane treści
Każdy element zawiera:
- Typ treści (post/strona/dokument)
- Adres URL
- Zidentyfikowane problemy
- Wprowadzone poprawki
- Zrzut ekranu (opcjonalnie)

#### Eksport do PDF
- Format A4
- Timestamp w prawym dolnym rogu każdej strony
- Watermark z nazwą wykonawcy (pionowy tekst po lewej stronie)
- Wszystkie zrzuty ekranu wbudowane w dokument

## Instalacja i uruchomienie

### Wymagania
- Nowoczesna przeglądarka (Chrome, Firefox, Edge, Safari)
- Serwer HTTP (nie działa z protokołem `file://`)

### Uruchomienie lokalne

#### Opcja 1: Python (Python 3)
```bash
python -m http.server 8000
```

#### Opcja 2: Python (Python 2)
```bash
python -m SimpleHTTPServer 8000
```

#### Opcja 3: Node.js (http-server)
```bash
npx http-server -p 8000
```

#### Opcja 4: PHP
```bash
php -S localhost:8000
```

Następnie otwórz przeglądarkę i przejdź do: `http://localhost:8000`

## Struktura plików

```
raport_monitoring/
├── index.html          # Główny plik HTML
├── style.css           # Style CSS
├── script.js           # Logika JavaScript
├── wykonawca.txt       # Dane wykonawcy (jedna linia)
├── klienci.txt         # Lista klientów (format: Klient | Umowa)
└── README.md           # Dokumentacja
```

## Konfiguracja danych

### Plik `wykonawca.txt`
Zawiera nazwę wykonawcy (jedna linia):
```
Agencja Dostępności Cyfrowej Sp. z o.o.
```

### Plik `klienci.txt`
Zawiera listę klientów w formacie `Nazwa | Numer umowy` (każdy klient w nowej linii):
```
Urząd Miasta Warszawa | UMW/2024/01
Ministerstwo Zdrowia | MZ/2024/15
Politechnika Warszawska | PW/2024/08
```

## Instrukcja użytkowania

1. **Uruchom aplikację** - otwórz `index.html` w przeglądarce przez serwer HTTP
2. **Wypełnij podstawowe dane**:
   - Wybierz datę monitoringu
   - Wybierz klienta z listy
   - Wybierz okres monitoringu
3. **Dodaj zweryfikowane treści**:
   - Kliknij przycisk "+ Dodaj element"
   - Wypełnij pola formularza
   - Opcjonalnie dodaj zrzut ekranu
   - Powtórz dla każdej zweryfikowanej treści
4. **Zapisz raport**:
   - **Automatyczny zapis**: dane zapisują się co minutę
   - **Ręczny zapis do JSON**: kliknij "💾 Zapisz do JSON"
   - **Eksport do PDF**: kliknij "📄 Eksportuj do PDF"

## Rozwiązywanie problemów

### Problem: Pliki nie wczytują się
**Rozwiązanie**: Upewnij się, że aplikacja działa na serwerze HTTP, a nie bezpośrednio z dysku (`file://`). Użyj jednej z metod uruchomienia opisanych powyżej.

### Problem: PDF się nie generuje
**Rozwiązanie**: Sprawdź konsolę przeglądarki (F12). Upewnij się, że biblioteki jsPDF i html2canvas zostały poprawnie załadowane.

### Problem: Autosave nie działa
**Rozwiązanie**: Sprawdź, czy przeglądarka ma włączoną obsługę localStorage. Sprawdź także limity miejsca w localStorage.

## Technologie

- **HTML5** - struktura aplikacji
- **CSS3** - stylowanie i responsywność
- **JavaScript (ES6+)** - logika aplikacji
- **jsPDF** - generowanie plików PDF
- **html2canvas** - renderowanie treści do obrazów
- **localStorage** - automatyczny zapis danych

## Licencja

Projekt stworzony dla celów monitoringu dostępności cyfrowej zgodnie z ustawą o dostępności cyfrowej.

# Generator Raportów z Monitoringu Dostępności Cyfrowej

Interaktywna aplikacja webowa do generowania raportów z monitoringu stron internetowych pod kątem zgodności z ustawą o dostępności cyfrowej.

**🚀 DZIAŁA W PEŁNI OFFLINE - nie wymaga serwera HTTP!**

## Funkcjonalności

### Podstawowe funkcje
- **Praca offline** - aplikacja działa bezpośrednio z dysku, bez konieczności konfiguracji serwera
- **Konfiguracja przez pliki** - łatwe wczytywanie danych wykonawcy i klientów przez file picker
- **Trwałe przechowywanie** - dane konfiguracyjne zapisywane w localStorage przeglądarki
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
- **Brak innych wymagań** - aplikacja działa w pełni offline!

### Uruchomienie - SUPER PROSTE! 🎉

1. **Pobierz pliki** - skopiuj folder z aplikacją do dowolnego miejsca na dysku
2. **Otwórz plik** - kliknij dwukrotnie na `index.html`
3. **Gotowe!** - aplikacja uruchomi się w przeglądarce

### Pierwsze uruchomienie

Przy pierwszym uruchomieniu zobaczysz ekran konfiguracji:

1. **Wczytaj plik wykonawcy** - kliknij "Plik wykonawcy" i wybierz `wykonawca.txt`
2. **Wczytaj plik klientów** - kliknij "Plik klientów" i wybierz `klienci.txt`
3. **Zapisz konfigurację** - kliknij "Zapisz i rozpocznij"

Dane zostaną zapisane w przeglądarce i nie będziesz musiał ich wczytywać ponownie!

### Aktualizacja danych

Jeśli chcesz zaktualizować dane wykonawcy lub klientów:
- Kliknij przycisk **"⚙️ Aktualizuj dane"** w prawym górnym rogu
- Wczytaj nowe pliki
- Zapisz zmiany

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

### Pierwsza konfiguracja
1. **Uruchom aplikację** - kliknij dwukrotnie na `index.html`
2. **Wczytaj dane** - wybierz pliki `wykonawca.txt` i `klienci.txt`
3. **Zapisz konfigurację** - dane zostaną zapamiętane w przeglądarce

### Tworzenie raportu
1. **Wypełnij podstawowe dane**:
   - Wybierz datę monitoringu
   - Wybierz klienta z listy (zakres wypełni się automatycznie)
   - Wybierz okres monitoringu (od-do)
2. **Dodaj zweryfikowane treści**:
   - Kliknij przycisk "+ Dodaj element"
   - Wypełnij pola formularza
   - Opcjonalnie dodaj zrzut ekranu
   - Powtórz dla każdej zweryfikowanej treści
   - Możesz usunąć element klikając "✕"
3. **Zapisz raport**:
   - **Automatyczny zapis**: dane zapisują się co minutę w przeglądarce
   - **Ręczny zapis do JSON**: kliknij "💾 Zapisz do JSON"
   - **Eksport do PDF**: kliknij "📄 Eksportuj do PDF"

### Wczytywanie zapisanego raportu
- Kliknij **"📂 Wczytaj JSON"**
- Wybierz wcześniej zapisany plik `.json`
- Wszystkie dane zostaną wczytane do formularza

## Rozwiązywanie problemów

### Problem: Modal konfiguracyjny pokazuje się za każdym razem
**Rozwiązanie**: Sprawdź, czy przeglądarka ma włączoną obsługę localStorage. Niektóre tryby prywatne/incognito mogą blokować localStorage.

### Problem: PDF się nie generuje
**Rozwiązanie**:
- Sprawdź konsolę przeglądarki (F12) aby zobaczyć szczegóły błędu
- Upewnij się, że masz połączenie z internetem przy pierwszym uruchomieniu (biblioteki jsPDF i html2canvas pobierane są z CDN)
- Jeśli pracujesz całkowicie offline, pobierz biblioteki lokalnie

### Problem: Autosave nie działa
**Rozwiązanie**: Sprawdź, czy przeglądarka ma włączoną obsługę localStorage. Sprawdź także limity miejsca w localStorage (zwykle 5-10MB).

### Problem: Dane znikają po zamknięciu przeglądarki
**Rozwiązanie**:
- Upewnij się, że nie pracujesz w trybie prywatnym/incognito
- Zapisuj ważne raporty do plików JSON (przycisk "💾 Zapisz do JSON")

### Problem: Chcę przenieść aplikację na inny komputer
**Rozwiązanie**:
1. Skopiuj cały folder aplikacji
2. Na nowym komputerze otwórz `index.html`
3. Wczytaj ponownie pliki konfiguracyjne
4. Wczytaj zapisane raporty z plików JSON

## Technologie

- **HTML5** - struktura aplikacji
- **CSS3** - stylowanie i responsywność (animacje, gradient, flexbox)
- **JavaScript (ES6+)** - logika aplikacji
- **FileReader API** - wczytywanie plików lokalnie (bez serwera)
- **localStorage API** - trwałe przechowywanie danych konfiguracyjnych
- **jsPDF** - generowanie plików PDF
- **html2canvas** - renderowanie treści do obrazów (opcjonalnie)

### Zalety architektury
- ✅ **Całkowicie offline** - działa bez internetu (oprócz bibliotek z CDN przy pierwszym użyciu)
- ✅ **Bez instalacji** - nie wymaga Node.js, Python ani żadnych narzędzi
- ✅ **Przenośna** - skopiuj folder i uruchom gdziekolwiek
- ✅ **Bezpieczna** - dane przechowywane lokalnie w przeglądarce
- ✅ **Szybka** - natychmiastowe uruchomienie, brak kompilacji

## Licencja

Projekt stworzony dla celów monitoringu dostępności cyfrowej zgodnie z ustawą o dostępności cyfrowej.

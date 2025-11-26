# Instrukcja instalacji - Wersja Webowa z Bazą Danych

## Wymagania

1. **Serwer WWW** z obsługą:
   - PHP 7.4 lub wyższy
   - MySQL 5.7+ lub MariaDB 10.2+
   - Apache lub Nginx
   - Moduł PDO PHP
   - Uprawnienia do tworzenia bazy danych

2. **Dostęp do:**
   - Panel hostingu (np. cPanel, DirectAdmin, Plesk)
   - phpMyAdmin lub inny menedżer bazy danych
   - FTP/SFTP lub File Manager

---

## Krok 1: Przygotowanie plików

### 1.1 Pobierz wszystkie pliki z repozytorium

Wymagane pliki dla wersji webowej:
```
raport_monitoring/
├── index-web.html          # Główny plik HTML (wersja webowa)
├── script-web.js           # JavaScript dla wersji webowej
├── style.css               # Style CSS
├── pdf-export.js           # Moduł eksportu do PDF
├── api.php                 # API Backend (PHP)
├── config.php              # Konfiguracja bazy danych
├── database.sql            # Struktura bazy danych
├── .htaccess               # Konfiguracja Apache (bezpieczeństwo)
└── INSTRUKCJA-WEB.md       # Ten plik
```

### 1.2 Prześlij pliki na serwer

Używając FTP/SFTP lub File Managera w panelu hostingu:

1. Połącz się z serwerem
2. Przejdź do katalogu publicznego (zazwyczaj `public_html`, `www`, lub `htdocs`)
3. Utwórz folder dla aplikacji, np. `raport_monitoring`
4. Prześlij WSZYSTKIE pliki do tego folderu

---

## Krok 2: Konfiguracja bazy danych

### 2.1 Utwórz bazę danych

**Opcja A: Przez panel hostingu (cPanel/DirectAdmin)**

1. Zaloguj się do panelu hostingu
2. Znajdź sekcję **"Bazy danych MySQL"**
3. Utwórz nową bazę danych:
   - Nazwa: `raport_monitoring` (lub dowolna inna)
4. Utwórz nowego użytkownika bazy danych:
   - Nazwa użytkownika: `raport_user` (lub dowolna inna)
   - Hasło: **Wygeneruj silne hasło** i zapisz je!
5. Przypisz użytkownika do bazy danych z **WSZYSTKIMI uprawnieniami**

**Opcja B: Przez phpMyAdmin**

1. Otwórz phpMyAdmin
2. Kliknij "Nowa baza danych"
3. Nazwa: `raport_monitoring`
4. Kodowanie: `utf8mb4_unicode_ci`
5. Kliknij "Utwórz"

### 2.2 Importuj strukturę bazy danych

1. W phpMyAdmin wybierz utworzoną bazę danych `raport_monitoring`
2. Kliknij zakładkę **"Import"**
3. Kliknij **"Wybierz plik"** i wybierz plik `database.sql`
4. Kliknij **"Wykonaj"** na dole strony
5. Powinien pojawić się komunikat sukcesu

**Alternatywnie przez SSH:**
```bash
mysql -u USERNAME -p DATABASE_NAME < database.sql
```

### 2.3 Sprawdź, czy tabele zostały utworzone

W phpMyAdmin sprawdź, czy w bazie znajdują się następujące tabele:
- `config`
- `klienci`
- `bledy_templates`
- `poprawki_templates`
- `reports`
- `report_items`
- `screenshots`

---

## Krok 3: Konfiguracja połączenia z bazą danych

### 3.1 Edytuj plik `config.php`

Otwórz plik `config.php` w edytorze tekstu i zaktualizuj następujące wartości:

```php
// PRZED (wartości domyślne):
define('DB_HOST', 'localhost');
define('DB_NAME', 'raport_monitoring');
define('DB_USER', 'root');
define('DB_PASS', '');

// PO (Twoje dane):
define('DB_HOST', 'localhost');              // Zazwyczaj 'localhost'
define('DB_NAME', 'twoja_nazwa_bazy');       // Nazwa bazy z kroku 2.1
define('DB_USER', 'twoj_uzytkownik');        // Użytkownik z kroku 2.1
define('DB_PASS', 'twoje_haslo');            // Hasło z kroku 2.1
```

**Ważne informacje:**

- **DB_HOST**: Na większości hostingów to `localhost`. Jeśli nie działa, sprawdź w panelu hostingu
- **DB_NAME**: Dokładna nazwa bazy danych utworzonej w kroku 2.1
- **DB_USER**: Nazwa użytkownika przypisanego do bazy
- **DB_PASS**: Hasło użytkownika (NIE hasło do panelu hostingu!)

### 3.2 Konfiguracja trybu debugowania

W pliku `config.php` znajdź linię:

```php
define('DEBUG_MODE', true);
```

**Podczas testowania:** Pozostaw `true` - będziesz widział błędy PHP
**W produkcji:** Zmień na `false` - błędy będą ukryte

### 3.3 Zapisz i prześlij plik

Zapisz `config.php` i jeśli edytowałeś lokalnie, prześlij ponownie na serwer.

---

## Krok 4: Konfiguracja API

### 4.1 Zaktualizuj ścieżkę API w `script-web.js`

Otwórz plik `script-web.js` i znajdź na początku linię:

```javascript
const API_URL = 'api.php';
```

**Opcja 1: Jeśli aplikacja jest w głównym katalogu**
```javascript
const API_URL = 'api.php';  // OK, zostaw tak
```

**Opcja 2: Jeśli aplikacja jest w podkatalogu**
```javascript
const API_URL = '/raport_monitoring/api.php';  // Dostosuj ścieżkę
```

**Opcja 3: Pełny URL (jeśli frontend i backend są rozdzielone)**
```javascript
const API_URL = 'https://twoja-domena.pl/raport_monitoring/api.php';
```

---

## Krok 5: Testowanie instalacji

### 5.1 Otwórz aplikację w przeglądarce

Wejdź na adres:
```
https://twoja-domena.pl/raport_monitoring/index-web.html
```

### 5.2 Sprawdź połączenie

Po otwarciu strony:

1. **Powinieneś zobaczyć** formularz aplikacji z danymi konfiguracyjnymi
2. **Kliknij przycisk** ⚙️ "Konfiguracja" w prawym górnym rogu
3. **Sprawdź zakładki**:
   - **Wykonawca**: Powinieneś widzieć "Nazwa wykonawcy"
   - **Klienci**: Powinny być 2 przykładowi klienci (jeśli nie usunąłeś ich z database.sql)
   - **Błędy**: Powinno być 15 szablonów błędów
   - **Poprawki**: Powinno być 15 szablonów poprawek

### 5.3 Diagnostyka problemów

**Problem: Biały ekran lub błąd 500**
- Sprawdź logi błędów serwera (zazwyczaj w `error_log` w katalogu aplikacji)
- Upewnij się, że `config.php` ma poprawne dane dostępowe do bazy
- Sprawdź uprawnienia do plików (powinny być 644 dla plików, 755 dla katalogów)

**Problem: "Database connection failed"**
- Sprawdź dane w `config.php`
- Upewnij się, że użytkownik bazy ma uprawnienia do bazy danych
- Sprawdź, czy baza danych istnieje

**Problem: "Invalid action" lub błędy API**
- Otwórz konsolę przeglądarki (F12 → Console)
- Sprawdź czy `API_URL` w `script-web.js` jest poprawny
- Upewnij się, że `api.php` jest dostępny pod danym URL

**Problem: CORS errors**
- Jeśli frontend i backend są na różnych domenach
- W `config.php` zmień:
  ```php
  header('Access-Control-Allow-Origin: *');
  // na:
  header('Access-Control-Allow-Origin: https://twoja-domena.pl');
  ```

---

## Krok 6: Pierwsza konfiguracja

### 6.1 Zmień nazwę wykonawcy

1. Kliknij ⚙️ "Konfiguracja"
2. Zakładka **"Wykonawca"**
3. Wpisz nazwę swojej firmy/osoby
4. Kliknij **"Zapisz"**

### 6.2 Dodaj swoich klientów

1. Przejdź do zakładki **"Klienci"**
2. Kliknij **"+ Dodaj"**
3. Wpisz nazwę klienta i numer umowy
4. Powtórz dla wszystkich klientów

### 6.3 Dostosuj szablony błędów i poprawek

1. Zakładka **"Błędy"** - dodaj/usuń typowe błędy w Twoich projektach
2. Zakładka **"Poprawki"** - dodaj/usuń typowe poprawki

### 6.4 Usuń przykładowe dane (opcjonalnie)

Jeśli chcesz usunąć przykładowych klientów i szablony:

1. W phpMyAdmin wybierz bazę `raport_monitoring`
2. Wykonaj SQL:
   ```sql
   DELETE FROM klienci;
   DELETE FROM bledy_templates;
   DELETE FROM poprawki_templates;
   ```
3. Lub usuń je ręcznie przez interfejs aplikacji

---

## Krok 7: Używanie aplikacji

### 7.1 Tworzenie nowego raportu

1. Uzupełnij:
   - Data monitoringu
   - Klient (z listy rozwijanej)
   - Okres monitoringu (od - do)
2. Kliknij **"+ Dodaj element"** (pływający przycisk w prawym dolnym rogu)
3. Dla każdego elementu:
   - Wybierz typ treści
   - Wpisz tytuł lub kliknij 🔄 aby pobrać automatycznie
   - Wpisz URL
   - Wybierz szablony błędów/poprawek z listy i kliknij "+ Wstaw"
   - Dodaj zdjęcia jeśli potrzeba
4. Kliknij **"💾 Zapisz raport"**

### 7.2 Wczytywanie raportu

1. Kliknij **"📂 Wczytaj raport"**
2. Wybierz raport z listy
3. Kliknij **"Wczytaj"**

### 7.3 Eksport do PDF

1. Kliknij **"🖨️ Podgląd i drukuj"**
2. W nowym oknie kliknij Ctrl+P lub wybierz "Drukuj"
3. Wybierz "Zapisz jako PDF"

---

## Krok 8: Zabezpieczenia (WAŻNE!)

### 8.1 Zmień uprawnienia plików

Przez FTP lub SSH ustaw uprawnienia:

```bash
chmod 644 *.php *.html *.js *.css
chmod 644 .htaccess
chmod 755 katalogi
```

### 8.2 Zabezpiecz config.php

Plik `.htaccess` już zawiera ochronę, ale sprawdź czy działa:

Spróbuj wejść na:
```
https://twoja-domena.pl/raport_monitoring/config.php
```

Powinieneś zobaczyć błąd **403 Forbidden**. Jeśli widzisz kod PHP - `.htaccess` nie działa!

**Alternatywna ochrona** (jeśli .htaccess nie działa):

Przenieś `config.php` poza katalog publiczny i zmień ścieżkę w `api.php`:
```php
require_once '../config.php';  // Katalog wyżej
```

### 8.3 Wyłącz tryb debugowania w produkcji

W `config.php`:
```php
define('DEBUG_MODE', false);
```

### 8.4 Używaj HTTPS

Upewnij się, że Twoja strona używa certyfikatu SSL (HTTPS). Większość hostingów oferuje darmowy Let's Encrypt.

### 8.5 Regularne kopie zapasowe

**Baza danych** (przez phpMyAdmin):
1. Wybierz bazę `raport_monitoring`
2. Zakładka "Eksport"
3. Format: SQL
4. Metoda: Szybka
5. Kliknij "Wykonaj"

**Pliki** (przez FTP):
- Pobierz cały katalog `raport_monitoring`

---

## Krok 9: Optymalizacja (opcjonalnie)

### 9.1 Zwiększ limity dla dużych zdjęć

W `.htaccess` lub `php.ini`:
```
php_value upload_max_filesize 20M
php_value post_max_size 20M
```

### 9.2 Kompresja obrazów

Zdjęcia są zapisywane jako base64 w bazie danych. Dla dużych raportów rozważ:
- Kompresję obrazów przed dodaniem
- Przechowywanie obrazów w plikach zamiast w bazie

### 9.3 Indeksy bazy danych

Jeśli masz setki raportów, dodaj indeksy:
```sql
CREATE INDEX idx_reports_date ON reports(monitoring_date);
CREATE INDEX idx_reports_created ON reports(created_at);
```

---

## Rozwiązywanie problemów

### Baza danych

**"Access denied for user"**
- Sprawdź login i hasło w `config.php`
- Upewnij się, że użytkownik ma uprawnienia do bazy

**"Unknown database"**
- Sprawdź nazwę bazy w `config.php`
- Upewnij się, że baza została utworzona

### API

**"Failed to fetch" w konsoli**
- Sprawdź ścieżkę w `API_URL`
- Sprawdź czy `api.php` istnieje na serwerze
- Sprawdź logi błędów PHP

**Puste odpowiedzi API**
- Włącz `DEBUG_MODE` w `config.php`
- Sprawdź konsolę przeglądarki
- Sprawdź logi błędów serwera

### Wydajność

**Aplikacja wolno działa**
- Sprawdź rozmiar bazy danych (limit hostingu)
- Kompresuj zdjęcia przed dodaniem
- Rozważ usunięcie starych raportów

---

## Wsparcie

W razie problemów:

1. Sprawdź logi błędów w panelu hostingu
2. Włącz `DEBUG_MODE` w `config.php`
3. Otwórz konsolę przeglądarki (F12)
4. Zgłoś problem z logami błędów

---

## Różnice między wersją offline i webową

| Cecha | Wersja Offline | Wersja Web |
|-------|----------------|------------|
| Hosting | Nie wymagany | Wymagany |
| Baza danych | Nie | MySQL/MariaDB |
| Konfiguracja | Pliki .txt | Panel webowy |
| Zapisywanie | localStorage | Baza danych |
| Dostęp | Lokalny | Przez internet |
| Współdzielenie | Nie | Tak (jeśli na serwerze) |
| Kopie zapasowe | Ręczne | Automatyczne (baza) |

---

## Podsumowanie kroków

✅ Prześlij pliki na serwer
✅ Utwórz bazę danych MySQL
✅ Importuj `database.sql`
✅ Skonfiguruj `config.php` z danymi dostępowymi
✅ Ustaw `API_URL` w `script-web.js`
✅ Otwórz aplikację w przeglądarce
✅ Przetestuj konfigurację
✅ Dodaj swoich klientów i szablony
✅ Zabezpiecz instalację (HTTPS, .htaccess)
✅ Wyłącz DEBUG_MODE w produkcji
✅ Twórz kopie zapasowe

**Gratulacje! Aplikacja jest gotowa do użycia!** 🎉

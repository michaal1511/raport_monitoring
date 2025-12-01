# Instrukcja Aktualizacji do Wersji 2.0 z Autoryzacją

## ⚠️ WAŻNE - Przeczytaj przed aktualizacją!

Wersja 2.0 dodaje **system logowania** i **role użytkowników**. Wymaga aktualizacji bazy danych!

---

## Co nowego w wersji 2.0?

### 🔐 System Autoryzacji
- **Logowanie**: Strona login.html z formularzem logowania
- **Sesje**: PHP sessions do zarządzania zalogowanymi użytkownikami
- **Bezpieczeństwo**: Hasła hashowane bcrypt, ochrona przed SQL injection

### 👥 Role Użytkowników
- **Audytor**: Widzi tylko swoje raporty, może je dodawać, edytować i usuwać
- **Administrator**: Widzi wszystkie raporty (z informacją kto stworzył), pełen dostęp

### 📸 Timestampy Zdjęć
- Automatyczny timestamp dodawany przy uploade zdjęcia
- Wyświetlany format: "Dodano: DD.MM.YYYY, HH:MM:SS"
- Zapisywany w bazie danych

### 📊 Filtrowanie Raportów
- Raporty przypisane do konkretnego użytkownika (user_id)
- Audytor: widzi tylko swoje
- Administrator: widzi wszystkie + nazwa audytora

---

## Aktualizacja z Wersji 1.0

### Krok 1: Backup obecnej bazy danych

**BARDZO WAŻNE!** Zrób backup przed aktualizacją:

```bash
# Przez phpMyAdmin:
# 1. Wybierz bazę raport_monitoring
# 2. Zakładka "Eksport"
# 3. Format: SQL
# 4. Kliknij "Wykonaj"
# 5. Zapisz plik jako backup_YYYY-MM-DD.sql
```

### Krok 2: Zaktualizuj pliki na serwerze

Pobierz nowe pliki z gałęzi `claude/web-database-version-011CUm6HuHdbBEyyBBk9rNep` i prześlij na serwer:

**Nowe pliki** (dodaj):
- `auth.php` - zarządzanie autoryzacją
- `login.html` - strona logowania

**Zaktualizowane pliki** (nadpisz):
- `database.sql` - NOWA struktura (z tabelą users!)
- `api.php` - z autoryzacją
- `script-web.js` - z sprawdzaniem logowania
- `index-web.html` - z user info i wylogowaniem
- `style.css` - nowe style

### Krok 3: Aktualizuj bazę danych

**Opcja A: Nowa instalacja (jeśli nie masz ważnych danych)**

1. Usuń starą bazę i utwórz od nowa:
```sql
DROP DATABASE raport_monitoring;
```

2. Importuj nowy `database.sql`:
   - phpMyAdmin → Import → Wybierz plik → Wykonaj

**Opcja B: Migracja (zachowaj istniejące dane)**

Wykonaj następujące SQL (ręcznie w phpMyAdmin lub przez SQL console):

```sql
USE raport_monitoring;

-- 1. Dodaj tabelę users
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    role ENUM('audytor', 'administrator') NOT NULL DEFAULT 'audytor',
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Dodaj domyślnego administratora
-- Login: admin, Hasło: admin123
INSERT INTO users (username, password, email, full_name, role) VALUES
    ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'Administrator', 'administrator');

-- 3. Dodaj kolumnę user_id do tabeli reports
ALTER TABLE reports ADD COLUMN user_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE reports ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 4. Dodaj kolumnę upload_timestamp do tabeli screenshots
ALTER TABLE screenshots ADD COLUMN upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER opis;

-- 5. Dodaj indeksy
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_reports_user ON reports(user_id);

-- 6. Przypisz wszystkie istniejące raporty do admina (user_id = 1)
UPDATE reports SET user_id = 1 WHERE user_id = 0 OR user_id IS NULL;
```

### Krok 4: Testowanie

1. Wyczyść cache przeglądarki (Ctrl+Shift+Delete)
2. Otwórz aplikację: `https://twoja-domena.pl/raport_monitoring/index-web.html`
3. Powinieneś zostać przekierowany do `login.html`
4. Zaloguj się domyślnym kontem:
   - **Login:** `admin`
   - **Hasło:** `admin123`

### Krok 5: Zmiana Hasła Administratora (OBOWIĄZKOWE!)

Po pierwszym logowaniu:

**Opcja 1: Przez SQL (zalecane)**

```sql
-- Wygeneruj nowe zahashowane hasło w PHP:
-- php -r "echo password_hash('NOWE_HASLO', PASSWORD_DEFAULT);"

-- Następnie wykonaj:
UPDATE users SET password = 'WKLEJ_TUTAJ_HASH' WHERE username = 'admin';
```

**Opcja 2: Przez panel admina** (wkrótce dodamy interfejs)

```sql
-- Tymczasowo: Ustaw nowe hasło dla admina
UPDATE users
SET password = '$2y$10$NOWY_HASH_HASLA'
WHERE username = 'admin';
```

Aby wygenerować hash hasła:
```php
<?php
echo password_hash('twoje_nowe_haslo', PASSWORD_DEFAULT);
?>
```

---

## Tworzenie Nowych Użytkowników

### Przez SQL (tymczasowo):

```sql
-- Audytor
INSERT INTO users (username, password, email, full_name, role) VALUES
    ('jan_kowalski', '$2y$10$HASH_HASLA', 'jan@example.com', 'Jan Kowalski', 'audytor');

-- Administrator
INSERT INTO users (username, password, email, full_name, role) VALUES
    ('anna_nowak', '$2y$10$HASH_HASLA', 'anna@example.com', 'Anna Nowak', 'administrator');
```

Gdzie `$2y$10$HASH_HASLA` to wynik `password_hash('haslo', PASSWORD_DEFAULT)` w PHP.

### Panel Admina (wkrótce)

W przyszłych wersjach dodamy panel administracyjny w interfejsie do zarządzania użytkownikami.

---

## Różnice Uprawnień

| Funkcja | Audytor | Administrator |
|---------|---------|---------------|
| Widzi swoje raporty | ✅ | ✅ |
| Widzi wszystkie raporty | ❌ | ✅ |
| Widzi nazwę autora raportu | ❌ | ✅ |
| Dodaje nowe raporty | ✅ | ✅ |
| Edytuje swoje raporty | ✅ | ✅ |
| Edytuje cudze raporty | ❌ | ✅ |
| Usuwa swoje raporty | ✅ | ✅ |
| Usuwa cudze raporty | ❌ | ✅ |
| Zarządza konfiguracją | ✅ | ✅ |
| Zarządza użytkownikami | ❌ | ✅ (wkrótce) |

---

## Rozwiązywanie Problemów

### Problem: "Wymagane logowanie" po aktualizacji

**Przyczyna**: Aplikacja wymaga teraz autoryzacji

**Rozwiązanie**:
1. Sprawdź czy plik `auth.php` istnieje
2. Sprawdź czy tabela `users` została utworzona
3. Sprawdź czy admin został dodany: `SELECT * FROM users WHERE username='admin';`
4. Wyczyść sesję PHP (usuń pliki w `/tmp/` lub zrestartuj PHP-FPM)

### Problem: "Brak uprawnień do tego raportu"

**Przyczyna**: Próbujesz otworzyć raport innego użytkownika jako audytor

**Rozwiązanie**:
- Zaloguj się jako administrator, aby widzieć wszystkie raporty
- LUB zmień `user_id` raportu w bazie: `UPDATE reports SET user_id = TW OJ_ID WHERE id = RAPORT_ID;`

### Problem: Nie mogę się zalogować

**Przyczyna**: Błędne hasło lub brak użytkownika

**Rozwiązanie**:
1. Sprawdź czy użytkownik istnieje: `SELECT * FROM users WHERE username='admin';`
2. Zresetuj hasło:
```sql
UPDATE users
SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'admin';
-- Hasło: admin123
```

### Problem: Pętla przekierowań (login → index → login)

**Przyczyna**: Sesje PHP nie działają

**Rozwiązanie**:
1. Sprawdź czy `session_start()` działa
2. Sprawdź uprawnienia do katalogu sesji:
```bash
chmod 777 /var/lib/php/sessions  # lub inny katalog sesji
```
3. Sprawdź `php.ini`:
```ini
session.save_path = "/tmp"
session.gc_maxlifetime = 1440
```

---

## Migracja Starych Raportów

Wszystkie istniejące raporty zostaną przypisane do pierwszego użytkownika (admin, user_id=1).

Jeśli chcesz przypisać raporty do konkretnych audytorów:

```sql
-- Przykład: Przypisz raporty z określonego okresu do użytkownika ID 2
UPDATE reports
SET user_id = 2
WHERE created_at BETWEEN '2024-01-01' AND '2024-03-31';

-- Lub na podstawie klienta
UPDATE reports r
INNER JOIN klienci k ON r.klient_id = k.id
SET r.user_id = 2
WHERE k.nazwa = 'Konkretny Klient';
```

---

## Podsumowanie Zmian

✅ Tabela `users` z hashowanymi hasłami
✅ Kolumna `user_id` w tabeli `reports`
✅ Kolumna `upload_timestamp` w tabeli `screenshots`
✅ Plik `auth.php` do zarządzania sesjami
✅ Strona `login.html`
✅ Sprawdzanie autoryzacji w `api.php`
✅ Przekierowanie do loginu w `script-web.js`
✅ Wyświetlanie user info i przycisk wylogowania
✅ Filtrowanie raportów według roli

---

## Następne Kroki

Po udanej aktualizacji:

1. ✅ **Zmień hasło administratora!**
2. ✅ Dodaj konta audytorów
3. ✅ Przypisz stare raporty do właścicieli (jeśli potrzeba)
4. ✅ Przetestuj tworzenie nowych raportów
5. ✅ Sprawdź czy timestampy zdjęć działają
6. ✅ Przetestuj uprawnienia (zaloguj się jako audytor i admin)

**Gratulacje! Twoja aplikacja jest teraz zabezpieczona systemem logowania!** 🎉

---

## Kontakt

Jeśli napotkasz problemy z aktualizacją:
1. Sprawdź logi błędów PHP (`error_log`)
2. Włącz `DEBUG_MODE` w `config.php`
3. Sprawdź konsolę przeglądarki (F12)
4. Zgłoś problem z dokładnym opisem błędu

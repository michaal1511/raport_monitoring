# Diagnostyka problemu z PHP

## Problem
Przeglądarka pokazuje kod źródłowy pliku PHP zamiast wykonanego skryptu.

## Krok 1: Test PHP

1. Wgraj plik `test-php.php` na serwer
2. Otwórz w przeglądarce: `https://twoja-domena.pl/raport_monitoring/test-php.php`

### Jeśli widzisz:
- ✅ **"PHP działa poprawnie!"** - PHP działa, przejdź do Kroku 3
- ❌ **Kod źródłowy pliku** - PHP NIE działa, przejdź do Kroku 2

---

## Krok 2: Włączenie PHP na serwerze

### A. Panel hostingowy (np. cPanel, Plesk, DirectAdmin)

**cPanel:**
1. Zaloguj się do cPanel
2. Znajdź sekcję "Software" lub "Oprogramowanie"
3. Kliknij "Select PHP Version" lub "MultiPHP Manager"
4. Upewnij się, że PHP jest włączone (zalecane PHP 7.4 lub 8.x)
5. Zapisz zmiany

**Plesk:**
1. Zaloguj się do Plesk
2. Przejdź do "Websites & Domains"
3. Kliknij nazwę swojej domeny
4. Wybierz "PHP Settings"
5. Upewnij się, że jest wybrana wersja PHP (np. 7.4 lub 8.x)
6. Zapisz

**DirectAdmin:**
1. Zaloguj się do DirectAdmin
2. Przejdź do "PHP Version Selector"
3. Wybierz wersję PHP (7.4 lub wyższą)
4. Kliknij "Save"

### B. Jeśli masz dostęp SSH i własny serwer

**Sprawdź czy PHP jest zainstalowane:**
```bash
php -v
```

**Jeśli PHP nie jest zainstalowane (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install php php-mysql php-mbstring php-xml
sudo systemctl restart apache2
```

**Jeśli PHP nie jest zainstalowane (CentOS/RHEL):**
```bash
sudo yum install php php-mysql php-mbstring php-xml
sudo systemctl restart httpd
```

### C. Konfiguracja Apache

Upewnij się, że moduł PHP jest włączony w Apache:

```bash
sudo a2enmod php7.4  # lub php8.0, php8.1 - zależnie od wersji
sudo systemctl restart apache2
```

### D. Konfiguracja Nginx

Jeśli używasz Nginx, musisz mieć PHP-FPM. Dodaj do konfiguracji:

```nginx
location ~ \.php$ {
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
}
```

Następnie:
```bash
sudo systemctl restart php7.4-fpm
sudo systemctl restart nginx
```

---

## Krok 3: Sprawdzenie uprawnień

Upewnij się, że pliki PHP mają odpowiednie uprawnienia:

```bash
chmod 644 add_user.php
chmod 644 test-php.php
```

---

## Krok 4: Sprawdzenie typu MIME

Sprawdź czy serwer rozpoznaje pliki .php:

W panelu hostingowym lub w pliku `.htaccess` dodaj:

```apache
AddType application/x-httpd-php .php
AddHandler application/x-httpd-php .php
```

---

## Krok 5: Kontakt z supportem hostingu

Jeśli nic nie pomaga, skontaktuj się z supportem swojego hostingu i zapytaj:

1. **"Czy PHP jest włączone na moim koncie?"**
2. **"Jaka wersja PHP jest dostępna?"**
3. **"Jak włączyć obsługę plików .php?"**
4. **"Czy potrzebuję specjalnej konfiguracji dla plików PHP?"**

---

## Rozwiązania dla popularnych hostingów w Polsce

### home.pl
- Zaloguj do Panelu Klienta
- Hosting → Zarządzaj
- Wersja PHP → Wybierz PHP 7.4 lub 8.x

### nazwa.pl
- Panel → Hosting → Ustawienia
- Wybierz wersję PHP
- Zapisz

### cyber_Folks (c_Folks)
- Panel → Zarządzanie hostingiem
- Konfiguracja → Wersja PHP
- Wybierz PHP 7.4+

### OVH
- Panel → Web Cloud → Hosting
- Informacje ogólne → Wersja PHP
- Zmień na PHP 7.4 lub 8.x

---

## Tymczasowe rozwiązanie: HTML + JavaScript (bez PHP)

Jeśli PHP nie może być włączone, mogę stworzyć alternatywną wersję która:
- Dodaje użytkowników przez API (`api.php`)
- Używa tylko HTML + JavaScript
- Wymaga jednego aktywnego konta administratora do działania

Daj znać jeśli to potrzebne!

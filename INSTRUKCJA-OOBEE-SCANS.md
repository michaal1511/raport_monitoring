# 📊 Zarządzanie Skanami Oobee - Instrukcja

## Spis treści
1. [Co to jest?](#co-to-jest)
2. [Instalacja](#instalacja)
3. [Jak dodać skan](#jak-dodać-skan)
4. [Zarządzanie skanami](#zarządzanie-skanami)
5. [Uprawnienia](#uprawnienia)
6. [FAQ](#faq)

---

## Co to jest?

Moduł **Skany Oobee** pozwala audytorom dodawać, przechowywać i zarządzać skanami z narzędzia **Oobee CLI** (narzędzie do skanowania dostępności cyfrowej/WCAG).

### Funkcje:
- ✅ Upload plików skanów (JSON, HTML, CSV, TXT)
- ✅ Wklejanie danych bezpośrednio
- ✅ Przypisywanie skanów do konkretnych klientów
- ✅ Rozdzielenie uprawnień (audytor/administrator)
- ✅ Pobieranie skanów
- ✅ Lista wszystkich skanów z filtrowaniem

---

## Instalacja

### 1. Utwórz tabelę w bazie danych

1. Otwórz **phpMyAdmin**
2. Wybierz bazę `raport_monitoring`
3. Kliknij zakładkę **SQL**
4. Otwórz plik `add_oobee_scans_table.sql` i skopiuj jego zawartość
5. Wklej do okna SQL i kliknij **Wykonaj**

```sql
-- Sprawdzenie czy tabela została utworzona:
SHOW TABLES LIKE 'oobee_scans';
```

### 2. Sprawdzenie API

Upewnij się, że plik `api.php` zawiera nowe endpointy dla skanów:
- `get_scans`
- `get_scan`
- `add_scan`
- `delete_scan`
- `download_scan`

### 3. Dostęp do interfejsu

Po instalacji przycisk **"📊 Skany Oobee"** pojawi się w głównym menu aplikacji (obok przycisku "Konfiguracja").

---

## Jak dodać skan

### Metoda 1: Upload pliku

1. Zaloguj się do aplikacji
2. Kliknij **"📊 Skany Oobee"** w górnym menu
3. Kliknij przycisk **"➕ Dodaj skan"**
4. Wypełnij formularz:
   - **Klient**: Wybierz klienta z listy
   - **Nazwa skanu**: Opisowa nazwa (np. "Homepage Audit - December 2023")
   - **Data wykonania skanu**: Data wykonania skanu
   - **Sposób dodania**: Wybierz **"📁 Upload pliku"**
   - **Wybierz plik**: Kliknij i wybierz plik skanu
5. Opcjonalnie dodaj notatki
6. Kliknij **"💾 Zapisz skan"**

**Obsługiwane formaty:**
- `.json` - JSON
- `.html` - HTML
- `.csv` - CSV
- `.txt` - Text

### Metoda 2: Wklejanie danych

1. W formularzu dodawania skanu wybierz **"📋 Wklej dane"**
2. Wykonaj skan Oobee w terminalu:
   ```bash
   oobee scan https://example.com > scan_output.json
   ```
3. Otwórz plik `scan_output.json` i skopiuj całą zawartość
4. Wklej do pola **"Wklej dane skanu"**
5. Wybierz **Typ danych** (JSON, HTML, CSV lub Text)
6. Kliknij **"💾 Zapisz skan"**

---

## Zarządzanie skanami

### Lista skanów

Po otwarciu strony **"Skany Oobee"** zobaczysz tabelę ze wszystkimi skanami zawierającą:

| Kolumna | Opis |
|---------|------|
| **Nazwa skanu** | Nazwa nadana skanowi |
| **Klient** | Do którego klienta przypisany |
| **Data skanu** | Kiedy skan został wykonany |
| **Audytor** | Kto dodał skan (tylko dla administratorów) |
| **Typ** | Format pliku (JSON/HTML/CSV/TXT) |
| **Rozmiar** | Rozmiar pliku |
| **Data dodania** | Kiedy skan został dodany do systemu |
| **Akcje** | Przyciski akcji |

### Pobieranie skanu

1. Znajdź skan na liście
2. Kliknij przycisk **"📥"** (Pobierz)
3. Plik zostanie pobrany na Twój komputer

### Usuwanie skanu

1. Znajdź skan na liście
2. Kliknij przycisk **"🗑️"** (Usuń)
3. Potwierdź usunięcie

⚠️ **Uwaga:** Usunięcie skanu jest nieodwracalne!

---

## Uprawnienia

### Audytor
- ✅ Może dodawać własne skany
- ✅ Widzi **tylko swoje** skany
- ✅ Może pobierać swoje skany
- ✅ Może usuwać swoje skany
- ❌ Nie widzi skanów innych audytorów

### Administrator
- ✅ Może dodawać skany
- ✅ Widzi **wszystkie** skany wszystkich audytorów
- ✅ Widzi informację kto dodał dany skan
- ✅ Może pobierać wszystkie skany
- ✅ Może usuwać wszystkie skany

---

## FAQ

### 1. Jakie formaty plików są obsługiwane?
JSON, HTML, CSV i TXT. Najczęściej Oobee generuje pliki JSON.

### 2. Jaki jest maksymalny rozmiar pliku?
Domyślnie 10 MB. Można zwiększyć w pliku `.htaccess`:
```apache
php_value upload_max_filesize 20M
php_value post_max_size 20M
```

### 3. Czy mogę edytować istniejący skan?
Obecnie nie - można tylko dodawać nowe i usuwać stare. W przyszłości planowana jest funkcja edycji.

### 4. Gdzie są przechowywane skany?
Wszystkie skany są przechowywane w bazie danych MySQL w tabeli `oobee_scans`.

### 5. Czy mogę eksportować skany?
Tak, każdy skan można pobrać używając przycisku **"📥"** - zostanie zapisany w oryginalnym formacie.

### 6. Jak sprawdzić ile skanów mam w systemie?
W phpMyAdmin wykonaj:
```sql
SELECT COUNT(*) FROM oobee_scans WHERE user_id = [TWOJE_ID];
```

Dla administratorów (wszystkie skany):
```sql
SELECT COUNT(*) FROM oobee_scans;
```

### 7. Co to jest Oobee?
Oobee to narzędzie CLI do automatycznego skanowania dostępności stron internetowych pod kątem zgodności z WCAG.

Więcej informacji: https://github.com/GovTechSG/purple-hats

---

## Przykładowy workflow

### Typowy proces pracy audytora:

1. **Wykonanie skanu w terminalu:**
   ```bash
   cd ~/oobee
   oobee scan https://example.com/homepage
   ```

2. **Otwarcie aplikacji:**
   - Zaloguj się do aplikacji
   - Kliknij **"📊 Skany Oobee"**

3. **Dodanie skanu:**
   - Kliknij **"➕ Dodaj skan"**
   - Wybierz klienta: "Example Company"
   - Nazwa: "Homepage - Monthly Audit Dec 2023"
   - Data: 2023-12-09
   - Upload pliku lub wklej dane
   - Zapisz

4. **Późniejszy dostęp:**
   - Skan jest dostępny w aplikacji
   - Można go pobrać w każdej chwili
   - Administrator widzi wszystkie skany

---

## Rozwiązywanie problemów

### Nie widzę przycisku "Skany Oobee"
- Sprawdź czy jesteś zalogowany
- Upewnij się że plik `index.html` został zaktualizowany
- Wyczyść cache przeglądarki (Ctrl+F5)

### Błąd podczas dodawania skanu
- Sprawdź czy tabela `oobee_scans` istnieje w bazie
- Upewnij się że plik nie przekracza limitu rozmiaru
- Sprawdź logi błędów PHP

### Nie mogę pobrać skanu
- Sprawdź czy skan należy do Ciebie (lub jesteś administratorem)
- Sprawdź uprawnienia do pliku `api.php`
- Sprawdź logi błędów w konsoli przeglądarki (F12)

---

## Kontakt

W razie problemów skontaktuj się z administratorem systemu.

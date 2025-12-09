-- ========================================
-- Dodanie obsługi skanów Oobee
-- ========================================
-- Ten skrypt dodaje tabelę do przechowywania skanów z narzędzia Oobee CLI
--
-- INSTRUKCJA:
-- 1. Otwórz phpMyAdmin
-- 2. Wybierz bazę raport_monitoring
-- 3. Kliknij zakładkę "SQL"
-- 4. Wklej poniższy kod i kliknij "Wykonaj"

-- Tworzenie tabeli dla skanów Oobee
CREATE TABLE IF NOT EXISTS oobee_scans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT 'ID użytkownika który dodał skan',
    klient_id INT NOT NULL COMMENT 'ID klienta do którego przypisany skan',
    scan_name VARCHAR(255) NOT NULL COMMENT 'Nazwa skanu',
    scan_date DATE NOT NULL COMMENT 'Data wykonania skanu',
    scan_data LONGTEXT NOT NULL COMMENT 'Zawartość skanu (JSON/HTML/CSV)',
    file_name VARCHAR(255) COMMENT 'Oryginalna nazwa pliku',
    file_type VARCHAR(50) DEFAULT 'json' COMMENT 'Typ pliku: json, html, csv, txt',
    file_size INT DEFAULT 0 COMMENT 'Rozmiar w bajtach',
    notes TEXT COMMENT 'Dodatkowe notatki',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Kiedy dodano do systemu',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Klucze obce
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (klient_id) REFERENCES klienci(id) ON DELETE CASCADE,

    -- Indeksy dla wydajności
    INDEX idx_user_id (user_id),
    INDEX idx_klient_id (klient_id),
    INDEX idx_scan_date (scan_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Przechowuje skany z narzędzia Oobee CLI przypisane do klientów';

-- Komunikat o sukcesie
SELECT 'Tabela oobee_scans została utworzona pomyślnie!' as Status;

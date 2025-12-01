-- Database schema for Raport Monitoring Web Application v2.0
-- Created for MySQL/MariaDB
-- Added: User authentication, roles, and timestamps

CREATE DATABASE IF NOT EXISTS raport_monitoring CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE raport_monitoring;

-- Table: users
-- Stores user accounts with roles
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

-- Table: config
-- Stores global configuration (wykonawca name)
CREATE TABLE IF NOT EXISTS config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: klienci
-- Stores client information
CREATE TABLE IF NOT EXISTS klienci (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nazwa VARCHAR(255) NOT NULL,
    numer_umowy VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: bledy_templates
-- Stores error/problem templates
CREATE TABLE IF NOT EXISTS bledy_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    opis TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: poprawki_templates
-- Stores fixes templates
CREATE TABLE IF NOT EXISTS poprawki_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    opis TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: reports
-- Stores main report information
CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    monitoring_date DATE NOT NULL,
    klient_id INT NOT NULL,
    zakres TEXT NOT NULL,
    okres_od DATE NOT NULL,
    okres_do DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (klient_id) REFERENCES klienci(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: report_items
-- Stores content items for each report
CREATE TABLE IF NOT EXISTS report_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT NOT NULL,
    item_order INT NOT NULL DEFAULT 0,
    typ_tresci VARCHAR(50) NOT NULL,
    tytul VARCHAR(500),
    url TEXT NOT NULL,
    problemy TEXT,
    poprawki TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: screenshots
-- Stores screenshots for report items
CREATE TABLE IF NOT EXISTS screenshots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_item_id INT NOT NULL,
    screenshot_order INT NOT NULL DEFAULT 0,
    image_data LONGTEXT NOT NULL,
    opis TEXT,
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_item_id) REFERENCES report_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default config value for wykonawca
INSERT INTO config (config_key, config_value) VALUES ('wykonawca', 'Nazwa wykonawcy')
ON DUPLICATE KEY UPDATE config_value = config_value;

-- Insert default administrator account
-- Username: admin
-- Password: admin123 (ZMIEŃ TO NATYCHMIAST PO INSTALACJI!)
INSERT INTO users (username, password, email, full_name, role) VALUES
    ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'Administrator', 'administrator')
ON DUPLICATE KEY UPDATE username = username;

-- Insert sample auditor account (optional - can be removed)
-- Username: audytor1
-- Password: audytor123
INSERT INTO users (username, password, email, full_name, role) VALUES
    ('audytor1', '$2y$10$oL4j3FW9q5JXP5PW0ZkQz.LqRFHKHVlRTy2fYE4XdQYGqT3xRZ8TS', 'audytor1@example.com', 'Jan Kowalski', 'audytor')
ON DUPLICATE KEY UPDATE username = username;

-- Insert sample clients (optional - can be removed)
INSERT INTO klienci (nazwa, numer_umowy) VALUES
    ('Przykładowy Klient 1', 'UM/2024/001'),
    ('Przykładowy Klient 2', 'UM/2024/002')
ON DUPLICATE KEY UPDATE nazwa = nazwa;

-- Insert sample error templates (optional - can be removed)
INSERT INTO bledy_templates (opis) VALUES
    ('Brak tekstu alternatywnego dla obrazu'),
    ('Niewystarczający kontrast kolorów (wymagany min. 4.5:1)'),
    ('Brak nagłówków strukturalnych (H1-H6)'),
    ('Formularz bez etykiet (label) dla pól'),
    ('Brak możliwości nawigacji klawiaturą'),
    ('Link bez opisowego tekstu (np. "kliknij tutaj")'),
    ('Brak informacji o języku strony'),
    ('Automatycznie odtwarzające się multimedia'),
    ('Tekst zbyt mały (poniżej 16px)'),
    ('Brak widocznego fokusa na elementach interaktywnych'),
    ('Tabela bez nagłówków (th) lub opisów'),
    ('Dokument PDF niedostępny dla czytników ekranu'),
    ('Brak transkrypcji dla materiałów audio'),
    ('Brak napisów dla materiałów wideo'),
    ('Animacje bez możliwości zatrzymania')
ON DUPLICATE KEY UPDATE opis = opis;

-- Insert sample fixes templates (optional - can be removed)
INSERT INTO poprawki_templates (opis) VALUES
    ('Dodano tekst alternatywny do obrazu'),
    ('Poprawiono kontrast kolorów do wymaganego poziomu'),
    ('Dodano strukturę nagłówków (H1-H6)'),
    ('Dodano etykiety (label) do pól formularza'),
    ('Zapewniono pełną nawigację klawiaturą'),
    ('Dodano opisowy tekst do linku'),
    ('Dodano atrybut lang do znacznika HTML'),
    ('Wyłączono automatyczne odtwarzanie multimediów'),
    ('Zwiększono rozmiar tekstu do minimum 16px'),
    ('Dodano widoczny fokus na elementach interaktywnych'),
    ('Dodano nagłówki (th) i opisy do tabeli'),
    ('Utworzono dostępną wersję dokumentu PDF'),
    ('Dodano transkrypcję do materiałów audio'),
    ('Dodano napisy do materiałów wideo'),
    ('Dodano możliwość zatrzymania animacji')
ON DUPLICATE KEY UPDATE opis = opis;

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_klient ON reports(klient_id);
CREATE INDEX idx_reports_date ON reports(monitoring_date);
CREATE INDEX idx_report_items_report ON report_items(report_id);
CREATE INDEX idx_screenshots_item ON screenshots(report_item_id);

-- Show information about default accounts
SELECT '============================================' as '';
SELECT 'DOMYŚLNE KONTA UŻYTKOWNIKÓW' as '';
SELECT '============================================' as '';
SELECT 'Administrator:' as '';
SELECT '  Login: admin' as '';
SELECT '  Hasło: admin123' as '';
SELECT '  WAŻNE: ZMIEŃ HASŁO PO PIERWSZYM LOGOWANIU!' as '';
SELECT '' as '';
SELECT 'Audytor (przykładowy):' as '';
SELECT '  Login: audytor1' as '';
SELECT '  Hasło: audytor123' as '';
SELECT '============================================' as '';

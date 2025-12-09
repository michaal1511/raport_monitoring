-- Skrypt SQL do utworzenia tabeli users
-- Uruchom tylko jeśli tabela NIE istnieje

-- Użycie:
-- 1. Otwórz phpMyAdmin
-- 2. Wybierz bazę raport_monitoring
-- 3. Kliknij zakładkę "SQL"
-- 4. Wklej ten kod i kliknij "Wykonaj"

USE raport_monitoring;

-- Sprawdź czy tabela istnieje
SELECT 'Sprawdzam czy tabela users istnieje...' as '';

-- Utwórz tabelę users (jeśli nie istnieje)
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

SELECT 'Tabela users utworzona lub już istnieje.' as '';

-- Dodaj indeksy
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

SELECT 'Indeksy dodane.' as '';

-- Sprawdź czy tabela reports ma kolumnę user_id
SELECT 'Sprawdzam kolumnę user_id w tabeli reports...' as '';

-- Dodaj kolumnę user_id do reports (jeśli nie istnieje)
SET @columnExists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'raport_monitoring'
    AND TABLE_NAME = 'reports'
    AND COLUMN_NAME = 'user_id'
);

-- Jeśli kolumna nie istnieje, dodaj ją
SET @sql = IF(@columnExists = 0,
    'ALTER TABLE reports ADD COLUMN user_id INT NOT NULL DEFAULT 1 AFTER id',
    'SELECT "Kolumna user_id już istnieje" as ""'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Dodaj foreign key (jeśli nie istnieje)
SET @fkExists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'raport_monitoring'
    AND TABLE_NAME = 'reports'
    AND CONSTRAINT_NAME = 'reports_ibfk_2'
);

SET @sql = IF(@fkExists = 0,
    'ALTER TABLE reports ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
    'SELECT "Foreign key już istnieje" as ""'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Dodaj kolumnę upload_timestamp do screenshots (jeśli nie istnieje)
SELECT 'Sprawdzam kolumnę upload_timestamp w tabeli screenshots...' as '';

SET @columnExists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'raport_monitoring'
    AND TABLE_NAME = 'screenshots'
    AND COLUMN_NAME = 'upload_timestamp'
);

SET @sql = IF(@columnExists = 0,
    'ALTER TABLE screenshots ADD COLUMN upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER opis',
    'SELECT "Kolumna upload_timestamp już istnieje" as ""'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Dodaj indeks dla reports.user_id
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);

SELECT 'Wszystkie kolumny i indeksy dodane.' as '';

-- Wstaw domyślnego administratora (jeśli nie istnieje)
INSERT INTO users (username, password, email, full_name, role)
SELECT 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'Administrator', 'administrator'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

SELECT 'Administrator dodany (login: admin, hasło: admin123)' as '';

-- Wstaw testowego audytora (jeśli nie istnieje)
INSERT INTO users (username, password, email, full_name, role)
SELECT 'audytor1', '$2y$10$oL4j3FW9q5JXP5PW0ZkQz.LqRFHKHVlRTy2fYE4XdQYGqT3xRZ8TS', 'audytor1@example.com', 'Jan Kowalski', 'audytor'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'audytor1');

SELECT 'Testowy audytor dodany (login: audytor1, hasło: audytor123)' as '';

-- Pokaż wszystkich użytkowników
SELECT '======================================' as '';
SELECT 'LISTA UŻYTKOWNIKÓW:' as '';
SELECT '======================================' as '';

SELECT
    id,
    username as 'Login',
    email as 'Email',
    full_name as 'Imię i nazwisko',
    role as 'Rola',
    IF(active = 1, 'Aktywny', 'Nieaktywny') as 'Status',
    created_at as 'Utworzony'
FROM users
ORDER BY id;

SELECT '======================================' as '';
SELECT 'GOTOWE! Możesz się teraz zalogować.' as '';
SELECT '======================================' as '';

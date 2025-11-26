<?php
/**
 * Database Configuration File
 *
 * INSTRUKCJA:
 * 1. Zmień poniższe wartości na dane dostępowe do Twojej bazy danych
 * 2. Upewnij się, że baza danych została utworzona (uruchom database.sql)
 * 3. Ten plik NIE POWINIEN być dostępny publicznie - dodaj go do .htaccess
 */

// Konfiguracja bazy danych
define('DB_HOST', 'localhost');           // Host bazy danych (zazwyczaj 'localhost')
define('DB_NAME', 'raport_monitoring');   // Nazwa bazy danych
define('DB_USER', 'root');                // Nazwa użytkownika bazy danych
define('DB_PASS', '');                    // Hasło do bazy danych
define('DB_CHARSET', 'utf8mb4');          // Kodowanie znaków

// Konfiguracja aplikacji
define('UPLOAD_MAX_SIZE', 5242880);       // Maksymalny rozmiar pliku w bajtach (5MB)
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

// Timezone
date_default_timezone_set('Europe/Warsaw');

// Error reporting (zmień na false w produkcji)
define('DEBUG_MODE', true);

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// CORS Headers (jeśli frontend i backend są na różnych domenach)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Get database connection
 */
function getDbConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        if (DEBUG_MODE) {
            die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
        } else {
            die(json_encode(['error' => 'Database connection failed']));
        }
    }
}

/**
 * Send JSON response
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400) {
    sendResponse(['error' => $message], $statusCode);
}

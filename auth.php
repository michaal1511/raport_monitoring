<?php
/**
 * Authentication and Session Management
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'config.php';

/**
 * Login user
 */
function loginUser($username, $password) {
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare("
            SELECT id, username, password, email, full_name, role, active
            FROM users
            WHERE username = ? AND active = 1
        ");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user) {
            return ['success' => false, 'error' => 'Nieprawidłowy login lub hasło'];
        }

        // Verify password
        if (!password_verify($password, $user['password'])) {
            return ['success' => false, 'error' => 'Nieprawidłowy login lub hasło'];
        }

        // Update last login
        $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $updateStmt->execute([$user['id']]);

        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['logged_in'] = true;

        return [
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'role' => $user['role']
            ]
        ];
    } catch (Exception $e) {
        return ['success' => false, 'error' => 'Błąd logowania: ' . $e->getMessage()];
    }
}

/**
 * Logout user
 */
function logoutUser() {
    session_unset();
    session_destroy();
    return ['success' => true, 'message' => 'Wylogowano pomyślnie'];
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

/**
 * Get current user
 */
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }

    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'email' => $_SESSION['email'],
        'full_name' => $_SESSION['full_name'],
        'role' => $_SESSION['role']
    ];
}

/**
 * Check if user is administrator
 */
function isAdministrator() {
    return isLoggedIn() && $_SESSION['role'] === 'administrator';
}

/**
 * Check if user is auditor
 */
function isAuditor() {
    return isLoggedIn() && $_SESSION['role'] === 'audytor';
}

/**
 * Require authentication
 */
function requireAuth() {
    if (!isLoggedIn()) {
        sendError('Wymagane logowanie', 401);
    }
}

/**
 * Require administrator role
 */
function requireAdmin() {
    requireAuth();
    if (!isAdministrator()) {
        sendError('Brak uprawnień administratora', 403);
    }
}

/**
 * Change password
 */
function changePassword($userId, $oldPassword, $newPassword) {
    $pdo = getDbConnection();

    try {
        // Get current password
        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            return ['success' => false, 'error' => 'Użytkownik nie znaleziony'];
        }

        // Verify old password
        if (!password_verify($oldPassword, $user['password'])) {
            return ['success' => false, 'error' => 'Nieprawidłowe stare hasło'];
        }

        // Update password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $updateStmt->execute([$hashedPassword, $userId]);

        return ['success' => true, 'message' => 'Hasło zostało zmienione'];
    } catch (Exception $e) {
        return ['success' => false, 'error' => 'Błąd zmiany hasła: ' . $e->getMessage()];
    }
}

/**
 * Create new user (admin only)
 */
function createUser($username, $password, $email, $fullName, $role) {
    $pdo = getDbConnection();

    try {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("
            INSERT INTO users (username, password, email, full_name, role)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$username, $hashedPassword, $email, $fullName, $role]);

        return [
            'success' => true,
            'id' => $pdo->lastInsertId(),
            'message' => 'Użytkownik utworzony'
        ];
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            return ['success' => false, 'error' => 'Użytkownik o takiej nazwie już istnieje'];
        }
        return ['success' => false, 'error' => 'Błąd tworzenia użytkownika: ' . $e->getMessage()];
    }
}

/**
 * Update user (admin only)
 */
function updateUser($userId, $email, $fullName, $role, $active) {
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare("
            UPDATE users
            SET email = ?, full_name = ?, role = ?, active = ?
            WHERE id = ?
        ");
        $stmt->execute([$email, $fullName, $role, $active, $userId]);

        return ['success' => true, 'message' => 'Użytkownik zaktualizowany'];
    } catch (Exception $e) {
        return ['success' => false, 'error' => 'Błąd aktualizacji użytkownika: ' . $e->getMessage()];
    }
}

/**
 * Delete user (admin only)
 */
function deleteUser($userId) {
    $pdo = getDbConnection();

    try {
        // Prevent deleting yourself
        if (getCurrentUser()['id'] == $userId) {
            return ['success' => false, 'error' => 'Nie możesz usunąć własnego konta'];
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);

        return ['success' => true, 'message' => 'Użytkownik usunięty'];
    } catch (Exception $e) {
        return ['success' => false, 'error' => 'Błąd usuwania użytkownika: ' . $e->getMessage()];
    }
}

/**
 * Get all users (admin only)
 */
function getAllUsers() {
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->query("
            SELECT id, username, email, full_name, role, active, created_at, last_login
            FROM users
            ORDER BY created_at DESC
        ");
        return $stmt->fetchAll();
    } catch (Exception $e) {
        return [];
    }
}

/**
 * Reset user password (admin only)
 */
function resetUserPassword($userId, $newPassword) {
    $pdo = getDbConnection();

    try {
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->execute([$hashedPassword, $userId]);

        return ['success' => true, 'message' => 'Hasło zostało zresetowane'];
    } catch (Exception $e) {
        return ['success' => false, 'error' => 'Błąd resetowania hasła: ' . $e->getMessage()];
    }
}

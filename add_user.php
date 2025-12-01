<?php
/**
 * Skrypt do dodawania użytkowników
 *
 * INSTRUKCJA:
 * 1. Umieść ten plik w katalogu aplikacji (obok config.php)
 * 2. Otwórz w przeglądarce: https://twoja-domena.pl/raport_monitoring/add_user.php
 * 3. Wypełnij formularz i kliknij "Dodaj użytkownika"
 *
 * UWAGA BEZPIECZEŃSTWA:
 * - USUŃ ten plik po dodaniu wszystkich użytkowników!
 * - Lub zabezpiecz hasłem dostępu (zobacz kod poniżej)
 */

// ========================================
// OPCJONALNE: Zabezpieczenie hasłem dostępu
// ========================================
// Odkomentuj poniższe linie aby wymagać hasła dostępu do tego skryptu
/*
$ACCESS_PASSWORD = 'tajne_haslo_123'; // ZMIEŃ TO!

if (!isset($_POST['access_password']) || $_POST['access_password'] !== $ACCESS_PASSWORD) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $error = 'Nieprawidłowe hasło dostępu!';
    }

    // Pokaż formularz hasła
    ?>
    <!DOCTYPE html>
    <html lang="pl">
    <head>
        <meta charset="UTF-8">
        <title>Dostęp chroniony</title>
    </head>
    <body>
        <h2>Dostęp chroniony</h2>
        <?php if (isset($error)) echo "<p style='color:red'>$error</p>"; ?>
        <form method="POST">
            <label>Hasło dostępu:</label>
            <input type="password" name="access_password" required>
            <button type="submit">Dalej</button>
        </form>
    </body>
    </html>
    <?php
    exit;
}
*/

require_once 'config.php';

$message = '';
$error = '';

// Obsługa formularza
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_user'])) {
    $username = trim($_POST['username']);
    $password = $_POST['password'];
    $email = trim($_POST['email']);
    $fullName = trim($_POST['full_name']);
    $role = $_POST['role'];

    // Walidacja
    if (empty($username) || empty($password)) {
        $error = 'Login i hasło są wymagane!';
    } elseif (strlen($password) < 6) {
        $error = 'Hasło musi mieć minimum 6 znaków!';
    } else {
        try {
            $pdo = getDbConnection();

            // Hash hasła
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            // Dodaj użytkownika
            $stmt = $pdo->prepare("
                INSERT INTO users (username, password, email, full_name, role)
                VALUES (?, ?, ?, ?, ?)
            ");

            $stmt->execute([$username, $hashedPassword, $email, $fullName, $role]);

            $message = "✅ Użytkownik <strong>$username</strong> został dodany!";

            // Wyczyść formularz
            $_POST = [];

        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                $error = "❌ Użytkownik o loginie '$username' już istnieje!";
            } else {
                $error = "❌ Błąd: " . $e->getMessage();
            }
        }
    }
}

// Pobierz listę użytkowników
try {
    $pdo = getDbConnection();
    $stmt = $pdo->query("
        SELECT id, username, email, full_name, role, active, created_at, last_login
        FROM users
        ORDER BY created_at DESC
    ");
    $users = $stmt->fetchAll();
} catch (Exception $e) {
    $users = [];
    $error = "Błąd pobierania użytkowników: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dodaj Użytkownika - Monitoring Dostępności</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            padding: 40px;
        }

        h1 {
            color: #667eea;
            margin-bottom: 10px;
        }

        .warning {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            color: #856404;
        }

        .warning strong {
            color: #d32f2f;
        }

        .form-section {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .form-section h2 {
            color: #764ba2;
            margin-bottom: 20px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #555;
        }

        .form-group input,
        .form-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #667eea;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .btn {
            padding: 14px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-primary {
            background: #667eea;
            color: white;
        }

        .btn-primary:hover {
            background: #5568d3;
            transform: translateY(-2px);
        }

        .message {
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
        }

        .message.success {
            background: #d4edda;
            color: #155724;
            border: 2px solid #28a745;
        }

        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 2px solid #dc3545;
        }

        .users-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        .users-table th,
        .users-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        .users-table th {
            background: #667eea;
            color: white;
            font-weight: 600;
        }

        .users-table tr:hover {
            background: #f8f9fa;
        }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }

        .badge-admin {
            background: #dc3545;
            color: white;
        }

        .badge-audytor {
            background: #17a2b8;
            color: white;
        }

        .badge-active {
            background: #28a745;
            color: white;
        }

        .badge-inactive {
            background: #6c757d;
            color: white;
        }

        .password-info {
            background: #e7f3ff;
            border-left: 4px solid #667eea;
            padding: 10px;
            margin-top: 5px;
            font-size: 13px;
            color: #555;
        }

        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }

            .container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>➕ Dodaj Użytkownika</h1>
        <p style="color: #666; margin-bottom: 20px;">Panel zarządzania użytkownikami systemu Monitoring Dostępności</p>

        <div class="warning">
            <strong>⚠️ UWAGA BEZPIECZEŃSTWA!</strong><br>
            Ten skrypt służy TYLKO do dodawania użytkowników.<br>
            <strong>USUŃ ten plik (add_user.php) po dodaniu wszystkich użytkowników!</strong><br>
            Lub zabezpiecz go hasłem dostępu (zobacz kod w pliku).
        </div>

        <?php if ($message): ?>
            <div class="message success"><?php echo $message; ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="message error"><?php echo $error; ?></div>
        <?php endif; ?>

        <div class="form-section">
            <h2>Dodaj nowego użytkownika</h2>

            <form method="POST">
                <input type="hidden" name="add_user" value="1">

                <div class="form-row">
                    <div class="form-group">
                        <label for="username">Login: *</label>
                        <input type="text" id="username" name="username" required
                               value="<?php echo htmlspecialchars($_POST['username'] ?? ''); ?>"
                               pattern="[a-zA-Z0-9_]+"
                               title="Tylko litery, cyfry i podkreślnik">
                    </div>

                    <div class="form-group">
                        <label for="password">Hasło: *</label>
                        <input type="password" id="password" name="password" required minlength="6">
                        <div class="password-info">💡 Minimum 6 znaków. Hasło zostanie zahashowane.</div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="full_name">Imię i nazwisko:</label>
                        <input type="text" id="full_name" name="full_name"
                               value="<?php echo htmlspecialchars($_POST['full_name'] ?? ''); ?>">
                    </div>

                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email"
                               value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>">
                    </div>
                </div>

                <div class="form-group">
                    <label for="role">Rola: *</label>
                    <select id="role" name="role" required>
                        <option value="audytor" <?php echo (($_POST['role'] ?? '') === 'audytor') ? 'selected' : ''; ?>>
                            Audytor (widzi tylko swoje raporty)
                        </option>
                        <option value="administrator" <?php echo (($_POST['role'] ?? '') === 'administrator') ? 'selected' : ''; ?>>
                            Administrator (widzi wszystkie raporty)
                        </option>
                    </select>
                </div>

                <button type="submit" class="btn btn-primary">➕ Dodaj użytkownika</button>
            </form>
        </div>

        <div class="form-section">
            <h2>📋 Lista użytkowników (<?php echo count($users); ?>)</h2>

            <?php if (empty($users)): ?>
                <p style="color: #999; padding: 20px; text-align: center;">Brak użytkowników w bazie danych.</p>
            <?php else: ?>
                <table class="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Login</th>
                            <th>Imię i nazwisko</th>
                            <th>Email</th>
                            <th>Rola</th>
                            <th>Status</th>
                            <th>Utworzony</th>
                            <th>Ostatnie logowanie</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($users as $user): ?>
                            <tr>
                                <td><?php echo $user['id']; ?></td>
                                <td><strong><?php echo htmlspecialchars($user['username']); ?></strong></td>
                                <td><?php echo htmlspecialchars($user['full_name'] ?: '-'); ?></td>
                                <td><?php echo htmlspecialchars($user['email'] ?: '-'); ?></td>
                                <td>
                                    <span class="badge <?php echo $user['role'] === 'administrator' ? 'badge-admin' : 'badge-audytor'; ?>">
                                        <?php echo $user['role'] === 'administrator' ? 'Administrator' : 'Audytor'; ?>
                                    </span>
                                </td>
                                <td>
                                    <span class="badge <?php echo $user['active'] ? 'badge-active' : 'badge-inactive'; ?>">
                                        <?php echo $user['active'] ? 'Aktywny' : 'Nieaktywny'; ?>
                                    </span>
                                </td>
                                <td><?php echo date('d.m.Y H:i', strtotime($user['created_at'])); ?></td>
                                <td><?php echo $user['last_login'] ? date('d.m.Y H:i', strtotime($user['last_login'])) : 'Nigdy'; ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
            <h3 style="color: #667eea; margin-bottom: 10px;">💡 Wskazówki:</h3>
            <ul style="margin-left: 20px; color: #555; line-height: 1.8;">
                <li><strong>Audytor</strong> - widzi tylko swoje raporty, może je tworzyć, edytować i usuwać</li>
                <li><strong>Administrator</strong> - widzi wszystkie raporty wszystkich audytorów, pełen dostęp</li>
                <li>Hasła są automatycznie hashowane algorytmem bcrypt</li>
                <li>Login może zawierać tylko litery, cyfry i podkreślnik</li>
                <li>Po dodaniu wszystkich użytkowników <strong style="color: #d32f2f;">USUŃ ten plik!</strong></li>
            </ul>
        </div>
    </div>
</body>
</html>

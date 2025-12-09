<?php
/**
 * API Endpoint for Raport Monitoring Application v2.0
 * With Authentication and Role-based Access Control
 *
 * Authentication Endpoints:
 * POST /api.php?action=login              - Login
 * POST /api.php?action=logout             - Logout
 * GET  /api.php?action=check_auth         - Check if logged in
 * POST /api.php?action=change_password    - Change password
 *
 * User Management (Admin only):
 * GET  /api.php?action=get_users          - Get all users
 * POST /api.php?action=create_user        - Create new user
 * POST /api.php?action=update_user        - Update user
 * POST /api.php?action=delete_user        - Delete user
 * POST /api.php?action=reset_password     - Reset user password
 *
 * Configuration Endpoints (Authenticated):
 * GET  /api.php?action=get_config         - Get configuration
 * POST /api.php?action=update_wykonawca   - Update wykonawca name
 * POST /api.php?action=add_klient         - Add client
 * POST /api.php?action=update_klient      - Update client
 * POST /api.php?action=delete_klient      - Delete client
 * POST /api.php?action=add_blad_template  - Add error template
 * POST /api.php?action=delete_blad_template - Delete error template
 * POST /api.php?action=add_poprawka_template - Add fix template
 * POST /api.php?action=delete_poprawka_template - Delete fix template
 *
 * Report Endpoints (Authenticated):
 * GET  /api.php?action=get_reports        - Get reports (filtered by role)
 * GET  /api.php?action=get_report&id=X    - Get specific report
 * POST /api.php?action=save_report        - Save/update report
 * POST /api.php?action=delete_report      - Delete report
 *
 * Oobee Scans Endpoints (Authenticated):
 * GET  /api.php?action=get_scans          - Get Oobee scans (filtered by role)
 * GET  /api.php?action=get_scan&id=X      - Get specific scan
 * POST /api.php?action=add_scan           - Add new Oobee scan
 * POST /api.php?action=delete_scan        - Delete scan
 * GET  /api.php?action=download_scan&id=X - Download scan file
 * GET  /api.php?action=view_scan&id=X     - View HTML scan in browser
 *
 * Client View Endpoints (Authenticated):
 * GET  /api.php?action=get_client_data&klient_id=X - Get all reports and scans for client
 */

require_once 'config.php';
require_once 'auth.php';

// Get action from query string
$action = $_GET['action'] ?? '';

// Get database connection
$pdo = getDbConnection();

// Public endpoints (no auth required)
$publicEndpoints = ['login'];

// Check authentication for protected endpoints
if (!in_array($action, $publicEndpoints)) {
    if (!isLoggedIn()) {
        sendError('Wymagane logowanie', 401);
    }
}

// Route to appropriate handler
switch ($action) {
    // ========================================
    // AUTHENTICATION
    // ========================================
    case 'login':
        handleLogin();
        break;

    case 'logout':
        handleLogout();
        break;

    case 'check_auth':
        handleCheckAuth();
        break;

    case 'change_password':
        handleChangePassword();
        break;

    // ========================================
    // USER MANAGEMENT (Admin only)
    // ========================================
    case 'get_users':
        requireAdmin();
        handleGetUsers();
        break;

    case 'create_user':
        requireAdmin();
        handleCreateUser();
        break;

    case 'update_user':
        requireAdmin();
        handleUpdateUser();
        break;

    case 'delete_user':
        requireAdmin();
        handleDeleteUser();
        break;

    case 'reset_password':
        requireAdmin();
        handleResetPassword();
        break;

    // ========================================
    // CONFIGURATION
    // ========================================
    case 'get_config':
        getConfig($pdo);
        break;

    case 'update_wykonawca':
        updateWykonawca($pdo);
        break;

    case 'add_klient':
        addKlient($pdo);
        break;

    case 'update_klient':
        updateKlient($pdo);
        break;

    case 'delete_klient':
        deleteKlient($pdo);
        break;

    case 'add_blad_template':
        addBladTemplate($pdo);
        break;

    case 'delete_blad_template':
        deleteBladTemplate($pdo);
        break;

    case 'add_poprawka_template':
        addPoprawkaTemplate($pdo);
        break;

    case 'delete_poprawka_template':
        deletePoprawkaTemplate($pdo);
        break;

    // ========================================
    // REPORTS
    // ========================================
    case 'get_reports':
        getReports($pdo);
        break;

    case 'get_report':
        getReport($pdo);
        break;

    case 'save_report':
        saveReport($pdo);
        break;

    case 'delete_report':
        deleteReport($pdo);
        break;

    // ========================================
    // OOBEE SCANS
    // ========================================
    case 'get_scans':
        getScans($pdo);
        break;

    case 'get_scan':
        getScan($pdo);
        break;

    case 'add_scan':
        addScan($pdo);
        break;

    case 'delete_scan':
        deleteScan($pdo);
        break;

    case 'download_scan':
        downloadScan($pdo);
        break;

    case 'view_scan':
        viewScan($pdo);
        break;

    // ========================================
    // CLIENT VIEW
    // ========================================
    case 'get_client_data':
        getClientData($pdo);
        break;

    default:
        sendError('Invalid action', 400);
}

// ========================================
// AUTHENTICATION HANDLERS
// ========================================

function handleLogin() {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['username']) || !isset($data['password'])) {
        sendError('Login i hasło są wymagane');
    }

    $result = loginUser($data['username'], $data['password']);
    sendResponse($result, $result['success'] ? 200 : 401);
}

function handleLogout() {
    $result = logoutUser();
    sendResponse($result);
}

function handleCheckAuth() {
    if (isLoggedIn()) {
        sendResponse([
            'authenticated' => true,
            'user' => getCurrentUser()
        ]);
    } else {
        sendResponse(['authenticated' => false]);
    }
}

function handleChangePassword() {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['old_password']) || !isset($data['new_password'])) {
        sendError('Stare i nowe hasło są wymagane');
    }

    $user = getCurrentUser();
    $result = changePassword($user['id'], $data['old_password'], $data['new_password']);
    sendResponse($result, $result['success'] ? 200 : 400);
}

// ========================================
// USER MANAGEMENT HANDLERS
// ========================================

function handleGetUsers() {
    $users = getAllUsers();
    sendResponse(['users' => $users]);
}

function handleCreateUser() {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['username']) || !isset($data['password']) || !isset($data['role'])) {
        sendError('Username, password i role są wymagane');
    }

    $result = createUser(
        $data['username'],
        $data['password'],
        $data['email'] ?? '',
        $data['full_name'] ?? '',
        $data['role']
    );
    sendResponse($result, $result['success'] ? 200 : 400);
}

function handleUpdateUser() {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id'])) {
        sendError('ID użytkownika jest wymagane');
    }

    $result = updateUser(
        $data['id'],
        $data['email'] ?? '',
        $data['full_name'] ?? '',
        $data['role'] ?? 'audytor',
        $data['active'] ?? 1
    );
    sendResponse($result, $result['success'] ? 200 : 400);
}

function handleDeleteUser() {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id'])) {
        sendError('ID użytkownika jest wymagane');
    }

    $result = deleteUser($data['id']);
    sendResponse($result, $result['success'] ? 200 : 400);
}

function handleResetPassword() {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['user_id']) || !isset($data['new_password'])) {
        sendError('User ID i nowe hasło są wymagane');
    }

    $result = resetUserPassword($data['user_id'], $data['new_password']);
    sendResponse($result, $result['success'] ? 200 : 400);
}

// ========================================
// CONFIGURATION HANDLERS
// ========================================

function getConfig($pdo) {
    try {
        // Get wykonawca
        $stmt = $pdo->prepare("SELECT config_value FROM config WHERE config_key = 'wykonawca'");
        $stmt->execute();
        $wykonawca = $stmt->fetchColumn() ?: 'Nazwa wykonawcy';

        // Get klienci
        $stmt = $pdo->query("SELECT id, nazwa, numer_umowy FROM klienci ORDER BY nazwa");
        $klienci = $stmt->fetchAll();

        // Get bledy templates
        $stmt = $pdo->query("SELECT id, opis FROM bledy_templates ORDER BY id");
        $bledy = $stmt->fetchAll();

        // Get poprawki templates
        $stmt = $pdo->query("SELECT id, opis FROM poprawki_templates ORDER BY id");
        $poprawki = $stmt->fetchAll();

        sendResponse([
            'success' => true,
            'wykonawca' => $wykonawca,
            'klienci' => $klienci,
            'bledy' => $bledy,
            'poprawki' => $poprawki
        ]);
    } catch (Exception $e) {
        sendError('Failed to get config: ' . $e->getMessage(), 500);
    }
}

function updateWykonawca($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['nazwa']) || empty(trim($data['nazwa']))) {
        sendError('Nazwa wykonawcy jest wymagana');
    }

    try {
        $stmt = $pdo->prepare("UPDATE config SET config_value = ? WHERE config_key = 'wykonawca'");
        $stmt->execute([trim($data['nazwa'])]);

        sendResponse(['success' => true, 'message' => 'Wykonawca zaktualizowany']);
    } catch (Exception $e) {
        sendError('Failed to update wykonawca: ' . $e->getMessage(), 500);
    }
}

function addKlient($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['nazwa']) || !isset($data['numer_umowy'])) {
        sendError('Nazwa i numer umowy są wymagane');
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO klienci (nazwa, numer_umowy) VALUES (?, ?)");
        $stmt->execute([trim($data['nazwa']), trim($data['numer_umowy'])]);

        sendResponse([
            'success' => true,
            'id' => $pdo->lastInsertId(),
            'message' => 'Klient dodany'
        ]);
    } catch (Exception $e) {
        sendError('Failed to add klient: ' . $e->getMessage(), 500);
    }
}

function updateKlient($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id']) || !isset($data['nazwa']) || !isset($data['numer_umowy'])) {
        sendError('ID, nazwa i numer umowy są wymagane');
    }

    try {
        $stmt = $pdo->prepare("UPDATE klienci SET nazwa = ?, numer_umowy = ? WHERE id = ?");
        $stmt->execute([trim($data['nazwa']), trim($data['numer_umowy']), $data['id']]);

        sendResponse(['success' => true, 'message' => 'Klient zaktualizowany']);
    } catch (Exception $e) {
        sendError('Failed to update klient: ' . $e->getMessage(), 500);
    }
}

function deleteKlient($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id'])) {
        sendError('ID klienta jest wymagane');
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM klienci WHERE id = ?");
        $stmt->execute([$data['id']]);

        sendResponse(['success' => true, 'message' => 'Klient usunięty']);
    } catch (Exception $e) {
        sendError('Failed to delete klient: ' . $e->getMessage(), 500);
    }
}

function addBladTemplate($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['opis']) || empty(trim($data['opis']))) {
        sendError('Opis błędu jest wymagany');
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO bledy_templates (opis) VALUES (?)");
        $stmt->execute([trim($data['opis'])]);

        sendResponse([
            'success' => true,
            'id' => $pdo->lastInsertId(),
            'message' => 'Szablon błędu dodany'
        ]);
    } catch (Exception $e) {
        sendError('Failed to add template: ' . $e->getMessage(), 500);
    }
}

function deleteBladTemplate($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id'])) {
        sendError('ID szablonu jest wymagane');
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM bledy_templates WHERE id = ?");
        $stmt->execute([$data['id']]);

        sendResponse(['success' => true, 'message' => 'Szablon usunięty']);
    } catch (Exception $e) {
        sendError('Failed to delete template: ' . $e->getMessage(), 500);
    }
}

function addPoprawkaTemplate($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['opis']) || empty(trim($data['opis']))) {
        sendError('Opis poprawki jest wymagany');
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO poprawki_templates (opis) VALUES (?)");
        $stmt->execute([trim($data['opis'])]);

        sendResponse([
            'success' => true,
            'id' => $pdo->lastInsertId(),
            'message' => 'Szablon poprawki dodany'
        ]);
    } catch (Exception $e) {
        sendError('Failed to add template: ' . $e->getMessage(), 500);
    }
}

function deletePoprawkaTemplate($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id'])) {
        sendError('ID szablonu jest wymagane');
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM poprawki_templates WHERE id = ?");
        $stmt->execute([$data['id']]);

        sendResponse(['success' => true, 'message' => 'Szablon usunięty']);
    } catch (Exception $e) {
        sendError('Failed to delete template: ' . $e->getMessage(), 500);
    }
}

// ========================================
// REPORT HANDLERS
// ========================================

function getReports($pdo) {
    try {
        $user = getCurrentUser();

        // Administrator sees all reports, auditor only their own
        if (isAdministrator()) {
            $stmt = $pdo->query("
                SELECT r.*, k.nazwa as klient_nazwa, u.full_name as audytor_name
                FROM reports r
                LEFT JOIN klienci k ON r.klient_id = k.id
                LEFT JOIN users u ON r.user_id = u.id
                ORDER BY r.created_at DESC
            ");
        } else {
            $stmt = $pdo->prepare("
                SELECT r.*, k.nazwa as klient_nazwa
                FROM reports r
                LEFT JOIN klienci k ON r.klient_id = k.id
                WHERE r.user_id = ?
                ORDER BY r.created_at DESC
            ");
            $stmt->execute([$user['id']]);
        }

        $reports = $stmt->fetchAll();

        sendResponse(['success' => true, 'reports' => $reports]);
    } catch (Exception $e) {
        sendError('Failed to get reports: ' . $e->getMessage(), 500);
    }
}

function getReport($pdo) {
    $id = $_GET['id'] ?? null;

    if (!$id) {
        sendError('Report ID jest wymagane');
    }

    try {
        $user = getCurrentUser();

        // Get report
        $stmt = $pdo->prepare("
            SELECT r.*, k.nazwa as klient_nazwa, k.numer_umowy
            FROM reports r
            LEFT JOIN klienci k ON r.klient_id = k.id
            WHERE r.id = ?
        ");
        $stmt->execute([$id]);
        $report = $stmt->fetch();

        if (!$report) {
            sendError('Raport nie znaleziony', 404);
        }

        // Check permissions: administrator can see all, auditor only their own
        if (!isAdministrator() && $report['user_id'] != $user['id']) {
            sendError('Brak uprawnień do tego raportu', 403);
        }

        // Get report items
        $stmt = $pdo->prepare("
            SELECT * FROM report_items
            WHERE report_id = ?
            ORDER BY item_order
        ");
        $stmt->execute([$id]);
        $items = $stmt->fetchAll();

        // Get screenshots for each item with timestamps
        foreach ($items as &$item) {
            $stmt = $pdo->prepare("
                SELECT id, image_data, opis, screenshot_order, upload_timestamp
                FROM screenshots
                WHERE report_item_id = ?
                ORDER BY screenshot_order
            ");
            $stmt->execute([$item['id']]);
            $item['screenshots'] = $stmt->fetchAll();
        }

        $report['items'] = $items;

        sendResponse(['success' => true, 'report' => $report]);
    } catch (Exception $e) {
        sendError('Failed to get report: ' . $e->getMessage(), 500);
    }
}

function saveReport($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        sendError('Nieprawidłowe dane');
    }

    try {
        $pdo->beginTransaction();

        $user = getCurrentUser();
        $reportId = $data['id'] ?? null;

        if ($reportId) {
            // Check permissions: administrator can edit all, auditor only their own
            $stmt = $pdo->prepare("SELECT user_id FROM reports WHERE id = ?");
            $stmt->execute([$reportId]);
            $existingReport = $stmt->fetch();

            if (!$existingReport) {
                sendError('Raport nie znaleziony', 404);
            }

            if (!isAdministrator() && $existingReport['user_id'] != $user['id']) {
                sendError('Brak uprawnień do edycji tego raportu', 403);
            }

            // Update existing report
            $stmt = $pdo->prepare("
                UPDATE reports SET
                    monitoring_date = ?,
                    klient_id = ?,
                    zakres = ?,
                    okres_od = ?,
                    okres_do = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $data['monitoringDate'],
                $data['klientId'],
                $data['zakres'],
                $data['okresOd'],
                $data['okresDo'],
                $reportId
            ]);

            // Delete old items and screenshots (cascade will handle screenshots)
            $stmt = $pdo->prepare("DELETE FROM report_items WHERE report_id = ?");
            $stmt->execute([$reportId]);
        } else {
            // Create new report - assign to current user
            $stmt = $pdo->prepare("
                INSERT INTO reports (user_id, monitoring_date, klient_id, zakres, okres_od, okres_do)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $user['id'],
                $data['monitoringDate'],
                $data['klientId'],
                $data['zakres'],
                $data['okresOd'],
                $data['okresDo']
            ]);
            $reportId = $pdo->lastInsertId();
        }

        // Insert report items
        if (isset($data['contentItems']) && is_array($data['contentItems'])) {
            foreach ($data['contentItems'] as $order => $item) {
                $stmt = $pdo->prepare("
                    INSERT INTO report_items (report_id, item_order, typ_tresci, tytul, url, problemy, poprawki)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $reportId,
                    $order,
                    $item['type'] ?? '',
                    $item['title'] ?? '',
                    $item['url'] ?? '',
                    $item['problems'] ?? '',
                    $item['fixes'] ?? ''
                ]);
                $itemId = $pdo->lastInsertId();

                // Insert screenshots with timestamps
                if (isset($item['screenshots']) && is_array($item['screenshots'])) {
                    foreach ($item['screenshots'] as $screenshotOrder => $screenshot) {
                        $stmt = $pdo->prepare("
                            INSERT INTO screenshots (report_item_id, screenshot_order, image_data, opis, upload_timestamp)
                            VALUES (?, ?, ?, ?, ?)
                        ");
                        $stmt->execute([
                            $itemId,
                            $screenshotOrder,
                            $screenshot['image'] ?? '',
                            $screenshot['description'] ?? '',
                            $screenshot['upload_timestamp'] ?? date('Y-m-d H:i:s')
                        ]);
                    }
                }
            }
        }

        $pdo->commit();

        sendResponse([
            'success' => true,
            'id' => $reportId,
            'message' => 'Raport zapisany'
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        sendError('Failed to save report: ' . $e->getMessage(), 500);
    }
}

function deleteReport($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id'])) {
        sendError('Report ID jest wymagane');
    }

    try {
        $user = getCurrentUser();

        // Check permissions: administrator can delete all, auditor only their own
        $stmt = $pdo->prepare("SELECT user_id FROM reports WHERE id = ?");
        $stmt->execute([$data['id']]);
        $report = $stmt->fetch();

        if (!$report) {
            sendError('Raport nie znaleziony', 404);
        }

        if (!isAdministrator() && $report['user_id'] != $user['id']) {
            sendError('Brak uprawnień do usunięcia tego raportu', 403);
        }

        $stmt = $pdo->prepare("DELETE FROM reports WHERE id = ?");
        $stmt->execute([$data['id']]);

        sendResponse(['success' => true, 'message' => 'Raport usunięty']);
    } catch (Exception $e) {
        sendError('Failed to delete report: ' . $e->getMessage(), 500);
    }
}

// ========================================
// OOBEE SCANS HANDLERS
// ========================================

/**
 * Get list of Oobee scans
 * Auditors see only their own scans, administrators see all scans
 */
function getScans($pdo) {
    try {
        $user = getCurrentUser();

        // Administrator sees all scans, auditor only their own
        if (isAdministrator()) {
            $stmt = $pdo->query("
                SELECT s.*, k.nazwa as klient_nazwa, u.full_name as audytor_name, u.username
                FROM oobee_scans s
                LEFT JOIN klienci k ON s.klient_id = k.id
                LEFT JOIN users u ON s.user_id = u.id
                ORDER BY s.created_at DESC
            ");
        } else {
            $stmt = $pdo->prepare("
                SELECT s.*, k.nazwa as klient_nazwa
                FROM oobee_scans s
                LEFT JOIN klienci k ON s.klient_id = k.id
                WHERE s.user_id = ?
                ORDER BY s.created_at DESC
            ");
            $stmt->execute([$user['id']]);
        }

        $scans = $stmt->fetchAll();

        sendResponse(['success' => true, 'scans' => $scans]);
    } catch (Exception $e) {
        sendError('Failed to get scans: ' . $e->getMessage(), 500);
    }
}

/**
 * Get single scan details
 */
function getScan($pdo) {
    try {
        $user = getCurrentUser();
        $scanId = $_GET['id'] ?? null;

        if (!$scanId) {
            sendError('ID skanu jest wymagane', 400);
        }

        // Get scan with permission check
        if (isAdministrator()) {
            $stmt = $pdo->prepare("
                SELECT s.*, k.nazwa as klient_nazwa, u.full_name as audytor_name, u.username
                FROM oobee_scans s
                LEFT JOIN klienci k ON s.klient_id = k.id
                LEFT JOIN users u ON s.user_id = u.id
                WHERE s.id = ?
            ");
            $stmt->execute([$scanId]);
        } else {
            $stmt = $pdo->prepare("
                SELECT s.*, k.nazwa as klient_nazwa
                FROM oobee_scans s
                LEFT JOIN klienci k ON s.klient_id = k.id
                WHERE s.id = ? AND s.user_id = ?
            ");
            $stmt->execute([$scanId, $user['id']]);
        }

        $scan = $stmt->fetch();

        if (!$scan) {
            sendError('Skan nie znaleziony lub brak uprawnień', 404);
        }

        sendResponse(['success' => true, 'scan' => $scan]);
    } catch (Exception $e) {
        sendError('Failed to get scan: ' . $e->getMessage(), 500);
    }
}

/**
 * Add new Oobee scan
 */
function addScan($pdo) {
    try {
        $user = getCurrentUser();
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        if (!isset($data['klient_id']) || !isset($data['scan_name']) ||
            !isset($data['scan_date']) || !isset($data['scan_data'])) {
            sendError('Klient, nazwa skanu, data i dane są wymagane', 400);
        }

        // Verify client exists
        $stmt = $pdo->prepare("SELECT id FROM klienci WHERE id = ?");
        $stmt->execute([$data['klient_id']]);
        if (!$stmt->fetch()) {
            sendError('Klient nie istnieje', 400);
        }

        // Calculate file size
        $fileSize = strlen($data['scan_data']);

        // Insert scan
        $stmt = $pdo->prepare("
            INSERT INTO oobee_scans (
                user_id, klient_id, scan_name, scan_date, scan_data,
                file_name, file_type, file_size, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $user['id'],
            $data['klient_id'],
            $data['scan_name'],
            $data['scan_date'],
            $data['scan_data'],
            $data['file_name'] ?? '',
            $data['file_type'] ?? 'json',
            $fileSize,
            $data['notes'] ?? ''
        ]);

        $scanId = $pdo->lastInsertId();

        sendResponse([
            'success' => true,
            'message' => 'Skan dodany pomyślnie',
            'scan_id' => $scanId
        ]);
    } catch (Exception $e) {
        sendError('Failed to add scan: ' . $e->getMessage(), 500);
    }
}

/**
 * Delete Oobee scan
 */
function deleteScan($pdo) {
    try {
        $user = getCurrentUser();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['id'])) {
            sendError('ID skanu jest wymagane', 400);
        }

        // Check permissions: administrator can delete all, auditor only their own
        $stmt = $pdo->prepare("SELECT user_id FROM oobee_scans WHERE id = ?");
        $stmt->execute([$data['id']]);
        $scan = $stmt->fetch();

        if (!$scan) {
            sendError('Skan nie znaleziony', 404);
        }

        if (!isAdministrator() && $scan['user_id'] != $user['id']) {
            sendError('Brak uprawnień do usunięcia tego skanu', 403);
        }

        $stmt = $pdo->prepare("DELETE FROM oobee_scans WHERE id = ?");
        $stmt->execute([$data['id']]);

        sendResponse(['success' => true, 'message' => 'Skan usunięty']);
    } catch (Exception $e) {
        sendError('Failed to delete scan: ' . $e->getMessage(), 500);
    }
}

/**
 * Download scan data (returns raw scan content)
 */
function downloadScan($pdo) {
    try {
        $user = getCurrentUser();
        $scanId = $_GET['id'] ?? null;

        if (!$scanId) {
            sendError('ID skanu jest wymagane', 400);
        }

        // Get scan with permission check
        if (isAdministrator()) {
            $stmt = $pdo->prepare("
                SELECT scan_data, file_name, file_type
                FROM oobee_scans
                WHERE id = ?
            ");
            $stmt->execute([$scanId]);
        } else {
            $stmt = $pdo->prepare("
                SELECT scan_data, file_name, file_type
                FROM oobee_scans
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$scanId, $user['id']]);
        }

        $scan = $stmt->fetch();

        if (!$scan) {
            sendError('Skan nie znaleziony lub brak uprawnień', 404);
        }

        // Set appropriate headers for file download
        $fileName = $scan['file_name'] ?: 'scan_' . $scanId . '.' . $scan['file_type'];
        $contentType = match($scan['file_type']) {
            'json' => 'application/json',
            'html' => 'text/html',
            'csv' => 'text/csv',
            default => 'text/plain'
        };

        header('Content-Type: ' . $contentType);
        header('Content-Disposition: attachment; filename="' . $fileName . '"');
        echo $scan['scan_data'];
        exit;
    } catch (Exception $e) {
        sendError('Failed to download scan: ' . $e->getMessage(), 500);
    }
}

/**
 * View scan data in browser (for HTML previews)
 */
function viewScan($pdo) {
    try {
        $user = getCurrentUser();
        $scanId = $_GET['id'] ?? null;

        if (!$scanId) {
            sendError('ID skanu jest wymagane', 400);
        }

        // Get scan with permission check
        if (isAdministrator()) {
            $stmt = $pdo->prepare("
                SELECT scan_data, file_type, scan_name
                FROM oobee_scans
                WHERE id = ?
            ");
            $stmt->execute([$scanId]);
        } else {
            $stmt = $pdo->prepare("
                SELECT scan_data, file_type, scan_name
                FROM oobee_scans
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$scanId, $user['id']]);
        }

        $scan = $stmt->fetch();

        if (!$scan) {
            sendError('Skan nie znaleziony lub brak uprawnień', 404);
        }

        // Only allow viewing HTML files
        if ($scan['file_type'] !== 'html') {
            sendError('Tylko pliki HTML mogą być wyświetlane w podglądzie', 400);
        }

        // Set content type and display inline (not as download)
        header('Content-Type: text/html; charset=utf-8');
        header('X-Frame-Options: SAMEORIGIN');
        echo $scan['scan_data'];
        exit;
    } catch (Exception $e) {
        sendError('Failed to view scan: ' . $e->getMessage(), 500);
    }
}

// ========================================
// CLIENT VIEW HANDLERS
// ========================================

/**
 * Get all data for a specific client (reports + scans)
 * Auditors see only their own data, administrators see all
 */
function getClientData($pdo) {
    try {
        $user = getCurrentUser();
        $klientId = $_GET['klient_id'] ?? null;

        if (!$klientId) {
            sendError('ID klienta jest wymagane', 400);
        }

        // Verify client exists
        $stmt = $pdo->prepare("SELECT id, nazwa FROM klienci WHERE id = ?");
        $stmt->execute([$klientId]);
        $klient = $stmt->fetch();

        if (!$klient) {
            sendError('Klient nie znaleziony', 404);
        }

        // Get reports for this client
        if (isAdministrator()) {
            $stmt = $pdo->prepare("
                SELECT r.*, u.full_name as audytor_name, u.username
                FROM reports r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.klient_id = ?
                ORDER BY r.monitoring_date DESC, r.created_at DESC
            ");
            $stmt->execute([$klientId]);
        } else {
            $stmt = $pdo->prepare("
                SELECT r.*
                FROM reports r
                WHERE r.klient_id = ? AND r.user_id = ?
                ORDER BY r.monitoring_date DESC, r.created_at DESC
            ");
            $stmt->execute([$klientId, $user['id']]);
        }
        $reports = $stmt->fetchAll();

        // Get Oobee scans for this client
        if (isAdministrator()) {
            $stmt = $pdo->prepare("
                SELECT s.*, u.full_name as audytor_name, u.username
                FROM oobee_scans s
                LEFT JOIN users u ON s.user_id = u.id
                WHERE s.klient_id = ?
                ORDER BY s.scan_date DESC, s.created_at DESC
            ");
            $stmt->execute([$klientId]);
        } else {
            $stmt = $pdo->prepare("
                SELECT s.*
                FROM oobee_scans s
                WHERE s.klient_id = ? AND s.user_id = ?
                ORDER BY s.scan_date DESC, s.created_at DESC
            ");
            $stmt->execute([$klientId, $user['id']]);
        }
        $scans = $stmt->fetchAll();

        sendResponse([
            'success' => true,
            'klient' => $klient,
            'reports' => $reports,
            'scans' => $scans
        ]);
    } catch (Exception $e) {
        sendError('Failed to get client data: ' . $e->getMessage(), 500);
    }
}

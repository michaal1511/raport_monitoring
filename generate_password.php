<?php
/**
 * Generator zahashowanych haseł dla użytkowników
 *
 * INSTRUKCJA:
 * 1. Uruchom lokalnie na swoim komputerze: php generate_password.php
 * 2. Lub wgraj na serwer i otwórz w przeglądarce (jeśli PHP działa)
 * 3. Zmień hasło poniżej i uruchom ponownie dla każdego użytkownika
 */

// ========================================
// ZMIEŃ TO HASŁO NA SWOJE!
// ========================================
$plainPassword = 'mojetajnehaslo123';

// Generowanie hasha
$hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);

echo "=====================================\n";
echo "GENERATOR HASEŁ DLA UŻYTKOWNIKÓW\n";
echo "=====================================\n\n";
echo "Hasło: {$plainPassword}\n";
echo "Hash:  {$hashedPassword}\n\n";
echo "Skopiuj powyższy hash i użyj w zapytaniu SQL!\n";
echo "=====================================\n";
?>

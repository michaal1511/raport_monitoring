<?php
// Prosty test PHP
echo "<!DOCTYPE html>";
echo "<html><head><meta charset='UTF-8'><title>Test PHP</title></head>";
echo "<body>";
echo "<h1 style='color: green;'>✓ PHP działa poprawnie!</h1>";
echo "<p>Wersja PHP: " . phpversion() . "</p>";
echo "<p>Data i czas: " . date('Y-m-d H:i:s') . "</p>";
echo "<hr>";
echo "<h2>Szczegóły konfiguracji:</h2>";
phpinfo();
echo "</body></html>";
?>

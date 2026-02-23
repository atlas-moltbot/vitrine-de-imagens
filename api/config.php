<?php
// Configuração para o banco de dados
$host = getenv('DB_HOST') ?: 'localhost'; 
$db   = getenv('DB_NAME') ?: 'u786088869_vitrineximagem';
$user = getenv('DB_USER') ?: 'u786088869_vitrineximagem';
$pass = getenv('DB_PASS') ?: 'ATLAS.vps2026';

// Chave da API do Google Gemini (geral)
define('GEMINI_API_KEY', 'AIzaSyAxzUPi0rrURc48I0NkyGYvxOfFhSuXZ6Q');

// Chave dedicada para o Atlas Chat (usa a mesma se não tiver separada)
define('GEMINI_CHAT_API_KEY', 'AIzaSyDmO4VNEFBHWOFAledtigP_7GBY_RkY3_M');
?>

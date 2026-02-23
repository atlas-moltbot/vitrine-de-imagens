<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Carregar .env na raiz do projeto (seguro, fora do acesso publico direto do proxy)
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            putenv(trim($parts[0]) . '=' . trim($parts[1], '"\' '));
        }
    }
}

// Carregar config.php local, caso exista, para injetar variaveis de ambiente ou constantes
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit();
}

// Ler o corpo da requisição do front-end
$inputJSON = file_get_contents('php://input');
$inputData = json_decode($inputJSON, true);

$isChat = isset($inputData['isChat']) && $inputData['isChat'];

// Obter a chave da API do ambiente (seguro) ou da constante definida em config.php
$apiKey = getenv('GEMINI_API_KEY');

// Usar chave específica de chat, se aplicável e existente
if ($isChat) {
    // Tentar obter do ambiente
    if (getenv('GEMINI_CHAT_API_KEY')) {
        $apiKey = getenv('GEMINI_CHAT_API_KEY');
    }
    // Tentar obter da constante (config.php)
    elseif (defined('GEMINI_CHAT_API_KEY')) {
        $apiKey = GEMINI_CHAT_API_KEY;
    }
}

// Fallback para constante geral definida em config.php
if (!$apiKey && defined('GEMINI_API_KEY')) {
    $apiKey = GEMINI_API_KEY;
}

// Fallback para variável antiga
if (!$apiKey) {
    $apiKey = getenv('VITE_GOOGLE_GEMINI_API_KEY');
}

if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'API Key não configurada no servidor (GEMINI_API_KEY ou GEMINI_CHAT_API_KEY).']);
    exit();
}

if (!$inputData || !isset($inputData['endpoint'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request. "endpoint" and "payload" are required.']);
    exit();
}

$endpoint = $inputData['endpoint']; // ex: 'generateContent', 'generateImages'
$model = $inputData['model'] ?? '';
$payload = $inputData['payload'] ?? [];

// Montar a URL real do Google Gemini / Imagen
$baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

$googleApiUrl = "";
if ($endpoint === 'generateImages') {
    $googleApiUrl = "{$baseUrl}/{$model}:predict?key={$apiKey}";
} else {
    // Padrão: generateContent
    $googleApiUrl = "{$baseUrl}/{$model}:generateContent?key={$apiKey}";
}

// Iniciar a chamada cURL real para a Google
$ch = curl_init($googleApiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => 'Proxy cURL Error', 'details' => $curlError]);
    exit();
}

// Repassar o status HTTP e a resposta JSON (mesmo se for erro da Google 4xx/5xx)
http_response_code($httpCode);
echo $response;
exit();
?>

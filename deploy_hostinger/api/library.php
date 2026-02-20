<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
} else {
    $host = getenv('DB_HOST') ?: 'localhost'; 
    $db   = getenv('DB_NAME');
    $user = getenv('DB_USER');
    $pass = getenv('DB_PASS');
    $charset = 'utf8mb4';
}

if (!$db || !$user) {
    http_response_code(500);
    echo json_encode(['error' => 'Database Configuration Missing']);
    exit;
}

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     // Em caso de erro de conexão, retorne erro 500 mas com JSON válido
     http_response_code(500);
     echo json_encode(['error' => 'Database Connection Failed', 'details' => $e->getMessage()]);
     exit;
}

// Criar tabela se não existir (com campo prompt)
// Nota: Se a tabela já existir sem o campo prompt, isso não vai adicionar a coluna automaticamente.
// Seria necessário um ALTER TABLE manual ou verificar a estrutura.
// Para simplicidade, vamos tentar adicionar a coluna se ela não existir.
$pdo->exec("CREATE TABLE IF NOT EXISTS vitrine_library (
    id VARCHAR(255) PRIMARY KEY,
    url LONGTEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    timestamp BIGINT NOT NULL,
    prompt TEXT
)");

// Tentar adicionar coluna prompt se não existir (migration simples)
try {
    $pdo->exec("ALTER TABLE vitrine_library ADD COLUMN prompt TEXT");
} catch (\PDOException $e) {}

// Tentar adicionar coluna title se não existir
try {
    $pdo->exec("ALTER TABLE vitrine_library ADD COLUMN title VARCHAR(255)");
} catch (\PDOException $e) {}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM vitrine_library ORDER BY timestamp DESC");
        echo json_encode($stmt->fetchAll());
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Query Failed', 'details' => $e->getMessage()]);
    }
} 

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data && isset($data['id'])) {
        try {
            $stmt = $pdo->prepare("INSERT INTO vitrine_library (id, url, type, timestamp, prompt, title) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE url=VALUES(url), prompt=VALUES(prompt), title=VALUES(title)");
            $stmt->execute([
                $data['id'], 
                $data['url'], 
                $data['type'], 
                $data['timestamp'],
                $data['prompt'] ?? null,
                $data['title'] ?? null
            ]);
            echo json_encode(['status' => 'success']);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Insert Failed', 'details' => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid Data']);
    }
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        try {
            $stmt = $pdo->prepare("DELETE FROM vitrine_library WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'deleted']);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Delete Failed', 'details' => $e->getMessage()]);
        }
    }
}
?>

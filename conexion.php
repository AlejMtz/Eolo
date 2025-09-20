<?php
$host = '127.0.0.1';
$dbname = 'eolo';
$username = 'root';
$password = '';

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password);
    
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch (PDOException $e) {
    $pdo = null;
    http_response_code(500);
    die(json_encode(['error' => 'Error de conexión a la base de datos:'. $e->getMessage()]));
}
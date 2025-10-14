<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require '../models/conexion.php';

// Log para depuración (remover en producción)
error_log("Solicitud recibida para ID: " . $_GET['id']);

try {
    // Validar que el ID esté presente
    if (!isset($_GET['id'])) {
        http_response_code(400);
        die(json_encode(['error' => 'ID no proporcionado']));
    }

    $id_aeronave = intval($_GET['id']);

    if ($id_aeronave <= 0) {
        http_response_code(400);
        die(json_encode(['error' => 'ID de aeronave no válido: ' . $_GET['id']]));
    }

    $sql = "SELECT Id_Aeronave, Matricula, Tipo, Equipo 
            FROM aeronave 
            WHERE Id_Aeronave = ?";
    
    $stmt = $pdo->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . implode(', ', $pdo->errorInfo()));
    }
    
    $stmt->execute([$id_aeronave]);
    
    $aeronave = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($aeronave) {
        echo json_encode($aeronave);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Aeronave no encontrada con ID: ' . $id_aeronave]);
    }

} catch (PDOException $e) {
    error_log("Error PDO: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("Error general: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
}
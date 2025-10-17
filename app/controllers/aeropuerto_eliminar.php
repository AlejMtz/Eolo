<?php
// app/controllers/aeropuerto_eliminar.php
session_start();
require_once('../models/conexion.php');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

try {
    // Obtener datos del cuerpo de la petición
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON inválido: ' . json_last_error_msg());
    }
    
    if (empty($data['Id_Aeropuerto'])) {
        echo json_encode(['success' => false, 'error' => 'ID de aeropuerto requerido']);
        exit;
    }

    // Verificar si el aeropuerto está siendo usado en walkarounds
    $sql_check = "SELECT COUNT(*) as uso FROM walkaround WHERE Procedencia = (SELECT Codigo_IATA FROM aeropuertos WHERE Id_Aeropuerto = ?) 
                  OR Destino = (SELECT Codigo_IATA FROM aeropuertos WHERE Id_Aeropuerto = ?)";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$data['Id_Aeropuerto'], $data['Id_Aeropuerto']]);
    $uso = $stmt_check->fetch(PDO::FETCH_ASSOC)['uso'];

    if ($uso > 0) {
        echo json_encode(['success' => false, 'error' => 'No se puede eliminar el aeropuerto porque está siendo utilizado en walkarounds']);
        exit;
    }

    // Eliminar aeropuerto
    $sql = "DELETE FROM aeropuertos WHERE Id_Aeropuerto = ?";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$data['Id_Aeropuerto']]);

    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Aeropuerto eliminado exitosamente'
        ]);
    } else {
        throw new Exception('Error al eliminar de la base de datos');
    }

} catch (Exception $e) {
    error_log("Error en aeropuerto_eliminar.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
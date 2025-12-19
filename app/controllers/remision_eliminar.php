<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight request para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require '../models/conexion.php';

// Verificar que el método de solicitud sea DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Método no permitido. Use DELETE.'
    ]);
    exit;
}

try {
    // Obtener el ID de la URL
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        throw new Exception('ID de remisión no proporcionado.');
    }
    
    $id = intval($_GET['id']);
    
    if ($id <= 0) {
        throw new Exception('ID de remisión inválido.');
    }
    
    error_log(" Intentando eliminar remisión ID: $id");
    
    // Verificar si la remisión existe antes de eliminar
    $sql_check = "SELECT Id_Remision FROM remision WHERE Id_Remision = ?";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$id]);
    $remision = $stmt_check->fetch(PDO::FETCH_ASSOC);
    
    if (!$remision) {
        throw new Exception('La remisión no existe o ya fue eliminada.');
    }
    
    // Eliminar la remisión
    $sql = "DELETE FROM remision WHERE Id_Remision = ?";
    $stmt = $pdo->prepare($sql);
    $resultado = $stmt->execute([$id]);
    
    error_log(" Resultado eliminación: " . ($resultado ? 'éxito' : 'fallo'));
    error_log(" Filas afectadas: " . $stmt->rowCount());
    
    if ($resultado && $stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Remisión eliminada correctamente.',
            'id' => $id,
            'rows_affected' => $stmt->rowCount()
        ]);
    } else {
        throw new Exception('No se pudo eliminar la remisión. Es posible que ya haya sido eliminada.');
    }

} catch (PDOException $e) {
    // Manejar errores de base de datos
    error_log(" Error PDO al eliminar: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en la base de datos al eliminar la remisión.',
        'debug' => $e->getMessage()
    ]);
    
} catch (Exception $e) {
    // Manejar errores de validación
    error_log(" Error validación al eliminar: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage()
    ]);
}
?>
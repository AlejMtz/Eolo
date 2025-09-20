<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../conexion.php';

// Verificar que el método de solicitud sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
    exit;
}

try {
    // Validar y sanear el ID
    $id_aeronave = isset($_POST['id_aeronave']) ? intval($_POST['id_aeronave']) : null;

    // Validar que el ID no esté vacío
    if (empty($id_aeronave)) {
        throw new Exception('ID de aeronave no proporcionado.');
    }

    // Consulta de eliminación con marcador de posición
    $sql = "DELETE FROM aeronave WHERE Id_Aeronave = :id_aeronave";
    
    // Preparar la sentencia
    $stmt = $pdo->prepare($sql);
    
    // Asignar valor al marcador de posición
    $stmt->bindParam(':id_aeronave', $id_aeronave, PDO::PARAM_INT);
    
    // Ejecutar la sentencia
    if ($stmt->execute()) {
        echo json_encode(['success' => 'Aeronave eliminada correctamente.']);
    } else {
        throw new Exception('Error al eliminar la aeronave.');
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
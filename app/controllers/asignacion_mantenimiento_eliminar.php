<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

$response = ['success' => false, 'message' => 'Error desconocido'];

try {
    if (!isset($_POST['id']) || empty($_POST['id'])) {
        throw new Exception("ID de asignación es requerido");
    }

    $id_asignacion = intval($_POST['id']);

    // "Eliminar" cambiando el estado a inactivo
    $sql = "UPDATE asignacion_mantenimiento SET Estado_Registro = 'inactivo' WHERE Id_Asignacion = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_asignacion]);

    $response = [
        'success' => true, 
        'message' => 'Asignación eliminada correctamente'
    ];

} catch (Exception $e) {
    $response = ['success' => false, 'message' => $e->getMessage()];
}

echo json_encode($response);
?>
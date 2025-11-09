<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

$response = ['success' => false, 'message' => 'Error desconocido'];

try {
    // Validar que se reciba el ID
    if (!isset($_POST['id']) || empty($_POST['id'])) {
        throw new Exception("ID de control es requerido");
    }

    $id_control = intval($_POST['id']);

    // Verificar que el control existe y está activo
    $sql_check = "SELECT Id_Control FROM control_pernocta WHERE Id_Control = ? AND Estado_Registro = 'activo'";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$id_control]);
    
    if ($stmt_check->rowCount() === 0) {
        throw new Exception("El control no existe o ya fue eliminado");
    }

    // DESHABILITAR control (no eliminar) pero mantener mensaje de "eliminado"
    $sql = "UPDATE control_pernocta SET Estado_Registro = 'inactivo' WHERE Id_Control = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_control]);

    // ✅ MANTENER MENSAJE DE "ELIMINADO" PARA EL USUARIO
    $response = [
        'success' => true, 
        'message' => 'Control eliminado correctamente'
    ];

} catch (PDOException $e) {
    $response = ['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()];
} catch (Exception $e) {
    $response = ['success' => false, 'message' => $e->getMessage()];
}

echo json_encode($response);
?>
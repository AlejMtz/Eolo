<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

$response = ['success' => false, 'message' => 'Error desconocido'];

try {
    // Validar que se reciba el ID
    if (!isset($_POST['id']) || empty($_POST['id'])) {
        throw new Exception("ID de pernocta es requerido");
    }

    $id_pernocta = intval($_POST['id']);

    // Verificar que la pernocta existe y está activa
    $sql_check = "SELECT Id_Pernocta, Tipo_Movimiento, Id_Aeronave 
                  FROM pernocta_diaria 
                  WHERE Id_Pernocta = ? 
                  AND Estado_Registro = 'activo'";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$id_pernocta]);
    
    if ($stmt_check->rowCount() === 0) {
        throw new Exception("La pernocta no existe o ya está deshabilitada");
    }

    $pernocta = $stmt_check->fetch(PDO::FETCH_ASSOC);
    $id_aeronave = $pernocta['Id_Aeronave'];

    // Iniciar transacción para asegurar consistencia
    $pdo->beginTransaction();

    try {
        // 1. DESHABILITAR EL REGISTRO (no eliminar)
        $sql_deshabilitar = "UPDATE pernocta_diaria SET Estado_Registro = 'inactivo' WHERE Id_Pernocta = ?";
        $stmt_deshabilitar = $pdo->prepare($sql_deshabilitar);
        $result = $stmt_deshabilitar->execute([$id_pernocta]);

        if (!$result) {
            throw new Exception("Error al deshabilitar el registro en la base de datos");
        }

        // 2. RECALCULAR EL ESTADO DE LA AERONAVE (para consistencia)
        // Esto se hará automáticamente en las próximas consultas gracias al filtro Estado_Registro

        // Confirmar transacción
        $pdo->commit();

        $response = [
            'success' => true, 
            'message' => 'Registro de pernocta deshabilitado correctamente. El historial se mantiene para consultas.'
        ];

    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    $response = ['success' => false, 'message' => $e->getMessage()];
}

echo json_encode($response);
?>
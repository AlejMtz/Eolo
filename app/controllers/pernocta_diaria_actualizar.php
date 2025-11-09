<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

$response = ['success' => false, 'message' => 'Error desconocido'];

try {
    // Validar que se reciba el ID
    if (!isset($_POST['id_pernocta']) || empty($_POST['id_pernocta'])) {
        throw new Exception("ID de pernocta es requerido");
    }

    $id_pernocta = intval($_POST['id_pernocta']);

    // Validar campos requeridos
    $required_fields = ['fecha', 'hora', 'id_aeronave', 'tipo_movimiento', 'persona_registro'];
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            throw new Exception("El campo $field es requerido");
        }
    }

    // Obtener datos actuales de la pernocta
    $sql_actual = "SELECT Tipo_Movimiento, Id_Aeronave FROM pernocta_diaria WHERE Id_Pernocta = ? AND Estado_Registro = 'activo'";
    $stmt_actual = $pdo->prepare($sql_actual);
    $stmt_actual->execute([$id_pernocta]);
    
    if ($stmt_actual->rowCount() === 0) {
        throw new Exception("La pernocta no existe o está deshabilitada");
    }
    
    $pernocta_actual = $stmt_actual->fetch(PDO::FETCH_ASSOC);
    $tipo_movimiento_anterior = $pernocta_actual['Tipo_Movimiento'];
    $id_aeronave_anterior = $pernocta_actual['Id_Aeronave'];

    // Obtener nuevos datos
    $fecha = $_POST['fecha'];
    $hora = $_POST['hora'];
    $id_aeronave = intval($_POST['id_aeronave']);
    $tipo_movimiento = $_POST['tipo_movimiento'];
    $procedencia = isset($_POST['procedencia']) ? $_POST['procedencia'] : null;
    $destino = isset($_POST['destino']) ? $_POST['destino'] : null;
    $tripulacion = isset($_POST['tripulacion']) ? $_POST['tripulacion'] : null;
    $pasajeros = isset($_POST['pasajeros']) ? $_POST['pasajeros'] : '0';
    $persona_registro = $_POST['persona_registro'];

    // Validar tipo de movimiento
    if (!in_array($tipo_movimiento, ['entrada', 'salida'])) {
        throw new Exception("Tipo de movimiento no válido");
    }

    // Determinar valor de Activo
    $activo = ($tipo_movimiento == 'entrada') ? 1 : 0;

    // Si cambió el tipo de movimiento o la aeronave, validar estados
    if ($tipo_movimiento != $tipo_movimiento_anterior || $id_aeronave != $id_aeronave_anterior) {
        
        // Validar nuevo estado para la aeronave (solo registros activos)
        $sql_estado = "SELECT Tipo_Movimiento 
                       FROM pernocta_diaria 
                       WHERE Id_Aeronave = ? 
                       AND Id_Pernocta != ?
                       AND Estado_Registro = 'activo'
                       ORDER BY Fecha DESC, Hora DESC, Id_Pernocta DESC 
                       LIMIT 1";
        $stmt_estado = $pdo->prepare($sql_estado);
        $stmt_estado->execute([$id_aeronave, $id_pernocta]);
        
        $estado_actual = 'fuera';
        
        if ($stmt_estado->rowCount() > 0) {
            $ultimo_movimiento = $stmt_estado->fetch(PDO::FETCH_ASSOC);
            $estado_actual = ($ultimo_movimiento['Tipo_Movimiento'] == 'entrada') ? 'en_hangar' : 'fuera';
        }

        if ($tipo_movimiento == 'entrada' && $estado_actual == 'en_hangar') {
            throw new Exception("No puede cambiar a ENTRADA. La aeronave ya se encuentra en hangar (basado en movimientos anteriores).");
        }
        
        if ($tipo_movimiento == 'salida' && $estado_actual == 'fuera') {
            throw new Exception("No puede cambiar a SALIDA. La aeronave no se encuentra en hangar (basado en movimientos anteriores).");
        }
    }

    // Actualizar pernocta
    $sql = "UPDATE pernocta_diaria 
            SET Fecha = ?, Hora = ?, Id_Aeronave = ?, Tipo_Movimiento = ?, 
                Procedencia = ?, Destino = ?, Tripulacion = ?, Pasajeros = ?, 
                Persona_Registro = ?, Activo = ?
            WHERE Id_Pernocta = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$fecha, $hora, $id_aeronave, $tipo_movimiento, $procedencia, 
                   $destino, $tripulacion, $pasajeros, $persona_registro, $activo, $id_pernocta]);

    $response = [
        'success' => true, 
        'message' => 'Pernocta actualizada correctamente',
        'id_pernocta' => $id_pernocta
    ];

} catch (Exception $e) {
    $response = ['success' => false, 'message' => $e->getMessage()];
}

echo json_encode($response);
?>
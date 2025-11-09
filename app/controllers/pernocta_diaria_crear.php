<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

$response = ['success' => false, 'message' => 'Error desconocido'];

try {
    // Validar campos requeridos
    $required_fields = ['fecha', 'hora', 'id_aeronave', 'tipo_movimiento', 'persona_registro'];
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            throw new Exception("El campo $field es requerido");
        }
    }

    // Obtener datos
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

    // CALCULAR ESTADO ACTUAL BASADO EN HISTORIAL ACTIVO
    $sql_estado = "SELECT Tipo_Movimiento 
                   FROM pernocta_diaria 
                   WHERE Id_Aeronave = ? 
                   AND Estado_Registro = 'activo'
                   ORDER BY Fecha DESC, Hora DESC, Id_Pernocta DESC 
                   LIMIT 1";
    $stmt_estado = $pdo->prepare($sql_estado);
    $stmt_estado->execute([$id_aeronave]);
    
    $estado_actual = 'fuera';
    
    if ($stmt_estado->rowCount() > 0) {
        $ultimo_movimiento = $stmt_estado->fetch(PDO::FETCH_ASSOC);
        $estado_actual = ($ultimo_movimiento['Tipo_Movimiento'] == 'entrada') ? 'en_hangar' : 'fuera';
    }

    // VALIDACIÓN DE ESTADO - REGLA PRINCIPAL
    if ($tipo_movimiento == 'entrada' && $estado_actual == 'en_hangar') {
        throw new Exception("No puede registrar una ENTRADA. La aeronave ya se encuentra en hangar (basado en el último movimiento registrado).");
    }
    
    if ($tipo_movimiento == 'salida' && $estado_actual == 'fuera') {
        throw new Exception("No puede registrar una SALIDA. La aeronave no se encuentra en hangar (basado en el último movimiento registrado).");
    }

    // Determinar valor de Activo
    $activo = ($tipo_movimiento == 'entrada') ? 1 : 0;

    // Insertar en pernocta_diaria (nuevos registros siempre son activos)
    $sql = "INSERT INTO pernocta_diaria (Fecha, Hora, Id_Aeronave, Tipo_Movimiento, Procedencia, Destino, Tripulacion, Pasajeros, Persona_Registro, Activo, Estado_Registro) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$fecha, $hora, $id_aeronave, $tipo_movimiento, $procedencia, $destino, $tripulacion, $pasajeros, $persona_registro, $activo]);
    
    $id_pernocta = $pdo->lastInsertId();

    // Calcular nuevo estado para la respuesta
    $nuevo_estado = ($tipo_movimiento == 'entrada') ? 'en_hangar' : 'fuera';

    $response = [
        'success' => true, 
        'message' => 'Registro de pernocta guardado correctamente. Estado actual: ' . strtoupper(str_replace('_', ' ', $nuevo_estado)),
        'id_pernocta' => $id_pernocta,
        'nuevo_estado' => $nuevo_estado
    ];

} catch (Exception $e) {
    $response = ['success' => false, 'message' => $e->getMessage()];
}

echo json_encode($response);
?>
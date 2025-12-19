<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

// Verificar que el método de solicitud sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
    exit;
}

// DEPURACIÓN: Registrar datos recibidos
error_log("=== DATOS RECIBIDOS PARA ACTUALIZAR ===");
foreach ($_POST as $key => $value) {
    error_log("  $key: " . (is_array($value) ? json_encode($value) : substr($value, 0, 100)));
}

try {
    // Obtener datos del POST
    $id = $_POST['Id_Remision'] ?? '';
    $ov = $_POST['ov'] ?? '';
    $operador = $_POST['operador'] ?? '';
    $fecha = $_POST['fecha'] ?? '';
    $cliente = $_POST['cliente'] ?? '';
    $requision = $_POST['requision'] ?? '';
    $formaPago = $_POST['pago'] ?? '';
    $idAeronave = $_POST['id_aeronave'] ?? '';
    $horaLlegada = $_POST['horaLlegada'] ?? '';
    $horaInicial = $_POST['horaInicial'] ?? '';
    $lecInicial = $_POST['lecInicial'] ?? '';
    $horaFinal = $_POST['horaFinal'] ?? '';
    $lecFinal = $_POST['lecFinal'] ?? '';
    $litrosTot = $_POST['LitrosTot'] ?? '';
    $observaciones = $_POST['observaciones'] ?? '';
    $cobranza = $_POST['cobranza'] ?? '';
    $serviciosCom = $_POST['serviciosCom'] ?? '';

    error_log("ID a actualizar: $id");
    
    // Validar campos obligatorios
    $camposObligatorios = [
        'id' => $id,
        'operador' => $operador,
        'fecha' => $fecha,
        'cliente' => $cliente,
        'formaPago' => $formaPago,
        'idAeronave' => $idAeronave,
        'horaLlegada' => $horaLlegada,
        'horaInicial' => $horaInicial,
        'lecInicial' => $lecInicial,
        'horaFinal' => $horaFinal,
        'lecFinal' => $lecFinal,
        'cobranza' => $cobranza,
        'serviciosCom' => $serviciosCom
    ];
    
    $errores = [];
    foreach ($camposObligatorios as $nombre => $valor) {
        if (empty($valor)) {
            $errores[] = "El campo '$nombre' es obligatorio.";
        }
    }
    
    if (!empty($errores)) {
        throw new Exception(implode(' ', $errores));
    }
    
    // Validar que las lecturas sean numéricas
    if (!is_numeric($lecInicial) || !is_numeric($lecFinal)) {
        throw new Exception('Las lecturas de combustible deben ser valores numéricos.');
    }
    
    if ($lecFinal >= $lecInicial) {
        throw new Exception('La lectura final debe ser menor que la lectura inicial.');
    }
    
    // Calcular litros totales si no viene del formulario
    if (empty($litrosTot)) {
        $litrosTot = $lecInicial - $lecFinal;
    }
    
    // Preparar la consulta SQL de actualización
    $sql = "UPDATE remision SET
                Ov = ?,
                Operador = ?,
                Fecha = ?,
                Cliente = ?,
                Requision = ?,
                FormaPago = ?,
                Id_Aeronave = ?,
                HoraLlegada = ?,
                HoraInicial = ?,
                LecInicial = ?,
                HoraFinal = ?,
                LecFinal = ?,
                LitrosTot = ?,
                Observaciones = ?,
                Cobranza = ?,
                ServiciosCom = ?
            WHERE Id_Remision = ?";
    
    error_log("SQL: $sql");
    
    // Preparar la sentencia
    $stmt = $pdo->prepare($sql);
    
    // Ejecutar la sentencia con los parámetros
    $resultado = $stmt->execute([
        $ov, $operador, $fecha, $cliente, $requision, $formaPago,
        $idAeronave, $horaLlegada, $horaInicial, $lecInicial,
        $horaFinal, $lecFinal, $litrosTot, $observaciones,
        $cobranza, $serviciosCom, $id
    ]);
    
    error_log("Resultado ejecución: " . ($resultado ? 'true' : 'false'));
    error_log("Filas afectadas: " . $stmt->rowCount());
    
    if ($resultado) {
        echo json_encode([
            'success' => true,
            'message' => 'Remisión actualizada correctamente.',
            'id' => $id,
            'rows_affected' => $stmt->rowCount()
        ]);
    } else {
        throw new Exception('Error al actualizar la remisión en la base de datos.');
    }

} catch (PDOException $e) {
    // Manejar errores de base de datos
    error_log("Error PDO: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en la base de datos',
        'debug' => $e->getMessage()
    ]);
    
} catch (Exception $e) {
    // Manejar errores de validación
    error_log("Error validación: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
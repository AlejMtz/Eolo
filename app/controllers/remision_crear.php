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

try {
    // Obtener datos del POST
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
    $litrosTot = $_POST['litrosTot'] ?? '';
    $observaciones = $_POST['observaciones'] ?? '';
    $cobranza = $_POST['cobranza'] ?? '';
    $serviciosCom = $_POST['serviciosCom'] ?? '';

    // Validar campos obligatorios
    $camposObligatorios = [
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
    
    foreach ($camposObligatorios as $nombre => $valor) {
        if (empty($valor)) {
            throw new Exception("El campo '$nombre' es obligatorio.");
        }
    }
    
    // Validar que las lecturas sean numéricas
    if (!is_numeric($lecInicial) || !is_numeric($lecFinal)) {
        throw new Exception('Las lecturas de combustible deben ser valores numéricos.');
    }

    // Ahora la lógica es: la lectura inicial debe ser mayor o igual que la final
    if ($lecInicial < $lecFinal) {
        throw new Exception('La lectura inicial debe ser mayor o igual que la lectura final.');
    }

    // Calcular litros totales si no viene del formulario (inicial - final)
    if (empty($litrosTot)) {
        $litrosTot = $lecInicial - $lecFinal;
    }
    
    // Preparar la consulta SQL
    $sql = "INSERT INTO remision (
        Ov, Operador, Fecha, Cliente, Requision, FormaPago, 
        Id_Aeronave, HoraLlegada, HoraInicial, LecInicial, 
        HoraFinal, LecFinal, LitrosTot, Observaciones, 
        Cobranza, ServiciosCom
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    // Preparar la sentencia
    $stmt = $pdo->prepare($sql);
    
    // Ejecutar la sentencia con los parámetros
    $resultado = $stmt->execute([
        $ov, $operador, $fecha, $cliente, $requision, $formaPago,
        $idAeronave, $horaLlegada, $horaInicial, $lecInicial,
        $horaFinal, $lecFinal, $litrosTot, $observaciones,
        $cobranza, $serviciosCom
    ]);
    
    if ($resultado) {
        // Obtener el ID insertado
        $idInsertado = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Remisión registrada correctamente.',
            'id' => $idInsertado
        ]);
    } else {
        throw new Exception('Error al registrar la remisión en la base de datos.');
    }

} catch (PDOException $e) {
    // Manejar errores de base de datos
    http_response_code(500);
    echo json_encode([
        'error' => 'Error en la base de datos',
        'debug' => $e->getMessage()
    ]);
    
} catch (Exception $e) {
    // Manejar errores de validación
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
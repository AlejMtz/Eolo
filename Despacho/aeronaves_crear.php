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
    // Validar y sanear los datos de entrada
    $matricula = isset($_POST['matricula']) ? trim($_POST['matricula']) : '';
    $tipo = isset($_POST['tipo']) ? trim($_POST['tipo']) : '';
    $equipo = isset($_POST['equipo']) ? trim($_POST['equipo']) : '';
    $procedencia = isset($_POST['procedencia']) ? trim($_POST['procedencia']) : '';
    $destino = isset($_POST['destino']) ? trim($_POST['destino']) : '';

    // Validar que los campos no estén vacíos
    if (empty($matricula) || empty($tipo) || empty($equipo) || empty($procedencia) || empty($destino)) {
        throw new Exception('Todos los campos son obligatorios.');
    }

    // Consulta de inserción con marcadores de posición
    $sql = "INSERT INTO aeronave (Matricula, Tipo, Equipo, Procedencia, Destino) VALUES (:matricula, :tipo, :equipo, :procedencia, :destino)";
    
    // Preparar la sentencia
    $stmt = $pdo->prepare($sql);
    
    // Asignar valores a los marcadores de posición
    $stmt->bindParam(':matricula', $matricula);
    $stmt->bindParam(':tipo', $tipo);
    $stmt->bindParam(':equipo', $equipo);
    $stmt->bindParam(':procedencia', $procedencia);
    $stmt->bindParam(':destino', $destino);
    
    // Ejecutar la sentencia
    if ($stmt->execute()) {
        echo json_encode(['success' => 'Aeronave registrada correctamente.']);
    } else {
        throw new Exception('Error al registrar la aeronave.');
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(400); // 400 Bad Request por datos inválidos
    echo json_encode(['error' => $e->getMessage()]);
}
?>
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
    $id_aeronave = isset($_POST['id_aeronave']) ? intval($_POST['id_aeronave']) : null;
    $matricula = isset($_POST['matricula']) ? trim($_POST['matricula']) : '';
    $tipo = isset($_POST['tipo']) ? trim($_POST['tipo']) : '';
    $equipo = isset($_POST['equipo']) ? trim($_POST['equipo']) : '';
    $procedencia = isset($_POST['procedencia']) ? trim($_POST['procedencia']) : '';
    $destino = isset($_POST['destino']) ? trim($_POST['destino']) : '';

    // Validar que los campos no estén vacíos
    if (empty($id_aeronave) || empty($matricula) || empty($tipo) || empty($equipo) || empty($procedencia) || empty($destino)) {
        throw new Exception('Todos los campos son obligatorios.');
    }

    // Consulta de actualización con marcadores de posición
    $sql = "UPDATE aeronave SET Matricula = :matricula, Tipo = :tipo, Equipo = :equipo, Procedencia = :procedencia, Destino = :destino WHERE Id_Aeronave = :id_aeronave";
    
    // Preparar la sentencia
    $stmt = $pdo->prepare($sql);
    
    // Asignar valores a los marcadores de posición
    $stmt->bindParam(':matricula', $matricula);
    $stmt->bindParam(':tipo', $tipo);
    $stmt->bindParam(':equipo', $equipo);
    $stmt->bindParam(':procedencia', $procedencia);
    $stmt->bindParam(':destino', $destino);
    $stmt->bindParam(':id_aeronave', $id_aeronave, PDO::PARAM_INT);
    
    // Ejecutar la sentencia
    if ($stmt->execute()) {
        echo json_encode(['success' => 'Aeronave actualizada correctamente.']);
    } else {
        throw new Exception('Error al actualizar la aeronave.');
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(400); // 400 Bad Request por datos inválidos
    echo json_encode(['error' => $e->getMessage()]);
}
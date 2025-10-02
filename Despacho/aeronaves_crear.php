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

    // Validar que los campos no estén vacíos
    if (empty($matricula) || empty($tipo) || empty($equipo)) {
        throw new Exception('Todos los campos son obligatorios.');
    }

    // ⭐⭐ NUEVA VALIDACIÓN: Verificar si la matrícula ya existe ⭐⭐
    $sql_verificar = "SELECT COUNT(*) as count FROM aeronave WHERE Matricula = :matricula";
    $stmt_verificar = $pdo->prepare($sql_verificar);
    $stmt_verificar->bindParam(':matricula', $matricula);
    $stmt_verificar->execute();
    $resultado = $stmt_verificar->fetch(PDO::FETCH_ASSOC);
    
    if ($resultado['count'] > 0) {
        throw new Exception('La matrícula "' . $matricula . '" ya está registrada. Por favor, use una matrícula diferente.');
    }

    // Consulta de inserción con marcadores de posición
    $sql = "INSERT INTO aeronave (Matricula, Tipo, Equipo) VALUES (:matricula, :tipo, :equipo)";
    
    // Preparar la sentencia
    $stmt = $pdo->prepare($sql);
    
    // Asignar valores a los marcadores de posición
    $stmt->bindParam(':matricula', $matricula);
    $stmt->bindParam(':tipo', $tipo);
    $stmt->bindParam(':equipo', $equipo);
    
    // Ejecutar la sentencia
    if ($stmt->execute()) {
        echo json_encode(['success' => 'Aeronave registrada correctamente.']);
    } else {
        throw new Exception('Error al registrar la aeronave.');
    }

} catch (PDOException $e) {
    // Verificar si es error de duplicado
    if ($e->getCode() == 23000 || strpos($e->getMessage(), 'Duplicate') !== false) {
        http_response_code(400);
        echo json_encode(['error' => 'La matrícula "' . $matricula . '" ya está registrada. Por favor, use una matrícula diferente.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
} catch (Exception $e) {
    http_response_code(400); // 400 Bad Request por datos inválidos
    echo json_encode(['error' => $e->getMessage()]);
}
?>
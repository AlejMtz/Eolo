<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

try {
    // Obtener ID del control
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($id === 0) {
        echo json_encode(['error' => 'ID no válido']);
        exit;
    }

    // Consulta para obtener datos del control
    $sql = "SELECT cp.*, a.Matricula, a.Equipo, a.Tipo 
            FROM control_pernocta cp 
            LEFT JOIN aeronave a ON cp.Id_Aeronave = a.Id_Aeronave 
            WHERE cp.Id_Control = ? AND cp.Estado_Registro = 'activo'"; 
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() === 0) {
        echo json_encode(['error' => 'Control no encontrado o deshabilitado']);
        exit;
    }
    
    $control = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'control' => $control
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
}
?>
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

try {
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        throw new Exception("ID de asignación es requerido");
    }

    $id_asignacion = intval($_GET['id']);

    $sql = "SELECT am.*, a.Matricula, a.Equipo 
            FROM asignacion_mantenimiento am 
            INNER JOIN aeronave a ON am.Id_Aeronave = a.Id_Aeronave 
            WHERE am.Id_Asignacion = ? AND am.Estado_Registro = 'activo'";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_asignacion]);
    
    $asignacion = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($asignacion) {
        echo json_encode([
            'success' => true,
            'asignacion' => $asignacion
        ]);
    } else {
        throw new Exception("Asignación no encontrada");
    }
    
} catch (Exception $e) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../../app/models/conexion.php';

try {
    $sql = "SELECT * FROM entregaturno ORDER BY Fecha DESC, Id_EntregaTurno DESC";
    $stmt = $pdo->query($sql);
    $entregas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($entregas);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al cargar las entregas: ' . $e->getMessage()]);
}
?>
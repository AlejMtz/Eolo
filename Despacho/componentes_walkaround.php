<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../conexion.php';

try {
    if (!isset($_GET['id_walk'])) {
        http_response_code(400);
        die(json_encode(['error' => 'ID de walkaround no proporcionado']));
    }

    $id_walk = intval($_GET['id_walk']);

    $sql = "SELECT * FROM componentewk WHERE Id_Walk = ? ORDER BY Id_Componete_Wk";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_walk]);
    
    $componentes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($componentes);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>
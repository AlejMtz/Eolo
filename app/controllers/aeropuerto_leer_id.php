<?php
require '../../app/models/conexion.php';

header('Content-Type: application/json');

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    echo json_encode(['success' => false, 'error' => 'ID inválido']);
    exit;
}

try {
    $sql = "SELECT * FROM aeropuertos WHERE Id_Aeropuerto = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    
    $aeropuerto = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($aeropuerto) {
        echo json_encode([
            'success' => true,
            'aeropuerto' => $aeropuerto
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Aeropuerto no encontrado'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
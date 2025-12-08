<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

try {
    // Obtener ID de la pernocta
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    error_log("🔍 Buscando pernocta ID: " . $id); // Log para debug

    if ($id === 0) {
        echo json_encode(['error' => 'ID no válido: ' . $_GET['id']]);
        exit;
    }

    // Primero verificar si la pernocta existe
    $sql_check = "SELECT * FROM pernocta_diaria WHERE Id_Pernocta = ?";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$id]);
    
    if ($stmt_check->rowCount() === 0) {
        error_log("❌ Pernocta no encontrada en tabla pernocta_diaria, ID: " . $id);
        echo json_encode(['error' => 'Pernocta no encontrada en la base de datos. ID: ' . $id]);
        exit;
    }
    
    error_log(" Pernocta encontrada en pernocta_diaria, procediendo con JOIN...");

    $sql = "SELECT p.*, a.Matricula, a.Equipo, a.Tipo 
            FROM pernocta_diaria p 
            LEFT JOIN aeronave a ON p.Id_Aeronave = a.Id_Aeronave 
            WHERE p.Id_Pernocta = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() === 0) {
        error_log("Error en JOIN - pernocta encontrada pero falló el JOIN");
        echo json_encode(['error' => 'Error al cargar datos relacionados de la pernocta']);
        exit;
    }
    
    $pernocta = $stmt->fetch(PDO::FETCH_ASSOC);
    
    error_log("Pernocta cargada exitosamente: " . json_encode($pernocta));

    echo json_encode([
        'success' => true,
        'pernocta' => $pernocta
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    error_log("❌ Error PDO: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("❌ Error general: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
}
?>
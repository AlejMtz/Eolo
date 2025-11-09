<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

try {
    $mes = isset($_GET['mes']) ? intval($_GET['mes']) : date('n');
    $anio = isset($_GET['anio']) ? intval($_GET['anio']) : date('Y');

    $sql = "SELECT rpm.*, a.Matricula, a.Tipo, a.Equipo 
            FROM relacion_pernocta_mensual rpm 
            LEFT JOIN aeronave a ON rpm.Id_Aeronave = a.Id_Aeronave 
            WHERE rpm.Mes = ? AND rpm.Anio = ? 
            ORDER BY a.Matricula";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$mes, $anio]);
    
    $relaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'relaciones' => $relaciones,
        'mes' => $mes,
        'anio' => $anio
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>
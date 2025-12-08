<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require 'conexion.php';

try {
    $modulo = isset($_GET['modulo']) ? $_GET['modulo'] : 'control_pernocta';
    
    $fecha_hoy = date('Y-m-d');
    
    $sql = "
        SELECT p1.*, a.Matricula, a.Equipo 
        FROM pernocta_diaria p1 
        INNER JOIN aeronave a ON p1.Id_Aeronave = a.Id_Aeronave 
        INNER JOIN (
            SELECT Id_Aeronave, MAX(CONCAT(Fecha, ' ', Hora)) as UltimaFechaHora
            FROM pernocta_diaria 
            WHERE Tipo_Movimiento = 'entrada' 
            AND Activo = 1
            AND Fecha = :fecha_hoy
            GROUP BY Id_Aeronave
        ) p2 ON p1.Id_Aeronave = p2.Id_Aeronave AND CONCAT(p1.Fecha, ' ', p1.Hora) = p2.UltimaFechaHora
        WHERE p1.Tipo_Movimiento = 'entrada' 
        AND p1.Activo = 1
        AND p1.Fecha = :fecha_hoy
    ";
    
    if ($modulo === 'asignacion_mantenimiento') {
        $sql .= " AND p1.Id_Pernocta NOT IN (
                    SELECT Id_Ultimo_Registro 
                    FROM asignacion_mantenimiento 
                    WHERE Estado_Registro = 'activo'
                  )";
    } else {
    
        $sql .= " AND p1.Id_Aeronave NOT IN (
                    SELECT DISTINCT Id_Aeronave 
                    FROM control_pernocta 
                    WHERE DATE(Fecha) = :fecha_hoy 
                    AND Estado_Registro = 'activo'
                  )";
    }
    
    $sql .= " ORDER BY p1.Hora DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['fecha_hoy' => $fecha_hoy]);
    
    $entradas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    error_log(" Fecha consultada: " . $fecha_hoy);
    error_log(" Entradas encontradas: " . count($entradas));
    
    echo json_encode([
        'success' => true,
        'entradas' => $entradas,
        'total' => count($entradas),
        'modulo' => $modulo,
        'fecha_consulta' => $fecha_hoy
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
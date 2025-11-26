<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require 'conexion.php';

try {
    // Obtener el módulo desde el parámetro GET
    $modulo = isset($_GET['modulo']) ? $_GET['modulo'] : 'control_pernocta';
    
    // CONSULTA PARA OBTENER ÚLTIMAS ENTRADAS DE CADA AERONAVE
    $sql = "
        SELECT p1.*, a.Matricula, a.Equipo 
        FROM pernocta_diaria p1 
        INNER JOIN aeronave a ON p1.Id_Aeronave = a.Id_Aeronave 
        INNER JOIN (
            SELECT Id_Aeronave, MAX(CONCAT(Fecha, ' ', Hora)) as UltimaFechaHora
            FROM pernocta_diaria 
            WHERE Tipo_Movimiento = 'entrada' 
            AND Activo = 1
            GROUP BY Id_Aeronave
        ) p2 ON p1.Id_Aeronave = p2.Id_Aeronave AND CONCAT(p1.Fecha, ' ', p1.Hora) = p2.UltimaFechaHora
        WHERE p1.Tipo_Movimiento = 'entrada' 
        AND p1.Activo = 1
    ";
    
    // CONDICIÓN ADICIONAL SEGÚN EL MÓDULO
    if ($modulo === 'asignacion_mantenimiento') {
        // Para asignación de mantenimiento: excluir entradas que ya están en asignacion_mantenimiento
        $sql .= " AND p1.Id_Pernocta NOT IN (
                    SELECT Id_Ultimo_Registro 
                    FROM asignacion_mantenimiento 
                    WHERE Estado_Registro = 'activo'
                  )";
    } else {
        // Para control de pernoctas: excluir entradas que ya están en control_pernocta
        $sql .= " AND p1.Id_Pernocta NOT IN (
                    SELECT Id_Ultimo_Registro 
                    FROM control_pernocta 
                    WHERE Estado_Registro = 'activo'
                  )";
    }
    
    $sql .= " ORDER BY p1.Fecha DESC, p1.Hora DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    $entradas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'entradas' => $entradas,
        'total' => count($entradas),
        'modulo' => $modulo,
        'consulta' => 'últimas_entradas_para_' . $modulo,
        'sql' => $sql // Para debugging
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en la base de datos: ' . $e->getMessage(),
        'sql' => $sql ?? ''
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
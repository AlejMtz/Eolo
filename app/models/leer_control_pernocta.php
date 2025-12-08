<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require 'conexion.php';

try {
    $pagina = isset($_GET['pagina']) ? intval($_GET['pagina']) : 1;
    $registrosPorPagina = isset($_GET['registros_por_pagina']) ? intval($_GET['registros_por_pagina']) : 10;
    
    if ($pagina < 1) $pagina = 1;
    if ($registrosPorPagina < 1) $registrosPorPagina = 10;
    
    $offset = ($pagina - 1) * $registrosPorPagina;
    
    // Parámetros de filtro
    $fecha = isset($_GET['fecha']) ? $_GET['fecha'] : '';
    $matricula = isset($_GET['matricula']) ? $_GET['matricula'] : '';
    $hangar = isset($_GET['hangar']) ? $_GET['hangar'] : '';
    
    // Construir consulta base
    $sql = "SELECT SQL_CALC_FOUND_ROWS cp.*, a.Matricula, a.Equipo 
            FROM control_pernocta cp 
            INNER JOIN aeronave a ON cp.Id_Aeronave = a.Id_Aeronave 
            WHERE cp.Estado_Registro = 'activo'"; // ✅ FILTRO NUEVO
    
    $params = [];
    
    if (!empty($fecha)) {
        $sql .= " AND cp.Fecha = ?";
        $params[] = $fecha;
    }
    
    if (!empty($matricula)) {
        $sql .= " AND a.Matricula LIKE ?";
        $params[] = "%$matricula%";
    }
    
    if (!empty($hangar)) {
        $sql .= " AND cp.Hangar = ?";
        $params[] = $hangar;
    }
    
    // Orden por fecha y hora inicial
    $sql .= " ORDER BY cp.Fecha DESC, cp.HoraInicial DESC 
              LIMIT $registrosPorPagina OFFSET $offset";
    
    $stmt = $pdo->prepare($sql);
    
    if (!empty($params)) {
        $stmt->execute($params);
    } else {
        $stmt->execute();
    }
    
    $controles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Obtener total de registros
    $stmtTotal = $pdo->query("SELECT FOUND_ROWS() as total");
    $totalData = $stmtTotal->fetch(PDO::FETCH_ASSOC);
    $totalRegistros = $totalData ? $totalData['total'] : 0;
    $totalPaginas = $totalRegistros > 0 ? ceil($totalRegistros / $registrosPorPagina) : 1;
    
    echo json_encode([
        'success' => true,
        'controles' => $controles,
        'paginacion' => [
            'pagina_actual' => $pagina,
            'total_paginas' => $totalPaginas,
            'total_registros' => $totalRegistros,
            'registros_por_pagina' => $registrosPorPagina
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    error_log("Error PDO en leer_control_pernocta: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en la base de datos: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log("Error general en leer_control_pernocta: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
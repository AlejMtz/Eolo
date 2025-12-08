<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require 'conexion.php';

ob_start();

try {
    $pagina = isset($_GET['pagina']) ? intval($_GET['pagina']) : 1;
    $registrosPorPagina = isset($_GET['registros_por_pagina']) ? intval($_GET['registros_por_pagina']) : 10;
    
    if ($pagina < 1) $pagina = 1;
    if ($registrosPorPagina < 1) $registrosPorPagina = 10;
    
    $offset = ($pagina - 1) * $registrosPorPagina;
    
    // Parámetros de filtro
    $fecha = isset($_GET['fecha']) ? $_GET['fecha'] : '';
    $matricula = isset($_GET['matricula']) ? $_GET['matricula'] : '';
    $tipo_cliente = isset($_GET['tipo_cliente']) ? $_GET['tipo_cliente'] : '';
    
    $tipo_mantenimiento = isset($_GET['tipo_mantenimiento']) ? $_GET['tipo_mantenimiento'] : '';
    $tiene_filtro_mantenimiento = array_key_exists('tipo_mantenimiento', $_GET);
    
    // Construir consulta base
    $sql = "SELECT SQL_CALC_FOUND_ROWS am.*, a.Matricula, a.Equipo 
            FROM asignacion_mantenimiento am 
            INNER JOIN aeronave a ON am.Id_Aeronave = a.Id_Aeronave 
            WHERE am.Estado_Registro = 'activo'";
    
    $params = [];
    
    if (!empty($fecha)) {
        $sql .= " AND am.Fecha = ?";
        $params[] = $fecha;
    }
    
    if (!empty($matricula)) {
        $sql .= " AND a.Matricula LIKE ?";
        $params[] = "%$matricula%";
    }
    
    if (!empty($tipo_cliente)) {
        $sql .= " AND am.Tipo_Cliente = ?";
        $params[] = $tipo_cliente;
    }
    
    if ($tiene_filtro_mantenimiento && $tipo_mantenimiento !== '') {
        $sql .= " AND am.Tipo_Mantenimiento = ?";
        $params[] = $tipo_mantenimiento;
        error_log("🔧 Aplicando filtro mantenimiento: " . $tipo_mantenimiento);
    }
    
    // Orden por fecha y hora
    $sql .= " ORDER BY am.Fecha DESC, am.Hora DESC 
              LIMIT $registrosPorPagina OFFSET $offset";
    
    error_log("📊 Consulta SQL: " . $sql);
    error_log("🎯 Parámetros: " . implode(', ', $params));
    
    $stmt = $pdo->prepare($sql);
    
    if (!empty($params)) {
        $stmt->execute($params);
    } else {
        $stmt->execute();
    }
    
    $asignaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Obtener total de registros
    $stmtTotal = $pdo->query("SELECT FOUND_ROWS() as total");
    $totalData = $stmtTotal->fetch(PDO::FETCH_ASSOC);
    $totalRegistros = $totalData ? $totalData['total'] : 0;
    $totalPaginas = $totalRegistros > 0 ? ceil($totalRegistros / $registrosPorPagina) : 1;
    
    ob_clean();
    
    echo json_encode([
        'success' => true,
        'asignaciones' => $asignaciones,
        'paginacion' => [
            'pagina_actual' => $pagina,
            'total_paginas' => $totalPaginas,
            'total_registros' => $totalRegistros,
            'registros_por_pagina' => $registrosPorPagina
        ],
        'filtros_aplicados' => [
            'fecha' => $fecha,
            'matricula' => $matricula,
            'tipo_cliente' => $tipo_cliente,
            'tipo_mantenimiento' => $tipo_mantenimiento,
            'tiene_filtro_mantenimiento' => $tiene_filtro_mantenimiento
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    ob_clean();
    error_log("Error PDO en leer_asignacion_mantenimiento: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en la base de datos: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    ob_clean();
    error_log("Error general en leer_asignacion_mantenimiento: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

exit();
?>
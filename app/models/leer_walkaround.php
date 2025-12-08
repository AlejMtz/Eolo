<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../../app/models/conexion.php';

try {
    $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $registros_por_pagina = isset($_GET['registros_por_pagina']) ? (int)$_GET['registros_por_pagina'] : 15;
    
    // Obtener parámetros de filtros
    $filtro_fecha = isset($_GET['fecha']) ? $_GET['fecha'] : '';
    $filtro_matricula = isset($_GET['matricula']) ? $_GET['matricula'] : '';
    $filtro_movimiento = isset($_GET['movimiento']) ? $_GET['movimiento'] : '';
    
    // Construir consulta base con filtros
    $sql_base = "FROM walkaround w
                 LEFT JOIN aeronave a ON w.Id_Aeronave = a.Id_Aeronave
                 WHERE 1=1";
    
    $params = [];
    
    //filtro por fecha
    if (!empty($filtro_fecha)) {
        $sql_base .= " AND DATE(w.FechaHora) = :fecha";
        $params[':fecha'] = $filtro_fecha;
    }
    
    //filtro por matrícula
    if (!empty($filtro_matricula)) {
        $sql_base .= " AND a.Matricula LIKE :matricula";
        $params[':matricula'] = '%' . $filtro_matricula . '%';
    }
    
    // filtro por movimiento
    if (!empty($filtro_movimiento)) {
        if ($filtro_movimiento === 'entrada') {
            $sql_base .= " AND w.entrada = 1";
        } elseif ($filtro_movimiento === 'salida') {
            $sql_base .= " AND w.salida = 1";
        }
    }
    
    $offset = ($pagina - 1) * $registros_por_pagina;
    
    $sql_total = "SELECT COUNT(*) as total " . $sql_base;
    $stmt_total = $pdo->prepare($sql_total);
    
    foreach ($params as $key => $value) {
        $stmt_total->bindValue($key, $value);
    }
    
    $stmt_total->execute();
    $total_registros = $stmt_total->fetch(PDO::FETCH_ASSOC)['total'];
    $total_paginas = ceil($total_registros / $registros_por_pagina);
    
    // Consulta SQL para obtener walkarounds con paginación
    $sql = "SELECT 
                w.Id_Walk, 
                w.FechaHora, 
                w.Elaboro, 
                w.Responsable, 
                w.JefeArea, 
                w.VoBo, 
                w.observaciones,
                w.Procedencia, 
                w.Destino, 
                w.Id_Aeronave, 
                w.entrada,
                w.salida,
                a.Matricula, 
                a.Tipo, 
                a.Equipo
            " . $sql_base . " 
            ORDER BY w.FechaHora DESC
            LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->bindValue(':limit', $registros_por_pagina, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $walkarounds = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'walkarounds' => $walkarounds,
        'paginacion' => [
            'pagina_actual' => $pagina,
            'total_paginas' => $total_paginas,
            'total_registros' => $total_registros,
            'registros_por_pagina' => $registros_por_pagina
        ],
        'filtros_aplicados' => [
            'fecha' => $filtro_fecha,
            'matricula' => $filtro_matricula,
            'movimiento' => $filtro_movimiento
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
}
?>
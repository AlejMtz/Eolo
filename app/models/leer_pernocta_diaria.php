<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../../app/models/conexion.php';

try {
    // Obtener parámetros de paginación
    $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $registros_por_pagina = isset($_GET['registros_por_pagina']) ? (int)$_GET['registros_por_pagina'] : 10;
    
    // Obtener parámetros de filtro
    $fecha = isset($_GET['fecha']) ? $_GET['fecha'] : '';
    $matricula = isset($_GET['matricula']) ? $_GET['matricula'] : '';
    $movimiento = isset($_GET['movimiento']) ? $_GET['movimiento'] : '';
    
    // Calcular el offset
    $offset = ($pagina - 1) * $registros_por_pagina;
    
    // Construir consulta base con filtros
    $sql_where = "WHERE p.Estado_Registro = 'activo'";
    $params = [];
    
    if (!empty($fecha)) {
        $sql_where .= " AND p.Fecha = :fecha";
        $params[':fecha'] = $fecha;
    }
    
    if (!empty($matricula)) {
        $sql_where .= " AND a.Matricula LIKE :matricula";
        $params[':matricula'] = "%$matricula%";
    }
    
    if (!empty($movimiento)) {
        $sql_where .= " AND p.Tipo_Movimiento = :movimiento";
        $params[':movimiento'] = $movimiento;
    }
    
    // Consulta para obtener el total de registros
    $sql_total = "SELECT COUNT(*) as total 
                  FROM pernocta_diaria p
                  LEFT JOIN aeronave a ON p.Id_Aeronave = a.Id_Aeronave
                  $sql_where";
    
    $stmt_total = $pdo->prepare($sql_total);
    
    // Bind parameters
    foreach ($params as $key => $value) {
        $stmt_total->bindValue($key, $value);
    }
    
    $stmt_total->execute();
    $total_registros = $stmt_total->fetch(PDO::FETCH_ASSOC)['total'];
    $total_paginas = ceil($total_registros / $registros_por_pagina);
    
    // Consulta SQL para obtener pernoctas con paginación
    $sql = "SELECT 
                p.Id_Pernocta,
                p.Fecha,
                p.Hora, 
                p.Tipo_Movimiento,
                p.Procedencia,
                p.Destino,
                p.Tripulacion,
                p.Pasajeros,
                p.Persona_Registro,
                p.Fecha_Creacion,
                p.Id_Aeronave,
                p.Activo,
                p.Estado_Registro,
                a.Matricula,
                a.Tipo,
                a.Equipo
            FROM pernocta_diaria p
            LEFT JOIN aeronave a ON p.Id_Aeronave = a.Id_Aeronave
            $sql_where
            ORDER BY p.Fecha DESC, p.Hora DESC
            LIMIT $registros_por_pagina OFFSET $offset";
    
    $stmt = $pdo->prepare($sql);
    
    // Bind parameters para la consulta principal
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    $pernoctas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'pernoctas' => $pernoctas,
        'paginacion' => [
            'pagina_actual' => $pagina,
            'total_paginas' => $total_paginas,
            'total_registros' => $total_registros,
            'registros_por_pagina' => $registros_por_pagina
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
}
?>
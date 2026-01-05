<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "eolo";

try {
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception('Error de conexión: ' . $conn->connect_error);
    }

    // Obtener parámetros de paginación
    $pagina = isset($_GET['pagina']) ? intval($_GET['pagina']) : 1;
    $registros_por_pagina = isset($_GET['registros_por_pagina']) ? intval($_GET['registros_por_pagina']) : 15;
    $offset = ($pagina - 1) * $registros_por_pagina;
    
    // Obtener parámetros de filtro
    $fecha = isset($_GET['fecha']) ? $_GET['fecha'] : '';
    $matricula = isset($_GET['matricula']) ? $_GET['matricula'] : '';
    
    // Construir consulta base
    $sql_base = "SELECT 
                    r.Id_Remision,
                    r.Fecha,
                    r.Operador,
                    r.Cliente,
                    r.FormaPago,
                    r.HoraLlegada,
                    r.HoraInicial,
                    r.LecInicial,
                    r.HoraFinal,
                    r.LecFinal,
                    r.LitrosTot,
                    r.Observaciones,
                    r.Cobranza,
                    r.ServiciosCom,
                    a.Matricula,
                    a.Equipo
                FROM remision r
                LEFT JOIN aeronave a ON r.Id_Aeronave = a.Id_Aeronave
                WHERE 1=1";
    
    $sql_count = "SELECT COUNT(*) as total 
                  FROM remision r
                  LEFT JOIN aeronave a ON r.Id_Aeronave = a.Id_Aeronave
                  WHERE 1=1";
    
    $params = [];
    $types = "";
    
    // Aplicar filtro de fecha
    if (!empty($fecha)) {
        $sql_base .= " AND DATE(r.Fecha) = ?";
        $sql_count .= " AND DATE(r.Fecha) = ?";
        $params[] = $fecha;
        $types .= "s";
    }
    
    // Aplicar filtro de matrícula
    if (!empty($matricula)) {
        $sql_base .= " AND a.Matricula LIKE ?";
        $sql_count .= " AND a.Matricula LIKE ?";
        $params[] = "%" . $matricula . "%";
        $types .= "s";
    }
    
    // Ordenar por fecha descendente
    $sql_base .= " ORDER BY r.Fecha DESC, r.Id_Remision DESC LIMIT ? OFFSET ?";
    
    // Obtener total de registros
    $stmt_count = $conn->prepare($sql_count);
    if (!$stmt_count) {
        throw new Exception('Error en consulta COUNT: ' . $conn->error);
    }
    
    if (!empty($params)) {
        $stmt_count->bind_param($types, ...$params);
    }
    
    $stmt_count->execute();
    $result_count = $stmt_count->get_result();
    $total_registros = $result_count->fetch_assoc()['total'];
    $stmt_count->close();
    
    // Obtener datos paginados
    $stmt = $conn->prepare($sql_base);
    if (!$stmt) {
        throw new Exception('Error en consulta principal: ' . $conn->error);
    }
    
    // Agregar parámetros de paginación
    $params_paginacion = $params;
    $types_paginacion = $types . "ii";
    $params_paginacion[] = $registros_por_pagina;
    $params_paginacion[] = $offset;
    
    if (!empty($params_paginacion)) {
        $stmt->bind_param($types_paginacion, ...$params_paginacion);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $remisiones = [];
    while ($row = $result->fetch_assoc()) {
        $remisiones[] = $row;
    }
    
    // Calcular paginación
    $total_paginas = ceil($total_registros / $registros_por_pagina);
    
    $response = [
        'success' => true,
        'remisiones' => $remisiones,
        'paginacion' => [
            'pagina_actual' => $pagina,
            'total_paginas' => $total_paginas,
            'total_registros' => $total_registros,
            'registros_por_pagina' => $registros_por_pagina
        ],
        'filtros' => [
            'fecha' => $fecha,
            'matricula' => $matricula
        ]
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'filtros' => [
            'fecha' => isset($fecha) ? $fecha : '',
            'matricula' => isset($matricula) ? $matricula : ''
        ]
    ]);
}
?>
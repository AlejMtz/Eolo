<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Configuración de la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "eolo";

try {
    // Crear conexión
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Verificar conexión
    if ($conn->connect_error) {
        throw new Exception('Error de conexión: ' . $conn->connect_error);
    }

    // Obtener parámetros de paginación
    $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $registros_por_pagina = isset($_GET['registros_por_pagina']) ? (int)$_GET['registros_por_pagina'] : 10;
    
    // Obtener parámetros de filtro
    $matricula = isset($_GET['matricula']) ? $conn->real_escape_string($_GET['matricula']) : '';
    $equipo = isset($_GET['equipo']) ? $conn->real_escape_string($_GET['equipo']) : '';
    
    // Validar parámetros
    if ($pagina < 1) $pagina = 1;
    if ($registros_por_pagina < 1) $registros_por_pagina = 10;

    // Calcular offset
    $offset = ($pagina - 1) * $registros_por_pagina;

    // Construir consulta base con filtros
    $sql_where = "WHERE 1=1";
    
    if (!empty($matricula)) {
        $sql_where .= " AND Matricula LIKE '%$matricula%'";
    }
    
    if (!empty($equipo)) {
        $sql_where .= " AND Equipo LIKE '%$equipo%'";
    }

    // Consulta para obtener el total de registros
    $sql_total = "SELECT COUNT(*) as total FROM aeronave $sql_where";
    $result_total = $conn->query($sql_total);
    
    if (!$result_total) {
        throw new Exception('Error en consulta total: ' . $conn->error);
    }
    
    $total_registros = $result_total->fetch_assoc()['total'];
    $total_paginas = ceil($total_registros / $registros_por_pagina);

    // Consulta para obtener aeronaves con paginación y filtros
    $sql = "SELECT Id_Aeronave, Matricula, Tipo, Equipo 
            FROM aeronave 
            $sql_where
            ORDER BY Id_Aeronave DESC 
            LIMIT ? OFFSET ?";
    
    // Preparar statement para prevenir SQL injection
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Error preparando consulta: ' . $conn->error);
    }
    
    $stmt->bind_param("ii", $registros_por_pagina, $offset);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }

    $aeronaves = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $aeronaves[] = $row;
        }
    }

    // DEBUG: Log para verificar filtros
    error_log("🔍 Filtros aplicados - Matrícula: '$matricula', Equipo: '$equipo'");
    error_log("📊 Resultados - Encontrados: $total_registros, Mostrando: " . count($aeronaves));

    // Devolver respuesta con estructura esperada por el frontend
    echo json_encode([
        'aeronaves' => $aeronaves,
        'paginacion' => [
            'pagina_actual' => $pagina,
            'total_paginas' => $total_paginas,
            'total_registros' => $total_registros,
            'registros_por_pagina' => $registros_por_pagina
        ],
        'filtros_aplicados' => [
            'matricula' => $matricula,
            'equipo' => $equipo
        ]
    ]);

    $stmt->close();

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

if (isset($conn) && $conn) {
    $conn->close();
}
?>
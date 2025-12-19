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

    $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $registros_por_pagina = isset($_GET['registros_por_pagina']) ? (int)$_GET['registros_por_pagina'] : 10;
    
    $matricula = isset($_GET['matricula']) ? $conn->real_escape_string($_GET['matricula']) : '';
    
    if ($pagina < 1) $pagina = 1;
    if ($registros_por_pagina < 1) $registros_por_pagina = 10;

    $offset = ($pagina - 1) * $registros_por_pagina;

   // Construir consulta base con filtros
    $sql_base = "FROM remision r
                 LEFT JOIN aeronave a ON r.Id_Aeronave = a.Id_Aeronave
                 WHERE 1=1";

    $sql_where = "";             
    
    if (!empty($matricula)) {
        $sql_where .= " AND a.Matricula LIKE '%$matricula%'";
    }

    // Consulta para obtener el total de registros
    $sql_total = "SELECT COUNT(*) as total FROM remision r
                 LEFT JOIN aeronave a ON r.Id_Aeronave = a.Id_Aeronave
                 WHERE 1=1 $sql_where";
    $result_total = $conn->query($sql_total);
    
    if (!$result_total) {
        throw new Exception('Error en consulta total: ' . $conn->error);
    }
    
    $total_registros = $result_total->fetch_assoc()['total'];
    $total_paginas = ceil($total_registros / $registros_por_pagina);

    /// Consulta SQL para obtener remisiones con paginación
    $sql = "SELECT 
                r.Fecha, 
                a.Matricula,
                a.Equipo,
                r.Id_Remision,
                r.LecInicial,
                r.LecFinal,
                r.LitrosTot
            " . $sql_base . " 
            ORDER BY r.Id_Remision DESC
            LIMIT ? OFFSET ?";
        
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ii", $registros_por_pagina, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    if (!$result) {
        throw new Exception('Error en consulta remisiones: ' . $conn->error);
    }
    $remisiones = [];
    while ($row = $result->fetch_assoc()) {
        $remisiones[] = $row;
    }   
    echo json_encode([
        'remisiones' => $remisiones,
        'total_paginas' => $total_paginas,
        'pagina_actual' => $pagina
    ]);

    $stmt->close();

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

if (isset($conn) && $conn) {
    $conn->close();
}
?>
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../../app/models/conexion.php';

try {
    $pagina = isset($_GET['pagina']) ? intval($_GET['pagina']) : 1;
    $registros_por_pagina = isset($_GET['registros_por_pagina']) ? intval($_GET['registros_por_pagina']) : 15;
    
    $pagina = max(1, $pagina);
    $registros_por_pagina = max(1, min(100, $registros_por_pagina));
    
    $offset = ($pagina - 1) * $registros_por_pagina;

    // Consulta para obtener el total de registros
    $sql_count = "SELECT COUNT(*) as total FROM entregaturno";
    $stmt_count = $pdo->query($sql_count);
    $total_registros = $stmt_count->fetch(PDO::FETCH_ASSOC)['total'];
    $total_paginas = ceil($total_registros / $registros_por_pagina);

    // Consulta para obtener entregas con paginación
    $sql = "SELECT * FROM entregaturno ORDER BY Fecha DESC, Id_EntregaTurno DESC LIMIT :limit OFFSET :offset";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $registros_por_pagina, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $entregas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'entregas' => $entregas,
        'paginacion' => [
            'pagina_actual' => $pagina,
            'total_paginas' => $total_paginas,
            'total_registros' => $total_registros,
            'registros_por_pagina' => $registros_por_pagina
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al cargar las entregas: ' . $e->getMessage()]);
}
?>
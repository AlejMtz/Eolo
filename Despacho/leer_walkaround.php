<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../conexion.php';

try {
    // Obtener parámetros de paginación
    $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $registros_por_pagina = isset($_GET['registros_por_pagina']) ? (int)$_GET['registros_por_pagina'] : 15;
    
    // Calcular el offset
    $offset = ($pagina - 1) * $registros_por_pagina;
    
    // Consulta para obtener el total de registros
    $sql_total = "SELECT COUNT(*) as total FROM walkaround";
    $stmt_total = $pdo->prepare($sql_total);
    $stmt_total->execute();
    $total_registros = $stmt_total->fetch(PDO::FETCH_ASSOC)['total'];
    $total_paginas = ceil($total_registros / $registros_por_pagina);
    
    // Consulta SQL para obtener walkarounds con paginación
    $sql = "SELECT w.Id_Walk, w.Fechahora, w.Elaboro, w.Responsable, w.JefeArea, w.VoBo, w.observaciones,
                   w.Procedencia, w.Destino, w.Id_Aeronave, a.Matricula, a.Tipo, a.Equipo
            FROM walkaround w
            LEFT JOIN aeronave a ON w.Id_Aeronave = a.Id_Aeronave
            ORDER BY w.Fechahora DESC
            LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $registros_por_pagina, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $walkarounds = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'walkarounds' => $walkarounds,
        'paginacion' => [
            'pagina_actual' => $pagina,
            'total_paginas' => $total_paginas,
            'total_registros' => $total_registros,
            'registros_por_pagina' => $registros_por_pagina
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>
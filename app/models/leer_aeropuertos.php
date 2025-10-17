<?php
// app/models/leer_aeropuertos.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../../app/models/conexion.php';

// Parámetros de paginación - CAMBIADO A 10 REGISTROS
$pagina = isset($_GET['pagina']) ? intval($_GET['pagina']) : 1;
$registros_por_pagina = isset($_GET['registros_por_pagina']) ? intval($_GET['registros_por_pagina']) : 10;

// Validar parámetros
if ($pagina < 1) $pagina = 1;
if ($registros_por_pagina < 1) $registros_por_pagina = 10;

$offset = ($pagina - 1) * $registros_por_pagina;

try {
    // Contar total de registros
    $sql_count = "SELECT COUNT(*) as total FROM aeropuertos";
    $stmt_count = $pdo->query($sql_count);
    $total_registros = $stmt_count->fetch(PDO::FETCH_ASSOC)['total'];
    $total_paginas = ceil($total_registros / $registros_por_pagina);

    // Obtener aeropuertos con paginación - ORDENADO POR ID ASCENDENTE
    $sql = "SELECT * FROM aeropuertos ORDER BY Id_Aeropuerto ASC LIMIT :limit OFFSET :offset"; // CAMBIADO: Id_Aeropuerto ASC
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $registros_por_pagina, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $aeropuertos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'aeropuertos' => $aeropuertos,
        'paginacion' => [
            'pagina_actual' => $pagina,
            'registros_por_pagina' => $registros_por_pagina,
            'total_registros' => (int)$total_registros,
            'total_paginas' => (int)$total_paginas
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
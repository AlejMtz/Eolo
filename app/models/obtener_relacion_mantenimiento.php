<?php
require_once('conexion.php');

header('Content-Type: application/json; charset=utf-8');

try {
    // Validar parámetros
    if (!isset($_GET['fecha_inicio']) || !isset($_GET['fecha_fin'])) {
        throw new Exception("Fechas de inicio y fin son requeridas");
    }

    $fecha_inicio = $_GET['fecha_inicio'];
    $fecha_fin = $_GET['fecha_fin'];

    // Validar formato de fechas
    if (!strtotime($fecha_inicio) || !strtotime($fecha_fin)) {
        throw new Exception("Formato de fecha inválido");
    }

    if ($fecha_inicio > $fecha_fin) {
        throw new Exception("La fecha de inicio no puede ser mayor que la fecha de fin");
    }

    // Obtener datos de mantenimiento agrupados
    $sql = "SELECT 
                a.Matricula,
                a.Equipo,
                am.Tipo_Cliente,
                am.Tipo_Mantenimiento,
                COUNT(*) as Total_Registros,
                MAX(am.Fecha) as Fecha_Ultimo_Registro
            FROM asignacion_mantenimiento am
            INNER JOIN aeronave a ON am.Id_Aeronave = a.Id_Aeronave
            WHERE am.Fecha BETWEEN ? AND ?
            AND am.Estado_Registro = 'activo'
            GROUP BY a.Matricula, a.Equipo, am.Tipo_Cliente, am.Tipo_Mantenimiento
            ORDER BY a.Matricula, Fecha_Ultimo_Registro DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$fecha_inicio, $fecha_fin]);
    $mantenimientos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Contar total de registros
    $total_registros = 0;
    foreach ($mantenimientos as $mantenimiento) {
        $total_registros += $mantenimiento['Total_Registros'];
    }

    echo json_encode([
        'success' => true,
        'fecha_inicio' => $fecha_inicio,
        'fecha_fin' => $fecha_fin,
        'total_registros' => $total_registros,
        'mantenimientos' => $mantenimientos
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
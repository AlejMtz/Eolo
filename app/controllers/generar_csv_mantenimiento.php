<?php
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="calendario_mantenimiento_' . date('Y-m-d') . '.csv"');

require '../models/conexion.php';

try {
    if (!isset($_GET['fecha_inicio']) || !isset($_GET['fecha_fin'])) {
        throw new Exception("Fechas de inicio y fin son requeridas");
    }

    $fecha_inicio = $_GET['fecha_inicio'];
    $fecha_fin = $_GET['fecha_fin'];

    // Validar fechas
    if (!strtotime($fecha_inicio) || !strtotime($fecha_fin)) {
        throw new Exception("Formato de fecha inválido");
    }

    if ($fecha_inicio > $fecha_fin) {
        throw new Exception("La fecha de inicio no puede ser mayor que la fecha de fin");
    }

    // Obtener todas las aeronaves únicas con sus datos
    $sql_aeronaves = "SELECT DISTINCT 
                        a.Id_Aeronave,
                        a.Matricula,
                        a.Equipo,
                        a.Tipo as Tipo_Aeronave
                    FROM aeronave a
                    INNER JOIN asignacion_mantenimiento am ON a.Id_Aeronave = am.Id_Aeronave
                    WHERE am.Fecha BETWEEN ? AND ?
                    AND am.Estado_Registro = 'activo'
                    ORDER BY a.Matricula";

    $stmt_aeronaves = $pdo->prepare($sql_aeronaves);
    $stmt_aeronaves->execute([$fecha_inicio, $fecha_fin]);
    $aeronaves = $stmt_aeronaves->fetchAll(PDO::FETCH_ASSOC);

    // Obtener todos los mantenimientos en el período
    $sql_mantenimientos = "SELECT 
                            a.Matricula,
                            am.Fecha,
                            am.Tipo_Mantenimiento,
                            am.Tipo_Cliente
                        FROM asignacion_mantenimiento am
                        INNER JOIN aeronave a ON am.Id_Aeronave = a.Id_Aeronave
                        WHERE am.Fecha BETWEEN ? AND ?
                        AND am.Estado_Registro = 'activo'
                        ORDER BY am.Fecha";

    $stmt_mantenimientos = $pdo->prepare($sql_mantenimientos);
    $stmt_mantenimientos->execute([$fecha_inicio, $fecha_fin]);
    $mantenimientos = $stmt_mantenimientos->fetchAll(PDO::FETCH_ASSOC);

    // Crear array de fechas del período
    $fechas = [];
    $fecha_actual = new DateTime($fecha_inicio);
    $fecha_fin_obj = new DateTime($fecha_fin);
    
    while ($fecha_actual <= $fecha_fin_obj) {
        $fechas[] = $fecha_actual->format('Y-m-d');
        $fecha_actual->modify('+1 day');
    }

    // Organizar mantenimientos por matrícula y fecha
    $mantenimientos_por_aeronave = [];
    foreach ($mantenimientos as $mant) {
        $matricula = $mant['Matricula'];
        $fecha = $mant['Fecha'];
        $tipo_mantenimiento = $mant['Tipo_Mantenimiento'];
        
        if (!isset($mantenimientos_por_aeronave[$matricula])) {
            $mantenimientos_por_aeronave[$matricula] = [];
        }
        
        $mantenimientos_por_aeronave[$matricula][$fecha] = $tipo_mantenimiento;
    }

    // Crear archivo CSV de salida
    $output = fopen('php://output', 'w');
    fputs($output, $bom = (chr(0xEF) . chr(0xBB) . chr(0xBF)));

    // ========== ENCABEZADO ==========
    fputcsv($output, ['EOLO - CALENDARIO DE MANTENIMIENTO']);
    fputcsv($output, ['Período:', date('d/m/Y', strtotime($fecha_inicio)) . ' al ' . date('d/m/Y', strtotime($fecha_fin))]);
    fputcsv($output, ['Fecha generación:', date('d/m/Y H:i')]);
    fputcsv($output, []); // Línea vacía

    // ========== CABECERA DE FECHAS ==========
    $cabecera = ['MATRÍCULA', 'EQUIPO', 'TIPO AERONAVE', 'TIPO CLIENTE'];
    
    // Agregar días del período como columnas
    foreach ($fechas as $fecha) {
        $cabecera[] = date('d/m', strtotime($fecha));
    }
    
    // Agregar totales
    $cabecera[] = 'TOTAL MANT. 0';
    $cabecera[] = 'TOTAL MANT. 1';
    $cabecera[] = 'TOTAL GENERAL';
    
    fputcsv($output, $cabecera);

    // ========== DATOS POR AERONAVE ==========
    foreach ($aeronaves as $aeronave) {
        $matricula = $aeronave['Matricula'];
        
        // Obtener el tipo de cliente (tomamos el más reciente)
        $sql_cliente = "SELECT Tipo_Cliente 
                       FROM asignacion_mantenimiento 
                       WHERE Id_Aeronave = ? 
                       AND Fecha BETWEEN ? AND ?
                       ORDER BY Fecha DESC, Hora DESC 
                       LIMIT 1";
        
        $stmt_cliente = $pdo->prepare($sql_cliente);
        $stmt_cliente->execute([$aeronave['Id_Aeronave'], $fecha_inicio, $fecha_fin]);
        $cliente_data = $stmt_cliente->fetch(PDO::FETCH_ASSOC);
        $tipo_cliente = $cliente_data ? $cliente_data['Tipo_Cliente'] : 'N/E';

        // Iniciar fila
        $fila = [
            $aeronave['Matricula'],
            $aeronave['Equipo'],
            $aeronave['Tipo_Aeronave'],
            $tipo_cliente
        ];

        $total_mant_0 = 0;
        $total_mant_1 = 0;

        // Agregar datos por día
        foreach ($fechas as $fecha) {
            if (isset($mantenimientos_por_aeronave[$matricula][$fecha])) {
                $tipo_mant = $mantenimientos_por_aeronave[$matricula][$fecha];
                $fila[] = $tipo_mant; // 0 o 1
                
                if ($tipo_mant === '0') $total_mant_0++;
                if ($tipo_mant === '1') $total_mant_1++;
            } else {
                $fila[] = ''; // Día sin mantenimiento
            }
        }

        // Agregar totales
        $fila[] = $total_mant_0;
        $fila[] = $total_mant_1;
        $fila[] = $total_mant_0 + $total_mant_1;

        fputcsv($output, $fila);
    }
    
    // ========== LEYENDA ==========
    fputcsv($output, []); // Línea vacía
    fputcsv($output, ['LEYENDA:']);
    fputcsv($output, ['0 = Mantenimiento 0']);
    fputcsv($output, ['1 = Mantenimiento 1']);
    fclose($output);
    
} catch (Exception $e) {
    header('Content-Type: text/plain; charset=utf-8');
    echo "Error al generar el CSV: " . $e->getMessage();
}
?>
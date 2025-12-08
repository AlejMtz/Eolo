<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require 'conexion.php';

function obtenerEmpresaProcedencia($pdo, $id_aeronave, $fecha_inicio, $fecha_fin) {
    try {
        // Obtener de control_pernocta
        $sql_control = "SELECT EmpresaProcedencia 
                       FROM control_pernocta 
                       WHERE Id_Aeronave = ? 
                       AND Fecha BETWEEN ? AND ?
                       AND EmpresaProcedencia IS NOT NULL 
                       AND EmpresaProcedencia != ''
                       ORDER BY Fecha DESC 
                       LIMIT 1";
        
        $stmt_control = $pdo->prepare($sql_control);
        $stmt_control->execute([$id_aeronave, $fecha_inicio, $fecha_fin]);
        $control_result = $stmt_control->fetch(PDO::FETCH_ASSOC);
        
        if ($control_result && !empty($control_result['EmpresaProcedencia'])) {
            return $control_result['EmpresaProcedencia'];
        }
        
        return 'No especificada';
        
    } catch (Exception $e) {
        return 'No disponible';
    }
}

try {
    $fecha_inicio = isset($_GET['fecha_inicio']) ? $_GET['fecha_inicio'] : null;
    $fecha_fin = isset($_GET['fecha_fin']) ? $_GET['fecha_fin'] : null;
    
    if (!$fecha_inicio || !$fecha_fin) {
        throw new Exception('Fechas de inicio y fin son requeridas');
    }
    
    if (!strtotime($fecha_inicio) || !strtotime($fecha_fin)) {
        throw new Exception('Formato de fecha inválido');
    }
    
    if ($fecha_inicio > $fecha_fin) {
        throw new Exception('La fecha de inicio no puede ser mayor que la fecha de fin');
    }
    
    // Calcular total de días en el período
    $fecha_inicio_obj = new DateTime($fecha_inicio);
    $fecha_fin_obj = new DateTime($fecha_fin);
    $total_dias_periodo = $fecha_fin_obj->diff($fecha_inicio_obj)->days + 1;
    
    //  Obtener solo aeronaves que tuvieron registros en CONTROL_PERNOCTA
    $sql_aeronaves_con_movimientos = "
        SELECT DISTINCT a.Id_Aeronave, a.Matricula, a.Equipo 
        FROM aeronave a 
        INNER JOIN control_pernocta cp ON a.Id_Aeronave = cp.Id_Aeronave 
        WHERE cp.Fecha BETWEEN ? AND ?
        AND cp.Estado_Registro = 'activo'
        ORDER BY a.Matricula
    ";
    
    $stmt_aeronaves = $pdo->prepare($sql_aeronaves_con_movimientos);
    $stmt_aeronaves->execute([$fecha_inicio, $fecha_fin]);
    $aeronaves_con_movimientos = $stmt_aeronaves->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($aeronaves_con_movimientos)) {
        echo json_encode([
            'success' => true,
            'fecha_inicio' => $fecha_inicio,
            'fecha_fin' => $fecha_fin,
            'total_dias_periodo' => $total_dias_periodo,
            'aeronaves' => [],
            'total_aeronaves' => 0,
            'message' => 'No se encontraron aeronaves con registros en control de pernoctas para el período seleccionado'
        ]);
        exit;
    }
    
    $resultados = [];
    
   foreach ($aeronaves_con_movimientos as $aeronave) {
    $id_aeronave = $aeronave['Id_Aeronave'];
    $cadena_dias = '';
    $cadena_hangares = ''; 
    $total_dias_hangar = 0;
    $total_dias_fuera = 0;
    
    // Para cada día del período, determinar si la aeronave estaba en hangar o fuera
    $fecha_actual = new DateTime($fecha_inicio);
    $contador_dias = 0;
    
    while ($fecha_actual <= $fecha_fin_obj && $contador_dias < 62) {
        $fecha_str = $fecha_actual->format('Y-m-d');
        
        $sql_movimiento = "
            SELECT Hangar, Estado_Registro 
            FROM control_pernocta 
            WHERE Id_Aeronave = ? AND Fecha = ? 
            AND Estado_Registro = 'activo'
            ORDER BY Id_Control DESC 
            LIMIT 1
        ";
        
        $stmt_movimiento = $pdo->prepare($sql_movimiento);
        $stmt_movimiento->execute([$id_aeronave, $fecha_str]);
        $registro_control = $stmt_movimiento->fetch(PDO::FETCH_ASSOC);
        
        if ($registro_control) {
            if ($registro_control['Hangar'] && in_array($registro_control['Hangar'], ['H1', 'H2'])) {
                $cadena_dias .= 'H';
                $cadena_hangares .= $registro_control['Hangar']; //H1 o H2
                $total_dias_hangar++;
            } else {
                $cadena_dias .= 'F';
                $cadena_hangares .= 'F ';
                $total_dias_fuera++;
            }
        } else {
            $cadena_dias .= 'F';
            $cadena_hangares .= 'F ';
            $total_dias_fuera++;
        }
        
        $fecha_actual->modify('+1 day');
        $contador_dias++;
    }
    
    $empresa = obtenerEmpresaProcedencia($pdo, $id_aeronave, $fecha_inicio, $fecha_fin);
    
    $resultados[] = [
        'id_aeronave' => $id_aeronave,
        'matricula' => $aeronave['Matricula'],
        'equipo' => $aeronave['Equipo'],
        'empresa' => $empresa,
        'dias' => $cadena_dias,
        'hangares' => $cadena_hangares, 
        'total_dias_hangar' => $total_dias_hangar,
        'total_dias_fuera' => $total_dias_fuera,
        'total_dias' => $total_dias_hangar + $total_dias_fuera
    ];
}
    
    echo json_encode([
        'success' => true,
        'fecha_inicio' => $fecha_inicio,
        'fecha_fin' => $fecha_fin,
        'total_dias_periodo' => $total_dias_periodo,
        'aeronaves' => $resultados,
        'total_aeronaves' => count($resultados),
        'message' => 'Relación generada correctamente con aeronaves del control de pernoctas'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
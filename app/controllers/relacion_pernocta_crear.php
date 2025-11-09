<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

$response = ['success' => false, 'message' => 'Error desconocido'];

try {
    $mes = isset($_POST['mes']) ? intval($_POST['mes']) : date('n');
    $anio = isset($_POST['anio']) ? intval($_POST['anio']) : date('Y');

    // Validar mes y año
    if ($mes < 1 || $mes > 12) {
        throw new Exception("Mes no válido");
    }
    if ($anio < 2020 || $anio > 2030) {
        throw new Exception("Año no válido");
    }

    // Obtener aeronaves que tienen registros en el mes
    $sql_aeronaves = "SELECT DISTINCT a.Id_Aeronave, a.Matricula 
                     FROM aeronave a 
                     INNER JOIN pernocta_diaria pd ON a.Id_Aeronave = pd.Id_Aeronave 
                     WHERE YEAR(pd.Fecha) = ? AND MONTH(pd.Fecha) = ?";
    $stmt_aeronaves = $pdo->prepare($sql_aeronaves);
    $stmt_aeronaves->execute([$anio, $mes]);
    $aeronaves = $stmt_aeronaves->fetchAll(PDO::FETCH_ASSOC);

    $pdo->beginTransaction();

    foreach ($aeronaves as $aeronave) {
        $dias_array = array_fill(0, 31, 'F'); // Inicializar todos los días como 'F' (Fuera)
        $total_hangar = 0;
        $total_fuera = 0;

        // Obtener control de pernoctas para cada día del mes
        for ($dia = 1; $dia <= 31; $dia++) {
            $fecha = sprintf('%04d-%02d-%02d', $anio, $mes, $dia);
            
            // Verificar si la fecha es válida
            if (!checkdate($mes, $dia, $anio)) {
                $dias_array[$dia-1] = ''; // Día no válido (meses con menos de 31 días)
                continue;
            }

            $sql_control = "SELECT Estado FROM control_pernocta WHERE Id_Aeronave = ? AND Fecha = ?";
            $stmt_control = $pdo->prepare($sql_control);
            $stmt_control->execute([$aeronave['Id_Aeronave'], $fecha]);
            
            if ($stmt_control->rowCount() > 0) {
                $control = $stmt_control->fetch(PDO::FETCH_ASSOC);
                $dias_array[$dia-1] = ($control['Estado'] == 'en_hangar') ? 'H' : 'F';
                
                if ($control['Estado'] == 'en_hangar') {
                    $total_hangar++;
                } else {
                    $total_fuera++;
                }
            }
        }

        $dias_cadena = implode('', $dias_array);

        // Insertar o actualizar relación mensual
        $sql_relacion = "INSERT INTO relacion_pernocta_mensual (Mes, Anio, Id_Aeronave, Dias, Total_Dias_Hangar, Total_Dias_Fuera) 
                         VALUES (?, ?, ?, ?, ?, ?)
                         ON DUPLICATE KEY UPDATE 
                         Dias = VALUES(Dias), 
                         Total_Dias_Hangar = VALUES(Total_Dias_Hangar), 
                         Total_Dias_Fuera = VALUES(Total_Dias_Fuera)";
        
        $stmt_relacion = $pdo->prepare($sql_relacion);
        $stmt_relacion->execute([$mes, $anio, $aeronave['Id_Aeronave'], $dias_cadena, $total_hangar, $total_fuera]);
    }

    $pdo->commit();

    $response = [
        'success' => true,
        'message' => "Relación mensual generada correctamente para $mes/$anio",
        'total_aeronaves' => count($aeronaves)
    ];

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $response = ['success' => false, 'message' => $e->getMessage()];
}

echo json_encode($response);
?>
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

    // Obtener parámetros - IMPORTANTE: Usar la fecha del control que queremos
    $fecha_control = isset($_GET['fecha_control']) ? $_GET['fecha_control'] : date('Y-m-d');

    // ✅ CONSULTA PARA CONTROL DIARIO - Solo excluye aeronaves del control de HOY
    $sql = "
        SELECT 
            a.Id_Aeronave, 
            a.Matricula, 
            a.Tipo, 
            a.Equipo,
            ultima.Fecha as Ultima_Fecha_Entrada,
            ultima.Hora as Ultima_Hora_Entrada,
            ultima.Id_Pernocta as Id_Ultimo_Registro
        FROM aeronave a
        INNER JOIN (
            -- Último movimiento de cada aeronave
            SELECT 
                pd1.Id_Aeronave,
                pd1.Fecha,
                pd1.Hora, 
                pd1.Id_Pernocta,
                pd1.Tipo_Movimiento
            FROM pernocta_diaria pd1
            INNER JOIN (
                SELECT 
                    Id_Aeronave, 
                    MAX(CONCAT(Fecha, ' ', Hora)) as MaxFechaHora
                FROM pernocta_diaria 
                GROUP BY Id_Aeronave
            ) pd2 ON pd1.Id_Aeronave = pd2.Id_Aeronave 
                   AND CONCAT(pd1.Fecha, ' ', pd1.Hora) = pd2.MaxFechaHora
        ) ultima ON a.Id_Aeronave = ultima.Id_Aeronave
        WHERE ultima.Tipo_Movimiento = 'entrada'  -- Solo aeronaves cuyo último movimiento fue ENTRADA
        AND a.Id_Aeronave NOT IN (
            -- ✅ SOLO EXCLUIR AERONAVES DEL CONTROL DE HOY
            SELECT cp.Id_Aeronave 
            FROM control_pernocta cp 
            WHERE DATE(cp.Fecha) = ?  -- Solo excluir del control de la fecha específica
        )
        ORDER BY a.Matricula
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $fecha_control);
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
    
    echo json_encode([
        'success' => true,
        'aeronaves' => $aeronaves,
        'total' => count($aeronaves),
        'fecha_consulta' => $fecha_control,
        'nota' => 'Muestra aeronaves en hangar que NO están en el control de la fecha: ' . $fecha_control
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

if (isset($conn) && $conn) {
    $conn->close();
}
?>
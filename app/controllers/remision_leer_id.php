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

    // Obtener ID de la remisión
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($id === 0) {
        throw new Exception('ID no válido');
    }

    // Consulta SQL para obtener la remisión por ID
    $sql = "SELECT 
                r.Id_Remision,
                r.Ov,
                r.Operador,
                DATE_FORMAT(r.Fecha, '%Y-%m-%d') as Fecha,
                r.Cliente,
                r.Requision,
                r.FormaPago as pago,
                r.Id_Aeronave,
                r.HoraLlegada,
                r.HoraInicial,
                r.LecInicial,
                r.HoraFinal,
                r.LecFinal,
                r.LitrosTot,
                r.Observaciones,
                r.Cobranza,
                r.ServiciosCom,
                a.Matricula,
                a.Equipo
            FROM remision r
            LEFT JOIN aeronave a ON r.Id_Aeronave = a.Id_Aeronave
            WHERE r.Id_Remision = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }
    
    $remision = $result->fetch_assoc();
    
    if (!$remision) {
        throw new Exception('Remisión no encontrada.');
    }
    
    // Formatear horas
    $remision['HoraLlegada'] = substr($remision['HoraLlegada'], 0, 5);
    $remision['HoraInicial'] = substr($remision['HoraInicial'], 0, 5);
    $remision['HoraFinal'] = substr($remision['HoraFinal'], 0, 5);
    
    // Preparar respuesta
    $response = array(
        'Id_Remision' => isset($remision['Id_Remision']) ? $remision['Id_Remision'] : null,
        'Ov' => isset($remision['Ov']) ? $remision['Ov'] : null,
        'Operador' => isset($remision['Operador']) ? $remision['Operador'] : null,
        'Fecha' => isset($remision['Fecha']) ? $remision['Fecha'] : null,
        'Cliente' => isset($remision['Cliente']) ? $remision['Cliente'] : null,
        'Requision' => isset($remision['Requision']) ? $remision['Requision'] : null,
        'FormaPago' => isset($remision['pago']) ? $remision['pago'] : null,
        'Id_Aeronave' => isset($remision['Id_Aeronave']) ? $remision['Id_Aeronave'] : null,
        'Matricula' => isset($remision['Matricula']) ? $remision['Matricula'] : null,
        'Equipo' => isset($remision['Equipo']) ? $remision['Equipo'] : null,
        'HoraLlegada' => isset($remision['HoraLlegada']) ? $remision['HoraLlegada'] : null,
        'HoraInicial' => isset($remision['HoraInicial']) ? $remision['HoraInicial'] : null,
        'LecInicial' => isset($remision['LecInicial']) ? $remision['LecInicial'] : null,
        'HoraFinal' => isset($remision['HoraFinal']) ? $remision['HoraFinal'] : null,
        'LecFinal' => isset($remision['LecFinal']) ? $remision['LecFinal'] : null,
        'LitrosTot' => isset($remision['LitrosTot']) ? $remision['LitrosTot'] : null,
        'Observaciones' => isset($remision['Observaciones']) ? $remision['Observaciones'] : null,
        'Cobranza' => isset($remision['Cobranza']) ? $remision['Cobranza'] : null,
        'ServiciosCom' => isset($remision['ServiciosCom']) ? $remision['ServiciosCom'] : null,
        'success' => true
    );

    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
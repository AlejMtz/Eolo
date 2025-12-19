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

    // Consulta SQL corregida
    $sql = "SELECT 
                r.*,
                a.Matricula,
                a.Equipo,
                a.Tipo
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
    
    // Formatear horas (asegurarse que no sean null)
    if (isset($remision['HoraLlegada'])) {
        $remision['HoraLlegada'] = substr($remision['HoraLlegada'], 0, 5);
    }
    if (isset($remision['HoraInicial'])) {
        $remision['HoraInicial'] = substr($remision['HoraInicial'], 0, 5);
    }
    if (isset($remision['HoraFinal'])) {
        $remision['HoraFinal'] = substr($remision['HoraFinal'], 0, 5);
    }
    
    // Asegurarse de que FormaPago esté presente como 'pago' también
    if (isset($remision['FormaPago'])) {
        $remision['pago'] = $remision['FormaPago'];
    }
    
    // Preparar respuesta en el formato esperado por JavaScript
    $response = array(
        'success' => true,
        'remision' => $remision  // Esto es lo más importante
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
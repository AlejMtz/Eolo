<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Configuración de la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "eolo";

$response = ['success' => false, 'error' => 'Error desconocido'];

// Verificar si se recibió el ID
if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID de walkaround no proporcionado.']);
    exit;
}

$id_walk = intval($_GET['id']);

try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Verificar conexión
    if ($conn->connect_error) {
        throw new Exception('Error de conexión a la base de datos: ' . $conn->connect_error);
    }

    // Consulta para obtener los datos generales del walkaround
    $sql = "SELECT w.*, a.Tipo, a.Matricula, a.Equipo, a.Procedencia 
            FROM walkaround w 
            JOIN aeronave a ON w.Id_Aeronave = a.Id_Aeronave 
            WHERE w.Id_Walk = ?";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar consulta: " . $conn->error);
    }
    
    $stmt->bind_param("i", $id_walk);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Walkaround no encontrado.']);
        exit;
    }

    $walkaround_data = $result->fetch_assoc();
    $stmt->close();

    // Consulta para obtener los componentes
    $sql_componentes = "SELECT Identificador_Componente, Estado, Observaciones, Id_Aeronave, Id_Evidencia 
                       FROM componentewk 
                       WHERE Id_Walk = ?";
    
    $stmt_componentes = $conn->prepare($sql_componentes);
    if (!$stmt_componentes) {
        throw new Exception("Error al preparar consulta de componentes: " . $conn->error);
    }
    
    $stmt_componentes->bind_param("i", $id_walk);
    $stmt_componentes->execute();
    $result_componentes = $stmt_componentes->get_result();

    $componentes = [];
    while ($row = $result_componentes->fetch_assoc()) {
        $componentes[] = [
            'Componente' => $row['Identificador_Componente'],
            'Estado' => $row['Estado'],
            'Observaciones' => $row['Observaciones'],
            'Id_Evidencia' => $row['Id_Evidencia']
        ];
    }
    $stmt_componentes->close();

    // Consulta para obtener las evidencias (SIN FechaSubida)
    $sql_evidencias = "SELECT Id_Evidencia, Ruta, FileName 
                      FROM evidencias 
                      WHERE Id_Wk = ?";
    
    $stmt_evidencias = $conn->prepare($sql_evidencias);
    if (!$stmt_evidencias) {
        throw new Exception("Error al preparar consulta de evidencias: " . $conn->error);
    }
    
    $stmt_evidencias->bind_param("i", $id_walk);
    $stmt_evidencias->execute();
    $result_evidencias = $stmt_evidencias->get_result();

    $evidencias = [];
    while ($row = $result_evidencias->fetch_assoc()) {
        $evidencias[] = [
            'Id_Evidencia' => $row['Id_Evidencia'],
            'Ruta' => $row['Ruta'],
            'FileName' => $row['FileName']
        ];
    }
    $stmt_evidencias->close();

    // Agregar la lista de componentes y evidencias al array de respuesta
    $walkaround_data['componentes'] = $componentes;
    $walkaround_data['evidencias'] = $evidencias;
    $walkaround_data['success'] = true;

    // Éxito - devolver datos
    echo json_encode($walkaround_data);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Configuración de la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "eolo";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die(json_encode(['error' => 'Error de conexión: ' . $conn->connect_error]));
}

// Obtener ID del walkaround
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id === 0) {
    echo json_encode(['error' => 'ID no válido']);
    exit;
}

try {
    // Consulta para obtener datos del walkaround
    $sql_walkaround = "SELECT w.*, a.Matricula, a.Equipo, a.Tipo 
                      FROM walkaround w 
                      LEFT JOIN aeronave a ON w.Id_Aeronave = a.Id_Aeronave 
                      WHERE w.Id_Walk = ?";
    
    $stmt = $conn->prepare($sql_walkaround);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['error' => 'Walkaround no encontrado']);
        exit;
    }
    
    $walkaround = $result->fetch_assoc();
    $stmt->close();
    
    // ⭐⭐ CORRECCIÓN: Usar el nombre EXACTO del campo de la BD - FechaHora con H mayúscula
    $fechahora = isset($walkaround['FechaHora']) ? $walkaround['FechaHora'] : null;
    
    // DEBUG: Verificar que estamos obteniendo el campo correcto
    error_log("🔍 Campo FechaHora en BD: " . $walkaround['FechaHora']);
    error_log("🔍 Campo Fechahora en BD: " . ($walkaround['Fechahora'] ?? 'NO EXISTE'));
    
    // Consulta para obtener componentes
    $sql_componentes = "SELECT 
                        Identificador_Componente,
                        derecho, izquierdo, golpe, rayon, fisura, quebrado, pinturaCuarteada, otroDano
                        FROM componentewk 
                        WHERE Id_Walk = ?";
    
    $stmt_componentes = $conn->prepare($sql_componentes);
    $stmt_componentes->bind_param("i", $id);
    $stmt_componentes->execute();
    $result_componentes = $stmt_componentes->get_result();
    
    $componentes = [];
    while ($row = $result_componentes->fetch_assoc()) {
        $componentes[] = $row;
    }
    $stmt_componentes->close();
    
    // Consulta para obtener evidencias
    $sql_evidencias = "SELECT Id_Evidencia, Ruta, FileName 
                       FROM evidencias 
                       WHERE Id_Wk = ?";
    
    $stmt_evidencias = $conn->prepare($sql_evidencias);
    $stmt_evidencias->bind_param("i", $id);
    $stmt_evidencias->execute();
    $result_evidencias = $stmt_evidencias->get_result();
    
    $evidencias = [];
    while ($row = $result_evidencias->fetch_assoc()) {
        $evidencias[] = $row;
    }
    $stmt_evidencias->close();
    
    // ⭐⭐ CORRECCIÓN: Mantener consistencia - usar Fechahora (h minúscula) en JSON para que coincida con walkaround.js
    $response = array(
        'Id_Walk' => isset($walkaround['Id_Walk']) ? $walkaround['Id_Walk'] : null,
        'Fechahora' => $fechahora,  // ✅ JSON usa 'h' minúscula para coincidir con JavaScript
        'Id_Aeronave' => isset($walkaround['Id_Aeronave']) ? $walkaround['Id_Aeronave'] : null,
        'Matricula' => isset($walkaround['Matricula']) ? $walkaround['Matricula'] : null,
        'Equipo' => isset($walkaround['Equipo']) ? $walkaround['Equipo'] : null,
        'Tipo' => isset($walkaround['Tipo']) ? $walkaround['Tipo'] : null,
        'Elaboro' => isset($walkaround['Elaboro']) ? $walkaround['Elaboro'] : null,
        'Responsable' => isset($walkaround['Responsable']) ? $walkaround['Responsable'] : null,
        'JefeArea' => isset($walkaround['JefeArea']) ? $walkaround['JefeArea'] : null,
        'VoBo' => isset($walkaround['VoBo']) ? $walkaround['VoBo'] : null,
        'observaciones' => isset($walkaround['observaciones']) ? $walkaround['observaciones'] : null,
        'Procedencia' => isset($walkaround['Procedencia']) ? $walkaround['Procedencia'] : null,
        'Destino' => isset($walkaround['Destino']) ? $walkaround['Destino'] : null,
        'entrada' => isset($walkaround['entrada']) ? $walkaround['entrada'] : 0,
        'salida' => isset($walkaround['salida']) ? $walkaround['salida'] : 0,
        'componentes' => $componentes,
        'evidencias' => $evidencias
    );
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
}

$conn->close();
?>
<?php
// app/controllers/aeropuerto_actualizar.php
session_start();
require '../../app/models/conexion.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

try {
    // Obtener datos del cuerpo de la petición
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON inválido: ' . json_last_error_msg());
    }
    
    // Validar ID y campos requeridos
    if (empty($data['Id_Aeropuerto'])) {
        echo json_encode(['success' => false, 'error' => 'ID de aeropuerto requerido']);
        exit;
    }

    $required_fields = ['Codigo_IATA', 'Codigo_OACI', 'Nombre', 'Estado', 'Municipio'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            echo json_encode(['success' => false, 'error' => "El campo $field es requerido"]);
            exit;
        }
    }

    // Validar longitud de códigos
    if (strlen($data['Codigo_IATA']) !== 3) {
        echo json_encode(['success' => false, 'error' => 'El código IATA debe tener exactamente 3 caracteres']);
        exit;
    }

    if (strlen($data['Codigo_OACI']) !== 4) {
        echo json_encode(['success' => false, 'error' => 'El código OACI debe tener exactamente 4 caracteres']);
        exit;
    }

    // Actualizar aeropuerto
    $sql = "UPDATE aeropuertos 
            SET Codigo_IATA = ?, Codigo_OACI = ?, Nombre = ?, Estado = ?, Municipio = ?
            WHERE Id_Aeropuerto = ?";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        strtoupper(trim($data['Codigo_IATA'])),
        strtoupper(trim($data['Codigo_OACI'])),
        trim($data['Nombre']),
        trim($data['Estado']),
        trim($data['Municipio']),
        $data['Id_Aeropuerto']
    ]);

    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Aeropuerto actualizado exitosamente'
        ]);
    } else {
        throw new Exception('Error al actualizar en la base de datos');
    }

} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
        echo json_encode(['success' => false, 'error' => 'El código IATA u OACI ya existe']);
    } else {
        error_log("Error en aeropuerto_actualizar.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
    }
}
?>
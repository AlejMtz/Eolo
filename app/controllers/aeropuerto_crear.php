<?php
// app/controllers/aeropuerto_crear.php
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
    
    // Validar campos requeridos
    $required_fields = ['Codigo_IATA', 'Codigo_OACI', 'Estado', 'Pais'];
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

    // Insertar aeropuerto
    $sql = "INSERT INTO aeropuertos (Codigo_IATA, Codigo_OACI, Nombre, Estado, Pais) 
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        strtoupper(trim($data['Codigo_IATA'])),
        strtoupper(trim($data['Codigo_OACI'])),
        trim($data['Nombre']),
        trim($data['Estado']),
        trim($data['Pais'])
    ]);

    if ($result) {
        $id_aeropuerto = $pdo->lastInsertId();
        echo json_encode([
            'success' => true,
            'message' => 'Aeropuerto creado exitosamente',
            'id' => $id_aeropuerto
        ]);
    } else {
        throw new Exception('Error al insertar en la base de datos');
    }

} catch (Exception $e) {
    // Verificar si es error de duplicado
    if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
        echo json_encode(['success' => false, 'error' => 'El código IATA u OACI ya existe']);
    } else {
        error_log("Error en aeropuerto_crear.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
    }
}
?>
<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

error_reporting(0);
ini_set('display_errors', 0);

require '../models/conexion.php';

$response = ['success' => false, 'message' => 'Error desconocido'];

try {
    error_log("📨 DATOS RECIBIDOS EN PHP:");
    error_log("POST: " . print_r($_POST, true));
    error_log("REQUEST: " . print_r($_REQUEST, true));
    
    // Validar método POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método no permitido. Use POST.");
    }

    $input_data = $_POST;
    
    if (empty($input_data)) {
        $input = file_get_contents('php://input');
        error_log("📥 Input raw: " . $input);
        parse_str($input, $input_data);
        error_log("📊 Input parsed: " . print_r($input_data, true));
    }

    error_log("🔍 DATOS A PROCESAR:");
    error_log("id_asignacion: " . ($input_data['id_asignacion'] ?? 'NO RECIBIDO'));
    error_log("tipo_cliente: " . ($input_data['tipo_cliente'] ?? 'NO RECIBIDO'));
    error_log("tipo_mantenimiento: " . ($input_data['tipo_mantenimiento'] ?? 'NO RECIBIDO'));

    // Validar que se reciba el ID
    if (!isset($input_data['id_asignacion']) || empty($input_data['id_asignacion'])) {
        throw new Exception("ID de asignación es requerido");
    }

    $id_asignacion = intval($input_data['id_asignacion']);

    // Validar campos requeridos
    $required_fields = ['tipo_cliente', 'tipo_mantenimiento'];
    foreach ($required_fields as $field) {
        if (!isset($input_data[$field]) || $input_data[$field] === '' || $input_data[$field] === null) {
            throw new Exception("El campo $field es requerido. Valor recibido: '" . ($input_data[$field] ?? 'NULL') . "'");
        }
    }

    // Obtener y sanitizar datos
    $tipo_cliente = trim($input_data['tipo_cliente']);
    $tipo_mantenimiento = trim($input_data['tipo_mantenimiento']);

    error_log("🎯 VALORES DESPUÉS DE TRIM:");
    error_log("tipo_cliente: '$tipo_cliente'");
    error_log("tipo_mantenimiento: '$tipo_mantenimiento'");

    // Validar tipo de cliente
    $tipos_cliente_validos = ['Guarda', 'Transito', 'Aerotaxi', 'Handling'];
    if (!in_array($tipo_cliente, $tipos_cliente_validos)) {
        throw new Exception("Tipo de cliente no válido. Debe ser: " . implode(', ', $tipos_cliente_validos) . ". Recibido: '$tipo_cliente'");
    }

    // Validar tipo de mantenimiento - SOLO 0 o 1
    if (!in_array($tipo_mantenimiento, ['0', '1'])) {
        throw new Exception("Tipo de mantenimiento no válido. Debe ser 0 o 1. Recibido: '$tipo_mantenimiento'");
    }

    // Verificar que la asignación existe y está activa
    $sql_check = "SELECT Id_Asignacion FROM asignacion_mantenimiento WHERE Id_Asignacion = ? AND Estado_Registro = 'activo'";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$id_asignacion]);
    
    if ($stmt_check->rowCount() === 0) {
        throw new Exception("La asignación no existe o está deshabilitada");
    }

    // Actualizar asignación
    $sql = "UPDATE asignacion_mantenimiento 
            SET Tipo_Cliente = ?, Tipo_Mantenimiento = ?, Fecha_Registro = NOW()
            WHERE Id_Asignacion = ?";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$tipo_cliente, $tipo_mantenimiento, $id_asignacion]);

    if ($result) {
        $response = [
            'success' => true, 
            'message' => 'Asignación actualizada correctamente',
            'id_asignacion' => $id_asignacion,
            'datos_actualizados' => [
                'tipo_cliente' => $tipo_cliente,
                'tipo_mantenimiento' => $tipo_mantenimiento
            ]
        ];
        error_log("✅ ASIGNACIÓN ACTUALIZADA CORRECTAMENTE");
    } else {
        throw new Exception("Error al ejecutar la actualización en la base de datos");
    }

} catch (Exception $e) {
    http_response_code(400);
    $response = [
        'success' => false, 
        'message' => $e->getMessage(),
        'error_type' => 'validation_error',
        'debug_info' => [
            'post_data' => $_POST,
            'input_data' => $input_data ?? 'No disponible'
        ]
    ];
    error_log("❌ ERROR: " . $e->getMessage());
} catch (PDOException $e) {
    http_response_code(500);
    $response = [
        'success' => false, 
        'message' => 'Error de base de datos: ' . $e->getMessage(),
        'error_type' => 'database_error'
    ];
    error_log("❌ ERROR BD: " . $e->getMessage());
}

ob_clean();
echo json_encode($response, JSON_UNESCAPED_UNICODE);
exit;
?>
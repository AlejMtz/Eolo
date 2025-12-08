<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

$response = ['success' => false, 'message' => 'Error desconocido'];

try {
    // Validar que se reciba el ID
    if (!isset($_POST['id_control']) || empty($_POST['id_control'])) {
        throw new Exception("ID de control es requerido");
    }

    $id_control = intval($_POST['id_control']);

    // Validar campos requeridos
    $required_fields = ['hangar', 'persona_registro'];
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            throw new Exception("El campo $field es requerido");
        }
    }

    // Obtener datos
    $hangar = $_POST['hangar'];
    $empresa_procedencia = isset($_POST['empresa_procedencia']) ? $_POST['empresa_procedencia'] : null;
    $observaciones = isset($_POST['observaciones']) ? $_POST['observaciones'] : null;
    $persona_registro = $_POST['persona_registro'];

    // Validar hangar
    if (!in_array($hangar, ['H1', 'H2'])) {
        throw new Exception("Hangar no válido. Use H1 o H2");
    }

    // Verificar que el control existe y está activo
    $sql_check = "SELECT Id_Control FROM control_pernocta WHERE Id_Control = ? AND Estado_Registro = 'activo'";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$id_control]);
    
    if ($stmt_check->rowCount() === 0) {
        throw new Exception("El control no existe o está deshabilitado");
    }

    $sql = "UPDATE control_pernocta 
            SET Hangar = ?, EmpresaProcedencia = ?, Observaciones = ?, Persona_Registro = ?
            WHERE Id_Control = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$hangar, $empresa_procedencia, $observaciones, $persona_registro, $id_control]);

    $response = [
        'success' => true, 
        'message' => 'Control actualizado correctamente',
        'id_control' => $id_control
    ];

} catch (Exception $e) {
    $response = ['success' => false, 'message' => $e->getMessage()];
}

echo json_encode($response);
?>
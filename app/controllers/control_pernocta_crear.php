<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

$response = ['success' => false, 'message' => 'Error desconocido'];

try {
    if (!isset($_POST['id_aeronave']) || empty($_POST['id_aeronave'])) {
        throw new Exception("El campo id_aeronave es requerido");
    }
    
    if (!isset($_POST['fecha']) || empty($_POST['fecha'])) {
        throw new Exception("El campo fecha es requerido");
    }

    $id_aeronave = intval($_POST['id_aeronave']);
    $fecha = $_POST['fecha'];
    
    $esManual = isset($_POST['persona_registro']) && !empty($_POST['persona_registro']) && isset($_POST['hangar']);
    
    if ($esManual) {
        $required_fields = ['hora_inicial', 'hora_final', 'persona_registro', 'hangar'];
        foreach ($required_fields as $field) {
            if (!isset($_POST[$field]) || empty($_POST[$field])) {
                throw new Exception("El campo $field es requerido para creación manual");
            }
        }
        
        $hora_inicial = $_POST['hora_inicial'];
        $hora_final = $_POST['hora_final'];
        $persona_registro = $_POST['persona_registro'];
        $hangar = $_POST['hangar'];
        
        
        $id_ultimo_registro = isset($_POST['id_ultimo_registro']) && !empty($_POST['id_ultimo_registro']) && $_POST['id_ultimo_registro'] != 0 
            ? intval($_POST['id_ultimo_registro']) 
            : NULL; 
        
        if (strlen($hora_inicial) == 5) {
            $hora_inicial .= ':00';
        }
        if (strlen($hora_final) == 5) {
            $hora_final .= ':00';
        }
        
    } else {
        $required_fields = ['hora_inicial', 'id_ultimo_registro'];
        foreach ($required_fields as $field) {
            if (!isset($_POST[$field]) || empty($_POST[$field])) {
                throw new Exception("El campo $field es requerido para creación automática");
            }
        }
        
        $hora_inicial = $_POST['hora_inicial'];
        $id_ultimo_registro = intval($_POST['id_ultimo_registro']);
        
        $hora_final = isset($_POST['hora_final']) ? $_POST['hora_final'] . ':00' : date('H:i:s');
        
        if (strlen($hora_inicial) == 5) {
            $hora_inicial .= ':00';
        }
        
        $hangar = NULL;
        $persona_registro = NULL;
    }
    
    $empresa_procedencia = isset($_POST['empresa_procedencia']) ? $_POST['empresa_procedencia'] : NULL;
    $observaciones = isset($_POST['observaciones']) ? $_POST['observaciones'] : NULL;

    $sql_check = "SELECT Id_Control FROM control_pernocta 
                  WHERE Id_Aeronave = ? 
                  AND DATE(Fecha) = DATE(?) 
                  AND Estado_Registro = 'activo'";
    
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$id_aeronave, $fecha]);
    
    if ($stmt_check->rowCount() > 0) {
        throw new Exception("Ya existe un control activo para esta aeronave en la fecha {$fecha}");
    }

    if (!$esManual && $id_ultimo_registro !== NULL) {
        $sql_check_entrada = "SELECT Id_Control FROM control_pernocta 
                              WHERE Id_Ultimo_Registro = ? 
                              AND Estado_Registro = 'activo'";
        $stmt_check_entrada = $pdo->prepare($sql_check_entrada);
        $stmt_check_entrada->execute([$id_ultimo_registro]);
        
        if ($stmt_check_entrada->rowCount() > 0) {
            throw new Exception("Ya existe un control activo para esta entrada específica");
        }
    }

    // Insertar en control_pernocta
    $sql = "INSERT INTO control_pernocta (Fecha, HoraInicial, HoraFinal, Id_Aeronave, Hangar, Id_Ultimo_Registro, EmpresaProcedencia, Observaciones, Persona_Registro, Estado_Registro) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')"; 
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $fecha, 
        $hora_inicial, 
        $hora_final, 
        $id_aeronave, 
        $hangar, 
        $id_ultimo_registro,
        $empresa_procedencia, 
        $observaciones, 
        $persona_registro
    ]);
    
    $id_control = $pdo->lastInsertId();

    $response = [
        'success' => true, 
        'message' => $esManual ? 'Aeronave agregada manualmente al control' : 'Control creado automáticamente',
        'id_control' => $id_control,
        'modo' => $esManual ? 'manual' : 'automatico',
        'id_ultimo_registro' => $id_ultimo_registro
    ];

} catch (Exception $e) {
    $response = ['success' => false, 'message' => $e->getMessage()];
}

echo json_encode($response);
?>
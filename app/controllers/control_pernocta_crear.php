<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

$response = ['success' => false, 'message' => 'Error desconocido'];

try {
    // Validar campos requeridos básicos
    if (!isset($_POST['id_aeronave']) || empty($_POST['id_aeronave'])) {
        throw new Exception("El campo id_aeronave es requerido");
    }

    // Obtener datos básicos
    $id_aeronave = intval($_POST['id_aeronave']);
    
    // Determinar si es creación manual o automática
    $esManual = isset($_POST['persona_registro']) && !empty($_POST['persona_registro']) && isset($_POST['hangar']);
    
    if ($esManual) {
        // ✅ MODO MANUAL: Usar datos enviados desde el formulario
        $required_fields = ['fecha', 'hora_inicial', 'hora_final', 'persona_registro', 'hangar'];
        foreach ($required_fields as $field) {
            if (!isset($_POST[$field]) || empty($_POST[$field])) {
                throw new Exception("El campo $field es requerido para creación manual");
            }
        }
        
        $fecha = $_POST['fecha'];
        $hora_inicial = $_POST['hora_inicial'];
        $hora_final = $_POST['hora_final']; // ✅ USAR LA HORA DEL FORMULARIO, NO DEL SERVIDOR
        $persona_registro = $_POST['persona_registro'];
        $hangar = $_POST['hangar'];
        $id_ultimo_registro = isset($_POST['id_ultimo_registro']) ? intval($_POST['id_ultimo_registro']) : 0;
        
        // ✅ CORREGIR FORMATO DE HORA: HTML envía HH:MM, BD espera HH:MM:SS
        if (strlen($hora_inicial) == 5) { // Si es formato HH:MM
            $hora_inicial .= ':00'; // Convertir a HH:MM:SS
        }
        if (strlen($hora_final) == 5) { // Si es formato HH:MM
            $hora_final .= ':00'; // Convertir a HH:MM:SS
        }
        
    } else {
        // ✅ MODO AUTOMÁTICO: Usar datos de entradas recientes
        $required_fields = ['fecha', 'hora_inicial', 'id_ultimo_registro'];
        foreach ($required_fields as $field) {
            if (!isset($_POST[$field]) || empty($_POST[$field])) {
                throw new Exception("El campo $field es requerido para creación automática");
            }
        }
        
        $fecha = $_POST['fecha'];
        $hora_inicial = $_POST['hora_inicial'];
        $id_ultimo_registro = intval($_POST['id_ultimo_registro']);
        
        // ✅ CORREGIR FORMATO DE HORA
        $hora_final = isset($_POST['hora_final']) ? $_POST['hora_final'] . ':00' : date('H:i:s');
        
        // ✅ Asegurar formato correcto para hora_inicial también
        if (strlen($hora_inicial) == 5) {
            $hora_inicial .= ':00';
        }
        
        $hangar = NULL;
        $persona_registro = NULL;
    }
    
    // Campos opcionales que pueden ser nulos
    $empresa_procedencia = isset($_POST['empresa_procedencia']) ? $_POST['empresa_procedencia'] : NULL;
    $observaciones = isset($_POST['observaciones']) ? $_POST['observaciones'] : NULL;

    // Verificar que no exista ya un registro ACTIVO para esta aeronave en la misma fecha
    $sql_check = "SELECT Id_Control FROM control_pernocta WHERE Id_Aeronave = ? AND DATE(Fecha) = DATE(?) AND Estado_Registro = 'activo'";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$id_aeronave, $fecha]);
    
    if ($stmt_check->rowCount() > 0) {
        throw new Exception("Ya existe un control activo para esta aeronave en la fecha seleccionada");
    }

    // Insertar en control_pernocta - NUEVO REGISTRO SIEMPRE ACTIVO
    $sql = "INSERT INTO control_pernocta (Fecha, HoraInicial, HoraFinal, Id_Aeronave, Hangar, Id_Ultimo_Registro, EmpresaProcedencia, Observaciones, Persona_Registro, Estado_Registro) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')"; // ✅ SIEMPRE ACTIVO
    
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
        'message' => $esManual ? 'Control de pernocta creado manualmente correctamente' : 'Control de pernocta creado automáticamente correctamente',
        'id_control' => $id_control,
        'modo' => $esManual ? 'manual' : 'automatico',
        'horas_guardadas' => [ // ✅ DEBUG: Confirmar qué horas se guardaron
            'hora_inicial' => $hora_inicial,
            'hora_final' => $hora_final
        ]
    ];

} catch (Exception $e) {
    $response = ['success' => false, 'message' => $e->getMessage()];
}

echo json_encode($response);
?>
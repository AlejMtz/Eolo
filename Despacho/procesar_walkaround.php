<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Configuración de la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "eolo";

// Respuesta por defecto
$response = ['success' => false, 'message' => 'Error desconocido'];

try {
    // Crear conexión
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Verificar conexión
    if ($conn->connect_error) {
        throw new Exception('Error de conexión a la base de datos: ' . $conn->connect_error);
    }

    // Verificar que todos los campos requeridos estén presentes
    $required_fields = ['fechaHora', 'id_aeronave', 'elaboro', 'responsable', 'jefe_area', 'vobo'];
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            throw new Exception("El campo $field es requerido");
        }
    }

    // Obtener datos del formulario
    // Asegurar el formato correcto de la fecha
    $fechaHora = $_POST['fechaHora'];
    // Convertir a formato MySQL datetime (YYYY-MM-DD HH:MM:SS)
    $fechaHora = date('Y-m-d H:i:s', strtotime($fechaHora));
    $id_aeronave = intval($_POST['id_aeronave']);
    $elaboro = $_POST['elaboro'];
    $responsable = $_POST['responsable'];
    $jefe_area = $_POST['jefe_area'];
    $vobo = $_POST['vobo'];
    $observacionesGenerales = isset($_POST['observacionesGenerales']) ? $_POST['observacionesGenerales'] : '';

    // Iniciar transacción
    $conn->begin_transaction();

    // PRIMERO: Insertar en la tabla walkaround
    $stmt_walkaround = $conn->prepare("INSERT INTO walkaround (Fechahora, Id_Aeronave, Elaboro, Responsable, JefeArea, VoBo, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt_walkaround) {
        throw new Exception("Error al preparar consulta walkaround: " . $conn->error);
    }
    
    $stmt_walkaround->bind_param("sisssss", $fechaHora, $id_aeronave, $elaboro, $responsable, $jefe_area, $vobo, $observacionesGenerales);
    
    if (!$stmt_walkaround->execute()) {
        throw new Exception("Error al insertar walkaround: " . $stmt_walkaround->error);
    }
    
    $id_walkaround = $stmt_walkaround->insert_id;
    $stmt_walkaround->close();

    // SEGUNDO: Procesar cada componente
    $component_count = 0;
    
    foreach ($_POST as $key => $value) {
        // Buscar campos de estado de componentes
        if (strpos($key, 'estado_') === 0) {
            $componente_id = str_replace('estado_', '', $key);
            $estado = intval($value);
            $observaciones = isset($_POST['observaciones_' . $componente_id]) ? $_POST['observaciones_' . $componente_id] : '';
            $id_evidencia = null;
            
            // Procesar evidencia del componente si existe
            if (isset($_FILES['evidencia_' . $componente_id]) && $_FILES['evidencia_' . $componente_id]['error'] == UPLOAD_ERR_OK) {
                $evidencia = $_FILES['evidencia_' . $componente_id];
                $id_evidencia = guardarEvidencia($conn, $evidencia, $id_walkaround, $id_aeronave);
            }
            
            // Insertar en componentewk (con el Id_Walk)
            $stmt = $conn->prepare("INSERT INTO componentewk (Id_Walk, Identificador_Componente, Estado, Observaciones, Id_Aeronave, Id_Evidencia) VALUES (?, ?, ?, ?, ?, ?)");            
            if (!$stmt) {
                throw new Exception("Error al preparar consulta componentewk: " . $conn->error);
            }
            
            // Si no hay evidencia, usar NULL
            $id_evidencia_value = $id_evidencia ? $id_evidencia : NULL;
            $stmt->bind_param("isisii", $id_walkaround, $componente_id, $estado, $observaciones, $id_aeronave, $id_evidencia_value);
            
            if (!$stmt->execute()) {
                throw new Exception("Error al insertar componente: " . $stmt->error);
            }
            
            $stmt->close();
            $component_count++;
        }
    }
    
    // TERCERO: Procesar evidencias generales
    if (isset($_FILES['generalEvidence']) && count($_FILES['generalEvidence']['name']) > 0) {
        $evidencias = $_FILES['generalEvidence'];
        
        for ($i = 0; $i < count($evidencias['name']); $i++) {
            if ($evidencias['error'][$i] == UPLOAD_ERR_OK) {
                $evidencia = [
                    'name' => $evidencias['name'][$i],
                    'type' => $evidencias['type'][$i],
                    'tmp_name' => $evidencias['tmp_name'][$i],
                    'error' => $evidencias['error'][$i],
                    'size' => $evidencias['size'][$i]
                ];
                
                guardarEvidencia($conn, $evidencia, $id_walkaround, $id_aeronave);
            }
        }
    }
    
    // Confirmar transacción
    $conn->commit();
    
    $response = [
        'success' => true, 
        'message' => 'Inspección guardada correctamente', 
        'id_walkaround' => $id_walkaround,
        'componentes_procesados' => $component_count
    ];
    
} catch (Exception $e) {
    // Revertir transacción en caso de error
    if (isset($conn) && $conn) {
        $conn->rollback();
    }
    
    $response = ['success' => false, 'message' => $e->getMessage()];
    
    // Log del error
    error_log("Error en procesar_walkaround: " . $e->getMessage());
}

// Cerrar conexión si existe
if (isset($conn) && $conn) {
    $conn->close();
}

// Enviar respuesta JSON
echo json_encode($response);
exit;

// Función para guardar evidencias
function guardarEvidencia($conn, $evidencia, $id_walkaround, $id_aeronave) {
    // Crear directorio si no existe
    $uploadDir = 'evidencias/';
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            throw new Exception("No se pudo crear el directorio de evidencias");
        }
    }
    
    // Validar que sea un archivo válido
    if (!is_uploaded_file($evidencia['tmp_name'])) {
        throw new Exception("Archivo no válido: " . $evidencia['name']);
    }
    
    // Generar nombre único para el archivo
    $fileExtension = pathinfo($evidencia['name'], PATHINFO_EXTENSION);
    $fileName = uniqid() . '_' . $id_walkaround . '.' . $fileExtension;
    $filePath = $uploadDir . $fileName;
    
    // Mover archivo
    if (move_uploaded_file($evidencia['tmp_name'], $filePath)) {
        // Insertar en evidencias
        $stmt_evidencia = $conn->prepare("INSERT INTO evidencias (Id_Wk, Id_Aeronave, Ruta, FileName) VALUES (?, ?, ?, ?)");
        
        if (!$stmt_evidencia) {
            throw new Exception("Error al preparar consulta evidencias: " . $conn->error);
        }
        
        $stmt_evidencia->bind_param("iiss", $id_walkaround, $id_aeronave, $filePath, $evidencia['name']);
        
        if (!$stmt_evidencia->execute()) {
            throw new Exception("Error al insertar evidencia: " . $stmt_evidencia->error);
        }
        
        $id_evidencia = $stmt_evidencia->insert_id;
        $stmt_evidencia->close();
        
        return $id_evidencia;
    } else {
        throw new Exception("Error al subir el archivo de evidencia: " . $evidencia['name']);
    }
    
    return null;
}
?>
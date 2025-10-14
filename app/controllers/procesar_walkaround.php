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
    $fechaHora = $_POST['fechaHora'];
    $fechaHora = date('Y-m-d H:i:s', strtotime($fechaHora));
    $id_aeronave = intval($_POST['id_aeronave']);
    $elaboro = $_POST['elaboro'];
    $responsable = $_POST['responsable'];
    $jefe_area = $_POST['jefe_area'];
    $vobo = $_POST['vobo'];
    $observacionesGenerales = isset($_POST['observacionesGenerales']) ? $_POST['observacionesGenerales'] : '';
    $procedencia = isset($_POST['procedencia']) ? trim($_POST['procedencia']) : '';
    $destino = isset($_POST['destino']) ? trim($_POST['destino']) : '';

    // Obtener tipo de walkaround
    $entrada = isset($_POST['entrada']) ? intval($_POST['entrada']) : 0;
    $salida = isset($_POST['salida']) ? intval($_POST['salida']) : 0;

    // Validar que al menos uno esté seleccionado
    if ($entrada === 0 && $salida === 0) {
        throw new Exception("Debe seleccionar al menos un tipo de walkaround (Entrada o Salida)");
    }

    // Iniciar transacción
    $conn->begin_transaction();

    // PRIMERO: Insertar en la tabla walkaround
    $stmt_walkaround = $conn->prepare("INSERT INTO walkaround (Fechahora, Id_Aeronave, Elaboro, Responsable, JefeArea, VoBo, observaciones, Procedencia, Destino, entrada, salida) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    if (!$stmt_walkaround) {
        throw new Exception("Error al preparar consulta walkaround: " . $conn->error);
    }

    $stmt_walkaround->bind_param("sisssssssii", $fechaHora, $id_aeronave, $elaboro, $responsable, $jefe_area, $vobo, $observacionesGenerales, $procedencia, $destino, $entrada, $salida);
    
    if (!$stmt_walkaround->execute()) {
        throw new Exception("Error al insertar walkaround: " . $stmt_walkaround->error);
    }
    
    $id_walkaround = $stmt_walkaround->insert_id;
    $stmt_walkaround->close();

    // SEGUNDO: Procesar TODOS los componentes - VERSIÓN CORREGIDA
$component_count = 0;
$componentes_data = [];

// Procesar directamente desde $_POST - VERSIÓN CORREGIDA
foreach ($_POST as $key => $value) {
    if (strpos($key, 'dano_') === 0) {
        // Extraer el componente_id y tipo_dano correctamente
        $key_parts = explode('_', $key);
        
        // El primer elemento es "dano", el último es el tipo de daño
        // Todo lo del medio es el componente_id
        $tipo_dano = array_pop($key_parts); // quita el último elemento (tipo de daño)
        array_shift($key_parts); // quita el primer elemento ("dano")
        $componente_id = implode('_', $key_parts); // junta el resto como componente_id
        
        if (!isset($componentes_data[$componente_id])) {
            $componentes_data[$componente_id] = [
                'derecho' => 0, 'izquierdo' => 0, 'golpe' => 0, 
                'rayon' => 0, 'fisura' => 0, 'quebrado' => 0,
                'pinturaCuarteada' => 0, 'otroDano' => 0
            ];
        }
        
        $componentes_data[$componente_id][$tipo_dano] = intval($value);
    }
}

// DEBUG: Mostrar cuántos componentes se procesaron
error_log("DEBUG - Componentes procesados: " . count($componentes_data));

    // Insertar en la base de datos
    foreach ($componentes_data as $componente_id => $valores) {
        $sql = "INSERT INTO componentewk 
            (Id_Walk, Identificador_Componente, Id_Aeronave, 
            derecho, izquierdo, golpe, rayon, fisura, quebrado, pinturaCuarteada, otroDano) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Error al preparar consulta: " . $conn->error);
        }
        
        // ORDEN CORREGIDO DEFINITIVO
        $stmt->bind_param(
            "issiiiiiiii", 
            $id_walkaround,                    
            $componente_id,                      
            $id_aeronave,                      
            $valores['derecho'],
            $valores['izquierdo'],               
            $valores['golpe'],                 
            $valores['rayon'],                 
            $valores['fisura'],                
            $valores['quebrado'],              
            $valores['pinturaCuarteada'],      
            $valores['otroDano']               
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Error al insertar componente: " . $stmt->error);
        }
        
        $stmt->close();
        $component_count++;
    }

    // TERCERO: Procesar evidencias generales
    if (isset($_FILES['generalEvidence']) && count($_FILES['generalEvidence']['name']) > 0) {
        $evidencias = $_FILES['generalEvidence'];
        $archivosProcesados = 0;
        
        for ($i = 0; $i < count($evidencias['name']); $i++) {
            if ($evidencias['error'][$i] == UPLOAD_ERR_OK && 
                $evidencias['size'][$i] > 0 && 
                !empty($evidencias['name'][$i])) {
                
                $evidencia = [
                    'name' => $evidencias['name'][$i],
                    'type' => $evidencias['type'][$i],
                    'tmp_name' => $evidencias['tmp_name'][$i],
                    'error' => $evidencias['error'][$i],
                    'size' => $evidencias['size'][$i]
                ];
                
                guardarEvidencia($conn, $evidencia, $id_walkaround, $id_aeronave);
                $archivosProcesados++;
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
}

// Cerrar conexión si existe
if (isset($conn) && $conn) {
    $conn->close();
}

// Enviar respuesta JSON
echo json_encode($response);
exit;

// Función para guardar evidencias (se mantiene igual)
function guardarEvidencia($conn, $evidencia, $id_walkaround, $id_aeronave) {
    // Validaciones iniciales
    if (!is_uploaded_file($evidencia['tmp_name'])) {
        return null;
    }
    
    if ($evidencia['size'] == 0) {
        return null;
    }
    
    if ($evidencia['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    
    if (empty($evidencia['name'])) {
        return null;
    }

    // Verificar si el archivo ya existe para este walkaround
    $sql_verificar = "SELECT COUNT(*) as count FROM evidencias WHERE Id_Wk = ? AND FileName = ?";
    $stmt_verificar = $conn->prepare($sql_verificar);
    
    if (!$stmt_verificar) {
        return null;
    }
    
    $stmt_verificar->bind_param("is", $id_walkaround, $evidencia['name']);
    
    if (!$stmt_verificar->execute()) {
        $stmt_verificar->close();
        return null;
    }
    
    $resultado = $stmt_verificar->get_result();
    $existe = $resultado->fetch_assoc()['count'] > 0;
    $stmt_verificar->close();
    
    if ($existe) {
        return null;
    }

    // Crear directorio si no existe
    $uploadDir = '../../public/assets/evidencias/';
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            throw new Exception("No se pudo crear el directorio de evidencias");
        }
    }

    // Generar nombre único para el archivo
    $fileExtension = pathinfo($evidencia['name'], PATHINFO_EXTENSION);
    $fileNameClean = preg_replace('/[^a-zA-Z0-9\._-]/', '_', $evidencia['name']);
    $fileNameClean = substr($fileNameClean, 0, 100);
    $uniqueId = uniqid();
    $fileName = $uniqueId . '_' . $id_walkaround . '_' . $fileNameClean;
    $filePath = $uploadDir . $fileName;

    // Mover archivo
    if (move_uploaded_file($evidencia['tmp_name'], $filePath)) {
        // Verificar que el archivo existe y tiene contenido
        if (!file_exists($filePath) || filesize($filePath) == 0) {
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            return null;
        }

        // Insertar en la base de datos
        $stmt_evidencia = $conn->prepare("INSERT INTO evidencias (Id_Wk, Id_Aeronave, Ruta, FileName) VALUES (?, ?, ?, ?)");
        
        if (!$stmt_evidencia) {
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            return null;
        }
        
        $stmt_evidencia->bind_param("iiss", $id_walkaround, $id_aeronave, $filePath, $evidencia['name']);
        
        if ($stmt_evidencia->execute()) {
            $id_evidencia = $stmt_evidencia->insert_id;
            $stmt_evidencia->close();
            return $id_evidencia;
        } else {
            $stmt_evidencia->close();
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            return null;
        }
        
    } else {
        return null;
    }
    
    return null;
}
?>
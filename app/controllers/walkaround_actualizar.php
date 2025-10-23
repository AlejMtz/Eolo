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
    $required_fields = ['id_walk', 'fechaHora', 'id_aeronave', 'elaboro', 'responsable', 'jefe_area', 'vobo'];
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            throw new Exception("El campo $field es requerido");
        }
    }

    // Obtener datos del formulario
    $id_walk = intval($_POST['id_walk']);
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

    // PRIMERO: Actualizar la tabla walkaround
    $stmt_walkaround = $conn->prepare("UPDATE walkaround SET Fechahora=?, Id_Aeronave=?, Elaboro=?, Responsable=?, JefeArea=?, VoBo=?, observaciones=?, Procedencia=?, Destino=?, entrada=?, salida=? WHERE Id_Walk=?");

    if (!$stmt_walkaround) {
        throw new Exception("Error al preparar consulta walkaround: " . $conn->error);
    }

    $stmt_walkaround->bind_param("sisssssssiii", $fechaHora, $id_aeronave, $elaboro, $responsable, $jefe_area, $vobo, $observacionesGenerales, $procedencia, $destino, $entrada, $salida, $id_walk);    
    
    if (!$stmt_walkaround->execute()) {
        throw new Exception("Error al actualizar walkaround: " . $stmt_walkaround->error);
    }
    
    $stmt_walkaround->close();

    // SEGUNDO: Eliminar componentes existentes
    $stmt_delete = $conn->prepare("DELETE FROM componentewk WHERE Id_Walk = ?");
    if (!$stmt_delete) {
        throw new Exception("Error al preparar eliminación de componentes: " . $conn->error);
    }
    $stmt_delete->bind_param("i", $id_walk);
    
    if (!$stmt_delete->execute()) {
        throw new Exception("Error al eliminar componentes existentes: " . $stmt_delete->error);
    }
    $stmt_delete->close();

    // TERCERO: Procesar TODOS los componentes
    $component_count = 0;
    $componentes_data = [];

    // Procesar directamente desde $_POST
    foreach ($_POST as $key => $value) {
        if (strpos($key, 'dano_') === 0) {
            $key_parts = explode('_', $key);
            $tipo_dano = array_pop($key_parts);
            array_shift($key_parts);
            $componente_id = implode('_', $key_parts);
            
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

    // Insertar componentes en la base de datos
    foreach ($componentes_data as $componente_id => $valores) {
        $sql = "INSERT INTO componentewk 
            (Id_Walk, Identificador_Componente, Id_Aeronave, 
            derecho, izquierdo, golpe, rayon, fisura, quebrado, pinturaCuarteada, otroDano) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Error al preparar consulta: " . $conn->error);
        }
        
        $stmt->bind_param(
            "issiiiiiiii", 
            $id_walk,                    
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

    // ⭐⭐ CUARTO: OBTENER EVIDENCIAS EXISTENTES PARA VERIFICAR DUPLICADOS
    $evidencias_existentes = [];
    $stmt_get_evidencias = $conn->prepare("SELECT FileName FROM evidencias WHERE Id_Wk = ?");
    if ($stmt_get_evidencias) {
        $stmt_get_evidencias->bind_param("i", $id_walk);
        $stmt_get_evidencias->execute();
        $result = $stmt_get_evidencias->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $evidencias_existentes[] = $row['FileName'];
        }
        $stmt_get_evidencias->close();
    }
    
    error_log("📋 Evidencias existentes para walkaround $id_walk: " . implode(', ', $evidencias_existentes));

    // ⭐⭐ QUINTO: Procesar NUEVAS evidencias generales (evitando duplicados)
    $evidencias_procesadas = 0;
    $evidencias_duplicadas = 0;
    
    if (isset($_FILES['generalEvidence']) && count($_FILES['generalEvidence']['name']) > 0) {
        $evidencias = $_FILES['generalEvidence'];
        
        for ($i = 0; $i < count($evidencias['name']); $i++) {
            if ($evidencias['error'][$i] == UPLOAD_ERR_OK && 
                $evidencias['size'][$i] > 0 && 
                !empty($evidencias['name'][$i])) {
                
                $nombre_archivo = $evidencias['name'][$i];
                
                // ⭐⭐ VERIFICAR SI EL ARCHIVO YA EXISTE
                if (in_array($nombre_archivo, $evidencias_existentes)) {
                    error_log("⚠️ Evidencia duplicada omitida: " . $nombre_archivo . " para walkaround " . $id_walk);
                    $evidencias_duplicadas++;
                    continue; // Saltar este archivo
                }
                
                $evidencia = [
                    'name' => $nombre_archivo,
                    'type' => $evidencias['type'][$i],
                    'tmp_name' => $evidencias['tmp_name'][$i],
                    'error' => $evidencias['error'][$i],
                    'size' => $evidencias['size'][$i]
                ];
                
                if (guardarEvidencia($conn, $evidencia, $id_walk, $id_aeronave, true)) {
                    $evidencias_procesadas++;
                    error_log("✅ Nueva evidencia guardada: " . $nombre_archivo);
                }
            }
        }
    }
    
    // Confirmar transacción
    $conn->commit();
    
    $response = [
        'success' => true,
        'message' => 'Walkaround actualizado correctamente',
        'id_walkaround' => $id_walk,
        'componentes_procesados' => $component_count,
        'evidencias_procesadas' => $evidencias_procesadas,
        'evidencias_duplicadas_omitidas' => $evidencias_duplicadas
    ];
    
} catch (Exception $e) {
    // Revertir transacción en caso de error
    if (isset($conn) && $conn) {
        $conn->rollback();
    }
    
    $response = ['success' => false, 'message' => $e->getMessage()];
    error_log("Error en walkaround_actualizar: " . $e->getMessage());
}

// Cerrar conexión si existe
if (isset($conn) && $conn) {
    $conn->close();
}

// Enviar respuesta JSON
echo json_encode($response);
exit;

// ⭐⭐ FUNCIÓN MEJORADA: Guardar evidencias (con verificación de duplicados)
function guardarEvidencia($conn, $evidencia, $id_walkaround, $id_aeronave, $modoEdicion = false) {
    // Validaciones iniciales
    if (!is_uploaded_file($evidencia['tmp_name'])) {
        error_log("❌ Archivo no subido via HTTP: " . $evidencia['name']);
        return false;
    }
    
    if ($evidencia['size'] == 0) {
        error_log("❌ Archivo vacío: " . $evidencia['name']);
        return false;
    }
    
    if ($evidencia['error'] !== UPLOAD_ERR_OK) {
        error_log("❌ Error en subida de archivo: " . $evidencia['name'] . " - Código error: " . $evidencia['error']);
        return false;
    }
    
    if (empty($evidencia['name'])) {
        error_log("❌ Archivo sin nombre");
        return false;
    }

    // ⭐⭐ VERIFICACIÓN ADICIONAL EN LA BD (doble verificación)
    $sql_verificar = "SELECT COUNT(*) as count FROM evidencias WHERE Id_Wk = ? AND FileName = ?";
    $stmt_verificar = $conn->prepare($sql_verificar);
    
    if (!$stmt_verificar) {
        error_log("❌ Error al preparar consulta de verificación: " . $conn->error);
        return false;
    }
    
    $stmt_verificar->bind_param("is", $id_walkaround, $evidencia['name']);
    
    if (!$stmt_verificar->execute()) {
        error_log("❌ Error al ejecutar consulta de verificación: " . $stmt_verificar->error);
        $stmt_verificar->close();
        return false;
    }
    
    $resultado = $stmt_verificar->get_result();
    $existe = $resultado->fetch_assoc()['count'] > 0;
    $stmt_verificar->close();
    
    if ($existe) {
        error_log("🚫 Evidencia duplicada detectada en BD: " . $evidencia['name'] . " para walkaround " . $id_walkaround);
        return false;
    }

    // Crear directorio si no existe
    $uploadDir = 'evidencias/';
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            error_log("❌ No se pudo crear el directorio de evidencias: " . $uploadDir);
            return false;
        }
    }

    // Generar nombre único para el archivo
    $fileExtension = pathinfo($evidencia['name'], PATHINFO_EXTENSION);
    $fileNameClean = preg_replace('/[^a-zA-Z0-9\._-]/', '_', $evidencia['name']);
    $fileNameClean = substr($fileNameClean, 0, 100);
    
    $uniqueId = uniqid();
    $fileName = $uniqueId . '_' . $id_walkaround . '_' . $fileNameClean;
    $filePath = $uploadDir . $fileName;
    
    error_log("📁 Guardando nueva evidencia: " . $fileName);

    // Mover archivo
    if (move_uploaded_file($evidencia['tmp_name'], $filePath)) {
        error_log("✅ Archivo movido exitosamente: " . $filePath);
        
        // Verificar que el archivo existe y tiene contenido
        if (!file_exists($filePath) || filesize($filePath) == 0) {
            error_log("❌ Archivo no válido después de mover: " . $filePath);
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            return false;
        }

        // Insertar en la base de datos
        $stmt_evidencia = $conn->prepare("INSERT INTO evidencias (Id_Wk, Id_Aeronave, Ruta, FileName) VALUES (?, ?, ?, ?)");
        
        if (!$stmt_evidencia) {
            error_log("❌ Error al preparar consulta de inserción: " . $conn->error);
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            return false;
        }
        
        $stmt_evidencia->bind_param("iiss", $id_walkaround, $id_aeronave, $filePath, $evidencia['name']);
        
        if ($stmt_evidencia->execute()) {
            $id_evidencia = $stmt_evidencia->insert_id;
            $stmt_evidencia->close();
            
            error_log("🎉 Nueva evidencia guardada exitosamente - ID: " . $id_evidencia . " - Archivo: " . $evidencia['name']);
            return true;
        } else {
            error_log("❌ Error al insertar evidencia en BD: " . $stmt_evidencia->error);
            $stmt_evidencia->close();
            
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            
            return false;
        }
        
    } else {
        error_log("❌ Error al mover el archivo subido: " . $evidencia['name']);
        return false;
    }
    
    return false;
}
?>
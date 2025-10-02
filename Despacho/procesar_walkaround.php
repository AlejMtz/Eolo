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
    $procedencia = isset($_POST['procedencia']) ? trim($_POST['procedencia']) : '';
    $destino = isset($_POST['destino']) ? trim($_POST['destino']) : '';

    // Iniciar transacción
    $conn->begin_transaction();

    // PRIMERO: Insertar en la tabla walkaround
    $stmt_walkaround = $conn->prepare("INSERT INTO walkaround (Fechahora, Id_Aeronave, Elaboro, Responsable, JefeArea, VoBo, observaciones, Procedencia, Destino) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt_walkaround) {
        throw new Exception("Error al preparar consulta walkaround: " . $conn->error);
    }
    
   $stmt_walkaround->bind_param("sisssssss", $fechaHora, $id_aeronave, $elaboro, $responsable, $jefe_area, $vobo, $observacionesGenerales, $procedencia, $destino);

    
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
    $archivosProcesados = 0;
    
    for ($i = 0; $i < count($evidencias['name']); $i++) {
        // ⭐⭐ CORRECCIÓN: Verificar que el archivo sea válido y tenga contenido
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
    
    error_log("Evidencias generales procesadas: " . $archivosProcesados . " de " . count($evidencias['name']));
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
    // ⭐⭐ VALIDACIONES INICIALES
    if (!is_uploaded_file($evidencia['tmp_name'])) {
        error_log("❌ Archivo no subido via HTTP: " . $evidencia['name']);
        return null;
    }
    
    if ($evidencia['size'] == 0) {
        error_log("❌ Archivo vacío: " . $evidencia['name']);
        return null;
    }
    
    if ($evidencia['error'] !== UPLOAD_ERR_OK) {
        error_log("❌ Error en subida de archivo: " . $evidencia['name'] . " - Código error: " . $evidencia['error']);
        return null;
    }
    
    if (empty($evidencia['name'])) {
        error_log("❌ Archivo sin nombre");
        return null;
    }

    // ⭐⭐ VERIFICAR SI EL ARCHIVO YA EXISTE PARA ESTE WALKAROUND
    $sql_verificar = "SELECT COUNT(*) as count FROM evidencias WHERE Id_Wk = ? AND FileName = ?";
    $stmt_verificar = $conn->prepare($sql_verificar);
    
    if (!$stmt_verificar) {
        error_log("❌ Error al preparar consulta de verificación: " . $conn->error);
        return null;
    }
    
    $stmt_verificar->bind_param("is", $id_walkaround, $evidencia['name']);
    
    if (!$stmt_verificar->execute()) {
        error_log("❌ Error al ejecutar consulta de verificación: " . $stmt_verificar->error);
        $stmt_verificar->close();
        return null;
    }
    
    $resultado = $stmt_verificar->get_result();
    $existe = $resultado->fetch_assoc()['count'] > 0;
    $stmt_verificar->close();
    
    if ($existe) {
        error_log("⚠️ Evidencia duplicada ignorada: " . $evidencia['name'] . " para walkaround " . $id_walkaround);
        return null;
    }

    // ⭐⭐ CREAR DIRECTORIO SI NO EXISTE
    $uploadDir = 'evidencias/';
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            error_log("❌ No se pudo crear el directorio de evidencias: " . $uploadDir);
            throw new Exception("No se pudo crear el directorio de evidencias");
        }
        error_log("✅ Directorio creado: " . $uploadDir);
    }

    // ⭐⭐ GENERAR NOMBRE ÚNICO PARA EL ARCHIVO
    $fileExtension = pathinfo($evidencia['name'], PATHINFO_EXTENSION);
    
    // Limpiar el nombre del archivo
    $fileNameClean = preg_replace('/[^a-zA-Z0-9\._-]/', '_', $evidencia['name']);
    $fileNameClean = substr($fileNameClean, 0, 100); // Limitar longitud
    
    // Generar nombre único
    $uniqueId = uniqid();
    $fileName = $uniqueId . '_' . $id_walkaround . '_' . $fileNameClean;
    $filePath = $uploadDir . $fileName;
    
    error_log("📁 Intentando guardar archivo: " . $fileName . " en: " . $filePath);

    // ⭐⭐ MOVER ARCHIVO
    if (move_uploaded_file($evidencia['tmp_name'], $filePath)) {
        error_log("✅ Archivo movido exitosamente: " . $filePath);
        
        // Verificar que el archivo existe y tiene contenido
        if (!file_exists($filePath)) {
            error_log("❌ Archivo no existe después de move_uploaded_file: " . $filePath);
            return null;
        }
        
        if (filesize($filePath) == 0) {
            error_log("❌ Archivo vacío después de mover: " . $filePath);
            unlink($filePath); // Eliminar archivo vacío
            return null;
        }

        //En modo edición, verificar duplicados de forma diferente
    if ($modoEdicion) {
        // En edición, permitimos reemplazar archivos con el mismo nombre
        // ya que los anteriores fueron eliminados
        error_log("🔧 Modo edición - Verificación de duplicados relajada");
    } else {
        // En creación, verificación estricta de duplicados
        $sql_verificar = "SELECT COUNT(*) as count FROM evidencias WHERE Id_Wk = ? AND FileName = ?";
        $stmt_verificar = $conn->prepare($sql_verificar);
        
        if (!$stmt_verificar) {
            error_log("❌ Error al preparar consulta de verificación: " . $conn->error);
            return null;
        }
        
        $stmt_verificar->bind_param("is", $id_walkaround, $evidencia['name']);
        
        if (!$stmt_verificar->execute()) {
            error_log("❌ Error al ejecutar consulta de verificación: " . $stmt_verificar->error);
            $stmt_verificar->close();
            return null;
        }
        
        $resultado = $stmt_verificar->get_result();
        $existe = $resultado->fetch_assoc()['count'] > 0;
        $stmt_verificar->close();
        
        if ($existe) {
            error_log("⚠️ Evidencia duplicada ignorada: " . $evidencia['name'] . " para walkaround " . $id_walkaround);
            return null;
        }
    }

        //INSERTAR EN LA BASE DE DATOS
        $stmt_evidencia = $conn->prepare("INSERT INTO evidencias (Id_Wk, Id_Aeronave, Ruta, FileName) VALUES (?, ?, ?, ?)");
        
        if (!$stmt_evidencia) {
            error_log("❌ Error al preparar consulta de inserción: " . $conn->error);
            // Intentar eliminar el archivo si falla la inserción
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            return null;
        }
        
        $stmt_evidencia->bind_param("iiss", $id_walkaround, $id_aeronave, $filePath, $evidencia['name']);
        
        if ($stmt_evidencia->execute()) {
            $id_evidencia = $stmt_evidencia->insert_id;
            $stmt_evidencia->close();
            
            error_log("🎉 Evidencia guardada exitosamente - ID: " . $id_evidencia . 
                     " - Archivo: " . $evidencia['name'] . 
                     " - Ruta: " . $filePath . 
                     " - Tamaño: " . filesize($filePath) . " bytes");
            
            return $id_evidencia;
        } else {
            error_log("❌ Error al insertar evidencia en BD: " . $stmt_evidencia->error);
            $stmt_evidencia->close();
            
            // Eliminar archivo si falla la inserción en BD
            if (file_exists($filePath)) {
                unlink($filePath);
                error_log("🗑️ Archivo eliminado por fallo en BD: " . $filePath);
            }
            
            return null;
        }
        
    } else {
        error_log("❌ Error al mover el archivo subido: " . $evidencia['name'] . 
                 " - tmp_name: " . $evidencia['tmp_name'] . 
                 " - destino: " . $filePath . 
                 " - error: " . error_get_last()['message']);
        return null;
    }
    
    return null;
}
?>
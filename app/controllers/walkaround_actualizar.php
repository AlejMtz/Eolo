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

    // TERCERO: Procesar TODOS los componentes - MÉTODO ACTUALIZADO
    $component_count = 0;
    $componentes_data = [];

    // Procesar directamente desde $_POST - MÉTODO CORREGIDO
    foreach ($_POST as $key => $value) {
        if (strpos($key, 'dano_') === 0) {
            // Método robusto para extraer componente_id y tipo_dano
            $key_parts = explode('_', $key);
            $tipo_dano = array_pop($key_parts); // último elemento = tipo de daño
            array_shift($key_parts); // quitar "dano"
            $componente_id = implode('_', $key_parts); // resto = componente_id
            
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

    // CUARTO: Procesar evidencias generales (se mantiene igual que antes)
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
                
                guardarEvidencia($conn, $evidencia, $id_walk, $id_aeronave, true);
                $archivosProcesados++;
            }
        }
    }
    
    // Confirmar transacción
    $conn->commit();
    
    $response = [
        'success' => true,
        'message' => 'Walkaround actualizado correctamente',
        'id_walkaround' => $id_walk,
        'componentes_procesados' => $component_count
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

// Función para guardar evidencias - VERSIÓN MEJORADA (se mantiene igual)
function guardarEvidencia($conn, $evidencia, $id_walkaround, $id_aeronave, $modoEdicion = false) {
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

    // ⭐⭐ VERIFICAR SI EL ARCHIVO YA EXISTE PARA ESTE WALKAROUND (solo en modo creación)
    if (!$modoEdicion) {
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

        // INSERTAR EN LA BASE DE DATOS
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

// Función para eliminar evidencias (se mantiene igual)
function eliminarEvidencia($conn, $id_evidencia) {
    // Obtener información del archivo
    $stmt = $conn->prepare("SELECT Ruta FROM evidencias WHERE Id_Evidencia = ?");
    if (!$stmt) {
        error_log("❌ Error al preparar consulta de eliminación de evidencia: " . $conn->error);
        return;
    }
    
    $stmt->bind_param("i", $id_evidencia);
    if (!$stmt->execute()) {
        error_log("❌ Error al ejecutar consulta de eliminación de evidencia: " . $stmt->error);
        $stmt->close();
        return;
    }
    
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        // Eliminar archivo físico
        if (file_exists($row['Ruta'])) {
            if (unlink($row['Ruta'])) {
                error_log("✅ Archivo físico eliminado: " . $row['Ruta']);
            } else {
                error_log("⚠️ No se pudo eliminar archivo físico: " . $row['Ruta']);
            }
        } else {
            error_log("ℹ️ Archivo no encontrado: " . $row['Ruta']);
        }
        
        // Eliminar registro de la base de datos
        $stmt_delete = $conn->prepare("DELETE FROM evidencias WHERE Id_Evidencia = ?");
        if ($stmt_delete) {
            $stmt_delete->bind_param("i", $id_evidencia);
            if ($stmt_delete->execute()) {
                error_log("✅ Registro de evidencia eliminado de BD - ID: " . $id_evidencia);
            } else {
                error_log("❌ Error al eliminar registro de evidencia: " . $stmt_delete->error);
            }
            $stmt_delete->close();
        }
    }
    
    $stmt->close();
}
?>
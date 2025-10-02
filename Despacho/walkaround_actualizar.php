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

    // Iniciar transacción
    $conn->begin_transaction();

    // PRIMERO: Actualizar la tabla walkaround
    $stmt_walkaround = $conn->prepare("UPDATE walkaround SET Fechahora=?, Id_Aeronave=?, Elaboro=?, Responsable=?, JefeArea=?, VoBo=?, observaciones=?, Procedencia=?, Destino=? WHERE Id_Walk=?");
    
    if (!$stmt_walkaround) {
        throw new Exception("Error al preparar consulta walkaround: " . $conn->error);
    }
    
   $stmt_walkaround->bind_param("sisssssssi", $fechaHora, $id_aeronave, $elaboro, $responsable, $jefe_area, $vobo, $observacionesGenerales, $procedencia, $destino, $id_walk);
    
    if (!$stmt_walkaround->execute()) {
        throw new Exception("Error al actualizar walkaround: " . $stmt_walkaround->error);
    }
    
    $stmt_walkaround->close();

    // SEGUNDO: Obtener componentes existentes para manejar evidencias
    $componentes_existentes = [];
    $stmt_get_componentes = $conn->prepare("SELECT Id_Componete_Wk, Identificador_Componente, Id_Evidencia FROM componentewk WHERE Id_Walk = ?");
    $stmt_get_componentes->bind_param("i", $id_walk);
    $stmt_get_componentes->execute();
    $result = $stmt_get_componentes->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $componentes_existentes[$row['Identificador_Componente']] = [
            'id_componente' => $row['Id_Componete_Wk'],
            'id_evidencia' => $row['Id_Evidencia']
        ];
    }
    $stmt_get_componentes->close();

    // TERCERO: Procesar cada componente del formulario
    $component_count = 0;
    
    foreach ($_POST as $key => $value) {
        if (strpos($key, 'estado_') === 0) {
            $componente_id = str_replace('estado_', '', $key);
            $estado = intval($value);
            $observaciones = isset($_POST['observaciones_' . $componente_id]) ? $_POST['observaciones_' . $componente_id] : '';
            $id_evidencia = null;
            
            // Determinar si ya existe este componente
            $componente_existente = isset($componentes_existentes[$componente_id]) ? $componentes_existentes[$componente_id] : null;
            
            // Procesar nueva evidencia si se subió
            if (isset($_FILES['evidencia_' . $componente_id]) && $_FILES['evidencia_' . $componente_id]['error'] == UPLOAD_ERR_OK) {
                // Eliminar evidencia anterior si existe
                if ($componente_existente && $componente_existente['id_evidencia']) {
                    eliminarEvidencia($conn, $componente_existente['id_evidencia']);
                }
                
                $evidencia = $_FILES['evidencia_' . $componente_id];
                $id_evidencia = guardarEvidencia($conn, $evidencia, $id_walk, $id_aeronave, true);

            } else if ($componente_existente) {
                // Mantener la evidencia existente
                $id_evidencia = $componente_existente['id_evidencia'];
            }
            
            if ($componente_existente) {
                // ACTUALIZAR componente existente
                $stmt = $conn->prepare("UPDATE componentewk SET Estado=?, Observaciones=?, Id_Evidencia=? WHERE Id_Componete_Wk=?");
                $stmt->bind_param("isii", $estado, $observaciones, $id_evidencia, $componente_existente['id_componente']);
            } else {
                // INSERTAR nuevo componente
                $stmt = $conn->prepare("INSERT INTO componentewk (Id_Walk, Identificador_Componente, Estado, Observaciones, Id_Aeronave, Id_Evidencia) VALUES (?, ?, ?, ?, ?, ?)");
                $id_evidencia_value = $id_evidencia ? $id_evidencia : NULL;
                $stmt->bind_param("isisii", $id_walk, $componente_id, $estado, $observaciones, $id_aeronave, $id_evidencia_value);
            }
            
            if (!$stmt->execute()) {
                throw new Exception("Error al procesar componente $componente_id: " . $stmt->error);
            }
            
            $stmt->close();
            $component_count++;
            
            // Remover de la lista de existentes para identificar componentes a eliminar
            if (isset($componentes_existentes[$componente_id])) {
                unset($componentes_existentes[$componente_id]);
            }
        }
    }
    
    // CUARTO: Eliminar componentes que ya no están en el formulario
    foreach ($componentes_existentes as $componente_id => $datos) {
        if ($datos['id_evidencia']) {
            eliminarEvidencia($conn, $datos['id_evidencia']);
        }
        
        $stmt_delete = $conn->prepare("DELETE FROM componentewk WHERE Id_Componete_Wk = ?");
        $stmt_delete->bind_param("i", $datos['id_componente']);
        
        if (!$stmt_delete->execute()) {
            throw new Exception("Error al eliminar componente obsoleto: " . $stmt_delete->error);
        }
        
        $stmt_delete->close();
    }
    
    // QUINTO: Procesar evidencias generales - VERSIÓN CORREGIDA
if (isset($_FILES['generalEvidence']) && count($_FILES['generalEvidence']['name']) > 0) {
    $evidencias = $_FILES['generalEvidence'];
    $archivosValidos = 0;
    
    error_log("🔄 Procesando evidencias generales en actualización...");

    // Contar archivos válidos (no vacíos)
    for ($i = 0; $i < count($evidencias['name']); $i++) {
        if ($evidencias['error'][$i] == UPLOAD_ERR_OK && 
            $evidencias['size'][$i] > 0 && 
            !empty($evidencias['name'][$i])) {
            $archivosValidos++;
        }
    }
    
    error_log("📊 Archivos válidos encontrados: " . $archivosValidos);
    
    if ($archivosValidos > 0) {
        error_log("🗑️ Eliminando evidencias existentes antes de agregar nuevas...");
        
        // ⭐⭐ CORRECCIÓN: Solo eliminar evidencias si hay archivos nuevos válidos
        $sql_eliminar_evidencias = "SELECT Id_Evidencia, Ruta FROM evidencias WHERE Id_Wk = ?";
        $stmt_eliminar = $conn->prepare($sql_eliminar_evidencias);
        $stmt_eliminar->bind_param("i", $id_walk);
        
        if (!$stmt_eliminar->execute()) {
            error_log("❌ Error al obtener evidencias existentes: " . $stmt_eliminar->error);
            throw new Exception("Error al obtener evidencias existentes");
        }
        
        $result_eliminar = $stmt_eliminar->get_result();
        $evidenciasEliminadas = 0;
        
        while ($row = $result_eliminar->fetch_assoc()) {
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
            $stmt_delete_evidencia = $conn->prepare("DELETE FROM evidencias WHERE Id_Evidencia = ?");
            if ($stmt_delete_evidencia) {
                $stmt_delete_evidencia->bind_param("i", $row['Id_Evidencia']);
                if ($stmt_delete_evidencia->execute()) {
                    $evidenciasEliminadas++;
                    error_log("✅ Registro BD eliminado - ID: " . $row['Id_Evidencia']);
                } else {
                    error_log("❌ Error al eliminar registro BD: " . $stmt_delete_evidencia->error);
                }
                $stmt_delete_evidencia->close();
            }
        }
        $stmt_eliminar->close();
        
        error_log("🗑️ " . $evidenciasEliminadas . " evidencias eliminadas de la BD");

        // ⭐⭐ CORRECCIÓN: Agregar SOLO las nuevas evidencias
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
                
                error_log("📤 Procesando nueva evidencia: " . $evidencia['name']);
                
                $id_evidencia = guardarEvidencia($conn, $evidencia, $id_walk, $id_aeronave, true);

                if ($id_evidencia) {
                    $archivosProcesados++;
                    error_log("✅ Nueva evidencia guardada - ID: " . $id_evidencia);
                } else {
                    error_log("❌ Error al guardar nueva evidencia: " . $evidencia['name']);
                }
            }
        }
        
        error_log("🎉 " . $archivosProcesados . " nuevas evidencias agregadas exitosamente");
        
    } else {
        error_log("ℹ️ No hay archivos nuevos válidos, se mantienen las evidencias existentes");
    }
} else {
    error_log("ℹ️ No se recibieron evidencias generales para actualizar");
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

// Función para guardar evidencias
function guardarEvidencia($conn, $evidencia, $id_walkaround, $id_aeronave) {
    $uploadDir = 'evidencias/';
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            throw new Exception("No se pudo crear el directorio de evidencias");
        }
    }
    
    if (!is_uploaded_file($evidencia['tmp_name'])) {
        throw new Exception("Archivo no válido: " . $evidencia['name']);
    }
    
    $fileExtension = pathinfo($evidencia['name'], PATHINFO_EXTENSION);
    $fileName = uniqid() . '_' . $id_walkaround . '.' . $fileExtension;
    $filePath = $uploadDir . $fileName;
    
    if (move_uploaded_file($evidencia['tmp_name'], $filePath)) {
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

// Función para eliminar evidencias
function eliminarEvidencia($conn, $id_evidencia) {
    // Obtener información del archivo
    $stmt = $conn->prepare("SELECT Ruta FROM evidencias WHERE Id_Evidencia = ?");
    $stmt->bind_param("i", $id_evidencia);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        // Eliminar archivo físico
        if (file_exists($row['Ruta'])) {
            unlink($row['Ruta']);
        }
        
        // Eliminar registro de la base de datos
        $stmt_delete = $conn->prepare("DELETE FROM evidencias WHERE Id_Evidencia = ?");
        $stmt_delete->bind_param("i", $id_evidencia);
        $stmt_delete->execute();
        $stmt_delete->close();
    }
    
    $stmt->close();
}
?>
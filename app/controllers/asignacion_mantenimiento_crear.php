<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

$response = ['success' => false, 'message' => 'Error desconocido'];

try {
    // Validar campos requeridos
    if (!isset($_POST['id_aeronave']) || empty($_POST['id_aeronave'])) {
        throw new Exception("El campo id_aeronave es requerido");
    }
    if (!isset($_POST['id_ultimo_registro']) || empty($_POST['id_ultimo_registro'])) {
        throw new Exception("El campo id_ultimo_registro es requerido");
    }

    $id_aeronave = intval($_POST['id_aeronave']);
    $id_ultimo_registro = intval($_POST['id_ultimo_registro']);
    
    // Obtener fecha y hora de la pernocta
    $sql_pernocta = "SELECT Fecha, Hora FROM pernocta_diaria WHERE Id_Pernocta = ?";
    $stmt_pernocta = $pdo->prepare($sql_pernocta);
    $stmt_pernocta->execute([$id_ultimo_registro]);
    $pernocta = $stmt_pernocta->fetch(PDO::FETCH_ASSOC);
    
    if (!$pernocta) {
        throw new Exception("No se encontró la pernocta especificada");
    }
    
    $fecha = $pernocta['Fecha'];
    $hora = $pernocta['Hora'];
    
    // Verificar que no exista ya un registro ACTIVO para este Id_Ultimo_Registro
    $sql_check = "SELECT Id_Asignacion FROM asignacion_mantenimiento WHERE Id_Ultimo_Registro = ? AND Estado_Registro = 'activo'";
    $stmt_check = $pdo->prepare($sql_check);
    $stmt_check->execute([$id_ultimo_registro]);
    
    if ($stmt_check->rowCount() > 0) {
        throw new Exception("Ya existe una asignación activa para esta entrada de aeronave");
    }

    // ✅ INSERTAR CON CAMPOS NULL (como quieres)
    $sql = "INSERT INTO asignacion_mantenimiento 
            (Fecha, Hora, Id_Aeronave, Id_Ultimo_Registro, Tipo_Cliente, Tipo_Mantenimiento, Estado_Registro) 
            VALUES (?, ?, ?, ?, NULL, NULL, 'activo')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $fecha, 
        $hora, 
        $id_aeronave, 
        $id_ultimo_registro
    ]);
    
    $id_asignacion = $pdo->lastInsertId();

    $response = [
        'success' => true, 
        'message' => 'Asignación de mantenimiento creada correctamente',
        'id_asignacion' => $id_asignacion
    ];

} catch (Exception $e) {
    $response = ['success' => false, 'message' => $e->getMessage()];
}

echo json_encode($response);
?>
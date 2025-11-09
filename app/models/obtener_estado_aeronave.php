<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require 'conexion.php';

$response = ['success' => false, 'message' => 'Error desconocido'];

try {
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        throw new Exception("ID de aeronave es requerido");
    }

    $id_aeronave = intval($_GET['id']);

    // Obtener matrícula de la aeronave
    $sql_matricula = "SELECT Matricula FROM aeronave WHERE Id_Aeronave = ?";
    $stmt_matricula = $pdo->prepare($sql_matricula);
    $stmt_matricula->execute([$id_aeronave]);
    
    if ($stmt_matricula->rowCount() === 0) {
        throw new Exception("Aeronave no encontrada");
    }

    $aeronave = $stmt_matricula->fetch(PDO::FETCH_ASSOC);
    $matricula = $aeronave['Matricula'];

    // CALCULAR ESTADO BASADO EN EL ÚLTIMO MOVIMIENTO ACTIVO
    $sql_estado = "SELECT Tipo_Movimiento 
                   FROM pernocta_diaria 
                   WHERE Id_Aeronave = ? 
                   AND Estado_Registro = 'activo'
                   ORDER BY Fecha DESC, Hora DESC, Id_Pernocta DESC 
                   LIMIT 1";
    $stmt_estado = $pdo->prepare($sql_estado);
    $stmt_estado->execute([$id_aeronave]);
    
    $estado = 'fuera'; 
    
    if ($stmt_estado->rowCount() > 0) {
        $ultimo_movimiento = $stmt_estado->fetch(PDO::FETCH_ASSOC);
        $estado = ($ultimo_movimiento['Tipo_Movimiento'] == 'entrada') ? 'en_hangar' : 'fuera';
    }

    $response = [
        'success' => true,
        'matricula' => $matricula,
        'estado' => $estado,
        'ultimo_movimiento' => $estado == 'fuera' ? 'SALIDA' : 'ENTRADA'
    ];

} catch (Exception $e) {
    $response = ['success' => false, 'message' => $e->getMessage()];
}

echo json_encode($response);
?>
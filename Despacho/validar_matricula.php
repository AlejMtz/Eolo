<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../conexion.php';

$response = [
    'disponible' => true,
    'mensaje' => ''
];

try {
    // Verificar que se recibió la matrícula
    if (!isset($_POST['matricula']) || empty(trim($_POST['matricula']))) {
        $response['disponible'] = false;
        $response['mensaje'] = 'La matrícula es requerida';
        echo json_encode($response);
        exit;
    }

    $matricula = trim($_POST['matricula']);
    $id_aeronave = isset($_POST['id_aeronave']) ? intval($_POST['id_aeronave']) : null;

    // Preparar consulta según si es creación o edición
    if ($id_aeronave) {
        // Modo edición: verificar que no exista en otra aeronave
        $sql = "SELECT COUNT(*) as count, Matricula FROM aeronave WHERE Matricula = :matricula AND Id_Aeronave != :id_aeronave";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':matricula', $matricula);
        $stmt->bindParam(':id_aeronave', $id_aeronave, PDO::PARAM_INT);
    } else {
        // Modo creación: verificar que no exista
        $sql = "SELECT COUNT(*) as count, Matricula FROM aeronave WHERE Matricula = :matricula";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':matricula', $matricula);
    }

    $stmt->execute();
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($resultado['count'] > 0) {
        $response['disponible'] = false;
        $response['mensaje'] = 'La matrícula "' . $matricula . '" ya está registrada. Por favor, use una matrícula diferente.';
    } else {
        $response['disponible'] = true;
        $response['mensaje'] = 'Matrícula disponible';
    }

} catch (PDOException $e) {
    $response['disponible'] = false;
    $response['mensaje'] = 'Error al verificar la matrícula: ' . $e->getMessage();
} catch (Exception $e) {
    $response['disponible'] = false;
    $response['mensaje'] = $e->getMessage();
}

echo json_encode($response);
?>
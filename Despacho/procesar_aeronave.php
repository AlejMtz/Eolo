<?php
// Incluir el archivo de conexión
require '../conexion.php';

// Establecer el tipo de contenido de la respuesta a JSON
header('Content-Type: application/json');

$response = [
    'success' => false,
    'message' => 'Ha ocurrido un error inesperado.'
];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $matricula = trim($_POST['matricula']);
    $tipo = trim($_POST['tipo']);
    $equipo = trim($_POST['equipo']);
    $procedencia = trim($_POST['procedencia']);
    $destino = trim($_POST['destino']);

    if (!empty($matricula) && !empty($tipo) && !empty($equipo) && !empty($procedencia) && !empty($destino)) {
        try {
            $sql = "INSERT INTO Aeronave (matricula, tipo, equipo, procedencia, destino) VALUES (:matricula, :tipo, :equipo, :procedencia, :destino)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':matricula', $matricula);
            $stmt->bindParam(':tipo', $tipo);
            $stmt->bindParam(':equipo', $equipo);
            $stmt->bindParam(':procedencia', $procedencia);
            $stmt->bindParam(':destino', $destino);
            $stmt->execute();

            $response['success'] = true;
            $response['message'] = '¡Datos de la aeronave guardados correctamente! 🎉';
        } catch (PDOException $e) {
            $response['message'] = "Error al guardar los datos: " . $e->getMessage();
        }
    } else {
        $response['message'] = "Por favor, complete todos los campos del formulario.";
    }
}

echo json_encode($response);
exit(); // Es importante terminar la ejecución después de enviar la respuesta JSON
?>
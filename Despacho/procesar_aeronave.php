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

    if (!empty($matricula) && !empty($tipo) && !empty($equipo)) {
        try {
            // ⭐⭐ NUEVA VALIDACIÓN: Verificar si la matrícula ya existe ⭐⭐
            $sql_verificar = "SELECT COUNT(*) as count FROM aeronave WHERE Matricula = :matricula";
            $stmt_verificar = $pdo->prepare($sql_verificar);
            $stmt_verificar->bindParam(':matricula', $matricula);
            $stmt_verificar->execute();
            $resultado = $stmt_verificar->fetch(PDO::FETCH_ASSOC);
            
            if ($resultado['count'] > 0) {
                throw new Exception('La matrícula "' . $matricula . '" ya está registrada. Por favor, use una matrícula diferente.');
            }

            $sql = "INSERT INTO Aeronave (matricula, tipo, equipo) VALUES (:matricula, :tipo, :equipo)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':matricula', $matricula);
            $stmt->bindParam(':tipo', $tipo);
            $stmt->bindParam(':equipo', $equipo);
            $stmt->execute();

            $response['success'] = true;
            $response['message'] = '¡Datos de la aeronave guardados correctamente! 🎉';
        } catch (PDOException $e) {
            // Verificar si es error de duplicado
            if ($e->getCode() == 23000 || strpos($e->getMessage(), 'Duplicate') !== false) {
                $response['message'] = 'La matrícula "' . $matricula . '" ya está registrada. Por favor, use una matrícula diferente.';
            } else {
                $response['message'] = "Error al guardar los datos: " . $e->getMessage();
            }
        } catch (Exception $e) {
            $response['message'] = $e->getMessage();
        }
    } else {
        $response['message'] = "Por favor, complete todos los campos del formulario.";
    }
}

echo json_encode($response);
exit();
?>
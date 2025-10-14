<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../models/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
    exit;
}

try {
    $id_walk = isset($_POST['id_walk']) ? intval($_POST['id_walk']) : null;

    if (empty($id_walk)) {
        throw new Exception('ID de walkaround no proporcionado.');
    }

    // Iniciar transacción para eliminar en cascada
    $pdo->beginTransaction();

    // 1. Primero eliminar evidencias
    $sql_evidencias = "DELETE FROM evidencias WHERE Id_Wk = :id_walk";
    $stmt_evidencias = $pdo->prepare($sql_evidencias);
    $stmt_evidencias->bindParam(':id_walk', $id_walk, PDO::PARAM_INT);
    $stmt_evidencias->execute();

    // 2. Luego eliminar componentes
    $sql_componentes = "DELETE FROM componentewk WHERE Id_Walk = :id_walk";
    $stmt_componentes = $pdo->prepare($sql_componentes);
    $stmt_componentes->bindParam(':id_walk', $id_walk, PDO::PARAM_INT);
    $stmt_componentes->execute();

    // 3. Finalmente eliminar el walkaround
    $sql_walkaround = "DELETE FROM walkaround WHERE Id_Walk = :id_walk";
    $stmt_walkaround = $pdo->prepare($sql_walkaround);
    $stmt_walkaround->bindParam(':id_walk', $id_walk, PDO::PARAM_INT);
    
    if ($stmt_walkaround->execute()) {
        $pdo->commit();
        echo json_encode(['success' => 'Walkaround eliminado correctamente.']);
    } else {
        $pdo->rollBack();
        throw new Exception('Error al eliminar el walkaround.');
    }

} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
    exit;
}

try {
    $id_entrega = isset($_POST['id_entrega']) ? intval($_POST['id_entrega']) : 0;
    
    if ($id_entrega <= 0) {
        throw new Exception('ID de entrega inválido.');
    }

    $pdo->beginTransaction();

    // Eliminar equipos relacionados primero
    $sql_eliminar_comunicacion = "DELETE FROM equipocomunicacion WHERE Entrega_Turno_Id = ?";
    $stmt_comunicacion = $pdo->prepare($sql_eliminar_comunicacion);
    $stmt_comunicacion->execute([$id_entrega]);

    $sql_eliminar_oficina = "DELETE FROM equipooficina WHERE Entrega_Turno_Id = ?";
    $stmt_oficina = $pdo->prepare($sql_eliminar_oficina);
    $stmt_oficina->execute([$id_entrega]);

    // Eliminar entrega principal
    $sql_eliminar_principal = "DELETE FROM entregaturno WHERE Id_EntregaTurno = ?";
    $stmt_principal = $pdo->prepare($sql_eliminar_principal);
    $stmt_principal->execute([$id_entrega]);

    $pdo->commit();
    echo json_encode(['success' => 'Entrega eliminada correctamente.']);
    
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Error al eliminar: ' . $e->getMessage()]);
}
?>
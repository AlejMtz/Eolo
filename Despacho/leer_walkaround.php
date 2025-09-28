<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../conexion.php';

try {
    // Consulta SQL para obtener walkarounds incluso si la aeronave no existe
    $sql = "SELECT w.Id_Walk, w.Fechahora, w.Elaboro, w.Responsable, w.JefeArea, w.VoBo, w.observaciones,
                   w.Id_Aeronave, a.Matricula, a.Tipo, a.Equipo, a.Procedencia
            FROM walkaround w
            LEFT JOIN aeronave a ON w.Id_Aeronave = a.Id_Aeronave
            ORDER BY w.Fechahora DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    $walkarounds = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($walkarounds);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>
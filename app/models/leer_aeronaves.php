<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../../app/models/conexion.php';

try {
    // Consulta SQL para seleccionar los datos de la tabla 'aeronave'
    $sql = "SELECT Id_Aeronave, Matricula, Tipo, Equipo FROM aeronave ORDER BY Matricula";
    
    // Preparar la sentencia
    $stmt = $pdo->prepare($sql);
    
    // Ejecutar la sentencia
    $stmt->execute();
    
    // Obtener todos los resultados como un array asociativo
    $aeronaves = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Enviar los datos como una respuesta JSON
    echo json_encode($aeronaves);

} catch (PDOException $e) {
    // Si hay un error en la base de datos (por ejemplo, la tabla no existe)
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>
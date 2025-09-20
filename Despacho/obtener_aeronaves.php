<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Configuración de la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "eolo";

try {
    // Crear conexión
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Verificar conexión
    if ($conn->connect_error) {
        throw new Exception('Error de conexión: ' . $conn->connect_error);
    }

    // Consulta para obtener aeronaves
    $sql = "SELECT Id_Aeronave, Matricula, Tipo, Equipo, Procedencia, Destino FROM aeronave ORDER BY Matricula";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }

    $aeronaves = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $aeronaves[] = $row;
        }
    }

    echo json_encode($aeronaves);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

if (isset($conn) && $conn) {
    $conn->close();
}
?>
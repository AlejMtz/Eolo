<?php
// obtener_aeropuertos.php
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
        throw new Exception('Error de conexión a la base de datos: ' . $conn->connect_error);
    }

    $termino = isset($_GET['q']) ? trim($_GET['q']) : '';
    
    if (strlen($termino) >= 2) {
        $stmt = $conn->prepare("
            SELECT 
                Id_Aeropuerto as id,
                Codigo_IATA as codigo_iata, 
                Codigo_OACI as codigo_oaci, 
                Nombre as nombre,
                Estado as estado,
                Pais as pais
            FROM aeropuertos 
            WHERE 
                Codigo_IATA LIKE ? OR 
                Codigo_OACI LIKE ? OR 
                Nombre LIKE ? OR
                Pais LIKE ? OR
                Estado LIKE ?
            ORDER BY 
                CASE 
                    WHEN Codigo_IATA = ? THEN 1
                    WHEN Codigo_OACI = ? THEN 2
                    WHEN Codigo_IATA LIKE ? THEN 3
                    WHEN Codigo_OACI LIKE ? THEN 4
                    ELSE 5
                END,
                Nombre
            LIMIT 15
        ");
        
        $likeTermino = "%$termino%";
        $stmt->bind_param("sssssssss", 
            $likeTermino, $likeTermino, $likeTermino, $likeTermino, $likeTermino,
            $termino, $termino, $likeTermino, $likeTermino
        );
    } else {
        // Si no hay término, devolver aeropuertos principales
        $stmt = $conn->prepare("
            SELECT 
                Id_Aeropuerto as id,
                Codigo_IATA as codigo_iata, 
                Codigo_OACI as codigo_oaci, 
                Nombre as nombre,
                Estado as estado,
                Pais as pais
            FROM aeropuertos 
            WHERE Codigo_IATA IN ('MEX', 'CUN', 'GDL', 'MTY', 'TIJ', 'BJX', 'PVR', 'SJD', 'HMO')
            ORDER BY Nombre 
            LIMIT 10
        ");
    }

    $stmt->execute();
    $result = $stmt->get_result();
    
    $aeropuertos = [];
    while ($row = $result->fetch_assoc()) {
        $aeropuertos[] = [
            'id' => $row['id'],
            'codigo_iata' => $row['codigo_iata'],
            'codigo_oaci' => $row['codigo_oaci'],
            'nombre' => $row['nombre'],
            'estado' => $row['estado'],
            'pais' => $row['pais'],
            'display' => "{$row['codigo_iata']} / {$row['codigo_oaci']} - {$row['nombre']} ({$row['pais']}, {$row['estado']})"
        ];
    }

    echo json_encode(['success' => true, 'aeropuertos' => $aeropuertos]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

// Cerrar conexión
if (isset($conn) && $conn) {
    $conn->close();
}
?>
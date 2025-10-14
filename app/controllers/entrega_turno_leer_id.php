<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../../app/models/conexion.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido.']);
    exit;
}

try {
    // Datos principales
    $sql_principal = "SELECT * FROM entregaturno WHERE Id_EntregaTurno = ?";
    $stmt_principal = $pdo->prepare($sql_principal);
    $stmt_principal->execute([$id]);
    $entrega = $stmt_principal->fetch(PDO::FETCH_ASSOC);
    
    if (!$entrega) {
        http_response_code(404);
        echo json_encode(['error' => 'Entrega no encontrada.']);
        exit;
    }
    
    // Equipos de comunicación
    $sql_comunicacion = "SELECT * FROM equipocomunicacion WHERE Entrega_Turno_Id = ?";
    $stmt_comunicacion = $pdo->prepare($sql_comunicacion);
    $stmt_comunicacion->execute([$id]);
    $equipos_comunicacion = $stmt_comunicacion->fetchAll(PDO::FETCH_ASSOC);
    
    // Equipos de oficina - INCLUYENDO COPIADORAS
    $sql_oficina = "SELECT * FROM equipooficina WHERE Entrega_Turno_Id = ?";
    $stmt_oficina = $pdo->prepare($sql_oficina);
    $stmt_oficina->execute([$id]);
    $equipos_oficina = $stmt_oficina->fetchAll(PDO::FETCH_ASSOC);
    
    // Extraer datos de copiadoras si existen
    $copiadoras_funciona = 1; // Valor por defecto
    $toner_estado = 'bueno'; // Valor por defecto
    
    foreach ($equipos_oficina as $equipo) {
        if ($equipo['Nombre'] === 'COPIADORAS') {
            $copiadoras_funciona = $equipo['Funciona'];
            $toner_estado = $equipo['Toner_Estado'];
            break;
        }
    }
    
    // Agregar datos de copiadoras al resultado principal
    $entrega['Copiadoras_Funciona'] = $copiadoras_funciona;
    $entrega['Toner_Estado'] = $toner_estado;
    $entrega['equipos_comunicacion'] = $equipos_comunicacion;
    $entrega['equipos_oficina'] = $equipos_oficina;
    
    echo json_encode($entrega);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al cargar la entrega: ' . $e->getMessage()]);
}
?>
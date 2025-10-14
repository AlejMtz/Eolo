<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Incluir conexión
require '../models/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
    exit;
}

try {
    // Datos principales de la entrega - con valores por defecto más específicos
    $fecha = isset($_POST['fecha']) ? trim($_POST['fecha']) : date('Y-m-d');
    $nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
    
    // Campos numéricos con validación más estricta
    $fondo_recibido = (isset($_POST['fondo_recibido']) && $_POST['fondo_recibido'] !== '') ? floatval($_POST['fondo_recibido']) : 0;
    $fondo_entregado = (isset($_POST['fondo_entregado']) && $_POST['fondo_entregado'] !== '') ? floatval($_POST['fondo_entregado']) : 0;
    $vales_gasolina = (isset($_POST['vales_gasolina']) && $_POST['vales_gasolina'] !== '') ? intval($_POST['vales_gasolina']) : 0;
    $vales_folio = isset($_POST['vales_folio']) ? trim($_POST['vales_folio']) : '';
    
    // Reporte aterrizajes - más robusto
    $reporte_aterrizaje = 0;
    if (isset($_POST['reporte_aterrizajes'])) {
        $reporte_aterrizaje = ($_POST['reporte_aterrizajes'] === 'si') ? 1 : 0;
    } // AQUÍ FALTABA CERRAR ESTE IF
    
    // NUEVO: Campos de copiadoras y toner - CORREGIDO (fuera del if anterior)
    $copiadoras_funciona = 1;
    if (isset($_POST['copiadoras_funciona'])) {
        $copiadoras_funciona = ($_POST['copiadoras_funciona'] === 'si') ? 1 : 0;
    }
    
    $toner_estado = 'bueno';
    if (isset($_POST['toner'])) {
        $toner_estado = ($_POST['toner'] === 'malo') ? 'malo' : 'bueno';
    }
    
    $aterrizajes_cantidad = (isset($_POST['aterrizajes_cantidad']) && $_POST['aterrizajes_cantidad'] !== '') ? intval($_POST['aterrizajes_cantidad']) : 0;
    $llegadas = (isset($_POST['llegadas']) && $_POST['llegadas'] !== '') ? intval($_POST['llegadas']) : 0;
    $salidas = (isset($_POST['salidas']) && $_POST['salidas'] !== '') ? intval($_POST['salidas']) : 0;
    $reporte_operaciones = isset($_POST['reporte_operaciones']) ? trim($_POST['reporte_operaciones']) : '';
    $operaciones_coordinadas = (isset($_POST['operaciones_coordinadas']) && $_POST['operaciones_coordinadas'] !== '') ? intval($_POST['operaciones_coordinadas']) : 0;
    $walk_arounds = (isset($_POST['walk_arounds']) && $_POST['walk_arounds'] !== '') ? intval($_POST['walk_arounds']) : 0;
    $caja_fuerte = isset($_POST['caja_fuerte']) ? trim($_POST['caja_fuerte']) : '';
    $fallas_comunicaciones = isset($_POST['fallas_comunicaciones']) ? trim($_POST['fallas_comunicaciones']) : '';
    $fallas_copiadoras = isset($_POST['fallas_copiadoras']) ? trim($_POST['fallas_copiadoras']) : '';
    $paquetes_hojas = (isset($_POST['paquetes_hojas']) && $_POST['paquetes_hojas'] !== '') ? intval($_POST['paquetes_hojas']) : 0;
    $firma_entrega = isset($_POST['firma_entrega']) ? trim($_POST['firma_entrega']) : '';
    $firma_recibe = isset($_POST['firma_recibe']) ? trim($_POST['firma_recibe']) : '';

    // Validar campos obligatorios
    if (empty($fecha) || empty($nombre)) {
        throw new Exception('Fecha y nombre son obligatorios.');
    }

    // Iniciar transacción
    $pdo->beginTransaction();

    // Insertar en tabla principal
    $sql_principal = "INSERT INTO entregaturno (
        Fecha, Nombre, Fondo, Vales_Gasolina, Vales_Gasolina_Folio, 
        Reporte_Aterrizaje, Aterrizajes_Cantidad, Total_Operaciones_Llegadas, 
        Total_Operaciones_Salidas, Reporte_Operaciones_Correo, Operaciones_Coordinadas, 
        Walk_Arounds, Caja_Fuerte_Contenido, Fallas_Comunicaciones, Fallas_Copiadoras, 
        Paquetes_Hojas, Firma_Entrega, Firma_Recibe
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt_principal = $pdo->prepare($sql_principal);
    
    // Usar fondo_recibido como valor principal
    $fondo = $fondo_recibido;
    
    $stmt_principal->execute([
        $fecha, $nombre, $fondo, $vales_gasolina, $vales_folio, 
        $reporte_aterrizaje, $aterrizajes_cantidad, $llegadas, 
        $salidas, $reporte_operaciones, $operaciones_coordinadas, 
        $walk_arounds, $caja_fuerte, $fallas_comunicaciones, $fallas_copiadoras, 
        $paquetes_hojas, $firma_entrega, $firma_recibe
    ]);

    $entrega_turno_id = $pdo->lastInsertId();

    // Insertar equipos de comunicación (simplificado para prueba)
    $equipos_comunicacion = [
        ['CELULAR ZTE', 1, 1, 1, 0], // Valores fijos temporalmente para prueba
        ['RADIO MOTOROLA', 2, 1, 1, 0],
        ['RADIO VHF Portátil', 2, 1, 1, 0],
        ['RADIO VHF Fijo', 1, 1, 0, 0]
    ];

    $sql_equipo = "INSERT INTO equipocomunicacion (Entrega_Turno_Id, Nombre, Cantidad, Cargado, Fallas) VALUES (?, ?, ?, ?, ?)";
    $stmt_equipo = $pdo->prepare($sql_equipo);

    foreach ($equipos_comunicacion as $equipo) {
        $stmt_equipo->execute([$entrega_turno_id, $equipo[0], $equipo[1], $equipo[3], $equipo[4]]);
    }

    // Insertar equipos de oficina - ACTUALIZADO con copiadoras
    $equipos_oficina = [
        ['ENGRAPADORAS', 1, 1, 1, NULL, NULL],
        ['PERFORADORAS', 2, 2, 2, NULL, NULL],
        ['COPIADORAS', 1, 1, 1, $copiadoras_funciona, $toner_estado] // NUEVO: incluye copiadoras
    ];

    // ACTUALIZADO: Agregar campos Funciona y Toner_Estado
    $sql_oficina = "INSERT INTO equipooficina (Entrega_Turno_Id, Nombre, Existencias, Entregadas, Recibidas, Funciona, Toner_Estado) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt_oficina = $pdo->prepare($sql_oficina);

    foreach ($equipos_oficina as $equipo) {
        $stmt_oficina->execute([$entrega_turno_id, $equipo[0], $equipo[1], $equipo[2], $equipo[3], $equipo[4], $equipo[5]]);
    }

    $pdo->commit();
    
    echo json_encode([
        'success' => 'Entrega de turno registrada correctamente.', 
        'id' => $entrega_turno_id,
        'debug' => 'Datos recibidos correctamente'
    ]);

} catch (PDOException $e) {
    // Rollback en caso de error de base de datos
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
    
} catch (Exception $e) {
    // Rollback en caso de otros errores
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
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
    $id_entrega = isset($_POST['id_entrega']) ? intval($_POST['id_entrega']) : 0;
    
    if ($id_entrega <= 0) {
        throw new Exception('ID de entrega inválido.');
    }

    // Datos principales
    $fecha = isset($_POST['fecha']) ? trim($_POST['fecha']) : date('Y-m-d');
    $nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
    $fondo_recibido = (isset($_POST['fondo_recibido']) && $_POST['fondo_recibido'] !== '') ? floatval($_POST['fondo_recibido']) : 0;
    $vales_gasolina = (isset($_POST['vales_gasolina']) && $_POST['vales_gasolina'] !== '') ? intval($_POST['vales_gasolina']) : 0;
    $vales_folio = isset($_POST['vales_folio']) ? trim($_POST['vales_folio']) : '';
    
    // Reporte aterrizajes
    $reporte_aterrizaje = 0;
    if (isset($_POST['reporte_aterrizajes'])) {
        $reporte_aterrizaje = ($_POST['reporte_aterrizajes'] === 'si') ? 1 : 0;
    }
    
    // Campos de copiadoras y toner
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

    $pdo->beginTransaction();

    // Actualizar tabla principal
    $sql_principal = "UPDATE entregaturno SET 
        Fecha = ?, Nombre = ?, Fondo = ?, Vales_Gasolina = ?, Vales_Gasolina_Folio = ?, 
        Reporte_Aterrizaje = ?, Aterrizajes_Cantidad = ?, Total_Operaciones_Llegadas = ?, 
        Total_Operaciones_Salidas = ?, Reporte_Operaciones_Correo = ?, Operaciones_Coordinadas = ?, 
        Walk_Arounds = ?, Caja_Fuerte_Contenido = ?, Fallas_Comunicaciones = ?, Fallas_Copiadoras = ?, 
        Paquetes_Hojas = ?, Firma_Entrega = ?, Firma_Recibe = ?
        WHERE Id_EntregaTurno = ?";

    $stmt_principal = $pdo->prepare($sql_principal);
    
    // Usar fondo_recibido como valor principal
    $fondo = $fondo_recibido;
    
    $stmt_principal->execute([
        $fecha, $nombre, $fondo, $vales_gasolina, $vales_folio, 
        $reporte_aterrizaje, $aterrizajes_cantidad, $llegadas, 
        $salidas, $reporte_operaciones, $operaciones_coordinadas, 
        $walk_arounds, $caja_fuerte, $fallas_comunicaciones, $fallas_copiadoras, 
        $paquetes_hojas, $firma_entrega, $firma_recibe, $id_entrega
    ]);

    // Actualizar copiadoras en equipooficina
    $sql_copiadoras = "UPDATE equipooficina SET Funciona = ?, Toner_Estado = ? WHERE Entrega_Turno_Id = ? AND Nombre = 'COPIADORAS'";
    $stmt_copiadoras = $pdo->prepare($sql_copiadoras);
    $stmt_copiadoras->execute([$copiadoras_funciona, $toner_estado, $id_entrega]);

    $pdo->commit();
    
    echo json_encode(['success' => 'Entrega de turno actualizada correctamente.']);

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
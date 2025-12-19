<?php
require_once(__DIR__ . '/../../vendors/tcpdf/tcpdf.php');

class PDFGenerator {
    private $pdf;
    
    public function __construct() {
        $this->pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        $this->configurePDF();
    }
    
    private function configurePDF() {
        $this->pdf->SetMargins(15, 20, 15);
        $this->pdf->SetAutoPageBreak(TRUE, 15);
        $this->pdf->SetFont('helvetica', '', 10);
    }
    
    /**
     * Genera PDF para Entrega de Turno
     */
    public function generarEntregaTurno($id) {
        require_once('../models/conexion.php');
        
        try {
            // Obtener datos de la entrega
            $sql = "SELECT * FROM entregaturno WHERE Id_EntregaTurno = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
            $entrega = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$entrega) {
                die('Entrega no encontrada');
            }
            
            // Obtener equipos
            $equipos_comunicacion = $this->getEquiposComunicacion($pdo, $id);
            $equipos_oficina = $this->getEquiposOficina($pdo, $id);
            
            $this->pdf->AddPage();
            $this->generarCabeceraEntregaTurno($entrega);
            $this->generarEquiposComunicacionPDF($equipos_comunicacion);
            $this->generarEquiposOficinaPDF($equipos_oficina);
            $this->generarCopiadorasPDF($equipos_oficina, $entrega);
            $this->generarFondoYDocumentacionPDF($entrega);
            
            $this->generarCajaFuerteYFirmasPDF($entrega);

            $this->pdf->Output('entrega_turno_' . $id . '.pdf', 'I');
            return true;
            
        } catch (Exception $e) {
            die('Error al generar PDF: ' . $e->getMessage());
        }
    }

    /**
 * Genera PDF para Walkaround
 */
public function generarWalkaround($id) {
    require_once('../models/conexion.php');
    
    try {
        // Obtener datos del walkaround 
        $sql = "SELECT w.*, a.Matricula, a.Equipo, a.Tipo 
                FROM walkaround w 
                LEFT JOIN aeronave a ON w.Id_Aeronave = a.Id_Aeronave 
                WHERE w.Id_Walk = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        $walkaround = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$walkaround) {
            die('Walkaround no encontrado');
        }
        
        // Obtener componentes con la nueva estructura
        $componentes = $this->getComponentesWalkaround($pdo, $id);
        
        // Primera página: Cabecera y componentes en tabla
        $this->pdf->AddPage();
        $this->generarCabeceraWalkaround($walkaround);
        $this->generarComponentesWalkaroundPDF($componentes, $walkaround['Tipo']);
        
        // Segunda página: Diagrama
        $this->generarDiagrama($walkaround['Tipo']);
        $this->generarObservacionesWalkaroundPDF($walkaround);
        $this->generarFirmasWalkaroundPDF($walkaround);
        
        $this->pdf->Output('walkaround_' . $id . '.pdf', 'I');
        return true;
        
    } catch (Exception $e) {
        ob_clean();
        die('Error al generar PDF: ' . $e->getMessage());
    }
}


/**
 * Genera PDF para Remisión de Combustible
 */
public function generarRemisionCombustible($id) {
    require_once('../models/conexion.php');
    
    try {
        // Obtener datos de la remisión - SQL SIMPLIFICADO
        $sql = "SELECT r.*, a.Matricula, a.Equipo, a.Tipo 
                FROM remision r 
                LEFT JOIN aeronave a ON r.Id_Aeronave = a.Id_Aeronave 
                WHERE r.Id_Remision = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        $remision = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$remision) {
            die('Remisión no encontrada');
        }
        
        // Obtener datos adicionales si es necesario
        $estacion = "Eolo Plus";
        $equipo = "PIPA1 - Autotanque"; // Cambiado a PIPA1 según imagen
        $producto = "TURBOSINA"; // Cambiado a TURBOSINA según imagen
        
        $this->pdf->AddPage('P');
        $this->generarCabeceraRemision($remision, $estacion, $equipo, $producto);
        $this->generarDatosRemision($remision);
        $this->generarServiciosCombustible($remision);
        $this->generarObservacionesFirmas($remision);
        
        $this->pdf->Output('remision_combustible_' . $id . '.pdf', 'I');
        return true;
        
    } catch (Exception $e) {
        ob_clean();
        die('Error al generar PDF de remisión: ' . $e->getMessage());
    }
}
    

/**
 * CABECERA REMISIÓN DE COMBUSTIBLE - COMPACTA
 */
private function generarCabeceraRemision($remision, $estacion, $equipo, $producto) {
    // Configurar márgenes pequeños
    $this->pdf->SetMargins(10, 8, 10);
    
    // Logo EOLO pequeño
    $logoPath = __DIR__ . '/../../public/assets/images/eolo_logo.png';
    if (file_exists($logoPath)) {
        $this->pdf->Image($logoPath, 10, 6, 12, 0, 'PNG');
    }
    
    // Título EOLO - tamaño mediano
    $this->pdf->SetFont('helvetica', 'B', 16);
    $this->pdf->SetY(5);
    $this->pdf->SetX(25);
    $this->pdf->Cell(0, 8, 'E O L O', 0, 1, 'L');
    
    // Subtítulo "Combustibles"
    $this->pdf->SetFont('helvetica', 'B', 12);
    $this->pdf->SetX(25);
    $this->pdf->Cell(0, 6, 'Combustibles', 0, 1, 'L');
    
    // Información de producto
    $this->pdf->SetFont('helvetica', '', 10);
    $this->pdf->SetX(25);
    $this->pdf->Cell(0, 6, 'Remisión Eolo Plus S.A. de C.V.', 0, 1, 'L');
    
    // Línea divisoria
    $this->pdf->SetY(25);
    $this->pdf->Line(10, $this->pdf->GetY(), 200, $this->pdf->GetY());
    $this->pdf->Ln(2);
    
    // Sección de información de la remisión
    $this->pdf->SetFont('helvetica', 'B', 12);
    $this->pdf->Cell(50, 6, 'Remisión: ' . $remision['Id_Remision'], 0, 0, 'L');
    
    // OV
    $this->pdf->SetFont('helvetica', 'B', 10);
    $this->pdf->Cell(15, 6, 'OV:', 0, 0, 'L');
    $this->pdf->SetFont('helvetica', '', 10);
    $ov_text = isset($remision['Ov']) && !empty($remision['Ov']) ? $remision['Ov'] : '______';
    $this->pdf->Cell(0, 6, $ov_text, 0, 1, 'L');
    
    $this->pdf->Ln(2);
}

/**
 * DATOS DE LA REMISIÓN - COMPACTO SIN PRESIÓN
 */
private function generarDatosRemision($remision) {
    $this->pdf->SetFont('helvetica', '', 10); // Un poquito más grande
    
    // PRIMERA COLUMNA (Izquierda) - Datos fijos
    $x_pos = 10;
    $this->pdf->SetX($x_pos);
    
    // Estación
    $this->pdf->Cell(35, 6, 'Estación:', 0, 0, 'L');
    $this->pdf->Cell(45, 6, 'Eolo Plus', 0, 1, 'L');
    
    // Equipo
    $this->pdf->SetX($x_pos);
    $this->pdf->Cell(35, 6, 'Equipo:', 0, 0, 'L');
    $this->pdf->Cell(45, 6, 'PIPA1 - Autotanque', 0, 1, 'L');
    
    // Producto
    $this->pdf->SetX($x_pos);
    $this->pdf->Cell(35, 6, 'Prod.:', 0, 0, 'L');
    $this->pdf->Cell(45, 6, 'TURBOSINA', 0, 1, 'L');
    
    // Operador
    $this->pdf->SetX($x_pos);
    $this->pdf->Cell(35, 6, 'Operador:', 0, 0, 'L');
    $this->pdf->Cell(45, 6, $remision['Operador'] ?? '', 0, 1, 'L');
    
    // SEGUNDA COLUMNA (Derecha)
    $x_pos = 100;
    $this->pdf->SetY(33); // Alinear con primera columna
    
    // Fecha
    $this->pdf->SetX($x_pos);
    $this->pdf->Cell(40, 6, 'Fecha:', 0, 0, 'L');
    $fecha_formateada = date('d/m/Y', strtotime($remision['Fecha']));
    $this->pdf->Cell(45, 6, $fecha_formateada, 0, 1, 'L');
    
    // Nº Económico
    $this->pdf->SetX($x_pos);
    $this->pdf->Cell(40, 6, 'Nº Económico:', 0, 0, 'L');
    $this->pdf->Cell(45, 6, 'EP01', 0, 1, 'L');
    
    // Equipo Vehículo
    $this->pdf->SetX($x_pos);
    $this->pdf->Cell(40, 6, 'Equipo:', 0, 0, 'L');
    $this->pdf->Cell(45, 6, 'HINO Serie 500', 0, 1, 'L');
    
    // Placas
    $this->pdf->SetX($x_pos);
    $this->pdf->Cell(40, 6, 'Placas:', 0, 0, 'L');
    $this->pdf->Cell(45, 6, 'LC-44-020', 0, 1, 'L');
    
    // Línea divisoria
    $this->pdf->SetY(58);
    $this->pdf->Line(10, $this->pdf->GetY(), 200, $this->pdf->GetY());
    $this->pdf->Ln(4);
    
    // SECCIÓN VUELO
    $this->pdf->SetFont('helvetica', 'B', 11);
    $this->pdf->Cell(0, 7, 'Vuelo', 0, 1, 'L');
    
    $this->pdf->SetFont('helvetica', '', 10);
    
    // Cliente
    $this->pdf->Cell(35, 6, 'Cliente:', 0, 0, 'L');
    $this->pdf->Cell(70, 6, $remision['Cliente'] ?? '', 0, 1, 'L');
    
    // Requisición
    $this->pdf->Cell(35, 6, 'Requisición:', 0, 0, 'L');
    $requisicion = isset($remision['Requision']) && !empty($remision['Requision']) ? $remision['Requision'] : '______';
    $this->pdf->Cell(70, 6, $requisicion, 0, 1, 'L');
    
    // Forma de Pago
    $this->pdf->Cell(35, 6, 'Forma de Pago:', 0, 0, 'L');
    $forma_pago = isset($remision['FormaPago']) ? $remision['FormaPago'] : (isset($remision['pago']) ? $remision['pago'] : '');
    $this->pdf->Cell(70, 6, $forma_pago, 0, 1, 'L');
    
    // Línea divisoria
    $this->pdf->SetY(87);
    $this->pdf->Line(10, $this->pdf->GetY(), 200, $this->pdf->GetY());
    $this->pdf->Ln(4);
    
    // SECCIÓN AERONAVE
    $this->pdf->SetFont('helvetica', 'B', 11);
    $this->pdf->Cell(0, 7, 'Aeronave', 0, 1, 'L');
    
    $this->pdf->SetFont('helvetica', '', 10);
    
    // Tipo
    $this->pdf->Cell(35, 6, 'Tipo:', 0, 0, 'L');
    $this->pdf->Cell(70, 6, $remision['Tipo'] ?? '', 0, 1, 'L');
    
    // Matrícula
    $this->pdf->Cell(35, 6, 'Matrícula:', 0, 0, 'L');
    $this->pdf->Cell(70, 6, $remision['Matricula'] ?? '', 0, 1, 'L');
    
    // Equipo
    $this->pdf->Cell(35, 6, 'Equipo:', 0, 0, 'L');
    $this->pdf->Cell(70, 6, $remision['Equipo'] ?? '', 0, 1, 'L');
    
    // Línea divisoria
    $this->pdf->SetY(116);
    $this->pdf->Line(10, $this->pdf->GetY(), 200, $this->pdf->GetY());
    $this->pdf->Ln(4);
}

/**
 * SERVICIOS DE COMBUSTIBLE - SIN PRESIÓN DIF.
 */
private function generarServiciosCombustible($remision) {
    // Título Servicio
    $this->pdf->SetFont('helvetica', 'B', 10);
    $this->pdf->Cell(0, 6, 'Servicio', 0, 1, 'L');
    
    // Anchos de columnas - más espacio sin Presión Dif.
    $anchos = [
        'concepto' => 35,
        'hora' => 25,
        'lectura' => 60
    ];
    
    // Cabecera de tabla
    $this->pdf->SetFont('helvetica', 'B', 9);
    $this->pdf->SetFillColor(240, 240, 240);
    
    $this->pdf->Cell($anchos['concepto'], 8, '', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['hora'], 8, 'Hora', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['lectura'], 8, 'Lectura', 1, 1, 'C', true);
    
    $this->pdf->SetFont('helvetica', '', 9);
    
    // Función para formatear horas
    $formatearHora = function($hora) {
        if (empty($hora) || $hora == '00:00:00') {
            return '';
        }
        return str_replace(':', ' ', substr($hora, 0, 5));
    };
    
    // Función para formatear números
    $formatearNumero = function($numero) {
        if (!is_numeric($numero)) return $numero;
        $entero = intval($numero);
        $cadena = strval($entero);
        $formateado = '';
        $longitud = strlen($cadena);
        for ($i = 0; $i < $longitud; $i++) {
            $formateado .= $cadena[$i];
            if (($longitud - $i - 1) % 3 == 0 && $i < $longitud - 1) {
                $formateado .= ' ';
            }
        }
        return $formateado;
    };
    
    // Fila Llegada
    $this->pdf->Cell($anchos['concepto'], 10, 'Llegada:', 1, 0, 'L');
    $hora_llegada = isset($remision['HoraLlegada']) ? $formatearHora($remision['HoraLlegada']) : '';
    $this->pdf->Cell($anchos['hora'], 10, $hora_llegada, 1, 0, 'C');
    $this->pdf->Cell($anchos['lectura'], 10, '', 1, 1, 'C');
    
    // Fila Final
    $this->pdf->Cell($anchos['concepto'], 10, 'Final:', 1, 0, 'L');
    $hora_final = isset($remision['HoraFinal']) ? $formatearHora($remision['HoraFinal']) : '16 30';
    $lec_final = isset($remision['LecFinal']) ? $formatearNumero($remision['LecFinal']) : '9 139 443';
    $this->pdf->Cell($anchos['hora'], 10, $hora_final, 1, 0, 'C');
    $this->pdf->Cell($anchos['lectura'], 10, $lec_final, 1, 1, 'C');
    
    // Fila Inicial
    $this->pdf->Cell($anchos['concepto'], 10, 'Inicial:', 1, 0, 'L');
    $hora_inicial = isset($remision['HoraInicial']) ? $formatearHora($remision['HoraInicial']) : '11 39';
    $lec_inicial = isset($remision['LecInicial']) ? $formatearNumero($remision['LecInicial']) : '9 136 201';
    $this->pdf->Cell($anchos['hora'], 10, $hora_inicial, 1, 0, 'C');
    $this->pdf->Cell($anchos['lectura'], 10, $lec_inicial, 1, 1, 'C');
    
    // Fila Litros
    $this->pdf->Cell($anchos['concepto'], 10, 'Litros:', 1, 0, 'L');
    $this->pdf->Cell($anchos['hora'], 10, '', 1, 0, 'C');
    $litros_tot = isset($remision['LitrosTot']) ? $formatearNumero($remision['LitrosTot']) : '3 742';
    $this->pdf->Cell($anchos['lectura'], 10, $litros_tot, 1, 1, 'C');
    
    $this->pdf->Ln(4);
    
    // Observación
    $this->pdf->SetFont('helvetica', 'B', 9);
    $this->pdf->Cell(12, 5, 'Obs:', 0, 0, 'L');
    
    $this->pdf->SetFont('helvetica', '', 9);
    $observacion = isset($remision['Observaciones']) && !empty($remision['Observaciones']) ? 
                   $remision['Observaciones'] : 'Recirculación de combustible por filtros.';
    $this->pdf->MultiCell(0, 5, $observacion, 0, 'L');
    
    $this->pdf->SetY($this->pdf->GetY() + 2);
    $this->pdf->Line(10, $this->pdf->GetY(), 200, $this->pdf->GetY());
    $this->pdf->Ln(3);
}

/**
 * OBSERVACIONES Y FIRMAS - CON MÁS ESPACIO
 */
private function generarObservacionesFirmas($remision) {
    // Texto de aceptación
    $this->pdf->SetFont('helvetica', '', 9);
    
    $texto_aceptacion = "Acepto ser el representante del cliente y aeronave descrita por lo que me obligo a pagar a Eolo Plus S.A. de C.V. el importe total que se haya generado por este servicio.\nAclaraciones y quejas: soporte@eolo.com.mx";
    
    $this->pdf->MultiCell(0, 20, $texto_aceptacion, 0, 'L');
    
    $this->pdf->Ln(8);
    
    // FIRMAS 
    $ancho_celda = 75;
    $alto_linea = 1;
    $espacio_horizontal = 20;
    
    // PRIMERA FILA
    $y_pos = $this->pdf->GetY();
    
    // Cliente
    $this->pdf->SetX(20);
    $this->pdf->Cell($ancho_celda, $alto_linea, '', 'T', 0, 'C');
    
    // Operador
    $this->pdf->SetX(20 + $ancho_celda + $espacio_horizontal);
    $this->pdf->Cell($ancho_celda, $alto_linea, '', 'T', 1, 'C');
    
    // Nombres primera fila
    $this->pdf->SetY($y_pos + $alto_linea);
    $this->pdf->SetX(20);
    $this->pdf->SetFont('helvetica', '', 8);
    
    $this->pdf->Cell($ancho_celda, 5, 'Cliente', 0, 0, 'C');
    $this->pdf->SetX(20 + $ancho_celda + $espacio_horizontal);
    $this->pdf->Cell($ancho_celda, 5, 'Operador', 0, 1, 'C');
    
    // SEGUNDA FILA
    $y_pos = $this->pdf->GetY() + 20;
    $this->pdf->SetY($y_pos);
    
    // Cobranza
    $this->pdf->SetX(20);
    $this->pdf->SetFont('helvetica', 'B', 9);
    $this->pdf->Cell($ancho_celda, $alto_linea, '', 'T', 0, 'C');
    
    // Servicios Comerciales
    $this->pdf->SetX(20 + $ancho_celda + $espacio_horizontal);
    $this->pdf->Cell($ancho_celda, $alto_linea, '', 'T', 1, 'C');
    
    // Nombres segunda fila
    $this->pdf->SetY($y_pos + $alto_linea);
    $this->pdf->SetX(20);
    $this->pdf->SetFont('helvetica', '', 8);
    
    $this->pdf->Cell($ancho_celda, 5, 'Cobranza', 0, 0, 'C');
    $this->pdf->SetX(20 + $ancho_celda + $espacio_horizontal);
    $this->pdf->Cell($ancho_celda, 5, 'Servicios Comerciales', 0, 1, 'C');
}
    /**
     * CABECERA ENTREGA DE TURNO
     */
    private function generarCabeceraEntregaTurno($entrega, $segundaPagina = false) {
        // Logo EOLO (izquierda)
        $logoPath = __DIR__ . '/../../public/assets/images/eolo_logo.png';
        if (file_exists($logoPath)) {
            $this->pdf->Image($logoPath, 15, 10, 20, 0, 'PNG', '', 'T', false, 300, '', false, false, 0, false, false, false);
        }
        
        // Título centrado
        $this->pdf->SetFont('helvetica', 'B', 14);
        $this->pdf->SetY(12);
        $this->pdf->Cell(0, 10, 'ENTREGA DE TURNO, OFICINA DE DESPACHO', 0, 1, 'C');

        if (!$segundaPagina) {
            $this->pdf->SetTextColor(255, 0, 0);
            $this->pdf->SetY(5);
            $this->pdf->SetX(150);
            $this->pdf->SetFont('helvetica', 'B', 12);
            $this->pdf->Cell(0, 6, 'ID DEL REPORTE: ' . $entrega['Id_EntregaTurno'], 0, 1);
            $this->pdf->Ln(6);
        }

        $this->pdf->SetTextColor(0, 0, 0); // Negro

        // Información de fecha y nombre
        $this->pdf->SetFont('helvetica', '', 10);
        $this->pdf->SetY(25);
        $fecha_formateada = date('d/m/Y', strtotime($entrega['Fecha']));
        $this->pdf->Cell(0, 6, 'FECHA: ' . $fecha_formateada . '    NOMBRE: ' . $entrega['Nombre'], 0, 1);
        
    }
    
/**
 * CABECERA WALKAROUND CON LOGO
 */
private function generarCabeceraWalkaround($walkaround) {
    // Logo EOLO (izquierda)
    $logoPath = __DIR__ . '/../../public/assets/images/eolo_logo.png';
    if (file_exists($logoPath)) {
        $this->pdf->Image($logoPath, 15, 10, 20, 0, 'PNG', '', 'T', false, 300, '', false, false, 0, false, false, false);
    }
    
    // Título EOLO centrado
    $this->pdf->SetFont('helvetica', 'B', 16);
    $this->pdf->SetY(12);
    $this->pdf->Cell(0, 10, 'E O L O', 0, 1, 'C');

    $this->pdf->SetFont('helvetica', 'B', 12);
    $this->pdf->SetY(5);
    $this->pdf->SetX(150);
    $this->pdf->SetTextColor(255, 0, 0); // Rojo
    $this->pdf->Cell(0, 6, 'ID DEL REPORTE: ' . $walkaround['Id_Walk'], 0, 1);

    $this->pdf->SetTextColor(0, 0, 0); // Negro

    // Título centrado
    $this->pdf->SetFont('helvetica', 'B', 14);
    $this->pdf->SetY(25);
    
    // Determinar tipo de walkaround
    $tipoWalkaround = '';
    if ($walkaround['entrada'] == 1) {
        $tipoWalkaround = 'ENTRADA';
    } elseif ($walkaround['salida'] == 1) {
        $tipoWalkaround = 'SALIDA';
    }
    
    $this->pdf->Cell(0, 10, 'Reporte de Inspección de Aeronave - Walk Around (' . $tipoWalkaround . ')', 0, 1, 'C');
    
    // Tabla de información
    $this->pdf->SetFont('helvetica', '', 9); 
    $this->pdf->SetY(35);
    
    $anchos = [
        'fecha' => 28,    // Fecha
        'hora' => 20,     // Hora  
        'tipo' => 32,     // Tipo Aeronave
        'matricula' => 28, // Matrícula
        'procedencia' => 36, // Procedencia
        'destino' => 36    // Destino
    ];
    
    // Cabecera de la tabla 
    $this->pdf->SetFillColor(240, 240, 240);
    $this->pdf->Cell($anchos['fecha'], 8, 'FECHA', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['hora'], 8, 'HORA', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['tipo'], 8, 'TIPO AERONAVE', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['matricula'], 8, 'MATRÍCULA', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['procedencia'], 8, 'PROCEDENCIA', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['destino'], 8, 'DESTINO', 1, 1, 'C', true);
    
    $fecha = 'No especificada';
    $hora = 'No especificada';
    
    if (isset($walkaround['FechaHora']) && !empty($walkaround['FechaHora']) && $walkaround['FechaHora'] != '0000-00-00 00:00:00') {
        // Convertir el DateTime a fecha y hora separados
        $fechaHora = DateTime::createFromFormat('Y-m-d H:i:s', $walkaround['FechaHora']);
        
        if ($fechaHora !== false) {
            $fecha = $fechaHora->format('d/m/Y');
            $hora = $fechaHora->format('H:i');
        } else {
            // Si el formato falla, intentar con strtotime
            $timestamp = strtotime($walkaround['FechaHora']);
            if ($timestamp !== false) {
                $fecha = date('d/m/Y', $timestamp);
                $hora = date('H:i', $timestamp);
            }
        }
    }
    
    // Función auxiliar para truncar texto largo
    $truncarTexto = function($texto, $maxLength) {
        if (strlen($texto) > $maxLength) {
            return substr($texto, 0, $maxLength - 2) . '..';
        }
        return $texto;
    };
        
    // Datos de la tabla
    $this->pdf->Cell($anchos['fecha'], 10, $fecha, 1, 0, 'C');
    $this->pdf->Cell($anchos['hora'], 10, $hora, 1, 0, 'C');
    $this->pdf->Cell($anchos['tipo'], 10, $truncarTexto(isset($walkaround['Equipo']) ? $walkaround['Equipo'] : 'No esp.', 15), 1, 0, 'C');
    $this->pdf->Cell($anchos['matricula'], 10, $truncarTexto(isset($walkaround['Matricula']) ? $walkaround['Matricula'] : 'No esp.', 10), 1, 0, 'C');
    $this->pdf->Cell($anchos['procedencia'], 10, $truncarTexto(isset($walkaround['Procedencia']) ? $walkaround['Procedencia'] : 'No esp.', 12), 1, 0, 'C');
    $this->pdf->Cell($anchos['destino'], 10, $truncarTexto(isset($walkaround['Destino']) ? $walkaround['Destino'] : 'No esp.', 12), 1, 1, 'C');
    
}
    
    /**
     * COMPONENTES WALKAROUND EN TABLA CON TIPOS DE DAÑO
     */
    private function generarComponentesWalkaroundPDF($componentes, $tipoAeronave) {
        $tipo = strtolower($tipoAeronave);
        
        $this->pdf->SetFont('helvetica', 'B', 12);
        if ($tipo === 'avion') {
            $this->pdf->Cell(0, 10, 'COMPONENTES - AVIONES', 0, 1);
        } else {
            $this->pdf->Cell(0, 10, 'COMPONENTES - HELICÓPTEROS', 0, 1);
        }
        
        // Configurar anchos de columnas para los tipos de daño
        $anchoComponente = 60;
        $anchoCheckbox = 15;
        
        // Cabecera de la tabla con tipos de daño
        $this->pdf->SetFont('helvetica', 'B', 7);
        $this->pdf->SetFillColor(240, 240, 240);
        
        $this->pdf->Cell($anchoComponente, 8, 'COMPONENTE', 1, 0, 'C', true);
        $this->pdf->Cell($anchoCheckbox, 8, 'DER', 1, 0, 'C', true);
        $this->pdf->Cell($anchoCheckbox, 8, 'IZQ', 1, 0, 'C', true);
        $this->pdf->Cell($anchoCheckbox, 8, 'GOLPE', 1, 0, 'C', true);
        $this->pdf->Cell($anchoCheckbox, 8, 'RAYÓN', 1, 0, 'C', true);
        $this->pdf->Cell($anchoCheckbox, 8, 'FISURA', 1, 0, 'C', true);
        $this->pdf->Cell($anchoCheckbox, 8, 'QUEBR.', 1, 0, 'C', true);
        $this->pdf->Cell($anchoCheckbox, 8, 'PINT.', 1, 0, 'C', true);
        $this->pdf->Cell($anchoCheckbox, 8, 'OTRO', 1, 1, 'C', true);
        
        $this->pdf->SetFont('helvetica', '', 7);
        $this->pdf->SetFillColor(255, 255, 255);
        
        $componentesPredefinidos = $this->getComponentesPorTipo($tipo);
        
        foreach ($componentesPredefinidos as $componente) {
            $componenteGuardado = $this->findComponente($componentes, $componente['id']);
            
            // ALTURA FIJA PARA TODAS LAS FILAS
            $alturaFila = 8;
            
            // Guardar posición Y inicial
            $yInicial = $this->pdf->GetY();
            
            // 1. COMPONENTE
            $textoComponente = $this->truncarTexto($componente['nombre'], 40);
            $this->pdf->Cell($anchoComponente, $alturaFila, $textoComponente, 1, 0, 'L');

            // 3. DERECHO
            $xCheckbox = $this->pdf->GetX();
            $this->pdf->Cell($anchoCheckbox, $alturaFila, '', 1, 0, 'C');
            $this->dibujarCheckbox($componenteGuardado && $componenteGuardado['derecho'] == 1, 
                                $xCheckbox + ($anchoCheckbox/2 - 1.5), 
                                $yInicial + ($alturaFila/2 - 1.5));
            
              // 2. IZQUIERDO
            $xCheckbox = $this->pdf->GetX();
            $this->pdf->Cell($anchoCheckbox, $alturaFila, '', 1, 0, 'C');
            $this->dibujarCheckbox($componenteGuardado && $componenteGuardado['izquierdo'] == 1, 
                                $xCheckbox + ($anchoCheckbox/2 - 1.5), 
                                $yInicial + ($alturaFila/2 - 1.5));                    
            
            // 4. GOLPE
            $xCheckbox = $this->pdf->GetX();
            $this->pdf->Cell($anchoCheckbox, $alturaFila, '', 1, 0, 'C');
            $this->dibujarCheckbox($componenteGuardado && $componenteGuardado['golpe'] == 1, 
                                $xCheckbox + ($anchoCheckbox/2 - 1.5), 
                                $yInicial + ($alturaFila/2 - 1.5));
            
            // 5. RAYÓN
            $xCheckbox = $this->pdf->GetX();
            $this->pdf->Cell($anchoCheckbox, $alturaFila, '', 1, 0, 'C');
            $this->dibujarCheckbox($componenteGuardado && $componenteGuardado['rayon'] == 1, 
                                $xCheckbox + ($anchoCheckbox/2 - 1.5), 
                                $yInicial + ($alturaFila/2 - 1.5));
            
            // 6. FISURA
            $xCheckbox = $this->pdf->GetX();
            $this->pdf->Cell($anchoCheckbox, $alturaFila, '', 1, 0, 'C');
            $this->dibujarCheckbox($componenteGuardado && $componenteGuardado['fisura'] == 1, 
                                $xCheckbox + ($anchoCheckbox/2 - 1.5), 
                                $yInicial + ($alturaFila/2 - 1.5));
            
            // 7. QUEBRADO
            $xCheckbox = $this->pdf->GetX();
            $this->pdf->Cell($anchoCheckbox, $alturaFila, '', 1, 0, 'C');
            $this->dibujarCheckbox($componenteGuardado && $componenteGuardado['quebrado'] == 1, 
                                $xCheckbox + ($anchoCheckbox/2 - 1.5), 
                                $yInicial + ($alturaFila/2 - 1.5));
            
            // 8. PINTURA CUARTEADA
            $xCheckbox = $this->pdf->GetX();
            $this->pdf->Cell($anchoCheckbox, $alturaFila, '', 1, 0, 'C');
            $this->dibujarCheckbox($componenteGuardado && $componenteGuardado['pinturaCuarteada'] == 1, 
                                $xCheckbox + ($anchoCheckbox/2 - 1.5), 
                                $yInicial + ($alturaFila/2 - 1.5));
            
            // 9. OTRO DAÑO
            $xCheckbox = $this->pdf->GetX();
            $this->pdf->Cell($anchoCheckbox, $alturaFila, '', 1, 1, 'C');
            $this->dibujarCheckbox($componenteGuardado && $componenteGuardado['otroDano'] == 1, 
                                $xCheckbox + ($anchoCheckbox/2 - 1.5), 
                                $yInicial + ($alturaFila/2 - 1.5));
            
            if ($this->pdf->GetY() > 250) {
                $this->pdf->AddPage();
                // Redibujar cabecera de tabla si es nueva página
                $this->pdf->SetFont('helvetica', 'B', 7);
                $this->pdf->SetFillColor(240, 240, 240);
                $this->pdf->Cell($anchoComponente, 8, 'COMPONENTE', 1, 0, 'C', true);
                $this->pdf->Cell($anchoCheckbox, 8, 'DER', 1, 0, 'C', true);
                $this->pdf->Cell($anchoCheckbox, 8, 'IZQ', 1, 0, 'C', true);
                $this->pdf->Cell($anchoCheckbox, 8, 'GOLPE', 1, 0, 'C', true);
                $this->pdf->Cell($anchoCheckbox, 8, 'RAYÓN', 1, 0, 'C', true);
                $this->pdf->Cell($anchoCheckbox, 8, 'FISURA', 1, 0, 'C', true);
                $this->pdf->Cell($anchoCheckbox, 8, 'QUEBR.', 1, 0, 'C', true);
                $this->pdf->Cell($anchoCheckbox, 8, 'PINT.', 1, 0, 'C', true);
                $this->pdf->Cell($anchoCheckbox, 8, 'OTRO', 1, 1, 'C', true);
                $this->pdf->SetFont('helvetica', '', 7);
            }
        }
        
        $this->pdf->Ln(8);
    }

    /**
     * EQUIPOS DE COMUNICACIÓN
     */
    private function generarEquiposComunicacionPDF($equipos) {
        $this->pdf->SetFont('helvetica', 'B', 12);
        $this->pdf->Cell(0, 8, 'EQUIPO DE COMUNICACIONES', 0, 1);
        $this->pdf->SetFont('helvetica', 'B', 10);
        $this->pdf->Cell(0, 6, 'ENTREGADOS', 0, 1);
        
        // Cabecera de la tabla
        $this->pdf->SetFont('helvetica', 'B', 9);
        $this->pdf->Cell(60, 8, 'EQUIPO', 1, 0, 'C');
        $this->pdf->Cell(25, 8, 'CANTIDAD', 1, 0, 'C');
        $this->pdf->Cell(35, 8, 'ENTREGADO', 1, 0, 'C');
        $this->pdf->Cell(70, 8, 'ESTADO', 1, 1, 'C');
        
        $this->pdf->SetFont('helvetica', '', 9);
        
        // Generar filas de equipos
        $this->generarFilaEquipoComCorregida('CELULAR ZTE', '1', $equipos, 'CELULAR ZTE', 'Cargado');
        $this->generarFilaEquipoComCorregida('RADIO MOTOROLA', '2', $equipos, 'RADIO MOTOROLA', 'Cargado');
        $this->generarFilaEquipoComCorregida('RADIO VHF Portátil', '2', $equipos, 'RADIO VHF Portátil', 'Cargado');
        $this->generarFilaEquipoComCorregida('RADIO VHF Fijo', '1', $equipos, 'RADIO VHF Fijo', 'Fallas');
        
        $this->pdf->Ln(8);
    }
    
    /**
     * GENERAR FILA DE EQUIPO DE COMUNICACIÓN CORREGIDA
     */
    private function generarFilaEquipoComCorregida($nombre, $cantidad, $equipos, $clave, $estadoTexto) {
        // Guardar posición Y inicial
        $y_inicial = $this->pdf->GetY();
        
        // Columna 1: Nombre del equipo
        $this->pdf->Cell(60, 12, $nombre, 1);
        
        // Columna 2: Cantidad
        $this->pdf->Cell(25, 12, $cantidad, 1, 0, 'C');
        
        // Columna 3: Entregado (checkbox centrado)
        $x_entregado = $this->pdf->GetX();
        $y_entregado = $this->pdf->GetY();
        $this->pdf->Cell(35, 12, '', 1);
        $this->dibujarCheckbox(true, $x_entregado + 15, $y_entregado + 4);
        
        // Columna 4: Estado - CENTRADO PERFECTO
        $x_estado = $this->pdf->GetX();
        $y_estado = $this->pdf->GetY();
        
        // Dibujar celda de estado vacía primero
        $this->pdf->Cell(70, 12, '', 1, 1);
        
        // Ahora escribir el contenido DENTRO de la celda ya dibujada
        $this->pdf->SetXY($x_estado + 2, $y_estado + 3);
        
        // Texto del estado (Cargado/Fallas) - mejor centrado
        $this->pdf->Cell(20, 6, $estadoTexto, 0, 0, 'L');
        
        // Obtener estado real desde BD
        $estadoReal = $this->getEstadoEquipo($equipos, $clave, $estadoTexto === 'Cargado' ? 'Cargado' : 'Fallas');
        
        // Checkbox SI - mejor espaciado
        $this->pdf->SetXY($x_estado + 28, $y_estado + 3);
        $this->pdf->Cell(8, 6, 'SI', 0, 0, 'L');
        $this->dibujarCheckbox($estadoReal, $x_estado + 33, $y_estado + 5);
        
        // Checkbox NO - mejor espaciado
        $this->pdf->SetXY($x_estado + 55, $y_estado + 3);
        $this->pdf->Cell(8, 6, 'NO', 0, 0, 'L');
        $this->dibujarCheckbox(!$estadoReal, $x_estado + 50, $y_estado + 5);
        
        // Restaurar posición para siguiente línea
        $this->pdf->SetXY(15, $y_inicial + 12);
    }
    
    /**
     * Equipos de Oficina
     */
    private function generarEquiposOficinaPDF($equipos) {
        $this->pdf->SetFont('helvetica', 'B', 10);
        $this->pdf->Cell(0, 8, 'EQUIPO DE OFICINA: EXISTENCIA ENTREGADAS RECIBIDAS', 0, 1);
        
        $this->pdf->SetFont('helvetica', '', 9);
        
        // Engrapadoras
        $engrapadoras = $this->getEquipoOficina($equipos, 'ENGRAPADORAS');
        $this->pdf->Cell(50, 8, 'ENGRAPADORAS', 0);
        $this->pdf->Cell(25, 8, '1', 0, 0, 'C');
        $this->pdf->Cell(25, 8, $engrapadoras ? $engrapadoras['Entregadas'] : '1', 0, 0, 'C');
        $this->pdf->Cell(25, 8, $engrapadoras ? $engrapadoras['Recibidas'] : '1', 0, 1, 'C');
        
        // Perforadoras
        $perforadoras = $this->getEquipoOficina($equipos, 'PERFORADORAS');
        $this->pdf->Cell(50, 8, 'PERFORADORAS', 0);
        $this->pdf->Cell(25, 8, '2', 0, 0, 'C');
        $this->pdf->Cell(25, 8, $perforadoras ? $perforadoras['Entregadas'] : '2', 0, 0, 'C');
        $this->pdf->Cell(25, 8, $perforadoras ? $perforadoras['Recibidas'] : '2', 0, 1, 'C');
        
        $this->pdf->Ln(8);
        $this->pdf->Line(15, $this->pdf->GetY(), 195, $this->pdf->GetY());
        $this->pdf->Ln(8);
    }
    
    /**
     * COPIADORAS
     */
    private function generarCopiadorasPDF($equipos, $entrega) {
        // Título de la sección
        $this->pdf->SetFont('helvetica', 'B', 10);
        $this->pdf->Cell(0, 8, 'COPIADORAS FUNCIONA TONER', 0, 1);
        $this->pdf->SetFont('helvetica', '', 9);

        // Obtener datos del equipo
        $copiadoras = $this->getEquipoOficina($equipos, 'COPIADORAS');
        $funciona = $copiadoras ? $copiadoras['Funciona'] : 1;
        $toner_estado = $copiadoras ? $copiadoras['Toner_Estado'] : 'bueno';

        // Guardar la posición Y inicial para alinear los checkboxes
        $yPos = $this->pdf->GetY();

        $this->pdf->Cell(20, 20, 'HP', 0, 0);

        // Posición para el checkbox de 'SI'
        $xSi = $this->pdf->GetX();
        $this->pdf->Cell(30, 20, 'SI', 0, 0);
        $this->dibujarCheckbox($funciona, $xSi, $yPos + 4);

        // Posición para el checkbox de 'NO'
        $xNo = $this->pdf->GetX();
        $this->pdf->Cell(10, 20, 'NO', 0, 0);
        $this->dibujarCheckbox(!$funciona, $xNo, $yPos + 4);

        // Espacio entre grupos
        $this->pdf->Cell(30, 12, '', 0, 0);

        // Posición para el checkbox de 'BUENO'
        $xBueno = $this->pdf->GetX();
        $this->pdf->Cell(20, 20, 'BUENO', 0, 0);
        $this->dibujarCheckbox($toner_estado === 'bueno', $xBueno, $yPos + 4);

        // Posición para el checkbox de 'MALO'
        $xMalo = $this->pdf->GetX();
        $this->pdf->Cell(15, 20, 'MALO', 0, 1);
        $this->dibujarCheckbox($toner_estado === 'malo', $xMalo, $yPos + 4);
        
        // Paquetes de hojas
        $this->pdf->Cell(0, 8, 'PAQUETES DE HOJAS PARA IMPRESIÓN: ' . $entrega['Paquetes_Hojas'], 0, 1);

        // Líneas de separación
        $this->pdf->Ln(8);
        $this->pdf->Line(15, $this->pdf->GetY(), 195, $this->pdf->GetY());
        $this->pdf->Ln(8);
    }
    
    /**
     * FONDO Y DOCUMENTACIÓN
     */
    private function generarFondoYDocumentacionPDF($entrega) {
        $this->pdf->SetFont('helvetica', 'B', 10);
        $this->pdf->Cell(0, 8, 'FONDO:         RECIBIDO: $' . number_format($entrega['Fondo'], 2) . '                                 ENTREGADO: $' . number_format($entrega['Fondo'], 3), 0, 1);
        
        // VALES DE GASOLINA
        $this->pdf->Cell(0, 8, 'VALES DE GASOLINA:          CANTIDAD: ' . $entrega['Vales_Gasolina'] . '              FOLIO: ' . $entrega['Vales_Gasolina_Folio'], 0, 1);
        
        // REPORTE DE ATERRIZAJES
        $this->pdf->Cell(50, 10, 'REPORTE DE ATERRIZAJES:    ', 0, 0);
        
        // Más espacio entre elementos
        $this->pdf->Cell(10, 10, 'SI', 0, 0);
        $this->dibujarCheckbox($entrega['Reporte_Aterrizaje'], $this->pdf->GetX() - 4, $this->pdf->GetY() + 3);
        
        $this->pdf->Cell(13, 10, '  NO', 0, 0);
        $this->dibujarCheckbox(!$entrega['Reporte_Aterrizaje'], $this->pdf->GetX() - 4, $this->pdf->GetY() + 3);
        
        $this->pdf->Cell(35, 10, '             CANTIDAD: ' . $entrega['Aterrizajes_Cantidad'], 0, 1);
        
        // Resto de la información
        $this->pdf->Cell(0, 8, 'TOTAL DE OPERACIONES:       LLEGADAS: '. $entrega['Total_Operaciones_Llegadas'] . '         SALIDAS: ' . $entrega['Total_Operaciones_Salidas'], 0, 1);
        $this->pdf->Cell(0, 8, 'REPORTE DE OPERACIONES ENVIADAS POR CORREO:   ' . $entrega['Reporte_Operaciones_Correo'], 0, 1);
        $this->pdf->Cell(0, 8, 'CANTIDAD DE OPERACIONES COORDINADAS ENTREGADAS:   ' . $entrega['Operaciones_Coordinadas'], 0, 1);
        $this->pdf->Cell(0, 8, 'WALK-AROUNDS ¿Cuántos?:   ' . $entrega['Walk_Arounds'], 0, 1);
    }
    
    /**
     * CAJA FUERTE Y FIRMAS
     */
    private function generarCajaFuerteYFirmasPDF($entrega) {
        $alturaNecesaria = 50;

        // Calcular espacio disponible en la página actual
        $espacioDisponible = 297 - $this->pdf->GetY() - 20;
        
        if ($espacioDisponible < $alturaNecesaria) {
            $this->pdf->AddPage();
            $this->generarCabeceraEntregaTurno($entrega, true);
            $this->pdf->SetY(40);
        }
        
        // CAJA FUERTE 
        $this->pdf->SetFont('helvetica', 'B', 10);
        $this->pdf->Cell(0, 6, 'CAJA FUERTE:', 0, 1);
        $this->pdf->SetFont('helvetica', '', 9);
        
        $contenido = $entrega['Caja_Fuerte_Contenido'] ?: 'Sin observaciones';
        
        $this->pdf->MultiCell(0, 6, $contenido, 0, 'L');
        
        $this->pdf->Ln(8);
        
        // FIRMAS
        $this->pdf->SetFont('helvetica', 'B', 10); 
        $this->pdf->Cell(95, 6, 'FIRMA Y NOMBRE DE QUIEN ENTREGA', 0, 0);
        $this->pdf->Cell(95, 6, 'JEFE TURNO DE DESPACHO', 0, 1);
        
        $this->pdf->SetFont('helvetica', '', 9);
        
        // Líneas para firmas
        $this->pdf->Cell(95, 15, $entrega['Firma_Entrega'] ?: '_________________________', 0, 0, 'C');
        $this->pdf->Cell(95, 15, $entrega['Firma_Recibe'] ?: '_________________________', 0, 1, 'C');
    }

    /**
     * MÉTODO PARA DIBUJAR CHECKBOX
     */
    private function dibujarCheckbox($marcado, $x, $y, $size = 3) {
        $this->pdf->SetLineWidth(0.2);
        // Dibujar cuadrado
        $this->pdf->Rect($x, $y, $size, $size);
        
        if ($marcado) {
            // Dibujar X dentro del cuadro
            $this->pdf->Line($x, $y, $x + $size, $y + $size);
            $this->pdf->Line($x + $size, $y, $x, $y + $size);
        }
    }
    
    /**
     * GENERAR DIAGRAMA EN SEGUNDA HOJA
     */
    private function generarDiagrama($tipoVehiculo) {
        // Forzar segunda página
        
        $rutaDiagrama = '';        
        // Determinar ruta del diagrama según el tipo
        $basePath = __DIR__ . '/../../public/assets/images/diagramas/';
        
        if (strtoupper($tipoVehiculo) === 'AVION' || strtoupper($tipoVehiculo) === 'AVIÓN') {
            $rutaDiagrama = $basePath . 'diagrama_avion.jpg';
        } elseif (strtoupper($tipoVehiculo) === 'HELICOPTERO' || strtoupper($tipoVehiculo) === 'HELICÓPTERO') {
            $rutaDiagrama = $basePath . 'diagrama_helicoptero.jpg';
        } else {
            // Por defecto avión
            $rutaDiagrama = $basePath . 'diagrama_avion.jpg';
        }
        // Mostrar imagen
        $extensiones = ['.jpg', '.jpeg', '.png', '.gif'];
        $imagenEncontrada = false;
        
        foreach ($extensiones as $ext) {
            $rutaConExtension = preg_replace('/\.[^.]*$/', $ext, $rutaDiagrama);
            if (file_exists($rutaConExtension)) {
                $rutaDiagrama = $rutaConExtension;
                $imagenEncontrada = true;
                break;
            }
        }
        
        if ($imagenEncontrada) {
            // Centrar la imagen con tamaño ajustado
            $anchoDisponible = 140;
            $altoDisponible = 80;
            $x = (210 - $anchoDisponible) / 2;
            
            $this->pdf->Image($rutaDiagrama, $x, $this->pdf->GetY(), $anchoDisponible, $altoDisponible, 'JPG', '', 'T', false, 300, '', false, false, 0, false, false, false);
            $this->pdf->Ln(75);
        } else {
            $this->pdf->SetFont('helvetica', 'I', 12);
            $this->pdf->Cell(0, 8, 'Diagrama no disponible: ' . basename($rutaDiagrama), 0, 1, 'C');
            $this->pdf->Cell(0, 8, 'Buscado en: ' . $basePath, 0, 1, 'C');
        }
    }

    /**
     * OBSERVACIONES WALKAROUND
     */
    private function generarObservacionesWalkaroundPDF($walkaround) {
        $this->pdf->SetFont('helvetica', 'B', 10);
        $this->pdf->Cell(0, 10, 'OBSERVACIONES/OTRO (ESPECIFICAR)', 0, 1);
        
        $this->pdf->SetFont('helvetica', '', 10);
        
        $observaciones = 'No hay observaciones registradas.';
        
        if (isset($walkaround['observaciones']) && !empty(trim($walkaround['observaciones']))) {
            $observaciones = $walkaround['observaciones'];
        }
        
        // Crear un cuadro para las observaciones
        $this->pdf->SetFillColor(245, 245, 245);
        $this->pdf->MultiCell(0, 6, $observaciones, 1, 'L', true);
        
        $this->pdf->Ln(6);
    }
    
    /**
     * FIRMAS WALKAROUND
     */
    private function generarFirmasWalkaroundPDF($walkaround) {
        $this->pdf->SetFont('helvetica', 'B', 10);
        $this->pdf->Cell(0, 8, 'Responsable de la operación (Nombre y firma):', 0, 1);
        $this->pdf->SetFont('helvetica', '', 9);
        
        $responsable = isset($walkaround['Responsable']) ? $walkaround['Responsable'] : '_________________________';
        $this->pdf->Cell(0, 8, $responsable, 'B', 1);
        $this->pdf->Ln(8);
        
        // Tabla de firmas
        $this->pdf->SetFont('helvetica', 'B', 10);
        $this->pdf->Cell(60, 8, 'Elaboró', 0, 0);
        $this->pdf->Cell(60, 8, 'Jefe de área', 0, 0);
        $this->pdf->Cell(60, 8, 'Vo Bo Gerente FBO', 0, 1);
        
        $this->pdf->SetFont('helvetica', '', 9);
        
        $elaboro = isset($walkaround['Elaboro']) ? $walkaround['Elaboro'] : '_________________________';
        $jefeArea = isset($walkaround['JefeArea']) ? $walkaround['JefeArea'] : '_________________________';
        $voBo = isset($walkaround['VoBo']) ? $walkaround['VoBo'] : '_________________________';
        
        $this->pdf->Cell(60, 10, $elaboro, 'B', 0);
        $this->pdf->Cell(60, 10, $jefeArea, 'B', 0);
        $this->pdf->Cell(60, 10, $voBo, 'B', 1);
    }

    /**
     * Método auxiliar para truncar texto muy largo
     */
    private function truncarTexto($texto, $maxCaracteres) {
        if (strlen($texto) > $maxCaracteres) {
            return substr($texto, 0, $maxCaracteres - 3) . '...';
        }
        return $texto;
    }
    
    private function getEquiposComunicacion($pdo, $id) {
        $sql = "SELECT * FROM equipocomunicacion WHERE Entrega_Turno_Id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    private function getEquiposOficina($pdo, $id) {
        $sql = "SELECT * FROM equipooficina WHERE Entrega_Turno_Id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    private function getComponentesWalkaround($pdo, $id) {
        $sql = "SELECT * FROM componentewk WHERE Id_Walk = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    private function getEstadoEquipo($equipos, $nombre, $campo) {
        foreach ($equipos as $equipo) {
            if ($equipo['Nombre'] === $nombre) {
                return $equipo[$campo] == 1;
            }
        }
        return false;
    }
    
    private function getEquipoOficina($equipos, $nombre) {
        foreach ($equipos as $equipo) {
            if ($equipo['Nombre'] === $nombre) {
                return $equipo;
            }
        }
        return null;
    }
    
    private function getComponentesPorTipo($tipo) {
        $componentes = [
            'avion' => [
                ['id' => 'tren_nariz', 'nombre' => 'TREN DE NARIZ'],
                ['id' => 'compuertas_tren', 'nombre' => 'COMPUERTAS TREN DE ATERRIZAJE'],
                ['id' => 'parabrisas_limpiadores', 'nombre' => 'PARABRISAS / LIMPIADORES'],
                ['id' => 'radomo', 'nombre' => 'RADOMO'],
                ['id' => 'tubo_pitot', 'nombre' => 'TUBO PITOT'],
                ['id' => 'fuselaje', 'nombre' => 'FUSELAJE'],
                ['id' => 'antena', 'nombre' => 'ANTENA'],
                ['id' => 'aleta', 'nombre' => 'ALETA'],
                ['id' => 'aleron', 'nombre' => 'ALERON'],
                ['id' => 'compensador_aleron', 'nombre' => 'COMPENSADOR DE ALERON'],
                ['id' => 'mechas_descarga', 'nombre' => 'MECHAS DE DESCARGA ESTÁTICA'],
                ['id' => 'punta_ala', 'nombre' => 'PUNTA DE ALA'],
                ['id' => 'luces_carretero', 'nombre' => 'LUCES DE CARRETEO / ATERRIZAJE'],
                ['id' => 'luces_navegacion', 'nombre' => 'LUCES DE NAVEGACIÓN, BEACON'],
                ['id' => 'borde_ataque', 'nombre' => 'BORDE DE ATAQUE'],
                ['id' => 'tren_principal', 'nombre' => 'TREN DE ATERRIZAJE PRINCIPAL'],
                ['id' => 'valvulas_servicio', 'nombre' => 'VÁLVULAS DE SERVICIO (COMBUSTIBLE, ETC)'],
                ['id' => 'motor', 'nombre' => 'MOTOR'],
                ['id' => 'estabilizador_vertical', 'nombre' => 'ESTABILIZADOR VERTICAL'],
                ['id' => 'timon_direccion', 'nombre' => 'TIMÓN DE DIRECCIÓN'],
                ['id' => 'compensador_timon_direccion', 'nombre' => 'COMPENSADOR TIMÓN DE DIRECCIÓN'],
                ['id' => 'estabilizador_horizontal', 'nombre' => 'ESTABILIZADOR HORIZONTAL'],
                ['id' => 'timon_profundidad', 'nombre' => 'TIMÓN DE PROFUNDIDAD'],
                ['id' => 'compensador_timon_profundidad', 'nombre' => 'COMPENSADOR TIMÓN DE PROFUNDIDAD'],
                ['id' => 'borde_empenaje', 'nombre' => 'BORDE DE EMPEÑAJE'],
                ['id' => 'alas_delta', 'nombre' => 'ALAS DELTA']
            ],
            'helicoptero' => [
                ['id' => 'fuselaje', 'nombre' => 'FUSELAJE'],
                ['id' => 'puertas', 'nombre' => 'PUERTAS, VENTANAS, ANTENAS, LUCES'],
                ['id' => 'esqui', 'nombre' => 'ESQUÍ / NEUMÁTICOS'],
                ['id' => 'palas', 'nombre' => 'PALAS'],
                ['id' => 'boom', 'nombre' => 'BOOM'],
                ['id' => 'estabilizadores', 'nombre' => 'ESTABILIZADORES'],
                ['id' => 'rotor', 'nombre' => 'ROTOR DE COLA'],
                ['id' => 'parabrisas', 'nombre' => 'PARABRISAS']
            ]
        ];
        
        return $componentes[$tipo] ?? [];
    }
    
    private function findComponente($componentes, $idComponente) {
        foreach ($componentes as $componente) {
            if ($componente['Identificador_Componente'] == $idComponente) {
                return $componente;
            }
        }
        return null;
    }


/**
 * Genera PDF para Pernocta Diaria
 */
public function generarPernocta($id) {
    require_once('../models/conexion.php');
    
    try {
        // Obtener la fecha específica de la pernocta seleccionada
        $sqlFecha = "SELECT Fecha FROM pernocta_diaria WHERE Id_Pernocta = ?";
        $stmtFecha = $pdo->prepare($sqlFecha);
        $stmtFecha->execute([$id]);
        $fechaPernocta = $stmtFecha->fetch(PDO::FETCH_ASSOC);
        
        if (!$fechaPernocta) {
            die('Pernocta no encontrada');
        }
        
        // Obtener TODOS los registros de pernocta del mismo día
        $sql = "SELECT p.*, a.Matricula, a.Equipo, a.Tipo 
                FROM pernocta_diaria p 
                LEFT JOIN aeronave a ON p.Id_Aeronave = a.Id_Aeronave 
                WHERE p.Fecha = ?
                ORDER BY p.Hora ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$fechaPernocta['Fecha']]);
        $pernoctas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (!$pernoctas) {
            die('No se encontraron registros de pernocta para esta fecha');
        }
        
        // Configurar página en horizontal
        $this->pdf->AddPage('L', 'A4');
        $this->generarCabeceraPernoctaHorizontal($pernoctas[0]);
        $this->generarTablaPernoctaHorizontal($pernoctas);
        $this->generarFirmasPernoctaHorizontal();
        
        $this->pdf->Output('pernocta_' . $fechaPernocta['Fecha'] . '.pdf', 'I');
        return true;
        
    } catch (Exception $e) {
        ob_clean();
        die('Error al generar PDF: ' . $e->getMessage());
    }
}

/**
 * CABECERA PERNOCTA HORIZONTAL
 */
private function generarCabeceraPernoctaHorizontal($pernocta) {
    // Logo EOLO (izquierda)
    $logoPath = __DIR__ . '/../../public/assets/images/eolo_logo.png';
    if (file_exists($logoPath)) {
        $this->pdf->Image($logoPath, 15, 10, 20, 0, 'PNG', '', 'T', false, 300, '', false, false, 0, false, false, false);
    }
    
    // Título EOLO centrado
    $this->pdf->SetFont('helvetica', 'B', 16);
    $this->pdf->SetY(15);
    $this->pdf->Cell(0, 10, 'E O L O', 0, 1, 'C');

    // Obtener fecha del reporte
    $fechaReporte = 'No especificada';
    if (isset($pernocta['Fecha']) && !empty($pernocta['Fecha']) && $pernocta['Fecha'] != '0000-00-00') {
        $fechaObj = DateTime::createFromFormat('Y-m-d', $pernocta['Fecha']);
        if ($fechaObj !== false) {
            $fechaReporte = $fechaObj->format('d/m/Y');
        }
    }
    
    // Título PERNOCTA DIARIA
    $this->pdf->SetFont('helvetica', 'B', 14);
    $this->pdf->SetTextColor(255, 0, 0);
    $this->pdf->Cell(0, 10, 'PERNOCTA DIARIA - ' . $fechaReporte, 0, 1, 'C');
    $this->pdf->SetTextColor(0, 0, 0);
    $this->pdf->Ln(5);
}

/**
 * TABLA PERNOCTA HORIZONTAL
 */
private function generarTablaPernoctaHorizontal($pernoctas) {
    // Separar registros en entradas y salidas según Tipo_Movimiento
    $entradas = [];
    $salidas = [];
    
    foreach ($pernoctas as $pernocta) {
        if (isset($pernocta['Tipo_Movimiento']) && $pernocta['Tipo_Movimiento'] == 'entrada') {
            $entradas[] = $pernocta;
        } elseif (isset($pernocta['Tipo_Movimiento']) && $pernocta['Tipo_Movimiento'] == 'salida') {
            $salidas[] = $pernocta;
        }
    }
    
    // Configurar posición inicial
    $this->pdf->SetY(40);
    
    //TABLA DE ENTRADAS (LADO IZQUIERDO)
    $this->pdf->SetFont('helvetica', 'B', 12);
    $this->pdf->Cell(120, 8, 'ENTRADA', 0, 1, 'C'); // Reducido para más separación
    $this->pdf->Ln(2);
    
    // Encabezado de tabla de entradas
    $this->pdf->SetFont('helvetica', 'B', 8);
    $this->pdf->SetFillColor(240, 240, 240);
    $this->pdf->Cell(15, 8, 'HORA', 1, 0, 'C', true);
    $this->pdf->Cell(22, 8, 'MATRÍCULA', 1, 0, 'C', true);
    $this->pdf->Cell(16, 8, 'TRIP.', 1, 0, 'C', true);
    $this->pdf->Cell(26, 8, 'PROCEDENCIA', 1, 0, 'C', true);
    $this->pdf->Cell(16, 8, 'PASAJ.', 1, 0, 'C', true);
    $this->pdf->Cell(35, 8, 'REGISTRÓ', 1, 1, 'C', true);
    
    // Datos de entradas
    $this->pdf->SetFont('helvetica', '', 8);
    if (count($entradas) > 0) {
        foreach ($entradas as $entrada) {
            $hora = $this->formatearHora($entrada['Hora']);
            
            $this->pdf->Cell(15, 8, $hora, 1, 0, 'C');
            $this->pdf->Cell(22, 8, isset($entrada['Matricula']) ? $entrada['Matricula'] : '-', 1, 0, 'C');
            $this->pdf->Cell(16, 8, isset($entrada['Tripulacion']) ? $entrada['Tripulacion'] : '0', 1, 0, 'C');
            $this->pdf->Cell(26, 8, isset($entrada['Procedencia']) ? $entrada['Procedencia'] : '-', 1, 0, 'C');
            $this->pdf->Cell(16, 8, isset($entrada['Pasajeros']) ? $entrada['Pasajeros'] : '0', 1, 0, 'C');
            $this->pdf->Cell(35, 8, isset($entrada['Persona_Registro']) ? $entrada['Persona_Registro'] : '-', 1, 1, 'C');
        }
    } else {
        // Fila vacía si no hay entradas
        $this->pdf->Cell(15, 8, '-', 1, 0, 'C');
        $this->pdf->Cell(22, 8, '-', 1, 0, 'C');
        $this->pdf->Cell(16, 8, '-', 1, 0, 'C');
        $this->pdf->Cell(26, 8, '-', 1, 0, 'C');
        $this->pdf->Cell(16, 8, '-', 1, 0, 'C');
        $this->pdf->Cell(35, 8, '-', 1, 1, 'C');
    }
    
    $this->pdf->Ln(10);
    
    //TABLA DE SALIDAS (LADO DERECHO)

    $yPos = 40;
    $this->pdf->SetY($yPos);
    $this->pdf->SetX(155); 
    
    $this->pdf->SetFont('helvetica', 'B', 12);
    $this->pdf->Cell(120, 8, 'SALIDA', 0, 1, 'C'); 
    $this->pdf->SetX(155);
    $this->pdf->Ln(2);
    
    // Encabezado de tabla de salidas
    $this->pdf->SetX(155);
    $this->pdf->SetFont('helvetica', 'B', 8);
    $this->pdf->SetFillColor(240, 240, 240);
    $this->pdf->Cell(15, 8, 'HORA', 1, 0, 'C', true);
    $this->pdf->Cell(22, 8, 'MATRÍCULA', 1, 0, 'C', true);
    $this->pdf->Cell(18, 8, 'TRIP.', 1, 0, 'C', true);
    $this->pdf->Cell(26, 8, 'DESTINO', 1, 0, 'C', true);
    $this->pdf->Cell(16, 8, 'PASAJ.', 1, 0, 'C', true);
    $this->pdf->Cell(35, 8, 'REGISTRÓ', 1, 1, 'C', true);
    
    // Datos de salidas
    $this->pdf->SetFont('helvetica', '', 8);
    if (count($salidas) > 0) {
        foreach ($salidas as $salida) {
            $this->pdf->SetX(155);
            $hora = $this->formatearHora($salida['Hora']);
            
            $this->pdf->Cell(15, 8, $hora, 1, 0, 'C');
            $this->pdf->Cell(22, 8, isset($salida['Matricula']) ? $salida['Matricula'] : '-', 1, 0, 'C');
            $this->pdf->Cell(18, 8, isset($salida['Tripulacion']) ? $salida['Tripulacion'] : '0', 1, 0, 'C');
            $this->pdf->Cell(26, 8, isset($salida['Destino']) ? $salida['Destino'] : '-', 1, 0, 'C');
            $this->pdf->Cell(16, 8, isset($salida['Pasajeros']) ? $salida['Pasajeros'] : '0', 1, 0, 'C');
            $this->pdf->Cell(35, 8, isset($salida['Persona_Registro']) ? $salida['Persona_Registro'] : '-', 1, 1, 'C');
        }
    } else {
        // Fila vacía si no hay salidas
        $this->pdf->SetX(155);
        $this->pdf->Cell(15, 8, '-', 1, 0, 'C');
        $this->pdf->Cell(22, 8, '-', 1, 0, 'C');
        $this->pdf->Cell(16, 8, '-', 1, 0, 'C');
        $this->pdf->Cell(26, 8, '-', 1, 0, 'C');
        $this->pdf->Cell(16, 8, '-', 1, 0, 'C');
        $this->pdf->Cell(35, 8, '-', 1, 1, 'C');
    }
    
    $this->pdf->Ln(15);
}

/**
 * CABECERA PARA SEGUNDA PÁGINA
 */
private function generarCabeceraTablaSegundaPagina() {
    $this->pdf->SetY(20);
    $this->pdf->SetFont('helvetica', 'B', 8);
    
    // Mismos anchos que en la primera página
    $anchoFecha = 18;
    $anchoHora = 12;
    $anchoMatricula = 22;
    $anchoTripulacion = 15;
    $anchoProcedenciaDestino = 25;
    $anchoPasajeros = 15;
    $anchoRegistro = 33;
    
    $anchoTabla = $anchoFecha + $anchoHora + $anchoMatricula + $anchoTripulacion + $anchoProcedenciaDestino + $anchoPasajeros + $anchoRegistro;
    $margenIzquierdo = (280 - ($anchoTabla * 2)) / 2;
    
    // SUBENCABEZADOS ENTRADAS
    $this->pdf->SetX($margenIzquierdo);
    $this->pdf->SetFillColor(240, 240, 240);
    
    $this->pdf->Cell($anchoFecha, 8, 'FECHA', 1, 0, 'C', true);
    $this->pdf->Cell($anchoHora, 8, 'HORA', 1, 0, 'C', true);
    $this->pdf->Cell($anchoMatricula, 8, 'MATRÍCULA', 1, 0, 'C', true);
    $this->pdf->Cell($anchoTripulacion, 8, 'TRIP.', 1, 0, 'C', true);
    $this->pdf->Cell($anchoProcedenciaDestino, 8, 'PROC.', 1, 0, 'C', true);
    $this->pdf->Cell($anchoPasajeros, 8, 'PASAJ.', 1, 0, 'C', true);
    $this->pdf->Cell($anchoRegistro, 8, 'REGISTRÓ', 1, 0, 'C', true);
    
    // SUBENCABEZADOS SALIDAS
    $this->pdf->SetX($margenIzquierdo + $anchoTabla);
    $this->pdf->Cell($anchoFecha, 8, 'FECHA', 1, 0, 'C', true);
    $this->pdf->Cell($anchoHora, 8, 'HORA', 1, 0, 'C', true);
    $this->pdf->Cell($anchoMatricula, 8, 'MATRÍCULA', 1, 0, 'C', true);
    $this->pdf->Cell($anchoTripulacion, 8, 'TRIP.', 1, 0, 'C', true);
    $this->pdf->Cell($anchoProcedenciaDestino, 8, 'DEST.', 1, 0, 'C', true);
    $this->pdf->Cell($anchoPasajeros, 8, 'PASAJ.', 1, 0, 'C', true);
    $this->pdf->Cell($anchoRegistro, 8, 'REGISTRÓ', 1, 1, 'C', true);
}

/**
 * FORMATEAR FECHA
 */
private function formatearFecha($fecha) {
    if (!empty($fecha) && $fecha != '0000-00-00') {
        $fechaObj = DateTime::createFromFormat('Y-m-d', $fecha);
        if ($fechaObj !== false) {
            return $fechaObj->format('d/m/Y');
        }
    }
    return '-';
}

/**
 * FORMATEAR HORA
 */
private function formatearHora($hora) {
    if (!empty($hora) && $hora != '00:00:00') {
        $horaObj = DateTime::createFromFormat('H:i:s', $hora);
        if ($horaObj !== false) {
            return $horaObj->format('H:i');
        }
    }
    return '-';
}

/**
 * FIRMAS PERNOCTA HORIZONTAL
 */
private function generarFirmasPernoctaHorizontal() {
    // Posicionar firmas en la parte inferior
    $this->pdf->SetY(160);
    
    $this->pdf->SetFont('helvetica', 'B', 10);
    $this->pdf->Cell(93, 8, 'Vigilante en Turno', 0, 0, 'C');
    $this->pdf->Cell(93, 8, 'Jefe de Seguridad', 0, 0, 'C');
    $this->pdf->Cell(93, 8, 'Coordinador FBO', 0, 1, 'C');
    
    // Líneas para firmas
    $this->pdf->SetFont('helvetica', '', 9);
    $this->pdf->Cell(93, 15, '_________________________', 0, 0, 'C');
    $this->pdf->Cell(93, 15, '_________________________', 0, 0, 'C');
    $this->pdf->Cell(93, 15, '_________________________', 0, 1, 'C');
    
    // Texto "Nombre y firma"
    $this->pdf->SetFont('helvetica', '', 8);
    $this->pdf->Cell(93, 5, 'Nombre y firma', 0, 0, 'C');
    $this->pdf->Cell(93, 5, 'Nombre y firma', 0, 0, 'C');
    $this->pdf->Cell(93, 5, 'Nombre y firma', 0, 1, 'C');
}

/**
 * Genera PDF para Control de Pernoctas
 */
public function generarPernoctasDiarias($id) {
    require_once('../models/conexion.php');
    
    try {
        // Obtener la fecha específica del control seleccionado
        $sqlFecha = "SELECT Fecha FROM control_pernocta WHERE Id_Control = ?";
        $stmtFecha = $pdo->prepare($sqlFecha);
        $stmtFecha->execute([$id]);
        $fechaControl = $stmtFecha->fetch(PDO::FETCH_ASSOC);
        
        if (!$fechaControl) {
            die('Control de pernocta no encontrado');
        }
        
        // Obtener TODOS los registros de control_pernocta del mismo día
        $sql = "SELECT cp.*, a.Matricula, a.Equipo 
                FROM control_pernocta cp 
                LEFT JOIN aeronave a ON cp.Id_Aeronave = a.Id_Aeronave 
                WHERE DATE(cp.Fecha) = DATE(?)
                ORDER BY cp.HoraInicial ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$fechaControl['Fecha']]);
        $controles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (!$controles) {
            die('No se encontraron registros de control para esta fecha');
        }
        
        $this->pdf->AddPage('P');
        $this->generarCabeceraControlPernoctas($controles[0]);
        $this->generarTablaControlPernoctas($controles);
        
        $nombreArchivo = 'control_pernoctas_' . $fechaControl['Fecha'] . '.pdf';
        $this->pdf->Output($nombreArchivo, 'I');
        return true;
        
    } catch (Exception $e) {
        ob_clean();
        die('Error al generar PDF: ' . $e->getMessage());
    }
}

/**
 * CABECERA CONTROL PERNOCTAS
 */
private function generarCabeceraControlPernoctas($control) {
    // Logo EOLO (izquierda)
    $logoPath = __DIR__ . '/../../public/assets/images/eolo_logo.png';
    if (file_exists($logoPath)) {
        $this->pdf->Image($logoPath, 15, 10, 20, 0, 'PNG', '', 'T', false, 300, '', false, false, 0, false, false, false);
    }
    
    // Título EOLO centrado
    $this->pdf->SetFont('helvetica', 'B', 16);
    $this->pdf->SetY(12);
    $this->pdf->Cell(0, 10, 'E O L O', 0, 1, 'C');

    
    $this->pdf->SetTextColor(255, 0, 0);
    $this->pdf->SetY(5);
    $this->pdf->SetX(150);
    $this->pdf->SetFont('helvetica', 'B', 12);
    $this->pdf->Cell(0, 6, 'REPORTE DIARIO', 0, 1);

    $this->pdf->SetTextColor(0, 0, 0); // Negro

    // Título principal
    $this->pdf->SetFont('helvetica', 'B', 14);
    $this->pdf->SetY(25);
    $this->pdf->Cell(0, 10, 'CONTROL DE PERNOCTAS', 0, 1, 'C');
    
    // Información de fecha
    $this->pdf->SetTextColor(255, 0, 0);
    $this->pdf->SetFont('helvetica', '', 10);
    $fecha_formateada = date('d/m/Y', strtotime($control['Fecha']));
    $this->pdf->Cell(0, 6, 'FECHA: ' . $fecha_formateada, 0, 1, 'C');
    $this->pdf->SetTextColor(0, 0, 0);

    $this->pdf->Ln(8);
}

/**
 * TABLA CONTROL PERNOCTAS
 */
private function generarTablaControlPernoctas($controles) {
    // Cabecera de la tabla
    $this->pdf->SetFont('helvetica', 'B', 8);
    $this->pdf->SetFillColor(240, 240, 240);
    
    $anchos = [
        'hora_inicial' => 16,  
        'hora_final' => 16,    
        'matricula' => 20,     
        'equipo' => 22,        
        'hangar' => 14,        
        'empresa' => 26,       
        'observaciones' => 50, 
        'registro' => 18      
    ];    
    // Dibujar cabecera
    $this->pdf->Cell($anchos['hora_inicial'], 8, 'HORA INI', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['hora_final'], 8, 'HORA FIN', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['matricula'], 8, 'MATRÍCULA', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['equipo'], 8, 'EQUIPO', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['hangar'], 8, 'HANGAR', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['empresa'], 8, 'EMPRESA', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['observaciones'], 8, 'OBSERVACIONES', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['registro'], 8, 'REGISTRÓ', 1, 1, 'C', true);
    
    // Datos de la tabla
    $this->pdf->SetFont('helvetica', '', 7);
    
    if (count($controles) > 0) {
        foreach ($controles as $control) {
            // Formatear horas
            $horaInicial = $this->formatearHora($control['HoraInicial']);
            $horaFinal = $this->formatearHora($control['HoraFinal']);
            
            // Función para truncar texto
            $truncar = function($texto, $maxLength) {
                if (strlen($texto) > $maxLength) {
                    return substr($texto, 0, $maxLength - 2) . '..';
                }
                return $texto;
            };
            
            // Dibujar fila con textos truncados
            $this->pdf->Cell($anchos['hora_inicial'], 8, $horaInicial, 1, 0, 'C');
            $this->pdf->Cell($anchos['hora_final'], 8, $horaFinal, 1, 0, 'C');
            $this->pdf->Cell($anchos['matricula'], 8, $truncar($control['Matricula'] ?? '-', 6), 1, 0, 'C');
            $this->pdf->Cell($anchos['equipo'], 8, $truncar($control['Equipo'] ?? '-', 10), 1, 0, 'C'); // Reducido de 12 a 10
            $this->pdf->Cell($anchos['hangar'], 8, $control['Hangar'] ?? '-', 1, 0, 'C');
            $this->pdf->Cell($anchos['empresa'], 8, $truncar($control['EmpresaProcedencia'] ?? '-', 12), 1, 0, 'C'); // Reducido de 15 a 12
            $this->pdf->Cell($anchos['observaciones'], 8, $truncar($control['Observaciones'] ?? '-', 25), 1, 0, 'C'); // Aumentado de 18 a 25
            $this->pdf->Cell($anchos['registro'], 8, $truncar($control['Persona_Registro'] ?? '-', 10), 1, 1, 'C');
            
            // Verificar si necesitamos nueva página
            if ($this->pdf->GetY() > 270) {
                $this->pdf->AddPage('P');
                // Redibujar cabecera
                $this->pdf->SetFont('helvetica', 'B', 8);
                $this->pdf->SetFillColor(240, 240, 240);
                $this->pdf->Cell($anchos['hora_inicial'], 8, 'HORA INI', 1, 0, 'C', true);
                $this->pdf->Cell($anchos['hora_final'], 8, 'HORA FIN', 1, 0, 'C', true);
                $this->pdf->Cell($anchos['matricula'], 8, 'MATRÍCULA', 1, 0, 'C', true);
                $this->pdf->Cell($anchos['equipo'], 8, 'EQUIPO', 1, 0, 'C', true);
                $this->pdf->Cell($anchos['hangar'], 8, 'HANGAR', 1, 0, 'C', true);
                $this->pdf->Cell($anchos['empresa'], 8, 'EMPRESA', 1, 0, 'C', true);
                $this->pdf->Cell($anchos['observaciones'], 8, 'OBSERVACIONES', 1, 0, 'C', true);
                $this->pdf->Cell($anchos['registro'], 8, 'REGISTRÓ', 1, 1, 'C', true);
                $this->pdf->SetFont('helvetica', '', 7);
            }
        }
    } else {
        // Fila vacía si no hay datos
        $this->pdf->Cell($anchos['hora_inicial'], 8, '-', 1, 0, 'C');
        $this->pdf->Cell($anchos['hora_final'], 8, '-', 1, 0, 'C');
        $this->pdf->Cell($anchos['matricula'], 8, '-', 1, 0, 'C');
        $this->pdf->Cell($anchos['equipo'], 8, '-', 1, 0, 'C');
        $this->pdf->Cell($anchos['hangar'], 8, '-', 1, 0, 'C');
        $this->pdf->Cell($anchos['empresa'], 8, '-', 1, 0, 'C');
        $this->pdf->Cell($anchos['observaciones'], 8, '-', 1, 0, 'C');
        $this->pdf->Cell($anchos['registro'], 8, '-', 1, 1, 'C');
    }
    
    $this->pdf->Ln(5);
}

/**
 * Genera PDF para Relación de Pernoctas Mensuales
 */
public function generarRelacionMensual($fecha_inicio, $fecha_fin) {
    require_once('../models/conexion.php');
    
    try {
        // Obtener datos de la relación
        $url = "http://" . $_SERVER['HTTP_HOST'] . "/Eolo/app/models/obtener_relacion_pernoctas.php?fecha_inicio=$fecha_inicio&fecha_fin=$fecha_fin";
        $json_data = file_get_contents($url);
        $data = json_decode($json_data, true);
        
        if (!$data || !$data['success']) {
            throw new Exception('No se pudieron obtener los datos para el PDF');
        }
        
        $this->pdf->AddPage('L', 'A4'); 
        $this->generarCabeceraRelacionMensual($data);
        $this->generarTablaRelacionMensualFormatoFisico($data);
        
        $nombreArchivo = 'relacion_pernoctas_' . $fecha_inicio . '_a_' . $fecha_fin . '.pdf';
        $this->pdf->Output($nombreArchivo, 'I');
        return true;
        
    } catch (Exception $e) {
        ob_clean();
        die('Error al generar PDF de relación: ' . $e->getMessage());
    }
}

/**
 * CABECERA RELACIÓN MENSUAL
 */
private function generarCabeceraRelacionMensual($data) {
    // Logo EOLO
    $logoPath = __DIR__ . '/../../public/assets/images/eolo_logo.png';
    if (file_exists($logoPath)) {
        $this->pdf->Image($logoPath, 15, 10, 20, 0, 'PNG', '', 'T', false, 300, '', false, false, 0, false, false, false);
    }
    
    // Título EOLO
    $this->pdf->SetFont('helvetica', 'B', 16);
    $this->pdf->SetY(15);
    $this->pdf->Cell(0, 10, 'E O L O', 0, 1, 'C');

    // Título principal
    $this->pdf->SetFont('helvetica', 'B', 14);
    $this->pdf->Cell(0, 10, 'RELACIÓN DE PERNOCTAS MENSUALES', 0, 1, 'C');
    
    // Período
    $fecha_inicio = date('d/m/Y', strtotime($data['fecha_inicio']));
    $fecha_fin = date('d/m/Y', strtotime($data['fecha_fin']));
    
    $this->pdf->SetFont('helvetica', '', 12);
    $this->pdf->SetTextColor(255, 0, 0);
    $this->pdf->Cell(0, 8, "Período: $fecha_inicio al $fecha_fin", 0, 1, 'C');
    $this->pdf->Cell(0, 8, "Total de días: " . $data['total_dias_periodo'], 0, 1, 'C');
    
    // LEYENDA 
    $this->pdf->SetFont('helvetica', '', 10);
    $this->pdf->Cell(0, 6, "H1 = Hangar 1 | H2 = Hangar 2 | F = Fuera", 0, 1, 'C');
    
    $this->pdf->SetTextColor(0, 0, 0);

    $this->pdf->Ln(5);
}

/**
 * TABLA RELACIÓN MENSUAL CON HANGARES ESPECÍFICOS (H1/H2)
 */
private function generarTablaRelacionMensualFormatoFisico($data) {
    $total_dias = $data['total_dias_periodo'];
    
    // Configurar anchos de columnas
    $anchos = [
        'matricula' => 20,    
        'equipo' => 28,       
        'empresa' => 32,      
        'dias_hangar' => 16,  
        'dias_fuera' => 16,   
        'calendario' => 260 - (20 + 28 + 32 + 16 + 16) 
    ];
    
    $ancho_total_tabla = array_sum($anchos);
    $margen_izquierdo = (297 - $ancho_total_tabla) / 2; 
    
    $this->pdf->SetX($margen_izquierdo);
    
    // Cabecera de la tabla
    $this->pdf->SetFont('helvetica', 'B', 8);
    $this->pdf->SetFillColor(240, 240, 240);
    
    // Fila 1: Títulos principales
    $this->pdf->Cell($anchos['matricula'], 10, 'MATRÍCULA', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['equipo'], 10, 'EQUIPO', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['empresa'], 10, 'EMPRESA/PROCED', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['dias_hangar'], 10, 'D.HANGAR', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['dias_fuera'], 10, 'D.FUERA', 1, 0, 'C', true);
    
    // Cabecera de días
    $this->pdf->Cell($anchos['calendario'], 10, 'CALENDARIO DE DÍAS', 1, 1, 'C', true);
    
    // Fila 2: Números de día
    $this->pdf->SetX($margen_izquierdo + $anchos['matricula'] + $anchos['equipo'] + $anchos['empresa'] + $anchos['dias_hangar'] + $anchos['dias_fuera']);
    
    $ancho_dia = $anchos['calendario'] / $total_dias;
    
    for ($dia = 1; $dia <= $total_dias; $dia++) {
        $this->pdf->Cell($ancho_dia, 6, $dia, 1, 0, 'C', true);
    }
    $this->pdf->Ln(6);
    
    // Datos de la tabla
    $this->pdf->SetFont('helvetica', '', 7);
    
    foreach ($data['aeronaves'] as $aeronave) {
        $this->pdf->SetX($margen_izquierdo);
        
        // Obtener empresa/procedencia
        $empresa = $aeronave['empresa'];
        
        // Fila de datos
        $this->pdf->Cell($anchos['matricula'], 8, $aeronave['matricula'], 1, 0, 'C');
        $this->pdf->Cell($anchos['equipo'], 8, $this->truncarTexto($aeronave['equipo'], 18), 1, 0, 'C');
        $this->pdf->Cell($anchos['empresa'], 8, $this->truncarTexto($empresa, 22), 1, 0, 'C');
        $this->pdf->Cell($anchos['dias_hangar'], 8, $aeronave['total_dias_hangar'], 1, 0, 'C');
        $this->pdf->Cell($anchos['dias_fuera'], 8, $aeronave['total_dias_fuera'], 1, 0, 'C');
        
        //Procesar cadena de hangares
        $hangares_raw = isset($aeronave['hangares']) ? $aeronave['hangares'] : $aeronave['dias'];
        
        $hangares_limpio = str_replace(' ', '', $hangares_raw); 
        $estados_dias = [];
        
        for ($i = 0; $i < strlen($hangares_limpio); $i++) {
            $caracter = $hangares_limpio[$i];
            if ($caracter === 'H' && isset($hangares_limpio[$i + 1]) && is_numeric($hangares_limpio[$i + 1])) {
                // Es H1 o H2
                $estados_dias[] = $caracter . $hangares_limpio[$i + 1];
                $i++;
            } else {
                $estados_dias[] = $caracter;
            }
        }
        
        if (count($estados_dias) > $total_dias) {
            $estados_dias = array_slice($estados_dias, 0, $total_dias);
        } elseif (count($estados_dias) < $total_dias) {
            while (count($estados_dias) < $total_dias) {
                $estados_dias[] = 'F';
            }
        }
        
        // Cuadrícula de días con hangares específicos
        for ($i = 0; $i < $total_dias; $i++) {
            $estado = isset($estados_dias[$i]) ? $estados_dias[$i] : 'F';
            
            // Asignar colores correctamente
            if ($estado === 'H1' || $estado === 'H2') {
                $color = [200, 255, 200];
                $texto = $estado; // Mostrar H1 o H2
            } elseif ($estado === 'H') {
                $color = [200, 255, 200];
                $texto = 'H'; 
            } else {
                $color = [255, 200, 200];
                $texto = 'F'; // Mostrar F
            }
            
            $this->pdf->SetFillColor($color[0], $color[1], $color[2]);
            $this->pdf->Cell($ancho_dia, 8, $texto, 1, 0, 'C', true);
        }
        
        $this->pdf->SetFillColor(255, 255, 255);
        $this->pdf->Ln(8);
        
        // Verificar si necesitamos nueva página
        if ($this->pdf->GetY() > 190) {
            $this->pdf->AddPage('L');
            $this->generarCabeceraTablaFormatoFisico($data, $anchos, $total_dias, $ancho_dia, $margen_izquierdo);
        }
    }
}

//Funion para obtener días con hangar específico (H1/H2) o fuera (F)

private function obtenerDiasConHangarEspecifico($id_aeronave, $fecha_inicio, $fecha_fin) {
    $resultado = [];
    
    try {
        $conexionPath = __DIR__ . '/../models/conexion.php';
        if (file_exists($conexionPath)) {
            // Incluir el archivo y capturar la variable $pdo
            require_once($conexionPath);
            
            if (!isset($pdo) || $pdo === null) {
                throw new Exception('La conexión PDO no se estableció correctamente');
            }
        } else {
            throw new Exception('Archivo de conexión no encontrado en: ' . $conexionPath);
        }
        
        // Consultar todos los registros de control_pernocta para esta aeronave en el período
        $sql = "SELECT Fecha, Hangar 
                FROM control_pernocta 
                WHERE Id_Aeronave = ? 
                AND Fecha BETWEEN ? AND ?
                AND Estado_Registro = 'activo'
                ORDER BY Fecha ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id_aeronave, $fecha_inicio, $fecha_fin]);
        $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Crear array con todas las fechas del período
        $fecha_actual = new DateTime($fecha_inicio);
        $fecha_fin_obj = new DateTime($fecha_fin);
        
        while ($fecha_actual <= $fecha_fin_obj) {
            $fecha_str = $fecha_actual->format('Y-m-d');
            $resultado[$fecha_str] = 'F'; // Por defecto fuera
            
            // Buscar si hay registro para esta fecha
            foreach ($registros as $registro) {
                if ($registro['Fecha'] == $fecha_str) {
                    if ($registro['Hangar'] && in_array($registro['Hangar'], ['H1', 'H2'])) {
                        $resultado[$fecha_str] = $registro['Hangar']; // H1 o H2
                    } else {
                        $resultado[$fecha_str] = 'F'; // Registro existe pero sin hangar
                    }
                    break;
                }
            }
            
            $fecha_actual->modify('+1 day');
        }
        
    } catch (Exception $e) {
        // En caso de error, crear array con 'F' para todos los días
        error_log("Error en obtenerDiasConHangarEspecifico: " . $e->getMessage());
        
        $fecha_actual = new DateTime($fecha_inicio);
        $fecha_fin_obj = new DateTime($fecha_fin);
        
        while ($fecha_actual <= $fecha_fin_obj) {
            $fecha_str = $fecha_actual->format('Y-m-d');
            $resultado[$fecha_str] = 'F';
            $fecha_actual->modify('+1 day');
        }
    }
    
    return $resultado;
}


/**
 * CABECERA DE TABLA PARA NUEVAS PÁGINAS
 */
private function generarCabeceraTablaFormatoFisico($data, $anchos, $total_dias, $ancho_dia, $margen_izquierdo) {
    // POSICIONAR TABLA MÁS A LA IZQUIERDA EN NUEVAS PÁGINAS
    $this->pdf->SetX($margen_izquierdo);
    
    // Fila 1: Títulos principales
    $this->pdf->SetFont('helvetica', 'B', 8);
    $this->pdf->SetFillColor(240, 240, 240);
    
    $this->pdf->Cell($anchos['matricula'], 10, 'MATRÍCULA', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['equipo'], 10, 'EQUIPO', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['empresa'], 10, 'EMPRESA/PROCEDENCIA', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['dias_hangar'], 10, 'DÍAS HANGAR', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['dias_fuera'], 10, 'DÍAS FUERA', 1, 0, 'C', true);
    $this->pdf->Cell($anchos['calendario'], 10, 'CALENDARIO DE DÍAS', 1, 1, 'C', true);
    
    // Fila 2: Números de día
    $this->pdf->SetX($margen_izquierdo + $anchos['matricula'] + $anchos['equipo'] + $anchos['empresa'] + $anchos['dias_hangar'] + $anchos['dias_fuera']);
    
    for ($dia = 1; $dia <= $total_dias; $dia++) {
        $this->pdf->Cell($ancho_dia, 6, $dia, 1, 0, 'C', true);
    }
    $this->pdf->Ln(6);
    
    $this->pdf->SetFont('helvetica', '', 7);
}

/**
 * Obtiene la empresa/procedencia de una aeronave
 */
private function obtenerEmpresaProcedencia($id_aeronave, $fecha_inicio, $fecha_fin) {
    try {
        require_once('../models/conexion.php');
        
        $sql = "SELECT pd.Procedencia, cp.EmpresaProcedencia 
                FROM pernocta_diaria pd 
                LEFT JOIN control_pernocta cp ON pd.Id_Aeronave = cp.Id_Aeronave 
                WHERE pd.Id_Aeronave = ? 
                AND pd.Fecha BETWEEN ? AND ?
                ORDER BY pd.Fecha DESC, pd.Hora DESC 
                LIMIT 1";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id_aeronave, $fecha_inicio, $fecha_fin]);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($resultado) {
            if (!empty($resultado['EmpresaProcedencia'])) {
                return $resultado['EmpresaProcedencia'];
            } elseif (!empty($resultado['Procedencia'])) {
                return $resultado['Procedencia'];
            }
        }
        
        return 'No especificada';
        
    } catch (Exception $e) {
        return 'No disponible';
    }
}
}

// USO DEL GENERADOR
$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : '';
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

ob_clean();

$generator = new PDFGenerator();

// SWITCH DE SELECCIÓN DE CASO
switch($tipo) {
    case 'entrega_turno':
    case 'walkaround':
    case 'pernocta':
    case 'remision_combustible':
            // Estos tipos REQUIEREN ID
        if ($id <= 0) {
            die('ID requerido para ' . $tipo);
        }
        break;
        
    case 'relacion_mensual':
        // Este tipo NO requiere ID, requiere fechas
        $fecha_inicio = isset($_GET['fecha_inicio']) ? $_GET['fecha_inicio'] : '';
        $fecha_fin = isset($_GET['fecha_fin']) ? $_GET['fecha_fin'] : '';
        
        if (empty($fecha_inicio) || empty($fecha_fin)) {
            die('Fechas de inicio y fin requeridas para relación mensual');
        }
        
        // Validar formato de fechas
        if (!strtotime($fecha_inicio) || !strtotime($fecha_fin)) {
            die('Formato de fecha inválido');
        }
        break;
        
    default:
        die('Tipo de reporte no válido. Use: entrega_turno, walkaround, pernocta, pernoctas_diarias o relacion_mensual');
}

switch($tipo) {
    case 'entrega_turno':
        $generator->generarEntregaTurno($id);
        break;
    case 'walkaround':
        $generator->generarWalkaround($id);
        break;
    case 'pernocta':
        $generator->generarPernocta($id);
        break;
    case 'pernoctas_diarias':
        $generator->generarPernoctasDiarias($id);
        break;
    case 'relacion_mensual':
        $generator->generarRelacionMensual($fecha_inicio, $fecha_fin);
        break;
    case 'remision_combustible':
        $generator->generarRemisionCombustible($id);
        break;    
}
?>

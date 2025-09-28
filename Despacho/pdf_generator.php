<?php
require_once(__DIR__ . '../../tcpdf/tcpdf.php');

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
     * Genera PDF para Entrega de Turno - CORREGIDO DEFINITIVO
     */
    public function generarEntregaTurno($id) {
        require_once('../conexion.php');
        
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
    /**
 * Genera PDF para Walkaround - VERSIÓN CORREGIDA
 */
public function generarWalkaround($id) {
    require_once('../conexion.php');
    
    try {
        // Obtener datos del walkaround
        $sql = "SELECT w.*, a.Matricula, a.Equipo, a.Procedencia, a.Tipo 
                FROM walkaround w 
                LEFT JOIN aeronave a ON w.Id_Aeronave = a.Id_Aeronave 
                WHERE w.Id_Walk = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        $walkaround = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$walkaround) {
            die('Walkaround no encontrado');
        }
        
        // Obtener componentes
        $componentes = $this->getComponentesWalkaround($pdo, $id);
        
        // Primera página: Cabecera y componentes en tabla
        $this->pdf->AddPage();
        $this->generarCabeceraWalkaround($walkaround);
        $this->generarComponentesWalkaroundPDF($componentes, $walkaround['Tipo']);
        
        // Segunda página: Diagrama
        $this->generarDiagrama($walkaround['Tipo']);
        
         // Tercera página: Observaciones y Firmas
            $this->pdf->AddPage();
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
     * CABECERA ENTREGA DE TURNO CON LOGO
     */
    private function generarCabeceraEntregaTurno($entrega, $segundaPagina = false) {
        // Logo EOLO (izquierda)
        $logoPath = __DIR__ . '/../logos/eolo_logo.png';
        if (file_exists($logoPath)) {
            $this->pdf->Image($logoPath, 15, 10, 20, 0, 'PNG', '', 'T', false, 300, '', false, false, 0, false, false, false);
        }
        
        // Título centrado
        $this->pdf->SetFont('helvetica', 'B', 14);
        $this->pdf->SetY(12);
        $this->pdf->Cell(0, 10, 'ENTREGA DE TURNO, OFICINA DE DESPACHO', 0, 1, 'C');
        
        // Información de fecha y nombre
        $this->pdf->SetFont('helvetica', '', 10);
        $fecha_formateada = date('d/m/Y', strtotime($entrega['Fecha']));
        $this->pdf->Cell(0, 6, 'FECHA: ' . $fecha_formateada . '    NOMBRE: ' . $entrega['Nombre'], 0, 1);
        
        if (!$segundaPagina) {
            $this->pdf->SetFont('helvetica', 'B', 10);
            $this->pdf->Cell(0, 6, 'ID DEL REPORTE: ' . $entrega['Id_EntregaTurno'], 0, 1);
            $this->pdf->Ln(5);
        }
    }
    
    /**
     * CABECERA WALKAROUND CON LOGO
     */
    private function generarCabeceraWalkaround($walkaround) {
        // Logo EOLO (izquierda)
        $logoPath = __DIR__ . '/../logos/eolo_logo.png';
        if (file_exists($logoPath)) {
            $this->pdf->Image($logoPath, 15, 10, 20, 0, 'PNG', '', 'T', false, 300, '', false, false, 0, false, false, false);
        }
        
        // Título EOLO centrado
        $this->pdf->SetFont('helvetica', 'B', 16);
        $this->pdf->SetY(12);
        $this->pdf->Cell(0, 10, 'E O L O', 0, 1, 'C');
        
        // Tabla de información
        $this->pdf->SetFont('helvetica', '', 10);
        $this->pdf->SetY(25);
        
        // Cabecera de la tabla
        $this->pdf->SetFillColor(240, 240, 240);
        $this->pdf->Cell(30, 8, 'Fecha', 1, 0, 'C', true);
        $this->pdf->Cell(25, 8, 'Hora', 1, 0, 'C', true);
        $this->pdf->Cell(40, 8, 'Equipo', 1, 0, 'C', true);
        $this->pdf->Cell(40, 8, 'Matrícula', 1, 0, 'C', true);
        $this->pdf->Cell(50, 8, 'Procedencia', 1, 1, 'C', true);
        
        // CORRECCIÓN: Campo FechaHora es DateTime
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
        
        $this->pdf->Cell(30, 10, $fecha, 1, 0, 'C');
        $this->pdf->Cell(25, 10, $hora, 1, 0, 'C');
        $this->pdf->Cell(40, 10, isset($walkaround['Equipo']) ? $walkaround['Equipo'] : 'No especificado', 1, 0, 'C');
        $this->pdf->Cell(40, 10, isset($walkaround['Matricula']) ? $walkaround['Matricula'] : 'No especificada', 1, 0, 'C');
        $this->pdf->Cell(50, 10, isset($walkaround['Procedencia']) ? $walkaround['Procedencia'] : 'No especificada', 1, 1, 'C');
        
        $this->pdf->Ln(8);
        $this->pdf->SetFont('helvetica', 'B', 10);
        $this->pdf->Cell(0, 6, 'ID DEL REPORTE: ' . $walkaround['Id_Walk'], 0, 1);
        $this->pdf->Ln(5);
    }
    
    /**
     * EQUIPOS DE COMUNICACIÓN - CORREGIDO DEFINITIVO
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
        
        // Generar filas de equipos CORREGIDAS
        $this->generarFilaEquipoComCorregida('CELULAR ZTE', '1', $equipos, 'CELULAR ZTE', 'Cargado');
        $this->generarFilaEquipoComCorregida('RADIO MOTOROLA', '2', $equipos, 'RADIO MOTOROLA', 'Cargado');
        $this->generarFilaEquipoComCorregida('RADIO VHF Portátil', '2', $equipos, 'RADIO VHF Portátil', 'Cargado');
        $this->generarFilaEquipoComCorregida('RADIO VHF Fijo', '1', $equipos, 'RADIO VHF Fijo', 'Fallas');
        
        $this->pdf->Ln(8);
    }
    
    /**
     * GENERAR FILA CORREGIDA - CENTRADO PERFECTO
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
     * EQUIPOS DE OFICINA
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
     * COPIADORAS - CORREGIDO DEFINITIVO (SIN SUPERPOSICIÓN)
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

    // Texto "HP"
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
     * FONDO Y DOCUMENTACIÓN - CORREGIDO DEFINITIVO
     */
    private function generarFondoYDocumentacionPDF($entrega) {
        $this->pdf->SetFont('helvetica', 'B', 10);
        $this->pdf->Cell(0, 8, 'FONDO:         RECIBIDO: $' . number_format($entrega['Fondo'], 2) . '                                 ENTREGADO: $' . number_format($entrega['Fondo'], 3), 0, 1);
        
        // VALES DE GASOLINA
        $this->pdf->Cell(0, 8, 'VALES DE GASOLINA:          CANTIDAD: ' . $entrega['Vales_Gasolina'] . '              FOLIO: ' . $entrega['Vales_Gasolina_Folio'], 0, 1);
        
        // REPORTE DE ATERRIZAJES - CORREGIDO (SIN SUPERPOSICIÓN)
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
     * CAJA FUERTE Y FIRMAS - SIN PÁGINA EXTRA
     */
     private function generarCajaFuerteYFirmasPDF($entrega) {
        /// CORRECCIÓN: Verificar si necesitamos nueva página ANTES de agregar contenido
        $alturaNecesaria = 50;

         // Calcular espacio disponible en la página actual
        $espacioDisponible = 297 - $this->pdf->GetY() - 20; // Altura A4 - posición Y - margen inferior
        
        // Si el espacio es insuficiente para el contenido restante, forzar nueva página
        if ($espacioDisponible < $alturaNecesaria) { // 60mm es el espacio aproximado que necesitamos
            $this->pdf->AddPage();
            $this->generarCabeceraEntregaTurno($entrega, true);
            $this->pdf->SetY(40);
        }
        
        // CAJA FUERTE - versión más compacta
        $this->pdf->SetFont('helvetica', 'B', 10);
        $this->pdf->Cell(0, 6, 'CAJA FUERTE:', 0, 1); // Reducido de 8 a 6
        $this->pdf->SetFont('helvetica', '', 9);
        
        $contenido = $entrega['Caja_Fuerte_Contenido'] ?: 'Sin observaciones';
        
         // Usar MultiCell para contenido largo
        $this->pdf->MultiCell(0, 6, $contenido, 0, 'L');
        
        $this->pdf->Ln(8);
        
        // FIRMAS más compactas
        $this->pdf->SetFont('helvetica', 'B', 10); 
        $this->pdf->Cell(95, 6, 'FIRMA Y NOMBRE DE QUIEN ENTREGA', 0, 0); // Reducido de 8 a 6
        $this->pdf->Cell(95, 6, 'JEFE TURNO DE DESPACHO', 0, 1); // Reducido de 8 a 6
        
        $this->pdf->SetFont('helvetica', '', 9);
        
        // Líneas para firmas más compactas
        $this->pdf->Cell(95, 15, $entrega['Firma_Entrega'] ?: '_________________________', 0, 0, 'C'); // Reducido de 12 a 8
        $this->pdf->Cell(95, 15, $entrega['Firma_Recibe'] ?: '_________________________', 0, 1, 'C'); // Reducido de 12 a 8
    }

    /**
     * Método auxiliar para calcular altura del texto
     */
    private function calcularAlturaTexto($texto, $ancho, $alturaLinea, $maxCaracteres) {
        $texto = substr($texto, 0, $maxCaracteres);
        $numLineas = ceil(strlen($texto) / 80); // Aproximar líneas necesarias
        return $numLineas * $alturaLinea;
    }
    
    /**
 * COMPONENTES WALKAROUND EN TABLA CON BORDES - NUEVA VERSIÓN
 */
private function generarComponentesWalkaroundPDF($componentes, $tipoAeronave) {
    $tipo = strtolower($tipoAeronave);
    
    $this->pdf->SetFont('helvetica', 'B', 12);
    if ($tipo === 'avion') {
        $this->pdf->Cell(0, 10, 'COMPONENTES - AVIONES', 0, 1);
    } else {
        $this->pdf->Cell(0, 10, 'COMPONENTES - HELICÓPTEROS', 0, 1);
    }
    
    // Configurar anchos de columnas PERFECTOS
    $anchoComponente = 75;
    $anchoCheckbox = 25;
    $anchoObservaciones = 60;
    
    // Cabecera de la tabla
    $this->pdf->SetFont('helvetica', 'B', 8);
    $this->pdf->SetFillColor(240, 240, 240);
    
    $this->pdf->Cell($anchoComponente, 8, 'COMPONENTE', 1, 0, 'C', true);
    $this->pdf->Cell($anchoCheckbox, 8, 'SIN DAÑO', 1, 0, 'C', true);
    $this->pdf->Cell($anchoCheckbox, 8, 'CON DAÑO', 1, 0, 'C', true);
    $this->pdf->Cell($anchoObservaciones, 8, 'OBSERVACIONES', 1, 1, 'C', true);
    
    $this->pdf->SetFont('helvetica', '', 8);
    $this->pdf->SetFillColor(255, 255, 255);
    
    $componentesPredefinidos = $this->getComponentesPorTipo($tipo);
    
    foreach ($componentesPredefinidos as $componente) {
        $componenteGuardado = $this->findComponente($componentes, $componente['id']);
        $estado = $componenteGuardado ? $componenteGuardado['Estado'] : 0;
        $observaciones = $componenteGuardado ? $componenteGuardado['Observaciones'] : '';
        
        // ALTURA FIJA PARA TODAS LAS FILAS
        $alturaFila = 8;
        
        // Guardar posición Y inicial
        $yInicial = $this->pdf->GetY();
        
        // 1. COMPONENTE (usar Cell normal, no MultiCell)
        $textoComponente = $this->truncarTexto($componente['nombre'], 45);
        $this->pdf->Cell($anchoComponente, $alturaFila, $textoComponente, 1, 0, 'L');
        
        // 2. SIN DAÑO - Checkbox
        $xCheckbox1 = $this->pdf->GetX();
        $this->pdf->Cell($anchoCheckbox, $alturaFila, '', 1, 0, 'C');
        // Dibujar checkbox CENTRADO
        $this->dibujarCheckbox($estado == 1, $xCheckbox1 + ($anchoCheckbox/2 - 1.5), $yInicial + ($alturaFila/2 - 1.5));
        
        // 3. CON DAÑO - Checkbox
        $xCheckbox2 = $this->pdf->GetX();
        $this->pdf->Cell($anchoCheckbox, $alturaFila, '', 1, 0, 'C');
        // Dibujar checkbox CENTRADO
        $this->dibujarCheckbox($estado == 2, $xCheckbox2 + ($anchoCheckbox/2 - 1.5), $yInicial + ($alturaFila/2 - 1.5));
        
        // 4. OBSERVACIONES (usar Cell normal)
        $textoObservaciones = $this->truncarTexto($observaciones, 30);
        $this->pdf->Cell($anchoObservaciones, $alturaFila, $textoObservaciones, 1, 1, 'L');
        
        // VERIFICAR SI NECESITAMOS NUEVA PÁGINA
        if ($this->pdf->GetY() > 250) {
            $this->pdf->AddPage();
            // Redibujar cabecera de tabla si es nueva página
            $this->pdf->SetFont('helvetica', 'B', 8);
            $this->pdf->SetFillColor(240, 240, 240);
            $this->pdf->Cell($anchoComponente, 8, 'COMPONENTE', 1, 0, 'C', true);
            $this->pdf->Cell($anchoCheckbox, 8, 'SIN DAÑO', 1, 0, 'C', true);
            $this->pdf->Cell($anchoCheckbox, 8, 'CON DAÑO', 1, 0, 'C', true);
            $this->pdf->Cell($anchoObservaciones, 8, 'OBSERVACIONES', 1, 1, 'C', true);
            $this->pdf->SetFont('helvetica', '', 8);
        }
    }
    
    $this->pdf->Ln(8);
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

/**
 * Método auxiliar para calcular líneas de texto
 */
private function calcularLineasTexto($texto, $anchoMaximo) {
    if (empty($texto)) return 1;
    
    $palabras = explode(' ', $texto);
    $lineaActual = '';
    $lineas = 1;
    
    foreach ($palabras as $palabra) {
        $lineaPrueba = $lineaActual . ($lineaActual ? ' ' : '') . $palabra;
        // Estimación aproximada de ancho (1mm por carácter en font size 8)
        if (strlen($lineaPrueba) * 0.5 > $anchoMaximo) {
            $lineas++;
            $lineaActual = $palabra;
        } else {
            $lineaActual = $lineaPrueba;
        }
    }
    
    return $lineas;
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
    
    // MÉTODOS AUXILIARES
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
                ['id' => 'radomo', 'nombre' => 'Radomo'],
                ['id' => 'parabrisas', 'nombre' => 'Parabrisas, limpiadores'],
                ['id' => 'tubos_pitot', 'nombre' => 'Tubos Pitot'],
                ['id' => 'tren_nariz', 'nombre' => 'Tren de nariz (llantas, luces, fugas)'],
                ['id' => 'fuselaje_izq', 'nombre' => 'Fuselaje lado izquierdo (Antenas, luces, ventanillas)'],
                ['id' => 'puerta_acceso_cabina', 'nombre' => 'Puerta de acceso a cabina (escalera, barandillas, marco)'],
                ['id' => 'antenas', 'nombre' => 'Antenas'],
                ['id' => 'semiala_izq', 'nombre' => 'Semiala izquierda (Bordes, winglet, estáticas, sup. de control)'],
                ['id' => 'tren_principal_izq', 'nombre' => 'Tren principal izquierdo (Llantas, fugas...)'],
                ['id' => 'compartimiento_carga', 'nombre' => 'Compartimiento de carga (exterior e interior)'],
                ['id' => 'empenaje', 'nombre' => 'Empenaje (Bordes, estáticas, superficies de control)'],
                ['id' => 'semiala_der', 'nombre' => 'Semiala derecha (Bordes, winglet, estáticas, sup. de control)'],
                ['id' => 'tren_principal_der', 'nombre' => 'Tren principal derecho (Llantas, fugas...)'],
                ['id' => 'valvulas_servicio', 'nombre' => 'Válvulas de servicio (Combustible, agua, libre de fugas)'],
                ['id' => 'motores', 'nombre' => 'Motores (Cowling, carenados...)'],
                ['id' => 'fuselaje_der', 'nombre' => 'Fuselaje lado derecho (Antenas, luces, ventanillas)'],
                ['id' => 'registros_servicios', 'nombre' => 'Registros de Servicios']
            ],
            'helicoptero' => [
                ['id' => 'fuselaje', 'nombre' => 'Fuselaje (Puertas, ventanas, antenas, luces)'],
                ['id' => 'esqui_neumaticos', 'nombre' => 'Esquí/Neumáticos'],
                ['id' => 'palas', 'nombre' => 'Palas'],
                ['id' => 'boom', 'nombre' => 'Boom'],
                ['id' => 'estabilizadores', 'nombre' => 'Estabilizadores'],
                ['id' => 'rotor_cola', 'nombre' => 'Rotor de Cola']
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
 * GENERAR DIAGRAMA EN SEGUNDA HOJA
 */
 private function generarDiagrama($tipoVehiculo) {
        // Forzar segunda página
        $this->pdf->AddPage();
        
        $rutaDiagrama = '';
        $titulo = '';
        
        // Determinar ruta del diagrama según el tipo - CORREGIDA LA RUTA
        $basePath = __DIR__ . '/../diagramas/';
        
        if (strtoupper($tipoVehiculo) === 'AVION' || strtoupper($tipoVehiculo) === 'AVIÓN') {
            $rutaDiagrama = $basePath . 'diagrama_avion.jpg';
            $titulo = 'DIAGRAMA DE AVIÓN';
        } elseif (strtoupper($tipoVehiculo) === 'HELICOPTERO' || strtoupper($tipoVehiculo) === 'HELICÓPTERO') {
            $rutaDiagrama = $basePath . 'diagrama_helicoptero.jpg';
            $titulo = 'DIAGRAMA DE HELICÓPTERO';
        } else {
            // Por defecto avión
            $rutaDiagrama = $basePath . 'diagrama_avion.jpg';
            $titulo = 'DIAGRAMA DE AVIÓN';
        }
        
        // Título
        $this->pdf->SetFont('helvetica', 'B', 16);
        $this->pdf->Cell(0, 15, $titulo, 0, 1, 'C');
        $this->pdf->Ln(5);
        
        // Mostrar imagen si existe - VERIFICAR EXTENSIONES
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
            $anchoDisponible = 160;
            $altoDisponible = 120;
            $x = (210 - $anchoDisponible) / 2;
            
            $this->pdf->Image($rutaDiagrama, $x, $this->pdf->GetY(), $anchoDisponible, $altoDisponible, 'JPG', '', 'T', false, 300, '', false, false, 0, false, false, false);
            $this->pdf->Ln(130);
        } else {
            $this->pdf->SetFont('helvetica', 'I', 12);
            $this->pdf->Cell(0, 10, 'Diagrama no disponible: ' . basename($rutaDiagrama), 0, 1, 'C');
            $this->pdf->Cell(0, 10, 'Buscado en: ' . $basePath, 0, 1, 'C');
        }
    }

     /**
     * OBSERVACIONES WALKAROUND - NUEVO MÉTODO
     */
    private function generarObservacionesWalkaroundPDF($walkaround) {
        $this->pdf->SetFont('helvetica', 'B', 12);
        $this->pdf->Cell(0, 10, 'OBSERVACIONES/OTRO (ESPECIFICAR)', 0, 1);
        
        $this->pdf->SetFont('helvetica', '', 10);
        
        // CORRECCIÓN: Usar el campo 'observaciones' en minúsculas
    $observaciones = 'No hay observaciones registradas.';
    
    if (isset($walkaround['observaciones']) && !empty(trim($walkaround['observaciones']))) {
        $observaciones = $walkaround['observaciones'];
    }
    
    // Crear un cuadro para las observaciones
    $this->pdf->SetFillColor(245, 245, 245);
    $this->pdf->MultiCell(0, 8, $observaciones, 1, 'L', true);
    
    $this->pdf->Ln(10);
}
    
    private function generarFirmasWalkaroundPDF($walkaround) {

        $this->pdf->SetFont('helvetica', 'B', 10);
        $this->pdf->Cell(0, 8, 'Responsable de la operación (Nombre y firma):', 0, 1);
        $this->pdf->SetFont('helvetica', '', 9);
        
        // CORRECCIÓN: Verificar que la clave existe
        $responsable = isset($walkaround['Responsable']) ? $walkaround['Responsable'] : '_________________________';
        $this->pdf->Cell(0, 20, $responsable, 'B', 1);
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
        
        $this->pdf->Cell(60, 20, $elaboro, 'B', 0);
        $this->pdf->Cell(60, 20, $jefeArea, 'B', 0);
        $this->pdf->Cell(60, 20, $voBo, 'B', 1);
    }
}


// USO DEL GENERADOR
$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : '';
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if (empty($tipo) || $id <= 0) {
    die('Parámetros inválidos. Uso: pdf_generator.php?tipo=entrega_turno&id=1');
}

// CORRECCIÓN: Limpiar buffer de salida antes de generar PDF
ob_clean();

$generator = new PDFGenerator();

switch($tipo) {
    case 'entrega_turno':
        $generator->generarEntregaTurno($id);
        break;
    case 'walkaround':
        $generator->generarWalkaround($id);
        break;
    default:
        die('Tipo de reporte no válido. Use: entrega_turno o walkaround');
}
?>
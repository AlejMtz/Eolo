<?php
// test_pdf.php - Archivo para probar TCPDF
require_once(__DIR__ . '/tcpdf/tcpdf.php');

// Crear instancia de TCPDF
$pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);

// Configurar documento
$pdf->SetCreator('Test');
$pdf->SetAuthor('Test');
$pdf->SetTitle('Test TCPDF');
$pdf->SetSubject('Test');

// Agregar página
$pdf->AddPage();

// Agregar contenido
$pdf->SetFont('helvetica', 'B', 16);
$pdf->Cell(0, 10, '¡TCPDF funciona correctamente!', 0, 1, 'C');
$pdf->SetFont('helvetica', '', 12);
$pdf->Cell(0, 10, 'Fecha: ' . date('Y-m-d H:i:s'), 0, 1);

// Salida
$pdf->Output('test.pdf', 'I');
?>
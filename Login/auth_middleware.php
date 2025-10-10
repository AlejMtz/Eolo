<?php
session_start();

function verificarSesion() {
    if (!isset($_SESSION['logueado']) || $_SESSION['logueado'] !== true) {
        header('Location: ../login.html');
        exit;
    }
}

function esAdministrador() {
    return isset($_SESSION['tipo_usuario']) && $_SESSION['tipo_usuario'] === 'admin';
}

function obtenerUsuarioActual() {
    return [
        'id' => $_SESSION['usuario_id'] ?? null,
        'nombre' => $_SESSION['usuario_nombre'] ?? '',
        'tipo' => $_SESSION['tipo_usuario'] ?? 'usuario'
    ];
}
?>
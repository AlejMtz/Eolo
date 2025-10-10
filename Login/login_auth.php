<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

try {
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    
    if (empty($username) || empty($password)) {
        throw new Exception('Usuario y contraseña son obligatorios');
    }
    
    // Buscar usuario en la base de datos
    $sql = "SELECT Id_Usuario, Username, Password, Nombre_Completo, Tipo_Usuario, Activo 
            FROM usuarios 
            WHERE Username = ? AND Activo = 1";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$username]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$usuario) {
        throw new Exception('Usuario no encontrado o inactivo');
    }
    
    // Por ahora usamos una verificación simple para testing
    if ($password === 'password') {
        // Contraseña correcta
        $_SESSION['usuario_id'] = $usuario['Id_Usuario'];
        $_SESSION['usuario_nombre'] = $usuario['Nombre_Completo'];
        $_SESSION['tipo_usuario'] = $usuario['Tipo_Usuario'];
        $_SESSION['logueado'] = true;
        
        // Actualizar último acceso
        $sql_update = "UPDATE usuarios SET Ultimo_Acceso = NOW() WHERE Id_Usuario = ?";
        $stmt_update = $pdo->prepare($sql_update);
        $stmt_update->execute([$usuario['Id_Usuario']]);
        
        echo json_encode([
            'success' => true,
            'usuario_id' => $usuario['Id_Usuario'],
            'usuario_nombre' => $usuario['Nombre_Completo'],
            'tipo_usuario' => $usuario['Tipo_Usuario']
        ]);
        
    } else {
        throw new Exception('Contraseña incorrecta');
    }
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

function verificarSesion() {
    if (!localStorage.getItem('usuario_logueado')) {
        window.location.href = '../app/views/login.html';
        return false;
    }
    return true;
}

function obtenerInfoUsuario() {
    return {
        nombre: localStorage.getItem('usuario_nombre'),
        tipo: localStorage.getItem('tipo_usuario'),
        id: localStorage.getItem('usuario_id')
    };
}

function cerrarSesion() {
    localStorage.removeItem('usuario_logueado');
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('usuario_nombre');
    localStorage.removeItem('tipo_usuario');
    window.location.href = '../views/login.html';
}

// Verificar sesión automáticamente al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    if (!verificarSesion()) {
        return;
    }
    
    // Mostrar información del usuario si existe el elemento
    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) {
        const usuario = obtenerInfoUsuario();
        userInfoElement.innerHTML = `
            <i class="fas fa-user me-1"></i>
            ${usuario.nombre}
            <small class="badge bg-light text-dark ms-1">${usuario.tipo === 'admin' ? 'Admin' : 'Usuario'}</small>
        `;
    }
});
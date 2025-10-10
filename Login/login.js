// login.js - Manejo del formulario de login

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    
    // Si ya está logueado, redirigir al menú principal
    if (localStorage.getItem('usuario_logueado')) {
        window.location.href = '../Menu/Index.html';
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (this.checkValidity()) {
            realizarLogin();
        } else {
            this.classList.add('was-validated');
        }
    });
    
    // Quitar validación cuando el usuario escriba
    document.getElementById('username').addEventListener('input', function() {
        this.classList.remove('is-invalid');
    });
    
    document.getElementById('password').addEventListener('input', function() {
        this.classList.remove('is-invalid');
    });
});

function realizarLogin() {
    const formData = new FormData(document.getElementById('loginForm'));
    const btnSubmit = document.querySelector('#loginForm button[type="submit"]');
    const originalText = btnSubmit.innerHTML;
    
    // Mostrar loading
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Verificando...';
    btnSubmit.disabled = true;
    
    fetch('../Login/login_auth.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Guardar datos de sesión
            localStorage.setItem('usuario_logueado', 'true');
            localStorage.setItem('usuario_id', data.usuario_id);
            localStorage.setItem('usuario_nombre', data.usuario_nombre);
            localStorage.setItem('tipo_usuario', data.tipo_usuario);
            
            // Redirigir al menú principal
            window.location.href = '../Menu/Index.html';
        } else {
            mostrarError(data.error || 'Error desconocido');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarError('Error de conexión con el servidor');
    })
    .finally(() => {
        btnSubmit.innerHTML = originalText;
        btnSubmit.disabled = false;
    });
}

function mostrarError(mensaje) {
    document.getElementById('errorModalBody').textContent = mensaje;
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    errorModal.show();
}
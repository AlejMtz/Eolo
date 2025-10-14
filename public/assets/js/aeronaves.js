// Variables globales para los modales
let successModal = null;
let errorModal = null;
let confirmModal = null;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar modales de Bootstrap
    if (typeof bootstrap !== 'undefined') {
        successModal = new bootstrap.Modal(document.getElementById('successModal'));
        errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        
        // Solo inicializar confirmModal si existe
        const confirmModalElement = document.getElementById('confirmModal');
        if (confirmModalElement) {
            confirmModal = new bootstrap.Modal(confirmModalElement);
        }
    }

    // Verificar permisos antes de cargar contenido
    if (!verificarPermisosAeronaves()) {
        return;
    }

    // Detecta si el elemento de la tabla existe para saber en qué página estamos
    if (document.getElementById('tablaAeronaves')) {
        cargarAeronaves();
    }

    // Detecta si el elemento del formulario existe para saber en qué página estamos
    if (document.getElementById('aeronaveForm')) {
        configurarFormularioAeronave();
    }
    
    configurarValidacionMatricula();

    // Configurar evento para el botón de confirmación de eliminación
    const confirmBtn = document.getElementById('confirmActionBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (id) {
                eliminarAeronaveConfirmada(id);
            }
        });
    }
});

/**
 * Muestra modal de éxito
 * @param {string} mensaje - Mensaje a mostrar
 * @param {function} callback - Función a ejecutar al cerrar el modal
 */
function mostrarExito(mensaje, callback = null) {
    const modalBody = document.getElementById('successModalBody');
    if (modalBody && successModal) {
        modalBody.textContent = mensaje;
        successModal.show();
        
        // Configurar callback si se proporciona
        if (callback) {
            const modalElement = document.getElementById('successModal');
            const handler = function() {
                callback();
                modalElement.removeEventListener('hidden.bs.modal', handler);
            };
            modalElement.addEventListener('hidden.bs.modal', handler);
        }
    } else {
        alert('¡Éxito! 🎉\n' + mensaje);
        if (callback) callback();
    }
}

/**
 * Muestra modal de error
 * @param {string} mensaje - Mensaje a mostrar
 */
function mostrarError(mensaje) {
    const modalBody = document.getElementById('errorModalBody');
    if (modalBody && errorModal) {
        modalBody.textContent = mensaje;
        errorModal.show();
    } else {
        alert('¡Error! ⚠️\n' + mensaje);
    }
}

/**
 * Muestra modal de confirmación para eliminar
 * @param {string} id - ID de la aeronave a eliminar
 */
function mostrarConfirmacionEliminar(id) {
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    if (modalBody && confirmModal && confirmBtn) {
        modalBody.textContent = '¿Estás seguro de que quieres eliminar esta aeronave? Esta acción no se puede deshacer.';
        confirmBtn.setAttribute('data-id', id);
        confirmModal.show();
    } else {
        // Fallback al confirm tradicional
        if (confirm('¿Estás seguro de que quieres eliminar esta aeronave?')) {
            eliminarAeronaveConfirmada(id);
        }
    }
}

/**
 * Verifica permisos para el módulo de aeronaves
 */
function verificarPermisosAeronaves() {
    if (!localStorage.getItem('usuario_logueado')) {
        window.location.href = '../app/views/login.html';
        return false;
    }
    
    // Todos pueden ver aeronaves, pero solo admin puede gestionar
    return true;
}

/**
 * Configura el formulario de aeronave con validación de permisos
 */
function configurarFormularioAeronave() {
    const formulario = document.getElementById('aeronaveForm');
    const puedeGestionar = permisosSistema.puedeCrear('aeronaves');
    
    formulario.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Verificar permisos antes de enviar
        if (!puedeGestionar) {
            mostrarErrorPermisos('No tienes permisos para gestionar aeronaves');
            return;
        }
        
        const id_aeronave = document.getElementById('id_aeronave').value;
        
        if (!id_aeronave && window.location.search.includes('id=')) {
            mostrarError('No se pudo cargar el ID de la aeronave. Recarga la página.');
            return;
        }
        
        // ⭐⭐ RUTAS CORRECTAS desde public/assets/js/
        const url = id_aeronave ? '../../app/controllers/aeronaves_actualizar.php' : '../../app/controllers/aeronaves_crear.php';
        const formData = new FormData(this);

        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const mensaje = id_aeronave ? 
                    'Aeronave actualizada correctamente.' : 
                    'Aeronave creada correctamente.';
                mostrarExito(mensaje, () => {
                    window.location.href = '../../app/views/ver_aeronaves.html';
                });
            } else {
                mostrarError(data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Ocurrió un error al conectar con el servidor.');
        });
    });

    // Comprueba si hay un ID en la URL para cargar datos en el formulario de edición
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        cargarAeronaveParaEditar(id);
    }
}

/**
 * Carga la lista de aeronaves y la muestra en la tabla.
 */
async function cargarAeronaves() {
    const tablaBody = document.querySelector('#tablaAeronaves tbody');
    if (!tablaBody) return;

    tablaBody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';

    try {
        // ⭐⭐ RUTA CORRECTA desde public/assets/js/
        const response = await fetch('../../app/models/leer_aeronaves.php');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const aeronaves = await response.json();
        
        if (aeronaves.error) {
            throw new Error(aeronaves.error);
        }

        tablaBody.innerHTML = '';
        if (aeronaves.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay aeronaves registradas.</td></tr>';
        } else {
            const puedeEditar = permisosSistema.puedeEditar('aeronaves');
            const puedeEliminar = permisosSistema.puedeEliminar('aeronaves');
            
            aeronaves.forEach(aeronave => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${aeronave.Id_Aeronave}</td>
                    <td>${aeronave.Matricula}</td>
                    <td>${aeronave.Tipo}</td>
                    <td>${aeronave.Equipo}</td>
                    <td>
                        <!-- Botón Editar -->
                        <a href="../../app/views/aeronave.html?id=${aeronave.Id_Aeronave}" 
                           class="btn btn-warning btn-sm btn-editar"
                           title="${puedeEditar ? 'Editar aeronave' : 'Se requieren permisos de administrador'}"
                           style="${!puedeEditar ? 'opacity: 0.6; pointer-events: none;' : ''}">
                            <i class="fas fa-edit"></i>
                        </a>
                        
                        <!-- Botón Eliminar -->
                        <button class="btn btn-danger btn-sm btn-eliminar"
                                onclick="${puedeEliminar ? `eliminarAeronave(${aeronave.Id_Aeronave})` : 'mostrarErrorPermisos()'}" 
                                title="${puedeEliminar ? 'Eliminar aeronave' : 'Se requieren permisos de administrador'}"
                                style="${!puedeEliminar ? 'opacity: 0.6;' : ''}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        
                        <!-- Indicador visual de permisos -->
                        ${!puedeEditar ? '<span class="badge bg-secondary ms-1" title="Solo administradores pueden gestionar">🔒</span>' : ''}
                    </td>
                `;
                tablaBody.appendChild(fila);
            });
        }
    } catch (error) {
        console.error('Error al cargar aeronaves:', error);
        tablaBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar los datos.</td></tr>`;
    }
}

/**
 * Muestra error de permisos específico para aeronaves
 */
function mostrarErrorPermisos(mensaje = 'No tienes permisos para realizar esta acción') {
    // Buscar modal existente o crear uno
    let modalElement = document.getElementById('permisosModal');
    
    if (!modalElement) {
        const modalHTML = `
            <div class="modal fade" id="permisosModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-warning text-dark">
                            <h5 class="modal-title">
                                <i class="fas fa-ban me-2"></i>Permisos Insuficientes
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>${mensaje}</p>
                            <p class="text-muted">Solo los usuarios administradores pueden gestionar aeronaves.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-warning" data-bs-dismiss="modal">Entendido</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modalElement = document.getElementById('permisosModal');
    }

    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

/**
 * Carga los datos de una aeronave para rellenar el formulario de edición.
 * @param {string} id - El ID de la aeronave a editar.
 */
async function cargarAeronaveParaEditar(id) {
    console.log('🔍 Intentando cargar aeronave ID:', id);
    
    try {
        // Agrega un timestamp para evitar cache
        const response = await fetch(`../../app/controllers/aeronaves_leer_id.php?id=${id}&t=${Date.now()}`);
        
        console.log('📊 Status de respuesta:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            throw new Error(`Error ${response.status}: No se pudieron cargar los datos`);
        }
        
        const aeronave = await response.json();
        console.log('✅ Datos recibidos:', aeronave);
        
        if (aeronave.error) {
            console.warn('⚠️ Error en respuesta:', aeronave.error);
            throw new Error(aeronave.error);
        }

        if (!aeronave.Id_Aeronave) {
            console.warn('⚠️ Datos incompletos:', aeronave);
            throw new Error('Datos de aeronave incompletos');
        }

        // Llenar el formulario
        document.getElementById('id_aeronave').value = aeronave.Id_Aeronave;
        document.getElementById('matricula').value = aeronave.Matricula || '';
        document.getElementById('tipo').value = aeronave.Tipo || '';
        document.getElementById('equipo').value = aeronave.Equipo || '';

        // Cambiar estilo del botón
        document.getElementById('btnGuardar').innerText = 'Actualizar Aeronave';
        document.getElementById('btnGuardar').classList.remove('btn-primary');
        document.getElementById('btnGuardar').classList.add('btn-warning');
        
        console.log('✅ Formulario llenado exitosamente');

    } catch (error) {
        console.error('❌ Error en cargarAeronaveParaEditar:', error);
        
        // No mostrar alerta inmediatamente, usar timeout
        setTimeout(() => {
            // Solo mostrar error si realmente no se cargaron los datos
            const idAeronave = document.getElementById('id_aeronave').value;
            if (!idAeronave) {
                console.warn('⚠️ Mostrando alerta de error tardía');
                mostrarError(error.message + '\n\nPero puedes editar manualmente los datos.');
            }
        }, 1500);
    }
}

function configurarValidacionMatricula() {
    const inputMatricula = document.getElementById('matricula');
    if (!inputMatricula) return;

    let timeoutValidacion = null;

    inputMatricula.addEventListener('input', function(e) {
        const matricula = e.target.value.trim();
        
        // Limpiar timeout anterior
        if (timeoutValidacion) {
            clearTimeout(timeoutValidacion);
        }
        
        // Esperar 500ms después de que el usuario deje de escribir
        timeoutValidacion = setTimeout(() => {
            if (matricula.length >= 2) {
                validarMatriculaUnica(matricula);
            } else {
                limpiarValidacionMatricula();
            }
        }, 500);
    });

    // Limpiar validación cuando el campo pierde el foco
    inputMatricula.addEventListener('blur', function() {
        const matricula = this.value.trim();
        if (matricula.length >= 2) {
            validarMatriculaUnica(matricula);
        }
    });
}

/**
 * Valida si una matrícula es única
 */
async function validarMatriculaUnica(matricula) {
    const inputMatricula = document.getElementById('matricula');
    const idAeronave = document.getElementById('id_aeronave') ? document.getElementById('id_aeronave').value : null;
    
    try {
        // Preparar datos para la validación
        const formData = new FormData();
        formData.append('matricula', matricula);
        if (idAeronave) {
            formData.append('id_aeronave', idAeronave);
        }

        const response = await fetch('../../app/controllers/validar_matricula.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!data.disponible) {
            // Matrícula no disponible
            inputMatricula.classList.add('is-invalid');
            inputMatricula.classList.remove('is-valid');
            
            // Mostrar mensaje de error
            let feedbackElement = inputMatricula.nextElementSibling;
            if (!feedbackElement || !feedbackElement.classList.contains('invalid-feedback')) {
                feedbackElement = document.createElement('div');
                feedbackElement.className = 'invalid-feedback';
                inputMatricula.parentNode.appendChild(feedbackElement);
            }
            feedbackElement.textContent = data.mensaje;
            
        } else {
            // Matrícula disponible
            inputMatricula.classList.remove('is-invalid');
            inputMatricula.classList.add('is-valid');
            
            // Limpiar mensaje de error
            const feedbackElement = inputMatricula.nextElementSibling;
            if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
                feedbackElement.textContent = '';
            }
        }
    } catch (error) {
        console.error('Error en validación de matrícula:', error);
        // En caso de error, no mostramos validación
        limpiarValidacionMatricula();
    }
}

/**
 * Limpia los estilos de validación
 */
function limpiarValidacionMatricula() {
    const inputMatricula = document.getElementById('matricula');
    if (inputMatricula) {
        inputMatricula.classList.remove('is-invalid');
        inputMatricula.classList.remove('is-valid');
        
        const feedbackElement = inputMatricula.nextElementSibling;
        if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement.textContent = '';
        }
    }
}

/**
 * Elimina una aeronave de la base de datos (muestra confirmación primero).
 * @param {string} id - El ID de la aeronave a eliminar.
 */
function eliminarAeronave(id) {
    // Verificar permisos antes de mostrar confirmación
    if (!permisosSistema.puedeEliminar('aeronaves')) {
        mostrarErrorPermisos();
        return;
    }
    
    mostrarConfirmacionEliminar(id);
}

/**
 * Función que ejecuta la eliminación después de la confirmación
 * @param {string} id - El ID de la aeronave a eliminar.
 */
function eliminarAeronaveConfirmada(id) {
    // Cerrar inmediatamente el modal de confirmación
    if (confirmModal) {
        confirmModal.hide();
    }
    
    // Pequeño delay para asegurar el cierre del modal
    setTimeout(() => {
        const formData = new FormData();
        formData.append('id_aeronave', id);

        fetch('../../app/controllers/aeronaves_eliminar.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarExito(data.success, () => {
                    cargarAeronaves();
                });
            } else {
                mostrarError(data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Ocurrió un error al conectar con el servidor.');
        });
    }, 300); // 300ms es el tiempo de la animación de fade de Bootstrap
}

/**
 * Muestra un mensaje en un modal (función legacy - mantengo por compatibilidad)
 */
function mostrarMensaje(titulo, cuerpo, tipo) {
    if (tipo === 'success') {
        mostrarExito(cuerpo);
    } else {
        mostrarError(cuerpo);
    }
}
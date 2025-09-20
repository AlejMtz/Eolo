// aeronaves.js

// Variables globales para los modales
let successModal = null;
let errorModal = null;
let confirmModal = null;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar modales de Bootstrap
    if (typeof bootstrap !== 'undefined') {
        successModal = new bootstrap.Modal(document.getElementById('successModal'));
        errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    }

    // Detecta si el elemento de la tabla existe para saber en qué página estamos
    if (document.getElementById('tablaAeronaves')) {
        cargarAeronaves();
    }

    // Detecta si el elemento del formulario existe para saber en qué página estamos
    if (document.getElementById('aeronaveForm')) {
        document.getElementById('aeronaveForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const id_aeronave = document.getElementById('id_aeronave').value;
            
            if (!id_aeronave && window.location.search.includes('id=')) {
                mostrarError('No se pudo cargar el ID de la aeronave. Recarga la página.');
                return;
            }
            
            const url = id_aeronave ? 'aeronaves_actualizar.php' : 'aeronaves_crear.php';
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
                        window.location.href = 'ver_aeronaves.html';
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
 * Carga la lista de aeronaves y la muestra en la tabla.
 */
async function cargarAeronaves() {
    const tablaBody = document.querySelector('#tablaAeronaves tbody');
    tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">Cargando...</td></tr>';

    try {
        const response = await fetch('leer_aeronaves.php');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const aeronaves = await response.json();
        
        if (aeronaves.error) {
            throw new Error(aeronaves.error);
        }

        tablaBody.innerHTML = '';
        if (aeronaves.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay aeronaves registradas.</td></tr>';
        } else {
            aeronaves.forEach(aeronave => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${aeronave.Id_Aeronave}</td>
                    <td>${aeronave.Matricula}</td>
                    <td>${aeronave.Tipo}</td>
                    <td>${aeronave.Equipo}</td>
                    <td>${aeronave.Procedencia}</td>
                    <td>${aeronave.Destino}</td>
                    <td>
                        <a href="aeronave.html?id=${aeronave.Id_Aeronave}" class="btn btn-warning btn-sm">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="btn btn-danger btn-sm" onclick="eliminarAeronave(${aeronave.Id_Aeronave})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                tablaBody.appendChild(fila);
            });
        }
    } catch (error) {
        console.error('Error al cargar aeronaves:', error);
        tablaBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error al cargar los datos. Por favor, revisa la conexión.</td></tr>`;
    }
}

/**
 * Carga los datos de una aeronave para rellenar el formulario de edición.
 * @param {string} id - El ID de la aeronave a editar.
 */
async function cargarAeronaveParaEditar(id) {
    console.log('🔍 Intentando cargar aeronave ID:', id);
    
    try {
        // Agrega un timestamp para evitar cache
        const response = await fetch(`aeronaves_leer_id.php?id=${id}&t=${Date.now()}`);
        
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
        document.getElementById('procedencia').value = aeronave.Procedencia || '';
        document.getElementById('destino').value = aeronave.Destino || '';

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

/**
 * Elimina una aeronave de la base de datos (muestra confirmación primero).
 * @param {string} id - El ID de la aeronave a eliminar.
 */
function eliminarAeronave(id) {
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

        fetch('aeronaves_eliminar.php', {
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

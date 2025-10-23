// Variables globales para paginación
let paginaActual = 1;
const registrosPorPagina = 10;
let totalPaginas = 1;
let totalRegistros = 0;

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
    if (!verificarPermisosAeropuertos()) {
        return;
    }

    // Detecta si el elemento de la tabla existe para saber en qué página estamos
    if (document.getElementById('tablaAeropuertos')) {
        cargarAeropuertos();
    }

    // Detecta si el elemento del formulario existe para saber en qué página estamos
    if (document.getElementById('aeropuertoForm')) {
        configurarFormularioAeropuerto();
    }
    
    configurarValidacionCodigos();

    // Configurar evento para el botón de confirmación de eliminación
    const confirmBtn = document.getElementById('confirmActionBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (id) {
                eliminarAeropuertoConfirmada(id);
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
 * @param {string} id - ID del aeropuerto a eliminar
 */
function mostrarConfirmacionEliminar(id) {
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    if (modalBody && confirmModal && confirmBtn) {
        modalBody.textContent = '¿Estás seguro de que quieres eliminar este aeropuerto? Esta acción no se puede deshacer.';
        confirmBtn.setAttribute('data-id', id);
        confirmModal.show();
    } else {
        // Fallback al confirm tradicional
        if (confirm('¿Estás seguro de que quieres eliminar este aeropuerto?')) {
            eliminarAeropuertoConfirmada(id);
        }
    }
}

/**
 * Verifica permisos para el módulo de aeropuertos
 */
function verificarPermisosAeropuertos() {
    if (!localStorage.getItem('usuario_logueado')) {
        window.location.href = '../app/views/login.html';
        return false;
    }
    
    // Todos pueden ver aeropuertos, pero solo admin puede gestionar
    return true;
}

/**
 * Configura el formulario de aeropuerto con validación de permisos
 */
function configurarFormularioAeropuerto() {
    const formulario = document.getElementById('aeropuertoForm');
    const puedeGestionar = permisosSistema.puedeCrear('aeropuertos');
    
    formulario.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Verificar permisos antes de enviar
        if (!puedeGestionar) {
            mostrarErrorPermisos('No tienes permisos para gestionar aeropuertos');
            return;
        }
        
        const Id_Aeropuerto = document.getElementById('Id_Aeropuerto').value;
        
        if (!Id_Aeropuerto && window.location.search.includes('id=')) {
            mostrarError('No se pudo cargar el ID del aeropuerto. Recarga la página.');
            return;
        }
        
        // Validar campos requeridos
        const camposRequeridos = ['Codigo_IATA', 'Codigo_OACI', 'Estado', 'Pais'];
        for (const campo of camposRequeridos) {
            const valor = document.getElementById(campo).value.trim();
            if (!valor) {
                mostrarError(`El campo ${campo.replace('_', ' ')} es requerido`);
                return;
            }
        }

        // Validar longitud de códigos
        if (document.getElementById('Codigo_IATA').value.trim().length !== 3) {
            mostrarError('El código IATA debe tener exactamente 3 caracteres');
            return;
        }

        if (document.getElementById('Codigo_OACI').value.trim().length !== 4) {
            mostrarError('El código OACI debe tener exactamente 4 caracteres');
            return;
        }
        
        // RUTAS CORRECTAS desde public/assets/js/
        const url = Id_Aeropuerto ? 
            '/Eolo/app/controllers/aeropuerto_actualizar.php' : 
            '/Eolo/app/controllers/aeropuerto_crear.php';
        
        // Crear objeto con los datos del formulario
        const data = {
            Id_Aeropuerto: Id_Aeropuerto || '',
            Codigo_IATA: document.getElementById('Codigo_IATA').value.trim().toUpperCase(),
            Codigo_OACI: document.getElementById('Codigo_OACI').value.trim().toUpperCase(),
            Nombre: document.getElementById('Nombre').value.trim(),
            Estado: document.getElementById('Estado').value.trim(),
            Pais: document.getElementById('Pais').value.trim()
        };

        // Mostrar loading
        const btnGuardar = document.getElementById('btnGuardar');
        const textoOriginal = btnGuardar.innerHTML;
        btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Guardando...';
        btnGuardar.disabled = true;

        console.log('📤 Enviando datos:', data);
        console.log('🔗 URL:', url);

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(async response => {
            console.log('📡 Status de respuesta:', response.status);
            console.log('📄 Headers:', response.headers);
            
            // Primero obtener el texto de la respuesta
            const responseText = await response.text();
            console.log('📄 Respuesta cruda:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('✅ JSON parseado correctamente:', data);
            } catch (parseError) {
                console.error('❌ Error parseando JSON:', parseError);
                console.error('📄 Texto que causó el error:', responseText);
                
                // Si es un error 500 o hay mensaje de error de PHP, mostrarlo
                if (responseText.includes('Fatal error') || responseText.includes('Parse error') || responseText.includes('Warning')) {
                    throw new Error('Error en el servidor: ' + responseText.substring(0, 200));
                } else if (responseText.includes('success') || responseText.includes('error')) {
                    // Intentar extraer mensaje aunque no sea JSON válido
                    throw new Error('Respuesta del servidor: ' + responseText.substring(0, 200));
                } else {
                    throw new Error('El servidor devolvió una respuesta inesperada. Código: ' + response.status);
                }
            }
            
            return data;
        })
        .then(data => {
            if (data.success) {
                const mensaje = Id_Aeropuerto ? 
                    'Aeropuerto actualizado correctamente.' : 
                    'Aeropuerto creado correctamente.';
                console.log('✅ Éxito:', mensaje);
                mostrarExito(mensaje, () => {
                    window.location.href = '../../app/views/ver_aeropuertos.html';
                });
            } else {
                console.error('❌ Error del servidor:', data.error);
                mostrarError(data.error || 'Error desconocido del servidor');
            }
        })
        .catch(error => {
            console.error('❌ Error en guardarAeropuerto:', error);
            mostrarError('Error al guardar aeropuerto: ' + error.message);
        })
        .finally(() => {
            // Restaurar botón
            btnGuardar.innerHTML = textoOriginal;
            btnGuardar.disabled = false;
        });
    });

    // Comprueba si hay un ID en la URL para cargar datos en el formulario de edición
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        cargarAeropuertoParaEditar(id);
    }
}

/**
 * Carga la lista de aeropuertos y la muestra en la tabla con paginación.
 */
async function cargarAeropuertos(pagina = 1) {
    const tablaBody = document.querySelector('#tablaAeropuertos tbody');
    if (!tablaBody) return;

    tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">Cargando...</td></tr>';

    try {
        console.log('🔄 Cargando aeropuertos, página:', pagina);
        
        const response = await fetch(`../../app/models/leer_aeropuertos.php?pagina=${pagina}&registros_por_pagina=${registrosPorPagina}`);
        
        console.log('📡 Status de respuesta:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos recibidos del servidor:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }

        const aeropuertos = data.aeropuertos || [];
        const paginacion = data.paginacion || {
            pagina_actual: pagina,
            total_paginas: 1,
            total_registros: aeropuertos.length,
            registros_por_pagina: registrosPorPagina
        };

        console.log('📈 Información de paginación:', paginacion);
        console.log('🛩️ Aeropuertos recibidos:', aeropuertos.length);

        paginaActual = paginacion.pagina_actual;
        totalPaginas = paginacion.total_paginas;
        totalRegistros = paginacion.total_registros;

        tablaBody.innerHTML = '';
        
        if (aeropuertos.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay aeropuertos registrados.</td></tr>';
        } else {
            const puedeEditar = permisosSistema.puedeEditar('aeropuertos');
            const puedeEliminar = permisosSistema.puedeEliminar('aeropuertos');
            
            aeropuertos.forEach(aeropuerto => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${aeropuerto.Id_Aeropuerto}</td>
                    <td><strong>${aeropuerto.Codigo_IATA}</strong></td>
                    <td>${aeropuerto.Codigo_OACI}</td>
                    <td>${aeropuerto.Nombre}</td>
                    <td>${aeropuerto.Estado}</td>
                    <td>${aeropuerto.Pais}</td>
                    <td>
                        <!-- Botón Editar -->
                        <a href="../../app/views/aeropuerto.html?id=${aeropuerto.Id_Aeropuerto}" 
                           class="btn btn-warning btn-sm btn-editar"
                           title="${puedeEditar ? 'Editar aeropuerto' : 'Se requieren permisos de administrador'}"
                           style="${!puedeEditar ? 'opacity: 0.6; pointer-events: none;' : ''}">
                            <i class="fas fa-edit"></i>
                        </a>
                        
                        <!-- Botón Eliminar -->
                        <button class="btn btn-danger btn-sm btn-eliminar"
                                onclick="${puedeEliminar ? `eliminarAeropuerto(${aeropuerto.Id_Aeropuerto})` : 'mostrarErrorPermisos()'}" 
                                title="${puedeEliminar ? 'Eliminar aeropuerto' : 'Se requieren permisos de administrador'}"
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
        
        // Actualizar el paginador
        actualizarPaginador();
        
    } catch (error) {
        console.error('❌ Error al cargar aeropuertos:', error);
        tablaBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error al cargar los datos: ${error.message}</td></tr>`;
    }
}

/**
 * Muestra error de permisos específico para aeropuertos
 */
function mostrarErrorPermisos(mensaje = 'No tienes permisos para realizar esta acción') {
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
                            <p class="text-muted">Solo los usuarios administradores pueden gestionar aeropuertos.</p>
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
 * Carga los datos de un aeropuerto para rellenar el formulario de edición.
 * @param {string} id - El ID del aeropuerto a editar.
 */
async function cargarAeropuertoParaEditar(id) {
    console.log('🔍 Intentando cargar aeropuerto ID:', id);
    
    try {
        const response = await fetch(`../../app/controllers/aeropuerto_leer_id.php?id=${id}&t=${Date.now()}`);
        
        console.log('📊 Status de respuesta:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            throw new Error(`Error ${response.status}: No se pudieron cargar los datos`);
        }
        
        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        
        if (data.error) {
            console.warn('⚠️ Error en respuesta:', data.error);
            throw new Error(data.error);
        }

        const aeropuerto = data.aeropuerto;
        if (!aeropuerto || !aeropuerto.Id_Aeropuerto) {
            console.warn('⚠️ Datos incompletos:', aeropuerto);
            throw new Error('Datos de aeropuerto incompletos');
        }

        // Llenar el formulario
        document.getElementById('Id_Aeropuerto').value = aeropuerto.Id_Aeropuerto;
        document.getElementById('Codigo_IATA').value = aeropuerto.Codigo_IATA || '';
        document.getElementById('Codigo_OACI').value = aeropuerto.Codigo_OACI || '';
        document.getElementById('Nombre').value = aeropuerto.Nombre || '';
        document.getElementById('Estado').value = aeropuerto.Estado || '';
        document.getElementById('Pais').value = aeropuerto.Pais || '';

        // Cambiar estilo del botón
        document.getElementById('btnGuardar').innerText = 'Actualizar Aeropuerto';
        document.getElementById('btnGuardar').classList.remove('btn-primary');
        document.getElementById('btnGuardar').classList.add('btn-warning');
        
        console.log('✅ Formulario llenado exitosamente');

    } catch (error) {
        console.error('❌ Error en cargarAeropuertoParaEditar:', error);
        
        setTimeout(() => {
            const idAeropuerto = document.getElementById('Id_Aeropuerto').value;
            if (!idAeropuerto) {
                console.warn('⚠️ Mostrando alerta de error tardía');
                mostrarError(error.message + '\n\nPero puedes editar manualmente los datos.');
            }
        }, 1500);
    }
}

/**
 * Configura validación de códigos IATA y OACI
 */
function configurarValidacionCodigos() {
    const inputIATA = document.getElementById('Codigo_IATA');
    const inputOACI = document.getElementById('Codigo_OACI');
    
    if (inputIATA) {
        inputIATA.addEventListener('input', function(e) {
            this.value = this.value.toUpperCase().replace(/[^A-Z]/g, '');
        });
    }
    
    if (inputOACI) {
        inputOACI.addEventListener('input', function(e) {
            this.value = this.value.toUpperCase().replace(/[^A-Z]/g, '');
        });
    }
}

/**
 * Elimina un aeropuerto de la base de datos (muestra confirmación primero).
 * @param {string} id - El ID del aeropuerto a eliminar.
 */
function eliminarAeropuerto(id) {
    // Verificar permisos antes de mostrar confirmación
    if (!permisosSistema.puedeEliminar('aeropuertos')) {
        mostrarErrorPermisos();
        return;
    }
    
    mostrarConfirmacionEliminar(id);
}

/**
 * Función que ejecuta la eliminación después de la confirmación
 * @param {string} id - El ID del aeropuerto a eliminar.
 */
function eliminarAeropuertoConfirmada(id) {
    // Cerrar inmediatamente el modal de confirmación
    if (confirmModal) {
        confirmModal.hide();
    }
    
    // Pequeño delay para asegurar el cierre del modal
    setTimeout(() => {
        fetch('../../app/controllers/aeropuerto_eliminar.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Id_Aeropuerto: id })
        })
        .then(async response => {
            const responseText = await response.text();
            console.log('📄 Respuesta eliminar:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ Error parseando JSON al eliminar:', parseError);
                throw new Error('Respuesta del servidor no es JSON válido: ' + responseText.substring(0, 100));
            }
            
            return data;
        })
        .then(data => {
            if (data.success) {
                mostrarExito(data.message, () => {
                    // Recargar manteniendo la página actual
                    cargarAeropuertos(paginaActual);
                });
            } else {
                mostrarError(data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Ocurrió un error al conectar con el servidor: ' + error.message);
        });
    }, 300);
}

/**
 * Actualiza el paginador en la interfaz
 */
function actualizarPaginador() {
    const tabla = document.getElementById('tablaAeropuertos');
    if (!tabla) return;
    
    // Eliminar paginador existente
    const paginadorExistente = tabla.nextElementSibling;
    if (paginadorExistente && paginadorExistente.classList.contains('paginador-container')) {
        paginadorExistente.remove();
    }
    
    // Crear contenedor del paginador
    const paginadorContainer = document.createElement('div');
    paginadorContainer.className = 'paginador-container mt-4';
    paginadorContainer.id = 'paginadorAeropuertos';
    
    let html = '';
    
    // Información de registros
    const inicio = ((paginaActual - 1) * registrosPorPagina) + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, totalRegistros);
    
    html += `
        <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted">
                Mostrando ${inicio} a ${fin} de ${totalRegistros} aeropuertos
            </div>
            <nav aria-label="Paginación de aeropuertos">
                <ul class="pagination pagination-sm mb-0">
    `;
    
    // Botón Anterior
    if (paginaActual > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaAeropuertos(${paginaActual - 1})" aria-label="Anterior">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;
    } else {
        html += `
            <li class="page-item disabled">
                <span class="page-link"><i class="fas fa-chevron-left"></i></span>
            </li>
        `;
    }
    
    // Números de página
    const paginasAMostrar = 5;
    let inicioPaginas = Math.max(1, paginaActual - Math.floor(paginasAMostrar / 2));
    let finPaginas = Math.min(totalPaginas, inicioPaginas + paginasAMostrar - 1);
    
    // Ajustar si estamos cerca del final
    if (finPaginas - inicioPaginas + 1 < paginasAMostrar) {
        inicioPaginas = Math.max(1, finPaginas - paginasAMostrar + 1);
    }
    
    // Página inicial
    if (inicioPaginas > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaAeropuertos(1)">1</a>
            </li>
            ${inicioPaginas > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
        `;
    }
    
    // Páginas intermedias
    for (let i = inicioPaginas; i <= finPaginas; i++) {
        if (i === paginaActual) {
            html += `
                <li class="page-item active">
                    <span class="page-link">${i}</span>
                </li>
            `;
        } else {
            html += `
                <li class="page-item">
                    <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaAeropuertos(${i})">${i}</a>
                </li>
            `;
        }
    }
    
    // Página final
    if (finPaginas < totalPaginas) {
        html += `
            ${finPaginas < totalPaginas - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaAeropuertos(${totalPaginas})">${totalPaginas}</a>
            </li>
        `;
    }
    
    // Botón Siguiente
    if (paginaActual < totalPaginas) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaAeropuertos(${paginaActual + 1})" aria-label="Siguiente">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
    } else {
        html += `
            <li class="page-item disabled">
                <span class="page-link"><i class="fas fa-chevron-right"></i></span>
            </li>
        `;
    }
    
    html += `
                </ul>
            </nav>
        </div>
    `;
    
    paginadorContainer.innerHTML = html;
    tabla.parentNode.appendChild(paginadorContainer);
}

/**
 * Cambia a una página específica
 * @param {number} pagina - Número de página a cargar
 */
function cambiarPaginaAeropuertos(pagina) {
    if (pagina >= 1 && pagina <= totalPaginas && pagina !== paginaActual) {
        cargarAeropuertos(pagina);
        
        // Scroll suave hacia la parte superior de la tabla
        const tabla = document.getElementById('tablaAeropuertos');
        if (tabla) {
            tabla.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}
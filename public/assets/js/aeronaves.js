let paginaActual = 1;
const registrosPorPagina = 10;
let totalPaginas = 1;
let totalRegistros = 0;

let filtrosActivos = {
    matricula: '',
    equipo: ''
};

let timeoutBusqueda = null;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof bootstrap !== 'undefined') {
        successModal = new bootstrap.Modal(document.getElementById('successModal'));
        errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        
        const confirmModalElement = document.getElementById('confirmModal');
        if (confirmModalElement) {
            confirmModal = new bootstrap.Modal(confirmModalElement);
        }
    }

    if (!verificarPermisosAeronaves()) {
        return;
    }

    if (document.getElementById('tablaAeronaves')) {
        cargarAeronaves();
    }

    if (document.getElementById('aeronaveForm')) {
        configurarFormularioAeronave();
    }
    
    configurarValidacionMatricula();
    configurarFiltros();


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
 * Configura los eventos para los filtros
 */
function configurarFiltros() {
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroEquipo = document.getElementById('filtroEquipo');
    
    // Filtro de matrícula con debounce
    if (filtroMatricula) {
        filtroMatricula.addEventListener('input', function() {
            const valor = this.value.trim();
            
            // Limpiar timeout anterior
            if (timeoutBusqueda) {
                clearTimeout(timeoutBusqueda);
            }
            
            // Esperar 500ms después de que el usuario deje de escribir
            timeoutBusqueda = setTimeout(() => {
                filtrosActivos.matricula = valor;
                console.log(' Filtro matrícula actualizado:', valor);
                
                // Aplicar filtros automáticamente después de escribir
                if (valor.length >= 2 || valor.length === 0) {
                    aplicarFiltros();
                }
            }, 500);
        });
        
        filtroMatricula.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filtrosActivos.matricula = this.value.trim();
                aplicarFiltros();
            }
        });
    }
    
    if (filtroEquipo) {
        filtroEquipo.addEventListener('input', function() {
            const valor = this.value.trim();
            
            if (timeoutBusqueda) {
                clearTimeout(timeoutBusqueda);
            }
            
            timeoutBusqueda = setTimeout(() => {
                filtrosActivos.equipo = valor;
                console.log('✈️ Filtro equipo actualizado:', valor);
                
                if (valor.length >= 2 || valor.length === 0) {
                    aplicarFiltros();
                }
            }, 500);
        });
        
        filtroEquipo.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filtrosActivos.equipo = this.value.trim();
                aplicarFiltros();
            }
        });
    }
}

/**
 * Aplica los filtros y recarga la tabla
 */
function aplicarFiltros() {
    console.log('🔍 Aplicando filtros:', filtrosActivos);
    
    paginaActual = 1;
    cargarAeronaves();
}

/**
 * Limpia los filtros y recarga la tabla
 */
function limpiarFiltros() {
    console.log('🧹 Limpiando filtros');
    
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroEquipo = document.getElementById('filtroEquipo');
    
    if (filtroMatricula) filtroMatricula.value = '';
    if (filtroEquipo) filtroEquipo.value = '';
    
    filtrosActivos = {
        matricula: '',
        equipo: ''
    };
    
    paginaActual = 1;
    cargarAeronaves();
}


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
 * Carga la lista de aeronaves y la muestra en la tabla con paginación.
 */
async function cargarAeronaves(pagina = 1) {
    const tablaBody = document.querySelector('#tablaAeronaves tbody');
    if (!tablaBody) return;

    tablaBody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';

    try {
        let url = `../../app/models/leer_aeronaves.php?pagina=${pagina}&registros_por_pagina=${registrosPorPagina}`;
        
        // Agregar filtros a la URL
        if (filtrosActivos.matricula) {
            url += `&matricula=${encodeURIComponent(filtrosActivos.matricula)}`;
        }
        if (filtrosActivos.equipo) {
            url += `&equipo=${encodeURIComponent(filtrosActivos.equipo)}`;
        }
        
        console.log(' URL de consulta:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(' Datos recibidos del servidor:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }

        // Verificar estructura de respuesta
        if (!data.aeronaves || !data.paginacion) {
            console.warn(' Estructura de respuesta inesperada:', data);
            throw new Error('Formato de respuesta no válido');
        }

        const aeronaves = data.aeronaves;
        const infoPaginacion = data.paginacion;

        paginaActual = infoPaginacion.pagina_actual;
        totalPaginas = infoPaginacion.total_paginas;
        totalRegistros = infoPaginacion.total_registros;

        console.log(' Información de paginación:', infoPaginacion);
        console.log(' Aeronaves recibidas:', aeronaves.length);

        tablaBody.innerHTML = '';
        if (aeronaves.length === 0) {
            let mensaje = 'No hay aeronaves registradas.';
            if (filtrosActivos.matricula || filtrosActivos.equipo) {
                mensaje = 'No se encontraron aeronaves que coincidan con los filtros aplicados.';
                mensaje += '<br><small class="text-muted">Intenta con otros términos o <a href="javascript:void(0)" onclick="limpiarFiltros()">limpia los filtros</a></small>';
            }
            tablaBody.innerHTML = `<tr><td colspan="5" class="text-center">${mensaje}</td></tr>`;
        } else {
            const puedeEditar = permisosSistema.puedeEditar('aeronaves');
            const puedeEliminar = permisosSistema.puedeEliminar('aeronaves');
            
            // Calcular número inicial para esta página
            const inicioNumero = ((paginaActual - 1) * registrosPorPagina) + 1;
            
            aeronaves.forEach((aeronave, index) => {
                const numeroFila = inicioNumero + index;
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${numeroFila}</td>
                    <td>${aeronave.Matricula}</td>
                    <td>${aeronave.Equipo || 'No especificado'}</td>
                    <td>${aeronave.Tipo || 'No especificado'}</td>
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
        
        // Actualizar el paginador
        actualizarPaginador();
        
    } catch (error) {
        console.error('❌ Error al cargar aeronaves:', error);
        tablaBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar los datos: ${error.message}</td></tr>`;
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
        
        if (timeoutValidacion) {
            clearTimeout(timeoutValidacion);
        }
        
        timeoutValidacion = setTimeout(() => {
            if (matricula.length >= 2) {
                validarMatriculaUnica(matricula);
            } else {
                limpiarValidacionMatricula();
            }
        }, 500);
    });

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
            
            const feedbackElement = inputMatricula.nextElementSibling;
            if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
                feedbackElement.textContent = '';
            }
        }
    } catch (error) {
        console.error('Error en validación de matrícula:', error);
        limpiarValidacionMatricula();
    }
}


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


function eliminarAeronave(id) {
    // Verificar permisos antes de mostrar confirmación
    if (!permisosSistema.puedeEliminar('aeronaves')) {
        mostrarErrorPermisos();
        return;
    }
    
    mostrarConfirmacionEliminar(id);
}


function eliminarAeronaveConfirmada(id) {
    if (confirmModal) {
        confirmModal.hide();
    }
    
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
                    // Recargar manteniendo la página actual
                    cargarAeronaves(paginaActual);
                });
            } else {
                mostrarError(data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Ocurrió un error al conectar con el servidor.');
        });
    }, 300);
}

/**
 * Muestra un mensaje en un modal
 */
function mostrarMensaje(titulo, cuerpo, tipo) {
    if (tipo === 'success') {
        mostrarExito(cuerpo);
    } else {
        mostrarError(cuerpo);
    }
}

/**
 * Actualiza el paginador en la interfaz
 */
function actualizarPaginador() {
    console.log('🔄 Actualizando paginador...');
    
    const tabla = document.getElementById('tablaAeronaves');
    if (!tabla) {
        console.warn('⚠️ No se encontró la tabla aeronaves');
        return;
    }
    
    // Eliminar paginador existente
    const paginadorExistente = document.getElementById('paginadorAeronaves');
    if (paginadorExistente) {
        paginadorExistente.remove();
    }
    
    // Si no hay registros, no mostrar paginador
    if (totalRegistros === 0) {
        return;
    }
    
    // Si solo hay una página, no mostrar paginador
    if (totalPaginas <= 1) {
        console.log('ℹ️ Solo hay una página, no se muestra paginador');
        return;
    }
    
    const paginadorContainer = document.createElement('div');
    paginadorContainer.className = 'paginador-container mt-4 d-flex justify-content-between align-items-center';
    paginadorContainer.id = 'paginadorAeronaves';
    
    // Información de registros y filtros
    const inicio = ((paginaActual - 1) * registrosPorPagina) + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, totalRegistros);
    
    let infoFiltros = '';
    if (filtrosActivos.matricula || filtrosActivos.equipo) {
        const filtros = [];
        if (filtrosActivos.matricula) {
            filtros.push(`Matrícula: "${filtrosActivos.matricula}"`);
        }
        if (filtrosActivos.equipo) {
            filtros.push(`Tipo: "${filtrosActivos.equipo}"`);
        }
        infoFiltros = `<div class="text-info small">Filtros aplicados: ${filtros.join(', ')}</div>`;
    }
    
    let html = `
        <div class="text-muted">
            <div>Mostrando ${inicio} a ${fin} de ${totalRegistros} aeronaves</div>
            ${infoFiltros}
        </div>
        <nav aria-label="Paginación de aeronaves">
            <ul class="pagination pagination-sm mb-0">
    `;
    
    // Botón Anterior
    if (paginaActual > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaAeronaves(${paginaActual - 1})" aria-label="Anterior">
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
    
    const paginasAMostrar = 5;
    let inicioPaginas = Math.max(1, paginaActual - Math.floor(paginasAMostrar / 2));
    let finPaginas = Math.min(totalPaginas, inicioPaginas + paginasAMostrar - 1);
    
    if (finPaginas - inicioPaginas + 1 < paginasAMostrar) {
        inicioPaginas = Math.max(1, finPaginas - paginasAMostrar + 1);
    }
    
    if (inicioPaginas > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaAeronaves(1)">1</a>
            </li>
        `;
        if (inicioPaginas > 2) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
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
                    <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaAeronaves(${i})">${i}</a>
                </li>
            `;
        }
    }
    
    if (finPaginas < totalPaginas) {
        if (finPaginas < totalPaginas - 1) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaAeronaves(${totalPaginas})">${totalPaginas}</a>
            </li>
        `;
    }
    
    // Botón Siguiente
    if (paginaActual < totalPaginas) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaAeronaves(${paginaActual + 1})" aria-label="Siguiente">
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
    `;
    
    paginadorContainer.innerHTML = html;
    tabla.parentNode.appendChild(paginadorContainer);
    
    console.log('✅ Paginador actualizado correctamente');
}


function cambiarPaginaAeronaves(pagina) {
    if (pagina >= 1 && pagina <= totalPaginas && pagina !== paginaActual) {
        cargarAeronaves(pagina);
        
        // Scroll suave hacia la parte superior de la tabla
        const tabla = document.getElementById('tablaAeronaves');
        if (tabla) {
            tabla.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}
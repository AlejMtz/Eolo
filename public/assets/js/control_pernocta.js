// Variables globales para control de pernoctas
let paginaActualControl = 1;
const registrosPorPaginaControl = 10;
let totalPaginasControl = 1;
let totalRegistrosControl = 0;

let filtrosActivosControl = {
    fecha: '',
    matricula: '',
    hangar: ''
};

let controlModal = null;
let successModal = null;
let errorModal = null;
let confirmModal = null;

let timeoutFiltrosControl = null;


// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando control_pernocta.js');
    
    // Inicializar modales de Bootstrap SOLO si existen
    if (typeof bootstrap !== 'undefined') {
        // Modal de control (para agregar/editar)
        if (document.getElementById('controlModal')) {
            controlModal = new bootstrap.Modal(document.getElementById('controlModal'));
            console.log('✅ Modal de control inicializado');
        }
        
        // Modal de éxito
        if (document.getElementById('successModal')) {
            successModal = new bootstrap.Modal(document.getElementById('successModal'));
            console.log('✅ Modal de éxito inicializado');
        }
        
        // Modal de error
        if (document.getElementById('errorModal')) {
            errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
            console.log('✅ Modal de error inicializado');
        }
        
        // ✅ MODAL DE CONFIRMACIÓN PARA ELIMINAR
        if (document.getElementById('confirmModal')) {
            confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
            console.log('✅ Modal de confirmación inicializado');
        }
        
        // ✅ CONFIGURAR EVENTO PARA EL BOTÓN DE CONFIRMACIÓN DE ELIMINACIÓN
        const confirmBtn = document.getElementById('confirmActionBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (id) {
                    console.log('🎯 Confirmando eliminación del control ID:', id);
                    eliminarControlPernoctaConfirmada(id);
                }
            });
            console.log('✅ Botón de confirmación configurado');
        }
    }

    // Inicializar página de edición individual SI EXISTE
    if (document.getElementById('controlPernoctaForm')) {
        console.log('📄 Página de edición individual detectada - Inicializando...');
        inicializarPaginaEdicion();
    }

    // Inicializar página de lista SI EXISTE
    if (document.getElementById('cuerpoTablaControlPernoctas')) {
        console.log('📊 Página de lista detectada - Cargando datos...');
        cargarControlPernoctas();
        
        // ✅ CONFIGURAR FILTROS SI EXISTEN EN LA PÁGINA DE LISTA
        configurarFiltrosControl();
    }
    
    // ✅ CONFIGURAR EVENTOS DE TECLADO PARA FILTROS
    configurarEventosTeclado();
    
    console.log('✅ control_pernocta.js inicializado completamente');
});

/**
 * Configura los eventos de teclado para filtros
 */
function configurarEventosTeclado() {
    // Enter en filtros aplica los filtros
    const filtroFecha = document.getElementById('filtroFechaControl');
    const filtroMatricula = document.getElementById('filtroMatriculaControl');
    const filtroHangar = document.getElementById('filtroHangar');
    
    if (filtroFecha) {
        filtroFecha.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                aplicarFiltrosControl();
            }
        });
    }
    
    if (filtroMatricula) {
        filtroMatricula.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                aplicarFiltrosControl();
            }
        });
    }
    
    if (filtroHangar) {
        filtroHangar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                aplicarFiltrosControl();
            }
        });
    }
}

/**
 * Configura los filtros para la página de lista
 */
function configurarFiltrosControl() {
    console.log('⚙️ Configurando filtros de control...');
    
    const filtroFecha = document.getElementById('filtroFechaControl');
    const filtroMatricula = document.getElementById('filtroMatriculaControl');
    const filtroHangar = document.getElementById('filtroHangar');
    
    let timeoutFiltros = null;
    
    // Filtro de fecha
    if (filtroFecha) {
        filtroFecha.addEventListener('change', function() {
            filtrosActivosControl.fecha = this.value;
            console.log('📅 Filtro fecha cambiado:', this.value);
        });
    }
    
    // Filtro de matrícula con debounce
    if (filtroMatricula) {
        filtroMatricula.addEventListener('input', function() {
            const valor = this.value.trim();
            
            // Limpiar timeout anterior
            if (timeoutFiltros) {
                clearTimeout(timeoutFiltros);
            }
            
            // Esperar 500ms después de que el usuario deje de escribir
            timeoutFiltros = setTimeout(() => {
                filtrosActivosControl.matricula = valor;
                console.log('🛩️ Filtro matrícula actualizado:', valor);
                
                // Aplicar filtros automáticamente después de escribir
                if (valor.length >= 2 || valor.length === 0) {
                    aplicarFiltrosControl();
                }
            }, 500);
        });
    }
    
    // Filtro de hangar
    if (filtroHangar) {
        filtroHangar.addEventListener('change', function() {
            filtrosActivosControl.hangar = this.value;
            console.log('🏢 Filtro hangar cambiado:', this.value);
            aplicarFiltrosControl();
        });
    }
    
    console.log('✅ Filtros de control configurados:', filtrosActivosControl);
}

/**
 * Aplica los filtros y recarga la tabla
 */
function aplicarFiltrosControl() {
    console.log('🔍 Aplicando filtros de control:', filtrosActivosControl);
    
    // Resetear a primera página cuando se aplican filtros
    paginaActualControl = 1;
    cargarControlPernoctas();
}

/**
 * Limpia los filtros y recarga la tabla
 */
function limpiarFiltrosControl() {
    console.log('🧹 Limpiando filtros de control...');
    
    const filtroFecha = document.getElementById('filtroFechaControl');
    const filtroMatricula = document.getElementById('filtroMatriculaControl');
    const filtroHangar = document.getElementById('filtroHangar');
    
    if (filtroFecha) filtroFecha.value = '';
    if (filtroMatricula) filtroMatricula.value = '';
    if (filtroHangar) filtroHangar.value = '';
    
    filtrosActivosControl = {
        fecha: '',
        matricula: '',
        hangar: ''
    };
    
    paginaActualControl = 1;
    cargarControlPernoctas();
}

/**
 * Procesa automáticamente las últimas entradas al cargar la página
 */
async function procesarUltimasEntradas() {
    try {
        console.log('🔄 Procesando últimas entradas automáticamente...');
        
        const response = await fetch('/Eolo/app/models/obtener_entradas_control_pernocta.php');
        const data = await response.json();
        
        if (data.success && data.entradas.length > 0) {
            console.log(`📋 ${data.entradas.length} entrada(s) disponible(s) para procesar`);
            
            // Mostrar notificación si hay entradas pendientes
            if (data.entradas.length > 0) {
                console.log('💡 Hay entradas pendientes de procesar');
            }
        } else {
            console.log('ℹ️ No hay entradas pendientes de procesar');
        }
        
    } catch (error) {
        console.error('❌ Error al procesar últimas entradas:', error);
        // No mostrar error al usuario en la carga automática
    }
}

async function agregarControlManual() {
    try {
        console.log('➕ Iniciando agregado manual de aeronaves en hangar...');
        
        // ✅ OBTENER FECHA ACTUAL para el control del día
        const fechaHoy = new Date().toISOString().split('T')[0];
        
        // ✅ PASAR LA FECHA COMO PARÁMETRO
        const response = await fetch(`/Eolo/app/models/obtener_aeronaves_hangar.php?fecha_control=${fechaHoy}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }
        
        if (data.aeronaves.length === 0) {
            mostrarError('No hay aeronaves en hangar disponibles para agregar al control de hoy.');
            return;
        }
        
        // Mostrar selector de aeronaves
        mostrarSelectorAeronaves(data.aeronaves);
        
    } catch (error) {
        console.error('❌ Error al obtener aeronaves en hangar:', error);
        mostrarError('Error al obtener aeronaves en hangar: ' + error.message);
    }
}

/**
 * Inicializa el formulario en modo agregar
 */
function inicializarModoAgregar(urlParams) {
    try {
        console.log('🔄 Inicializando formulario en modo agregar...');
        
        // Obtener datos de los parámetros URL
        const idAeronave = urlParams.get('id_aeronave');
        const matricula = decodeURIComponent(urlParams.get('matricula') || '');
        const equipo = decodeURIComponent(urlParams.get('equipo') || '');
        const fechaEntrada = urlParams.get('fecha_entrada');
        const horaEntrada = urlParams.get('hora_entrada');
        const idUltimoRegistro = urlParams.get('id_ultimo_registro');
        
        // ✅ CONFIGURAR CAMPOS DEL FORMULARIO
        const fechaActual = new Date().toISOString().split('T')[0];
        const ahora = new Date();
        const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' + 
                          ahora.getMinutes().toString().padStart(2, '0'); // Formato HH:MM
        
        document.getElementById('matricula').value = matricula || 'No especificada';
        document.getElementById('equipo').value = equipo || 'No especificado';
        document.getElementById('fecha').value = fechaActual; // Fecha actual
        document.getElementById('hora_inicial').value = horaEntrada || '08:00'; // Hora de la última entrada
        document.getElementById('hora_final').value = horaActual; // Hora actual como valor por defecto
        
        console.log('📝 Campos configurados:', {
            fecha: fechaActual,
            hora_inicial: horaEntrada || '08:00',
            hora_final: horaActual
        });
        
        // ✅ HACER TODOS LOS CAMPOS TEMPORALES DE SOLO LECTURA
        document.getElementById('fecha').readOnly = true;
        document.getElementById('hora_inicial').readOnly = true;
        document.getElementById('hora_final').readOnly = true; // ✅ HORA FINAL TAMBIÉN DE SOLO LECTURA
        document.getElementById('matricula').readOnly = true;
        document.getElementById('equipo').readOnly = true;
        
        // ✅ Agregar clases CSS para indicar que son de solo lectura
        const camposSoloLectura = ['fecha', 'hora_inicial', 'hora_final', 'matricula', 'equipo'];
        camposSoloLectura.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.classList.add('bg-light', 'text-muted');
                campo.style.cursor = 'not-allowed';
            }
        });
        
        // ✅ Asegurar que el campo id_control esté vacío en modo agregar
        const idControlInput = document.getElementById('id_control');
        if (idControlInput) {
            idControlInput.value = ''; // Vacío para modo agregar
        }
        
        // ✅ Cambiar título y estilos
        const cardHeader = document.querySelector('.card-header');
        if (cardHeader) {
            cardHeader.className = 'card-header bg-success text-white';
            cardHeader.innerHTML = '<h5 class="mb-0"><i class="fas fa-plus-circle"></i> Agregar Aeronave en Hangar al Control</h5>';
        }
        
        // ✅ Cambiar texto y color del botón
        const submitButton = document.getElementById('submitButton');
        if (submitButton) {
            submitButton.className = 'btn btn-success';
            submitButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display: none;"></span>
                Agregar al Control
            `;
        }
        
        // ✅ AGREGAR CAMPOS OCULTOS NECESARIOS
        let idAeronaveInput = document.getElementById('id_aeronave');
        if (!idAeronaveInput) {
            idAeronaveInput = document.createElement('input');
            idAeronaveInput.type = 'hidden';
            idAeronaveInput.id = 'id_aeronave';
            idAeronaveInput.name = 'id_aeronave';
            document.getElementById('controlPernoctaForm').appendChild(idAeronaveInput);
        }
        idAeronaveInput.value = idAeronave;
        
        let idUltimoRegistroInput = document.getElementById('id_ultimo_registro');
        if (!idUltimoRegistroInput) {
            idUltimoRegistroInput = document.createElement('input');
            idUltimoRegistroInput.type = 'hidden';
            idUltimoRegistroInput.id = 'id_ultimo_registro';
            idUltimoRegistroInput.name = 'id_ultimo_registro';
            document.getElementById('controlPernoctaForm').appendChild(idUltimoRegistroInput);
        }
        idUltimoRegistroInput.value = idUltimoRegistro;
        
        // ✅ CAMPO OCULTO PARA INDICAR MODO AGREGAR
        let modoAgregarInput = document.getElementById('modo_agregar');
        if (!modoAgregarInput) {
            modoAgregarInput = document.createElement('input');
            modoAgregarInput.type = 'hidden';
            modoAgregarInput.id = 'modo_agregar';
            modoAgregarInput.name = 'modo_agregar';
            document.getElementById('controlPernoctaForm').appendChild(modoAgregarInput);
        }
        modoAgregarInput.value = 'true';
        
        // ✅ AGREGAR LABELS DESCRIPTIVOS PARA MEJOR UX
        agregarLabelsDescriptivos();
        
        console.log('✅ Formulario configurado para modo agregar:', {
            idAeronave,
            matricula,
            equipo,
            fechaEntrada,
            horaEntrada,
            idUltimoRegistro,
            fechaActual,
            horaActual
        });
        
    } catch (error) {
        console.error('❌ Error inicializando modo agregar:', error);
        mostrarError('Error al configurar el formulario: ' + error.message);
    }
}

/**
 * Agrega labels descriptivos para mejorar la experiencia de usuario
 */
function agregarLabelsDescriptivos() {
    // Agregar texto descriptivo debajo de los campos
    const fechaField = document.getElementById('fecha');
    const horaInicialField = document.getElementById('hora_inicial');
    const horaFinalField = document.getElementById('hora_final');
    
    if (fechaField && !fechaField.nextElementSibling?.classList?.contains('help-text')) {
        const fechaHelp = document.createElement('small');
        fechaHelp.className = 'form-text text-muted help-text';
        fechaHelp.textContent = 'Fecha actual del sistema';
        fechaField.parentNode.appendChild(fechaHelp);
    }
    
    if (horaInicialField && !horaInicialField.nextElementSibling?.classList?.contains('help-text')) {
        const horaInicialHelp = document.createElement('small');
        horaInicialHelp.className = 'form-text text-muted help-text';
        horaInicialHelp.textContent = 'Hora de la última entrada registrada';
        horaInicialField.parentNode.appendChild(horaInicialHelp);
    }
    
    if (horaFinalField && !horaFinalField.nextElementSibling?.classList?.contains('help-text')) {
        const horaFinalHelp = document.createElement('small');
        horaFinalHelp.className = 'form-text text-muted help-text';
        horaFinalHelp.textContent = 'Hora actual del sistema';
        horaFinalField.parentNode.appendChild(horaFinalHelp);
    }
}

/**
 * Agrega labels descriptivos para mejorar la experiencia de usuario
 */
function agregarLabelsDescriptivos() {
    // Agregar texto descriptivo debajo de los campos
    const fechaField = document.getElementById('fecha');
    const horaInicialField = document.getElementById('hora_inicial');
    const horaFinalField = document.getElementById('hora_final');
    
    if (fechaField && !fechaField.nextElementSibling?.classList?.contains('help-text')) {
        const fechaHelp = document.createElement('small');
        fechaHelp.className = 'form-text text-muted help-text';
        fechaHelp.textContent = 'Fecha actual del sistema (automática)';
        fechaField.parentNode.appendChild(fechaHelp);
    }
    
    if (horaInicialField && !horaInicialField.nextElementSibling?.classList?.contains('help-text')) {
        const horaInicialHelp = document.createElement('small');
        horaInicialHelp.className = 'form-text text-muted help-text';
        horaInicialHelp.textContent = 'Hora de la última entrada registrada (automática)';
        horaInicialField.parentNode.appendChild(horaInicialHelp);
    }
    
    if (horaFinalField && !horaFinalField.nextElementSibling?.classList?.contains('help-text')) {
        const horaFinalHelp = document.createElement('small');
        horaFinalHelp.className = 'form-text text-muted help-text';
        horaFinalHelp.textContent = 'Ingrese la hora final del control (requerido)';
        horaFinalField.parentNode.appendChild(horaFinalHelp);
    }
}

// ========== FUNCIONES AUXILIARES ==========

/**
 * Formatea la hora de HH:MM:SS a HH:MM para mostrar
 */
function formatearHoraParaMostrar(hora) {
    if (!hora || hora === 'null' || hora === 'undefined') {
        return 'No especificada';
    }
    
    // Si la hora viene en formato HH:MM:SS, tomar solo HH:MM
    if (typeof hora === 'string' && hora.length >= 8 && hora.includes(':')) {
        return hora.substring(0, 5); // Tomar solo los primeros 5 caracteres (HH:MM)
    }
    
    // Si ya está en formato HH:MM, devolver tal cual
    return hora;
}

/**
 * Formatea la hora de HH:MM a HH:MM:SS para guardar en BD
 */
function formatearHoraParaBD(hora) {
    if (!hora) {
        return '00:00:00';
    }
    
    // Si la hora viene en formato HH:MM, agregar :00
    if (typeof hora === 'string' && hora.length === 5 && hora.includes(':')) {
        return hora + ':00';
    }
    
    return hora;
}

/**
 * Muestra un modal para seleccionar aeronaves en hangar
 */
function mostrarSelectorAeronaves(aeronaves) {
    // Crear modal dinámicamente
    const modalHTML = `
        <div class="modal fade" id="selectorAeronavesModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-plane"></i> Aeronaves en Hangar Disponibles
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="text-muted">Selecciona una aeronave que está en hangar para agregar al control:</p>
                        
                        <div class="list-group" style="max-height: 400px; overflow-y: auto;">
                            ${aeronaves.map(aeronave => `
                                <button type="button" class="list-group-item list-group-item-action" 
                                        onclick="seleccionarAeronaveParaControl(
                                            ${aeronave.Id_Aeronave}, 
                                            '${aeronave.Matricula}', 
                                            '${aeronave.Equipo}', 
                                            '${aeronave.Ultima_Fecha_Entrada}', 
                                            '${aeronave.Ultima_Hora_Entrada}', 
                                            ${aeronave.Id_Ultimo_Registro}
                                        )">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>${aeronave.Matricula}</strong>
                                            <br>
                                            <small class="text-muted">
                                                ${aeronave.Equipo} - ${aeronave.Tipo}
                                                <br>
                                                <i class="fas fa-calendar-alt me-1"></i>Última entrada: ${aeronave.Ultima_Fecha_Entrada} ${aeronave.Ultima_Hora_Entrada}
                                            </small>
                                        </div>
                                        <i class="fas fa-chevron-right text-muted"></i>
                                    </div>
                                </button>
                            `).join('')}
                        </div>
                        
                        ${aeronaves.length === 0 ? `
                            <div class="text-center text-muted py-4">
                                <i class="fas fa-inbox fa-3x mb-3"></i>
                                <p>No hay aeronaves en hangar disponibles</p>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('selectorAeronavesModal'));
    modal.show();
    
    // Limpiar modal cuando se cierre
    modal._element.addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

/**
 * Redirige al formulario de control con la aeronave seleccionada
 */
function seleccionarAeronaveParaControl(idAeronave, matricula, equipo, fechaEntrada, horaEntrada, idUltimoRegistro) {
    console.log('🛩️ Aeronave seleccionada para control manual:', {
        idAeronave,
        matricula, 
        equipo,
        fechaEntrada,
        horaEntrada,
        idUltimoRegistro
    });
    
    // Cerrar el modal primero
    const modal = bootstrap.Modal.getInstance(document.getElementById('selectorAeronavesModal'));
    if (modal) {
        modal.hide();
    }
    
    // Construir URL con todos los parámetros necesarios
    const params = new URLSearchParams({
        'agregar': 'true',
        'id_aeronave': idAeronave,
        'matricula': matricula,
        'equipo': equipo,
        'fecha_entrada': fechaEntrada,
        'hora_entrada': horaEntrada,
        'id_ultimo_registro': idUltimoRegistro
    });
    
    // Redirigir al formulario de control con parámetros
    window.location.href = `control_pernocta_editar.html?${params.toString()}`;
}

/**
 * Redirige a la página de edición individual del control
 */
function editarControlPernocta(idControl) {
    console.log('✏️ Editando control ID:', idControl);
    
    // Verificar permisos
    if (!permisosSistema.puedeEditar('control_pernoctas')) {
        mostrarError('No tienes permisos para editar registros de control.');
        return;
    }
    
    // Redirigir a la página de edición individual
    window.location.href = `../../app/views/control_pernocta_editar.html?id=${idControl}`;
}

/**
 * Inicializa la página de edición individual
 */
function inicializarPaginaEdicion() {
    console.log('🔄 Inicializando página de edición individual...');
    
    // Configurar envío del formulario
    const controlForm = document.getElementById('controlPernoctaForm');
    if (controlForm) {
        controlForm.addEventListener('submit', function(event) {
            event.preventDefault();
            actualizarControl();
        });
        console.log('✅ Formulario configurado para envío');
    } else {
        console.error('❌ No se encontró el formulario controlPernoctaForm');
    }

    // Cargar datos para edición
    cargarControlParaEdicion();
    
    // Ejecutar diagnóstico después de 2 segundos
    setTimeout(diagnosticoUrgente, 2000);
}

/**
 * Carga los datos del control para edición en página individual
 */
async function cargarControlParaEdicion(idControl = null) {
    try {
        // Obtener ID de la URL si no se proporciona
        if (!idControl) {
            const urlParams = new URLSearchParams(window.location.search);
            idControl = urlParams.get('id');
        }

        // ✅ VERIFICAR SI ESTAMOS EN MODO AGREGAR
        const urlParams = new URLSearchParams(window.location.search);
        const modoAgregar = urlParams.get('agregar');
        
        if (modoAgregar === 'true') {
            console.log('🔄 Modo AGREGAR detectado - No se cargan datos de control existente');
            return; // Salir sin cargar datos de control
        }

        if (!idControl) {
            throw new Error('No se proporcionó ID de control');
        }

        console.log('🔄 Cargando control para edición ID:', idControl);

        const response = await fetch(`/Eolo/app/controllers/control_pernocta_leer_id.php?id=${idControl}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('📊 Respuesta completa del servidor:', data);

        if (data.success && data.control) {
            console.log('✅ Datos del control recibidos:', data.control);
            llenarFormularioEdicion(data.control);
        } else {
            throw new Error(data.error || 'No se pudieron cargar los datos del control');
        }
        
    } catch (error) {
        console.error('❌ Error al cargar control para edición:', error);
        // ❌ NO mostrar error en modo agregar
        const urlParams = new URLSearchParams(window.location.search);
        const modoAgregar = urlParams.get('agregar');
        
        if (modoAgregar !== 'true') {
            mostrarError('Error al cargar los datos para editar: ' + error.message);
            
            // Redirigir después de 3 segundos solo si no es modo agregar
            setTimeout(() => {
                window.location.href = '../../app/views/ver_control_pernoctas.html';
            }, 3000);
        }
    }
}

/**
 * Llena el formulario con datos para edición
 */
function llenarFormularioEdicion(control) {
    console.log('📝 Llenando formulario con datos del control:', control);
    
    // ✅ CAMPOS DE SOLO LECTURA - USANDO NOMBRES EXACTOS DE LA BD
    setFieldValue('id_control', control.Id_Control);
    setFieldValue('matricula', control.Matricula);
    setFieldValue('equipo', control.Equipo);
    setFieldValue('fecha', control.Fecha);
    setFieldValue('hora_inicial', formatearHoraParaMostrar(control.HoraInicial)); // ✅ Formateado
    setFieldValue('hora_final', formatearHoraParaMostrar(control.HoraFinal));     // ✅ Formateado
    
    // ✅ HACER CAMPOS DE SOLO LECTURA
    document.getElementById('fecha').readOnly = true;
    document.getElementById('hora_inicial').readOnly = true;
    document.getElementById('hora_final').readOnly = true;
    document.getElementById('matricula').readOnly = true;
    document.getElementById('equipo').readOnly = true;
    
    // ✅ Agregar clases CSS para indicar que son de solo lectura
    const camposSoloLectura = ['fecha', 'hora_inicial', 'hora_final', 'matricula', 'equipo'];
    camposSoloLectura.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.classList.add('bg-light', 'text-muted');
            campo.style.cursor = 'not-allowed';
        }
    });
    
    // ✅ CAMPOS EDITABLES
    setFieldValue('hangar', control.Hangar);
    setFieldValue('empresa_procedencia', control.EmpresaProcedencia);
    setFieldValue('observaciones', control.Observaciones);
    setFieldValue('persona_registro', control.Persona_Registro);

    console.log('✅ Formulario cargado correctamente para edición');
}

/**
 * Función auxiliar para establecer valores de campos
 */
function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        const finalValue = value !== null && value !== undefined ? value : '';
        field.value = finalValue;
        console.log(`✅ Campo ${fieldId} establecido: "${finalValue}"`);
    } else {
        console.error(`❌ Campo no encontrado: ${fieldId}`);
    }
}

/**
 * Procesa el formulario (tanto para agregar como editar)
 */
async function actualizarControl() {
    try {
        const formData = new FormData(document.getElementById('controlPernoctaForm'));
        
        // ✅ DETERMINAR SI ES MODO AGREGAR O EDITAR
        const idControl = document.getElementById('id_control').value;
        const modoAgregarInput = document.getElementById('modo_agregar');
        const esModoAgregar = modoAgregarInput && modoAgregarInput.value === 'true';
        
        console.log('📤 Enviando datos:', esModoAgregar ? 'MODO AGREGAR' : 'MODO EDITAR');
        
        if (esModoAgregar) {
            console.log('- ID Aeronave:', formData.get('id_aeronave'));
            console.log('- ID Último Registro:', formData.get('id_ultimo_registro'));
        } else {
            console.log('- ID Control:', idControl);
        }
        
        console.log('- Fecha:', formData.get('fecha'));
        console.log('- Hora Inicial:', formData.get('hora_inicial'));
        console.log('- Hora Final:', formData.get('hora_final'));
        console.log('- Hangar:', formData.get('hangar'));
        console.log('- Empresa/Procedencia:', formData.get('empresa_procedencia'));
        console.log('- Observaciones:', formData.get('observaciones'));
        console.log('- Persona Registro:', formData.get('persona_registro'));
        
        // Validar formulario
        if (!validarFormularioEdicion()) {
            return;
        }
        
        // Mostrar loading
        const btnSubmit = document.getElementById('submitButton');
        btnSubmit.disabled = true;
        const spinner = btnSubmit.querySelector('.spinner-border');
        if (spinner) {
            spinner.style.display = 'inline-block';
        }
        
        // ✅ DETERMINAR URL SEGÚN EL MODO
        let url = '';
        if (esModoAgregar) {
            url = '/Eolo/app/controllers/control_pernocta_crear.php'; // ✅ CREACIÓN
        } else {
            url = '/Eolo/app/controllers/control_pernocta_actualizar.php'; // ✅ ACTUALIZACIÓN
        }
        
        console.log('🌐 URL de envío:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        console.log('📊 Respuesta del servidor:', data);
        
        if (data.success) {
            const mensaje = esModoAgregar ? 
                'Aeronave agregada al control correctamente' : 
                'Control actualizado correctamente';
                
            mostrarExito(mensaje, () => {
                window.location.href = '../../app/views/ver_control_pernoctas.html';
            });
        } else {
            throw new Error(data.message);
        }
        
    } catch (error) {
        console.error('❌ Error al procesar control:', error);
        mostrarError('Error al procesar el control: ' + error.message);
    } finally {
        // Ocultar loading
        const btnSubmit = document.getElementById('submitButton');
        if (btnSubmit) {
            btnSubmit.disabled = false;
            const spinner = btnSubmit.querySelector('.spinner-border');
            if (spinner) {
                spinner.style.display = 'none';
            }
        }
    }
}

/**
 * Valida el formulario de edición individual
 */
function validarFormularioEdicion() {
    const hangar = document.getElementById('hangar').value;
    const personaRegistro = document.getElementById('persona_registro').value.trim();
    const fecha = document.getElementById('fecha').value;
    const horaInicial = document.getElementById('hora_inicial').value;
    const horaFinal = document.getElementById('hora_final').value;
    
    // Verificar si es modo agregar
    const modoAgregar = document.getElementById('modo_agregar');
    const esModoAgregar = modoAgregar && modoAgregar.value === 'true';
    
    if (esModoAgregar) {
        // ✅ Validaciones específicas para modo AGREGAR
        if (!fecha) {
            mostrarError('La fecha es obligatoria.');
            return false;
        }
        
        if (!horaInicial) {
            mostrarError('La hora inicial es obligatoria.');
            return false;
        }
        
        if (!horaFinal) {
            mostrarError('La hora final es obligatoria. Por favor, ingrese la hora del control.');
            return false;
        }
        
        // ✅ Validar formato de hora (HH:MM)
        const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!horaRegex.test(horaFinal)) {
            mostrarError('El formato de la hora final no es válido. Use HH:MM (ej: 14:30)');
            return false;
        }
    }
    
    if (!hangar) {
        mostrarError('Por favor, seleccione un hangar.');
        return false;
    }
    
    if (!personaRegistro) {
        mostrarError('El campo "Persona que Registra" es obligatorio.');
        return false;
    }
    
    console.log('✅ Formulario válido - Modo:', esModoAgregar ? 'AGREGAR' : 'EDITAR');
    return true;
}

/**
 * Cancela la edición y regresa a la lista
 */
function cancelarEdicion() {
    if (confirm('¿Estás seguro de que quieres cancelar la edición? Los cambios no guardados se perderán.')) {
        window.location.href = '../../app/views/ver_control_pernoctas.html';
    }
}

/**
 * Función para eliminar control de pernocta
 */
async function eliminarControlPernocta(id) {
    if (!permisosSistema.puedeEliminar('control_pernoctas')) {
        mostrarError('No tienes permisos para eliminar registros de control.');
        return;
    }
    
    // ✅ USAR MODAL CON ESTILO EN LUGAR DE CONFIRM NATIVO
    mostrarConfirmacionEliminarControl(id);
}

/**
 * Muestra modal de confirmación para eliminar control
 */
function mostrarConfirmacionEliminarControl(id) {
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmActionBtn');
    const modalTitle = document.getElementById('confirmModalLabel');
    
    if (modalBody && confirmModal && confirmBtn) {
        // ✅ APLICAR ESTILOS CONSISTENTES
        modalTitle.innerHTML = '<i class="fas fa-trash-alt me-2"></i>Eliminar Control';
        modalBody.innerHTML = `
            <div class="alert alert-warning mb-0">
                <div class="d-flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-triangle fa-2x text-warning"></i>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h5 class="alert-heading">¿Estás seguro?</h5>
                        <p class="mb-2">Esta acción eliminará permanentemente el registro del control de pernocta.</p>
                        <hr>
                        <p class="mb-0 small text-muted">
                            <i class="fas fa-info-circle me-1"></i>
                            Esta acción no se puede deshacer.
                        </p>
                    </div>
                </div>
            </div>
        `;
        confirmBtn.innerHTML = '<i class="fas fa-trash-alt me-1"></i> Eliminar';
        confirmBtn.className = 'btn btn-danger'; // ✅ ESTILO PELIGRO
        confirmBtn.setAttribute('data-id', id);
        confirmModal.show();
    } else {
        // Fallback al confirm tradicional si no hay modal
        if (confirm('¿Estás seguro de que quieres eliminar este registro de control? Esta acción no se puede deshacer.')) {
            eliminarControlPernoctaConfirmada(id);
        }
    }
}

/**
 * Función que ejecuta la eliminación después de la confirmación
 */
async function eliminarControlPernoctaConfirmada(id) {
    // Cerrar modal inmediatamente
    if (confirmModal) {
        confirmModal.hide();
    }
    
    try {
        console.log('🗑️ Eliminando control ID:', id);
        
        const formData = new FormData();
        formData.append('id', id);
        
        // Mostrar loading en el botón de eliminar temporalmente
        const originalButtons = document.querySelectorAll(`button[onclick*="${id}"]`);
        originalButtons.forEach(btn => {
            if (btn.innerHTML.includes('fa-trash-alt')) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Eliminando...';
                btn.disabled = true;
                
                // Restaurar después de 3 segundos si hay error
                setTimeout(() => {
                    if (btn.disabled) {
                        btn.innerHTML = originalHTML;
                        btn.disabled = false;
                    }
                }, 3000);
            }
        });
        
        const response = await fetch('/Eolo/app/controllers/control_pernocta_eliminar.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // ✅ MENSAJE DE ÉXITO CON ESTILO
            mostrarExito(`
                <div class="text-center">
                    <i class="fas fa-check-circle text-success fa-3x mb-3"></i>
                    <h5 class="text-success">¡Control Eliminado!</h5>
                    <p class="mb-0">El registro del control ha sido eliminado correctamente.</p>
                </div>
            `, () => {
                cargarControlPernoctas();
            });
        } else {
            throw new Error(data.message);
        }
        
    } catch (error) {
        console.error('❌ Error al eliminar control:', error);
        
        // ✅ MENSAJE DE ERROR CON ESTILO
        mostrarError(`
            <div class="d-flex align-items-center">
                <i class="fas fa-exclamation-triangle text-danger fa-2x me-3"></i>
                <div>
                    <h6 class="mb-1">Error al eliminar</h6>
                    <p class="mb-0">${error.message}</p>
                </div>
            </div>
        `);
    }
}
/**
 * Carga los registros de control de pernoctas
 */
async function cargarControlPernoctas() {
    const tablaBody = document.getElementById('cuerpoTablaControlPernoctas');
    if (!tablaBody) {
        console.error('❌ No se encontró el elemento cuerpoTablaControlPernoctas');
        return;
    }
    
    console.log('🔄 Iniciando carga de control de pernoctas...');
    tablaBody.innerHTML = '<tr><td colspan="11" class="text-center">Cargando registros...</td></tr>';

    try {
        // Obtener fecha del filtro
        let fecha = '';
        const filtroFecha = document.getElementById('filtroFechaControl');
        if (filtroFecha && filtroFecha.value) {
            fecha = filtroFecha.value;
        }
        
        filtrosActivosControl.fecha = fecha;
        
        let url = `/Eolo/app/models/leer_control_pernocta.php?pagina=${paginaActualControl}&registros_por_pagina=${registrosPorPaginaControl}`;        
        if (filtrosActivosControl.fecha) {
            url += `&fecha=${filtrosActivosControl.fecha}`;
        }
        if (filtrosActivosControl.matricula) {
            url += `&matricula=${encodeURIComponent(filtrosActivosControl.matricula)}`;
        }
        if (filtrosActivosControl.hangar) {
            url += `&hangar=${filtrosActivosControl.hangar}`;
        }

        console.log(`🌐 URL de consulta: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos recibidos del servidor:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }

        const controles = data.controles;
        console.log(`✅ Número de controles recibidos: ${controles.length}`);
        
        paginaActualControl = data.paginacion.pagina_actual;
        totalPaginasControl = data.paginacion.total_paginas;
        totalRegistrosControl = data.paginacion.total_registros;

        tablaBody.innerHTML = '';
        
        if (controles.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="11" class="text-center">No hay registros de control para los filtros seleccionados.</td></tr>';
        } else {
            const usuarioActual = permisosSistema.usuario ? permisosSistema.usuario.nombre : 'Desconocido';
            
           controles.forEach((control, index) => {
    const esPropietario = control.Persona_Registro === usuarioActual;
    const puedeEditar = permisosSistema.puedeEditar ? permisosSistema.puedeEditar('control_pernoctas', control) : false;
    const puedeEliminar = permisosSistema.puedeEliminar ? permisosSistema.puedeEliminar('control_pernoctas') : false;
    
    const fila = document.createElement('tr');
    
    fila.innerHTML = `
        <td>${control.Id_Control || 'No especificada'}</td>
        <td>${control.Fecha || 'No especificada'}</td>
        <td>${control.HoraInicial || 'No especificada'}</td>
        <td>${control.HoraFinal || 'No especificada'}</td>
        <td>${control.Matricula || 'No especificada'}</td>
        <td>${control.Equipo || 'No especificado'}</td>
        <td>
            ${control.Hangar ? 
                `<span class="badge ${control.Hangar === 'H1' ? 'bg-primary' : 'bg-success'}">${control.Hangar}</span>` : 
                '<span class="badge bg-secondary">No asignado</span>'
            }
        </td>
        <td>${control.EmpresaProcedencia || 'No especificada'}</td>
        <td>${control.Observaciones || 'Sin observaciones'}</td>
        <td>
            ${control.Persona_Registro || 'No especificado'}
            ${esPropietario ? '<span class="badge bg-primary ms-1">Tuyo</span>' : ''}
        </td>
        <td>
            <div class="btn-group btn-group-sm" role="group">
                <!-- Botón PDF -->
                <a href="/Eolo/app/helpers/pdf_generator.php?tipo=pernoctas_diarias&id=${control.Id_Control}" 
                   class="btn btn-danger" title="Generar PDF" target="_blank">
                   <i class="fas fa-file-pdf"></i>
                </a>
                
                <!-- Botón Editar -->
                <button class="btn btn-warning btn-editar" 
                        onclick="editarControlPernocta(${control.Id_Control})" 
                        title="Editar control"
                        ${!puedeEditar ? 'disabled style="opacity: 0.6;"' : ''}>
                    <i class="fas fa-edit"></i>
                </button>
                
                <!-- Botón Eliminar -->
                <button class="btn btn-danger btn-eliminar" 
                        onclick="eliminarControlPernocta(${control.Id_Control})" 
                        title="Eliminar control"
                        ${!puedeEliminar ? 'disabled style="opacity: 0.6;"' : ''}>
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </td>
    `;
    
    tablaBody.appendChild(fila);
});
        }
        
        // Actualizar el paginador
        actualizarPaginadorControl();
        
    } catch (error) {
        console.error('❌ Error al cargar control de pernoctas:', error);
        tablaBody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Error al cargar los datos: ${error.message}</td></tr>`;
    }
}

/**
 * Agrega nuevo control (para página de lista)
 */
async function agregarNuevoControl() {
    try {
        console.log('➕ Abriendo modal para nuevo control...');
        
        const response = await fetch('/Eolo/app/models/obtener_entradas_control_pernocta.php');
        const data = await response.json();
        
        if (data.success && data.entradas.length > 0) {
            // Mostrar la primera entrada disponible
            const entrada = data.entradas[0];
            abrirModalControl(entrada, 'agregar');
        } else {
            mostrarError('No hay entradas recientes disponibles para agregar al control.');
        }
        
    } catch (error) {
        console.error('❌ Error al obtener entradas:', error);
        mostrarError('Error al obtener entradas disponibles: ' + error.message);
    }
}

/**
 * Abre el modal para editar o agregar control (solo para página de lista)
 */
function abrirModalControl(datos, modo = 'agregar') {
    const modalElement = document.getElementById('controlModal');
    if (!modalElement) {
        console.log('ℹ️ Modal no disponible, redirigiendo a página individual');
        if (modo === 'editar' && datos.Id_Control) {
            window.location.href = `../../app/views/control_pernocta_editar.html?id=${datos.Id_Control}`;
        }
        return;
    }
    }


/**
 * Muestra mensaje de éxito con estilo
 */
function mostrarExito(mensaje, callback = null) {
    const modalBody = document.getElementById('successModalBody');
    if (modalBody && successModal) {
        // ✅ SOPORTAR TANTO TEXTO COMO HTML
        if (typeof mensaje === 'string' && mensaje.includes('<')) {
            modalBody.innerHTML = mensaje;
        } else {
            modalBody.textContent = mensaje;
        }
        successModal.show();
        
        if (callback) {
            const modalElement = document.getElementById('successModal');
            const handler = function() {
                callback();
                modalElement.removeEventListener('hidden.bs.modal', handler);
            };
            modalElement.addEventListener('hidden.bs.modal', handler);
        }
    } else {
        alert('¡Éxito! 🎉\n' + (typeof mensaje === 'string' ? mensaje.replace(/<[^>]*>/g, '') : mensaje));
        if (callback) callback();
    }
}

/**
 * Muestra mensaje de error con estilo
 */
function mostrarError(mensaje) {
    const modalBody = document.getElementById('errorModalBody');
    if (modalBody && errorModal) {
        // ✅ SOPORTAR TANTO TEXTO COMO HTML
        if (typeof mensaje === 'string' && mensaje.includes('<')) {
            modalBody.innerHTML = mensaje;
        } else {
            modalBody.textContent = mensaje;
        }
        errorModal.show();
    } else {
        alert('¡Error! ⚠️\n' + (typeof mensaje === 'string' ? mensaje.replace(/<[^>]*>/g, '') : mensaje));
    }
}

// Funciones de filtros y paginación (para página de lista)
function aplicarFiltrosControl() {
    console.log('🔍 Aplicando filtros de control...');
    
    const filtroFecha = document.getElementById('filtroFechaControl');
    const filtroMatricula = document.getElementById('filtroMatriculaControl');
    const filtroHangar = document.getElementById('filtroHangar');
    
    if (filtroFecha) {
        filtrosActivosControl.fecha = filtroFecha.value;
    }
    
    if (filtroMatricula) {
        filtrosActivosControl.matricula = filtroMatricula.value.trim();
    }
    
    if (filtroHangar) {
        filtrosActivosControl.hangar = filtroHangar.value;
    }
    
    paginaActualControl = 1;
    cargarControlPernoctas();
}

function limpiarFiltrosControl() {
    console.log('🧹 Limpiando filtros de control...');
    
    const filtroFecha = document.getElementById('filtroFechaControl');
    const filtroMatricula = document.getElementById('filtroMatriculaControl');
    const filtroHangar = document.getElementById('filtroHangar');
    
    if (filtroFecha) filtroFecha.value = '';
    if (filtroMatricula) filtroMatricula.value = '';
    if (filtroHangar) filtroHangar.value = '';
    
    filtrosActivosControl = {
        fecha: '',
        matricula: '',
        hangar: ''
    };
    
    paginaActualControl = 1;
    cargarControlPernoctas();
}

/**
 * Actualiza el paginador para control
 */
function actualizarPaginadorControl() {
    const paginadorContainer = document.getElementById('paginadorControl');
    if (!paginadorContainer) return;
    
    let html = '';
    
    const inicio = ((paginaActualControl - 1) * registrosPorPaginaControl) + 1;
    const fin = Math.min(paginaActualControl * registrosPorPaginaControl, totalRegistrosControl);
    
    html += `
        <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted">
                Mostrando ${inicio} a ${fin} de ${totalRegistrosControl} registros
            </div>
            <nav aria-label="Paginación de control">
                <ul class="pagination pagination-sm mb-0">
    `;
    
    // Botón Anterior
    if (paginaActualControl > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaControl(${paginaActualControl - 1})">
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
    let inicioPaginas = Math.max(1, paginaActualControl - Math.floor(paginasAMostrar / 2));
    let finPaginas = Math.min(totalPaginasControl, inicioPaginas + paginasAMostrar - 1);
    
    if (finPaginas - inicioPaginas + 1 < paginasAMostrar) {
        inicioPaginas = Math.max(1, finPaginas - paginasAMostrar + 1);
    }
    
    // Página inicial
    if (inicioPaginas > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaControl(1)">1</a>
            </li>
            ${inicioPaginas > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
        `;
    }
    
    // Páginas intermedias
    for (let i = inicioPaginas; i <= finPaginas; i++) {
        if (i === paginaActualControl) {
            html += `
                <li class="page-item active">
                    <span class="page-link">${i}</span>
                </li>
            `;
        } else {
            html += `
                <li class="page-item">
                    <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaControl(${i})">${i}</a>
                </li>
            `;
        }
    }
    
    // Página final
    if (finPaginas < totalPaginasControl) {
        html += `
            ${finPaginas < totalPaginasControl - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaControl(${totalPaginasControl})">${totalPaginasControl}</a>
            </li>
        `;
    }
    
    // Botón Siguiente
    if (paginaActualControl < totalPaginasControl) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaControl(${paginaActualControl + 1})">
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
}

/**
 * Cambia a una página específica para control
 */
function cambiarPaginaControl(pagina) {
    if (pagina >= 1 && pagina <= totalPaginasControl && pagina !== paginaActualControl) {
        paginaActualControl = pagina;
        cargarControlPernoctas();
    }
}
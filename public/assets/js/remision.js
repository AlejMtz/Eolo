let successModal = null;
let errorModal = null;
let confirmModal = null;

let aeronavesData = [];
let isEditMode = false;

let paginaActual = 1;
const registrosPorPagina = 15;
let totalPaginas = 1;
let totalRegistros = 0;

let timeoutBusqueda = null;

let filtrosActivosRemision = {
    fecha: '',
    matricula: ''
};

document.addEventListener('DOMContentLoaded', () => {
     if (typeof bootstrap !== 'undefined') {
        successModal = new bootstrap.Modal(document.getElementById('successModal'));
        errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        
        const confirmModalElement = document.getElementById('confirmModal');
        if (confirmModalElement) {
            confirmModal = new bootstrap.Modal(confirmModalElement);
        }
    }

     if (document.getElementById('tablaRemisiones') || document.querySelector('#tablaRemisiones tbody')) {
        cargarRemisiones();
        configurarFiltrosRemisiones();
    }

    if (document.getElementById('remisionForm')) {

        // Establecer fecha actual en el campo de fecha

        establecerFechaActual();

        //  Cargar aeronaves para el selector 
        cargarAeronavesParaSelector();

        
        // Comprobar si hay un ID en la URL para modo edición
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        
        if (id) {
            // Modo edición
            configurarModoEdicion(id);
        } else {
            const now = new Date();
            
            
        }

        
        document.getElementById('remisionForm').addEventListener('submit', function(event) {
            event.preventDefault();
            enviarRemision();
        });
        
    }

    const confirmBtn = document.getElementById('confirmActionBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (id) {
                eliminarRemisionConfirmada(id);
            }
        });
    }
});


/**
 * Aplica los filtros y recarga la tabla de remisiones
 */
function aplicarFiltrosRemisiones() {
    console.log(' Aplicando filtros remisones...');
    console.log(' Filtros activos:', filtrosActivosRemision);
    
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    
    if (filtroFecha && filtroFecha.value !== filtrosActivosRemision.fecha) {
        filtrosActivosRemision.fecha = filtroFecha.value;
    }
    
    if (filtroMatricula && filtroMatricula.value.trim() !== filtrosActivosRemision.matricula) {
        filtrosActivosRemision.matricula = filtroMatricula.value.trim();
    }
    
    console.log(' Filtros sincronizados:', filtrosActivosRemision);
    
    const tablaBody = document.querySelector('#tablaRemision tbody');
    if (tablaBody) {
        tablaBody.innerHTML = '<tr><td colspan="10" class="text-center">Aplicando filtros...</td></tr>';
    }
    
    paginaActual = 1; 
    cargarRemisiones();
}

/**
 * Limpia los filtros y recarga la tabla de walkarounds
 */
function limpiarFiltrosRemisiones() {
    console.log(' Limpiando filtros remisiones...');
    
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    
    if (filtroFecha) filtroFecha.value = '';
    if (filtroMatricula) filtroMatricula.value = '';
    if (filtroMovimiento) filtroMovimiento.value = '';
    
    filtrosActivosRemision = {
        fecha: '',
        matricula: ''
        };
    
    const tablaBody = document.querySelector('#tablaWalkarounds tbody');
    if (tablaBody) {
        tablaBody.innerHTML = '<tr><td colspan="10" class="text-center">Limpiando filtros...</td></tr>';
    }
    
    paginaActual = 1;
    cargarRemisiones();
}


function configurarFiltrosRemisiones() {
    console.log(' Configurando eventos de filtros para remisiones...');
    
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    
    if (filtroFecha) {
        filtroFecha.addEventListener('change', function() {
            console.log(' Cambio en filtro fecha:', this.value);
            aplicarFiltros();
        });
    }
    
    if (filtroMatricula) {
        let timeoutMatricula = null;
        filtroMatricula.addEventListener('input', function() {
            const valor = this.value.trim();
            console.log(' Input en filtro matrícula:', valor);
            
            if (timeoutMatricula) {
                clearTimeout(timeoutMatricula);
            }
            
            timeoutMatricula = setTimeout(() => {
                console.log(' Aplicando filtro de matrícula:', valor);
                aplicarFiltros();
            }, 500);
        });
        
        filtroMatricula.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                aplicarFiltros();
            }
        });
    }
    
    console.log(' Filtros de remisiones configurados correctamente');
}

/**
 * Configura el filtro de búsqueda de aeronaves 
 */
function configurarBusquedaAeronaves() {
    const inputBusqueda = document.getElementById('buscarAeronave');
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    
    if (!inputBusqueda) {
        console.warn(' No se encontró el input de búsqueda de aeronaves');
        return;
    }
    
    if (typeof aeronavesData === 'undefined') {
        aeronavesData = [];
        console.warn(' aeronavesData estaba undefined, inicializado como array vacío');
    }
    
    inputBusqueda.addEventListener('input', function(e) {
        const termino = e.target.value.trim();
        
        if (timeoutBusqueda) {
            clearTimeout(timeoutBusqueda);
        }
        
        timeoutBusqueda = setTimeout(() => {
            if (termino.length >= 2) {
                buscarAeronaves(termino);
            } else {
                ocultarResultadosBusqueda();
                limpiarAeronaveSeleccionada();
            }
        }, 300);
    });
    
    document.addEventListener('click', function(e) {
        if (!inputBusqueda.contains(e.target) && !resultadosDiv.contains(e.target)) {
            ocultarResultadosBusqueda();
        }
    });
    
    inputBusqueda.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            ocultarResultadosBusqueda();
            this.value = '';
            limpiarAeronaveSeleccionada();
        }
    });
}

/**
 * Busca aeronaves por matrícula
 */
function buscarAeronaves(termino) {
    const listaAeronaves = document.getElementById('listaAeronaves');
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    
    if (!Array.isArray(aeronavesData)) {
        console.error(' aeronavesData no es un array:', aeronavesData);
        aeronavesData = []; 
    }
    
    const resultados = aeronavesData.filter(aeronave => {
        if (!aeronave || typeof aeronave !== 'object') {
            return false; 
        }
        
        const matricula = aeronave.Matricula || '';
        const matriculaLower = matricula.toLowerCase();
        const terminoLower = termino.toLowerCase();
        
        return matriculaLower.includes(terminoLower);
    });
    
    if (resultados.length === 0) {
        listaAeronaves.innerHTML = `
            <div class="list-group-item text-center text-muted">
                <i class="fas fa-search me-2"></i>
                No se encontraron aeronaves con la matrícula "${termino}"
            </div>
        `;
    } else {
        listaAeronaves.innerHTML = '';
        
        resultados.forEach(aeronave => {
            if (!aeronave || !aeronave.Matricula) {
                console.warn(' Aeronave inválida encontrada:', aeronave);
                return; 
            }
            
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${aeronave.Matricula}</strong>
                        <br>
                        <small class="text-muted">
                            ${aeronave.Equipo || 'Sin equipo'} - ${aeronave.Tipo || 'Sin tipo'}
                        </small>
                    </div>
                    <i class="fas fa-chevron-right text-muted"></i>
                </div>
            `;
            
            item.addEventListener('click', function() {
                seleccionarAeronave(aeronave);
            });
            
            listaAeronaves.appendChild(item);
        });
    }
    
    resultadosDiv.style.display = 'block';
}

/**
 * Selecciona una aeronave de los resultados de búsqueda
 */
function seleccionarAeronave(aeronave) {
    const inputBusqueda = document.getElementById('buscarAeronave');
    const aeronaveSeleccionada = document.getElementById('aeronaveSeleccionada');
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    
    inputBusqueda.value = aeronave.Matricula;
    
    aeronaveSeleccionada.value = aeronave.Id_Aeronave;
    
    resultadosDiv.style.display = 'none';
    
    mostrarInfoAeronave(aeronave.Id_Aeronave);

    const tipo = aeronave.Tipo ? aeronave.Tipo.toLowerCase() : 'avion';
    
    
    console.log(' Aeronave seleccionada:', aeronave.Matricula, 'ID:', aeronave.Id_Aeronave);
}


function ocultarResultadosBusqueda() {
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    if (resultadosDiv) {
        resultadosDiv.style.display = 'none';
    }
}


function limpiarAeronaveSeleccionada() {
    const aeronaveSeleccionada = document.getElementById('aeronaveSeleccionada');
    const inputBusqueda = document.getElementById('buscarAeronave');
    
    if (aeronaveSeleccionada) {
        aeronaveSeleccionada.value = '';
    }
    
    ocultarInfoAeronave();
}

async function cargarAeronavesParaSelector() {
    console.log(' Intentando cargar aeronaves para selector...');
    
    try {
        const response = await fetch('../../app/models/obtener_aeronaves.php');
        console.log(' Respuesta de obtener_aeronaves.php:', response);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(' Datos recibidos:', data);
        
        if (Array.isArray(data)) {
            aeronavesData = data;
        } else if (data.aeronaves && Array.isArray(data.aeronaves)) {
            aeronavesData = data.aeronaves;
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            aeronavesData = Object.values(data);
        }
        
        console.log(' Aeronaves cargadas correctamente:', aeronavesData.length, 'aeronaves');
        
        configurarBusquedaAeronaves();
        
    } catch (error) {
        console.error(' Error al cargar aeronaves:', error);
        aeronavesData = [];
        mostrarError('Error al cargar las aeronaves. Por favor, recarga la página.');
    }
}


function mostrarInfoAeronave(aeronaveId) {
    const aeronaveSeleccionada = aeronavesData.find(a => a.Id_Aeronave == aeronaveId);
    const infoContainer = document.getElementById('infoAeronaveContainer');
    
    if (aeronaveSeleccionada && infoContainer) {
        document.getElementById('infoMatricula').textContent = aeronaveSeleccionada.Matricula || 'No especificada';
        document.getElementById('infoEquipo').textContent = aeronaveSeleccionada.Equipo || 'No especificado';
        
        infoContainer.style.display = 'flex';
    } else {
        infoContainer.style.display = 'none';
        console.warn(' No se pudo mostrar información de aeronave');
    }
}


function ocultarInfoAeronave() {
    const infoContainer = document.getElementById('infoAeronaveContainer');
    if (infoContainer) {
        infoContainer.style.display = 'none';
    }
}

function actualizarPaginador() {
    const paginadorContainer = document.getElementById('paginador');
    if (!paginadorContainer) return;
    
    let html = '';
    
    const inicio = ((paginaActual - 1) * registrosPorPagina) + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, totalRegistros);
    
    html += `
        <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted">
                Mostrando ${inicio} a ${fin} de ${totalRegistros} registros
            </div>
            <nav aria-label="Paginación de remisiones">
                <ul class="pagination pagination-sm mb-0">
    `;
    
    // Botón Anterior
    if (paginaActual > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPagina(${paginaActual - 1})">
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
    
    if (finPaginas - inicioPaginas + 1 < paginasAMostrar) {
        inicioPaginas = Math.max(1, finPaginas - paginasAMostrar + 1);
    }
    
    // Página inicial
    if (inicioPaginas > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPagina(1)">1</a>
            </li>
            ${inicioPaginas > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
        `;
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
                    <a class="page-link" href="javascript:void(0)" onclick="cambiarPagina(${i})">${i}</a>
                </li>
            `;
        }
    }
    
    // Página final
    if (finPaginas < totalPaginas) {
        html += `
            ${finPaginas < totalPaginas - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPagina(${totalPaginas})">${totalPaginas}</a>
            </li>
        `;
    }
    
    // Botón Siguiente
    if (paginaActual < totalPaginas) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPagina(${paginaActual + 1})">
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
 * Cambia a una página específica
 */
function cambiarPagina(pagina) {
    if (pagina >= 1 && pagina <= totalPaginas && pagina !== paginaActual) {
        cargarRemisiones(pagina);
    }
}

function establecerFechaActual() {
    console.log('Estableciendo fecha actual...');
    
    const campoFecha = document.getElementById('fecha');
    
    if (!campoFecha) {
        console.warn(' Campo fecha no encontrado en la página');
        return;
    }
    
    // Obtener fecha actual
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const fechaFormatted = `${year}-${month}-${day}`;
    
    // Establecer la fecha
    campoFecha.value = fechaFormatted;
    console.log(' Fecha establecida:', fechaFormatted);
    
    // Verificar que se estableció correctamente
    setTimeout(() => {
        console.log('🔍 Verificación fecha:', {
            valorCampo: campoFecha.value,
            tieneValor: !!campoFecha.value
        });
    }, 100);
}

/**
 * Configura el formulario de remision
 */
function configurarFormularioRemision() {
    const formulario = document.getElementById('remisionForm');
    const puedeGestionar = permisosSistema.puedeCrear('remision');
    
    formulario.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Verificar permisos antes de enviar
        if (!puedeGestionar) {
            mostrarErrorPermisos('No tienes permisos para gestionar remisiones');
            return;
        }
        
        const Id_Remision = document.getElementById('Id_Remision').value;
        
        if (!Id_Remision && window.location.search.includes('id=')) {
            mostrarError('No se pudo cargar el ID de la remision. Recarga la página.');
            return;
        }
        
        const url = Id_Remision ? '../../app/controllers/remision_actualizar.php' : '../../app/controllers/remision_crear.php';
        const formData = new FormData(this);

        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const mensaje = Id_Remision ? 
                    'Remision actualizada correctamente.' : 
                    'Remision creada correctamente.';
                mostrarExito(mensaje, () => {
                    window.location.href = '../../app/views/ver_remision_pipa.html';
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
        cargarRemisionParaEditar(id);
    }
}

async function enviarRemision() {
    console.log('🚀 ENVIANDO FORMULARIO - Iniciando proceso...');
    
    const submitButton = document.getElementById('submitButton');
    if (!submitButton) {
        console.error('❌ Botón submitButton no encontrado');
        mostrarError('Error interno: No se encontró el botón de enviar');
        return;
    }
    
    const originalHTML = submitButton.innerHTML;
    
    try {
        // Mostrar spinner
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Validando...';
        
        console.log('🔍 Validando formulario...');
        
        // Validar campos obligatorios
        if (!validarFormulario()) {
            console.log(' Validación falló');
            throw new Error('Corrija los errores en el formulario.');
        }
        
        console.log('✅ Validación exitosa');
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';
        
        // Calcular litros totales automáticamente - VERIFICAR ELEMENTOS
        const lecInicialElement = document.getElementById('lecInicial');
        const lecFinalElement = document.getElementById('lecFinal');
        
        if (!lecInicialElement || !lecFinalElement) {
            throw new Error('No se encontraron los campos de lecturas de combustible');
        }
        
        const lecInicial = parseFloat(lecInicialElement.value);
        const lecFinal = parseFloat(lecFinalElement.value);
        
        if (isNaN(lecInicial) || isNaN(lecFinal)) {
            throw new Error('Las lecturas de combustible deben ser valores numéricos');
        }
        
        const litrosTot = (lecInicial - lecFinal).toFixed(2);
        
        console.log(' Cálculo litros:', {
            inicial: lecInicial,
            final: lecFinal,
            total: litrosTot
        });
        
        // Obtener datos del formulario
        const formElement = document.getElementById('remisionForm');
        if (!formElement) {
            throw new Error('No se encontró el formulario');
        }
        
        const formData = new FormData(formElement);
        
        // Añadir litros totales calculados
        formData.append('LitrosTot', litrosTot);
        
        // Determinar URL según modo (crear o actualizar)
        const idRemisionElement = document.getElementById('Id_Remision');
        if (!idRemisionElement) {
            throw new Error('No se encontró el campo Id_Remision');
        }
        
        const idRemision = idRemisionElement.value;
        const url = idRemision ? 
            '../../app/controllers/remision_actualizar.php' : 
            '../../app/controllers/remision_crear.php';
        
        console.log(' Modo:', idRemision ? 'Edición' : 'Creación');
        console.log(' URL:', url);
        
        // DEPURACIÓN: Mostrar datos que se enviarán
        console.log('📦 DATOS A ENVIAR:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
        }
        
        // Enviar datos al servidor
        console.log(' Enviando datos...');
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        console.log(' Respuesta recibida, status:', response.status);
        
        // Verificar si la respuesta es JSON válido
        const responseText = await response.text();
        console.log('📄 Respuesta del servidor (texto):', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('📊 Respuesta del servidor (JSON):', data);
        } catch (jsonError) {
            console.error('❌ Error al parsear JSON:', jsonError);
            throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}...`);
        }
        
        if (data.success) {
            const mensaje = idRemision ? 
                'Remisión actualizada correctamente.' : 
                'Remisión registrada correctamente.';
            
            mostrarExito(mensaje);

            // Redirigir después de éxito
            setTimeout(() => {
                window.location.href = '../../app/views/ver_remision_pipa.html';
            }, 2000);
            
        } else {
            throw new Error(data.error || 'Error desconocido al guardar la remisión.');
        }
        
    } catch (error) {
        console.error('❌ ERROR en enviarRemision():', error);
        console.error('Stack:', error.stack);
        
        // Mostrar error específico
        let mensajeError = error.message;
        if (error.message.includes('is null')) {
            mensajeError = 'Error interno: No se encontró algún elemento del formulario. Recarga la página.';
        } else if (error.message.includes('Respuesta inválida')) {
            mensajeError = 'Error del servidor: Respuesta inválida. Verifica los logs del servidor.';
        }
        
        mostrarError(mensajeError);
        
        // Restaurar botón
        submitButton.disabled = false;
        submitButton.innerHTML = originalHTML;
    }
}

/**
 * Valida el formulario antes de enviar
 */
function validarFormulario() {
    console.log('🔍 Iniciando validación de formulario...');
    
    // Lista de campos obligatorios
    const camposObligatorios = [
        { id: 'fecha', nombre: 'Fecha' },
        { id: 'operador', nombre: 'Operador' },
        { id: 'cliente', nombre: 'Cliente' },
        { id: 'pago', nombre: 'Método de pago' }, // Este es el campo correcto
        { id: 'horaLlegada', nombre: 'Hora de llegada' },
        { id: 'horaInicial', nombre: 'Hora inicial de servicio' },
        { id: 'lecInicial', nombre: 'Lectura inicial' },
        { id: 'horaFinal', nombre: 'Hora final de servicio' },
        { id: 'lecFinal', nombre: 'Lectura final' },
        { id: 'cobranza', nombre: 'Cobranza' },
        { id: 'serviciosCom', nombre: 'Servicios comerciales' }
    ];
    
    let esValido = true;
    let mensajesError = [];
    
    // Validar campos obligatorios
    for (const campo of camposObligatorios) {
        const elemento = document.getElementById(campo.id);
        
        if (!elemento) {
            console.error(`❌ Elemento no encontrado: ${campo.id}`);
            mensajesError.push(`Campo '${campo.nombre}' no encontrado en el formulario`);
            esValido = false;
            continue;
        }
        
        console.log(` Validando ${campo.id}: "${elemento.value}"`);
        
        if (!elemento.value || elemento.value.trim() === '') {
            console.log(`❌ Campo ${campo.id} vacío`);
            elemento.classList.add('is-invalid');
            mensajesError.push(`El campo '${campo.nombre}' es obligatorio`);
            esValido = false;
        } else {
            elemento.classList.remove('is-invalid');
            elemento.classList.add('is-valid');
        }
    }
    
    // Validar aeronave seleccionada
    const aeronaveSeleccionada = document.getElementById('aeronaveSeleccionada');
    const buscarAeronave = document.getElementById('buscarAeronave');
    
    if (!aeronaveSeleccionada) {
        console.error('❌ Elemento aeronaveSeleccionada no encontrado');
        mensajesError.push('Campo de aeronave no encontrado');
        esValido = false;
    } else if (!aeronaveSeleccionada.value) {
        console.log('❌ Aeronave no seleccionada');
        if (buscarAeronave) {
            buscarAeronave.classList.add('is-invalid');
        }
        mensajesError.push('Por favor, seleccione una aeronave');
        esValido = false;
    } else {
        if (buscarAeronave) {
            buscarAeronave.classList.remove('is-invalid');
            buscarAeronave.classList.add('is-valid');
        }
    }
    
    // Validar lecturas de combustible
    const lecInicialElement = document.getElementById('lecInicial');
    const lecFinalElement = document.getElementById('lecFinal');
    
    if (!lecInicialElement || !lecFinalElement) {
        console.error('❌ Elementos de lecturas no encontrados');
        mensajesError.push('Campos de lecturas de combustible no encontrados');
        esValido = false;
    } else {
        const lecInicial = parseFloat(lecInicialElement.value);
        const lecFinal = parseFloat(lecFinalElement.value);
        
        console.log(' Validando lecturas:', {
            lecInicial: lecInicial,
            lecFinal: lecFinal,
            diferencia: lecInicial - lecFinal
        });
        
        if (isNaN(lecInicial) || isNaN(lecFinal)) {
            console.log('❌ Lecturas no numéricas');
            mensajesError.push('Las lecturas de combustible deben ser valores numéricos');
            esValido = false;
        } else if (lecInicial <= 0 || lecFinal < 0) {
            console.log('❌ Lecturas deben ser positivas');
            mensajesError.push('Las lecturas deben ser valores positivos');
            esValido = false;
        } else if (lecFinal >= lecInicial) {
            console.log('❌ Lectura final debe ser MENOR que la inicial');
            mensajesError.push('La lectura final debe ser MENOR que la lectura inicial');
            esValido = false;
        }
    }
    
    // Mostrar errores acumulados
    if (mensajesError.length > 0) {
        mostrarError('Errores encontrados:\n• ' + mensajesError.join('\n• '));
    }
    
    console.log(`✅ Validación ${esValido ? 'exitosa' : 'fallida'}`);
    return esValido;
}

function limpiarFormulario() {
    const formulario = document.getElementById('remisionForm');
    
    // Limpiar campos de texto
    const inputs = formulario.querySelectorAll('input[type="text"], input[type="number"], textarea');
    inputs.forEach(input => {
        if (input.id !== 'fecha') { // No limpiar fecha
            input.value = '';
        }
    });
    
    // Limpiar selección de aeronave
    document.getElementById('buscarAeronave').value = '';
    document.getElementById('aeronaveSeleccionada').value = '';
    document.getElementById('infoAeronaveContainer').style.display = 'none';
    
    // Restablecer selects a su primer valor
    const selects = formulario.querySelectorAll('select');
    selects.forEach(select => {
        select.selectedIndex = 0;
    });
    
    console.log('🧹 Formulario limpiado');
}

/**
 * Aplica los filtros a la tabla de remisiones
 */
function aplicarFiltros() {
    const filtroFecha = document.getElementById('filtroFecha').value;
    const filtroMatricula = document.getElementById('filtroMatricula').value.trim();
    
    filtrosActivosRemision.fecha = filtroFecha;
    filtrosActivosRemision.matricula = filtroMatricula;
    
    paginaActual = 1;
    cargarRemisiones();
}

/**
 * Limpia los filtros de la tabla de remisiones
 */
function limpiarFiltros() {
    document.getElementById('filtroFecha').value = '';
    document.getElementById('filtroMatricula').value = '';
    
    filtrosActivosRemision = {
        fecha: '',
        matricula: ''
    };
    
    paginaActual = 1;
    cargarRemisiones();
}

/**
 * Modifica cargarRemisiones para aplicar filtros
 */
async function cargarRemisiones(pagina = 1) {
    const tablaBody = document.querySelector('#tablaRemisiones tbody');
    if (!tablaBody) return;

    tablaBody.innerHTML = '<tr><td colspan="8" class="text-center">Cargando...</td></tr>';

    try {
        console.log(' Cargando Remisiones, página:', pagina);
        
        // Construir URL con filtros
        let url = `../../app/models/leer_remision.php?pagina=${pagina}&registros_por_pagina=${registrosPorPagina}`;
        
        if (filtrosActivosRemision.fecha) {
            url += `&fecha=${filtrosActivosRemision.fecha}`;
        }
        
        if (filtrosActivosRemision.matricula) {
            url += `&matricula=${encodeURIComponent(filtrosActivosRemision.matricula)}`;
        }
        
        console.log(' URL de consulta:', url);
        
        const response = await fetch(url);
        
        console.log(' Status de respuesta:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(' Datos recibidos del servidor:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }

        const remisiones = data.remisiones || [];
        const paginacion = data.paginacion || {
            pagina_actual: pagina,
            total_paginas: 1,
            total_registros: remisiones.length,
            registros_por_pagina: registrosPorPagina
        };

        console.log(' Información de paginación:', paginacion);
        console.log(' Remisiones recibidas:', remisiones.length);

        paginaActual = paginacion.pagina_actual;
        totalPaginas = paginacion.total_paginas;
        totalRegistros = paginacion.total_registros;

        tablaBody.innerHTML = '';

        if (remisiones.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="8" class="text-center">No se encontraron remisiones.</td></tr>';
        } else {
            const puedeEditar = permisosSistema.puedeEditar('remision');
            const puedeEliminar = permisosSistema.puedeEliminar('remision');
            
            console.log('Permisos para esta tabla:', { puedeEditar, puedeEliminar });
            
            remisiones.forEach(remision => {
                const fila = document.createElement('tr');
                const matricula = remision.Matricula || 'No especificada';
                const equipo = remision.Equipo || 'No especificado';

                fila.innerHTML = `
                    <td class="mobile-compact">${remision.Fecha || ''}</td>
                    <td>${matricula}</td>
                    <td>${equipo}</td>
                    <td class="mobile-compact">${remision.Id_Remision || ''}</td>
                    <td class="desktop-only">${remision.LecInicial || '0.00'}</td>
                    <td class="desktop-only">${remision.LecFinal || '0.00'}</td>
                    <td class="desktop-only">${remision.LitrosTot || '0.00'}</td>
                    <td>

                    <!-- Botón Ver Detalles -->
                             <a href="../../app/views/detalle_remision.html?id=${remision.Id_Remision}" 
                            class="btn btn-info btn-sm btn-detalle"
                            title="Ver detalles"
                            style="width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center;">
                                <i class="fas fa-eye"></i>
                            </a>
                            
                            <!-- Botón Generar PDF -->
                            <a href="/Eolo/app/helpers/pdf_generator.php?tipo=remision_combustible&id=${remision.Id_Remision}" 
                               class="btn btn-danger"  target="_blank"
                               title="Generar PDF"
                               style="width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center;">
                                <i class="fas fa-file-pdf"></i>
                            </a>

                        <!-- Botón Editar -->
                        <a href="../../app/views/remision.html?id=${remision.Id_Remision}" 
                           class="btn btn-warning btn-sm btn-editar ${!puedeEditar ? 'disabled' : ''}"
                           data-modulo="remision"
                           title="${puedeEditar ? 'Editar remisión' : 'Se requieren permisos de administrador'}"
                           style="${!puedeEditar ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
                           ${!puedeEditar ? 'onclick="return false;"' : ''}>
                            <i class="fas fa-edit"></i>
                        </a>
                        
                        <!-- Botón Eliminar -->
                        <button class="btn btn-danger btn-sm btn-eliminar"
                                data-modulo="remision"
                                onclick="${puedeEliminar ? `eliminarRemision(${remision.Id_Remision})` : 'mostrarErrorPermisos()'}" 
                                title="${puedeEliminar ? 'Eliminar remisión' : 'Se requieren permisos de administrador'}"
                                ${!puedeEliminar ? 'disabled' : ''}
                                style="${!puedeEliminar ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        
                        <!-- Indicador visual de permisos -->
                        ${!puedeEditar && !puedeEliminar ? '<span class="badge bg-secondary ms-1" title="Solo administradores pueden gestionar"><i class="fas fa-lock"></i></span>' : ''}
                    </td>
                `;
                tablaBody.appendChild(fila);
            });
        }
        
        actualizarPaginador();
        
    } catch (error) {
        console.error(' Error al cargar remisiones:', error);
        tablaBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error al cargar los datos: ${error.message}</td></tr>`;
    }
}

/**
 * Configura el modo edición para una remisión
 */
async function configurarModoEdicion(id) {
    console.log('🔄 Configurando modo edición para ID:', id);
    
    isEditMode = true;
    
    try {
        // Obtener datos de la remisión - AGREGAR DEPURACIÓN
        console.log(`📡 Solicitando datos para ID: ${id}`);
        const response = await fetch(`../../app/controllers/remision_leer_id.php?id=${id}`);
        
        console.log('📥 Respuesta recibida, status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const responseText = await response.text();
        console.log('📄 Respuesta del servidor (texto):', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('📊 Respuesta del servidor (JSON):', data);
        } catch (jsonError) {
            console.error('❌ Error al parsear JSON:', jsonError);
            throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}...`);
        }
        
        // Verificar estructura de respuesta
        if (data.success && data.remision) {
            console.log('✅ Datos recibidos correctamente:', data.remision);
            cargarDatosEnFormulario(data.remision);
            
            // Cambiar título y botones
            const cardHeader = document.querySelector('.card-header h5');
            if (cardHeader) {
                cardHeader.innerHTML = '<i class="fas fa-edit"></i> Editar Remisión';
            }
            
            const submitButton = document.getElementById('submitButton');
            if (submitButton) {
                submitButton.innerHTML = '<i class="fas fa-save"></i> Actualizar Registro';
            }
            
            // Mostrar botón de cancelar edición
            const cancelarBtn = document.getElementById('cancelarBtn');
            if (cancelarBtn) {
                cancelarBtn.style.display = 'inline-block';
            }
            
            console.log('✅ Modo edición configurado correctamente');
        } else {
            console.error('❌ Estructura de respuesta incorrecta:', data);
            throw new Error(data.error || 'No se pudieron cargar los datos de la remisión.');
        }
        
    } catch (error) {
        console.error('❌ Error al cargar remisión para editar:', error);
        console.error('Stack trace:', error.stack);
        mostrarError('No se pudo cargar la remisión para editar. ' + error.message);
        
        // Redirigir a la lista después de 3 segundos
        setTimeout(() => {
            window.location.href = '../../app/views/ver_remision_pipa.html';
        }, 3000);
    }
}

/**
 * Carga los datos de una remisión en el formulario
 */
function cargarDatosEnFormulario(remision) {
    console.log('📝 Cargando datos en formulario:', remision);
    
    // Función mejorada para establecer valores
    function setValueSafe(elementId, value, defaultValue = '') {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                const finalValue = value !== null && value !== undefined ? value : defaultValue;
                element.value = finalValue;
                console.log(`   ✓ ${elementId}: "${finalValue}"`);
                return true;
            } else {
                console.warn(`   ✗ ${elementId}: Elemento no encontrado`);
                return false;
            }
        } catch (error) {
            console.error(`   ❌ Error con ${elementId}:`, error);
            return false;
        }
    }
    
    try {
        console.log('🔍 DEPURACIÓN - Verificando elementos del formulario:');
        
        // Lista de elementos que deberían existir - ACTUALIZADA
        const elementosEsperados = [
            'Id_Remision', 'fecha', 'operador', 'ov', 'cliente', 'requision', 'pago',
            'aeronaveSeleccionada', 'buscarAeronave', 'horaLlegada', 'horaInicial',
            'lecInicial', 'horaFinal', 'lecFinal', 'observaciones', 'cobranza', 'serviciosCom'
        ];
        
        elementosEsperados.forEach(id => {
            const elem = document.getElementById(id);
            console.log(`  ${id}: ${elem ? '✓ EXISTE' : '✗ NO EXISTE'}`);
        });
        
        console.log('📥 Estableciendo valores:');
        
        // Información general
        setValueSafe('Id_Remision', remision.Id_Remision);
        setValueSafe('fecha', remision.Fecha);
        setValueSafe('operador', remision.Operador);
        setValueSafe('ov', remision.Ov);
        
        // Información de vuelo y aeronave
        setValueSafe('cliente', remision.Cliente);
        setValueSafe('requision', remision.Requision);
        // IMPORTANTE: Usar FormaPago si existe, sino usar pago
        const formaPago = remision.FormaPago || remision.pago || 'efectivo';
        setValueSafe('pago', formaPago);
        
        // Aeronave
        setValueSafe('aeronaveSeleccionada', remision.Id_Aeronave);
        setValueSafe('buscarAeronave', remision.Matricula);
        
        // Información de servicios
        setValueSafe('horaLlegada', formatTime(remision.HoraLlegada));
        setValueSafe('horaInicial', formatTime(remision.HoraInicial));
        setValueSafe('lecInicial', remision.LecInicial);
        setValueSafe('horaFinal', formatTime(remision.HoraFinal));
        setValueSafe('lecFinal', remision.LecFinal);
        
        // Observaciones y otros
        setValueSafe('observaciones', remision.Observaciones);
        setValueSafe('cobranza', remision.Cobranza);
        setValueSafe('serviciosCom', remision.ServiciosCom);
        
        // Mostrar información de la aeronave seleccionada si existe
        if (remision.Id_Aeronave && remision.Matricula) {
            const infoContainer = document.getElementById('infoAeronaveContainer');
            if (infoContainer) {
                const infoMatricula = document.getElementById('infoMatricula');
                const infoEquipo = document.getElementById('infoEquipo');
                
                if (infoMatricula) {
                    infoMatricula.textContent = remision.Matricula || 'No especificada';
                }
                if (infoEquipo) {
                    infoEquipo.textContent = remision.Equipo || 'No especificado';
                }
                infoContainer.style.display = 'flex';
                console.log('   ✓ Info aeronave mostrada');
            }
        }
        
        console.log('✅ Datos cargados en formulario correctamente');
        
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        console.error('Stack trace:', error.stack);
        throw error;
    }
}

/**
 * Formatea el tiempo para input type="time"
 */
function formatTime(timeString) {
    if (!timeString) return '';
    
    // Si ya está en formato HH:MM
    if (timeString.length >= 5) {
        return timeString.substring(0, 5);
    }
    
    // Si está en formato HH:MM:SS
    if (timeString.includes(':')) {
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        }
    }
    
    return '';
}

/**
 * Cancela el modo edición
 */
function cancelarEdicion() {
    if (confirm('¿Estás seguro de cancelar la edición? Los cambios no guardados se perderán.')) {
        window.location.href = '../../app/views/remision.html';
    }
}

/**
 * Función para eliminar una remisión
 */
function eliminarRemision(id) {
    console.log('🗑️ Intentando eliminar remisión ID:', id);
    
    // Verificar permisos antes de eliminar
    if (!permisosSistema.puedeEliminar('remision')) {
        mostrarError('No tienes permisos para eliminar remisiones.');
        return;
    }
    
    // Obtener elementos del modal
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    if (!modalBody || !confirmBtn) {
        console.error('❌ Elementos del modal de confirmación no encontrados');
        // Fallback: usar confirm nativo
        if (confirm(`¿Estás seguro de que deseas eliminar la remisión con ID ${id}?`)) {
            eliminarRemisionConfirmada(id);
        }
        return;
    }
    
    // Configurar modal de confirmación
    modalBody.textContent = `¿Estás seguro de que deseas eliminar la remisión con ID ${id}? Esta acción no se puede deshacer.`;
    confirmBtn.setAttribute('data-id', id);
    
    // Mostrar modal
    if (confirmModal) {
        confirmModal.show();
    } else {
        console.warn('⚠️ Modal de confirmación no disponible, usando confirm nativo');
        if (confirm(`¿Estás seguro de eliminar la remisión ID ${id}?`)) {
            eliminarRemisionConfirmada(id);
        }
    }
}

/**
 * Confirma la eliminación de una remisión
 */
async function eliminarRemisionConfirmada(id) {
    console.log('✅ Confirmando eliminación de remisión ID:', id);
    
    try {
        // Mostrar indicador de carga
        const originalText = 'Eliminando...';
        const confirmBtn = document.getElementById('confirmActionBtn');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Eliminando...';
        }
        
        // Enviar solicitud DELETE al servidor
        const response = await fetch(`../../app/controllers/remision_eliminar.php?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 Respuesta de eliminación, status:', response.status);
        
        // Obtener texto de respuesta para depuración
        const responseText = await response.text();
        console.log('📄 Respuesta del servidor (texto):', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('📊 Respuesta del servidor (JSON):', data);
        } catch (jsonError) {
            console.error('❌ Error al parsear JSON:', jsonError);
            throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}...`);
        }
        
        // Cerrar modal de confirmación
        if (confirmModal) {
            confirmModal.hide();
        }
        
        if (data.success) {
            mostrarExito('Remisión eliminada correctamente.');
            
            // Recargar la tabla después de 1.5 segundos
            setTimeout(() => {
                cargarRemisiones(paginaActual);
            }, 1500);
            
        } else {
            throw new Error(data.error || 'Error al eliminar la remisión');
        }
        
    } catch (error) {
        console.error('❌ Error al eliminar remisión:', error);
        
        // Restaurar botón de confirmación
        const confirmBtn = document.getElementById('confirmActionBtn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirmar';
        }
        
        // Mostrar error
        mostrarError(`Error al eliminar remisión: ${error.message}`);
    }
}

/**
 * Función para mostrar error de permisos
 */
function mostrarErrorPermisos() {
    mostrarError('Se requieren permisos de administrador para realizar esta acción.');
}

/**
 * Muestra mensaje de éxito
 */
function mostrarExito(mensaje) {
    const modalBody = document.getElementById('successModalBody');
    if (modalBody && successModal) {
        modalBody.textContent = mensaje;
        successModal.show();
    } else {
        alert(mensaje);
    }
}

/**
 * Muestra mensaje de error
 */
function mostrarError(mensaje) {
    const modalBody = document.getElementById('errorModalBody');
    if (modalBody && errorModal) {
        modalBody.textContent = mensaje;
        errorModal.show();
    } else {
        alert('❌ ' + mensaje);
    }
}
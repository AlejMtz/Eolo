// Variables globales para los modales
let successModal = null;
let errorModal = null;
let confirmModal = null;

// Almacenar información de aeronaves y walkaround
let aeronavesData = [];
let generalEvidenceFiles = [];
let walkaroundData = null;
let isEditMode = false;

// Variables globales para paginación
let paginaActual = 1;
const registrosPorPagina = 15;
let totalPaginas = 1;
let totalRegistros = 0;

// Variables globales para el filtro de búsqueda
let timeoutBusqueda = null;

let filtrosActivosWalkaround = {
    fecha: '',
    matricula: '',
    movimiento: ''
};

// Componentes predefinidos organizados por sección según el formato físico
const componentesPorTipo = {
    avion: {
        'A': [
            { id: 'tren_nariz', nombre: 'TREN DE NARIZ' },
            { id: 'compuertas_tren', nombre: 'COMPUERTAS TREN DE ATERRIZAJE' },
            { id: 'parabrisas_limpiadores', nombre: 'PARABRISAS / LIMPIADORES' },
            { id: 'radomo', nombre: 'RADOMO' },
            { id: 'tubo_pitot', nombre: 'TUBO PITOT' }
        ],

        'B': [
            { id: 'fuselaje', nombre: 'FUSELAJE' },
            { id: 'antena', nombre: 'ANTENA' }
        ],    
          
        'C': [
            { id: 'aleta', nombre: 'ALETA' },
            { id: 'aleron', nombre: 'ALERON' },
            { id: 'compensador_aleron', nombre: 'COMPENSADOR DE ALERON' },
            { id: 'mechas_descarga', nombre: 'MECHAS DE DESCARGA ESTÁTICA' },
            { id: 'punta_ala', nombre: 'PUNTA DE ALA' },
            { id: 'luces_carretero', nombre: 'LUCES DE CARRETEO / ATERRIZAJE' },
            { id: 'luces_navegacion', nombre: 'LUCES DE NAVEGACIÓN, BEACON' },
            { id: 'borde_ataque', nombre: 'BORDE DE ATAQUE' },
            { id: 'tren_principal', nombre: 'TREN DE ATERRIZAJE PRINCIPAL' },
            { id: 'valvulas_servicio', nombre: 'VÁLVULAS DE SERVICIO (COMBUSTIBLE, ETC)' }
        ],
            
        'D': [
            { id: 'motor', nombre: 'MOTOR' },
        ],
        'E': [
            { id: 'estabilizador_vertical', nombre: 'ESTABILIZADOR VERTICAL' },
            { id: 'timon_direccion', nombre: 'TIMÓN DE DIRECCIÓN' },
            { id: 'compensador_timon_direccion', nombre: 'COMPENSADOR TIMÓN DE DIRECCIÓN' },
            { id: 'estabilizador_horizontal', nombre: 'ESTABILIZADOR HORIZONTAL' },
            { id: 'timon_profundidad', nombre: 'TIMÓN DE PROFUNDIDAD' },
            { id: 'compensador_timon_profundidad', nombre: 'COMPENSADOR TIMÓN DE PROFUNDIDAD' },
            { id: 'borde_empenaje', nombre: 'BORDE DE EMPEÑAJE' },
            { id: 'alas_delta', nombre: 'ALAS DELTA' }
        ]
    },
    helicoptero: {
        'A': [
            { id: 'fuselaje', nombre: 'FUSELAJE' },
            { id: 'puertas', nombre: 'PUERTAS, VENTANAS, ANTENAS, LUCES' }, 
            { id: 'esqui', nombre: 'ESQUÍ / NEUMÁTICOS' },
            { id: 'palas', nombre: 'PALAS' },
            { id: 'boom', nombre: 'BOOM' },
            { id: 'estabilizadores', nombre: 'ESTABILIZADORES' },
            { id: 'rotor', nombre: 'ROTOR DE COLA' },
            { id: 'parabrisas', nombre: 'PARABRISAS' }
        ]
    }
};

// Tipos de daño según el formato
const tiposDano = [
    { id: 'derecho', nombre: 'DERECHO' },
    { id: 'izquierdo', nombre: 'IZQUIERDO' },
    { id: 'golpe', nombre: 'GOLPE' },
    { id: 'rayon', nombre: 'RAYÓN' },
    { id: 'fisura', nombre: 'FISURA' },
    { id: 'quebrado', nombre: 'QUEBRADO' },
    { id: 'pinturaCuarteada', nombre: 'PINT. CUARTEADA' },
    { id: 'otroDano', nombre: 'OTRO DAÑO' }
];

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

    // Si estamos en la página de lista, cargar walkarounds
    if (document.getElementById('tablaWalkarounds')) {
        cargarWalkarounds();
        configurarFiltrosWalkaround();
    }

    // Si estamos en el formulario de walkaround
    if (document.getElementById('walkaroundForm')) {
        // ⭐⭐ PRIMERO: Cargar aeronaves para el selector (SIEMPRE, en ambos modos)
        cargarAeronavesParaSelector();
        configurarEventosEliminacion();

        // ⭐⭐ NUEVO: Configurar búsqueda de aeropuertos
        configurarBusquedaAeropuertos();
        
        // Comprobar si hay un ID en la URL para modo edición
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        
        if (id) {
            // Modo edición
            configurarModoEdicion(id);
        } else {
            // ⭐⭐ CORRECCIÓN: Establecer fecha/hora actual LOCAL del dispositivo
            const now = new Date();
            
            // Obtener la fecha y hora local en formato correcto para datetime-local
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            // Formato: YYYY-MM-DDThh:mm (hora local)
            const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
            
            document.getElementById('fechaHora').value = formatted;
            
            console.log('🕐 Hora local establecida:', formatted);
            
            // Asegurar que la acción sea para creación
            document.getElementById('walkaroundForm').action = '../../app/controllers/procesar_walkaround.php';
        }

        // Configurar checkboxes de entrada/salida
        configurarCheckboxesEntradaSalida();
        
        // Configurar envío del formulario
        document.getElementById('walkaroundForm').addEventListener('submit', function(event) {
            event.preventDefault();
            enviarWalkaround();
        });
        
        // Manejar la selección de evidencias generales
        document.getElementById('generalEvidence').addEventListener('change', function(e) {
            handleGeneralEvidenceSelect(e.target.files);
        });
    }

    // Configurar evento para el botón de confirmación de eliminación
    const confirmBtn = document.getElementById('confirmActionBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (id) {
                eliminarWalkaroundConfirmada(id);
            }
        });
    }
});

/**
 * Aplica los filtros y recarga la tabla de walkarounds - VERSIÓN MEJORADA
 */
function aplicarFiltrosWalkaround() {
    console.log('🔍 Aplicando filtros walkaround...');
    console.log('📊 Filtros activos:', filtrosActivosWalkaround);
    
    // Obtener valores actuales de los inputs por si hay cambios no capturados
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroMovimiento = document.getElementById('filtroMovimiento');
    
    // Sincronizar valores actuales con filtrosActivosWalkaround
    if (filtroFecha && filtroFecha.value !== filtrosActivosWalkaround.fecha) {
        filtrosActivosWalkaround.fecha = filtroFecha.value;
    }
    
    if (filtroMatricula && filtroMatricula.value.trim() !== filtrosActivosWalkaround.matricula) {
        filtrosActivosWalkaround.matricula = filtroMatricula.value.trim();
    }
    
    if (filtroMovimiento && filtroMovimiento.value !== filtrosActivosWalkaround.movimiento) {
        filtrosActivosWalkaround.movimiento = filtroMovimiento.value;
    }
    
    console.log('🎯 Filtros sincronizados:', filtrosActivosWalkaround);
    
    // Mostrar loading en la tabla
    const tablaBody = document.querySelector('#tablaWalkarounds tbody');
    if (tablaBody) {
        tablaBody.innerHTML = '<tr><td colspan="10" class="text-center">Aplicando filtros...</td></tr>';
    }
    
    paginaActual = 1; // Resetear a primera página
    cargarWalkarounds();
}

/**
 * Limpia los filtros y recarga la tabla de walkarounds - VERSIÓN MEJORADA
 */
function limpiarFiltrosWalkaround() {
    console.log('🧹 Limpiando filtros walkaround...');
    
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroMovimiento = document.getElementById('filtroMovimiento');
    
    if (filtroFecha) filtroFecha.value = '';
    if (filtroMatricula) filtroMatricula.value = '';
    if (filtroMovimiento) filtroMovimiento.value = '';
    
    filtrosActivosWalkaround = {
        fecha: '',
        matricula: '',
        movimiento: ''
    };
    
    // Mostrar loading en la tabla
    const tablaBody = document.querySelector('#tablaWalkarounds tbody');
    if (tablaBody) {
        tablaBody.innerHTML = '<tr><td colspan="10" class="text-center">Limpiando filtros...</td></tr>';
    }
    
    paginaActual = 1;
    cargarWalkarounds();
}

/**
 * Configura los eventos para los filtros de walkaround - VERSIÓN CORREGIDA
 */
function configurarFiltrosWalkaround() {
    console.log('⚙️ Configurando eventos de filtros walkaround...');
    
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroMovimiento = document.getElementById('filtroMovimiento');
    
    // Configurar filtro de fecha - APLICAR AL CAMBIAR
    if (filtroFecha) {
        filtroFecha.addEventListener('change', function() {
            console.log('📅 Cambio en filtro fecha:', this.value);
            filtrosActivosWalkaround.fecha = this.value;
            aplicarFiltrosWalkaround(); // ⭐⭐ CORRECCIÓN: Aplicar filtros inmediatamente
        });
    }
    
    // Configurar filtro de matrícula con debounce - APLICAR AL TERMINAR DE ESCRIBIR
    if (filtroMatricula) {
        let timeoutMatricula = null;
        filtroMatricula.addEventListener('input', function() {
            const valor = this.value.trim();
            console.log('🛩️ Input en filtro matrícula:', valor);
            
            // Limpiar timeout anterior
            if (timeoutMatricula) {
                clearTimeout(timeoutMatricula);
            }
            
            // Esperar 500ms después de que el usuario deje de escribir y APLICAR FILTROS
            timeoutMatricula = setTimeout(() => {
                filtrosActivosWalkaround.matricula = valor;
                console.log('🛩️ Matrícula actualizada, aplicando filtros:', filtrosActivosWalkaround.matricula);
                aplicarFiltrosWalkaround(); // ⭐⭐ CORRECCIÓN: Aplicar filtros automáticamente
            }, 500);
        });
        
        // También aplicar filtro al presionar Enter
        filtroMatricula.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filtrosActivosWalkaround.matricula = this.value.trim();
                aplicarFiltrosWalkaround();
            }
        });
    }
    
    // Configurar filtro de movimiento - APLICAR AL CAMBIAR
    if (filtroMovimiento) {
        filtroMovimiento.addEventListener('change', function() {
            console.log('🔄 Cambio en filtro movimiento:', this.value);
            filtrosActivosWalkaround.movimiento = this.value;
            aplicarFiltrosWalkaround(); // ⭐⭐ CORRECCIÓN: Aplicar filtros inmediatamente
        });
    }
    
    // ⭐⭐ NUEVO: Configurar el botón de búsqueda si existe
    const btnBuscar = document.querySelector('button[onclick="aplicarFiltrosWalkaround()"]');
    if (btnBuscar) {
        console.log('✅ Botón de búsqueda encontrado y configurado');
        // El onclick ya está configurado en el HTML
    }
    
    // ⭐⭐ NUEVO: Configurar el botón de limpiar si existe
    const btnLimpiar = document.querySelector('button[onclick="limpiarFiltrosWalkaround()"]');
    if (btnLimpiar) {
        console.log('✅ Botón de limpiar encontrado y configurado');
        // El onclick ya está configurado en el HTML
    }
    
    console.log('✅ Filtros walkaround configurados correctamente');
}

/**
 * Configura el filtro de búsqueda de aeronaves - VERSIÓN MEJORADA
 */
function configurarBusquedaAeronaves() {
    const inputBusqueda = document.getElementById('buscarAeronave');
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    
    if (!inputBusqueda) {
        console.warn('⚠️ No se encontró el input de búsqueda de aeronaves');
        return;
    }
    
    // ⭐⭐ CORRECCIÓN: Inicializar aeronavesData si está undefined
    if (typeof aeronavesData === 'undefined') {
        aeronavesData = [];
        console.warn('⚠️ aeronavesData estaba undefined, inicializado como array vacío');
    }
    
    inputBusqueda.addEventListener('input', function(e) {
        const termino = e.target.value.trim();
        
        // Limpiar timeout anterior
        if (timeoutBusqueda) {
            clearTimeout(timeoutBusqueda);
        }
        
        // Esperar 300ms después de que el usuario deje de escribir
        timeoutBusqueda = setTimeout(() => {
            if (termino.length >= 2) {
                buscarAeronaves(termino);
            } else {
                ocultarResultadosBusqueda();
                limpiarAeronaveSeleccionada();
            }
        }, 300);
    });
    
    // Ocultar resultados al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!inputBusqueda.contains(e.target) && !resultadosDiv.contains(e.target)) {
            ocultarResultadosBusqueda();
        }
    });
    
    // Limpiar búsqueda al presionar Escape
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
    
    // ⭐⭐ CORRECCIÓN: Verificar que aeronavesData sea un array
    if (!Array.isArray(aeronavesData)) {
        console.error('❌ aeronavesData no es un array:', aeronavesData);
        aeronavesData = []; // Forzar a array vacío
    }
    
    // Filtrar aeronaves que coincidan con la búsqueda
    const resultados = aeronavesData.filter(aeronave => {
        if (!aeronave || typeof aeronave !== 'object') {
            return false; // Saltar elementos inválidos
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
            // Validar que la aeronave tenga los campos necesarios
            if (!aeronave || !aeronave.Matricula) {
                console.warn('⚠️ Aeronave inválida encontrada:', aeronave);
                return; // Saltar esta aeronave
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
 * Selecciona una aeronave de los resultados de búsqueda - VERSIÓN MEJORADA
 */
function seleccionarAeronave(aeronave) {
    const inputBusqueda = document.getElementById('buscarAeronave');
    const aeronaveSeleccionada = document.getElementById('aeronaveSeleccionada');
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    
    // Mostrar matrícula en el input de búsqueda
    inputBusqueda.value = aeronave.Matricula;
    
    // Guardar ID en campo oculto
    aeronaveSeleccionada.value = aeronave.Id_Aeronave;
    
    // Ocultar resultados
    resultadosDiv.style.display = 'none';
    
    // Mostrar información de la aeronave seleccionada
    mostrarInfoAeronave(aeronave.Id_Aeronave);

    const tipo = aeronave.Tipo ? aeronave.Tipo.toLowerCase() : 'avion';
    console.log('🛩️ Cargando componentes para aeronave:', aeronave.Matricula, 'Tipo:', tipo);
    
    // ⭐⭐ Cargar componentes según el tipo de aeronave (funciona en ambos modos)
    cargarComponentes(tipo);
    
    console.log('✅ Aeronave seleccionada:', aeronave.Matricula, 'ID:', aeronave.Id_Aeronave);
}

/**
 * Oculta los resultados de búsqueda
 */
function ocultarResultadosBusqueda() {
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    if (resultadosDiv) {
        resultadosDiv.style.display = 'none';
    }
}

/**
 * Limpia la aeronave seleccionada
 */
function limpiarAeronaveSeleccionada() {
    const aeronaveSeleccionada = document.getElementById('aeronaveSeleccionada');
    const inputBusqueda = document.getElementById('buscarAeronave');
    
    if (aeronaveSeleccionada) {
        aeronaveSeleccionada.value = '';
    }
    
    // Ocultar información de aeronave
    ocultarInfoAeronave();
    
    // Limpiar componentes
    const componentesContainer = document.getElementById('componentesContainer');
    componentesContainer.innerHTML = `
        <div class="text-center py-5">
            <i class="fas fa-plane fs-1 text-muted"></i>
            <p class="mt-3 text-muted">Selecciona una aeronave para mostrar sus componentes</p>
        </div>
    `;
}

/**
 * Configura el filtro de búsqueda de aeropuertos para procedencia/destino
 */
function configurarBusquedaAeropuertos() {
    // Configurar para procedencia
    const inputProcedencia = document.getElementById('procedencia');
    const resultadosProcedencia = document.getElementById('resultadosProcedencia');
    
    // Configurar para destino
    const inputDestino = document.getElementById('destino');
    const resultadosDestino = document.getElementById('resultadosDestino');
    
    if (inputProcedencia) {
        configurarInputAeropuerto(inputProcedencia, resultadosProcedencia);
    }
    
    if (inputDestino) {
        configurarInputAeropuerto(inputDestino, resultadosDestino);
    }
}

/**
 * Configura un input individual para búsqueda de aeropuertos
 */
function configurarInputAeropuerto(inputElement, resultadosDiv) {
    let timeoutBusqueda = null;
    
    inputElement.addEventListener('input', function(e) {
        const termino = e.target.value.trim();
        
        // Limpiar timeout anterior
        if (timeoutBusqueda) {
            clearTimeout(timeoutBusqueda);
        }
        
        // Esperar 300ms después de que el usuario deje de escribir
        timeoutBusqueda = setTimeout(() => {
            if (termino.length >= 2) {
                buscarAeropuertos(termino, resultadosDiv, inputElement);
            } else {
                ocultarResultadosAeropuertos(resultadosDiv);
            }
        }, 300);
    });
    
    // Ocultar resultados al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!inputElement.contains(e.target) && !resultadosDiv.contains(e.target)) {
            ocultarResultadosAeropuertos(resultadosDiv);
        }
    });
    
    // Manejar teclas especiales
    inputElement.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            ocultarResultadosAeropuertos(resultadosDiv);
            inputElement.blur();
        }
    });
}

/**
 * Busca aeropuertos por término (IATA, OACI o nombre)
 */
async function buscarAeropuertos(termino, resultadosDiv, inputElement) {
    try {
        const response = await fetch(`/Eolo/app/models/obtener_aeropuertos.php?q=${encodeURIComponent(termino)}`);
        const data = await response.json();
        
        if (data.success && data.aeropuertos.length > 0) {
            mostrarResultadosAeropuertos(data.aeropuertos, resultadosDiv, inputElement);
        } else {
            ocultarResultadosAeropuertos(resultadosDiv);
        }
    } catch (error) {
        console.error('Error buscando aeropuertos:', error);
        ocultarResultadosAeropuertos(resultadosDiv);
    }
}

/**
 * Muestra los resultados de búsqueda de aeropuertos
 */
/**
 * Muestra los resultados de búsqueda de aeropuertos - CORREGIDA
 */
function mostrarResultadosAeropuertos(aeropuertos, resultadosDiv, inputElement) {
    resultadosDiv.innerHTML = '';
    
    aeropuertos.forEach(aeropuerto => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'list-group-item list-group-item-action text-start';
        
        // ✅ CORRECCIÓN: Usar los campos correctos que vienen del servidor
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <strong>${aeropuerto.codigo_iata} / ${aeropuerto.codigo_oaci}</strong>
                    <div class="small">${aeropuerto.nombre}</div>
                    <div class="small text-muted">${aeropuerto.estado}, ${aeropuerto.pais}</div>
                </div>
            </div>
        `;
        
        item.addEventListener('click', function() {
            seleccionarAeropuerto(aeropuerto, inputElement, resultadosDiv);
        });
        
        resultadosDiv.appendChild(item);
    });
    
    resultadosDiv.style.display = 'block';
}

/**
 * Selecciona un aeropuerto de los resultados - MEJORADA
 */
function seleccionarAeropuerto(aeropuerto, inputElement, resultadosDiv) {
    // ✅ MEJORA: Mostrar código IATA y nombre para mejor identificación
    inputElement.value = `${aeropuerto.codigo_iata} - ${aeropuerto.nombre}`;
    
    // ✅ OPCIONAL: Si quieres guardar el ID del aeropuerto también
    // Puedes agregar un campo oculto si necesitas el ID para la base de datos
    const aeropuertoIdField = inputElement.id + '_id';
    let idField = document.getElementById(aeropuertoIdField);
    
    if (!idField) {
        idField = document.createElement('input');
        idField.type = 'hidden';
        idField.id = aeropuertoIdField;
        idField.name = inputElement.name + '_id'; // Ej: procedencia_id
        inputElement.parentNode.appendChild(idField);
    }
    idField.value = aeropuerto.id;
    
    // Ocultar resultados
    ocultarResultadosAeropuertos(resultadosDiv);
    
    console.log('Aeropuerto seleccionado:', aeropuerto);
}

/**
 * Oculta los resultados de búsqueda de aeropuertos
 */
function ocultarResultadosAeropuertos(resultadosDiv) {
    if (resultadosDiv) {
        resultadosDiv.style.display = 'none';
    }
}

/**
 * ⭐⭐ FUNCIÓN MEJORADA: Configura el formulario en modo edición
 */
function configurarModoEdicion(id) {
    isEditMode = true;
    document.title = 'Editar Walkaround - Inspección de Componentes';
    
    console.log('🔄 Configurando modo edición para ID:', id);
    
    // Actualizar el título del formulario
    const formTitle = document.querySelector('.form-title');
    if (formTitle) {
        formTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Walkaround';
    }
    
    // Cambiar texto del botón de envío
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-save me-1"></i> Actualizar Walkaround';
        submitButton.classList.remove('btn-primary');
        submitButton.classList.add('btn-warning');
    }
    
    // ⭐⭐ CORRECCIÓN: ELIMINAR COMPLETAMENTE EL CAMPO DE FECHA/HORA EN EDICIÓN
    const fechaHoraGroup = document.querySelector('.form-group:has(#fechaHora)');
    if (fechaHoraGroup) {
        console.log('🗑️ Eliminando campo de fecha/hora en modo edición');
        fechaHoraGroup.remove();
    }
    
    // Cambiar acción del formulario
    document.getElementById('walkaroundForm').action = '/Eolo/app/controllers/walkaround_actualizar.php';
    
    // ✅ Asegurar que el campo oculto para el ID exista
    let idWalkInput = document.getElementById('id_walk');
    if (!idWalkInput) {
        idWalkInput = document.createElement('input');
        idWalkInput.type = 'hidden';
        idWalkInput.id = 'id_walk';
        idWalkInput.name = 'id_walk';
        document.getElementById('walkaroundForm').appendChild(idWalkInput);
    }
    idWalkInput.value = id;
    
    // ✅ CARGAR AERONAVES PARA EL SELECTOR (IMPORTANTE: también en modo edición)
    cargarAeronavesParaSelector();
    
    // ✅ Cargar los datos del walkaround
    cargarDatosWalkaround(id);
}

/**
 * Carga evidencias existentes en modo edición - VERSIÓN CORREGIDA SIN DUPLICADOS
 */
function cargarEvidenciasExistentes(evidencias) {
    console.log('📸 Cargando evidencias existentes:', evidencias);
    
    if (!evidencias || evidencias.length === 0) {
        console.log('ℹ️ No hay evidencias existentes para cargar');
        return;
    }
    
    const previewContainer = document.getElementById('evidencePreview');
    if (!previewContainer) {
        console.error('❌ No se encontró el contenedor de preview de evidencias');
        return;
    }
    
    // ⭐⭐ LIMPIAR SOLO LAS EVIDENCIAS EXISTENTES, NO LAS NUEVAS
    const existingEvidences = previewContainer.querySelectorAll('.existing-evidence');
    existingEvidences.forEach(el => el.remove());
    
    evidencias.forEach(evidencia => {
        const idEvidencia = evidencia.Id_Evidencia;
        const ruta = evidencia.Ruta;
        const fileName = evidencia.FileName;
        const extension = fileName ? fileName.split('.').pop().toLowerCase() : '';
        const esImagen = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
        
        console.log('🖼️ Evidencia existente:', { id: idEvidencia, ruta: ruta, fileName: fileName });

        const itemDiv = document.createElement('div');
        itemDiv.className = 'evidence-item existing-evidence';
        itemDiv.id = 'evidence-existente-' + idEvidencia;
        itemDiv.setAttribute('data-id-evidencia', idEvidencia);
        
        if (esImagen) {
            const img = document.createElement('img');
            img.src = ruta;
            img.className = 'evidence-preview';
            img.style.height = '80px';
            img.style.width = '80px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '4px';
            img.onerror = function() {
                console.error('❌ Error cargando imagen existente:', ruta);
                this.style.display = 'none';
                const icon = document.createElement('i');
                icon.className = 'fas fa-file-image evidence-preview';
                icon.style.fontSize = '2rem';
                icon.style.color = '#6c757d';
                itemDiv.appendChild(icon);
            };
            
            img.onload = function() {
                console.log('✅ Imagen existente cargada correctamente:', ruta);
            };
            
            itemDiv.appendChild(img);
        } else {
            const icon = document.createElement('i');
            icon.className = 'fas fa-file-video evidence-preview';
            icon.style.fontSize = '2rem';
            icon.style.color = '#6c757d';
            itemDiv.appendChild(icon);
        }
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = fileName;
        nameSpan.className = 'file-name';
        nameSpan.style.marginLeft = '10px';
        nameSpan.style.flex = '1';
        nameSpan.title = fileName;
        
        itemDiv.appendChild(nameSpan);
        
        // Agregar indicador de que es una evidencia existente
        const existenteBadge = document.createElement('span');
        existenteBadge.className = 'badge bg-info ms-2';
        existenteBadge.textContent = 'Existente';
        itemDiv.appendChild(existenteBadge);
        
        // ⭐⭐ AGREGAR BOTÓN PARA ELIMINAR EVIDENCIA EXISTENTE
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-sm btn-danger remove-existing-evidence ms-2';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.title = 'Eliminar esta evidencia';
        removeBtn.onclick = function() {
            if (confirm('¿Estás seguro de que quieres eliminar esta evidencia?')) {
                eliminarEvidenciaExistente(idEvidencia, itemDiv);
            }
        };
        itemDiv.appendChild(removeBtn);
        
        // Insertar al principio para separar existentes de nuevas
        previewContainer.insertBefore(itemDiv, previewContainer.firstChild);
    });
    
    console.log('✅ Evidencias existentes cargadas:', evidencias.length);
}

/**
 * Elimina una evidencia existente
 */
async function eliminarEvidenciaExistente(idEvidencia, elemento) {
    try {
        const formData = new FormData();
        formData.append('id_evidencia', idEvidencia);

        const response = await fetch('/Eolo/app/controllers/eliminar_evidencia.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            elemento.remove();
            console.log('✅ Evidencia eliminada:', idEvidencia);
        } else {
            alert('Error al eliminar evidencia: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error eliminando evidencia:', error);
        alert('Error al conectar con el servidor');
    }
}

/**
 * Carga la lista de walkarounds con paginación, permisos y filtros - VERSIÓN MEJORADA
 */
async function cargarWalkarounds(pagina = 1) {
    const tablaBody = document.querySelector('#tablaWalkarounds tbody');
    if (!tablaBody) {
        console.error('❌ No se encontró la tabla de walkarounds');
        return;
    }
    
    tablaBody.innerHTML = '<tr><td colspan="10" class="text-center">Cargando...</td></tr>';

    try {
        console.log(`🔄 Cargando walkarounds página ${pagina}...`);
        console.log('🎯 Filtros activos:', filtrosActivosWalkaround);
        
        // Construir URL con filtros
        let url = `/Eolo/app/models/leer_walkaround.php?pagina=${pagina}&registros_por_pagina=${registrosPorPagina}`;
        
        // Agregar filtros si están activos
        if (filtrosActivosWalkaround.fecha) {
            url += `&fecha=${filtrosActivosWalkaround.fecha}`;
        }
        if (filtrosActivosWalkaround.matricula) {
            url += `&matricula=${encodeURIComponent(filtrosActivosWalkaround.matricula)}`;
        }
        if (filtrosActivosWalkaround.movimiento) {
            url += `&movimiento=${filtrosActivosWalkaround.movimiento}`;
        }

        console.log(`🌐 URL de consulta: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos recibidos:', data);
        
        if (!data.success) {
            throw new Error(data.error || 'Error desconocido del servidor');
        }

        const walkarounds = data.walkarounds;
        paginaActual = data.paginacion.pagina_actual;
        totalPaginas = data.paginacion.total_paginas;
        totalRegistros = data.paginacion.total_registros;

        tablaBody.innerHTML = '';
        
        if (walkarounds.length === 0) {
            let mensaje = 'No hay walkarounds registrados.';
            if (filtrosActivosWalkaround.fecha || filtrosActivosWalkaround.matricula || filtrosActivosWalkaround.movimiento) {
                mensaje = 'No se encontraron walkarounds con los filtros aplicados.';
            }
            tablaBody.innerHTML = `<tr><td colspan="10" class="text-center">${mensaje}</td></tr>`;
        } else {
            const usuarioActual = permisosSistema.usuario.nombre;
            const usuarioId = permisosSistema.usuario.id;
            
            walkarounds.forEach((walkaround) => {
                console.log(`📝 Procesando walkaround ID ${walkaround.Id_Walk}:`, walkaround);
                
                // Determinar permisos para este registro específico
                const puedeEditar = permisosSistema.puedeEditar('walkarounds', walkaround);
                const puedeEliminar = permisosSistema.puedeEliminar('walkarounds');
                const esPropietario = walkaround.creado_por === usuarioId || walkaround.Elaboro === usuarioActual;
                
                const fila = document.createElement('tr');
                
                // Manejo seguro de campos
                const matricula = walkaround.Matricula || 'No especificada';
                const equipo = walkaround.Equipo || 'No especificado';
                const procedencia = walkaround.Procedencia || 'No especificada';
                const destino = walkaround.Destino || 'No especificada';
                const elaboro = walkaround.Elaboro || 'No especificado';
                const responsable = walkaround.Responsable || 'No especificado';
                
                // ⭐⭐ CORRECCIÓN: Determinar badge de movimiento según los campos entrada/salida
                let movimientoBadge = '';
                if (walkaround.entrada == 1) {
                    movimientoBadge = '<span class="badge bg-success">Entrada</span>';
                } 
                if (walkaround.salida == 1) {
                    movimientoBadge = '<span class="badge bg-primary">Salida</span>';
                }
                // ⭐⭐ NOTA: En tu estructura, una aeronave podría tener ambos valores en 1
                // Si quieres evitar esto, deberías hacerlos mutuamente excluyentes
                
                // Formatear fecha
                let fechaFormateada = 'Fecha no válida';
                try {
                    if (walkaround.FechaHora) {
                        fechaFormateada = new Date(walkaround.FechaHora).toLocaleString();
                    }
                } catch (e) {
                    console.warn('Error al formatear fecha:', e);
                }
                
                fila.innerHTML = `
                    <td>${walkaround.Id_Walk}</td>
                    <td>${fechaFormateada}</td>
                    <td>${matricula}</td>
                    <td>${equipo}</td>
                    <td>${movimientoBadge}</td>
                    <td>${procedencia}</td>
                    <td>${destino}</td>
                    <td>${elaboro}</td>
                    <td>${responsable}</td>
                    
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <!-- Botón Ver Detalles -->
                            <a href="detalle_walkaround.html?id=${walkaround.Id_Walk}" 
                               class="btn btn-info" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </a>
                            
                            <!-- Botón Generar PDF -->
                            <a href="/Eolo/app/helpers/pdf_generator.php?tipo=walkaround&id=${walkaround.Id_Walk}" 
                               class="btn btn-danger" title="Generar PDF" target="_blank">
                                <i class="fas fa-file-pdf"></i>
                            </a>
                            
                            <!-- Botón Editar (con permisos) -->
                            <a href="componenteWk.html?id=${walkaround.Id_Walk}" 
                               class="btn btn-warning btn-editar" 
                               data-modulo="walkarounds"
                               title="${puedeEditar ? 'Editar walkaround' : (esPropietario ? 'Solo puedes editar tus propios walkarounds' : 'No puedes editar walkarounds de otros usuarios')}"
                               style="${!puedeEditar ? 'opacity: 0.6; pointer-events: none;' : ''}">
                                <i class="fas fa-edit"></i>
                            </a>
                            
                            <!-- Botón Eliminar (con permisos) -->
                            <button class="btn btn-danger btn-eliminar" 
                                    data-modulo="walkarounds"
                                    onclick="${puedeEliminar ? `eliminarWalkaround(${walkaround.Id_Walk})` : 'mostrarErrorPermisosEliminar()'}" 
                                    title="${puedeEliminar ? 'Eliminar walkaround' : 'Se requieren permisos de administrador'}"
                                    style="${!puedeEliminar ? 'opacity: 0.6; pointer-events: none;' : ''}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        
                        <!-- Indicador visual de permisos -->
                        ${!puedeEditar && !esPropietario ? 
                            '<span class="badge bg-secondary ms-1" title="Solo el creador o administrador puede editar">🔒</span>' : 
                            ''}
                    </td>
                `;
                
                tablaBody.appendChild(fila);
            });
        }
        
        // Actualizar el paginador
        actualizarPaginador();
        
    } catch (error) {
        console.error('❌ Error al cargar walkarounds:', error);
        tablaBody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">Error al cargar los datos: ${error.message}</td></tr>`;
    }
}

/**
 * ⭐⭐ FUNCIÓN MEJORADA: Procesa los componentes para el formulario
 */
function procesarComponentesParaFormulario(componentes) {
    console.log('🔄 Procesando componentes para formulario:', componentes);
    
    const componentesProcesados = {};
    
    if (!componentes || !Array.isArray(componentes)) {
        console.warn('⚠️ Componentes no es un array válido:', componentes);
        return componentesProcesados;
    }
    
    componentes.forEach((componente, index) => {
        console.log(`🔍 Procesando componente ${index}:`, componente);
        
        // ⭐⭐ CORRECCIÓN: Usar el campo correcto según tu base de datos
        const componenteId = componente.Identificador_Componente;
        
        if (componenteId) {
            componentesProcesados[componenteId] = {
                derecho: componente.derecho == 1,
                izquierdo: componente.izquierdo == 1,
                golpe: componente.golpe == 1,
                rayon: componente.rayon == 1,
                fisura: componente.fisura == 1,
                quebrado: componente.quebrado == 1,
                pinturaCuarteada: componente.pinturaCuarteada == 1,
                otroDano: componente.otroDano == 1
            };
            
            console.log(`📝 Componente ${componenteId} procesado:`, componentesProcesados[componenteId]);
        } else {
            console.warn('⚠️ Componente sin identificador:', componente);
        }
    });
    
    console.log('✅ Componentes procesados:', Object.keys(componentesProcesados).length);
    return componentesProcesados;
}

/**
 * Muestra información de aeronave en modo edición - VERSIÓN MEJORADA
 */
function mostrarInfoAeronaveEnModoEdicion(matricula, equipo) {
    const infoContainer = document.getElementById('infoAeronaveContainer');
    
    if (infoContainer) {
        // Mostrar la información en los campos correspondientes
        const infoMatricula = document.getElementById('infoMatricula');
        const infoEquipo = document.getElementById('infoEquipo');
        
        if (infoMatricula) {
            infoMatricula.textContent = matricula || 'No especificada';
        }
        if (infoEquipo) {
            infoEquipo.textContent = equipo || 'No especificado';
        }
        
        // Mostrar el contenedor de información
        infoContainer.style.display = 'flex';
        console.log('✅ Información de aeronave mostrada en modo edición:', { matricula, equipo });
    } else {
        console.warn('⚠️ No se encontró el contenedor de información de aeronave');
    }
}

/**
 * Carga aeronaves para el selector - VERSIÓN MEJORADA (funciona en creación y edición)
 */
/**
 * Carga aeronaves para el selector - VERSIÓN CORREGIDA
 */
async function cargarAeronavesParaSelector() {
    console.log('🛩️ Intentando cargar aeronaves para selector...');
    
    try {
        const response = await fetch('../../app/models/obtener_aeronaves.php');
        console.log('📨 Respuesta de obtener_aeronaves.php:', response);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos recibidos:', data);
        
        // ⭐⭐ CORRECCIÓN: Asegurar que aeronavesData sea siempre un array
        if (Array.isArray(data)) {
            aeronavesData = data;
        } else if (data.aeronaves && Array.isArray(data.aeronaves)) {
            // Si viene con estructura de paginación
            aeronavesData = data.aeronaves;
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            // Si es un objeto u otra estructura, convertirlo a array
            aeronavesData = Object.values(data);
        }
        
        console.log('✅ Aeronaves cargadas correctamente:', aeronavesData.length, 'aeronaves');
        
        // ⭐⭐ CONFIGURAR EL FILTRO DE BÚSQUEDA (siempre, en ambos modos)
        configurarBusquedaAeronaves();
        
    } catch (error) {
        console.error('❌ Error al cargar aeronaves:', error);
        // Asegurar que aeronavesData sea un array vacío en caso de error
        aeronavesData = [];
        mostrarError('Error al cargar las aeronaves. Por favor, recarga la página.');
    }
}

/**
 * Muestra la información adicional de la aeronave seleccionada
 */
function mostrarInfoAeronave(aeronaveId) {
    const aeronaveSeleccionada = aeronavesData.find(a => a.Id_Aeronave == aeronaveId);
    const infoContainer = document.getElementById('infoAeronaveContainer');
    
    if (aeronaveSeleccionada && infoContainer) {
        // Mostrar la información en los campos correspondientes
        document.getElementById('infoMatricula').textContent = aeronaveSeleccionada.Matricula || 'No especificada';
        document.getElementById('infoEquipo').textContent = aeronaveSeleccionada.Equipo || 'No especificado';
        
        // Mostrar el contenedor de información
        infoContainer.style.display = 'flex';
    } else {
        // Ocultar el contenedor si no hay aeronave seleccionada
        infoContainer.style.display = 'none';
        console.warn('❌ No se pudo mostrar información de aeronave');
    }
}

/**
 * Oculta la información de la aeronave
 */
function ocultarInfoAeronave() {
    const infoContainer = document.getElementById('infoAeronaveContainer');
    if (infoContainer) {
        infoContainer.style.display = 'none';
    }
}

/**
 * Configura los checkboxes de Entrada/Salida para que sean exclusivos
 */
function configurarCheckboxesEntradaSalida() {
    const entradaCheckbox = document.getElementById('entrada');
    const salidaCheckbox = document.getElementById('salida');
    
    if (entradaCheckbox && salidaCheckbox) {
        entradaCheckbox.addEventListener('change', function() {
            if (this.checked) {
                salidaCheckbox.checked = false;
            }
        });
        
        salidaCheckbox.addEventListener('change', function() {
            if (this.checked) {
                entradaCheckbox.checked = false;
            }
        });
    }
}

/**
 * Carga los datos de un walkaround específico para edición
 */
async function cargarDatosWalkaround(id) {
    console.log('🔄 Cargando datos del walkaround ID:', id);
    
    try {
        const response = await fetch(`/Eolo/app/controllers/walkaround_leer_id.php?id=${id}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos recibidos para edición:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Llenar el formulario con los datos
        llenarFormularioConDatos(data);
        
    } catch (error) {
        console.error('❌ Error al cargar datos del walkaround:', error);
        mostrarError('No se pudieron cargar los datos del walkaround: ' + error.message);
    }
}

/**
 * Llena el formulario con los datos del walkaround - VERSIÓN MEJORADA SIN FECHA
 */
function llenarFormularioConDatos(data) {
    console.log('📝 Llenando formulario con datos:', data);
    
    // ⭐⭐ PRIMERO: Configurar la aeronave (MEJORADO)
    if (data.Id_Aeronave && data.Matricula) {
        // Esperar un momento para asegurar que el sistema de búsqueda esté listo
        setTimeout(() => {
            // Establecer la aeronave seleccionada
            document.getElementById('aeronaveSeleccionada').value = data.Id_Aeronave;
            document.getElementById('buscarAeronave').value = data.Matricula;
            
            // Mostrar información de la aeronave
            mostrarInfoAeronaveEnModoEdicion(data.Matricula, data.Equipo);
            
            // Cargar componentes según el tipo de aeronave
            const tipo = data.Tipo ? data.Tipo.toLowerCase() : 'avion';
            console.log('🛩️ Cargando componentes para tipo:', tipo);
            
            // Cargar componentes con los datos guardados
            const componentesGuardados = procesarComponentesParaFormulario(data.componentes || []);
            cargarComponentes(tipo, componentesGuardados);
        }, 100);
    }
    
    // ⭐⭐ SEGUNDO: Llenar los campos básicos del formulario (EXCLUYENDO FECHA)
    // NOTA: El campo fechaHora ya fue eliminado en modo edición
    
    // Campos de texto
    if (data.Elaboro) document.getElementById('elaboro').value = data.Elaboro;
    if (data.Responsable) document.getElementById('responsable').value = data.Responsable;
    if (data.JefeArea) document.getElementById('jefe_area').value = data.JefeArea;
    if (data.VoBo) document.getElementById('vobo').value = data.VoBo;
    if (data.observaciones) document.getElementById('observacionesGenerales').value = data.observaciones;
    if (data.Procedencia) document.getElementById('procedencia').value = data.Procedencia;
    if (data.Destino) document.getElementById('destino').value = data.Destino;
    
    // Checkboxes de entrada/salida
    if (data.entrada == 1) document.getElementById('entrada').checked = true;
    if (data.salida == 1) document.getElementById('salida').checked = true;
    
    // ⭐⭐ TERCERO: Cargar evidencias existentes
    if (data.evidencias && data.evidencias.length > 0) {
        cargarEvidenciasExistentes(data.evidencias);
    }
    
    console.log('✅ Formulario llenado correctamente (sin campo fecha)');
}

/**
 * Carga componentes según el tipo de aeronave - VERSIÓN CON SCROLL HORIZONTAL COMPLETO
 */
function cargarComponentes(tipoAeronave, componentesGuardados = {}) {
    console.log('🔄 cargarComponentes iniciado con scroll horizontal completo');
    
    const componentesContainer = document.getElementById('componentesContainer');
    
    if (!componentesContainer) {
        console.error('❌ ERROR CRÍTICO: No se encontró el contenedor de componentes');
        return;
    }
    
    const secciones = componentesPorTipo[tipoAeronave];
    
    if (!secciones || Object.keys(secciones).length === 0) {
        console.error('❌ No se encontraron componentes para tipo:', tipoAeronave);
        componentesContainer.innerHTML = `
            <div class="alert alert-warning m-3">
                <i class="fas fa-exclamation-triangle me-2"></i>
                No hay componentes definidos para este tipo de aeronave.
            </div>
        `;
        return;
    }
    
    console.log('✅ Secciones encontradas:', Object.keys(secciones));
    
    let html = '';
    let componentesProcesados = 0;

    // Generar cada sección (A, B, C, D, E)
    for (const letraSeccion in secciones) {
        const componentesSeccion = secciones[letraSeccion];
        
        if (componentesSeccion.length > 0) {
            html += `
                <div class="section-container">
                    <div class="section-header">
                        <h5 class="mb-0 text-center">SECCIÓN ${letraSeccion}</h5>
                    </div>
                    <table class="table table-bordered table-sm component-table mb-0">
                        <tbody>
            `;
            
            componentesSeccion.forEach(componente => {
                // Obtener datos del componente guardado
                const estadoGuardado = componentesGuardados[componente.id] || {
                    derecho: false, izquierdo: false, golpe: false, rayon: false,
                    fisura: false, quebrado: false, pinturaCuarteada: false, otroDano: false
                };

                console.log(`🎯 Componente ${componente.id} - Estado:`, estadoGuardado);

                // Determinar si la fila debe resaltarse
                const tieneDanos = Object.values(estadoGuardado).some(v => v);
                const claseFila = tieneDanos ? 'table-warning has-damage' : '';

                html += `
                    <tr class="component-row ${claseFila}" id="fila-${componente.id}">
                        <td class="component-name">
                            <strong>${componente.nombre}</strong>
                        </td>
                `;

                // Generar checkboxes para cada tipo de daño
                tiposDano.forEach(tipoDano => {
                    const checked = estadoGuardado[tipoDano.id] ? 'checked' : '';
                    html += `
                        <td class="text-center">
                            <input type="checkbox" 
                                class="form-check-input damage-checkbox" 
                                name="dano_${componente.id}_${tipoDano.id}" 
                                value="1" 
                                ${checked}
                                data-componente="${componente.id}"
                                data-tipo="${tipoDano.id}">
                        </td>
                    `;
                });

                html += `</tr>`;
                componentesProcesados++;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }
    }
    
    console.log(`📝 Generando HTML para ${componentesProcesados} componentes con scroll horizontal completo...`);
    componentesContainer.innerHTML = html;
    
    // Configurar eventos para los checkboxes
    const checkboxes = document.querySelectorAll('.damage-checkbox');
    console.log(`🎛️ Configurando eventos para ${checkboxes.length} checkboxes...`);
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const componenteId = this.getAttribute('data-componente');
            const tipoDano = this.getAttribute('data-tipo');
            const filaComponente = document.getElementById(`fila-${componenteId}`);
            
            // Resaltar fila si hay algún checkbox marcado
            const checkboxesComponente = document.querySelectorAll(`.damage-checkbox[data-componente="${componenteId}"]`);
            const algunoMarcado = Array.from(checkboxesComponente).some(cb => cb.checked);
            
            if (algunoMarcado) {
                filaComponente.classList.add('table-warning');
                filaComponente.classList.add('has-damage');
            } else {
                filaComponente.classList.remove('table-warning');
                filaComponente.classList.remove('has-damage');
            }
            
            console.log(`🔧 Checkbox cambiado: ${componenteId} - ${tipoDano}: ${this.checked}`);
        });
        
        // Aplicar efecto táctil
        checkbox.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        checkbox.addEventListener('touchend', function() {
            this.style.transform = 'scale(1.3)';
        });
    });

    console.log('✅ Función cargarComponentes con scroll horizontal completo finalizada');
}

/**
 * Actualiza el input de evidencias - VERSIÓN ROBUSTA
 */
function updateEvidenceInput() {
    const input = document.getElementById('generalEvidence');
    if (!input) {
        console.error('❌ No se encontró el input generalEvidence');
        return;
    }
    
    // Crear un nuevo DataTransfer para los archivos
    const dataTransfer = new DataTransfer();
    
    // Agregar los archivos que quedan (sin duplicados)
    const archivosUnicos = [];
    const nombresArchivos = new Set();
    
    generalEvidenceFiles.forEach(f => {
        // Verificar duplicados por nombre y tamaño
        const clave = f.file.name + '_' + f.file.size;
        
        if (!nombresArchivos.has(clave)) {
            nombresArchivos.add(clave);
            archivosUnicos.push(f.file);
            dataTransfer.items.add(f.file);
            console.log('📋 Archivo agregado a DataTransfer:', f.file.name);
        } else {
            console.log('⚠️ Archivo duplicado omitido en DataTransfer:', f.file.name);
        }
    });
    
    // Actualizar el input de archivos
    input.files = dataTransfer.files;
    
    console.log('🔄 Input actualizado:', dataTransfer.files.length + ' archivos');
    console.log('📦 Estado final - generalEvidenceFiles:', generalEvidenceFiles.length);
    console.log('📦 Estado final - input.files:', input.files.length);
    
    // Log detallado de los archivos
    for (let i = 0; i < input.files.length; i++) {
        console.log('  📄 Archivo ' + i + ':', input.files[i].name, '-', input.files[i].size, 'bytes');
    }
}

/**
 * Elimina una evidencia
 */
function removeEvidence(fileId) {
    // Eliminar del array
    generalEvidenceFiles = generalEvidenceFiles.filter(f => f.id !== fileId);
    
    // Eliminar del DOM
    const item = document.getElementById('evidence-item-' + fileId);
    if (item) {
        item.remove();
    }
    
    // Actualizar el input de archivos
    updateEvidenceInput();
}

/**
 * Maneja la selección de evidencias generales - VERSIÓN COMPLETA
 */
function handleGeneralEvidenceSelect(files) {
    console.log('📁 Archivos seleccionados:', files);
    
    if (!files || files.length === 0) return;
    
    const previewContainer = document.getElementById('evidencePreview');
    if (!previewContainer) return;
    
    // Remover el mensaje "no hay evidencias" si existe
    const noEvidenceMsg = previewContainer.querySelector('.text-muted.text-center');
    if (noEvidenceMsg) noEvidenceMsg.remove();
    
    Array.from(files).forEach(file => {
        // Verificar duplicados
        const existe = generalEvidenceFiles.some(f => 
            f.file.name === file.name && f.file.size === file.size
        );
        
        if (!existe) {
            const fileId = 'new-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            const fileObj = { id: fileId, file: file };
            generalEvidenceFiles.push(fileObj);
            
            crearElementoEvidencia(fileObj, previewContainer);
        }
    });
    
    updateEvidenceInput();
}

/**
 * Crea un elemento de evidencia en el DOM - VERSIÓN CON MODAL
 */
function crearElementoEvidencia(fileObj, container) {
    const { id, file } = fileObj;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'evidence-item new-evidence';
    itemDiv.id = 'evidence-item-' + id;
    
    // Contenedor para la miniatura (hacerla clickeable)
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.className = 'evidence-thumbnail-container';
    thumbnailContainer.style.cursor = 'pointer';
    thumbnailContainer.title = 'Haz clic para ver en pantalla completa';
    
    // ⭐⭐ HACER LA MINIATURA CLICKEABLE PARA EL MODAL
    thumbnailContainer.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        abrirEvidenciaNuevaEnModal(file, id);
    });
    
    // Miniaturas según tipo de archivo
    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.className = 'evidence-preview';
        img.style.cssText = 'height: 80px; width: 80px; object-fit: cover; border-radius: 4px;';
        thumbnailContainer.appendChild(img);
    } else if (file.type.startsWith('video/')) {
        const icon = document.createElement('i');
        icon.className = 'fas fa-file-video evidence-preview';
        icon.style.cssText = 'font-size: 2rem; color: #6c757d;';
        thumbnailContainer.appendChild(icon);
        
        // Icono de play para indicar que es clickeable
        const playIcon = document.createElement('i');
        playIcon.className = 'fas fa-play-circle play-overlay';
        playIcon.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 1.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);';
        thumbnailContainer.appendChild(playIcon);
    } else {
        const icon = document.createElement('i');
        icon.className = 'fas fa-file evidence-preview';
        icon.style.cssText = 'font-size: 2rem; color: #6c757d;';
        thumbnailContainer.appendChild(icon);
    }
    
    itemDiv.appendChild(thumbnailContainer);
    
    // Nombre del archivo
    const nameSpan = document.createElement('span');
    nameSpan.textContent = file.name;
    nameSpan.className = 'file-name';
    nameSpan.style.marginLeft = '10px';
    nameSpan.style.flex = '1';
    
    // Badge "Nueva"
    const newBadge = document.createElement('span');
    newBadge.className = 'badge bg-success ms-2';
    newBadge.textContent = 'Nueva';
    
    // Botón eliminar
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-sm btn-danger remove-evidence-btn';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.title = 'Quitar esta evidencia';
    
    // Event listener para eliminar
    removeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎯 Click en botón eliminar para ID:', id);
        removeEvidence(id);
    });
    
    itemDiv.appendChild(nameSpan);
    itemDiv.appendChild(newBadge);
    itemDiv.appendChild(removeBtn);
    container.appendChild(itemDiv);
}

/**
 * Abre una evidencia NUEVA en el modal de pantalla completa
 */
function abrirEvidenciaNuevaEnModal(file, fileId) {
    console.log('🔄 Abriendo evidencia NUEVA en modal:', file.name);
    
    const modalContent = document.getElementById('evidenceModalContent');
    const modalTitle = document.getElementById('evidenceModalLabel');
    const fileNameSpan = document.getElementById('evidenceFileName');
    const downloadBtn = document.getElementById('downloadEvidenceBtn');
    
    // Limpiar contenido anterior
    modalContent.innerHTML = '';
    
    // Configurar nombre del archivo
    fileNameSpan.textContent = file.name;
    
    // Configurar botón de descarga (para nuevas evidencias)
    downloadBtn.style.display = 'block';
    downloadBtn.onclick = function() {
        descargarArchivoNuevo(file);
    };
    
    if (file.type.startsWith('image/')) {
        // Para imágenes: mostrar en tamaño completo
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '80vh';
        img.style.objectFit = 'contain';
        img.className = 'img-fluid';
        
        img.onerror = function() {
            modalContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    No se pudo cargar la imagen: ${file.name}
                </div>
            `;
        };
        
        modalContent.appendChild(img);
        
    } else if (file.type.startsWith('video/')) {
        // Para videos: mostrar reproductor completo
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        video.autoplay = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '80vh';
        video.className = 'img-fluid';
        
        video.onerror = function() {
            modalContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    No se pudo cargar el video: ${file.name}
                </div>
            `;
        };
        
        modalContent.appendChild(video);
        
    } else {
        // Para otros tipos de archivo
        modalContent.innerHTML = `
            <div class="text-center text-white">
                <i class="fas fa-file fa-5x mb-3"></i>
                <h4>${file.name}</h4>
                <p class="mb-3">Este tipo de archivo no se puede previsualizar</p>
                <button class="btn btn-primary" onclick="descargarArchivoNuevo(${JSON.stringify(file).replace(/"/g, '&quot;')})">
                    <i class="fas fa-download me-2"></i>Descargar Archivo
                </button>
            </div>
        `;
    }
    
    // Mostrar el modal
    if (window.evidenceModal) {
        window.evidenceModal.show();
    }
}

/**
 * Descarga un archivo nuevo (antes de guardar)
 */
function descargarArchivoNuevo(file) {
    console.log('📥 Descargando archivo nuevo:', file.name);
    
    // Crear un enlace temporal para la descarga
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.target = '_blank';
    
    // Simular clic en el enlace
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Liberar el objeto URL después de un tiempo
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    // Mostrar mensaje de descarga
    mostrarMensajeDescarga(file.name);
}

/**
 * Elimina una evidencia - VERSIÓN CORREGIDA
 */
function removeEvidence(fileId) {
    console.log('🗑️ Eliminando evidencia con ID:', fileId);
    
    // Eliminar del array
    generalEvidenceFiles = generalEvidenceFiles.filter(f => f.id !== fileId);
    
    // Eliminar del DOM
    const item = document.getElementById('evidence-item-' + fileId);
    if (item) {
        item.remove();
        console.log('✅ Evidencia eliminada del DOM');
    }
    
    // Actualizar el input de archivos
    updateEvidenceInput();
    
    // Mostrar mensaje si no hay archivos
    const previewContainer = document.getElementById('evidencePreview');
    const existingEvidences = previewContainer.querySelectorAll('.existing-evidence');
    const newEvidences = previewContainer.querySelectorAll('.new-evidence');
    
    if (existingEvidences.length === 0 && newEvidences.length === 0) {
        previewContainer.innerHTML = '<div class="text-muted text-center py-3"><i class="fas fa-images me-2"></i>No hay evidencias seleccionadas</div>';
    }
}


/**
 * Actualiza el input de evidencias - VERSIÓN MEJORADA
 */
function updateEvidenceInput() {
    const input = document.getElementById('generalEvidence');
    if (!input) {
        console.error('❌ No se encontró el input generalEvidence');
        return;
    }
    
    // Crear un nuevo DataTransfer para los archivos
    const dataTransfer = new DataTransfer();
    
    // Agregar los archivos que quedan
    generalEvidenceFiles.forEach(f => {
        dataTransfer.items.add(f.file);
        console.log('📋 Archivo agregado a DataTransfer:', f.file.name);
    });
    
    // Actualizar el input de archivos
    input.files = dataTransfer.files;
    
    console.log('🔄 Input actualizado:', dataTransfer.files.length + ' archivos');
}

/**
 * Configurar event delegation para los botones de eliminar
 */
function configurarEventosEliminacion() {
    const previewContainer = document.getElementById('evidencePreview');
    if (!previewContainer) return;
    
    // Event delegation para botones de eliminar
    previewContainer.addEventListener('click', function(e) {
        if (e.target.closest('.remove-evidence-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const button = e.target.closest('.remove-evidence-btn');
            const fileId = button.getAttribute('data-file-id');
            console.log('🎯 Event delegation - Eliminando archivo:', fileId);
            removeEvidence(fileId);
        }
    });
}

/**
 * SOLUCIÓN SIMPLE: Asegura que todos los campos existan en el FormData
 */
function asegurarTodosLosCampos(formData) {
    console.log('🔄 Asegurando todos los campos en FormData...');
    
    // Obtener todos los componentes posibles
    const todosComponentes = new Set();
    const todosTipos = ['derecho', 'izquierdo', 'golpe', 'rayon', 'fisura', 'quebrado', 'pinturaCuarteada', 'otroDano'];
    
    document.querySelectorAll('.damage-checkbox').forEach(checkbox => {
        const componenteId = checkbox.getAttribute('data-componente');
        todosComponentes.add(componenteId);
    });
    
    console.log(`📦 Componentes encontrados: ${todosComponentes.size}`);
    console.log(`🎯 Tipos de daño: ${todosTipos.length}`);
    
    // Para cada combinación componente-tipo, asegurar que existe en formData
    todosComponentes.forEach(componenteId => {
        todosTipos.forEach(tipo => {
            const campoName = `dano_${componenteId}_${tipo}`;
            
            // Verificar si ya existe en el FormData
            const existe = Array.from(formData.entries()).some(([key]) => key === campoName);
            
            if (!existe) {
                // Buscar el checkbox para ver si está marcado
                const checkbox = document.querySelector(`[name="${campoName}"]`);
                const valor = checkbox && checkbox.checked ? '1' : '0';
                
                formData.append(campoName, valor);
                console.log(`➕ Campo agregado: ${campoName} = ${valor}`);
            }
        });
    });
    
    console.log('✅ Todos los campos asegurados en FormData');
}

/**
 * Envía el formulario de walkaround - VERSIÓN CORREGIDA CON SOLUCIÓN SIMPLE
 */
async function enviarWalkaround() {
    console.log('🚀 Iniciando envío de walkaround...');
    console.log('📝 Modo:', isEditMode ? 'EDICIÓN' : 'CREACIÓN');
    
    // Validar que todos los componentes tengan un estado seleccionado
    if (!validarFormulario()) {
        return;
    }

    // Validar que se haya seleccionado una aeronave
    const aeronaveSeleccionada = document.getElementById('aeronaveSeleccionada').value;
    if (!aeronaveSeleccionada) {
        mostrarError('Por favor, selecciona una aeronave.');
        return;
    }

    // Mostrar loading
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('submitButton').disabled = true;
    const spinner = document.querySelector('#submitButton .spinner-border');
    if (spinner) {
        spinner.style.display = 'inline-block';
    }

    try {
        // Crear FormData para enviar el formulario
        const formData = new FormData(document.getElementById('walkaroundForm'));
        const url = document.getElementById('walkaroundForm').action;

        console.log('📤 URL de envío:', url);
        console.log('🛩️ ID Aeronave seleccionada:', aeronaveSeleccionada);

        // En modo edición, el campo de búsqueda está deshabilitado, así que usamos el valor del campo oculto
        formData.append('id_aeronave', aeronaveSeleccionada);

        // ✅ SOLUCIÓN SIMPLE: Asegurar que todos los campos existan
        asegurarTodosLosCampos(formData);
        
        // DIAGNÓSTICO: Verificar específicamente los últimos dos campos
        console.log('🔍 DIAGNÓSTICO - Buscando campos pinturaCuarteada y otroDano:');
        for (let [key, value] of formData.entries()) {
            if (key.includes('pinturaCuarteada') || key.includes('otroDano')) {
                console.log(`  ${key} = ${value}`);
            }
        }

        // ✅ Añadir evidencias generales al FormData
        if (generalEvidenceFiles && generalEvidenceFiles.length > 0) {
            generalEvidenceFiles.forEach(fileObj => {
                formData.append('generalEvidence[]', fileObj.file);
            });
            console.log('📎 Evidencias generales agregadas:', generalEvidenceFiles.length);
        } else {
            console.log('📎 No hay evidencias generales para agregar');
        }

        // DEBUG: Mostrar datos que se enviarán (excluyendo archivos para no saturar la consola)
        console.log('📦 Datos a enviar:');
        for (let [key, value] of formData.entries()) {
            if (key.includes('evidencia') || key.includes('generalEvidence')) {
                console.log(`  ${key}: [ARCHIVO - ${value.name || 'sin nombre'}]`);
            } else {
                console.log(`  ${key}: ${value}`);
            }
        }

        console.log('🔄 Enviando datos al servidor...');
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        console.log('📨 Respuesta recibida, status:', response.status);
        
        // Obtener el texto de la respuesta primero para debuggear
        const responseText = await response.text();
        console.log('📄 Respuesta completa del servidor:', responseText);
        
        let data;
        try {
            // Intentar parsear como JSON
            data = JSON.parse(responseText);
            console.log('📊 Respuesta JSON parseada:', data);
        } catch (parseError) {
            console.error('❌ Error parseando JSON:', parseError);
            console.error('📄 Respuesta que causó el error:', responseText);
            
            // Si no es JSON, verificar si es un mensaje de éxito/error simple
            if (responseText.includes('éxito') || responseText.includes('success') || response.status === 200) {
                // Asumir éxito si la respuesta es positiva aunque no sea JSON
                data = { success: true, message: 'Operación completada exitosamente' };
            } else {
                throw new Error(`El servidor devolvió un formato inesperado: ${responseText.substring(0, 200)}`);
            }
        }
        
        if (data.success) {
            const mensaje = data.message || (isEditMode ? 
                'Walkaround actualizado correctamente.' : 
                'Walkaround creado correctamente.');
                
            console.log('✅ Éxito:', mensaje);
            mostrarExito(mensaje, () => {
                window.location.href = '../../app/views/ver_walkaround.html';
            });
        } else {
            const errorMsg = data.message || data.error || 'Error al procesar el walkaround';
            console.error('❌ Error del servidor:', errorMsg);
            mostrarError(errorMsg);
        }
    } catch (error) {
        console.error('❌ Error en el envío:', error);
        console.error('🔍 Stack trace:', error.stack);
        
        let mensajeError = 'Ocurrió un error al conectar con el servidor. ';
        
        if (error.message.includes('formato inesperado')) {
            mensajeError += 'El servidor devolvió una respuesta inesperada. ';
        }
        
        mensajeError += error.message;
        mostrarError(mensajeError);
    } finally {
        // Ocultar loading SIEMPRE
        console.log('🏁 Finalizando envío...');
        document.getElementById('loading').style.display = 'none';
        document.getElementById('submitButton').disabled = false;
        const spinnerFinal = document.querySelector('#submitButton .spinner-border');
        if (spinnerFinal) {
            spinnerFinal.style.display = 'none';
        }
    }
}

/**
 * Valida que todos los componentes tengan un estado seleccionado
 */
function validarFormulario() {
    console.log('🔍 Validando formulario...');
    
    // Validar aeronave seleccionada
    const aeronaveSeleccionada = document.getElementById('aeronaveSeleccionada').value;
    if (!aeronaveSeleccionada) {
        console.error('❌ No se ha seleccionado aeronave');
        mostrarError('Por favor, selecciona una aeronave.');
        return false;
    }

    // Validar que se haya seleccionado al menos un tipo de walkaround
    const entrada = document.getElementById('entrada').checked;
    const salida = document.getElementById('salida').checked;
    if (!entrada && !salida) {
        console.error('❌ No se ha seleccionado tipo de walkaround');
        mostrarError('Por favor, selecciona al menos un tipo de walkaround (Entrada o Salida).');
        return false;
    }

    // Validar campos obligatorios (sin procedencia y destino)
    const elaboro = document.getElementById('elaboro').value.trim();
    const responsable = document.getElementById('responsable').value.trim();
    const jefeArea = document.getElementById('jefe_area').value.trim();
    const vobo = document.getElementById('vobo').value.trim();
    
    if (!elaboro) {
        mostrarError('El campo "Elaboró" es obligatorio.');
        return false;
    }
    
    if (!responsable) {
        mostrarError('El campo "Responsable" es obligatorio.');
        return false;
    }
    
    if (!jefeArea) {
        mostrarError('El campo "Jefe de Área" es obligatorio.');
        return false;
    }
    
    if (!vobo) {
        mostrarError('El campo "VoBo Gerente FBO" es obligatorio.');
        return false;
    }
    
    console.log('✅ Formulario válido');
    return true;
}

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
 * Muestra error de permisos para eliminar
 */
function mostrarErrorPermisosEliminar() {
    mostrarError('Solo los administradores pueden eliminar walkarounds. Contacta al administrador del sistema.');
}

/**
 * Función auxiliar para verificar permisos de eliminación
 */
function tienePermisosEliminarWalkaround() {
    return permisosSistema.puedeEliminar('walkarounds');
}

/**
 * Actualiza el paginador en la interfaz
 */
function actualizarPaginador() {
    const paginadorContainer = document.getElementById('paginador');
    if (!paginadorContainer) return;
    
    let html = '';
    
    // Información de registros
    const inicio = ((paginaActual - 1) * registrosPorPagina) + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, totalRegistros);
    
    html += `
        <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted">
                Mostrando ${inicio} a ${fin} de ${totalRegistros} registros
            </div>
            <nav aria-label="Paginación de walkarounds">
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
    const paginasAMostrar = 5; // Número máximo de páginas a mostrar en el paginador
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
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPagina(1)">1</a>
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
        cargarWalkarounds(pagina);
    }
}

/**
 * Muestra modal de confirmación para eliminar
 * @param {string} id - ID del walkaround a eliminar
 */
function mostrarConfirmacionEliminar(id) {
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    if (modalBody && confirmModal && confirmBtn) {
        modalBody.textContent = '¿Estás seguro de que quieres eliminar este walkaround? Esta acción no se puede deshacer.';
        confirmBtn.setAttribute('data-id', id);
        confirmModal.show();
    } else {
        // Fallback al confirm tradicional
        if (confirm('¿Estás seguro de que quieres eliminar este walkaround?')) {
            eliminarWalkaroundConfirmada(id);
        }
    }
}


/**
 * Función auxiliar para agregar todas las evidencias al FormData
 */
function agregarEvidenciasAlFormData(formData) {
    // Agregar evidencias generales
    generalEvidenceFiles.forEach(fileObj => {
        formData.append('generalEvidence[]', fileObj.file);
    });
    
    // Agregar evidencias de componentes (ya están en el FormData por el formulario)
    // Esta función asegura que las evidencias generales también se envíen
    return formData;
}

function mostrarErrorPermisosEliminar() {
    mostrarError('Solo los administradores pueden eliminar walkarounds. Contacta al administrador del sistema.');
}


/**
 * Elimina un walkaround de la base de datos (muestra confirmación primero).
 */
function eliminarWalkaround(id) {
    // Verificación de permisos
    if (!permisosSistema.puedeEliminar('walkarounds')) {
        mostrarErrorPermisosEliminar();
        return;
    }
    
    mostrarConfirmacionEliminar(id);
}

/**
 * Función que ejecuta la eliminación después de la confirmación
 */
function eliminarWalkaroundConfirmada(id) {
    // Cerrar inmediatamente el modal de confirmación
    if (confirmModal) {
        confirmModal.hide();
    }
    
    // Pequeño delay para asegurar el cierre del modal
    setTimeout(() => {
        const formData = new FormData();
        formData.append('id_walk', id);

        fetch('/Eolo/app/controllers/walkaround_eliminar.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarExito(data.success, () => {
                    cargarWalkarounds();
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
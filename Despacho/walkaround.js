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

// Componentes predefinidos para cada tipo de aeronave
const componentesPorTipo = {
    avion: [
        { id: 'radomo', nombre: 'Radomo', seccion: 'Avion' },
        { id: 'parabrisas', nombre: 'Parabrisas/Limpiadores', seccion: 'Avion' },
        { id: 'tubos_pitot', nombre: 'Tubos Pitot', seccion: 'Avion' },
        { id: 'tren_nariz', nombre: 'Tren de Nariz (Llantas,Luces,Fugas)', seccion: 'Avion' },
        { id: 'fuselaje_izq', nombre: 'Fuselaje Izquierdo (Antenas,Luces,Ventanillas)', seccion: 'Avion' },
        { id: 'puerta_acceso_cabina', nombre: 'Puerta de Acceso a cabina (Escalera,Barandillas,Marco)', seccion: 'Avion' },
        { id: 'antenas', nombre: 'Antenas', seccion: 'Avion' },
        { id: 'semiala_izq', nombre: 'Semiala Izquierda (Bordes, winglet, estaticas, sup. de control)', seccion: 'Avion' },
        { id: 'tren_principal_izq', nombre: 'Tren Principal Izquierdo (Llantas,Fugas)', seccion: 'Avion' },
        { id: 'compartimiento_carga', nombre: 'Compartimiento de Carga (Exterior e Interior)', seccion: 'Avion' },
        { id: 'empenaje', nombre: 'Empenaje (Bordes, estaticas, superficies de control)', seccion: 'Avion' },
        { id: 'semiala_der', nombre: 'Semiala Derecha (Bordes, winglet, estaticas, sup. de control)', seccion: 'Avion' },
        { id: 'tren_principal_der', nombre: 'Tren Principal Derecho (Llantas, Fugas)', seccion: 'Avion' },
        { id: 'valvulas_servicio', nombre: 'Válvulas de Servicio (Combustible, agua, libre de fugas)', seccion: 'Avion' },
        { id: 'motores', nombre: 'Motores (Crowling, carenados)', seccion: 'Avion' },
        { id: 'fuselaje_der', nombre: 'Fuselaje Derecho (Antenas, luces, ventanillas)', seccion: 'Avion' },
        { id: 'registros_servicios', nombre: 'Registros de Servicios', seccion: 'Avion' }
    ],
    helicoptero: [
        { id: 'fuselaje', nombre: 'Fuselaje (Puertas, ventanas, antenas, luces)', seccion: 'Helicoptero' },
        { id: 'esqui_neumaticos', nombre: 'Esquí/Neumáticos', seccion: 'Helicoptero' },
        { id: 'palas', nombre: 'Palas', seccion: 'Helicoptero' },
        { id: 'boom', nombre: 'Boom', seccion: 'Helicoptero' },
        { id: 'estabilizadores', nombre: 'Estabilizadores', seccion: 'Helicoptero' },
        { id: 'rotor_cola', nombre: 'Rotor de Cola', seccion: 'Helicoptero' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar modales de Bootstrap SOLO si existen
    if (typeof bootstrap !== 'undefined') {
        // Inicializar solo los modales que existen
        const initModalIfExists = (modalId, modalVariable) => {
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                modalVariable = new bootstrap.Modal(modalElement);
            }
        };
        
        initModalIfExists('successModal', successModal);
        initModalIfExists('errorModal', errorModal);
        initModalIfExists('confirmModal', confirmModal);
    }
    // Si estamos en la página de lista, cargar walkarounds
    if (document.getElementById('tablaWalkarounds')) {
        cargarWalkarounds();
    }

    // Si estamos en el formulario de walkaround
if (document.getElementById('walkaroundForm')) {
    // Comprobar si hay un ID en la URL para modo edición
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (id) {
        // Modo edición
        configurarModoEdicion(id);
    } else {
        // Modo creación - establecer fecha/hora actual
        const now = new Date();
        const formatted = now.toISOString().slice(0,16);
        document.getElementById('fechaHora').value = formatted;
        
        // Asegurar que la acción sea para creación
        document.getElementById('walkaroundForm').action = 'procesar_walkaround.php';
    }
        
        // Cargar aeronaves para el selector
        cargarAeronavesParaSelector();
        
        // Configurar envío del formulario
document.getElementById('walkaroundForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // En modo edición, usar el nuevo script de actualización
    if (isEditMode) {
        enviarWalkaround();
    } else {
        // En modo creación, usar el procesamiento normal
        enviarWalkaround();
    }
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
 * Configura el filtro de búsqueda de aeronaves
 */
function configurarBusquedaAeronaves() {
    const inputBusqueda = document.getElementById('buscarAeronave');
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    
    if (!inputBusqueda) return;
    
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
    
    // Filtrar aeronaves que coincidan con la búsqueda
    const resultados = aeronavesData.filter(aeronave => {
        const matricula = aeronave.Matricula || '';
        return matricula.toLowerCase().includes(termino.toLowerCase());
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
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${aeronave.Matricula}</strong>
                        <br>
                        <small class="text-muted">
                            ${aeronave.Equipo || 'Sin equipo'} - ${aeronave.Tipo}
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
    
    // Cargar componentes según el tipo de aeronave
    cargarComponentes(tipo);
    
    console.log('Aeronave seleccionada:', aeronave.Matricula, 'ID:', aeronave.Id_Aeronave);
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
 * Configura el formulario en modo edición
 */
function configurarModoEdicion(id) {
    isEditMode = true;
    document.title = 'Editar Walkaround - Inspección de Componentes';
    
    // Actualizar el título del formulario
    const formTitle = document.querySelector('.form-title');
    if (formTitle) {
        formTitle.innerHTML = '<i class="fas fa-clipboard-check"></i> Editar Walkaround';
    }
    
    // Cambiar texto del botón de envío
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display: none;"></span> Actualizar Inspección';
        submitButton.classList.remove('btn-primary');
        submitButton.classList.add('btn-warning');
    }
    
    // Cambiar acción del formulario
    document.getElementById('walkaroundForm').action = 'walkaround_actualizar.php';
    
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
    
    console.log('🔄 Configurando modo edición para ID:', id);
    
    // Cargar datos del walkaround
    cargarWalkaround(id);
}

/**
 * Carga evidencias existentes en modo edición
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
    
    // ⭐⭐ CORRECCIÓN: Limpiar solo si no hay evidencias existentes ya mostradas
    const existingEvidences = previewContainer.querySelectorAll('.existing-evidence');
    if (existingEvidences.length === 0) {
        previewContainer.innerHTML = ''; // Solo limpiar si no hay existentes
    }
    
    evidencias.forEach(evidencia => {
        // Verificar si ya existe esta evidencia en el DOM
        const existingElement = document.getElementById('evidence-existente-' + evidencia.Id_Evidencia);
        if (existingElement) {
            console.log('ℹ️ Evidencia ya existe en el DOM:', evidencia.Id_Evidencia);
            return; // Saltar si ya existe
        }
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'evidence-item existing-evidence';
        itemDiv.id = 'evidence-existente-' + evidencia.Id_Evidencia;
        
        // Determinar si es imagen o video
        const fileName = evidencia.FileName || evidencia.Ruta || '';
        const isImage = fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
        
        if (isImage && evidencia.Ruta) {
            const img = document.createElement('img');
            img.src = evidencia.Ruta;
            img.className = 'evidence-preview';
            img.onerror = function() {
                // Si falla la carga, mostrar un icono
                this.style.display = 'none';
                const icon = document.createElement('i');
                icon.className = 'fas fa-file-image evidence-preview';
                itemDiv.appendChild(icon);
            };
            itemDiv.appendChild(img);
        } else {
            const icon = document.createElement('i');
            icon.className = 'fas fa-file-video evidence-preview';
            itemDiv.appendChild(icon);
        }
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = fileName;
        nameSpan.className = 'file-name';
        nameSpan.title = `ID: ${evidencia.Id_Evidencia}`;
        
        itemDiv.appendChild(nameSpan);
        
        // Agregar indicador de que es una evidencia existente
        const existenteBadge = document.createElement('span');
        existenteBadge.className = 'badge bg-info ms-2';
        existenteBadge.textContent = 'Existente';
        itemDiv.appendChild(existenteBadge);
        
        previewContainer.appendChild(itemDiv);
    });
    
    console.log('✅ Evidencias existentes cargadas:', evidencias.length);
}

/**
 * Carga datos del walkaround en modo edición - VERSIÓN CON DEBUGGEO COMPLETO
 */
async function cargarWalkaround(id) {
    console.log('🔍 Iniciando carga de walkaround ID:', id);
    document.getElementById('loading').style.display = 'flex';
    
    try {
        console.log('📡 Haciendo fetch a walkaround_leer_id.php...');
        const response = await fetch(`walkaround_leer_id.php?id=${id}`);
        
        console.log('📨 Respuesta recibida, status:', response.status);
        
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        console.log('📋 Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Respuesta del servidor (no JSON):', text);
            throw new Error('El servidor devolvió un formato incorrecto: ' + text.substring(0, 200));
        }
        
        const data = await response.json();
        console.log('📊 Datos COMPLETOS recibidos del servidor:', data);
        
        // Verificar si hay error en la respuesta JSON
        if (data.error) {
            console.error('❌ Error en respuesta JSON:', data.error);
            throw new Error(data.error);
        }
        
        // Validar que los datos existan
        if (!data) {
            throw new Error('No se recibieron datos del servidor');
        }
        
        console.log('✅ Estructura de datos recibida:');
        console.log('  - Campos principales:', Object.keys(data));
        console.log('  - Número de componentes:', data.componentes ? data.componentes.length : 0);
        console.log('  - Número de evidencias:', data.evidencias ? data.evidencias.length : 0);
        console.log('  - Tipo de aeronave:', data.Tipo);
        
        if (data.componentes && data.componentes.length > 0) {
            console.log('📦 Primer componente como ejemplo:', data.componentes[0]);
        }

        // ⭐⭐ Cargar aeronaves primero para poder mostrar la información ⭐⭐
        await cargarAeronavesParaSelector();
        
        // Llenar el formulario con los datos
        console.log('🖊️ Llenando formulario...');
        
        // Fecha y Hora
        if (data.FechaHora) {
            const fechaHoraValue = data.FechaHora.replace(' ', 'T');
            document.getElementById('fechaHora').value = fechaHoraValue;
            console.log('📅 Fecha asignada:', fechaHoraValue);
        }
        
        // Aeronave
        const aeronaveSeleccionadaInput = document.getElementById('aeronaveSeleccionada');
        if (aeronaveSeleccionadaInput) {
            aeronaveSeleccionadaInput.value = data.Id_Aeronave || '';
            console.log('🛩️ ID Aeronave asignado al campo oculto:', data.Id_Aeronave);
        } else {
            console.error('❌ No se encontró el campo oculto aeronaveSeleccionada');
        }
        
        const buscarAeronaveInput = document.getElementById('buscarAeronave');
        if (buscarAeronaveInput && data.Matricula) {
            buscarAeronaveInput.value = data.Matricula;
            console.log('🔍 Matrícula asignada al campo de búsqueda:', data.Matricula);
        }
        
        // Campos de texto
        document.getElementById('elaboro').value = data.Elaboro || '';
        document.getElementById('responsable').value = data.Responsable || '';
        document.getElementById('jefe_area').value = data.JefeArea || '';
        document.getElementById('vobo').value = data.VoBo || '';
        document.getElementById('observacionesGenerales').value = data.observaciones || '';
        document.getElementById('procedencia').value = data.Procedencia || '';
        document.getElementById('destino').value = data.Destino || '';
        
        console.log('✅ Formulario base llenado correctamente');
        
        // Mostrar información de la aeronave
        if (data.Id_Aeronave) {
            console.log('👁️ Mostrando información de aeronave para ID:', data.Id_Aeronave);
            
            const aeronaveEnModoEdicion = aeronavesData.find(a => a.Id_Aeronave == data.Id_Aeronave);
            
            if (aeronaveEnModoEdicion) {
                console.log('📋 Información de aeronave encontrada en aeronavesData:', aeronaveEnModoEdicion);
                mostrarInfoAeronaveEnModoEdicion(
                    aeronaveEnModoEdicion.Matricula,
                    aeronaveEnModoEdicion.Equipo
                );
            } else {
                console.warn('⚠️ No se encontró la aeronave en aeronavesData, usando datos del walkaround');
                mostrarInfoAeronaveEnModoEdicion(
                    data.Matricula,
                    data.Equipo
                );
            }
        }
        
        // Deshabilitar el campo de búsqueda en modo edición
        const buscarAeronave = document.getElementById('buscarAeronave');
        if (buscarAeronave) {
            buscarAeronave.disabled = true;
            buscarAeronave.title = "No se puede cambiar la aeronave en modo edición";
            console.log('🔒 Campo de búsqueda de aeronave deshabilitado');
        }
        
        // Cargar evidencias existentes
        if (data.evidencias && data.evidencias.length > 0) {
            console.log('📸 Cargando evidencias existentes:', data.evidencias);
            cargarEvidenciasExistentes(data.evidencias);
        } else {
            console.log('ℹ️ No hay evidencias existentes para este walkaround');
        }
        
        // Cargar componentes - ¡ESTA ES LA PARTE IMPORTANTE!
        const tipo = data.Tipo ? data.Tipo.toLowerCase() : 'avion';
        console.log('✈️ Iniciando carga de componentes para tipo:', tipo);
        console.log('📦 Datos de componentes a pasar:', data.componentes);
        
        cargarComponentes(tipo, data.componentes || []);
        
        console.log('🎉 Carga de walkaround completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error al cargar walkaround:', error);
        console.error('🔍 Stack trace:', error.stack);
        mostrarError('Error al cargar los datos: ' + error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
        console.log('🏁 Función cargarWalkaround finalizada');
    }
}

/**
 * ⭐⭐ NUEVA FUNCIÓN: Muestra información de aeronave en modo edición ⭐⭐
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
 * Carga aeronaves para el selector - VERSIÓN MODIFICADA
 */
async function cargarAeronavesParaSelector() {
    console.log('Intentando cargar aeronaves...');
    try {
        const response = await fetch('obtener_aeronaves.php');
        console.log('Respuesta de obtener_aeronaves.php:', response);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const aeronaves = await response.json();
        console.log('Aeronaves recibidas:', aeronaves);
        
        aeronavesData = aeronaves;
        
        // Configurar el filtro de búsqueda después de cargar las aeronaves
        configurarBusquedaAeronaves();
        
        console.log('Aeronaves cargadas correctamente y filtro configurado');
        
    } catch (error) {
        console.error('Error al cargar aeronaves:', error);
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
 * Carga componentes según el tipo de aeronave - VERSIÓN ROBUSTA
 */
function cargarComponentes(tipoAeronave, componentesGuardados = []) {
    console.log('🔄 cargarComponentes iniciado');
    console.log('📋 Parámetros recibidos:', { tipoAeronave, componentesGuardados });
    
    const componentesContainer = document.getElementById('componentesContainer');
    
    if (!componentesContainer) {
        console.error('❌ ERROR CRÍTICO: No se encontró el contenedor de componentes');
        return;
    }
    
    const componentes = componentesPorTipo[tipoAeronave];
    
    if (!componentes) {
        console.error('❌ No se encontraron componentes para tipo:', tipoAeronave);
        console.log('📚 Tipos disponibles:', Object.keys(componentesPorTipo));
        componentesContainer.innerHTML = '<div class="alert alert-warning">No hay componentes definidos para este tipo de aeronave.</div>';
        return;
    }
    
    console.log('✅ Componentes del tipo encontrados:', componentes.length);
    
    // Verificar la estructura de componentesGuardados
    console.log('🔍 Analizando componentes guardados:');
    componentesGuardados.forEach((comp, index) => {
        console.log(`  Componente ${index + 1}:`, comp);
    });

    // Agrupar componentes por sección
    const secciones = {};
    componentes.forEach(componente => {
        if (!secciones[componente.seccion]) {
            secciones[componente.seccion] = [];
        }
        secciones[componente.seccion].push(componente);
    });
    
    console.log('📂 Secciones a generar:', Object.keys(secciones));
    
    // Construir HTML para las secciones y componentes
    let html = '';
    let componentesProcesados = 0;
    
    for (const seccion in secciones) {
        html += `
            <div class="component-section">
                <div class="section-title">${seccion}</div>
                <div class="component-grid">
        `;
        
        secciones[seccion].forEach(componente => {
            // Buscar si este componente tiene datos guardados
            const componenteGuardado = componentesGuardados.find(c => {
                // Múltiples formas de comparar por si hay diferencias en los nombres de campo
                const coincide = c.Componente == componente.id || 
                               c.Identificador_Componente == componente.id ||
                               c.componente == componente.id;
                
                if (coincide) {
                    console.log(`✅ Coincidencia encontrada para ${componente.id}:`, c);
                }
                return coincide;
            });

            console.log(`🔍 Procesando componente "${componente.id}":`, {
                encontrado: !!componenteGuardado,
                datos: componenteGuardado
            });

            // ⭐⭐ CORRECCIÓN: Manejar diferentes tipos de datos para Estado
            let estado = '1'; // Por defecto "Sin daño"
            let observaciones = '';
            
            if (componenteGuardado) {
                // Convertir Estado a string para comparación consistente
                if (componenteGuardado.Estado !== undefined && componenteGuardado.Estado !== null) {
                    estado = componenteGuardado.Estado.toString();
                }
                observaciones = componenteGuardado.Observaciones || '';
                
                console.log(`📊 Estado final para ${componente.id}:`, estado);
            }
            
            const checkedSinDano = estado === '1' ? 'checked' : '';
            const checkedConDano = estado === '2' ? 'checked' : '';
            const displayOpciones = estado === '2' ? 'display:block;' : 'display:none;';
            
            html += `
                <div class="component-card" id="componente-${componente.id}">
                    <h5>${componente.nombre}</h5>
                    
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="estado_${componente.id}" 
                            id="estado_ok_${componente.id}" value="1" 
                            ${checkedSinDano} required>
                        <label class="form-check-label" for="estado_ok_${componente.id}">
                            Sin daño
                        </label>
                    </div>
                    
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="estado_${componente.id}" 
                            id="estado_damage_${componente.id}" value="2"
                            ${checkedConDano}>
                        <label class="form-check-label" for="estado_damage_${componente.id}">
                            Con daño
                        </label>
                    </div>
                    
                    <div class="damage-options" id="opciones_dano_${componente.id}" 
                        style="${displayOpciones}">
                        <div class="form-group mt-2">
                            <label for="observaciones_${componente.id}" class="form-label">Observaciones:</label>
                            <textarea class="form-control" id="observaciones_${componente.id}" 
                                name="observaciones_${componente.id}" rows="2" 
                                placeholder="Describa el daño encontrado">${observaciones}</textarea>
                        </div>
                        <div class="form-group mt-2">
                            <label for="evidencia_${componente.id}" class="form-label">Subir evidencia:</label>
                            <input type="file" class="form-control" id="evidencia_${componente.id}" 
                                name="evidencia_${componente.id}" accept="image/*,video/*">
                            
                            ${componenteGuardado && componenteGuardado.Id_Evidencia ? `
                                <div class="mt-1">
                                    <small class="text-success">
                                        <i class="fas fa-paperclip"></i> Evidencia existente (ID: ${componenteGuardado.Id_Evidencia})
                                    </small>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            componentesProcesados++;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    console.log(`📝 Generando HTML para ${componentesProcesados} componentes...`);
    componentesContainer.innerHTML = html;
    console.log('✅ HTML de componentes generado correctamente');
    
    // Configurar eventos para los radio buttons
    const radios = document.querySelectorAll('.form-check-input');
    console.log(`🎛️ Configurando eventos para ${radios.length} radio buttons...`);
    
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            const name = this.getAttribute('name');
            const componenteId = name.replace('estado_', '');
            const opcionesDano = document.getElementById(`opciones_dano_${componenteId}`);
            
            if (this.value === '2') {
                opcionesDano.style.display = 'block';
            } else {
                opcionesDano.style.display = 'none';
            }
        });
    });

    // Aplicar estilos visuales
    setTimeout(() => {
        componentes.forEach(componente => {
            const componenteCard = document.getElementById(`componente-${componente.id}`);
            if (componenteCard) {
                componenteCard.classList.add('estado-seleccionado');
            }
        });
    }, 100);
    
    console.log('🎉 Función cargarComponentes completada exitosamente');
}

/**
 * Maneja la selección de evidencias generales
 */
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
 * Actualiza el input de evidencias
 */
function updateEvidenceInput() {
    // Crear un nuevo DataTransfer para los archivos
    const dataTransfer = new DataTransfer();
    
    // Agregar los archivos que quedan
    generalEvidenceFiles.forEach(f => {
        dataTransfer.items.add(f.file);
    });
    
    // Actualizar el input de archivos
    document.getElementById('generalEvidence').files = dataTransfer.files;
}

/**
 * Maneja la selección de evidencias generales - VERSIÓN CORREGIDA
 */
function handleGeneralEvidenceSelect(files) {
    console.log('📁 Archivos seleccionados:', files);
    
    if (!files || files.length === 0) {
        console.log('⚠️ No se seleccionaron archivos');
        return;
    }
    
    const previewContainer = document.getElementById('evidencePreview');
    if (!previewContainer) {
        console.error('❌ No se encontró el contenedor de preview');
        return;
    }
    
    // Convertir FileList a Array
    const nuevosArchivos = Array.from(files);
    
    nuevosArchivos.forEach(file => {
        // Verificar si el archivo ya existe
        const existe = generalEvidenceFiles.some(f => 
            f.file.name === file.name && f.file.size === file.size
        );
        
        if (!existe) {
            const fileId = Date.now() + Math.random();
            const fileObj = {
                id: fileId,
                file: file
            };
            
            generalEvidenceFiles.push(fileObj);
            
            // Crear elemento de preview
            const itemDiv = document.createElement('div');
            itemDiv.className = 'evidence-item';
            itemDiv.id = 'evidence-item-' + fileId;
            
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.className = 'evidence-preview';
                itemDiv.appendChild(img);
            } else if (file.type.startsWith('video/')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-file-video evidence-preview';
                itemDiv.appendChild(icon);
            } else {
                const icon = document.createElement('i');
                icon.className = 'fas fa-file evidence-preview';
                itemDiv.appendChild(icon);
            }
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = file.name;
            nameSpan.className = 'file-name';
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn btn-sm btn-danger remove-evidence';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.onclick = () => removeEvidence(fileId);
            
            itemDiv.appendChild(nameSpan);
            itemDiv.appendChild(removeBtn);
            previewContainer.appendChild(itemDiv);
        }
    });
    
    // Actualizar el input
    updateEvidenceInput();
    
    console.log('📦 Estado actual de evidencias:', generalEvidenceFiles.length, 'archivos');
}

/**
 * Envía el formulario de walkaround - VERSIÓN CORREGIDA Y ROBUSTA
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
                window.location.href = 'ver_walkaround.html';
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

    // Validar que todos los componentes tengan un estado seleccionado
    const radios = document.querySelectorAll('.form-check-input');
    let todosSeleccionados = true;
    let componentesSinSeleccionar = [];
    
    radios.forEach(radio => {
        const name = radio.getAttribute('name');
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        if (!checked) {
            todosSeleccionados = false;
            const componenteId = name.replace('estado_', '');
            componentesSinSeleccionar.push(componenteId);
            const componenteCard = document.getElementById(`componente-${componenteId}`);
            if (componenteCard) {
                componenteCard.style.borderColor = 'red';
            }
        }
    });
    
    if (!todosSeleccionados) {
        console.error('❌ Componentes sin seleccionar:', componentesSinSeleccionar);
        mostrarError('Por favor, verifica el estado de todos los componentes antes de enviar.');
        return false;
    }
    
    console.log('✅ Formulario válido');
    return true;
}

/**
 * Muestra modal de éxito
 */
function mostrarExito(mensaje, callback = null) {
    const modalBody = document.getElementById('successModalBody');
    if (modalBody && successModal) {
        modalBody.textContent = mensaje;
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
 * Carga la lista de walkarounds con paginación
 */
async function cargarWalkarounds(pagina = 1) {
    const tablaBody = document.querySelector('#tablaWalkarounds tbody');
    tablaBody.innerHTML = '<tr><td colspan="10" class="text-center">Cargando...</td></tr>';

    try {
        console.log(`🔄 Cargando walkarounds página ${pagina}...`);
        const response = await fetch(`leer_walkaround.php?pagina=${pagina}&registros_por_pagina=${registrosPorPagina}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos recibidos:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }

        const walkarounds = data.walkarounds;
        paginaActual = data.paginacion.pagina_actual;
        totalPaginas = data.paginacion.total_paginas;
        totalRegistros = data.paginacion.total_registros;

        tablaBody.innerHTML = '';
        
        if (walkarounds.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="10" class="text-center">No hay walkarounds registrados.</td></tr>';
        } else {
            walkarounds.forEach((walkaround) => {
                console.log(`📝 Procesando walkaround ID ${walkaround.Id_Walk}:`, walkaround);
                
                const fila = document.createElement('tr');
                
                // Manejo seguro de campos
                const matricula = walkaround.Matricula || 'No especificada';
                const equipo = walkaround.Equipo || 'No especificado';
                const procedencia = walkaround.Procedencia || 'No especificada';
                const destino = walkaround.Destino || 'No especificada';
                const elaboro = walkaround.Elaboro || 'No especificado';
                const responsable = walkaround.Responsable || 'No especificado';
                
                // Formatear fecha
                let fechaFormateada = 'Fecha no válida';
                try {
                    if (walkaround.Fechahora) {
                        fechaFormateada = new Date(walkaround.Fechahora).toLocaleString();
                    }
                } catch (e) {
                    console.warn('Error al formatear fecha:', e);
                }
                
                fila.innerHTML = `
                    <td>${walkaround.Id_Walk}</td>
                    <td>${fechaFormateada}</td>
                    <td>${matricula}</td>
                    <td>${equipo}</td>
                    <td>${procedencia}</td>
                    <td>${destino}</td>
                    <td>${elaboro}</td>
                    <td>${responsable}</td>
                    
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <a href="detalle_walkaround.html?id=${walkaround.Id_Walk}" 
                               class="btn btn-info" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </a>
                            <a href="pdf_generator.php?tipo=walkaround&id=${walkaround.Id_Walk}" 
                               class="btn btn-danger" title="Generar PDF" target="_blank">
                                <i class="fas fa-file-pdf"></i>
                            </a>
                            <a href="componenteWk.html?id=${walkaround.Id_Walk}" 
                               class="btn btn-warning" title="Editar">
                                <i class="fas fa-edit"></i>
                            </a>
                            <button class="btn btn-danger" 
                                    onclick="eliminarWalkaround(${walkaround.Id_Walk})" 
                                    title="Eliminar">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
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
 */
function mostrarConfirmacionEliminar(id) {
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    if (modalBody && confirmModal && confirmBtn) {
        modalBody.textContent = '¿Estás seguro de que quieres eliminar este walkaround? Esta acción no se puede deshacer.';
        confirmBtn.setAttribute('data-id', id);
        confirmModal.show();
    } else {
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


/**
 * Elimina un walkaround de la base de datos (muestra confirmación primero).
 */
function eliminarWalkaround(id) {
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

        fetch('walkaround_eliminar.php', {
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
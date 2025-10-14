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
    }

    // Si estamos en el formulario de walkaround
    if (document.getElementById('walkaroundForm')) {
        // ⭐⭐ PRIMERO: Cargar aeronaves para el selector (SIEMPRE, en ambos modos)
        cargarAeronavesParaSelector();
        
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

function debugFormData(formData) {
    console.log('🔍 DEBUG FormData:');
    for (let [key, value] of formData.entries()) {
        if (key.startsWith('dano_')) {
            console.log(`  ${key} = ${value}`);
        }
    }
    
    // Contar por componente
    const componentes = {};
    for (let [key, value] of formData.entries()) {
        if (key.startsWith('dano_')) {
            const parts = key.split('_');
            if (parts.length >= 3) {
                const compId = parts[1];
                if (!componentes[compId]) componentes[compId] = 0;
                componentes[compId]++;
            }
        }
    }
    
    console.log('📊 Campos por componente:', componentes);
}

/**
 * Carga la lista de walkarounds con paginación y permisos
 */
async function cargarWalkarounds(pagina = 1) {
    const tablaBody = document.querySelector('#tablaWalkarounds tbody');
    tablaBody.innerHTML = '<tr><td colspan="10" class="text-center">Cargando...</td></tr>';

    try {
        console.log(`🔄 Cargando walkarounds página ${pagina}...`);
        const response = await fetch(`/Eolo/app/models/leer_walkaround.php?pagina=${pagina}&registros_por_pagina=${registrosPorPagina}`);
        
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
            // ⭐⭐ AQUÍ ESTÁ EL CAMBIO - Sacar esta línea fuera del forEach
            const usuarioActual = permisosSistema.usuario.nombre;
            
            walkarounds.forEach((walkaround) => {
                console.log(`📝 Procesando walkaround ID ${walkaround.Id_Walk}:`, walkaround);
                
                // ⭐⭐ AQUÍ VA EL CÓDIGO NUEVO - Dentro del forEach
                // Mismo enfoque que entregas_turno
                const esPropietario = walkaround.Elaboro === usuarioActual;
                const puedeEditar = permisosSistema.puedeEditar('walkarounds', walkaround);
                const puedeEliminar = permisosSistema.puedeEliminar('walkarounds');
                
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
                    <td>
                        ${elaboro}
                        ${esPropietario ? '<span class="badge bg-primary ms-1">Tuyo</span>' : ''}
                    </td>
                    <td>${responsable}</td>
                    
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <!-- Botón Ver Detalles -->
                            <a href="/eolo/app/views/detalle_walkaround.html?id=${walkaround.Id_Walk}" 
                               class="btn btn-info" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </a>
                            
                            <!-- Botón Generar PDF -->
                            <a href="../app/helpers/pdf_generator.php?tipo=walkaround&id=${walkaround.Id_Walk}" 
                               class="btn btn-danger" title="Generar PDF" target="_blank">
                                <i class="fas fa-file-pdf"></i>
                            </a>
                            
                            <!-- Botón Editar (con permisos) -->
                            <a href="../app/views/componenteWk.html?id=${walkaround.Id_Walk}" 
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
async function cargarAeronavesParaSelector() {
    console.log('🛩️ Intentando cargar aeronaves para selector...');
    
    try {
        const response = await fetch('../../app/models/obtener_aeronaves.php');
        console.log('📨 Respuesta de obtener_aeronaves.php:', response);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const aeronaves = await response.json();
        console.log('📊 Aeronaves recibidas:', aeronaves);
        
        aeronavesData = aeronaves;
        
        // ⭐⭐ CONFIGURAR EL FILTRO DE BÚSQUEDA (siempre, en ambos modos)
        configurarBusquedaAeronaves();
        
        console.log('✅ Aeronaves cargadas correctamente y filtro configurado');
        
    } catch (error) {
        console.error('❌ Error al cargar aeronaves:', error);
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
 * Llena el formulario con los datos del walkaround - VERSIÓN MEJORADA
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
    
    // ⭐⭐ SEGUNDO: Llenar los campos básicos del formulario
    if (data.Fechahora) {
        // Formatear la fecha para el input datetime-local
        const fecha = new Date(data.Fechahora);
        const fechaFormateada = fecha.toISOString().slice(0, 16);
        document.getElementById('fechaHora').value = fechaFormateada;
    }
    
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
    
    console.log('✅ Formulario llenado correctamente');
}


/**
 * Carga componentes según el tipo de aeronave - VERSIÓN MEJORADA
 */
function cargarComponentes(tipoAeronave, componentesGuardados = {}) {
    console.log('🔄 cargarComponentes iniciado');
    console.log('📦 Componentes guardados recibidos:', componentesGuardados);
    
    const componentesContainer = document.getElementById('componentesContainer');
    
    if (!componentesContainer) {
        console.error('❌ ERROR CRÍTICO: No se encontró el contenedor de componentes');
        return;
    }
    
    const secciones = componentesPorTipo[tipoAeronave];
    
    if (!secciones || Object.keys(secciones).length === 0) {
        console.error('❌ No se encontraron componentes para tipo:', tipoAeronave);
        componentesContainer.innerHTML = '<div class="alert alert-warning">No hay componentes definidos para este tipo de aeronave.</div>';
        return;
    }
    
    console.log('✅ Secciones encontradas:', Object.keys(secciones));
    
    let html = '';
    let componentesProcesados = 0;

    // Generar cada sección (A, B, D, E)
    for (const letraSeccion in secciones) {
        const componentesSeccion = secciones[letraSeccion];
        
        if (componentesSeccion.length > 0) {
            html += `
                <div class="section-container mb-4">
                    <div class="section-header">
                        <h5 class="mb-0 text-center">SECCIÓN ${letraSeccion}</h5>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-bordered table-sm component-table">
                            <tbody>
            `;
            
            componentesSeccion.forEach(componente => {
                //Obtener datos del componente guardado
                const estadoGuardado = componentesGuardados[componente.id] || {
                    derecho: false,
                    izquierdo: false,
                    golpe: false,
                    rayon: false,
                    fisura: false,
                    quebrado: false,
                    pinturaCuarteada: false,
                    otroDano: false
                };

                console.log(`🎯 Componente ${componente.id} - Estado:`, estadoGuardado);

                html += `
                    <tr class="component-row" id="fila-${componente.id}">
                        <td class="component-name" style="width: 25%">
                            <strong>${componente.nombre}</strong>
                        </td>
                `;

                // Generar checkboxes para cada tipo de daño
                tiposDano.forEach(tipoDano => {
                    const checked = estadoGuardado[tipoDano.id] ? 'checked' : '';
                    html += `
                        <td class="text-center" style="width: 8%">
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
                </div>
            `;
        }
    }
    
    console.log(`📝 Generando HTML para ${componentesProcesados} componentes...`);
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
    });

    // Aplicar estilos iniciales basados en los checkboxes marcados
    setTimeout(() => {
        console.log('🎨 Aplicando estilos iniciales a componentes con daños...');
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const componenteId = checkbox.getAttribute('data-componente');
                const filaComponente = document.getElementById(`fila-${componenteId}`);
                if (filaComponente) {
                    filaComponente.classList.add('table-warning');
                    filaComponente.classList.add('has-damage');
                    console.log(`✅ Fila resaltada: ${componenteId}`);
                }
            }
        });
        
        // Contar componentes con daños
        const componentesConDanos = document.querySelectorAll('.has-damage');
        console.log(`📊 Componentes con daños detectados: ${componentesConDanos.length}`);
    }, 100);
    
    console.log('✅ Función cargarComponentes completada exitosamente');
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
 * Carga la lista de walkarounds con paginación y permisos
 */
async function cargarWalkarounds(pagina = 1) {
    const tablaBody = document.querySelector('#tablaWalkarounds tbody');
    tablaBody.innerHTML = '<tr><td colspan="10" class="text-center">Cargando...</td></tr>';

    try {
        console.log(`🔄 Cargando walkarounds página ${pagina}...`);
        const response = await fetch(`/Eolo/app/models/leer_walkaround.php?pagina=${pagina}&registros_por_pagina=${registrosPorPagina}`);
        
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
                    <td>
                        ${elaboro}
                        ${esPropietario ? '<span class="badge bg-primary ms-1">Tuyo</span>' : ''}
                    </td>
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
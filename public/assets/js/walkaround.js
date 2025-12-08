let successModal = null;
let errorModal = null;
let confirmModal = null;

let aeronavesData = [];
let generalEvidenceFiles = [];
let walkaroundData = null;
let isEditMode = false;

let paginaActual = 1;
const registrosPorPagina = 15;
let totalPaginas = 1;
let totalRegistros = 0;

let timeoutBusqueda = null;

let filtrosActivosWalkaround = {
    fecha: '',
    matricula: '',
    movimiento: ''
};

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
    if (typeof bootstrap !== 'undefined') {
        successModal = new bootstrap.Modal(document.getElementById('successModal'));
        errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        
        const confirmModalElement = document.getElementById('confirmModal');
        if (confirmModalElement) {
            confirmModal = new bootstrap.Modal(confirmModalElement);
        }
    }

    if (document.getElementById('tablaWalkarounds')) {
        cargarWalkarounds();
        configurarFiltrosWalkaround();
    }

    if (document.getElementById('walkaroundForm')) {
        //  Cargar aeronaves para el selector 
        cargarAeronavesParaSelector();
        configurarEventosEliminacion();

        // Configurar búsqueda de aeropuertos
        configurarBusquedaAeropuertos();
        
        // Comprobar si hay un ID en la URL para modo edición
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        
        if (id) {
            // Modo edición
            configurarModoEdicion(id);
        } else {
            const now = new Date();
            
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
            
            document.getElementById('fechaHora').value = formatted;
            
            console.log(' Hora local establecida:', formatted);
            
            document.getElementById('walkaroundForm').action = '../../app/controllers/procesar_walkaround.php';
        }

        configurarCheckboxesEntradaSalida();
        
        document.getElementById('walkaroundForm').addEventListener('submit', function(event) {
            event.preventDefault();
            enviarWalkaround();
        });
        
        // Manejar la selección de evidencias generales
        document.getElementById('generalEvidence').addEventListener('change', function(e) {
            handleGeneralEvidenceSelect(e.target.files);
        });
    }

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
 * Aplica los filtros y recarga la tabla de walkarounds 
 */
function aplicarFiltrosWalkaround() {
    console.log(' Aplicando filtros walkaround...');
    console.log(' Filtros activos:', filtrosActivosWalkaround);
    
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroMovimiento = document.getElementById('filtroMovimiento');
    
    if (filtroFecha && filtroFecha.value !== filtrosActivosWalkaround.fecha) {
        filtrosActivosWalkaround.fecha = filtroFecha.value;
    }
    
    if (filtroMatricula && filtroMatricula.value.trim() !== filtrosActivosWalkaround.matricula) {
        filtrosActivosWalkaround.matricula = filtroMatricula.value.trim();
    }
    
    if (filtroMovimiento && filtroMovimiento.value !== filtrosActivosWalkaround.movimiento) {
        filtrosActivosWalkaround.movimiento = filtroMovimiento.value;
    }
    
    console.log(' Filtros sincronizados:', filtrosActivosWalkaround);
    
    const tablaBody = document.querySelector('#tablaWalkarounds tbody');
    if (tablaBody) {
        tablaBody.innerHTML = '<tr><td colspan="10" class="text-center">Aplicando filtros...</td></tr>';
    }
    
    paginaActual = 1; 
    cargarWalkarounds();
}

/**
 * Limpia los filtros y recarga la tabla de walkarounds
 */
function limpiarFiltrosWalkaround() {
    console.log(' Limpiando filtros walkaround...');
    
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
    
    const tablaBody = document.querySelector('#tablaWalkarounds tbody');
    if (tablaBody) {
        tablaBody.innerHTML = '<tr><td colspan="10" class="text-center">Limpiando filtros...</td></tr>';
    }
    
    paginaActual = 1;
    cargarWalkarounds();
}


function configurarFiltrosWalkaround() {
    console.log(' Configurando eventos de filtros walkaround...');
    
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroMovimiento = document.getElementById('filtroMovimiento');
    
    // Configurar filtro de fecha - APLICAR AL CAMBIAR
    if (filtroFecha) {
        filtroFecha.addEventListener('change', function() {
            console.log(' Cambio en filtro fecha:', this.value);
            filtrosActivosWalkaround.fecha = this.value;
            aplicarFiltrosWalkaround(); 
        });
    }
    
    // Configurar filtro de matrícula
    if (filtroMatricula) {
        let timeoutMatricula = null;
        filtroMatricula.addEventListener('input', function() {
            const valor = this.value.trim();
            console.log(' Input en filtro matrícula:', valor);
            
            if (timeoutMatricula) {
                clearTimeout(timeoutMatricula);
            }
            
            timeoutMatricula = setTimeout(() => {
                filtrosActivosWalkaround.matricula = valor;
                console.log(' Matrícula actualizada, aplicando filtros:', filtrosActivosWalkaround.matricula);
                aplicarFiltrosWalkaround(); 
            }, 500);
        });
        
        filtroMatricula.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filtrosActivosWalkaround.matricula = this.value.trim();
                aplicarFiltrosWalkaround();
            }
        });
    }
    
    // Configurar filtro de movimiento
    if (filtroMovimiento) {
        filtroMovimiento.addEventListener('change', function() {
            console.log(' Cambio en filtro movimiento:', this.value);
            filtrosActivosWalkaround.movimiento = this.value;
            aplicarFiltrosWalkaround(); 
        });
    }
    
    const btnBuscar = document.querySelector('button[onclick="aplicarFiltrosWalkaround()"]');
    if (btnBuscar) {
        console.log(' Botón de búsqueda encontrado y configurado');
    }
    
    const btnLimpiar = document.querySelector('button[onclick="limpiarFiltrosWalkaround()"]');
    if (btnLimpiar) {
        console.log(' Botón de limpiar encontrado y configurado');
    }
    
    console.log(' Filtros walkaround configurados correctamente');
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
    console.log(' Cargando componentes para aeronave:', aeronave.Matricula, 'Tipo:', tipo);
    
    cargarComponentes(tipo);
    
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


function configurarInputAeropuerto(inputElement, resultadosDiv) {
    let timeoutBusqueda = null;
    
    inputElement.addEventListener('input', function(e) {
        const termino = e.target.value.trim();
        
        if (timeoutBusqueda) {
            clearTimeout(timeoutBusqueda);
        }
        
        timeoutBusqueda = setTimeout(() => {
            if (termino.length >= 2) {
                buscarAeropuertos(termino, resultadosDiv, inputElement);
            } else {
                ocultarResultadosAeropuertos(resultadosDiv);
            }
        }, 300);
    });
    
    document.addEventListener('click', function(e) {
        if (!inputElement.contains(e.target) && !resultadosDiv.contains(e.target)) {
            ocultarResultadosAeropuertos(resultadosDiv);
        }
    });
    
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


function mostrarResultadosAeropuertos(aeropuertos, resultadosDiv, inputElement) {
    resultadosDiv.innerHTML = '';
    
    aeropuertos.forEach(aeropuerto => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'list-group-item list-group-item-action text-start';
        
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
 * Selecciona un aeropuerto de los resultados
 */
function seleccionarAeropuerto(aeropuerto, inputElement, resultadosDiv) {
    inputElement.value = `${aeropuerto.codigo_iata} - ${aeropuerto.nombre}`;
    
    
    const aeropuertoIdField = inputElement.id + '_id';
    let idField = document.getElementById(aeropuertoIdField);
    
    if (!idField) {
        idField = document.createElement('input');
        idField.type = 'hidden';
        idField.id = aeropuertoIdField;
        idField.name = inputElement.name + '_id'; 
        inputElement.parentNode.appendChild(idField);
    }
    idField.value = aeropuerto.id;
    
    ocultarResultadosAeropuertos(resultadosDiv);
    
    console.log('Aeropuerto seleccionado:', aeropuerto);
}


function ocultarResultadosAeropuertos(resultadosDiv) {
    if (resultadosDiv) {
        resultadosDiv.style.display = 'none';
    }
}


function configurarModoEdicion(id) {
    isEditMode = true;
    document.title = 'Editar Walkaround - Inspección de Componentes';
    
    console.log(' Configurando modo edición para ID:', id);
    
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
    
    const fechaHoraGroup = document.querySelector('.form-group:has(#fechaHora)');
    if (fechaHoraGroup) {
        console.log('🗑️ Eliminando campo de fecha/hora en modo edición');
        fechaHoraGroup.remove();
    }
    
    document.getElementById('walkaroundForm').action = '/Eolo/app/controllers/walkaround_actualizar.php';
    
    let idWalkInput = document.getElementById('id_walk');
    if (!idWalkInput) {
        idWalkInput = document.createElement('input');
        idWalkInput.type = 'hidden';
        idWalkInput.id = 'id_walk';
        idWalkInput.name = 'id_walk';
        document.getElementById('walkaroundForm').appendChild(idWalkInput);
    }
    idWalkInput.value = id;
    
    cargarAeronavesParaSelector();
    
    cargarDatosWalkaround(id);
}

/**
 * Carga evidencias existentes en modo edición 
 */
function cargarEvidenciasExistentes(evidencias) {
    console.log(' Cargando evidencias existentes:', evidencias);
    
    if (!evidencias || evidencias.length === 0) {
        console.log(' No hay evidencias existentes para cargar');
        return;
    }
    
    const previewContainer = document.getElementById('evidencePreview');
    if (!previewContainer) {
        console.error(' No se encontró el contenedor de preview de evidencias');
        return;
    }
    
    const existingEvidences = previewContainer.querySelectorAll('.existing-evidence');
    existingEvidences.forEach(el => el.remove());
    
    evidencias.forEach(evidencia => {
        const idEvidencia = evidencia.Id_Evidencia;
        const ruta = evidencia.Ruta;
        const fileName = evidencia.FileName;
        const extension = fileName ? fileName.split('.').pop().toLowerCase() : '';
        const esImagen = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
        
        console.log('Evidencia existente:', { id: idEvidencia, ruta: ruta, fileName: fileName });

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
                console.error(' Error cargando imagen existente:', ruta);
                this.style.display = 'none';
                const icon = document.createElement('i');
                icon.className = 'fas fa-file-image evidence-preview';
                icon.style.fontSize = '2rem';
                icon.style.color = '#6c757d';
                itemDiv.appendChild(icon);
            };
            
            img.onload = function() {
                console.log(' Imagen existente cargada correctamente:', ruta);
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
        
        const existenteBadge = document.createElement('span');
        existenteBadge.className = 'badge bg-info ms-2';
        existenteBadge.textContent = 'Existente';
        itemDiv.appendChild(existenteBadge);
        
        // BOTÓN PARA ELIMINAR EVIDENCIA EXISTENTE
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
        
        previewContainer.insertBefore(itemDiv, previewContainer.firstChild);
    });
    
    console.log(' Evidencias existentes cargadas:', evidencias.length);
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
            console.log(' Evidencia eliminada:', idEvidencia);
        } else {
            alert('Error al eliminar evidencia: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error eliminando evidencia:', error);
        alert('Error al conectar con el servidor');
    }
}

/**
 * Carga la lista de walkarounds con paginación, permisos y filtros
 */
async function cargarWalkarounds(pagina = 1) {
    const tablaBody = document.querySelector('#tablaWalkarounds tbody');
    if (!tablaBody) {
        console.error(' No se encontró la tabla de walkarounds');
        return;
    }
    
    tablaBody.innerHTML = '<tr><td colspan="10" class="text-center">Cargando...</td></tr>';

    try {
        console.log(` Cargando walkarounds página ${pagina}...`);
        console.log(' Filtros activos:', filtrosActivosWalkaround);
        
        let url = `/Eolo/app/models/leer_walkaround.php?pagina=${pagina}&registros_por_pagina=${registrosPorPagina}`;
        
        if (filtrosActivosWalkaround.fecha) {
            url += `&fecha=${filtrosActivosWalkaround.fecha}`;
        }
        if (filtrosActivosWalkaround.matricula) {
            url += `&matricula=${encodeURIComponent(filtrosActivosWalkaround.matricula)}`;
        }
        if (filtrosActivosWalkaround.movimiento) {
            url += `&movimiento=${filtrosActivosWalkaround.movimiento}`;
        }

        console.log(` URL de consulta: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(' Datos recibidos:', data);
        
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
                console.log(` Procesando walkaround ID ${walkaround.Id_Walk}:`, walkaround);
                
                const puedeEditar = permisosSistema.puedeEditar('walkarounds', walkaround);
                const puedeEliminar = permisosSistema.puedeEliminar('walkarounds');
                const esPropietario = walkaround.creado_por === usuarioId || walkaround.Elaboro === usuarioActual;
                
                const fila = document.createElement('tr');
                
                const matricula = walkaround.Matricula || 'No especificada';
                const equipo = walkaround.Equipo || 'No especificado';
                const procedencia = walkaround.Procedencia || 'No especificada';
                const destino = walkaround.Destino || 'No especificada';
                const elaboro = walkaround.Elaboro || 'No especificado';
                const responsable = walkaround.Responsable || 'No especificado';
                
                let movimientoBadge = '';
                if (walkaround.entrada == 1) {
                    movimientoBadge = '<span class="badge bg-success">Entrada</span>';
                } 
                if (walkaround.salida == 1) {
                    movimientoBadge = '<span class="badge bg-primary">Salida</span>';
                }
                
                
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
        
        actualizarPaginador();
        
    } catch (error) {
        console.error(' Error al cargar walkarounds:', error);
        tablaBody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">Error al cargar los datos: ${error.message}</td></tr>`;
    }
}


function procesarComponentesParaFormulario(componentes) {
    console.log(' Procesando componentes para formulario:', componentes);
    
    const componentesProcesados = {};
    
    if (!componentes || !Array.isArray(componentes)) {
        console.warn(' Componentes no es un array válido:', componentes);
        return componentesProcesados;
    }
    
    componentes.forEach((componente, index) => {
        console.log(` Procesando componente ${index}:`, componente);
        
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
            
            console.log(` Componente ${componenteId} procesado:`, componentesProcesados[componenteId]);
        } else {
            console.warn(' Componente sin identificador:', componente);
        }
    });
    
    console.log(' Componentes procesados:', Object.keys(componentesProcesados).length);
    return componentesProcesados;
}


function mostrarInfoAeronaveEnModoEdicion(matricula, equipo) {
    const infoContainer = document.getElementById('infoAeronaveContainer');
    
    if (infoContainer) {
        const infoMatricula = document.getElementById('infoMatricula');
        const infoEquipo = document.getElementById('infoEquipo');
        
        if (infoMatricula) {
            infoMatricula.textContent = matricula || 'No especificada';
        }
        if (infoEquipo) {
            infoEquipo.textContent = equipo || 'No especificado';
        }
        
        infoContainer.style.display = 'flex';
        console.log(' Información de aeronave mostrada en modo edición:', { matricula, equipo });
    } else {
        console.warn(' No se encontró el contenedor de información de aeronave');
    }
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
    console.log(' Cargando datos del walkaround ID:', id);
    
    try {
        const response = await fetch(`/Eolo/app/controllers/walkaround_leer_id.php?id=${id}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(' Datos recibidos para edición:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Llenar el formulario con los datos
        llenarFormularioConDatos(data);
        
    } catch (error) {
        console.error(' Error al cargar datos del walkaround:', error);
        mostrarError('No se pudieron cargar los datos del walkaround: ' + error.message);
    }
}


function llenarFormularioConDatos(data) {
    console.log(' Llenando formulario con datos:', data);
    
    if (data.Id_Aeronave && data.Matricula) {
        setTimeout(() => {
            document.getElementById('aeronaveSeleccionada').value = data.Id_Aeronave;
            document.getElementById('buscarAeronave').value = data.Matricula;
            
            mostrarInfoAeronaveEnModoEdicion(data.Matricula, data.Equipo);
            
            const tipo = data.Tipo ? data.Tipo.toLowerCase() : 'avion';
            console.log(' Cargando componentes para tipo:', tipo);
            
            const componentesGuardados = procesarComponentesParaFormulario(data.componentes || []);
            cargarComponentes(tipo, componentesGuardados);
        }, 100);
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
    
    // Cargar evidencias existentes
    if (data.evidencias && data.evidencias.length > 0) {
        cargarEvidenciasExistentes(data.evidencias);
    }
    
    console.log(' Formulario llenado correctamente (sin campo fecha)');
}

/**
 * Carga componentes según el tipo de aeronave
 */
function cargarComponentes(tipoAeronave, componentesGuardados = {}) {
    console.log(' cargarComponentes iniciado con scroll horizontal completo');
    
    const componentesContainer = document.getElementById('componentesContainer');
    
    if (!componentesContainer) {
        console.error(' ERROR CRÍTICO: No se encontró el contenedor de componentes');
        return;
    }
    
    const secciones = componentesPorTipo[tipoAeronave];
    
    if (!secciones || Object.keys(secciones).length === 0) {
        console.error(' No se encontraron componentes para tipo:', tipoAeronave);
        componentesContainer.innerHTML = `
            <div class="alert alert-warning m-3">
                <i class="fas fa-exclamation-triangle me-2"></i>
                No hay componentes definidos para este tipo de aeronave.
            </div>
        `;
        return;
    }
    
    console.log(' Secciones encontradas:', Object.keys(secciones));
    
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

                console.log(` Componente ${componente.id} - Estado:`, estadoGuardado);

                const tieneDanos = Object.values(estadoGuardado).some(v => v);
                const claseFila = tieneDanos ? 'table-warning has-damage' : '';

                html += `
                    <tr class="component-row ${claseFila}" id="fila-${componente.id}">
                        <td class="component-name">
                            <strong>${componente.nombre}</strong>
                        </td>
                `;

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
    
    console.log(` Generando HTML para ${componentesProcesados} componentes con scroll horizontal completo...`);
    componentesContainer.innerHTML = html;
    
    const checkboxes = document.querySelectorAll('.damage-checkbox');
    console.log(` Configurando eventos para ${checkboxes.length} checkboxes...`);
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const componenteId = this.getAttribute('data-componente');
            const tipoDano = this.getAttribute('data-tipo');
            const filaComponente = document.getElementById(`fila-${componenteId}`);
            
            const checkboxesComponente = document.querySelectorAll(`.damage-checkbox[data-componente="${componenteId}"]`);
            const algunoMarcado = Array.from(checkboxesComponente).some(cb => cb.checked);
            
            if (algunoMarcado) {
                filaComponente.classList.add('table-warning');
                filaComponente.classList.add('has-damage');
            } else {
                filaComponente.classList.remove('table-warning');
                filaComponente.classList.remove('has-damage');
            }
            
            console.log(` Checkbox cambiado: ${componenteId} - ${tipoDano}: ${this.checked}`);
        });
        
        checkbox.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        checkbox.addEventListener('touchend', function() {
            this.style.transform = 'scale(1.3)';
        });
    });

    console.log(' Función cargarComponentes con scroll horizontal completo finalizada');
}

/**
 * Actualiza el input de evidencias
 */
function updateEvidenceInput() {
    const input = document.getElementById('generalEvidence');
    if (!input) {
        console.error(' No se encontró el input generalEvidence');
        return;
    }
    
    const dataTransfer = new DataTransfer();
    
    const archivosUnicos = [];
    const nombresArchivos = new Set();
    
    generalEvidenceFiles.forEach(f => {
        const clave = f.file.name + '_' + f.file.size;
        
        if (!nombresArchivos.has(clave)) {
            nombresArchivos.add(clave);
            archivosUnicos.push(f.file);
            dataTransfer.items.add(f.file);
            console.log(' Archivo agregado a DataTransfer:', f.file.name);
        } else {
            console.log(' Archivo duplicado omitido en DataTransfer:', f.file.name);
        }
    });
    
    input.files = dataTransfer.files;
    
    console.log(' Input actualizado:', dataTransfer.files.length + ' archivos');
    console.log(' Estado final - generalEvidenceFiles:', generalEvidenceFiles.length);
    console.log(' Estado final - input.files:', input.files.length);
    
    for (let i = 0; i < input.files.length; i++) {
        console.log('  📄 Archivo ' + i + ':', input.files[i].name, '-', input.files[i].size, 'bytes');
    }
}

/**
 * Elimina una evidencia
 */
function removeEvidence(fileId) {
    generalEvidenceFiles = generalEvidenceFiles.filter(f => f.id !== fileId);
    
    const item = document.getElementById('evidence-item-' + fileId);
    if (item) {
        item.remove();
    }
    
    updateEvidenceInput();
}

/**
 * Maneja la selección de evidencias generales
 */
function handleGeneralEvidenceSelect(files) {
    console.log(' Archivos seleccionados:', files);
    
    if (!files || files.length === 0) return;
    
    const previewContainer = document.getElementById('evidencePreview');
    if (!previewContainer) return;
    
    const noEvidenceMsg = previewContainer.querySelector('.text-muted.text-center');
    if (noEvidenceMsg) noEvidenceMsg.remove();
    
    Array.from(files).forEach(file => {
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


function crearElementoEvidencia(fileObj, container) {
    const { id, file } = fileObj;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'evidence-item new-evidence';
    itemDiv.id = 'evidence-item-' + id;
    
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.className = 'evidence-thumbnail-container';
    thumbnailContainer.style.cursor = 'pointer';
    thumbnailContainer.title = 'Haz clic para ver en pantalla completa';
    
    thumbnailContainer.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        abrirEvidenciaNuevaEnModal(file, id);
    });
    
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
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = file.name;
    nameSpan.className = 'file-name';
    nameSpan.style.marginLeft = '10px';
    nameSpan.style.flex = '1';
    
    const newBadge = document.createElement('span');
    newBadge.className = 'badge bg-success ms-2';
    newBadge.textContent = 'Nueva';
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-sm btn-danger remove-evidence-btn';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.title = 'Quitar esta evidencia';
    
    removeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log(' Click en botón eliminar para ID:', id);
        removeEvidence(id);
    });
    
    itemDiv.appendChild(nameSpan);
    itemDiv.appendChild(newBadge);
    itemDiv.appendChild(removeBtn);
    container.appendChild(itemDiv);
}

/**
 * Abre una evidencia en el modal de pantalla completa
 */
function abrirEvidenciaNuevaEnModal(file, fileId) {
    console.log(' Abriendo evidencia NUEVA en modal:', file.name);
    
    const modalContent = document.getElementById('evidenceModalContent');
    const modalTitle = document.getElementById('evidenceModalLabel');
    const fileNameSpan = document.getElementById('evidenceFileName');
    const downloadBtn = document.getElementById('downloadEvidenceBtn');
    
    modalContent.innerHTML = '';
    
    fileNameSpan.textContent = file.name;
    
    // Configurar botón de descarga
    downloadBtn.style.display = 'block';
    downloadBtn.onclick = function() {
        descargarArchivoNuevo(file);
    };
    
    if (file.type.startsWith('image/')) {
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
    
    if (window.evidenceModal) {
        window.evidenceModal.show();
    }
}

/**
 * Descarga un archivo nuevo 
 */
function descargarArchivoNuevo(file) {
    console.log(' Descargando archivo nuevo:', file.name);
    
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.target = '_blank';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    mostrarMensajeDescarga(file.name);
}

/**
 * Elimina una evidencia
 */
function removeEvidence(fileId) {
    console.log('🗑️ Eliminando evidencia con ID:', fileId);
    
    generalEvidenceFiles = generalEvidenceFiles.filter(f => f.id !== fileId);
    
    const item = document.getElementById('evidence-item-' + fileId);
    if (item) {
        item.remove();
        console.log(' Evidencia eliminada del DOM');
    }
    
    updateEvidenceInput();
    
    const previewContainer = document.getElementById('evidencePreview');
    const existingEvidences = previewContainer.querySelectorAll('.existing-evidence');
    const newEvidences = previewContainer.querySelectorAll('.new-evidence');
    
    if (existingEvidences.length === 0 && newEvidences.length === 0) {
        previewContainer.innerHTML = '<div class="text-muted text-center py-3"><i class="fas fa-images me-2"></i>No hay evidencias seleccionadas</div>';
    }
}



function updateEvidenceInput() {
    const input = document.getElementById('generalEvidence');
    if (!input) {
        console.error(' No se encontró el input generalEvidence');
        return;
    }
    
    const dataTransfer = new DataTransfer();
    
    generalEvidenceFiles.forEach(f => {
        dataTransfer.items.add(f.file);
        console.log(' Archivo agregado a DataTransfer:', f.file.name);
    });
    
    input.files = dataTransfer.files;
    
    console.log(' Input actualizado:', dataTransfer.files.length + ' archivos');
}


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
            console.log(' Event delegation - Eliminando archivo:', fileId);
            removeEvidence(fileId);
        }
    });
}

/**
 *  todos los campos existan en el formulario
 */
function asegurarTodosLosCampos(formData) {
    console.log(' Asegurando todos los campos en FormData...');
    
    const todosComponentes = new Set();
    const todosTipos = ['derecho', 'izquierdo', 'golpe', 'rayon', 'fisura', 'quebrado', 'pinturaCuarteada', 'otroDano'];
    
    document.querySelectorAll('.damage-checkbox').forEach(checkbox => {
        const componenteId = checkbox.getAttribute('data-componente');
        todosComponentes.add(componenteId);
    });
    
    console.log(` Componentes encontrados: ${todosComponentes.size}`);
    console.log(` Tipos de daño: ${todosTipos.length}`);
    
    todosComponentes.forEach(componenteId => {
        todosTipos.forEach(tipo => {
            const campoName = `dano_${componenteId}_${tipo}`;
            
            const existe = Array.from(formData.entries()).some(([key]) => key === campoName);
            
            if (!existe) {
                const checkbox = document.querySelector(`[name="${campoName}"]`);
                const valor = checkbox && checkbox.checked ? '1' : '0';
                
                formData.append(campoName, valor);
                console.log(` Campo agregado: ${campoName} = ${valor}`);
            }
        });
    });
    
    console.log(' Todos los campos asegurados en FormData');
}

/**
 * Envía el formulario de walkaround al servidor
 */
async function enviarWalkaround() {
    console.log(' Iniciando envío de walkaround...');
    console.log(' Modo:', isEditMode ? 'EDICIÓN' : 'CREACIÓN');
    
    if (!validarFormulario()) {
        return;
    }

    const aeronaveSeleccionada = document.getElementById('aeronaveSeleccionada').value;
    if (!aeronaveSeleccionada) {
        mostrarError('Por favor, selecciona una aeronave.');
        return;
    }

    document.getElementById('loading').style.display = 'flex';
    document.getElementById('submitButton').disabled = true;
    const spinner = document.querySelector('#submitButton .spinner-border');
    if (spinner) {
        spinner.style.display = 'inline-block';
    }

    try {
        const formData = new FormData(document.getElementById('walkaroundForm'));
        const url = document.getElementById('walkaroundForm').action;

        console.log(' URL de envío:', url);
        console.log(' ID Aeronave seleccionada:', aeronaveSeleccionada);

        formData.append('id_aeronave', aeronaveSeleccionada);

        asegurarTodosLosCampos(formData);
        
        console.log(' DIAGNÓSTICO - Buscando campos pinturaCuarteada y otroDano:');
        for (let [key, value] of formData.entries()) {
            if (key.includes('pinturaCuarteada') || key.includes('otroDano')) {
                console.log(`  ${key} = ${value}`);
            }
        }

        if (generalEvidenceFiles && generalEvidenceFiles.length > 0) {
            generalEvidenceFiles.forEach(fileObj => {
                formData.append('generalEvidence[]', fileObj.file);
            });
            console.log('📎 Evidencias generales agregadas:', generalEvidenceFiles.length);
        } else {
            console.log('📎 No hay evidencias generales para agregar');
        }

        console.log(' Datos a enviar:');
        for (let [key, value] of formData.entries()) {
            if (key.includes('evidencia') || key.includes('generalEvidence')) {
                console.log(`  ${key}: [ARCHIVO - ${value.name || 'sin nombre'}]`);
            } else {
                console.log(`  ${key}: ${value}`);
            }
        }

        console.log(' Enviando datos al servidor...');
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        console.log(' Respuesta recibida, status:', response.status);
        
        const responseText = await response.text();
        console.log(' Respuesta completa del servidor:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log(' Respuesta JSON parseada:', data);
        } catch (parseError) {
            console.error(' Error parseando JSON:', parseError);
            console.error(' Respuesta que causó el error:', responseText);
            
            if (responseText.includes('éxito') || responseText.includes('success') || response.status === 200) {
                data = { success: true, message: 'Operación completada exitosamente' };
            } else {
                throw new Error(`El servidor devolvió un formato inesperado: ${responseText.substring(0, 200)}`);
            }
        }
        
        if (data.success) {
            const mensaje = data.message || (isEditMode ? 
                'Walkaround actualizado correctamente.' : 
                'Walkaround creado correctamente.');
                
            console.log(' Éxito:', mensaje);
            mostrarExito(mensaje, () => {
                window.location.href = '../../app/views/ver_walkaround.html';
            });
        } else {
            const errorMsg = data.message || data.error || 'Error al procesar el walkaround';
            console.error(' Error del servidor:', errorMsg);
            mostrarError(errorMsg);
        }
    } catch (error) {
        console.error(' Error en el envío:', error);
        console.error(' Stack trace:', error.stack);
        
        let mensajeError = 'Ocurrió un error al conectar con el servidor. ';
        
        if (error.message.includes('formato inesperado')) {
            mensajeError += 'El servidor devolvió una respuesta inesperada. ';
        }
        
        mensajeError += error.message;
        mostrarError(mensajeError);
    } finally {
        console.log('🏁 Finalizando envío...');
        document.getElementById('loading').style.display = 'none';
        document.getElementById('submitButton').disabled = false;
        const spinnerFinal = document.querySelector('#submitButton .spinner-border');
        if (spinnerFinal) {
            spinnerFinal.style.display = 'none';
        }
    }
}


function validarFormulario() {
    console.log(' Validando formulario...');
    
    const aeronaveSeleccionada = document.getElementById('aeronaveSeleccionada').value;
    if (!aeronaveSeleccionada) {
        console.error(' No se ha seleccionado aeronave');
        mostrarError('Por favor, selecciona una aeronave.');
        return false;
    }

    // Validar que se haya seleccionado al menos un tipo de movimiento
    const entrada = document.getElementById('entrada').checked;
    const salida = document.getElementById('salida').checked;
    if (!entrada && !salida) {
        console.error(' No se ha seleccionado tipo de walkaround');
        mostrarError('Por favor, selecciona al menos un tipo de walkaround (Entrada o Salida).');
        return false;
    }

    // Validar campos obligatorios
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
    
    console.log(' Formulario válido');
    return true;
}

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


function mostrarError(mensaje) {
    const modalBody = document.getElementById('errorModalBody');
    if (modalBody && errorModal) {
        modalBody.textContent = mensaje;
        errorModal.show();
    } else {
        alert('¡Error! ⚠️\n' + mensaje);
    }
}


function mostrarErrorPermisosEliminar() {
    mostrarError('Solo los administradores pueden eliminar walkarounds. Contacta al administrador del sistema.');
}


function tienePermisosEliminarWalkaround() {
    return permisosSistema.puedeEliminar('walkarounds');
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
        cargarWalkarounds(pagina);
    }
}


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



function agregarEvidenciasAlFormData(formData) {
    generalEvidenceFiles.forEach(fileObj => {
        formData.append('generalEvidence[]', fileObj.file);
    });
    
    return formData;
}

function mostrarErrorPermisosEliminar() {
    mostrarError('Solo los administradores pueden eliminar walkarounds. Contacta al administrador del sistema.');
}



function eliminarWalkaround(id) {
    // Verificación de permisos
    if (!permisosSistema.puedeEliminar('walkarounds')) {
        mostrarErrorPermisosEliminar();
        return;
    }
    
    mostrarConfirmacionEliminar(id);
}


function eliminarWalkaroundConfirmada(id) {
    if (confirmModal) {
        confirmModal.hide();
    }
    
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
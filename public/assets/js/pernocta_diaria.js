let successModal = null;
let errorModal = null;
let confirmModal = null;

let aeronavesData = [];
let isEditMode = false;

let paginaActual = 1;
const registrosPorPagina = 10;
let totalPaginas = 1;
let totalRegistros = 0;

let filtrosActivos = {
    fecha: '',
    matricula: '',
    movimiento: ''
};

let timeoutBusqueda = null;

console.log(' Aplicando correcciones críticas...');

if (typeof tablaPernoctas === 'undefined') {
    var tablaPernoctas = document.getElementById('tablaPernoctas');
    console.log(' Variable tablaPernoctas corregida:', !!tablaPernoctas);
}

function crearElementoEstado() {
    console.log(' Creando elemento de estado...');
    const estadoElement = document.createElement('div');
    estadoElement.id = 'infoEstado';
    estadoElement.className = 'mt-2';
    
    const infoContainer = document.getElementById('infoAeronaveContainer');
    if (infoContainer) {
        const cardBody = infoContainer.querySelector('.card-body');
        if (cardBody) {
            cardBody.appendChild(estadoElement);
        }
    }
    
    return estadoElement;
}

function corregirBotonGuardar() {
    const boton = document.getElementById('submitButton');
    const formulario = document.getElementById('pernoctaForm');
    
    if (!boton || !formulario) {
        console.error(' No se encontró botón o formulario');
        return;
    }
    
    console.log(' Corrigiendo evento del botón...');
    
    const nuevoBoton = boton.cloneNode(true);
    boton.parentNode.replaceChild(nuevoBoton, boton);
    
    nuevoBoton.addEventListener('click', function(e) {
        console.log(' CLICK CORREGIDO - Ejecutando enviarPernocta()');
        e.preventDefault();
        enviarPernocta();
    });
    
    nuevoBoton.addEventListener('touchend', function(e) {
        console.log('📱 TOUCH CORREGIDO - Ejecutando enviarPernocta()');
        e.preventDefault();
        enviarPernocta();
    });
    
    formulario.addEventListener('submit', function(e) {
        console.log(' SUBMIT CORREGIDO - Ejecutando enviarPernocta()');
        e.preventDefault();
        enviarPernocta();
    });
    
    console.log(' Botón corregido exitosamente');
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof bootstrap !== 'undefined') {
        successModal = new bootstrap.Modal(document.getElementById('successModal'));
        errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        
        const confirmModalElement = document.getElementById('confirmModal');
        if (confirmModalElement) {
            confirmModal = new bootstrap.Modal(confirmModalElement);
        }
    }

    if (document.getElementById('pernoctaForm')) {
        inicializarPernoctaDiaria();
    }

    const confirmBtn = document.getElementById('confirmActionBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (id) {
                eliminarPernoctaConfirmada(id);
            }
        });
    }
});


function configurarBotonMovil() {
    const submitButton = document.getElementById('submitButton');
    
    if (submitButton) {
        console.log('📱 Configurando botón para móviles...');
        
        submitButton.addEventListener('touchstart', function(e) {
            console.log('📱 Botón presionado (feedback visual)');
            this.style.transform = 'scale(0.98)';
            this.style.opacity = '0.8';
        });
        
        submitButton.addEventListener('touchend', function(e) {
            console.log('📱 Botón liberado (feedback visual)');
            this.style.transform = 'scale(1)';
            this.style.opacity = '1';
        });
        
        console.log(' Feedback táctil configurado');
    }
}

/**
 * Función para generar reporte de control completo y redirigir
 */
async function generarReporteControlCompleto() {
    try {
        console.log('🔄 Generando reporte de control diario...');
        
        const btnReporte = document.querySelector('.btn-control');
        const originalText = btnReporte.innerHTML;
        btnReporte.disabled = true;
        btnReporte.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

      
        const ahora = new Date();
        
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const dia = String(ahora.getDate()).padStart(2, '0');
        const fechaParaBuscar = `${año}-${mes}-${dia}`; // Esto será "2025-12-04"
        
        console.log('📅 Fecha para buscar:', fechaParaBuscar);
        console.log('🕐 Hora actual:', ahora.toLocaleTimeString());
        

        const url = `/Eolo/app/models/obtener_entradas_control_pernocta.php?modulo=control_pernocta&fecha_busqueda=${fechaParaBuscar}&_t=${Date.now()}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }

        const entradas = data.entradas || [];
        
        console.log(`📊 Entradas encontradas: ${entradas.length}`);
        
 
        if (entradas.length === 0) {
            mostrarExito(
                `<div class="text-center">
                    <i class="fas fa-check-circle text-info fa-3x mb-3"></i>
                    <h5 class="text-info">Reporte Completado</h5>
                    <p>Todas las aeronaves ya tienen control registrado.</p>
                    <p><small>Fecha: ${data.fecha_consulta}</small></p>
                </div>`, 
                () => {
                    window.location.href = 'ver_control_pernoctas.html';
                }
            );
            
            btnReporte.disabled = false;
            btnReporte.innerHTML = originalText;
            return;
        }
        
        const horaFinal = ahora.toTimeString().split(' ')[0].substring(0, 5);
        
        let procesadas = 0;
        let duplicadas = 0;
        let errores = 0;
        
        console.log(`🔄 Procesando ${entradas.length} entrada(s)...`);
        
        for (const entrada of entradas) {
            try {
                const formData = new FormData();
                formData.append('fecha', entrada.Fecha);
                formData.append('hora_inicial', entrada.Hora);
                formData.append('hora_final', horaFinal);
                formData.append('id_aeronave', entrada.Id_Aeronave);
                formData.append('id_ultimo_registro', entrada.Id_Pernocta);
                
                if (permisosSistema.usuario && permisosSistema.usuario.nombre) {
                    formData.append('persona_registro', permisosSistema.usuario.nombre);
                }
                
                const createResponse = await fetch('/Eolo/app/controllers/control_pernocta_crear.php', {
                    method: 'POST',
                    body: formData
                });
                
                const createData = await createResponse.json();
                
                // MANEJO DE RESPUESTAS
                if (createData.success) {
                    procesadas++;
                    console.log(`✅ ${entrada.Matricula} - Control creado`);
                } 
                else if (createData.message && createData.message.includes('Duplicate')) {
                    // Ya existe control, no es error
                    duplicadas++;
                    console.log(`ℹ️ ${entrada.Matricula} - Ya tiene control`);
                }
                else {
                    errores++;
                    console.error(`❌ ${entrada.Matricula}: ${createData.message}`);
                }
                
            } catch (error) {
                errores++;
                console.error(`❌ ${entrada.Matricula}:`, error);
            }
        }
        
   
        let mensaje = `<div class="text-center">`;
        
        if (procesadas > 0) {
            mensaje += `<i class="fas fa-check-circle text-success fa-3x mb-3"></i>`;
            mensaje += `<h5 class="text-success">¡Reporte Generado!</h5>`;
            mensaje += `<p>Se procesaron ${entradas.length} aeronave(s)</p>`;
            mensaje += `<p><strong>${procesadas} nuevo(s) control(es) creado(s)</strong></p>`;
            
            if (duplicadas > 0) {
                mensaje += `<p class="text-muted">${duplicadas} ya tenían control</p>`;
            }
            
            if (errores > 0) {
                mensaje += `<p class="text-warning">${errores} error(es) encontrados</p>`;
            }
        } 
        else if (duplicadas > 0) {
            mensaje += `<i class="fas fa-info-circle text-info fa-3x mb-3"></i>`;
            mensaje += `<h5 class="text-info">Sin nuevos controles</h5>`;
            mensaje += `<p>Todas las ${duplicadas} aeronaves ya tenían control</p>`;
        }
        else {
            mensaje += `<i class="fas fa-exclamation-triangle text-danger fa-3x mb-3"></i>`;
            mensaje += `<h5 class="text-danger">Error en el reporte</h5>`;
            mensaje += `<p>No se pudo crear ningún control</p>`;
        }
        
        mensaje += `<p><small>Fecha: ${data.fecha_consulta}<br>`;
        mensaje += `Hora del reporte: ${horaFinal}</small></p>`;
        mensaje += `</div>`;
        
        mostrarExito(mensaje, () => {
            window.location.href = 'ver_control_pernoctas.html';
        });
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError(`Error al generar reporte: ${error.message}`);
        
        const btnReporte = document.querySelector('.btn-control');
        if (btnReporte) {
            btnReporte.disabled = false;
            btnReporte.innerHTML = originalText;
        }
    }
}

function inicializarPernoctaDiaria() {
    console.log(' Inicializando módulo de pernoctas diarias...');
    
    const pernoctaForm = document.getElementById('pernoctaForm');
    
    if (pernoctaForm) {
        console.log(' Estamos en la página de FORMULARIO');
        
        establecerFechaActual();
        
        configurarCampoHoraManual();
        
        cargarAeronavesParaSelector();
        configurarBusquedaAeropuertos();
        
        pernoctaForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log(' Formulario enviado (evento submit)');
            enviarPernocta();
        });
        
        configurarBotonMovil();
        
        setTimeout(corregirBotonGuardar, 500);
        
        configurarRadiosMovimiento();
        
        const urlParams = new URLSearchParams(window.location.search);
        const idPernocta = urlParams.get('id');
        if (idPernocta) {
            console.log(' Cargando pernocta para edición ID:', idPernocta);
            cargarPernoctaParaEdicion(idPernocta);
        }
        
        console.log(' Formulario de pernoctas inicializado completamente');
    }

    if (typeof tablaPernoctas !== 'undefined' && tablaPernoctas) {
        console.log(' Estamos en la página de LISTA');
        configurarFiltros();
        cargarPernoctasDelDia();
    }
}

/**
 * Carga una pernocta específica para edición 
 */
async function cargarPernoctaParaEdicion(id) {
    try {
        console.log(' Cargando pernocta para edición desde URL, ID:', id);
        
        const response = await fetch(`/Eolo/app/controllers/pernocta_diaria_leer_id.php?id=${id}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        if (data.success && data.pernocta) {
            llenarFormularioEdicion(data.pernocta);
            console.log(' Pernocta cargada para edición desde URL');
        } else {
            throw new Error('No se pudieron cargar los datos de la pernocta');
        }
        
    } catch (error) {
        console.error(' Error al cargar pernocta para edición:', error);
        mostrarError('Error al cargar los datos para editar: ' + error.message);
    }
}

/**
 * Aplica los filtros y recarga la tabla
 */
function aplicarFiltros() {
    console.log(' Aplicando filtros...');
    
    // Obtener valores actuales de los inputs
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroMovimiento = document.getElementById('filtroMovimiento');
    
    // Actualizar filtrosActivos con los valores actuales
    if (filtroFecha) {
        filtrosActivos.fecha = filtroFecha.value;
        console.log(' Fecha filtro:', filtrosActivos.fecha);
    }
    
    if (filtroMatricula) {
        filtrosActivos.matricula = filtroMatricula.value.trim();
        console.log(' Matrícula filtro:', filtrosActivos.matricula);
    }
    
    if (filtroMovimiento) {
        filtrosActivos.movimiento = filtroMovimiento.value;
        console.log(' Movimiento filtro:', filtrosActivos.movimiento);
    }
    
    paginaActual = 1; 
    cargarPernoctasDelDia();
}

/**
 * Limpia los filtros y recarga la tabla
 */
function limpiarFiltros() {
    console.log(' Limpiando filtros...');
    
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroMovimiento = document.getElementById('filtroMovimiento');
    
    if (filtroFecha) filtroFecha.value = '';
    if (filtroMatricula) filtroMatricula.value = '';
    if (filtroMovimiento) filtroMovimiento.value = '';
    
    filtrosActivos = {
        fecha: '',
        matricula: '',
        movimiento: ''
    };
    
    paginaActual = 1;
    cargarPernoctasDelDia();
}

/**
 * Configura los eventos para los filtros
 */
function configurarFiltros() {
    console.log(' Configurando eventos de filtros...');
    
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroMovimiento = document.getElementById('filtroMovimiento');
    
    // Configurar filtro de fecha
    if (filtroFecha) {
        filtroFecha.addEventListener('change', function() {
            console.log(' Cambio en filtro fecha:', this.value);
            filtrosActivos.fecha = this.value;
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
                filtrosActivos.matricula = valor;
                console.log(' Matrícula actualizada:', filtrosActivos.matricula);
            }, 500);
        });
        
        filtroMatricula.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filtrosActivos.matricula = this.value.trim();
                aplicarFiltros();
            }
        });
    }
    
    // Configurar filtro de movimiento
    if (filtroMovimiento) {
        filtroMovimiento.addEventListener('change', function() {
            console.log('🔄 Cambio en filtro movimiento:', this.value);
            filtrosActivos.movimiento = this.value;
        });
    }
    
    console.log(' Filtros configurados:', filtrosActivos);
}


function establecerFechaActual() {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const fechaFormatted = `${year}-${month}-${day}`;
    
    const campoFecha = document.getElementById('fecha');
    if (campoFecha && !isEditMode) {
        campoFecha.value = fechaFormatted;
    }
    
    console.log(' Fecha actual establecida:', fechaFormatted);
}

function configurarCampoHoraManual() {
    const campoHora = document.getElementById('hora');
    
    if (campoHora) {
        campoHora.addEventListener('click', function() {
            if (this.showPicker && typeof this.showPicker === 'function') {
                try {
                    this.showPicker();
                } catch (error) {
                    console.log('ℹ️ showPicker no disponible en este navegador');
                }
            }
        });
        
        campoHora.addEventListener('focus', function() {
            this.select();
        });
        
        campoHora.addEventListener('change', function() {
            console.log('✅ Hora establecida manualmente:', this.value);
            
            // Validación más flexible - permitir varios formatos
            if (this.value) {
                // Patrón más flexible para hora
                const horaPattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                if (!horaPattern.test(this.value)) {
                    console.warn('⚠️ Formato de hora no válido:', this.value);
                    this.setCustomValidity('Por favor ingrese una hora válida en formato HH:MM (ej: 14:30, 09:15)');
                    this.reportValidity();
                } else {
                    this.setCustomValidity('');
                }
            } else {
                this.setCustomValidity('');
            }
        });
        
        campoHora.addEventListener('input', function() {
            if (this.value) {
                const horaPattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                if (!horaPattern.test(this.value)) {
                    this.setCustomValidity('Formato HH:MM requerido (ej: 14:30)');
                } else {
                    this.setCustomValidity('');
                }
            } else {
                this.setCustomValidity('');
            }
        });
        
        // Navegación con teclado mejorada
        campoHora.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                console.log(' Usando flechas para ajustar hora manualmente');
            }
            
            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab') {
                return; 
            }
        });
        
        console.log(' Campo de hora configurado para entrada manual');
    }
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
    
    // Inicializar aeronavesData si está undefined
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
    
    // Verificar que aeronavesData sea un array
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


function seleccionarAeronave(aeronave) {
    const inputBusqueda = document.getElementById('buscarAeronave');
    const aeronaveSeleccionada = document.getElementById('aeronaveSeleccionada');
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    
    inputBusqueda.value = aeronave.Matricula;
    
    aeronaveSeleccionada.value = aeronave.Id_Aeronave;
    
    resultadosDiv.style.display = 'none';
    
    mostrarInfoAeronave(aeronave.Id_Aeronave);
    
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


function seleccionarAeropuerto(aeropuerto, inputElement, resultadosDiv) {
    inputElement.value = aeropuerto.codigo_iata;
    
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
 * Carga aeronaves para el selector
 */
async function cargarAeronavesParaSelector() {
    console.log(' Cargando aeronaves para selector...');
    
    try {
        const response = await fetch('../../app/models/obtener_aeronaves.php');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
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

/**
 * Muestra la información adicional de la aeronave seleccionada
 */
function mostrarInfoAeronave(aeronaveId) {
    const aeronaveSeleccionada = aeronavesData.find(a => a.Id_Aeronave == aeronaveId);
    const infoContainer = document.getElementById('infoAeronaveContainer');
    
    if (aeronaveSeleccionada && infoContainer) {
        document.getElementById('infoMatricula').textContent = aeronaveSeleccionada.Matricula || 'No especificada';
        document.getElementById('infoEquipo').textContent = aeronaveSeleccionada.Equipo || 'No especificado';
        
        // Cargar y mostrar el estado actual
        cargarEstadoAeronave(aeronaveId);
        
        infoContainer.style.display = 'block';
    } else {
        infoContainer.style.display = 'none';
        console.warn(' No se pudo mostrar información de aeronave');
    }
}

/**
 * Carga y muestra el estado actual de la aeronave
 */
async function cargarEstadoAeronave(aeronaveId) {
    try {
        const response = await fetch(`/Eolo/app/models/obtener_estado_aeronave.php?id=${aeronaveId}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const estadoElement = document.getElementById('infoEstado') || crearElementoEstado();
                const estadoTexto = data.estado === 'en_hangar' ? 'EN HANGAR' : 'FUERA';
                const estadoClase = data.estado === 'en_hangar' ? 'bg-success' : 'bg-secondary';
                const ultimoMovimiento = data.ultimo_movimiento || 'SIN REGISTROS';
                
                estadoElement.innerHTML = `
                    <span class="badge ${estadoClase} mb-1">Estado: ${estadoTexto}</span>
                    <br>
                    <small class="text-muted">Último movimiento: ${ultimoMovimiento}</small>
                `;
            }
        }
    } catch (error) {
        console.error('Error cargando estado:', error);
    }
}


function ocultarInfoAeronave() {
    const infoContainer = document.getElementById('infoAeronaveContainer');
    if (infoContainer) {
        infoContainer.style.display = 'none';
    }
}


function configurarRadiosMovimiento() {
    const entradaRadio = document.getElementById('entrada');
    const salidaRadio = document.getElementById('salida');
    
    if (entradaRadio && salidaRadio) {
        console.log(' Radio buttons de movimiento configurados');
    }
}


function validarFormularioPernocta() {
    console.log(' Validando formulario para móvil...');
    
    const aeronaveSeleccionada = document.getElementById('aeronaveSeleccionada').value;
    if (!aeronaveSeleccionada) {
        console.error(' No se ha seleccionado aeronave');
        mostrarError('Por favor, selecciona una aeronave.');
        return false;
    }

    const entrada = document.getElementById('entrada').checked;
    const salida = document.getElementById('salida').checked;
    if (!entrada && !salida) {
        console.error(' No se ha seleccionado tipo de movimiento');
        mostrarError('Por favor, selecciona al menos un tipo de movimiento (Entrada o Salida).');
        return false;
    }

    const personaRegistro = document.getElementById('persona_registro').value.trim();
    
    if (!personaRegistro) {
        mostrarError('El campo "Persona que Registra" es obligatorio.');
        return false;
    }
    
    const hora = document.getElementById('hora').value;
    if (!hora) {
        mostrarError('Por favor, ingresa la hora del movimiento.');
        return false;
    }

    console.log(' Formulario válido - Listo para enviar');
    return true;
}

/**
 * Valida el estado de la aeronave antes de registrar movimiento
 */
async function validarEstadoAeronave(idAeronave, esEntrada) {
    if (isEditMode) {
        console.log(' Modo edición - omitiendo validación de estado');
        return true;
    }
    
    try {
        console.log(' Validando estado de aeronave ID:', idAeronave, 'Es entrada:', esEntrada);
        
        const response = await fetch(`/Eolo/app/models/obtener_estado_aeronave.php?id=${idAeronave}&t=${Date.now()}`);
        
        if (!response.ok) {
            console.warn(' Error en validación frontend, permitiendo continuar');
            return true; 
        }
        
        const data = await response.json();
        
        if (data.success) {
            const estado = data.estado;
            const matricula = data.matricula;
            
            console.log(` Estado actual de ${matricula}: ${estado}`);
            
            if (esEntrada && estado === 'en_hangar') {
                mostrarError(`No puede registrar ENTRADA. La aeronave ${matricula} ya se encuentra en hangar.`);
                return false;
            }
            
            if (!esEntrada && estado === 'fuera') {
                mostrarError(`No puede registrar SALIDA. La aeronave ${matricula} no se encuentra en hangar.`);
                return false;
            }
            
            console.log(' Validación frontend exitosa');
            return true;
        } else {
            console.warn(' Error en respuesta de validación, permitiendo continuar');
            return true; 
        }
    } catch (error) {
        console.error(' Error validando estado:', error);
        
        return true;
    }
}

/**
 * Carga las pernoctas del día
 */
async function cargarPernoctasDelDia() {
    const tablaBody = document.getElementById('cuerpoTablaPernoctas');
    if (!tablaBody) {
        console.error(' No se encontró el elemento cuerpoTablaPernoctas');
        return;
    }
    
    console.log('🔄 Iniciando carga de pernoctas...');
    tablaBody.innerHTML = '<tr><td colspan="12" class="text-center">Cargando registros...</td></tr>';

    try {
        
        let fecha = '';
        
        const fechaConsulta = document.getElementById('fechaConsulta');
        if (fechaConsulta) {
            fecha = fechaConsulta.value;
            console.log(' Usando fechaConsulta:', fecha);
        } else {
            // Intentar encontrar filtroFecha (para ver_pernocta_diaria.html)
            const filtroFecha = document.getElementById('filtroFecha');
            if (filtroFecha) {
                fecha = filtroFecha.value;
                console.log(' Usando filtroFecha:', fecha);
            } else {
                console.log(' No se encontró selector de fecha, usando fecha vacía');
            }
        }
        
        filtrosActivos.fecha = fecha;   
        
        console.log(` Página actual: ${paginaActual}`);
        
        let url = `/Eolo/app/models/leer_pernocta_diaria.php?pagina=${paginaActual}&registros_por_pagina=${registrosPorPagina}`;
        
        if (filtrosActivos.fecha) {
            url += `&fecha=${filtrosActivos.fecha}`;
        }
        if (filtrosActivos.matricula) {
            url += `&matricula=${encodeURIComponent(filtrosActivos.matricula)}`;
        }
        if (filtrosActivos.movimiento) {
            url += `&movimiento=${filtrosActivos.movimiento}`;
        }

        console.log(` URL de consulta: ${url}`);
        
        const response = await fetch(url);
        
        console.log(` Status de respuesta: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(' Datos recibidos del servidor:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }

        const pernoctas = data.pernoctas;
        console.log(` Número de pernoctas recibidas: ${pernoctas.length}`);
        
        paginaActual = data.paginacion.pagina_actual;
        totalPaginas = data.paginacion.total_paginas;
        totalRegistros = data.paginacion.total_registros;

        console.log(` Paginación: página ${paginaActual} de ${totalPaginas}, total registros: ${totalRegistros}`);

        tablaBody.innerHTML = '';
        
        if (pernoctas.length === 0) {
            console.log(' No se encontraron registros para los filtros aplicados');
            tablaBody.innerHTML = '<tr><td colspan="12" class="text-center">No hay registros de pernoctas para los filtros seleccionados.</td></tr>';
        } else {
            const usuarioActual = permisosSistema.usuario ? permisosSistema.usuario.nombre : 'Desconocido';
            console.log(` Usuario actual: ${usuarioActual}`);
            
            pernoctas.forEach((pernocta, index) => {
    console.log(` Procesando pernocta ${index + 1}:`, pernocta);
    
    const esPropietario = pernocta.Persona_Registro === usuarioActual;
    const puedeEditar = permisosSistema.puedeEditar ? permisosSistema.puedeEditar('pernoctas', pernocta) : false;
    const puedeEliminar = permisosSistema.puedeEliminar ? permisosSistema.puedeEliminar('pernoctas') : false;
    
    const esSalida = pernocta.Activo == 0 || pernocta.Tipo_Movimiento === 'salida';
    const estaDeshabilitado = esSalida; 
    
    const movimientoBadge = pernocta.Tipo_Movimiento === 'entrada' ? 
        '<span class="badge bg-success">Entrada</span>' : 
        '<span class="badge bg-primary">Salida</span>';
    
    const claseFila = estaDeshabilitado ? 'fila-deshabilitada' : '';
    
    const fila = document.createElement('tr');
    fila.className = claseFila;
    
    fila.innerHTML = `
        <td>${pernocta.Id_Pernocta || 'No especificada'}</td>
        <td>${pernocta.Fecha || 'No especificada'}</td>
        <td>${pernocta.Hora || 'No especificada'}</td>
        <td>${pernocta.Matricula || 'No especificada'}</td>
        <td>${pernocta.Equipo || 'No especificado'}</td>
        <td>${movimientoBadge}</td>
        <td>${pernocta.Procedencia || 'No especificada'}</td>
        <td>${pernocta.Destino || 'No especificada'}</td>
        <td>${pernocta.Tripulacion || 'No especificada'}</td>
        <td>${pernocta.Pasajeros || 0}</td>
        <td>
            ${pernocta.Persona_Registro || 'No especificado'}
            ${esPropietario ? '<span class="badge bg-primary ms-1">Tuyo</span>' : ''}
        </td>
        <td>
            <div class="btn-group btn-group-sm" role="group">
                <!-- Botón Generar PDF - SIEMPRE DISPONIBLE -->
                <a href="/Eolo/app/helpers/pdf_generator.php?tipo=pernocta&id=${pernocta.Id_Pernocta}" 
                   class="btn btn-danger" title="Generar PDF" target="_blank">
                    <i class="fas fa-file-pdf"></i>
                </a>
                
                <!-- Botón Editar - DESHABILITADO PARA SALIDAS -->
                <button class="btn btn-warning btn-editar" 
                        onclick="${!estaDeshabilitado ? `editarPernocta(${pernocta.Id_Pernocta})` : ''}" 
                        title="${estaDeshabilitado ? 'Las salidas no se pueden editar' : 'Editar pernocta'}"
                        ${estaDeshabilitado || !puedeEditar ? 'disabled style="opacity: 0.6;"' : ''}>
                    <i class="fas fa-edit"></i>
                </button>
                
                <!-- Botón Eliminar - DESHABILITADO PARA SALIDAS -->
                <button class="btn btn-danger btn-eliminar" 
                        onclick="${!estaDeshabilitado ? `eliminarPernocta(${pernocta.Id_Pernocta})` : ''}" 
                        title="${estaDeshabilitado ? 'Las salidas no se pueden eliminar' : 'Eliminar pernocta'}"
                        ${estaDeshabilitado || !puedeEliminar ? 'disabled style="opacity: 0.6;"' : ''}>
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </td>
    `;
    
    tablaBody.appendChild(fila);
});
        }
        
        actualizarPaginadorPernoctas();
        
    } catch (error) {
        console.error(' Error al cargar pernoctas:', error);
        tablaBody.innerHTML = `<tr><td colspan="12" class="text-center text-danger">Error al cargar los datos: ${error.message}</td></tr>`;
    }
}


function actualizarPaginadorPernoctas() {
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
            <nav aria-label="Paginación de pernoctas">
                <ul class="pagination pagination-sm mb-0">
    `;
    
    if (paginaActual > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaPernoctas(${paginaActual - 1})">
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
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaPernoctas(1)">1</a>
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
                    <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaPernoctas(${i})">${i}</a>
                </li>
            `;
        }
    }
    
    if (finPaginas < totalPaginas) {
        html += `
            ${finPaginas < totalPaginas - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaPernoctas(${totalPaginas})">${totalPaginas}</a>
            </li>
        `;
    }
    
    if (paginaActual < totalPaginas) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaPernoctas(${paginaActual + 1})">
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
 * Cambia a una página específica para pernoctas
 */
function cambiarPaginaPernoctas(pagina) {
    if (pagina >= 1 && pagina <= totalPaginas && pagina !== paginaActual) {
        paginaActual = pagina;
        cargarPernoctasDelDia();
    }
}


function mostrarExito(mensaje, callback = null) {
    const modalBody = document.getElementById('successModalBody');
    const modalTitle = document.getElementById('successModalLabel');
    
    if (modalBody && successModal) {
        
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-check-circle me-2"></i>¡Éxito! 🎉';
        }
        
        
        modalBody.innerHTML = mensaje;
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
        
        const mensajePlano = mensaje.replace(/<[^>]*>/g, '');
        alert('¡Éxito! 🎉\n' + mensajePlano);
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


function mostrarErrorPermisosEditar() {
    mostrarError('Solo puedes editar tus propios registros de pernoctas o necesitas permisos de administrador.');
}


function mostrarErrorPermisosEliminar() {
    mostrarError('Solo los administradores pueden eliminar registros de pernoctas.');
}


async function editarPernocta(id) {
    console.log(' Editando pernocta ID:', id);
    
    try {
        const response = await fetch(`/Eolo/app/controllers/pernocta_diaria_leer_id.php?id=${id}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        if (data.success && data.pernocta) {
            const pernocta = data.pernocta;
            console.log(' Datos de pernocta para editar:', pernocta);
            
            const isFormPage = document.getElementById('pernoctaForm') !== null;
            
            if (isFormPage) {
                llenarFormularioEdicion(pernocta);
            } else {
                window.location.href = `../../app/views/pernocta_diaria.html?id=${id}`;
            }
            
        } else {
            throw new Error('No se pudieron cargar los datos de la pernocta');
        }
        
    } catch (error) {
        console.error(' Error al cargar pernocta para editar:', error);
        mostrarError('Error al cargar los datos para editar: ' + error.message);
    }
}

function llenarFormularioEdicion(pernocta) {
    console.log(' Llenando formulario para edición...');
    
    isEditMode = true;
    
    document.getElementById('fecha').value = pernocta.Fecha || '';
    
    const campoHora = document.getElementById('hora');
    if (campoHora && pernocta.Hora) {
        campoHora.value = pernocta.Hora;
        console.log(' Hora del registro establecida:', pernocta.Hora);
    }
    
    document.getElementById('buscarAeronave').value = pernocta.Matricula || '';
    document.getElementById('aeronaveSeleccionada').value = pernocta.Id_Aeronave || '';
    mostrarInfoAeronave(pernocta.Id_Aeronave);
    
    if (pernocta.Tipo_Movimiento === 'entrada') {
        document.getElementById('entrada').checked = true;
    } else if (pernocta.Tipo_Movimiento === 'salida') {
        document.getElementById('salida').checked = true;
    }
    
    document.getElementById('procedencia').value = pernocta.Procedencia || '';
    document.getElementById('destino').value = pernocta.Destino || '';
    document.getElementById('tripulacion').value = pernocta.Tripulacion || '';
    document.getElementById('pasajeros').value = pernocta.Pasajeros || '0';
    document.getElementById('persona_registro').value = pernocta.Persona_Registro || '';
    
    document.getElementById('submitButton').innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display: none;"></span>
        Actualizar Pernocta
    `;
    
    const cardHeader = document.querySelector('.card-header h5');
    if (cardHeader) {
        cardHeader.innerHTML = '<i class="fas fa-edit"></i> Editar Pernocta';
    }
    
    let idInput = document.getElementById('id_pernocta');
    if (!idInput) {
        idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.id = 'id_pernocta';
        idInput.name = 'id_pernocta';
        document.getElementById('pernoctaForm').appendChild(idInput);
    }
    idInput.value = pernocta.Id_Pernocta;
    
    configurarCampoHoraParaEdicion();
    
    const cancelarBtn = document.getElementById('cancelarBtn');
    if (cancelarBtn) {
        cancelarBtn.style.display = 'block';
    }
    
    console.log('Formulario cargado para edición');
}

/**
 */
function configurarCampoHoraParaEdicion() {
    const campoHora = document.getElementById('hora');
    
    if (campoHora) {
        console.log(' Configurando campo de hora para edición...');
        
        campoHora.removeAttribute('step');
        campoHora.removeAttribute('pattern');
        
        campoHora.setAttribute('novalidate', 'true');
        campoHora.form.setAttribute('novalidate', 'true');
        
        campoHora.addEventListener('change', function() {
            console.log(' Hora modificada:', this.value);
            this.setCustomValidity(''); 
        });
        
        campoHora.addEventListener('input', function() {
            this.setCustomValidity(''); 
        });
        
        campoHora.addEventListener('invalid', function(e) {
            e.preventDefault(); // Prevenir comportamiento por defecto
            console.warn(' Validación nativa ignorada en edición');
            this.setCustomValidity(''); 
        });
        
        console.log(' Validación desactivada para campo de hora en edición');
    }
}

/**
 * Cancela la edición y regresa a la lista de pernoctas
 */
function cancelarEdicion() {
    console.log(' Cancelando y regresando a la lista...');
    
    window.location.href = '../../app/views/ver_pernocta_diaria.html';
}

/**
 * Función para editar pernocta
 */
async function editarPernocta(id) {
    console.log(' Editando pernocta ID:', id);
    
    if (!id || id === 0) {
        mostrarError('ID de pernocta no válido');
        return;
    }

    try {
        if (permisosSistema && !permisosSistema.puedeEditar('pernoctas')) {
            mostrarErrorPermisosEditar();
            return;
        }

        console.log(' Haciendo fetch a:', `/Eolo/app/controllers/pernocta_diaria_leer_id.php?id=${id}`);
        
        const response = await fetch(`/Eolo/app/controllers/pernocta_diaria_leer_id.php?id=${id}`);
        
        console.log(' Status:', response.status, 'OK:', response.ok);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.log(' Respuesta completa:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error(' Error parseando JSON:', parseError);
            throw new Error(`Respuesta no es JSON válido. ¿Hay errores PHP?`);
        }
        
        console.log(' Datos parseados:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }

        if (data.success && data.pernocta) {
            console.log(' Pernocta cargada exitosamente:', data.pernocta);
            
            window.location.href = `../../app/views/pernocta_diaria.html?id=${id}`;
            
        } else {
            throw new Error('Estructura de respuesta inesperada');
        }
        
    } catch (error) {
        console.error(' Error completo:', error);
        mostrarError('Error al cargar para editar: ' + error.message);
    }
}

/**
 * Función para eliminar pernocta
 */
async function eliminarPernocta(id) {
    if (!permisosSistema.puedeEliminar('pernoctas')) {
        mostrarErrorPermisosEliminar();
        return;
    }
    
    mostrarConfirmacionEliminar(id);
}

/**
 * Muestra modal de confirmación para eliminar
 */
function mostrarConfirmacionEliminar(id) {
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmActionBtn');
    const modalTitle = document.getElementById('confirmModalLabel');
    
    if (modalBody && confirmModal && confirmBtn) {
        modalTitle.innerHTML = '<i class="fas fa-trash-alt me-2"></i>Eliminar Registro';
        modalBody.textContent = '¿Estás seguro de que quieres eliminar este registro de pernocta? Esta acción no se puede deshacer.';
        confirmBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Eliminar';
        confirmBtn.setAttribute('data-id', id);
        confirmModal.show();
    } else {
        if (confirm('¿Estás seguro de que quieres eliminar este registro de pernocta?')) {
            eliminarPernoctaConfirmada(id);
        }
    }
}


async function eliminarPernoctaConfirmada(id) {
    if (confirmModal) {
        confirmModal.hide();
    }
    
    try {
        console.log(' Deshabilitando pernocta ID:', id);
        
        const formData = new FormData();
        formData.append('id', id);
        
        const response = await fetch('/Eolo/app/controllers/pernocta_diaria_eliminar.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarExito('Pernocta eliminada correctamente', () => {
                cargarPernoctasDelDia();
            });
        } else {
            throw new Error(data.message);
        }
        
    } catch (error) {
        console.error(' Error al eliminar pernocta:', error);
        mostrarError('Error al eliminar la pernocta: ' + error.message);
    }
}

async function enviarPernocta() {
    console.log(' Iniciando envío de pernocta...');
    
    if (!validarFormularioPernocta()) {
        return;
    }

    document.getElementById('submitButton').disabled = true;
    const spinner = document.querySelector('#submitButton .spinner-border');
    if (spinner) {
        spinner.style.display = 'inline-block';
    }

    try {
        const formData = new FormData(document.getElementById('pernoctaForm'));
        
        let url = '';
        if (isEditMode) {
            url = '/Eolo/app/controllers/pernocta_diaria_actualizar.php';
            console.log(' Modo edición activo');
        } else {
            url = '/Eolo/app/controllers/pernocta_diaria_crear.php';
            console.log(' Modo creación activo');
        }

        console.log(' URL de envío:', url);

        const aeronaveSeleccionada = document.getElementById('aeronaveSeleccionada').value;
        if (!aeronaveSeleccionada) {
            throw new Error('No se ha seleccionado una aeronave');
        }
        formData.append('id_aeronave', aeronaveSeleccionada);

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
            if (responseText.includes('éxito') || responseText.includes('success') || response.status === 200) {
                data = { success: true, message: 'Operación completada exitosamente' };
            } else {
                throw new Error(`El servidor devolvió un formato inesperado: ${responseText.substring(0, 200)}`);
            }
        }
        
        if (data.success) {
            const mensaje = data.message || (isEditMode ? 'Pernocta actualizada correctamente.' : 'Registro de pernocta guardado correctamente.');
            console.log(' Éxito:', mensaje);
            
            const idAeronave = document.getElementById('aeronaveSeleccionada').value;
            const esEntrada = document.getElementById('entrada').checked;
            const nuevoEstado = esEntrada ? 'en_hangar' : 'fuera';
            
            console.log(' Estado actualizado localmente:', { idAeronave, nuevoEstado });
            
            mostrarExito(mensaje, () => {
                window.location.href = '../../app/views/ver_pernocta_diaria.html';
            });
            
        } else {
            const errorMsg = data.message || data.error || 'Error al procesar la pernocta';
            console.error(' Error del servidor:', errorMsg);
            mostrarError(errorMsg);
        }
    } catch (error) {
        console.error(' Error en el envío:', error);
        let mensajeError = 'Ocurrió un error al conectar con el servidor. ';
        mensajeError += error.message;
        mostrarError(mensajeError);
    } finally {
        document.getElementById('submitButton').disabled = false;
        const spinnerFinal = document.querySelector('#submitButton .spinner-border');
        if (spinnerFinal) {
            spinnerFinal.style.display = 'none';
        }
    }
}
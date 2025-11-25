// Variables globales para los modales
let successModal = null;
let errorModal = null;
let confirmModal = null;

// Almacenar información de aeronaves
let aeronavesData = [];
let isEditMode = false;

let paginaActual = 1;
const registrosPorPagina = 10;
let totalPaginas = 1;
let totalRegistros = 0;

// Variables para filtros
let filtrosActivos = {
    fecha: '',
    matricula: '',
    movimiento: ''
};

let timeoutBusqueda = null;

// CORRECCIÓN DE ERRORES CRÍTICOS
console.log('🔧 Aplicando correcciones críticas...');

// 1. Corregir variable faltante
if (typeof tablaPernoctas === 'undefined') {
    var tablaPernoctas = document.getElementById('tablaPernoctas');
    console.log('✅ Variable tablaPernoctas corregida:', !!tablaPernoctas);
}

// 2. Corregir función faltante
function crearElementoEstado() {
    console.log('🔄 Creando elemento de estado...');
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

// 3. CORREGIR EL PROBLEMA PRINCIPAL DEL BOTÓN
function corregirBotonGuardar() {
    const boton = document.getElementById('submitButton');
    const formulario = document.getElementById('pernoctaForm');
    
    if (!boton || !formulario) {
        console.error('❌ No se encontró botón o formulario');
        return;
    }
    
    console.log('🔧 Corrigiendo evento del botón...');
    
    // ELIMINAR EVENTOS EXISTENTES
    const nuevoBoton = boton.cloneNode(true);
    boton.parentNode.replaceChild(nuevoBoton, boton);
    
    // ASIGNAR EVENTOS NUEVOS Y FUNCIONALES
    nuevoBoton.addEventListener('click', function(e) {
        console.log('🎯 CLICK CORREGIDO - Ejecutando enviarPernocta()');
        e.preventDefault();
        enviarPernocta();
    });
    
    nuevoBoton.addEventListener('touchend', function(e) {
        console.log('📱 TOUCH CORREGIDO - Ejecutando enviarPernocta()');
        e.preventDefault();
        enviarPernocta();
    });
    
    // También asegurar el evento submit del formulario
    formulario.addEventListener('submit', function(e) {
        console.log('📤 SUBMIT CORREGIDO - Ejecutando enviarPernocta()');
        e.preventDefault();
        enviarPernocta();
    });
    
    console.log('✅ Botón corregido exitosamente');
}

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

    // Si estamos en la página de pernoctas diarias
    if (document.getElementById('pernoctaForm')) {
        inicializarPernoctaDiaria();
    }

    // Configurar evento para el botón de confirmación de eliminación
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
        
        // SOLO feedback visual, la lógica principal va en corregirBotonGuardar
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
        
        console.log('✅ Feedback táctil configurado');
    }
}

/**
 * Función para generar reporte de control completo y redirigir
 */
async function generarReporteControlCompleto() {
    try {
        console.log('📋 Generando reporte de control completo...');
        
        // Mostrar loading
        const btnReporte = document.querySelector('.btn-control');
        const originalText = btnReporte.innerHTML;
        btnReporte.disabled = true;
        btnReporte.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

        // Obtener las ÚLTIMAS ENTRADAS de cada aeronave de TODAS LAS FECHAS
        const response = await fetch('/Eolo/app/models/obtener_entradas_control_pernocta.php');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }

        const entradas = data.entradas;
        
        if (entradas.length === 0) {
            // No hay entradas nuevas, redirigir directamente
            mostrarExito('No hay nuevas entradas para procesar. Redirigiendo al control...', () => {
                window.location.href = 'ver_control_pernoctas.html';
            });
        } else {
            console.log(`🛩️ Procesando ${entradas.length} última(s) entrada(s) de aeronaves de todas las fechas`);
            
            // ✅ OBTENER HORA ACTUAL DEL DISPOSITIVO UNA SOLA VEZ
            const ahora = new Date();
            const horaFinal = ahora.toTimeString().split(' ')[0].substring(0, 5); // Formato HH:MM
            console.log('🕐 Hora final asignada (del dispositivo):', horaFinal);
            
            // Procesar todas las últimas entradas automáticamente
            let procesadas = 0;
            let errores = 0;
            
            for (const entrada of entradas) {
                try {
                    const formData = new FormData();
                    formData.append('fecha', entrada.Fecha);
                    formData.append('hora_inicial', entrada.Hora);
                    formData.append('hora_final', horaFinal); // ✅ ENVIAR HORA DEL DISPOSITIVO AL SERVIDOR
                    formData.append('id_aeronave', entrada.Id_Aeronave);
                    formData.append('id_ultimo_registro', entrada.Id_Pernocta);
                    
                    const createResponse = await fetch('/Eolo/app/controllers/control_pernocta_crear.php', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const createData = await createResponse.json();
                    
                    if (createData.success) {
                        procesadas++;
                        console.log(`✅ Procesada última entrada para ${entrada.Matricula} - ${entrada.Fecha} ${entrada.Hora} → Hora final: ${horaFinal}`);
                    } else {
                        errores++;
                        console.error('Error procesando entrada:', entrada.Matricula, createData.message);
                    }
                } catch (error) {
                    errores++;
                    console.error('Error procesando entrada:', entrada.Matricula, error);
                }
            }
            
            let mensaje = '';
            if (procesadas > 0) {
                mensaje += `Se procesaron ${procesadas} última(s) entrada(s) de aeronaves al control. `;
            }
            if (errores > 0) {
                mensaje += `Hubo ${errores} error(es) al procesar algunas entradas. `;
            }
            
            if (mensaje) {
                mensaje += 'Redirigiendo al control...';
                mostrarExito(mensaje, () => {
                    window.location.href = 'ver_control_pernoctas.html';
                });
            } else {
                window.location.href = 'ver_control_pernoctas.html';
            }
        }
        
    } catch (error) {
        console.error('❌ Error al generar reporte de control:', error);
        mostrarError('Error al generar reporte de control: ' + error.message);
        
        // Restaurar botón
        const btnReporte = document.querySelector('.btn-control');
        btnReporte.disabled = false;
        btnReporte.innerHTML = originalText;
    }
}

function inicializarPernoctaDiaria() {
    console.log('🔄 Inicializando módulo de pernoctas diarias...');
    
    const pernoctaForm = document.getElementById('pernoctaForm');
    
    if (pernoctaForm) {
        console.log('📝 Estamos en la página de FORMULARIO');
        
        // ✅ SOLO ESTABLECER FECHA AUTOMÁTICA, HORA MANUAL
        establecerFechaActual();
        
        // Configurar campo de hora para entrada manual
        configurarCampoHoraManual();
        
        cargarAeronavesParaSelector();
        configurarBusquedaAeropuertos();
        
        // Configurar eventos del formulario
        pernoctaForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('📤 Formulario enviado (evento submit)');
            enviarPernocta();
        });
        
        // Configurar específicamente para móviles
        configurarBotonMovil();
        
        // ✅ CORREGIR EL BOTÓN PRINCIPAL
        setTimeout(corregirBotonGuardar, 500);
        
        configurarRadiosMovimiento();
        
        const urlParams = new URLSearchParams(window.location.search);
        const idPernocta = urlParams.get('id');
        if (idPernocta) {
            console.log('🔄 Cargando pernocta para edición ID:', idPernocta);
            cargarPernoctaParaEdicion(idPernocta);
        }
        
        console.log('✅ Formulario de pernoctas inicializado completamente');
    }

    // Ignorar el error de tablaPernoctas si estamos en formulario
    if (typeof tablaPernoctas !== 'undefined' && tablaPernoctas) {
        console.log('📊 Estamos en la página de LISTA');
        configurarFiltros();
        cargarPernoctasDelDia();
    }
}

/**
 * Carga una pernocta específica para edición desde URL
 */
async function cargarPernoctaParaEdicion(id) {
    try {
        console.log('🔄 Cargando pernocta para edición desde URL, ID:', id);
        
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
            console.log('✅ Pernocta cargada para edición desde URL');
        } else {
            throw new Error('No se pudieron cargar los datos de la pernocta');
        }
        
    } catch (error) {
        console.error('❌ Error al cargar pernocta para edición:', error);
        mostrarError('Error al cargar los datos para editar: ' + error.message);
    }
}

/**
 * Aplica los filtros y recarga la tabla
 */
function aplicarFiltros() {
    console.log('🔍 Aplicando filtros...');
    
    // Obtener valores actuales de los inputs
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroMovimiento = document.getElementById('filtroMovimiento');
    
    // Actualizar filtrosActivos con los valores actuales
    if (filtroFecha) {
        filtrosActivos.fecha = filtroFecha.value;
        console.log('📅 Fecha filtro:', filtrosActivos.fecha);
    }
    
    if (filtroMatricula) {
        filtrosActivos.matricula = filtroMatricula.value.trim();
        console.log('🛩️ Matrícula filtro:', filtrosActivos.matricula);
    }
    
    if (filtroMovimiento) {
        filtrosActivos.movimiento = filtroMovimiento.value;
        console.log('🔄 Movimiento filtro:', filtrosActivos.movimiento);
    }
    
    paginaActual = 1; // Resetear a primera página
    cargarPernoctasDelDia();
}

/**
 * Limpia los filtros y recarga la tabla
 */
function limpiarFiltros() {
    console.log('🧹 Limpiando filtros...');
    
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
    console.log('⚙️ Configurando eventos de filtros...');
    
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroMovimiento = document.getElementById('filtroMovimiento');
    
    // Configurar filtro de fecha
    if (filtroFecha) {
        filtroFecha.addEventListener('change', function() {
            console.log('📅 Cambio en filtro fecha:', this.value);
            filtrosActivos.fecha = this.value;
        });
    }
    
    // Configurar filtro de matrícula con debounce
    if (filtroMatricula) {
        let timeoutMatricula = null;
        filtroMatricula.addEventListener('input', function() {
            const valor = this.value.trim();
            console.log('🛩️ Input en filtro matrícula:', valor);
            
            // Limpiar timeout anterior
            if (timeoutMatricula) {
                clearTimeout(timeoutMatricula);
            }
            
            // Esperar 500ms después de que el usuario deje de escribir
            timeoutMatricula = setTimeout(() => {
                filtrosActivos.matricula = valor;
                console.log('🛩️ Matrícula actualizada:', filtrosActivos.matricula);
            }, 500);
        });
        
        // También aplicar filtro al presionar Enter
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
    
    console.log('✅ Filtros configurados:', filtrosActivos);
}


function establecerFechaActual() {
    const now = new Date();
    
    // Formatear fecha (YYYY-MM-DD)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const fechaFormatted = `${year}-${month}-${day}`;
    
    // ✅ SOLO establecer fecha automáticamente
    const campoFecha = document.getElementById('fecha');
    if (campoFecha && !isEditMode) {
        campoFecha.value = fechaFormatted;
    }
    
    console.log('📅 Fecha actual establecida:', fechaFormatted);
}

function configurarCampoHoraManual() {
    const campoHora = document.getElementById('hora');
    
    if (campoHora) {
        // En todos los navegadores, intentar abrir picker si está disponible
        campoHora.addEventListener('click', function() {
            if (this.showPicker && typeof this.showPicker === 'function') {
                try {
                    this.showPicker();
                } catch (error) {
                    console.log('ℹ️ showPicker no disponible en este navegador');
                }
            }
        });
        
        // Seleccionar texto al enfocar para fácil edición
        campoHora.addEventListener('focus', function() {
            this.select();
        });
        
        // ✅ CORREGIDO: Validación más flexible del formato de hora
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
        
        // ✅ AGREGAR: Validación también en input para feedback inmediato
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
                console.log('🕐 Usando flechas para ajustar hora manualmente');
            }
            
            // ✅ PERMITIR TECLAS ESPECIALES
            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab') {
                return; // Permitir estas teclas
            }
        });
        
        console.log('✅ Campo de hora configurado para entrada manual');
    }
}

/**
 * Configura el filtro de búsqueda de aeronaves
 */
function configurarBusquedaAeronaves() {
    const inputBusqueda = document.getElementById('buscarAeronave');
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    
    if (!inputBusqueda) {
        console.warn('⚠️ No se encontró el input de búsqueda de aeronaves');
        return;
    }
    
    // Inicializar aeronavesData si está undefined
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
    
    // Verificar que aeronavesData sea un array
    if (!Array.isArray(aeronavesData)) {
        console.error('❌ aeronavesData no es un array:', aeronavesData);
        aeronavesData = [];
    }
    
    // Filtrar aeronaves que coincidan con la búsqueda
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
                console.warn('⚠️ Aeronave inválida encontrada:', aeronave);
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
    
    // Mostrar matrícula en el input de búsqueda
    inputBusqueda.value = aeronave.Matricula;
    
    // Guardar ID en campo oculto
    aeronaveSeleccionada.value = aeronave.Id_Aeronave;
    
    // Ocultar resultados
    resultadosDiv.style.display = 'none';
    
    // Mostrar información de la aeronave seleccionada
    mostrarInfoAeronave(aeronave.Id_Aeronave);
    
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
    // Mostrar el código IATA en el input
    inputElement.value = aeropuerto.codigo_iata;
    
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
 * Carga aeronaves para el selector
 */
async function cargarAeronavesParaSelector() {
    console.log('🛩️ Cargando aeronaves para selector...');
    
    try {
        const response = await fetch('../../app/models/obtener_aeronaves.php');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Asegurar que aeronavesData sea un array
        if (Array.isArray(data)) {
            aeronavesData = data;
        } else if (data.aeronaves && Array.isArray(data.aeronaves)) {
            aeronavesData = data.aeronaves;
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            aeronavesData = Object.values(data);
        }
        
        console.log('✅ Aeronaves cargadas correctamente:', aeronavesData.length, 'aeronaves');
        
        // Configurar el filtro de búsqueda
        configurarBusquedaAeronaves();
        
    } catch (error) {
        console.error('❌ Error al cargar aeronaves:', error);
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
        console.warn('❌ No se pudo mostrar información de aeronave');
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
 * Configura los radio buttons de tipo de movimiento
 */
function configurarRadiosMovimiento() {
    const entradaRadio = document.getElementById('entrada');
    const salidaRadio = document.getElementById('salida');
    
    if (entradaRadio && salidaRadio) {
        // No necesitan configuración especial ya que son radio buttons nativos
        console.log('✅ Radio buttons de movimiento configurados');
    }
}

/**
 * Valida el formulario de pernocta
 */
function validarFormularioPernocta() {
    console.log('🔍 Validando formulario para móvil...');
    
    // Validar aeronave seleccionada
    const aeronaveSeleccionada = document.getElementById('aeronaveSeleccionada').value;
    if (!aeronaveSeleccionada) {
        console.error('❌ No se ha seleccionado aeronave');
        mostrarError('Por favor, selecciona una aeronave.');
        return false;
    }

    // Validar que se haya seleccionado un tipo de movimiento
    const entrada = document.getElementById('entrada').checked;
    const salida = document.getElementById('salida').checked;
    if (!entrada && !salida) {
        console.error('❌ No se ha seleccionado tipo de movimiento');
        mostrarError('Por favor, selecciona al menos un tipo de movimiento (Entrada o Salida).');
        return false;
    }

    // Validar campos obligatorios
    const personaRegistro = document.getElementById('persona_registro').value.trim();
    
    if (!personaRegistro) {
        mostrarError('El campo "Persona que Registra" es obligatorio.');
        return false;
    }
    
    // Validación de hora en móviles
    const hora = document.getElementById('hora').value;
    if (!hora) {
        mostrarError('Por favor, ingresa la hora del movimiento.');
        return false;
    }

    console.log('✅ Formulario válido - Listo para enviar');
    return true;
}

/**
 * Valida el estado de la aeronave antes de registrar movimiento (SOLO CREACIÓN)
 */
async function validarEstadoAeronave(idAeronave, esEntrada) {
    // ✅ CORRECCIÓN: No validar en modo edición
    if (isEditMode) {
        console.log('ℹ️ Modo edición - omitiendo validación de estado');
        return true;
    }
    
    try {
        console.log('🔄 Validando estado de aeronave ID:', idAeronave, 'Es entrada:', esEntrada);
        
        const response = await fetch(`/Eolo/app/models/obtener_estado_aeronave.php?id=${idAeronave}&t=${Date.now()}`);
        
        if (!response.ok) {
            console.warn('⚠️ Error en validación frontend, permitiendo continuar');
            return true; // Permitir continuar si hay error en validación
        }
        
        const data = await response.json();
        
        if (data.success) {
            const estado = data.estado;
            const matricula = data.matricula;
            
            console.log(`📊 Estado actual de ${matricula}: ${estado}`);
            
            if (esEntrada && estado === 'en_hangar') {
                mostrarError(`No puede registrar ENTRADA. La aeronave ${matricula} ya se encuentra en hangar.`);
                return false;
            }
            
            if (!esEntrada && estado === 'fuera') {
                mostrarError(`No puede registrar SALIDA. La aeronave ${matricula} no se encuentra en hangar.`);
                return false;
            }
            
            console.log('✅ Validación frontend exitosa');
            return true;
        } else {
            console.warn('⚠️ Error en respuesta de validación, permitiendo continuar');
            return true; // Permitir continuar si hay error
        }
    } catch (error) {
        console.error('❌ Error validando estado:', error);
        // PERMITIR CONTINUAR SI HAY ERROR EN LA VALIDACIÓN FRONTEND
        // El backend igual hará la validación final
        return true;
    }
}

/**
 * Carga las pernoctas del día
 */
async function cargarPernoctasDelDia() {
    const tablaBody = document.getElementById('cuerpoTablaPernoctas');
    if (!tablaBody) {
        console.error('❌ No se encontró el elemento cuerpoTablaPernoctas');
        return;
    }
    
    console.log('🔄 Iniciando carga de pernoctas...');
    tablaBody.innerHTML = '<tr><td colspan="12" class="text-center">Cargando registros...</td></tr>';

    try {
        // BUSCAR FECHA EN DIFERENTES ELEMENTOS (para compatibilidad)
        let fecha = '';
        
        // Intentar encontrar fechaConsulta (para pernocta_diaria.html)
        const fechaConsulta = document.getElementById('fechaConsulta');
        if (fechaConsulta) {
            fecha = fechaConsulta.value;
            console.log('📅 Usando fechaConsulta:', fecha);
        } else {
            // Intentar encontrar filtroFecha (para ver_pernocta_diaria.html)
            const filtroFecha = document.getElementById('filtroFecha');
            if (filtroFecha) {
                fecha = filtroFecha.value;
                console.log('📅 Usando filtroFecha:', fecha);
            } else {
                console.log('ℹ️ No se encontró selector de fecha, usando fecha vacía');
            }
        }
        
        filtrosActivos.fecha = fecha;   
        
        console.log(`📄 Página actual: ${paginaActual}`);
        
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

        console.log(`🌐 URL de consulta: ${url}`);
        
        const response = await fetch(url);
        
        console.log(`📨 Status de respuesta: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos recibidos del servidor:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }

        const pernoctas = data.pernoctas;
        console.log(`✅ Número de pernoctas recibidas: ${pernoctas.length}`);
        
        paginaActual = data.paginacion.pagina_actual;
        totalPaginas = data.paginacion.total_paginas;
        totalRegistros = data.paginacion.total_registros;

        console.log(`📊 Paginación: página ${paginaActual} de ${totalPaginas}, total registros: ${totalRegistros}`);

        tablaBody.innerHTML = '';
        
        if (pernoctas.length === 0) {
            console.log('ℹ️ No se encontraron registros para los filtros aplicados');
            tablaBody.innerHTML = '<tr><td colspan="12" class="text-center">No hay registros de pernoctas para los filtros seleccionados.</td></tr>';
        } else {
            const usuarioActual = permisosSistema.usuario ? permisosSistema.usuario.nombre : 'Desconocido';
            console.log(`👤 Usuario actual: ${usuarioActual}`);
            
            pernoctas.forEach((pernocta, index) => {
    console.log(`📝 Procesando pernocta ${index + 1}:`, pernocta);
    
    const esPropietario = pernocta.Persona_Registro === usuarioActual;
    const puedeEditar = permisosSistema.puedeEditar ? permisosSistema.puedeEditar('pernoctas', pernocta) : false;
    const puedeEliminar = permisosSistema.puedeEliminar ? permisosSistema.puedeEliminar('pernoctas') : false;
    
    // DETERMINAR SI ES SALIDA (Activo = 0) - NUEVA LÓGICA
    const esSalida = pernocta.Activo == 0 || pernocta.Tipo_Movimiento === 'salida';
    const estaDeshabilitado = esSalida; // Las salidas siempre están deshabilitadas
    
    // Determinar badge de movimiento
    const movimientoBadge = pernocta.Tipo_Movimiento === 'entrada' ? 
        '<span class="badge bg-success">Entrada</span>' : 
        '<span class="badge bg-primary">Salida</span>';
    
    // Clase CSS adicional para filas deshabilitadas
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
        
        // Actualizar el paginador
        actualizarPaginadorPernoctas();
        
    } catch (error) {
        console.error('❌ Error al cargar pernoctas:', error);
        tablaBody.innerHTML = `<tr><td colspan="12" class="text-center text-danger">Error al cargar los datos: ${error.message}</td></tr>`;
    }
}

/**
 * Actualiza el paginador para pernoctas
 */
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
    
    // Botón Anterior
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
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaPernoctas(1)">1</a>
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
                    <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaPernoctas(${i})">${i}</a>
                </li>
            `;
        }
    }
    
    // Página final
    if (finPaginas < totalPaginas) {
        html += `
            ${finPaginas < totalPaginas - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaPernoctas(${totalPaginas})">${totalPaginas}</a>
            </li>
        `;
    }
    
    // Botón Siguiente
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
 * Muestra error de permisos para editar
 */
function mostrarErrorPermisosEditar() {
    mostrarError('Solo puedes editar tus propios registros de pernoctas o necesitas permisos de administrador.');
}

/**
 * Muestra error de permisos para eliminar
 */
function mostrarErrorPermisosEliminar() {
    mostrarError('Solo los administradores pueden eliminar registros de pernoctas.');
}

/**
 * Función para editar pernocta
 */
async function editarPernocta(id) {
    console.log('✏️ Editando pernocta ID:', id);
    
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
            console.log('📊 Datos de pernocta para editar:', pernocta);
            
            // Verificar si estamos en la página de formulario o lista
            const isFormPage = document.getElementById('pernoctaForm') !== null;
            
            if (isFormPage) {
                // Estamos en pernocta_diaria.html - Llenar formulario
                llenarFormularioEdicion(pernocta);
            } else {
                // Estamos en ver_pernocta_diaria.html - Redirigir al formulario
                window.location.href = `../../app/views/pernocta_diaria.html?id=${id}`;
            }
            
        } else {
            throw new Error('No se pudieron cargar los datos de la pernocta');
        }
        
    } catch (error) {
        console.error('❌ Error al cargar pernocta para editar:', error);
        mostrarError('Error al cargar los datos para editar: ' + error.message);
    }
}

function llenarFormularioEdicion(pernocta) {
    console.log('📝 Llenando formulario para edición...');
    
    // Cambiar a modo edición
    isEditMode = true;
    
    // Llenar el formulario con los datos
    document.getElementById('fecha').value = pernocta.Fecha || '';
    
    // ✅ CORREGIDO: Establecer la hora del registro sin validaciones molestas
    const campoHora = document.getElementById('hora');
    if (campoHora && pernocta.Hora) {
        campoHora.value = pernocta.Hora;
        console.log('✅ Hora del registro establecida:', pernocta.Hora);
    }
    
    // Llenar aeronave
    document.getElementById('buscarAeronave').value = pernocta.Matricula || '';
    document.getElementById('aeronaveSeleccionada').value = pernocta.Id_Aeronave || '';
    mostrarInfoAeronave(pernocta.Id_Aeronave);
    
    // Llenar tipo de movimiento
    if (pernocta.Tipo_Movimiento === 'entrada') {
        document.getElementById('entrada').checked = true;
    } else if (pernocta.Tipo_Movimiento === 'salida') {
        document.getElementById('salida').checked = true;
    }
    
    // Llenar otros campos
    document.getElementById('procedencia').value = pernocta.Procedencia || '';
    document.getElementById('destino').value = pernocta.Destino || '';
    document.getElementById('tripulacion').value = pernocta.Tripulacion || '';
    document.getElementById('pasajeros').value = pernocta.Pasajeros || '0';
    document.getElementById('persona_registro').value = pernocta.Persona_Registro || '';
    
    // Cambiar texto del botón
    document.getElementById('submitButton').innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display: none;"></span>
        Actualizar Pernocta
    `;
    
    // Cambiar título del formulario
    const cardHeader = document.querySelector('.card-header h5');
    if (cardHeader) {
        cardHeader.innerHTML = '<i class="fas fa-edit"></i> Editar Pernocta';
    }
    
    // Agregar campo oculto para el ID
    let idInput = document.getElementById('id_pernocta');
    if (!idInput) {
        idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.id = 'id_pernocta';
        idInput.name = 'id_pernocta';
        document.getElementById('pernoctaForm').appendChild(idInput);
    }
    idInput.value = pernocta.Id_Pernocta;
    
    // ✅ CONFIGURAR CAMPO DE HORA ESPECIAL PARA EDICIÓN
    configurarCampoHoraParaEdicion();
    
    // Mostrar botón cancelar
    const cancelarBtn = document.getElementById('cancelarBtn');
    if (cancelarBtn) {
        cancelarBtn.style.display = 'block';
    }
    
    console.log('Formulario cargado para edición');
}

/**
 * NUEVA FUNCIÓN: Configura campo de hora específicamente para modo edición
 */
function configurarCampoHoraParaEdicion() {
    const campoHora = document.getElementById('hora');
    
    if (campoHora) {
        console.log('⚙️ Configurando campo de hora para edición...');
        
        // Remover atributos que causan validación estricta
        campoHora.removeAttribute('step');
        campoHora.removeAttribute('pattern');
        
        // Desactivar validación HTML5
        campoHora.setAttribute('novalidate', 'true');
        campoHora.form.setAttribute('novalidate', 'true');
        
        // Validación personalizada muy flexible
        campoHora.addEventListener('change', function() {
            console.log('✅ Hora modificada:', this.value);
            this.setCustomValidity(''); // Siempre limpiar validación
        });
        
        campoHora.addEventListener('input', function() {
            this.setCustomValidity(''); // Limpiar mientras escribe
        });
        
        // Si el navegador marca como inválido, ignorarlo
        campoHora.addEventListener('invalid', function(e) {
            e.preventDefault(); // Prevenir comportamiento por defecto
            console.warn('⚠️ Validación nativa ignorada en edición');
            this.setCustomValidity(''); // Forzar como válido
        });
        
        console.log('✅ Validación desactivada para campo de hora en edición');
    }
}

/**
 * Cancela la edición y regresa a la lista de pernoctas
 */
function cancelarEdicion() {
    console.log('❌ Cancelando y regresando a la lista...');
    
    window.location.href = '../../app/views/ver_pernocta_diaria.html';
}

/**
 * Función para editar pernocta
 */
async function editarPernocta(id) {
    console.log('✏️ Editando pernocta ID:', id);
    
    if (!id || id === 0) {
        mostrarError('ID de pernocta no válido');
        return;
    }

    try {
        // Verificar permisos primero
        if (permisosSistema && !permisosSistema.puedeEditar('pernoctas')) {
            mostrarErrorPermisosEditar();
            return;
        }

        console.log('🔗 Haciendo fetch a:', `/Eolo/app/controllers/pernocta_diaria_leer_id.php?id=${id}`);
        
        const response = await fetch(`/Eolo/app/controllers/pernocta_diaria_leer_id.php?id=${id}`);
        
        console.log('📨 Status:', response.status, 'OK:', response.ok);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.log('📄 Respuesta completa:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ Error parseando JSON:', parseError);
            throw new Error(`Respuesta no es JSON válido. ¿Hay errores PHP?`);
        }
        
        console.log('📊 Datos parseados:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }

        if (data.success && data.pernocta) {
            console.log('✅ Pernocta cargada exitosamente:', data.pernocta);
            
            // Redirigir al formulario de edición
            window.location.href = `../../app/views/pernocta_diaria.html?id=${id}`;
            
        } else {
            throw new Error('Estructura de respuesta inesperada');
        }
        
    } catch (error) {
        console.error('❌ Error completo:', error);
        mostrarError('Error al cargar para editar: ' + error.message);
    }
}

/**
 * Función para eliminar (deshabilitar) pernocta
 */
async function eliminarPernocta(id) {
    if (!permisosSistema.puedeEliminar('pernoctas')) {
        mostrarErrorPermisosEliminar();
        return;
    }
    
    // Mantener el mensaje original de "eliminar" para el usuario
    mostrarConfirmacionEliminar(id);
}

/**
 * Muestra modal de confirmación para eliminar (en realidad deshabilitar)
 */
function mostrarConfirmacionEliminar(id) {
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmActionBtn');
    const modalTitle = document.getElementById('confirmModalLabel');
    
    if (modalBody && confirmModal && confirmBtn) {
        // Mantener el texto original de "eliminar"
        modalTitle.innerHTML = '<i class="fas fa-trash-alt me-2"></i>Eliminar Registro';
        modalBody.textContent = '¿Estás seguro de que quieres eliminar este registro de pernocta? Esta acción no se puede deshacer.';
        confirmBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Eliminar';
        confirmBtn.setAttribute('data-id', id);
        confirmModal.show();
    } else {
        // Fallback con confirm nativo
        if (confirm('¿Estás seguro de que quieres eliminar este registro de pernocta?')) {
            eliminarPernoctaConfirmada(id);
        }
    }
}

/**
 * Función que ejecuta la deshabilitación después de la confirmación
 */
async function eliminarPernoctaConfirmada(id) {
    if (confirmModal) {
        confirmModal.hide();
    }
    
    try {
        console.log('🗑️ Deshabilitando pernocta ID:', id);
        
        const formData = new FormData();
        formData.append('id', id);
        
        const response = await fetch('/Eolo/app/controllers/pernocta_diaria_eliminar.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Mantener mensaje de "eliminado" para el usuario
            mostrarExito('Pernocta eliminada correctamente', () => {
                cargarPernoctasDelDia(); // Recargar la lista
            });
        } else {
            throw new Error(data.message);
        }
        
    } catch (error) {
        console.error('❌ Error al eliminar pernocta:', error);
        mostrarError('Error al eliminar la pernocta: ' + error.message);
    }
}

async function enviarPernocta() {
    console.log('🚀 Iniciando envío de pernocta...');
    
    // Validar formulario
    if (!validarFormularioPernocta()) {
        return;
    }

    // Mostrar loading
    document.getElementById('submitButton').disabled = true;
    const spinner = document.querySelector('#submitButton .spinner-border');
    if (spinner) {
        spinner.style.display = 'inline-block';
    }

    try {
        // Crear FormData para enviar el formulario
        const formData = new FormData(document.getElementById('pernoctaForm'));
        
        // Determinar URL según modo
        let url = '';
        if (isEditMode) {
            url = '/Eolo/app/controllers/pernocta_diaria_actualizar.php';
            console.log('📝 Modo edición activo');
        } else {
            url = '/Eolo/app/controllers/pernocta_diaria_crear.php';
            console.log('➕ Modo creación activo');
        }

        console.log('📤 URL de envío:', url);

        // Asegurar que el campo de aeronave esté incluido
        const aeronaveSeleccionada = document.getElementById('aeronaveSeleccionada').value;
        if (!aeronaveSeleccionada) {
            throw new Error('No se ha seleccionado una aeronave');
        }
        formData.append('id_aeronave', aeronaveSeleccionada);

        console.log('🔄 Enviando datos al servidor...');
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        console.log('📨 Respuesta recibida, status:', response.status);
        
        const responseText = await response.text();
        console.log('📄 Respuesta completa del servidor:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('📊 Respuesta JSON parseada:', data);
        } catch (parseError) {
            console.error('❌ Error parseando JSON:', parseError);
            if (responseText.includes('éxito') || responseText.includes('success') || response.status === 200) {
                data = { success: true, message: 'Operación completada exitosamente' };
            } else {
                throw new Error(`El servidor devolvió un formato inesperado: ${responseText.substring(0, 200)}`);
            }
        }
        
        if (data.success) {
            const mensaje = data.message || (isEditMode ? 'Pernocta actualizada correctamente.' : 'Registro de pernocta guardado correctamente.');
            console.log('✅ Éxito:', mensaje);
            
            // ✅ ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE DESPUÉS DE GUARDAR
            const idAeronave = document.getElementById('aeronaveSeleccionada').value;
            const esEntrada = document.getElementById('entrada').checked;
            const nuevoEstado = esEntrada ? 'en_hangar' : 'fuera';
            
            console.log('🔄 Estado actualizado localmente:', { idAeronave, nuevoEstado });
            
            // ✅ CORRECCIÓN: SIEMPRE REDIRIGIR A LA LISTA DESPUÉS DE GUARDAR
            mostrarExito(mensaje, () => {
                // ✅ SIEMPRE REDIRIGIR A LA LISTA, TANTO EN CREACIÓN COMO EDICIÓN
                window.location.href = '../../app/views/ver_pernocta_diaria.html';
            });
            
        } else {
            const errorMsg = data.message || data.error || 'Error al procesar la pernocta';
            console.error('❌ Error del servidor:', errorMsg);
            mostrarError(errorMsg);
        }
    } catch (error) {
        console.error('❌ Error en el envío:', error);
        let mensajeError = 'Ocurrió un error al conectar con el servidor. ';
        mensajeError += error.message;
        mostrarError(mensajeError);
    } finally {
        // Ocultar loading
        document.getElementById('submitButton').disabled = false;
        const spinnerFinal = document.querySelector('#submitButton .spinner-border');
        if (spinnerFinal) {
            spinnerFinal.style.display = 'none';
        }
    }
}
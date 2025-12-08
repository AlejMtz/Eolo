// Variables globales
let paginaActual = 1;
const registrosPorPagina = 10;
let totalPaginas = 1;
let totalRegistros = 0;

// Variables para filtros
let filtrosActivos = {
    fecha: '',
    matricula: '',
    tipo_cliente: '',
    tipo_mantenimiento: ''
};

let timeoutBusqueda = null;

let successModal = null;
let errorModal = null;
let confirmModal = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log(' DOM cargado, verificando sesión...');
    
    if (!verificarSesion()) {
        console.error(' Sesión no válida');
        return;
    }
    
    console.log('Sesión verificada, inicializando módulo...');
    
    if (document.getElementById('cuerpoTablaAsignaciones')) {
        // Página de lista
        console.log(' Inicializando página de lista...');
        inicializarAsignacionMantenimiento();
    } else if (document.getElementById('asignacionForm')) {
        // Página de edición individual
        console.log(' Inicializando página de edición...');
        inicializarPaginaEdicion();
    } else {
        console.log(' Página no reconocida');
    }
});

function inicializarAsignacionMantenimiento() {
    console.log(' Inicializando módulo de Asignación de Mantenimiento');
    
    if (typeof permisosSistema === 'undefined') {
        console.error(' CRÍTICO: permisosSistema no está disponible');
        
        const tipoUsuario = localStorage.getItem('tipo_usuario') || 'unknown';
        const esAdmin = tipoUsuario === 'admin';
        
        window.permisosSistema = {
            usuario: {
                tipo: tipoUsuario,
                nombre: localStorage.getItem('usuario_nombre') || 'Desconocido',
                logueado: localStorage.getItem('usuario_logueado') === 'true'
            },
            puedeEditar: function(modulo) { return esAdmin; },
            puedeEliminar: function(modulo) { return esAdmin; }
        };
        
        console.log(' Permisos de emergencia creados:', window.permisosSistema);
    }
    
    console.log(' Permisos cargados:', window.permisosSistema);
    console.log(' Usuario:', window.permisosSistema.usuario);
    console.log(' Puede editar:', window.permisosSistema.puedeEditar('asignacion_mantenimiento'));
    console.log(' Puede eliminar:', window.permisosSistema.puedeEliminar('asignacion_mantenimiento'));
    
    // Inicializar modales
    if (typeof bootstrap !== 'undefined') {
        successModal = new bootstrap.Modal(document.getElementById('successModal'));
        errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        
        const confirmModalElement = document.getElementById('confirmModal');
        if (confirmModalElement) {
            confirmModal = new bootstrap.Modal(confirmModalElement);
        }
    }

    // Configurar eventos
    configurarEventos();
    
    cargarAsignaciones();
}

document.addEventListener('DOMContentLoaded', function() {
    console.log(' DOM cargado, verificando sesión...');
    
    if (!verificarSesion()) {
        console.error(' Sesión no válida');
        return;
    }
    
    console.log(' Sesión verificada, inicializando módulo...');
    inicializarAsignacionMantenimiento();
});

/**
 * Configura los eventos de los filtros
 */
function configurarEventos() {
    console.log(' Configurando eventos...');
    
    // Configurar eventos de los filtros
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroCliente = document.getElementById('filtroCliente');
    const filtroMantenimiento = document.getElementById('filtroMantenimiento');
    
    if (filtroFecha) {
        filtroFecha.addEventListener('change', function() {
            filtrosActivos.fecha = this.value;
            console.log(' Filtro fecha cambiado:', this.value);
            aplicarFiltros();
        });
    }
    
    if (filtroMatricula) {
        filtroMatricula.addEventListener('input', function() {
            clearTimeout(timeoutBusqueda);
            timeoutBusqueda = setTimeout(() => {
                filtrosActivos.matricula = this.value.trim();
                console.log(' Filtro matrícula cambiado:', this.value);
                aplicarFiltros();
            }, 500);
        });
    }
    
    if (filtroCliente) {
        filtroCliente.addEventListener('change', function() {
            filtrosActivos.tipo_cliente = this.value;
            console.log(' Filtro cliente cambiado:', this.value);
            aplicarFiltros();
        });
    }
    
    if (filtroMantenimiento) {
        filtroMantenimiento.addEventListener('change', function() {
            filtrosActivos.tipo_mantenimiento = this.value;
            console.log('🔧 Filtro mantenimiento cambiado:', this.value, 'Tipo:', typeof this.value);
            aplicarFiltros();
        });
    }
    
    console.log(' Eventos configurados correctamente');
}

/**
 * Carga las asignaciones de mantenimiento
 */
async function cargarAsignaciones(pagina = 1) {
    const tablaBody = document.getElementById('cuerpoTablaAsignaciones');
    if (!tablaBody) {
        console.error(' No se encontró el elemento cuerpoTablaAsignaciones');
        return;
    }
    
    console.log(' Iniciando carga de asignaciones...');
    mostrarLoading(true);

    try {
        console.log(` Página actual: ${pagina}`);
        
        let url = `/Eolo/app/models/leer_asignacion_mantenimiento.php?pagina=${pagina}&registros_por_pagina=${registrosPorPagina}`;        
        if (filtrosActivos.fecha) {
            url += `&fecha=${filtrosActivos.fecha}`;
        }
        if (filtrosActivos.matricula) {
            url += `&matricula=${encodeURIComponent(filtrosActivos.matricula)}`;
        }
        if (filtrosActivos.tipo_cliente) {
            url += `&tipo_cliente=${filtrosActivos.tipo_cliente}`;
        }
        if (filtrosActivos.tipo_mantenimiento) {
            url += `&tipo_mantenimiento=${filtrosActivos.tipo_mantenimiento}`;
        }

        console.log(` URL de consulta: ${url}`);
        
        const response = await fetch(url);
        
        console.log(` Status de respuesta: ${response.status}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Archivo no encontrado: ${url}. Verifica que el archivo PHP exista en app/models/`);
            }
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.log(' Respuesta del servidor (primeros 500 chars):', responseText.substring(0, 500));
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log(' Datos recibidos del servidor:', data);
        } catch (parseError) {
            console.error(' Error parseando JSON:', parseError);
            throw new Error('El servidor devolvió una respuesta no válida. Verifica la consola para más detalles.');
        }
        
        if (data.success) {
            const asignaciones = data.asignaciones;
            console.log(` Número de asignaciones recibidas: ${asignaciones.length}`);
            
            paginaActual = data.paginacion.pagina_actual;
            totalPaginas = data.paginacion.total_paginas;
            totalRegistros = data.paginacion.total_registros;

            console.log(` Paginación: página ${paginaActual} de ${totalPaginas}, total registros: ${totalRegistros}`);

            mostrarAsignaciones(asignaciones);
            actualizarPaginador();
            
        } else {
            throw new Error(data.message || 'Error al cargar asignaciones');
        }
        
    } catch (error) {
        console.error(' Error al cargar asignaciones:', error);
        mostrarError('Error al cargar las asignaciones: ' + error.message);
    } finally {
        mostrarLoading(false);
    }
}

/**
 * Función para generar asignaciones automáticas
 */
async function generarAsignacionMantenimiento() {
    try {
        if (!confirm('¿Generar asignaciones automáticas para las últimas entradas de aeronaves?')) {
            return;
        }

        // Usar el selector correcto para el botón
        mostrarLoadingBtn('.btn-extraer', true);

        // Pasar explícitamente el módulo
        const response = await fetch('/Eolo/app/models/obtener_entradas_control_pernocta.php?modulo=asignacion_mantenimiento');
        
        if (!response.ok) {
            throw new Error('Error al conectar con el servidor');
        }
        
        const data = await response.json();

        console.log(' Respuesta del servidor:', data); // Para debugging

        if (!data.success) {
            throw new Error(data.message || 'Error en la respuesta del servidor');
        }

        let mensaje = '';
        
        if (!data.entradas || data.entradas.length === 0) {
            mensaje = 'No hay entradas nuevas para asignar mantenimiento.';
        } else {
            let asignacionesCreadas = 0;
            let duplicados = 0;

            console.log(`Procesando ${data.entradas.length} entradas...`);

            for (const entrada of data.entradas) {
                console.log(` Procesando aeronave: ${entrada.Matricula}, Fecha: ${entrada.Fecha}`);
                
                const formData = new FormData();
                formData.append('id_aeronave', entrada.Id_Aeronave);
                formData.append('id_ultimo_registro', entrada.Id_Pernocta);

                const crearResponse = await fetch('/Eolo/app/controllers/asignacion_mantenimiento_crear.php', {
                    method: 'POST',
                    body: formData
                });

                const crearData = await crearResponse.json();
                if (crearData.success) {
                    asignacionesCreadas++;
                    console.log(`Creada asignación para ${entrada.Matricula}`);
                } else {
                    duplicados++;
                    console.log(`Duplicado para ${entrada.Matricula}: ${crearData.message}`);
                }
            }

            if (asignacionesCreadas === 0) {
                mensaje = 'Todas las aeronaves ya tenían asignación de mantenimiento.';
            } else {
                mensaje = `Se crearon ${asignacionesCreadas} asignaciones de mantenimiento.`;
            }
            
            console.log(`📊 Resultado: ${asignacionesCreadas} creadas, ${duplicados} duplicados`);
        }

        mostrarExito(mensaje);
        cargarAsignaciones();

    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al procesar: ' + error.message);
    } finally {
        mostrarLoadingBtn('.btn-extraer', false);
    }
}


function mostrarLoadingBtn(selector, mostrar) {
    const btn = document.querySelector(selector);
    
    if (btn) {
        if (mostrar) {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Procesando...';
        } else {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-cogs me-2"></i>Obtener Entradas';
        }
    }
}

/**
 * Muestra las asignaciones en la tabla
 */
function mostrarAsignaciones(asignaciones) {
    const tbody = document.getElementById('cuerpoTablaAsignaciones');
    
    if (!asignaciones || asignaciones.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4"> <!-- Cambiado de 8 a 7 columnas -->
                    <i class="fas fa-inbox fa-2x text-muted mb-2"></i>
                    <p class="text-muted">No se encontraron asignaciones de mantenimiento</p>
                </td>
            </tr>
        `;
        return;
    }

    const puedeEditar = window.permisosSistema ? 
        window.permisosSistema.puedeEditar('asignacion_mantenimiento') : true;
    
    const puedeEliminar = window.permisosSistema ? 
        window.permisosSistema.puedeEliminar('asignacion_mantenimiento') : false;

    console.log(' Permisos aplicados en tabla:', { 
        puedeEditar, 
        puedeEliminar,
        usuario: window.permisosSistema?.usuario 
    });

    tbody.innerHTML = asignaciones.map((asignacion, index) => {
        const numeroRegistro = (paginaActual - 1) * registrosPorPagina + index + 1;
        const fechaFormateada = formatearFecha(asignacion.Fecha);
        const horaFormateada = formatearHora(asignacion.Hora);
        
        const tipoCliente = asignacion.Tipo_Cliente ? escapeHtml(asignacion.Tipo_Cliente) : 
                          '<span class="text-muted fst-italic">Por asignar</span>';
        
        const tipoMantenimiento = asignacion.Tipo_Mantenimiento ? 
                                (asignacion.Tipo_Mantenimiento === '0' ? 'Mantenimiento 0' : 'Mantenimiento 1') :
                                '<span class="text-muted fst-italic">Por asignar</span>';

        const botonesHTML = `
            <!-- Botón Editar - CON PERMISOS -->
            <button class="btn btn-warning btn-editar" 
                    onclick="editarAsignacion(${asignacion.Id_Asignacion})" 
                    title="Asignar tipo de cliente y mantenimiento"
                    data-modulo="asignacion_mantenimiento"
                    ${!puedeEditar ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : ''}>
                <i class="fas fa-edit"></i>
            </button>
            
            <!-- Botón Eliminar - SOLO ADMIN -->
            <button class="btn btn-danger btn-eliminar" 
                    onclick="eliminarAsignacion(${asignacion.Id_Asignacion})" 
                    title="Eliminar asignación"
                    data-modulo="asignacion_mantenimiento"
                    ${!puedeEliminar ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : ''}>
                <i class="fas fa-trash-alt"></i>
            </button>
        `;

        return `
            <tr>
                <td class="mobile-compact">${numeroRegistro}</td>
                <td class="mobile-compact">${fechaFormateada}</td>
                <td class="mobile-compact">${horaFormateada}</td>
                <td>${escapeHtml(asignacion.Matricula)}</td>
                <td>${escapeHtml(asignacion.Equipo)}</td>
                <td>${tipoCliente}</td>
                <td>${tipoMantenimiento}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        ${botonesHTML}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    console.log(' Tabla de asignaciones cargada con permisos aplicados');
}


function mostrarLoading(mostrar) {
    const tbody = document.getElementById('cuerpoTablaAsignaciones');
    if (mostrar) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2 text-muted">Cargando asignaciones...</p>
                </td>
            </tr>
        `;
    }
}

/**
 * Actualiza el paginador
 */
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
            <nav aria-label="Paginación de asignaciones">
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
        paginaActual = pagina;
        cargarAsignaciones(pagina);
    }
}

/**
 * Aplica los filtros
 */
function aplicarFiltros() {
    console.log(' Aplicando filtros...', filtrosActivos);
    
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroCliente = document.getElementById('filtroCliente');
    const filtroMantenimiento = document.getElementById('filtroMantenimiento');
    
    if (filtroFecha) filtrosActivos.fecha = filtroFecha.value;
    if (filtroMatricula) filtrosActivos.matricula = filtroMatricula.value.trim();
    if (filtroCliente) filtrosActivos.tipo_cliente = filtroCliente.value;
    if (filtroMantenimiento) {
        filtrosActivos.tipo_mantenimiento = filtroMantenimiento.value;
    }
    
    console.log(' Filtros activos actualizados:', filtrosActivos);
    console.log(' Tipo mantenimiento:', filtrosActivos.tipo_mantenimiento, 'Tipo:', typeof filtrosActivos.tipo_mantenimiento);
    
    paginaActual = 1;
    cargarAsignaciones();
}

/**
 * Limpia los filtros y recarga la tabla
 */
function limpiarFiltros() {
    console.log(' Limpiando filtros...');
    
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroMatricula = document.getElementById('filtroMatricula');
    const filtroCliente = document.getElementById('filtroCliente');
    const filtroMantenimiento = document.getElementById('filtroMantenimiento');
    
    if (filtroFecha) filtroFecha.value = '';
    if (filtroMatricula) filtroMatricula.value = '';
    if (filtroCliente) filtroCliente.value = '';
    if (filtroMantenimiento) filtroMantenimiento.value = '';
    
    filtrosActivos = {
        fecha: '',
        matricula: '',
        tipo_cliente: '',
        tipo_mantenimiento: ''
    };
    
    console.log(' Filtros limpiados:', filtrosActivos);
    
    paginaActual = 1;
    cargarAsignaciones();
}


function mostrarLoadingBtn(selector, mostrar) {
    const btn = document.querySelector(selector);
    
    if (btn) {
        if (mostrar) {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Procesando...';
        } else {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-cogs me-2"></i>Obtener Entradas';
        }
    }
}

/**
 * Función para editar asignación
 */
function editarAsignacion(idAsignacion) {
    console.log(' Editando/Asignando mantenimiento ID:', idAsignacion);
    
    //  SOLO ADMIN PUEDE EDITAR
    if (window.permisosSistema && !window.permisosSistema.puedeEditar('asignacion_mantenimiento')) {
        mostrarError('Solo los administradores pueden editar asignaciones de mantenimiento.');
        return;
    }

    try {
        window.location.href = `../../app/views/asignacion_mantenimiento_editar.html?id=${idAsignacion}`;
    } catch (error) {
        console.error(' Error al redirigir a edición:', error);
        mostrarError('Error al redirigir a edición: ' + error.message);
    }
}

/**
 * Inicializa la página de edición individual
 */
function inicializarPaginaEdicion() {
    console.log(' Inicializando página de edición individual...');
    
    // Configurar envío del formulario
    const asignacionForm = document.getElementById('asignacionForm');
    if (asignacionForm) {
        asignacionForm.addEventListener('submit', function(event) {
            event.preventDefault();
            actualizarAsignacion();
        });
        console.log(' Formulario configurado para envío');
    } else {
        console.error(' No se encontró el formulario asignacionForm');
    }

    // Cargar datos para edición
    cargarAsignacionParaEdicion();
}

/**
 * Carga los datos de la asignación para edición en página individual
 */
async function cargarAsignacionParaEdicion(idAsignacion = null) {
    try {
        // Obtener ID de la URL si no se proporciona
        if (!idAsignacion) {
            const urlParams = new URLSearchParams(window.location.search);
            idAsignacion = urlParams.get('id');
        }

        if (!idAsignacion) {
            throw new Error('No se proporcionó ID de asignación');
        }

        console.log(' Cargando asignación para edición ID:', idAsignacion);

        const response = await fetch(`/Eolo/app/controllers/asignacion_mantenimiento_leer_id.php?id=${idAsignacion}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(' Respuesta completa del servidor:', data);

        if (data.success && data.asignacion) {
            console.log(' Datos de la asignación recibidos:', data.asignacion);
            llenarFormularioEdicion(data.asignacion);
        } else {
            throw new Error(data.message || 'No se pudieron cargar los datos de la asignación');
        }
        
    } catch (error) {
        console.error(' Error al cargar asignación para edición:', error);
        mostrarError('Error al cargar los datos para editar: ' + error.message);
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
            window.location.href = '../../app/views/ver_asignacion_mantenimiento.html';
        }, 3000);
    }
}

/**
 * Llena el formulario con datos para edición
 */
function llenarFormularioEdicion(asignacion) {
    console.log(' Llenando formulario con datos de la asignación:', asignacion);
    
    setFieldValue('id_asignacion', asignacion.Id_Asignacion);
    setFieldValue('matricula', asignacion.Matricula);
    setFieldValue('equipo', asignacion.Equipo);
    setFieldValue('fecha', asignacion.Fecha);
    setFieldValue('hora', formatearHoraParaMostrar(asignacion.Hora));
    
    document.getElementById('fecha').readOnly = true;
    document.getElementById('hora').readOnly = true;
    document.getElementById('matricula').readOnly = true;
    document.getElementById('equipo').readOnly = true;
    
    const camposSoloLectura = ['fecha', 'hora', 'matricula', 'equipo'];
    camposSoloLectura.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.classList.add('bg-light', 'text-muted');
            campo.style.cursor = 'not-allowed';
        }
    });
    
    setFieldValue('tipo_cliente', asignacion.Tipo_Cliente);
    setFieldValue('tipo_mantenimiento', asignacion.Tipo_Mantenimiento);

    console.log(' Formulario cargado correctamente para edición');
}

/**
 * Función auxiliar para establecer valores de campos
 */
function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        const finalValue = value !== null && value !== undefined ? value : '';
        field.value = finalValue;
        console.log(` Campo ${fieldId} establecido: "${finalValue}"`);
    } else {
        console.error(` Campo no encontrado: ${fieldId}`);
    }
}


function formatearHoraParaMostrar(hora) {
    if (!hora || hora === 'null' || hora === 'undefined') {
        return '';
    }
    
    if (typeof hora === 'string' && hora.length >= 8 && hora.includes(':')) {
        return hora.substring(0, 5); // Tomar solo los primeros 5 caracteres (HH:MM)
    }
    
    return hora;
}

/**
 * Procesa el formulario de actualización
 */
async function actualizarAsignacion() {
    try {
        console.log('🔍 DIAGNÓSTICO ANTES DE ENVIAR:');
        console.log('- tipo_cliente seleccionado:', document.getElementById('tipo_cliente').value);
        console.log('- tipo_mantenimiento seleccionado:', document.getElementById('tipo_mantenimiento').value);
        console.log('- id_asignacion:', document.getElementById('id_asignacion').value);

        const formData = new FormData(document.getElementById('asignacionForm'));
        
        // VERIFICAR QUÉ SE ESTÁ ENVIANDO
        console.log(' Contenido real del FormData:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: "${value}"`);
        }
        
        // Validar formulario
        if (!validarFormularioEdicion()) {
            return;
        }
        
        const btnSubmit = document.getElementById('submitButton');
        btnSubmit.disabled = true;
        const spinner = btnSubmit.querySelector('.spinner-border');
        if (spinner) {
            spinner.style.display = 'inline-block';
        }
        
        const url = '/Eolo/app/controllers/asignacion_mantenimiento_actualizar.php';
        console.log(` Enviando a: ${url}`);
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        console.log('Respuesta del servidor recibida');
        console.log('Status:', response.status);

        const responseText = await response.text();
        console.log(' Respuesta completa:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
            console.log(' Respuesta parseada (JSON):', data);
        } catch (parseError) {
            console.error(' Error parseando JSON:', parseError);
            throw new Error('Error en la respuesta del servidor: ' + responseText.substring(0, 200));
        }
        
        if (data.success) {
            mostrarExito('Asignación actualizada correctamente', () => {
                window.location.href = '../../app/views/ver_asignacion_mantenimiento.html';
            });
        } else {
            throw new Error(data.message || 'Error desconocido del servidor');
        }
        
    } catch (error) {
        console.error(' Error al actualizar asignación:', error);
        mostrarError(error.message);
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
 * Valida el formulario de edición
 */
function validarFormularioEdicion() {
    const tipoCliente = document.getElementById('tipo_cliente').value;
    const tipoMantenimiento = document.getElementById('tipo_mantenimiento').value;
    
    if (!tipoCliente) {
        mostrarError('Por favor, seleccione el tipo de cliente.');
        return false;
    }
    
    if (!tipoMantenimiento) {
        mostrarError('Por favor, seleccione el tipo de mantenimiento.');
        return false;
    }
    
    if (!['0', '1'].includes(tipoMantenimiento)) {
        mostrarError('El tipo de mantenimiento debe ser 0 o 1.');
        return false;
    }

    console.log('✅ Formulario válido');
    return true;
}

/**
 * Cancela la edición y regresa a la lista
 */
function cancelarEdicion() {
    if (confirm('¿Estás seguro de que quieres cancelar la edición? Los cambios no guardados se perderán.')) {
        window.location.href = '../../app/views/ver_asignacion_mantenimiento.html';
    }
}


/**
 * Función para eliminar asignación
 */
async function eliminarAsignacion(idAsignacion) {
    console.log(' Eliminando asignación ID:', idAsignacion);
    
    //SOLO ADMIN PUEDE ELIMINAR
    if (window.permisosSistema && !window.permisosSistema.puedeEliminar('asignacion_mantenimiento')) {
        mostrarError('Solo los administradores pueden eliminar asignaciones de mantenimiento.');
        return;
    }

    try {
        console.log(' Obteniendo información de la asignación...');
        const infoResponse = await fetch(`../../app/controllers/asignacion_mantenimiento_leer_id.php?id=${idAsignacion}`);
        
        if (!infoResponse.ok) {
            throw new Error(`Error HTTP: ${infoResponse.status}`);
        }
        
        const infoData = await infoResponse.json();
        console.log(' Información de asignación:', infoData);

        if (!infoData.success) {
            throw new Error(infoData.message || 'No se pudo obtener información de la asignación');
        }

        const asignacion = infoData.asignacion;
        
        const mensajeConfirmacion = `
            ¿Está seguro de que desea eliminar la siguiente asignación?
            <br><br>
            <div class="alert alert-warning">
                <strong>Matrícula:</strong> ${asignacion.Matricula}<br>
                <strong>Equipo:</strong> ${asignacion.Equipo}<br>
                <strong>Fecha:</strong> ${formatearFecha(asignacion.Fecha)}<br>
                <strong>Hora:</strong> ${formatearHora(asignacion.Hora)}<br>
                <strong>Tipo Cliente:</strong> ${asignacion.Tipo_Cliente || 'Por asignar'}<br>
                <strong>Mantenimiento:</strong> ${asignacion.Tipo_Mantenimiento ? (asignacion.Tipo_Mantenimiento === '0' ? 'Mantenimiento 0' : 'Mantenimiento 1') : 'Por asignar'}
            </div>
            <small class="text-danger">
                <i class="fas fa-exclamation-triangle"></i>
                Esta acción no se puede deshacer.
            </small>
        `;

        // Mostrar confirmación
        mostrarConfirmacionEliminar(idAsignacion, mensajeConfirmacion);

    } catch (error) {
        console.error(' Error al obtener información para eliminar:', error);
        mostrarError('Error al obtener información de la asignación: ' + error.message);
    }
}

/**
 * Función que ejecuta la eliminación después de la confirmación
 */
async function eliminarAsignacionConfirmada(id) {
    console.log(' Confirmada eliminación de asignación ID:', id);
    
    // Cerrar modal de confirmación
    if (confirmModal) {
        confirmModal.hide();
    }
    
    try {
        console.log(' Enviando solicitud de eliminación...');
        
        const formData = new FormData();
        formData.append('id', id);
        
        const response = await fetch('../../app/controllers/asignacion_mantenimiento_eliminar.php', {
            method: 'POST',
            body: formData
        });
        
        console.log(' Respuesta del servidor - Status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(' Respuesta de eliminación:', data);

        if (data.success) {
            console.log(' Asignación eliminada correctamente');
            
            // Mostrar mensaje de éxito
            mostrarExito(`
                <div class="text-center">
                    <i class="fas fa-check-circle text-success fa-2x mb-3"></i>
                    <h5 class="text-success">¡Asignación Eliminada!</h5>
                    <p class="mb-0">La asignación de mantenimiento ha sido eliminada correctamente.</p>
                </div>
            `, () => {
                // Recargar la lista después de cerrar el modal
                cargarAsignaciones(paginaActual);
            });
            
        } else {
            throw new Error(data.message || 'Error al eliminar la asignación');
        }

    } catch (error) {
        console.error(' Error al eliminar asignación:', error);
        
        // Mostrar mensaje de error
        mostrarError(`
            <div class="d-flex align-items-center">
                <i class="fas fa-exclamation-triangle text-danger fa-2x me-3"></i>
                <div>
                    <h6 class="mb-1">Error al eliminar asignación</h6>
                    <p class="mb-0">${error.message}</p>
                </div>
            </div>
        `);
    }
}

/**
 * Muestra modal de confirmación para eliminar
 */
function mostrarConfirmacionEliminar(id, mensaje) {
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    if (modalBody && confirmModal && confirmBtn) {
        // Configurar modal de confirmación
        modalBody.innerHTML = mensaje;
        confirmBtn.innerHTML = '<i class="fas fa-trash-alt me-1"></i> Eliminar';
        confirmBtn.className = 'btn btn-danger';
        confirmBtn.setAttribute('data-id', id);
        
        // Configurar evento de clic
        confirmBtn.onclick = function() {
            const idAsignacion = this.getAttribute('data-id');
            eliminarAsignacionConfirmada(idAsignacion);
        };
        
        // Mostrar modal
        confirmModal.show();
    } else {
        // Fallback con confirm nativo
        console.warn('⚠️ Modal de confirmación no disponible, usando confirm nativo');
        if (confirm(mensaje.replace(/<br>/g, '\n').replace(/<[^>]*>/g, ''))) {
            eliminarAsignacionConfirmada(id);
        }
    }
}

// Funciones de utilidad
function formatearFecha(fecha) {
    if (!fecha) return '-';
    
    if (typeof fecha === 'string' && fecha.length === 10) {
        const partes = fecha.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }
    
    try {
        const date = new Date(fecha);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('es-ES');
        }
    } catch (e) {
        console.warn('Error formateando fecha:', fecha, e);
    }
    
    return fecha;
}

function formatearHora(hora) {
    if (!hora) return '-';
    
    if (typeof hora === 'string') {
        // Buscar patrón de hora HH:MM en la cadena
        const match = hora.match(/(\d{1,2}):(\d{2})/);
        if (match) {
            const horas = match[1].padStart(2, '0');
            const minutos = match[2].padStart(2, '0');
            return `${horas}:${minutos}`;
        }
    }
    
    return hora;
}
function formatearHora(hora) {
    if (!hora) return '-';
    return hora.substring(0, 5); 
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Muestra modal de éxito
 */
function mostrarExito(mensaje, callback = null) {
    const modalBody = document.getElementById('successModalBody');
    if (modalBody && successModal) {
        modalBody.innerHTML = mensaje.replace(/\n/g, '<br>');
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
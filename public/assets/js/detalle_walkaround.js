let walkaroundId = null;
let walkaroundData = null;

// Tipos de daño según el formato - CORREGIDO CON NOMBRES ACTUALES
const tiposDano = [
    { id: 'derecho', nombre: 'DERECHO' },
    { id: 'izquierdo', nombre: 'IZQUIERDO' },
    { id: 'golpe', nombre: 'GOLPE' },
    { id: 'rayon', nombre: 'RAYÓN' },
    { id: 'fisura', nombre: 'FISURA' },
    { id: 'quebrado', nombre: 'QUEBRADO' },
    { id: 'pinturaCuarteada', nombre: 'PINT. CUARTEADA' },  // ✅ CORREGIDO
    { id: 'otroDano', nombre: 'OTRO DAÑO' }  // ✅ CORREGIDO
];

// Clasificación de componentes - CORREGIDA (MISMA QUE EN CREACIÓN)
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
            { id: 'fuselaje', nombre: 'FUSELAJE' },  // ✅ CORREGIDO
            { id: 'puertas', nombre: 'PUERTAS, VENTANAS, ANTENAS, LUCES' },  // ✅ CORREGIDO
            { id: 'esqui', nombre: 'ESQUÍ / NEUMÁTICOS' },  // ✅ CORREGIDO
            { id: 'palas', nombre: 'PALAS' },
            { id: 'boom', nombre: 'BOOM' },
            { id: 'estabilizadores', nombre: 'ESTABILIZADORES' },
            { id: 'rotor', nombre: 'ROTOR DE COLA' },  // ✅ CORREGIDO
            { id: 'parabrisas', nombre: 'PARABRISAS' }  // ✅ CORREGIDO
        ]
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Obtener ID de la URL
    const urlParams = new URLSearchParams(window.location.search);
    walkaroundId = urlParams.get('id');
    
    if (!walkaroundId) {
        mostrarError('No se especificó un ID de walkaround');
        return;
    }
    
    // Cargar datos del walkaround
    cargarDetalleWalkaround();
    
    // Configurar eventos de botones
    document.getElementById('btnEditar').addEventListener('click', function() {
        window.location.href = `../app/views/componenteWk.html?id=${walkaroundId}`;
    });
    
    document.getElementById('btnEliminar').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres eliminar este walkaround? Esta acción no se puede deshacer.')) {
            eliminarWalkaround(walkaroundId);
        }
    });
});

/**
 * Carga el detalle completo del walkaround - VERSIÓN MEJORADA
 */
async function cargarDetalleWalkaround() {
    try {
        console.log('🔍 Cargando detalle del walkaround ID:', walkaroundId);
        
        const response = await fetch(`/Eolo/app/controllers/walkaround_leer_id.php?id=${walkaroundId}`);
        
        console.log('📨 Respuesta recibida, status:', response.status);
        
        // OBTENER EL TEXTO CRUDO PRIMERO
        const responseText = await response.text();
        console.log('📄 Respuesta cruda del servidor:', responseText);
        
        // Verificar si es JSON válido
        if (!responseText.trim().startsWith('{') && !responseText.trim().startsWith('[')) {
            console.error('❌ El servidor devolvió HTML en lugar de JSON');
            throw new Error('El servidor devolvió un formato incorrecto. Posible error PHP.');
        }
        
        // Intentar parsear como JSON
        const data = JSON.parse(responseText);
        console.log('📊 Datos COMPLETOS recibidos para detalles:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        walkaroundData = data;        
        
        // ⭐⭐ INFORMACIÓN DE FECHA - USANDO EL CAMPO CORREGIDO
console.log('🔍 Campo Fechahora recibido:', data.Fechahora, '(tipo:', typeof data.Fechahora + ')');

let fechaFormateada = 'No especificado';
try {
    if (data.Fechahora && data.Fechahora !== 'null' && data.Fechahora !== '0000-00-00 00:00:00') {
        fechaFormateada = new Date(data.Fechahora).toLocaleString();
        console.log('✅ Fecha formateada:', fechaFormateada);
    } else {
        console.warn('⚠️ Campo Fechahora vacío o inválido:', data.Fechahora);
    }
} catch (e) {
    console.warn('❌ Error al formatear fecha:', e);
    fechaFormateada = 'Fecha no válida';
}

document.getElementById('fechaHoraInfo').textContent = fechaFormateada;

        // Información de tipo de walkaround
        let tipoWalkaround = '';
        if (data.entrada == 1) {
            tipoWalkaround = '<span class="badge bg-success"><i class="fas fa-sign-in-alt me-1"></i>Entrada</span>';
        } else if (data.salida == 1) {
            tipoWalkaround = '<span class="badge bg-primary"><i class="fas fa-sign-out-alt me-1"></i>Salida</span>';
        } else {
            tipoWalkaround = '<span class="badge bg-secondary">No especificado</span>';
        }
        
        document.getElementById('tipoWalkaroundInfo').innerHTML = tipoWalkaround;
        document.getElementById('destinoInfo').textContent = data.Destino || 'No especificado';
        
        // Información de aeronave
        const matricula = data.Matricula || 'No especificada';
        const tipo = data.Tipo || 'No especificado';
        const equipo = data.Equipo || 'No especificado';
        const procedencia = data.Procedencia || 'No especificada';
        
        document.getElementById('aeronaveInfo').textContent = `${matricula} (${tipo})`;
        document.getElementById('equipoInfo').textContent = equipo;
        document.getElementById('procedenciaInfo').textContent = procedencia;
        
        document.getElementById('elaboroInfo').textContent = data.Elaboro || 'No especificado';
        document.getElementById('responsableInfo').textContent = data.Responsable || 'No especificado';
        document.getElementById('jefeAreaInfo').textContent = data.JefeArea || 'No especificado';
        document.getElementById('voboInfo').textContent = data.VoBo || 'No especificado';
        document.getElementById('observacionesInfo').textContent = data.observaciones || 'No hay observaciones generales';
        
        // Cargar componentes
        cargarComponentesDetalle(data.componentes || [], data.Tipo);
        
        // Cargar evidencias
        cargarEvidencias(data.evidencias || []);
        
        console.log('✅ Detalles cargados exitosamente');
        
        // ⭐⭐ IMPORTANTE: Aplicar permisos después de cargar los datos ⭐⭐
        aplicarPermisosEnDetalle();
        
     } catch (error) {
        console.error('❌ Error al cargar detalle:', error);
        mostrarError('Error al cargar los detalles: ' + error.message);
        
        // Ocultar spinners y mostrar mensaje de error
        document.getElementById('componentesContainer').innerHTML = 
            '<div class="alert alert-danger">Error al cargar los componentes: ' + error.message + '</div>';
        document.getElementById('evidenciasContainer').innerHTML = 
            '<div class="alert alert-danger">Error al cargar las evidencias: ' + error.message + '</div>';
    }
}

/**
 * Formatea la fecha para mostrarla - MISMA VERSIÓN QUE walkaround.js
 */
function formatearFecha(fechaHora) {
    if (!fechaHora) {
        return 'No especificado';
    }
    
    try {
        if (fechaHora) {
            return new Date(fechaHora).toLocaleString();
        }
    } catch (e) {
        console.warn('Error al formatear fecha:', e);
    }
    
    return 'Fecha no válida';
}
/**
 * Carga los componentes en el detalle - VERSIÓN COMPLETAMENTE CORREGIDA
 */
function cargarComponentesDetalle(componentesGuardados, tipoAeronave) {
    const container = document.getElementById('componentesContainer');
    
    console.log('🔧 Cargando componentes en detalle:', componentesGuardados);
    console.log('🛩️ Tipo de aeronave:', tipoAeronave);
    
    // Determinar el tipo de aeronave para usar la clasificación correcta
    const esHelicoptero = tipoAeronave && tipoAeronave.toLowerCase() === 'helicoptero';
    const clasificacion = esHelicoptero ? componentesPorTipo.helicoptero : componentesPorTipo.avion;
    
    console.log('📋 Usando clasificación para:', esHelicoptero ? 'helicóptero' : 'avión');
    
    // Crear un mapa de los componentes guardados para fácil acceso
    const componentesMap = {};
    componentesGuardados.forEach(comp => {
        const componenteId = comp.Identificador_Componente;
        
        console.log(`📊 Procesando componente guardado: ${componenteId}`, comp);
        
        // Usar los campos individuales directamente - CON NOMBRES CORRECTOS
        const estado = {
            derecho: comp.derecho === 1 || comp.derecho === true,
            izquierdo: comp.izquierdo === 1 || comp.izquierdo === true,
            golpe: comp.golpe === 1 || comp.golpe === true,
            rayon: comp.rayon === 1 || comp.rayon === true,
            fisura: comp.fisura === 1 || comp.fisura === true,
            quebrado: comp.quebrado === 1 || comp.quebrado === true,
            pinturaCuarteada: comp.pinturaCuarteada === 1 || comp.pinturaCuarteada === true,  // ✅ CORREGIDO
            otroDano: comp.otroDano === 1 || comp.otroDano === true  // ✅ CORREGIDO
        };
        
        componentesMap[componenteId] = estado;
        console.log(`📊 Componente ${componenteId} mapeado:`, estado);
    });
    
    console.log('🗺️ Mapa completo de componentes:', componentesMap);
    
    let html = '';
    
    // Generar cada sección en el orden correcto (A, B, C, D, E)
    const ordenSecciones = ['A', 'B', 'C', 'D', 'E'];
    
    ordenSecciones.forEach(letraSeccion => {
        const componentesSeccion = clasificacion[letraSeccion];
        
        if (componentesSeccion && componentesSeccion.length > 0) {
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
                const estado = componentesMap[componente.id] || {
                    derecho: false, izquierdo: false, golpe: false, rayon: false,
                    fisura: false, quebrado: false, pinturaCuarteada: false, otroDano: false
                };
                
                console.log(`📝 Renderizando componente: ${componente.id}`, estado);
                
                html += `
                    <tr class="${Object.values(estado).some(v => v) ? 'table-warning' : ''}">
                        <td class="component-name" style="width: 25%">
                            <strong>${componente.nombre}</strong>
                        </td>
                `;
                
                // Mostrar CHECKBOXES para cada tipo de daño
                tiposDano.forEach(tipoDano => {
                    const tieneDano = estado[tipoDano.id];
                    
                    html += `
                        <td class="text-center" style="width: 8%">
                            <input 
                                type="checkbox" 
                                class="form-check-input damage-checkbox" 
                                ${tieneDano ? 'checked' : ''}
                                disabled
                                style="transform: scale(1.2); cursor: not-allowed;"
                            >
                        </td>
                    `;
                });
                
                html += `</tr>`;
            });
            
            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
    
    // Verificar si hay componentes que no se mostraron
    const componentesMostrados = new Set();
    ordenSecciones.forEach(letra => {
        const seccion = clasificacion[letra];
        if (seccion) {
            seccion.forEach(comp => componentesMostrados.add(comp.id));
        }
    });
    
    const componentesNoMostrados = Object.keys(componentesMap).filter(id => !componentesMostrados.has(id));
    if (componentesNoMostrados.length > 0) {
        console.warn('⚠️ Componentes en BD pero no en la clasificación:', componentesNoMostrados);
    }
}

/**
 * Carga las evidencias
 */
function cargarEvidencias(evidencias) {
    const container = document.getElementById('evidenciasContainer');
    
    if (!evidencias || evidencias.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No hay evidencias registradas para este walkaround.</div>';
        return;
    }
    
    let html = '<div class="evidence-gallery">';
    
    evidencias.forEach(evidencia => {
        const ruta = evidencia.Ruta;
        const fileName = evidencia.FileName;
        const extension = fileName ? fileName.split('.').pop().toLowerCase() : '';
        const esImagen = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
        const esVideo = ['mp4', 'webm', 'ogg'].includes(extension);
        
        html += `
            <div class="evidence-item">
        `;
        
        if (esImagen) {
            html += `<img src="${ruta}" alt="${fileName}" class="img-fluid" style="height: 150px; object-fit: cover;">`;
        } else if (esVideo) {
            html += `
                <video controls style="height: 150px; width: 100%; object-fit: cover;">
                    <source src="${ruta}" type="video/${extension}">
                    Tu navegador no soporta el elemento de video.
                </video>
            `;
        } else {
            html += `
                <div class="text-center py-4" style="height: 150px;">
                    <i class="fas fa-file fa-3x text-muted"></i>
                    <div class="mt-2">${fileName}</div>
                </div>
            `;
        }
        
        html += `
                <div class="evidence-info p-2">
                    <small class="d-block">${fileName}</small>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Elimina el walkaround con verificación de permisos
 */
async function eliminarWalkaround(id) {
    // Verificar permisos primero
    if (!permisosSistema.puedeEliminar('walkarounds')) {
        mostrarError('No tienes permisos para eliminar walkarounds. Solo los administradores pueden realizar esta acción.');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('id_walk', id);

        const response = await fetch('../../app/controllers/walkaround_eliminar.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarExito('Walkaround eliminado correctamente', () => {
                window.location.href = '../../app/views/ver_walkaround.html';
            });
        } else {
            mostrarError('Error al eliminar: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Ocurrió un error al conectar con el servidor.');
    }
}

/**
 * Muestra mensaje de éxito (para consistencia)
 */
function mostrarExito(mensaje, callback = null) {
    // Puedes usar el mismo sistema de modales que en walkaround.js
    // o implementar uno simple para esta página
    alert('✅ ' + mensaje);
    if (callback) {
        callback();
    }
}

/**
 * Muestra error (para consistencia)
 */
function mostrarError(mensaje) {
    // Puedes usar el mismo sistema de modales que en walkaround.js
    // o implementar uno simple para esta página
    alert('❌ ' + mensaje);
}

/**
 * Aplica permisos en los botones de acción del detalle
 */
function aplicarPermisosEnDetalle() {
    const btnEditar = document.getElementById('btnEditar');
    const btnEliminar = document.getElementById('btnEliminar');
    
    console.log('🔐 Aplicando permisos en detalle...');
    console.log('📊 Datos del walkaround:', walkaroundData);
    
    if (btnEditar) {
        // Mismo enfoque que entregas_turno
        const esPropietario = walkaroundData.Elaboro === permisosSistema.usuario.nombre;
        const puedeEditar = permisosSistema.puedeEditar('walkarounds', walkaroundData);
        
        
        if (!puedeEditar) {
            btnEditar.disabled = true;
            btnEditar.style.opacity = '0.6';
            btnEditar.style.cursor = 'not-allowed';
            btnEditar.title = 'No tienes permisos para editar este walkaround';
            console.log('❌ Botón editar deshabilitado');
        } else {
            btnEditar.title = 'Editar walkaround';
            console.log('✅ Botón editar habilitado');
        }
    }
    
    if (btnEliminar) {
        const puedeEliminar = permisosSistema.puedeEliminar('walkarounds');
        console.log('🗑️ Permiso eliminar:', puedeEliminar);
        
        if (!puedeEliminar) {
            btnEliminar.disabled = true;
            btnEliminar.style.opacity = '0.6';
            btnEliminar.style.cursor = 'not-allowed';
            btnEliminar.title = 'Solo los administradores pueden eliminar walkarounds';
            console.log('❌ Botón eliminar deshabilitado');
        } else {
            btnEliminar.title = 'Eliminar walkaround';
            console.log('✅ Botón eliminar habilitado');
        }
    }
}
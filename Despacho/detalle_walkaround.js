// detalle_walkaround.js

let walkaroundId = null;
let walkaroundData = null;

// Componentes predefinidos para cada tipo de aeronave (COPIA EXACTA de walkaround.js)
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
        window.location.href = `componenteWk.html?id=${walkaroundId}`;
    });
    
    document.getElementById('btnEliminar').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres eliminar este walkaround? Esta acción no se puede deshacer.')) {
            eliminarWalkaround(walkaroundId);
        }
    });
});

/**
 * Carga el detalle completo del walkaround
 */
/**
 * Carga el detalle completo del walkaround - VERSIÓN MODIFICADA
 */
async function cargarDetalleWalkaround() {
    try {
        const response = await fetch(`walkaround_leer_id.php?id=${walkaroundId}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        walkaroundData = data;
        
        console.log('📊 Datos recibidos para detalles:', data);
        
        document.getElementById('fechaHoraInfo').textContent = formatearFecha(data.Fechahora);
        
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
        
    } catch (error) {
        console.error('Error al cargar detalle:', error);
        mostrarError('Error al cargar los detalles: ' + error.message);
    }
}

/**
 * Formatea la fecha para mostrarla
 */
function formatearFecha(fecha) {
    if (!fecha) return 'No especificado';
    
    try {
        const date = new Date(fecha);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return fecha;
    }
}

/**
 * Carga los componentes en el detalle con nombres completos
 */
function cargarComponentesDetalle(componentes, tipoAeronave) {
    const container = document.getElementById('componentesContainer');
    
    if (componentes.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No hay componentes registrados para este walkaround.</div>';
        return;
    }
    
    // Obtener la lista de componentes predefinidos para este tipo de aeronave
    const componentesPredefinidos = componentesPorTipo[tipoAeronave?.toLowerCase()] || [];
    
    // Crear un mapa de componentes predefinidos para fácil acceso
    const mapaComponentes = {};
    componentesPredefinidos.forEach(comp => {
        mapaComponentes[comp.id] = comp;
    });
    
    let html = '<div class="row">';
    
    componentes.forEach(comp => {
        const componenteId = comp.Componente;
        const componenteInfo = mapaComponentes[componenteId] || { 
            nombre: componenteId, 
            seccion: 'General' 
        };
        
        const estadoClass = comp.Estado == 2 ? 'estado-damage' : 'estado-ok';
        const estadoText = comp.Estado == 2 ? 'Con daño' : 'Sin daño';
        const estadoIcon = comp.Estado == 2 ? 'fa-times-circle text-danger' : 'fa-check-circle text-success';
        
        html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="component-card ${estadoClass}">
                    <h6 class="d-flex justify-content-between align-items-center">
                        ${componenteInfo.nombre}
                        <i class="fas ${estadoIcon}"></i>
                    </h6>
                    <p class="mb-1"><strong>Estado:</strong> ${estadoText}</p>
                    ${comp.Observaciones ? `
                        <p class="mb-1"><strong>Observaciones:</strong> ${comp.Observaciones}</p>
                    ` : ''}
                    <small class="text-muted">Sección: ${componenteInfo.seccion}</small>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Carga las evidencias (SIN FechaSubida)
 */
function cargarEvidencias(evidencias) {
    const container = document.getElementById('evidenciasContainer');
    
    if (evidencias.length === 0) {
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
 * Elimina el walkaround
 */
async function eliminarWalkaround(id) {
    try {
        const formData = new FormData();
        formData.append('id_walk', id);

        const response = await fetch('walkaround_eliminar.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Walkaround eliminado correctamente');
            window.location.href = 'ver_walkaround.html';
        } else {
            alert('Error al eliminar: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al conectar con el servidor.');
    }
}

/**
 * Muestra error
 */
function mostrarError(mensaje) {
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    document.getElementById('errorModalBody').textContent = mensaje;
    errorModal.show();
}
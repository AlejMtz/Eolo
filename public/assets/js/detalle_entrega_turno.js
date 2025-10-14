let entregaId = null;
let entregaData = null;

document.addEventListener('DOMContentLoaded', function() {
    // Obtener ID de la URL
    const urlParams = new URLSearchParams(window.location.search);
    entregaId = urlParams.get('id');
    
    if (!entregaId) {
        mostrarError('No se especificó un ID de entrega de turno');
        return;
    }
    
    // Cargar datos de la entrega
    cargarDetalleEntrega();
    
    // Configurar eventos de botones
    document.getElementById('btnEditar').addEventListener('click', function() {
        window.location.href = `../app/views/entrega_turno.html?id=${entregaId}`;
    });
    
    document.getElementById('btnEliminar').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres eliminar esta entrega de turno? Esta acción no se puede deshacer.')) {
            eliminarEntrega(entregaId);
        }
    });
});

/**
 * Carga el detalle completo de la entrega de turno
 */
async function cargarDetalleEntrega() {
    try {
        const response = await fetch(`/Eolo/app/controllers/entrega_turno_leer_id.php?id=${entregaId}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        entregaData = data;
        
        console.log('📊 Datos recibidos para detalles:', data);
        
        // Llenar información general
        document.getElementById('fechaInfo').textContent = formatearFecha(data.Fecha);
        document.getElementById('nombreInfo').textContent = data.Nombre || 'No especificado';
        document.getElementById('fondoInfo').textContent = data.Fondo ? parseFloat(data.Fondo).toFixed(2) : '0.00';
        document.getElementById('valesCantidadInfo').textContent = data.Vales_Gasolina || '0';
        document.getElementById('valesFolioInfo').textContent = data.Vales_Gasolina_Folio || 'No especificado';
        document.getElementById('reporteAterrizajeInfo').textContent = data.Reporte_Aterrizaje ? 'Sí' : 'No';
        document.getElementById('aterrizajesInfo').textContent = data.Aterrizajes_Cantidad || '0';
        document.getElementById('llegadasInfo').textContent = data.Total_Operaciones_Llegadas || '0';
        document.getElementById('salidasInfo').textContent = data.Total_Operaciones_Salidas || '0';
        document.getElementById('operacionesCoordinadasInfo').textContent = data.Operaciones_Coordinadas || '0';
        document.getElementById('walkAroundsInfo').textContent = data.Walk_Arounds || '0';
        document.getElementById('reporteOperacionesInfo').textContent = data.Reporte_Operaciones_Correo || 'No especificado';
        document.getElementById('paquetesHojasInfo').textContent = data.Paquetes_Hojas || '0';
        document.getElementById('cajaFuerteInfo').textContent = data.Caja_Fuerte_Contenido || 'No especificado';
        document.getElementById('firmaEntregaInfo').textContent = data.Firma_Entrega || 'No especificado';
        document.getElementById('firmaRecibeInfo').textContent = data.Firma_Recibe || 'No especificado';
        
        // Copiadoras
        document.getElementById('copiadorasFuncionaInfo').textContent = data.Copiadoras_Funciona ? 'Sí' : 'No';
        document.getElementById('tonerEstadoInfo').textContent = data.Toner_Estado === 'bueno' ? 'Bueno' : 'Malo';
        
        // Fallas
        if (data.Fallas_Comunicaciones) {
            document.getElementById('fallasComunicacionesInfo').innerHTML = `
                <strong>Fallas en Comunicaciones:</strong>
                <p class="text-danger">${data.Fallas_Comunicaciones}</p>
            `;
        }
        
        if (data.Fallas_Copiadoras) {
            document.getElementById('fallasCopiadorasInfo').innerHTML = `
                <strong>Fallas en Copiadoras:</strong>
                <p class="text-danger">${data.Fallas_Copiadoras}</p>
            `;
        }
        
        // Cargar equipos de comunicación
        cargarEquiposComunicacion(data.equipos_comunicacion || []);
        
        // Cargar equipos de oficina
        cargarEquiposOficina(data.equipos_oficina || []);
        
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
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (e) {
        return fecha;
    }
}

/**
 * Carga los equipos de comunicación
 */
function cargarEquiposComunicacion(equipos) {
    const container = document.getElementById('comunicacionesContainer');
    
    if (equipos.length === 0) {
        container.innerHTML = '<tr><td colspan="4" class="text-center">No hay equipos de comunicación registrados.</td></tr>';
        return;
    }
    
    let html = '';
    
    equipos.forEach(equipo => {
        const estado = equipo.Cargado ? 'Cargado' : (equipo.Fallas ? 'Con fallas' : 'Normal');
        const estadoClass = equipo.Fallas ? 'text-danger' : (equipo.Cargado ? 'text-success' : 'text-warning');
        
        html += `
            <tr>
                <td>${equipo.Nombre}</td>
                <td>${equipo.Cantidad}</td>
                <td class="${estadoClass}">${estado}</td>
                <td>${equipo.Observaciones || '-'}</td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Carga los equipos de oficina
 */
function cargarEquiposOficina(equipos) {
    const container = document.getElementById('oficinaContainer');
    
    if (equipos.length === 0) {
        container.innerHTML = '<tr><td colspan="4" class="text-center">No hay equipos de oficina registrados.</td></tr>';
        return;
    }
    
    let html = '';
    
    equipos.forEach(equipo => {
        // Para copiadoras, mostrar información adicional
        let infoExtra = '';
        if (equipo.Nombre === 'COPIADORAS') {
            const funciona = equipo.Funciona ? 'Sí' : 'No';
            const toner = equipo.Toner_Estado === 'bueno' ? 'Bueno' : 'Malo';
            infoExtra = `<br><small>Funciona: ${funciona}, Toner: ${toner}</small>`;
        }
        
        html += `
            <tr>
                <td>${equipo.Nombre}${infoExtra}</td>
                <td>${equipo.Existencias}</td>
                <td>${equipo.Entregadas}</td>
                <td>${equipo.Recibidas}</td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Genera PDF de la entrega de turno
 */
function generarPDF() {
    window.open(`../app/helpers/pdf_generator.php?tipo=entrega_turno&id=${entregaId}`, '_blank');
}

/**
 * Elimina la entrega de turno
 */
async function eliminarEntrega(id) {
    try {
        const formData = new FormData();
        formData.append('id_entrega', id);

        const response = await fetch('../app/views/entrega_turno_eliminar.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Entrega de turno eliminada correctamente');
            window.location.href = '../app/views/ver_entrega_turno.html';
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
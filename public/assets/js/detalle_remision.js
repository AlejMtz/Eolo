let remisionId = null;
let remisionData = null;

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    remisionId = urlParams.get('id');
    
    if (!remisionId) {
        mostrarError('No se especificó un ID de remisión');
        return;
    }
    
    console.log('🔍 Cargando detalle de remisión ID:', remisionId);
    cargarDetalleRemision();
});

async function cargarDetalleRemision() {
    try {
        console.log('📡 Solicitando datos de remisión...');
        
        const response = await fetch(`../../app/controllers/remision_leer_id.php?id=${remisionId}`);
        
        console.log('📥 Respuesta recibida, status:', response.status);
        
        // Primero obtener el texto para depuración
        const responseText = await response.text();
        console.log('📄 Respuesta del servidor (texto):', responseText);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log(' Datos parseados:', data);
        } catch (jsonError) {
            console.error(' Error al parsear JSON:', jsonError);
            console.error(' Texto que causó el error:', responseText);
            throw new Error('Respuesta inválida del servidor');
        }
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // CORRECCIÓN IMPORTANTE: Acceder a data.remision en lugar de data directamente
        if (!data.success || !data.remision) {
            throw new Error('Estructura de datos incorrecta');
        }
        
        remisionData = data.remision; // Aquí está el cambio principal
        
        console.log('✅ Datos de remisión para detalles:', remisionData);
        
        // Llenar información general
        if (document.getElementById('fechaInfo')) {
            document.getElementById('fechaInfo').textContent = formatearFecha(remisionData.Fecha);
        }
        
        if (document.getElementById('operadorInfo')) {
            document.getElementById('operadorInfo').textContent = remisionData.Operador || 'No especificado';
        }
        
        if (document.getElementById('ovInfo')) {
            document.getElementById('ovInfo').textContent = remisionData.Ov || 'No especificado';
        }
        
        if (document.getElementById('clienteInfo')) {
            document.getElementById('clienteInfo').textContent = remisionData.Cliente || 'No especificado';
        }
        
        if (document.getElementById('requisicionInfo')) {
            document.getElementById('requisicionInfo').textContent = remisionData.Requision || 'No especificado';
        }
        
        // CORRECCIÓN: Usar FormaPago o pago
        const metodoPago = remisionData.FormaPago || remisionData.pago;
        if (document.getElementById('metodoPagoInfo')) {
            document.getElementById('metodoPagoInfo').textContent = metodoPago || 'No especificado';
        }
        
        // Información de aeronave
        const matricula = remisionData.Matricula || 'No especificada';
        const equipo = remisionData.Equipo || 'No especificado';
        
        if (document.getElementById('aeronaveInfo')) {
            document.getElementById('aeronaveInfo').textContent = matricula;
        }
        
        if (document.getElementById('equipoAeronaveInfo')) {
            document.getElementById('equipoAeronaveInfo').textContent = equipo;
        }
        
        // Información de servicios
        if (document.getElementById('horaLlegadaInfo')) {
            document.getElementById('horaLlegadaInfo').textContent = remisionData.HoraLlegada || 'No especificado';
        }
        
        if (document.getElementById('horaInicialServicioInfo')) {
            document.getElementById('horaInicialServicioInfo').textContent = remisionData.HoraInicial || 'No especificado';
        }
        
        if (document.getElementById('horaFinalServicioInfo')) {
            document.getElementById('horaFinalServicioInfo').textContent = remisionData.HoraFinal || 'No especificado';
        }
        
        if (document.getElementById('lecturaInicialInfo')) {
            document.getElementById('lecturaInicialInfo').textContent = remisionData.LecInicial ? parseFloat(remisionData.LecInicial).toFixed(2) : '0.00';
        }
        
        if (document.getElementById('lecturaFinalInfo')) {
            document.getElementById('lecturaFinalInfo').textContent = remisionData.LecFinal ? parseFloat(remisionData.LecFinal).toFixed(2) : '0.00';
        }
        
        if (document.getElementById('litrosTotalesInfo')) {
            document.getElementById('litrosTotalesInfo').textContent = remisionData.LitrosTot ? parseFloat(remisionData.LitrosTot).toFixed(2) : '0.00';
        }
        
        // Información adicional
        if (document.getElementById('observacionesInfo')) {
            document.getElementById('observacionesInfo').textContent = remisionData.Observaciones || 'No especificadas';
        }
        
        if (document.getElementById('cobranzaInfo')) {
            document.getElementById('cobranzaInfo').textContent = remisionData.Cobranza || 'No especificada';
        }
        
        if (document.getElementById('serviciosComInfo')) {
            document.getElementById('serviciosComInfo').textContent = remisionData.ServiciosCom || 'No especificados';
        }
        
        console.log('✅ Detalles cargados correctamente');
        
    } catch (error) {
        console.error('❌ Error al cargar detalle:', error);
        mostrarError('Error al cargar los detalles: ' + error.message);
    }
}

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
 * Muestra error
 */
function mostrarError(mensaje) {
    const errorModalElement = document.getElementById('errorModal');
    if (errorModalElement) {
        const errorModal = new bootstrap.Modal(errorModalElement);
        document.getElementById('errorModalBody').textContent = mensaje;
        errorModal.show();
    } else {
        alert('Error: ' + mensaje);
    }
}


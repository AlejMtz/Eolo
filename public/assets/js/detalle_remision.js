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
            console.log('📊 Datos parseados:', data);
        } catch (jsonError) {
            console.error('❌ Error al parsear JSON:', jsonError);
            console.error('❌ Texto que causó el error:', responseText);
            throw new Error('Respuesta inválida del servidor');
        }
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        remisionData = data;
        
        console.log('✅ Datos recibidos para detalles:', data);
        
        // Llenar información general
        if (document.getElementById('fechaInfo')) {
            document.getElementById('fechaInfo').textContent = formatearFecha(data.Fecha);
        }
        
        if (document.getElementById('operadorInfo')) {
            document.getElementById('operadorInfo').textContent = data.Operador || 'No especificado';
        }
        
        if (document.getElementById('ovInfo')) {
            document.getElementById('ovInfo').textContent = data.Ov || 'No especificado';
        }
        
        if (document.getElementById('clienteInfo')) {
            document.getElementById('clienteInfo').textContent = data.Cliente || 'No especificado';
        }
        
        if (document.getElementById('requisicionInfo')) {
            document.getElementById('requisicionInfo').textContent = data.Requision || 'No especificado';
        }
        
        if (document.getElementById('metodoPagoInfo')) {
            document.getElementById('metodoPagoInfo').textContent = data.FormaPago || 'No especificado';
        }
        
        // Información de aeronave
        const matricula = data.Matricula || 'No especificada';
        const equipo = data.Equipo || 'No especificado';
        
        if (document.getElementById('aeronaveInfo')) {
            document.getElementById('aeronaveInfo').textContent = `${matricula}`;
        }
        
        if (document.getElementById('equipoInfo')) {
            document.getElementById('equipoAeronaveInfo').textContent = equipo;
        }
        
        // Información de servicios
        if (document.getElementById('horaLlegadaInfo')) {
            document.getElementById('horaLlegadaInfo').textContent = data.HoraLlegada || 'No especificado';
        }
        
        if (document.getElementById('horaInicialServicioInfo')) {
            document.getElementById('horaInicialServicioInfo').textContent = data.HoraInicial || 'No especificado';
        }
        
        if (document.getElementById('horaFinalServicioInfo')) {
            document.getElementById('horaFinalServicioInfo').textContent = data.HoraFinal || 'No especificado';
        }
        
        if (document.getElementById('lecturaInicialInfo')) {
            document.getElementById('lecturaInicialInfo').textContent = data.LecInicial ? parseFloat(data.LecInicial).toFixed(2) : '0.00';
        }
        
        if (document.getElementById('lecturaFinalInfo')) {
            document.getElementById('lecturaFinalInfo').textContent = data.LecFinal ? parseFloat(data.LecFinal).toFixed(2) : '0.00';
        }
        
        if (document.getElementById('litrosTotalesInfo')) {
            document.getElementById('litrosTotalesInfo').textContent = data.LitrosTot ? parseFloat(data.LitrosTot).toFixed(2) : '0.00';
        }
        
        // Información adicional
        if (document.getElementById('observacionesInfo')) {
            document.getElementById('observacionesInfo').textContent = data.Observaciones || 'No especificadas';
        }
        
        if (document.getElementById('cobranzaInfo')) {
            document.getElementById('cobranzaInfo').textContent = data.Cobranza || 'No especificada';
        }
        
        if (document.getElementById('serviciosComInfo')) {
            document.getElementById('serviciosComInfo').textContent = data.ServiciosCom || 'No especificados';
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
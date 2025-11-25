// Variables globales
let datosRelacion = null;
let fechaInicioGlobal = null;
let fechaFinGlobal = null;

// Modales
let successModal = null;
let errorModal = null;

// Estado responsivo
let esMovil = false;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar modales
    if (typeof bootstrap !== 'undefined') {
        successModal = new bootstrap.Modal(document.getElementById('successModal'));
        errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    }
    
    // Detectar si es móvil
    detectarDispositivo();
    
    // Ajustar interfaz según el dispositivo
    ajustarInterfazResponsiva();
    
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', manejarRedimensionamiento);
});

/**
 * Detecta el tipo de dispositivo
 */
function detectarDispositivo() {
    esMovil = window.innerWidth <= 768;
}

/**
 * Ajusta la interfaz según el dispositivo
 */
function ajustarInterfazResponsiva() {
    const botones = document.querySelectorAll('.btn .btn-text');
    
    if (esMovil) {
        // En móviles: ocultar textos largos en botones
        botones.forEach(texto => {
            if (!texto.closest('.btn').classList.contains('btn-text-important')) {
                texto.style.display = 'none';
            }
        });
    } else {
        // En desktop: mostrar todos los textos
        botones.forEach(texto => {
            texto.style.display = 'inline';
        });
    }
}

/**
 * Genera la relación de mantenimiento para el período seleccionado
 */
async function generarRelacion() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    if (!fechaInicio || !fechaFin) {
        mostrarError('Por favor, selecciona ambas fechas (inicio y fin).');
        return;
    }
    
    if (fechaInicio > fechaFin) {
        mostrarError('La fecha de inicio no puede ser mayor que la fecha de fin.');
        return;
    }

    try {
        // Mostrar loading
        document.getElementById('loading').style.display = 'block';
        document.getElementById('resultados').style.display = 'none';
        document.getElementById('sinResultados').style.display = 'none';
        
        const response = await fetch(`/Eolo/app/models/obtener_relacion_mantenimiento.php?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }
        
        // Guardar datos globalmente
        datosRelacion = data;
        fechaInicioGlobal = fechaInicio;
        fechaFinGlobal = fechaFin;
        
        // Mostrar resultados
        mostrarResultados(data);
        
        // Habilitar botón CSV
        document.getElementById('btnCSV').disabled = false;
        
    } catch (error) {
        console.error('Error al generar relación:', error);
        mostrarError('Error al generar la relación: ' + error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

/**
 * Muestra los resultados en la tabla
 */
function mostrarResultados(data) {
    const cuerpoTabla = document.getElementById('cuerpoTablaRelacion');
    const tituloResultados = document.getElementById('tituloResultados');
    const resumenRegistros = document.getElementById('resumenRegistros');
    const resumenRegistrosMobile = document.getElementById('resumenRegistrosMobile');
    
    // Formatear fechas
    const fechaInicio = data.fecha_inicio.split('-').reverse().join('/');
    const fechaFin = data.fecha_fin.split('-').reverse().join('/');
    const totalRegistros = data.total_registros;
    
    tituloResultados.textContent = `Período: ${fechaInicio} al ${fechaFin}`;
    
    // Resumen responsivo
    const textoResumen = `${totalRegistros} registros encontrados`;
    resumenRegistros.textContent = textoResumen;
    if (resumenRegistrosMobile) {
        resumenRegistrosMobile.textContent = textoResumen;
    }
    
    // Limpiar tabla
    cuerpoTabla.innerHTML = '';
    
    if (data.mantenimientos.length === 0) {
        document.getElementById('sinResultados').style.display = 'block';
        return;
    }
    
    // Llenar tabla con datos
    data.mantenimientos.forEach(mantenimiento => {
        const fila = document.createElement('tr');
        
        const tipoMantenimiento = mantenimiento.Tipo_Mantenimiento === '0' ? 
            '<span class="badge bg-warning">Mantenimiento 0</span>' : 
            '<span class="badge bg-danger">Mantenimiento 1</span>';
        
        const ultimaFecha = mantenimiento.Fecha_Ultimo_Registro ? 
            formatearFecha(mantenimiento.Fecha_Ultimo_Registro) : 'N/A';
        
        fila.innerHTML = `
            <td><strong>${mantenimiento.Matricula}</strong></td>
            <td>${mantenimiento.Equipo}</td>
            <td>${mantenimiento.Tipo_Cliente || 'No especificado'}</td>
            <td class="text-center">${tipoMantenimiento}</td>
            <td class="text-center">
                <span class="badge bg-primary">${mantenimiento.Total_Registros}</span>
            </td>
            <td class="text-center">${ultimaFecha}</td>
        `;
        
        cuerpoTabla.appendChild(fila);
    });
    
    document.getElementById('resultados').style.display = 'block';
    
    // Mostrar indicador de scroll en móviles
    if (esMovil) {
        mostrarIndicadorScroll();
    }
}

/**
 * Muestra indicador de scroll para móviles
 */
function mostrarIndicadorScroll() {
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
        scrollHint.style.display = 'block';
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            scrollHint.style.display = 'none';
        }, 5000);
    }
}

/**
 * Genera el CSV de la relación
 */
async function generarCSV() {
    if (!datosRelacion || !fechaInicioGlobal || !fechaFinGlobal) {
        mostrarError('No hay datos para generar el CSV. Primero genera una relación.');
        return;
    }
    
    try {
        // Mostrar mensaje de generación responsivo
        if (esMovil) {
            mostrarExito('Generando CSV... El archivo se descargará automáticamente.');
        }
        
        // Abrir CSV en nueva pestaña
        const url = `/Eolo/app/controllers/generar_csv_mantenimiento.php?fecha_inicio=${fechaInicioGlobal}&fecha_fin=${fechaFinGlobal}`;
        window.open(url, '_blank');
        
    } catch (error) {
        console.error('Error al generar CSV:', error);
        mostrarError('Error al generar el CSV: ' + error.message);
    }
}

/**
 * Limpia los filtros y resultados
 */
function limpiarFiltros() {
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value = '';
    document.getElementById('resultados').style.display = 'none';
    document.getElementById('sinResultados').style.display = 'block';
    document.getElementById('btnCSV').disabled = true;
    datosRelacion = null;
    
    // Ocultar indicador de scroll en móviles
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
        scrollHint.style.display = 'none';
    }
    
    // Restablecer fechas por defecto
    inicializarFechasPorDefecto();
}

/**
 * Muestra mensaje de éxito
 */
function mostrarExito(mensaje) {
    const modalBody = document.getElementById('successModalBody');
    if (modalBody && successModal) {
        modalBody.textContent = mensaje;
        
        // Ajustar modal para móviles
        if (esMovil) {
            const modal = document.getElementById('successModal');
            const modalDialog = modal.querySelector('.modal-dialog');
            modalDialog.classList.add('modal-sm');
        }
        
        successModal.show();
    } else {
        alert('Éxito: ' + mensaje);
    }
}

/**
 * Muestra mensaje de error
 */
function mostrarError(mensaje) {
    const modalBody = document.getElementById('errorModalBody');
    if (modalBody && errorModal) {
        modalBody.textContent = mensaje;
        
        // Ajustar modal para móviles
        if (esMovil) {
            const modal = document.getElementById('errorModal');
            const modalDialog = modal.querySelector('.modal-dialog');
            modalDialog.classList.add('modal-sm');
        }
        
        errorModal.show();
    } else {
        alert('Error: ' + mensaje);
    }
}

/**
 * Función auxiliar para inicializar fechas
 */
function inicializarFechasPorDefecto() {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    document.getElementById('fechaInicio').value = primerDiaMes.toISOString().split('T')[0];
    document.getElementById('fechaFin').value = ultimoDiaMes.toISOString().split('T')[0];
}

/**
 * Maneja el evento de redimensionamiento de ventana
 */
function manejarRedimensionamiento() {
    const anteriorEsMovil = esMovil;
    detectarDispositivo();
    
    // Solo reajustar si cambió el tipo de dispositivo
    if (anteriorEsMovil !== esMovil) {
        ajustarInterfazResponsiva();
    }
}

/**
 * Formatea fecha
 */
function formatearFecha(fecha) {
    if (!fecha) return '-';
    
    if (typeof fecha === 'string' && fecha.length === 10) {
        const partes = fecha.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }
    
    return fecha;
}
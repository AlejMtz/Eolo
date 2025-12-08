let datosRelacion = null;
let fechaInicioGlobal = null;
let fechaFinGlobal = null;

let successModal = null;
let errorModal = null;

let esMovil = false;

document.addEventListener('DOMContentLoaded', function() {
    if (typeof bootstrap !== 'undefined') {
        successModal = new bootstrap.Modal(document.getElementById('successModal'));
        errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    }
    
    detectarDispositivo();
    
    ajustarInterfazResponsiva();
    
    window.addEventListener('resize', manejarRedimensionamiento);
});


function detectarDispositivo() {
    esMovil = window.innerWidth <= 768;
}


function ajustarInterfazResponsiva() {
    const botones = document.querySelectorAll('.btn .btn-text');
    
    if (esMovil) {
        botones.forEach(texto => {
            if (!texto.closest('.btn').classList.contains('btn-text-important')) {
                texto.style.display = 'none';
            }
        });
    } else {
        botones.forEach(texto => {
            texto.style.display = 'inline';
        });
    }
}


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
        document.getElementById('loading').style.display = 'block';
        document.getElementById('resultados').style.display = 'none';
        document.getElementById('sinResultados').style.display = 'none';
        
        const response = await fetch(`/Eolo/app/models/obtener_relacion_pernoctas.php?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }
        
        datosRelacion = data;
        fechaInicioGlobal = fechaInicio;
        fechaFinGlobal = fechaFin;
        
        mostrarResultados(data);
        
        document.getElementById('btnPDF').disabled = false;
        
    } catch (error) {
        console.error('Error al generar relación:', error);
        mostrarError('Error al generar la relación: ' + error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}


function mostrarResultados(data) {
    const cuerpoTabla = document.getElementById('cuerpoTablaRelacion');
    const tituloResultados = document.getElementById('tituloResultados');
    const resumenDias = document.getElementById('resumenDias');
    const resumenDiasMobile = document.getElementById('resumenDiasMobile');
    
    const fechaInicio = data.fecha_inicio.split('-').reverse().join('/');
    const fechaFin = data.fecha_fin.split('-').reverse().join('/');
    const totalDias = data.total_dias_periodo;
    
    tituloResultados.textContent = `Período: ${fechaInicio} al ${fechaFin}`;
    
    const textoResumen = `${totalDias} días en el período`;
    resumenDias.textContent = textoResumen;
    if (resumenDiasMobile) {
        resumenDiasMobile.textContent = textoResumen;
    }
    
    cuerpoTabla.innerHTML = '';
    
    if (data.aeronaves.length === 0) {
        document.getElementById('sinResultados').style.display = 'block';
        return;
    }
    
    data.aeronaves.forEach(aeronave => {
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td><strong>${aeronave.matricula}</strong></td>
            <td>${aeronave.equipo}</td>
            <td class="text-center">
                <span class="badge bg-success">${aeronave.total_dias_hangar}</span>
            </td>
            <td class="text-center">
                <span class="badge bg-danger">${aeronave.total_dias_fuera}</span>
            </td>
            <td class="text-center">
                <strong>${aeronave.total_dias}</strong>
            </td>
        `;
        
        cuerpoTabla.appendChild(fila);
    });
    
    document.getElementById('resultados').style.display = 'block';
    
    if (esMovil) {
        mostrarIndicadorScroll();
    }
}

/**
 * Muestra indicador de scroll
 */
function mostrarIndicadorScroll() {
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
        scrollHint.style.display = 'block';
        
        setTimeout(() => {
            scrollHint.style.display = 'none';
        }, 5000);
    }
}


async function generarPDF() {
    if (!datosRelacion || !fechaInicioGlobal || !fechaFinGlobal) {
        mostrarError('No hay datos para generar el PDF. Primero genera una relación.');
        return;
    }
    
    try {
        if (esMovil) {
            mostrarExito('Generando PDF... Se abrirá en una nueva pestaña.');
        }
        
        const url = `/Eolo/app/helpers/pdf_generator.php?tipo=relacion_mensual&fecha_inicio=${fechaInicioGlobal}&fecha_fin=${fechaFinGlobal}`;
        window.open(url, '_blank');
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        mostrarError('Error al generar el PDF: ' + error.message);
    }
}


function limpiarFiltros() {
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value = '';
    document.getElementById('resultados').style.display = 'none';
    document.getElementById('sinResultados').style.display = 'block';
    document.getElementById('btnPDF').disabled = true;
    datosRelacion = null;
    
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
        scrollHint.style.display = 'none';
    }
    
    inicializarFechasPorDefecto();
}


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


function mostrarError(mensaje) {
    const modalBody = document.getElementById('errorModalBody');
    if (modalBody && errorModal) {
        modalBody.textContent = mensaje;
        
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


function inicializarFechasPorDefecto() {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    document.getElementById('fechaInicio').value = primerDiaMes.toISOString().split('T')[0];
    document.getElementById('fechaFin').value = ultimoDiaMes.toISOString().split('T')[0];
}


function manejarRedimensionamiento() {
    const anteriorEsMovil = esMovil;
    detectarDispositivo();
    
    if (anteriorEsMovil !== esMovil) {
        ajustarInterfazResponsiva();
    }
}
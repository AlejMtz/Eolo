// entrega_turno.js - CRUD completo para Entrega de Turno

// Variables globales para los modales
let successModal = null;
let errorModal = null;
let confirmModal = null;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar modales de Bootstrap
    if (typeof bootstrap !== 'undefined') {
        successModal = new bootstrap.Modal(document.getElementById('successModal'));
        errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    }

    // Detecta si estamos en la página de listado
    if (document.getElementById('tablaTurnos')) {
        cargarEntregasTurno();
    }

    // Detecta si estamos en la página del formulario
    if (document.getElementById('formEntregaTurno')) {
        configurarFormulario();
    }

    // Configurar evento para el botón de confirmación de eliminación
    const confirmBtn = document.getElementById('confirmActionBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (id) {
                eliminarEntregaConfirmada(id);
            }
        });
    }
});

/**
 * Configura el formulario de entrega de turno
 */
function configurarFormulario() {
    const formulario = document.getElementById('formEntregaTurno');
    
    // Si el formulario existe, configurar el evento submit
    if (formulario) {
        formulario.addEventListener('submit', function(event) {
            event.preventDefault();
            guardarEntregaTurno();
        });
    }

    // Comprobar si hay un ID en la URL para cargar datos en el formulario de edición
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        cargarEntregaParaEditar(id);
    }

    // Configurar valores por defecto para la fecha
    const fechaInput = document.getElementById('fecha');
    if (fechaInput && !fechaInput.value) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.value = today;
    }
}

/**
 * Guarda o actualiza una entrega de turno
 */
function guardarEntregaTurno() {
    const formData = new FormData(document.getElementById('formEntregaTurno'));
    const id_entrega = document.getElementById('id_entrega') ? document.getElementById('id_entrega').value : '';
    
    const url = id_entrega ? 'entrega_turno_actualizar.php' : 'entrega_turno_crear.php';
    
    // DEBUG: Mostrar todos los datos del formulario
    console.log('=== DATOS DEL FORMULARIO ===');
    for (let [key, value] of formData.entries()) {
        console.log(key + ': ' + value);
    }
    console.log('============================');
    
    // Mostrar loading
    const btnGuardar = document.getElementById('btnGuardar');
    const originalText = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    btnGuardar.disabled = true;

    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(text => {
        console.log('Respuesta del servidor:', text);
        try {
            const data = JSON.parse(text);
            if (data.success) {
                mostrarExito(data.success, () => {
                    window.location.href = 'ver_entrega_turno.html';
                });
            } else {
                mostrarError(data.error || 'Error desconocido al guardar.');
            }
        } catch (e) {
            console.error('Error parsing JSON:', e);
            mostrarError('Error en la respuesta del servidor. Ver consola para detalles.');
        }
    })
    .catch(error => {
        console.error('Error completo:', error);
        mostrarError('Error de conexión: ' + error.message);
    })
    .finally(() => {
        if (btnGuardar) {
            btnGuardar.innerHTML = originalText;
            btnGuardar.disabled = false;
        }
    });
}

/**
 * Recopila todos los datos del formulario y los agrega al FormData
 */
function recopilarDatosFormulario(formData) {
    // Datos principales
    const camposPrincipales = [
        'fecha', 'nombre', 'fondo_recibido', 'fondo_entregado', 'vales_gasolina', 'vales_folio',
        'aterrizajes_cantidad', 'llegadas', 'salidas', 'reporte_operaciones', 
        'operaciones_coordinadas', 'walk_arounds', 'caja_fuerte', 'fallas_comunicaciones',
        'fallas_copiadoras', 'paquetes_hojas', 'firma_entrega', 'firma_recibe'
    ];

    camposPrincipales.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) {
            formData.append(campo, elemento.value);
        }
    });

    // Radio buttons para reporte de aterrizajes
    const reporteAterrizaje = document.querySelector('input[name="reporte_aterrizajes"]:checked');
    if (reporteAterrizaje) {
        formData.append('reporte_aterrizaje', reporteAterrizaje.value);
    }

    // Equipos de comunicación - checkboxes y radios
    const equiposComunicacion = [
        { prefijo: 'celular', cantidad: 1 },
        { prefijo: 'radio_motorola', cantidad: 2 },
        { prefijo: 'radio_vhf_portatil', cantidad: 2 },
        { prefijo: 'radio_vhf_fijo', cantidad: 1 }
    ];

    equiposComunicacion.forEach(equipo => {
        // Checkbox de entregado
        const entregado = document.getElementById(`${equipo.prefijo}_entregado`);
        if (entregado && entregado.checked) {
            formData.append(`${equipo.prefijo}_entregado`, '1');
        }

        // Radio buttons de estado (cargado/fallas)
        const estado = document.querySelector(`input[name="${equipo.prefijo}_cargado"]:checked`) || 
                      document.querySelector(`input[name="${equipo.prefijo}_fallas"]:checked`);
        if (estado) {
            formData.append(`${equipo.prefijo}_cargado`, estado.value);
        }
    });

    // Equipos de oficina
    const equiposOficina = ['engrapadoras', 'perforadoras'];
    equiposOficina.forEach(equipo => {
        const entregadas = document.getElementById(`${equipo}_entregadas`);
        const recibidas = document.getElementById(`${equipo}_recibidas`);
        
        if (entregadas) formData.append(`${equipo}_entregadas`, entregadas.value);
        if (recibidas) formData.append(`${equipo}_recibidas`, recibidas.value);
    });

    // ID de entrega si existe (para actualización)
    const idEntrega = document.getElementById('id_entrega');
    if (idEntrega && idEntrega.value) {
        formData.append('id_entrega', idEntrega.value);
    }
}

/**
 * Carga los datos de una entrega para editar
 */
/**
 * Carga los datos de una entrega para editar
 */
function cargarEntregaParaEditar(id) {
    console.log('🔍 Cargando entrega ID:', id);
    
    const btnGuardar = document.getElementById('btnGuardar');
    const originalText = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
    btnGuardar.disabled = true;

    fetch(`entrega_turno_leer_id.php?id=${id}&t=${Date.now()}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }

        console.log('✅ Datos recibidos:', data);
        
        // DEBUG: Mostrar estructura completa
        console.log('🔍 ESTRUCTURA COMPLETA DE DATOS:');
        console.log('Campos principales:', Object.keys(data));
        if (data.equipos_comunicacion) {
            console.log('Equipos comunicación:', data.equipos_comunicacion);
        }
        if (data.equipos_oficina) {
            console.log('Equipos oficina:', data.equipos_oficina);
        }

        // Llenar formulario principal
        setValue('id_entrega', data.Id_EntregaTurno);
        setValue('fecha', data.Fecha);
        setValue('nombre', data.Nombre);
        setValue('fondo-recibido', data.Fondo);
        setValue('fondo-entregado', data.Fondo);
        setValue('vales-cantidad', data.Vales_Gasolina);
        setValue('vales-folio', data.Vales_Gasolina_Folio);
        setValue('aterrizajes-cantidad', data.Aterrizajes_Cantidad);
        setValue('llegadas', data.Total_Operaciones_Llegadas);
        setValue('salidas', data.Total_Operaciones_Salidas);
        setValue('reporte-operaciones', data.Reporte_Operaciones_Correo);
        setValue('operaciones-coordinadas', data.Operaciones_Coordinadas);
        setValue('walk-arounds', data.Walk_Arounds);
        setValue('caja-fuerte', data.Caja_Fuerte_Contenido);
        setValue('fallas-comunicaciones', data.Fallas_Comunicaciones);
        setValue('fallas-copiadoras', data.Fallas_Copiadoras);
        setValue('paquetes-hojas', data.Paquetes_Hojas);
        setValue('firma-entregador', data.Firma_Entrega);
        setValue('firma-receptor', data.Firma_Recibe);

        // Radio button para reporte de aterrizajes
        if (data.Reporte_Aterrizaje !== null && data.Reporte_Aterrizaje !== undefined) {
            const valor = data.Reporte_Aterrizaje ? 'si' : 'no';
            setRadioValue('reporte_aterrizajes', valor);
        }

        // Cargar equipos de comunicación
        if (data.equipos_comunicacion && Array.isArray(data.equipos_comunicacion)) {
            cargarEquiposComunicacion(data.equipos_comunicacion);
        } else {
            console.warn('⚠️ No se encontraron equipos de comunicación');
        }

        // Cargar equipos de oficina
        if (data.equipos_oficina && Array.isArray(data.equipos_oficina)) {
            cargarEquiposOficina(data.equipos_oficina);
        } else {
            console.warn('⚠️ No se encontraron equipos de oficina');
        }
        // CARGAR COPIADORAS Y TONER - NUEVO CÓDIGO
        if (data.Copiadoras_Funciona !== null && data.Copiadoras_Funciona !== undefined) {
            const valorCopiadoras = data.Copiadoras_Funciona ? 'si' : 'no';
            setRadioValue('copiadoras_funciona', valorCopiadoras);
        }
        
        if (data.Toner_Estado) {
            setRadioValue('toner', data.Toner_Estado); // 'bueno' o 'malo'
        }

        // Cambiar estilo del botón
        btnGuardar.textContent = 'Actualizar Entrega';
        btnGuardar.classList.remove('btn-primary');
        btnGuardar.classList.add('btn-warning');
        
        console.log('✅ Formulario llenado exitosamente');

    })
    .catch(error => {
        console.error('❌ Error al cargar datos:', error);
        mostrarError('Error al cargar los datos: ' + error.message);
    })
    .finally(() => {
        btnGuardar.innerHTML = originalText;
        btnGuardar.disabled = false;
    });
}

/**
 * Carga los equipos de comunicación en el formulario
 */
/**
 * Carga los equipos de comunicación en el formulario
 */
function cargarEquiposComunicacion(equipos) {
    console.log('📱 Cargando equipos comunicación:', equipos);
    
    equipos.forEach(equipo => {
        const nombre = equipo.Nombre;
        console.log(`Procesando equipo: ${nombre}`, equipo);
        
        // Para los equipos de comunicación, asumimos que si existe el registro, está entregado
        const entregado = true; // Siempre true porque el registro existe
        
        switch(nombre) {
            case 'CELULAR ZTE':
                setCheckboxValue('celular-entregado', entregado);
                setCheckboxValue('celular-cargado', equipo.Cargado === 1 || equipo.Cargado === '1');
                break;
                
            case 'RADIO MOTOROLA':
                setCheckboxValue('radio-motorola-entregado', entregado);
                if (equipo.Cargado === 1 || equipo.Cargado === '1') {
                    setRadioValue('radio_motorola_cargado', 'si');
                } else {
                    setRadioValue('radio_motorola_cargado', 'no');
                }
                break;
                
            case 'RADIO VHF Portátil':
                setCheckboxValue('radio-vhf-portatil-entregado', entregado);
                if (equipo.Cargado === 1 || equipo.Cargado === '1') {
                    setRadioValue('radio_vhf_portatil_cargado', 'si');
                } else {
                    setRadioValue('radio_vhf_portatil_cargado', 'no');
                }
                break;
                
            case 'RADIO VHF Fijo':
                setCheckboxValue('radio-vhf-fijo-entregado', entregado);
                if (equipo.Fallas === 1 || equipo.Fallas === '1') {
                    setRadioValue('radio_vhf_fijo_fallas', 'si');
                } else {
                    setRadioValue('radio_vhf_fijo_fallas', 'no');
                }
                break;
                
            default:
                console.warn(`Equipo no reconocido: ${nombre}`);
        }
    });
}

/**
 * Carga los equipos de oficina en el formulario
 */
function cargarEquiposOficina(equipos) {
    console.log('🏢 Cargando equipos oficina:', equipos);
    
    equipos.forEach(equipo => {
        const nombre = equipo.Nombre;
        console.log(`Procesando equipo oficina: ${nombre}`, equipo);
        
        switch(nombre) {
            case 'ENGRAPADORAS':
                setValue('engrapadoras-entregadas', equipo.Entregadas);
                setValue('engrapadoras-recibidas', equipo.Recibidas);
                break;
                
            case 'PERFORADORAS':
                setValue('perforadoras-entregadas', equipo.Entregadas);
                setValue('perforadoras-recibidas', equipo.Recibidas);
                break;
                
            default:
                console.warn(`Equipo oficina no reconocido: ${nombre}`);
        }
    });
}

// Funciones auxiliares (ya las tienes)
function setValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = value || '';
        console.log(`✓ Set ${elementId} = ${value}`);
    } else {
        console.warn(`✗ Elemento no encontrado: ${elementId}`);
    }
}

function setCheckboxValue(elementId, checked) {
    const element = document.getElementById(elementId);
    if (element) {
        element.checked = checked;
        console.log(`✓ Checkbox ${elementId} = ${checked}`);
    } else {
        console.warn(`✗ Checkbox no encontrado: ${elementId}`);
    }
}

function setRadioValue(name, value) {
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) {
        radio.checked = true;
        console.log(`✓ Radio ${name} = ${value}`);
    } else {
        console.warn(`✗ Radio no encontrado: ${name}[value="${value}"]`);
    }
}

/**
 * Carga la lista de entregas en la tabla
 */
async function cargarEntregasTurno() {
    const tablaBody = document.querySelector('#tablaTurnos tbody');
    if (!tablaBody) return;

    tablaBody.innerHTML = '<tr><td colspan="8" class="text-center">Cargando...</td></tr>';

    try {
        const response = await fetch('entrega_turno_leer.php');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const entregas = await response.json();
        
        if (entregas.error) {
            throw new Error(entregas.error);
        }

        tablaBody.innerHTML = '';
        
        if (entregas.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay entregas de turno registradas.</td></tr>';
        } else {
            // En la función cargarEntregasTurno(), modifica esta parte:
entregas.forEach(entrega => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
        <td>${entrega.Id_EntregaTurno}</td>
        <td>${formatearFecha(entrega.Fecha)}</td>
        <td>${entrega.Nombre || 'N/A'}</td>
        <td>${entrega.Total_Operaciones_Llegadas || 0}</td>
        <td>${entrega.Total_Operaciones_Salidas || 0}</td>
        <td>${entrega.Walk_Arounds || 0}</td>
        <td>${entrega.Firma_Entrega || 'N/A'}</td>
        <td>
            <div class="btn-group btn-group-sm" role="group">
                <a href="detalle_entrega_turno.html?id=${entrega.Id_EntregaTurno}" 
                   class="btn btn-info" title="Ver Detalles">
                    <i class="fas fa-eye"></i>
                </a>
                <!-- BOTÓN NUEVO PARA PDF -->
                <a href="pdf_generator.php?tipo=entrega_turno&id=${entrega.Id_EntregaTurno}" 
                   class="btn btn-danger" title="Generar PDF" target="_blank">
                    <i class="fas fa-file-pdf"></i>
                </a>
                <a href="entrega_turno.html?id=${entrega.Id_EntregaTurno}" 
                   class="btn btn-warning" title="Editar">
                    <i class="fas fa-edit"></i>
                </a>
                <button class="btn btn-danger" 
                        onclick="eliminarEntrega(${entrega.Id_EntregaTurno})" 
                        title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </td>
    `;
    tablaBody.appendChild(fila);
});
        }
    } catch (error) {
        console.error('Error al cargar entregas:', error);
        tablaBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error al cargar los datos.</td></tr>';
    }
}

/**
 * Formatea una fecha para mostrar
 */
function formatearFecha(fechaString) {
    if (!fechaString) return 'N/A';
    
    try {
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES');
    } catch (error) {
        return fechaString;
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
 * Muestra confirmación para eliminar una entrega
 */
function eliminarEntrega(id) {
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    if (modalBody && confirmModal && confirmBtn) {
        modalBody.textContent = '¿Estás seguro de que quieres eliminar esta entrega de turno? Esta acción no se puede deshacer.';
        confirmBtn.setAttribute('data-id', id);
        confirmModal.show();
    } else {
        if (confirm('¿Estás seguro de eliminar esta entrega?')) {
            eliminarEntregaConfirmada(id);
        }
    }
}

/**
 * Elimina una entrega después de la confirmación
 */
function eliminarEntregaConfirmada(id) {
    if (confirmModal) {
        confirmModal.hide();
    }
    
    setTimeout(() => {
        const formData = new FormData();
        formData.append('id_entrega', id);

        fetch('entrega_turno_eliminar.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarExito(data.success, () => {
                    cargarEntregasTurno();
                });
            } else {
                mostrarError(data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error de conexión con el servidor.');
        });
    }, 300);
}

/**
 * Función legacy para compatibilidad
 */
function mostrarMensaje(titulo, cuerpo, tipo) {
    if (tipo === 'success') {
        mostrarExito(cuerpo);
    } else {
        mostrarError(cuerpo);
    }
}
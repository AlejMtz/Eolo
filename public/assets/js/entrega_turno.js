let paginaActualTurnos = 1;
const registrosPorPaginaTurnos = 15;
let totalPaginasTurnos = 1;
let totalRegistrosTurnos = 0;

function tienePermisosAdmin() {
    const tipoUsuario = localStorage.getItem('tipo_usuario');
    return tipoUsuario === 'admin';
}


function configurarResponsividadMovil() {
    const esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (esMovil) {
        console.log(' Configurando responsividad para dispositivo móvil');
        
        const tableContainers = document.querySelectorAll('.table-scroll-container');
        tableContainers.forEach(container => {
            if (!container.querySelector('.table-scroll-indicator')) {
                const indicator = document.createElement('div');
                indicator.className = 'table-scroll-indicator';
                indicator.innerHTML = '<i class="fas fa-arrows-left-right me-1"></i>Desplaza';
                container.appendChild(indicator);
            }
        });
        
        const tablas = document.querySelectorAll('.table-scroll-container');
        tablas.forEach(tabla => {
            tabla.style.webkitOverflowScrolling = 'touch';
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado - Inicializando entrega_turno.js');
    
    if (typeof bootstrap !== 'undefined') {
        window.successModal = new bootstrap.Modal(document.getElementById('successModal'));
        window.errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        window.confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    }

    configurarResponsividadMovil();

    configurarCamposRequeridos();

    if (document.getElementById('tablaTurnos')) {
        console.log('📋 Inicializando página de listado de turnos');
        cargarEntregasTurno();
    }

    if (document.getElementById('formEntregaTurno')) {
        console.log('📝 Inicializando formulario de entrega de turno');
        configurarFormulario();
    }

    const confirmBtn = document.getElementById('confirmActionBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (id) {
                eliminarEntregaConfirmada(id);
            }
        });
    }
    
    console.log('entrega_turno.js inicializado correctamente');
});



function configurarFormulario() {
    const formulario = document.getElementById('formEntregaTurno');
    
    if (formulario) {
        formulario.addEventListener('submit', function(event) {
            event.preventDefault();
            guardarEntregaTurno();
        });
    }

    // cargar datos en el formulario de edición
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        console.log(' Modo edición detectado, ID:', id);
        cargarEntregaParaEditar(id);
    }

    const fechaInput = document.getElementById('fecha');
    if (fechaInput && !fechaInput.value) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.value = today;
        console.log(' Fecha predeterminada establecida:', today);
    }
}

/**
 * Valida que todos los campos del formulario estén completos
 */
function validarFormularioCompleto() {
    const formulario = document.getElementById('formEntregaTurno');
    let camposVacios = [];


    const camposBasicos = [
        { id: 'fecha', nombre: 'Fecha' },
        { id: 'nombre', nombre: 'Nombre' },
        { id: 'fallas-comunicaciones', nombre: 'Fallas en equipo de comunicaciones' },
        { id: 'paquetes-hojas', nombre: 'Paquetes de hojas para impresión' },
        { id: 'fallas-copiadoras', nombre: 'Fallas en las copiadoras' },
        { id: 'fondo-recibido', nombre: 'Fondo recibido' },
        { id: 'fondo-entregado', nombre: 'Fondo entregado' },
        { id: 'vales-cantidad', nombre: 'Vales de gasolina - Cantidad' },
        { id: 'vales-folio', nombre: 'Vales de gasolina - Folio' },
        { id: 'aterrizajes-cantidad', nombre: 'Cantidad de aterrizajes' },
        { id: 'llegadas', nombre: 'Total de operaciones - Llegadas' },
        { id: 'salidas', nombre: 'Total de operaciones - Salidas' },
        { id: 'reporte-operaciones', nombre: 'Reporte de operaciones enviadas por correo' },
        { id: 'operaciones-coordinadas', nombre: 'Cantidad de operaciones coordinadas' },
        { id: 'walk-arounds', nombre: 'Walk-arounds' },
        { id: 'caja-fuerte', nombre: 'Estado de la caja fuerte' },
        { id: 'firma-entregador', nombre: 'Firma y nombre de quien entrega' },
        { id: 'firma-receptor', nombre: 'Jefe turno de despacho' }
    ];

    camposBasicos.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        if (elemento && !elemento.value.trim()) {
            camposVacios.push(campo.nombre);
        }
    });

    // Validar equipos de oficina
    const equiposOficina = [
        { id: 'engrapadoras-entregadas', nombre: 'Engrapadoras entregadas' },
        { id: 'engrapadoras-recibidas', nombre: 'Engrapadoras recibidas' },
        { id: 'perforadoras-entregadas', nombre: 'Perforadoras entregadas' },
        { id: 'perforadoras-recibidas', nombre: 'Perforadoras recibidas' }
    ];

    equiposOficina.forEach(equipo => {
        const elemento = document.getElementById(equipo.id);
        if (elemento && elemento.value === '') {
            camposVacios.push(equipo.nombre);
        }
    });

    // validar radio buttons 
    const radiosRequeridos = [
        { name: 'reporte_aterrizajes', mensaje: 'Reporte de aterrizajes' },
        { name: 'copiadoras_funciona', mensaje: 'Estado de copiadoras (funciona)' },
        { name: 'toner', mensaje: 'Estado del toner' }
    ];

    radiosRequeridos.forEach(radioGroup => {
        const seleccionado = formulario.querySelector(`input[name="${radioGroup.name}"]:checked`);
        if (!seleccionado) {
            camposVacios.push(radioGroup.mensaje);
        }
    });

    // Validar equipos de comunicación
    const equiposComunicacion = [
        { 
            prefijo: 'celular', 
            nombre: 'Celular ZTE',
            tieneEstado: true,
            tipoEstado: 'checkbox' 
        },
        { 
            prefijo: 'radio_motorola', 
            nombre: 'Radio Motorola',
            tieneEstado: true,
            tipoEstado: 'radio',
            estadoName: 'radio_motorola_cargado'
        },
        { 
            prefijo: 'radio_vhf_portatil', 
            nombre: 'Radio VHF Portátil',
            tieneEstado: true,
            tipoEstado: 'radio',
            estadoName: 'radio_vhf_portatil_cargado'
        },
        { 
            prefijo: 'radio_vhf_fijo', 
            nombre: 'Radio VHF Fijo',
            tieneEstado: true,
            tipoEstado: 'radio',
            estadoName: 'radio_vhf_fijo_fallas'
        }
    ];

    equiposComunicacion.forEach(equipo => {
        const entregado = document.getElementById(`${equipo.prefijo}-entregado`);
        
        if (entregado && entregado.checked) {
            let estadoValido = false;
            
            if (equipo.tieneEstado) {
                if (equipo.tipoEstado === 'checkbox') {
                    const estadoCheckbox = document.getElementById(`${equipo.prefijo}-cargado`);
                    estadoValido = estadoCheckbox && estadoCheckbox.checked;
                } else if (equipo.tipoEstado === 'radio') {
                    estadoValido = !!formulario.querySelector(`input[name="${equipo.estadoName}"]:checked`);
                }
            }
            
            if (!estadoValido) {
                camposVacios.push(`Estado del ${equipo.nombre}`);
            }
        } else {
            
        }
    });

    return camposVacios;
}


function mostrarErroresValidacion(camposVacios) {
    let mensaje = 'Por favor completa los siguientes campos obligatorios:\n\n';
    camposVacios.forEach((campo, index) => {
        mensaje += `${index + 1}. ${campo}\n`;
    });
    
    mensaje += '\nTodos los campos son obligatorios para guardar la entrega de turno.';
    mostrarError(mensaje);
    
    resaltarCamposFaltantes(camposVacios);
}


function resaltarCamposFaltantes(camposVacios) {
    const elementosResaltados = document.querySelectorAll('.campo-faltante');
    elementosResaltados.forEach(el => {
        el.classList.remove('campo-faltante');
        if (el.style) el.style.borderColor = '';
    });

    const mapaCampos = {
        'Fecha': 'fecha',
        'Nombre': 'nombre',
        'Fallas en equipo de comunicaciones': 'fallas-comunicaciones',
        'Paquetes de hojas para impresión': 'paquetes-hojas',
        'Fallas en las copiadoras': 'fallas-copiadoras',
        'Fondo recibido': 'fondo-recibido',
        'Fondo entregado': 'fondo-entregado',
        'Vales de gasolina - Cantidad': 'vales-cantidad',
        'Vales de gasolina - Folio': 'vales-folio',
        'Cantidad de aterrizajes': 'aterrizajes-cantidad',
        'Total de operaciones - Llegadas': 'llegadas',
        'Total de operaciones - Salidas': 'salidas',
        'Reporte de operaciones enviadas por correo': 'reporte-operaciones',
        'Cantidad de operaciones coordinadas': 'operaciones-coordinadas',
        'Walk-arounds': 'walk-arounds',
        'Estado de la caja fuerte': 'caja-fuerte',
        'Firma y nombre de quien entrega': 'firma-entregador',
        'Jefe turno de despacho': 'firma-receptor',
        'Engrapadoras entregadas': 'engrapadoras-entregadas',
        'Engrapadoras recibidas': 'engrapadoras-recibidas',
        'Perforadoras entregadas': 'perforadoras-entregadas',
        'Perforadoras recibidas': 'perforadoras-recibidas'
    };

  
    camposVacios.forEach(nombreCampo => {
        const campoId = mapaCampos[nombreCampo];
        if (campoId) {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.classList.add('campo-faltante');
                campo.style.borderColor = '#dc3545';
                
                // Hacer scroll al primer campo faltante
                if (camposVacios[0] === nombreCampo) {
                    campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    });

   
    if (camposVacios.includes('Reporte de aterrizajes')) {
        resaltarGrupoRadio('reporte_aterrizajes');
    }
    if (camposVacios.includes('Estado de copiadoras (funciona)')) {
        resaltarGrupoRadio('copiadoras_funciona');
    }
    if (camposVacios.includes('Estado del toner')) {
        resaltarGrupoRadio('toner');
    }
}


function resaltarGrupoRadio(nombre) {
    const radios = document.querySelectorAll(`input[name="${nombre}"]`);
    radios.forEach(radio => {
        const label = radio.closest('.form-check') || radio.closest('.form-check-inline');
        if (label) {
            label.classList.add('campo-faltante');
            label.style.border = '2px solid #dc3545';
            label.style.padding = '5px';
            label.style.borderRadius = '4px';
        }
    });
}


function configurarCamposRequeridos() {
    const formulario = document.getElementById('formEntregaTurno');
    if (!formulario) return;

    const inputs = formulario.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.type !== 'checkbox' && input.type !== 'radio' && !input.name.includes('_entregado')) {
            input.setAttribute('required', 'required');
        }
    });

    const labels = formulario.querySelectorAll('label');
    labels.forEach(label => {
        const forAttr = label.getAttribute('for');
        if (forAttr) {
            const input = document.getElementById(forAttr);
            if (input && input.hasAttribute('required')) {
                if (!label.querySelector('.required-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'required-indicator';
                    indicator.textContent = ' *';
                    indicator.style.color = '#dc3545';
                    label.appendChild(indicator);
                }
            }
        }
    });

    console.log(' Todos los campos configurados como requeridos');
}


function obtenerNombreEquipo(codigo) {
    const nombres = {
        'celular': 'Celular ZTE',
        'radio_motorola': 'Radio Motorola',
        'radio_vhf_portatil': 'Radio VHF Portátil',
        'radio_vhf_fijo': 'Radio VHF Fijo'
    };
    return nombres[codigo] || codigo;
}

/**
 * Muestra errores de validación
 */
function mostrarErroresValidacion(camposVacios) {
    let mensaje = 'Por favor completa los siguientes campos obligatorios:\n\n';
    camposVacios.forEach((campo, index) => {
        mensaje += `${index + 1}. ${campo}\n`;
    });
    
    mensaje += '\nTodos los campos marcados con * son obligatorios.';
    mostrarError(mensaje);
    
    // Resaltar campos faltantes
    resaltarCamposFaltantes(camposVacios);
}


function resaltarCamposFaltantes(camposVacios) {
    const elementosResaltados = document.querySelectorAll('.campo-faltante');
    elementosResaltados.forEach(el => {
        el.classList.remove('campo-faltante');
        el.style.borderColor = '';
    });

    camposVacios.forEach(nombreCampo => {
        const labels = document.querySelectorAll('label');
        labels.forEach(label => {
            if (label.textContent.includes(nombreCampo)) {
                const campo = document.getElementById(label.htmlFor);
                if (campo) {
                    campo.classList.add('campo-faltante');
                    campo.style.borderColor = '#dc3545';
                    campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });
}

/**
 * Guarda o actualiza una entrega de turno 
 */
function guardarEntregaTurno() {
    const camposVacios = validarFormularioCompleto();
    
    if (camposVacios.length > 0) {
        mostrarErroresValidacion(camposVacios);
        return;
    }

    const formData = new FormData(document.getElementById('formEntregaTurno'));
    const id_entrega = document.getElementById('id_entrega') ? document.getElementById('id_entrega').value : '';
    
    const url = id_entrega ? '/Eolo/app/controllers/entrega_turno_actualizar.php' : '/Eolo/app/controllers/entrega_turno_crear.php';
    
    console.log('DATOS DEL FORMULARIO VALIDADOS');
    for (let [key, value] of formData.entries()) {
        console.log(key + ': ' + value);
    }
    console.log('URL:', url);
    console.log('ID Entrega:', id_entrega);
    console.log('============================');
    
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
                    window.location.href = '../../app/views/ver_entrega_turno.html';
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

    const reporteAterrizaje = document.querySelector('input[name="reporte_aterrizajes"]:checked');
    if (reporteAterrizaje) {
        formData.append('reporte_aterrizaje', reporteAterrizaje.value);
    }

    const equiposComunicacion = [
        { prefijo: 'celular', cantidad: 1 },
        { prefijo: 'radio_motorola', cantidad: 2 },
        { prefijo: 'radio_vhf_portatil', cantidad: 2 },
        { prefijo: 'radio_vhf_fijo', cantidad: 1 }
    ];

    equiposComunicacion.forEach(equipo => {
        const entregado = document.getElementById(`${equipo.prefijo}_entregado`);
        if (entregado && entregado.checked) {
            formData.append(`${equipo.prefijo}_entregado`, '1');
        }

        const estado = document.querySelector(`input[name="${equipo.prefijo}_cargado"]:checked`) || 
                      document.querySelector(`input[name="${equipo.prefijo}_fallas"]:checked`);
        if (estado) {
            formData.append(`${equipo.prefijo}_cargado`, estado.value);
        }
    });

    const equiposOficina = ['engrapadoras', 'perforadoras'];
    equiposOficina.forEach(equipo => {
        const entregadas = document.getElementById(`${equipo}_entregadas`);
        const recibidas = document.getElementById(`${equipo}_recibidas`);
        
        if (entregadas) formData.append(`${equipo}_entregadas`, entregadas.value);
        if (recibidas) formData.append(`${equipo}_recibidas`, recibidas.value);
    });

    const idEntrega = document.getElementById('id_entrega');
    if (idEntrega && idEntrega.value) {
        formData.append('id_entrega', idEntrega.value);
    }
}


function cargarEntregaParaEditar(id) {
    console.log(' Cargando entrega ID:', id);
    
    const btnGuardar = document.getElementById('btnGuardar');
    const originalText = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
    btnGuardar.disabled = true;

    fetch(`/Eolo/app/controllers/entrega_turno_leer_id.php?id=${id}&t=${Date.now()}`)
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

        console.log(' Datos recibidos:', data);
        
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

        if (data.Reporte_Aterrizaje !== null && data.Reporte_Aterrizaje !== undefined) {
            const valor = data.Reporte_Aterrizaje ? 'si' : 'no';
            setRadioValue('reporte_aterrizajes', valor);
        }

        if (data.equipos_comunicacion && Array.isArray(data.equipos_comunicacion)) {
            cargarEquiposComunicacion(data.equipos_comunicacion);
        } else {
            console.warn(' No se encontraron equipos de comunicación');
        }

        if (data.equipos_oficina && Array.isArray(data.equipos_oficina)) {
            cargarEquiposOficina(data.equipos_oficina);
        } else {
            console.warn(' No se encontraron equipos de oficina');
        }
        if (data.Copiadoras_Funciona !== null && data.Copiadoras_Funciona !== undefined) {
            const valorCopiadoras = data.Copiadoras_Funciona ? 'si' : 'no';
            setRadioValue('copiadoras_funciona', valorCopiadoras);
        }
        
        if (data.Toner_Estado) {
            setRadioValue('toner', data.Toner_Estado); 
        }

        btnGuardar.textContent = 'Actualizar Entrega';
        btnGuardar.classList.remove('btn-primary');
        btnGuardar.classList.add('btn-warning');
        
        console.log(' Formulario llenado exitosamente');

    })
    .catch(error => {
        console.error(' Error al cargar datos:', error);
        mostrarError('Error al cargar los datos: ' + error.message);
    })
    .finally(() => {
        btnGuardar.innerHTML = originalText;
        btnGuardar.disabled = false;
    });
}


function cargarEquiposComunicacion(equipos) {
    console.log('📱 Cargando equipos comunicación:', equipos);
    
    equipos.forEach(equipo => {
        const nombre = equipo.Nombre;
        console.log(`Procesando equipo: ${nombre}`, equipo);
        
        const entregado = true; 
        
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


function cargarEquiposOficina(equipos) {
    console.log(' Cargando equipos oficina:', equipos);
    
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
 * Genera PDF de entrega de turno
 */
function generarPDFEntregaTurno(id) {
    window.open(`/Eolo/app/helpers/pdf_generator.php?tipo=entrega_turno&id=${id}`, '_blank');
}

/**
 * Carga la lista de entregas en la tabla con paginación
 */
async function cargarEntregasTurno(pagina = 1) {
    const tablaBody = document.querySelector('#tablaTurnos tbody');
    if (!tablaBody) return;

    tablaBody.innerHTML = '<tr><td colspan="9" class="text-center">Cargando...</td></tr>';

    try {
        const response = await fetch(`../models/entrega_turno_leer.php?pagina=${pagina}&registros_por_pagina=${registrosPorPaginaTurnos}`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        // Manejar diferentes estructuras de respuesta
        let entregas = [];
        let infoPaginacion = {
            pagina_actual: pagina,
            total_paginas: 1,
            total_registros: 0,
            registros_por_pagina: registrosPorPaginaTurnos
        };

        if (data.entregas && data.paginacion) {
            entregas = data.entregas;
            infoPaginacion = data.paginacion;
        } else if (Array.isArray(data)) {
            const inicio = (pagina - 1) * registrosPorPaginaTurnos;
            const fin = inicio + registrosPorPaginaTurnos;
            entregas = data.slice(inicio, fin);
            infoPaginacion.total_registros = data.length;
            infoPaginacion.total_paginas = Math.ceil(data.length / registrosPorPaginaTurnos);
        } else {
            throw new Error('Formato de respuesta no reconocido');
        }

        paginaActualTurnos = infoPaginacion.pagina_actual;
        totalPaginasTurnos = infoPaginacion.total_paginas;
        totalRegistrosTurnos = infoPaginacion.total_registros;

        console.log(' Información de paginación entregas:', infoPaginacion);

        tablaBody.innerHTML = '';
        
        if (entregas.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="9" class="text-center">No hay entregas de turno registradas.</td></tr>';
        } else {
            const usuarioActual = permisosSistema.usuario.nombre;
            
            entregas.forEach(entrega => {
                const fila = document.createElement('tr');
                
                const puedeEditar = permisosSistema.puedeEditar('entregas_turno', entrega);
                const puedeEliminar = permisosSistema.puedeEliminar('entregas_turno');
                const esPropietario = entrega.Nombre === usuarioActual;
                
                fila.innerHTML = `
                    <td>${entrega.Id_EntregaTurno}</td>
                    <td>${formatearFecha(entrega.Fecha)}</td>
                    <td>
                        ${entrega.Nombre || 'N/A'}
                        ${esPropietario ? '<span class="badge bg-primary ms-1">Tuyo</span>' : ''}
                    </td>
                    <td>${entrega.Total_Operaciones_Llegadas || 0}</td>
                    <td>${entrega.Total_Operaciones_Salidas || 0}</td>
                    <td>${entrega.Walk_Arounds || 0}</td>
                    <td>${entrega.Firma_Entrega || 'N/A'}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <!-- Botón Ver Detalles -->
                            <a href="../views/detalle_entrega_turno.html?id=${entrega.Id_EntregaTurno}" 
                               class="btn btn-info" 
                               title="Ver detalles completos">
                                <i class="fas fa-eye"></i>
                            </a>
                            
                            <!-- Botón Generar PDF -->
                            <button class="btn btn-danger" 
                                    onclick="generarPDFEntregaTurno(${entrega.Id_EntregaTurno})" 
                                    title="Generar PDF">
                                <i class="fas fa-file-pdf"></i>
                            </button>
                            
                            <!-- Botón Editar -->
                            <a href="entrega_turno.html?id=${entrega.Id_EntregaTurno}" 
                               class="btn btn-warning btn-editar" 
                               data-modulo="entregas_turno"
                               title="${puedeEditar ? 'Editar entrega' : (esPropietario ? 'Solo puedes editar tus propias entregas' : 'No puedes editar entregas de otros usuarios')}"
                               style="${!puedeEditar ? 'opacity: 0.6; pointer-events: none;' : ''}">
                                <i class="fas fa-edit"></i>
                            </a>
                            
                            <!-- Botón Eliminar -->
                            <button class="btn btn-danger btn-eliminar" 
                                    data-modulo="entregas_turno"
                                    onclick="${puedeEliminar ? `eliminarEntrega(${entrega.Id_EntregaTurno})` : 'mostrarErrorPermisos()'}" 
                                    title="${puedeEliminar ? 'Eliminar entrega' : 'Se requieren permisos de administrador'}"
                                    style="${!puedeEliminar ? 'opacity: 0.6;' : ''}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        
                        <!-- Indicador visual de permisos -->
                        ${!puedeEditar && !esPropietario ? 
                            '<span class="badge bg-secondary ms-1" title="Solo el creador o administrador puede editar">🔒</span>' : 
                            ''}
                    </td>
                `;
                tablaBody.appendChild(fila);
            });
        }
        
        actualizarPaginadorTurnos();
        
    } catch (error) {
        console.error('Error al cargar entregas:', error);
        tablaBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Error al cargar los datos.</td></tr>';
    }
}


function formatearFecha(fechaString) {
    if (!fechaString) return 'N/A';
    
    try {
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES');
    } catch (error) {
        return fechaString;
    }
}


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


function mostrarError(mensaje) {
    const modalBody = document.getElementById('errorModalBody');
    if (modalBody && errorModal) {
        modalBody.textContent = mensaje;
        errorModal.show();
    } else {
        alert('¡Error! ⚠️\n' + mensaje);
    }
}


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


function eliminarEntregaConfirmada(id) {
    if (confirmModal) {
        confirmModal.hide();
    }
    
    setTimeout(() => {
        const formData = new FormData();
        formData.append('id_entrega', id);

        fetch('/Eolo/app/controllers/entrega_turno_eliminar.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarExito(data.success, () => {
                    cargarEntregasTurno(paginaActualTurnos);
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


function mostrarMensaje(titulo, cuerpo, tipo) {
    if (tipo === 'success') {
        mostrarExito(cuerpo);
    } else {
        mostrarError(cuerpo);
    }
}


function actualizarPaginadorTurnos() {
    const tabla = document.getElementById('tablaTurnos');
    if (!tabla) return;
    
    const paginadorExistente = tabla.nextElementSibling;
    if (paginadorExistente && paginadorExistente.classList.contains('paginador-container')) {
        paginadorExistente.remove();
    }
    
    const paginadorContainer = document.createElement('div');
    paginadorContainer.className = 'paginador-container mt-4';
    paginadorContainer.id = 'paginadorTurnos';
    
    let html = '';
    
    const inicio = ((paginaActualTurnos - 1) * registrosPorPaginaTurnos) + 1;
    const fin = Math.min(paginaActualTurnos * registrosPorPaginaTurnos, totalRegistrosTurnos);
    
    html += `
        <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted">
                Mostrando ${inicio} a ${fin} de ${totalRegistrosTurnos} entregas
            </div>
            <nav aria-label="Paginación de entregas de turno">
                <ul class="pagination pagination-sm mb-0">
    `;
    
    if (paginaActualTurnos > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaTurnos(${paginaActualTurnos - 1})" aria-label="Anterior">
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
    
    const paginasAMostrar = 5;
    let inicioPaginas = Math.max(1, paginaActualTurnos - Math.floor(paginasAMostrar / 2));
    let finPaginas = Math.min(totalPaginasTurnos, inicioPaginas + paginasAMostrar - 1);
    
    if (finPaginas - inicioPaginas + 1 < paginasAMostrar) {
        inicioPaginas = Math.max(1, finPaginas - paginasAMostrar + 1);
    }
    
    if (inicioPaginas > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaTurnos(1)">1</a>
            </li>
            ${inicioPaginas > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
        `;
    }
    
    for (let i = inicioPaginas; i <= finPaginas; i++) {
        if (i === paginaActualTurnos) {
            html += `
                <li class="page-item active">
                    <span class="page-link">${i}</span>
                </li>
            `;
        } else {
            html += `
                <li class="page-item">
                    <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaTurnos(${i})">${i}</a>
                </li>
            `;
        }
    }
    
    if (finPaginas < totalPaginasTurnos) {
        html += `
            ${finPaginas < totalPaginasTurnos - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaTurnos(${totalPaginasTurnos})">${totalPaginasTurnos}</a>
            </li>
        `;
    }
    
    if (paginaActualTurnos < totalPaginasTurnos) {
        html += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="cambiarPaginaTurnos(${paginaActualTurnos + 1})" aria-label="Siguiente">
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
    tabla.parentNode.appendChild(paginadorContainer);
}


function cambiarPaginaTurnos(pagina) {
    if (pagina >= 1 && pagina <= totalPaginasTurnos && pagina !== paginaActualTurnos) {
        cargarEntregasTurno(pagina);
        
        const tabla = document.getElementById('tablaTurnos');
        if (tabla) {
            tabla.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}


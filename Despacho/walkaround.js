// walkaround.js

// Variables globales para los modales
let successModal = null;
let errorModal = null;
let confirmModal = null;

// Almacenar información de aeronaves y walkaround
let aeronavesData = [];
let generalEvidenceFiles = [];
let walkaroundData = null;
let isEditMode = false;

// Componentes predefinidos para cada tipo de aeronave
const componentesPorTipo = {
    avion: [
        { id: 'radomo', nombre: 'Radomo', seccion: 'Nariz' },
        { id: 'parabrisas_limpiadores', nombre: 'Parabrisas/Limpiadores', seccion: 'Cabina' },
        { id: 'tubos_pitot', nombre: 'Tubos Pitot', seccion: 'Sistema de Instrumentación' },
        { id: 'tren_nariz_llantas', nombre: 'Tren de Nariz - Llantas', seccion: 'Tren de Aterrizaje' },
        { id: 'tren_nariz_luces', nombre: 'Tren de Nariz - Luces', seccion: 'Tren de Aterrizaje' },
        { id: 'tren_nariz_fugas', nombre: 'Tren de Nariz - Fugas', seccion: 'Tren de Aterrizaje' },
        { id: 'fuselaje_izq_antenas', nombre: 'Fuselaje Izquierdo - Antenas', seccion: 'Fuselaje' },
        { id: 'fuselaje_izq_luces', nombre: 'Fuselaje Izquierdo - Luces', seccion: 'Fuselaje' },
        { id: 'fuselaje_izq_ventanillas', nombre: 'Fuselaje Izquierdo - Ventanillas', seccion: 'Fuselaje' },
        { id: 'puerta_acceso_escalera', nombre: 'Puerta de Acceso - Escalera', seccion: 'Accesos' },
        { id: 'puerta_acceso_barandillas', nombre: 'Puerta de Acceso - Barandillas', seccion: 'Accesos' },
        { id: 'puerta_acceso_marco', nombre: 'Puerta de Acceso - Marco', seccion: 'Accesos' },
        { id: 'antenas', nombre: 'Antenas', seccion: 'Comunicaciones' },
        { id: 'semiala_izq_bordes', nombre: 'Semiala Izquierda - Bordes', seccion: 'Alas' },
        { id: 'semiala_izq_winglet', nombre: 'Semiala Izquierda - Winglet', seccion: 'Alas' },
        { id: 'semiala_izq_estaticas', nombre: 'Semiala Izquierda - Estáticas', seccion: 'Alas' },
        { id: 'semiala_izq_sup_control', nombre: 'Semiala Izquierda - Sup. Control', seccion: 'Alas' },
        { id: 'tren_principal_izq_llantas', nombre: 'Tren Principal Izquierdo - Llantas', seccion: 'Tren de Aterrizaje' },
        { id: 'tren_principal_izq_fugas', nombre: 'Tren Principal Izquierdo - Fugas', seccion: 'Tren de Aterrizaje' },
        { id: 'compartimiento_carga_ext', nombre: 'Compartimiento de Carga - Exterior', seccion: 'Compartimientos' },
        { id: 'compartimiento_carga_int', nombre: 'Compartimiento de Carga - Interior', seccion: 'Compartimientos' },
        { id: 'empenaje_bordes', nombre: 'Empenaje - Bordes', seccion: 'Empenaje' },
        { id: 'empenaje_estaticas', nombre: 'Empenaje - Estáticas', seccion: 'Empenaje' },
        { id: 'empenaje_sup_control', nombre: 'Empenaje - Sup. Control', seccion: 'Empenaje' },
        { id: 'semiala_der_bordes', nombre: 'Semiala Derecha - Bordes', seccion: 'Alas' },
        { id: 'semiala_der_winglet', nombre: 'Semiala Derecha - Winglet', seccion: 'Alas' },
        { id: 'semiala_der_estaticas', nombre: 'Semiala Derecha - Estáticas', seccion: 'Alas' },
        { id: 'semiala_der_sup_control', nombre: 'Semiala Derecha - Sup. Control', seccion: 'Alas' },
        { id: 'tren_principal_der_llantas', nombre: 'Tren Principal Derecho - Llantas', seccion: 'Tren de Aterrizaje' },
        { id: 'tren_principal_der_fugas', nombre: 'Tren Principal Derecho - Fugas', seccion: 'Tren de Aterrizaje' },
        { id: 'valvulas_servicio_combustible', nombre: 'Válvulas de Servicio - Combustible', seccion: 'Sistemas' },
        { id: 'valvulas_servicio_agua', nombre: 'Válvulas de Servicio - Agua', seccion: 'Sistemas' },
        { id: 'valvulas_servicio_fugas', nombre: 'Válvulas de Servicio - Fugas', seccion: 'Sistemas' },
        { id: 'motores_crowling', nombre: 'Motores - Crowling', seccion: 'Motores' },
        { id: 'motores_carenados', nombre: 'Motores - Carenados', seccion: 'Motores' },
        { id: 'fuselaje_der_antenas', nombre: 'Fuselaje Derecho - Antenas', seccion: 'Fuselaje' },
        { id: 'fuselaje_der_luces', nombre: 'Fuselaje Derecho - Luces', seccion: 'Fuselaje' },
        { id: 'fuselaje_der_ventanillas', nombre: 'Fuselaje Derecho - Ventanillas', seccion: 'Fuselaje' },
        { id: 'registros_servicios', nombre: 'Registros de Servicios', seccion: 'Documentación' }
    ],
    helicoptero: [
        { id: 'fuselaje_puertas', nombre: 'Fuselaje - Puertas', seccion: 'Fuselaje' },
        { id: 'fuselaje_ventanas', nombre: 'Fuselaje - Ventanas', seccion: 'Fuselaje' },
        { id: 'fuselaje_antenas', nombre: 'Fuselaje - Antenas', seccion: 'Fuselaje' },
        { id: 'fuselaje_luces', nombre: 'Fuselaje - Luces', seccion: 'Fuselaje' },
        { id: 'esqui_neumaticos', nombre: 'Esquí/Neumáticos', seccion: 'Tren de Aterrizaje' },
        { id: 'palas', nombre: 'Palas', seccion: 'Rotor Principal' },
        { id: 'boom', nombre: 'Boom', seccion: 'Estructura' },
        { id: 'estabilizadores', nombre: 'Estabilizadores', seccion: 'Control' },
        { id: 'rotor_cola', nombre: 'Rotor de Cola', seccion: 'Rotor de Cola' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar modales de Bootstrap SOLO si existen
    if (typeof bootstrap !== 'undefined') {
        // Inicializar solo los modales que existen
        const initModalIfExists = (modalId, modalVariable) => {
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                modalVariable = new bootstrap.Modal(modalElement);
            }
        };
        
        initModalIfExists('successModal', successModal);
        initModalIfExists('errorModal', errorModal);
        initModalIfExists('confirmModal', confirmModal);
    }
    // Si estamos en la página de lista, cargar walkarounds
    if (document.getElementById('tablaWalkarounds')) {
        cargarWalkarounds();
    }

    // Si estamos en el formulario de walkaround
if (document.getElementById('walkaroundForm')) {
    // Comprobar si hay un ID en la URL para modo edición
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (id) {
        // Modo edición
        configurarModoEdicion(id);
    } else {
        // Modo creación - establecer fecha/hora actual
        const now = new Date();
        const formatted = now.toISOString().slice(0,16);
        document.getElementById('fechaHora').value = formatted;
        
        // Asegurar que la acción sea para creación
        document.getElementById('walkaroundForm').action = 'procesar_walkaround.php';
    }
        
        // Cargar aeronaves para el selector
        cargarAeronavesParaSelector();
        
        // Configurar envío del formulario
document.getElementById('walkaroundForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // En modo edición, usar el nuevo script de actualización
    if (isEditMode) {
        enviarWalkaround();
    } else {
        // En modo creación, usar el procesamiento normal
        enviarWalkaround();
    }
});

        // Evento cuando se selecciona una aeronave
        document.getElementById('aeronave').addEventListener('change', function() {
            const aeronaveId = this.value;
            
            if (aeronaveId) {
                // Encontrar la aeronave seleccionada
                const aeronaveSeleccionada = aeronavesData.find(a => a.Id_Aeronave == aeronaveId);
                
                if (aeronaveSeleccionada) {
                    // Cargar componentes según el tipo de aeronave
                    const tipo = aeronaveSeleccionada.Tipo.toLowerCase();
                    cargarComponentes(tipo);
                }
            } else {
                document.getElementById('componentesContainer').innerHTML = `
                    <div class="text-center py-5">
                        <i class="fas fa-plane fs-1 text-muted"></i>
                        <p class="mt-3 text-muted">Selecciona una aeronave para mostrar sus componentes</p>
                    </div>
                `;
            }
        });
        
        // Manejar la selección de evidencias generales
        document.getElementById('generalEvidence').addEventListener('change', function(e) {
            handleGeneralEvidenceSelect(e.target.files);
        });
    }

    // Configurar evento para el botón de confirmación de eliminación
    const confirmBtn = document.getElementById('confirmActionBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (id) {
                eliminarWalkaroundConfirmada(id);
            }
        });
    }
});

/**
 * Configura el formulario en modo edición
 */
function configurarModoEdicion(id) {
    isEditMode = true;
    document.title = 'Editar Walkaround - Inspección de Componentes';
    document.querySelector('.form-title').innerHTML = '<i class="fas fa-clipboard-check"></i> Editar Walkaround';
    
    // Cambiar texto del botón de envío
    const submitButton = document.getElementById('submitButton');
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display: none;"></span> Actualizar Inspección';
    submitButton.classList.remove('btn-primary');
    submitButton.classList.add('btn-warning');
    
    // Cambiar acción del formulario
    document.getElementById('walkaroundForm').action = 'walkaround_actualizar.php';
    
    // ✅ Asegurar que el campo oculto para el ID exista
    let idWalkInput = document.getElementById('id_walk');
    if (!idWalkInput) {
        idWalkInput = document.createElement('input');
        idWalkInput.type = 'hidden';
        idWalkInput.id = 'id_walk';
        idWalkInput.name = 'id_walk';
        document.getElementById('walkaroundForm').appendChild(idWalkInput);
    }
    idWalkInput.value = id;
    
    // Cargar datos del walkaround
    cargarWalkaround(id);
}

/**
 * Carga datos del walkaround en modo edición
 */
async function cargarWalkaround(id) {
    console.log('🔍 Iniciando carga de walkaround ID:', id);
    document.getElementById('loading').style.display = 'flex';
    
    try {
        const response = await fetch(`walkaround_leer_id.php?id=${id}`);
        
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Respuesta del servidor (no JSON):', text);
            throw new Error('El servidor devolvió un formato incorrecto');
        }
        
        const data = await response.json();
        console.log('📊 Datos recibidos del servidor:', data);
        
        // Verificar si hay error en la respuesta JSON
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Validar que los datos existan
        if (!data) {
            throw new Error('No se recibieron datos del servidor');
        }
        
        // DEBUG: Mostrar todos los campos disponibles
        console.log('✅ Campos disponibles:', Object.keys(data));
        
        // CORRECCIÓN: Usar "FechaHora" (con H mayúscula) en lugar de "Fechahora"
        const fechaHora = data.FechaHora; // ← ¡ESTA ES LA CORRECCIÓN!
        
        if (!fechaHora) {
            console.warn('⚠️ Campo de fecha no encontrado. Campos disponibles:', Object.keys(data));
        }
        
        // Formatear fecha
        let fechaHoraValue = '';
        if (fechaHora) {
            try {
                // Reemplazar el espacio por 'T' para el input datetime-local
                fechaHoraValue = fechaHora.replace(' ', 'T');
                console.log('📅 Fecha formateada:', fechaHoraValue);
            } catch (e) {
                console.warn('⚠️ Error al formatear fecha:', e);
            }
        }
        
        // Llenar el formulario con los datos
        document.getElementById('fechaHora').value = fechaHoraValue;
        document.getElementById('aeronave').value = data.Id_Aeronave || '';
        document.getElementById('elaboro').value = data.Elaboro || '';
        document.getElementById('responsable').value = data.Responsable || '';
        document.getElementById('jefe_area').value = data.JefeArea || '';
        document.getElementById('vobo').value = data.VoBo || '';
        document.getElementById('observacionesGenerales').value = data.observaciones || '';
        
        console.log('✅ Formulario llenado correctamente');
        
        // Deshabilitar selector de aeronave en modo edición
        document.getElementById('aeronave').disabled = true;
        console.log('🔒 Selector de aeronave deshabilitado');
        
        // Cargar componentes
        const tipo = data.Tipo ? data.Tipo.toLowerCase() : 'avion';
        console.log('✈️ Cargando componentes para tipo:', tipo);
        console.log('📦 Componentes a cargar:', data.componentes);
        cargarComponentes(tipo, data.componentes || []);
        
    } catch (error) {
        console.error('❌ Error al cargar walkaround:', error);
        mostrarError('Error al cargar los datos: ' + error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
        console.log('🏁 Carga de walkaround completada');
    }
}

/**
 * Carga aeronaves para el selector
 */
async function cargarAeronavesParaSelector() {
    console.log('Intentando cargar aeronaves...');
    try {
        const response = await fetch('obtener_aeronaves.php');
        console.log('Respuesta de obtener_aeronaves.php:', response);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const aeronaves = await response.json();
        console.log('Aeronaves recibidas:', aeronaves);
        
        aeronavesData = aeronaves;
        const selectAeronave = document.getElementById('aeronave');
        
        if (!selectAeronave) {
            console.error('No se encontró el elemento select con id "aeronave"');
            return;
        }
        
        // Limpiar opciones excepto la primera
        while (selectAeronave.options.length > 1) {
            selectAeronave.remove(1);
        }
        
        // Añadir opciones
        aeronaves.forEach(aeronave => {
            const option = document.createElement('option');
            option.value = aeronave.Id_Aeronave;
            option.textContent = `${aeronave.Matricula} (${aeronave.Tipo})`;
            selectAeronave.appendChild(option);
        });
        
        console.log('Aeronaves cargadas correctamente');
        
    } catch (error) {
        console.error('Error al cargar aeronaves:', error);
        mostrarError('Error al cargar las aeronaves. Por favor, recarga la página.');
    }
}

/**
 * Carga componentes según el tipo de aeronave
 */
function cargarComponentes(tipoAeronave, componentesGuardados = []) {
    const componentesContainer = document.getElementById('componentesContainer');
    const componentes = componentesPorTipo[tipoAeronave];
    
    if (!componentes) {
        componentesContainer.innerHTML = '<div class="alert alert-warning">No hay componentes definidos para este tipo de aeronave.</div>';
        return;
    }
    
    // Agrupar componentes por sección
    const secciones = {};
    componentes.forEach(componente => {
        if (!secciones[componente.seccion]) {
            secciones[componente.seccion] = [];
        }
        secciones[componente.seccion].push(componente);
    });
    
    // Construir HTML para las secciones y componentes
    let html = '';
    
    for (const seccion in secciones) {
        html += `
            <div class="component-section">
                <div class="section-title">${seccion}</div>
                <div class="component-grid">
        `;
        
        secciones[seccion].forEach(componente => {
            // Buscar si este componente tiene datos guardados
            const componenteGuardado = componentesGuardados.find(c => {
                return c.Componente == componente.id;
            });

            const estado = componenteGuardado ? componenteGuardado.Estado : '';
            const observaciones = componenteGuardado ? componenteGuardado.Observaciones : '';
            
            html += `
                <div class="component-card" id="componente-${componente.id}">
                    <h5>${componente.nombre}</h5>
                    
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="estado_${componente.id}" 
                            id="estado_ok_${componente.id}" value="1" 
                            ${estado === '1' ? 'checked' : ''} required>
                        <label class="form-check-label" for="estado_ok_${componente.id}">
                            Sin daño
                        </label>
                    </div>
                    
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="estado_${componente.id}" 
                            id="estado_damage_${componente.id}" value="2"
                            ${estado === '2' ? 'checked' : ''}>
                        <label class="form-check-label" for="estado_damage_${componente.id}">
                            Con daño
                        </label>
                    </div>
                    
                    <div class="damage-options" id="opciones_dano_${componente.id}" 
                        style="${estado === '2' ? 'display:block;' : 'display:none;'}">
                        <div class="form-group mt-2">
                            <label for="observaciones_${componente.id}" class="form-label">Observaciones:</label>
                            <textarea class="form-control" id="observaciones_${componente.id}" 
                                name="observaciones_${componente.id}" rows="2" 
                                placeholder="Describa el daño encontrado">${observaciones}</textarea>
                        </div>
                        <div class="form-group mt-2">
                            <label for="evidencia_${componente.id}" class="form-label">Subir evidencia:</label>
                            <input type="file" class="form-control" id="evidencia_${componente.id}" name="evidencia_${componente.id}" accept="image/*,video/*">
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    componentesContainer.innerHTML = html;
    
    // Agregar eventos para mostrar/ocultar opciones de daño
    document.querySelectorAll('.form-check-input').forEach(radio => {
        radio.addEventListener('change', function() {
            const name = this.getAttribute('name');
            const componenteId = name.replace('estado_', '');
            const opcionesDano = document.getElementById(`opciones_dano_${componenteId}`);
            const componenteCard = document.getElementById(`componente-${componenteId}`);
            
            if (this.value === '2') {
                opcionesDano.style.display = 'block';
                componenteCard.classList.add('estado-seleccionado');
            } else {
                opcionesDano.style.display = 'none';
                componenteCard.classList.add('estado-seleccionado');
            }
        });
    });
}

/**
 * Maneja la selección de evidencias generales
 */
function handleGeneralEvidenceSelect(files) {
    const previewContainer = document.getElementById('evidencePreview');
    previewContainer.innerHTML = '';
    
    Array.from(files).forEach(file => {
        const fileId = Date.now() + Math.random().toString(36).substr(2, 9);
        generalEvidenceFiles.push({id: fileId, file: file});
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'evidence-item';
        itemDiv.id = 'evidence-item-' + fileId;
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'evidence-preview';
                itemDiv.appendChild(img);
                
                const removeBtn = document.createElement('span');
                removeBtn.className = 'remove-evidence';
                removeBtn.innerHTML = '&times;';
                removeBtn.onclick = function() {
                    removeEvidence(fileId);
                };
                itemDiv.appendChild(removeBtn);
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = file.name;
                itemDiv.appendChild(nameSpan);
                
                previewContainer.appendChild(itemDiv);
            };
            reader.readAsDataURL(file);
        } else {
            const icon = document.createElement('i');
            icon.className = 'fas fa-file-video evidence-preview';
            
            const removeBtn = document.createElement('span');
            removeBtn.className = 'remove-evidence';
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = function() {
                removeEvidence(fileId);
            };
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = file.name;
            
            itemDiv.appendChild(icon);
            itemDiv.appendChild(removeBtn);
            itemDiv.appendChild(nameSpan);
            previewContainer.appendChild(itemDiv);
        }
    });
}

/**
 * Elimina una evidencia
 */
function removeEvidence(fileId) {
    // Eliminar del array
    generalEvidenceFiles = generalEvidenceFiles.filter(f => f.id !== fileId);
    
    // Eliminar del DOM
    const item = document.getElementById('evidence-item-' + fileId);
    if (item) {
        item.remove();
    }
    
    // Actualizar el input de archivos
    updateEvidenceInput();
}

/**
 * Actualiza el input de evidencias
 */
function updateEvidenceInput() {
    // Crear un nuevo DataTransfer para los archivos
    const dataTransfer = new DataTransfer();
    
    // Agregar los archivos que quedan
    generalEvidenceFiles.forEach(f => {
        dataTransfer.items.add(f.file);
    });
    
    // Actualizar el input de archivos
    document.getElementById('generalEvidence').files = dataTransfer.files;
}

/**
 * Guarda la inspección
 */
function guardarInspeccion() {
    // Validar que todos los componentes tengan un estado seleccionado
    const radios = document.querySelectorAll('.form-check-input');
    let todosSeleccionados = true;
    
    radios.forEach(radio => {
        const name = radio.getAttribute('name');
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        if (!checked) {
            todosSeleccionados = false;
            const componenteId = name.replace('estado_', '');
            document.getElementById(`componente-${componenteId}`).style.borderColor = 'red';
        }
    });
    
    if (!todosSeleccionados) {
        mostrarError('Por favor, verifica el estado de todos los componentes antes de enviar.');
        return;
    }

    // Mostrar loading
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('submitButton').disabled = true;
    document.querySelector('#submitButton .spinner-border').style.display = 'inline-block';

    // Crear FormData para enviar el formulario
    const formData = new FormData(document.getElementById('walkaroundForm'));
    const url = document.getElementById('walkaroundForm').action;

    // Enviar datos al servidor
    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        // Primero verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return response.text().then(text => {
                throw new Error(`Respuesta del servidor no es JSON: ${text.substring(0, 100)}...`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Mostrar modal de éxito
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            
            // Cambiar mensaje según el modo
            document.querySelector('#successModal .modal-body').textContent = 
                isEditMode ? 'La inspección se ha actualizado correctamente.' : 
                            'La inspección se ha guardado correctamente.';
            
            successModal.show();
            
            // Configurar redirección después de cerrar el modal
            document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
                window.location.href = 'ver_walkaround.html';
            });
        } else {
            // Mostrar modal de error
            document.getElementById('errorModalBody').textContent = data.message || data.error || 'Error al guardar la inspección';
            const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
            errorModal.show();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('errorModalBody').textContent = 'Error: ' + error.message;
        const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        errorModal.show();
    })
    .finally(() => {
        // Ocultar loading
        document.getElementById('loading').style.display = 'none';
        document.getElementById('submitButton').disabled = false;
        document.querySelector('#submitButton .spinner-border').style.display = 'none';
    });
}

/**
 * Envía el formulario de walkaround
 */
async function enviarWalkaround() {
    // Validar que todos los componentes tengan un estado seleccionado
    if (!validarFormulario()) {
        mostrarError('Por favor, verifica el estado de todos los componentes antes de enviar.');
        return;
    }

    // Mostrar loading
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('submitButton').disabled = true;
    document.querySelector('#submitButton .spinner-border').style.display = 'inline-block';

    // Crear FormData para enviar el formulario
    const formData = new FormData(document.getElementById('walkaroundForm'));
    const url = document.getElementById('walkaroundForm').action;

    // ✅ CORRECCIÓN: Asegurar que el campo id_aeronave se envíe incluso si está deshabilitado
    const aeronaveSelect = document.getElementById('aeronave');
    if (aeronaveSelect.disabled) {
        // Si está deshabilitado (modo edición), agregar manualmente el valor
        formData.append('id_aeronave', aeronaveSelect.value);
    }

    // ✅ Añadir evidencias generales al FormData
    generalEvidenceFiles.forEach(fileObj => {
        formData.append('generalEvidence[]', fileObj.file);
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Respuesta del servidor (no JSON):', text);
            throw new Error('El servidor devolvió un formato incorrecto');
        }
        
        const data = await response.json();
        
        if (data.success) {
            const mensaje = isEditMode ? 
                'Walkaround actualizado correctamente.' : 
                'Walkaround creado correctamente.';
                
            mostrarExito(mensaje, () => {
                window.location.href = 'ver_walkaround.html';
            });
        } else {
            mostrarError(data.message || data.error || 'Error al procesar el walkaround');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Ocurrió un error al conectar con el servidor: ' + error.message);
    } finally {
        // Ocultar loading SIEMPRE
        document.getElementById('loading').style.display = 'none';
        document.getElementById('submitButton').disabled = false;
        document.querySelector('#submitButton .spinner-border').style.display = 'none';
    }
}

/**
 * Valida que todos los componentes tengan un estado seleccionado
 */
function validarFormulario() {
    const radios = document.querySelectorAll('.form-check-input');
    let todosSeleccionados = true;
    
    radios.forEach(radio => {
        const name = radio.getAttribute('name');
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        if (!checked) {
            todosSeleccionados = false;
            const componenteId = name.replace('estado_', '');
            const componenteCard = document.getElementById(`componente-${componenteId}`);
            if (componenteCard) {
                componenteCard.style.borderColor = 'red';
            }
        }
    });
    
    return todosSeleccionados;
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
 * Carga la lista de walkarounds y la muestra en la tabla.
 */
async function cargarWalkarounds() {
    const tablaBody = document.querySelector('#tablaWalkarounds tbody');
    tablaBody.innerHTML = '<tr><td colspan="8" class="text-center">Cargando...</td></tr>';

    try {
        const response = await fetch('leer_walkaround.php');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const walkarounds = await response.json();
        
        if (walkarounds.error) {
            throw new Error(walkarounds.error);
        }

        tablaBody.innerHTML = '';
        if (walkarounds.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay walkarounds registrados.</td></tr>';
        } else {
            walkarounds.forEach((walkaround, index) => {
                const fila = document.createElement('tr');
                
                const matricula = walkaround.Matricula || `Aeronave #${walkaround.Id_Aeronave}`;
                
                fila.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${new Date(walkaround.Fechahora).toLocaleString()}</td>
                    <td>${matricula}</td>
                    <td>${walkaround.Elaboro}</td>
                    <td>${walkaround.Responsable}</td>
                    <td>${walkaround.JefeArea}</td>
                    <td>${walkaround.VoBo}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <a href="detalle_walkaround.html?id=${walkaround.Id_Walk}" class="btn btn-info" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </a>
                            <a href="componenteWk.html?id=${walkaround.Id_Walk}" class="btn btn-warning" title="Editar">
                                <i class="fas fa-edit"></i>
                            </a>
                            <button class="btn btn-danger" onclick="eliminarWalkaround(${walkaround.Id_Walk})" title="Eliminar">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                `;
                tablaBody.appendChild(fila);
            });
        }
    } catch (error) {
        console.error('Error al cargar walkarounds:', error);
        tablaBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error al cargar los datos. Por favor, revisa la conexión.</td></tr>`;
    }
}async function cargarWalkarounds() {
    const tablaBody = document.querySelector('#tablaWalkarounds tbody');
    tablaBody.innerHTML = '<tr><td colspan="8" class="text-center">Cargando...</td></tr>';

    try {
        const response = await fetch('leer_walkaround.php');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const walkarounds = await response.json();
        
        if (walkarounds.error) {
            throw new Error(walkarounds.error);
        }

        tablaBody.innerHTML = '';
        if (walkarounds.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay walkarounds registrados.</td></tr>';
        } else {
            walkarounds.forEach((walkaround, index) => {
                const fila = document.createElement('tr');
                
                const matricula = walkaround.Matricula || `Aeronave #${walkaround.Id_Aeronave}`;
                
                fila.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${new Date(walkaround.Fechahora).toLocaleString()}</td>
                    <td>${matricula}</td>
                    <td>${walkaround.Elaboro}</td>
                    <td>${walkaround.Responsable}</td>
                    <td>${walkaround.JefeArea}</td>
                    <td>${walkaround.VoBo}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <a href="detalle_walkaround.html?id=${walkaround.Id_Walk}" class="btn btn-info" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </a>
                            <a href="componenteWk.html?id=${walkaround.Id_Walk}" class="btn btn-warning" title="Editar">
                                <i class="fas fa-edit"></i>
                            </a>
                            <button class="btn btn-danger" onclick="eliminarWalkaround(${walkaround.Id_Walk})" title="Eliminar">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                `;
                tablaBody.appendChild(fila);
            });
        }
    } catch (error) {
        console.error('Error al cargar walkarounds:', error);
        tablaBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error al cargar los datos. Por favor, revisa la conexión.</td></tr>`;
    }
}async function cargarWalkarounds() {
    const tablaBody = document.querySelector('#tablaWalkarounds tbody');
    tablaBody.innerHTML = '<tr><td colspan="8" class="text-center">Cargando...</td></tr>';

    try {
        const response = await fetch('leer_walkaround.php');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const walkarounds = await response.json();
        
        if (walkarounds.error) {
            throw new Error(walkarounds.error);
        }

        tablaBody.innerHTML = '';
        if (walkarounds.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay walkarounds registrados.</td></tr>';
        } else {
            walkarounds.forEach((walkaround, index) => {
                const fila = document.createElement('tr');
                
                const matricula = walkaround.Matricula || `Aeronave #${walkaround.Id_Aeronave}`;
                
                fila.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${new Date(walkaround.Fechahora).toLocaleString()}</td>
                    <td>${matricula}</td>
                    <td>${walkaround.Elaboro}</td>
                    <td>${walkaround.Responsable}</td>
                    <td>${walkaround.JefeArea}</td>
                    <td>${walkaround.VoBo}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <a href="detalle_walkaround.html?id=${walkaround.Id_Walk}" class="btn btn-info" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </a>
                            <a href="componenteWk.html?id=${walkaround.Id_Walk}" class="btn btn-warning" title="Editar">
                                <i class="fas fa-edit"></i>
                            </a>
                            <button class="btn btn-danger" onclick="eliminarWalkaround(${walkaround.Id_Walk})" title="Eliminar">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                `;
                tablaBody.appendChild(fila);
            });
        }
    } catch (error) {
        console.error('Error al cargar walkarounds:', error);
        tablaBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error al cargar los datos. Por favor, revisa la conexión.</td></tr>`;
    }
}

/**
 * Muestra modal de confirmación para eliminar
 */
function mostrarConfirmacionEliminar(id) {
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    if (modalBody && confirmModal && confirmBtn) {
        modalBody.textContent = '¿Estás seguro de que quieres eliminar este walkaround? Esta acción no se puede deshacer.';
        confirmBtn.setAttribute('data-id', id);
        confirmModal.show();
    } else {
        if (confirm('¿Estás seguro de que quieres eliminar este walkaround?')) {
            eliminarWalkaroundConfirmada(id);
        }
    }
}


/**
 * Función auxiliar para agregar todas las evidencias al FormData
 */
function agregarEvidenciasAlFormData(formData) {
    // Agregar evidencias generales
    generalEvidenceFiles.forEach(fileObj => {
        formData.append('generalEvidence[]', fileObj.file);
    });
    
    // Agregar evidencias de componentes (ya están en el FormData por el formulario)
    // Esta función asegura que las evidencias generales también se envíen
    return formData;
}


/**
 * Elimina un walkaround de la base de datos (muestra confirmación primero).
 */
function eliminarWalkaround(id) {
    mostrarConfirmacionEliminar(id);
}

/**
 * Función que ejecuta la eliminación después de la confirmación
 */
function eliminarWalkaroundConfirmada(id) {
    // Cerrar inmediatamente el modal de confirmación
    if (confirmModal) {
        confirmModal.hide();
    }
    
    // Pequeño delay para asegurar el cierre del modal
    setTimeout(() => {
        const formData = new FormData();
        formData.append('id_walk', id);

        fetch('walkaround_eliminar.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarExito(data.success, () => {
                    cargarWalkarounds();
                });
            } else {
                mostrarError(data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Ocurrió un error al conectar con el servidor.');
        });
    }, 300);
}
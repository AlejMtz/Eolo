
class SistemaPermisos {
    constructor() {
        this.usuario = this.obtenerUsuarioActual();
        this.permisos = this.definirPermisos();
        console.log(' Sistema de permisos inicializado:', {
            usuario: this.usuario,
            permisos: this.permisos
        });
    }

    obtenerUsuarioActual() {
        const usuario = {
            id: localStorage.getItem('usuario_id'),
            nombre: localStorage.getItem('usuario_nombre'),
            tipo: localStorage.getItem('tipo_usuario'),
            logueado: localStorage.getItem('usuario_logueado') === 'true'
        };
        
        console.log(' Usuario actual obtenido:', usuario);
        return usuario;
    }

    definirPermisos() {
        const esAdmin = this.usuario.tipo === 'admin';
        const esUsuarioNormal = this.usuario.tipo === 'usuario';
        
        console.log(' Definindo permisos - Es admin?:', esAdmin);
        
        return {
            // Módulo de Despacho
            despacho: {
                ver: true,
                crear: true,
                editar: esAdmin,
                eliminar: esAdmin,
                exportar: true,
                imprimir: true
            },

            // Módulo de Aeronaves
            aeronaves: {
                ver: true,
                crear: true,
                editar: esAdmin,
                eliminar: esAdmin,
                importar: esAdmin
            },

            // Módulo de Aeropuertos
            aeropuertos: {
                ver: true,
                crear: true,
                editar: esAdmin,
                eliminar: esAdmin,
                importar: esAdmin
            },

            // Módulo de Walkarounds
            walkarounds: {
                ver: true,
                crear: true,
                editar: function(registro) {
                    if (esAdmin) return true;
                    return registro.Elaboro === this.usuario.nombre;
                }.bind(this),
                eliminar: esAdmin,
                aprobar: esAdmin
            },

            // Módulo de Entregas de Turno
            entregas_turno: {
                ver: true,
                crear: true,
                editar: function(registro) {
                    if (esAdmin) return true;
                    return registro.Nombre === this.usuario.nombre;
                }.bind(this),
                eliminar: esAdmin,
                firmar: true
            },

            // Módulo de Pernoctas
            pernoctas: {
                ver: true,
                crear: true,
                editar: function(registro) {
                    if (esAdmin) return true;
                    return registro.Persona_Registro === this.usuario.nombre;
                }.bind(this),
                eliminar: esAdmin,
                exportar: true,
                imprimir: true
            },

            // Módulo de Control de Pernoctas
            control_pernoctas: {
                ver: true,
                crear: true,
                editar: function(registro) {
                    if (esAdmin) return true;
                    return registro.Persona_Registro === this.usuario.nombre;
                }.bind(this),
                eliminar: esAdmin,
                exportar: true,
                imprimir: true,
                procesar: true
            },

            // Módulo: Relación de Pernoctas Mensuales
            relacion_pernoctas: {
                ver: true,
                crear: true,
                editar: true,
                eliminar: esAdmin,
                exportar: true,
                imprimir: true,
                generar: true,
                consultar: true
            },

            // Relación de Mantenimiento
            relacion_mantenimiento: {
                ver: true,
                crear: true,
                editar: true,
                eliminar: esAdmin,
                exportar: true,
                imprimir: true,
                generar: true,
                consultar: true,
                csv: true  // Permiso específico para generar CSV
            },

            // Asignación de Mantenimiento
            asignacion_mantenimiento: {
                ver: true,
                crear: true,
                editar: function(registro) {
                    if (esAdmin) return true;
                    // Permitir editar si el usuario es quien registró
                    return registro && registro.Persona_Registro === this.usuario.nombre;
                }.bind(this),
                eliminar: esAdmin,
                exportar: true,
                imprimir: true,
                extraer: true,  
                asignar: true  
            },

            // Módulos de Seguridad
            seguridad: {
                ver: true,
                crear: true,
                editar: function(registro) {
                    if (esAdmin) return true;
                    return registro.Persona_Registro === this.usuario.nombre;
                }.bind(this),
                eliminar: esAdmin,
                exportar: true,
                imprimir: true,
                bitacora: true,
                vehiculos: true,
                visitantes: true
            },

        };
    }


    puedeVer(modulo) {
        const puede = this.permisos[modulo]?.ver || false;
        console.log(`🔍 Verificar ver módulo ${modulo}:`, puede);
        return puede;
    }

    puedeCrear(modulo) {
        const puede = this.permisos[modulo]?.crear || false;
        console.log(` Verificar crear módulo ${modulo}:`, puede);
        return puede;
    }

    puedeEditar(modulo, registro = null) {
        const permiso = this.permisos[modulo]?.editar;
        let resultado = false;
        
        if (typeof permiso === 'function') {
            resultado = permiso(registro);
        } else {
            resultado = permiso || false;
        }
        
        console.log(` Verificar editar módulo ${modulo}:`, resultado, 'Registro:', registro);
        return resultado;
    }

    puedeEliminar(modulo) {
        const puede = this.permisos[modulo]?.eliminar || false;
        console.log(`🔍 Verificar eliminar módulo ${modulo}:`, puede);
        return puede;
    }

    puedeExportar(modulo) {
        const puede = this.permisos[modulo]?.exportar || false;
        console.log(` Verificar exportar módulo ${modulo}:`, puede);
        return puede;
    }

    puedeImprimir(modulo) {
        const puede = this.permisos[modulo]?.imprimir || false;
        console.log(` Verificar imprimir módulo ${modulo}:`, puede);
        return puede;
    }

    // MÉTODOS ESPECÍFICOS POR MÓDULO

    // Método específico para relación de pernoctas
    puedeGenerarRelacion() {
        const puede = this.permisos.relacion_pernoctas?.generar || false;
        console.log('🔍 Verificar generar relación:', puede);
        return puede;
    }

    // Método específico para relación de mantenimiento
    puedeGenerarRelacionMantenimiento() {
        const puede = this.permisos.relacion_mantenimiento?.generar || false;
        console.log('🔍 Verificar generar relación mantenimiento:', puede);
        return puede;
    }

    puedeGenerarCSVMantenimiento() {
        const puede = this.permisos.relacion_mantenimiento?.csv || false;
        console.log('🔍 Verificar generar CSV mantenimiento:', puede);
        return puede;
    }

    // MÉTODOS ESPECÍFICOS PARA ASIGNACIÓN DE MANTENIMIENTO
    puedeExtraerAeronaves() {
        const puede = this.permisos.asignacion_mantenimiento?.extraer || false;
        console.log('🔍 Verificar extraer aeronaves:', puede);
        return puede;
    }

    puedeAsignarMantenimiento() {
        const puede = this.permisos.asignacion_mantenimiento?.asignar || false;
        console.log('🔍 Verificar asignar mantenimiento:', puede);
        return puede;
    }

    // Método específico para control de pernoctas
    puedeProcesarControl() {
        const puede = this.permisos.control_pernoctas?.procesar || false;
        console.log('🔍 Verificar procesar control:', puede);
        return puede;
    }

    // Método específico para seguridad
    puedeAccederSeguridad(submodulo = null) {
        if (submodulo) {
            const puede = this.permisos.seguridad?.[submodulo] || false;
            console.log(`🔍 Verificar seguridad submodulo ${submodulo}:`, puede);
            return puede;
        }
        const puede = this.puedeVer('seguridad');
        console.log('🔍 Verificar seguridad general:', puede);
        return puede;
    }

    //MÉTODOS PARA UI

    aplicarPermisosUI() {
        console.log(' Aplicando permisos en UI...');
        this.aplicarPermisosMenu();
        this.aplicarPermisosBotones();
        this.mostrarInfoPermisos();
    }

    aplicarPermisosMenu() {
        console.log(' Aplicando permisos en menú...');
        
        // Ocultar módulos no accesibles
        const modulosNoAccesibles = ['rampa', 'trafico', 'administracion'];
        
        modulosNoAccesibles.forEach(modulo => {
            if (!this.puedeVer(modulo)) {
                const elementos = document.querySelectorAll(`[data-modulo="${modulo}"]`);
                elementos.forEach(el => {
                    el.style.opacity = '0.5';
                    el.style.pointerEvents = 'none';
                    el.title = 'Módulo no disponible para tu tipo de usuario';
                });
            }
        });

        // relacion_pernoctas accesible
        const elementosRelacionPernoctas = document.querySelectorAll('[data-modulo="relacion_pernoctas"]');
        elementosRelacionPernoctas.forEach(el => {
            if (this.puedeVer('relacion_pernoctas')) {
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
                el.title = 'Acceder al módulo de relación de pernoctas';
            } else {
                el.style.opacity = '0.5';
                el.style.pointerEvents = 'none';
                el.title = 'No tienes permisos para acceder a esta sección';
            }
        });

        // relacion_mantenimiento accesible
        const elementosRelacionMantenimiento = document.querySelectorAll('[data-modulo="relacion_mantenimiento"]');
        elementosRelacionMantenimiento.forEach(el => {
            if (this.puedeVer('relacion_mantenimiento')) {
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
                el.title = 'Acceder al módulo de relación de mantenimiento';
                console.log(' Módulo relacion_mantenimiento habilitado en menú');
            } else {
                el.style.opacity = '0.5';
                el.style.pointerEvents = 'none';
                el.title = 'No tienes permisos para acceder a esta sección';
                console.log(' Módulo relacion_mantenimiento deshabilitado en menú');
            }
        });

        //  asignacion_mantenimiento accesible
        const elementosAsignacionMantenimiento = document.querySelectorAll('[data-modulo="asignacion_mantenimiento"]');
        elementosAsignacionMantenimiento.forEach(el => {
            if (this.puedeVer('asignacion_mantenimiento')) {
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
                el.title = 'Acceder al módulo de asignación de mantenimiento';
                console.log(' Módulo asignacion_mantenimiento habilitado en menú');
            } else {
                el.style.opacity = '0.5';
                el.style.pointerEvents = 'none';
                el.title = 'No tienes permisos para acceder a esta sección';
                console.log(' Módulo asignacion_mantenimiento deshabilitado en menú');
            }
        });

        // eguridad accesible
        const elementosSeguridad = document.querySelectorAll('[data-modulo="seguridad"]');
        elementosSeguridad.forEach(el => {
            if (this.puedeVer('seguridad')) {
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
                el.title = 'Acceder al módulo de seguridad';
            }
        });

        //  control_pernoctas accesible
        const elementosControlPernoctas = document.querySelectorAll('[data-modulo="control_pernoctas"]');
        elementosControlPernoctas.forEach(el => {
            if (this.puedeVer('control_pernoctas')) {
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
                el.title = 'Acceder al módulo de control de pernoctas';
            }
        });
    }

    aplicarPermisosBotones() {
        console.log(' Aplicando permisos en botones...');
        
        const botonesCrear = document.querySelectorAll('.btn-crear');
        const botonesEditar = document.querySelectorAll('.btn-editar');
        const botonesEliminar = document.querySelectorAll('.btn-eliminar');
        const botonesControl = document.querySelectorAll('.btn-control');
        const botonesRelacion = document.querySelectorAll('.btn-relacion');
        const botonesPDF = document.querySelectorAll('.btn-pdf');
        const botonesCSV = document.querySelectorAll('.btn-csv'); // ✅ NUEVO
        
        const botonesExtraer = document.querySelectorAll('.btn-extraer');
        const botonesAsignar = document.querySelectorAll('.btn-asignar');
        
        console.log(` Encontrados ${botonesExtraer.length} botones extraer`);
        console.log(`Encontrados ${botonesAsignar.length} botones asignar`);
        console.log(` Encontrados ${botonesEditar.length} botones editar`);
        console.log(` Encontrados ${botonesEliminar.length} botones eliminar`);
        console.log(`Encontrados ${botonesCSV.length} botones CSV`); // ✅ NUEVO

        // Botones crear
        botonesCrear.forEach(btn => {
            const modulo = btn.dataset.modulo;
            if (modulo && !this.puedeCrear(modulo)) {
                this.deshabilitarElemento(btn, 'No tienes permisos para crear');
            }
        });

        // Botones editar
        botonesEditar.forEach(btn => {
            const modulo = btn.dataset.modulo;
            if (modulo && !this.puedeEditar(modulo)) {
                this.deshabilitarElemento(btn, 'No tienes permisos para editar');
            }
        });

        // Botones eliminar
        botonesEliminar.forEach(btn => {
            const modulo = btn.dataset.modulo;
            if (modulo && !this.puedeEliminar(modulo)) {
                this.deshabilitarElemento(btn, 'No tienes permisos para eliminar');
            }
        });

        // Botones control
        botonesControl.forEach(btn => {
            const modulo = btn.dataset.modulo;
            if (modulo && !this.puedeVer(modulo)) {
                this.deshabilitarElemento(btn, 'No tienes permisos para acceder al control');
            }
        });

        // Botones relación
        botonesRelacion.forEach(btn => {
            const modulo = btn.dataset.modulo;
            if (modulo && !this.puedeVer(modulo)) {
                this.deshabilitarElemento(btn, 'No tienes permisos para generar relación');
            }
        });

        // Botones PDF
        botonesPDF.forEach(btn => {
            const modulo = btn.dataset.modulo;
            if (modulo && !this.puedeExportar(modulo)) {
                this.deshabilitarElemento(btn, 'No tienes permisos para generar PDF');
            }
        });

        // Botones CSV
        botonesCSV.forEach(btn => {
            const modulo = btn.dataset.modulo;
            console.log(`📊 Procesando botón CSV - Módulo: ${modulo}`);
            
            if (modulo === 'relacion_mantenimiento' && !this.puedeGenerarCSVMantenimiento()) {
                this.deshabilitarElemento(btn, 'No tienes permisos para generar CSV de mantenimiento');
                console.log('❌ Botón CSV deshabilitado para relación mantenimiento');
            } else if (modulo && !this.puedeExportar(modulo)) {
                this.deshabilitarElemento(btn, 'No tienes permisos para generar CSV');
                console.log('❌ Botón CSV deshabilitado');
            } else {
                console.log('✅ Botón CSV habilitado');
            }
        });

        const botonesGenerarRelacionMantenimiento = document.querySelectorAll('.btn-generar-relacion-mantenimiento');
        botonesGenerarRelacionMantenimiento.forEach(btn => {
            const modulo = btn.dataset.modulo;
            console.log(`🔧 Procesando botón generar relación mantenimiento - Módulo: ${modulo}`);
            
            if (modulo && !this.puedeGenerarRelacionMantenimiento()) {
                this.deshabilitarElemento(btn, 'No tienes permisos para generar relación de mantenimiento');
                console.log('❌ Botón generar relación mantenimiento deshabilitado');
            } else {
                console.log('✅ Botón generar relación mantenimiento habilitado');
            }
        });

        botonesExtraer.forEach(btn => {
            const modulo = btn.dataset.modulo;
            console.log(`🔧 Procesando botón extraer - Módulo: ${modulo}`);
            
            if (modulo && !this.puedeExtraerAeronaves()) {
                this.deshabilitarElemento(btn, 'No tienes permisos para extraer aeronaves');
                console.log('❌ Botón extraer deshabilitado');
            } else {
                console.log('✅ Botón extraer habilitado');
            }
        });

        botonesAsignar.forEach(btn => {
            const modulo = btn.dataset.modulo;
            console.log(`🔧 Procesando botón asignar - Módulo: ${modulo}`);
            
            if (modulo && !this.puedeAsignarMantenimiento()) {
                this.deshabilitarElemento(btn, 'No tienes permisos para asignar mantenimiento');
                console.log(' Botón asignar deshabilitado');
            } else {
                console.log(' Botón asignar habilitado');
            }
        });

        console.log(' Aplicación de permisos en botones completada');
    }

    deshabilitarElemento(elemento, mensaje) {
        elemento.disabled = true;
        elemento.style.opacity = '0.6';
        elemento.style.cursor = 'not-allowed';
        elemento.title = mensaje;
        
        if (!elemento.querySelector('.permiso-denegado')) {
            const icono = document.createElement('span');
            icono.className = 'permiso-denegado ms-1';
            icono.innerHTML = '';
            icono.title = mensaje;
            elemento.appendChild(icono);
        }
    }

    mostrarInfoPermisos() {
        const infoElement = document.getElementById('infoPermisos');
        if (infoElement) {
            const esAdmin = this.usuario.tipo === 'admin';
            const puedeExtraer = this.puedeExtraerAeronaves();
            const puedeAsignar = this.puedeAsignarMantenimiento();
            const puedeRelacionMantenimiento = this.puedeVer('relacion_mantenimiento');
            const puedeCSVMantenimiento = this.puedeGenerarCSVMantenimiento();
            
            infoElement.innerHTML = `
                <div class="alert alert-info mt-3">
                    <small>
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Permisos actuales:</strong> 
                        ${esAdmin ? 
                            'Tienes permisos completos de administrador' : 
                            'Tienes permisos de usuario regular. Puedes crear y ver registros'
                        }
                    </small>
                </div>
            `;
        }
    }

    // VERIFICACIÓN DE ACCESO

    verificarAccesoPagina(modulo) {
        console.log(` Verificando acceso a página: ${modulo}`);
        
        if (!this.usuario.logueado) {
            console.log('❌ Usuario no logueado, redirigiendo a login');
            window.location.href = '../app/views/login.html';
            return false;
        }

        if (!this.puedeVer(modulo)) {
            console.log(` Usuario no tiene permisos para ver módulo: ${modulo}`);
            this.mostrarErrorAcceso();
            return false;
        }

        console.log(` Acceso permitido al módulo: ${modulo}`);
        return true;
    }

    mostrarErrorAcceso() {
        const modalHTML = `
            <div class="modal fade" id="errorAccesoModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-ban me-2"></i>Acceso Denegado
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>No tienes permisos para acceder a esta sección.</p>
                            <p class="text-muted">Contacta al administrador del sistema si necesitas acceso.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-danger" data-bs-dismiss="modal" onclick="window.history.back()">Volver</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (!document.getElementById('errorAccesoModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        const modal = new bootstrap.Modal(document.getElementById('errorAccesoModal'));
        modal.show();
    }

    

    depurarPermisosCompletos() {
        console.log('DEPURACIÓN COMPLETA DE PERMISOS');
        console.log(' Usuario:', this.usuario);
        
        const moduloRelacionMantenimiento = 'relacion_mantenimiento';
        console.log(` Todos los permisos para ${moduloRelacionMantenimiento}:`, this.permisos[moduloRelacionMantenimiento]);
        
        console.log(` Puede ver ${moduloRelacionMantenimiento}:`, this.puedeVer(moduloRelacionMantenimiento));
        console.log(` Puede generar relación ${moduloRelacionMantenimiento}:`, this.puedeGenerarRelacionMantenimiento());
        console.log(` Puede generar CSV ${moduloRelacionMantenimiento}:`, this.puedeGenerarCSVMantenimiento());
        
        const moduloAsignacion = 'asignacion_mantenimiento';
        console.log(` Todos los permisos para ${moduloAsignacion}:`, this.permisos[moduloAsignacion]);
        
        console.log(` Puede ver ${moduloAsignacion}:`, this.puedeVer(moduloAsignacion));
        console.log(` Puede crear ${moduloAsignacion}:`, this.puedeCrear(moduloAsignacion));
        console.log(` Puede editar ${moduloAsignacion}:`, this.puedeEditar(moduloAsignacion));
        console.log(` Puede eliminar ${moduloAsignacion}:`, this.puedeEliminar(moduloAsignacion));
        console.log(` Puede exportar ${moduloAsignacion}:`, this.puedeExportar(moduloAsignacion));
        console.log(` Puede imprimir ${moduloAsignacion}:`, this.puedeImprimir(moduloAsignacion));
        console.log(` Puede extraer aeronaves:`, this.puedeExtraerAeronaves());
        console.log(` Puede asignar mantenimiento:`, this.puedeAsignarMantenimiento());
        
        const botones = document.querySelectorAll('button');
        console.log(' Total de botones en página:', botones.length);
        
        botones.forEach((btn, index) => {
            if (btn.classList.contains('btn-editar') || btn.classList.contains('btn-eliminar') || 
                btn.classList.contains('btn-extraer') || btn.classList.contains('btn-crear') ||
                btn.classList.contains('btn-asignar') || btn.classList.contains('btn-pdf') ||
                btn.classList.contains('btn-csv') || btn.classList.contains('btn-generar-relacion-mantenimiento')) {
                console.log(` Botón ${index}:`, {
                    texto: btn.textContent.trim(),
                    clases: btn.className,
                    disabled: btn.disabled,
                    modulo: btn.dataset.modulo,
                    onclick: btn.onclick ? 'Sí' : 'No'
                });
            }
        });
    }
}

const permisosSistema = new SistemaPermisos();

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 permisos.js cargado completamente');
    
    setTimeout(() => {
        permisosSistema.depurarPermisosCompletos();
    }, 2000);
});

window.permisosSistema = permisosSistema;
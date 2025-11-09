// permisos.js - Sistema centralizado de control de permisos

class SistemaPermisos {
    constructor() {
        this.usuario = this.obtenerUsuarioActual();
        this.permisos = this.definirPermisos();
    }

    obtenerUsuarioActual() {
        return {
            id: localStorage.getItem('usuario_id'),
            nombre: localStorage.getItem('usuario_nombre'),
            tipo: localStorage.getItem('tipo_usuario'),
            logueado: localStorage.getItem('usuario_logueado') === 'true'
        };
    }

    definirPermisos() {
        const esAdmin = this.usuario.tipo === 'admin';
        
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

            // ✅ NUEVO MÓDULO: Relación de Pernoctas Mensuales
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

            // Módulos de Seguridad
            seguridad: {
                ver: true,
                crear: true,
                editar: function(registro) {
                    if (esAdmin) return true;
                    // Si el registro tiene campo de persona que registra
                    return registro.Persona_Registro === this.usuario.nombre;
                }.bind(this),
                eliminar: esAdmin,
                exportar: true,
                imprimir: true,
                // Permisos específicos para seguridad
                bitacora: true,
                vehiculos: true,
                visitantes: true
            },

            // Módulos futuros (solo admin por ahora)
            rampa: {
                ver: esAdmin, // Cambiado a solo admin por ahora
                crear: esAdmin,
                editar: esAdmin,
                eliminar: esAdmin
            },
            trafico: {
                ver: esAdmin, // Cambiado a solo admin por ahora
                crear: esAdmin,
                editar: esAdmin,
                eliminar: esAdmin
            },

            // Administración del sistema
            administracion: {
                ver: esAdmin,
                crear: esAdmin,
                editar: esAdmin,
                eliminar: esAdmin,
                configurar: esAdmin
            }
        };
    }

    // Métodos de verificación
    puedeVer(modulo) {
        return this.permisos[modulo]?.ver || false;
    }

    puedeCrear(modulo) {
        return this.permisos[modulo]?.crear || false;
    }

    puedeEditar(modulo, registro = null) {
        const permiso = this.permisos[modulo]?.editar;
        if (typeof permiso === 'function') {
            return permiso(registro);
        }
        return permiso || false;
    }

    puedeEliminar(modulo) {
        return this.permisos[modulo]?.eliminar || false;
    }

    // ✅ NUEVO: Método específico para relación de pernoctas
    puedeGenerarRelacion() {
        return this.permisos.relacion_pernoctas?.generar || false;
    }

    // Método específico para control de pernoctas
    puedeProcesarControl() {
        return this.permisos.control_pernoctas?.procesar || false;
    }

    // Método específico para seguridad
    puedeAccederSeguridad(submodulo = null) {
        if (submodulo) {
            return this.permisos.seguridad?.[submodulo] || false;
        }
        return this.puedeVer('seguridad');
    }

    // Métodos para UI
    aplicarPermisosUI() {
        this.aplicarPermisosMenu();
        this.aplicarPermisosBotones();
        this.mostrarInfoPermisos();
    }

    aplicarPermisosMenu() {
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

        // ✅ Asegurar que relacion_pernoctas sea accesible
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

        // Asegurar que seguridad sea accesible
        const elementosSeguridad = document.querySelectorAll('[data-modulo="seguridad"]');
        elementosSeguridad.forEach(el => {
            if (this.puedeVer('seguridad')) {
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
                el.title = 'Acceder al módulo de seguridad';
            }
        });

        // Asegurar que control_pernoctas sea accesible
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
        // Aplicar a botones de acción genéricos
        const botonesCrear = document.querySelectorAll('.btn-crear');
        const botonesEditar = document.querySelectorAll('.btn-editar');
        const botonesEliminar = document.querySelectorAll('.btn-eliminar');
        const botonesControl = document.querySelectorAll('.btn-control');
        const botonesRelacion = document.querySelectorAll('.btn-relacion'); // ✅ NUEVO
        
        botonesCrear.forEach(btn => {
            const modulo = btn.dataset.modulo;
            if (modulo && !this.puedeCrear(modulo)) {
                this.deshabilitarElemento(btn, 'No tienes permisos para crear');
            }
        });

        botonesEditar.forEach(btn => {
            const modulo = btn.dataset.modulo;
            if (modulo && !this.puedeEditar(modulo)) {
                this.deshabilitarElemento(btn, 'No tienes permisos para editar');
            }
        });

        botonesEliminar.forEach(btn => {
            const modulo = btn.dataset.modulo;
            if (modulo && !this.puedeEliminar(modulo)) {
                this.deshabilitarElemento(btn, 'No tienes permisos para eliminar');
            }
        });

        botonesControl.forEach(btn => {
            const modulo = btn.dataset.modulo;
            if (modulo && !this.puedeVer(modulo)) {
                this.deshabilitarElemento(btn, 'No tienes permisos para acceder al control');
            }
        });

        // ✅ NUEVO: Aplicar permisos a botones de relación
        botonesRelacion.forEach(btn => {
            const modulo = btn.dataset.modulo;
            if (modulo && !this.puedeVer(modulo)) {
                this.deshabilitarElemento(btn, 'No tienes permisos para generar relación');
            }
        });
    }

    deshabilitarElemento(elemento, mensaje) {
        elemento.disabled = true;
        elemento.style.opacity = '0.6';
        elemento.style.pointerEvents = 'none';
        elemento.title = mensaje;
    }

    mostrarInfoPermisos() {
        const infoElement = document.getElementById('infoPermisos');
        if (infoElement) {
            const esAdmin = this.usuario.tipo === 'admin';
            
            infoElement.innerHTML = `
                <div class="alert alert-info mt-3">
                    <small>
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Permisos actuales:</strong> 
                        ${esAdmin ? 
                            'Tienes permisos completos de administrador' : 
                            'Puedes crear y ver registros'
                        }
                        ${this.puedeVer('relacion_pernoctas') ? ' | Puedes generar relaciones de pernoctas' : ''}
                    </small>
                </div>
            `;
        }
    }

    // Verificar acceso a página
    verificarAccesoPagina(modulo) {
        if (!this.usuario.logueado) {
            window.location.href = '../app/views/login.html';
            return false;
        }

        if (!this.puedeVer(modulo)) {
            this.mostrarErrorAcceso();
            return false;
        }

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
}

// Instancia global
const permisosSistema = new SistemaPermisos();
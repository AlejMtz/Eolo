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
                ver: true, // Todos pueden ver
                crear: true, // Todos pueden crear
                editar: esAdmin, // Solo admin puede editar de otros
                eliminar: esAdmin, // Solo admin puede eliminar
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

       walkarounds: {
    ver: true,
    crear: true,
    editar: function(registro) {
        if (esAdmin) return true;
        // Mismo que entregas_turno - usar nombre del elaborador
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
                    // Usuarios solo pueden editar sus propias entregas
                    return registro.Nombre === this.usuario.nombre;
                }.bind(this),
                eliminar: esAdmin,
                firmar: true
            },

            // Módulos futuros (solo admin por ahora)
            rampa: {
                ver: true,
                crear: true,
                editar: esAdmin,
                eliminar: esAdmin
            },
            trafico: {
                ver: true,
                crear: true,
                editar: esAdmin,
                eliminar: esAdmin
            },
            seguridad: {
                ver: true,
                crear: true,
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

    // Métodos para UI
    aplicarPermisosUI() {
        this.aplicarPermisosMenu();
        this.aplicarPermisosBotones();
        this.mostrarInfoPermisos();
    }

    aplicarPermisosMenu() {
        // Ocultar módulos no accesibles
        const modulosNoAccesibles = ['rampa', 'trafico', 'seguridad', 'administracion'];
        
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
    }

    aplicarPermisosBotones() {
        // Aplicar a botones de acción genéricos
        const botonesCrear = document.querySelectorAll('.btn-crear');
        const botonesEditar = document.querySelectorAll('.btn-editar');
        const botonesEliminar = document.querySelectorAll('.btn-eliminar');
        
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

        // Agregar modal al DOM si no existe
        if (!document.getElementById('errorAccesoModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        const modal = new bootstrap.Modal(document.getElementById('errorAccesoModal'));
        modal.show();
    }
}

// Instancia global
const permisosSistema = new SistemaPermisos();
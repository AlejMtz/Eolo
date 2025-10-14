document.addEventListener('DOMContentLoaded', function() {
            // Validación del formulario
            document.getElementById('aeronaveForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Aquí iría la validación completa y envío AJAX
                
                // Simulación de éxito
                const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                successModal.show();
            });
        });
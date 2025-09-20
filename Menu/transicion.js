    document.addEventListener('DOMContentLoaded', () => {
        const links = document.querySelectorAll('a[href^="#"], a:not([target="_blank"])');

        links.forEach(link => {
            link.addEventListener('click', (event) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('http')) {
                    return; // No animar enlaces externos
                }
                
                event.preventDefault(); // Evita la navegación inmediata
                
                const body = document.body;
                
                // Aplica la clase de salida a la página actual
                body.classList.add('page-transition');

                // Navega a la nueva página después de que la transición termine
                setTimeout(() => {
                    window.location.href = href;
                }, 400); // El tiempo debe coincidir con la duración de la transición CSS
            });
        });

        // Esta parte es para la nueva página que carga
        // Mueve el contenido a la derecha y lo desliza a la izquierda
        const body = document.body;
        body.classList.add('page-enter');
        
        // Retira la clase page-enter para que el contenido regrese a su posición
        setTimeout(() => {
            body.classList.remove('page-enter');
        }, 10); // Un pequeño retraso para que la transición funcione
    });

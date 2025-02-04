/**
 * Formatea un número como una cadena de moneda.
 * @param {number} value - El valor a formatear.
 * @returns {string} - El valor formateado como moneda.
 */
export function formatCurrency(value) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(value);
}

/**
 * Desformatea una cadena de moneda a un número.
 * @param {string} value - La cadena de moneda a desformatear.
 * @returns {number} - El valor numérico.
 */
export function unformatCurrency(value) {
    return parseFloat(value.replace(/[^0-9.-]+/g, ''));
}

/**
 * Muestra un mensaje de error usando SweetAlert2.
 * @param {string} title - El título del mensaje.
 * @param {string} text - El texto del mensaje.
 */
export function showError(title, text) {
    Swal.fire({
        icon: 'error',
        title: title,
        text: text,
    });
}

/**
 * Muestra un mensaje de advertencia usando SweetAlert2.
 * @param {string} title - El título del mensaje.
 * @param {string} text - El texto del mensaje.
 */
export function showWarning(title, text) {
    Swal.fire({
        icon: 'warning',
        title: title,
        text: text,
    });
}

/**
 * Muestra un mensaje de éxito usando SweetAlert2.
 * @param {string} title - El título del mensaje.
 * @param {string} text - El texto del mensaje.
 */
export function showSuccess(title, text) {
    Swal.fire({
        icon: 'success',
        title: title,
        text: text,
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
            const timerInterval = setInterval(() => {
                const content = Swal.getContent();
                if (content) {
                    const b = content.querySelector('b');
                    if (b) {
                        b.textContent = Swal.getTimerLeft();
                    }
                }
            }, 100);
        },
        willClose: () => {
            clearInterval(timerInterval);
        },
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
            console.log('Mensaje de éxito cerrado automáticamente');
        } else if (result.isConfirmed) {
            console.log('Mensaje de éxito confirmado:', title, text);
        }
    });
}

/**
 * Formatea un campo de entrada en tiempo real.
 * @param {HTMLElement} input - El campo de entrada a formatear.
 */
export function formatInputField(input) {
    const value = input.value.replace(/[^0-9.,]/g, '');
    input.value = formatCurrency(unformatCurrency(value));
}
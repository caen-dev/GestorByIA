import { showError, showSuccess } from './utils.js';

$(document).ready(function () {
    // Manejar el envío del formulario de registro
    $('#register-form').submit(async function (e) {
        e.preventDefault();
        const email = $('#register-email').val().trim();
        const password = $('#register-password').val().trim();

        if (!email || !password) {
            showError('Campos Requeridos', 'Por favor, ingresa tu email y contraseña.');
            return;
        }

        if (!validateEmail(email)) {
            showError('Correo Inválido', 'Por favor, ingresa un correo electrónico válido.');
            return;
        }

        if (!validatePassword(password)) {
            showError('Contraseña Inválida', 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            if (response.ok) {
                showSuccess('Éxito', 'Registro exitoso. Serás redirigido automáticamente en 2 segundos o puedes <a href="login.html">iniciar sesión ahora</a>.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Ocurrió un error al registrar el usuario.');
            }
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            showError('Error', error.message);
        }
    });

    // Manejar el envío del formulario de inicio de sesión
    $('#login-form').submit(async function (e) {
        e.preventDefault();
        const email = $('#login-email').val().trim();
        const password = $('#login-password').val().trim();

        if (!email || !password) {
            showError('Campos Requeridos', 'Por favor, ingresa tu email y contraseña.');
            return;
        }

        if (!validateEmail(email)) {
            showError('Correo Inválido', 'Por favor, ingresa un correo electrónico válido.');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                showSuccess('Éxito', 'Inicio de sesión exitoso. Serás redirigido automáticamente en 2 segundos.');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Usuario o contraseña incorrectos.');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            showError('Error', error.message);
        }
    });
});

// Validar el formato del correo electrónico
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validar la longitud de la contraseña
function validatePassword(password) {
    return password.length >= 6; // Requisito mínimo de longitud
}
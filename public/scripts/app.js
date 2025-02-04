import { formatCurrency, unformatCurrency, showError, showWarning, showSuccess, formatInputField } from '/Users/PC/Desktop/carniceria--app/public/scripts/utils.js';
import { createSummaryChart, updateDashboard } from '/Users/PC/Desktop/carniceria--app/public/scripts/dashboard.js';
import { handleTransaction, updateClientDebtList, updateClientSelect } from '/Users/PC/Desktop/carniceria--app/public/scripts/transactions.js';

let clients = {};
let userId = null;

$(document).ready(async function () {
    await initializeApp();
    $('#client-form').submit(handleClientFormSubmit);
    $('#account-form').submit(handleAccountFormSubmit);
    $('#debt-search').on('input', handleDebtSearch);
    $('#toggle-dark-mode').on('click', toggleDarkMode);
    $('#toggle-dashboard').on('click', toggleDashboard);
    $('#client-filter').on('input', handleClientFilter);
    $('#debt-list').on('click', '.toggle-info', handleViewInfo);
});

async function initializeApp() {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            userId = await getUserIdFromToken(token);
            if (userId) {
                $('#logout-btn').show();
                $('#guest-msg').hide();
                await loadClients();
            } else {
                localStorage.removeItem('token');
                $('#logout-btn').hide();
                $('#guest-msg').show();
                clients = {};
                updateClientSelect(clients);
                updateClientDebtList(clients);
                updateDashboard(clients);
            }
        } else {
            $('#logout-btn').hide();
            $('#guest-msg').show();
            clients = {};
            updateClientSelect(clients);
            updateClientDebtList(clients);
            updateDashboard(clients);
        }
    } catch (error) {
        showError('Error', error.message || 'Ocurrió un error al cargar los datos.');
    }
}

async function getUserIdFromToken(token) {
    const response = await fetch('/api/auth/user', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (response.ok) {
        const user = await response.json();
        return user._id;
    } else {
        throw new Error('No se pudo obtener el usuario.');
    }
}

async function loadClients() {
    try {
        const response = await fetch(`/api/clients/${userId}`);
        if (response.ok) {
            const loadedClients = await response.json();
            clients = loadedClients.reduce((acc, client) => {
                acc[client.name] = client;
                return acc;
            }, {});
            updateClientSelect(clients);
            updateClientDebtList(clients);
            updateDashboard(clients);
        } else {
            throw new Error('No se pudieron cargar los clientes.');
        }
    } catch (error) {
        showError('Error', error.message || 'Ocurrió un error al cargar los datos.');
    }
}

async function handleClientFormSubmit(e) {
    e.preventDefault();
    const name = $('#client-name').val().trim();
    const phone = $('#client-phone').val().trim() || '-';
    const street = $('#client-street').val().trim() || '-';
    const number = $('#client-number').val().trim() || '-';
    if (!name) {
        showWarning('Campo Requerido', 'El nombre del cliente es obligatorio.');
        return;
    }
    try {
        const response = await fetch(`/api/clients/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, phone, street, number })
        });
        if (response.ok) {
            const newClient = await response.json();
            clients[newClient.name] = newClient;
            updateClientSelect(clients);
            $('#client-form').trigger('reset');
            showSuccess('Éxito', 'Cliente agregado con éxito.');
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Ocurrió un error al agregar el cliente.');
        }
    } catch (error) {
        showError('Error', error.message);
    }
}

async function handleAccountFormSubmit(e) {
    e.preventDefault();
    const clientName = $('#select-client').val();
    const transactionType = $('#transaction-type').val();
    const amount = unformatCurrency($('#amount').val());
    const paymentMethod = $('#payment-method').val();
    if (!clientName) {
        showWarning('Campo Requerido', 'Seleccione un cliente.');
        return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
        showWarning('Campo Inválido', 'Ingrese un monto válido.');
        return;
    }
    try {
        const response = await fetch(`/api/clients/${userId}/${clientName}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: transactionType, amount, paymentMethod })
        });
        if (response.ok) {
            const updatedClient = await response.json();
            clients[updatedClient.name] = updatedClient;
            updateClientDebtList(clients);
            updateDashboard(clients);
            showSuccess(
                'Transacción Registrada',
                transactionType === 'purchase'
                    ? `Compra registrada para ${clientName}: $${formatCurrency(amount)} (${paymentMethod})`
                    : `Pago registrado para ${clientName}: $${formatCurrency(amount)} (${paymentMethod})`
            );
            $('#account-form').trigger('reset');
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Ocurrió un error al registrar la transacción.');
        }
    } catch (error) {
        showError('Error', error.message);
    }
}

function handleDebtSearch() {
    const searchText = $(this).val().toLowerCase();
    $('#debt-list tbody tr').each(function () {
        const rowText = $(this).text().toLowerCase();
        $(this).toggle(rowText.indexOf(searchText) > -1);
    });
}

function handleClientFilter() {
    const filter = $(this).val();
    updateClientSelect(clients, filter);
}

function toggleDarkMode() {
    $('body').toggleClass('dark-mode');
    const isDarkMode = $('body').hasClass('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    $(this).text(isDarkMode ? 'Desactivar Modo Oscuro' : 'Activar Modo Oscuro');
}

function toggleDashboard() {
    const $dashboard = $('#dashboard');
    if ($dashboard.is(':visible')) {
        $dashboard.slideUp();
    } else {
        $dashboard.slideDown();
    }
}

function handleViewInfo() {
    const clientName = $(this).data('client-name');
    const client = clients[clientName];
    if (client) {
        const clientInfo = `
            Nombre: ${client.name}<br>
            Teléfono: ${client.phone}<br>
            Calle: ${client.street}<br>
            Número: ${client.number}<br>
            Balance: $${formatCurrency(client.balance)}
        `;
        $('#client-info-body').html(clientInfo);
        $('#client-info-modal').modal('show'); // Muestra el modal
    } else {
        showWarning('Cliente no encontrado', 'No se encontró información para el cliente seleccionado.');
    }
}

$('#logout-btn').on('click', async function () {
    localStorage.removeItem('token');
    $('#logout-btn').hide();
    $('#guest-msg').show();
    clients = {};
    updateClientSelect(clients);
    updateClientDebtList(clients);
    updateDashboard(clients);
});

// Configurar eventos para formatear campos de entrada en tiempo real
$('#amount').on('input', function () {
    formatInputField(this);
    const rawValue = this.value.replace(/[^0-9.,]/g, '');
    const numericValue = unformatCurrency(rawValue);
    if (isNaN(numericValue) || numericValue <= 0) {
        $(this).addClass('is-invalid');
        $('#amount-feedback').text('Ingrese un monto válido.');
    } else {
        $(this).removeClass('is-invalid');
        $('#amount-feedback').text('');
    }
});
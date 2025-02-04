import { formatCurrency } from './utils.js';

/**
 * Maneja una transacción (compra o pago) para un cliente.
 * @param {string} clientName - Nombre del cliente.
 * @param {string} type - Tipo de transacción ('purchase' o 'payment').
 * @param {number} amount - Monto de la transacción.
 * @param {string} paymentMethod - Método de pago.
 * @param {Object} clients - Objeto de clientes.
 * @returns {Object} - Objeto del cliente actualizado.
 */
export function handleTransaction(clientName, type, amount, paymentMethod, clients) {
    const client = clients[clientName];
    if (!client) throw new Error('El cliente no existe.');

    const date = new Date().toLocaleDateString();
    if (type === 'purchase') {
        client.transactions.push({ type: 'Compra', amount, date, paymentMethod });
        client.balance += amount;
    } else if (type === 'payment') {
        if (client.balance < amount) throw new Error('El monto ingresado excede la deuda actual.');
        client.balance = Math.max(0, client.balance - amount);
        client.transactions.push({ type: 'Pago', amount, date, paymentMethod });
    } else {
        throw new Error('Tipo de transacción no válido.');
    }

    return client;
}

/**
 * Actualiza la lista de deudas en la interfaz.
 * @param {Object} clients - Objeto de clientes.
 */
export function updateClientDebtList(clients) {
    const $debtList = $('#debt-list tbody');
    $debtList.empty();

    Object.keys(clients)
        .sort()
        .forEach((clientName) => {
            const data = clients[clientName];
            if (data.transactions.length > 0 && data.balance > 0) {
                const recentTransactions = data.transactions.slice(-5);
                const transactionDetails = recentTransactions
                    .map((t) => `${t.date} - ${t.type}: $${formatCurrency(t.amount)} (${t.paymentMethod})`)
                    .join('<br>') +
                    (data.transactions.length > 5 ? '<a href="#" class="view-more">Ver más</a>' : '');

                const $toggleButton = $('<button>')
                    .html('Ver Info')
                    .addClass('btn btn-info btn-sm toggle-info')
                    .data('client-name', clientName);

                const $clientRow = $('<tr>').append(
                    $('<td>').text(clientName).append($('<div>').addClass('btn-container').append($toggleButton)),
                    $('<td>').html(transactionDetails),
                    $('<td>').text(`$${formatCurrency(data.balance)}`)
                );

                $debtList.append($clientRow);
            }
        });

    // Manejo de eventos para ver más transacciones
    $debtList.off('click', '.view-more').on('click', '.view-more', function (e) {
        e.preventDefault();
        const clientName = $(this).closest('tr').find('.toggle-info').data('client-name');
        const client = clients[clientName];
        const allTransactions = client.transactions
            .map((t) => `${t.date} - ${t.type}: $${formatCurrency(t.amount)} (${t.paymentMethod})`)
            .join('<br>');
        $(this).closest('td').html(allTransactions);
    });
}

/**
 * Actualiza el select de clientes.
 * @param {Object} clients - Objeto de clientes.
 * @param {string} filter - Filtro para el nombre del cliente.
 */
export function updateClientSelect(clients, filter = '') {
    const $selectClient = $('#select-client');
    $selectClient.empty();

    Object.keys(clients)
        .sort()
        .forEach((clientName) => {
            if (clientName.toLowerCase().includes(filter.toLowerCase())) {
                $selectClient.append(new Option(clientName, clientName));
            }
        });
}
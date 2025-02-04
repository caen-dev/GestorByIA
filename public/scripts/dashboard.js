import { formatCurrency } from './utils.js';

/**
 * Calcula las estadísticas del dashboard.
 * @param {Object} clients - Objeto de clientes.
 * @returns {Object} - Objeto con las estadísticas calculadas.
 */
function calculateDashboardStats(clients) {
    const totalClients = Object.keys(clients).length;
    const totalDebt = Object.values(clients).reduce((sum, client) => sum + client.balance, 0);
    const totalPayments = Object.values(clients).reduce(
        (sum, client) =>
            sum +
            client.transactions
                .filter((t) => t.type === 'Pago')
                .reduce((paymentSum, t) => paymentSum + t.amount, 0),
        0
    );
    return { totalClients, totalDebt, totalPayments };
}

/**
 * Crea y actualiza el gráfico de resumen.
 * @param {Object} clients - Objeto de clientes.
 */
export function createSummaryChart(clients) {
    const { totalClients, totalDebt, totalPayments } = calculateDashboardStats(clients);
    const ctx = document.getElementById('summary-chart').getContext('2d');
    if (window.summaryChart) window.summaryChart.destroy();
    window.summaryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Clientes', 'Deuda Total', 'Pagos Totales'],
            datasets: [
                {
                    label: 'Estadísticas',
                    data: [totalClients, totalDebt, totalPayments],
                    backgroundColor: ['#0d6efd', '#dc3545', '#28a745'],
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: $${formatCurrency(value)}`;
                        },
                    },
                },
            },
            scales: {
                x: { title: { display: true, text: 'Categoría' } },
                y: {
                    title: { display: true, text: 'Valor' },
                    ticks: {
                        callback: (value) => `$${formatCurrency(value)}`,
                    },
                },
            },
            animation: {
                duration: 1000, // Duración de la animación en milisegundos
                easing: 'easeInOutQuad', // Tipo de animación
            },
        },
    });
}

/**
 * Actualiza el dashboard con las estadísticas actuales.
 * @param {Object} clients - Objeto de clientes.
 */
export function updateDashboard(clients) {
    const { totalClients, totalDebt, totalPayments } = calculateDashboardStats(clients);
    $('#total-clients').text(totalClients);
    $('#total-debt').text(`$${formatCurrency(totalDebt)}`);
    $('#total-payments').text(`$${formatCurrency(totalPayments)}`);
    createSummaryChart(clients);
}
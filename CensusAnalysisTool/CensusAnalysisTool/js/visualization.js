/**
 * Fetch data from the server based on selected procedure and parameters.
 * @param {string} procedure - The stored procedure name.
 * @param {Object} params - Parameters for the procedure.
 * @returns {Promise<Array>} - The fetched data.
 */
async function fetchData(procedure, params) {
    const response = await fetch(`/api/procedure/${procedure}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    return response.json();
}

/**
 * Render a chart using Chart.js
 * @param {string} chartId - ID of the canvas element
 * @param {Array} labels - Labels for the chart
 * @param {Array} data - Data points for the chart
 */
function renderChart(chartId, labels, data) {
    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Visualization Data',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Event listener for generating the chart
document.getElementById('generate-chart').addEventListener('click', async () => {
    const procedure = document.getElementById('procedure-select').value;
    const year = document.getElementById('year-select').value;

    try {
        const data = await fetchData(procedure, { Year: year });
        const labels = data.map(item => item.Tract || item.CountyFP || 'Unknown');
        const values = data.map(item => item.TotalPop || item.PeopleBelowPovertyLine || 0);

        renderChart('dataChart', labels, values);
    } catch (error) {
        console.error('Error generating chart:', error);
    }
});
/**
 * Fetch data from the server based on selected procedure and parameters.
 * @param {string} procedure - The stored procedure name.
 * @param {Object} params - Parameters for the procedure.
 * @returns {Promise<Array>} - The fetched data.
 */
async function fetchData(procedure, params) {
    const response = await fetch(`http://localhost:3000/api/procedure/${procedure}`, {
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
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

// Event listener for generating the chart
document.getElementById('generate-chart').addEventListener('click', async () => {
    const procedure = document.getElementById('procedure-select').value;

    // Parameters for different stored procedures (using years 2012 to 2015)
    const params = {
        sp_IdentifyHighPovertyAreas: { StartYear: 2012, EndYear: 2015, PovertyThreshold: 500 },
        sp_IdentifyLowCoverageParishes: { Year: 2015, CoverageThreshold: 200 },
        sp_AnalyzeStoreLocationPotential: { Year: 2015, MinPopulation: 1000, MinMedianIncome: 40000 },
        sp_ExportCensusDataForHealthStudy: { StartYear: 2012, EndYear: 2015 },
        sp_GetYearlyPopulationTrends: { StartYear: 2012, EndYear: 2015 },
        sp_IdentifyTransportGaps: { Year: 2015, MaxTravelTime: 30.0, MinPublicTransportUsage: 50 },
        sp_AssessHousingAffordability: { Year: 2015, RentToIncomeRatioThreshold: 0.30 },
        sp_IdentifyUnderinsuredPopulations: { Year: 2015 },
    };

    try {
        const data = await fetchData(procedure, params[procedure]);
        const labels = data.map((item) => item.Tract || item.CountyFP || 'Unknown');
        const values = data.map((item) => item.TotalPop || item.PeopleBelowPovertyLine || 0);

        renderChart('dataChart', labels, values);
    } catch (error) {
        console.error('Error generating chart:', error);
    }
});
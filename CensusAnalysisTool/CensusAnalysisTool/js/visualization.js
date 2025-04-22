/**
 * Fetch data from the server based on selected procedure and parameters.
 * @param {string} procedure - The stored procedure name.
 * @param {Object} params - Parameters for the procedure.
 * @returns {Promise<Array>} - The fetched data.
 */
async function fetchData(procedure, params) {
    console.log(`Fetching data for procedure: ${procedure}`);
    console.log('Parameters:', params);

    const response = await fetch(`http://localhost:3000/api/procedure/${procedure}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    console.log('Data fetched from server:', data);
    return data;
}

/**
 * Render a bar chart using D3.js
 * @param {string} chartId - ID of the container element
 * @param {Array} labels - Labels for the chart (e.g., Years)
 * @param {Array} data - Data points for the chart (e.g., PeopleBelowPovertyLine)
 */
function renderChart(chartId, labels, data) {
    // Clear any existing chart
    const container = d3.select(`#${chartId}`);
    container.selectAll('*').remove();

    // Set dimensions and margins
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG container
    const svg = container
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .domain(labels)
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data)])
        .nice()
        .range([height, 0]);

    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(y));

    // Add bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d, i) => x(labels[i]))
        .attr('y', (d) => y(d))
        .attr('width', x.bandwidth())
        .attr('height', (d) => height - y(d))
        .attr('fill', 'steelblue');
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
        console.log(`Selected procedure: ${procedure}`);
        const data = await fetchData(procedure, params[procedure]);
        console.log('Data to be visualized:', data);

        // Extract only the required columns: Year and the last column (e.g., PeopleBelowPovertyLine)
        const labels = data.map((item) => item.Year); // Use Year as labels
        const values = data.map((item) => {
            // Dynamically get the last column value
            const keys = Object.keys(item);
            return item[keys[keys.length - 1]]; // Get the value of the last column
        });

        console.log('Labels (Years):', labels);
        console.log('Values (Last Column):', values);

        renderChart('dataChart', labels, values);
    } catch (error) {
        console.error('Error generating chart:', error);
    }
});
/* global io */
const { Chart } = require("chart.js/auto")
const socket = io.connect();

// Object to store the charts for each device
const deviceCharts = {};

function updateChart(deviceId, fuel) {
    let now = new Date();
    now = `${now.getHours()} : ${now.getMinutes()} : ${now.getSeconds()}`;

    // Check if the chart for the device already exists
    if (!deviceCharts[deviceId]) {
        // Create a new canvas element for the new device
        const canvas = document.createElement('canvas');
        canvas.id = `chart-${deviceId}`;
        document.body.appendChild(canvas);

        // Create a new chart for this device
        const data = {
            labels: [now],
            datasets: [{
                label: `Device ${deviceId}`,
                data: [fuel],
                borderColor: 'rgb(189,195,199)',
                lineTension: 0.1
            }]
        };
        const config = {
            type: 'line',
            data: data
        };
        const chart = new Chart(canvas, config);
        deviceCharts[deviceId] = chart;  // Store the chart
    }
    else {
        // Update the existing chart for the device
        const chart = deviceCharts[deviceId];
        if (chart.data.datasets[0].data.length >= 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
        chart.data.labels.push(now);
        chart.data.datasets[0].data.push(fuel);
        chart.update();
    }
}

// Socket listener for "Graph-Update" event
socket.on("Graph-Update", ({ fuel, deviceId }) => {
    updateChart(deviceId, fuel);
});


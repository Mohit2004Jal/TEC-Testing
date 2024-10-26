const { Chart } = require("chart.js/auto");
const data_array = [];
const label_array = [];
let chart;
const canvas = document.querySelector('canvas');

function create_graph(selectedTanker) {
    // Destroy the previous chart if it exists
    if (chart) {
        chart.destroy();
    }

    const data = {
        labels: label_array,
        datasets: [{
            label: selectedTanker,
            data: data_array,
            borderColor: 'rgb(189,195,199)',
            lineTension: 0.1
        }]
    };

    const config = {
        type: 'line',
        data: data
    };
    chart = new Chart(canvas, config);
}
//Function to update Graph
function update_graph(fuel) {
    if (chart.data.datasets[0].data.length >= 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    const date = new Date();
    const now = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    chart.data.labels.push(now);
    chart.data.datasets[0].data.push(fuel);
    chart.update();
}

function update_graph_data(values) {
    // Clear previous data
    [data_array, label_array].forEach(array => {
        while (array.length > 0) {
            array.pop();
        }
    })

    values.forEach(({ fuel_level, timestamp }) => {
        data_array.unshift(fuel_level);
        const date = new Date(timestamp);
        const label_format = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
        label_array.unshift(label_format);
    });
}


module.exports = {
    create_graph,
    update_graph,
    update_graph_data
}
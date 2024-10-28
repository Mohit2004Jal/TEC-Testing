const { Chart } = require("chart.js/auto");

const data_array = [];
const label_array = [];

let local_factor = 1;
let chart;

const graph_color = 'black'

const canvas = document.querySelector('canvas');

function create_graph(selectedTanker) {
    function generate_grid(color, lineWidth) {
        return (
            {
                display: true,
                color: color,
                lineWidth: lineWidth
            }
        )
    }
    function generate_labels(text, font_size, font_weight, color) {
        return {
            display: true,
            text: text,
            font: {
                size: font_size,
                weight: font_weight
            },
            color: color
        }
    }

    // Destroy the previous chart if it exists
    if (chart) {
        chart.destroy();
    }

    const data = {
        labels: label_array,
        datasets: [{
            label: selectedTanker,
            data: data_array,
            borderColor: graph_color,
            lineTension: 0.1
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: generate_grid(graph_color, 1),
                title: generate_labels('Time', 14, 'bold', graph_color)
            },
            y: {
                grid: generate_grid(graph_color, 1),
                title: generate_labels('Fuel', 14, 'bold', graph_color),
                beginAtZero: true
            }
        },
    }
    const config = {
        type: 'line',
        data: data,
        options: options
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
    chart.data.datasets[0].data.push(fuel * local_factor);
    chart.update();
}

function update_graph_data(values) {
    // Clear previous data
    [data_array, label_array].forEach(array => {
        while (array.length > 0) {
            array.pop();
        }
    })

    local_factor = values[0].factor
    values.forEach(({ fuel_level, timestamp }) => {
        data_array.unshift(fuel_level * local_factor);
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
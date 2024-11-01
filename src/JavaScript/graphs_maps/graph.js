/* global Chart, ChartStreaming, ChartZoom*/
Chart.register(ChartStreaming, ChartZoom, 'chartjs-adapter-luxon');

const visibleData = [];
// const dataCache = [];

// Factor to multiply data with
let local_factor = 1;
//Chart instance and its styling
let chart;
const graph_color = 'black'
const canvas = document.querySelector('canvas');

function generate_grid(color, lineWidth) {
    return { display: true, color: color, lineWidth: lineWidth }
}
function generate_labels(text, font_size, font_weight, color) {
    return { display: true, text: text, font: { size: font_size, weight: font_weight }, color: color }
}



//Main functions
//Function to create a graph
function create_graph(selectedTanker) {
    // Destroy the previous chart if it exists
    if (chart) {
        chart.destroy();
    }

    const data = {
        datasets: [{ label: selectedTanker, data: visibleData, borderColor: graph_color, lineTension: 0.1, borderWidth: 1 }]
    };


    const options = {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: generate_grid(graph_color, 1),
                title: generate_labels('Time', 14, 'bold', graph_color),
                type: 'realtime',
                time: { parser: 'luxon' },
                realtime: {
                    ttl: 60000 * 60 * 24 * 365 * 100,
                    duration: 60000 * 2
                }
            },
            y: {
                grid: generate_grid(graph_color, 1),
                title: generate_labels('Fuel', 14, 'bold', graph_color),
            }
        },
        plugins: {
            zoom: {
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true,
                    }
                },
                pan: {
                    enabled: true,
                    onPanComplete: () => {

                    }
                }
            },
        }
    };

    const config = { type: 'line', data: data, options: options };
    chart = new Chart(canvas, config);
}
//Function to update Graph
function update_graph(fuel) {
    chart.data.datasets[0].data.push({
        x: new Date(),
        y: fuel * local_factor
    })
    chart.update();
}

function update_graph_data(values) {
    // Clear previous data
    while (visibleData.length > 0) {
        visibleData.pop();
    }
    local_factor = values[0]?.factor || 1;
    values.forEach(row => (
        visibleData.unshift({
            x: new Date(row.timestamp).getTime(),
            y: row.fuel_level
        })
    ));

}



module.exports = { create_graph, update_graph, update_graph_data }
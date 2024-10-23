/* global io */
const { Chart } = require("chart.js/auto");
const socket = io.connect();

const select_Button = document.getElementById("select");
const select_Tanker = document.getElementById("tankers");

let data_array = [];
let label_array = [];
let selectedTanker = "";
let chart;
const canvas = document.querySelector('canvas');

function update_graph_data(values) {
    // Clear previous data
    data_array = [];
    label_array = [];
    values.forEach(({ fuel_level, timestamp }) => {
        data_array.unshift(fuel_level);
        const date = new Date(timestamp);
        const label_format = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        label_array.unshift(label_format);
    });
}

// Sending a POST request to server to get data
select_Button.addEventListener("click", async () => {
    selectedTanker = select_Tanker.value;
    if (selectedTanker === "none") {
        alert("Please select a tanker.");
        return;
    }

    try {
        const response = await fetch('/api/graph/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tanker: selectedTanker })
        });

        if (response.ok) {
            const values = await response.json();
            update_graph_data(values);
            create_graph();
        }
        else { console.error("Error fetching graph data:", response.status); }
    }
    catch (error) { console.error("Error during API call:", error); }
});

// Function to create or update the chart
function create_graph() {
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
// Socket listener for "Graph-Update" event
socket.on("Graph-Update", ({ fuel, device_ID }) => {
    if (device_ID == selectedTanker) {
        update_graph(fuel)
    }
});

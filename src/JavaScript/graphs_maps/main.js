const select_Button = document.getElementById("select");
const select_Tanker = document.getElementById("tankers");
let selectedTanker = "";

const { create_graph, update_graph_data, update_graph } = require("./graph.js")
// const { update_map, create_map } = require("./map.js")

/* global io */
const socket = io.connect();

// Sending a POST request to server to get data
function initializeTankerSelection() {
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
                create_graph(selectedTanker);
                // create_map(values[0])
            }
            else { console.error("Error fetching graph data:", response.status); }
        }
        catch (error) { console.error("Error during API call:", error); }
    });
}

// Socket listener for "Widget-Update" event
socket.on("Widget-Update", ({ fuel, number_plate, longitude, latitude }) => {
    if (number_plate == selectedTanker) {
        update_graph(fuel)
        // update_map({ latitude, longitude, number_plate })
    }
});

module.exports = {
    initializeTankerSelection,
}
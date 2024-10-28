/* global L */

// Marker storage
const markers = {};
// Map instance
let map;

// Initialize the map only once with tanker location
function create_map(tanker_location) {
    if (!map) {
        map = L.map("map").setView([0, 0], 16);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "OpenStreetMap",
        }).addTo(map);
    }
    update_map(tanker_location);
}

// Update the map location and marker position
function update_map({ latitude, longitude, number_plate }) {
    map.setView([latitude, longitude], 16);
    if (markers[number_plate]) {
        markers[number_plate].setLatLng([latitude, longitude]);
    } else {
        markers[number_plate] = L.marker([latitude, longitude]).addTo(map);
    }
}

module.exports = {
    update_map,
    create_map
}
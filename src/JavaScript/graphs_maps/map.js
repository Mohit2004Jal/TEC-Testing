/* global L */

//marker
const markers = {}
//map instance
let map;

function create_map(tanker_location) {
    // Initialize map once
    map = L.map("map").setView([0, 0], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "OpenStreetMap",
    }).addTo(map);
    update_map(tanker_location);
}

function update_map({ latitude, longitude, number_plate }) {
    map.setView([latitude, longitude], 16);
    if (markers[number_plate]) {
        markers[number_plate].setLatLng([latitude, longitude]);
    }
    else {
        markers[number_plate] = L.marker([latitude, longitude]).addTo(map);
    }
}

module.exports = {
    update_map,
    create_map
}
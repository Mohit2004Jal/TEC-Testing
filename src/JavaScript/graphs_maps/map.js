/* global L */

//marker
const markers = {}
// Initialize map once
const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap",
}).addTo(map);

function update_map({ latitude, longitude, device_ID }) {
    map.setView([latitude, longitude], 16);
    if (markers[device_ID]) {
        markers[device_ID].setLatLng([latitude, longitude]);
    } else {
        markers[device_ID] = L.marker([latitude, longitude]).addTo(map);
    }
}

module.exports = {
    update_map
}
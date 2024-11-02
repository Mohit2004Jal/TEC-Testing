const target_Location = { latitude: 30.886188, longitude: 75.929028 };
const MAX_VARIATION_DISTANCE = 100; // in meters

function calculate_distance_between_two_coordinates(coord1, coord2) {
    const toRad = (x) => (x * Math.PI) / 180;

    const R = 6371e3; // Radius of Earth in meters
    const φ1 = toRad(coord1.latitude);
    const φ2 = toRad(coord2.latitude);
    const Δφ = toRad(coord2.latitude - coord1.latitude);
    const Δλ = toRad(coord2.longitude - coord1.longitude);

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // distance in meters
    return distance;
}

function is_point_near_target_location(currentLocation) {
    const distance = calculate_distance_between_two_coordinates(currentLocation, target_Location);
    return distance <= MAX_VARIATION_DISTANCE;
}

module.exports = {
    is_point_near_target_location,
};

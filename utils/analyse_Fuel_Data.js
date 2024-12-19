const { send_Email_Alert } = require("../service/send_Mail");
const { getLocationName } = require("../service/get_Location_from_coordinates");
const client = require("../service/db");
const { get_Fuel_Trend } = require("./check_Fuel_Trend");
const { is_point_near_target_location } = require("./check_target_location");

let stableCount = 0;
function updateTankerInfo(number_plate, status) {
    const query = 'UPDATE tanker_info SET status = $1 WHERE number_plate = $2';
    try {
        client.query(query, [status, number_plate]);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error updating status for ${number_plate}: ${error.message}`);
    }
}
async function handleLocation({ latitude, longitude }) {
    try {
        const location = await getLocationName({ latitude, longitude });
        return location || "Location not found";
    } catch (error) {
        console.error(`Error fetching location for coordinates (${latitude}, ${longitude}): ${error.message}`);
        return "Location not found";
    }
}

async function analyzeFuelData(number_plate, longitude, latitude, deviceData, socket) {
    const { fuelDataArray, tanker_name } = deviceData;
    let { status } = deviceData;

    const trend = get_Fuel_Trend(fuelDataArray);
    stableCount = trend === 0 ? stableCount + 1 : 0;

    const withinRadius = is_point_near_target_location({ latitude, longitude });

    async function handleAlert(newStatus, messageType) {
        send_alert_to_frontend(newStatus)
        console.log(`\x1b[41m Fuel is ${newStatus}ing \x1b[0m`);

        deviceData.status = newStatus;

        const location = await handleLocation({ latitude, longitude });
        const message = `Device ${tanker_name}: Fuel level at ${fuelDataArray[0]} is ${newStatus}ing at ${location} with coordinates (${latitude}, ${longitude})`;

        send_Email_Alert(messageType, message);
        updateTankerInfo(number_plate, status);
    }
    function send_alert_to_frontend(status) {
        if (socket) socket.emit("Popup-Alert", { status });
        else console.warn(`[${new Date().toLocaleString("en-GB")}] No socket connection for tanker ${number_plate}.`);
    }

    if (trend > 0 && status !== 'rise') {
        await handleAlert('rise', "Fuel Increase Detected");
        return;
    } else if (trend < 0 && !withinRadius && status !== 'leak') {
        await handleAlert('leak', "Fuel Leak Detected");
        return;
    } else if (trend < 0 && withinRadius && status !== 'drain') {
        await handleAlert('drain', "Fuel Drain Detected");
        return;
    } else if (trend == 0 && stableCount >= 10 && status !== 'stable') {
        await handleAlert('stable', "Fuel is Stable");
        stableCount = 0;
        return;
    }
}

module.exports = { analyzeFuelData };

const { get_Fuel_Trend } = require("./check_Fuel_Trend");
const { is_point_near_target_location } = require("./check_target_location");
// const { send_Email_Alert } = require("../service/send_Mail");
const { getLocationName } = require("../service/get_Location_from_coordinates");
const { Update_Tanker_Info_Query } = require("../Database/Data_from_device.js")

let stableCount = 0;
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

        // send_Email_Alert(messageType, message);b
        try {
            Update_Tanker_Info_Query(newStatus, number_plate)
        } catch (error) {
            console.error(`[${new Date().toLocaleString("en-GB")}] Error updating status for ${number_plate}: ${error.message}`);
        }
    }
    function send_alert_to_frontend(status) {
        if (socket) socket.emit("Popup-Alert", { status });
        else console.warn(`[${new Date().toLocaleString("en-GB")}] No socket connection for tanker ${number_plate}.`);
    }

    if (trend > 0 && status !== 'rise') {
        console.log(`\x1b[41m Fuel is rising \x1b[0m`);
        await handleAlert('rise', "Fuel Increase Detected");
        return;
    } else if (trend < 0 && !withinRadius && status !== 'leak') {
        console.log(`\x1b[41m Fuel is leaking \x1b[0m`);
        await handleAlert('leak', "Fuel Leak Detected");
        return;
    } else if (trend < 0 && withinRadius && status !== 'drain') {
        console.log(`\x1b[41m Fuel is draining \x1b[0m`);
        await handleAlert('drain', "Fuel Drain Detected");
        return;
    } else if (trend == 0 && stableCount >= 10 && status !== 'stable') {
        console.log(`\x1b[41m Fuel is stable \x1b[0m`);
        await handleAlert('stable', "Fuel is Stable");
        stableCount = 0;
        return;
    }
}

module.exports = { analyzeFuelData };

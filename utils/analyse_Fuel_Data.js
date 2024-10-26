const { send_Email_Alert } = require("../service/send_Mail");
const { getLocationName } = require("../service/get_Location_from_coordinates");
const client = require("../service/db");

const { get_Fuel_Trend } = require("./check_Fuel_Trend");
const { is_point_near_target_location } = require("./check_target_location");

// Helper function to update tanker info in the database
async function updateTankerInfo(deviceId, updateFields) {
    const query = 'UPDATE tanker_info SET isrising = $1, isleaking = $2, isdraining = $3 WHERE tanker_id = $4';
    await client.query(query, [updateFields.isrising, updateFields.isleaking, updateFields.isdraining, deviceId]);
}

// Helper function to handle alert sending
async function handleAlert(deviceId, alertType, message) {
    try {
        await send_Email_Alert(alertType, message);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error sending email alert for ${deviceId}: ${error.message}`);
    }
}

// Helper function to get Location name
async function hanleLocation(deviceId, { latitude, longitude }) {
    const location = await getLocationName({ latitude, longitude });
    if (!location) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Unable to get location name for ${deviceId}.`);
        return "Loaction not found";
    }
    return location
}

// Main function to analyze fuel data and send alerts
async function analyzeFuelData(deviceId, longitude, latitude, deviceData) {
    const { fuelDataArray, alertStatus } = deviceData[deviceId];

    try {
        const trend = get_Fuel_Trend(fuelDataArray);
        const withinRadius = is_point_near_target_location({ latitude, longitude });

        if (trend > 0 && !alertStatus.rising) {
            console.log("\x1b[41m Fuel is rising \x1b[0m");
            
            alertStatus.rising = true;
            alertStatus.draining = false;
            alertStatus.leaking = false;
            
            const location = await hanleLocation(deviceId, { latitude, longitude })
            await handleAlert(deviceId, "Fuel Increase Detected", `Device ${deviceId}: Fuel level at ${fuelDataArray[0]} rising at ${location}.`);
            await updateTankerInfo(deviceId, { isrising: true, isleaking: false, isdraining: false });
        }
        else if (trend < 0 && !withinRadius && !alertStatus.leaking) {
            console.log("\x1b[41m Fuel is leaking \x1b[0m");

            
            alertStatus.leaking = true;
            alertStatus.rising = false;
            alertStatus.draining = false;
            
            const location = await hanleLocation(deviceId, { latitude, longitude })
            await handleAlert(deviceId, "Fuel Leak Detected", `Device ${deviceId}: Fuel level at ${fuelDataArray[0]} leaking at ${location} far from the target location.`);
            await updateTankerInfo(deviceId, { isrising: false, isleaking: true, isdraining: false });
        }
        else if (trend < 0 && withinRadius && !alertStatus.draining) {
            console.log("\x1b[41m Fuel is draining \x1b[0m");

            alertStatus.draining = true;
            alertStatus.rising = false;
            alertStatus.leaking = false;
            
            const location = await hanleLocation(deviceId, { latitude, longitude })
            await handleAlert(deviceId, "Fuel Drain Detected", `Device ${deviceId}: Fuel level at ${fuelDataArray[0]} draining at ${location}.`);
            await updateTankerInfo(deviceId, { isrising: false, isleaking: false, isdraining: true });
        }
    }
    catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error analyzing fuel data for tanker ${deviceId}: ${error.message}`);
    }
}

module.exports = {
    analyzeFuelData,
};

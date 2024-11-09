const { send_Email_Alert } = require("../service/send_Mail");
const { getLocationName } = require("../service/get_Location_from_coordinates");
const client = require("../service/db");
const { get_Fuel_Trend } = require("./check_Fuel_Trend");
const { is_point_near_target_location } = require("./check_target_location");

const companies = {
    "30.881027-75.925488": "Farmparts Company",
    "30.792785-75.943987": "Standard Control Panel Private Limited"
};

let stableCount = 0;

// Helper function to update tanker info in the database
async function updateTankerInfo(number_plate, updateFields) {
    const query = 'UPDATE tanker_info SET isrising = $1, isleaking = $2, isdraining = $3, isstable = $4 WHERE number_plate = $5';
    try {
        await client.query(query, [updateFields.isrising, updateFields.isleaking, updateFields.isdraining, updateFields.isstable, number_plate]);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error updating status for ${number_plate}: ${error.message}`);
    }
}

// Helper function to get the location name
async function handleLocation({ latitude, longitude }) {
    const location = await getLocationName({ latitude, longitude });
    return location || "Location not found";
}

// Helper function to find a nearby company within a certain distance
function findNearbyCompany(latitude, longitude) {
    for (let key in companies) {
        const value = companies[key];
        const [complat, complon] = key.split("-")
        const isNearby = is_point_near_target_location({ latitude, longitude }, { latitude: complat, longitude: complon })
        if (isNearby) return value
    }
    return false;
}




// Main function to analyze fuel data and send alerts
async function analyzeFuelData(number_plate, longitude, latitude, deviceData) {
    const { fuelDataArray, alertStatus } = deviceData[number_plate];
    const trend = get_Fuel_Trend(fuelDataArray);
    const withinRadius = is_point_near_target_location({ latitude, longitude });

    // Rising fuel level logic
    if (trend > 0 && !alertStatus.rising) {
        console.log("\x1b[41m Fuel is rising \x1b[0m");

        alertStatus.rising = true;
        alertStatus.draining = alertStatus.leaking = alertStatus.stable = false;
        stableCount = 0;

        const nearbyCompany = findNearbyCompany(latitude, longitude);

        const location = await handleLocation({ latitude, longitude });
        const message = `Device ${number_plate}: Fuel level at ${fuelDataArray[0]} is rising at ${location}.${nearbyCompany ? ` Near ${nearbyCompany}.` : ''} with coordinates (${latitude}, ${longitude})`;
        await send_Email_Alert("Fuel Increase Detected", message);
        await updateTankerInfo(number_plate, { isrising: true, isleaking: false, isdraining: false, isstable: false });

        // Leaking fuel level logic
    }
    else if (trend < 0 && !withinRadius && !alertStatus.leaking) {
        console.log("\x1b[41m Fuel is leaking \x1b[0m");

        alertStatus.leaking = true;
        alertStatus.rising = alertStatus.draining = alertStatus.stable = false;
        stableCount = 0;

        const location = await handleLocation({ latitude, longitude });
        await send_Email_Alert("Fuel Leak Detected", `Device ${number_plate}: Fuel level at ${fuelDataArray[0]} leaking at ${location} with coordinates (${latitude}, ${longitude}) far from the target location.`);
        await updateTankerInfo(number_plate, { isrising: false, isleaking: true, isdraining: false, isstable: false });

        // Draining fuel level logic
    }
    else if (trend < 0 && withinRadius && !alertStatus.draining) {
        console.log("\x1b[41m Fuel is draining \x1b[0m");

        alertStatus.draining = true;
        alertStatus.rising = alertStatus.leaking = alertStatus.stable = false;
        stableCount = 0;

        const location = await handleLocation({ latitude, longitude });
        await send_Email_Alert("Fuel Drain Detected", `Device ${number_plate}: Fuel level at ${fuelDataArray[0]} draining at ${location} with coordinates (${latitude}, ${longitude}).`);
        await updateTankerInfo(number_plate, { isrising: false, isleaking: false, isdraining: true, isstable: false });

        // Stable fuel level logic
    }
    else if (trend === 0 && !alertStatus.stable) {
        stableCount++;
        if (stableCount > 40) {
            stableCount = 0;
            alertStatus.stable = true;
            alertStatus.draining = alertStatus.rising = alertStatus.leaking = false;
            await send_Email_Alert("Fuel is Stable", `Device ${number_plate}: Fuel level at ${fuelDataArray[0]} is stable.`);
            await updateTankerInfo(number_plate, { isrising: false, isleaking: false, isdraining: false, isstable: true });
        }
    }
}

module.exports = { analyzeFuelData };

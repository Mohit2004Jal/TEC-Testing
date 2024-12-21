const redis = require("../service/redis")
const { analyzeFuelData } = require("../utils/analyse_Fuel_Data");
const { getTankerData } = require("../utils/handle_tanker_info_and_data.js");
const { Insert_Fuel_Data_Query } = require("../Database/Data_from_device.js")

// Emit data to frontend via socket if available
function emitToFrontend(req, data) {
    const { fuel, numberPlate, longitude, latitude } = data;
    try {
        const socket = req.app.get('socket');
        if (socket) socket.emit("Widget-Update", { fuel, numberPlate, longitude, latitude });
        else console.warn(`[${new Date().toLocaleString("en-GB")}] No socket connection for tanker ${numberPlate}.`);
    }
    catch (err) { console.error(`[${new Date().toLocaleString("en-GB")}] Error emitting data for tanker ${numberPlate}: ${err.message}`); }
}
// Insert fuel data into the database for the specified tanker
async function insertFuelData({ tanker_id, fuel, latitude, longitude }) {
    try {
        await Insert_Fuel_Data_Query({ tanker_id, fuel, latitude, longitude })
        return true;
    }
    catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error inserting fuel data: ${err.message}`);
        return false;
    }
}

// Main handler for incoming tanker data
const handleDataFromDevice = async (req, res) => {
    const REQUIRED_LENGTH = 10;
    const numberPlate = req.params.id;
    // const numberPlate = req.header("Number-Plate");
    const { longitude, latitude } = req.body;
    let { fuel } = req.body
    let deviceData = {}

    try {
        emitToFrontend(req, { fuel, numberPlate, longitude, latitude });
        const dataString = await redis.call("JSON.GET", `allCurrentDevices:${numberPlate}`, ".");

        if (dataString) {
            const data = JSON.parse(dataString)
            deviceData = data
        }
        else {
            deviceData = await getTankerData(numberPlate, REQUIRED_LENGTH)
        }
        fuel = fuel * deviceData.factor
        console.log(`Received data for tanker ${numberPlate}: `, { fuel, longitude, latitude });

        deviceData.fuelDataArray.push(fuel);
        if (deviceData.fuelDataArray.length > REQUIRED_LENGTH) deviceData.fuelDataArray.shift();
        if (deviceData.fuelDataArray.length == REQUIRED_LENGTH) await analyzeFuelData(numberPlate, longitude, latitude, deviceData, req.app.get('socket'));
        try {
            await redis.call("JSON.SET", `allCurrentDevices:${numberPlate}`, ".", JSON.stringify(deviceData));
        }
        catch (error) {
            console.error(`[${new Date().toLocaleString("en-GB")}] Error saving data for tanker ${numberPlate} in redis: ${error.message}`)
        }

        const isInserted = await insertFuelData({ tanker_id: deviceData.tanker_id, fuel, latitude, longitude });
        if (!isInserted) return res.status(500).json({ error: "Failed to save fuel data." });

        res.status(200).json({ message: `Fuel data received successfully for tanker ${numberPlate}` });
    } catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error handling data for tanker ${numberPlate}: ${error.message.response}`);
        res.status(500).json({ error: "Internal server error." });
    }
};
module.exports = { handleDataFromDevice };
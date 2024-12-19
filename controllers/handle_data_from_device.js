const { analyzeFuelData } = require("../utils/analyse_Fuel_Data");
const client = require("../service/db");
const redis = require("../service/redis")

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
        await client.query(
            'INSERT INTO tanker_data (tanker_id, fuel_level, latitude, longitude) VALUES ($1, $2, $3, $4)', [tanker_id, fuel, latitude, longitude]
        );
        return true;
    }
    catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error inserting fuel data: ${err.message}`);
        return false;
    }
}
// Initialize or retrieve tanker data from the database
async function getTankerData(numberPlate, requiredLength) {
    try {
        const tankerQuery = `
            SELECT
                td.fuel_level,
                td.latitude,
                td.longitude,
                ti.tanker_id,
                ti.number_plate,
                ti.tanker_name,
                ti.status,
                ti.factor
            FROM
                tanker_info ti
                LEFT JOIN tanker_data td ON ti.tanker_id = td.tanker_id
            WHERE
                ti.number_plate = $1
            ORDER BY
                td.timestamp DESC
            LIMIT
                $2
            `;
        const result = await client.query(tankerQuery, [numberPlate, requiredLength]);

        if (result.rows.length === 0) {
            const insertResult = await client.query(
                'INSERT INTO tanker_info (number_plate, tanker_name) VALUES ($1, $2) RETURNING tanker_name, tanker_id', [numberPlate, numberPlate]
            );
            const newDevice = insertResult.rows[0];
            return {
                fuelDataArray: [],
                status: 'stable',
                tanker_name: newDevice.tanker_name,
                tanker_id: newDevice.tanker_id,
                factor: 100.00
            };
        }
        else {
            const { tanker_id, tanker_name, status, factor } = result.rows[0];
            return {
                fuelDataArray: result.rows.map(data => Number(data.fuel_level)),
                status: status,
                tanker_name: tanker_name,
                tanker_id: tanker_id,
                factor: Number(factor)
            };
        }
    }
    catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error fetching data for tanker ${numberPlate}: ${err.message}`);
        throw new Error("Failed to initialize tanker data");
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
        } else {
            deviceData = await getTankerData(numberPlate, REQUIRED_LENGTH)
        }
        fuel = fuel * deviceData.factor
        console.log(`Received data for tanker ${numberPlate}: `, { fuel, longitude, latitude });

        deviceData.fuelDataArray.push(fuel);
        if (deviceData.fuelDataArray.length > REQUIRED_LENGTH) deviceData.fuelDataArray.shift();
        if (deviceData.fuelDataArray.length == REQUIRED_LENGTH) await analyzeFuelData(numberPlate, longitude, latitude, deviceData, req.app.get('socket'));
        try {
            await redis.call("JSON.SET", `allCurrentDevices:${numberPlate}`, ".", JSON.stringify(deviceData));
        } catch (error) { console.error(`[${new Date().toLocaleString("en-GB")}] Error saving data for tanker ${numberPlate} in redis: ${error.message}`) }

        const isInserted = await insertFuelData({ tanker_id: deviceData.tanker_id, fuel, latitude, longitude });
        if (!isInserted) return res.status(500).json({ error: "Failed to save fuel data." });

        res.status(200).json({ message: `Fuel data received successfully for tanker ${numberPlate}` });
    } catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error handling data for tanker ${numberPlate}: ${error.message.response}`);
        res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = { handleDataFromDevice };
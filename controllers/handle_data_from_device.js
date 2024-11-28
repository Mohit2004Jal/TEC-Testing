const { analyzeFuelData } = require("../utils/analyse_Fuel_Data");
const client = require("../service/db");

// Memory store for tracking current state and data of each tanker
const allCurrentDevices = {};

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
async function insertFuelData({ tankerId, fuel, latitude, longitude }) {
    const volume = -0.000005744628532 * Math.pow(fuel, 3) + 0.009927196796148 * Math.pow(fuel, 2) + 4.150072958151474 * fuel + -162.312544323069432
    try {
        await client.query(
            'INSERT INTO tanker_data (tanker_id, fuel_level, latitude, longitude, volume_level) VALUES ($1, $2, $3, $4, $5)',
            [tankerId, fuel, latitude, longitude, volume]
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
            SELECT td.fuel_level, td.latitude, td.longitude,
                ti.number_plate, ti.tanker_name, ti.isrising, ti.isdraining, 
                ti.isleaking, ti.tanker_id, ti.isstable
            FROM tanker_info ti
            LEFT JOIN tanker_data td ON ti.tanker_id = td.tanker_id
            WHERE ti.number_plate = $1
            ORDER BY td.timestamp DESC 
            LIMIT $2`;
        const result = await client.query(tankerQuery, [numberPlate, requiredLength]);

        if (result.rows.length === 0) {
            const insertResult = await client.query(
                'INSERT INTO tanker_info (number_plate, tanker_name) VALUES ($1, $2) RETURNING tanker_name, tanker_id',
                [numberPlate, numberPlate]
            );
            const newDevice = insertResult.rows[0];
            return {
                fuelDataArray: new Array(requiredLength).fill(0),
                alertStatus: { rising: false, leaking: false, draining: false, stable: false },
                name: newDevice.tanker_name,
                tankerId: newDevice.tanker_id,
            };
        }
        else {
            const { tanker_id, tanker_name, isrising, isdraining, isleaking, isstable } = result.rows[0];
            return {
                fuelDataArray: result.rows.map(data => data.fuel_level),
                alertStatus: { rising: isrising, leaking: isleaking, draining: isdraining, stable: isstable },
                name: tanker_name,
                tankerId: tanker_id,
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
    const REQUIRED_LENGTH = 20;
    const numberPlate = req.params.id;
    let { fuel, longitude, latitude } = req.body;

    try {
        emitToFrontend(req, { fuel, numberPlate, longitude, latitude });
        // Multiplication Factor based on number_plate
        switch (numberPlate) {
            case "busb":
                fuel *= 137;
                break;
            case "busc":
                fuel *= 187.6;
                break;
            default:
                break;
        }
        console.log(`Received data for tanker ${numberPlate}: `, { fuel, longitude, latitude });

        if (!allCurrentDevices[numberPlate]) {
            allCurrentDevices[numberPlate] = await getTankerData(numberPlate, REQUIRED_LENGTH);
        }

        const deviceData = allCurrentDevices[numberPlate];

        deviceData.fuelDataArray.push(fuel);
        if (deviceData.fuelDataArray.length > REQUIRED_LENGTH) deviceData.fuelDataArray.shift();

        const isInserted = await insertFuelData({ tankerId: deviceData.tankerId, fuel, latitude, longitude });
        if (!isInserted) return res.status(500).json({ error: "Failed to save fuel data." });

        await analyzeFuelData(numberPlate, longitude, latitude, allCurrentDevices);

        res.status(200).json({ message: `Fuel data received successfully for tanker ${numberPlate}` });
    }
    catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error handling data for tanker ${numberPlate}: ${error.message}`);
        res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = { handleDataFromDevice };


/*
SHIFTING TO FRONTEND
// Multiplication Factor based on number_plate
switch (number_plate) {
    case "busb":
        fuel *= 137;
        break;
    case "busc":
        fuel *= 187.6;
        break;
    default:
        break;
}
*/

/*
    socket.on('requestHistoricalData', async ({ start, end, tanker }) => {
        let interval = 'second';
        const difference = new Date(end) - new Date(start);

        if (difference > 7 * 24 * 60 * 60 * 1000) { // Over a week
            interval = 'day';
        } else if (difference > 24 * 60 * 60 * 1000) { // Over a day
            interval = 'hour';
        }

        const res = await client.query(`
    SELECT date_trunc('${interval}', timestamp) AS time,
           AVG(value) as avg_value
    FROM your_data_table
    WHERE timestamp BETWEEN $1 AND $2
    GROUP BY time
    ORDER BY time`, [start, end]);

        socket.emit('historicalData', res.rows);
    });
 */

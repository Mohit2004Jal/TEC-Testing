const { analyzeFuelData } = require("../utils/analyse_Fuel_Data");
const client = require("../service/db");

// Object to store fuel data and alert status for each tanker
const all_current_devices = {};

// Function to handle data from tanker
const handle_data_from_device = async (req, res) => {
    // Number of recent fuel values to check for each tanker
    const REQUIRED_LENGTH = 6;

    // Extract values from request
    const device_ID = req.params.id;
    let { fuel, longitude, latitude } = req.body;

    if (fuel == null || longitude == null || latitude == null) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Invalid data received for tanker ${device_ID}.`);
        return res.status(400).json({ error: "Invalid fuel data: Missing fuel, longitude, or latitude." });
    }

    // Multiplication Factor based on device_ID
    switch (device_ID) {
        case "busb":
            fuel *= 137;
            break;
        case "busc":
            fuel *= 187.6;
            break;
        default:
            break;
    }

    // Emit data to frontend if socket is available
    try {
        const socket = req.app.get('socket');
        if (socket) {
            socket.emit("Widget-Update", { fuel, device_ID, longitude, latitude });
        } else {
            console.warn(`[${new Date().toLocaleString("en-GB")}] No socket connection available for tanker ${device_ID}.`);
        }
    }
    catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error emitting socket data for tanker ${device_ID}: ${err.message}`);
    }

    // Initialize tanker data in memory if it's not present
    if (!all_current_devices[device_ID]) {
        try {
            // Fetch tanker data from the database
            const tanker = await client.query(
                `SELECT tanker_data.fuel_level, tanker_data.latitude, tanker_data.longitude, 
                        tanker_info.tanker_id, tanker_info.tanker_name, tanker_info.isrising, 
                        tanker_info.isdraining, tanker_info.isleaking 
                 FROM tanker_info 
                 LEFT JOIN tanker_data ON tanker_info.tanker_id = tanker_data.tanker_id 
                 WHERE tanker_info.tanker_id = $1 
                 ORDER BY tanker_data.timestamp DESC 
                 LIMIT $2`,
                [device_ID, REQUIRED_LENGTH]
            );
            // tanker not in the database
            if (tanker.rows.length === 0) {
                // Insert new tanker if not in database
                const new_Device = await client.query(
                    'INSERT INTO tanker_info (tanker_id, tanker_name) VALUES ($1, $2) RETURNING tanker_name',
                    [device_ID, device_ID]
                );
                all_current_devices[device_ID] = {
                    fuelDataArray: new Array(REQUIRED_LENGTH).fill(0),
                    alertStatus: {
                        rising: false,
                        leaking: false,
                        draining: false
                    },
                    name: new_Device.rows[0].tanker_name
                };
            }
            else {
                // Device exists in DB, populate local cache
                const { tanker_id, tanker_name, isrising, isdraining, isleaking } = tanker.rows[0];
                all_current_devices[tanker_id] = {
                    fuelDataArray: tanker.rows.map(data => data.fuel_level),
                    alertStatus: {
                        rising: isrising,
                        leaking: isleaking,
                        draining: isdraining
                    },
                    name: tanker_name
                };
            }
        } catch (err) {
            console.error(`[${new Date().toLocaleString("en-GB")}] Error initializing data for tanker ${device_ID}: ${err.message}`);
            return res.status(500).json({ error: "Internal error initializing tanker data." });
        }
    }

    // Add fuel data to local cache 
    all_current_devices[device_ID].fuelDataArray.push(fuel);
    if (all_current_devices[device_ID].fuelDataArray.length > REQUIRED_LENGTH) {
        all_current_devices[device_ID].fuelDataArray.shift();
    }

    // Adding data to database
    try {
        await client.query(
            'INSERT INTO tanker_data (tanker_id, fuel_level, latitude, longitude) VALUES ($1, $2, $3, $4)',
            [device_ID, fuel, latitude, longitude]
        );
    }
    catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error inserting fuel data for tanker ${device_ID}: ${err.message}`);
        return res.status(500).json({ error: "Internal error saving fuel data." });
    }

    // Analyze fuel data for alert conditions
    try {
        console.log({ fuel, longitude, latitude })
        await analyzeFuelData(device_ID, longitude, latitude, all_current_devices);
    }
    catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error analyzing fuel data for tanker ${device_ID}: ${err.message}`);
    }

    return res.status(200).json({ message: `Fuel data received successfully for tanker ${device_ID}` });
};

module.exports = { handle_data_from_device };

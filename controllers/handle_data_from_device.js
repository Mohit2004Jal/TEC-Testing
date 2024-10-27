const { analyzeFuelData } = require("../utils/analyse_Fuel_Data");
const client = require("../service/db");

// Object to store fuel data and alert status for each tanker
const all_current_devices = {};
//Formating coming values
function reduce_decimal_size(value, size) {
    return parseFloat(value.toFixed(size))
}



// Main Function to handle data from tanker
const handle_data_from_device = async (req, res) => {
    // Number of recent fuel values to check for each tanker
    const REQUIRED_LENGTH = 6;

    // Extract values from request
    const number_plate = req.params.id;
    let { fuel, longitude, latitude } = req.body;

    if (fuel == null || longitude == null || latitude == null) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Invalid data received for tanker ${number_plate}.`);
        return res.status(400).json({ error: "Invalid fuel data: Missing fuel, longitude, or latitude." });
    }

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

    //Fixing the values
    fuel = reduce_decimal_size(fuel, 2);
    longitude = reduce_decimal_size(longitude, 6);
    latitude = reduce_decimal_size(latitude, 6);

    // Emit data to frontend if socket is available
    try {
        const socket = req.app.get('socket');
        if (socket) {
            socket.emit("Widget-Update", { fuel, number_plate, longitude, latitude });
        }
        else {
            console.warn(`[${new Date().toLocaleString("en-GB")}] No socket connection available for tanker ${number_plate}.`);
        }
    }
    catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error emitting socket data for tanker ${number_plate}: ${err.message}`);
    }

    // Initialize tanker data in memory if it's not present
    if (!all_current_devices[number_plate]) {
        try {
            // Fetch tanker data from the database
            const tanker = await client.query(
                `SELECT tanker_data.fuel_level, tanker_data.latitude, tanker_data.longitude, 
                        tanker_info.number_plate, tanker_info.tanker_name, tanker_info.isrising, 
                        tanker_info.isdraining, tanker_info.isleaking, tanker_info.tanker_id 
                 FROM tanker_info 
                 LEFT JOIN tanker_data ON tanker_info.tanker_id = tanker_data.tanker_id 
                 WHERE tanker_info.number_plate = $1 
                 ORDER BY tanker_data.timestamp DESC 
                 LIMIT $2`,
                [number_plate, REQUIRED_LENGTH]
            );
            // tanker not in the database
            if (tanker.rows.length === 0) {
                // Insert new tanker if not in database
                const new_Device = await client.query(
                    'INSERT INTO tanker_info (number_plate, tanker_name) VALUES ($1, $2) RETURNING tanker_name, tanker_id',
                    [number_plate, number_plate]
                );
                all_current_devices[number_plate] = {
                    fuelDataArray: new Array(REQUIRED_LENGTH).fill(0),
                    alertStatus: {
                        rising: false,
                        leaking: false,
                        draining: false
                    },
                    name: new_Device.rows[0].tanker_name,
                    tanker_id: new_Device.rows[0].tanker_id
                };
            }
            else {
                // Device exists in DB, populate local cache
                const { tanker_id, number_plate, tanker_name, isrising, isdraining, isleaking } = tanker.rows[0];
                all_current_devices[number_plate] = {
                    fuelDataArray: tanker.rows.map(data => data.fuel_level),
                    alertStatus: {
                        rising: isrising,
                        leaking: isleaking,
                        draining: isdraining
                    },
                    name: tanker_name,
                    tanker_id: tanker_id
                };
            }
        } catch (err) {
            console.error(`[${new Date().toLocaleString("en-GB")}] Error initializing data for tanker ${number_plate}: ${err.message}`);
            return res.status(500).json({ error: "Internal error initializing tanker data." });
        }
    }

    // Add fuel data to local cache 
    all_current_devices[number_plate].fuelDataArray.push(fuel);
    if (all_current_devices[number_plate].fuelDataArray.length > REQUIRED_LENGTH) {
        all_current_devices[number_plate].fuelDataArray.shift();
    }

    // Adding data to database
    try {
        await client.query(
            'INSERT INTO tanker_data (tanker_id, fuel_level, latitude, longitude) VALUES ($1, $2, $3, $4)',
            [all_current_devices[number_plate].tanker_id, fuel, latitude, longitude]
        );
    }
    catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error inserting fuel data for tanker ${number_plate}: ${err.message}`);
        return res.status(500).json({ error: "Internal error saving fuel data." });
    }

    // Analyze fuel data for alert conditions
    console.log(`Data for tanker ${number_plate}: `, { fuel, latitude, longitude })
    await analyzeFuelData(number_plate, longitude, latitude, all_current_devices);

    return res.status(200).json({ message: `Fuel data received successfully for tanker ${number_plate}` });
};

module.exports = {
    handle_data_from_device
};

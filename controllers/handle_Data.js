const { analyzeFuelData } = require("../utils/analyse_Fuel_Data");
const client = require("../service/db");

// Object to store fuel data and alert statuses for each device
const all_current_devices = {};

//Function to handle post of data
const handleData = async (req, res) => {

    //Last Values of tanker to Check
    const REQUIRED_LENGTH = 6;

    //Getting values from POST Request
    const device_ID = req.params.id;
    let { fuel, longitude, latitude } = req.body;
    if (fuel == null || longitude == null || latitude == null) return res.status(400).send("Invalid fuel data");

    // Multiplication Factor
    switch (device_ID) {
        case "busb":
            fuel *= 137
            break;
        case "busc":
            fuel *= 187.6
            break;
        default:
            break;
    }

    // Checking if device is present in the Server
    if (!all_current_devices[device_ID]) {
        all_current_devices[device_ID] = {
            fuelDataArray: new Array(REQUIRED_LENGTH).fill(0),
            alertStatus: {
                rising: false,
                leaking: false,
                draining: false,
            },
            name: ""
        };
        //Getting Value from Database
        const device = await client.query('SELECT tanker_data.fuel_level, tanker_data.latitude, tanker_data.longitude, tanker_info.tanker_id, tanker_info.tanker_name, tanker_info.isrising, tanker_info.isdraining, tanker_info.isleaking FROM tanker_info LEFT JOIN tanker_data ON tanker_info.tanker_id = tanker_data.tanker_id WHERE tanker_info.tanker_id = $1 ORDER BY tanker_data.timestamp DESC LIMIT $2', [device_ID, REQUIRED_LENGTH]);
        //If Device is not present in the Database
        if (device.rows.length === 0) {
            const new_Device = await client.query('INSERT INTO tanker_info (tanker_id, tanker_name) VALUES ($1, $2) RETURNING tanker_name', [device_ID, device_ID]);
            all_current_devices[device_ID].name = new_Device.rows[0].tanker_name;
        }
        // if Device is present in the Database
        else {
            const { tanker_id, tanker_name, isrising, isdraining, isleaking } = device.rows[0];
            all_current_devices[tanker_id] = {
                fuelDataArray: [],
                alertStatus: {
                    rising: isrising,
                    leaking: isleaking,
                    draining: isdraining,
                },
                name: tanker_name
            };
            device.rows.forEach(data => {
                all_current_devices[tanker_id].fuelDataArray.push(data.fuel_level);
            });
        }
    }

    // Add fuel data for this device
    all_current_devices[device_ID].fuelDataArray.push(fuel);
    await client.query('INSERT INTO tanker_data (tanker_id, fuel_level, latitude, longitude) VALUES ($1, $2, $3, $4)', [device_ID, fuel, latitude, longitude]);

    //Getting Value
    console.log(`Device ${device_ID}: `, { fuel, latitude, longitude });

    // Emitting Value to frontend
    const socket = req.app.get('socket');
    if (socket) {
        socket.emit("Graph-Update", { fuel, device_ID });
    }

    //Analysing data for Rising, Leaking and Draining
    if (all_current_devices[device_ID].fuelDataArray.length > REQUIRED_LENGTH) {
        all_current_devices[device_ID].fuelDataArray.shift();
        await analyzeFuelData(device_ID, longitude, latitude, all_current_devices);
    }
    
    return res.status(200).send(`Fuel data received successfully for device ${device_ID}`);
};

module.exports = {
    handleData
};

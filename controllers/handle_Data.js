const { analyzeFuelData } = require("../utils/analyse_Fuel_Data")
// Object to store fuel data and alert statuses for each device
const deviceData = {};

const handleData = (req, res) => {
    const deviceId = req.params.id;
    let { fuel, longitude, latitude } = req.body
    switch (deviceId) {
        case "busb":
            fuel = fuel * 137
            break;
        case "busc":
            fuel = fuel * 187.6
            break;
        default:
            break;
    }

    if (fuel != null && longitude != null && latitude != null) {
        // Initialize data for the device if not already present
        if (!deviceData[deviceId]) {
            deviceData[deviceId] = {
                fuelDataArray: [],
                alertStatus: {
                    rising: false,
                    leaking: false,
                    draining: false,
                    // stable: 0
                }
            };
        }
        // Add fuel data for this device
        deviceData[deviceId].fuelDataArray.push(fuel);
        // /*
        console.log(`Device ${deviceId} - Fuel Data: `, { fuel, latitude, longitude });
        // */
        analyzeFuelData(deviceId, longitude, latitude, deviceData);
        res.status(200).send(`Fuel data received successfully for device ${deviceId}`);
    } else {
        res.status(400).send("Invalid fuel data");
    }
};

module.exports = {
    handleData
}
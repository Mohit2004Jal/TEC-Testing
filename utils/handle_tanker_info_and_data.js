const { Get_Fuel_Data_Query, Insert_Tanker_Info_Query } = require("../Database/Data_from_device.js")

// Initialize or retrieve tanker data from the database
async function getTankerData(numberPlate, requiredLength) {
    try {
        console.log("before result");

        const result = await Get_Fuel_Data_Query(numberPlate, requiredLength);
        console.log("after result");

        if (result.rows.length === 0) {
            console.log("before insertion");

            const insertResult = await Insert_Tanker_Info_Query(numberPlate);
            console.log("after insertion");

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

module.exports = { getTankerData }

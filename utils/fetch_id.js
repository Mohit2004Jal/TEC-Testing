const client = require("../service/db");

async function get_all_ids() {
    try {
        // Query to fetch all tanker IDs
        const { rows } = await client.query("SELECT number_plate FROM tanker_info");

        return rows;
    }
    catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error fetching number plate: ${error.message}`);
        throw new Error("Unable to retrieve tanker number plate."); // Throw an error to be handled by the calling function
    }
}

module.exports = {
    get_all_ids
};

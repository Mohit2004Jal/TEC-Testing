const client = require("../service/db");

async function get_all_ids() {
    try {
        // Query to fetch all tanker IDs
        const { rows } = await client.query("SELECT tanker_id FROM tanker_info");

        return rows;
    }
    catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error fetching tanker IDs: ${error.message}`);
        throw new Error("Unable to retrieve tanker IDs."); // Throw an error to be handled by the calling function
    }
}

module.exports = {
    get_all_ids
};

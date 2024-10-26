const client = require("../service/db");

const get_data_for_widgets = async (req, res) => {

    const selectedTanker = req.body.tanker;
    if (!selectedTanker) {
        return res.status(400).json({ error: "Tanker ID is required." });
    }

    try {
        // Query to getn fuel level and latest location of the selected tanker
        const query = `
            SELECT fuel_level, timestamp, latest_location.latitude, latest_location.longitude 
            FROM tanker_data 
            CROSS JOIN LATERAL (
                SELECT longitude, latitude 
                FROM tanker_data 
                WHERE tanker_id = $1 
                ORDER BY timestamp DESC 
                LIMIT 1
            ) AS latest_location 
            WHERE tanker_id = $2 
            ORDER BY timestamp DESC 
            LIMIT 20
        `;

        const { rows } = await client.query(query, [selectedTanker, selectedTanker]);
        res.status(200).json(rows);
    }
    catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error retrieving data for tanker ${selectedTanker}: ${error.message}`);
        res.status(500).json({ error: "Internal server error while retrieving data." });
    }
};

module.exports = {
    get_data_for_widgets
};

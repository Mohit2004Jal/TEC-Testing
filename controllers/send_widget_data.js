const client = require("../service/db");

const get_data_for_widgets = async (req, res) => {

    const selectedTanker = req.body.tanker;
    try {
        // Query to get fuel level and latest location of the selected tanker
        const query = `
        SELECT
            td.fuel_level,
            td.latitude,
            td.longitude,
            td.timestamp,
            ti.factor
        FROM
            tanker_info ti
        LEFT JOIN
            tanker_data td ON ti.tanker_id = td.tanker_id
        WHERE
            ti.number_plate = $1
        ORDER BY timestamp DESC 
        LIMIT $2
        `;
        const { rows } = await client.query(query, [selectedTanker, 20]);
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

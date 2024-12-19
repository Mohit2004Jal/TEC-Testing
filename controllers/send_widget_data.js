const client = require("../service/db");

const get_data_for_widgets = async (req, res) => {

    const selectedTanker = req.body.tanker;
    const range = req.body.range;
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
        AND td.timestamp >= NOW() - INTERVAL '1 ${range}'
    ORDER BY td.timestamp DESC
    `;
        const { rows } = await client.query(query, [selectedTanker]);
        res.status(200).json(rows);
    }catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error retrieving data for tanker ${selectedTanker}: ${error.message}`);
        res.status(500).json({ error: "Internal server error while retrieving data." });
    }
};

module.exports = {
    get_data_for_widgets
};

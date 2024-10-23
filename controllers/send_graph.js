const client = require("../service/db")

const getLast = async (req, res) => {
    const selectedTanker = req.body.tanker;
    const { rows } = await client.query('SELECT fuel_level, timestamp FROM tanker_data WHERE tanker_id = $1 ORDER BY timestamp DESC LIMIT 20', [selectedTanker])
    res.status(200).json(rows);
}
module.exports = {
    getLast
}
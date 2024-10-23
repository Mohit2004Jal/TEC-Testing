const client = require("../service/db");

async function get_all_ids() {
    const data = await client.query(
        "SELECT tanker_id FROM tanker_info"
    );
    return data.rows;
}
module.exports = {
    get_all_ids
}
const client = require("../service/db")

async function Get_All_Ids_Query() {
    try {
        const { rows } = await client.query("SELECT number_plate FROM tanker_info");
        return rows;
    }
    catch (error) {
        throw new Error(error.message);
    }
}
async function Get_Tanker_Info_Query() {
    try {
        const result = await client.query('SELECT number_plate, factor, tanker_name FROM tanker_info ORDER BY tanker_name');
        return result;
    }
    catch (error) {
        throw new Error(error.message);
    }
}
function Update_Tanker_Info_Query(tanker_name, factor, number_plate) {
    try {
        client.query(
            'UPDATE tanker_info SET tanker_name = $1, factor = $2 WHERE number_plate = $3',
            [tanker_name, factor, number_plate]
        );
    }
    catch (error) {
        throw new Error(error.message);
    }
}
async function Get_Tanker_Data_Widget_Query(range, selectedTanker) {
    try {
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
        return rows
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = { Get_All_Ids_Query, Get_Tanker_Info_Query, Update_Tanker_Info_Query, Get_Tanker_Data_Widget_Query }
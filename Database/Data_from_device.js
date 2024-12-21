const client = require("../service/db");

async function Insert_Fuel_Data_Query({ tanker_id, fuel, latitude, longitude }) {
    await client.query(
        'INSERT INTO tanker_data (tanker_id, fuel_level, latitude, longitude) VALUES ($1, $2, $3, $4)', [tanker_id, fuel, latitude, longitude]
    );
}
async function Get_Fuel_Data_Query(numberPlate, requiredLength) {
    const tankerQuery = `
            SELECT
                td.fuel_level,
                td.latitude,
                td.longitude,
                ti.tanker_id,
                ti.number_plate,
                ti.tanker_name,
                ti.status,
                ti.factor
            FROM
                tanker_info ti
                LEFT JOIN tanker_data td ON ti.tanker_id = td.tanker_id
            WHERE
                ti.number_plate = $1
            ORDER BY
                td.timestamp DESC
            LIMIT
                $2
            `;
    const result = await client.query(tankerQuery, [numberPlate, requiredLength]);
    return result;
}
async function Insert_Tanker_Info_Query(numberPlate) {
    const result = await client.query(
        'INSERT INTO tanker_info (number_plate, tanker_name) VALUES ($1, $2) RETURNING tanker_name, tanker_id', [numberPlate, numberPlate]
    );
    return result;
}
function Update_Tanker_Info_Query(status, number_plate) {
    console.log(status, number_plate)
    const query = 'UPDATE tanker_info SET status = $1 WHERE number_plate = $2';
    client.query(query, [status, number_plate]);
}


module.exports = { Insert_Fuel_Data_Query, Get_Fuel_Data_Query, Insert_Tanker_Info_Query, Update_Tanker_Info_Query }
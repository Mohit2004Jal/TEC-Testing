const yup = require("yup")

const tanker_data_schema = yup.object().shape({
    fuel: yup.number().required(),
    longitude: yup.number().required(),
    latitude: yup.number().required(),
})
async function validate_tanker_data(req, res, next) {
    try {
        req.body = await tanker_data_schema.validate(req.body);
        next();
    }
    catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Invalid data received for tanker ${req.params.id}.: `, err);
        return res.status(400).json({ error: "Invalid fuel data: Missing fuel, longitude, or latitude." });
    }
}

module.exports = {
    validate_tanker_data
}

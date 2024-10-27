const { get_all_ids } = require("../utils/fetch_id.js")

const displayGraph = async (req, res) => {
    try {
        const number_plates = await get_all_ids();
        res.status(200).render("home.ejs", { names: number_plates });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data");
    }
};

module.exports = {
    displayGraph,
};
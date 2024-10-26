const { get_all_ids } = require("../utils/fetch_id.js")

const displayGraph = async (req, res) => {
    try {
        const tanker_ids = await get_all_ids();
        res.status(200).render("home.ejs", { names: tanker_ids });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data");
    }
};

module.exports = {
    displayGraph,
};
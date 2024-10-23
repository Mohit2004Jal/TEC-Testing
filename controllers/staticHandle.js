const { get_all_ids } = require("../service/fetch_id.js")

const displayGraph = async (req, res) => {
    try {
        const Names = await get_all_ids();
        res.status(200).render("index.ejs", { names: Names });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data");
    }
};

module.exports = {
    displayGraph,
};
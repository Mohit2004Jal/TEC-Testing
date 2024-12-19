const { get_all_ids } = require("../utils/fetch_id.js")
const client = require("../service/db.js")
const redis = require("../service/redis.js")
const { JWTGeneration } = require("../service/userAutehntication.js")
require("dotenv").config()

const displayGraph = async (req, res) => {
    try {
        const number_plates = await get_all_ids();
        res.status(200).render("index.ejs", { names: number_plates });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data");
    }
};

const displayLogin = (req, res) => { res.render("login") };

const displayPanel = async (req, res) => {
    try {
        const { rows } = await client.query('SELECT number_plate, factor, tanker_name FROM tanker_info ORDER BY tanker_name');
        return res.render("admin", {
            configs: rows
        })
    }
    catch (err) { console.error(`[${new Date().toLocaleString("en-GB")}] Error geting data for admin panel: ${err.message}`) }
};

const validateUser = (req, res) => {
    const options = {
        httpOnly: true,
        sameSite: 'None', secure: true,
    }
    const { email, password } = req.body
    if (email !== process.env.EMAIL || password !== process.env.PASSWORD) return res.redirect("/login")
    const payload = { email, password }
    const token = JWTGeneration(payload)
    res.cookie("token", token, options)
    res.redirect('/admin')
};

const updateTankerData = async (req, res) => {
    const { number_plate, columns } = req.body;
    const { tanker_name, factor } = columns;
    try {
        await client.query(
            'UPDATE tanker_info SET tanker_name = $1, factor = $2 WHERE number_plate = $3',
            [tanker_name, factor, number_plate]
        );
        const pipeline = redis.pipeline();
        pipeline.call("JSON.SET", `allCurrentDevices:${number_plate}`, ".factor", factor);
        pipeline.call("JSON.SET", `allCurrentDevices:${number_plate}`, ".tanker_name", tanker_name);
        await pipeline.exec();
        return res.status(201).json({ message: "Tanker data updated successfully" });
    } catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error updating data: ${err.message}`);
    }
};


module.exports = { displayGraph, displayLogin, displayPanel, validateUser, updateTankerData };
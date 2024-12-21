const redis = require("../service/redis.js")
const { Get_All_Ids_Query, Get_Tanker_Info_Query, Update_Tanker_Info_Query, Get_Tanker_Data_Widget_Query } = require("../Database/Frontend.js")
const { JWTGeneration } = require("../service/userAutehntication.js")
require("dotenv").config()

const displayGraph = async (req, res) => {
    try {
        const number_plates = await Get_All_Ids_Query();
        res.status(200).render("index.ejs", { names: number_plates });
    }
    catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error fetching number plate: ${error.message}`);
    }
};
const displayLogin = (req, res) => {
    res.render("login")
};
const displayPanel = async (req, res) => {
    try {
        const { rows } = Get_Tanker_Info_Query()
        return res.render("admin", { configs: rows })
    }
    catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error geting data for admin panel: ${err.message}`)
    }
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
        Update_Tanker_Info_Query();
        const pipeline = redis.pipeline();
        pipeline.call("JSON.SET", `allCurrentDevices:${number_plate}`, ".factor", factor);
        pipeline.call("JSON.SET", `allCurrentDevices:${number_plate}`, ".tanker_name", tanker_name);
        await pipeline.exec();
        return res.status(201).json({ message: "Tanker data updated successfully" });
    } catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error updating data: ${err.message}`);
    }
};
const GetWidgetData = async (req, res) => {
    const selectedTanker = req.body.tanker;
    const range = req.body.range;
    try {
        const rows = Get_Tanker_Data_Widget_Query(range, selectedTanker)
        res.status(200).json(rows);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error retrieving data for tanker ${selectedTanker}: ${error.message}`);
        res.status(500).json({ error: "Internal server error while retrieving data." });
    }
}

module.exports = { displayGraph, displayLogin, displayPanel, validateUser, updateTankerData, GetWidgetData };
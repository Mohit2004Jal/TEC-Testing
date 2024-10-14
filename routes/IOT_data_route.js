const express = require("express")
const router = express.Router()
const { handleData } = require("../controllers/handle_Data")

router.post("/fuel-data/:id", handleData)

module.exports = router
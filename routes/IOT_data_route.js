const express = require("express")
const router = express.Router()
const { handleData } = require("../controllers/handle_Data")

router.route("/fuel-data/:id")
    .post(handleData)

module.exports = router
const express = require("express")
const router = express.Router()
const { handleData } = require("../controllers/handle_Data")
const { getLast } = require("../controllers/send_graph")

router.route("/fuel-data/:id")
    .post(handleData)

router.route("/graph/")
    .post(getLast)

module.exports = router
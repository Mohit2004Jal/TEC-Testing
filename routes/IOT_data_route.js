const express = require("express")
const router = express.Router()
const { handle_data_from_device } = require("../controllers/handle_data_from_device")
const { get_data_for_widgets } = require("../controllers/send_widget_data")

router.route("/fuel-data/:id")
    .post(handle_data_from_device)

router.route("/graph/")
    .post(get_data_for_widgets)

module.exports = router
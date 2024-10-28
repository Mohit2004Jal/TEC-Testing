const express = require("express")
const router = express.Router()

const { handleDataFromDevice } = require("../controllers/handle_data_from_device")
const { get_data_for_widgets } = require("../controllers/send_widget_data")

const { validate_tanker_data } = require("../middleware/validate_post_data")
const { reduce_decimal } = require("../middleware/uniforming_post_data")

router.route("/fuel-data/:id")
    .post(validate_tanker_data, reduce_decimal, handleDataFromDevice)

router.route("/graph/")
    .post(get_data_for_widgets)

module.exports = router
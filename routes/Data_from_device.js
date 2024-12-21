const express = require("express")
const router = express.Router()

const { validate_tanker_data } = require("../middleware/validate_post_data")
const { reduce_decimal } = require("../middleware/uniforming_post_data")
const { handleDataFromDevice } = require("../controllers/Data_from_device")

router.route("/fuel-data/:id")
    .post(validate_tanker_data, reduce_decimal, handleDataFromDevice)

module.exports = router
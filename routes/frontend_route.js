const express = require("express")
const router = express.Router()
const { displayGraph } = require("../controllers/staticHandle.js")


router.route("/")
    .get(displayGraph)

module.exports = router
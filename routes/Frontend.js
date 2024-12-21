const express = require("express")
const router = express.Router()
const { JWTMiddleware } = require("../middleware/checkAuth.js")
const { displayGraph, displayLogin, displayPanel, validateUser, updateTankerData, GetWidgetData } = require("../controllers/Frontend.js")

router.route("/")
    .get(displayGraph)

router.route("/widgets/data")
    .post(GetWidgetData)

router.route("/login")
    .get(displayLogin)
    .post(validateUser)

router.route("/admin")
    .get(JWTMiddleware, displayPanel)
    .post(updateTankerData)

module.exports = router
const express = require("express")
const router = express.Router()
const { displayGraph, displayLogin, displayPanel, validateUser, updateTankerData } = require("../controllers/staticHandle.js")
const { JWTMiddleware } = require("../middleware/checkAuth.js")

router.route("/")
    .get(displayGraph)

router.route("/login")
    .get(displayLogin)
    .post(validateUser)

router.route("/admin")
    .get(JWTMiddleware, displayPanel)
    .post(updateTankerData)

module.exports = router
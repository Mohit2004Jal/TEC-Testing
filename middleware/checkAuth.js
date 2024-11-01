require('dotenv').config()
const JWTSecretKey = process.env.JWTSecretKey;

const jwt = require("jsonwebtoken")
const JWTMiddleware = (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Unauthorised Access`);
        return res.status(401).redirect(`/login`)
    }
    try {
        const decodedPayload = jwt.verify(token, JWTSecretKey)
        req.userData = decodedPayload
        next()
    } catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error validating user for admin access: ${err.message}`);
        return res.redirect(`/user/login`)
    }
}
module.exports = {
    JWTMiddleware
}
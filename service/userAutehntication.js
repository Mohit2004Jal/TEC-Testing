require('dotenv').config()
const JWTSecretKey = process.env.JWTSecretKey;

const jwt = require("jsonwebtoken")
const JWTGeneration = (userData) => {
    return jwt.sign(userData, JWTSecretKey)
}
module.exports = {
    JWTGeneration
}
const Redis = require('ioredis');
const dotenv = require("dotenv")
dotenv.config()
const redis = new Redis();

module.exports = redis
const Redis = require('ioredis');
const dotenv = require("dotenv")
dotenv.config()
const redis = new Redis(
    {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PW,
    }
);

module.exports = redis
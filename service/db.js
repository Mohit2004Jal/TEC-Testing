const Client = require("pg").Client;
require("dotenv").config()
const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false, // This is used in development. Set to true in production.
    },
});

module.exports = client
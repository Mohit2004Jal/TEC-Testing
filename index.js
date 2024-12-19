//Express Setup
const express = require('express');
const app = express();

//Using HTTP for socket.io
const http = require("http")
const server = http.createServer(app)

//.env for sensitive information
require("dotenv").config();

//Express Middlewares for recieving and parsing json and form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const cookieParser = require('cookie-parser')
app.use(cookieParser())

// Setting Up Templating Engine
const path = require("path")
app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))
app.use(express.static(path.join(__dirname, 'src')))
//Socket.io
const socket = require("socket.io")
const io = new socket.Server(server)
io.on("connection", (socket) => { app.set("socket", socket) })

//Different Routes
const Data_from_tanker_router = require("./routes/IOT_data_route.js")
app.use("/api", Data_from_tanker_router)
const Frontend_Router = require("./routes/frontend_route.js")
app.use("/", Frontend_Router)

//Connecting the Database
const client = require("./service/db.js")
const redis = require("./service/redis.js")
redis.on('connect', () => { console.log('Connected to Redis') });
redis.on('error', (err) => { console.error('Redis client encountered an error:', err) });
client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

//Starting the server
const PORT = process.env.PORT || 8080
server.listen(PORT, () => console.log(`Server Started at ${PORT}`))

//Express Setup
const express = require('express');
const app = express();

//Using HTTP for socket.io
const http = require("http")
const server = http.createServer(app)

//.env for sensitive information
const dotenv = require("dotenv");
dotenv.config();

//Express Middlewares for recieving and parsing json and form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setting Up Templating Engine
const path = require("path")
app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))
app.use(express.static(path.join(__dirname, 'src')))

//Socket.io
const socket = require("socket.io")
const io = new socket.Server(server)
io.on("connection", (socket) => {
    app.set("socket", socket)
})

//Different Routes
const IOT_Data_Router = require("./routes/IOT_data_route")
app.use("/api", IOT_Data_Router)
const Static_Router = require("./routes/static-route")
app.use("/", Static_Router)

//Starting the server
const PORT = process.env.PORT || 8080
server.listen(PORT, () => console.log(`Server Started at ${PORT}`))

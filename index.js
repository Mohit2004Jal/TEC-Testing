const express = require('express');
const app = express();
const dotenv = require("dotenv");
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const IOT_Data_Router = require("./routes/IOT_data_route")

app.use("/api", IOT_Data_Router)
app.get("/", (req, res) => { res.send("Home") });

const PORT = process.env.PORT || 8080
app.listen(PORT, () => { console.log(`Server running on port ${process.env.PORT || 8080}`) });

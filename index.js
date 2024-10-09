const express = require('express');
const nodemailer = require("nodemailer");

const dotenv = require("dotenv")
dotenv.config()

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const tempArray = [];
let sentEmail = false

const auth = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: "mohitdavar2004@gmail.com",
        pass: "pzfxkfaniqxkqecq"
    }
});

const mailOptions = {
    from: 'mohitdavar2004@gmail.com',
    to: 'davarrajni@gmail.com',
    subject: 'Fuel Leak Detected',
    text: 'There seems to be a fuel leak. Please check immediately.'
};

function checKLeak() {
    if (tempArray.length == 5) {
        let overleak = true;

        for (let i = 0; i < 4; i++) {
            if (tempArray[i + 1] > tempArray[i]) {
                overleak = false;
                break;
            }
        }

        if (overleak && !sentEmail) {
            auth.sendMail(mailOptions, (error, emailResponse) => {
                if (error)
                    throw error;
                console.log("Success!")
                res.end()
            })
            sentEmail = true;
        }
        tempArray.shift();
    }
}

function handleFuelData(req, res) {
    const FuelData = req.body;

    if (FuelData && FuelData.fuel != null) {
        tempArray.push(FuelData.fuel);
        console.log("Received Fuel Data:", FuelData);
        console.log("Fuel Array:", tempArray);

        checKLeak();

        res.status(200).send("Fuel data received successfully");
    } else {
        res.status(400).send("Invalid Fuel data");
    }
}

app.post('/api/v1/integrations/http/fdb69a3a-93fc-7301-c8be-a80f831080ea', handleFuelData);

app.get("/", (req, res) => {
    res.send("Home");
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

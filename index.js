const express = require('express');
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuration for coordinates and thresholds
const targetLocation = { longitude: 60, latitude: 60 };
const MAX_VARIATION_DISTANCE = 5;
const fuelDataArray = [];

const alertStatus = {
    rising: false,
    leaking: false,
    draining: false
};

// Setup nodemailer transport
const emailTransporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to calculate linear trend (increase, decrease, or stable)
function getFuelTrend(data) {
    const n = data.length;
    if (n < 2) return 0; // Not enough data to establish a trend

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
        const x = i + 1;
        const y = data[i];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope > 0 ? 1 : slope < 0 ? -1 : 0;
}
// Helper function to calculate the distance between two coordinates
function calculateDistance(coord1, coord2) {
    const dx = coord1.longitude - coord2.longitude;
    const dy = coord1.latitude - coord2.latitude;
    return Math.sqrt(dx * dx + dy * dy);
}

// Function to send email alerts
async function sendEmailAlert(subject, message) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ALERT_EMAIL,
        subject,
        text: message
    };

    try {
        await emailTransporter.sendMail(mailOptions);
        console.log(`Alert: ${subject}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

// Function to handle fuel trend and send alerts
function analyzeFuelData(longitude, latitude, currentFuel) {
    const trend = getFuelTrend(fuelDataArray);
    const locationDistance = calculateDistance({ longitude, latitude }, targetLocation);

    if (trend > 0 && !alertStatus.rising) {
        console.log(`Fuel Increase Detected. Fuel level rising at coordinates (${longitude}, ${latitude}).`);
        alertStatus.rising = true;
    } else if (trend < 0 && locationDistance > MAX_VARIATION_DISTANCE && !alertStatus.leaking) {
        sendEmailAlert("Fuel Leak Detected", `Fuel is leaking at (${longitude}, ${latitude}) far from the target location.`);
        alertStatus.leaking = true;
    } else if (trend < 0 && locationDistance <= MAX_VARIATION_DISTANCE && !alertStatus.draining) {
        console.log(`Fuel Drain Detected. Fuel draining at target location (${longitude}, ${latitude}).`);
        alertStatus.draining = true;
    }
}

// Endpoint to receive fuel data
app.post('/api/fuel-data', (req, res) => {
    const { fuel, coordinates } = req.body;
    const { longitude, latitude } = coordinates;

    if (fuel != null && longitude != null && latitude != null) {
        fuelDataArray.push(fuel);
        console.log("Fuel Data: ", [ fuel, coordinates ])
        analyzeFuelData(longitude, latitude, fuel);
        res.status(200).send("Fuel data received successfully");
    } else {
        res.status(400).send("Invalid fuel data");
    }
});

app.get("/", (req, res) => {
    res.send("Home");
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

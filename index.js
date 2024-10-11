const express = require('express');
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const targetLocation = { longitude: 30.886188, latitude: 75.929028 };
const MAX_VARIATION_DISTANCE = 50;

// Object to store fuel data and alert statuses for each device
const deviceData = {};

const emailTransporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: "mohitdavar2004@gmail.com",
        pass: "pzfxkfaniqxkqecq"
    }
});

/*
function getFuelTrend(data) {
    const REQUIRED_LENGTH = 10;
    if (data.length < REQUIRED_LENGTH) return 0;

    // Calculate moving average to smooth out noise
    const smoothedData = movingAverage(data, 3); // Window size of 3
    // Ensure we have enough data after smoothing
    if (smoothedData.length < REQUIRED_LENGTH) return 0;
    // Consider only the last ten smoothed values
    const recentData = smoothedData.slice(-REQUIRED_LENGTH);
    // Check for strictly increasing or decreasing trend
    let increasingCount = 0;
    let decreasingCount = 0;

    for (let i = 1; i < recentData.length; i++) {
        if (recentData[i] > recentData[i - 1]) {
            increasingCount++;
        } else if (recentData[i] < recentData[i - 1]) {
            decreasingCount++;
        }
    }

    // Define a threshold to determine trend, e.g., at least 80% increasing or decreasing
    const threshold = 0.8 * (REQUIRED_LENGTH - 1); // 8 out of 9

    if (increasingCount >= threshold) {
        // Remove the oldest data point to maintain the window size
        data.shift();
        console.log("Array after shift: ", data);
        return 1; // Increasing
    } else if (decreasingCount >= threshold) {
        // Remove the oldest data point to maintain the window size
        data.shift();
        console.log("Array after shift: ", data);
        return -1; // Decreasing
    } else {
        // Remove the oldest data point to maintain the window size
        data.shift();
        console.log("Array after shift: ", data);
        return 0; // Stable or no clear trend
    }
}
function movingAverage(data, windowSize) {
    if (windowSize <= 0) throw new Error("Window size must be positive");
    const averages = [];
    for (let i = 0; i <= data.length - windowSize; i++) {
        const window = data.slice(i, i + windowSize);
        const avg = window.reduce((sum, val) => sum + val, 0) / windowSize;
        averages.push(avg);
    }
    return averages;
}
*/

function getFuelTrend(data) {
    const REQUIRED_LENGTH = 7;
    // Ensure we have at least ten values to check
    if (data.length < REQUIRED_LENGTH) {
        return 0;
    }
    const recentData = data.slice(-REQUIRED_LENGTH);

    // Check if strictly increasing
    let isIncreasing = true;
    let isDecreasing = true;

    for (let i = 1; i < recentData.length; i++) {
        if (recentData[i] <= recentData[i - 1]) {
            isIncreasing = false;
        }
        if (recentData[i] >= recentData[i - 1]) {
            isDecreasing = false;
        }
    }

    if (isIncreasing) {
        return 1; // Strictly increasing
    } else if (isDecreasing) {
        return -1; // Strictly decreasing
    } else {
        return 0; // Neither
    }
}
// Helper function to calculate the distance between two coordinates
function calculateDistance(coord1, coord2) {
    const dx = coord1.longitude - coord2.longitude;
    const dy = coord1.latitude - coord2.latitude;
    return Math.sqrt(dx * dx + dy * dy);
}
async function sendEmailAlert(subject, message) {
    const mailOptions = {
        from: "mohitdavar2004@gmail.com",
        to: "davarrajni@gmail.com",
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
// Function to handle fuel trend and send alerts for a specific device
function analyzeFuelData(deviceId, longitude, latitude) {
    const { fuelDataArray, alertStatus } = deviceData[deviceId];
    const trend = getFuelTrend(fuelDataArray);
    const locationDistance = calculateDistance({ longitude, latitude }, targetLocation);

    if (trend > 0 && !alertStatus.rising) {
        console.log(`Device ${deviceId}: Fuel Increase Detected at (${longitude}, ${latitude}).`);
        sendEmailAlert("Fuel Increase Detected", `Device ${deviceId}: Fuel level rising at coordinates (${longitude}, ${latitude}).`);
        alertStatus.rising = true;
        alertStatus.leaking = false;
        alertStatus.draining = false;
    } else if (trend < 0 && locationDistance > MAX_VARIATION_DISTANCE && !alertStatus.leaking) {
        console.log(`Device ${deviceId}: Fuel Leak Detected at (${longitude}, ${latitude}).`);
        sendEmailAlert("Fuel Leak Detected", `Device ${deviceId}: Fuel is leaking at (${longitude}, ${latitude}) far from the target location.`);
        alertStatus.leaking = true;
        alertStatus.rising = false;
    } else if (trend < 0 && locationDistance <= MAX_VARIATION_DISTANCE && !alertStatus.draining) {
        console.log(`Device ${deviceId}: Fuel Drain Detected at (${longitude}, ${latitude}).`);
        sendEmailAlert("Fuel Drain Detected", `Device ${deviceId}: Fuel draining at target location (${longitude}, ${latitude}).`);
        alertStatus.draining = true;
        alertStatus.rising = false;
    }
}
// Endpoint to receive fuel data for a specific device by ID
app.post('/api/fuel-data/:id', (req, res) => {
    const deviceId = req.params.id;
    // const { fuel, coordinates } = req.body;
    // const { longitude, latitude } = coordinates;
    const { fuel, longitude, latitude } = req.body
    switch (deviceId) {
        case "busb":
            fuel = fuel * 137
            break;
        case "busc":
            fuel = fuel * 187.6
            break;
        default:
            break;
    }

    if (fuel != null && longitude != null && latitude != null) {
        // Initialize data for the device if not already present
        if (!deviceData[deviceId]) {
            deviceData[deviceId] = {
                fuelDataArray: [],
                alertStatus: {
                    rising: false,
                    leaking: false,
                    draining: false
                }
            };
        }

        // Add fuel data for this device
        deviceData[deviceId].fuelDataArray.push(fuel);
        console.log(`Device ${deviceId} - Fuel Data: `, { fuel, latitude, longitude });

        // Analyze fuel data for this device
        analyzeFuelData(deviceId, longitude, latitude);
        res.status(200).send(`Fuel data received successfully for device ${deviceId}`);
    } else {
        res.status(400).send("Invalid fuel data");
    }
});

app.get("/", (req, res) => {
    res.send("Home");
});

app.listen(process.env.PORT || 8080, () => {
    console.log(`Server running on port ${process.env.PORT || 8080}`);
});

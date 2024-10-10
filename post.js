const axios = require('axios');

async function PostData(data, coordinates) {
    try {
        const response = await axios.post('http://thingsboard.cloud/api/v1/39fwmmulx00ivunhco6t/telemetry', {
            fuel: data,
            coordinates: coordinates
        });
        console.log('POST Response Data:', response.data);
    } catch (error) {
        console.error('Error posting data:', error);
    }
}

// Generate random coordinates around a point
function generateRandomCoordinatesAroundPoint(x, y, radius) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    const randomX = x + distance * Math.cos(angle);
    const randomY = y + distance * Math.sin(angle);
    return { longitude: randomX, latitude: randomY };
}

const centerX = 50;
const centerY = 50;
const targetX = 60;
const targetY = 60;
const radius = 2;

let data = 0;
let slope = 30;  // Rate of fuel change

// Function to calculate intermediate coordinates between start and target
function getIntermediateCoordinates(startX, startY, targetX, targetY, percentage) {
    const longitude = startX + (targetX - startX) * percentage;
    const latitude = startY + (targetY - startY) * percentage;
    return { longitude, latitude };
}

// Simulate truck filling fuel, moving, and then draining fuel
async function simulateTruckJourney() {
    const totalDuration = 150 * 1000;  // Total 2 minutes in milliseconds
    const fillDuration = 30 * 1000;    // 30 seconds for filling fuel
    const moveDuration = 60 * 1000;    // 60 seconds for moving
    // const drainDuration = 30 * 1000;   // 30 seconds for draining fuel
    const fuelCap = 100;

    let startTime = Date.now();
    let interval = setInterval(() => {
        let elapsed = Date.now() - startTime;
        let coordinates;

        if (elapsed <= fillDuration) {
            data += slope;
            if (data > fuelCap) data = fuelCap;
            coordinates = generateRandomCoordinatesAroundPoint(centerX, centerY, radius);
        } else if (elapsed > fillDuration && elapsed <= fillDuration + moveDuration) {
            const movePercentage = (elapsed - fillDuration) / moveDuration;
            coordinates = getIntermediateCoordinates(centerX, centerY, targetX, targetY, movePercentage);
            data = fuelCap;
        } else if (elapsed > fillDuration + moveDuration && elapsed <= totalDuration) {
            // Draining phase: fuel decreases from 100 to 0 over 30 seconds
            data -= slope;
            if (data < 0) data = 0;
            coordinates = generateRandomCoordinatesAroundPoint(targetX, targetY, radius);
        }
        // Post data
        PostData(data, coordinates);
        // End simulation after 2 minutes
        if (elapsed >= totalDuration) {
            clearInterval(interval);
            console.log("Simulation complete.");
        }
    }, 10000);  // Data is sent every 10 seconds
}
simulateTruckJourney();

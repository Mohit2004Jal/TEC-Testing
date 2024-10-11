const axios = require('axios');

async function PostData(data, coordinates) {
    try {
        const response = await axios.post('https://2bbf-2409-4055-412-f52d-a99c-c10f-c1dc-3552.ngrok-free.app/api/fuel-data/Fuel', {
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
let slope = 10;  // Rate of fuel change
// Function to calculate intermediate coordinates between start and target
function getIntermediateCoordinates(startX, startY, targetX, targetY, percentage) {
    const longitude = startX + (targetX - startX) * percentage;
    const latitude = startY + (targetY - startY) * percentage;
    return { longitude, latitude };
}
// Simulate truck filling fuel, moving, and then draining fuel
async function simulateTruckJourney() {
    const fillDuration = 40 * 1000;    // 40 seconds for filling fuel
    const moveDuration = 30 * 1000;    // 30 seconds for moving
    // const fuelCap = 500;

    let startTime = Date.now();
    let interval = setInterval(() => {
        let elapsed = Date.now() - startTime;
        let coordinates;

        if (elapsed <= fillDuration) {
            data += slope;
            // if (data > fuelCap) data = fuelCap;
            coordinates = generateRandomCoordinatesAroundPoint(centerX, centerY, radius);
        } else if (elapsed > fillDuration && elapsed <= fillDuration + moveDuration) {
            const movePercentage = (elapsed - fillDuration) / moveDuration;
            coordinates = getIntermediateCoordinates(centerX, centerY, targetX, targetY, movePercentage);
        } else if (elapsed > fillDuration + moveDuration) {
            data -= slope;
            if (data < 0) data = 0;
            coordinates = generateRandomCoordinatesAroundPoint(targetX, targetY, radius);
        }
        // Post data
        PostData(data, coordinates);
    }, 3000);
}
simulateTruckJourney();
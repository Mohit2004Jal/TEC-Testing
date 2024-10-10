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
};

function generateRandomCoordinatesAroundPoint(x, y, radius) {
    const angle = Math.random() * 2 * Math.PI;

    const distance = Math.random() * radius;

    const randomX = x + distance * Math.cos(angle);
    const randomY = y + distance * Math.sin(angle);

    return { randomX, randomY };
}

const centerX = 50;
const centerY = 50;
const radius = 10;
let data = 0
let slope = 10
function generateContinuously() {
    setInterval(() => {
        data += slope
        if (data > 100) {
            slope = -10
        }
        const { randomX, randomY } = generateRandomCoordinatesAroundPoint(centerX, centerY, radius);
        const coordinates = {
            longitude: randomX,
            latitude: randomY
        }
        PostData(data, coordinates)
    }, 10000);
}

generateContinuously();
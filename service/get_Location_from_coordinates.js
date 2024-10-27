const axios = require("axios");
require("dotenv").config();

const apiKey = process.env.map_api; 

async function getLocationName({ latitude, longitude }) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.results.length > 0) {
            const locationName = data.results[0].formatted; // Use formatted_address instead of formatted for clarity
            return locationName;
        } else {
            console.warn(`[${new Date().toLocaleString("en-GB")}] No location found for coordinates: ${latitude}, ${longitude}`);
            return null; 
        }
    } catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error fetching location for coordinates: ${latitude}, ${longitude}. Error: ${error.message}`);
        return null; 
    }
}

module.exports = {
    getLocationName,
};

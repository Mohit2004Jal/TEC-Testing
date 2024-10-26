function get_Fuel_Trend(data) {
    // Check if strictly increasing
    let isIncreasing = true;
    let isDecreasing = true;

    for (let i = 1; i < data.length; i++) {
        if (data[i] <= data[i - 1]) {
            isIncreasing = false;
        }
        if (data[i] >= data[i - 1]) {
            isDecreasing = false;
        }
    }

    if (isIncreasing) {
        // fuelInformation.trend = 1;
        return 1; // Strictly increasing
    }
    else if (isDecreasing) {
        // fuelInformation.trend = -1
        return -1; // Strictly decreasing
    }
    else {
        return 0; // Neither
    }
}
module.exports = {
    get_Fuel_Trend
}
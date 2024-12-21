function get_Fuel_Trend(data) {
    const size = data.length;
    // Count increasing and decreasing pairs
    let increasingCount = 0;
    let decreasingCount = 0;

    for (let i = 1; i < size; i++) {
        if (data[i] > data[i - 1]) {
            increasingCount++;
        }
        else if (data[i] < data[i - 1]) {
            decreasingCount++;
        }
    }

    // Calculate percentage trends
    const increasingPercentage = (increasingCount / (size - 1)) * 100;
    const decreasingPercentage = (decreasingCount / (size - 1)) * 100;

    // Determine the trend based on threshold (75%)
    if (increasingPercentage >= 80) return 1
    else if (decreasingPercentage >= 80) return -1
    else return 0
}

module.exports = { get_Fuel_Trend };
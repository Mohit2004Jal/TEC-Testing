function getFuelTrend(data) {
    const REQUIRED_LENGTH = 10;
    // Ensure we have at least ten values to check
    if (data.length < REQUIRED_LENGTH) {
        return;
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
module.exports = {
    getFuelTrend
}
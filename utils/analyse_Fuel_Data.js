const { sendEmailAlert } = require("../service/send_Mail");
const { getFuelTrend } = require("./check_Fuel_Trend");
const { isWithinRadius } = require("./calc_Dist_Btwn_Two_Pts");

// Function to handle fuel trend and send alerts for a specific device
function analyzeFuelData(deviceId, longitude, latitude, deviceData) {
    const { fuelDataArray, alertStatus } = deviceData[deviceId];
    const trend = getFuelTrend(fuelDataArray);
    const withinRadius = isWithinRadius({ latitude, longitude });

    if (trend > 0 && !alertStatus.rising) {
        console.log("\x1b[41m Fuel is rising \x1b[0m")
        sendEmailAlert(
            "Fuel Increase Detected",
            `Device ${deviceId}: Fuel level at ${fuelDataArray[0]} rising at coordinates (${longitude}, ${latitude}).`
        );
        alertStatus.rising = true;
        alertStatus.draining = false
        alertStatus.leaking = false;
        // alertStatus.stable = 0;
    }
    else if (trend < 0 && !withinRadius && !alertStatus.leaking) {
        console.log("\x1b[41m Fuel is leaking \x1b[0m")
        sendEmailAlert(
            "Fuel Leak Detected",
            `Device ${deviceId}: Fuel level at ${fuelDataArray[0]} leaking at (${longitude}, ${latitude}) far from the target location.`
        );
        alertStatus.leaking = true;
        alertStatus.rising = false
        alertStatus.draining = false;
        // alertStatus.stable = 0;
    }
    else if (trend < 0 && withinRadius && !alertStatus.draining) {
        console.log("\x1b[41m Fuel is draining \x1b[0m")
        sendEmailAlert(
            "Fuel Drain Detected",
            `Device ${deviceId}: Fuel level at ${fuelDataArray[0]} draining at target location (${longitude}, ${latitude}).`
        );
        alertStatus.draining = true;
        alertStatus.rising = false;
        alertStatus.leaking = false;
        // alertStatus.stable = 0;
    }
    // else if (trend == 0) {
    //     if (alertStatus.rising || alertStatus.draining || alertStatus.leaking) {
    //         if (alertStatus.stable > 15) {
    //             console.log("\x1b[42m Fuel is stable \x1b[0m")
    //             Object.keys(alertStatus).forEach((key) => {
    //                 alertStatus[key] = false;
    //             });
    //             alertStatus.stable = 0
    //         }
    //         alertStatus.stable += 1
    //     }
    // }
}

module.exports = {
    analyzeFuelData,
};
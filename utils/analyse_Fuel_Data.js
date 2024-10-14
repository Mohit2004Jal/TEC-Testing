const { sendEmailAlert } = require("../service/send_Mail");
const { getFuelTrend } = require("./check_Fuel_Trend");
const { isWithinRadius } = require("./calc_Dist_Btwn_Two_Pts");

// Function to handle fuel trend and send alerts for a specific device
function analyzeFuelData(deviceId, longitude, latitude, deviceData) {
    const { fuelDataArray, alertStatus } = deviceData[deviceId];
    const trend = getFuelTrend(fuelDataArray);
    const withinRadius = isWithinRadius({ latitude, longitude });

    if (trend > 0 && !alertStatus.rising) {
        sendEmailAlert(
            "Fuel Increase Detected",
            `Device ${deviceId}: Fuel level rising at coordinates (${longitude}, ${latitude}).`
        );
        console.log("\x1b[41m Fuel is rising \x1b[0m")
        alertStatus.rising = true;
        alertStatus.stable = 0;
    }
    else if (trend < 0 && !withinRadius && !alertStatus.leaking) {
        sendEmailAlert(
            "Fuel Leak Detected",
            `Device ${deviceId}: Fuel is leaking at (${longitude}, ${latitude}) far from the target location.`
        );
        console.log("\x1b[41m Fuel is leaking \x1b[0m")
        alertStatus.leaking = true;
        alertStatus.stable = 0;
    }
    else if (trend < 0 && withinRadius && !alertStatus.draining) {
        sendEmailAlert(
            "Fuel Drain Detected",
            `Device ${deviceId}: Fuel draining at target location (${longitude}, ${latitude}).`
        );
        console.log("\x1b[41m Fuel is draining \x1b[0m")
        alertStatus.draining = true;
        alertStatus.stable = 0;
    }
    else if (trend == 0) {
        if (alertStatus.rising || alertStatus.draining || alertStatus.leaking) {
            if (alertStatus.stable > 15) {
                console.log(alertStatus)
                console.log("\x1b[42m Fuel is stable \x1b[0m")
                Object.keys(alertStatus).forEach((key) => {
                    alertStatus[key] = false;
                });
                alertStatus.stable = 0
                console.log(alertStatus)
            }
            alertStatus.stable += 1
        }
    }
}

module.exports = {
    analyzeFuelData,
};
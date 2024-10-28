const to_Fixed = (value, precision) => parseFloat(value.toFixed(precision))

function reduce_decimal(req, res, next) {
    req.body.fuel = to_Fixed(req.body.fuel, 2);
    req.body.longitude = to_Fixed(req.body.longitude, 6);
    req.body.latitude = to_Fixed(req.body.latitude, 6);
    next();
}

module.exports = {
    reduce_decimal
}
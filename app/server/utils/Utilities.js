// Imports
const Constants = require("../utils/Constants")();


function Utilities() {
    let module = {};

    /**
     * Returns a random number between min (inclusive) and max (exclusive)
     *
     * @param min           the random number minimum possible value
     * @param max           the random number maximum possible value
     * @returns {Number}    a random number
     */
    module.getRandomFloat = function (min, max) {
        return Math.random() * (max - min) + min;
    };

    /**
     * Returns a random integer between min (inclusive) and max (exclusive)
     *
     * @param min           the random number minimum possible value
     * @param max           the random number maximum possible value
     * @returns {Number}    a random number
     */
    module.getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    /**
     * Returns the square of the distance between the given two points.
     *
     * @param pointA        the first point
     * @param pointB        the second point
     * @returns {number}    the square of the distance
     */
    module.distanceSquared = function (point1, point2) {
        let dx = point1.x - point2.x;
        let dy = point1.y - point2.y;

        return dx * dx + dy * dy;
    };

    return module;
}

module.exports = Utilities;
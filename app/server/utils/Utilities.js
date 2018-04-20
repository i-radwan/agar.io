class Utilities {

    /**
     * Returns a random number between min (inclusive) and max (exclusive)
     *
     * @param min           the random number minimum possible value
     * @param max           the random number maximum possible value
     * @returns {Number}    a random number
     */
    static getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Returns a random integer between min (inclusive) and max (exclusive)
     *
     * @param min           the random number minimum possible value
     * @param max           the random number maximum possible value
     * @returns {Number}    a random number
     */
    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * Returns the square of the distance between the given two points.
     *
     * @param pointA        the first point
     * @param pointB        the second point
     * @returns {number}    the square of the distance
     */
    static distanceSquared(point1, point2) {
        let dx = point1.x - point2.x;
        let dy = point1.y - point2.y;

        return dx * dx + dy * dy;
    }
}

module.exports = Utilities;
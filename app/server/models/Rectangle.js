// Imports
const Constants = require("../utils/Constants")();


class Rectangle {

    /**
     * Rectangle model constructor.
     *
     * @param x
     * @param y
     * @param rLength
     * @param rHeight
     */
    constructor(x, y, rLength, rHeight) {
        this.x = x;
        this.y = y;
        this.rLength = rLength;
        this.rHeight = rHeight;
    }
}

module.exports = Rectangle;

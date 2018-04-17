/**
 * Created by ASamir on 3/11/18.
 */
const GameConfig = require("../configs")();

// Gem model class
class Rectangle {

    /**
     * Rectangle constructor
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

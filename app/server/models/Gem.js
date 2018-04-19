// Imports
const Constants = require("../utils/Constants")();
const Utilities = require("../utils/Utilities");


class Gem {

    /**
     * Gem model constructor.
     *
     * @param id    gem unique id in the game room
     */
    constructor(id) {
        // Set id (unique within room)
        this.id = id;

        // Generate random normalized position
        this.x = Utilities.getRandomFloat(-1, 1);
        this.y = Utilities.getRandomFloat(-1, 1);

        // Set random radius
        this.radius = Utilities.getRandomFloat(Constants.GEM_MIN_RADIUS, Constants.GEM_MAX_RADIUS);

        // Pick a random color
        this.color = Constants.COLORS[Utilities.getRandomInt(0, Constants.COLORS.length)];
    }

    /**
     * Returns the current gem's area.
     * @returns {number}    the gem's area.
     */
    getArea() {
        return Math.PI * this.radius * this.radius;
    }
}

module.exports = Gem;

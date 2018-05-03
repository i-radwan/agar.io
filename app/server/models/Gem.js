// Imports
const Constants = require("../utils/Constants")();
const Utilities = require("../utils/Utilities");

class Gem {

    /**
     * Gem model constructor.
     *
     * @param id        the gem unique id in the game room
     * @param position  the gem position
     */
    constructor(id, position) {
        // Set id (unique within room)
        this.id = id;

        // Pick a random color
        this.color = Constants.COLORS[Utilities.getRandomInt(0, Constants.COLORS.length)];

        // Set radius
        this.radius = Constants.GEM_RADIUS;

        this.x = position.x;
        this.y = position.y;
    }
}

module.exports = Gem;

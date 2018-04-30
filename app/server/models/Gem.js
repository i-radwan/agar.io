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

        // Pick a random color
        this.color = Constants.COLORS[Utilities.getRandomInt(0, Constants.COLORS.length)];

        // Set radius
        this.radius = Constants.GEM_RADIUS;

        // Generate random normalized position
        this.x = Utilities.getRandomFloat(-1, 1);
        this.y = Utilities.getRandomFloat(-1, 1);
    }
}

module.exports = Gem;

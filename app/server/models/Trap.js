// Imports
const Constants = require("../utils/Constants")();

class Trap {

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
        this.color = Constants.TRAP_COLOR;

        // Set radius
        this.radius = Constants.TRAP_RADIUS;

        this.x = position.x;
        this.y = position.y;
    }
}

module.exports = Trap;

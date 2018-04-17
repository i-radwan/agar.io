// Imports
const constants = require("../constants")();


class Gem {

    /**
     * Gem model constructor.
     *
     * @param id        gem unique id in the game room
     * @param position  position object contains {x, y}
     * @param color     color object contains {r, g, b}
     */
    constructor(id, position, color) {
        this.id = id;

        this.x = position[0];
        this.y = position[1];

        this.color = color;

        this.radius = constants.GEM_RADIUS;
    }
}

module.exports = Gem;

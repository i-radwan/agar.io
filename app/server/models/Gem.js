const GameConfig = require("../configs")();

// Gem model class
class Gem {
    /**
     * Gem constructor
     *
     * @param id The gem unique id in the game room
     * @param position: object contains {x, y}
     * @param color: object contains {r, g, b}
     */
    constructor(id, position, color) {
        this.id = id;

        this.x = position[0];
        this.y = position[1];

        this.color = color;

        this.radius = GameConfig.GEM_RADIUS;
    }
}

module.exports = Gem;

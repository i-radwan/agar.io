const gameConfig = require("../configs/GameConfig")().gameConfig;

// Gem model class
class Gem {
    /**
     * Gem constructor
     * @param id The gem unique id in the game room
     * @param position: object contains {x, y}
     * @param color: object contains {r, g, b}
     * @param points: integer
     */
    constructor(id, position, color, points) {
        this.id = id;

        this.x = position[0];
        this.y = position[1];

        this.color = color;

        this.radius = gameConfig.GEM_RADIUS;
    }
}

module.exports = Gem;

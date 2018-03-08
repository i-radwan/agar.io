// Player model class
const INITIAL_VELOCITY = 5;
const INITIAL_RADIUS = 15;

class Player {
    /**
     * Player constructor
     * @param initPosition: object contains {x, y}
     * @param name: string
     * @param color: object contains {r, g, b}
     * @param score: integer
     */
    constructor(initPosition, color, score = 0, name = "") {
        this.x = initPosition[0];
        this.y = initPosition[1];
        this.velocity = INITIAL_VELOCITY;
        this.angle = 0;
        this.color = color;
        this.radius = INITIAL_RADIUS;
        this.name = name;
        this.score = score;
    }
}

module.exports = Player;

// Player model class
const INITIAL_VELOCITY = 0.4;
const MAX_VELOCITY = 2;
const INITIAL_RADIUS = 22;

class Player {
    /**
     * Player constructor
     * @param initPosition: object contains {x, y}
     * @param name: string
     * @param color: object contains {r, g, b}
     * @param score: integer
     */
    constructor(id, initPosition, color, velocity = INITIAL_VELOCITY, score = 1, name = "") {
        this.x = initPosition[0];
        this.y = initPosition[1];
        this.velocity = velocity;
        this.angle = 0;
        this.color = color;
        this.radius = INITIAL_RADIUS;
        this.name = name;
        this.score = score;
        this.id = id;
        this.alive = true;
    }

    movePlayer() {
        this.y += Math.sin(this.angle) * this.velocity;
        this.x += Math.cos(this.angle) * this.velocity;
    }

    updateVelocity() {
        // this.velocity = MAX_VELOCITY / (this.score * 0.1);
    }

}

module.exports = Player;

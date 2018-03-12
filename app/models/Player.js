// Player model class
const gameConfig = require("../configs/GameConfig")().gameConfig;

class Player {
    /**
     * Player constructor
     * @param id
     * @param initPosition: object contains {x, y}
     * @param velocity
     * @param name: string
     * @param color: object contains {r, g, b}
     * @param score: integer
     */
    constructor(id, initPosition, color, velocity = gameConfig.initialPlayerVelocity, score = 1.0, name = "") {
        this.x = initPosition[0];
        this.y = initPosition[1];
        this.velocity = velocity;
        this.angle = 0;
        this.color = color;
        this.radius = gameConfig.initialPlayerRadius;
        this.name = name;
        this.score = score;
        this.id = id;
        this.alive = true;
    }

    /**
     * Move player
     */
    movePlayer() {
        this.y += Math.sin(this.angle) * this.velocity;
        this.x += Math.cos(this.angle) * this.velocity;
    }

    /**
     * Increment player's score by value and update player's size and speed in accordance
     */
    incrementScore(value) {
        this.score += value;

        this.radius += value * 0.3;

        this.velocity = Math.max(gameConfig.lowestPlayerVelocity,
            gameConfig.initialPlayerVelocity - 0.00291 * this.radius);
    }
}

module.exports = Player;
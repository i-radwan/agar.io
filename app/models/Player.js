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
    constructor(id, initPosition, color, velocity = gameConfig.INITIAL_PLAYER_SPEED, score = 1.0, name = "") {
        this.x = initPosition[0];
        this.y = initPosition[1];
        this.velocity = velocity;
        this.angle = 0;
        this.color = color;
        this.radius = gameConfig.INITIAL_PLAYER_RADIUS;
        this.name = name;
        this.score = score;
        this.id = id;
        this.alive = true;
        this.lastAngleTimeStamp = Date.now();
        this.lastReceivedAngleID = -1;
    }

    /**
     * Move player
     */
    movePlayer() {
        this.x += Math.cos(this.angle) * this.velocity;
        this.y += Math.sin(this.angle) * this.velocity;
    }

    /**
     * Increment player's score by value and update player's size and speed in accordance
     */
    incrementScore(value) {
        this.score += value;

        this.radius += value * gameConfig.SCALE_FACTOR;

        this.velocity = Math.max(gameConfig.LOWEST_PLAYER_SPEED,
            gameConfig.INITIAL_PLAYER_SPEED - 0.00291 * this.radius);
    }

    /**
     * A static function used in comparing scores for sorting
     *
     * @param playerA
     * @param playerB
     * @returns {int}
     */
    static compareScore(playerA, playerB) {
        return playerB.score - playerA.score;
    }
}

module.exports = Player;
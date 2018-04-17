// Imports
const constants = require("../constants")();


class Player {

    /**
     * Player model constructor.
     *
     * @param id
     * @param initPosition: object contains {x, y}
     * @param velocity
     * @param name: string
     * @param color: object contains {r, g, b}
     * @param score: integer
     */
    constructor(id, initPosition, color, velocity = constants.INITIAL_PLAYER_SPEED, score = 1.0, name = "") {
        this.x = initPosition[0];
        this.y = initPosition[1];
        this.x = this.y = 0;
        this.velocity = velocity;
        this.angle = 0;
        this.color = color;
        this.radius = constants.INITIAL_PLAYER_RADIUS;
        this.name = name;
        this.score = score;
        this.id = id;
        this.alive = true;
        this.lastAngleTimeStamp = Date.now();
        this.lastReceivedAngleID = -1;
        this.forcePosition = false;
    }

    /**
     * Move player
     */
    movePlayer() {
        let newX = this.x + Math.cos(this.angle) * this.velocity;
        let newY = this.y + Math.sin(this.angle) * this.velocity;

        if (newX >= -1 && newX <= 1) {
            this.x = newX;
        }
        if (newY >= -1 && newY <= 1) {
            this.y = newY;
        }
    }

    /**
     * Increment player's score by value and update player's size and speed in accordance
     */
    incrementScore(value) {
        this.score += value;

        this.radius += value * constants.SCALE_FACTOR;

        this.velocity = Math.max(constants.LOWEST_PLAYER_SPEED,
            constants.INITIAL_PLAYER_SPEED - 0.00291 * this.radius);
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
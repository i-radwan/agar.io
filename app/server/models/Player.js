// Imports
const Constants = require("../utils/Constants")();
const Utilities = require("../utils/Utilities")();

class Player {

    /**
     * Player model constructor.
     *
     * @param id
     * @param name: string
     */
    constructor(id, name = "") {
        // Set id (unique within room) and name
        this.id = id;
        this.name = name;

        // Generate random normalized position
        this.x = 0;//Utilities.getRandomFloat(-1, 1);
        this.y = 0;//Utilities.getRandomFloat(-1, 1);

        // Set radius
        this.radius = Constants.INITIAL_PLAYER_RADIUS;

        // TODO: radius is enough: velocity & score are dependant on the radius

        // Pick a random color
        this.color = Constants.COLORS[Utilities.getRandomInt(0, Constants.COLORS.length)];

        // Set player velocity and angle
        this.velocity = Constants.INITIAL_PLAYER_SPEED;
        this.angle = 0;

        // Set other player properties
        this.alive = true;
        this.score = 1.0;
        this.lastAngleTimeStamp = Date.now();
        this.lastReceivedAngleID = -1;
        this.forcePosition = false;
    }

    /**
     * Returns the current player's blob area.
     * @returns {number}    the player's area.
     */
    getArea() {
        return Math.PI * this.radius * this.radius;
    }

    /**
     * Moves player with his current velocity and angle
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
     * Increments player's score by the given value and update
     * radius and velocity in accordance.
     */
    incrementScore(value) {
        this.score += value;
        this.radius += value * Constants.SCALE_FACTOR;
        this.velocity = Math.max(
            Constants.LOWEST_PLAYER_SPEED,
            Constants.INITIAL_PLAYER_SPEED - 0.00291 * this.radius
        );
    }
}

module.exports = Player;
// Imports
const Constants = require("../utils/Constants")();
const Utilities = require("../utils/Utilities");


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
        this.score = 1.0;
        this.alive = true;

        // Generate random normalized position
        this.x = 0;//Utilities.getRandomFloat(-1, 1);
        this.y = 0;//Utilities.getRandomFloat(-1, 1);

        // Set initial movement angle
        this.angle = 0;
        this.velocity = Constants.INITIAL_PLAYER_SPEED;

        // Set radius
        this.radius = Constants.INITIAL_PLAYER_RADIUS;

        // Pick a random color
        this.color = Constants.COLORS[Utilities.getRandomInt(0, Constants.COLORS.length)];

        // Set synchronization properties
        this.lastAngleTimeStamp = Date.now();
        this.lastReceivedAngleID = -1;
        this.forcePosition = false;
    }

    /**
     * Returns the current player's blob area.
     *
     * @returns {number}    the player's area.
     */
    getArea() {
        return Math.PI * this.radius * this.radius;
    }

    /**
     * Updates player sync parameters and
     * checks whether the received angles buffer is valid regarding timestamps.
     *
     * @param anglesBuffer  the received angle buffer
     * @returns {boolean}   true if the received angles buffer is valid, false otherwise
     */
    validateSyncParams(anglesBuffer) {
        // Update sync properties
        let lastAngleTimeStamp = this.lastAngleTimeStamp;
        this.lastAngleTimeStamp = anglesBuffer.timestamp;
        this.lastReceivedAngleID = anglesBuffer.id;

        // Check if the sent timestamp is in the future
        // TODO: what about different timezones?
        if (anglesBuffer.timestamp > Date.now()) {
            return false;
        }

        // Check for the number of sent angles and if they could occur
        // in this delta time (since last send)
        // keeping room for one extra angle due to time functions differences.
        let delta = (anglesBuffer.timestamp - lastAngleTimeStamp);
        let expectedAnglesCount = Math.ceil(delta / Constants.UPDATE_PHYSICS_THRESHOLD);

        // Compare expected and received
        return (expectedAnglesCount >= anglesBuffer.angles.length - 1);
    }

    /**
     * Moves player with his current velocity and angle.
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

    /**
     * Checks whether the given player has been eaten by the current player.
     *
     * @param player        a player object
     * @returns {boolean}   true if the current player located on the given player, false otherwise
     */
    atePlayer(player) {
        if (this.getArea() - 1.1 * player.getArea() <= Constants.EPSILON) {
            return false;
        }

        let dx = this.x - player.x;
        let dy = this.y - player.y;
        let distanceSquared = dx * dx + dy * dy;

        let radiiSum = this.radius + player.radius;
        let radiiSumSquared = radiiSum * radiiSum;

        return radiiSumSquared - distanceSquared > Constants.EPSILON;
    }

    /**
     * Checks whether the given gem has been eaten by the current player.
     *
     * @param gem           a gem object
     * @returns {boolean}   true if the current player located on the gem, false otherwise
     */
    ateGem(gem) {
        let dx = this.x - gem.x;
        let dy = this.y - gem.y;
        let radiiSum = this.radius + gem.radius;

        return dx * dx + dy * dy <= radiiSum * radiiSum;
    }
}

module.exports = Player;
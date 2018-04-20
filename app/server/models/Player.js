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
    constructor(id, name = "Test") {
        // Set id (unique within room) and name
        this.id = id;
        this.name = name;
        this.score = 10;

        // Pick a random color
        this.color = Constants.COLORS[Utilities.getRandomInt(0, Constants.COLORS.length)];

        // Set radius
        this.radius = Constants.PLAYER_INITIAL_RADIUS;

        // Generate random normalized position
        this.x = 0;//Utilities.getRandomFloat(-1, 1);
        this.y = 0;//Utilities.getRandomFloat(-1, 1);

        // Set initial movement velocity and angle
        this.velocity = Constants.PLAYER_INITIAL_SPEED;
        this.angle = 0;

        // Set synchronization properties
        this.lastAngleTimeStamp = Date.now();
        this.lastReceivedAngleID = -1;
        this.forcePosition = false;
        this.lastForcePositionTime = 0;
    }

    /**
     * Updates player sync parameters and
     * checks whether the received angles buffer is valid regarding timestamps.
     *
     * @param anglesBuffer              the received angle buffer
     * @param lastSendRoomStatusTime    last time the server emitted the player's room status
     * @returns {boolean}               true if the received angles buffer is valid, false otherwise
     */
    validateSyncParams(anglesBuffer, lastSendRoomStatusTime) {
        // Update sync properties
        let lastAngleTimeStamp = this.lastAngleTimeStamp;
        this.lastAngleTimeStamp = anglesBuffer.timestamp;
        this.lastReceivedAngleID = anglesBuffer.id;

        // Check if forcePosition is received by the user before overriding it here
        if (this.forcePosition && this.lastForcePositionTime > lastSendRoomStatusTime)
            return false;

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
     * Checks whether this player can eat the given game object or not.
     *
     * @param obj           a game object (player, gem)
     * @returns {boolean}   true if this player can eat the given object, false otherwise
     */
    canEat(obj) {
        if (this.radius - obj.radius < 5 * Constants.SCALE_FACTOR) {
            return false;
        }

        let dx = this.x - obj.x;
        let dy = this.y - obj.y;
        let distanceSquared = dx * dx + dy * dy;

        return this.radius * this.radius > distanceSquared + obj.radius * obj.radius * 0.25;
    }

    /**
     * Eats the given object and update the player's
     * radius, velocity, and score in accordance.
     *
     * @param obj   the object to eat (gem, or other player)
     */
    eat(obj) {
        this.score += (obj.score || 1);

        // Area(new) = Area(old) + Area(obj)
        this.radius = Math.sqrt(this.radius * this.radius + obj.radius * obj.radius);

        this.velocity = Math.max(
            Constants.PLAYER_MIN_SPEED,
            Constants.PLAYER_INITIAL_SPEED - 0.00291 * this.radius
        );
    }
}

module.exports = Player;
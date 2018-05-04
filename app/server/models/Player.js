// Imports
const Constants = require("../utils/Constants")();
const Utilities = require("../utils/Utilities");
const User = require('../models/user');

class Player {

    /**
     * Player model constructor.
     *
     * @param id        the player id
     * @param user      the user model id of the given player
     * @param name      the player name
     * @param position  the player initial coordinates
     */
    constructor(id, user, name, position) {
        // Set id (unique within room) and name
        this.id = id;
        this.user = user;
        this.name = name || "";
        this.score = 10;

        // Pick a random color
        this.color = Constants.COLORS[Utilities.getRandomInt(0, Constants.COLORS.length)];

        // Set radius
        this.radius = Constants.PLAYER_INITIAL_RADIUS;

        // Generate random normalized position
        this.x = -0.88;//position.x;
        this.y = position.y;

        // Set initial movement velocity and angle
        this.velocity = Constants.PLAYER_INITIAL_SPEED;
        this.angle = 0;

        // Set synchronization properties
        this.lastAngleTimestamp = Date.now();
        this.lastReceivedAngleID = -1;
        this.forcePosition = false;
        this.lastForcePositionTime = 0;
    }

    /**
     * Returns the player's static information (i.e. name, color, ..etc).
     *
     * @returns Object
     */
    getStaticInfo() {
        return {
            id: this.id,
            name: this.name,
            color: this.color
        };
    }

    /**
     * Returns the player's graphics information needed for client rendering.
     *
     * @returns Object
     */
    getGraphicsInfo(current) {
        return {
            score: this.score,
            radius: this.radius,
            x: this.x,
            y: this.y,
            velocity: this.velocity,
            angle: this.angle,
            lag: current - this.lastAngleTimestamp
        };
    }

    /**
     * Returns the player's sync information needed for server-client synchronization.
     *
     * @returns Object
     */
    getSyncInfo() {
        return {
            lastReceivedAngleID: this.lastReceivedAngleID,
            forcePosition: this.forcePosition
        };
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
        let lastAngleTimestamp = this.lastAngleTimestamp;
        this.lastAngleTimestamp = anglesBuffer.timestamp;
        this.lastReceivedAngleID = anglesBuffer.id;

        // Check if force position signal is received by the user before overriding it here
        if (this.forcePosition && this.lastForcePositionTime > lastSendRoomStatusTime) {
            return false;
        }

        // Check if the sent timestamp is in the future
        if (anglesBuffer.timestamp > Date.now()) {
            return false;
        }

        // Check for the number of sent angles and if they could occur
        // in this delta time (since last send)
        // keeping room for one extra angle due to time functions differences.
        let delta = (anglesBuffer.timestamp - lastAngleTimestamp);
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
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= this.radius + obj.radius)
            return false;

        // Circle Circle intersection By @SharkMan201
        let theta = 2 * Math.acos((this.radius * this.radius + distance * distance - obj.radius * obj.radius)
            / (2 * this.radius * distance));
        let phi = 2 * Math.acos((obj.radius * obj.radius + distance * distance - this.radius * this.radius)
            / (2 * obj.radius * distance));
        let intersectedArea = ((this.radius * this.radius) / 2) * (theta - Math.sin(theta))
            + ((obj.radius * obj.radius) / 2) * (phi - Math.sin(phi));

        let otherPlayerArea = Math.acos(-1) * obj.radius * obj.radius;

        return intersectedArea >= 0.75 * otherPlayerArea;
    }

    /**
     * Eats the given object and update the player's
     * radius, velocity, and score in accordance.
     *
     * @param obj       the object to eat (gem, or other player)
     * @param factor    indicates if the player's score to be increased (gem/player) or decreased(trap)
     */
    eat(obj, factor = 1) {
        // Increment player's score
        this.score += (obj.score || 1) * factor;

        // Area(new) = Area(old) + Area(obj)
        this.radius = Math.sqrt(this.radius * this.radius + obj.radius * obj.radius * factor);

        // Update player's velocity
        this.velocity = Math.max(
            Constants.PLAYER_MIN_SPEED,
            Constants.PLAYER_INITIAL_SPEED - 0.00291 * this.radius * factor
        );

        // Save user's highest score
        if (this.user && this.score > this.user.highScore) {
            User.update(
                {_id: this.user._id},
                {highScore: this.score},
                {multi: true},
                function (err, count) {
                }
            );
        }
    }
}

module.exports = Player;
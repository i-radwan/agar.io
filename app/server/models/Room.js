// Imports
const Constants = require("../utils/Constants")();
const Utilities = require("../utils/Utilities")();
const Gem = require("./Gem");
const Player = require("./Player");
const QuadTree = require("../utils/QuadTree");
const Rectangle = require("../utils/Rectangle");


class Room {

    /**
     * Room model constructor.
     *
     * @param id    room unique id
     */
    constructor(id) {
        // Room id
        this.id = id;

        // Room objects
        this.players = {};
        this.gems = {};

        // Next available gems & player ids
        this.nextGemID = 0;
        this.nextPlayerID = 0;

        // The newly added and deleted gems
        this.newGems = {};
        this.deletedGemsIDs = [];

        // Create a quad tree to carry gems
        //let quadTree = new QuadTree(0, new Rectangle(0, 0, Constants.GAME_SIZE, Constants.GAME_SIZE));

        // Add default gems
        this.addGems();
    }

    /**
     * Adds a new player to the room.
     *
     * @returns {Player}    the newly added player
     */
    addPlayer() {
        // TODO @Samir55 select using quad trees
        let player = new Player(this.nextPlayerID);
        return this.players[this.nextPlayerID++] = player;
    };

    /**
     * Adds gems to the room.
     */
    addGems() {
        for (let i = Object.keys(this.gems).length; i < Constants.ROOM_MAX_GEMS; ++i) {
            this.gems[this.nextGemID] = new Gem(this.nextGemID);
            this.newGems[this.nextGemID] = this.gems[this.nextGemID];
            this.nextGemID++;
        }
    };

    /**
     * Simulate single player
     */
    simulatePlayer(playerID, anglesBuffer) {
        let player = this.players[playerID];

        let lastAngleTimeStamp = player.lastAngleTimeStamp;
        player.lastReceivedAngleID = anglesBuffer.id;
        player.lastAngleTimeStamp = anglesBuffer.timestamp;

        if (player.forcePosition = !this.checkAngles(anglesBuffer, lastAngleTimeStamp)) {
            return;
        }

        // Update physics using all received angles
        for (let i = 0; i < anglesBuffer.angles.length; i++) {
            // Set user angle
            this.setPlayerAngle(playerID, anglesBuffer.angles[i]);

            // Move player
            player.movePlayer();

            // Check gem eaten & update score of the player
            this.checkIfPlayerAteGem(player);

            // Check player eaten & update score of the player
            this.checkIfPlayerAtePlayer(player);
        }
    };

    checkAngles(anglesBuffer, lastAngleTimeStamp) {
        // Check if the sent timestamp is in the future
        // TODO: what about different timezones?
        if (anglesBuffer.timestamp > Date.now()) {
            return false;
        }

        // Check for # of sent angles and if they could occur in this delta time(since last send)
        // keeping room for time functions differences (1 extra angle)
        let expectedAnglesCount = Math.ceil((anglesBuffer.timestamp - lastAngleTimeStamp) / Constants.UPDATE_PHYSICS_THRESHOLD);

        return (expectedAnglesCount >= anglesBuffer.angles.length - 1);
    };

    checkIfPlayerAteGem(player) {
        for (let gemID in this.gems) {
            let gem = this.gems[gemID];

            if (Room.playerAteGem(player, gem)) {
                this.removeGem(player.id, gemID);
            }
        }
    };

    checkIfPlayerAtePlayer(player) {
        for (let playerBID in this.players) {
            if (!this.players.hasOwnProperty(playerBID) || playerBID === player.id) continue;

            let playerB = this.players[playerBID];
            if (!playerB.alive) continue;

            if (Room.playerAtePlayer(player, playerB)) {
                player.incrementScore(playerB.score);
                this.killPlayer(playerB.id);
            }
            else if (Room.playerAtePlayer(playerB, player)) {
                playerB.incrementScore(playerB.score);
                this.killPlayer(player.id);
            }
        }
    };

    /**
     * Eat gems
     */
    removeGem(playerID, gemID) {
        delete this.gems[gemID];

        this.deletedGemsIDs.push(gemID);

        // Update player's score
        let player = this.players[playerID];
        player.incrementScore(1);
    };

    /**
     * Kill player
     *
     * @param playerID
     */
    killPlayer(playerID) {
        delete this.players[playerID];
    };

    /**
     * Get current game status
     *
     * @param firstTime indicates new player joining the room
     * @returns {{_id: *, Players: *, newGems: ( []|*), deletedGemsIDs: Array}}
     */
    getGameStatus(firstTime) {
        let gameStatus = {
            _id: this.id,
            players: this.players,
            newGems: (firstTime ? this.gems : this.newGems),
            deletedGemsIDs: this.deletedGemsIDs,
        };

        gameStatus = JSON.stringify(gameStatus);

        if (firstTime) return gameStatus;

        this.deletedGemsIDs = [];
        this.newGems = {};

        return gameStatus;
    }

    /**
     * Get players count
     *
     * @returns {Number}
     */
    getPlayersCount() {
        return Object.keys(this.players).length;
    }

    /**
     * Check whether the player is alive or not
     *
     * @param playerID
     * @returns {boolean}
     */
    isPlayerAlive(playerID) {
        if (!this.players.hasOwnProperty(playerID)) return false;

        return this.players[playerID].alive;
    }

    /**
     * Update player angle
     *
     * @param playerID
     * @param angle
     */
    setPlayerAngle(playerID, angle) {
        if (!this.players.hasOwnProperty(playerID)) return;

        this.players[playerID].angle = angle;
    }

    /**
     * Check if a gem has been eaten by a player
     *
     * @param gem the gem object
     * @param player the player object
     * @returns {boolean} true when the gem is in the player's blob and false otherwise
     */
    static playerAteGem(player, gem) {
        return (player.x - gem.x) * (player.x - gem.x) + (player.y - gem.y) * (player.y - gem.y) <= (player.radius + gem.radius) * (player.radius + gem.radius);
    }

    /**
     * Check whether playerA has eaten playerB
     *
     * @param playerA
     * @param playerB
     * @returns {boolean}
     */
    static playerAtePlayer(playerA, playerB) {
        let distanceSquared = Utilities.distanceSquared(
            {x: playerA.x, y: playerA.y},
            {x: playerB.x, y: playerB.y}
        );

        let radiiSum = playerA.radius + playerB.radius;
        let radiiSumSquared = radiiSum * radiiSum;

        return radiiSumSquared - distanceSquared > Constants.EPSILON &&
            playerA.getArea() - 1.1 * playerB.getArea() > Constants.EPSILON;
    }
}

module.exports = Room;

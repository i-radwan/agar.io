// Imports
const Constants = require("../utils/Constants")();
const Utilities = require("../utils/Utilities");
const Gem = require("./Gem");
const Player = require("./Player");
const QuadTree = require("../utils/QuadTree");
const Rectangle = require("../utils/Rectangle");


class Room {

    // TODO @Samir55 select using quad trees

    /**
     * Room model constructor.
     *
     * @param id    room unique id
     */
    constructor(id) {
        // Room id
        this.id = id;

        // Room Players
        this.players = {};
        this.playersCount = 0;
        this.nextPlayerID = 0;

        // Room gems
        this.gems = {};
        this.gemsCount = 0;
        this.nextGemID = 0;

        // The newly added and deleted gems
        this.newGems = {};
        this.deletedGemsIDs = [];

        // Create a quad tree to carry gems
        let quadTree = new QuadTree(0, new Rectangle(0, 0, Constants.GAME_SIZE, Constants.GAME_SIZE));

        // Add default gems
        this.addGems();
    }

    /**
     * Adds a new player to the room.
     *
     * @returns {Player}    the newly added player
     */
    addPlayer() {
        let player = new Player(this.nextPlayerID);

        this.players[this.nextPlayerID++] = player;
        this.playersCount++;

        return player;
    };

    /**
     * Adds gems to the room.
     */
    addGems() {
        while (this.gemsCount < Constants.ROOM_MAX_GEMS) {
            this.gems[this.nextGemID] = this.newGems[this.nextGemID] = new Gem(this.nextGemID);
            this.gemsCount++;
            this.nextGemID++;
        }
    };

    /**
     * Simulate single player
     */
    simulatePlayer(playerID, anglesBuffer) {
        let player = this.players[playerID];

        // Check if forcePosition is received by the user before overriding it here
        // This was a huge breach
        if (player.forcePosition && player.lastForcePositionTime > this.lastSendRoomStatusTime)
            return;

        // Update user parameters
        let lastAngleTimeStamp = player.lastAngleTimeStamp;
        player.lastReceivedAngleID = anglesBuffer.id;
        player.lastAngleTimeStamp = anglesBuffer.timestamp;

        // Check for hacking
        if (player.forcePosition = !this.checkAngles(anglesBuffer, lastAngleTimeStamp)) {
            player.lastForcePositionTime = Date.now();
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

            if (player.ateGem(gem)) {
                player.incrementScore(1);
                this.removeGem(player.id, gemID);
            }
        }
    };

    checkIfPlayerAtePlayer(player) {
        for (let playerID in this.players) {
            let foe = this.players[playerID];

            if (!this.players.hasOwnProperty(playerID) || playerID === player.id || !foe.alive) {
                continue;
            }

            if (player.atePlayer(foe)) {
                player.incrementScore(foe.score);
                this.killPlayer(foe.id);
                return;
            }

            if (foe.atePlayer(player)) {
                foe.incrementScore(player.score);
                this.killPlayer(player.id);
                return;
            }
        }
    };

    /**
     * Eat gems
     */
    removeGem(playerID, gemID) {
        this.deletedGemsIDs.push(gemID);
        this.gemsCount--;
        delete this.gems[gemID];
    };

    /**
     * Kill player
     *
     * @param playerID
     */
    killPlayer(playerID) {
        this.playersCount--;
        delete this.players[playerID];
    };

    /**
     * Get current game status
     *
     * @param firstTime indicates new player joining the room
     * @returns {{_id: *, Players: *, newGems: ( []|*), deletedGemsIDs: Array}}
     */
    getGameStatus(firstTime) {
        this.lastSendRoomStatusTime = Date.now();

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
        return this.playersCount;
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
}

module.exports = Room;

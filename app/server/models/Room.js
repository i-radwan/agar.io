// Imports
const Constants = require("../utils/Constants")();
const Utilities = require("../utils/Utilities");
const Player = require("./Player");
const Gem = require("./Gem");
const Trap = require("./Trap");

class Room {

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
        this.playersStaticInfo = {};
        this.newPlayersStaticInfo = {};
        this.playersCount = 0;

        // Room gems
        this.gems = {};
        this.newGems = {};
        this.deletedGemsIDs = [];
        this.gemsCount = 0;
        this.nextGemID = 0;

        // Room traps
        this.traps = {};
        this.newTraps = {};
        this.deletedTrapsIDs = [];
        this.trapsCount = 0;
        this.nextTrapID = 0;

        // Add default gems
        this.generateGems();

        // Add default traps
        this.generateTraps();
    }

    /**
     * Simulates the movements of the given player based on the received angles sequence.
     *
     * @param id            the player id to simulate
     * @param anglesBuffer  the received player angles sequence buffer
     * @param callback      a callback function to be called when a player got eaten
     */
    simulatePlayer(id, anglesBuffer, callback) {
        let player = this.players[id];

        // Return if invalid angles was received
        if (player.forcePosition = !player.validateSyncParams(anglesBuffer, this.lastSendRoomStatusTime)) {
            player.lastForcePositionTime = Date.now(); // ToDo this shouldn't be here
            return;
        }

        // Simulate every player received angle
        for (let i = 0; i < anglesBuffer.angles.length; i++) {
            // Set player angle then move.
            player.angle = anglesBuffer.angles[i];
            player.movePlayer();

            // Check gem eaten & update score of the player
            this.eatOverlappingGems(player);

            // Check player eaten & update score of the player
            this.eatOverlappingPlayers(player, callback);

            // Check if player hit a trap
            this.eatOverlappingTraps(player);
        }
    };

    /**
     * Feeds any of the overlapping room gems to the given player.
     *
     * @param player    the player to feed
     */
    eatOverlappingGems(player) {
        for (let gemID in this.gems) {
            let gem = this.gems[gemID];

            if (player.canEat(gem)) {
                player.eat(gem);
                this.removeGem(gemID);
            }
        }
    };

    /**
     * Decreases player score as he hits a trap.
     *
     * @param player    the player to feed
     */
    eatOverlappingTraps(player) {
        for (let trapID in this.traps) {
            let trap = this.traps[trapID];

            if (player.score > 5 && player.canEat(trap)) {
                player.eat(trap, -1);
                this.removeTrap(trapID);
            }
        }
    };

    /**
     * Feeds any of the overlapping room players to the given player.
     *
     * @param player    the player to feed
     * @param callback  a callback function to be called when a player got eaten
     */
    eatOverlappingPlayers(player, callback) {
        for (let id in this.players) {
            if (id === player.id) {
                continue;
            }

            let foePlayer = this.players[id];

            // I was eaten
            if (foePlayer.canEat(player)) {
                callback(player.id);
                foePlayer.eat(player);
                this.removePlayer(player.id);
                return;
            }

            // I ate another player
            if (player.canEat(foePlayer)) {
                callback(foePlayer.id);
                player.eat(foePlayer);
                this.removePlayer(foePlayer.id);
            }
        }
    };

    /**
     * Adds a new player to the room.
     *
     * @param id            the player id to add
     * @param user          the user model id of the given player
     * @param name          the player name
     * @returns {Player}    the newly added player
     */
    addPlayer(id, user, name) {
        // Get a random position for a player.
        let player = new Player(id, user, name, this.getEmptyPosition());

        this.players[id] = player;
        this.playersStaticInfo[id] = this.newPlayersStaticInfo[id] = player.getStaticInfo();

        this.playersCount++;

        return player;
    };

    /**
     * Removes the given player from the room.
     *
     * @param id    the player id to be removed
     */
    removePlayer(id) {
        this.playersCount--;

        delete this.players[id];
        delete this.playersStaticInfo[id];
        delete this.newPlayersStaticInfo[id];
    };

    /**
     * Generates new gems to the room.
     */
    generateGems() {
        while (this.gemsCount < Constants.ROOM_MAX_GEMS) {
            this.gems[this.nextGemID] = this.newGems[this.nextGemID] = new Gem(this.nextGemID, this.getEmptyPosition());
            this.gemsCount++;
            this.nextGemID++;
        }
    };

    /**
     * Removes the given gem from the room.
     *
     * @param id the gem id to be removed
     */
    removeGem(id) {
        this.deletedGemsIDs.push(id);
        this.gemsCount--;
        delete this.gems[id];
    };

    /**
     * Generates new traps to the room.
     */
    generateTraps() {
        while (this.trapsCount < Constants.ROOM_MAX_TRAPS) {
            this.traps[this.nextTrapID] = this.newTraps[this.nextTrapID] = new Trap(this.nextTrapID, this.getEmptyPosition());
            this.trapsCount++;
            this.nextTrapID++;
        }
    };

    /**
     * Removes the given trap from the room.
     *
     * @param id the trap id to be removed
     */
    removeTrap(id) {
        this.deletedTrapsIDs.push(id);
        this.trapsCount--;
        delete this.traps[id];
    };

    /**
     * Returns players' graphics information.
     *
     * @returns {Array} array of players' graphics info
     */
    getPlayersGraphicsInfo() {
        let current = Date.now();
        let ret = {};
        for (let key in this.players) {
            ret[key] = this.players[key].getGraphicsInfo(current);
        }

        return ret;
    }

    /**
     * Returns a object holding all room game status.
     *
     * @returns Object  game status
     */
    getInitialRoomStatus() {
        this.lastSendRoomStatusTime = Date.now();

        return {
            players: this.getPlayersGraphicsInfo(),
            newPlayers: this.playersStaticInfo,
            newGems: this.gems,
            deletedGemsIDs: [],
            newTraps: this.traps,
            deletedTrapsIDs: []
        };
    }

    /**
     * Returns a object holding the game changes in the room since last send.
     *
     * @returns Object  game status
     */
    getChangedRoomStatus() {
        this.lastSendRoomStatusTime = Date.now();

        let gameStatus = {
            now: this.lastSendRoomStatusTime,
            players: this.getPlayersGraphicsInfo(),
            newPlayers: this.newPlayersStaticInfo,
            newGems: this.newGems,
            deletedGemsIDs: this.deletedGemsIDs,
            newTraps: this.newTraps,
            deletedTrapsIDs: this.deletedTrapsIDs
        };

        // Reset new players and new gems
        this.newPlayersStaticInfo = {};
        this.newGems = {};
        this.deletedGemsIDs = [];
        this.newTraps = {};
        this.deletedTrapsIDs = [];

        return gameStatus;
    }

    /**
     * Returns an empty position in the game.
     *
     * @return Object a free position, or (0, 0) in case of exceeding maximum iteration limit
     */
    getEmptyPosition() {
        let cnt = Constants.MAX_ITERATIONS_LIMIT;

        while (cnt--) {
            let pos = {
                x: Utilities.getRandomFloat(-1, 1),
                y: Utilities.getRandomFloat(-1, 1),
                radius: Constants.PLAYER_INITIAL_RADIUS
            };

            if (this.isEmptyPosition(pos)) {
                return pos;
            }
        }

        return {x: 0, y: 0};
    }

    /**
     * Checks if the given position is empty or not.
     *
     * @param pos the position to check
     */
    isEmptyPosition(pos) {
        for (let id in this.players)
            if (this.players[id].canEat(pos))
                return false;

        return true;
    }
}

module.exports = Room;

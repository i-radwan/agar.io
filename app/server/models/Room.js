// Imports
const Constants = require("../utils/Constants")();
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
        this.players = [];
        this.playersStaticInfo = [];
        this.newPlayersStaticInfo = [];
        this.playersCount = 0;
        this.nextPlayerID = 0;

        // Room gems
        this.gems = {};
        this.newGems = {};
        this.deletedGemsIDs = [];
        this.gemsCount = 0;
        this.nextGemID = 0;

        // Create a quad tree to carry gems
        let quadTree = new QuadTree(0, new Rectangle(0, 0, Constants.GAME_SIZE, Constants.GAME_SIZE));

        // Add default gems
        this.generateGems();
    }

    /**
     * Simulates the movements of the given player based on the received angles sequence.
     *
     * @param playerID      the player id to simulate
     * @param anglesBuffer  the received player angles sequence buffer
     */
    simulatePlayer(playerID, anglesBuffer) {
        let player = this.players[playerID];

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
            this.eatOverlappingPlayers(player);
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
     * Feeds any of the overlapping room players to the given player.
     *
     * @param player    the player to feed
     */
    eatOverlappingPlayers(player) {
        for (let id in this.players) {
            if (id === player.id) {
                continue;
            }

            let foePlayer = this.players[id];

            // I was eaten
            if (foePlayer.canEat(player)) {
                foePlayer.eat(player);
                this.removePlayer(player.id);
                return;
            }

            // I ate another player
            if (player.canEat(foePlayer)) {
                player.eat(foePlayer);
                this.removePlayer(foePlayer.id);
            }
        }
    };

    /**
     * Checks whether the player is alive or not.
     *
     * @param playerID      the id of the player to check
     * @returns {boolean}   true if the given player is alive, false otherwise
     */
    isPlayerAlive(playerID) {
        return this.players.hasOwnProperty(playerID);
    }

    /**
     * Adds a new player to the room.
     *
     * @returns {Player}    the newly added player
     */
    addPlayer() {
        let player = new Player(this.nextPlayerID);

        this.players[this.nextPlayerID++] = player;
        this.playersStaticInfo[player.id] = this.newPlayersStaticInfo[player.id] = player.getStaticInfo();

        this.playersCount++;

        return player;
    };

    /**
     * Removes the given player from the room.
     *
     * @param playerID      the player id to be removed
     */
    removePlayer(playerID) {
        this.playersCount--;

        delete this.players[playerID];
        delete this.playersStaticInfo[playerID];
        delete this.newPlayersStaticInfo[playerID];
    };

    /**
     * Generates new gems to the room.
     */
    generateGems() {
        while (this.gemsCount < Constants.ROOM_MAX_GEMS) {
            this.gems[this.nextGemID] = this.newGems[this.nextGemID] = new Gem(this.nextGemID);
            this.gemsCount++;
            this.nextGemID++;
        }
    };

    /**
     * Removes the given gem from the room.
     *
     * @param gemID the gem id to be removed
     */
    removeGem(gemID) {
        this.deletedGemsIDs.push(gemID);
        this.gemsCount--;
        delete this.gems[gemID];
    };

    /**
     * Returns players' graphics information.
     *
     * @returns {Array} array of players' graphics info
     */
    getPlayersGraphicsInfo() {
        let ret = [];

        for (let key in this.players) {
            ret[key] = this.players[key].getGraphicsInfo();
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

        let gameStatus = {
            players: this.getPlayersGraphicsInfo(),
            newPlayers: this.playersStaticInfo,
            newGems: this.gems,
            deletedGemsIDs: []
        };

        return gameStatus;
    }

    /**
     * Returns a object holding the game changes in the room since last send.
     *
     * @returns Object  game status
     */
    getChangedRoomStatus() {
        this.lastSendRoomStatusTime = Date.now();

        let gameStatus = {
            players: this.getPlayersGraphicsInfo(),
            newPlayers: this.newPlayersStaticInfo,
            newGems: this.newGems,
            deletedGemsIDs: this.deletedGemsIDs
        };

        this.newPlayersStaticInfo = {};
        this.newGems = {};
        this.deletedGemsIDs = [];

        return gameStatus;
    }
}

module.exports = Room;

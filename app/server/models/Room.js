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
     * Adds new gems to the room.
     */
    addGems() {
        while (this.gemsCount < Constants.ROOM_MAX_GEMS) {
            this.gems[this.nextGemID] = this.newGems[this.nextGemID] = new Gem(this.nextGemID);
            this.gemsCount++;
            this.nextGemID++;
        }
    };

    /**
     * Simulates the movements of the given player based on the received angles sequence.
     *
     * @param playerID      the player id to simulate
     * @param anglesBuffer  the received player angles sequence buffer
     */
    simulatePlayer(playerID, anglesBuffer) {
        let player = this.players[playerID];

        // Return if invalid angles was received
        if (player.forcePosition = !player.validateSyncParams(anglesBuffer)) {
            return;
        }

        // Simulate every player received angle
        for (let i = 0; i < anglesBuffer.angles.length; i++) {
            // Set player angle then move.
            player.angle = anglesBuffer.angles[i];
            player.movePlayer();

            // Check gem eaten & update score of the player
            this.checkIfPlayerAteGem(player);

            // Check player eaten & update score of the player
            this.checkIfPlayerAtePlayer(player);
        }
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
        for (let id in this.players) {
            if (id === player.id) {
                continue;
            }

            let foePlayer = this.players[id];

            // I was eaten
            if (foePlayer.atePlayer(player)) {
                foePlayer.incrementScore(player.score);
                this.killPlayer(player.id);
                return;
            }

            // I ate another player
            if (player.atePlayer(foePlayer)) {
                player.incrementScore(foePlayer.score);
                this.killPlayer(foePlayer.id);
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
     * Checks whether the player is alive or not.
     *
     * @param playerID      the id of the player to check
     * @returns {boolean}   true if the given player is alive, false otherwise
     */
    isPlayerAlive(playerID) {
        return this.players.hasOwnProperty(playerID);
    }

    /**
     * Returns a JSON string holding all room game status.
     *
     * @returns {string}
     */
    getInitialRoomStatus() {
        let gameStatus = {
            room_id: this.id,
            players: this.players,
            newGems: this.gems,
            deletedGemsIDs: this.deletedGemsIDs,
        };

        return JSON.stringify(gameStatus);
    }

    /**
     * Returns a JSON string holding the game changes in the room since last send.
     *
     * @returns {string}
     */
    getChangedRoomStatus() {
        let gameStatus = {
            players: this.players,
            newGems: this.newGems,
            deletedGemsIDs: this.deletedGemsIDs,
        };

        this.newGems = {};
        this.deletedGemsIDs = [];

        return JSON.stringify(gameStatus);
    }
}

module.exports = Room;

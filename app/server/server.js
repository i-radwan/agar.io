// Imports
const Constants = require("./utils/Constants")();
const Room = require("./models/Room");

class GameServer {

    /**
     * Game server constructor.
     *
     * @param io    socket io object used in communication with clients
     */
    constructor(io) {
        this.io = io;

        // Map from player id to his room id
        this.playerRoomId = {};

        // Game rooms
        this.rooms = {};
        this.nextRoomID = 0;
    }

    /**
     * Initializes game server and registers event listeners.
     */
    init() {
        let self = this;

        //
        // Register event listeners
        //
        self.io.on('connection', function (socket) {
            // Add new player to a room upon receiving connection event
            socket.on('subscribe', function () {
                socket.join(self.addNewPlayer(socket.id));
                console.log("a player connected", socket.id);
            });

            // Updates player's angle
            socket.on('angle', function (anglesBuffer) {
                self.updatePlayerPosition(socket.id, anglesBuffer);
            });

            // Remove player on disconnection
            socket.on('disconnect', function () {
                self.removePlayer(socket.id);
                console.log("a player disconnected", socket.id);
            });
        });

        //
        // Register callback functions to be called every specific interval of time
        //
        setInterval(self.sendRoomsGameStatus.bind(self), Constants.SEND_GAME_STATUS_RATE);
        setInterval(self.regenerateGems.bind(self), Constants.REGENERATE_GEMS_RATE);
    };

    /**
     * Assigns the newly connected player to a room and
     * send him back its game status
     *
     * @param playerID      the player socket id
     * @returns {number}    the room id that the player was assigned to
     */
    addNewPlayer(playerID) {
        let roomID = this.getAvailableRoom();

        let room = this.rooms[roomID];
        let player = room.addPlayer(playerID);

        this.playerRoomId[playerID] = roomID;

        this.sendInitialGameStatus(player, room);

        return roomID;
    };

    /**
     * Searches for the first available room with free slot
     * to assign for the newly connect player.
     * If no rooms are available then creates a new one.
     *
     * @returns {number}        the room id
     */
    getAvailableRoom() {
        // Search for any room having a free slot
        for (let i in this.rooms) {
            let room = this.rooms[i];

            if (room.playersCount < Constants.ROOM_MAX_PLAYERS) {
                return room.id;
            }
        }

        // All rooms are full, create a new one
        let id = this.nextRoomID++;
        this.rooms[id] = new Room(id);

        return id;
    }

    /**
     * Updates the given player's position by simulating his movement
     * by the given sequence of angles.
     *
     * @param playerID      the player socket id
     * @param anglesBuffer  a sequence of angles to move the player with
     */
    updatePlayerPosition(playerID, anglesBuffer) {
        if (!this.playerRoomId.hasOwnProperty(playerID)) return;

        // Get ids
        let roomID = this.playerRoomId[playerID];

        // Simulate player movements based on the received angles sequence
        if (this.rooms[roomID].isPlayerAlive(playerID)) {
            this.rooms[roomID].simulatePlayer(playerID, anglesBuffer);
        }
    };

    /**
     * Removes the given player from his room when he disconnecting.
     *
     * @param playerID  the player socket id
     */
    removePlayer(playerID) {
        if (!this.playerRoomId.hasOwnProperty(playerID)) return;

        // Get room id
        let roomID = this.playerRoomId[playerID];

        // Remove player from his room
        if (this.rooms[roomID].isPlayerAlive(playerID)) {
            this.rooms[roomID].removePlayer(playerID);
        }

        // Remove player entry from map
        // delete this.playersMap[playerSocketID];

        // Remove room if this was the last player
        // if (this.rooms[roomID].playersCount === 0) {
        //     delete this.rooms[roomID];
        // }
    };

    /**
     * Sends the information of the newly connected player
     * along with the game status of his assigned room.
     *
     * @param player    the player to send the game status to
     * @param room      the room assigned to the player
     */
    sendInitialGameStatus(player, room) {
        let status = room.getInitialRoomStatus();

        status.meId = player.id;
        status.serverTimestamp = player.lastAngleTimeStamp;

        this.io.to(player.id).emit('initial_game_status', status);
    };

    /**
     * Sends the game status of all game rooms
     * every specific interval of time.
     */
    sendRoomsGameStatus() {
        // Loop over all game rooms and send game status
        for (let i in this.rooms) {
            let room = this.rooms[i];
            let players = room.players;
            let status = room.getChangedRoomStatus();

            for (let j in players) {
                let player = players[j];

                status.sync = player.getSyncInfo();

                this.io.to(player.id).emit('game_status', status);
            }
        }
    };

    /**
     * Regenerates the gems of all game rooms
     * every specific interval of time.
     */
    regenerateGems() {
        // Loop over all game rooms and regenerate gems
        for (let i in this.rooms) {
            this.rooms[i].generateGems();
        }
    };
}

module.exports = GameServer;
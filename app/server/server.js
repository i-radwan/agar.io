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
                let session = socket.handshake.session;

                self.addNewPlayer(socket.id, session.user, session.name);
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
     * @param id        the player socket id
     * @param user      the user model id of the given player
     * @param name      the player name to be displayed
     */
    addNewPlayer(id, user, name) {
        let room = this.getAvailableRoom();
        let player = room.addPlayer(id, user, name);

        this.playerRoomId[id] = room.id;

        this.sendInitialGameStatus(player, room);
    };

    /**
     * Removes the given player from his room when he disconnecting.
     *
     * @param id  the player socket id
     */
    removePlayer(id) {
        if (!this.playerRoomId.hasOwnProperty(id)) return;

        // Get room id
        let roomID = this.playerRoomId[id];

        // Remove player from his room
        if (this.rooms[roomID].isPlayerAlive(id)) {
            this.rooms[roomID].removePlayer(id);
        }

        // Remove player entry from map
        // delete this.playersMap[playerSocketID];

        // Remove room if this was the last player
        // if (this.rooms[roomID].playersCount === 0) {
        //     delete this.rooms[roomID];
        // }
    };

    /**
     * Updates the given player's position by simulating his movement
     * by the given sequence of angles.
     *
     * @param id            the player socket id
     * @param anglesBuffer  a sequence of angles to move the player with
     */
    updatePlayerPosition(id, anglesBuffer) {
        if (!this.playerRoomId.hasOwnProperty(id)) return;

        // Get ids
        let roomID = this.playerRoomId[id];

        // Simulate player movements based on the received angles sequence
        if (this.rooms[roomID].isPlayerAlive(id)) {
            this.rooms[roomID].simulatePlayer(id, anglesBuffer);
        }
    };

    /**
     * Searches for the first available room with free slot
     * to assign for the newly connect player.
     * If no rooms are available then creates a new one.
     *
     * @returns {Room}        the first available room
     */
    getAvailableRoom() {
        // Search for any room having a free slot
        for (let i in this.rooms) {
            let room = this.rooms[i];

            if (room.playersCount < Constants.ROOM_MAX_PLAYERS) {
                return room;
            }
        }

        // All rooms are full, create a new one
        let id = this.nextRoomID++;
        return this.rooms[id] = new Room(id);
    }

    /**
     * Sends the information of the newly connected player
     * along with the game status of his assigned room.
     *
     * @param player    the player to send the game status to
     * @param room      the room assigned to the player
     */
    sendInitialGameStatus(player, room) {
        // Get initial room status
        let status = room.getInitialRoomStatus();

        // Attach player-specific data
        status.meId = player.id;
        status.serverTimestamp = player.lastAngleTimestamp;

        // Send status to the player
        this.io.to(player.id).emit('initial_game_status', status);
    };

    /**
     * Sends the game status of all game rooms
     * every specific interval of time.
     */
    sendRoomsGameStatus() {
        for (let i in this.rooms) {
            let room = this.rooms[i];
            let status = room.getChangedRoomStatus();

            // Loop on every player in the i-th room
            for (let id in room.players) {
                status.sync = room.players[id].getSyncInfo();
                this.io.to(id).emit('game_status', status);
            }
        }
    };

    /**
     * Regenerates the gems of all game rooms
     * every specific interval of time.
     */
    regenerateGems() {
        for (let i in this.rooms) {
            this.rooms[i].generateGems();
        }
    };
}

module.exports = GameServer;
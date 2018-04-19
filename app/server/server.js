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

        // Map from player socket id to a pair of room id and player id in his assigned room
        this.playersMap = {};

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
                console.log("a player connected");
            });

            // Updates player's angle
            socket.on('angle', function (anglesBuffer) {
                self.updatePlayerPosition(socket.id, anglesBuffer);
            });

            // Remove player on disconnection
            socket.on('disconnect', function () {
                self.removePlayer(socket.id);
                console.log("a player disconnected");
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
     * @param playerSocketID    the player socket id
     * @returns {number}        the room id that the player was assigned to
     */
    addNewPlayer(playerSocketID) {
        let roomID = this.getAvailableRoom();

        let player = this.rooms[roomID].addPlayer();
        let playerID = player.id;
        this.playersMap[playerSocketID] = {roomID, playerID};

        this.sendInitialGameStatus(playerSocketID, playerID, roomID, player.lastAngleTimeStamp);

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
     * Sends the information of the newly connected player
     * along with the game status of his assigned room.
     *
     * @param playerSocketID    the player socket id
     * @param playerID          the player id in his assigned room
     * @param roomID            the player assigned room id
     * @param timestamp         a reference timestamp needed for synchronization
     */
    sendInitialGameStatus(playerSocketID, playerID, roomID, timestamp) {
        let playerInfo = {
            id: playerID,
            lastReceivedAngleID: -1,
            lastAngleTimeStamp: timestamp
        };

        this.io.to(playerSocketID).emit('player_info', playerInfo);
        this.io.to(playerSocketID).emit('initial_game_status', this.rooms[roomID].getInitialRoomStatus());
    };

    /**
     * Updates the given player's position by simulating his movement
     * by the given sequence of angles.
     *
     * @param playerSocketID    the player socket id
     * @param anglesBuffer      a sequence of angles to move the player with
     */
    updatePlayerPosition(playerSocketID, anglesBuffer) {
        if (!this.playersMap.hasOwnProperty(playerSocketID)) return;

        // Get ids
        let playerID = this.playersMap[playerSocketID].playerID;
        let roomID = this.playersMap[playerSocketID].roomID;

        // Simulate player movements based on the received angles sequence
        if (this.rooms[roomID].isPlayerAlive(playerID)) {
            this.rooms[roomID].simulatePlayer(playerID, anglesBuffer);
        }
    };

    /**
     * Removes the given player from his room when he disconnecting.
     *
     * @param playerSocketID    the player socket id
     */
    removePlayer(playerSocketID) {
        if (!this.playersMap.hasOwnProperty(playerSocketID)) return;

        // Get ids
        let playerID = this.playersMap[playerSocketID].playerID;
        let roomID = this.playersMap[playerSocketID].roomID;

        // Remove player from his room
        if (this.rooms[roomID].isPlayerAlive(playerID)) {
            this.rooms[roomID].killPlayer(playerID);
        }

        // Remove player entry from map
        // delete this.playersMap[playerSocketID];

        // Remove room if this was the last player
        // if (this.rooms[roomID].playersCount === 0) {
        //     delete this.rooms[roomID];
        // }
    };

    /**
     * Sends the game status of all game rooms
     * every specific interval of time.
     */
    sendRoomsGameStatus() {
        // Loop over all game rooms and send game status
        for (let i in this.rooms) {
            let room = this.rooms[i];
            this.io.in(room.id).emit('game_status', room.getChangedRoomStatus());
        }
    };

    /**
     * Regenerates the gems of all game rooms
     * every specific interval of time.
     */
    regenerateGems() {
        // Loop over all game rooms and regenerate gems
        for (let i in this.rooms) {
            this.rooms[i].addGems();
        }
    };
}

module.exports = GameServer;
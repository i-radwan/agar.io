// Imports
const constants = require("./constants")();
const Room = require("./models/Room");


class GameServer {

    /**
     * Game server constructor.
     *
     * @param io    socket io object used in communication with clients
     */
    constructor(io) {
        this.io = io;

        // All game players and all game rooms
        // TODO: delete removed players and empty rooms
        this.gamePlayers = {};  // map from player socket id to a pair of room id and player id in his assigned room
        this.gameRooms = {};

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

            // Add new player to a room upon receiving subscription event
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
            })
        });

        //
        // Register callback functions to be called every specific interval of time
        //
        setInterval(self.sendRoomsGameStatus.bind(self), constants.SEND_GAME_STATUS_RATE);
        setInterval(self.regenerateGems.bind(self), constants.REGENERATE_GEMS_RATE);
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

        let player = this.gameRooms[roomID].addPlayer();
        let playerID = player.id;
        this.gamePlayers[playerSocketID] = {roomID, playerID};

        this.sendGameStatus(playerSocketID, playerID, roomID, player.lastAngleTimeStamp);

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
        for (let i in this.gameRooms) {
            let room = this.gameRooms[i];

            if (room.getPlayersCount() < constants.ROOM_MAX_PLAYERS) {
                return room.id;
            }
        }

        // All rooms are full, create a new one
        let id = this.nextRoomID++;
        this.gameRooms[id] = new Room(id);

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
    sendGameStatus(playerSocketID, playerID, roomID, timestamp) {
        let playerInfo = {
            id: playerID,
            lastReceivedAngleID: -1,
            lastAngleTimeStamp: timestamp
        };

        this.io.to(playerSocketID).emit('player_info', playerInfo);
        this.io.to(playerSocketID).emit('initial_game_status', this.gameRooms[roomID].getGameStatus(true));
    };

    /**
     * Updates the given player's position by simulating his movement
     * by the given sequence of angles.
     *
     * @param playerSocketID    the player socket id
     * @param anglesBuffer      a sequence of angles to move the player with
     */
    updatePlayerPosition(playerSocketID, anglesBuffer) {
        if (!this.gamePlayers.hasOwnProperty(playerSocketID)) return;

        let playerID = this.gamePlayers[playerSocketID].playerID;
        let roomID = this.gamePlayers[playerSocketID].roomID;

        if (this.gameRooms[roomID].isPlayerAlive(playerID)) {
            this.gameRooms[roomID].simulatePlayer(playerID, anglesBuffer);
        }
    };

    /**
     * Removes the given player from his room when he disconnecting.
     *
     * @param playerSocketID    the player socket id
     */
    removePlayer(playerSocketID) {
        if (!this.gamePlayers.hasOwnProperty(playerSocketID)) return;

        let playerID = this.gamePlayers[playerSocketID].playerID;
        let roomID = this.gamePlayers[playerSocketID].roomID;

        if (this.gameRooms[roomID].isPlayerAlive(playerID)) {
            this.gameRooms[roomID].killPlayer(playerID);
        }
    };

    /**
     * Sends the game status of all game rooms
     * every specific interval of time.
     */
    sendRoomsGameStatus() {
        // Loop over all game rooms and send game status
        for (let i in this.gameRooms) {
            let room = this.gameRooms[i];
            this.io.in(room.id).emit('game_status', room.getGameStatus(false));
        }
    };

    /**
     * Regenerates the gems of all game rooms
     * every specific interval of time.
     */
    regenerateGems() {
        // Loop over all game rooms and regenerate gems
        for (let i in this.gameRooms) {
            this.gameRooms[i].addGems();
        }
    };
}

module.exports = GameServer;
/**
 * Created by ASamir on 3/10/18.
 */
let express = require('express');
let app = express();
let path = require('path');
let http = require('http').Server(app);
let io = require('socket.io')(http);

// Game modules
const Room = require("../models/Room");

// Routes
require('../routes/index')(app, express);

function GameServer(gameConfig) {
    let module = {};

    // All game players and all game rooms
    let gamePlayers = {};
    let gameRooms = {};

    let __socket = io;

    let roomsExist = false;
    let nextRoomID = 0;

    module.init = function () {

        __socket.on('connection', function (socket) {

            // Add new player to a room upon receiving subscription message
            socket.on('subscribe', function () {
                roomsExist = true;
                socket.join(module.addNewPlayer(socket.id));
            });

            // Updates player's angle
            socket.on('angle', function (anglesBuffer) {
                module.updatePlayerPosition(socket.id, anglesBuffer);
            });

            // Send player info for the first time he join
            socket.on('player_info', function (newPlayerInfo) {
                module.setNewPlayerInfo(socket.id, newPlayerInfo);
            });

            // Remove player on disconnection
            socket.on('disconnect', function () {
                module.removePlayer(socket.id);
            })

        });

        http.listen(gameConfig.PORT, function () {
            console.log('listening on *: ', gameConfig.PORT);
        });

        // Regenerate game gems
        setInterval(module.regenerateGems, gameConfig.REGENERATE_GEMS_RATE);

        // Send room statuses to clients
        setInterval(module.sendRoomsGameStatuses, gameConfig.SEND_GAME_STATUSES_RATE);

        // Send room leader boards to clients
        // setInterval(module.sendRoomsLeaderBoards, gameConfig.SEND_LEADER_BOARD_RATE);
    };

    module.addNewPlayer = function (playerSocketID) {
        let roomID = -1;

        // Search for any game having a free slot
        for (let room in gameRooms) {
            let gameRoom = gameRooms[room];
            if (gameRoom.getPlayersCount() < gameConfig.ROOM_MAX_PLAYERS) {
                roomID = gameRoom.id;
            }
        }

        if (roomID === -1) {
            // All rooms are full, create a new one
            roomID = nextRoomID++;
            gameRooms[roomID] = new Room(roomID);
        }

        let playerID = gameRooms[roomID].addPlayer();
        gamePlayers[playerSocketID] = {roomID, playerID};

        module.sendPlayerInfo(playerSocketID, playerID, roomID);

        return roomID;
    };

    module.sendPlayerInfo = function (playerSocketID, playerID, roomID) {
        let playerInfo = {};
        playerInfo.id = playerID;

        __socket.to(playerSocketID).emit('player_info', playerInfo);
        __socket.to(playerSocketID).emit('game_status', gameRooms[roomID].getGameStatus());
    };

    module.updatePlayerPosition = function (playerSocketID, anglesBuffer) {
        let playerID = gamePlayers[playerSocketID].playerID;
        let roomID = gamePlayers[playerSocketID].roomID;

        if (gameRooms[roomID].isPlayerAlive(playerID)) {
            gameRooms[roomID].game.players[playerID].lastReceivedAngleID = anglesBuffer.id;
            gameRooms[roomID].simulatePlayer(playerID, anglesBuffer.angles);
        }
    };

    module.setNewPlayerInfo = function (playerSocketID, newPlayerInfo) {
        let playerID = gamePlayers[playerSocketID].playerID;
        let roomID = gamePlayers[playerSocketID].roomID;

        if (gameRooms[roomID].isPlayerAlive(playerID)) {
            gameRooms[roomID].setPlayerInfo(playerID, newPlayerInfo);
        }
    };
    
    module.removePlayer = function (playerSocketID) {
        console.log("a Player Disconnected");

        let playerID = gamePlayers[playerSocketID].playerID;
        let roomID = gamePlayers[playerSocketID].roomID;

        if (gameRooms[roomID].isPlayerAlive(playerID)) {
            gameRooms[roomID].killPlayer(playerID);
        }
    };

    module.sendRoomsGameStatuses = function () {
        // Loop over all game rooms and run simulate
        for (let room in gameRooms) {
            let gameRoom = gameRooms[room];
            __socket.in(gameRoom.id).emit('game_status', gameRoom.getGameStatus());
        }
    };

    module.regenerateGems = function () {
        if (!roomsExist) return;

        // Loop over all game rooms and run simulate
        for (let room in gameRooms) {
            let gameRoom = gameRooms[room];
            gameRoom.addGems();
        }
    };

    module.sendRoomsLeaderBoards = function () {
        // Loop over all game rooms and send leader board
        for (let room in gameRooms) {
            let gameRoom = gameRooms[room];
            __socket.in(gameRoom.id).emit('game_leader_board', gameRoom.getLeaderBoard());
        }
    };

    return module;
}

module.exports = GameServer;

/**
 * Created by ASamir on 3/10/18.
 */
let express = require('express');
let app = express();
let path = require('path');
let http = require('http').Server(app);
let io = require('socket.io')(http);

// Routes
require('../routes/index')(app, express);

const Room = require("../models/Room");

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
            socket.on('angle', function (angle) {
                module.setPlayerAngle(socket.id, angle);
            });

            // Interpolate the server and the client game statuses
            socket.on('game_status', function () {
                module.interpolateGameStatus(socket.id);
            });

        });

        http.listen(gameConfig.port, function () {
            console.log('listening on *:3000');
        });

        setInterval(module.runGameRooms, gameConfig.simulateRunRate);
        setInterval(module.sendRoomsGameStatuses, gameConfig.sendGameStatusesRate);

    };

    module.addNewPlayer = function (playerSocketID) {
        let roomID = -1;

        // Search for any game having a free slot
        for (let room in gameRooms) {
            let gameRoom = gameRooms[room];
            if (gameRoom.getPlayersCount() < gameConfig.roomMaxPlayers) {
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

    module.setPlayerAngle = function (playerSocketID, angle) {
        let playerID = gamePlayers[playerSocketID].playerID;
        let roomID = gamePlayers[playerSocketID].roomID;

        if (gameRooms[roomID].isPlayerAlive(playerID)) {
            gameRooms[roomID].setPlayerAngle(playerID, angle);
        }
    };

    // TODO @Samir55
    module.interpolateGameStatus = function () {

    };

    module.runGameRooms = function () {
        if (!roomsExist) return;

        // Loop over all game rooms and run simulate
        for (let room in gameRooms) {
            let gameRoom = gameRooms[room];
            gameRoom.simulate();
        }
    };

    module.sendRoomsGameStatuses = function () {
        // Loop over all game rooms and run simulate
        for (let room in gameRooms) {
            let gameRoom = gameRooms[room];
            __socket.in(gameRoom.id).emit('game_status', gameRoom.getGameStatus());
        }
    };

    return module;
}

module.exports = GameServer;


let GameConfig = require("../models/GameConfig");

let gameServer = GameServer(GameConfig().gameConfig);

gameServer.init();
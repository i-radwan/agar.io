let express = require('express');
let app = express();
let path = require('path');
let http = require('http').Server(app);
let io = require('socket.io')(http);

const GameController = require("./RoomController");

// Routes
require('../routes/index')(app, express);

const MAX_GAME_PLAYERS = 5;
const SERVER_SIMULATE_REPETITION = 250;

let server = {
    init: function () {

        server.players = {};
        server.rooms = [];

        // Sockets
        io.on('connection', function (socket) {

            socket.on('subscribe', function () {
                socket.emit('game_status', server.assignNewPlayer(socket.id));
            });

            socket.on("angle", function (angle) {
                server.updatePlayerAngle(socket.id, angle);
            })

        });

        http.listen(3000, function () {
            console.log('listening on *:3000');
        });

        // Simulate the rooms every certain time.
        setInterval(server.simulateRooms, SERVER_SIMULATE_REPETITION);

    },

    /**
     * Callback function called when a new player is connected to the game
     */
    assignNewPlayer: function (playerSocketID) {
        let roomID = -1;

        // Search for any game having a free slot
        for (let i = 0; roomID === -1 && i < server.rooms.length; i++) {
            if (server.rooms[i].getGameStatus().players.length < MAX_GAME_PLAYERS) {
                roomID = i;
            }
        }

        if (roomID === -1) {
            // No available rooms, create a room
            roomID = server.rooms.length;
            let newRoom = new GameController(server.rooms.length);

            server.rooms.push(newRoom);
        }

        // Add the new player
        let playerID = server.rooms[roomID].addPlayer();

        server.players[playerSocketID] = {roomID, playerID};

        let gameStatus = server.rooms[roomID].getGameStatus();
        gameStatus.myID = playerID;

        return gameStatus;
    },

    updatePlayerAngle: function (playerSocketID, angle) {
        // Get player game room and his id in the room
        [roomID, playerID] = server.players[playerSocketID];

        // TODO @Samir55 validate player and it's angle

        // Update the player
        server.rooms[roomID].updatePlayerAngle(playerID, angle);
    },
    
    simulateRooms: function () {
        
        for (let i = 0; i < server.rooms.length; i++) {
            server.rooms[i].simulate();
        }
    }

};

// Start server side
server.init();

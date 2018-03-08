let express = require('express');
let app = express();
let path = require('path');
let http = require('http').Server(app);
let io = require('socket.io')(http);

// Routes
require('../routes/index')(app, express);

// Include Room
const GameController = require("./Room");

// Constants
const MAX_GAME_PLAYERS = 5;

// Game rooms
let rooms = [];

// Game players
let players = {};

/**
 * Assign a room to the new player
 * @param playerID the player ID
 * @returns {number} the room ID to which the new player belongs
 */
function assignRoom(playerSocketID) {
    let roomID = -1;

    // Search for any game having a free slot
    for (let i = 0; roomID === -1 && i < rooms.length; i++) {
        if (rooms[i].getGame().players.length < MAX_GAME_PLAYERS) {
            roomID = i;
        }
    }

    if (roomID === -1) {
        // No available rooms, create a room
        roomID = rooms.length;
        let newRoom = new GameController(rooms.length);

        rooms.push(newRoom);
    }

    // Add the new player
    let playerID = rooms[roomID].addPlayer();

    players[playerSocketID] = {roomID, playerID};

    return players[playerSocketID];

}

// Sockets
io.on('connection', function (socket) {

    socket.on('subscribe', function () {
        let {roomID, playerID} = assignRoom(socket.id);

        let gameStatus = rooms[roomID].getGame();
        gameStatus.myID = playerID;

        socket.emit('game_status', gameStatus);
    });

    socket.on('angle', function (angle) {
        //TODO @Samir55 check roomID is defined or not

        // Get player room id
        let roomID = players[socket.id].roomID;

        // rooms[roomID].checkAndApplyAction()
    });


});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

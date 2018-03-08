let express = require('express');
let app = express();
let path = require('path');
let http = require('http').Server(app);
let io = require('socket.io')(http);

// Routes
require('../routes/index')(app, express);

// Include RoomController
const GameController = require("./RoomController");

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

    return roomID;

}

// Sockets
io.on('connection', function (socket) {

    socket.on('newPlayer', function () {
        let roomID = assignRoom(socket.id.toString());
        socket.emit('game_status', rooms[roomID].getGame());
    });

    socket.on('angle', function (angle) {
        //TODO @Samir55 check roomID is defined or not

        // Get player room id
        let roomID = players[socket.id.toString()].roomID;

        console.log(angle);
        // rooms[roomID].checkAndApplyAction()
    });

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

// let express = require('express');
// let app = express();
// let path = require('path');
// let http = require('http').Server(app);
// let io = require('socket.io')(http);
//
// const Room = require("../models/Room");
//
// // Routes
// require('../routes/index')(app, express);
//
// const MAX_GAME_PLAYERS = 5;
// const SERVER_SIMULATE_RATE = 1000 / 120;
// const SERVER_SEND_RATE = 50 ;
//
// let server = {
//     init: function () {
//
//         server.players = {};
//         server.rooms = [];
//
//         // Sockets
//         io.on('connection', function (socket) {
//
//             socket.on('subscribe', function () {
//                 let {roomID, playerID} = server.assignToRoom(socket.id);
//                 console.log(roomID, playerID);
//
//                 socket.join(roomID);
//
//                 let gameStatus = server.rooms[roomID].getGameStatus();
//
//                 // Send new player info , currently player id
//                 let playerInfo = {};
//                 playerInfo.id = playerID;
//                 socket.emit('player_info', playerInfo);
//
//                 // Send to all players in the same room
//                 io.in(roomID).emit('game_status', gameStatus);
//             });
//
//             socket.on("angle", function (angle) {
//                 server.updatePlayerAngle(socket.id, angle);
//
//                 // Send to all players in the same room
//                 // let roomID = server.players[socket.id].roomID;
//                 // io.in(roomID).emit('game_status', server.rooms[roomID].getGameStatus());
//             })
//
//         });
//
//         http.listen(3000, function () {
//             console.log('listening on *:3000');
//         });
//
//         // Simulate the rooms every certain time.
//         setInterval(server.simulateRooms, SERVER_SIMULATE_RATE);
//
//         // Send all game status to all players in each room.
//         setInterval(server.updateRooms, SERVER_SEND_RATE);
//
//     },
//
//     /**
//      * Callback function called when a new player is connected to the game
//      */
//     assignToRoom: function (playerSocketID) {
//         let roomID = -1;
//
//         // Search for any game having a free slot
//         for (let i = 0; roomID === -1 && i < server.rooms.length; i++) {
//             if (server.rooms[i].getGameStatus().players.length < MAX_GAME_PLAYERS) {
//                 roomID = i;
//             }
//         }
//
//         if (roomID === -1) {
//             // No available rooms, create a room
//             roomID = server.rooms.length;
//             let newRoom = new GameController(server.rooms.length);
//
//             server.rooms.push(newRoom);
//         }
//
//         // Add the new player
//         let playerID = server.rooms[roomID].addPlayer();
//         server.players[playerSocketID] = {roomID, playerID};
//
//         return {roomID, playerID};
//     },
//
//     /**
//      *
//      * @param playerSocketID
//      * @param angle
//      */
//     updatePlayerAngle: function (playerSocketID, angle) {
//         // Get player game room and his id in the room
//         let {roomID, playerID} = server.players[playerSocketID];
//
//         server.rooms[roomID].setPlayerAngle(playerID, angle);
//     },
//
//     /**
//      *
//      */
//     simulateRooms: function () {
//         for (let i = 0; i < server.rooms.length; i++) {
//             server.rooms[i].simulate();
//         }
//     },
//
//     /**
//      *
//      */
//     updateRooms: function () {
//         for (let i = 0; i < server.rooms.length; i++) {
//             let roomID = server.rooms[i].id;
//             let gameStatus = server.rooms[roomID].getGameStatus();
//
//             io.in(roomID).emit('game_status', server.rooms[roomID].getGameStatus());
//             // io.in(roomID).emit('leader_board', server.rooms[roomID].getLeaderBoard());
//         }
//
//     }
//
// };
//
// // Start server side
// server.init();

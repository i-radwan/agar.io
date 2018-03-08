// Includes
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Routes
require('../routes/index')(app, express);

// Game status
let gameStatus = {
    rooms: [
        {
            _id: 1,
            myID : 2,
            players: [
                {
                    x: 200,
                    y: 300,
                    velocity: 2,
                    angle: 0.1, // Angle
                    color: "yellow",
                    radius: 30,
                    name: "P1",
                    score: 10,
                    id: 1
                }, {
                    x: 10,
                    y: 20,
                    velocity: 3,
                    angle: 0, // Angle
                    color: "purple",
                    radius: 20,
                    name: "IAR",
                    id: 2,
                    score: 0
                }
            ],
            gems: [
                {
                    x: 1000 / 2.6,
                    y: 1200 / 2.6,
                    color: "blue",
                    radius: 10
                }
            ]
        },
        {
            _id: 2,
            players: [
                {
                    x: 200,
                    y: 300,
                    velocity: 2,
                    angle: 0.1, // Angle
                    color: "yellow",
                    radius: 15,
                    name: "P1",
                    score: 10,
                    id: 1
                }, {
                    x: 10,
                    y: 20,
                    velocity: 3,
                    angle: 0, // Angle
                    color: "purple",
                    radius: 20,
                    name: "IAR",
                    id: 2,
                    score: 0
                }
            ],
            gems: [
                {
                    x: 1000 / 2.6,
                    y: 1200 / 2.6,
                    color: "blue",
                    radius: 10
                },
                {
                    x: 1000 / 1.6,
                    y: 1200 / 2.3,
                    color: "black",
                    radius: 10
                }
            ]
        }]
};

// Sockets
io.on('connection', function (socket) {
    socket.on('subscribe', function (msg) {
        socket.join(1);
        socket.emit('game_status', gameStatus.rooms[0]);

        setTimeout(function () {
            socket.emit('game_status', gameStatus.rooms[1]);
        }, 5000);
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
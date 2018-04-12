// Routes
const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const GameServer = require("./GameServer");

//
// Routing Module
//
// Set static path to provide required assets
app.use(express.static(path.resolve('../client/')));

// Main game screen
app.get('/', function (req, res) {
    res.sendFile(path.resolve('../client/views/index.html'));
});

//
// Game Server Modules
//
// Start http listening

// Start server
let server = new GameServer(http, io);

server.init();
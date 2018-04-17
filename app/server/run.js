// Imports
const constants = require("./constants")();
const gameServer = require("./server");

const express = require('express');
const app = express();
const path = require('path');
const httpServer = require('http').Server(app);
const io = require('socket.io')(httpServer, {
    pingInterval: 500,
    pingTimeout: constants.PING_TIMEOUT,
});


/**
 * The starting main function of the server.
 */
function run() {
    setupRoutes();
    setupServer();
    startServer();
}

/**
 * Registers different routing endpoints.
 */
function setupRoutes() {
    // Set static path to provide required assets
    app.use(express.static(path.resolve('../client/')));

    // Main game screen
    app.get('/', function (req, res) {
        res.sendFile(path.resolve('../client/views/index.html'));
    });
}

/**
 * Setup the server to start listening on a specific port.
 */
function setupServer() {
    // Start listening on port 3000
    httpServer.listen(constants.PORT, function () {
        console.log('listening on *: ', constants.PORT);
    });
}

/**
 * Starts the actual game server.
 */
function startServer() {
    let server = new gameServer(io);
    server.init();
}

//
// Start running the server-side code
//
run();
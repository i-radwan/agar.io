// Imports
const GameServer = require("./server");
const GameConfig = require("./configs")();

const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    pingInterval: 500,
    pingTimeout: GameConfig.PING_TIMEOUT,
});

let game = {
    run: function () {
        this.setupRoutes();
        this.setupServer();
        this.startServer();
    },

    setupRoutes: function () {
        // Set static path to provide required assets
        app.use(express.static(path.resolve('../client/')));

        // Main game screen
        app.get('/', function (req, res) {
            res.sendFile(path.resolve('../client/views/index.html'));
        });
    },

    setupServer: function () {
        // Start http listening
        http.listen(GameConfig.PORT, function () {
            console.log('listening on *: ', GameConfig.PORT);
        });
    },

    startServer: function () {
        let server = new GameServer(io);

        server.init();
    }
};

game.run();
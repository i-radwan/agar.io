export default function (gameStatus) {
    let module = {};
    let socket = io({reconnection: false});

    /**
     * Initializes communication with the server and register event listeners.
     *
     * @param startGame a callback function to be called when receiving initial room game states
     */
    module.init = function (startGame) {
        setupReceivers(startGame);
    };

    /**
     * Reconnects the client socket to server socket when the player replays the game
     */
    module.reconnect = function () {
        // Ignore socket old buffers
        socket.sendBuffer = [];
        socket.receiveBuffer = [];

        if (socket.connected) { // Player didn't loose connection, just got eaten
            sendSubscribeRequest();
            return;
        }

        // Reconnect to server
        socket.connect();
    };

    /**
     * Sends my angle to the server.
     * To be called every specific interval of time.
     */
    module.sendAngle = function () {
        // Get last angles row
        let angles = gameStatus.status.anglesQueue.mouseAngles.slice(-1)[0];

        // Stamp the angles packet
        let currentTime = Date.now();
        gameStatus.status.anglesQueue.serverAngleTimeStamp += currentTime - gameStatus.status.anglesQueue.lastAngleTimeStamp;
        gameStatus.status.anglesQueue.lastAngleTimeStamp = currentTime;
        angles.timestamp = gameStatus.status.anglesQueue.serverAngleTimeStamp;

        // Transmit a sequence of angles
        socket.emit('angle', angles);

        // Push new empty row for new angles
        gameStatus.status.anglesQueue.mouseAngles.push({id: ++gameStatus.status.anglesQueue.lastAngleID, angles: []});

        // Enforce the max size
        gameStatus.reduceAnglesBufferSize();
    };

    /**
     * Sends a subscribe request to join a game room and start playing.
     */
    let sendSubscribeRequest = function () {
        socket.emit('subscribe', {});
    };

    /**
     * Registers event listeners from the server.
     *
     * @param startGame a callback function to be called when receiving initial room game states
     */
    let setupReceivers = function (startGame) {
        // Send subscription request once got connected
        socket.on('connect', function () {
            sendSubscribeRequest();
        });

        // Receive main player info
        socket.on('player_info', function (playerInfo) {
            gameStatus.status.me = Object.assign({}, playerInfo);
            gameStatus.status.players[gameStatus.status.me.id] = gameStatus.status.me;

            gameStatus.status.anglesQueue.lastAngleTimeStamp = Date.now();
            gameStatus.status.anglesQueue.serverAngleTimeStamp = gameStatus.status.me.lastAngleTimeStamp;
        });

        // Receive initial game status
        socket.on('initial_game_status', function (receivedGameStatus) {
            gameStatus.set(JSON.parse(receivedGameStatus));
            startGame();
        });

        // Receive game status
        socket.on('game_status', function (receivedGameStatus) {
            // Update local gameStatus by receivedGameStatus
            gameStatus.set(JSON.parse(receivedGameStatus));
        });

        // Listen to disconnection event
        socket.on('disconnect', function () {
            gameStatus.status.env.running = false;
        });

        // Receive pong from the server to get latency
        socket.on('pong', function (ms) {
            gameStatus.status.env.ping = ms;
        });
    };

    return module;
};
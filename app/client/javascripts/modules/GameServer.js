export default function (gameStatus, errorMsgCallback) {
    let module = {};

    let socket = io({reconnection: false});

    /**
     * Initializes communication with the server and register event listeners.
     *
     * @param startGameCallback a callback function to be called when receiving initial room game states
     */
    module.init = function (startGameCallback) {
        // Send subscription request once got connected
        socket.on('connect', function () {
            sendSubscribeRequest();
        });

        // Receive initial game status
        socket.on('initial_game_status', function (receivedGameStatus) {
            gameStatus.init();

            gameStatus.status.anglesQueue.lastAngleTimestamp = Date.now();
            gameStatus.status.anglesQueue.serverAngleTimestamp = receivedGameStatus.serverTimestamp;

            gameStatus.status.meId = receivedGameStatus.meId;
            gameStatus.status.name = receivedGameStatus.name;
            gameStatus.status.highScore = receivedGameStatus.highScore;

            localStorage.setItem("name", receivedGameStatus.name);
            localStorage.setItem("high_score", receivedGameStatus.highScore);

            gameStatus.sync(receivedGameStatus);

            startGameCallback();
        });

        // Receive game status
        socket.on('game_status', function (receivedGameStatus) {
            // Update local gameStatus by receivedGameStatus
            gameStatus.sync(receivedGameStatus);

            // Update my high score
            let me = gameStatus.status.players[gameStatus.status.meId];
            localStorage.setItem("high_score", Math.max(parseInt(localStorage.getItem("high_score")), me.score).toString());
        });

        // Listen to game over event
        socket.on('game_over', function () {
            gameStatus.status.env.running = false;
        });

        // Listen to disconnection event
        socket.on('disconnect', function () {
            gameStatus.status.env.running = false;
        });

        // Receive pong from the server to get latency
        socket.on('error', function (msg) {
            errorMsgCallback(msg);
        });

        // Receive pong from the server to get latency
        socket.on('pong', function (ms) {
            gameStatus.status.env.ping = ms;
        });
    };

    /**
     * Sends my angle to the server.
     * To be called every specific interval of time.
     */
    module.sendAngle = function () {
        // Do not send the angle if the game is not running
        if (!gameStatus.status.env.running) return;

        // Get last angles row
        let anglesQueue = gameStatus.status.anglesQueue;
        let angles = anglesQueue.mouseAngles.slice(-1)[0];

        // Stamp the angles packet
        let currentTime = Date.now();
        anglesQueue.serverAngleTimestamp += currentTime - anglesQueue.lastAngleTimestamp;
        anglesQueue.lastAngleTimestamp = currentTime;
        angles.timestamp = anglesQueue.serverAngleTimestamp;

        // Transmit a sequence of angles
        socket.emit('angle', angles);

        // Push new empty row for new angles
        anglesQueue.mouseAngles.push({id: ++anglesQueue.lastAngleID, angles: []});

        // Enforce the max size
        gameStatus.reduceAnglesBufferSize();
    };

    /**
     * Sends a subscribe request to join a game room and start playing.
     */
    let sendSubscribeRequest = function () {
        socket.emit('subscribe', {});
    };

    return module;
};
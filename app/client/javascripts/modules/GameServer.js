export default function (gameStatus) {
    let module = {};
    let socket = io({reconnection: false});

    /**
     * Initializes communication with the server and register event listeners.
     *
     * @param setupGameEngine   a callback function to be called when receiving initial room game states
     */
    module.init = function (setupGameEngine) {
        setupReceivers(setupGameEngine);

        socket.on('connect', function () {
            module.sendSubscribeRequest();
        });
    };

    /**
     * Sends a subscribe request to join a game room and start playing.
     */
    module.sendSubscribeRequest = function () {
        socket.emit('subscribe', {});
    };

    /**
     * Sends my angle to the server.
     */
    module.sendAngle = function () {
        // Get last angles row
        let angles = gameStatus.status.anglesQueue.mouseAngles.slice(-1)[0];

        // Stamp the angles packet
        let currentTime = Date.now();
        gameStatus.status.env.serverAngleTimeStamp += currentTime - gameStatus.status.env.lastAngleTimeStamp;
        gameStatus.status.env.lastAngleTimeStamp = currentTime;
        angles.timestamp = gameStatus.status.env.serverAngleTimeStamp;

        // Transmit a sequence of angles
        socket.emit('angle', angles);

        // Push new row for new angles
        gameStatus.status.anglesQueue.mouseAngles.push({id: ++gameStatus.status.anglesQueue.lastAngleID, angles: []});

        // Enforce the max size
        gameStatus.reduceAnglesBufferSize();
    };

    /**
     * Registers event listeners from the server.
     *
     * @param startGame     a callback function to be called when receiving initial room game states
     */
    let setupReceivers = function (startGame) {
        // Receive main player info
        socket.on('player_info', function (playerInfo) {
            gameStatus.status.me = Object.assign({}, playerInfo);
            gameStatus.status.players[gameStatus.status.me.id] = gameStatus.status.me;

            gameStatus.status.env.lastAngleTimeStamp = Date.now();
            gameStatus.status.env.serverAngleTimeStamp = gameStatus.status.me.lastAngleTimeStamp;
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

        // TODO: does this get actually called?
        socket.on('disconnect', function () {
            gameStatus.status.me.alive = false;
        });

        // Receive pong from the server to get latency
        socket.on('pong', function (ms) {
            gameStatus.status.env.ping = ms;
        });
    };

    return module;
};
export default function (gameStatus) {
    let module = {};
    let _socket = io();

    module.init = function (setupGameEngine) {
        setupReceivers(setupGameEngine);

        _socket.on('connect', function () {
            module.emitSubscribeRequest();
        });
    };

    module.emitSubscribeRequest = function () {
        _socket.emit('subscribe', {});
    };

    /**
     * Send my angle to the server
     */
    module.sendAngle = function () {
        // Get last angles row
        let angles = gameStatus.status.anglesQueue.mouseAngles.slice(-1)[0];

        // Stamp the angles packet
        let currentTime = Date.now();
        gameStatus.status.env.serverAngleTimeStamp += currentTime - gameStatus.status.env.lastAngleTimeStamp;
        gameStatus.status.env.lastAngleTimeStamp = currentTime;
        angles.timestamp = gameStatus.status.env.serverAngleTimeStamp;

        // Transmit
        _socket.emit('angle', angles);

        // Push new row for new angles
        gameStatus.status.anglesQueue.mouseAngles.push({id: ++gameStatus.status.anglesQueue.lastAngleID, angles: []});

        // Enforce the max size
        gameStatus.reduceAnglesBufferSize();
    };

    let setupReceivers = function (startGame) {
        _socket.on('player_info', function (playerInfo) {
            gameStatus.status.me = Object.assign({}, playerInfo);
            gameStatus.status.players[gameStatus.status.me.id] = gameStatus.status.me;

            gameStatus.status.env.lastAngleTimeStamp = Date.now();
            gameStatus.status.env.serverAngleTimeStamp = gameStatus.status.me.lastAngleTimeStamp;
        });

        _socket.on('game_status', function (receivedGameStatus) {
            // Update local gameStatus by receivedGameStatus
            gameStatus.set(JSON.parse(receivedGameStatus));
        });

        _socket.on('initial_game_status', function (receivedGameStatus) {
            gameStatus.set(JSON.parse(receivedGameStatus));
            startGame();
        });

        _socket.on('disconnect', function () {
            gameStatus.status.me.alive = false;
        });

        // Receive pong from the server to get latency
        _socket.on('pong', function (ms) {
            gameStatus.status.env.ping = ms;
        });
    };

    return module;
};
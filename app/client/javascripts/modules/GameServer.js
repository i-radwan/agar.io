export default function (gameStatus, serverGameStatus) {
    let module = {};
    let connectionEstablished = false;
    let _socket = io();

    module.init = function (setupGameEngine) {
        setupReceivers(setupGameEngine);

        _socket.on('connect', function () {
            // Send subscription request
            _socket.emit('subscribe', {});
        });
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
        gameStatus.enforceAnglesBufferMaxSize();
    };

    let setupReceivers = function (startGame) {
        _socket.on('player_info', function (playerInfo) {
            gameStatus.status.me = Object.assign({}, playerInfo);
            gameStatus.status.env.lastAngleTimeStamp = Date.now();
            gameStatus.status.env.serverAngleTimeStamp = gameStatus.status.me.lastAngleTimeStamp;
        });

        _socket.on('game_status', function (receivedGameStatus) {
            gameStatus.status.env.serverResponseReceived = true;

            serverGameStatus = Object.assign(serverGameStatus, JSON.parse(receivedGameStatus));

            // Start game
            if (!connectionEstablished) {
                gameStatus.init(serverGameStatus);

                startGame();
                connectionEstablished = true;
            }
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
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
        let angles = gameStatus.status.anglesQueue.mouseAngles.slice(-1)[0];
        angles.timestamp = Date.now();

        _socket.emit('angle', angles);

        gameStatus.status.anglesQueue.mouseAngles.push({id: ++gameStatus.status.anglesQueue.lastAngleID, angles: []});
        gameStatus.enforceAnglesBufferMaxSize();
    };

    let setupReceivers = function (startGame) {
        _socket.on('player_info', function (playerInfo) {
            gameStatus.status.me = Object.assign({}, playerInfo);
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
    };

    return module;
};
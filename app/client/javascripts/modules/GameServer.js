/**
 * Created by ibrahimradwan on 3/3/18.
 */

export default function (gameStatus, serverGameStatus) {
    let module = {};
    let connectionEstablished = false;
    let _socket = io();

    module.init = function (startGame) {
        _socket.on('connect', function () {
            // Send subscription request
            _socket.emit('subscribe', {});
        });

        setupReceiver(startGame);
    };

    /**
     * Send my angle to the server
     */
    module.sendAngle = function () {
        _socket.emit('angle', gameStatus.status.me.angle);
    };

    /**
     * Send game status to the server
     */
    module.sendStatus = function () {
        _socket.emit('game_status', gameStatus);
    };

    let setupReceiver = function (startGame) {
        _socket.on('game_status', function (receivedGameStatus) {
            console.log('Incoming game status:', receivedGameStatus);

            gameStatus.status.env.serverResponseReceived = true;
            serverGameStatus = copyReceivedGameStatus(serverGameStatus, receivedGameStatus);

            // Start game
            if (!connectionEstablished) {
                gameStatus.init(receivedGameStatus);

                startGame();
                connectionEstablished = true;
            }
        });
    };

    let copyReceivedGameStatus = function (serverGameStatus, receivedGameStatus) {
        delete serverGameStatus.gems;
        delete serverGameStatus.players;

        return Object.assign(serverGameStatus, receivedGameStatus);
    };

    return module;
};
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

    let setupReceiver = function (startGame) {
        _socket.on('game_status', function (receivedGameStatus) {
            console.log('Incoming game status:', receivedGameStatus);

            // ToDo: update game status
            serverGameStatus.set(receivedGameStatus);

            // Start game
            if (!connectionEstablished) {
                gameStatus = serverGameStatus;

                startGame();
                connectionEstablished = true;
            }

        });
    };

    /**
     * Send game status to the server
     */
    module.sendStatus = function () {
        _socket.emit('game_status', gameStatus);
    };

    return module;
};
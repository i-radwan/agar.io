/**
 * Created by ibrahimradwan on 3/3/18.
 */

export default function (gameStatus, serverGameStatus) {
    let module = {};
    let connectionEstablished = false;
    let _socket = io();
    let lastID = 0;

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
        // if (gameStatus.status.me.lerping) return;

        // console.log("Insert", gameStatus.status.me.lastAngleID + 1);
        // console.log("Sending", gameStatus.status.me.color, gameStatus.status.me.mouseAngle.slice(-1)[0].angles);

        _socket.emit('angle', gameStatus.status.me.mouseAngle.slice(-1)[0]);

        gameStatus.status.me.lastAngleID++;

        gameStatus.status.me.mouseAngle.push({id: gameStatus.status.me.lastAngleID, angles: []});

        while (gameStatus.status.me.anglesBufferSize > 20) {
            let size = gameStatus.status.me.mouseAngle[0].angles.length;

            // console.log("FLUSHING", gameStatus.status.me.mouseAngle.splice(0, 1));

            gameStatus.status.me.anglesBufferSize -= size;
        }
    };

    /**
     * Send game status to the server
     */
    module.sendStatus = function () {
        // _socket.emit('game_status', gameStatus);
    };

    let setupReceivers = function (startGame) {
        _socket.on('player_info', function (playerInfo) {
            console.log('Incoming player info:', playerInfo);

            gameStatus.status.me.id = playerInfo.id;
        });

        _socket.on('game_status', function (receivedGameStatus) {
            // console.log('Incoming game status:', receivedGameStatus);

            gameStatus.status.env.serverResponseReceived = true;
            serverGameStatus = storeReceivedGameStatus(serverGameStatus, receivedGameStatus);

            // Start game
            if (!connectionEstablished) {
                gameStatus.init(receivedGameStatus);

                startGame();
                connectionEstablished = true;
            }
        });
    };

    let storeReceivedGameStatus = function (serverGameStatus, receivedGameStatus) {
        delete serverGameStatus.gems;
        delete serverGameStatus.players;

        return Object.assign(serverGameStatus, receivedGameStatus);
    };

    return module;
};

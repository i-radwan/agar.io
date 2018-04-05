/**
 * Created by ibrahimradwan on 3/3/18.
 */
import Constants from "./Constants.js";

export default function (gameStatus, serverGameStatus) {
    let module = {};
    let constants = Constants();
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
        _socket.emit('angle', gameStatus.status.anglesQueue.mouseAngles.slice(-1)[0]);

        gameStatus.status.anglesQueue.mouseAngles.push({id: ++gameStatus.status.anglesQueue.lastAngleID, angles: []});

        while (gameStatus.status.anglesQueue.anglesBufferSize > constants.general.MAX_ANGLES_BUFFER_SIZE) {
            let size = gameStatus.status.anglesQueue.mouseAngles[0].angles.length;
            gameStatus.status.anglesQueue.mouseAngles.splice(0, 1);
            gameStatus.status.anglesQueue.anglesBufferSize -= size;
        }
    };

    let setupReceivers = function (startGame) {
        _socket.on('player_info', function (playerInfo) {
            gameStatus.status.me.id = playerInfo.id;
        });

        _socket.on('game_status', function (receivedGameStatus) {
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

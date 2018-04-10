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
        let angles = gameStatus.status.anglesQueue.mouseAngles.slice(-1)[0];
        angles.timestamp = Date.now();

        _socket.emit('angle', angles);

        gameStatus.status.anglesQueue.mouseAngles.push({id: ++gameStatus.status.anglesQueue.lastAngleID, angles: []});

        // Check if the anglesBuffer is getting filled, remove rows until condition is broken
        while (gameStatus.status.anglesQueue.anglesBufferSize > constants.general.MAX_ANGLES_BUFFER_SIZE) {
            // Size to be decremented from the total buffer size (of the first row)
            let size = gameStatus.status.anglesQueue.mouseAngles[0].angles.length;

            // Remove the first row
            gameStatus.status.anglesQueue.mouseAngles.splice(0, 1);

            // Decrease the size
            gameStatus.status.anglesQueue.anglesBufferSize -= size;
        }
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

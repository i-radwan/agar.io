/**
 * Created by ibrahimradwan on 3/3/18.
 */

export default function () {
    let module = {};
    let connectionEstablished = false;

    module.init = function (startGame) {
        module._socket = io();

        module._socket.on('connect', function () {
            // Send subscription request
            module._socket.emit('subscribe', {});
        });

        module._socket.on('game_status', function (game_status) {
            console.log('Incoming message:', game_status);

            // Start game
            if (!connectionEstablished) {
                startGame();
                connectionEstablished = true;
            }
        });
    };

    /**
     * Update the server
     */
    module.transmit = function () {
        // socket.emit('chat message', $('#m').val());
        // $('#m').val('');
    };

    return module;
};
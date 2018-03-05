/**
 * Created by ibrahimradwan on 3/3/18.
 */

export default function () {
    var module = {};
    module.connectionEstablised = false;

    module.init = function (startGameLoop) {
        module._socket = io();

        module._socket.on('connect', function () {
            // Send subscription request
            module._socket.emit('subscribe', {});
        });

        module._socket.on('game_status', function (game_status) {
            console.log('Incoming message:', game_status);

            // Start game
            if (!module.connectionEstablised) {
                startGameLoop();
                module.connectionEstablised = true;
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
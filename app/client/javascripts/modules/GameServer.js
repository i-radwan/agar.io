/**
 * Created by ibrahimradwan on 3/3/18.
 */

export default function () {
    var module = {};

    module.init = function () {
        module._socket = io();

        // Receive messages
        module._socket.on('game_status', function (game_status) {
            console.log(game_status);
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
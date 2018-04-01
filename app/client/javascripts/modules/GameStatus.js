/**
 * Created by ibrahimradwan on 3/3/18.
 */

export default function () {
    let module = {};

    module.status = {
        env: {
            scoreObject: {},
            gameWidth: 4 * window.innerWidth,
            gameHeight: 4 * window.innerHeight,
            serverResponseReceived: false,
            fastForward: false,
            graphicsFrameDelta: 10
        },
        me: {
            mouseAngle: []
        }
    };

    module.init = function (serverGameStatus) {
        // Initialize
        module.status.me.alive = true;

        module.status.gems = [];
        module.status.players = [];

        // Set the local arrays
        module.set(serverGameStatus);
    };

    /**
     * Update the game status
     */
    module.set = function (serverGameStatus) {
        syncGems(serverGameStatus);
        syncPlayers(serverGameStatus);

        module.status.env.serverResponseReceived = false;
    };

    let syncGems = function (serverGameStatus) {
        syncArrays(module.status.gems, serverGameStatus.gems);
    };

    let syncPlayers = function (serverGameStatus) {
        syncArrays(module.status.players, serverGameStatus.players);

        // Iterate over the new players array
        for (let idx = 0; idx < module.status.players.length; idx++) {
            let player = module.status.players[idx];

            if (player.id === module.status.me.id) {
                // Update myself
                module.status.me = Object.assign(module.status.me, player);

                // Remove myself from players array
                module.status.players.splice(idx, 1);
            }
        }
    };

    /**
     * Sync two arrays
     * @param local the array of local items
     * @param remote the array of remote(server) items
     */
    let syncArrays = function (local, remote) {
        let i = 0, j = 0, len = local.length;
        while (i < len && j < remote.length) {
            if (local[i].id === remote[j].id) { // Object still exists
                local[i] = Object.assign(local[i], remote[j]);
                i++;
                j++;
            }
            else if (local[i].id < remote[j].id) { // Object gem removed
                local[i].removed = true;
                i++;
            }
            else {
                local.push(Object.assign({}, remote[j]));
                j++;
            }
        }

        while (i < len) {
            local[i].removed = true;
            i++;
        }

        while (j < remote.length) {
            local.push(Object.assign({}, remote[j]));
            j++;
        }
    };

    return module;
};

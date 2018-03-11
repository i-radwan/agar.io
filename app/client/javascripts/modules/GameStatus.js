/**
 * Created by ibrahimradwan on 3/3/18.
 */

export default function () {
    let module = {};

    module.status = {
        env: {
            scoreObject: {},
            mousePosition: {
                mouseX: window.innerWidth / 2,
                mouseY: window.innerHeight / 2
            },
            serverResponseReceived: false,
            fastForward: false
        },
        me: {}
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
        let foundMyself = false;

        for (let idx = 0; idx < module.status.players.length && !foundMyself; idx++) {
            let player = module.status.players[idx];

            if (player.id === module.status.me.id) {
                // Update myself
                module.status.me = Object.assign(module.status.me, player);

                // Remove myself from players array
                module.status.players.splice(idx, 1);

                foundMyself = true;
            }
        }

        if (!foundMyself)
            module.status.me.alive = false;
    };

    /**
     * Sync two arrays
     * @param local the array of local items
     * @param remote the array of remote(server) items
     */
    let syncArrays = function (local, remote) {
        let i = 0, j = 0, len = local.length;
        while (i < len && j < remote.length) {
            if (local[i].id === remote[j].id) { // Gem still exists
                local[i] = Object.assign(local[i], remote[j]);
                i++;
                j++;
            }
            else if (local[i].id < remote[j].id) { // Local gem removed
                local[i].canvasObject.removed = true;
                i++;
            }
            else {
                local.push(Object.assign({}, remote[j]));
                j++;
            }
        }

        while (i < len) {
            local[i].canvasObject.removed = true;
            i++;
        }

        while (j < remote.length) {
            local.push(Object.assign({}, remote[j]));
            j++;
        }
    };

    return module;
};

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
            serverResponseReceived: false
        },
        anglesQueue: {
            mouseAngles: [{id: 0, angles: []}],
            anglesBufferSize: 0,
            lastAngleID: 0,
            lastReceivedAngleID: -1
        },
        me: {
            lerping: false
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
        syncGems(serverGameStatus.newGems, serverGameStatus.deletedGemsIDs);
        syncPlayers(serverGameStatus.players);

        module.status.env.serverResponseReceived = false;
    };

    let syncGems = function (serverGameNewGems, serverGameDeletedGems) {
        // Sync local gems
        for (let i in module.status.gems) {
            let gem = module.status.gems[i];

            if (serverGameDeletedGems.indexOf(gem.id.toString()) > -1) {
                gem.removed = true;
            }
        }

        // Add new gems
        for (let i in serverGameNewGems){
            module.status.gems.push(serverGameNewGems[i]);
        }
    };

    let syncPlayers = function (serverGamePlayers) {
        // Sync local players
        for (let i = 0; i < module.status.players.length; i++) {
            let player = module.status.players[i];

            // Player is dead
            if (!serverGamePlayers.hasOwnProperty(player.id)) {
                player.removed = true;

                module.status.me.alive |= (player.id === module.status.me.id);

                continue;
            }

            player = Object.assign(player, serverGamePlayers[player.id]);

            // Remove from the server array (after loop we will have the new players only)
            delete serverGamePlayers[player.id];
        }

        // Add new players
        for (let playerID in serverGamePlayers) {
            module.status.players.push(serverGamePlayers[playerID]);
        }

        if (!module.status.me.alive) return;

        // Iterate over the new players array
        for (let idx = 0; idx < module.status.players.length; idx++) {
            let player = module.status.players[idx];

            if (player.id === module.status.me.id) {
                syncAnglesBuffer(module.status.me);

                // Update myself
                module.status.me = Object.assign(module.status.me, player);

                // Remove myself from players array
                module.status.players.splice(idx, 1);

                break;
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

    let syncAnglesBuffer = function (player) {
        // Configure my player only
        let sameServerAnglesID = (module.status.anglesQueue.lastReceivedAngleID === player.lastReceivedAngleID);

        if (sameServerAnglesID) return;

        module.status.anglesQueue.lastReceivedAngleID = player.lastReceivedAngleID;

        // Check if the received angle ID = anglesQueue top
        if (module.status.anglesQueue.mouseAngles[0].id === player.lastReceivedAngleID) {
            module.status.anglesQueue.anglesBufferSize -= module.status.anglesQueue.mouseAngles.splice(0, 1)[0].angles.length;
            player.lerping = false;
        }
        else if (!player.lerping) {
            module.status.anglesQueue.mouseAngles = module.status.anglesQueue.mouseAngles.splice(-1, 1);

            // Set new size with the size of the top row only
            module.status.anglesQueue.anglesBufferSize = module.status.anglesQueue.mouseAngles[0].angles.length;

            // Start lerping to server position
            player.lerping = true;
        }
    };
    return module;
};

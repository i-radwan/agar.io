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
        for (let i in serverGameNewGems) {
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

                // Is this dead player me ?
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

        // Iterate over the new players array to find myself
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

    let syncAnglesBuffer = function (me) {
        // If the server sends same angle acceptance again
        let sameServerAnglesID = (module.status.anglesQueue.lastReceivedAngleID === me.lastReceivedAngleID);

        console.log(module.status.anglesQueue.lastReceivedAngleID, module.status.anglesQueue.mouseAngles[0].id, me.lastReceivedAngleID, me);
        if (sameServerAnglesID) return;

        // Update the last accepted angles ID
        module.status.anglesQueue.lastReceivedAngleID = me.lastReceivedAngleID;
        // Check if the received angle ID = anglesQueue top
        if (module.status.anglesQueue.mouseAngles[0].id === me.lastReceivedAngleID) {
            module.status.anglesQueue.anglesBufferSize -= module.status.anglesQueue.mouseAngles.splice(0, 1)[0].angles.length;
            me.lerping = false;
        }
        else if (!me.lerping) {
            // Flush the buffer
            module.status.anglesQueue.mouseAngles = module.status.anglesQueue.mouseAngles.splice(-1, 1);

            // Set new size with the size of the top row only
            module.status.anglesQueue.anglesBufferSize = module.status.anglesQueue.mouseAngles[0].angles.length;

            // Start lerping to server position
            me.lerping = true;
        }
        console.log(me.lerping);
    };

    return module;
};

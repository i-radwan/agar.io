export default function () {
    let module = {};

    module.status = {
        env: {
            serverResponseReceived: false,
            lerping: false,
            lerpingCount: 0,
            noLerpingCount: 0,
            lerpingRatio: 0
        },
        anglesQueue: {
            mouseAngles: [{id: 0, angles: []}],
            anglesBufferSize: 0,
            lastAngleID: 0,
            lastReceivedAngleID: -1
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
        // Check if I'm killed
        if (!serverGamePlayers.hasOwnProperty(module.status.me.id)) {
            module.status.me.alive = false;
            return;
        }

        // Sync local players (not including me)
        for (let i = 0; i < module.status.players.length; i++) {
            let player = module.status.players[i];

            // Player is dead
            if (!serverGamePlayers.hasOwnProperty(player.id)) {
                player.removed = true;
                continue;
            }

            player = Object.assign(player, serverGamePlayers[player.id]);

            // Remove from the server array (after loop we will have the new players only)
            delete serverGamePlayers[player.id];
        }

        // Add new players
        for (let playerID in serverGamePlayers) {
            if (Number(playerID) !== module.status.me.id)
                module.status.players.push(serverGamePlayers[playerID]);
        }

        let mainPlayerServerVersion = serverGamePlayers[module.status.me.id];

        syncAnglesBuffer(mainPlayerServerVersion);

        // Update myself
        module.status.me = Object.assign(module.status.me, mainPlayerServerVersion);
    };

    let syncAnglesBuffer = function (meOnServer) {

        // If the server sends same angle acceptance again
        if (module.status.anglesQueue.lastReceivedAngleID === meOnServer.lastReceivedAngleID) return;

        // Update the last accepted angles ID
        module.status.anglesQueue.lastReceivedAngleID = meOnServer.lastReceivedAngleID;

        let serverKeepingUp = false;

        // Flush all angles corresponding to missed packets
        while (meOnServer.lastReceivedAngleID >= module.status.anglesQueue.mouseAngles[0].id) {
            // Reduce total buffer size
            module.status.anglesQueue.anglesBufferSize -= module.status.anglesQueue.mouseAngles[0].angles.length;

            // Remove the top value
            module.status.anglesQueue.mouseAngles.splice(0, 1);

            serverKeepingUp = true;
            module.status.env.lerping = false;
        }

        // Server is failing behind with huge margin -> ignore local -> lerp to server
        if (!serverKeepingUp && !module.status.env.lerping) {
            // Flush the buffer
            module.status.anglesQueue.mouseAngles = module.status.anglesQueue.mouseAngles.splice(-1, 1);

            // Set new size with the size of the top row only
            module.status.anglesQueue.anglesBufferSize = module.status.anglesQueue.mouseAngles[0].angles.length;

            // Start lerping to server position
            module.status.env.lerping = true;
        }
    };

    return module;
};

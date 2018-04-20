import Constants from "./Constants.js";

export default function () {
    let module = {};
    let constants = Constants();

    /**
     * Fill game status with initial dummy values
     */
    module.init = function () {
        module.status = {
            env: {
                running: true,
                lerping: false,
                ping: 0
            },
            anglesQueue: {
                mouseAngles: [{id: 0, angles: []}],
                firstIdx: 0,
                anglesBufferSize: 0,
                lastAngleID: 0,
                lastReceivedAngleID: -1,
                lastAngleTimeStamp: 0,
                serverAngleTimeStamp: 0
            },
            me: { // Fields to be filled later
                id: -1,

                // Visualizing variables
                name: "",
                score: 0,
                color: "",
                radius: 0,

                // Movement variables
                x: 0,
                y: 0,
                canvasX: 0,
                canvasY: 0,
                velocity: 0,
                angle: 0,

                // Sync variables
                lastAngleTimeStamp: 0,
                lastReceivedAngleID: -1,
                forcePosition: false
            },
            gems: {},
            newGems: [],
            players: [],
            newPlayers: []
        };
    };

    /**
     * Update the game status
     */
    module.set = function (serverGameStatus) {
        syncGems(serverGameStatus.newGems, serverGameStatus.deletedGemsIDs);
        syncPlayers(serverGameStatus.players);
    };

    /**
     * Remove old items from angles buffer until size <= MAX_ANGLES_BUFFER_SIZE
     */
    module.reduceAnglesBufferSize = function () {
        let firstIdx = module.status.anglesQueue.firstIdx;

        // Check if the anglesBuffer is getting filled, remove rows until condition is broken
        while (module.status.anglesQueue.anglesBufferSize > constants.general.MAX_ANGLES_BUFFER_SIZE) {
            // Size to be decremented from the total buffer size (of the first row)
            let size = module.status.anglesQueue.mouseAngles[firstIdx].angles.length;

            // Remove the first row
            delete module.status.anglesQueue.mouseAngles[firstIdx++];

            // Decrease the size
            module.status.anglesQueue.anglesBufferSize -= size;
        }

        module.status.anglesQueue.firstIdx = firstIdx;
    };

    let syncGems = function (serverGameNewGems, serverGameDeletedGems) {
        // Sync local gems
        for (let i in serverGameDeletedGems) {
            delete module.status.gems[serverGameDeletedGems[i]];
        }

        // Append new gems
        module.status.newGems = Object.assign(module.status.newGems, serverGameNewGems);
    };

    let syncPlayers = function (serverGamePlayers) {
        // Check if I'm killed
        let mainPlayerServerVersion = serverGamePlayers[module.status.me.id];

        if (!mainPlayerServerVersion) {
            module.status.env.running = false;
            return;
        }

        // Sync local players with the server (including me)
        for (let i in module.status.players) {
            let player = module.status.players[i];

            if (serverGamePlayers.hasOwnProperty(player.id)) {
                // Update player
                Object.assign(player, serverGamePlayers[player.id]);

                // Remove from the server array (after loop we will have the new players only)
                delete serverGamePlayers[player.id];
            }
            else {
                // Remove player if dead
                delete module.status.players[i];
            }
        }

        // Append new players
        // module.status.newPlayers = Object.assign(module.status.newPlayers, serverGamePlayers);
        for (let playerID in serverGamePlayers) {
            module.status.players.push(serverGamePlayers[playerID]);
        }

        // Sync angles buffer of the main player
        syncAnglesBuffer(mainPlayerServerVersion);
    };

    let syncAnglesBuffer = function (meOnServer) {
        // If the server sends same angle acceptance again
        if (module.status.anglesQueue.lastReceivedAngleID === meOnServer.lastReceivedAngleID) return;

        // Update the last accepted angles ID
        module.status.anglesQueue.lastReceivedAngleID = meOnServer.lastReceivedAngleID;

        let serverKeepingUp = false;
        let firstIdx = module.status.anglesQueue.firstIdx;

        // Flush all angles corresponding to overridden packets
        while (meOnServer.lastReceivedAngleID >= module.status.anglesQueue.mouseAngles[firstIdx].id) {
            // Reduce total buffer size
            module.status.anglesQueue.anglesBufferSize -= module.status.anglesQueue.mouseAngles[firstIdx].angles.length;

            // Remove the top value
            delete module.status.anglesQueue.mouseAngles[firstIdx++];

            if (module.status.env.lerping) {
                module.status.me.canvasX = meOnServer.x;
                module.status.me.canvasY = meOnServer.y;
            }

            serverKeepingUp = true;
            module.status.env.lerping = false;
        }

        // Server is failing behind with huge margin -> ignore local -> lerp to server
        if ((!serverKeepingUp || meOnServer.forcePosition) && !module.status.env.lerping) {
            // Reset buffer left/right pointer
            firstIdx = 0;

            // Flush the buffer
            module.status.anglesQueue.mouseAngles = [module.status.anglesQueue.mouseAngles.pop()];

            // Remove the taken angles so far, we don't want to send to server anything new until we reach its position
            module.status.anglesQueue.anglesBufferSize = 0;
            module.status.anglesQueue.mouseAngles[firstIdx].angles = [];

            // Start lerping to server position
            module.status.env.lerping = true;
        }

        module.status.anglesQueue.firstIdx = firstIdx;
    };

    return module;
};

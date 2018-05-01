import Constants from "./Constants.js";

export default function () {
    let module = {};
    let constants = Constants();

    /**
     * Fills initial game status.
     */
    module.init = function () {
        module.status = {
            meId: -1,
            players: {},
            newPlayers: {},
            gems: {},
            newGems: {},
            env: {
                running: true,
                rollback: false,
                forcePosition: false,
                ping: 0
            },
            anglesQueue: {
                mouseAngles: [{id: 0, angles: []}],
                firstIdx: 0,
                anglesBufferSize: 0,
                lastAngleID: 0,
                lastReceivedAngleID: -1,
                lastAngleTimestamp: 0,
                serverAngleTimestamp: 0
            }
        };
    };

    /**
     * Synchronizes the game status with the newly received status from the server.
     */
    module.sync = function (serverGameStatus) {
        syncGems(serverGameStatus.newGems, serverGameStatus.deletedGemsIDs);
        syncPlayers(serverGameStatus.players, serverGameStatus.newPlayers);
        syncAnglesBuffer(serverGameStatus.sync);
    };

    /**
     * Adds a new angle to the end of the angles buffer.
     *
     * @param angle the angle to be added
     */
    module.pushAngleToBuffer = function (angle) {
        if (module.status.env.rollback) return;

        let anglesQueue = module.status.anglesQueue;
        anglesQueue.mouseAngles[anglesQueue.mouseAngles.length - 1].angles.push(angle);
        anglesQueue.anglesBufferSize++;
    };

    /**
     * Removes old items from angles buffer until size <= {@link MAX_ANGLES_BUFFER_SIZE}.
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

    /**
     * Synchronizes the game gems with the server.
     *
     * @param serverGameNewGems     the newly generated gems to be added
     * @param serverGameDeletedGems the newly eaten gems to be removed
     */
    let syncGems = function (serverGameNewGems, serverGameDeletedGems) {
        // Remove eaten gems
        for (let i in serverGameDeletedGems) {
            delete module.status.gems[serverGameDeletedGems[i]];
        }

        // Append new gems
        module.status.newGems = Object.assign(module.status.newGems, serverGameNewGems);
    };

    /**
     * Synchronizes the game players with the server.
     *
     * @param serverGamePlayers     the server players graphics parameters
     * @param serverGameNewPlayers  the newly registered player static information (i.e. name, color, ..etc)
     */
    let syncPlayers = function (serverGamePlayers, serverGameNewPlayers) {
        // Check if I was eaten
        if (!serverGamePlayers[module.status.meId]) {
            module.status.env.running = false;
            return;
        }

        for (let key in serverGamePlayers) {
            let player = module.status.players[key] || {};
            Object.assign(player, serverGamePlayers[key]);

            serverGamePlayers[key] = player;
        }

        module.status.players = serverGamePlayers;
        module.status.newPlayers = Object.assign(module.status.newPlayers, serverGameNewPlayers);
    };

    /**
     * Synchronizes main player angles buffer with the server.
     *
     * @param serverEnv the server sync environment variables
     */
    let syncAnglesBuffer = function (serverEnv) {
        if (!serverEnv) return;

        // Aliasing
        let anglesQueue = module.status.anglesQueue;
        let serverLastReceivedAngleID = serverEnv.lastReceivedAngleID;
        let serverForcePosition = serverEnv.forcePosition;

        module.status.env.forcePosition |= serverForcePosition;

        // If the server sends same angle acceptance again
        if (anglesQueue.lastReceivedAngleID === serverLastReceivedAngleID) return;

        // Update the last accepted angles ID
        anglesQueue.lastReceivedAngleID = serverLastReceivedAngleID;

        let serverKeepingUp = false;
        let firstIdx = anglesQueue.firstIdx;

        // Flush all angles corresponding to overridden packets
        while (serverLastReceivedAngleID >= anglesQueue.mouseAngles[firstIdx].id) {
            // Reduce total buffer size
            anglesQueue.anglesBufferSize -= anglesQueue.mouseAngles[firstIdx].angles.length;

            // Remove the top value
            delete anglesQueue.mouseAngles[firstIdx++];

            // TODO:
            if (module.status.env.rollback) {
                module.status.env.forcePosition = true;
                // module.status.me.canvasX = meOnServer.x;
                // module.status.me.canvasY = meOnServer.y;
            }

            serverKeepingUp = true;
            module.status.env.rollback = false;
        }

        // Server is failing behind with huge margin -> ignore local -> lerp to server
        if ((!serverKeepingUp || serverForcePosition) && !module.status.env.rollback) {
            // Reset buffer left/right pointer
            firstIdx = 0;

            // Flush the buffer
            anglesQueue.mouseAngles = [anglesQueue.mouseAngles.pop()];

            // Remove the taken angles so far, we don't want to send to server anything new until we reach its position
            anglesQueue.anglesBufferSize = 0;
            anglesQueue.mouseAngles[firstIdx].angles = [];

            // Start rolling back to server position
            module.status.env.rollback = true;
        }

        anglesQueue.firstIdx = firstIdx;
    };

    return module;
};

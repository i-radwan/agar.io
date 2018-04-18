import Constants from "./Constants.js";

export default function () {
    let module = {};
    let constants = Constants();

    module.status = {
        env: {
            lerping: false,
            ping: 0
        },
        anglesQueue: {
            mouseAngles: [{id: 0, angles: []}],
            anglesBufferSize: 0,
            lastAngleID: 0,
            lastReceivedAngleID: -1,
            lastAngleTimeStamp: 0,
            serverAngleTimeStamp: 0
        },
        me: { // Fields to be filled later
            id: 0,
            name: "",
            color: "",
            score: 0,
            x: 0,
            y: 0,
            radius: 0,
            angle: 0,
            velocity: 0,
            canvasX: 0,
            canvasY: 0,
            lastAngleTimeStamp: 0,
            lastReceivedAngleID: -1,
            alive: true,
            forcePosition: false
        },
        gems: [],
        players: []
    };

    /**
     * Update the game status
     */
    module.set = function (serverGameStatus) {
        syncGems(serverGameStatus.newGems, serverGameStatus.deletedGemsIDs);
        syncPlayers(serverGameStatus.players);

        module.status.env.serverResponseReceived = false;
    };

    /**
     * Resets the game status to the initial state, to prepare the user for new round
     */
    module.reset = function () {
        delete module.gems;
        delete module.player;

        module.status.lerping = false;

        module.status.anglesQueue.mouseAngles = [{id: 0, angles: []}];
        module.status.anglesQueue.anglesBufferSize = 0;
        module.status.anglesQueue.lastAngleID = 0;
        module.status.anglesQueue.lastReceivedAngleID = -1;
        module.status.anglesQueue.lastAngleTimeStamp = 0;
        module.status.anglesQueue.serverAngleTimeStamp = 0;

        module.status.gems = [];
        module.status.players = [];
    };

    /**
     * Remove old items from angles buffer until size <= MAX_ANGLES_BUFFER_SIZE
     */
    module.reduceAnglesBufferSize = function () {
        // Check if the anglesBuffer is getting filled, remove rows until condition is broken
        while (module.status.anglesQueue.anglesBufferSize > constants.general.MAX_ANGLES_BUFFER_SIZE) {
            // Size to be decremented from the total buffer size (of the first row)
            let size = module.status.anglesQueue.mouseAngles[0].angles.length;

            // Remove the first row
            module.status.anglesQueue.mouseAngles.splice(0, 1);

            // Decrease the size
            module.status.anglesQueue.anglesBufferSize -= size;
        }
    };

    let syncGems = function (serverGameNewGems, serverGameDeletedGems) {
        // Sync local gems
        for (let i in module.status.gems) {
            let gem = module.status.gems[i];

            if (serverGameDeletedGems.indexOf(gem.id.toString()) > -1) {
                gem.eaten = true;
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
                player.alive = false;
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

            if (module.status.env.lerping) {
                module.status.me.canvasX = meOnServer.x;
                module.status.me.canvasY = meOnServer.y;
            }

            serverKeepingUp = true;
            module.status.env.lerping = false;
        }

        // Server is failing behind with huge margin -> ignore local -> lerp to server
        if ((!serverKeepingUp || meOnServer.forcePosition) && !module.status.env.lerping) {
            // Flush the buffer
            module.status.anglesQueue.mouseAngles = module.status.anglesQueue.mouseAngles.splice(-1, 1);

            // Remove the taken angles so far, we don't want to send to server anything new until we reach its position
            module.status.anglesQueue.anglesBufferSize = 0;
            module.status.anglesQueue.mouseAngles[0].angles = [];

            // Start lerping to server position
            module.status.env.lerping = true;
        }
    };

    return module;
};

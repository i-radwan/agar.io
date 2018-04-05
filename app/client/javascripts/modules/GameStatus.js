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
        me: {
            mouseAngle: [{id: 0, angles: []}],
            anglesBufferSize: 0,
            lastAngleID: 0,
            lastReceivedAngleID: -1,
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
                let flag = (module.status.me.lastReceivedAngleID === player.lastReceivedAngleID);

                let tmpLastReceivedAngleID = module.status.me.lastReceivedAngleID;

                // Update myself
                module.status.me = Object.assign(module.status.me, player);

                // Remove myself from players array
                module.status.players.splice(idx, 1);

                // console.log("PRE", module.status.me.anglesBufferSize, player.lastReceivedAngleID, module.status.me.mouseAngle[0].id, module.status.me.lastAngleID - 1);

                if (flag) continue;

                // console.log("POST", module.status.me.anglesBufferSize, player.lastReceivedAngleID, module.status.me.mouseAngle[0].id, module.status.me.lastAngleID - 1);

                while (player.lastReceivedAngleID > module.status.me.mouseAngle[0].id && module.status.me.mouseAngle.length > 2) {
                    // console.log("TT", player.lastReceivedAngleID, module.status.me.mouseAngle[0].id);

                    module.status.me.anglesBufferSize -= module.status.me.mouseAngle[0].angles.length;
                    module.status.me.mouseAngle.splice(0, 1);
                }

                // Check for anglesBuffer
                if (module.status.me.mouseAngle[0].id === player.lastReceivedAngleID) {
                    // console.log("Remove", module.status.me.mouseAngle.splice(0, 1)[0].id);

                    module.status.me.anglesBufferSize -= module.status.me.mouseAngle[0].angles.length;

                    module.status.me.lerping = false;
                }
                else if (!module.status.me.lerping) {
                    // console.log("Flush");
                    module.status.me.mouseAngle = module.status.me.mouseAngle.splice(-2, 2);

                    // Calculate new size
                    let size = 0;
                    for (let i = 0; i < module.status.me.mouseAngle.length; i++) {
                        size += module.status.me.mouseAngle[i].angles.length;
                    }
                    module.status.me.anglesBufferSize = size;

                    module.status.me.lerping = true;
                    module.status.me.lastReceivedAngleID = tmpLastReceivedAngleID;
                }
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

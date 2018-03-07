/**
 * Created by ibrahimradwan on 3/3/18.
 */

export default function () {
    let module = {};

    module.status = {

    };

    module.init = function (serverGameStatus) {
        module.status._env = {
            scoreObject: {},
            mouseX: window.innerWidth / 2,
            mouseY: window.innerHeight / 2
        };

        module.status._me = {
            alive: true,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            velocity: 3,
            angle: 0.1, // Angle
            color: "red",
            radius: 20,
            canvasObject: {},
            name: "IAR",
            score: 0
        };

        // Get server game status
        module.status = Object.assign(module.status, serverGameStatus);
    };

    /**
     * Update the game status
     */
    module.set = function (receivedGameStatus) {
        console.log("Old status", module.status);
        module.status = Object.assign(module.status, receivedGameStatus);
        console.log("New status", module.status);

        // Update canvas objects
    };
    return module;
};
// Imports
import PhysicsEngine from "./PhysicsEngine.js";
import UIEngine from "./UIEngine.js";
import Constants from "./Constants.js";

export default function (gameStatus, gameOverCallback) {
    let module = {};

    let constants = Constants();

    let status = gameStatus.status;
    let me = status.players[status.meId];

    let physicsEngine;
    let uiEngine;

    /**
     * Initializes the game engine by creating and initializing UI and physics engines.
     */
    module.init = function () {
        // Initialize p5 library
        module.p5Lib = new p5();

        // Initialize physics engine
        physicsEngine = PhysicsEngine(module.p5Lib);
        physicsEngine.init();

        // Initialize UI engine
        uiEngine = UIEngine(module.p5Lib);
        uiEngine.init();
    };

    /**
     * Resets game engine variables.
     *
     */
    module.reset = function () {
        physicsEngine.init();

        status = gameStatus.status;
        me = status.players[status.meId];
    };

    /**
     * Main game loop function.
     * Keeps running until our main player got eaten or disconnected.
     */
    module.gameEngineLoop = function () {
        // Increase deltas to prepare for physics and forcing positions steps
        physicsEngine.increaseTimers();

        // Get main player mouse angle
        processUserInputs();

        // Update game object
        update();

        // Draw the game
        draw();

        // Stop when dead
        if (!status.env.running) {
            gameOverCallback();
            return;
        }

        // Repeat game loop
        requestAnimationFrame(module.gameEngineLoop);
    };

    /**
     * Processes user inputs.
     */
    let processUserInputs = function () {
        if (status.env.rollback || status.env.forcePosition) return;

        // Capture new angle
        let x1 = window.innerWidth / 2;
        let y1 = window.innerHeight / 2;
        let x2 = module.p5Lib.mouseX;
        let y2 = module.p5Lib.mouseY;

        // Update my player angle
        me.angle = Math.atan2(y2 - y1, x2 - x1);
    };

    /**
     * Adds new object to the game after receiving them from the server.
     */
    let updateCanvasObjects = function () {
        // Add new gems canvas params
        for (let key in status.newGems) {
            let gem = status.newGems[key];
            status.gems[gem.id] = gem;

            uiEngine.addGemCanvasParams(status.gems[gem.id]);
        }

        // Flush new gems array
        status.newGems = {};

        // Add new players canvas params
        for (let key in status.newPlayers) {
            let player = status.players[key];
            let playerInfo = status.newPlayers[key];

            Object.assign(player, playerInfo);

            uiEngine.addPlayerCanvasParams(player);
        }

        // Flush new players array
        status.newPlayers = {};
    };

    /**
     * Updates game objects.
     */
    let update = function () {
        // Add canvas parameters to new game objects
        updateCanvasObjects();

        // Sort players by size, to render bigger players at top of smaller ones
        // status.players.sort(function (a, b) {
        //     return (a.radius - b.radius);
        // });

        // Get number of missed physics iterations and reduce the physics lag time
        let count = physicsEngine.narrowPhysicsDelay(status.env.forcePosition);

        // Lag is to much, happens with tab out, let's roll back to server now!
        if (count === -1) {
            physicsEngine.forceServerPositions(status.players);
            status.env.forcePosition = false;
            return;
        }

        // Perform physics in a loop by the number of the threshold spent before getting here again
        while (count--) {
            // Move all players
            physicsEngine.movePlayers(status.players, status.meId, status.env.rollback);

            // Push this angle to be sent to server
            gameStatus.pushAngleToBuffer(me.angle);
        }
    };

    /**
     * Draws game objects.
     */
    let draw = function () {
        let factor = (physicsEngine.timers.lagToHandlePhysics / constants.general.UPDATE_PHYSICS_THRESHOLD);

        // Interpolate some physics to handle lag
        for (let key in status.players) {
            physicsEngine.updatePlayerPosition(status.players[key], factor);
        }

        // Call UI Draw function
        uiEngine.draw(me, status.players, status.gems, physicsEngine.timers.elapsed);

        // Clear then draw the head up display
        uiEngine.drawHUD(me.score, physicsEngine.timers.elapsed, status.env.ping);

        // Revert the applied physics
        for (let key in status.players) {
            physicsEngine.updatePlayerPosition(status.players[key], -factor);
        }
    };

    return module;
};
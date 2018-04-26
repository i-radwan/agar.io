// Imports
import PhysicsEngine from "./PhysicsEngine.js";
import UIEngine from "./UIEngine.js";
import Constants from "./Constants.js";

export default function (gameStatus, gameOverCallback) {
    let module = {};

    let constants = Constants();

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
        uiEngine.init(gameStatus.status.me);
    };

    /**
     * Resets game engine variables.
     *
     */
    module.reset = function () {
        physicsEngine.init();
    };

    /**
     * Main game loop function.
     * Keeps running until our main player got eaten or disconnected.
     */
    module.gameEngineLoop = function () {
        // Increase deltas to prepare for physics and forcing positions steps
        physicsEngine.increaseTimers();

        // Get mouse angle
        processUserInputs();

        // Update game status
        update();

        // Draw the game
        drawGame();

        // Stop when dead
        if (!gameStatus.status.env.running) {
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
        if (gameStatus.status.env.rollback || gameStatus.status.me.forcePosition) return;

        // Capture new angle
        let x1 = window.innerWidth / 2;
        let y1 = window.innerHeight / 2;
        let x2 = module.p5Lib.mouseX;
        let y2 = module.p5Lib.mouseY;

        // Update my player angle
        gameStatus.status.me.angle = Math.atan2(y2 - y1, x2 - x1);
    };

    /**
     * Update the objects on the canvas (after getting update from server)
     */
    let updateCanvasObjects = function () {
        // Add new gems canvas params
        for (let key in gameStatus.status.newGems) {
            let gem = gameStatus.status.newGems[key];
            gameStatus.status.gems[gem.id] = gem;

            uiEngine.addGemCanvasParams(gameStatus.status.gems[gem.id]);
        }

        // Flush new gems array
        gameStatus.status.newGems = {};

        // Update players
        for (let key in gameStatus.status.players) {
            let player = gameStatus.status.players[key];

            if (!player.hasOwnProperty("canvasX")) { // New player generated -> Draw it
                uiEngine.addPlayerCanvasParams(player);
            }
        }

        // Add new players canvas params
        // for (let key in gameStatus.status.newPlayers) {
        //     let player = gameStatus.status.newPlayers[key];
        //     gameStatus.status.players[player.id] = player;
        //     uiEngine.addPlayerCanvasParams(player);
        // }

        // Flush new players array
        // gameStatus.status.newPlayers = {};
    };

    let update = function () {
        // Add canvas parameters to new game objects
        updateCanvasObjects();

        // Sort players by size, to render bigger players @ top of smaller ones
        gameStatus.status.players.sort(function (a, b) {
            return (a.radius - b.radius);
        });

        // Get number of missed physics iterations and reduce the physics lag time
        let count = physicsEngine.narrowPhysicsDelay(gameStatus.status.me);

        // Lag is to much, happens with tab out, let's roll back to server now!
        if (count === -1) {
            physicsEngine.forceServerPositions(gameStatus.status.players);
            return;
        }

        // Perform physics in a loop by the number of the threshold spent before getting here again
        while (count--) {
            // Update the game status (My location, players, gems, score, ... etc) and physics
            physicsEngine.moveObjects(gameStatus.status.me, gameStatus.status.players, gameStatus.status.env.rollback);

            // Push this angle to be sent to server
            gameStatus.pushAngleToBuffer(gameStatus.status.me.angle);
        }
    };

    let drawGame = function () {
        let factor = (physicsEngine.timers.lagToHandlePhysics / constants.general.UPDATE_PHYSICS_THRESHOLD);

        // Interpolate some physics to handle lag
        for (let key in gameStatus.status.players) {
            physicsEngine.updatePlayerPosition(gameStatus.status.players[key], factor);
        }

        // Call UI Draw function
        uiEngine.draw(gameStatus.status.me, gameStatus.status.players, gameStatus.status.gems, physicsEngine.timers.elapsed);

        // Clear then draw the head up display
        uiEngine.drawHUD(gameStatus.status.me.score, physicsEngine.timers.elapsed, gameStatus.status.env.ping);

        // Revert the applied physics
        for (let key in gameStatus.status.players) {
            physicsEngine.updatePlayerPosition(gameStatus.status.players[key], -factor);
        }
    };

    return module;
};
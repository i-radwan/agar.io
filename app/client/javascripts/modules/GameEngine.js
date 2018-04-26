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
        uiEngine.init(gameStatus.status.me, gameStatus.status.players, gameStatus.status.gems);
    };

    /**
     * Resets game engine variables.
     *
     */
    module.reset = function () {
        physicsEngine.init();

        uiEngine.bindGameStatusObjects(gameStatus.status.me, gameStatus.status.players, gameStatus.status.gems);
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

        // Update canvas objects
        updateCanvasObjects();

        // Move players
        physicsEngine.applyPhysics(gameStatus.status.me, gameStatus.status.players, gameStatus.status.env.lerping);

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
        if (gameStatus.status.env.lerping) return;

        // Capture new angle
        let x1 = window.innerWidth / 2;
        let y1 = window.innerHeight / 2;
        let x2 = module.p5Lib.mouseX;
        let y2 = module.p5Lib.mouseY;

        let angle = Math.atan2(y2 - y1, x2 - x1);

        // Update my player angle
        gameStatus.status.me.angle = angle;

        // Push this angle to be sent to server
        let anglesQueue = gameStatus.status.anglesQueue;

        anglesQueue.mouseAngles[anglesQueue.mouseAngles.length - 1].angles.push(angle);
        anglesQueue.anglesBufferSize++;
    };

    let drawGame = function () {
        // ToDo: Iterate over objects, call UIEngine draw function
        uiEngine.draw(physicsEngine.timers.lagToHandlePhysics, physicsEngine.timers.elapsed, gameStatus.status.env.ping);
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

        // Fix z index of objects
        uiEngine.sortPlayersBySize();
    };

    return module;
};
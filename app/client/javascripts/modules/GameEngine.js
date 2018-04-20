// Imports
import PhysicsEngine from "./PhysicsEngine.js";
import UIEngine from "./UIEngine.js";
import Constants from "./Constants.js";

export default function (gameStatus) {
    let module = {};
    let constants = Constants();

    let physicsEngine;
    let uiEngine;

    // Timing variables
    let timers = {
        now: window.performance.now(),
        elapsed: window.performance.now(),
        lagToHandlePhysics: 0,
        forceServerPositionsTimer: 0
    };

    module.init = function () {
        // Initialize p5 library
        module.p5Lib = new p5();

        physicsEngine = PhysicsEngine(module.p5Lib);

        uiEngine = UIEngine(module.p5Lib);
        uiEngine.init(gameStatus.status.me, gameStatus.status.players, gameStatus.status.gems); // Initial drawing
    };

    module.reset = function () {
        timers = {
            now: window.performance.now(),
            elapsed: window.performance.now(),
            lagToHandlePhysics: 0,
            forceServerPositionsTimer: 0
        };
    };

    module.gameEngineLoop = function () {
        // Increase deltas to prepare for physics and forcing positions steps
        increaseTimers();

        // Update canvas objects
        updateCanvasObjects();

        // Move players
        applyPhysics();

        // Draw the game
        drawGame();
    };

    let drawGame = function () {
        uiEngine.draw(timers.lagToHandlePhysics, timers.elapsed, gameStatus.status.env.ping);
    };

    let updateGamePhysics = function () {
        // Move players
        gameStatus.status.players.forEach(function (player) {
            if (player.id === gameStatus.status.me.id) return;

            physicsEngine.movePlayerToPosition(player, {x: player.x, y: player.y});
        });

        // Move main player
        physicsEngine.moveMainPlayer(gameStatus.status.me, gameStatus.status.anglesQueue, gameStatus.status.env.lerping);
    };

    let increaseTimers = function () {
        // Calculate total time spent outside
        timers.elapsed = window.performance.now() - timers.now;
        timers.now = window.performance.now();
        timers.lagToHandlePhysics += timers.elapsed;
        timers.forceServerPositionsTimer += timers.elapsed;
    };

    let applyPhysics = function () {
        // Lag is to much, happens with tab out, let's roll back to server now!
        if (timers.lagToHandlePhysics > constants.general.FORCE_SERVER_POSITIONS_TIME || gameStatus.status.me.forcePosition) {
            console.log("Force");
            forceServerPositions();
            return;
        }

        // Perform physics in a loop by the number of the threshold spent before getting here again
        while (timers.lagToHandlePhysics >= constants.general.UPDATE_PHYSICS_THRESHOLD) {
            // Update the game status (My location, players, gems, score, ... etc) and physics
            updateGamePhysics();

            timers.lagToHandlePhysics -= constants.general.UPDATE_PHYSICS_THRESHOLD;
        }
    };

    let forceServerPositions = function () {
        // Move players to server position
        for (let key in gameStatus.status.players) {
            physicsEngine.forceServerPosition(gameStatus.status.players[key]);
        }

        timers.lagToHandlePhysics = 0;
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

            if (!player.alive) { // Player is dead
                delete gameStatus.status.players[key];
            }
            else if (!player.hasOwnProperty("canvasObjectType")) { // New player generated -> Draw it
                uiEngine.addPlayerCanvasParams(player);
            }
        }

        // Fix z index of objects
        uiEngine.sortPlayersBySize();
    };

    return module;
};
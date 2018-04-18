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
        uiEngine.init(); // Initial drawing

        // Draw initial game status
        initGameCanvasObjects();
    };

    module.gameEngineLoop = function () {
        // Increase deltas to prepare for physics and forcing positions steps
        increaseTimers();

        // If server status received
        checkServerResponse();

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
        gameStatus.status.players.concat(gameStatus.status.me).forEach(function (player) {
            physicsEngine.forceServerPosition(player);
        });

        timers.lagToHandlePhysics = 0;
    };

    /**
     * Check if server has sent new updates, and update the canvas objects if response is received
     */
    let checkServerResponse = function () {
        // Update canvas objects
        updateCanvasObjects();
    };

    /**
     * Update the objects on the canvas (after getting update from server)
     */
    let updateCanvasObjects = function () {
        // Update gems
        gameStatus.status.gems.forEach(function (gem, key) {
            uiEngine.updateGem(gem);

            if (gem.eaten)
                delete gameStatus.status.gems[key];
        });

        // Update players (including me)
        gameStatus.status.players.concat(gameStatus.status.me).forEach(function (player, key) {
            uiEngine.updatePlayer(player);

            if (!player.alive) {
                delete gameStatus.status.players[key];
            }
        });

        // Fix z index of objects
        uiEngine.sortObjectsBySize();
    };

    let initGameCanvasObjects = function () {
        // Draw gems
        gameStatus.status.gems.forEach(function (gem) {
            uiEngine.addGem(gem);
        });

        // Draw players
        gameStatus.status.players.forEach(function (player) {
            uiEngine.addPlayer(player);
        });

        // Draw myself
        uiEngine.addMainPlayer(gameStatus.status.me);

        // Fix z index of objects
        uiEngine.sortObjectsBySize();
    };

    return module;
};
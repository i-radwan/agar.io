// Imports
import PhysicsEngine from "./PhysicsEngine.js";
import UIEngine from "./UIEngine.js";
import Constants from "./Constants.js";

export default function (gameStatus, serverGameStatus) {
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
        config();

        physicsEngine = PhysicsEngine();

        uiEngine = UIEngine();
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
        uiEngine.draw(timers.lagToHandlePhysics, timers.elapsed, gameStatus.status.env.lerpingRatio, gameStatus.status.env.ping);
    };

    let updateGamePhysics = function () {
        // Get mouse angle
        physicsEngine.getMouseAngle(gameStatus.status.me, {
            x: mouseX,
            y: mouseY
        }, gameStatus.status.anglesQueue, gameStatus.status.env.lerping);

        // Move players
        gameStatus.status.players.concat(gameStatus.status.me).forEach(function (player) {
            physicsEngine.movePlayer(player, player.id === gameStatus.status.me.id, gameStatus.status.env);
        });
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
        if (gameStatus.status.env.serverResponseReceived) {
            // Update local gameStatus by serverGameStatus
            gameStatus.set(serverGameStatus);

            // Update canvas objects
            updateCanvasObjects();
        }
    };

    /**
     * Update the objects on the canvas (after getting update from server)
     */
    let updateCanvasObjects = function () {
        // Update gems
        gameStatus.status.gems.forEach(function (gem, idx) {
            uiEngine.updateGem(gem);

            if (gem.removed) {
                gameStatus.status.gems.splice(idx, 1);
            }
        });

        // Update players (including me)
        gameStatus.status.players.concat(gameStatus.status.me).forEach(function (player, idx) {
            uiEngine.updatePlayer(player);

            if (player.removed) {
                gameStatus.status.players.splice(idx, 1);
            }
        });

        // Fix z index of objects
        uiEngine.fixObjectsZIndex();
    };

    let initGameCanvasObjects = function () {
        // Draw gems
        for (let i = 0; i < gameStatus.status.gems.length; i++) {
            uiEngine.addGem(gameStatus.status.gems[i]);
        }

        // Draw players
        for (let i = 0; i < gameStatus.status.players.length; i++) {
            uiEngine.addPlayer(gameStatus.status.players[i]);
        }

        // Draw myself
        uiEngine.addMainPlayer(gameStatus.status.me);

        // Fix z index of objects
        uiEngine.fixObjectsZIndex();
    };

    let config = function () {
        // Stop scrolling for mobile devices
        $('body').bind('touchmove', function (e) {
            e.preventDefault();
        });
    };

    return module;
};
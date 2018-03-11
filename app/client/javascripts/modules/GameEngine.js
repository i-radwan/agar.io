/**
 * Created by ibrahimradwan on 3/3/18.
 */
// Imports
import PhysicsEngine from "./PhysicsEngine.js";
import UIEngine from "./UIEngine.js";

// Constants
let FAST_FORWARD_SPEED = 50;

export default function (gameStatus, serverGameStatus) {
    let module = {};

    let physicsEngine;
    let uiEngine;

    module.init = function () {
        config();

        physicsEngine = PhysicsEngine();

        uiEngine = UIEngine(gameStatus.status.env.mousePosition);
        uiEngine.init(); // Initial drawing

        // Draw initial game status
        initGameDraw();
    };

    module.drawGame = function () {
        uiEngine.draw();
    };

    module.updateGameStatus = function () {
        // If server status received
        checkServerResponse();

        // Normal playing mode
        if (!gameStatus.status.env.fastForward) {
            executeNormalGameMode();
        }
        else { // Fast forward mode to catch up the server
            executeFastForwardGameMode();
        }
    };

    let checkServerResponse = function () {
        if (gameStatus.status.env.serverResponseReceived) {
            // Update gameStatus by serverGameStatus
            gameStatus.set(serverGameStatus);

            // Update canvas objects
            updateCanvasObjects();
        }

        // Check if fast forward is needed
        // checkIfFastForwardNeeded();
    };

    /**
     * Execute the game in normal mode
     * move the players depending on their velocity and angle
     * move my circle to follow the mouse input
     */
    let executeNormalGameMode = function () {
        // Move my circle to follow the mouse
        physicsEngine.movePlayerToMouse(gameStatus.status.me, {
            x: gameStatus.status.env.mousePosition.mouseX,
            y: gameStatus.status.env.mousePosition.mouseY
        });

        // Move players
        gameStatus.status.players.forEach(function (player) {
            physicsEngine.movePlayerNormally(player);
        });
    };

    /**
     * Execute the game in fast forward mode
     * stops user input and move the players, check if the players positions are fixed
     */
    let executeFastForwardGameMode = function () {
        gameStatus.status.env.fastForward = false;

        // Check if players (including me) are in position
        gameStatus.status.players.concat(gameStatus.status.me).forEach(function (player) {
            let positionNotFixed = checkToContinueFastForward(player);

            // If player still not in position -> move him
            if (positionNotFixed)
                physicsEngine.movePlayerToTarget(player, {x: player.x, y: player.y});

            gameStatus.status.env.fastForward |= positionNotFixed;
        });
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

    /**
     * Check if any player requires to be fast forward moved to match status received from the server
     */
    let checkIfFastForwardNeeded = function () {
        gameStatus.status.players.concat(gameStatus.status.me).forEach(function (player) {
            let isFastForwardRequired = player.fastForward;

            let angleAndDistance = physicsEngine.getAngleAndDistance({
                x: player.canvasObject.left,
                y: player.canvasObject.top
            }, {x: player.x, y: player.y});

            // Check
            if (angleAndDistance.distance > player.velocity && !player.fastForward) {
                isFastForwardRequired = true;

                // Take backup of original values to revert to them after getting to the right position
                player.tmpVelocity = player.velocity;
                player.tmpAngle = player.angle;
                player.velocity = FAST_FORWARD_SPEED;
                player.angle = angleAndDistance.angle;
                player.fastForward = true;
            }

            gameStatus.status.env.fastForward |= isFastForwardRequired;
        });
    };

    /**
     * Check if the player still needs fast forward mode
     * @param player
     * @returns {boolean} false if the player got to the required position received by the server
     */
    let checkToContinueFastForward = function (player) {
        if (!player.fastForward) return false;

        let angleAndDistance = physicsEngine.getAngleAndDistance({
            x: player.canvasObject.left,
            y: player.canvasObject.top
        }, {x: player.x, y: player.y});


        // Check if the error isn't large
        if (angleAndDistance.distance <= player.tmpVelocity) {
            player.angle = player.tmpAngle;
            player.velocity = player.tmpVelocity;
            player.fastForward = false;

            delete player.tmpAngle;
            delete player.tmpVelocity;

            return false;
        }

        return true;
    };

    let initGameDraw = function () {
        // Draw gems
        for (let i = 0; i < gameStatus.status.gems.length; i++) {
            gameStatus.status.gems[i].canvasObject = uiEngine.drawGem(gameStatus.status.gems[i]);
        }

        // Draw players
        for (let i = 0; i < gameStatus.status.players.length; i++) {
            gameStatus.status.players[i].canvasObject = uiEngine.drawPlayer(gameStatus.status.players[i]);
        }

        // Draw myself
        gameStatus.status.me.canvasObject = uiEngine.drawMe(gameStatus.status.me);

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
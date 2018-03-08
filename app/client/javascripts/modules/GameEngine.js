/**
 * Created by ibrahimradwan on 3/3/18.
 */
// Imports
import PhysicsEngine from "./PhysicsEngine.js";
import UIEngine from "./UIEngine.js";

export default function (gameStatus, serverGameStatus) {
    let module = {};

    let physicsEngine;
    let uiEngine;

    module.init = function () {
        config();

        physicsEngine = PhysicsEngine(gameStatus);

        uiEngine = UIEngine(gameStatus.status.env.mousePosition);
        uiEngine.init(); // Initial drawing

        // Draw initial game status
        initGameDraw();
    };

    module.drawGame = function () {
        uiEngine.draw();
    };

    module.updateGameStatus = function () {
        // Normal playing mode
        if (!gameStatus.status.env.fastForward) {
            executeNormalGameMode();
        }
        else { // Fast forward mode to catch up the server
            executeFastForwardGameMode();
        }
    };

    /**
     * Update the objects on the canvas (after getting update from server)
     */
    let updateCanvasObjects = function () {
        // Update gems
        gameStatus.status.gems.forEach(function (gem) {
            uiEngine.updateGem(gem);
        });

        // Update players (including me)
        gameStatus.status.players.concat(gameStatus.status.me).forEach(function (player) {
            uiEngine.updatePlayer(player);

            gameStatus.status.env.fastForward |= playerFastForwardControl(player);
        });

        // Fix z index of objects
        uiEngine.fixObjectsZIndex();
    };

    let executeNormalGameMode = function () {
        // If server status received
        if (gameStatus.status.env.serverResponseReceived) {
            // Update gameStatus by serverGameStatus
            gameStatus.set(serverGameStatus);

            // Remove removed items from the UI
            updateCanvasObjects();
        }

        if (gameStatus.status.env.fastForward) return;

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

    let executeFastForwardGameMode = function () {
        gameStatus.status.env.fastForward = false;

        // Check if players (including me) are in position
        gameStatus.status.players.concat(gameStatus.status.me).forEach(function (player) {
            let positionNotFixed = playerFastForwardControl(player);

            // If player still not in position -> move him
            if (positionNotFixed)
                physicsEngine.movePlayerToTarget(player, {x: player.x, y: player.y}, false);

            gameStatus.status.env.fastForward |= positionNotFixed;
        });
    };

    let playerFastForwardControl = function (player) {
        let angleAndDistance = physicsEngine.getAngleAndDistance({
            x: player.canvasObject.left,
            y: player.canvasObject.top
        }, {x: player.x, y: player.y});


        // Check if the error isn't large
        if ((!player.hasOwnProperty("tmpVelocity") && angleAndDistance.distance <= player.velocity) ||
            (player.hasOwnProperty("tmpVelocity") && angleAndDistance.distance <= player.tmpVelocity)) {

            // Check if player was fast forwarding -> revert to original status
            if (player.hasOwnProperty("tmpAngle")) {
                player.angle = player.tmpAngle;
                player.velocity = player.tmpVelocity;

                delete player.tmpAngle;
                delete player.tmpVelocity;
            }

            return false;
        }

        // Player still is not in position
        if (player.hasOwnProperty("tmpVelocity")) return true;

        // Take backup of original values to revert to it after getting to the right position
        player.tmpVelocity = player.velocity;
        player.tmpAngle = player.angle;
        player.velocity = 50;
        player.angle = angleAndDistance.angle;

        console.log(player.color, angleAndDistance.distance, player.velocity, player.angle, player.tmpVelocity, player.tmpAngle);

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
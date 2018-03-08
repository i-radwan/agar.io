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
        // Update gameStatus by serverGameStatus
        if (gameStatus.status.env.serverResponseReceived) {
            gameStatus.set(serverGameStatus);

            // Remove removed items from the UI
            updateCanvasObjects();
        }

        // Move my circle to follow the mouse
        physicsEngine.movePlayerToMouse(gameStatus.status.me, {
            x: gameStatus.status.env.mousePosition.mouseX,
            y: gameStatus.status.env.mousePosition.mouseY
        });

        // Move players
        gameStatus.status.players.forEach(function (player) {
            physicsEngine.movePlayer(player);
        });
    };

    /**
     * Update the objects on the canvas (after getting update from server)
     */
    let updateCanvasObjects = function () {
        // Update gems
        gameStatus.status.gems.forEach(function (gem) {
            uiEngine.updateGem(gem);
        });

        // Update players
        gameStatus.status.players.forEach(function (player) {
            uiEngine.updatePlayer(player);
        });

        // Update myself
        uiEngine.updatePlayer(gameStatus.status.me);
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
    };

    let config = function () {
        // Stop scrolling for mobile devices
        $('body').bind('touchmove', function (e) {
            e.preventDefault();
        });
    };
    return module;
};
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

        physicsEngine = PhysicsEngine();

        uiEngine = UIEngine();
        uiEngine.init(); // Initial drawing

        // Draw initial game status
        initGameCanvasObjects();
    };

    module.drawGame = function (lag) {
        uiEngine.draw(lag);
    };

    module.updateGameStatus = function () {
        // If server status received
        checkServerResponse();

        // Get mouse angle
        physicsEngine.getMouseAngle(gameStatus.status.me, {x: mouseX, y: mouseY});

        // Move players
        gameStatus.status.players.concat(gameStatus.status.me).forEach(function (player) {
            physicsEngine.movePlayerNormally(player, player.id === gameStatus.status.me.id);
        });
    };

    /**
     * Check if server has sent new updates, and update the canvas objects if response is received
     */
    let checkServerResponse = function () {
        if (gameStatus.status.env.serverResponseReceived) {
            // Update gameStatus by serverGameStatus
            gameStatus.set(serverGameStatus);

            //Update Server Center (Debugging)
            gameStatus.status.me.canvasObject.ServerCenterX = gameStatus.status.me.x;
            gameStatus.status.me.canvasObject.ServerCenterY = gameStatus.status.me.y;

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
            gameStatus.status.gems[i].canvasObject = uiEngine.addGem(gameStatus.status.gems[i]);
        }

        // Draw players
        for (let i = 0; i < gameStatus.status.players.length; i++) {
            uiEngine.addPlayer(gameStatus.status.players[i]);
        }

        // Draw myself
        gameStatus.status.me.canvasObject = uiEngine.addMainPlayer(gameStatus.status.me);

        //Set Server Center (Debugging)
        gameStatus.status.me.canvasObject.ServerCenterX = gameStatus.status.me.x;
        gameStatus.status.me.canvasObject.ServerCenterY = gameStatus.status.me.y;

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
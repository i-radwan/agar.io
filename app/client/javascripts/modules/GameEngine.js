/**
 * Created by ibrahimradwan on 3/3/18.
 */
// Imports
import PhysicsEngine from "./PhysicsEngine.js";
import UIEngine from "./UIEngine.js";

export default function (gameStatus, serverGameStatus) {
    let module = {};

    let physicsEngine = PhysicsEngine(gameStatus);
    let uiEngine = UIEngine(gameStatus);

    module.init = function () {
        config();

        uiEngine.init(); // Initial drawing
    };

    module.drawGame = function () {
        uiEngine.draw();
    };

    module.updateGameStatus = function () {
        // Move my circle to follow the mouse
        physicsEngine.movePlayerToMouse(gameStatus.status._me, {
            x: gameStatus.status._env.mouseX,
            y: gameStatus.status._env.mouseY
        });

        // Move players
        gameStatus.status._players.forEach(function (player) {
            physicsEngine.movePlayer(player);
        });
    };

    let config = function () {
        // Stop scrolling for mobile devices
        $('body').bind('touchmove', function (e) {
            e.preventDefault()
        });
    };
    return module;
};
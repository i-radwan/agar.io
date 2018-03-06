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
        physicsEngine.moveMyCircle();
    };

    let config = function () {
        // Stop scrolling for mobile devices
        $('body').bind('touchmove', function (e) {
            e.preventDefault()
        });
    };
    return module;
};
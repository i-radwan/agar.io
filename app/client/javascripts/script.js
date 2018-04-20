// Imports
import GameStatus from "./modules/GameStatus.js";
import GameEngine from "./modules/GameEngine.js";
import GameServer from "./modules/GameServer.js";
import Constants from "./modules/Constants.js";

// Main game canvasObject
let game = {
    init: function () {
        game.constants = Constants();

        game.gameStatus = GameStatus();

        // Establish server communication
        game.gameServer = GameServer(game.gameStatus);
        game.gameServer.init(game.startGame);
    },

    /**
     * Callback function to be called when the server responds with room status
     */
    startGame: function () {
        game.gameEngine = game.gameEngine || GameEngine(game.gameStatus);
        game.gameEngine.init();

        // Graphics loop
        requestAnimationFrame(game.gameMainLoop);

        // Send game status loop
        setInterval(game.sendAngleLoop, game.constants.general.SEND_ANGLE_TO_SERVER_RATE);
    },

    gameMainLoop: function () {
        // Execute game engine loop
        game.gameEngine.gameEngineLoop();

        // Stop when dead
        if (game.gameStatus.status.me.alive)
            requestAnimationFrame(game.gameMainLoop);
        else
            game.gameOver();
    },

    sendAngleLoop: function () {
        // Send current angle to the server
        game.gameServer.sendAngle();

        // Stop when dead
        if (!game.gameStatus.status.me.alive)
            clearInterval(game.sendAngleLoop);
    },

    gameOver: function () {
        if (confirm("Sry, new round?")) {
            // Clear gameStatus
            game.gameStatus.reset();
            game.gameEngine.reset();
            game.gameServer.reconnect();
        }
    }
};

$(function () {
    game.init();
});
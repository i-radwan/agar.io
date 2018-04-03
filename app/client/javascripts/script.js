/**
 * Created by ibrahimradwan on 3/2/18.
 */
// Imports
import GameStatus from "./modules/GameStatus.js";
import GameEngine from "./modules/GameEngine.js";
import GameServer from "./modules/GameServer.js";

// Constants
const GAME_FPS = 120;
const SEND_ANGLE_TO_SERVER_RATE = 40; // milliseconds

new p5();

// Main game canvasObject
let game = {
    init: function () {
        game.gameStatus = GameStatus();
        game.serverGameStatus = {};

        // Establish server communication
        game.gameServer = GameServer(game.gameStatus, game.serverGameStatus);
        game.gameServer.init(game.startGame);
    },

    /**
     * Callback function to be called when the server responds with room status
     */
    startGame: function () {
        game.gameEngine = GameEngine(game.gameStatus, game.serverGameStatus);
        game.gameEngine.init();

        // Graphics loop
        let gameGraphicsLoop = function () {
            game.gameEngine.drawGame();

            // Stop when dead
            if (game.gameStatus.status.me.alive)
                window.requestAnimationFrame(gameGraphicsLoop);
        };

        window.requestAnimationFrame(gameGraphicsLoop);

        // Physics loop
        let gamePhysicsLoop = setInterval(function () {
            // Update the game status (My location, players, gems, score, ... etc) and physics
            game.gameEngine.updateGameStatus();

            // Stop when dead
            if (!game.gameStatus.status.me.alive)
                clearInterval(gamePhysicsLoop);
        }, 1000 / 120);

        // Send game status loop
        let sendAngleLoop = setInterval(function () {
            // Send current angle to the server
            game.gameServer.sendAngle();

            if (!game.gameStatus.status.me.alive)
                clearInterval(sendAngleLoop);
        }, (1000 / 1200) * 4);
    }
};

$(function () {
    game.init();
});
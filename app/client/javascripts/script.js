/**
 * Created by ibrahimradwan on 3/2/18.
 */
// Imports
import GameStatus from "./modules/GameStatus.js";
import GameEngine from "./modules/GameEngine.js";
import GameServer from "./modules/GameServer.js";

// Constants
const GAME_FPS = 120;
const SEND_STATUS_TO_SERVER_RATE = 3000; // milliseconds

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

        // Game loop
        let gameLoop = setInterval(function () {
            // Send current angle to the server
            if (!game.gameStatus.status.env.fastForward)
                game.gameServer.sendAngle();

            // Update the game status (My location, players, gems, score, ... etc)
            game.gameEngine.updateGameStatus();

            // Redraw the canvas
            game.gameEngine.drawGame();

            // Stop when dead
            // if (!game.gameStatus.status.me.alive)
            //     clearInterval(gameLoop);
        }, 1000 / GAME_FPS);

        // Send game status loop
        let sendStatusLoop = setInterval(function () {
            // Send current state to the server
            game.gameServer.sendStatus();

            if (!game.gameStatus.status.me.alive)
                clearInterval(sendStatusLoop);
        }, SEND_STATUS_TO_SERVER_RATE);
    }
};

// Fire the game
$(function () {
    game.init();
});

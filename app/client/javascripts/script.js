/**
 * Created by ibrahimradwan on 3/2/18.
 */
// Imports
import GameStatus from "./modules/GameStatus.js";
import GameEngine from "./modules/GameEngine.js";
import GameServer from "./modules/GameServer.js";

// Constants
const GAME_FPS = 120;

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
        let _intervalId = setInterval(function () {
            // Send current state to the server
            game.gameServer.sendStatus();

            // Update the game status (My location, players, gems, score, ... etc)
            game.gameEngine.updateGameStatus();

            // Redraw the canvas
            game.gameEngine.drawGame();

            // Stop when dead
            if (!game.gameStatus.status.me.alive)
                clearInterval(_intervalId);
        }, 1000 / GAME_FPS);
    }
};

// Fire the game
$(function () {
    game.init();
});
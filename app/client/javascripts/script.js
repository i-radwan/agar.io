/**
 * Created by ibrahimradwan on 3/2/18.
 */
// Imports
import GameStatus from "./modules/GameStatus.js";
import GameEngine from "./modules/GameEngine.js";
import GameServer from "./modules/GameServer.js";

// Constants
const GAME_FPS = 120;

// Main game object
let game = {
    init: function () {
        // Establish server communication
        game.gameServer = GameServer();
        game.gameServer.init(this.startGame);
    },

    /**
     * Callback function to be called when the server responds with room status
     */
    startGame: function () {
        game.gameStatus = GameStatus();
        game.serverGameStatus = GameStatus();
        game.gameEngine = GameEngine(game.gameStatus, game.serverGameStatus);

        game.gameStatus.init();
        game.serverGameStatus.init();
        game.gameEngine.init();

        // Game loop
        let _intervalId = setInterval(function () {
            // Send current state to the server
            game.gameServer.transmit();

            // Update the game status (My location, players, gems, score, ... etc)
            game.gameEngine.updateGameStatus();

            // Redraw the canvas
            game.gameEngine.drawGame();

            // Stop when dead
            if (!game.gameStatus._me.alive)
                clearInterval(_intervalId);
        }, 1000 / GAME_FPS);
    }
};

// Fire the game
$(function () {
    game.init();
});
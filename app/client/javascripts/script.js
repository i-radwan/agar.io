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
const UPDATE_PHYSICS_THRESHOLD = 15;

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
        let lag = 0, now = window.performance.now();
        let gameGraphicsLoop = function () {
            let elapsed = window.performance.now() - now;
            now = window.performance.now();
            lag += elapsed;

            while(lag >= UPDATE_PHYSICS_THRESHOLD) {
                // Update the game status (My location, players, gems, score, ... etc) and physics
                game.gameEngine.updateGameStatus();

                lag -= UPDATE_PHYSICS_THRESHOLD;
            }

            game.gameEngine.drawGame(lag);

            game.gameStatus.status.env.graphicsFrameDelta = window.performance.now() - now;

            // Stop when dead
            if (game.gameStatus.status.me.alive)
                requestAnimationFrame(gameGraphicsLoop);
        };

        requestAnimationFrame(gameGraphicsLoop);

        // Send game status loop
        let sendAngleLoop = setInterval(function () {
            // Send current angle to the server
            game.gameServer.sendAngle();

            if (!game.gameStatus.status.me.alive)
                clearInterval(sendAngleLoop);
        }, (1000 / 120) * 4);
    }
};

$(function () {
    game.init();
});
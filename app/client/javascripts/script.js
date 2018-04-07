/**
 * Created by ibrahimradwan on 3/2/18.
 */
// Imports
import GameStatus from "./modules/GameStatus.js";
import GameEngine from "./modules/GameEngine.js";
import GameServer from "./modules/GameServer.js";
import Constants from "./modules/Constants.js";

new p5();

// Main game canvasObject
let game = {

    init: function () {
        game.constants = Constants();

        game.gameStatus = GameStatus();
        game.serverGameStatus = {};

        // Establish server communication
        game.gameServer = GameServer(game.gameStatus, game.serverGameStatus);
        game.gameServer.init(game.startGame);

        // Timing variables
        game.now = window.performance.now();
        game.elapsed = window.performance.now() - game.now;
        game.lagToHandlePhysics = 0;
        game.forceServerPositionsTimer = 0;
    },

    /**
     * Callback function to be called when the server responds with room status
     */
    startGame: function () {
        game.gameEngine = GameEngine(game.gameStatus, game.serverGameStatus);
        game.gameEngine.init();

        // Graphics loop
        requestAnimationFrame(game.gameMainLoop);

        // Send game status loop
        setInterval(game.sendAngleLoop, game.constants.general.SEND_ANGLE_TO_SERVER_RATE);
    },

    gameMainLoop: function () {
        // Increase deltas to prepare for physics and forcing positions steps
        game.increaseTimers();

        game.applyPhysics();

        game.forceServerPositions();

        // Draw the game
        game.gameEngine.drawGame(game.lagToHandlePhysics, game.elapsed);

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

    increaseTimers: function () {
        // Calculate total time spent outside
        game.elapsed = window.performance.now() - game.now;
        game.now = window.performance.now();
        game.lagToHandlePhysics += game.elapsed;
        game.forceServerPositionsTimer += game.elapsed;
    },

    applyPhysics: function () {
        // Perform physics in a loop by the number of the threshold spent before getting here again
        while (game.lagToHandlePhysics >= game.constants.general.UPDATE_PHYSICS_THRESHOLD) {

            // Update the game status (My location, players, gems, score, ... etc) and physics
            game.gameEngine.updateGameStatus();

            game.lagToHandlePhysics -= game.constants.general.UPDATE_PHYSICS_THRESHOLD;
        }
    },

    forceServerPositions: function () {
        // Force server positions every FORCE_SERVER_POSITIONS_TIME
        if (game.forceServerPositionsTimer > game.constants.general.FORCE_SERVER_POSITIONS_TIME) {
            game.gameEngine.forceServerPositions();
            game.forceServerPositionsTimer = 0;
        }
    },

    gameOver: function () {
        alert("Sry!");
    }
};

$(function () {
    game.init();
});
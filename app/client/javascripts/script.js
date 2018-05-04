// Imports
import GameStatus from "./modules/GameStatus.js";
import GameEngine from "./modules/GameEngine.js";
import GameServer from "./modules/GameServer.js";
import Constants from "./modules/Constants.js";

// Main client-side code
let game = {

    /**
     * Initializes client communication with the server.
     */
    init: function () {
        game.constants = Constants();

        // Initialize game status
        game.gameStatus = GameStatus();
        game.gameStatus.init();

        // Establish server communication
        game.gameServer = GameServer(game.gameStatus, game.errorMsgCallback);
        game.gameServer.init(game.startGame);
    },

    /**
     * Initializes the game engine and starts the main game loop.
     * Callback function to be called when the server responds with initial game status.
     */
    startGame: function () {
        // Setup game engine
        game.gameEngine = GameEngine(game.gameStatus, game.gameOver);
        game.gameEngine.init();

        // Start game loop
        requestAnimationFrame(game.gameEngine.gameEngineLoop);

        // Register send angle function to be called every specific interval of time
        setInterval(game.gameServer.sendAngle, game.constants.general.SEND_ANGLE_TO_SERVER_RATE);
    },

    /**
     * Asks to restart the game.
     * Callback function to be called only when the game is over.
     */
    gameOver: function () {
        // Stop sending player angle
        clearInterval(game.gameServer.sendAngle);

        // Redirect to authentication page
        window.location = game.constants.general.AUTH_URL;
    },
};

//
// Start running the client-side code
//
$(function () {
    game.init();
});
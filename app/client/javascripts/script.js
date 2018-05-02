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
        game.gameServer = GameServer(game.gameStatus);
        game.gameServer.init(game.startGame);

        // Setup listeners
        game.setupListeners();
    },

    /**
     * Setup buttons
     */
    setupListeners: function () {
        let playBtn = $("#play-btn");
        let loginBtn = $("#login-btn");
        let registerBtn = $("#signup-btn");

        let name = $("#name-field").val().trim();
        let username = $("#username-field").val().trim();
        let password = $("#password-field").val().trim();

        let errorMsg = $("#error-msg");

        playBtn.click(function () {
            if (name.length <= 0) {
                errorMsg.html("Please enter valid name!");
                return;
            }

            let msg = {
                type: game.constants.general.GUEST_MSG_TYPE,
                name: name
            };

            game.gameServer.sendSubscribeRequest(msg);
        });

        loginBtn.click(function () {
            if (username.length <= 0 || password.length <= 0) {
                errorMsg.html("Please enter valid credentials!");
                return;
            }

            let msg = {
                type: game.constants.general.LOGIN_MSG_TYPE,
                username: username,
                password: password
            };

            game.gameServer.sendSubscribeRequest(msg);
        });

        registerBtn.click(function () {
            if (username.length <= 0 || password.length <= 0) {
                errorMsg.html("Please enter valid credentials!");
                return;
            }

            let msg = {
                type: game.constants.general.REGISTER_MSG_TYPE,
                username: username,
                password: password
            };

            game.gameServer.sendSubscribeRequest(msg);
        });
    },

    /**
     * Initializes the game engine and starts the main game loop.
     * Callback function to be called when the server responds with initial game status.
     */
    startGame: function () {
        if (game.gameEngine) {
            game.gameEngine.reset();
        } else {
            game.gameEngine = GameEngine(game.gameStatus, game.gameOver);
            game.gameEngine.init();
        }

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

        // Ask the user to restart the game
        if (confirm("Sry, new round?")) {
            game.gameServer.reconnect();
        }
    }
};

//
// Start running the client-side code
//
$(function () {
    game.init();
});
/**
 * Created by ibrahimradwan on 3/2/18.
 */
// Imports
import gt from './modules/GameStatus.js';
import ge from './modules/GameEngine.js';
import gs from './modules/GameServer.js';

// Constants
const CANVAS_ID = "canvas";
const GAME_FPS = 50;

// Start
let gameServer = gs();

$(function () {
    // Initialize
    gameServer.init(startGameLoop);
});

function startGameLoop() {
    let canvas = new fabric.Canvas(CANVAS_ID, {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#ffffff",
        hoverCursor: "default",
        selection: false
    });

    let gameStatus = gt();
    let gameEngine = ge(gameStatus, canvas);

    gameStatus.init();
    gameEngine.init();

    // Game loop
    gameStatus._intervalId = setInterval(function () {
        // Send current state to the server
        gameServer.transmit();

        // Update the game graphics
        gameEngine.draw();

        // Stop when dead
        if (!gameStatus._me.alive)
            clearInterval(gameStatus._intervalId);
    }, 1000 / GAME_FPS);
}
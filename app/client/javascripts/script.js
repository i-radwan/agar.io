/**
 * Created by ibrahimradwan on 3/2/18.
 */
// Imports
import gt from './modules/GameStatus.js';
import ge from './modules/GameEngine.js';
import gs from './modules/GameServer.js';

// Constants
const CANVAS_ID = "canvas";
const GAME_FPS = 25;

let canvas = new fabric.Canvas(CANVAS_ID, {
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#ffffff",
    hoverCursor: "default",
    selection: false
});

let gameStatus = gt();
let gameEngine = ge(gameStatus, canvas);
let gameServer = gs();

// Start
$(function () {
    // Initialize
    gameStatus.init();
    gameServer.init();
    gameEngine.init();

    // Game loop
    gameStatus._intervalId = setInterval(function () {
        gameEngine.update();
        gameServer.transmit();

        gameEngine.draw();

        // Stop when dead
        if (!gameStatus._me.alive)
            clearInterval(gameStatus._intervalId);
    }, 1000 / GAME_FPS);
});
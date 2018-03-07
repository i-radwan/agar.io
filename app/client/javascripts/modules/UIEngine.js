/**
 * Created by ibrahimradwan on 3/6/18.
 */

// Constants
const CANVAS_BACKGROUND_LINES_SEPARATION = 30;
const CANVAS_ID = "canvas";
const BACKGROUND_CANVAS_ID = "background_canvas";

export default function (gameStatus) {
    let module = {};

    let canvas = new fabric.Canvas(CANVAS_ID, {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "transparent",
        hoverCursor: "default",
        selection: false
    });

    let backgroundCanvas = new fabric.StaticCanvas(BACKGROUND_CANVAS_ID, {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "white",
        hoverCursor: "none",
        selection: false
    });

    module.init = function () {
        config();

        initDraw();
    };

    /**
     * Refresh the drawing due to game status update
     */
    module.draw = function () {
        canvas.renderAll();
    };

    /**
     * Initially draw objects/background on the fabric canvas
     */
    let initDraw = function () {
        drawBackgroundLines();
        drawGems();
        drawPlayers();
        drawMe();
        drawScore();

        backgroundCanvas.renderAll();
    };

    let drawBackgroundLines = function () {
        // Draw background lines
        for (let i = CANVAS_BACKGROUND_LINES_SEPARATION;
             i <= Math.max(window.innerWidth, window.innerHeight) - CANVAS_BACKGROUND_LINES_SEPARATION;
             i += CANVAS_BACKGROUND_LINES_SEPARATION) {
            backgroundCanvas.add(
                new fabric.Line([i, 0, i, window.innerHeight], {
                    stroke: '#eee'
                }),
                new fabric.Line([0, i, window.innerWidth, i], {
                    stroke: '#eee'
                })
            );
        }
    };

    let drawGems = function () {
        for (let i = 0; i < gameStatus.status._gems.length; i++) {
            gameStatus.status._gems[i].canvasObject = drawCircle(gameStatus.status._gems[i]);
            canvas.add(gameStatus.status._gems[i].canvasObject);
        }
    };

    let drawPlayers = function () {
        for (let i = 0; i < gameStatus.status._players.length; i++) {
            gameStatus.status._players[i].canvasObject = drawCircle(gameStatus.status._players[i]);
            canvas.add(gameStatus.status._players[i].canvasObject);
        }
    };

    let drawMe = function () {
        gameStatus.status._me.canvasObject = drawCircle(gameStatus.status._me);
        canvas.add(gameStatus.status._me.canvasObject);
    };

    let drawScore = function () {
        // ToDo: Draw score text
    };

    let drawCircle = function (parameters) {
        return new fabric.Circle({
            left: parameters.x,
            top: parameters.y,
            radius: parameters.radius,
            fill: parameters.color,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
            selection: false
        });
    };

    let config = function () {
        // Get mouse coordinates
        canvas.on('mouse:move', function (options) {
            gameStatus.status._env.mouseX = options.e.layerX;
            gameStatus.status._env.mouseY = options.e.layerY;
        });
    };
    return module;
};
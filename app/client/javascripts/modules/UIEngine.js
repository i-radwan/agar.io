/**
 * Created by ibrahimradwan on 3/6/18.
 */

// Constants
const CANVAS_BKGD_LINES_SEPARATION = 30;
const CANVAS_ID = "canvas";

export default function (gameStatus) {
    let module = {};

    let canvas = new fabric.Canvas(CANVAS_ID, {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#ffffff",
        hoverCursor: "default",
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

        canvas.renderAll();
    };

    let drawBackgroundLines = function () {
        // Draw background lines
        for (let i = CANVAS_BKGD_LINES_SEPARATION;
             i <= Math.max(window.innerWidth, window.innerHeight) - CANVAS_BKGD_LINES_SEPARATION;
             i += CANVAS_BKGD_LINES_SEPARATION) {
            canvas.add(
                new fabric.Line([i, 0, i, window.innerHeight], {
                    stroke: '#eee',
                    hasControls: false,
                    hasBorders: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    selection: false
                }),
                new fabric.Line([0, i, window.innerWidth, i], {
                    stroke: '#eee',
                    hasControls: false,
                    hasBorders: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    selection: false
                })
            );
        }

    };

    let drawGems = function () {
        for (let i = 0; i < gameStatus._gems.length; i++) {
            gameStatus._gems[i].object = drawCircle(gameStatus._gems[i]);
            canvas.add(gameStatus._gems[i].object);
        }
    };

    let drawPlayers = function () {
        for (let i = 0; i < gameStatus._players.length; i++) {
            gameStatus._players[i].object = drawCircle(gameStatus._players[i]);
            canvas.add(gameStatus._players[i].object);
        }
    };

    let drawMe = function () {
        gameStatus._me.object = drawCircle(gameStatus._me);
        canvas.add(gameStatus._me.object);
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
            gameStatus.env.mouseX = options.e.layerX;
            gameStatus.env.mouseY = options.e.layerY;
        });
    };
    return module;
};
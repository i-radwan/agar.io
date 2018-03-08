/**
 * Created by ibrahimradwan on 3/6/18.
 */

// Constants
const CANVAS_BACKGROUND_LINES_SEPARATION = 30;
const GEM_RADIUS = 10;
const CANVAS_ID = "canvas";
const BACKGROUND_CANVAS_ID = "background_canvas";

export default function (mousePosition) {
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

        drawBackgroundLines();
    };

    /**
     * Refresh the drawing due to game status update
     */
    module.draw = function () {
        canvas.renderAll();
    };

    module.drawGem = function (gemObject) {
        return drawCircle(gemObject);
    };

    module.drawPlayer = function (playerObject) {
        return drawCircle(playerObject);
    };

    module.drawMe = function (myselfObject) {
        return drawCircle(myselfObject);
    };

    module.drawScore = function () {
        // ToDo: Draw score text
    };

    module.updateGem = function (gemObject) {
        if (gemObject.removed) { // Gem has been eaten
            gemObject.canvasObject.remove();
        }
        else if (!gemObject.hasOwnProperty("canvasObject")) { // New gem generated -> Draw it
            gemObject.canvasObject = module.drawGem(gemObject);
        }
    };

    module.updatePlayer = function (playerObject) {
        if (playerObject.removed) { // Player is dead
            playerObject.canvasObject.remove();
        }
        else if (!playerObject.hasOwnProperty("canvasObject")) { // New gem generated -> Draw it
            playerObject.canvasObject = module.drawPlayer(playerObject);
        }
        else { // Player existed and still -> update radius
            playerObject.canvasObject.left = playerObject.x;
            playerObject.canvasObject.top = playerObject.y;
            playerObject.canvasObject.setRadius(playerObject.radius);
        }
    };

    module.updateScore = function (scoresObject) {

    };

    module.fixObjectsZIndex = function () {
        // Create array of all lengths
        let lengthsArray = [];
        canvas.forEachObject(function (object) {
            lengthsArray.push({r: object.radius, obj: object});
        });

        // Sort the array
        lengthsArray.sort(function (a, b) {
            return (a.r - b.r);
        });

        // Move the objects following the new order
        lengthsArray.forEach(function (object, idx) {
            object.obj.moveTo(idx);
        });
    };

    let drawBackgroundLines = function () {
        // Draw background lines
        for (
            let i = CANVAS_BACKGROUND_LINES_SEPARATION;
            i <= Math.max(window.innerWidth, window.innerHeight) - CANVAS_BACKGROUND_LINES_SEPARATION;
            i += CANVAS_BACKGROUND_LINES_SEPARATION
        ) {
            backgroundCanvas.add(
                new fabric.Line([i, 0, i, window.innerHeight], {
                    stroke: '#eee'
                }),
                new fabric.Line([0, i, window.innerWidth, i], {
                    stroke: '#eee'
                })
            );
        }

        backgroundCanvas.renderAll();
    };

    let drawCircle = function (parameters) {
        let circle = new fabric.Circle({
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

        canvas.add(circle);

        return circle;
    };

    let config = function () {
        // Get mouse coordinates
        canvas.on('mouse:move', function (options) {
            mousePosition.mouseX = options.e.layerX;
            mousePosition.mouseY = options.e.layerY;
        });
    };

    return module;
};
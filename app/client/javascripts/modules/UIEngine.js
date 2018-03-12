/**
 * Created by ibrahimradwan on 3/6/18.
 */

// Constants
const CANVAS_BACKGROUND_LINES_SEPARATION = 30;
const MAX_ZOOM_THRESHOLD = 50;
const MIN_ZOOM_THRESHOLD = 30;
const START_BLOB_RADIUS = 30;


export default function (gameWidth, gameHeight) {
    let module = {};

    let canvasObjects = [];
    let mainPlayer;
    let zoom = 1, targetZoom = 1;

    module.init = function () {
        // Create canvas
        createCanvas(window.innerWidth, window.innerHeight);
        background(0);

        // drawBackgroundLines();
    };

    /**
     * Refresh the drawing due to game status update
     */
    module.draw = function () {
        push();

        //
        // Camera setup
        //

        // Translate camera to screen center
        translate(window.innerWidth/2, window.innerHeight / 2);

        // Scaling (interpolated)
        if ((targetZoom * mainPlayer.radius) > MAX_ZOOM_THRESHOLD || (targetZoom * mainPlayer.radius) < MIN_ZOOM_THRESHOLD)
            targetZoom = START_BLOB_RADIUS / mainPlayer.radius;

        zoom = lerp(zoom, targetZoom, 0.05);
        scale(zoom);

        // Translate camera to player center
        translate(-mainPlayer.x, -mainPlayer.y);


        //
        // Drawing
        //

        // Clear everything
        background(0);

        // Draw all objects
        for (let i = 0; i < canvasObjects.length; i++) {
            canvasObjects[i].draw();
        }
        pop();
    };

    module.drawGem = function (gemObject) {
        gemObject.isBlob = false;

        return drawCircle(gemObject);
    };

    module.drawPlayer = function (playerObject) {
        playerObject.isBlob = true;

        return drawCircle(playerObject);
    };

    module.drawMe = function (myselfObject) {
        myselfObject.isBlob = true;

        return mainPlayer = drawCircle(myselfObject);
    };

    module.drawScore = function () {
        // ToDo: Draw score text
    };

    module.updateGem = function (gemObject) {
        if (gemObject.removed) { // Gem has been eaten
            canvasObjects.splice(canvasObjects.indexOf(gemObject.canvasObject), 1);
        }
        else if (!gemObject.hasOwnProperty("canvasObject")) { // New gem generated -> Draw it
            gemObject.canvasObject = module.drawGem(gemObject);
        }
        else {
            gemObject.canvasObject.x = gemObject.x;
            gemObject.canvasObject.y = gemObject.y;
        }
    };

    module.updatePlayer = function (playerObject) {
        if (playerObject.removed) { // Player is dead
            canvasObjects.splice(canvasObjects.indexOf(playerObject.canvasObject), 1);
        }
        else if (!playerObject.hasOwnProperty("canvasObject")) { // New gem generated -> Draw it
            playerObject.canvasObject = module.drawPlayer(playerObject);
        }
        else { // Player existed and still -> update radius
            playerObject.canvasObject.setRadius(playerObject.radius);
            playerObject.canvasObject.x = playerObject.x;
            playerObject.canvasObject.y = playerObject.y;
        }
    };

    module.updateScore = function (scoresObject) {

    };

    module.fixObjectsZIndex = function () {
        // Sort the array
        canvasObjects.sort(function (a, b) {
            return (a.radius - b.radius);
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
        let circle = {
            x: parameters.x,
            y: parameters.y,
            radius: parameters.radius,
            color: parameters.color,
            isBlob: parameters.isBlob,

            draw: function () {
                fill(this.color);
                ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
            },
            setRadius: function (r) {
                this.radius = r;
            },
            getCenterPoint: function () {
                return createVector(this.x, this.y);
            }
        };

        circle.draw();

        canvasObjects.push(circle);

        return circle;
    };

    return module;
};
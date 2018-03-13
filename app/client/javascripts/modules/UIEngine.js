/**
 * Created by ibrahimradwan on 3/6/18.
 */

// Constants
const CANVAS_BACKGROUND_LINES_SEPARATION = 30;
const MAX_ZOOM_THRESHOLD = 50;
const MIN_ZOOM_THRESHOLD = 30;
const START_BLOB_RADIUS = 30;
const MOVEMENT_INTERPOLATION_FACTOR = 0.5;

export default function (gameWidth, gameHeight) {
    let module = {};

    let canvasObjects = [];
    let mainPlayer;
    let zoom = 1, targetZoom = 1;

    module.init = function () {
        // Create canvas
        makeCanvas();

        // Remove strokes
        strokeWeight(0);

        // drawBackgroundLines();
    };

    /**
     * Refresh the drawing due to game status update
     */
    module.draw = function () {
        push();

        // Camera setup
        setupCamera();

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
            playerObject.canvasObject.x = lerp(playerObject.canvasObject.x, playerObject.x, MOVEMENT_INTERPOLATION_FACTOR);
            playerObject.canvasObject.y = lerp(playerObject.canvasObject.y, playerObject.y, MOVEMENT_INTERPOLATION_FACTOR);
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

    let setupCamera = function () {
        // Translate camera to screen center
        translate(width / 2, height / 2);

        // Scaling (interpolated)
        if ((targetZoom * mainPlayer.radius) > MAX_ZOOM_THRESHOLD || (targetZoom * mainPlayer.radius) < MIN_ZOOM_THRESHOLD)
            targetZoom = START_BLOB_RADIUS / mainPlayer.radius;

        zoom = lerp(zoom, targetZoom, 0.05);
        scale(zoom * Math.sqrt((width * height) / (2000 * 1000)));

        // Translate camera to player center
        translate(-mainPlayer.x, -mainPlayer.y);
    };

    let drawBackgroundLines = function () {
        // Draw background lines
        for (
            let i = CANVAS_BACKGROUND_LINES_SEPARATION;
            i <= Math.max(width, height) - CANVAS_BACKGROUND_LINES_SEPARATION;
            i += CANVAS_BACKGROUND_LINES_SEPARATION
        ) {
            backgroundCanvas.add(
                new fabric.Line([i, 0, i, height], {
                    stroke: '#eee'
                }),
                new fabric.Line([0, i, width, i], {
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
                this.radius = lerp(this.radius, r, MOVEMENT_INTERPOLATION_FACTOR);
            },
            getCenterPoint: function () {
                return createVector(this.x, this.y);
            }
        };

        circle.draw();

        canvasObjects.push(circle);

        return circle;
    };

    /**
     * Use p5js createCanvas function to create function
     * @return canvas object
     */
    let makeCanvas = function () {
        let canvas = createCanvas(window.innerWidth, window.innerHeight);
        //console.log(canvasElt);

        // For framerate optimization ? https://forum.processing.org/two/discussion/11462/help-in-p5-js-performance-improvement-on-mobile-devices
        canvas.elt.style.width = '100%';
        canvas.elt.style.height = '100%';

        // Correctly disables touch on mobile devices
        document.getElementById(canvas.elt.id).addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, false);

        return canvas;
    };

    return module;
};
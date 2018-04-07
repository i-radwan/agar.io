/**
 * Created by ibrahimradwan on 3/6/18.
 */
import Constants from "./Constants.js";

export default function () {
    let module = {};

    let gameObjects = [];
    let stars = [];
    let mainPlayer;
    let zoom = 1, targetZoom = 1;
    let hudCanvas, hudCanvasContext;

    let constants = Constants();

    module.init = function () {
        // Create canvas
        makeCanvas();

        // Fill stars
        fillStars();

        // Remove strokes
        strokeWeight(0);
        strokeWeight(0);
    };

    /**
     * Refresh the drawing due to game status update
     *
     * @param lag the time between this function call and the last physics update
     * @param elapsed the time taken by previous game loop
     */
    module.draw = function (lag, elapsed) {
        // Interpolate some physics to handle lag
        for (let i = 0; i < gameObjects.length; i++) {
            gameObjects[i].interpolatePhysics(lag);
        }

        push();

        // Camera setup and translating to user location
        setupCamera();

        // Clear everything
        background(constants.graphics.GAME_BACKGROUND);

        // Draw stars
        drawStars();

        // Draw all objects
        for (let i = 0; i < gameObjects.length; i++) {
            // Draw object
            if (isObjectInsideMyViewWindow(gameObjects[i]))
                gameObjects[i].draw();

            // Update blob yOffset
            if (gameObjects[i].canvasObjectType === constants.graphics.CANVAS_OBJECT_PLAYER) {
                gameObjects[i].yOffset += elapsed * constants.graphics.WABBLE_SPEED;
            }
        }

        pop();

        //Clear Hud Canvas
        clearHudCanvas();

        // Draw FPS
        drawFPS(elapsed);

        // Draw Score
        module.drawScore();

        for (let i = 0; i < gameObjects.length; i++) {
            // Revert the applied physics
            gameObjects[i].undoPhysics(lag);
        }
    };

    module.addGem = function (gemObject) {
        attachCircle(gemObject, drawCircle);

        // Set graphics attributes
        gemObject.canvasX = gemObject.x;
        gemObject.canvasY = gemObject.y;
        gemObject.canvasObjectType = constants.graphics.CANVAS_OBJECT_GEM;

        gemObject.interpolatePhysics = function (lag) {
        };
        gemObject.undoPhysics = function (lag) {
        };
    };

    module.addPlayer = function (playerObject) {
        attachCircle(playerObject, drawBlob);

        // Set graphics attributes
        playerObject.canvasX = playerObject.x;
        playerObject.canvasY = playerObject.y;
        playerObject.canvasObjectType = constants.graphics.CANVAS_OBJECT_PLAYER;
        playerObject.yOffset = 0; // Used for noisy bubble
        playerObject.strokeColor = constants.graphics.BLOB_STROKE_COLOR;

        playerObject.simulatePhysics = function (lag, direction) {
            this.canvasX += Math.cos(this.angle) * this.velocity * (lag / constants.general.UPDATE_PHYSICS_THRESHOLD) * direction;
            this.canvasY += Math.sin(this.angle) * this.velocity * (lag / constants.general.UPDATE_PHYSICS_THRESHOLD) * direction;
        };

        playerObject.interpolatePhysics = function (lag) {
            this.simulatePhysics(lag, 1);
        };

        playerObject.undoPhysics = function (lag) {
            this.simulatePhysics(lag, -1);
        };
    };

    module.addMainPlayer = function (myselfObject) {
        module.addPlayer(myselfObject);
        mainPlayer = myselfObject;
    };

    /**
     * Update gem canvas object to follow the updates in the gemObject
     *
     * @param gemObject
     */
    module.updateGem = function (gemObject) {
        if (gemObject.removed) { // Gem has been eaten
            gameObjects.splice(gameObjects.indexOf(gemObject), 1);
        }
        else if (!gemObject.hasOwnProperty("canvasObjectType")) { // New gem generated -> Draw it
            module.addGem(gemObject);
        }
    };

    /**
     * Update player canvas object to follow the updates in the playerObject
     *
     * @param playerObject
     */
    module.updatePlayer = function (playerObject) {
        if (playerObject.removed) { // Player is dead
            gameObjects.splice(gameObjects.indexOf(playerObject), 1);
        }
        else if (!playerObject.hasOwnProperty("canvasObjectType")) { // New player generated -> Draw it
            module.addPlayer(playerObject);
        }
        else { // Player existed and still -> update radius
            playerObject.setRadius(playerObject.radius);
        }
    };

    module.drawScore = function () {
        hudCanvasContext.font = constants.graphics.TEXT_STYLE;
        hudCanvasContext.fillStyle = constants.graphics.TEXT_COLOR;

        hudCanvasContext.textBaseline = "bottom";
        hudCanvasContext.textAlign = "left";
        hudCanvasContext.fillText("Score: " + mainPlayer.score, 0, window.innerHeight);
    };

    /**
     * Sort the canvas objects array (the order in which the objects are drawn),
     * such that smaller items are drawn first (to be beneath the larger items)
     */
    module.fixObjectsZIndex = function () {
        // Sort the array
        gameObjects.sort(function (a, b) {
            return (a.radius - b.radius);
        });
    };

    /**
     * Setup canvas camera:
     * Translate to screen center
     * Scale with the required scale
     * Translate back to make the player @ screen center
     */
    let setupCamera = function () {
        // Translate camera to screen center
        translate(window.innerWidth / 2, window.innerHeight / 2);

        // Scaling (interpolated)
        if ((targetZoom * mainPlayer.radius) > constants.graphics.MAX_ZOOM_THRESHOLD || (targetZoom * mainPlayer.radius) < constants.graphics.MIN_ZOOM_THRESHOLD)
            targetZoom = constants.graphics.START_BLOB_RADIUS / mainPlayer.radius;

        zoom = lerp(zoom, targetZoom * Math.sqrt((window.innerWidth * window.innerHeight) / (constants.graphics.GENERIC_WINDOW_AREA)), constants.graphics.ZOOM_INTERPOLATION_FACTOR);
        scale(zoom);

        // Translate camera to player center
        translate(-mainPlayer.canvasX, -mainPlayer.canvasY);
    };

    /**
     * Attach a new circle to canvas and return the object pointing to it
     *
     * @param object the object that needs some canvas functions
     * @param drawFunction the drawing functions which is responsible for drawing this object
     */
    let attachCircle = function (object, drawFunction) {
        object.draw = function () {
            drawFunction(object);
        };

        object.setRadius = function (r) {
            this.radius = lerp(this.radius, r, constants.graphics.SIZE_INTERPOLATION_FACTOR);
        };

        // Push to canvas objects
        gameObjects.push(object);
    };

    /**
     * Draw normal circle
     *
     * @param circle
     */
    let drawCircle = function (circle) {
        fill(circle.color);
        ellipse(circle.canvasX, circle.canvasY, circle.radius * 2, circle.radius * 2);
    };

    /**
     * Draw 2 circles and give the nice noisy effect
     *
     * @param blob
     */
    let drawBlob = function (blob) {
        // Draw the large noisy circle
        drawNoisyCircle(blob, blob.radius * (1 + constants.graphics.MAX_BLOB_WABBLE_RADIUS_OFFSET), blob.strokeColor);

        // Draw the small noisy circle
        drawNoisyCircle(blob, blob.radius, blob.color);

        // Draw My center and Server Center (Debugging)
        let serverCenterCircle = {
            color: "white",
            canvasX: blob.x,
            canvasY: blob.y,
            radius: 0.1 * blob.radius
        };
        let centerCircle = {
            color: "black",
            canvasX: blob.canvasX,
            canvasY: blob.canvasY,
            radius: 0.1 * blob.radius
        };

        drawCircle(centerCircle);
        drawCircle(serverCenterCircle);
    };

    /**
     * Draw noisy circle to form the blob (1 blob = 2 noisy circles
     *
     * @param blob object used to get attributes of the blob
     * @param radius the radius of this circle (has to be passed in because it may differ from the blob radius)
     * @param color the circle filling color
     */
    let drawNoisyCircle = function (blob, radius, color) {
        push();
        beginShape();

        // Fill the drawing with the required color
        fill(color);

        let r = radius;
        let xOffset = 0;

        for (let theta = 0; theta < TWO_PI - 0.1; theta += 0.1) {
            // Make radius with ± noise
            let rad = map(noise(xOffset, blob.yOffset), 0, 1, r, r * (1 + constants.graphics.MAX_BLOB_WABBLE_RADIUS_OFFSET));

            // Add the vertex of the circle
            let x = blob.canvasX + rad * Math.cos(theta);
            let y = blob.canvasY + rad * Math.sin(theta);
            vertex(x, y);

            // Increase the xOffset to get another noisy pattern in the next loop (for the blob animation)
            xOffset += 0.1;
        }

        endShape();
        pop();
    };

    /**
     * Fill stars array
     */
    let fillStars = function () {
        let n = constants.graphics.STARS_COUNT;

        while (n--) {
            stars.push({
                canvasX: ((Math.random() * 2 - 1) * 2),
                canvasY: ((Math.random() * 2 - 1) * 2),
                color: constants.graphics.STAR_COLOR,
                radius: constants.graphics.STAR_RADIUS
            });
        }
    };

    /**
     * Add stars to background
     */
    let drawStars = function () {
        let n = constants.graphics.STARS_COUNT;

        while (n--) {
            if (isObjectInsideMyViewWindow(stars[n]))
                drawCircle(stars[n]);
        }
    };

    let drawFPS = function (elapsed) {
        let FPS = parseInt(1000 / elapsed);

        hudCanvasContext.font = constants.graphics.TEXT_STYLE;
        hudCanvasContext.fillStyle = constants.graphics.TEXT_COLOR;

        hudCanvasContext.textBaseline = "top";
        hudCanvasContext.textAlign = "left";
        hudCanvasContext.fillText("FPS: " + FPS, 0, 0);
    };

    /**
     * Use p5js createCanvas function to create canvas and configure it
     *
     * @return canvas object
     */
    let makeCanvas = function () {
        let canvas = createCanvas(window.innerWidth, window.innerHeight);
        canvas.position(0, 0);
        canvas.style('z-index', -1);

        hudCanvas = document.getElementById("hudCanvasId");
        hudCanvasContext = hudCanvas.getContext("2d");

        hudCanvas.width = Number(window.innerWidth);
        hudCanvas.height = Number(window.innerHeight);

        // For frame-rate optimization ? https://forum.processing.org/two/discussion/11462/help-in-p5-js-performance-improvement-on-mobile-devices
        canvas.elt.style.width = '100%';
        canvas.elt.style.height = '100%';

        // Correctly disables touch on mobile devices
        preventCanvasTouchMove(document.getElementById(canvas.elt.id));
        preventCanvasTouchMove(hudCanvas);

        return canvas;
    };

    let preventCanvasTouchMove = function (canvas) {
        canvas.addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, false);
    };

    let clearHudCanvas = function () {
        hudCanvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };

    /**
     * Check if the given object is inside my viewing window
     *
     * @param object
     */
    let isObjectInsideMyViewWindow = function (object) {
        let maxDistX = window.innerWidth / (2 * zoom);
        let maxDistY = window.innerHeight / (2 * zoom);

        return Math.abs(object.canvasX - mainPlayer.canvasX) < maxDistX + object.radius &&
            Math.abs(object.canvasY - mainPlayer.canvasY) < maxDistY + object.radius;
    };

    return module;
};
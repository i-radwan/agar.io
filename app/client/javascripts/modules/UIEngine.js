/**
 * Created by ibrahimradwan on 3/6/18.
 */
import Constants from "./Constants.js";

export default function (p5Lib) {
    let module = {};

    let gameObjects = [];
    let stars = [];
    let mainPlayer;
    let zoom = 1, targetZoom = 1, zoomFactor = 1;
    let hudCanvas, hudCanvasContext;

    let constants = Constants();

    module.init = function () {
        // Create canvas
        makeCanvas();

        // Fill stars
        fillStars();

        // Remove strokes
        strokeWeight(0);

        // Setup initial canvas sizing
        updateGameSize();
    };

    /**
     * Refresh the drawing due to game status update
     *
     * @param lag the time between this function call and the last physics update
     * @param elapsed the time taken by previous game loop
     */
    module.draw = function (lag, elapsed, ping) {
        // Interpolate some physics to handle lag
        for (let i = 0; i < gameObjects.length; i++) {
            gameObjects[i].interpolatePhysics(lag);
        }

        p5Lib.push();

        // Camera setup and translating to user location
        setupCamera();

        // Clear everything
        p5Lib.background(constants.graphics.GAME_BACKGROUND);

        // Draw stars
        drawStars();

        // Draw all objects
        for (let i = 0; i < gameObjects.length; i++) {
            // Draw object
            if (isObjectInsideMyViewWindow(gameObjects[i]))
                gameObjects[i].draw();

            // Update blob yOffset and display the player name
            if (gameObjects[i].canvasObjectType === constants.graphics.CANVAS_OBJECT_PLAYER) {
                drawPlayerName(gameObjects[i]);

                gameObjects[i].yOffset += elapsed * constants.graphics.WABBLE_SPEED / Math.sqrt(gameObjects[i].radius);
            }
        }

        p5Lib.pop();

        //Clear Hud Canvas
        clearHUDCanvas();

        // Draw HUDs
        drawHUD(elapsed, ping);

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
            let newCanvasX = this.canvasX + Math.cos(this.angle) * this.velocity;
            let newCanvasY = this.canvasY + Math.sin(this.angle) * this.velocity;

            if (newCanvasX >= constants.graphics.GAME_BORDER_LEFT && newCanvasX <= constants.graphics.GAME_BORDER_RIGHT) {
                this.canvasX += (newCanvasX - this.canvasX) * (lag / constants.general.UPDATE_PHYSICS_THRESHOLD) * direction;
            }
            if (newCanvasY >= constants.graphics.GAME_BORDER_DOWN && newCanvasY <= constants.graphics.GAME_BORDER_UP) {
                this.canvasY += (newCanvasY - this.canvasY) * (lag / constants.general.UPDATE_PHYSICS_THRESHOLD) * direction;
            }
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
        if (gemObject.eaten) { // Gem has been eaten
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
        if (!playerObject.alive) { // Player is dead
            gameObjects.splice(gameObjects.indexOf(playerObject), 1);
        }
        else if (!playerObject.hasOwnProperty("canvasObjectType")) { // New player generated -> Draw it
            module.addPlayer(playerObject);
        }
    };

    /**
     * Sort the canvas objects array (the order in which the objects are drawn),
     * such that smaller items are drawn first (to be beneath the larger items)
     * (i.e. fix Z-Index)
     */
    module.sortObjectsBySize = function () {
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
        p5Lib.translate(window.innerWidth / 2, window.innerHeight / 2);

        // Scaling (interpolated)
        if (mainPlayer.radius >= constants.graphics.MAX_RADIUS_ZOOM_THRESHOLD) {
            if (mainPlayer.radius <= constants.graphics.MAX_RADIUS_ZOOM_LEVEL)
                targetZoom = constants.graphics.START_BLOB_RADIUS / mainPlayer.radius;
            else
                targetZoom = constants.graphics.START_BLOB_RADIUS / constants.graphics.MAX_RADIUS_ZOOM_LEVEL;
        }
        else {
            targetZoom = constants.graphics.INITIAL_ZOOM;
        }

        zoom = p5Lib.lerp(zoom, targetZoom * zoomFactor, constants.graphics.ZOOM_INTERPOLATION_FACTOR);
        p5Lib.scale(zoom);

        // Translate camera to player center
        p5Lib.translate(-mainPlayer.canvasX, -mainPlayer.canvasY);
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

        // Push to canvas objects
        gameObjects.push(object);
    };

    /**
     * Draw normal circle
     *
     * @param circle
     */
    let drawCircle = function (circle) {
        p5Lib.fill(circle.color);
        p5Lib.ellipse(circle.canvasX, circle.canvasY, circle.radius * 2, circle.radius * 2);
    };

    /**
     * Draw 2 circles and give the nice noisy effect
     *
     * @param blob
     */
    let drawBlob = function (blob) {
        // Draw the large noisy circle
        drawNoisyCircle(blob, blob.radius, blob.strokeColor);

        // Draw the small noisy circle
        drawNoisyCircle(blob, blob.radius * (1 - constants.graphics.MAX_BLOB_WABBLE_RADIUS_OFFSET), blob.color);

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
        p5Lib.push();
        p5Lib.beginShape();

        // Fill the drawing with the required color
        p5Lib.fill(color);

        let r = radius;
        let xOffset = 0;

        for (let theta = 0; theta < p5Lib.TWO_PI - 0.1; theta += 0.1) {
            // Make radius with ± noise
            let rad = p5Lib.map(
                p5Lib.noise(xOffset, blob.yOffset),
                0, 1,
                r, r * (1 + constants.graphics.MAX_BLOB_WABBLE_RADIUS_OFFSET)
            );

            // Add the vertex of the circle
            let x = blob.canvasX + rad * Math.cos(theta);
            let y = blob.canvasY + rad * Math.sin(theta);
            p5Lib.vertex(x, y);

            // Increase the xOffset to get another noisy pattern in the next loop (for the blob animation)
            xOffset += 0.1;
        }

        p5Lib.endShape();
        p5Lib.pop();
    };

    /**
     * Draw player names
     */
    let drawPlayerName = function (playerObject) {
        p5Lib.textAlign(p5Lib.CENTER, p5Lib.CENTER);
        p5Lib.textSize(playerObject.radius);
        p5Lib.fill(255, 255, 255);
        p5Lib.text(playerObject.name + "Test", playerObject.canvasX, playerObject.canvasY);
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

    /**
     * Call all functions that draw head up
     *
     * @param elapsed
     * @param ping
     */
    let drawHUD = function (elapsed, ping) {
        drawFPS(elapsed);
        drawPing(ping);
        drawScore();
    };

    let drawPing = function (ping) {
        hudCanvasContext.textBaseline = "top";
        hudCanvasContext.textAlign = "right";
        hudCanvasContext.fillText("Ping: " + parseInt(ping), window.innerWidth, 0);
    };

    let drawFPS = function (elapsed) {
        let FPS = parseInt(1000 / elapsed);

        hudCanvasContext.textBaseline = "top";
        hudCanvasContext.textAlign = "left";
        hudCanvasContext.fillText("FPS: " + FPS, 0, 0);
    };

    let drawScore = function () {
        hudCanvasContext.textBaseline = "bottom";
        hudCanvasContext.textAlign = "left";
        hudCanvasContext.fillText("Score: " + mainPlayer.score, 0, window.innerHeight);
    };

    /**
     * Use p5js createCanvas function to create canvas and configure it
     *
     * @return canvas object
     */
    let makeCanvas = function () {
        //
        // P5 canvas
        //
        let canvas = p5Lib.createCanvas(window.innerWidth, window.innerHeight);
        canvas.position(0, 0);
        canvas.style('z-index', -1);

        // For frame-rate optimization ? https://forum.processing.org/two/discussion/11462/help-in-p5-js-performance-improvement-on-mobile-devices
        canvas.elt.style.width = '100%';
        canvas.elt.style.height = '100%';

        //
        // Head up display canvas
        //
        hudCanvas = document.getElementById("hudCanvasId");
        hudCanvasContext = hudCanvas.getContext("2d");

        hudCanvas.width = Number(window.innerWidth);
        hudCanvas.height = Number(window.innerHeight);

        hudCanvasContext.font = constants.graphics.TEXT_STYLE;
        hudCanvasContext.fillStyle = constants.graphics.TEXT_COLOR;

        //
        // Events
        //

        // Listen for resizing the window
        window.addEventListener('resize', updateGameSize);

        // Correctly disables touch on mobile devices
        preventScrolling();

        return canvas;
    };

    let updateGameSize = function () {
        // Calculate screen specific zoom factor
        zoomFactor = Math.sqrt((window.innerWidth * window.innerHeight) / (constants.graphics.GENERIC_WINDOW_AREA));

        p5Lib.resizeCanvas(window.innerWidth, window.innerHeight);

        hudCanvas.width = Number(window.innerWidth);
        hudCanvas.height = Number(window.innerHeight);
        hudCanvasContext.font = constants.graphics.TEXT_STYLE;
        hudCanvasContext.fillStyle = constants.graphics.TEXT_COLOR;
    };

    let preventScrolling = function () {
        // Stop scrolling for touch devices
        $('body, canvas').bind('touchmove', function (e) {
            e.preventDefault();
        });
    };

    let clearHUDCanvas = function () {
        hudCanvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };

    /**
     * Check if the given object is inside my viewing window
     *
     * @param object
     */
    let isObjectInsideMyViewWindow = function (object) {
        let maxDistX = window.innerWidth / (zoom << 1);
        let maxDistY = window.innerHeight / (zoom << 1);

        return Math.abs(object.canvasX - mainPlayer.canvasX) < maxDistX + object.radius &&
            Math.abs(object.canvasY - mainPlayer.canvasY) < maxDistY + object.radius;
    };

    return module;
};
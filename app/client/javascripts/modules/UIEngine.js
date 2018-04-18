import Constants from "./Constants.js";

export default function (p5Lib) {
    let module = {};

    let players;
    let gems;
    let stars = [];
    let mainPlayer;
    let zoom = 1, targetZoom = 1, zoomFactor = 1;
    let hudCanvas, hudCanvasContext;
    let playerNameTextFont;

    let constants = Constants();

    module.init = function (me, playersObjects, gemsObjects) {
        playerNameTextFont = p5Lib.loadFont(constants.graphics.PLAYER_NAME_TEXT_FONT_PATH);

        // Assign gems and players to the game status arrays
        players = playersObjects;
        gems = gemsObjects;

        // Create canvas
        makeCanvas();

        // Fill stars
        fillStars();

        // Remove strokes
        strokeWeight(0);

        // Setup initial canvas sizing
        updateGameSize();

        addMainPlayer(me);
    };

    /**
     * Refresh the drawing due to game status update
     *
     * @param lag the time between this function call and the last physics update
     * @param elapsed the time taken by previous game loop
     * @param ping connection ping value
     */
    module.draw = function (lag, elapsed, ping) {
        // Interpolate some physics to handle lag
        players.forEach(function (player) {
            simulatePhysics(player, lag, 1);
        });

        p5Lib.push();

        // Camera setup and translating to user location
        setupCamera();

        // Clear everything
        p5Lib.background(constants.graphics.GAME_BACKGROUND);

        // Draw stars
        drawStars();

        // Draw all gems
        for (let key in gems){
            let gem = gems[key];

            if (isObjectInsideMyViewWindow(gem))
                drawCircle(gem);
        }

        // Draw all players
        players.concat(mainPlayer).forEach(function (obj) {
            // Draw object
            if (isObjectInsideMyViewWindow(obj))
                drawBlob(obj);

            // Update blob yOffset and display the player name
            drawPlayerName(obj);

            obj.yOffset += elapsed * constants.graphics.WABBLE_SPEED / Math.sqrt(obj.radius);
        });

        p5Lib.pop();

        //Clear Hud Canvas
        clearHUDCanvas();

        // Draw HUDs
        drawHUD(elapsed, ping);

        // Revert the applied physics
        players.forEach(function (player) {
            simulatePhysics(player, lag, -1);
        });
    };

    module.addGemCanvasParams = function (gem) {
        // Set graphics attributes
        gem.canvasX = gem.x;
        gem.canvasY = gem.y;
        gem.canvasObjectType = constants.graphics.CANVAS_OBJECT_GEM;
    };

    module.addPlayerCanvasParams = function (player) {
        // Set graphics attributes
        player.canvasX = player.x;
        player.canvasY = player.y;
        player.canvasObjectType = constants.graphics.CANVAS_OBJECT_PLAYER;
        player.yOffset = 0; // Used for noisy bubble
        player.strokeColor = constants.graphics.BLOB_STROKE_COLOR;
    };

    /**
     * Sort the canvas playersObjects array (the order in which the objects are drawn),
     * such that smaller items are drawn first (to be beneath the larger items)
     * (i.e. fix Z-Index)
     */
    module.sortPlayersBySize = function () {
        // Sort the array
        players.sort(function (a, b) {
            return (a.radius - b.radius);
        });
    };

    let addMainPlayer = function (myselfObject) {
        module.addPlayerCanvasParams(myselfObject);
        mainPlayer = myselfObject;
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
        p5Lib.textSize(playerObject.radius * constants.graphics.PLAYER_NAME_TEXT_FONT_SCALE);
        p5Lib.strokeWeight(playerObject.radius * constants.graphics.PLAYER_NAME_TEXT_FONT_STROKE_SCALE);
        p5Lib.stroke(constants.graphics.PLAYER_NAME_TEXT_STROKE_COLOR);
        p5Lib.textFont(playerNameTextFont);
        p5Lib.fill(constants.graphics.PLAYER_NAME_TEXT_COLOR);

        p5Lib.text(playerObject.name + "Test", playerObject.canvasX, playerObject.canvasY);

        p5Lib.strokeWeight(0);
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
        p5Lib.pixelDensity(1);

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

    /**
     * Simulates player physics that could have happened in the given lag,
     * the physics take effect in the given direction
     *
     * @param player
     * @param lag
     * @param direction
     */
    let simulatePhysics = function (player, lag, direction) {
        let newCanvasX = player.canvasX + Math.cos(player.angle) * player.velocity;
        let newCanvasY = player.canvasY + Math.sin(player.angle) * player.velocity;

        if (newCanvasX >= constants.graphics.GAME_BORDER_LEFT && newCanvasX <= constants.graphics.GAME_BORDER_RIGHT) {
            player.canvasX += (newCanvasX - player.canvasX) * (lag / constants.general.UPDATE_PHYSICS_THRESHOLD) * direction;
        }
        if (newCanvasY >= constants.graphics.GAME_BORDER_DOWN && newCanvasY <= constants.graphics.GAME_BORDER_UP) {
            player.canvasY += (newCanvasY - player.canvasY) * (lag / constants.general.UPDATE_PHYSICS_THRESHOLD) * direction;
        }
    };

    return module;
};
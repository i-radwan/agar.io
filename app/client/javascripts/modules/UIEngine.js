import Constants from "./Constants.js";

export default function (p5Lib) {
    let module = {};

    let constants = Constants();

    let stars = [];

    let zoom = 1, targetZoom = 1, zoomFactor = 1, cameraX, cameraY;
    let hudCanvas, hudCanvasContext;

    let playerNameTextFont;

    let sortedPlayers;
    let isMobile = false;

    // HUD margins
    let HUDMarginLeft, HUDMarginRight, HUDMarginUp, HUDMarginDown;

    /**
     * Initializes the UI engine canvas, fonts, and other drawing parameters.
     */
    module.init = function () {
        playerNameTextFont = p5Lib.loadFont(constants.graphics.PLAYER_NAME_TEXT_FONT_PATH);

        // Detect if the user is mobile.
        let mobileDetect = new MobileDetect(window.navigator.userAgent);
        if (mobileDetect.mobile()) {
            isMobile = true;
            zoom = constants.graphics.INITIAL_ZOOM * Math.sqrt((window.innerWidth * window.innerHeight) / (constants.graphics.GENERIC_WINDOW_AREA));
        }

        // Create canvas
        makeCanvas();

        // Setup initial canvas sizing
        updateGameSize();

        // Fill stars
        fillStars();

        // Remove strokes
        strokeWeight(0);
    };

    /**
     * Refresh the drawing due to game status update
     *
     * @param players
     * @param gems
     * @param traps
     * @param mainPlayer
     * @param elapsed the time taken by previous game loop
     */
    module.draw = function (mainPlayer, players, gems, traps, elapsed) {
        p5Lib.push();

        // Camera setup and translating to user location
        setupCamera(mainPlayer);

        // Draw stars
        drawBackground();

        // Draw all gems
        for (let key in gems) {
            let gem = gems[key];

            if (isObjectInsideMyViewWindow(gem)) {
                drawCircle(gem);
            }
        }

        // Draw all traps
        for (let key in traps) {
            let trap = traps[key];

            if (isObjectInsideMyViewWindow(trap)) {
                drawTrap(trap);
            }
        }

        // Sort players by size, to render bigger players at top of smaller ones
        sortedPlayers = Object.values(players).sort(function (a, b) {
            return (a.radius - b.radius);
        });

        // Draw all players
        for (let key in sortedPlayers) {
            let player = sortedPlayers[key];

            // Smoothly increase player's radius
            player.canvasRadius = p5Lib.lerp(player.canvasRadius, player.radius, constants.physics.GROW_INTERPOLATION_FACTOR);

            // Draw player object and name
            if (isObjectInsideMyViewWindow(player)) {
                drawBlob(player, elapsed);
                drawPlayerName(player);
            }
        }

        p5Lib.pop();
    };

    /**
     * Clears the head and calls all functions that draw head up
     *
     * @param score
     * @param elapsed
     * @param ping
     */
    module.drawHUD = function (score, elapsed, ping) {
        // Clear the head up display canvas
        clearHUDCanvas();

        if (!isMobile) {
            drawHUDText("top", "left", "FPS: " + (1000 / elapsed).toFixed(0), HUDMarginLeft, HUDMarginUp);
            drawHUDText("top", "left", "Ping: " + parseInt(ping), HUDMarginLeft, constants.graphics.TEXT_HEIGHT + HUDMarginUp);
        }

        drawHUDText("bottom", "left", "Score: " + score, HUDMarginLeft, window.innerHeight - HUDMarginDown);
        drawLeaderboard();
    };

    /**
     * Adds the given gem to the canvas to start drawing.
     *
     * @param gem the gem to add
     */
    module.addGemCanvasParams = function (gem) {
        // Set graphics attributes
        gem.canvasX = gem.x;
        gem.canvasY = gem.y;
    };

    /**
     * Adds the given trap to the canvas to start drawing.
     *
     * @param trap the trap to add
     */
    module.addTrapCanvasParams = function (trap) {
        // Set graphics attributes
        trap.canvasX = trap.x;
        trap.canvasY = trap.y;
    };

    /**
     * Adds the given player to the canvas to start drawing.
     *
     * @param player the player to add
     */
    module.addPlayerCanvasParams = function (player) {
        // Set graphics attributes
        player.canvasX = player.x;
        player.canvasY = player.y;
        player.canvasRadius = player.radius;
        player.yOffset = 0; // Used for noisy bubble
        player.redness = 0; // Used for alert effect
    };

    /**
     * Setup canvas camera:
     * Translate to screen center
     * Scale with the required scale
     * Translate back to make the player @ screen center
     */
    let setupCamera = function (mainPlayer) {
        cameraX = mainPlayer.canvasX;
        cameraY = mainPlayer.canvasY;

        // Translate camera to screen center
        p5Lib.translate(window.innerWidth / 2, window.innerHeight / 2);

        // Scaling (interpolated)
        if (mainPlayer.radius >= constants.graphics.MAX_RADIUS_ZOOM_THRESHOLD) {
            targetZoom = constants.graphics.START_BLOB_RADIUS /
                Math.min(mainPlayer.radius, constants.graphics.MAX_RADIUS_ZOOM_LEVEL);
        }
        else {
            targetZoom = constants.graphics.INITIAL_ZOOM;
        }

        zoom = p5Lib.lerp(zoom, targetZoom * zoomFactor, constants.graphics.ZOOM_INTERPOLATION_FACTOR);
        p5Lib.scale(zoom);

        // Translate camera to player center
        p5Lib.translate(-cameraX, -cameraY);
    };

    /**
     * Draws the given player as two circles:
     * inner normal circle, and outer noisy circle to give a wabble effect.
     *
     * @param blob
     * @param elapsed
     */
    let drawBlob = function (blob, elapsed) {
        // Lerp player radius
        blob.yOffset += elapsed * constants.graphics.WABBLE_SPEED / Math.sqrt(blob.radius);

        if (blob.hit || Date.now() - blob.hitTime < constants.graphics.ALERT_DURATION) {
            blob.redness += 0.1;
            if (blob.redness >= 1) blob.redness = 0;
        } else {
            blob.redness = 0;
        }

        // Draw the large noisy circle
        drawNoisyCircle(blob, blob.radius, constants.graphics.OUTER_RADIUS_EXTRA_LENGTH, constants.graphics.BLOB_STROKE_COLOR, 0);

        // Draw the small noisy circle
        drawNoisyCircle(blob, blob.radius - constants.graphics.OUTER_RADIUS_EXTRA_LENGTH, 0, blob.color, blob.redness);

        // Draw My center and Server Center (Debugging)
        let serverCenterCircle = {
            color: "white",
            canvasX: blob.x,
            canvasY: blob.y,
            radius: 0.1 * blob.canvasRadius
        };
        let centerCircle = {
            color: "black",
            canvasX: blob.canvasX,
            canvasY: blob.canvasY,
            radius: 0.1 * blob.canvasRadius
        };

        // drawCircle(centerCircle);
        // drawCircle(serverCenterCircle);
    };

    /**
     * Draws a trap.
     *
     * @param trap the trap to draw
     */
    let drawTrap = function (trap) {
        p5Lib.push();
        p5Lib.beginShape();

        // Fill the drawing with the required color
        p5Lib.fill(trap.color);

        let delta = 0;
        let sign = 1;

        for (let theta = 0; theta <= p5Lib.TWO_PI; theta += 0.025) {
            // Get the vertex of the circle
            let x = trap.canvasX + (trap.radius + delta) * Math.cos(theta);
            let y = trap.canvasY + (trap.radius + delta) * Math.sin(theta);

            p5Lib.vertex(x, y);

            if (delta >= trap.radius || delta < 0) {
                sign = -sign;
            }

            delta += sign * 0.0001;
        }

        p5Lib.endShape();
        p5Lib.pop();

        p5Lib.fill(0);
        p5Lib.ellipse(trap.canvasX, trap.canvasY, trap.radius / 2, trap.radius / 2);
    };

    /**
     * Draws a normal circle.
     *
     * @param circle the circle to draw
     */
    let drawCircle = function (circle) {
        p5Lib.fill(circle.color);
        p5Lib.ellipse(circle.canvasX, circle.canvasY, circle.radius * 2, circle.radius * 2);
    };

    /**
     * Draw noisy circle to form the blob (1 blob = 2 noisy circles
     *
     * @param blob object used to get attributes of the blob
     * @param radius the radius of this circle (has to be passed in because it may differ from the blob radius)
     * @param extraRadius an added length to the borders in order to extend the blob outer layer.
     * @param color the circle filling color
     * @param redness degree of circle redness
     */
    let drawNoisyCircle = function (blob, radius, extraRadius, color, redness) {
        p5Lib.push();
        p5Lib.beginShape();

        // Fill the drawing with the required color
        let c = p5Lib.lerpColor(p5Lib.color(color), p5Lib.color("red"), redness);
        p5Lib.fill(c);

        let xOffset = 0;
        for (let theta = 0; theta < p5Lib.TWO_PI - 0.1; theta += 0.01) {
            // Get the vertex of the circle
            let x = blob.canvasX + radius * Math.cos(theta);
            let y = blob.canvasY + radius * Math.sin(theta);

            // Check if the point is out of the border
            if (x > constants.graphics.GAME_BORDER_RIGHT + extraRadius)
                x = constants.graphics.GAME_BORDER_RIGHT + extraRadius;
            else if (x < constants.graphics.GAME_BORDER_LEFT - extraRadius)
                x = constants.graphics.GAME_BORDER_LEFT - extraRadius;
            if (y > constants.graphics.GAME_BORDER_UP + extraRadius)
                y = constants.graphics.GAME_BORDER_UP + extraRadius;
            else if (y < constants.graphics.GAME_BORDER_DOWN - extraRadius)
                y = constants.graphics.GAME_BORDER_DOWN - extraRadius;

            let v = {x: x - blob.canvasX, y: y - blob.canvasY};

            // ± noise to the point in its direction
            x += p5Lib.noise(xOffset, blob.yOffset) * v.x * constants.graphics.MAX_BLOB_WABBLE_RADIUS_OFFSET;
            y += p5Lib.noise(xOffset, blob.yOffset) * v.y * constants.graphics.MAX_BLOB_WABBLE_RADIUS_OFFSET;

            p5Lib.vertex(x, y);

            // Increase the xOffset to get another noisy pattern in the next loop (for the blob animation)
            xOffset += 0.01;
        }

        p5Lib.endShape();
        p5Lib.pop();
    };

    /**
     * Draw player names
     */
    let drawPlayerName = function (playerObject) {
        if (!playerObject.name) return;

        p5Lib.textAlign(p5Lib.CENTER, p5Lib.CENTER);
        p5Lib.textSize(playerObject.radius * constants.graphics.PLAYER_NAME_TEXT_FONT_SCALE);
        p5Lib.textFont(playerNameTextFont);
        p5Lib.strokeWeight(playerObject.radius * constants.graphics.PLAYER_NAME_TEXT_FONT_STROKE_SCALE);
        p5Lib.stroke(constants.graphics.PLAYER_NAME_TEXT_STROKE_COLOR);
        p5Lib.fill(constants.graphics.PLAYER_NAME_TEXT_COLOR);

        p5Lib.text(playerObject.name, playerObject.canvasX, playerObject.canvasY);

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
    let drawBackground = function () {
        // Clear everything
        p5Lib.background(constants.graphics.GAME_BACKGROUND);

        let n = constants.graphics.STARS_COUNT;

        while (n--) {
            if (isObjectInsideMyViewWindow(stars[n])) {
                drawCircle(stars[n]);
            }
        }
    };

    let clearHUDCanvas = function () {
        hudCanvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };

    let drawHUDText = function (textBaseline, textAlign, text, x, y) {
        hudCanvasContext.textBaseline = textBaseline;
        hudCanvasContext.textAlign = textAlign;
        hudCanvasContext.fillText(text, x, y);
    };

    /**
     * Draw the leaderboard on the top right with all of its calculations.
     */
    let drawLeaderboard = function () {
        let leaderboardTitle = constants.graphics.LEADER_BOARD_TITLE;

        // Calculate how many spaces needed to m,ake leaderboard title in the middle.
        let spacesCnt = (constants.graphics.LEADER_BOARD_MAX_NAME_LENGTH
            + constants.graphics.LEADER_BOARD_MAX_SCORE_LENGTH
            + constants.graphics.LEADER_BOARD_SPACES_COUNT
            - (leaderboardTitle.length)) / 2;

        for (let i = 0; i < spacesCnt; i++)
            leaderboardTitle += " ";

        // Draw leaderboard title.
        drawHUDText("top", "right", leaderboardTitle, window.innerWidth - HUDMarginRight, HUDMarginUp);

        for (let i = 0; i < Math.min(constants.graphics.LEADER_BOARD_PLAYERS_COUNT, sortedPlayers.length); i++) {
            let player = sortedPlayers[sortedPlayers.length - i - 1];
            let playerScore = player.score;
            let playerName = player.name;
            let text = "";

            if (playerName) {
                // Check for long names in order to cut them down.
                if (playerName.length > constants.graphics.LEADER_BOARD_MAX_NAME_LENGTH) {
                    playerName = playerName.substr(0, constants.graphics.LEADER_BOARD_MAX_NAME_LENGTH - constants.graphics.LEADER_BOARD_DOTS_COUNT);

                    for (let j = 0; j < constants.graphics.LEADER_BOARD_DOTS_COUNT; j++)
                        playerName += ".";
                }
                text += playerName;
            }

            // Check for small score digits to know how many spaces needed.
            let scoreDigitsCnt = 0, tmpScore = playerScore;
            while (tmpScore > 0) {
                scoreDigitsCnt++;
                tmpScore = parseInt(tmpScore / 10);
            }

            // Add all of the missing spaces in order to maintain the same width even with different scores/names.
            for (let j = 0; j < ((constants.graphics.LEADER_BOARD_SPACES_COUNT
                + constants.graphics.LEADER_BOARD_MAX_SCORE_LENGTH - scoreDigitsCnt)
                + (constants.graphics.LEADER_BOARD_MAX_NAME_LENGTH
                    - playerName.length)); j++) {
                text += " ";
            }
            text += playerScore;

            // Draw the player score and name in the leaderboard.
            drawHUDText("top", "right", text, window.innerWidth - HUDMarginRight, (i + 1) * constants.graphics.TEXT_HEIGHT + HUDMarginUp);
        }
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

        // For frame-rate optimization ?
        // https://forum.processing.org/two/discussion/11462/help-in-p5-js-performance-improvement-on-mobile-devices
        canvas.elt.style.width = '100%';
        canvas.elt.style.height = '100%';
        canvas.elt.style.position = 'absolute';

        //
        // Head up display canvas
        //
        hudCanvas = document.getElementById("hudCanvasId");
        hudCanvasContext = hudCanvas.getContext("2d");

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
        // Update HUD margins
        if (isMobile) {
            HUDMarginLeft = 0;
            HUDMarginRight = 0;
            HUDMarginUp = 0;
            HUDMarginDown = 0;
        } else {
            HUDMarginLeft = window.innerWidth * constants.graphics.HUD_MARGIN_WIDTH_FACTOR;
            HUDMarginRight = window.innerWidth * constants.graphics.HUD_MARGIN_WIDTH_FACTOR;
            HUDMarginUp = window.innerHeight * constants.graphics.HUD_MARGIN_HEIGHT_FACTOR;
            HUDMarginDown = window.innerHeight * constants.graphics.HUD_MARGIN_HEIGHT_FACTOR;
        }


        // Calculate screen specific zoom factor
        zoomFactor = Math.sqrt((window.innerWidth * window.innerHeight) / (constants.graphics.GENERIC_WINDOW_AREA));

        p5Lib.resizeCanvas(window.innerWidth, window.innerHeight);

        hudCanvas.width = Number(window.innerWidth);
        hudCanvas.height = Number(window.innerHeight);
        hudCanvasContext.font = constants.graphics.TEXT_HEIGHT + 'px ' + constants.graphics.TEXT_STYLE;
        hudCanvasContext.fillStyle = constants.graphics.TEXT_COLOR;
    };

    let preventScrolling = function () {
        // Stop scrolling for touch devices
        $('body, canvas').bind('touchmove', function (e) {
            e.preventDefault();
        });
    };

    /**
     * Checks if the given object is inside the view window of the main player.
     *
     * @param object the object to check against
     */
    let isObjectInsideMyViewWindow = function (object) {
        let maxDistX = window.innerWidth / (zoom * 2);
        let maxDistY = window.innerHeight / (zoom * 2);

        return Math.abs(object.canvasX - cameraX) < maxDistX + object.radius &&
            Math.abs(object.canvasY - cameraY) < maxDistY + object.radius;
    };

    return module;
};
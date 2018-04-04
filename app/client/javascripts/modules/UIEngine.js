/**
 * Created by ibrahimradwan on 3/6/18.
 */

// Constants
const STARS_COUNT = 100;
const MAX_ZOOM_THRESHOLD = 50;
const MIN_ZOOM_THRESHOLD = 30;
const START_BLOB_RADIUS = 30;
const MOVEMENT_INTERPOLATION_FACTOR = 0.2;
const MAX_BLOB_WABBLE_RADIUS_OFFSET = 1 / 5;
const UPDATE_PHYSICS_THRESHOLD = 15;

export default function () {
    let module = {};

    let gameObjects = [];
    let stars = [];
    let mainPlayerCanvasObject;
    let zoom = 1, targetZoom = 1;

    module.init = function () {
        // Create canvas
        makeCanvas();

        // Fill stars
        // fillStars();

        // Remove strokes
        strokeWeight(0);
    };

    /**
     * Refresh the drawing due to game status update
     */
    module.draw = function (lag) {
        // Apply some physics to handle lag
        for (let i = 0; i < gameObjects.length; i++) {
            if (gameObjects[i].hasOwnProperty("velocity")) {
                gameObjects[i].canvasObject.x += Math.cos(gameObjects[i].angle) * gameObjects[i].velocity * (lag / UPDATE_PHYSICS_THRESHOLD);
                gameObjects[i].canvasObject.y += Math.sin(gameObjects[i].angle) * gameObjects[i].velocity * (lag / UPDATE_PHYSICS_THRESHOLD);
            }
        }

        push();

        // Camera setup and translating to user location
        setupCamera();

        // Clear everything
        background(0);

        // Draw stars
        // drawStars();

        // Draw all objects
        for (let i = 0; i < gameObjects.length; i++) {
            // Draw object
            gameObjects[i].canvasObject.draw();

            // Revert the applied physics
            if (gameObjects[i].hasOwnProperty("velocity")) {
                gameObjects[i].canvasObject.x -= Math.cos(gameObjects[i].angle) * gameObjects[i].velocity * (lag / UPDATE_PHYSICS_THRESHOLD);
                gameObjects[i].canvasObject.y -= Math.sin(gameObjects[i].angle) * gameObjects[i].velocity * (lag / UPDATE_PHYSICS_THRESHOLD);
            }
        }

        pop();
    };

    module.addGem = function (gemObject) {
        return attachCircle(gemObject, drawCircle);
    };

    module.addPlayer = function (playerObject) {
        let circle = attachCircle(playerObject, drawBlob);

        // Set blob attributes
        circle.yOffset = 0; // Used for noise
        circle.strokeColor = 255;

        return circle;
    };

    module.addMainPlayer = function (myselfObject) {
        mainPlayerCanvasObject = attachCircle(myselfObject, drawBlob);

        // Set blob attributes
        mainPlayerCanvasObject.yOffset = 0;
        mainPlayerCanvasObject.strokeColor = 255;

        return mainPlayerCanvasObject;
    };

    module.drawScore = function () {
        // ToDo: Draw score text
    };

    /**
     * Update gem canvas object to follow the updates in the gemObject
     * @param gemObject
     */
    module.updateGem = function (gemObject) {
        if (gemObject.removed) { // Gem has been eaten
            gameObjects.splice(gameObjects.indexOf(gemObject), 1);
        }
        else if (!gemObject.hasOwnProperty("canvasObject")) { // New gem generated -> Draw it
            gemObject.canvasObject = module.addGem(gemObject);
        }
    };

    /**
     * Update player canvas object to follow the updates in the playerObject
     * @param playerObject
     */
    module.updatePlayer = function (playerObject) {
        if (playerObject.removed) { // Player is dead
            gameObjects.splice(gameObjects.indexOf(playerObject), 1);
        }
        else if (!playerObject.hasOwnProperty("canvasObject")) { // New gem generated -> Draw it
            playerObject.canvasObject = module.addPlayer(playerObject);
        }
        else { // Player existed and still -> update radius
            playerObject.canvasObject.setRadius(playerObject.radius);
        }
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
        if ((targetZoom * mainPlayerCanvasObject.radius) > MAX_ZOOM_THRESHOLD || (targetZoom * mainPlayerCanvasObject.radius) < MIN_ZOOM_THRESHOLD)
            targetZoom = START_BLOB_RADIUS / mainPlayerCanvasObject.radius;

        zoom = lerp(zoom, targetZoom, 0.05);
        scale(zoom * Math.sqrt((window.innerWidth * window.innerHeight) / (2000 * 1000)));

        // Translate camera to player center
        translate(-mainPlayerCanvasObject.x, -mainPlayerCanvasObject.y);
    };

    /**
     * Attach a new circle to canvas and return the object pointing to it
     * @param object {{x, y, radius, color}}
     * @param drawFunction
     * @return {{x, y, radius: (*|number), color: (*|string|string|string|string|string), draw: draw, setRadius: setRadius, getCenterPoint: getCenterPoint}}
     */
    let attachCircle = function (object, drawFunction) {
        let circle = {
            x: object.x,
            y: object.y,
            radius: object.radius,
            color: object.color,

            /**
             * Function called each frame to draw the object
             */
            draw: function () {
                drawFunction(this);
            },
            setRadius: function (r) {
                this.radius = lerp(this.radius, r, MOVEMENT_INTERPOLATION_FACTOR);
            },
            getCenterPoint: function () {
                return createVector(this.x, this.y);
            }
        };
        object.canvasObject = circle;

        // Push to canvas objects
        gameObjects.push(object);

        return circle;
    };

    /**
     * Draw normal circle
     * @param circle
     */
    let drawCircle = function (circle) {
        fill(circle.color);
        ellipse(circle.x, circle.y, circle.radius * 2, circle.radius * 2);
    };

    /**
     * Draw 2 circles and give the nice noisy effect
     * @param blob
     */
    let drawBlob = function (blob) {
        // Draw the large noisy circle
        drawNoisyCircle(blob, blob.radius * (1 + MAX_BLOB_WABBLE_RADIUS_OFFSET), blob.strokeColor);

        // Draw the small noisy circle
        drawNoisyCircle(blob, blob.radius, blob.color);


        //Draw My center and Server Center (Debugging)
        if (blob.hasOwnProperty("ServerCenterX")) {
            let serverCenterCircle = {
                color: "white",
                x: blob.ServerCenterX,
                y: blob.ServerCenterY,
                radius: 0.1 * blob.radius
            };
            let centerCircle = {
                color: "black",
                x: blob.x,
                y: blob.y,
                radius: 0.1 * blob.radius
            };

            drawCircle(centerCircle);
            // drawCircle(serverCenterCircle);
        }

        // Increase yOffset for the animation effect
        blob.yOffset += 0.01;
    };

    /**
     * Draw noisy circle to form the blob (1 blob = 2 noisy circles
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
            let rad = map(noise(xOffset, blob.yOffset), 0, 1, r, r * ( 1 + MAX_BLOB_WABBLE_RADIUS_OFFSET));

            // Add the vertex of the circle
            let x = blob.x + rad * Math.cos(theta);
            let y = blob.y + rad * Math.sin(theta);
            vertex(x, y);

            // Increase the xOffset to get another noisy pattern in the next loop (for the blob animation)
            xOffset += 0.1;
        }

        endShape();
        pop();
    };

    /**
     * Use p5js createCanvas function to create canvas and configure it
     * @return canvas object
     */
    let makeCanvas = function () {
        let canvas = createCanvas(window.innerWidth, window.innerHeight);

        // For frame-rate optimization ? https://forum.processing.org/two/discussion/11462/help-in-p5-js-performance-improvement-on-mobile-devices
        canvas.elt.style.width = '100%';
        canvas.elt.style.height = '100%';

        // Correctly disables touch on mobile devices
        document.getElementById(canvas.elt.id).addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, false);

        return canvas;
    };

    /**
     * Add stars to background
     */
    let drawStars = function () {
        let n = STARS_COUNT - 1;

        while (n--) {
            drawCircle(stars[n]);
        }
    };

    /**
     * Fill stars array
     */
    let fillStars = function () {
        let n = STARS_COUNT;

        while (n--) {
            stars.push({
                x: ((Math.random() * 2 - 1) * 2),
                y: ((Math.random() * 2 - 1) * 2),
                color: "white",
                radius: 0.00133
            });
        }
    };

    return module;
};
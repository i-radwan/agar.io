/**
 * Created by ibrahimradwan on 3/3/18.
 */

// Constants
const CANVAS_BKGD_LINES_SEPARATION = 30;

export default function (gameStatus, canvas) {
    var module = {};
    module.init = function () {
        module.config();
        module.drawBackgroundLines();
        module.initDraw();
    };

    module.drawBackgroundLines = function () {
        // Draw background lines
        for (let i = CANVAS_BKGD_LINES_SEPARATION; i <= Math.max(window.innerWidth, window.innerHeight) - CANVAS_BKGD_LINES_SEPARATION; i += CANVAS_BKGD_LINES_SEPARATION) {
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

        canvas.renderAll();
    };

    /**
     * Get mouse position
     * Update gameStatus
     */
    module.update = function () {
        // Calculate my angle
        // Calculate my new position

    };

    module.initDraw = function () {
        module.drawGems();
        module.drawEnemies();
        module.drawMe();
        module.drawScore();

        canvas.renderAll();
    };

    module.drawGems = function () {
        for (let i = 0; i < gameStatus._gems.length; i++) {
            gameStatus._gems[i].object = module.drawCircle(gameStatus._gems[i]);
            canvas.add(gameStatus._gems[i].object);
        }
    };

    module.drawEnemies = function () {
        for (let i = 0; i < gameStatus._players.length; i++) {
            gameStatus._players[i].object = module.drawCircle(gameStatus._players[i]);
            canvas.add(gameStatus._players[i].object);
        }
    };

    module.drawMe = function () {
        gameStatus._me.object = module.drawCircle(gameStatus._me);
        canvas.add(gameStatus._me.object);
    };

    module.drawScore = function () {

    };

    /**
     * Refresh the drawing due to game status update
     */
    module.draw = function () {
        module.moveMyCircle();

        canvas.renderAll();
    };

    module.moveMyCircle = function () {
        // Get my circle center
        let myCircleCenterX = gameStatus._me.object.getCenterPoint().x;
        let myCircleCenterY = gameStatus._me.object.getCenterPoint().y;

        // Check if cursor outside the circle (to avoid vibrations)
        if (Math.sqrt(Math.pow(gameStatus._me.mouseX - myCircleCenterX, 2) +
                Math.pow(gameStatus._me.mouseY - myCircleCenterY, 2)) < 2)
            return;

        // Calculate mouse angle and move my player with the velocity
        if (gameStatus._me.mouseX - myCircleCenterX === 0) { // Vertical direction
            gameStatus._me.object.top += Math.sign(gameStatus._me.mouseY - myCircleCenterY) * gameStatus._me.velocity;
        } else { // Inclined direction
            let angle = Math.atan2((gameStatus._me.mouseY - myCircleCenterY), (gameStatus._me.mouseX - myCircleCenterX));
            gameStatus._me.object.top += Math.sin(angle) * gameStatus._me.velocity;
            gameStatus._me.object.left += Math.cos(angle) * gameStatus._me.velocity;
        }

        // Update position
        gameStatus._me.x = gameStatus._me.object.left;
        gameStatus._me.y = gameStatus._me.object.top;
    };

    module.drawCircle = function (parameters) {
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

    module.config = function () {
        // Stop scrolling for mobile devices
        $('body').bind('touchmove', function (e) {
            e.preventDefault()
        });

        // Get mouse coordinates
        canvas.on('mouse:move', function (options) {
            gameStatus._me.mouseX = options.e.layerX;
            gameStatus._me.mouseY = options.e.layerY;
        });
    };
    return module;
};
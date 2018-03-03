/**
 * Created by ibrahimradwan on 3/2/18.
 */

// Constants
const CANVAS_ID = "canvas";
const CANVAS_BKGD_LINES_SEPARATION = 30;
const GAME_FPS = 25;

let canvas = new fabric.Canvas(CANVAS_ID, {
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#ffffff",
    hoverCursor: "default",
    selection: false
});

let gameStatus = {
    init() {
        this._gems = [{
            x: window.innerWidth / 1.2,
            y: window.innerHeight / 1.4,
            color: "blue",
            radius: 10,
            object: {}
        }, {
            x: window.innerWidth / 2.6,
            y: window.innerHeight / 2.6,
            color: "blue",
            radius: 10,
            object: {}
        }];
        this._players = [{
            x: window.innerWidth / 4,
            y: window.innerHeight / 4,
            velocity: 2,
            direction: 120, // Angle
            color: "green",
            radius: 30,
            name: "P1",
            object: {}
        }];
        this._me = {
            alive: true,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            velocity: 3,
            direction: 10, // Angle
            color: "red",
            radius: 20,
            object: {},
            name: "IAR",
            score: 0,
            scoreObject: {},
            mouseX: 0,
            mouseY: 0
        };
    },
    set(game_status) {

    }
};

let gameServer = {
    init() {
        this._socket = io();

        // Receive messages
        this._socket.on('game_status', function (game_status) {
            console.log(game_status);
        });
    },
    /**
     * Update the server
     */
    transmit () {
        // socket.emit('chat message', $('#m').val());
        // $('#m').val('');
    }
};

let gameEngine = {
    init() {
        this.config();
        this.drawBackgroundLines();
        this.initDraw();
    },
    drawBackgroundLines() {
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
    },
    /**
     * Get mouse position
     * Update gameStatus
     */
    update() {
        // Calculate my angle
        // Calculate my new position

    },
    initDraw() {
        this.drawGems();
        this.drawEnemies();
        this.drawMe();
        this.drawScore();

        canvas.renderAll();
    },
    drawGems() {
        for (let i = 0; i < gameStatus._gems.length; i++) {
            gameStatus._gems[i].object = this.drawCircle(gameStatus._gems[i]);
            canvas.add(gameStatus._gems[i].object);
        }
    },
    drawEnemies() {
        for (let i = 0; i < gameStatus._players.length; i++) {
            gameStatus._players[i].object = this.drawCircle(gameStatus._players[i]);
            canvas.add(gameStatus._players[i].object);
        }
    },
    drawMe() {
        gameStatus._me.object = this.drawCircle(gameStatus._me);
        canvas.add(gameStatus._me.object);
    },
    drawScore() {

    },
    /**
     * Refresh the drawing due to game status update
     */
    draw() {
        this.moveMyCircle();

        canvas.renderAll();
    },
    moveMyCircle() {
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
    },
    drawCircle(parameters){
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
    },
    config() {
        // Stop scrolling for mobile devices
        $('body').bind('touchmove', function (e) {
            e.preventDefault()
        });

        // Get mouse coordinates
        canvas.on('mouse:move', function (options) {
            gameStatus._me.mouseX = options.e.layerX;
            gameStatus._me.mouseY = options.e.layerY;
        });
    }
};

// Start
$(function () {
    // Initialize
    gameStatus.init();
    gameServer.init();
    gameEngine.init();

    // Game loop
    gameStatus._intervalId = setInterval(function () {
        gameEngine.update();
        gameServer.transmit();

        gameEngine.draw();

        if (!gameStatus._me.alive)
            clearInterval(gameStatus._intervalId);
    }, 1000 / GAME_FPS);
});
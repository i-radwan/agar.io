/**
 * Created by ibrahimradwan on 3/2/18.
 */

// Constants
const CANVAS_ID = "canvas";
const CANVAS_BKGD_LINES_SEPARATION = 30;
const GAME_FPS = 50;

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
            velocity: 200,
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
            velocity: 100,
            direction: 10, // Angle
            color: "red",
            radius: 20,
            object: {},
            name: "IAR",
            score: 0,
            scoreObject: {}
        };
    },
    set(game_status) {

    }
};

let server = {
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

let canvas = new fabric.StaticCanvas(CANVAS_ID, {
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#ffffff"
});

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
                    stroke: '#eee'
                }),
                new fabric.Line([0, i, window.innerWidth, i], {
                    stroke: '#eee'
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

    },
    drawCircle(parameters){
        return new fabric.Circle({
            left: parameters.x,
            top: parameters.y,
            radius: parameters.radius,
            fill: parameters.color,
        });
    },
    config() {
        // Stop scrolling for mobile devices
        $('body').bind('touchmove', function (e) {
            e.preventDefault()
        });
    }
};

// Start
$(function () {
    // Initialize
    gameStatus.init();
    server.init();
    gameEngine.init();

    // Game loop
    gameStatus._intervalId = setInterval(function () {
        gameEngine.update();
        server.transmit();

        gameEngine.draw();

        if (!gameStatus._me.alive)
            clearInterval(gameStatus._intervalId);
    }, 1000 / GAME_FPS);
});
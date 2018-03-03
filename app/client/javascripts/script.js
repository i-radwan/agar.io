/**
 * Created by ibrahimradwan on 3/2/18.
 */

// Constants
const CANVAS_ID = "canvas";
const CANVAS_BKGD_LINES_SEPARATION = 30;

let server = {
    init() {
        this._socket = io();
    }

    // $('form').submit(function () {
    //     socket.emit('chat message', $('#m').val());
    //     $('#m').val('');
    //     return false;
    // });
    // socket.on('chat message', function (msg) {
    //     $('#messages').append($('<li>').text(msg));
    // });
};

let canvas = new fabric.StaticCanvas(CANVAS_ID, {
    width: window.innerWidth,
    height: window.innerHeight
});

let game = {
    init() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.backgroundColor = "#ffffff";

        this.drawBackgroundLines();
        // canvas.renderTop();
        //
        // canvas.add(
        //     new fabric.Rect({top: 100, left: 100, width: 50, height: 50, fill: '#f55'}),
        //     new fabric.Circle({top: 140, left: 230, radius: 75, fill: 'purple'}),
        //     new fabric.Triangle({top: 300, left: 210, width: 100, height: 100, fill: 'blue'})
        // );
        //
    },
    drawBackgroundLines() {
        // Draw background lines
        for (let i = CANVAS_BKGD_LINES_SEPARATION; i <= window.innerWidth - CANVAS_BKGD_LINES_SEPARATION; i += CANVAS_BKGD_LINES_SEPARATION) {
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
    draw() {
        this.drawGems();
        this.drawEnemies();
        this.drawMe();
        this.drawScore();

        canvas.renderAll();
    },
    drawGems() {
    },
    drawEnemies() {
    },
    drawMe() {
    },
    drawScore() {
    }
};

$(function () {
    // Initialize
    server.init();
    game.init();

    while (1) {

    }
});
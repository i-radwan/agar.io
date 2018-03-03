/**
 * Created by ibrahimradwan on 3/3/18.
 */

export default function () {
    var module = {};

    module.init = function () {
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
    };

    /**
     * Update the game status
     */
    module.set = function (game_status) {

    };
    return module;
};
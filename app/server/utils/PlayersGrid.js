const Gem = require("../models/Gem");
const Player = require("../models/Player");
const Constants = require("./Constants")();
const Utilities = require("./Utilities");

class PlayersGrid {

    /**
     * Construct 2D array grid.
     * @param gridWidth Width
     * @param gridHeigth Height
     */
    constructor(gridWidth, gridHeigth) {
        this.grid = [...Array(gridHeight)].map(e => Array(gridWidth).fill(Constants.EMPTY_CELL));
    }

    /**
     * Fill the grid with the sent objects.
     * @param objects An objects dictionary
     */
    fill(objects) {
        for (let id in objects) {
            if (!objects.hasOwnProperty(id)) continue;

            let object = this.objects[id];

            let topLeftX = Math.trunc((object.x - object.radius + 1.0) * gridWidth / 2.0);
            let topLeftY = Math.trunc((object.y - object.radius + 1.0) * gridHeight / 2.0);
            let BottomRightX = Math.trunc((object.x + object.radius + 1.0) * gridWidth / 2.0);
            let BottomRightY = Math.trunc((object.y + object.radius + 1.0) * gridHeight / 2.0);

            console.log((topLeftX), (topLeftY), (BottomRightX), (BottomRightY));

            for (let i = topLeftX; i <= BottomRightX; i++) {
                for (let j = topLeftY; j <= BottomRightY; j++) {
                    this.grid[i][j] = Constants.OCCUPIED_CELL;
                }
            }
        }
    }
}

module.exports = PlayersGrid;
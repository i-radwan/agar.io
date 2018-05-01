const Gem = require("../models/Gem");
const Player = require("../models/Player");
const Constants = require("./Constants")();
const Utilities = require("./Utilities");

class Grid {

    /**
     * Construct 2D array grid.
     * @param gridWidth Width
     * @param gridHeigth Height
     */
    constructor(gridWidth, gridHeight) {
        this.width = gridWidth;
        this.height = gridHeight;

        this.grid = [...Array(gridHeight)].map(e => Array(gridWidth).fill(Constants.EMPTY_CELL));
    }

    /**
     * Fill the grid with the sent objects.
     * TODO @Samir55 Adjust when removing the normalization.
     * @param objects An objects dictionary
     */
    fill(objects) {
        for (let id in objects) {
            if (!objects.hasOwnProperty(id)) continue;

            let object = objects[id];

            let topLeftX = Math.trunc((object.x - object.radius + 1.0) * this.width / 2.0);
            let topLeftY = Math.trunc((object.y - object.radius + 1.0) * this.height / 2.0);
            let BottomRightX = Math.trunc((object.x + object.radius + 1.0) * this.width / 2.0);
            let BottomRightY = Math.trunc((object.y + object.radius + 1.0) * this.height / 2.0);

            for (let i = topLeftX; i <= BottomRightX; i++) {
                for (let j = topLeftY; j <= BottomRightY; j++) {
                    this.grid[i][j] = Constants.OCCUPIED_CELL;
                }
            }
        }
    }

    /**
     * Get a free cell coordinates
     * TODO @Samir55 Adjust when removing the normalization.
     */
    getFreeCell() {
        let ret = {
            x: Utilities.getRandomInt(0, this.width),
            y: Utilities.getRandomInt(0, this.height)
        };

        for (let i = 0; i < Constants.GRID_MAX_ITERATIONS; i++) {

            if (this.grid[ret.x][ret.y] !== Constants.OCCUPIED_CELL) {
                ret.x = ret.x / (this.width / 2.0) - 1.0;
                ret.y = ret.y / (this.width / 2.0) - 1.0;
                return ret;
            }

            ret.x = Utilities.getRandomInt(0, this.width);
            ret.y = Utilities.getRandomInt(0, this.height);
        }
        return ret;
    }
}

module.exports = Grid;
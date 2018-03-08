// Player model class
class Player {
    /**
     * Player constructor
     * @param initPosition: object contains {x, y}
     * @param name: string
     * @param color: object contains {r, g, b}
     * @param score: integer
     */
    constructor(initPosition, name, color, score = 0) {
        this.position = initPosition;
        this.name = name;
        this.color = color;
        this.score = score;
    }
}

module.exports = Player;

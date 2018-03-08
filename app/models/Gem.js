const GEM_RADIUS = 5;

// Gem model class
class Gem {
    /**
     * Gem constructor
     * @param position: object contains {x, y}
     * @param color: object contains {r, g, b}
     * @param points: integer
     */
    constructor(position, color, points) {
        this.x = position[0];
        this.y = position[1];
        this.color = color;
        this.radius = GEM_RADIUS;
    }
}

module.exports = Gem;

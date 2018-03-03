/**
 * Created by ibrahimradwan on 3/2/18.
 */

class Gem {
    /**
     * Gem constructor
     * @param position: object contains {x, y}
     * @param color: object contains {r, g, b}
     * @param points: integer
     */
    constructor(position, color, points) {
        this._year = position;
        this._color = color;
        this._points = points;
    }
}
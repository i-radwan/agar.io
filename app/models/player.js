/**
 * Created by ibrahimradwan on 3/2/18.
 */

class Player {
    /**
     * Player constructor
     * @param initPosition: object contains {x, y}
     * @param name: string
     * @param color: object contains {r, g, b}
     * @param score: integer
     */
    constructor(initPosition, name, color, score = 0) {
        this._position = initPosition;
        this._name = name;
        this._color = color;
        this._score = score;
    }
}
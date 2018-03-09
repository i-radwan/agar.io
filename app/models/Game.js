/// Game (Room) model class
class Game {

    /**
     * Game constructor
     */
    constructor(id) {
        this._id = id;
        this.players = {};
        this.gems = [];
    }

}

module.exports = Game;

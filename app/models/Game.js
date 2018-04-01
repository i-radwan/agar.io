/// Game (Room) model class
class Game {

    /**
     * Game constructor
     * @param id unique game id
     */
    constructor(id) {
        this._id = id;
        this.players = {};
        this.gems = {};
    }

}

module.exports = Game;

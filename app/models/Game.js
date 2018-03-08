/// Game (Room) model class
class Game {

    /**
     * Game constructor
     */
    constructor(id) {
        this.id = id;
        this.players = [];
        this.gems = [];
    }

}

module.exports = Game;

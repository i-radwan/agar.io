const Game = require("../models/Game");
const Gem = require("../models/Gem");
const Player = require("../models/Player");

const GAME_LENGTH = 1280;
const GAME_HEIGHT = 733;
const MAX_GEMS = 200;
const COLORS = ["red", "green", "blue", "yellow", "orange", "purple", "pink"];

class RoomController {

    constructor(id) {
        // Room ID
        this.id = id;

        // Room Game status
        this.game = new Game();

        // Next available Gems & PlayerIDs
        this.nextGemID = 0;
        this.nextPlayerID = 0;

        // Add default gems
        this.addGems();
    }

    /**
     * Add a new player
     */
    addPlayer() {
        // Generate random position.
        let x = Math.ceil(Math.random() * GAME_LENGTH);
        let y = Math.ceil(Math.random() * GAME_HEIGHT);

        console.log("Add a new player  " + this.nextPlayerID + "in room " + this.id);

        let initialPosition = [x, y];
        let playerID = this.nextPlayerID++;
        let color = COLORS[playerID];

        this.game.players.push(new Player(initialPosition, playerID, color));

        return playerID;
    };

    /**
     * Remove player
     * @param playerID
     */
    removePlayer(playerID) {

    };

    /**
     * Simulate game
     */
    run() {

    };

    /**
     * Add gems
     */
    addGems() {
        if (this.game.gems.length >= MAX_GEMS) return;

        for (let i = this.game.gems.length; i <= MAX_GEMS; i++) {

            // Generate random positions.
            let x = Math.ceil(Math.random() * GAME_LENGTH);
            let y = Math.ceil(Math.random() * GAME_HEIGHT);

            // Chang colors TODO @Samir55.
            // TODO @Samir55 Add gems id
            let color = Math.floor(Math.random() * (COLORS.length));

            this.game.gems.push(new Gem([x, y], COLORS[color], 1));
        }
    };

    /**
     * Consume gems
     */
    consumeGems() {

    };

    /**
     * Get game status
     * @returns {Game} game status
     */
    getGame() {
        return this.game;
    }

}

module.exports = RoomController;

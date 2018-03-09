const Game = require("../models/Game");
const Gem = require("../models/Gem");
const Player = require("../models/Player");

const GAME_LENGTH = 1280;
const GAME_HEIGHT = 733;
const MAX_GEMS = 200;
const COLORS = ["red", "green", "blue", "yellow", "orange", "purple", "pink"];

class RoomController {

    constructor(id) {
        // RoomController ID
        this.id = id;

        // RoomController Game status
        this.game = new Game(id);

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

        console.log("Add a new player  " + this.nextPlayerID + " in room " + this.id);

        let initialPosition = [x, y];
        let playerID = this.nextPlayerID++;
        let color = COLORS[playerID % COLORS.length];

        this.game.players[playerID] = (new Player(playerID, initialPosition, color));

        return playerID;
    };


    /**
     * Update player angle
     * @param playerID
     * @param angle
     */
    updatePlayerAngle(playerID, angle) {

        this.game.players[playerID].angle = angle;

    }


    /**
     * Kill player
     * @param playerID
     */
    killPlayer(playerID) {

    };

    /**
     * Simulate game
     */
    simulate() {
        console.log("Simulating Room " + this.id);
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
    getGameStatus() {
        return this.game;
    }

}

module.exports = RoomController;

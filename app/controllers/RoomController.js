const Game = require("../models/Game");
const Gem = require("../models/Gem");
const Player = require("../models/Player");

const GAME_LENGTH = 1280;
const GAME_HEIGHT = 576;
const MAX_GEMS = 50;
const COLORS = ["red", "green", "blue", "yellow", "orange", "purple", "pink"];

class RoomController {

    constructor(id) {
        // Room id
        this.id = id;

        // Room game status
        this.game = new Game(id);

        // Room leader board
        this.leaderBoard = [];

        // Next available gems & player ids
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

        this.game.players[this.nextPlayerID] = (new Player(
            this.nextPlayerID, [x, y], COLORS[this.nextPlayerID % COLORS.length]
        ));

        return this.nextPlayerID++;
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
        // Move players
        for (let i = 0; i < this.game.players.length; i++) {
            this.game.players[i].y += Math.sin(this.game.players[i].angle) * this.game.players[i].velocity;
            this.game.players[i].x += Math.cos(this.game.players[i].angle) * this.game.players[i].velocity;
        }

        // Check gem eaten & update score of the player TODO In Engine.

        // Check player is dead TODO In Engine.

        // Add gems if needed
        this.addGems();
    };

    /**
     * Add gems
     */
    addGems() {
        if (this.game.gems.length >= MAX_GEMS) return;

        for (let i = this.game.gems.length; i <= MAX_GEMS; i++) {

            // Generate random positions.
            let x = Math.floor(Math.random() * GAME_LENGTH);
            let y = Math.floor(Math.random() * GAME_HEIGHT);

            let color = Math.floor(Math.random() * COLORS.length);

            this.game.gems.push(new Gem(this.nextGemID++, [x, y], COLORS[color], 1));
        }
    };

    /**
     * eat gems
     */
    eatGem(playerID) {

    };

    /**
     * Get game status
     * @returns {Game} game status
     */
    getGameStatus() {
        return this.game;
    }

    /**
     *
     */
    getLeaderBoard() {
        return this.leaderBoard;
    }
}

module.exports = RoomController;

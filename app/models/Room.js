const Game = require("./Game");
const Gem = require("./Gem");
const Player = require("./Player");

// TODO @Samir55 move to config files
const GAME_LENGTH = 400;
const GAME_HEIGHT = 400;
const EPSILON = 0.0001;
const MAX_GEMS = 1;
const COLORS = ["red", "green", "blue", "yellow", "orange", "purple", "pink"];

class Room {

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

        // Add a small player not moving
        let x = Math.ceil(Math.random() * GAME_LENGTH);
        let y = Math.ceil(Math.random() * GAME_HEIGHT);

        this.game.players[this.nextPlayerID] = (new Player(
            this.nextPlayerID, [x, y], COLORS[this.nextPlayerID % COLORS.length], 0
        ));

        this.nextPlayerID++;

        // Add default gems
        this.addGems();
    }

    /**
     * Add a new player
     */
    addPlayer() {
        // TODO @Samir55 select using quad trees
        // Generate random position.
        let x = Math.ceil(Math.random() * GAME_LENGTH);
        let y = Math.ceil(Math.random() * GAME_HEIGHT);

        this.game.players[this.nextPlayerID] = (new Player(
            this.nextPlayerID, [x, y], COLORS[this.nextPlayerID % COLORS.length]
        ));

        return this.nextPlayerID++;
    };

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
            this.game.players[i].movePlayer();
        }


        // TODO @Samir55 check using quad trees
        // Check gem eaten & update score of the player
        for (let i = 0; i < this.game.players.length; i++) {
            let player = this.game.players[i];
            for (let j = 0; j < this.game.gems.length; j++) {
                let gem = this.game.gems[j];
                if (RoomController.playerAteGem(player, gem)) {
                    this.removeGem(player.id, j);
                }
            }
        }

        // Check player is killed
        for (let i = 0; i < this.game.players.length; i++) {
            let playerA = this.game.players[i];
            for (let j = i + 1; j < this.game.players.length; j++) {
                let playerB = this.game.players[j];
                if (RoomController.playerAtePlayer(playerA, playerB)) {
                    playerA.score += playerB.score;
                    playerA.radius += playerB.radius;
                    playerB.alive = false;
                } else if (RoomController.playerAtePlayer(playerB, playerA)) {
                    playerB.score += playerA.score;
                    playerB.radius += playerA.radius;
                    playerA.alive = false;
                }
            }
        }

        // Add new gems if needed
        // this.addGems();
    };

    /**
     * Add gems
     */
    addGems() {
        if (this.game.gems.length >= MAX_GEMS) return;

        for (let i = this.game.gems.length; i < MAX_GEMS; i++) {

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
    removeGem(playerID, index) {
        this.game.gems.splice(index, 1);

        // TODO @Samir55 Refactor
        // Update player's score
        let player = this.game.players[playerID];
        player.score += 1;

        // Update player's size
        player.radius += 5;

        // Update player velocity
        player.updateVelocity();

        console.log(this.game.gems.length);

    };

    /**
     * Get current game status
     * @returns {Game} game status
     */
    getGameStatus() {
        return this.game;
    }

    /**
     * Get the top (currently 5) players.
     */
    getLeaderBoard() {
        return this.leaderBoard;
    }

    /**
     *
     */
    getPlayersCount() {
        return this.game.players.length;
    }

    /**
     *
     */
    isPlayerAlive(playerID) {
        return this.game.players[playerID].alive;
    }

    /**
     * Update player angle
     * @param playerID
     * @param angle
     */
    setPlayerAngle(playerID, angle) {
        this.game.players[playerID].angle = angle;
    }

    /**
     * Check if a gem has been eaten by a player
     * @param gem the gem object
     * @param player the player object
     * @returns {boolean} true when the gem is in the player's blob and false otherwise
     */
    static playerAteGem(player, gem) {
        return (player.x - gem.x) * (player.x - gem.x) + (player.y - gem.y) * (player.y - gem.y) <= player.radius * player.radius;
    }


    static playerAtePlayer(playerA, playerB) {
        let distanceSquared = RoomController.calculateEuclidDistance(
            {x: playerA.x, y: playerA.y}, {x: playerB.x, y: playerB.y});

        let radiiSumSquared = (playerA.radius + playerB.radius) * (playerA.radius + playerB.radius);

        return radiiSumSquared - distanceSquared > EPSILON && RoomController.calculatePlayerArea(playerA) - 1.1 * RoomController.calculatePlayerArea(playerB) > EPSILON;
    }

    /**
     * Calculate the square of distance between 2 points
     * @param pointA
     * @param pointB
     * @returns {number} the square of the distance
     */
    static calculateEuclidDistance(pointA, pointB) {
        return (pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y);
    }

    /**
     * Calculate the area of a player
     * @param player
     * @returns {number} the player's area
     */
    static calculatePlayerArea(player) {
        return 2 * Math.PI * player.radius * player.radius;
    }
}

module.exports = Room;

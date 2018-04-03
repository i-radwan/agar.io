const gameConfig = require("../configs/GameConfig")().gameConfig;
const Game = require("./Game");
const Gem = require("./Gem");
const Player = require("./Player");
const QuadTree = require("./QuadTree");
const Rectangle = require("./Rectangle");

const EPSILON = 0.0001;
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

        // Create a quad tree to carry gems
        // ToDo @SAMRA -> ALERT!! -> Note that the game coordinates are all normalized
        let quadTree = new QuadTree(0, new Rectangle(0, 0, gameConfig.gameSize, gameConfig.gameHeight));

        // Add default gems
        this.addGems();
    }

    /**
     * Add a new player
     */
    addPlayer() {
        // TODO @Samir55 select using quad trees
        // Generate random position. (normalized)
        let x = ((Math.random() * 2 - 1) * gameConfig.gameSize);
        let y = ((Math.random() * 2 - 1) * gameConfig.gameSize);

        // x = y = 0;

        this.game.players[this.nextPlayerID] = (new Player(
            this.nextPlayerID, [x, y], COLORS[this.nextPlayerID % COLORS.length]
        ));

        return this.nextPlayerID++;
    };

    /**
     * Add gems
     */
    addGems() {
        if (this.game.gems.length >= gameConfig.roomMaxGems) return;

        for (let i = this.game.gems.length; i < gameConfig.roomMaxGems; i++) {

            // Generate random positions.
            let x = ((Math.random() * 2 - 1) * gameConfig.gameSize);
            let y = ((Math.random() * 2 - 1) * gameConfig.gameSize);

            let color = Math.floor(Math.random() * COLORS.length);

            this.game.gems.push(new Gem(this.nextGemID++, [x, y], COLORS[color], 1));
        }
    };

    /**
     * Simulate single player
     */
    simulatePlayer(playerID, angle) {
        let player = this.game.players[playerID];

        // ToDo uncomment this check
        // if (!this.checkAngles(angle)) return;

        for (let i = 0; i < angle.length; i++) {
            // Set user angle
            this.setPlayerAngle(playerID, angle[i].angle);

            // Move player
            player.movePlayer();

            // Check gem eaten & update score of the player
            for (let j = 0; j < this.game.gems.length; j++) {
                let gem = this.game.gems[j];
                if (Room.playerAteGem(player, gem)) {
                    this.removeGem(player.id, j);
                }
            }

            // Check player is killed
            for (let j = 0; j < this.game.players.length; j++) {
                let playerB = this.game.players[j];

                if (Room.playerAtePlayer(player, playerB)) {
                    player.incrementScore(playerB.score);
                    this.killPlayer(playerB);
                }
                else if (Room.playerAtePlayer(playerB, player)) {
                    playerB.incrementScore(playerB.score);
                    this.killPlayer(player);
                }
            }
        }
    };

    checkAngles(angle, lastAngleTimeStamp) {
        // Check if all angles are sent in ascending order
        for (let i = 1; i < angle.length; i++) {
            if (angle[i].timestamp < angle[i - 1].timestamp) {
                // ToDo cheating
                return false;
            }
        }

        // Check if sending angles faster than sending rate
        if (angle[0].timestamp - lastAngleTimeStamp < (1000 / 120) * 3) {
            // ToDo cheating
            return false;
        }
        // Tries to send valid angles by going to future
        if (angle[angle.length - 1].timestamp > Date.now()) {
            // ToDo cheating
            return false;
        }

        // Check if the angles are sent very early (bad connection)
        if (Date.now() - angle[0].timestamp > 1000) {
            // ToDo bad connection
            return false;
        }

        return true;
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
            if (!player.alive) continue;

            for (let j = 0; j < this.game.gems.length; j++) {
                let gem = this.game.gems[j];
                if (Room.playerAteGem(player, gem)) {
                    this.removeGem(player.id, j);
                }
            }
        }

        // Check player is killed
        for (let i = 0; i < this.game.players.length; i++) {
            let playerA = this.game.players[i];
            for (let j = i + 1; j < this.game.players.length; j++) {
                let playerB = this.game.players[j];

                if (Room.playerAtePlayer(playerA, playerB)) {
                    playerA.incrementScore(playerB.score);
                    this.killPlayer(playerB);
                }
                else if (Room.playerAtePlayer(playerB, playerA)) {
                    playerB.incrementScore(playerB.score);
                    this.killPlayer(playerA);
                }
            }
        }

        // Add new gems if needed
        this.addGems();
    };

    /**
     * Eat gems
     */
    removeGem(playerID, index) {
        this.game.gems.splice(index, 1);

        // Update player's score
        let player = this.game.players[playerID];
        player.incrementScore(1);
    };

    /**
     * Kill player
     * @param player
     */
    killPlayer(player) {
        player.alive = false;
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
     * Get players count
     * @returns {Number}
     */
    getPlayersCount() {
        return this.game.players.length;
    }

    /**
     * Check whether the player is alive or not
     * @param playerID
     * @returns {boolean}
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

    setPlayerInfo(playerID, newPlayerInfo) {
        this.game.players[playerID].x = newPlayerInfo.x;
        this.game.players[playerID].y = newPlayerInfo.y;
    }

    /**
     * Check if a gem has been eaten by a player
     * @param gem the gem object
     * @param player the player object
     * @returns {boolean} true when the gem is in the player's blob and false otherwise
     */
    static playerAteGem(player, gem) {
        return (player.x - gem.x) * (player.x - gem.x) + (player.y - gem.y) * (player.y - gem.y) <= (player.radius + gem.radius) * (player.radius + gem.radius);
    }

    /**
     * Check whether playerA has eaten playerB
     * @param playerA
     * @param playerB
     * @returns {boolean}
     */
    static playerAtePlayer(playerA, playerB) {
        let distanceSquared = Room.calculateEuclidDistance(
            {x: playerA.x, y: playerA.y}, {x: playerB.x, y: playerB.y});

        let radiiSumSquared = (playerA.radius + playerB.radius) * (playerA.radius + playerB.radius);

        return radiiSumSquared - distanceSquared > EPSILON && Room.calculatePlayerArea(playerA) - 1.1 * Room.calculatePlayerArea(playerB) > EPSILON;
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

const gameConfig = require("../configs/GameConfig")().gameConfig;
const Game = require("./Game");
const Gem = require("./Gem");
const Player = require("./Player");
const QuadTree = require("./QuadTree");
const Rectangle = require("./Rectangle");

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

        // The newly added gems to be sent and the deleted gems indices
        this.deletedGemsIDs = [];
        this.newGems = {};

        // Create a quad tree to carry gems
        let quadTree = new QuadTree(0, new Rectangle(0, 0, gameConfig.GAME_SIZE, gameConfig.GAME_SIZE));

        // Add default gems
        this.addGems();
    }

    /**
     * Add a new player
     */
    addPlayer() {
        // TODO @Samir55 select using quad trees

        // Generate random position (normalized)
        let x = ((Math.random() * 2 - 1));
        let y = ((Math.random() * 2 - 1));

        this.game.players[this.nextPlayerID] = (new Player(
            this.nextPlayerID, [x, y], COLORS[this.nextPlayerID % COLORS.length]
        ));

        return this.nextPlayerID++;
    };

    /**
     * Add gems
     */
    addGems() {
        if (Object.keys(this.game.gems).length >= gameConfig.ROOM_MAX_GEMS) return;

        for (let i = Object.keys(this.game.gems).length; i < gameConfig.ROOM_MAX_GEMS; i++) {

            // Generate random positions (normalized)
            let x = ((Math.random() * 2 - 1));
            let y = ((Math.random() * 2 - 1));

            let color = Math.floor(Math.random() * COLORS.length);

            this.game.gems[this.nextGemID] = new Gem(this.nextGemID, [x, y], COLORS[color], 1);
            this.newGems[this.nextGemID] = this.game.gems[this.nextGemID++];
        }
    };

    /**
     * Simulate single player
     */
    simulatePlayer(playerID, anglesBuffer) {
        let player = this.game.players[playerID];

        player.lastReceivedAngleID = anglesBuffer.id;

        if (!this.checkAngles(anglesBuffer, player.lastAngleTimeStamp)) return;

        player.lastAngleTimeStamp = anglesBuffer.timestamp;

        // Update physics using all received angles
        for (let i = 0; i < anglesBuffer.angles.length; i++) {
            // Set user angle
            this.setPlayerAngle(playerID, anglesBuffer.angles[i]);

            // Move player
            player.movePlayer();

            // Check gem eaten & update score of the player
            this.checkIfPlayerAteGem(player);

            // Check player eaten & update score of the player
            this.checkIfPlayerAtePlayer(player);
        }

        this.updateLeaderBoard();
    };

    checkAngles(anglesBuffer, lastAngleTimeStamp) {
        // Check if the sent timestamp is in the future
        if (anglesBuffer.timestamp > Date.now()) return false;

        // Check for # of sent angles and if they could occur in this delta time(since last send)
        // keeping room for time functions differences (1 extra angle)
        if (Math.ceil((anglesBuffer.timestamp - lastAngleTimeStamp) / gameConfig.UPDATE_PHYSICS_THRESHOLD) <
            anglesBuffer.angles.length - 1) return false;

        // Check if the sent angles are too old (bad connection)
        if (Date.now() - anglesBuffer.timestamp > 1000) {
            // ToDo @Samir
            // ToDo bad connection
            return false;
        }

        return true;
    };

    checkIfPlayerAteGem(player) {
        for (let gemID in this.game.gems) {
            if (!this.game.gems.hasOwnProperty(gemID)) continue;
            let gem = this.game.gems[gemID];

            if (Room.playerAteGem(player, gem)) {
                this.removeGem(player.id, gemID);
            }
        }
    };

    checkIfPlayerAtePlayer(player) {
        for (let playerBID in this.game.players) {
            if (!this.game.players.hasOwnProperty(playerBID)) continue;

            if (playerBID === player.id) continue;

            let playerB = this.game.players[playerBID];
            if (!playerB.alive) continue;

            if (Room.playerAtePlayer(player, playerB)) {
                player.incrementScore(playerB.score);
                this.killPlayer(playerB.id);
            }
            else if (Room.playerAtePlayer(playerB, player)) {
                playerB.incrementScore(playerB.score);
                this.killPlayer(player.id);
            }
        }
    };

    /**
     * Eat gems
     */
    removeGem(playerID, gemID) {
        delete this.game.gems[gemID];

        this.deletedGemsIDs.push(gemID);

        // Update player's score
        let player = this.game.players[playerID];
        player.incrementScore(1);
    };

    /**
     * Kill player
     *
     * @param playerID
     */
    killPlayer(playerID) {
        delete this.game.players[playerID];
    };

    /**
     * Get current game status
     *
     * @param firstTime indicates new player joining the room
     * @returns {{_id: *, Players: *, newGems: ( []|*), deletedGemsIDs: Array}}
     */
    getGameStatus(firstTime) {
        let gameStatus = {
            _id: this.game._id,
            players: this.game.players,
            newGems: (firstTime ? this.game.gems : this.newGems),
            deletedGemsIDs: this.deletedGemsIDs,
            leaderBoard: this.leaderBoard
        };

        gameStatus = JSON.stringify(gameStatus);

        this.deletedGemsIDs = [];
        this.newGems = {};

        return gameStatus;
    }

    /**
     * Get the top (currently 5) players.
     */
    updateLeaderBoard() {
        // Create a new array holding each player id and his score
        this.leaderBoard = [];

        for (let i = 0; i < Object.keys(this.game.players).length; i++) {
            if (!this.game.players.hasOwnProperty(i)) continue;

            let player = this.game.players[i];
            this.leaderBoard.push({player: player.id, score: player.score});
        }

        // Sort that array according to the highest score
        this.leaderBoard.sort(Player.compareScore);
    }

    /**
     * Get players count
     *
     * @returns {Number}
     */
    getPlayersCount() {
        return Object.keys(this.game.players).length;
    }

    /**
     * Check whether the player is alive or not
     *
     * @param playerID
     * @returns {boolean}
     */
    isPlayerAlive(playerID) {
        if (!this.game.players.hasOwnProperty(playerID)) return false;

        return this.game.players[playerID].alive;
    }

    /**
     * Update player angle
     *
     * @param playerID
     * @param angle
     */
    setPlayerAngle(playerID, angle) {
        if (!this.game.players.hasOwnProperty(playerID)) return;

        this.game.players[playerID].angle = angle;
    }

    setPlayerInfo(playerID, newPlayerInfo) {
        this.game.players[playerID].x = newPlayerInfo.x;
        this.game.players[playerID].y = newPlayerInfo.y;
    }

    /**
     * Check if a gem has been eaten by a player
     *
     * @param gem the gem object
     * @param player the player object
     * @returns {boolean} true when the gem is in the player's blob and false otherwise
     */
    static playerAteGem(player, gem) {
        return (player.x - gem.x) * (player.x - gem.x) + (player.y - gem.y) * (player.y - gem.y) <= (player.radius + gem.radius) * (player.radius + gem.radius);
    }

    /**
     * Check whether playerA has eaten playerB
     *
     * @param playerA
     * @param playerB
     * @returns {boolean}
     */
    static playerAtePlayer(playerA, playerB) {
        let distanceSquared = Room.calculateEuclidDistance(
            {x: playerA.x, y: playerA.y}, {x: playerB.x, y: playerB.y});

        let radiiSumSquared = (playerA.radius + playerB.radius) * (playerA.radius + playerB.radius);

        return radiiSumSquared - distanceSquared > gameConfig.EPSILON && Room.calculatePlayerArea(playerA) - 1.1 * Room.calculatePlayerArea(playerB) > gameConfig.EPSILON;
    }

    /**
     * Calculate the square of distance between 2 points
     *
     * @param pointA
     * @param pointB
     * @returns {number} the square of the distance
     */
    static calculateEuclidDistance(pointA, pointB) {
        return (pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y);
    }

    /**
     * Calculate the area of a player
     *
     * @param player
     * @returns {number} the player's area
     */
    static calculatePlayerArea(player) {
        return 2 * Math.PI * player.radius * player.radius;
    }
}

module.exports = Room;

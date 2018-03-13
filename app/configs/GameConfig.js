/**
 * Created by ASamir on 3/10/18.
 */

function GameConfig() {
    let module = {};

    let GAME_SIZE = 6000;
    let SCALE_FACTOR = 2 / GAME_SIZE;

    module.gameConfig = {
        port: 3000,
        gameSize: GAME_SIZE * SCALE_FACTOR,
        roomMaxPlayers: 5,
        roomMaxGems: 1300,
        simulateRunRate: 1000 / 120,
        sendGameStatusesRate: 40,
        gemRadius: 10 * SCALE_FACTOR,
        lowestPlayerVelocity: 0.2 * SCALE_FACTOR,
        initialPlayerVelocity: 3 * SCALE_FACTOR,
        initialPlayerRadius: 30 * SCALE_FACTOR,
        quadTreeNodeMaxObjects: 15,
        quadTreeMaxLevels: 5,
        scaleFactor: SCALE_FACTOR
    };

    return module;
}

module.exports = GameConfig;


/**
 * Created by ASamir on 3/10/18.
 */

function GameConfig() {
    let module = {};

    module.gameConfig = {
        port: 3000,
        gameLength: 1200,
        gameHeight: 600,
        roomMaxPlayers: 5,
        roomMaxGems: 45,
        simulateRunRate: 1000 / 300,
        sendGameStatusesRate: 50,
        gemRadius: 10,
        lowestPlayerVelocity: 0.2,
        initialPlayerVelocity: 2,
        initialPlayerRadius: 30,
        quadTreeNodeMaxObjects: 15,
        quadTreeMaxLevels: 5,
    };

    return module;
}

module.exports = GameConfig;


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
        roomMaxGems: 50,
        simulateRunRate: 1000 / 300,
        sendGameStatusesRate: 50,
        gemRadius: 0.0001,
        initialPlayerVelocity: 0.0001,
        initialPlayerRadius: 50,
        quadTreeNodeMaxObjects: 15,
        quadTreeMaxLevels: 5,
    };

    return module;
}

module.exports = GameConfig;


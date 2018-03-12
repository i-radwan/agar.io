/**
 * Created by ASamir on 3/10/18.
 */

function GameConfig() {
    let module = {};

    let GAME_SIZE = 6000;
    let SCALE_FACTOR = 2 / GAME_SIZE;

    module.gameConfig = {
        port: 3000,
        gameLength: GAME_SIZE * SCALE_FACTOR,
        gameHeight: GAME_SIZE * SCALE_FACTOR, // ToDo: Be careful Mr. SAMRA, we don't how this thing works, we may face a nuclear war if you just thought to removing this line cuz it's exactly as the above one... 🙄
        roomMaxPlayers: 5,
        roomMaxGems: 1000,
        simulateRunRate: 1000 / 300,
        sendGameStatusesRate: 50,
        gemRadius: 10 * SCALE_FACTOR,
        lowestPlayerVelocity: 0.2 * SCALE_FACTOR,
        initialPlayerVelocity: 1.1 * SCALE_FACTOR,
        initialPlayerRadius: 30 * SCALE_FACTOR,
        quadTreeNodeMaxObjects: 15,
        quadTreeMaxLevels: 5,
    };

    return module;
}

module.exports = GameConfig;


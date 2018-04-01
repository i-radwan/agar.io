/**
 * Created by ASamir on 3/10/18.
 */

function GameConfig() {
    let module = {};

    let GAME_SIZE = 6000;
    let SCALE_FACTOR = 2 / GAME_SIZE;

    module.gameConfig = {
        PORT: 3000,
        GAME_SIZE: GAME_SIZE * SCALE_FACTOR,
        ROOM_MAX_PLAYERS: 5,
        ROOM_MAX_GEMS: 300,
        SIMULATE_RUN_RATE: 1000 / 120,
        SEND_GAME_STATUSES_RATE: 40,
        REGENERATE_GEMS_RATE: 5000,
        SEND_LEADER_BOARD_RATE: 4000,
        GEM_RADIUS: 10 * SCALE_FACTOR,
        LOWEST_PLAYER_SPEED: 0.2 * SCALE_FACTOR,
        INITIAL_PLAYER_SPEED: 3 * SCALE_FACTOR,
        INITIAL_PLAYER_RADIUS: 30 * SCALE_FACTOR,
        QUAD_TREE_NODE_MAX_OBJECTS: 15,
        QUAD_TREE_MAX_LEVELS: 5,
        SCALE_FACTOR: SCALE_FACTOR
    };

    return module;
}

module.exports = GameConfig;


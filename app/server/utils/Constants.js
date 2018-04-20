function Constants() {
    let GAME_SIZE = 6000;
    let SCALE_FACTOR = 2 / GAME_SIZE;

    return {
        //
        // Server related constants
        //
        PORT: 3000,
        PING_TIMEOUT: 5000,
        UPDATE_PHYSICS_THRESHOLD: 15,
        SEND_GAME_STATUS_RATE: 40,
        REGENERATE_GEMS_RATE: 5000,

        //
        // Game related constants
        //
        GAME_SIZE: GAME_SIZE,
        SCALE_FACTOR: SCALE_FACTOR,

        // Gems
        ROOM_MAX_GEMS: 1000,
        GEM_MIN_RADIUS: 7 * SCALE_FACTOR,
        GEM_MAX_RADIUS: 11 * SCALE_FACTOR,

        // Players
        ROOM_MAX_PLAYERS: 5,
        LOWEST_PLAYER_SPEED: 0.2 * SCALE_FACTOR,
        INITIAL_PLAYER_SPEED: 5 * SCALE_FACTOR,
        INITIAL_PLAYER_RADIUS: 30 * SCALE_FACTOR,
        EPSILON: 0.000001,

        // General
        COLORS: ["red", "green", "blue", "yellow", "orange", "purple", "pink"],

        //
        // Quad tree constants
        //
        QUAD_TREE_NODE_MAX_OBJECTS: 15,
        QUAD_TREE_MAX_LEVELS: 5
    };
}

module.exports = Constants;
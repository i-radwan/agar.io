function Constants() {
    let GAME_SIZE = 6000;
    let SCALE_FACTOR = 2 / GAME_SIZE;
    let PLAYER_ABSOLUTE_INITIAL_RADIUS = 30;

    return {
        //
        // Server related constants
        //
        PORT: 3000,
        PING_TIMEOUT: 5000,
        UPDATE_PHYSICS_THRESHOLD: 15,
        SEND_GAME_STATUS_RATE: 40,
        REGENERATE_GEMS_RATE: 10000,
        
        //
        // Game related constants
        //
        GAME_SIZE: GAME_SIZE,
        SCALE_FACTOR: SCALE_FACTOR,

        // Gems
        ROOM_MAX_GEMS: 600,
        GEM_RADIUS: 9 * SCALE_FACTOR,
        GEM_GENERATE_POS_MAX_ITERATIONS: 20,

        // Players
        ROOM_MAX_PLAYERS: 5,
        PLAYER_ABSOLUTE_INITIAL_RADIUS: PLAYER_ABSOLUTE_INITIAL_RADIUS,
        PLAYER_INITIAL_RADIUS: PLAYER_ABSOLUTE_INITIAL_RADIUS * SCALE_FACTOR,
        PLAYER_INITIAL_SPEED: 5 * SCALE_FACTOR,
        PLAYER_MIN_SPEED: 0.2 * SCALE_FACTOR,

        // General
        COLORS: ["red", "green", "blue", "yellow", "orange", "purple", "pink"],

        //
        // Grid constants
        //
        GRID_MAX_ITERATIONS: 1000,
        EMPTY_CELL: 0,
        OCCUPIED_CELL: 1,
    };
}

module.exports = Constants;
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
        REGENERATE_GEMS_RATE: 10000,
        REGENERATE_TRAPS_RATE: 30000,

        //
        // Game related constants
        //
        GAME_SIZE: GAME_SIZE,
        SCALE_FACTOR: SCALE_FACTOR,
        MAX_ITERATIONS_LIMIT: 100,

        // Gems
        ROOM_MAX_GEMS: 600,
        GEM_RADIUS: 9 * SCALE_FACTOR,

        // Traps
        ROOM_MAX_TRAPS: 100,
        TRAP_COLOR: "red",
        TRAP_RADIUS: 9 * SCALE_FACTOR,

        // Players
        ROOM_MAX_PLAYERS: 5,
        PLAYER_INITIAL_RADIUS: 30 * SCALE_FACTOR,
        PLAYER_INITIAL_SPEED: 5 * SCALE_FACTOR,
        PLAYER_MIN_SPEED: 0.2 * SCALE_FACTOR,

        // General
        COLORS: ["red", "green", "blue", "yellow", "orange", "purple", "pink"],
    };
}

module.exports = Constants;
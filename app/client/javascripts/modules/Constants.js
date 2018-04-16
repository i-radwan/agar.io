export default function () {
    return {
        general: {
            SEND_ANGLE_TO_SERVER_RATE: (1000 / 120) * 10, // milliseconds
            MAX_ANGLES_BUFFER_SIZE: 20,
            UPDATE_PHYSICS_THRESHOLD: 15,
            FORCE_SERVER_POSITIONS_TIME: 3000
        },
        physics: {
            MOVEMENT_INTERPOLATION_FACTOR: 0.5
        },
        graphics: {
            GAME_BACKGROUND: 0, // black
            GENERIC_WINDOW_AREA: 2000 * 1000,
            ZOOM_INTERPOLATION_FACTOR: 0.05,
            MAX_ZOOM_THRESHOLD: 50,
            MIN_ZOOM_THRESHOLD: 30,
            MAX_RADIUS_ZOOM_LEVEL: 0.16,
            MAX_RADIUS_ZOOM_THRESHOLD: 0.05,
            INITIAL_ZOOM: 2500,

            STARS_COUNT: 1000,
            STAR_RADIUS: 0.00063,
            STAR_COLOR: "white",

            START_BLOB_RADIUS: 0.05 * 2500,     // MAX_RADIUS_ZOOM_THRESHOLD * INITIAL_ZOOM
            BLOB_STROKE_COLOR: 255,
            MAX_BLOB_WABBLE_RADIUS_OFFSET: 1 / 5,
            WABBLE_SPEED: 0.00009,

            TEXT_STYLE: '20px serif',
            TEXT_COLOR: 'orange',

            CANVAS_OBJECT_PLAYER: "player",
            CANVAS_OBJECT_GEM: "gem"
        }
    };
};
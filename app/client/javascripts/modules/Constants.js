export default function () {
    return {
        general: {
            SEND_ANGLE_TO_SERVER_RATE: 15, // milliseconds
            MAX_ANGLES_BUFFER_SIZE: 20,
            UPDATE_PHYSICS_THRESHOLD: 15,
            FORCE_SERVER_POSITIONS_TIME: 3000
        },
        physics: {
            MOVEMENT_INTERPOLATION_FACTOR: 0.3,
            GROW_INTERPOLATION_FACTOR: 0.05
        },
        graphics: {
            GAME_BORDER_LEFT: -1,
            GAME_BORDER_RIGHT: 1,
            GAME_BORDER_DOWN: -1,
            GAME_BORDER_UP: 1,

            GAME_BACKGROUND: 0, // black
            GENERIC_WINDOW_AREA: 2000 * 1000,
            ZOOM_INTERPOLATION_FACTOR: 0.05,
            MAX_ZOOM_THRESHOLD: 50,
            MIN_ZOOM_THRESHOLD: 30,
            MAX_RADIUS_ZOOM_LEVEL: 0.16,
            MAX_RADIUS_ZOOM_THRESHOLD: 0.02,
            INITIAL_ZOOM: 6000,

            PLAYER_NAME_TEXT_FONT_PATH: 'https://raw.githubusercontent.com/foursquare/foursquair/master/src/assets/fonts/Arial%20Bold.ttf',
            PLAYER_NAME_TEXT_FONT_SCALE: 1 / 1.5,
            PLAYER_NAME_TEXT_FONT_STROKE_SCALE: 0.04,
            PLAYER_NAME_TEXT_STROKE_COLOR: 0,
            PLAYER_NAME_TEXT_COLOR: 255,

            STARS_COUNT: 1000,
            STAR_RADIUS: 0.00063,
            STAR_COLOR: "white",

            START_BLOB_RADIUS: 0.02 * 6000,     // MAX_RADIUS_ZOOM_THRESHOLD * INITIAL_ZOOM
            BLOB_STROKE_COLOR: 255,
            MAX_BLOB_WABBLE_RADIUS_OFFSET: 1 / 7,
            WABBLE_SPEED: 0.00009,

            TEXT_STYLE: '20px serif',
            TEXT_COLOR: 'orange'
        }
    };
};
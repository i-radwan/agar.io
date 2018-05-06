export default function () {
    let SERVER_URL = "http://192.168.1.10";
    let SERVER_PORT = "3000";

    return {
        general: {
            AUTH_URL: SERVER_URL + ":" + SERVER_PORT + "/",
            GAME_URL: SERVER_URL + ":" + SERVER_PORT + "/play",
            SEND_ANGLE_TO_SERVER_RATE: 15, // milliseconds
            RECEIVE_STATUS_FROM_SERVER: 40,
            MAX_ANGLES_BUFFER_SIZE: 20,
            UPDATE_PHYSICS_THRESHOLD: 15,
            FORCE_SERVER_POSITIONS_TIME: 3000
        },
        physics: {
            MOVEMENT_INTERPOLATION_FACTOR: 0.75,
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
            STAR_COLOR: "#f5f6fa",

            START_BLOB_RADIUS: 0.02 * 6000,     // MAX_RADIUS_ZOOM_THRESHOLD * INITIAL_ZOOM
            BLOB_STROKE_COLOR: 255,
            MAX_BLOB_WABBLE_RADIUS_OFFSET: 1 / 5,
            OUTER_RADIUS_EXTRA_LENGTH: 1 / 650,
            WABBLE_SPEED: 0.00019,

            TEXT_STYLE: 'comic sans ms',
            TEXT_HEIGHT: 20,
            TEXT_COLOR: 'orange',

            LEADER_BOARD_TITLE: "Leader Board",
            LEADER_BOARD_PLAYERS_COUNT: 10,
            LEADER_BOARD_SPACES_COUNT: 5,
            LEADER_BOARD_MAX_NAME_LENGTH: 10,
            LEADER_BOARD_DOTS_COUNT: 2,
            LEADER_BOARD_MAX_SCORE_LENGTH: 5,

            HUD_MARGIN_WIDTH_FACTOR: 10 / 1920,
            HUD_MARGIN_HEIGHT_FACTOR: 10 / 1080,

            ALERT_DURATION: 500
        }
    };
};
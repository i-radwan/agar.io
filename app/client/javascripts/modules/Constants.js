/**
 * Created by ibrahimradwan on 4/5/18.
 */

export default function () {
    return {
        general: {
            SEND_ANGLE_TO_SERVER_RATE: (1000 / 120) * 10, // milliseconds
            MAX_ANGLES_BUFFER_SIZE: 20,
            UPDATE_PHYSICS_THRESHOLD: 15
        },
        physics: {
            MOVEMENT_INTERPOLATION_FACTOR: 0.5
        },
        graphics: {
            GAME_BACKGROUND: 0, // black
            GENERIC_WINDOW_AREA: 2000 * 1000,
            SIZE_INTERPOLATION_FACTOR: 0.2,
            ZOOM_INTERPOLATION_FACTOR: 0.05,
            MAX_ZOOM_THRESHOLD: 50,
            MIN_ZOOM_THRESHOLD: 30,

            STARS_COUNT: 1000,
            STAR_RADIUS: 0.00133,
            STAR_COLOR: "white",

            START_BLOB_RADIUS: 30,
            BLOB_STROKE_COLOR: 255,
            MAX_BLOB_WABBLE_RADIUS_OFFSET: 1 / 5,
            WABBLE_SPEED: 0.0009,

            TEXT_STYLE: '20px serif',
            TEXT_COLOR: 'orange',

            CANVAS_OBJECT_PLAYER: "player",
            CANVAS_OBJECT_GEM: "gem"
        }
    };
};
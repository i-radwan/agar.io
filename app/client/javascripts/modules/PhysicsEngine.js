import Constants from "./Constants.js";

export default function (p5Lib) {
    let module = {};

    let constants = Constants();

    /**
     * Resets the timing variables.
     */
    module.init = function () {
        module.timers = {
            now: window.performance.now(),
            elapsed: window.performance.now(),
            lagToHandlePhysics: 0,
            forceServerPositionsTimer: 0
        };
    };

    /**
     * Returns the number of missed physics iterations
     * and reduces the internal lag timer by this amount.
     *
     * @param forcePosition     force players positions flag
     * @returns {number}        the number of missed iterations
     */
    module.narrowPhysicsDelay = function (forcePosition) {
        if (module.timers.lagToHandlePhysics > constants.general.FORCE_SERVER_POSITIONS_TIME || forcePosition) {
            module.timers.lagToHandlePhysics = 0;
            return -1;
        }

        let count = 0;

        while (module.timers.lagToHandlePhysics >= constants.general.UPDATE_PHYSICS_THRESHOLD) {
            count++;
            module.timers.lagToHandlePhysics -= constants.general.UPDATE_PHYSICS_THRESHOLD;
        }

        return count;
    };

    /**
     * Updates game physics timers.
     */
    module.increaseTimers = function () {
        let now = window.performance.now();

        // Calculate total time spent outside
        module.timers.elapsed = now - module.timers.now;
        module.timers.now = now;
        module.timers.lagToHandlePhysics += module.timers.elapsed;
        module.timers.forceServerPositionsTimer += module.timers.elapsed;
    };

    /**
     * Forces all the given player to their server position immediately.
     *
     * @param players   the list of players to force their positions
     */
    module.forceServerPositions = function (players) {
        // Move players to server position
        for (let key in players) {
            let player = players[key];

            player.canvasX = player.x;
            player.canvasY = player.y;
        }
    };

    /**
     * Moves the given players in their directions.
     *
     * @param players       the list of players to move
     * @param mainPlayerId  the game main player
     * @param rollback      a rolling back flag
     */
    module.movePlayers = function (players, mainPlayerId, rollback) {
        // Move players
        for (let key in players) {
            let player = players[key];

            if (key === mainPlayerId && !rollback) {
                module.updatePlayerPosition(player);
                continue;
            }

            movePlayerToPosition(player);
        }
    };

    /**
     * Updates the given player position by his velocity and angle.
     *
     * @param player    the player to be moved.
     * @param factor    factor to be multiplied by the velocity
     */
    module.updatePlayerPosition = function (player, factor = 1) {
        let newCanvasX = player.canvasX + Math.cos(player.angle) * player.velocity;
        let newCanvasY = player.canvasY + Math.sin(player.angle) * player.velocity;

        if (newCanvasX >= constants.graphics.GAME_BORDER_LEFT && newCanvasX <= constants.graphics.GAME_BORDER_RIGHT) {
            player.canvasX += (newCanvasX - player.canvasX) * factor;
        }
        if (newCanvasY >= constants.graphics.GAME_BORDER_DOWN && newCanvasY <= constants.graphics.GAME_BORDER_UP) {
            player.canvasY += (newCanvasY - player.canvasY) * factor;
        }
    };

    /**
     * Moves (LERPs) the the given player towards his server positions.
     *
     * @param player    the player to be moved.
     */
    let movePlayerToPosition = function (player) {
        // Interpolate user location until we reach target
        player.canvasX = p5Lib.lerp(player.canvasX, player.x, constants.physics.MOVEMENT_INTERPOLATION_FACTOR);
        player.canvasY = p5Lib.lerp(player.canvasY, player.y, constants.physics.MOVEMENT_INTERPOLATION_FACTOR);
    };

    return module;
};
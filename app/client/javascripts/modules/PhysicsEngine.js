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

    module.applyPhysics = function (me, players, lerping) {
        // Lag is to much, happens with tab out, let's roll back to server now!
        if (module.timers.lagToHandlePhysics > constants.general.FORCE_SERVER_POSITIONS_TIME || me.forcePosition) {
            console.log("Force");
            forceServerPositions(players);
            return;
        }

        // Perform physics in a loop by the number of the threshold spent before getting here again
        while (module.timers.lagToHandlePhysics >= constants.general.UPDATE_PHYSICS_THRESHOLD) {
            // Update the game status (My location, players, gems, score, ... etc) and physics
            updateGamePhysics(me, players, lerping);

            module.timers.lagToHandlePhysics -= constants.general.UPDATE_PHYSICS_THRESHOLD;
        }
    };

    let updateGamePhysics = function (me, players, lerping) {
        // Move players
        for (let key in players) {
            let player = players[key];

            if (player.id === me.id) continue;

            movePlayerToPosition(player, {x: player.x, y: player.y});
        }

        // Move main player
        moveMainPlayer(me, lerping);
    };

    let forceServerPositions = function (players) {
        // Move players to server position
        for (let key in players) {
            forceServerPosition(players[key]);
        }

        module.timers.lagToHandlePhysics = 0;
    };

    /**
     * Move main player normal movement (player's velocity and angle)
     *
     * @param me main player object.
     * @param lerping to check if game is lerping
     */
    let moveMainPlayer = function (me, lerping) {
        if (lerping) {
            movePlayerToPosition(me, {x: me.x, y: me.y});
            return;
        }

        // Move player by his angle and velocity
        updatePlayerPosition(me);
    };

    /**
     * Move some player to target
     *
     * @param player the player to be moved.
     * @param position the point to be moved to.
     */
    let movePlayerToPosition = function (player, position) {
        // Interpolate user location until we reach target
        player.canvasX = p5Lib.lerp(player.canvasX, position.x, constants.physics.MOVEMENT_INTERPOLATION_FACTOR);
        player.canvasY = p5Lib.lerp(player.canvasY, position.y, constants.physics.MOVEMENT_INTERPOLATION_FACTOR);
    };

    /**
     * Every interval reset the player position to server's
     *
     * @param player the player to fix its position.
     */
    let forceServerPosition = function (player) {
        player.canvasX = player.x;
        player.canvasY = player.y;
    };

    /**
     * Move some player normal movement (velocity and angle)
     *
     * @param player the player to be moved.
     */
    let updatePlayerPosition = function (player) {
        let newCanvasX = player.canvasX + Math.cos(player.angle) * player.velocity;
        let newCanvasY = player.canvasY + Math.sin(player.angle) * player.velocity;

        if (newCanvasX >= constants.graphics.GAME_BORDER_LEFT && newCanvasX <= constants.graphics.GAME_BORDER_RIGHT) {
            player.canvasX = newCanvasX;
        }
        if (newCanvasY >= constants.graphics.GAME_BORDER_DOWN && newCanvasY <= constants.graphics.GAME_BORDER_UP) {
            player.canvasY = newCanvasY;
        }
    };

    return module;
};
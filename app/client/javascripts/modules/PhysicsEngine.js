/**
 * Created by ibrahimradwan on 3/6/18.
 */
import Constants from "./Constants.js";

export default function (p5Lib) {
    let module = {};
    let constants = Constants();

    /**
     * Move some player to follow the mouse
     *
     * @param player the player to be moved
     * @param target object contains the targeted x, y coordinates
     * @param anglesQueue the queue that contains mouse angles (to be filled)
     */
    module.getMouseAngle = function (player, target, anglesQueue, lerping) {
        if (lerping) return;

        // To be changed when splitting happens (using get equivalent center)
        let angleAndDistance = module.getAngleAndDistance({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        }, target);

        // Update my player angle
        player.angle = angleAndDistance.angle;

        // Push this angle to be sent to server
        anglesQueue.mouseAngles[anglesQueue.mouseAngles.length - 1].angles.push(angleAndDistance.angle);
        anglesQueue.anglesBufferSize++;
    };

    /**
     * Move some player normal movement (player's velocity and angle)
     *
     * @param player the player to be moved.
     * @param isMe is this player the main player?
     * @param gameEnv to check if game is lerping
     */
    module.movePlayer = function (player, isMe, gameEnv) {
        if (isMe && !gameEnv.lerping) {
            updatePlayerPosition(player);
        }
        else {
            movePlayerToPosition(player, {x: player.x, y: player.y});
        }
    };

    /**
     * Every interval reset the player position to server's
     *
     * @param player the player to fix its position.
     */
    module.forceServerPosition = function (player) {
        player.canvasX = player.x;
        player.canvasY = player.y;
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

    module.getAngleAndDistance = function (point1, point2) {
        // Calculate distance
        let distance = Math.sqrt(Math.pow(point2.x - point1.x, 2) +
            Math.pow(point2.y - point1.y, 2));

        // Return the angle and the distance
        return {
            distance: distance,
            angle: Math.atan2((point2.y - point1.y), (point2.x - point1.x))
        };
    };

    return module;
};
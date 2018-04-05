/**
 * Created by ibrahimradwan on 3/6/18.
 */
// Constants
const MOVEMENT_INTERPOLATION_FACTOR = 0.5;

export default function () {
    let module = {};

    /**
     * Move some player to follow the mouse
     * @param player the player to be moved
     * @param target object contains the targeted x, y coordinates
     */
    module.getMouseAngle = function (player, target) {
        // To be changed when splitting happens (using get equivalent center)
        let angleAndDistance = module.getAngleAndDistance({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        }, target);

        if (player.lerping) return;

        // Update my player angle
        player.angle = angleAndDistance.angle;

        // Push this angle to be sent to server
        player.mouseAngle[player.mouseAngle.length - 1].angles.push({
            angle: angleAndDistance.angle,
            timestamp: Date.now()
        });
        player.anglesBufferSize++;
    };

    /**
     * Move some player normal movement (player's velocity and angle)
     * @param player the player to be moved.
     */
    module.movePlayer = function (player, isMe) {
        if (!isMe || !player.lerping) {
            // Move canvas object
            updatePlayerPosition(player, player.velocity);
        }
        else {
            module.movePlayerToPosition(player, {x: player.x, y: player.y});
        }
    };

    /**
     * Move some player to target
     * @param player the player to be moved.
     * @param target the point to be moved to.
     */
    module.movePlayerToPosition = function (player, target) {
        // Interpolate user location until we reach target
        player.canvasX = lerp(player.canvasX, target.x, MOVEMENT_INTERPOLATION_FACTOR);
        player.canvasY = lerp(player.canvasY, target.y, MOVEMENT_INTERPOLATION_FACTOR);
    };

    /**
     * Move some player normal movement (velocity and angle)
     * @param player the player to be moved.
     * @param velocity the velocity in which player is moving.
     * @param updatePosition{boolean} update player.x, player.y.
     */
    let updatePlayerPosition = function (player, velocity) {
        // Move canvas object
        player.canvasX += Math.cos(player.angle) * velocity;
        player.canvasY += Math.sin(player.angle) * velocity;
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
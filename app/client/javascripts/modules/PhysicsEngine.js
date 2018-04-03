/**
 * Created by ibrahimradwan on 3/6/18.
 */
// Constants
const MOVEMENT_INTERPOLATION_FACTOR = 0.1;

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

        // Calculate mouse angle and move my player with the velocity
        player.mouseAngle.push({angle: angleAndDistance.angle, timestamp: Date.now()});
    };

    /**
     * Move some player normal movement (player's velocity and angle)
     * @param player the player to be moved.
     */
    module.movePlayerNormally = function (player) {
        if (dist(player.x, player.y, player.canvasObject.x, player.canvasObject.y) < player.radius) {
            // Move canvas object
            movePlayer(player, player.velocity, true);
        }
        else {
            module.movePlayerToTarget(player, {x: player.x, y: player.y});
        }
    };

    /**
     * Move some player to target
     * @param player the player to be moved.
     * @param target the point to be moved to.
     */
    module.movePlayerToTarget = function (player, target) {
        // Interpolate user location until we reach target
        player.canvasObject.x = lerp(player.canvasObject.x, target.x, MOVEMENT_INTERPOLATION_FACTOR);
        player.canvasObject.y = lerp(player.canvasObject.y, target.y, MOVEMENT_INTERPOLATION_FACTOR);
    };

    /**
     * Move some player normal movement (velocity and angle)
     * @param player the player to be moved.
     * @param velocity the velocity in which player is moving.
     * @param updatePosition{boolean} update player.x, player.y.
     */
    let movePlayer = function (player, velocity, updatePosition) {
        // Move canvas object
        player.canvasObject.x += Math.cos(player.angle) * velocity;
        player.canvasObject.y += Math.sin(player.angle) * velocity;

        if (!updatePosition) return;

        // Update position
        //ToDo @IAR Why do we change the server xD ?
        //player.x = player.canvasObject.x;
        //player.y = player.canvasObject.y;
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
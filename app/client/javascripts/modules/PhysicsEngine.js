/**
 * Created by ibrahimradwan on 3/6/18.
 */

export default function () {
    let module = {};

    /**
     * Move some player to follow the mouse
     * @param player the player to be moved
     * @param target object contains the targeted x, y coordinates
     */
    module.movePlayerToMouse = function (player, target) {
        // Get my circle center
        let myCircleCenterX = player.canvasObject.getCenterPoint().x;
        let myCircleCenterY = player.canvasObject.getCenterPoint().y;

        let angleAndDistance = module.getAngleAndDistance({x: myCircleCenterX, y: myCircleCenterY}, target);

        let distance = angleAndDistance.distance;

        // Check if cursor outside the circle (to avoid vibrations)
        if (distance < 0.1)
            return;

        // Calculate mouse angle and move my player with the velocity
        player.mouseAngle = angleAndDistance.angle;
        movePlayer(player, Math.min(distance, player.velocity), true);
    };

    /**
     * Move some player normal movement (player's velocity and angle)
     * @param player the player to be moved.
     */
    module.movePlayerNormally = function (player) {
        // Move canvas object
        movePlayer(player, player.velocity, true);
    };

    /**
     * Move some player to target
     * @param player the player to be moved.
     * @param target the point to be moved to.
     */
    module.movePlayerToTarget = function (player, target) {
        let velocity = player.velocity;

        let angleAndDistance = module.getAngleAndDistance({
            x: player.canvasObject.x,
            y: player.canvasObject.y
        }, target);

        velocity = Math.min(angleAndDistance.distance, velocity);

        // Move canvas object
        movePlayer(player, velocity, false);
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
        player.x = player.canvasObject.x;
        player.y = player.canvasObject.y;
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
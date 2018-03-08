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
        if (distance < 2)
            return;

        // Calculate mouse angle and move my player with the velocity
        player.angle = angleAndDistance.angle;
        movePlayer(player, Math.min(distance, player.velocity), true);
    };

    /**
     * Move some player normal movement (velocity and angle)
     * @param player the player to be moved.
     * @param updatePosition enable updating user position (i.e. player.x, player.y)
     */
    module.movePlayerNormally = function (player, updatePosition = true) {
        // Move canvas object
        movePlayer(player, player.velocity, updatePosition);
    };

    /**
     * Move some player to target
     * @param player the player to be moved.
     * @param target the point to be moved to.
     * @param updatePosition enable updating user position (i.e. player.x, player.y)
     */
    module.movePlayerToTarget = function (player, target, updatePosition = true) {
        let velocity = player.velocity;

        let angleAndDistance = module.getAngleAndDistance({
            x: player.canvasObject.left,
            y: player.canvasObject.top
        }, target);

        velocity = Math.min(angleAndDistance.distance, velocity);

        // Move canvas object
        movePlayer(player, velocity, updatePosition);
    };

    let movePlayer = function (player, velocity, updatePosition) {
        // Move canvas object
        player.canvasObject.top += Math.sin(player.angle) * velocity;
        player.canvasObject.left += Math.cos(player.angle) * velocity;

        if (!updatePosition) return;

        // Update position
        player.x = player.canvasObject.left;
        player.y = player.canvasObject.top;
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
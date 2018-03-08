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

        let angleAndDifference = module.getAngleAndDifference({x: myCircleCenterX, y: myCircleCenterY}, target);

        let difference = angleAndDifference.difference;

        // Check if cursor outside the circle (to avoid vibrations)
        if (difference < 2)
            return;

        // Calculate mouse angle and move my player with the velocity
        player.angle = angleAndDifference.angle;
        player.canvasObject.top += Math.sin(player.angle) * player.velocity;
        player.canvasObject.left += Math.cos(player.angle) * player.velocity;

        // Update position
        player.x = player.canvasObject.left;
        player.y = player.canvasObject.top;
    };

    /**
     * Move some player normal movement (velocity and angle)
     * @param player the player to be moved.
     */
    module.movePlayer = function (player) {
        // Move canvas object
        player.canvasObject.top += Math.sin(player.angle) * player.velocity;
        player.canvasObject.left += Math.cos(player.angle) * player.velocity;

        // Update position
        player.x = player.canvasObject.left;
        player.y = player.canvasObject.top;
    };

    module.getAngleAndDifference = function (point1, point2) {
        // Calculate difference
        let difference = Math.sqrt(Math.pow(point2.x - point1.x, 2) +
            Math.pow(point2.y - point1.y, 2));

        // Return the angle and the difference
        return {
            difference: difference,
            angle: Math.atan2((point2.y - point1.y), (point2.x - point1.x))
        };
    };

    return module;
};
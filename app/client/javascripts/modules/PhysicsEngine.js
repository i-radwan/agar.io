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

        let difference = Math.sqrt(Math.pow(target.x - myCircleCenterX, 2) +
            Math.pow(target.y - myCircleCenterY, 2));

        // Check if cursor outside the circle (to avoid vibrations)
        if (difference < 2)
            return;

        // ToDo check if this if is required
        // Calculate mouse angle and move my player with the velocity
        if (target.x - myCircleCenterX === 0) { // Vertical direction
            player.canvasObject.top += Math.sign(target.y - myCircleCenterY) * player.velocity;
        } else { // Inclined direction
            let angle = Math.atan2((target.y - myCircleCenterY), (target.x - myCircleCenterX));
            player.canvasObject.top += Math.sin(angle) * player.velocity;
            player.canvasObject.left += Math.cos(angle) * player.velocity;
        }

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

    return module;
};
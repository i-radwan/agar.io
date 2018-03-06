/**
 * Created by ibrahimradwan on 3/6/18.
 */

export default function (gameStatus) {
    let module = {};

    module.moveMyCircle = function () {
        // Get my circle center
        let myCircleCenterX = gameStatus._me.object.getCenterPoint().x;
        let myCircleCenterY = gameStatus._me.object.getCenterPoint().y;

        let difference = Math.sqrt(Math.pow(gameStatus.env.mouseX - myCircleCenterX, 2) +
            Math.pow(gameStatus.env.mouseY - myCircleCenterY, 2));

        // Check if cursor outside the circle (to avoid vibrations)
        if (difference < 2)
            return;

        // Calculate mouse angle and move my player with the velocity
        if (gameStatus.env.mouseX - myCircleCenterX === 0) { // Vertical direction
            gameStatus._me.object.top += Math.sign(gameStatus.env.mouseY - myCircleCenterY) * gameStatus._me.velocity;
        } else { // Inclined direction
            let angle = Math.atan2((gameStatus.env.mouseY - myCircleCenterY), (gameStatus.env.mouseX - myCircleCenterX));
            gameStatus._me.object.top += Math.sin(angle) * gameStatus._me.velocity;
            gameStatus._me.object.left += Math.cos(angle) * gameStatus._me.velocity;
        }

        // Update position
        gameStatus._me.x = gameStatus._me.object.left;
        gameStatus._me.y = gameStatus._me.object.top;
    };

    return module;
};
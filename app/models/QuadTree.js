/**
 * Created by ASamir on 3/11/18.
 */
const gameConfig = require("../configs/GameConfig")().gameConfig;
const Rectangle = require("./Rectangle");

// Quad tree class
class QuadTree {

    /** Quad tree constructor
     *
     * @param pLevel
     * @param pBounds
     */
    constructor(pLevel, pBounds) {
        this.level = pLevel;
        this.bounds = pBounds;
        this.nodes = [];
        this.bodies = [];
    }

    /**
     * Clear the quad tree
     */
    clear() {
        this.nodes = [];
        this.bodies = [];
    }

    /**
     * Split the quad tree into 4 sub nodes
     */
    split() {
        let subLength = Math.floor(this.bounds.width / 2.0);
        let subHeight = Math.floor(this.bounds.height / 2.0);
        let x = Math.floor(this.bounds.x);
        let y = Math.floor(this.bounds.y);

        this.nodes.push(new QuadTree(this.level + 1, new Rectangle(x, y, subLength, subHeight)));
        this.nodes.push(new QuadTree(this.level + 1, new Rectangle(x + subLength, y, subLength, subHeight)));
        this.nodes.push(new QuadTree(this.level + 1, new Rectangle(x, y + subHeight, subLength, subHeight)));
        this.nodes.push(new QuadTree(this.level + 1, new Rectangle(x + subLength, y + subHeight, subLength, subHeight)));
    }

    /**
     * Get the index of the node that the object (body) belongs to
     * @param body the object a player or a gem
     * @returns {number} return index of the quad node, -1 otherwise (i.e. it belongs to a bigger quad tree
     */
    getIndex(body) {
        let index = -1;

        let verticalMidPoint = this.bounds.x + (this.bounds.rLength / 2.0);
        let horizontalMidPoint = this.bounds.y + (this.bounds.rHeight / 2.0);

        let bodyY = body.y - body.radius;
        let bodyX = body.x - body.radius;

        // We are now finding a place in the four nodes where the body can fit completely
        let canFitInTopQuadrants = (bodyY < horizontalMidPoint && bodyY + 2 * body.radius < horizontalMidPoint);
        let canFitInBottomQuadrants = (bodyY > horizontalMidPoint);
        let canFitInLeftQuadrants = (bodyX < verticalMidPoint && bodyX + 2 * body.radius < verticalMidPoint);
        let canFitInRightQuadrants = (bodyX > verticalMidPoint);

        if (canFitInLeftQuadrants)
            if (canFitInTopQuadrants)
                index = 0;
            else if (canFitInBottomQuadrants)
                index = 2;

        if (canFitInRightQuadrants)
            if (canFitInTopQuadrants)
                index = 1;
            else if (canFitInBottomQuadrants)
                index = 3;

        return index;
    }

    /**
     * Insert a body to the quad tree
     * @param body gem or player to be inserted
     */
    insert(body) {
        if (this.nodes.length > 0) {
            let index = this.getIndex(body);

            if (index > -1) {
                this.nodes[index].insert(body);
                return;
            }
        }

        this.bodies.push(body);

        // Check if the current node exceeds it max objects limit
        if (this.bodies.length > gameConfig.quadTreeNodeMaxObjects && this.level < gameConfig.quadTreeMaxLevels) {
            if (this.nodes.length > 0) {
                this.split();
            }

            let i = 0;
            while (i < this.bodies.length) {

                let index = this.getIndex(this.bodies[i]);

                if (index > -1) {
                    this.nodes.insert(this.bodies.remove(i));
                } else {
                    i++;
                }
            }
        }
    }

    /**
     * Get near bodies to a certain body
     * @param body the body in question
     * @returns {Array} array having all near bodies to the one in question
     */
    getNearBodies(body) {
        let index = this.getIndex(body);
        let nearBodies = this.bodies;

        if (index > -1 && this.nodes.length > 0) {
            this.nodes[index].getNearBodies(nearBodies, body);
        }

        if (this.nodes.length > 0) {
            if (index > -1) {
                nearBodies = nearBodies.concat(this.getNearBodies(body));
            } else {
                for (let i = 0; i < this.nodes.length; i++) {
                    nearBodies = nearBodies.concat(this.getNearBodies(body));
                }
            }
        }

        return nearBodies;
    }

}

module.exports = QuadTree;

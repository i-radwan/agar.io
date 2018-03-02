/**
 * Created by ibrahimradwan on 3/2/18.
 */
var path = require('path');

module.exports = function (app, express) {
    // Set static path to provide required assets
    app.use(express.static(path.resolve('../client/')));

    // Main game screen
    app.get('/', function (req, res) {
        res.sendFile(path.resolve('../client/views/index.html'));
    });
};

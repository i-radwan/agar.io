// Imports
const Constants = require("./utils/Constants")();
const GameServer = require("./server");
const User = require('./models/User');

const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
const io = require('socket.io')(httpServer, {
    pingInterval: 500,
    pingTimeout: Constants.PING_TIMEOUT,
});


/**
 * The starting main function of the server.
 */
function run() {
    setupDatabase();
    setupServer();
    startServer();
}

/**
 * Setups the database of the server needed for user authentication.
 */
function setupDatabase() {
    // Connect to MongoDB
    let mongoose = require('mongoose');

    mongoose.connect('mongodb://localhost:27017/agar_io');

    // Handle MongoDB error
    let db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log("connected to MongoDB");
    });
}

/**
 * Registers different routing endpoints and middleware's.
 */
function setupServer() {
    //
    // Middleware's
    //

    // Use HTTP sessions
    let session = require('express-session')({
        secret: 'session_secret_key',
        resave: true,
        saveUninitialized: false
    });
    app.use(session);

    // Use Socket IO sessions
    let sharedSession = require("express-socket.io-session")(session, {autoSave: true});
    io.use(sharedSession);

    // Parse the body of the incoming requests
    let bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    // Set static path to provide required assets
    let path = require('path');
    app.use(express.static(path.resolve('../client/')));

    //
    // Routes
    //

    // Authentication view endpoint
    app.get('/', function (req, res) {
        if (req.session.user) {
            res.sendFile(path.resolve('../client/views/profile.html'));
        }
        else {
            res.sendFile(path.resolve('../client/views/auth.html'));
        }
    });

    // Main game screen
    app.get('/play', function (req, res) {
        req.session.name = (req.session.user ? req.session.user.username : req.body.name) || "";
        res.sendFile(path.resolve('../client/views/index.html'));
    });

    // Join endpoint
    app.post('/join', function (req, res) {
        req.session.name = (req.session.user ? req.session.user.username : req.body.name) || "";
        res.json({status: 0});
    });

    // Register endpoint
    app.post('/register', function (req, res) {
        let username = req.body.username;
        let password = req.body.password;

        if (!username || !password) {
            return res.json({status: 1, error_msg: "Invalid register request"});
        }

        let userData = {
            username: username,
            password: password,
            highScore: 10
        };

        // Try registering the user
        User.create(userData, function (error, user) {
            if (error || !user) {
                res.json({status: 1, error_msg: "The username already exists"});
                console.log("error in registering", error);
            }
            else {
                req.session.user = user;
                req.session.name = user.username;
                res.json({status: 0});
                console.log(user.username, "has registered...");
            }
        });
    });

    // Log in post request endpoint
    app.post('/login', function (req, res) {
        let username = req.body.username;
        let password = req.body.password;

        if (!username || !password) {
            return res.json({status: 1, error_msg: "Invalid login request"});
        }

        // Authenticate user's credentials
        User.authenticate(username, password, function (error, user) {
            if (error) {
                res.json({status: 1, error_msg: error.message});
                console.log("error in logging in", error);
            }
            else {
                req.session.user = user;
                req.session.name = user.username;
                res.json({status: 0});
                console.log(user.username, "has logged in...");
            }
        });
    });

    // Log out endpoint
    app.get('/logout', function (req, res) {
        // Destroy session object
        if (req.session) {
            req.session.destroy(function (err) {
                if (err) {
                    res.json({status: 1, error_msg: "Please try again later!"});
                    console.log("error in logging out", error);
                }
                else {
                    res.json({status: 0});
                    console.log(req.session.user, "has logged out...");
                }
            });
        }
    });
}

/**
 * Start listening on a specific port and serving the game to the connected clients.
 */
function startServer() {
    // Start listening on port 3000
    httpServer.listen(Constants.PORT, function () {
        console.log('listening on *: ', Constants.PORT);
    });

    // Start serving the game
    let server = new GameServer(io);
    server.init();
}

//
// Start running the server-side code
//
run();
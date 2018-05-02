// Imports
const Constants = require("./utils/Constants")();
const GameServer = require("./server");

const express = require('express');

const session = require('express-session')({
    secret: 'session_secret_key',
    resave: true,
    saveUninitialized: false
});
const sharedSession = require("express-socket.io-session");

const app = express();
const httpServer = require('http').Server(app);
const io = require('socket.io')(httpServer, {
    pingInterval: 500,
    pingTimeout: Constants.PING_TIMEOUT,
});

const bodyParser = require('body-parser');          // For parsing the body of the incoming request
const path = require('path');

const mongoose = require('mongoose');               // For modeling database


/**
 * The starting main function of the server.
 */
function run() {
    setupDatabase();
    setupServer();
    setupServer();
    startServer();
}

/**
 * Setups the database of the server needed for user authentication.
 */
function setupDatabase() {
    // Connect to MongoDB
    mongoose.connect('mongodb://localhost/agar_io');
    let db = mongoose.connection;

    // Handle MongoDB error
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

    // Use sessions for tracking users
    app.use(session);

    // Use sessions with socket io
    io.use(sharedSession(session, {autoSave: true}));

    // Set static path to provide required assets
    app.use(express.static(path.resolve('../client/')));

    //
    // Routes
    //

    // Main game screen
    app.get('/', function (req, res) {
        // ToDo: check if not logged in -> redirect to '/login'
        res.sendFile(path.resolve('../client/views/index.html'));
    });

    // Log in view endpoint
    app.get('/login', function (req, res) {
        // ToDo: check if already logged in -> redirect to '/'
        res.sendFile(path.resolve('../client/views/auth.html'));
    });

    // Join endpoint
    // ToDo: try to redirect the user from here the server. Check: (https://stackoverflow.com/questions/11355366/how-to-redirect-users-browser-url-to-a-different-page-in-nodejs)
    app.post('/join', function (req, res) {
        // ToDo: check if already logged in
        // return res.json({status: 0, redirect: "/"});
        return res.json({status: 1, error_msg: "Please use valid name!"});
    });

    // ToDo: merge register, endpoint functions
    // Register endpoint
    app.post('/register', function (req, res) {
        // ToDo: check if already logged in
    });

    // Log in post request endpoint
    app.post('/login', function (req, res) {
        // ToDo: check if already logged in
    });

    // Log out endpoint
    app.get('/logout', function (req, res) {
        if (req.session) {

            // delete session object
            req.session.destroy(function (err) {
                if (err) {
                    return next(err);
                }
                else {
                    return res.redirect('/');
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
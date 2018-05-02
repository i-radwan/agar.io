// Imports
const Constants = require("./utils/Constants")();
const GameServer = require("./server");             // For serving the actual game
// const User = require('./models/user');              // User database model class

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

// const bodyParser = require('body-parser');          // For parsing the body of the incoming request
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

    // Add session options
    // Use sessions for tracking users
    app.use(session);

    io.use(sharedSession(session, {
        autoSave:true
    }));

    // Parse incoming requests body
    // app.use(bodyParser.json());
    // app.use(bodyParser.urlencoded({extended: false}));

    // Set static path to provide required assets
    app.use(express.static(path.resolve('../client/')));

    //
    // Routes
    //

    // Main game screen
    app.get('/', function (req, res) {
        res.sendFile(path.resolve('../client/views/index.html'));
    });

    // // Register endpoint
    // app.post('/register', function (req, res) {
    //     if (req.body.username && req.body.password) {
    //         let userData = {
    //             username: req.body.username,
    //             password: req.body.password,
    //         };
    //
    //         User.create(userData, function (error, user) {
    //             if (error) {
    //                 console.log(error);
    //                 return res.send("failed");
    //             }
    //             else {
    //                 req.session.userId = user._id;
    //                 return res.send("registered!!");
    //             }
    //         });
    //     }
    //     else {
    //         return res.send("failed");
    //     }
    // });
    //
    // // Log in endpoint
    // app.post('/login', function (req, res) {
    //     if (req.body.username && req.body.password) {
    //         User.authenticate(req.body.username, req.body.password, function (error, user) {
    //             if (error || !user) {
    //                 return res.send("failed");
    //             }
    //             else {
    //                 req.session.userId = user._id;
    //                 return res.send("logged in!!");
    //             }
    //         });
    //     }
    // });
    //
    // // Log out endpoint
    // app.get('/logout', function (req, res) {
    //     if (req.session) {
    //
    //         // delete session object
    //         req.session.destroy(function (err) {
    //             if (err) {
    //                 return next(err);
    //             }
    //             else {
    //                 return res.redirect('/');
    //             }
    //         });
    //     }
    // });
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
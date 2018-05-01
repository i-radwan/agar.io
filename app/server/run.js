// Imports
const Constants = require("./utils/Constants")();
const GameServer = require("./server");

const express = require('express');
const app = express();
const path = require('path');
const httpServer = require('http').Server(app);
const io = require('socket.io')(httpServer, {
    pingInterval: 500,
    pingTimeout: Constants.PING_TIMEOUT,
});

// ================================================


let mongoose = require('mongoose');


//connect to MongoDB
mongoose.connect('mongodb://localhost/agar_io');
let db = mongoose.connection;

let User = require('./models/user');

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("connected to MongoDB");
    // we're connected!
});

let session = require('express-session');
let MongoStore = require('connect-mongo')(session);


// use sessions for tracking log ins
app.use(session({
    secret: 'session_secret_key',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));

let bodyParser = require('body-parser');

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// POST route for updating data
app.post('/register', function (req, res) {
    if (req.body.username && req.body.password) {
        let userData = {
            username: req.body.username,
            password: req.body.password,
        };

        User.create(userData, function (error, user) {
            if (error) {
                console.log(error);
                return res.send("failed");
            }
            else {
                req.session.userId = user._id;
                return res.send("registered!!");
            }
        });
    }
    else {
        return res.send("failed");
    }
});

app.post('/login', function (req, res) {
    if (req.body.username && req.body.password) {

        console.log(req.body);
        console.log(req.session);


        User.authenticate(req.body.username, req.body.password, function (error, user) {
            if (error || !user) {
                return res.send("failed");
            }
            else {
                req.session.userId = user._id;
                return res.send("logged in!!");
            }
        });
    }
});


// GET for logout logout
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

// ===================


/**
 * The starting main function of the server.
 */
function run() {
    setupRoutes();
    setupServer();
    startServer();
}

/**
 * Registers different routing endpoints.
 */
function setupRoutes() {
    // Set static path to provide required assets
    app.use(express.static(path.resolve('../client/')));

    // Main game screen
    app.get('/', function (req, res) {
        res.sendFile(path.resolve('../client/views/index.html'));
    });
}

/**
 * Setup the server to start listening on a specific port.
 */
function setupServer() {
    // Start listening on port 3000
    httpServer.listen(Constants.PORT, function () {
        console.log('listening on *: ', Constants.PORT);
    });
}

/**
 * Starts the actual game server.
 */
function startServer() {
    let server = new GameServer(io);
    server.init();
}

//
// Start running the server-side code
//
run();
const GAME_URL = "http://localhost:3000";
const STATUS_OK = 0;
const STATUS_ERROR = 0;

let app = {

    /**
     * Initialize the page JS components
     */
    init: function () {
        // Bind views
        app.bindViews();

        // Setup listeners
        app.setupListeners();
    },

    /**
     * Binds UI views to local variables.
     */
    bindViews: function () {
        app.playBtn = $("#play-btn");
        app.loginBtn = $("#login-btn");
        app.registerBtn = $("#register-btn");

        app.nameFiled = $("#name-field");
        app.usernameField = $("#username-field");
        app.passwordField = $("#password-field");

        app.errorMsg = $("#error-msg");
    },

    /**
     * Setup buttons
     */
    setupListeners: function () {
        app.playBtn.click(function () {
            let name = app.nameFiled.val().trim();

            if (name.length <= 0) {
                app.errorMsg.html("Please enter valid name!");
                return;
            }

            let msg = {
                name: name
            };

            $.post("/join", msg, function (result) {
                    if (result.status === STATUS_OK) {
                        window.location = GAME_URL;
                    }
                    else {
                        app.errorMsgCallback(result.error_msg);
                    }
                }
            );
        });

        app.loginBtn.click(function () {
            app.sendAuthRequest("/login");
        });

        app.registerBtn.click(function () {
            app.sendAuthRequest("/register");
        });
    },

    /**
     * Sends authentication related requests to the given endping
     *
     * @param endpoint  the destination endpoint
     */
    sendAuthRequest: function (endpoint) {
        let username = app.usernameField.val().trim();
        let password = app.passwordField.val().trim();

        if (username.length <= 0 || password.length <= 0) {
            app.errorMsg.html("Please enter valid credentials!");
            return;
        }

        let msg = {
            username: username,
            password: password
        };

        $.post(endpoint, msg, function (result) {
                if (result.status === STATUS_OK) {
                    window.location = GAME_URL;
                }
                else {
                    app.errorMsgCallback(result.error_msg);
                }
            }
        );
    },
    /**
     * Displays error message to user interface.
     *
     * @param errorMsg the error message to be displayed
     */
    errorMsgCallback: function (errorMsg) {
        app.errorMsg.html(errorMsg);
    }
};

//
// Start running the client-side code
//
$(function () {
    app.init();
});
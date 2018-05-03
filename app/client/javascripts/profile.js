const GAME_URL = "http://localhost:3000/play";
const AUTH_URL = "http://localhost:3000/";
const STATUS_OK = 0;
const STATUS_ERROR = 0;

let app = {

    /**
     * Initialize the page JS components
     */
    init: function () {
        // Bind views
        app.bindViews();

        // Fill views
        app.nameView.val(localStorage.getItem("name"));
        app.highestScoreView.val(localStorage.getItem("high_score"));

        // Setup listeners
        app.setupListeners();
    },

    /**
     * Binds UI views to local variables.
     */
    bindViews: function () {
        app.playBtn = $("#play-btn");
        app.logoutBtn = $("#logout-btn");

        app.nameView = $("#name-view");
        app.highestScoreView = $("#highest-score-view");

        app.errorMsg = $("#error-msg");
    },

    /**
     * Setup buttons
     */
    setupListeners: function () {
        app.playBtn.click(function () {
            $.post("/join", function (result) {
                    if (result.status === STATUS_OK) {
                        window.location = GAME_URL;
                    }
                    else {
                        app.errorMsg.html(result.error_msg);
                    }
                }
            );
        });

        app.logoutBtn.click(function () {
            $.get("/logout", function (result) {
                if (result.status === STATUS_OK) {
                    window.location = AUTH_URL;
                }
                else {
                    app.errorMsg.html(result.error_msg);
                }
            });
        });
    },
};

//
// Start running the client-side code
//
$(function () {
    app.init();
});
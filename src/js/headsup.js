/**
 * Created by pcasciola on 10/28/2018.
 */

if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function(event) {
        handleOrientationEvent(event.alpha, event.beta, event.gamma);
    }, true);
}

var DEVICE_ORIENTATION_UNKNOWN = 0;
var DEVICE_ORIENTATION_READY = 1;
var DEVICE_ORIENTATION_DOWN = 2;
var DEVICE_ORIENTATION_UP = 3;

var deviceOrientationStatus = DEVICE_ORIENTATION_UNKNOWN;
var curPage = "";
var curWordSet = 0;
var curWord = 0;


var gamewords = [
    ["Word 1A", "Word 1B", "Word 1C","Word 1D", "Word 1E"],
    ["Word 2A", "Word 2B", "Word 2C","Word 2D", "Word 2E"],
    ["Word 3A", "Word 3B", "Word 3C","Word 3D", "Word 3E"],
    ["Word 4A", "Word 4B", "Word 4C","Word 4D", "Word 4E"],
    ["Word 5A", "Word 5B", "Word 5C","Word 5D", "Word 5E"],
    ["Word 6A", "Word 6B", "Word 6C","Word 6D", "Word 6E"]
];

var handleOrientationEvent = function(alpha, beta, gamma) {
    if (Math.abs(beta) < 10 || Math.abs(beta) > 170) {
        if (Math.abs(gamma) > 70)
            deviceOrientationStatus = DEVICE_ORIENTATION_READY;
        else if (gamma < 0 && gamma > -50)
            deviceOrientationStatus = DEVICE_ORIENTATION_DOWN;
        else if (gamma > 0 && gamma < 50)
            deviceOrientationStatus = DEVICE_ORIENTATION_UP;
    }
};

function showPage(page) {
    if (curPage != "")
        $("#page_" + curPage).hide();
    $("#page_" + page).show();
    curPage = page;
}

function playGame(wordSet) {
    curPage = "menu";
    curWordSet = wordSet;
    playSound($("#audioCategory"));
    showPage("game")
    setTimeout(function() { getReady(4)}, 3000)
}

function getReady(n) {
    $("#word").text(n > 3 ? "GET READY!" : n);

    if (n > 3)
        playSound($("#audioGetReady"));
    else if (n > 0)
        playSound($("#audioCount"));
    else
        playSound($("#audioStart"));

    if (n > 0)
        setTimeout(function() { getReady(n-1)}, n > 3 ? 2000 : 1000);
    else
        startGame();
}

function startGame() {
    $("#word").text(gamewords[curWordSet][curWord]);
}

var curPlayer = null;

function playSound(player) {
    if (curPlayer != null)
        curPlayer.trigger('pause');
    player.prop("currentTime", 0);
    player.trigger("play");
    curPlayer = player;
}

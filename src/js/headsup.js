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
var audioLag = 500;
var startTime = 0;
var answers = [];
var lastTimeLeft;
var timerInterval;

/*


 */

var gamewords = [
    ["Urgency", "Habit", "Social Norming","ACC ECDP", "Bystander"],
    ["BrOAD Market", "Leaders", "Paul","2nd Line", "PCP"],
    ["Drive", "Jardiance at the Core", "Easy","Target patient", "Tipping Point"],
    ["Systemic Change", "Care Management Process", "Helping Hands","Total Cost of Care (TCC)", "Quadruple Aim"]
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

window.addEventListener('load', registerEvents, false);

function registerEvents() {
    document.getElementById('body').addEventListener('click', getMenu, false);
}

function getMenu() {
    document.getElementById('body').removeEventListener('click',getMenu,false);
    document.getElementById('body').style.background = "#000000";
    showPage('menu');
}

function showPage(page) {
    if (curPage != "")
        $("#page_" + curPage).hide();
    $("#page_" + page).show();
    curPage = page;
}

function playGame(wordSet) {
    curPage = "menu";
    curWordSet = wordSet;
    loadSound("category");

    playSound(function() {
        showPage("game")
        setTimeout(function () {
            getReady(4)
        }, 3000)
    });
}

function getReady(n) {
    if (n > 3)
        loadSound("getready");
    else if (n > 0)
        loadSound("count");
    else if (n == 0)
        loadSound("start");

    if (n > 0) {
        playSound(function () {
            $("#word").text(n > 3 ? "GET READY!" : n);
            $("#word").animate({"font-size":"8rem"}, 200);
            $("#word").animate({"font-size":"6rem"}, 400);
            setTimeout(function () {
                getReady(n - 1)
            }, n > 3 ? 2000 - audioLag : 1000 - audioLag);
        });
    }
    else
        playSound(startGame);
}

function startGame() {
    answers = [];
    $("#word").text(gamewords[curWordSet][curWord]);
    $("#timerDiv").show();
    startTime = Date.now();
    document.body.onkeydown = function(e) {
        triggerKeyEvent(e.keyCode);
    }
    timerInterval = setInterval(updateCounter, 500);
}

function nextQuestion()
{
    if(answers.length >= gamewords[curWordSet].length) {
        gameOver();
    }
    else {

        loadSound("start");
        playSound(function () {
        });

        $("#page_game").removeClass("contentWrapCorrect").removeClass("contentWrapPass").addClass("contentWrap");
        $("#word").text(gamewords[curWordSet][answers.length]);

        document.body.onkeydown = function (e) {
            triggerKeyEvent(e.keyCode);
        }
    }
}

function gameOver() {
    document.body.onkeydown = null;
    clearInterval(timerInterval);

    $("#page_game").removeClass("contentWrapCorrect").removeClass("contentWrapPass").removeClass("contentWrap").addClass("contentWrapGameOver");
    $("#word").text("GAME OVER!")
    $("#timerDiv").hide();

    loadSound("gameover");
    playSound(function(){});

    setTimeout(showScore, 5000);
}

function addScoreWord(x, correct)
{
    var span = $(document.createElement("span"));
    var br = $(document.createElement("br"));

    span.text(gamewords[curWordSet][x]);
    span.addClass("wordScore").addClass(answers[x] ? "wordCorrect" : "wordPass");

    $("#player_cards").append(span).append(br);

    $("#player_score").text(correct);

    if(answers[x])
        $("#player_score").animate({"font-size":"8rem"}, 100).animate({"font-size":"6rem"}, 200);
}

function showScore()
{
    var correct = 0;

    loadSound("fireworks");
    playSound(function(){});

    $("#player_cards").html("");

    showPage("score");

    for (var x = 0 ; x < gamewords[curWordSet].length ; x++)
    {
        var delay = (x + 1) * 1400;

        if (answers[x])
            correct++;

        setTimeout(addScoreWord, delay, x, correct);
    }
}



function triggerKeyEvent(key) {
    if (key != 38 && key != 40) return;

    document.body.onkeydown = null;

    if (key == 38) {    //up arrow
        correct();
    } else if (key == 40) { //down arrow
        pass();
    }
}

function correct() {
    answers.push(true);
    $("#page_game").removeClass("contentWrap").removeClass("contentWrapPass").addClass("contentWrapCorrect");
    loadSound("correct");
    playSound(function() {
        setTimeout(nextQuestion, 1000);
    });
}

function pass() {
    answers.push(false);
    $("#page_game").removeClass("contentWrap").removeClass("contentWrapCorrect").addClass("contentWrapPass");
    loadSound("pass");
    playSound();
    playSound(function() {
        setTimeout(nextQuestion, 1000);
    });
}

function updateCounter() {
    var timeLeft = 60 - Math.round((Date.now() - startTime) / 1000.0);
    if (timeLeft < 60 && timeLeft >= 0) {
        var timeString = "0:" + (timeLeft < 10 ? "0" : "") + timeLeft;
        $("#timerText").text(timeString);
    }

    if (timeLeft <= 10 && timeLeft > 0 && timeLeft != lastTimeLeft) {
        loadSound("count");
        playSound(function(){});
    }

    lastTimeLeft = timeLeft;

    if (timeLeft <= 0)
        gameOver();
}

function loadSound(sound) {
    var player = document.getElementById("audioPlayer");
    player.src="../audio/headsup-" + sound + ".mp3";
    player.pause();
    player.load();
}

function playSound(func) {
    /*
     var player = $("#audio_" + sound);
     player.prop("currentTime", 0);
     player.trigger('play');
     */
    var player = document.getElementById("audioPlayer");

    //If the caller passes in a callback, play the sound and then call the callback after global audioLag milliseconds
    if (func !== undefined && func != null) {
        player.oncanplay = function () {
            setTimeout(function () {
                player.play();
                func()
            }, audioLag);
        }
    }
    else
        player.onloadeddata = function() { setTimeout(function() { player.play() }, audioLag)};
}


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
var audioLag = 300;
var startTime = 0;
var answers = [];
var lastTimeLeft;
var timerInterval;
var timeAllotted = 60;
var lastSound = "";
var inCountdown;


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

$(document).ready(function() {
    $("body").one("touchend", function() {
        $('body').removeClass("bodySplash");
        showPage('menu');
    });

    /*
    lowLag.init({"urlPrefix":"audio/"}); //,"force":"audioTag"
    lowLag.load(["headsup-gameover.mp3","headsup-gameover.ogg"],"gameover");
    lowLag.play("gameover");
    */
});


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

function updateGetReady(n) {
    $("#word").text(n > 3 ? "GET READY!" : n);
    $("#word").animate({"font-size":"8rem"}, 200);
    $("#word").animate({"font-size":"6rem"}, 400);
    setTimeout(function () {
        getReady(n - 1)
    }, n > 3 ? 2000 - audioLag : 1000);
}

function getReady(n) {
    if (n > 3)
        loadSound("getready");
    else if (n > 2)
        loadSound("10-seconds");
    else if (n == 0)
        loadSound("start");

    if (n > 2) {
        playSound(function () {
            updateGetReady(n);
        });
    } else if (n > 0) {
        updateGetReady(n);
    }
    else if (n == 0)
        playSound(startGame);
}

var gestureInterval = null;

function startWaitGesture(n, func1, func2) {
    $("body").on("keydown", function(e) {
        triggerKeyEvent(e.keyCode);
    });

    var interval = 200;

    if (n == DEVICE_ORIENTATION_READY) {
        gestureInterval = setInterval(function() {
            if (deviceOrientationStatus == DEVICE_ORIENTATION_READY) {
                clearWaitGesture();
                func1();
            }
        }, interval);
    } else {
        gestureInterval = setInterval(function() {
            if (deviceOrientationStatus == DEVICE_ORIENTATION_UP) {
                clearWaitGesture();
                func1();
            } else if (deviceOrientationStatus == DEVICE_ORIENTATION_DOWN) {
                clearWaitGesture();
                func2();
            }
        }, interval);
    }
}

function clearWaitGesture() {
    $("body").off("keydown");
    if (gestureInterval != null)
        clearInterval(gestureInterval);
}

function startGameWaitGestures() {
    startWaitGesture(DEVICE_ORIENTATION_READY, function() {
        startWaitGesture(DEVICE_ORIENTATION_UP, function() { correct() }, function() { pass() });
    });
}

function startGame() {
    answers = [];
    $("#word").text(gamewords[curWordSet][curWord]);
    $("#timerDiv").show();
    startTime = Date.now();
    timerInterval = setInterval(updateCounter, 50);
    startGameWaitGestures();
}

function nextQuestion()
{
    if(answers.length >= gamewords[curWordSet].length) {
        gameOver();
    }
    else {

        loadSound("start");
        playSound(function () {
            if (inCountdown) startCountdown();
        });

        $("#page_game").removeClass("contentWrapCorrect").removeClass("contentWrapPass").addClass("contentWrap");
        $("#word").text(gamewords[curWordSet][answers.length]);

        startGameWaitGestures();
    }
}

function gameOver() {
    /*
    if (countdownInterval != null)
        clearInterval(countdownInterval);
    */

    clearWaitGesture();
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
    span.addClass("wordScore").addClass(answers[x] ? "wordCorrect col-12 text-center" : "wordPass col-12 text-center");

    $("#player_cards").append(span);

    $("#player_score").text(correct);

    if(answers[x]) {
        $("#player_score").animate({"font-size": "8rem"}, 100).animate({"font-size": "6rem"}, 200);
        $("#player_score_s").text(correct > 1 ? "S" : "");
    }
}

function showScore()
{
    var correct = 0;

    loadSound("fireworks");
    playSound(function(){});

    $("#player_cards").html("");

    showPage("score");

    for (var x = 0 ; x < gamewords[curWordSet].length && x < answers.length; x++)
    {
        var delay = (x + 1) * 1000;

        if (answers[x])
            correct++;

        setTimeout(addScoreWord, delay, x, correct);
    }

    var delay = (x + 1) * 1000;
    setTimeout(function() { $("#restartWrap").show();}, delay)
}

function triggerKeyEvent(key) {
    if (key != 38 && key != 40) return;

    clearWaitGesture();

    if (key == 38) {    //up arrow
        correct();
    } else if (key == 40) { //down arrow
        pass();
    }
}

function correct() {
    answers.push(true);
    loadSound("correct");
    playSound(function() {
        setTimeout(nextQuestion, 1000);
    });
    $("#page_game").removeClass("contentWrap").removeClass("contentWrapPass").addClass("contentWrapCorrect");
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

function startCountdown() {
    loadSound("10-seconds");
    playSound(function(){});
}
function updateCounter() {

    var millis = Date.now();

    var timeLeft = timeAllotted - Math.round((millis - startTime) / 1000.0);

    if (timeLeft != lastTimeLeft && timeLeft < timeAllotted && timeLeft >= 0) {
        var timeString = "0:" + (timeLeft < 10 ? "0" : "") + timeLeft;
        $("#timerText").text(timeString);
    }

    millis = millis % 1000;

    if (!inCountdown && timeLeft <= 11 && millis >= 0 && millis <= 200) {
        inCountdown = true;
        startCountdown();
    }

    /*
    if (timeLeft <= 10 && timeLeft > 0 && timeLeft != lastTimeLeft  && (timeLeft % 1000) < audioLag && timeLeft % 2 == 0) {
        lastTimeLeft = timeLeft;
        loadSound("count");
        playSound(function(){});
    }
    */

    if (timeLeft == 0 && timeLeft != lastTimeLeft) {
        //Add current word to list as passed(false)
        if (curWord < gamewords[curWordSet].length) {
            answers.push(false);
        }
        gameOver();
    }

    lastTimeLeft = timeLeft;
}

function loadSound(sound) {
    var player = document.getElementById("audioPlayer");
    player.src="audio/headsup-" + sound + ".mp3";
    player.pause();
    player.load();
    lastSound = sound;
}

function playSound(func, callbackOnly) {
    /*
     var player = $("#audio_" + sound);
     player.prop("currentTime", 0);
     player.trigger('play');
     */
    var player = document.getElementById("audioPlayer");

    if (func !== undefined && func != null) {
        if (callbackOnly !== undefined && callbackOnly) {
            setTimeout(func, audioLag);
        } else {
            player.oncanplay = function () {
                player.oncanplay = null;
                setTimeout(function () {
                    player.play();
                    func();
                }, audioLag);
            }
        }
    }
    else {
        player.oncanplay = function () {
            setTimeout(function () {
                player.play()
            }, audioLag)
        };
    }

}


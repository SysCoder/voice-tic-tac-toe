'use strict';

require('dotenv').config();
const dashbot = require('dashbot')("IhZXsQTiqY6PBqpXpZUY2rw44Yd2XAH6cBfe07Tq").google;
const functions = require('firebase-functions');
const App = require('actions-on-google').ApiAiApp;
const VoiceRepeater = require('voice-repeater').VoiceRepeater;

var ticTacToe = require('./tictactoe');

// console.log('starting function')
exports.voiceTicTacToe = functions.https.onRequest((request, response) => {
    const app = new App({
        request,
        response
    });

    let voiceRepeater = new VoiceRepeater(app);

    const hasScreen = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
    const screenAvaiable = app.hasAvailableSurfaceCapabilities(app.SurfaceCapabilities.SCREEN_OUTPUT);

    dashbot.configHandler(app);
    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));

    const currentBoard = app.getContext("game_board") !== null
        ? app.getContextArgument("game_board", "game").value
        : "000000000";
    const currentLevel = app.getContext("level") !== null
        ? app.getContextArgument("level", "level").value
        : "Medium";

    function changeLevel(app) {
      let levelSetFromUser = app.getArgument("Levels");
      let response = displayBoardGoogleData(app, "Okay, curent level is: " + levelSetFromUser, currentBoard);

      app.setContext("game_board", 100, {"game": currentBoard});
      app.setContext("level", 100, {"level": levelSetFromUser});
      app.ask(response);
    }

    function repeatLastStatment(app) {
      app.ask(voiceRepeater.lastPromptWithPrefix());
    }

    // Needed for middle of the game
    function restartGame(app) {
      let response = displayBoardGoogleData(app, "Okay, new game.", "000000000");

      app.setContext("game_board", 100, {"game": "000000000"});
      app.setContext("level", 100, {"level": currentLevel});
      app.ask(response);
    }

    function showBoard(app) {
      if (hasScreen) {
        let response = displayBoardGoogleData(
          app, "Here is the board: ", currentBoard);
        app.ask(response);
      } else if (screenAvaiable) {
            app.askForNewSurface(
              "Your current device does not have a screen.",
              "Tic Tac Toe Board",
              [app.SurfaceCapabilities.SCREEN_OUTPUT]);
      } else {
        app.ask("I am sorry, I can't show the board to you.");
      }
    }

    function newSurface(app) {
      if (app.isNewSurface()) {
        let response = displayBoardGoogleData(
          app, "Okay, here is the board: ", currentBoard);
        app.ask(response);
      } else {
        app.ask("Okay, what's your move?");
      }
    }

    const actionMap = new Map();
    actionMap.set('change_level', changeLevel);
    actionMap.set('repeat_last_statement', repeatLastStatment);
    actionMap.set('restart_game', restartGame);
    actionMap.set('input.unknown', noMatch);
    actionMap.set('single_word_move', responseToPlayer);
    actionMap.set('dual_word_move', responseToPlayer);
    actionMap.set('show_board', showBoard);
    actionMap.set('new_surface', newSurface);
    app.handleRequest(actionMap);

    let databaseBoard = currentBoard.split("").map(function(x) {return parseInt(x)});
});

function noMatch(app) {
  let consecutiveNoMatches = consecutiveCount(app, "no_match");
  if (consecutiveNoMatches == 1) {
    app.ask("I had trouble understanding you, can you say that again?");
  } else if (consecutiveNoMatches == 2) {
    app.ask("Where are you trying to move to?");
  } else {
    app.tell("Since I am not understanding. I will let you go. Goodbye!");
  }
}

function consecutiveCount(app, countName) {
  let count = app.getContext(countName) !== null
      ? parseInt(app.getContextArgument(countName, "count").value) + 1
      : 1;
  app.setContext("no_match", 1, {"count": count});
  return count;
}

function responseToPlayer(app) {
    var parameters = {"Location": app.getArgument("Location"), "Location1": app.getArgument("Location1")};
    if (tryingToTripBot(parameters)) {
      let tripUpReplies = [
        "Um.... hold on... that does not make sense. Try another location",
        "What are you trying to do? You know and I know, that is not a valid location.",
        "Tricky tricky... that's invalid and you know it! Try again.",
        "Are you trying to cause me to have an error? Please pick a sensible location.",
        "Your move was " + createTextMove(parameters) + ". I moved.... wait, that does not make sense. Try again.",
        "Your move was " + createTextMove(parameters) + ". Which does not make sense. Try again.",
        "Your move was " + createTextMove(parameters) + ". Error, Error, Error, I am crashing! Psych!!! Do you want to play or just test me?",
      ];
      let tripUpReply = getRandomeElementInArray(tripUpReplies);
      app.ask(tripUpReply);
      return;
    }

    let currentBoard = app.getContext("game_board") !== null
        ? app.getContextArgument("game_board", "game").value
        : "000000000";
    let databaseBoard = currentBoard.split("").map(function(x) {return parseInt(x)});
    let currentLevel = app.getContext("LEVEL") !== null ? app.getContext("LEVEL").value.level : "Medium";
    if (ticTacToe.determineWinner(databaseBoard) !== 0) {
        databaseBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    // console.log(parameters);
    // User move.
    var nextMove = ticTacToe.textMoveToArrayMove(parameters.Location, parameters.Location1);
    if (isLocationUsed(nextMove, databaseBoard)) {
        var player = isLocationUsed(nextMove, databaseBoard);
        var responseBack = "";
        if(player == 1) {
            responseBack = "You have already moved there. Pick another location.";
        } else {
            responseBack = "I have already moved there. Pick another location.";
        }
        app.ask(responseBack);
        return;
    }

    // console.log(nextMove, "player outside");
    var board = ticTacToe.makeMove(nextMove, databaseBoard);
    // console.log('Between user and computer');
    // Computer move.
    nextMove = ticTacToe.getNextMove(board, currentLevel);
    var textNextMove = ticTacToe.arrayMoveToTextMove(nextMove);
    // console.log("Board going in", board, nextMove);
    board = ticTacToe.makeMove(nextMove, board);
    // console.log("Board going out", board);


    var outputBoard = board;

    let sessionOutputBoard = null;
    // Save to session state on device
    // console.log("Used session board");
    sessionOutputBoard = outputBoard.reduce(function(a, b) {return "" + a + b});

    if (ticTacToe.determineWinner(board) === 3) {
        var responseBack = "Your move was " + createTextMove(parameters) + ". Draw! Do you want to play again? You can change the level by saying \"Change level to easy.\"";

        let response = displayBoardGoogleData(app, responseBack, sessionOutputBoard);

        app.setContext("game_board", 100, {"game": "000000000"});
        app.setContext("LEVEL", 100, {"level": currentLevel});
        app.ask(response);
        return;
    }


    if (ticTacToe.determineWinner(board) !== 0 && nextMove.length== [0, 0, 0, 0, 0, 0, 0, 0, 0].length && nextMove.every(function(v,i) { return v === [0, 0, 0, 0, 0, 0, 0, 0, 0][i]})) {
        var responseBack = "Your move was " + createTextMove(parameters) +  ". " + "You won! Do you want to play again? You can change the level by saying \"Change level to impossible.\"";

        let response = displayBoardGoogleData(app, responseBack, sessionOutputBoard);

        app.setContext("game_board", 100, {"game": "000000000"});
        app.setContext("LEVEL", 100, {"level": currentLevel});
        app.ask(response);
        return;
    }


    if (ticTacToe.determineWinner(outputBoard) !== 0) {
        var responseBack = "Your move was " + createTextMove(parameters) + ". I moved " + createTextMove(textNextMove) + ". I won. Do you want to play again? You can change the level by saying \"Change level to easy.\"";
        let response = displayBoardGoogleData(app, responseBack, sessionOutputBoard);
        app.setContext("game_board", 100, {"game": "000000000"});
        app.setContext("LEVEL", 100, {"level": currentLevel});
        app.ask(response);
        return;
    }

    var responseBack = "Your move was " + createTextMove(parameters) + ". I moved " + createTextMove(textNextMove);


    let response = displayBoardGoogleData(app, responseBack, sessionOutputBoard);
    app.setContext("game_board", 100, {"game": sessionOutputBoard});
    app.setContext("LEVEL", 100, {"level": currentLevel});
    app.ask(response);
}

function tryingToTripBot(parameters) {
  return (parameters.Location === "Left" && parameters.Location1 === "Right")
      || (parameters.Location === "Right" && parameters.Location1 === "Left")
      || (parameters.Location === "Top" && parameters.Location1 === "Bottom")
      || (parameters.Location === "Bottom" && parameters.Location1 === "Top")
      || (parameters.Location === "Left" && parameters.Location1 === "Left")
      || (parameters.Location === "Right" && parameters.Location1 === "Right")
      || (parameters.Location === "Bottom" && parameters.Location1 === "Bottom")
      || (parameters.Location === "Top" && parameters.Location1 === "Top");
}

function displayBoardGoogleData(app, speech, sessionOutputBoard) {
  return app.buildRichResponse()
    // Create a basic card and add it to the rich response

    .addSimpleResponse(speech)
    .addBasicCard(app.buildBasicCard(speech)
      .setImage("https://s3-us-west-2.amazonaws.com/tic-tac-toe-boards/boardImages/" + sessionOutputBoard + ".png", "Tic Tac Toe game board")
     );
}

function createTextMove(parameters) {
    var resultText = "";
    if (parameters.Location) {
        resultText += parameters.Location.toLowerCase();
    }
    if (parameters.Location1) {
        resultText += " ";
        resultText += parameters.Location1.toLowerCase();
    }
    return resultText;
}

function isLocationUsed(playerMove, board) {
  for(var i = 0;i < board.length;i++) {
      if (playerMove[i] !== 0 && board[i] !== 0) {
          return board[i];
      }
  }
  return 0;
}

function getRandomeElementInArray(someArray) {
  return someArray[Math.floor(Math.random()*someArray.length)]
}

var LIST_OF_MOVES = [
  "Up left",
  "Left up",
  "Up",
  "Up right",
  "Right up",
  "Center left",
  "Left center",
  "Left",
  "Center",
  "Center right",
  "Right center",
  "Right",
  "Down left",
  "Left down",
  "Down",
  "Down right",
  "Right down",
  "Top left",
  "Left top",
  "Top",
  "Top right",
  "Right top",
  "Middle left",
  "Left middle",
  "Left",
  "Middle",
  "Middle right",
  "Right middle",
  "Right",
  "Bottom left",
  "Left bottom",
  "Bottom",
  "Bottom right",
  "Right bottom",
  "Upper left",
  "Left upper",
  "Upper",
  "Upper right",
  "Right upper",
  "Lower left",
  "Left lower",
  "Lower",
  "Lower right",
  "Right lower",
];

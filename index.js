'use strict';

require('dotenv').config();
const dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).google;
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});

var ticTacToe = require('tictactoe');

// console.log('starting function')

exports.handle = function(event, ctx, callback) {
    dashbot.logIncoming(event);
    // console.log('processing event: %j', event);
    // console.log(event);
    // console.log("Original Request: ", event.originalRequest);

    if(event.result.action === "change_level") {
        let level = event.result.parameters.Levels;

        let fulfillment = {
            speech: "Okay, curent level is: " + level,
            source: "TicTacToe Engine!",
            displayText: "Okay, curent level is: " + level,
        }

        var gameContext = [
          {
              "name": "game",
              "parameters": {
                "board": getBoardFromContext(event),
              },
            "lifespan": 100
          },
          {
              "name": "level",
              "parameters": {
                "level": level,
              },
            "lifespan": 100
          }
        ];
        fulfillment.contextOut = gameContext;


        dashbot.logOutgoing(event, fulfillment);
        callback(null, fulfillment);
        return;
    }

    // Needed for middle of the game
    if(event.result.action === "restart_game") {

        let fulfillment = {
            speech: "Okay, new game.",
            source: "TicTacToe Engine!",
            displayText: "Okay, new game.",
        }
        // Save to session state on device

        // console.log("Used session board");
        var gameContext = [
          {
              "name": "game",
              "parameters": {
                "board": "000000000",
              },
            "lifespan": 100
          },
          {
              "name": "level",
              "parameters": {
                "level": getLevelFromContext(event),
              },
            "lifespan": 100
          }
        ];
        fulfillment.contextOut = gameContext;



        dashbot.logOutgoing(event, fulfillment);
        callback(null, fulfillment);
        return;
    }

    if(!validMoveUtterence(event)) {
        let fulfillment = {
            speech: "I didn't quite understand you, can you say that again?",
            source: "TicTacToe Engine!",
            displayText: "I didn't quite understand you, can you say that again?",
        }
        // Save to session state on device

        // console.log("Used session board");
        var gameContext = [
          {
              "name": "game",
              "parameters": {
                "board": getBoardFromContext(event),
              },
            "lifespan": 100
          },
          {
              "name": "level",
              "parameters": {
                "level": getLevelFromContext(event),
              },
            "lifespan": 100
          }
        ];
        fulfillment.contextOut = gameContext;



        dashbot.logOutgoing(event, fulfillment);
        callback(null, fulfillment);
        return;
    }

    var databaseBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let sessionBoard = getBoardFromContext(event);

    databaseBoard = sessionBoard.split("").map(function(x) {return parseInt(x)});


    // console.log("Used session board");
    responseToPlayer(databaseBoard, event, callback);
}

function validMoveUtterence(event) {

  let utterence = event.result.resolvedQuery.toLowerCase();
  let filteredUtterence = utterence
    .replace("to ", "")
    .replace("move ", "")
    .replace("center ", "")
    .replace("middle ", "")
    .replace(" corner", "");


  let numberOfFilteredWordsInUtterence = filteredUtterence.split(' ').length;
  let parameters = event.result.parameters;

  let numberOfUnderstoodParameters = 0;
  numberOfUnderstoodParameters += parameters.Location ? 1 : 0;
  numberOfUnderstoodParameters += parameters.Location1 ? 1 : 0;

  return numberOfFilteredWordsInUtterence === numberOfUnderstoodParameters;
}

function responseToPlayer(databaseBoard, event, callback) {
    var parameters = event.result.parameters;
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
        let fulfillment = {
            speech: responseBack,
            source: "TicTacToe Engine",
            displayText: responseBack,
        }
        dashbot.logOutgoing(event, fulfillment);
        callback(null, fulfillment);
        return;
    }

    // console.log(nextMove, "player outside");
    var board = ticTacToe.makeMove(nextMove, databaseBoard);
    // console.log('Between user and computer');
    // Computer move.
    nextMove = ticTacToe.getNextMove(board, getLevelFromContext(event));
    var textNextMove = ticTacToe.arrayMoveToTextMove(nextMove);
    // console.log("Board going in", board, nextMove);
    board = ticTacToe.makeMove(nextMove, board);
    // console.log("Board going out", board);


    var outputBoard = board;
    //Insert into database
    var params = {
        Item: {
            user_id: getUserId(event),
            board: outputBoard.reduce(function(a, b) {return "" + a + b}),
        },

        TableName: 'tictactoe_user_game_state'
    }
    let sessionOutputBoard = null;
    // Save to session state on device
    // console.log("Used session board");
    sessionOutputBoard = outputBoard.reduce(function(a, b) {return "" + a + b});


    var gameContext = [
      {
          "name": "game",
          "parameters": {
            "board": sessionOutputBoard,
          },
        "lifespan": 100
      },
      {
          "name": "level",
          "parameters": {
            "level": getLevelFromContext(event),
          },
        "lifespan": 100
      }
    ];

    var gameEndedContext = [
        {
            "name": "game",
            "parameters": {
              "board": "000000000",
            },
          "lifespan": 100
        },
        {
            "name": "level",
            "parameters": {
              "level": getLevelFromContext(event),
            },
          "lifespan": 100
        },
        {
            "name": "game-ended",
            "parameters": {},
          "lifespan": 1
        }
    ];

    if (ticTacToe.determineWinner(board) === 3) {
        var responseBack = "Your move was " + createTextMove(parameters) + ". Draw! Do you want to play again?";

        let fulfillment = {
            speech: responseBack,
            source: "TicTacToe Engine!",
            displayText: responseBack,
            contextOut: gameEndedContext,
        }
        dashbot.logOutgoing(event, fulfillment);
        callback(null, fulfillment);
        return;
    }


    if (ticTacToe.determineWinner(board) !== 0 && nextMove.length== [0, 0, 0, 0, 0, 0, 0, 0, 0].length && nextMove.every(function(v,i) { return v === [0, 0, 0, 0, 0, 0, 0, 0, 0][i]})) {
        var responseBack = "Your move was " + createTextMove(parameters) +  ". " + "You won! Do you want to play again? You can change the level by saying \"Change level to impossible.\"";

        let fulfillment = {
            speech: responseBack,
            source: "TicTacToe Engine!",
            displayText: responseBack,
            contextOut: gameEndedContext,
        }
        dashbot.logOutgoing(event, fulfillment);
        callback(null, fulfillment);
        return;
    }


    if (ticTacToe.determineWinner(outputBoard) !== 0) {
        var responseBack = "Your move was " + createTextMove(parameters) + ". I moved " + createTextMove(textNextMove) + ". I won. Do you want to play again?";

        let fulfillment = {
            speech: responseBack,
            source: "TicTacToe Engine!",
            displayText: responseBack,
            contextOut: gameEndedContext,
        }
        dashbot.logOutgoing(event, fulfillment);
        callback(null, fulfillment);
        return;
    }

    var responseBack = "Your move was " + createTextMove(parameters) + ". I moved " + createTextMove(textNextMove);

    let fulfillment = {
        speech: responseBack,
        source: "TicTacToe Engine",
        displayText: responseBack,
        contextOut: gameContext,
    }
    dashbot.logOutgoing(event, fulfillment);
    callback(null, fulfillment)
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

function getUserId(event) {
    if (event.originalRequest) {
        return event.originalRequest.data.user.user_id;
    } else {
        return event.sessionId;
    }
}

function isLocationUsed(playerMove, board) {
  for(var i = 0;i < board.length;i++) {
      if (playerMove[i] !== 0 && board[i] !== 0) {
          return board[i];
      }
  }
  return 0;
}

function getBoardFromContext(event) {
  let board = "000000000";
  for (let i = 0;i < event.result.contexts.length;i++) {
    if (event.result.contexts[i].name === "game") {
      board = event.result.contexts[i].parameters.board;
    }
  }
  return board;
}

function getLevelFromContext(event) {
  let level = "Medium";
  for (let i = 0;i < event.result.contexts.length;i++) {
    if (event.result.contexts[i].name === "level") {
      level = event.result.contexts[i].parameters.level;
    }
  }
  return level;
}

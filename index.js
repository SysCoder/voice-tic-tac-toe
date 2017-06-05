'use strict';

require('dotenv').config();
const dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).google;
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});

var ticTacToe = require('tictactoe');

// console.log('starting function')

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

exports.handle = function(event, ctx, callback) {
    dashbot.logIncoming(event);
    // console.log('processing event: %j', event);
    // console.log(event);
    // console.log("Original Request: ", event.originalRequest);

    if(event.result.action === "change_level") {
        let level = event.result.parameters.Levels;

        let googleData = displayBoardGoogleData("Okay, curent level is: " + level, getBoardFromContext(event));
        let fulfillment = {
            speech: "Okay, curent level is: " + level,
            source: "TicTacToe Engine!",
            displayText: "Okay, curent level is: " + level,
            'data': {"google": googleData},
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
        let googleData = displayBoardGoogleData("Okay, new game.", "000000000");
        let fulfillment = {
            speech: "Okay, new game.",
            source: "TicTacToe Engine!",
            displayText: "Okay, new game.",
            'data': {"google": googleData},
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

    // Needed for middle of the game
    if(event.result.action === "SHOW_BOARD") {

        let simpleResponse =  {
              'type': 'simple_response',
              'platform': 'google',
              'text_to_speech': 'Simple response one'
            };

        let basicCard = {
          'type': 'basic_card',
          'platform': 'google',
          'formatted_text': 'my text',
          "image": "http://fm.cnbc.com/applications/cnbc.com/resources/styles/skin/INTERNAL/EXPERIMENTS/GOOGLE_ACTION/img/google_assistant.png",
          'buttons': []
        };

        let googleData = {
          "expect_user_response": true,
          "rich_response": {
            "items": [
              {
                "simple_response": {
                  "text_to_speech": "Here is the board: "
                }
              },
              {
                "basic_card": {
                  "image": {
                    "url": "https://s3-us-west-2.amazonaws.com/tic-tac-toe-boards/boardImages/" + getBoardFromContext(event) +".png",
                    "accessibility_text": "Tic Tac Toe game board"
                  },
                }
              },
            ],
          }
        };

        let fulfillment = {
          'speech': 'Hi! hello',
          'data': {"google": googleData},
        };
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

    let parameters = event.result.parameters;

    let tryingToTripBot = (parameters.Location === "Left" && parameters.Location1 === "Right")
        || (parameters.Location === "Right" && parameters.Location1 === "Left")
        || (parameters.Location === "Top" && parameters.Location1 === "Bottom")
        || (parameters.Location === "Bottom" && parameters.Location1 === "Top")
        || (parameters.Location === "Left" && parameters.Location1 === "Left")
        || (parameters.Location === "Right" && parameters.Location1 === "Right")
        || (parameters.Location === "Bottom" && parameters.Location1 === "Bottom")
        || (parameters.Location === "Top" && parameters.Location1 === "Top");

    if(!validMoveUtterence(event) || tryingToTripBot) {
        let didntUnderstand = [
          "I had trouble understanding you, can you say that again?",
          "Sometimes I have trouble understanding, please say that again.",
          "Where are you trying to move to?",
          "What location do you want to move to?",
          "Where are you trying to move to?",
          "What location do you want to move to?",
          "Where are you trying to move to?",
          "What location do you want to move to?",
        ];
        let didntUnderstandReply =  getRandomeElementInArray(didntUnderstand);
        let fulfillment = {
            speech: didntUnderstandReply,
            source: "TicTacToe Engine!",
            displayText: didntUnderstandReply,
        }

        if (tryingToTripBot) {
          let tripUpReplies = [
            "Um.... hold on... that does not make sense. Try another location",
            "What are you trying to do? You know and I know, that is not a valid location.",
            "Tricky tricky... that's invalid and you know it! Try again.",
            "Are you trying to cause me to have an error? Please pick a sensible location.",
            "Your move was " + createTextMove(parameters) + ". I moved.... wait, that does not make sense. Try again.",
            "Your move was " + createTextMove(parameters) + ". Which does not make sense. Try again.",
            "Your move was " + createTextMove(parameters) + ". Error, Error, Error, I am crashing! Psych!!! Do you want to play or just test me?",
          ];

          let tripUpResponse = getRandomeElementInArray(tripUpReplies);
          fulfillment = {
              speech: tripUpResponse,
              source: "TicTacToe Engine!",
              displayText: tripUpResponse,
          }
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

function getRandomeElementInArray(someArray) {
  return someArray[Math.floor(Math.random()*someArray.length)]
}

function validMoveUtterence(event) {

  let utterence = event.result.resolvedQuery.toLowerCase();
  let filteredUtterence = utterence
    .replace("to ", "")
    .replace("the ", "")
    .replace("move ", "")
    .replace("center ", "")
    .replace("middle ", "")
    .replace(" corner", "")
    .replace(" square", "")
    .replace(" spot", "");


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
        var responseBack = "Your move was " + createTextMove(parameters) + ". Draw! Do you want to play again? You can change the level by saying \"Change level to easy.\"";

        let googleData = {
          "expect_user_response": true,
          "rich_response": {
            "items": [
              {
                "simple_response": {
                  "text_to_speech": responseBack,
                }
              },
              {
                "basic_card": {
                  "image": {
                    "url": "https://s3-us-west-2.amazonaws.com/tic-tac-toe-boards/boardImages/" + sessionOutputBoard +".png",
                    "accessibility_text": "Tic Tac Toe game board"
                  },
                }
              },
            ],
          },
          "speechBiasingHints": LIST_OF_MOVES,
        };
        let fulfillment = {
            speech: responseBack,
            source: "TicTacToe Engine!",
            displayText: responseBack,
            contextOut: gameEndedContext,
            'data': {"google": googleData},
        }
        dashbot.logOutgoing(event, fulfillment);
        callback(null, fulfillment);
        return;
    }


    if (ticTacToe.determineWinner(board) !== 0 && nextMove.length== [0, 0, 0, 0, 0, 0, 0, 0, 0].length && nextMove.every(function(v,i) { return v === [0, 0, 0, 0, 0, 0, 0, 0, 0][i]})) {
        var responseBack = "Your move was " + createTextMove(parameters) +  ". " + "You won! Do you want to play again? You can change the level by saying \"Change level to impossible.\"";

        let googleData = {
          "expect_user_response": true,
          "rich_response": {
            "items": [
              {
                "simple_response": {
                  "text_to_speech": responseBack,
                }
              },
              {
                "basic_card": {
                  "image": {
                    "url": "https://s3-us-west-2.amazonaws.com/tic-tac-toe-boards/boardImages/" + sessionOutputBoard +".png",
                    "accessibility_text": "Tic Tac Toe game board"
                  },
                }
              },
            ],
          },
          "speechBiasingHints": LIST_OF_MOVES,
        };
        let fulfillment = {
            speech: responseBack,
            source: "TicTacToe Engine!",
            displayText: responseBack,
            contextOut: gameEndedContext,
            'data': {"google": googleData},
        }
        dashbot.logOutgoing(event, fulfillment);
        callback(null, fulfillment);
        return;
    }


    if (ticTacToe.determineWinner(outputBoard) !== 0) {
        var responseBack = "Your move was " + createTextMove(parameters) + ". I moved " + createTextMove(textNextMove) + ". I won. Do you want to play again? You can change the level by saying \"Change level to easy.\"";


        let googleData = {
          "expect_user_response": true,
          "rich_response": {
            "items": [
              {
                "simple_response": {
                  "text_to_speech": responseBack,
                }
              },
              {
                "basic_card": {
                  "image": {
                    "url": "https://s3-us-west-2.amazonaws.com/tic-tac-toe-boards/boardImages/" + sessionOutputBoard +".png",
                    "accessibility_text": "Tic Tac Toe game board"
                  },
                }
              },
            ],
          },
          "speechBiasingHints": LIST_OF_MOVES,
        };
        let fulfillment = {
            speech: responseBack,
            source: "TicTacToe Engine!",
            displayText: responseBack,
            contextOut: gameEndedContext,
            'data': {"google": googleData},
        }
        dashbot.logOutgoing(event, fulfillment);
        callback(null, fulfillment);
        return;
    }

    var responseBack = "Your move was " + createTextMove(parameters) + ". I moved " + createTextMove(textNextMove);


    let googleData = {
      "expect_user_response": true,
      "rich_response": {
        "items": [
          {
            "simple_response": {
              "text_to_speech": responseBack,
            }
          },
          {
            "basic_card": {
              "image": {
                "url": "https://s3-us-west-2.amazonaws.com/tic-tac-toe-boards/boardImages/" + sessionOutputBoard +".png",
                "accessibility_text": "Tic Tac Toe game board"
              },
            }
          },
        ],
      },
      "speechBiasingHints": LIST_OF_MOVES,
    };
    let fulfillment = {
        speech: responseBack,
        source: "TicTacToe Engine",
        displayText: responseBack,
        contextOut: gameContext,
        'data': {"google": googleData},
    }
    dashbot.logOutgoing(event, fulfillment);
    callback(null, fulfillment)
}

function displayBoardGoogleData(speech, sessionOutputBoard) {
  return {
    "expect_user_response": true,
    "rich_response": {
      "items": [
        {
          "simple_response": {
            "text_to_speech": speech,
          }
        },
        {
          "basic_card": {
            "image": {
              "url": "https://s3-us-west-2.amazonaws.com/tic-tac-toe-boards/boardImages/" + sessionOutputBoard +".png",
              "accessibility_text": "Tic Tac Toe game board"
            },
          }
        },
      ],
    },
    "speechBiasingHints": LIST_OF_MOVES,
  };
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

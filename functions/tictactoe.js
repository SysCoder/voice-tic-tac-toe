'use strict';

var ticTacToeAIEngine = require('tic-tac-toe-ai-engine');

exports.getNextMove = function(board, level) {
    // console.log("Level: ", level);
    //callback(null, { hello: 'world', test: "Hello Lambda"})
/*
    while(exports.determineWinner(board) === 0) {
        var nextMove = randomNextMove(board);
        if (noMove(nextMove)) {
            // console.log("Tie!");
            break;
        }
        board = exports.makeMove(nextMove, board);


        var textMove = exports.arrayMoveToTextMove(nextMove);
        // console.log(textMove);
        // console.log(exports.textMoveToArrayMove(textMove.Location, textMove.Location1));
        displayBoard(board);
        // console.log("-----------");
        if (!exports.legalBoard(board)) {
            // console.log("Illegal board!!!");
        }
    }

*/
    if (level === "Easy") {
      // console.log("Inside easy!!");

       let possibleMoves = ticTacToeAIEngine.computePossibleMoves(exports.convertToEngineFormat(board));
       let nextBestPosition = ticTacToeAIEngine.computeMove(exports.convertToEngineFormat(board));
       // console.log("%j", possibleMoves);
       if (possibleMoves.length > 0 && nextBestPosition.depth !== 0) {
         let randomPosition = possibleMoves[getRandomArbitrary(0, possibleMoves.length)];
         var nextState = exports.convertToVoiceAppFormat(randomPosition);
         return exports.convertToMove(board, nextState);
       }
       return exports.convertToMove(board, board);

    }

    if (level === "Medium") {
      // console.log("Inside Medium!!");

       let possibleMoves = ticTacToeAIEngine.computePossibleMoves(exports.convertToEngineFormat(board));
       let nextBestPosition = ticTacToeAIEngine.computeMove(exports.convertToEngineFormat(board));
       // console.log("%j", possibleMoves);
       if (possibleMoves.length > 0 && nextBestPosition.depth !== 0) {
         let filteredPossibleMoves = [];

         // Filter out moves that would result in losing in the next move.
         for(let i = 0;i < possibleMoves.length;i++) {
            let possibleMoveEvaluated = ticTacToeAIEngine.computeMove(possibleMoves[i]);
            if (possibleMoveEvaluated.depth === 1 && possibleMoveEvaluated.winner !== '') {
              continue;
            }
            // Means that there is a win for the current player.
            if (possibleMoveEvaluated.depth === 0 && possibleMoveEvaluated.winner !== '') {
              // Clear filteredPossibleMoves
              filteredPossibleMoves.length = 0;
              filteredPossibleMoves.push(possibleMoves[i]);
              break;
            }
            filteredPossibleMoves.push(possibleMoves[i]);
         }
         let chosenPosition;
         if (filteredPossibleMoves.length > 0) {
           chosenPosition = filteredPossibleMoves[getRandomArbitrary(0, filteredPossibleMoves.length)];
         } else {
           chosenPosition = possibleMoves[getRandomArbitrary(0, possibleMoves.length)];
         }

         var nextState = exports.convertToVoiceAppFormat(chosenPosition);
         return exports.convertToMove(board, nextState);
       }
       return exports.convertToMove(board, board);
    }

    if (level === "Impossible" || level === "Annoying") {
      var nextMoveEngineFormat = ticTacToeAIEngine.computeMove(exports.convertToEngineFormat(board));
      // console.log(nextMoveEngineFormat);
      var nextState = exports.convertToVoiceAppFormat(nextMoveEngineFormat.nextBestGameState);
      var nextMove = exports.convertToMove(board, nextState);
      // console.log(nextState);
      // console.log(exports.arrayMoveToTextMove(nextMove));
      return nextMove;
    }
}

exports.convertToMove = function(currentState, nextState) {
  var reVal = [0,0,0,0,0,0,0,0,0];
  for(var i = 0;i < currentState.length;i++) {
    if(currentState[i] !== nextState[i]) {
      reVal[i] = nextState[i];
    }
  }
  return reVal;
}

exports.convertToEngineFormat = function(board) {
  var reVal = [];
  for(var i = 0;i < board.length;i++) {
    if (board[i] === 0) {
      reVal.push('');
    } else if (board[i] === 1) {
      reVal.push('X')
    } else if (board[i] === 2) {
      reVal.push('O')
    }
  }
  return reVal;
}

exports.convertToVoiceAppFormat = function(board) {
  var reVal = [];
  for(var i = 0;i < board.length;i++) {
    if (board[i] === '') {
      reVal.push(0);
    } else if (board[i] === 'X') {
      reVal.push(1)
    } else if (board[i] === 'O') {
      reVal.push(2)
    }
  }
  return reVal;
}

exports.textMoveToArrayMove = function(firstLocation, secondLocation) {
    if(firstLocation == "Center") {
        return [0, 0, 0, 0, 1, 0, 0, 0, 0];
    }
    if(firstLocation == "Left" && (!secondLocation || secondLocation == "Center")) {
        return [0, 0, 0, 1, 0, 0, 0, 0, 0];
    }
    if(firstLocation == "Right" && (!secondLocation || secondLocation == "Center")) {
        return [0, 0, 0, 0, 0, 1, 0, 0, 0];
    }
    if(firstLocation == "Top" && (!secondLocation || secondLocation == "Center")) {
        return [0, 1, 0, 0, 0, 0, 0, 0, 0];
    }
    if(firstLocation == "Bottom" && (!secondLocation || secondLocation == "Center")) {
        return [0, 0, 0, 0, 0, 0, 0, 1, 0];
    }
    if((firstLocation == "Top" && secondLocation == "Left")
        || (firstLocation == "Left" && secondLocation == "Top")) {
        return [1, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    if((firstLocation == "Top" && secondLocation == "Right")
        || (firstLocation == "Right" && secondLocation == "Top")) {
        return [0, 0, 1, 0, 0, 0, 0, 0, 0];
    }
    if((firstLocation == "Bottom" && secondLocation == "Left")
        || (firstLocation == "Left" && secondLocation == "Bottom")) {
        return [0, 0, 0, 0, 0, 0, 1, 0, 0];
    }
    if((firstLocation == "Bottom" && secondLocation == "Right")
        || (firstLocation == "Right" && secondLocation == "Bottom")) {
        return [0, 0, 0, 0, 0, 0, 0, 0, 1];
    }

    return [0, 0, 0, 0, 0, 0, 0, 0, 0];
}



exports.arrayMoveToTextMove = function(arrayMove) {
    arrayMove = changeTwoToOne(arrayMove);
   if(isArrayEqual(arrayMove, [0, 0, 0, 1, 0, 0, 0, 0, 0])) {
       return { Location: "Left", Location1: ""}
   }
    if(isArrayEqual(arrayMove, [0, 0, 0, 0, 0, 1, 0, 0, 0])) {
        return { Location: "Right", Location1: ""}
    }
    if(isArrayEqual(arrayMove, [0, 1, 0, 0, 0, 0, 0, 0, 0])) {
        return { Location: "Top", Location1: ""}
    }
    if(isArrayEqual(arrayMove, [0, 0, 0, 0, 0, 0, 0, 1, 0])) {
        return { Location: "Bottom", Location1: ""}
    }
    if(isArrayEqual(arrayMove, [1, 0, 0, 0, 0, 0, 0, 0, 0])) {
        return { Location: "Top", Location1: "Left"}
    }
    if(isArrayEqual(arrayMove, [0, 0, 1, 0, 0, 0, 0, 0, 0])) {
        return { Location: "Top", Location1: "Right"}
    }
    if(isArrayEqual(arrayMove, [0, 0, 0, 0, 0, 0, 1, 0, 0])) {
        return { Location: "Bottom", Location1: "Left"}
    }
    if(isArrayEqual(arrayMove, [0, 0, 0, 0, 0, 0, 0, 0, 1])) {
        return { Location: "Bottom", Location1: "Right"}
    }
    if(isArrayEqual(arrayMove, [0, 0, 0, 0, 1, 0, 0, 0, 0])) {
        return { Location: "Center", Location1: ""}
    }
    return { Location: "", Location1: ""};
}

function isArrayEqual(a1, a2) {
    return a1.length==a2.length && a1.every(function(v,i) { return v === a2[i]});
}

function displayBoard(board) {
    // console.log(board[0], board[1], board[2]);
    // console.log(board[3], board[4], board[5]);
    // console.log(board[6], board[7], board[8]);
}

exports.makeMove = function(nextMove, board) {
    var nextBoard = [];
    for(var i = 0; i < nextMove.length; i++){
        nextBoard.push(nextMove[i] + board[i]);
    }
    displayBoard(nextBoard);
    return nextBoard;
}

function changeTwoToOne(arry) {
    return arry.map(function(a) {
        if (a === 2) {
            return 1;
        }
        return a;
    }, 0);
}

function noMove(nextMove) {
    var sum = nextMove.reduce(function(a, b) {
        return a + b;
    }, 0);
    return sum === 0;
}

function randomNextMove(board) {
    var nextMove = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (exports.determineWinner(board) !== 0) {
        return nextMove;
    }
    var randomPosition = getRandomArbitrary(0, numberOfEmptyLocation(board));
    var countEmpty = 0;
    for(var i = 0;i < board.length;i++) {
        if (board[i] === 0) {
            if (countEmpty === randomPosition) {
                if (isXTurn(board)) {
                    nextMove[i] = 1;
                } else {
                    nextMove[i] = 2;
                }
                //console("Found empty");
                return nextMove;
            }
            countEmpty++;
        }
    }

    return nextMove;
}

function isXTurn(board) {
    return board.filter(function(x){return x === 1}).length === board.filter(function(x){return x === 2}).length;
}

exports.legalBoard = function(board) {
    var numberOfXs = board.filter(function(x){return x === 1}).length;
    var numberOfOs = board.filter(function(x){return x === 2}).length;
    if (numberOfOs > numberOfXs || numberOfOs < (numberOfXs - 1)) {
        return false;
    }
    return true;
}

function numberOfEmptyLocation(board) {
    return board.filter(function(x){return x === 0}).length;
}

exports.determineWinner = function (board) {
    // Check horizontal.
    for (var i = 0;i < 3;i++) {
        if (board[i * 3 + 0] === board[i * 3 + 1]
            && board[i * 3 + 1]  === board[i * 3 + 2]
            && board[i * 3 + 0] !== 0) {

            return board[i * 3 + 0];
        }
    }

    // Check vertical.
    for(var i = 0;i < 3;i++) {
        if(board[i + 0] === board[i + 3]
            && board[i + 3] === board[i + 6]
            && board[i + 0] != 0) {
            return board[i + 0];
        }
    }

    var topLeft = board[0];
    var topRight = board[2];
    var middle = board[4];
    var bottomLeft = board[6];
    var bottomRight = board[8];

    var bottomLeftToTopRight = bottomLeft === middle && middle === topRight;
    var topLeftToBottomRight = topLeft === middle && middle === bottomRight;

    if (bottomLeftToTopRight || topLeftToBottomRight) {
        return middle;
    }
    if (numberOfEmptyLocation(board) === 0) {
        return 3;
    }

    return 0;
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

exports.getNextMove([1, 0, 0, 0, 0, 0, 1, 2, 0], 0);

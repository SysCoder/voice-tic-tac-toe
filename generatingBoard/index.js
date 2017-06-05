"use strict";
var Jimp = require("jimp");

var board1 = "101020201";
var board2 = "121212121";
var board3 = "XXXXXXXXX";
var board4 = "XXXXXXXXX";
var board5 = "XXXXXXXXX";

var allBoards = [];
generateAllBoards(0, "");
console.log(allBoards);
var reversedSortedBoards = allBoards.reverse();
setInterval(function () {create100BoardsFromList(reversedSortedBoards)}, 5000);

function generateAllBoards(depth, board) {
  if (depth === 9) {
    console.log(board);
    allBoards.push(board);
    //createBoardImageFile(board, "boardImages/" + board + ".png");
    return;
  }

  for (let possibleSquareValue of ['0', '1', '2']) {
    let boardOut = board + possibleSquareValue;
    generateAllBoards(depth + 1, boardOut);
  }
}

function create100BoardsFromList(boards) {
  if (boards.length === 0) {
    console.log("No more boards!");
    return;
  }
  for(let i = 0;i < 100;i++) {
    let board = boards.pop();
    console.log(board);
    createBoardImageFile(board, "boardImages/" + board + ".png");
  }
}

function createBoardImageFile(board, fileName) {
  // open a file called "lenna.png"
  Jimp.read("./X.png", function (err, xPlayer) {
      if (err) throw err;
     Jimp.read("./O.png", function (err, oPlayer) {
         if (err) throw err;
         Jimp.read("./EmptyBoard.png", function (err, lenna) {
             if (err) throw err;
              let x = 2;
              let y = 21;
             let countSquare = 0;

             for (var letter of board) {
               let row = parseInt(countSquare / 3);
               let col = countSquare % 3;

               if (letter === "1") {
                 lenna = lenna.composite(xPlayer, x + col * 105, y + row * 90);
               } else if (letter === "2") {
                 lenna = lenna.composite(oPlayer, x + col * 105, y + row * 90);
               }
               countSquare += 1;
             }
             lenna.write(fileName); // save
         });
     });
  });
}

var testModule = require('../index');
var repl = require("repl");


var ActionFunctionTester = require('./action-function-tester');

var actionFunctionTester = new ActionFunctionTester(testModule.voiceTicTacToe);


var replServer = repl.start({
  prompt: "Action-Function-Tester> ",
  eval: function(inputText, context, filename, callback) {
    let trimedInputText = inputText.toLowerCase().trim();
    if (trimedInputText == "ni" || trimedInputText == "new instance") {
      console.log("--New instance created--");
      actionFunctionTester = new ActionFunctionTester(testModule.voiceTicTacToe);
      callback();
    } else {
      callback(actionFunctionTester.makeUtterance(trimedInputText));
    }
  },
});

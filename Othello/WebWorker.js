// HTML5 Web Worker for Othello - WebWorker.js - Javascript - March 15, 2012

importScripts("MoveLogic.js");

// **** Global Variable Declarations ****

/*
var aBoardImageNumbers = null;
var nBoardArea = 0;
var nBoardWidth = 0;
var nBoardHeight = 0;
*/

// **** Function Declarations ****

onmessage = function (event) {
    var parameters = event.data;

    aBoardImageNumbers = parameters.aBoardImageNumbers;
    //nBoardArea = aBoardImageNumbers.length;
    //nBoardWidth = parameters.nBoardWidth;
    //nBoardHeight = parseInt(nBoardArea / nBoardWidth, 10);
    PiecePopulations = parameters.PiecePopulations;

    var result = bestMove(parameters.nPlayer, parameters.nPly, 0, -2 * nBoardArea);

    postMessage(result);
};

// **** End of File ****
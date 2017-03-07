// HTML5 Web Worker for Tic-Tac-Toe - WebWorker.js - Javascript - March 8, 2014

importScripts("MoveLogic.js");

// **** Global Variable Declarations ****

// **** Function Declarations ****

onmessage = function (event) {
    var parameters = event.data;

    aBoardImageNumbers = parameters.aBoardImageNumbers;
    //nBoardArea = aBoardImageNumbers.length;
    //nBoardWidth = parameters.nBoardWidth;
    //nBoardHeight = parseInt(nBoardArea / nBoardWidth, 10);
    boardPopulation = parameters.boardPopulation;

    var result = findBestMove(parameters.nPlayer, parameters.nPly, defeatValue - 1, true);

    postMessage(result);
};

// **** End of File ****
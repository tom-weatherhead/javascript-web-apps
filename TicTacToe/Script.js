// Tic-Tac-Toe - Script.js - Javascript - March 8, 2014

// **** Global Variable Declarations ****

var XNumber = 0;
var ONumber = 1;
var NumberOfCurrentPlayer;
var boardPopulation;
var PlayerNames = ["X", "O"];
var PlayerIsAutomated = [false, false];
var PlayerPly = [6, 6];
var isGameOver;
var isXVictory;
var isOVictory;

// **** jQuery Function Declarations ****

$(document).ready(function () {
    generatePageFooter();
    onPageLoad();
});

// **** Function Declarations ****

function getImagePath(imageNumber) {
    var imageName = "Empty";

    if (imageNumber == XNumber) {
        imageName = "X";
    } else if (imageNumber == ONumber) {
        imageName = "O";
    }

    return "Images/" + imageName + ".png";
}

function displayTurnMessage() {
    var turnMessage;

    if (!isGameOver) {
        turnMessage = PlayerNames[NumberOfCurrentPlayer];

        if (PlayerIsAutomated[NumberOfCurrentPlayer]) {
            turnMessage = turnMessage + " is thinking...";
        } else {
            turnMessage = turnMessage + "'s turn.";
        }
    } else {

        if (isXVictory) {
            turnMessage = PlayerNames[XNumber] + " wins.";
        } else if (isOVictory) {
            turnMessage = PlayerNames[ONumber] + " wins.";
        } else {
            turnMessage = "Tie game.";
        }

        turnMessage = "Game over; " + turnMessage;
    }

    $("#turnMessage").html(turnMessage);
}

function moveHelper(row, col) {
    var isVictory = placePiece(NumberOfCurrentPlayer, row, col, true);

    $("[name='squares']").eq(row * nBoardDimension + col).prop("src", getImagePath(NumberOfCurrentPlayer));

    isGameOver = isVictory || boardPopulation == nBoardArea;

    if (isVictory) {

        if (NumberOfCurrentPlayer == XNumber) {
            isXVictory = true;
        } else {
            isOVictory = true;
        }
    }

    NumberOfCurrentPlayer = 1 - NumberOfCurrentPlayer;
    displayTurnMessage();

    if (!isGameOver && PlayerIsAutomated[NumberOfCurrentPlayer]) {
        setTimeout("automatedMove()", 100);     // Wait for 100 ms before the next move to give the browser time to update the board.
    }
}

function automatedMove() {

    if (typeof (Worker) !== "undefined") {
        //alert("Using the Web Worker.");
        var w = new Worker("WebWorker.js");

        w.onmessage = function (event) {
            /* TODO: How do we run the garbage collector when we want to?  Is garbage collection the source of our massive delays here and in Othello?
            Components.utils.schedulePreciseGC(
            //Cu.schedulePreciseGC(
              function () {
                  // This code is executed when the garbage collection has completed
                  moveHelper(event.data.bestRow, event.data.bestCol);
              }
            );
             */
            moveHelper(event.data.bestRow, event.data.bestCol);
        };

        var params = new WorkerParameters(NumberOfCurrentPlayer, PlayerPly[NumberOfCurrentPlayer]);

        w.postMessage(params);
    }
    else {
        var returnObject = findBestMove(NumberOfCurrentPlayer, PlayerPly[NumberOfCurrentPlayer], defeatValue - 1, true);

        moveHelper(returnObject.bestRow, returnObject.bestCol);
    }
}

function squareClicked(i) {

    if (isGameOver || PlayerIsAutomated[NumberOfCurrentPlayer]) {
        return;
    }

    var row = parseInt(i / nBoardWidth, 10);
    var col = i % nBoardWidth;

    moveHelper(row, col);
}

function populateLookaheadDDL(ddlID) {
    $("#" + ddlID).html("");    // Clear the list.

    for (var i = 1; i <= 9; ++i) {
        $("<option>" + i + "</option>").appendTo("#" + ddlID); // Perhaps we could reverse this and use append instead of appendTo.
    }
}

function constructBoard() {
    var pathToEmptyImage = getImagePath(EmptyNumber);
    var i = 0;

    for (var r = 0; r < nBoardHeight; ++r) {
        var rowName = "row" + r;

        $("<tr id='" + rowName + "'></tr>").appendTo("#board");

        for (var c = 0; c < nBoardWidth; ++c) {
            $("<td><img name='squares' class='tightBox' src='" + pathToEmptyImage + "' onclick='squareClicked(" + i + ")' /></td>").appendTo("#" + rowName);
            ++i;
        }
    }

    populateLookaheadDDL("ddlLookaheadX");
    populateLookaheadDDL("ddlLookaheadO");

    $("#cbAutomateX").prop("checked", PlayerIsAutomated[XNumber]);
    $("#cbAutomateO").prop("checked", PlayerIsAutomated[ONumber]);
    $("#ddlLookaheadX").val(PlayerPly[XNumber]);
    $("#ddlLookaheadO").val(PlayerPly[ONumber]);
    $("#ddlLookaheadX").prop("disabled", !PlayerIsAutomated[XNumber]);
    $("#ddlLookaheadO").prop("disabled", !PlayerIsAutomated[ONumber]);
    aBoardImageNumbers = new Array(nBoardArea);
    newGame();
}

// **** Event Handlers ****

function onPageLoad() {
    constructBoard();
}

function newGame() {
    var pathToEmptyImage = getImagePath(EmptyNumber);

    for (var i = 0; i < aBoardImageNumbers.length; ++i) {
        aBoardImageNumbers[i] = EmptyNumber;
    }

    $("[name='squares']").each(function () {
        $(this).prop("src", pathToEmptyImage);
    });

    NumberOfCurrentPlayer = XNumber;
    boardPopulation = 0;
    isGameOver = false;
    isXVictory = false;
    isOVictory = false;
    displayTurnMessage();

    if (PlayerIsAutomated[NumberOfCurrentPlayer]) {
        setTimeout("automatedMove()", 100);
    }
}

function cbAutomateX_onChange() {
    PlayerIsAutomated[XNumber] = $("#cbAutomateX").prop("checked");
    $("#ddlLookaheadX").prop("disabled", !PlayerIsAutomated[XNumber]);

    if (!isGameOver && PlayerIsAutomated[XNumber] && NumberOfCurrentPlayer == XNumber) {
        automatedMove();
    }
}

function cbAutomateO_onChange() {
    PlayerIsAutomated[ONumber] = $("#cbAutomateO").prop("checked");
    $("#ddlLookaheadO").prop("disabled", !PlayerIsAutomated[ONumber]);

    if (!isGameOver && PlayerIsAutomated[ONumber] && NumberOfCurrentPlayer == ONumber) {
        automatedMove();
    }
}

function ddlLookaheadX_onChange() {
    PlayerPly[XNumber] = parseInt($("#ddlLookaheadX").val(), 10);
}

function ddlLookaheadO_onChange() {
    PlayerPly[ONumber] = parseInt($("#ddlLookaheadO").val(), 10);
}

// **** End of File ****
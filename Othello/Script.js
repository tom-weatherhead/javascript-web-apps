// Othello - Script.js - Javascript - March 7, 2012

// **** Global Variable Declarations ****

var WhiteNumber = 0;
var BlackNumber = 1;
var NumberOfCurrentPlayer = WhiteNumber;

var noAutomatedMovePossible = 0;

var PlayerNames = new Array(2);
var PlayerIsAutomated = new Array(2);
var PlayerPly = [6, 6];

PlayerNames[WhiteNumber] = "White";
PlayerNames[BlackNumber] = "Black";
PlayerIsAutomated[WhiteNumber] = false;
PlayerIsAutomated[BlackNumber] = true;

// **** jQuery Function Declarations ****

$(document).ready(function () {
    generatePageFooter();
    onPageLoad();
});

// **** Function Declarations ****

function getImagePath(imageNumber) {
    var imageName = "Empty";

    if (imageNumber == WhiteNumber) {
        imageName = "White";
    } else if (imageNumber == BlackNumber) {
        imageName = "Black";
    }

    return "Images/" + imageName + ".png";
}

function displayTurnMessage() {
    var turnMessage;

    if (isGameNotOver()) {
        turnMessage = PlayerNames[NumberOfCurrentPlayer];

        if (PlayerIsAutomated[NumberOfCurrentPlayer]) {
            turnMessage = turnMessage + " is thinking...";
        } else {
            turnMessage = turnMessage + "'s turn.";
        }
    } else {
        var whiteLead = PiecePopulations[WhiteNumber] - PiecePopulations[BlackNumber];

        if (whiteLead > 0) {
            turnMessage = PlayerNames[WhiteNumber] + " wins.";
        } else if (whiteLead < 0) {
            turnMessage = PlayerNames[BlackNumber] + " wins.";
        } else {
            turnMessage = "Tie game.";
        }

        turnMessage = "Game over; " + turnMessage;
    }

    $("#turnMessage").html(turnMessage);

    $("#numberOfWhitePiecesID").html(PiecePopulations[WhiteNumber]);
    $("#numberOfBlackPiecesID").html(PiecePopulations[BlackNumber]);
}

function moveHelper(row, col) {
    var placePieceResult = placePiece(NumberOfCurrentPlayer, row, col, null, true);
    var nPlacePieceEffect = placePieceResult.numPiecesFlipped;

    if (nPlacePieceEffect > 0) {
        PiecePopulations[NumberOfCurrentPlayer] += nPlacePieceEffect + 1;
        PiecePopulations[1 - NumberOfCurrentPlayer] -= nPlacePieceEffect;
    }

    if (nPlacePieceEffect == 0 && PlayerIsAutomated[NumberOfCurrentPlayer]) {
        ++noAutomatedMovePossible;
    } else {
        noAutomatedMovePossible = 0;
    }

    NumberOfCurrentPlayer = 1 - NumberOfCurrentPlayer;
    displayTurnMessage();

    if (isGameNotOver() && PlayerIsAutomated[NumberOfCurrentPlayer]) {
        setTimeout("automatedMove()", 100);     // Wait for 100 ms before the next move to give the browser time to update the board.
    }
}

function automatedMove() {

    if (typeof (Worker) !== "undefined") {
        //alert("Using the Web Worker.");
        var w = new Worker("WebWorker.js");

        w.onmessage = function (event) {
            moveHelper(event.data.bestRow, event.data.bestCol);
        };

        var params = new WorkerParameters(NumberOfCurrentPlayer, PlayerPly[NumberOfCurrentPlayer]);

        w.postMessage(params);
    }
    else {
        var returnObject = bestMove(NumberOfCurrentPlayer, PlayerPly[NumberOfCurrentPlayer], 0, -2 * nBoardArea);

        moveHelper(returnObject.bestRow, returnObject.bestCol);
    }
}

function squareClicked(i) {

    if (PlayerIsAutomated[NumberOfCurrentPlayer]) {
        return;
    }

    var row = parseInt(i / nBoardWidth, 10);
    var col = i % nBoardWidth;

    moveHelper(row, col);
}

function populateLookaheadDDL(ddlID) {
    $("#" + ddlID).html("");    // Clear the list.

    for (var i = 1; i <= 10; ++i) {
        $("<option>" + i + "</option>").appendTo("#" + ddlID);
    }
}

function constructBoard() {
    var pathToEmptyImage = getImagePath(EmptyNumber);
    var i = 0;

    for (var r = 0; r < nBoardHeight; ++r) {
        var rowName = "row" + r;

        $("<tr id='" + rowName + "'></tr>").appendTo("#board");

        for (var c = 0; c < nBoardWidth; ++c) {
            $("<td><img name='squares' src='" + pathToEmptyImage + "' onclick='squareClicked(" + i + ")' /></td>").appendTo("#" + rowName);
            ++i;
        }
    }

    populateLookaheadDDL("ddlLookaheadWhite");
    populateLookaheadDDL("ddlLookaheadBlack");

    $("#cbAutomateWhite").prop("checked", PlayerIsAutomated[WhiteNumber]);
    $("#cbAutomateBlack").prop("checked", PlayerIsAutomated[BlackNumber]);
    $("#ddlLookaheadWhite").val(PlayerPly[WhiteNumber]);
    $("#ddlLookaheadBlack").val(PlayerPly[BlackNumber]);
    $("#ddlLookaheadWhite").prop("disabled", !PlayerIsAutomated[WhiteNumber]);
    $("#ddlLookaheadBlack").prop("disabled", !PlayerIsAutomated[BlackNumber]);
    aBoardImageNumbers = new Array(nBoardArea);
    PiecePopulations = new Array(2);
    newGame();
}

// **** Event Handlers ****

function onPageLoad() {
    constructBoard();
}

function newGame() {
    var pathToEmptyImage = getImagePath(EmptyNumber);
    var centreRow = parseInt(nBoardHeight / 2, 10);
    var centreCol = parseInt(nBoardWidth / 2, 10);

    for (var i = 0; i < aBoardImageNumbers.length; ++i) {
        aBoardImageNumbers[i] = EmptyNumber;
    }

    $("[name='squares']").each(function () {
        $(this).prop("src", pathToEmptyImage);
    });

    setSquareState(centreRow - 1, centreCol - 1, WhiteNumber, true);
    setSquareState(centreRow, centreCol, WhiteNumber, true);
    setSquareState(centreRow - 1, centreCol, BlackNumber, true);
    setSquareState(centreRow, centreCol - 1, BlackNumber, true);
    PiecePopulations[WhiteNumber] = 2;
    PiecePopulations[BlackNumber] = 2;
    NumberOfCurrentPlayer = WhiteNumber;
    noAutomatedMovePossible = 0;
    displayTurnMessage();

    if (PlayerIsAutomated[NumberOfCurrentPlayer]) {
        setTimeout("automatedMove()", 100);
    }
}

function cbAutomateWhite_onChange() {
    PlayerIsAutomated[WhiteNumber] = $("#cbAutomateWhite").prop("checked");
    $("#ddlLookaheadWhite").prop("disabled", !PlayerIsAutomated[WhiteNumber]);

    if (PlayerIsAutomated[WhiteNumber] && NumberOfCurrentPlayer == WhiteNumber) {
        automatedMove();
    }
}

function cbAutomateBlack_onChange() {
    PlayerIsAutomated[BlackNumber] = $("#cbAutomateBlack").prop("checked");
    $("#ddlLookaheadBlack").prop("disabled", !PlayerIsAutomated[BlackNumber]);

    if (PlayerIsAutomated[BlackNumber] && NumberOfCurrentPlayer == BlackNumber) {
        automatedMove();
    }
}

function ddlLookaheadWhite_onChange() {
    PlayerPly[WhiteNumber] = parseInt($("#ddlLookaheadWhite").val(), 10);
}

function ddlLookaheadBlack_onChange() {
    PlayerPly[BlackNumber] = parseInt($("#ddlLookaheadBlack").val(), 10);
}

// **** End of File ****
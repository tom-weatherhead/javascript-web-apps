// Best move logic for Othello - MoveLogic.js - Javascript - March 15, 2012

// **** Global Variable Declarations ****

var nNumDirections = 8;
var adx = [-1, 0, 1, -1, 1, -1, 0, 1];          // adx.length == nNumDirections
var ady = [-1, -1, -1, 0, 0, 1, 1, 1];          // ady.length == nNumDirections

var nBoardWidth = 8;
var nBoardHeight = 8;
var nBoardArea = nBoardWidth * nBoardHeight;
var aBoardImageNumbers = null;  // new Array(nBoardArea);

var EmptyNumber = -1;

var PiecePopulations = null;    // [0, 0];

// **** Function Declarations ****

function getSquareState(row, col) {

    if (row < 0 || row >= nBoardHeight || col < 0 || col >= nBoardWidth) {
        return EmptyNumber;
    }

    return aBoardImageNumbers[row * nBoardWidth + col];
}

function setSquareState(row, col, imageNumber, visible) {

    if (row < 0 || row >= nBoardHeight || col < 0 || col >= nBoardWidth) {
        return;
    }

    var i = row * nBoardWidth + col;

    aBoardImageNumbers[i] = imageNumber;

    if (visible) {
        $("[name='squares']").eq(i).prop("src", getImagePath(imageNumber));
    }
}

function isGameNotOver() {
    return PiecePopulations[0] > 0 &&
        PiecePopulations[1] > 0 &&
        PiecePopulations[0] + PiecePopulations[1] < nBoardArea &&
        noAutomatedMovePossible < 2;
}

function squareScore(nRow, nCol) {
    var cornerSquareScore = 8;
    var edgeSquareScore = 2;
    var nScore = 1;
    var isInEdgeColumn = nCol == 0 || nCol == nBoardWidth - 1;

    if (nRow == 0 || nRow == nBoardHeight - 1) {

        if (isInEdgeColumn) {
            nScore = cornerSquareScore;
        } else {
            nScore = edgeSquareScore;
        }
    } else if (isInEdgeColumn) {
        nScore = edgeSquareScore;
    }

    return nScore;
}

function PlacePieceData() {
    this.numPiecesFlipped = 0;
    this.score = 0;
}

function placePiece(nPlayer, nRow, nCol, undoBuffer, visible) {
    var returnObject = new PlacePieceData();
    var nUndoSize = 0;
    var nScore = 0;

    if (nRow < 0 || nRow >= nBoardHeight ||
		nCol < 0 || nCol >= nBoardWidth ||
		getSquareState(nRow, nCol) != EmptyNumber) {
        //alert("(row, col) == (" + nRow + ", " + nCol + ") is invalid.");
        return returnObject;
    }

    for (var i = 0; i < nNumDirections; ++i) {
        var bOwnPieceFound = false;
        var nRow2 = nRow;
        var nCol2 = nCol;
        var nSquaresToFlip = 0;

        // Pass 1: Scan and count.

        for (; ; ) {
            nRow2 += ady[i];
            nCol2 += adx[i];

            if (nRow2 < 0 || nRow2 >= nBoardHeight ||
				nCol2 < 0 || nCol2 >= nBoardWidth ||
				getSquareState(nRow2, nCol2) == EmptyNumber) {
                break;
            }

            if (getSquareState(nRow2, nCol2) == nPlayer) {
                bOwnPieceFound = true;
                break;
            }

            nSquaresToFlip++;
        }

        if (!bOwnPieceFound) {
            continue;
        }

        // Pass 2: Flip.
        nRow2 = nRow;
        nCol2 = nCol;

        for (var j = 0; j < nSquaresToFlip; ++j) {
            nRow2 += ady[i];
            nCol2 += adx[i];

            setSquareState(nRow2, nCol2, nPlayer, visible);
            nScore += 2 * squareScore(nRow2, nCol2);

            if (undoBuffer != null) {
                // Add (nRow2, nCol2) to the undo queue.
                undoBuffer.push(nRow2 * nBoardWidth + nCol2);
            }

            nUndoSize++;
        }
    }

    if (nUndoSize > 0) {
        setSquareState(nRow, nCol, nPlayer, visible);
        returnObject.numPiecesFlipped = nUndoSize;
        returnObject.score = nScore + squareScore(nRow, nCol);
    }
    // Else no opposing pieces were flipped, and the move fails.

    //return nUndoSize + 1;
    return returnObject;
}

function BestMoveData() {
    this.bestRow = -1;
    this.bestCol = -1;
    this.bestScore = 0;
}

function bestMove(
	nPlayer, nPly,
	nParentScore, nBestUncleRecursiveScore	// For alpha-beta pruning.
	) {
    var nBestScore = -2 * nBoardArea;
    var bestMoveIndices = [];

    for (var nSquare = 0; nSquare < nBoardArea; ++nSquare) {
        var undoBuffer = [];

        var nRow = parseInt(nSquare / nBoardWidth, 10);
        var nCol = nSquare % nBoardWidth;
        /*
        var nScore = placePiece(nPlayer, nRow, nCol, undoBuffer, false);

        if (nScore <= 0) {
            continue;
        }

        //m_nMovesTried++;

        var nUndoSize = nScore - 1;
        */
        var placePieceResult = placePiece(nPlayer, nRow, nCol, undoBuffer, false);
        var nUndoSize = placePieceResult.numPiecesFlipped;

        //alert("(" + nRow + "," + nCol + "): undo size == " + nUndoSize + "; score == " + placePieceResult.score);

        if (nUndoSize <= 0) {
            continue;
        }

        //m_nMovesTried++;

        var nScore = placePieceResult.score;

        PiecePopulations[nPlayer] += nUndoSize + 1;
        PiecePopulations[1 - nPlayer] -= nUndoSize;

        if (PiecePopulations[1 - nPlayer] <= 0) {
            // The opposing player has been annihilated.
            nScore = nBoardArea;
        } else if (nPly > 1 &&
			PiecePopulations[0] + PiecePopulations[1] < nBoardArea) {
            var childReturnObject = bestMove(1 - nPlayer, nPly - 1, nScore, nBestScore);

            nScore -= childReturnObject.bestScore;
        }

        setSquareState(nRow, nCol, EmptyNumber, false);
        PiecePopulations[nPlayer] -= nUndoSize + 1;
        PiecePopulations[1 - nPlayer] += nUndoSize;

        for (var i = 0; i < undoBuffer.length; ++i) {
            aBoardImageNumbers[undoBuffer[i]] = 1 - nPlayer;
        }

        if (nScore > nBestScore) {
            nBestScore = nScore;
            bestMoveIndices = [];
            bestMoveIndices.push(nSquare);

            if (nParentScore - nBestScore < nBestUncleRecursiveScore) {
                // Alpha-beta pruning.  Because of the initial parameters for the top-level move, this break is never executed for the top-level move.
                break; // ie. return.
            }
        } else if (nScore == nBestScore) {
            bestMoveIndices.push(nSquare);
        }
    }

    var returnObject = new BestMoveData();

    if (bestMoveIndices.length > 0) {
        var i = parseInt(Math.random() * bestMoveIndices.length, 10);
        var nBestIndex = bestMoveIndices[i];

        returnObject.bestRow = parseInt(nBestIndex / nBoardWidth, 10);
        returnObject.bestCol = nBestIndex % nBoardWidth;
    }

    returnObject.bestScore = nBestScore;
    return returnObject;
}

function WorkerParameters(nPlayer, nPly) {
    this.aBoardImageNumbers = aBoardImageNumbers;
    this.PiecePopulations = PiecePopulations;
    this.nPlayer = nPlayer;
    this.nPly = nPly;
}

// **** End of File ****
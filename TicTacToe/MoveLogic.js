// Best move logic for Tic-Tac-Toe - MoveLogic.js - Javascript - March 10, 2014

// **** Global Variable Declarations ****

var nBoardDimension = 3;
var nBoardWidth = nBoardDimension;
var nBoardHeight = nBoardDimension;
var nBoardArea = nBoardWidth * nBoardHeight;
var boardPopulation;
var aBoardImageNumbers = null;  // new Array(nBoardArea);
var EmptyNumber = -1;
var victoryValue = 100;
var defeatValue = -victoryValue;

// **** Function Declarations ****

function isVictory(player, row, column)
{
    // 1) Check the specified row.
    var victory = true;

    for (var column2 = 0; column2 < nBoardDimension; ++column2)
    {

        if (aBoardImageNumbers[row * nBoardDimension + column2] != player)
        {
            victory = false;
            break;
        }
    }

    if (victory)
    {
        return true;
    }

    // 2) Check the specified column.
    victory = true;

    for (var row2 = 0; row2 < nBoardDimension; ++row2)
    {

        if (aBoardImageNumbers[row2 * nBoardDimension + column] != player)
        {
            victory = false;
            break;
        }
    }

    if (victory)
    {
        return true;
    }

    if (row == column)
    {
        // 3) Check the primary diagonal.
        victory = true;

        for (var i = 0; i < nBoardDimension; ++i)
        {

            if (aBoardImageNumbers[i * nBoardDimension + i] != player)
            {
                victory = false;
                break;
            }
        }

        if (victory)
        {
            return true;
        }
    }

    if (row + column == nBoardDimension - 1)
    {
        // 4) Check the secondary diagonal.
        victory = true;

        for (var i = 0; i < nBoardDimension; ++i)
        {

            if (aBoardImageNumbers[i * nBoardDimension + nBoardDimension - 1 - i] != player)
            {
                victory = false;
                break;
            }
        }

        if (victory)
        {
            return true;
        }
    }

    return false;
}

function placePiece(player, row, column, displayMove) // displayMove is not used.
{
    // If player is X or O, the square being written to must be empty just before the move is made.
    // If player is Empty, the square being written to must be non-empty just before the move is made, and displayMove must be false.

    if (row < 0 || row >= nBoardDimension)
    {
        alert("PlacePiece() : row " + row + " is out of range; nBoardDimension == " + nBoardDimension);
        return false;
    }

    if (column < 0 || column >= nBoardDimension)
    {
        alert("PlacePiece() : column is out of range.");
        return false;
    }

    var oldSquareContent = aBoardImageNumbers[row * nBoardDimension + column];

    if (player != EmptyNumber)
    {

        if (oldSquareContent != EmptyNumber)
        {
            alert("PlacePiece() : Attempted to write an X or an O into a non-empty square.");
            return false;
        }
    }
    else
    {

        if (oldSquareContent == EmptyNumber)
        {
            alert("PlacePiece() : Attempted to erase an already-empty square.");
            return false;
        }
    }

    aBoardImageNumbers[row * nBoardDimension + column] = player;

    if (player == EmptyNumber)
    {
        --boardPopulation;
    }
    else
    {
        ++boardPopulation;
    }

    var victory = player != EmptyNumber && isVictory(player, row, column);

    return victory; // This can return true for real or speculative moves.
}

function getNumOpenLines(opponent)
{
    var numOpenLines = 2 * nBoardDimension + 2;
    var row;
    var column;

    // 1) Check all rows.

    for (row = 0; row < nBoardDimension; ++row)
    {

        for (column = 0; column < nBoardDimension; ++column)
        {

            if (aBoardImageNumbers[row * nBoardDimension + column] == opponent)
            {
                --numOpenLines;
                break;
            }
        }
    }

    // 2) Check all columns.

    for (column = 0; column < nBoardDimension; ++column)
    {

        for (row = 0; row < nBoardDimension; ++row)
        {

            if (aBoardImageNumbers[row * nBoardDimension + column] == opponent)
            {
                --numOpenLines;
                break;
            }
        }
    }

    // 3) Check the primary diagonal.

    for (row = 0; row < nBoardDimension; ++row)
    {

        if (aBoardImageNumbers[row * nBoardDimension + row] == opponent)
        {
            --numOpenLines;
            break;
        }
    }

    // 4) Check the secondary diagonal.

    for (row = 0; row < nBoardDimension; ++row)
    {

        if (aBoardImageNumbers[row * nBoardDimension + nBoardDimension - 1 - row] == opponent)
        {
            --numOpenLines;
            break;
        }
    }

    return numOpenLines;
}

function getBoardValue(player, opponent)
{
    return getNumOpenLines(player) - getNumOpenLines(opponent);
}

function BestMoveData() {
    this.bestRow = -1;
    this.bestColumn = -1;
    this.bestScore = 0;
}

function findBestMove(player, ply,
    bestUncleRecursiveScore,	// For alpha-beta pruning.
    returnBestCoordinates)
{
    var opponent = 1 - player;
    var bestMoveValue = defeatValue - 1;     // Worse than the worst possible move value.
    var bestMoveList = returnBestCoordinates ? [] : null;
    var doneSearching = false;

    for (var row = 0; row < nBoardDimension && !doneSearching; ++row)
    {

        for (var column = 0; column < nBoardDimension; ++column)
        {
            var moveValue = 0;
            var currentSquareIndex = row * nBoardDimension + column;

            if (aBoardImageNumbers[currentSquareIndex] != EmptyNumber)
            {
                continue;
            }

            if (placePiece(player, row, column, false)) // I.e. if this move results in immediate victory.
            {
                moveValue = victoryValue;
            }
            else if (boardPopulation < nBoardArea && ply > 1)
            {
                //var bestChildMoveData = findBestMove(opponent, ply - 1, bestMoveValue, false);

                //moveValue = -bestChildMoveData.bestScore;
                moveValue = -findBestMove(opponent, ply - 1, bestMoveValue, false);
            }
            else
            {
                moveValue = getBoardValue(player, opponent);
            }

            placePiece(EmptyNumber, row, column, false);

            if (moveValue == bestMoveValue && returnBestCoordinates)
            {
                bestMoveList.push(currentSquareIndex);
            }
            else if (moveValue > bestMoveValue)
            {
                bestMoveValue = moveValue;

                if (bestMoveValue > -bestUncleRecursiveScore) 
                {
                    // Alpha-beta pruning.  Because of the initial parameters for the top-level move, this break is never executed for the top-level move.
                    doneSearching = true;
                    break; // ie. return.
                }
                else if (returnBestCoordinates)
                {
                    bestMoveList = [];
                    bestMoveList.push(currentSquareIndex);
                }
                else if (bestMoveValue == victoryValue)
                {
                    // Prune the search tree, since we are not constructing a list of all of the best moves.
                    doneSearching = true;
                    break;
                }
            }
        }
    }

    //var bestMoveData = new BestMoveData();
    var bestMoveData = bestMoveValue;

    if (bestMoveValue < defeatValue || bestMoveValue > victoryValue)
    {
        alert("FindBestMove() : bestMoveValue is out of range.");
    }
    else if (!returnBestCoordinates)
    {
        //bestRow = -1;
        //bestColumn = -1;
    }
    else if (bestMoveList.length == 0)
    {
        alert("FindBestMove() : The bestMoveList is empty at the end of the method.");
    }
    else
    {
        var i = parseInt(Math.random() * bestMoveList.length, 10);
        var nBestIndex = bestMoveList[i];

        bestMoveData = new BestMoveData();
        bestMoveData.bestRow = parseInt(nBestIndex / nBoardDimension, 10);
        bestMoveData.bestCol = nBestIndex % nBoardDimension;
        bestMoveData.bestScore = bestMoveValue;
    }

    return bestMoveData; // If returnBestCoordinates then we are returning a BestMoveData object; else we are returning an int.
}

/*
public int FindBestMove(SquareContentType player, int ply,
    // no bestUncleRecursiveScore
bool returnBestCoordinates, List<int> bestMoveListCopy,
out int bestRow, out int bestColumn)
{
return FindBestMove(player, ply, defeatValue - 1, returnBestCoordinates, bestMoveListCopy, out bestRow, out bestColumn);
}

public BestMoveData FindBestMoveWrapper(SquareContentType player, int ply)
{
int bestRow;
int bestColumn;
int bestScore = FindBestMove(player, ply, true, null, out bestRow, out bestColumn);

return new BestMoveData(bestScore, bestRow, bestColumn);
}
 */

function WorkerParameters(nPlayer, nPly) {
    // If we ever make the board dimension variable, add it as a parameter here.
    this.aBoardImageNumbers = aBoardImageNumbers;
    this.boardPopulation = boardPopulation;
    this.nPlayer = nPlayer;
    this.nPly = nPly;
}
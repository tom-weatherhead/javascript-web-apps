// Pipes - Script.js - Javascript - February 5, 2011

// **** Global Variable Declarations ****

var nNumDirections = 4;             // Up, right, down, and left (in clockwise order).
var aPowersOfTwo = [1, 2, 4, 8];    // aPowersOfTwo.length == nNumDirections
var adx = [0, 1, 0, -1];            // adx.length == nNumDirections
var ady = [-1, 0, 1, 0];            // ady.length == nNumDirections

var nMinGridWidth = 2;
var nMinGridHeight = 2;
var nDefaultGridWidth = 8;
var nDefaultGridHeight = 8;
var nMaxGridWidth = 20;
var nMaxGridHeight = 20;

var bVictory = false;

// The values of these variables will be set in setGridDimensions().
var nGridWidth = 0;             //nDefaultGridWidth
var nGridHeight = 0;            //nDefaultGridHeight
var nGridArea = 0;              //nGridWidth * nGridHeight
var aGridImageNumbers = null;   //new Array(nGridArea)
var abImageIsGreen = null;      //new Array(nGridArea)

// **** jQuery Function Declarations ****

$(document).ready(function () {
    generatePageFooter();
    constructGrid();
});

// **** Function Declarations ****

// Read a page's GET URL variables and return them as an associative array.

function getURLParameters() {
    var vars = [], hash;
    var indexOfQuestionMark = window.location.href.indexOf('?');

    if (indexOfQuestionMark < 0) {
        return vars;
    }

    var hashes = window.location.href.slice(indexOfQuestionMark + 1).split('&');

    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = unescape(hash[1]);
    }

    return vars;
}

function getURLParameterAsLimitedInt(vars, paramName, minValue, maxValue, defaultValue) {
    var value = vars[paramName];

    if (value == null) {
        return defaultValue;
    }

    value = parseInt(value, 10);

    if (isNaN(value)) {
        return defaultValue;
    }

    if (value < minValue) {
        value = minValue;
    } else if (value > maxValue) {
        value = maxValue;
    }

    return value;
}

function setMessage(strMessage) {
    $("#message").html(strMessage);
}

function prepareForNewGame() {
    setMessage("Click on a square to rotate the pipe segment within it.&nbsp; The goal is to connect all of the pipe segments together, so that they all turn green.");
}

function setGridDimensions() {
    var vars = getURLParameters();

    nGridWidth = getURLParameterAsLimitedInt(vars, "GridWidth", nMinGridWidth, nMaxGridWidth, nDefaultGridWidth);
    nGridHeight = getURLParameterAsLimitedInt(vars, "GridHeight", nMinGridHeight, nMaxGridHeight, nDefaultGridHeight);

    nGridArea = nGridWidth * nGridHeight;
    aGridImageNumbers = new Array(nGridArea);
    abImageIsGreen = new Array(nGridArea);
}

function createSolution() {
    var aBlobNumbers = new Array(nGridArea);
    var aOpenList = new Array(nGridArea);
    var openListLength = aOpenList.length;
    var aDirectionIndices = new Array(nNumDirections);     // Number of directions == 4
    var numConnections = 0;

    for (var i = 0; i < aGridImageNumbers.length; i++) {
        aGridImageNumbers[i] = 0;
    }

    for (var i = 0; i < aBlobNumbers.length; i++) {
        aBlobNumbers[i] = i;
    }

    for (var i = 0; i < aOpenList.length; i++) {
        aOpenList[i] = i;
    }

    while (numConnections < nGridArea - 1) {
        // Randomly select a member of the open list.
        var openListIndex = parseInt(Math.random() * openListLength, 10);
        var openListElement = aOpenList[openListIndex];
        var blobNumber1 = aBlobNumbers[openListElement];
        var row1 = parseInt(openListElement / nGridWidth, 10);
        var col1 = openListElement % nGridWidth;

        for (var i = 0; i < aDirectionIndices.length; i++) {
            aDirectionIndices[i] = i;
        }

        var connectionCreatedDuringThisPass = false;
        var numDirectionIndices = aDirectionIndices.length;

        while (numDirectionIndices > 0 && !connectionCreatedDuringThisPass) {
            var j = parseInt(Math.random() * numDirectionIndices, 10);
            var directionIndex = aDirectionIndices[j];

            numDirectionIndices--;
            aDirectionIndices[j] = aDirectionIndices[numDirectionIndices];

            var dx = adx[directionIndex];
            var dy = ady[directionIndex];
            var row2 = row1 + dy;
            var col2 = col1 + dx;

            if (row2 < 0 || row2 >= nGridHeight || col2 < 0 || col2 >= nGridWidth) {
                continue;
            }

            var index2 = row2 * nGridWidth + col2;
            var blobNumber2 = aBlobNumbers[index2];

            if (blobNumber1 == blobNumber2) {
                continue;
            }

            // Create the new connection.

            aGridImageNumbers[openListElement] += aPowersOfTwo[directionIndex];
            aGridImageNumbers[index2] += aPowersOfTwo[directionIndex ^ 2];   // Question: Is ^ the bitwise XOR operator?  Yes.

            numConnections++;
            connectionCreatedDuringThisPass = true;

            var minBlobNumber = Math.min(blobNumber1, blobNumber2);
            var maxBlobNumber = Math.max(blobNumber1, blobNumber2);

            for (var i = 0; i < aBlobNumbers.length; i++) {

                if (aBlobNumbers[i] == maxBlobNumber) {
                    aBlobNumbers[i] = minBlobNumber;
                }
            }

            // When the grid is fully constructed, all of the blob numbers will be 0.
            // In other words, every square in the grid will be a member of blob number 0.
        }

        if (!connectionCreatedDuringThisPass) {
            // The element at (row1, col1) has no neighbour belonging to a different blob;
            // therefore we will remove it from the open list.

            openListLength--;
            aOpenList[openListIndex] = aOpenList[openListLength];
        }
    }
}

function randomlyRotateImages() {
    // Blank: 0
    // i: 1, 2, 4, 8
    // I: 5, 10
    // L: 3, 6, 9, 12
    // T: 7, 11, 13, 14
    // +: 15
    var aaRotatedIndices = [
        [0],            // 0
        [2, 4, 8],      // 1
        [1, 4, 8],      // 2
        [6, 9, 12],     // 3
        [1, 2, 8],      // 4
        [10],           // 5
        [3, 9, 12],     // 6
        [11, 13, 14],   // 7
        [1, 2, 4],      // 8
        [3, 6, 12],     // 9
        [5],            // 10
        [7, 13, 14],    // 11
        [3, 6, 9],      // 12
        [7, 11, 14],    // 13
        [7, 11, 13],    // 14
        [15]            // 15
    ];

    for (var i = 0; i < aGridImageNumbers.length; i++) {
        var aRotationOptions = aaRotatedIndices[aGridImageNumbers[i]];
        var j = parseInt(Math.random() * aRotationOptions.length, 10);
        var rotatedIndex = aRotationOptions[j];

        aGridImageNumbers[i] = rotatedIndex;
    }
}

function setGridImageNumbers() {
    createSolution();
    randomlyRotateImages();
}

function findGreenSubtree(row1, col1) {
    /* Unnecessary.
    if (row1 < 0 || row1 >= nGridHeight || col1 < 0 || col1 >= nGridWidth) {
        return 0
    }
    */

    var index1 = row1 * nGridWidth + col1;

    if (abImageIsGreen[index1]) {   // Avoid infinite loops.
        return 0;
    }

    abImageIsGreen[index1] = true;

    var numGreenImagesInSubtree = 1;
    var image1 = aGridImageNumbers[index1];

    for (var i = 0; i < nNumDirections; i++) {
        var row2 = row1 + ady[i];
        var col2 = col1 + adx[i];

        if (row2 < 0 || row2 >= nGridHeight || col2 < 0 || col2 >= nGridWidth) {
            continue;
        }

        var index2 = row2 * nGridWidth + col2;
        var image2 = aGridImageNumbers[index2];

        if ((image1 & aPowersOfTwo[i]) != 0 && (image2 & aPowersOfTwo[i ^ 2]) != 0) {
            // There is a connection between the square at (row1, col1) and the square at (row2, col2).
            numGreenImagesInSubtree += findGreenSubtree(row2, col2);
        }
    }

    return numGreenImagesInSubtree;
}

function findGreenTree() {

    for (var i = 0; i < abImageIsGreen.length; i++) {
        abImageIsGreen[i] = false;
    }

    return findGreenSubtree(parseInt(nGridHeight / 2, 10), parseInt(nGridWidth / 2, 10));
}

function constructImageSourceString(index) {
    var imageNum = aGridImageNumbers[index];

    if (abImageIsGreen[index]) {
        imageNum += 16;
    }

    return "Images/" + imageNum + ".png";
}

function constructGrid() {
    var i = 0;

    prepareForNewGame();
    setGridDimensions();
    setGridImageNumbers();
    findGreenTree();

    for (var row = 0; row < nGridHeight; row++) {
        $("<tr></tr>").appendTo("#pipeGrid");

        for (var col = 0; col < nGridWidth; col++) {
            var strImgSrc = constructImageSourceString(i);

            //$("<td><img name='btnGridImage' id='btnGridImage" + i + "' src='" + strImgSrc + "' alt='" + i + "' onclick='imageClicked(" + i + ")' /></td>").appendTo("#pipeGrid tr:last");
            $("<td><img name='btnGridImage' src='" + strImgSrc + "' onclick='imageClicked(" + i + ")' /></td>").appendTo("#pipeGrid tr:last");
            i++;
        }
    }
}

function rolNybble(nybble) {
    nybble %= 16;     // For safety.  Probably unnecessary.
    nybble *= 2;

    if (nybble >= 16) { // The "carry" bit is 1.
        nybble -= 16;     // To remove the bit that has been rotated into the "carry" bit.
        nybble++;         // To set bit 0 of the nybble from the "carry" bit.
    }

    return nybble;
}

function setImageSourcesAfterClick() {
    var numGreenImages = findGreenTree();

    $("[name='btnGridImage']").each(function (i) {
        $(this).prop("src", constructImageSourceString(i));
    });

    return numGreenImages;
}

function imageClicked(index) {

    if (bVictory) {
        // Start a new game.
        bVictory = false;
        prepareForNewGame();
        setGridImageNumbers();
        setImageSourcesAfterClick();
        return;
    }

    aGridImageNumbers[index] = rolNybble(aGridImageNumbers[index]);

    if (setImageSourcesAfterClick() == nGridArea) {
        bVictory = true;
        setMessage("Victory!&nbsp; Click on any square to start a new puzzle.");

        // Turn the page background lime green for three seconds.
        $(document.body).css("background-color", "lime"); // Lime == 0x00ff00
        setTimeout(function () {
            $(document.body).css("background-color", "white");
        }, 3000);   //  Three-second delay
    }
}

function resizeGrid() {
    var strWidth = $("#txtWidth").val();
    var strHeight = $("#txtHeight").val();
    var nWidth = nDefaultGridWidth;
    var nHeight = nDefaultGridHeight;

    if (strWidth != null && strWidth != "") {
        nWidth = parseInt(strWidth, 10);

        if (isNaN(nWidth)) {
            alert("Error: Width is not a number");
            return;
        }

        if (nWidth < nMinGridWidth) {
            alert("Warning: Minimum width is " + nMinGridWidth);
            nWidth = nMinGridWidth;
        } else if (nWidth > nMaxGridWidth) {
            alert("Warning: Maximum width is " + nMaxGridWidth);
            nWidth = nMaxGridWidth;
        }
    }

    if (strHeight != null && strHeight != "") {
        nHeight = parseInt(strHeight, 10);

        if (isNaN(nHeight)) {
            alert("Error: Height is not a number");
            return;
        }

        if (nHeight < nMinGridHeight) {
            alert("Warning: Minimum height is " + nMinGridHeight);
            nHeight = nMinGridHeight;
        } else if (nHeight > nMaxGridHeight) {
            alert("Warning: Maximum height is " + nMaxGridHeight);
            nHeight = nMaxGridHeight;
        }
    }

    window.location = "index.html?GridWidth=" + nWidth + "&GridHeight=" + nHeight;
}

// **** End of File ****
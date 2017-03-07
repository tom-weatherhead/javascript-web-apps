// Javascript/Life/Script.js - The Game of Life cellular automaton - May 23, 2011

// **** Global Variable Declarations ****

var canvasWidthInPixels = 512;
var canvasHeightInPixels = 512;
var cellSize = 8;
var numColumnsOfCells = parseInt(canvasWidthInPixels / cellSize, 10);
var numRowsOfCells = parseInt(canvasHeightInPixels / cellSize, 10);
var numCellsInUniverse = numRowsOfCells * numColumnsOfCells;
var currentBuffer = new Array(numCellsInUniverse);
var previousBuffer = new Array(numCellsInUniverse);
var secondPreviousBuffer = new Array(numCellsInUniverse);
var memoryBuffer = new Array(numCellsInUniverse);
var cellColourArray = [];
var maxCellAge = 0;
var globalRunID = 0;
var defaultIntergenerationalDelay = 300; // In milliseconds
var intergenerationalDelay = defaultIntergenerationalDelay;
var numNeighbours = 8;
var generationNumber = 0;
var patternsPath = "Patterns/";
var patternFilenames = [];
var autoStop = true;
var rules3_4Life = false;
var rememberAutoStop = true;
var rememberRules3_4Life = false;

// **** jQuery Function Declarations ****

$(document).ready(function () {
    $("#myCanvas").click(function (e) {
        var offset = $("#myCanvas").offset();
        var x = parseInt(e.pageX - offset.left, 10);
        var y = parseInt(e.pageY - offset.top, 10);

        onCanvasClick(x, y);
    });

    generatePageFooter(false);     // No canvas support in IE9.
    onPageLoad();
});

// **** Function Declarations (other than event handlers) ****

function setRules(rulesParam) {
    rules3_4Life = rulesParam;
    $("#rbStandard").prop("checked", !rules3_4Life);
    $("#rb3_4").prop("checked", rules3_4Life);
}

function setAutoStop(autoStopParam) {
    autoStop = autoStopParam;
    $("#cbAutoStop").prop("checked", autoStop);
}

function ddlPatterns_populate_callback(xmlDoc, status) {

    if (status != "success") {
        alert("ddlPatterns_populate_callback failed: " + status);
        return;
    }

    $("#ddlPatterns").empty();
    patternFilenames = [];

    if (xmlDoc == null) {
        alert("ddlPatterns_populate_callback failed: xmlDoc is null");
        return;
    }

    $(xmlDoc).find("pattern").each(function () {
        var patternName = $(this).find("name").text();
        var patternFilename = $(this).find("filename").text();

        patternFilenames.push(patternFilename);
        $("#ddlPatterns").append("<option>" + patternName + "</option>");
    });
}

function ddlPatterns_populate() {
    // jQuery AJAX .get() : Asynchronous.
    $.get(patternsPath + "index.xml", ddlPatterns_populate_callback, "xml");
}

function clearBuffer(buffer) {

    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = 0;
    }
}

function clearPreviousBuffers() {
    clearBuffer(previousBuffer);
    clearBuffer(secondPreviousBuffer);
}

function copyBuffer(sourceBuffer, destinationBuffer) {

    if (sourceBuffer.length != destinationBuffer.length) {
        alert("copyBuffer(): Error: Buffers differ in length");
        return false;
    }

    for (var i = 0; i < sourceBuffer.length; ++i) {
        destinationBuffer[i] = sourceBuffer[i];
    }

    return true;
}

function buffersAreEqual(buffer1, buffer2) {

    if (buffer1.length != buffer2.length) {
        return false;
    }

    for (var i = 0; i < buffer1.length; ++i) {

        if (buffer1[i] != buffer2[i]) {
            return false;
        }
    }

    return true;
}

function displayGenerationNumber() {
    $("#generationNumber").html("Generation number " + generationNumber);
}

function resetGenerationNumber() {
    generationNumber = 0;
    displayGenerationNumber();
    clearPreviousBuffers();
    setRules(false);
    setAutoStop(true);
}

function clearCurrentBuffer() {
    ++globalRunID;
    clearBuffer(currentBuffer);
}

function displayCurrentBuffer() {
    var cxt = $("#myCanvas")[0].getContext("2d");
    var cellIndex = 0;

    cxt.fillStyle = cellColourArray[0];
    cxt.fillRect(0, 0, canvasWidthInPixels, canvasHeightInPixels);

    for (var top = 0; top < canvasHeightInPixels; top += cellSize) {

        for (var left = 0; left < canvasWidthInPixels; left += cellSize) {
            var cellAge = currentBuffer[cellIndex];

            if (cellAge > 0) {
                cxt.fillStyle = cellColourArray[cellAge];
                cxt.fillRect(left, top, cellSize, cellSize);
            }

            ++cellIndex;
        }
    }
}

function randomizeCurrentBuffer() {
    ++globalRunID;

    for (var i = 0; i < currentBuffer.length; ++i) {
        currentBuffer[i] = (Math.random() * 3 < 1) ? 1 : 0;
    }
}

function computeAndDisplayNextGeneration(runID, singleStep) {

    if (runID != globalRunID) {
        return;
    }

    // Swap buffers
    var tempBufferReference = secondPreviousBuffer;

    secondPreviousBuffer = previousBuffer;
    previousBuffer = currentBuffer;
    currentBuffer = tempBufferReference;

    // Compute
    var rowDeltas = [-1, -1, -1, 0, 0, 1, 1, 1];
    var columnDeltas = [-1, 0, 1, -1, 1, -1, 0, 1];
    var currentBufferIndex = 0;

    for (var currentBufferRow = 0; currentBufferRow < numRowsOfCells; ++currentBufferRow) {

        for (var currentBufferCol = 0; currentBufferCol < numColumnsOfCells; ++currentBufferCol) {
            var numLiveNeighbours = 0;

            for (var neighbour = 0; neighbour < numNeighbours; ++neighbour) {
                var previousBufferRow = currentBufferRow + rowDeltas[neighbour];
                var previousBufferCol = currentBufferCol + columnDeltas[neighbour];

                if (previousBufferRow < 0) {
                    previousBufferRow = numRowsOfCells - 1;
                } else if (previousBufferRow >= numRowsOfCells) {
                    previousBufferRow = 0;
                }

                if (previousBufferCol < 0) {
                    previousBufferCol = numColumnsOfCells - 1;
                } else if (previousBufferCol >= numColumnsOfCells) {
                    previousBufferCol = 0;
                }

                var previousBufferIndex = previousBufferRow * numColumnsOfCells + previousBufferCol;

                if (previousBuffer[previousBufferIndex] > 0) {
                    ++numLiveNeighbours;
                }
            }

            var cellAge = previousBuffer[currentBufferIndex];   // This may look confusing, but it is correct.
            var cellShallBeAlive = false;

            if (rules3_4Life) {
                cellShallBeAlive = (numLiveNeighbours == 3 || numLiveNeighbours == 4);
            } else {
                cellShallBeAlive = ((numLiveNeighbours == 2 && cellAge > 0) || numLiveNeighbours == 3);
            }
            
            if (cellShallBeAlive) {

                if (cellAge < maxCellAge) {
                    ++cellAge;
                }
            } else {
                cellAge = 0;
            }

            currentBuffer[currentBufferIndex] = cellAge;
            ++currentBufferIndex;
        }
    }

    // Display
    displayCurrentBuffer();

    ++generationNumber;
    displayGenerationNumber();

    if (!singleStep && (!autoStop || !buffersAreEqual(currentBuffer, secondPreviousBuffer))) {    // Compare generation n with generation n - 2 because flippers have a period of 2.
        // Set timeout
        setTimeout("computeAndDisplayNextGeneration(" + runID + ", false)", intergenerationalDelay);
    }
}

// **** Event Handlers ****

function onCanvasClick(x, y) {
    var cellRow = parseInt(y / cellSize, 10);
    var cellCol = parseInt(x / cellSize, 10);
    var cellIndex = cellRow * numColumnsOfCells + cellCol;

    currentBuffer[cellIndex] = (currentBuffer[cellIndex] > 0) ? 0 : 1;
    displayCurrentBuffer();
}

function rbRules_onClick() {
    rules3_4Life = $("#rb3_4").prop("checked");
}

function ddlDelay_onChange() {
    intergenerationalDelay = parseInt($("#ddlDelay").val(), 10);
}

function cbAutoStop_onChange() {
    autoStop = $("#cbAutoStop").prop("checked");
}

function btnClear_onClick() {
    resetGenerationNumber();
    clearCurrentBuffer();
    displayCurrentBuffer();
}

function btnRandom_onClick() {
    resetGenerationNumber();
    randomizeCurrentBuffer();
    displayCurrentBuffer();
}

function btnRemember_onClick() {

    if (!copyBuffer(currentBuffer, memoryBuffer)) {
        return;
    }

    rememberAutoStop = autoStop;
    rememberRules3_4Life = rules3_4Life;
    alert("The current pattern has now been remembered.");
}

function btnRecall_onClick() {

    if (!copyBuffer(memoryBuffer, currentBuffer)) {
        return;
    }

    resetGenerationNumber();
    setAutoStop(rememberAutoStop);
    setRules(rememberRules3_4Life);
    displayCurrentBuffer();
}

function btnStep_onClick() {
    computeAndDisplayNextGeneration(globalRunID, true);
}

function btnGo_onClick() {
    computeAndDisplayNextGeneration(globalRunID, false);
}

function btnStop_onClick() {
    ++globalRunID;
}

function btnLoad_onClick_callback(xmlDoc, status) {

    if (status != "success") {
        alert("btnLoad_onClick_callback failed: " + status);
        return;
    } else if (xmlDoc == null) {
        alert("btnLoad_onClick_callback failed: xmlDoc is null");
        return;
    }

    var patternWidth = parseInt($(xmlDoc).find("width").text(), 10);
    var patternHeight = parseInt($(xmlDoc).find("height").text(), 10);
    var rows = $(xmlDoc).find("row");

    if (patternWidth > numColumnsOfCells) {
        patternWidth = numColumnsOfCells;
    }

    if (patternHeight > numRowsOfCells) {
        patternHeight = numRowsOfCells;
    }

    if (patternHeight > rows.length) {
        patternHeight = rows.length;
    }

    var startRow = parseInt((numRowsOfCells - patternHeight) / 2, 10);
    var startCol = parseInt((numColumnsOfCells - patternWidth) / 2, 10);
    var startIndex = startRow * numColumnsOfCells + startCol;
    var r = 0;

    resetGenerationNumber();

    var xmlElement_rules = $(xmlDoc).find("rules");

    if (xmlElement_rules != null && xmlElement_rules.text() == "3-4") {
        setRules(true);
    }

    var xmlElement_autoStop = $(xmlDoc).find("auto-stop");

    if (xmlElement_autoStop != null && xmlElement_autoStop.text() == "false") {
        setAutoStop(false);
    }

    clearCurrentBuffer();

    $(rows).each(function () {

        if (r >= patternHeight) {
            return;
        }

        var rowHexString = $(this).text();
        var currentIndex = startIndex;
        var nybble = 0;
        var mask = 0;
        var currentStringIndex = 0;
        var nextStringIndex = 0;

        for (var c = 0; c < patternWidth; ++c) {

            if (mask < 1) {
                currentStringIndex = nextStringIndex;
                ++nextStringIndex;

                if (currentStringIndex >= rowHexString.length) {
                    break;
                }

                nybble = parseInt(rowHexString.substr(currentStringIndex, 1), 16);
                mask = 8;
            }

            if ((nybble & mask) != 0) {
                currentBuffer[currentIndex] = 1;
            }

            ++currentIndex;
            mask /= 2;
        }

        startIndex += numColumnsOfCells;
        ++r;
    });

    displayCurrentBuffer();
}

function btnLoad_onClick() {
    var i = $("#ddlPatterns").prop("selectedIndex");

    if (i < 0 || i >= patternFilenames.length) {
        alert("btnLoad_onClick error: No pattern filename for selected index " + i);
        return;
    }

    // jQuery AJAX .get() : Asynchronous.
    $.get(patternsPath + patternFilenames[i], btnLoad_onClick_callback, "xml");
}

function onPageLoad() {
    // Dead cells are black; living cells are white.
    cellColourArray.push("rgb(0,0,0)");         // Black: luminosity = 0%
    cellColourArray.push("rgb(255,255,0)");     // Yellow: luminosity = 89%
    cellColourArray.push("rgb(0,255,255)");     // Cyan: luminosity = 70%
    cellColourArray.push("rgb(0,255,0)");       // Green: luminosity = 59%
    cellColourArray.push("rgb(255,0,255)");     // Magenta: luminosity = 41%
    cellColourArray.push("rgb(255,0,0)");       // Red: luminosity = 30%
    cellColourArray.push("rgb(255,255,255)");   // White: luminosity = 100%
    maxCellAge = cellColourArray.length - 1;

    clearPreviousBuffers();
    clearBuffer(memoryBuffer);

    ddlDelay_onChange();
    ddlPatterns_populate();
    btnRandom_onClick();
}

// **** End of File ****